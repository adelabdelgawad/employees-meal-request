from sqlalchemy import select, func, and_, or_, text, bindparam
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Tuple
from pydantic import BaseModel, ValidationError

# Import models from both databases
from db.models import RequestLine, Employee, Department, Request, Account, Meal
from hris_db.models import HRISEmployeeAttendanceWithDetails as AttendanceTransaction
from src.http_schema import ReportDetailsResponse
from icecream import ic
import logging

logger = logging.getLogger(__name__)


class AttendanceRecord(BaseModel):
    """
    Represents an attendance record from the HRIS DB.
    """

    code: int
    in_time: datetime | None = None
    out_time: datetime | None = None


async def merge_requests_with_attendance(
    request_lines: List[ReportDetailsResponse],
    attendance_map: Dict[Tuple[str, datetime], AttendanceRecord],
) -> List[ReportDetailsResponse]:
    """
    For each request line, find the matching attendance on the SAME day
    from the attendance_map. If found, compute working_hours; else None.

    Args:
        request_lines (List[RequestLineRecord]): List of requests from main DB.
        attendance_map (Dict[(str, date), AttendanceRecord]):
            Dictionary of attendance keyed by (code, date).

    Returns:
        List[RequestLineAttendanceResponse]: Merged results.
    """
    merged_results = []

    for req in request_lines:
        # The day portion of the request_time
        req_date = req.request_time.date()
        key = (req.employee_code, req_date)

        attendance_rec = attendance_map.get(key)

        if attendance_rec:
            # Found an attendance record for same (code, date)
            in_time = attendance_rec.in_time
            out_time = attendance_rec.out_time
            if in_time and out_time:
                total_sec = (out_time - in_time).total_seconds()
                working_hours = round(total_sec / 3600, 2)
            else:
                working_hours = None

            merged = ReportDetailsResponse(
                id=req.id,
                employee_code=req.employee_code,
                employee_name=req.employee_name,
                employee_title=req.employee_title,
                department=req.department,
                requester_name=req.requester_name,
                requester_title=req.requester_title,
                request_time=req.request_time,
                meal=req.meal,
                attendance_in=in_time,
                attendance_out=out_time,
                working_hours=working_hours,
                shift_hours=req.shift_hours,
                notes=req.notes,
            )
        else:
            # No same-day attendance -> set attendance fields to None
            merged = ReportDetailsResponse(
                id=req.id,
                employee_code=req.employee_code,
                employee_name=req.employee_name,
                employee_title=req.employee_title,
                department=req.department,
                requester_name=req.requester_name,
                requester_title=req.requester_title,
                request_time=req.request_time,
                meal=req.meal,
                attendance_in=None,
                attendance_out=None,
                working_hours=None,
                shift_hours=req.shift_hours,
                notes=req.notes,
            )

        merged_results.append(merged)

    return merged_results


async def fetch_same_day_attendance(
    hris_session: AsyncSession,
    employee_codes: List[int],
    min_date: datetime,
    max_date: datetime,
) -> Dict[Tuple[int, datetime], AttendanceRecord]:
    """
    Fetch attendance records from the HRIS DB for a set of integer employee codes
    and a date range [min_date, max_date]. Then store them keyed by
    (employee_code, date(in_time)).

    Args:
        hris_session (AsyncSession): The async session for HRIS DB.
        employee_codes (List[int]): Unique integer IDs (codes) for employees of interest.
        min_date (datetime): Lower bound (inclusive).
        max_date (datetime): Upper bound (inclusive).

    Returns:
        Dict[(int, datetime), AttendanceRecord]:
            Mapping of (employee_code, date(in_time)) -> AttendanceRecord
    """
    if not employee_codes:
        return {}

    start_dt_str = min_date.strftime("%Y-%m-%d %H:%M:%S")
    end_dt_str = max_date.strftime("%Y-%m-%d %H:%M:%S")

    # Example raw text-based query (adapt schema & table names as needed).
    # Ensure EmployeeCode is stored as int in your table.
    query = text(
        """
        SELECT
            EmployeeCode AS code,  -- int column
            DateIn AS in_time,
            DateOut AS out_time
        FROM [HMIS-SMH].dbo.TmsEmployeeAttendenceWithDetails
        WHERE EmployeeCode IN :codes
          AND DateIn BETWEEN :start_date AND :end_date
    """
    ).bindparams(bindparam("codes", expanding=True))

    try:
        result = await hris_session.execute(
            query,
            {
                "codes": list(employee_codes),
                "start_date": start_dt_str,
                "end_date": end_dt_str,
            },
        )
    except Exception as exc:
        logger.error(f"HRIS attendance query failed: {exc}")
        return {}

    rows = result.fetchall()
    logger.debug(f"Fetched {len(rows)} rows of attendance data.")

    attendance_map: Dict[Tuple[int, datetime], AttendanceRecord] = {}

    for row in rows:
        raw_data = dict(row._mapping)
        try:
            att = AttendanceRecord(**raw_data)
        except ValidationError as e:
            logger.warning(f"Skipping invalid attendance row: {raw_data} -> {e}")
            continue

        # Key by (employee_code, date(in_time))
        key = (att.code, att.in_time.date())

        # If multiple attendance records exist for the same day/employee,
        # decide whether to overwrite or keep the first one, etc.
        attendance_map[key] = att

    return attendance_map


async def read_request_lines_with_attendance(
    session: AsyncSession,
    hris_session: AsyncSession,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    employee_name: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    download: Optional[bool] = False,
) -> dict:
    """
    Retrieves paginated request data with optional filters.

    :param session: The async database session for MariaDB.
    :param start_time: Start date for filtering data (inclusive, format: 'YYYY-MM-DD').
    :param end_time: End date for filtering data (inclusive, format: 'YYYY-MM-DD').
    :param employee_name: Filter by employee name (case-insensitive, partial match).
    :param page: The current page number (1-based).
    :param page_size: Number of rows per page.
    :return: A dictionary containing paginated data and metadata.
    """

    # Parse start_time and end_time into datetime objects
    if start_time and end_time:
        date_format = "%m/%d/%Y, %I:%M:%S %p"
        try:
            # Parse input dates
            start_dt = datetime.strptime(start_time, date_format)
            end_dt = datetime.strptime(end_time, date_format)

            # Adjust start_time to today's start and end_time to today's end
            start_dt = start_dt.replace(hour=0, minute=0, second=0, microsecond=0)
            end_dt = end_dt.replace(hour=23, minute=59, second=59, microsecond=0)
        except ValueError:
            raise ValueError(
                "Invalid date format. Expected 'MM/DD/YYYY, HH:MM:SS AM/PM'."
            )

    # Calculate offset for pagination
    offset = (page - 1) * page_size

    # Base query for filtering
    statement = (
        select(func.count())
        .select_from(RequestLine)
        .join(Employee, RequestLine.employee_id == Employee.id)
        .join(Department, Employee.department_id == Department.id)
        .join(Request, RequestLine.request_id == Request.id)
        .join(Account, Request.requester_id == Account.id)
        .join(Meal, RequestLine.meal_id == Meal.id)
    )

    statement = statement.where(RequestLine.is_accepted == True)

    # Apply filters
    if start_time and end_time:
        statement = statement.where(Request.request_time.between(start_dt, end_dt))
    if employee_name:
        statement = statement.where(Employee.name.ilike(f"%{employee_name}%"))

    # Execute the total count query
    total_rows_result = await session.execute(statement)
    total_rows = total_rows_result.scalar() or 0

    # Calculate total pages
    total_pages = (total_rows + page_size - 1) // page_size

    # Query to fetch paginated data
    statement = (
        select(
            RequestLine.id,
            Employee.code.label("employee_code"),
            Employee.name.label("employee_name"),
            Employee.title.label("employee_title"),
            Department.name.label("department"),
            Account.username.label("requester_name"),
            Account.title.label("requester_title"),
            Request.request_time,
            Meal.name.label("meal"),
            RequestLine.attendance.label("attendance_in"),
            RequestLine.shift_hours,
            RequestLine.notes,
        )
        .join(Employee, RequestLine.employee_id == Employee.id)
        .join(Department, Employee.department_id == Department.id)
        .join(Request, RequestLine.request_id == Request.id)
        .join(Account, Request.requester_id == Account.id)
        .join(Meal, RequestLine.meal_id == Meal.id)
    )

    statement = statement.where(RequestLine.is_accepted == True)

    # Apply filters
    if start_time and end_time:
        statement = statement.where(Request.request_time.between(start_dt, end_dt))
    if employee_name:
        statement = statement.where(Employee.name.ilike(f"%{employee_name}%"))

    # Apply pagination
    if not download:
        # Apply pagination (offset and limit)
        statement = statement.offset(offset).limit(page_size)

    # Execute query and fetch data
    result = await session.execute(statement)
    rows = result.fetchall()

    # Transform rows into the expected response format
    request_lines = [ReportDetailsResponse.model_validate(row) for row in rows]

    request_dates = [r.request_time.date() for r in request_lines]
    min_date = min(request_dates)
    max_date = max(request_dates)

    # We can fetch attendance only for the relevant employees
    employee_codes = list({r.employee_code for r in request_lines})

    # 4) Fetch attendance records from HRIS for these codes & date range
    #    We pass the min_date 00:00:00 and max_date 23:59:59 as bounds
    min_dt = datetime.combine(min_date, datetime.min.time())
    max_dt = datetime.combine(max_date, datetime.max.time())

    attendance_map = await fetch_same_day_attendance(
        hris_session=hris_session,
        employee_codes=employee_codes,
        min_date=min_dt,
        max_date=max_dt,
    )
    ic(attendance_map)
    ic(request_lines)

    # 5) Merge
    merged_results = await merge_requests_with_attendance(request_lines, attendance_map)

    return {
        "data": merged_results,
        "current_page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "total_rows": total_rows,
    }
