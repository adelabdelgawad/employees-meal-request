from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Tuple
from pydantic import BaseModel, ConfigDict, field_serializer

# Import models from both databases
from db.models import RequestLine, Employee, Department, Request, Account, Meal
from hris_db.models import HRISEmployeeAttendanceWithDetails as AttendanceTransaction

from icecream import ic


# ✅ Data Model for the Response
class ReportDetailsResponse(BaseModel):
    id: int
    employee_code: int | None = None
    employee_name: str | None = None
    employee_title: str | None = None
    department: str | None = None
    requester_name: str | None = None
    requester_title: str | None = None
    request_time: datetime | None = None
    meal: str | None = None
    attendance_in: datetime | None = None
    attendance_out: datetime | None = None
    shift_hours: int | None = None
    notes: str | None = None

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("attendance_in", "attendance_out", "request_time")
    def format_datetime(self, value: datetime) -> str | None:
        return value.isoformat(sep=" ", timespec="seconds") if value else None


# ✅ Utility: Parse Date Filters
def parse_date_range(start_time: str, end_time: str) -> Tuple[datetime, datetime]:
    date_format = "%m/%d/%Y, %I:%M:%S %p"
    start_dt = datetime.strptime(start_time, date_format).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    end_dt = datetime.strptime(end_time, date_format).replace(
        hour=23, minute=59, second=59, microsecond=0
    )
    return start_dt, end_dt


async def fetch_attendance_out(
    hris_session: AsyncSession,
    employee_codes: List[str],
    date_range: Tuple[datetime, datetime],
) -> Dict[str, List[datetime]]:
    if not employee_codes:
        return {}

    start_dt, end_dt = date_range

    query = select(
        AttendanceTransaction.employee_code, AttendanceTransaction.date_out
    ).where(
        AttendanceTransaction.employee_code.in_(employee_codes),
        AttendanceTransaction.date_out.between(start_dt, end_dt),
    )

    result = await hris_session.execute(query)

    # Group attendance data by employee code
    attendance_map = {}
    for record in result.fetchall():
        attendance_map.setdefault(str(record.employee_code), []).append(record.date_out)

    return attendance_map


# ✅ Query Request Data (Main DB)
async def fetch_request_data(
    app_session: AsyncSession,
    start_dt: Optional[datetime],
    end_dt: Optional[datetime],
    employee_name: Optional[str],
    offset: int,
    page_size: int,
    download: bool,
):
    query = (
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
        .where(RequestLine.is_accepted == True)
    )

    if start_dt and end_dt:
        query = query.where(Request.request_time.between(start_dt, end_dt))
    if employee_name:
        query = query.where(Employee.name.ilike(f"%{employee_name}%"))

    if not download:
        query = query.offset(offset).limit(page_size)

    result = await app_session.execute(query)
    return result.fetchall()


# ✅ Count Total Rows for Pagination
async def count_total_rows(
    app_session: AsyncSession,
    start_dt: Optional[datetime],
    end_dt: Optional[datetime],
    employee_name: Optional[str],
) -> int:
    query = (
        select(func.count())
        .select_from(RequestLine)
        .join(Employee, RequestLine.employee_id == Employee.id)
        .join(Request, RequestLine.request_id == Request.id)
        .where(RequestLine.is_accepted == True)
    )

    if start_dt and end_dt:
        query = query.where(Request.request_time.between(start_dt, end_dt))
    if employee_name:
        query = query.where(Employee.name.ilike(f"%{employee_name}%"))

    result = await app_session.execute(query)
    return result.scalar() or 0


# ✅ Merge request data with attendance out
def find_closest_attendance_out(
    attendance_dates: List[datetime], reference_date: datetime
) -> Optional[datetime]:
    # Match within a 12-hour buffer
    time_buffer = timedelta(hours=12)
    valid_dates = [
        date for date in attendance_dates if abs(date - reference_date) <= time_buffer
    ]

    if not valid_dates:
        return None

    # Return the closest date
    return min(valid_dates, key=lambda d: abs(d - reference_date))


# ✅ Main Function
async def read_request_lines_with_attendance(
    app_session: AsyncSession,
    hris_session: AsyncSession,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    employee_name: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    download: Optional[bool] = False,
) -> dict:
    start_dt, end_dt = (
        parse_date_range(start_time, end_time)
        if start_time and end_time
        else (None, None)
    )

    offset = (page - 1) * page_size

    # Fetch request data
    request_data = await fetch_request_data(
        app_session, start_dt, end_dt, employee_name, offset, page_size, download
    )

    # Extract unique employee codes
    employee_codes = list({str(row.employee_code) for row in request_data})

    # Fetch attendance out data within the date range
    attendance_out_data = await fetch_attendance_out(
        hris_session, employee_codes, (start_dt, end_dt)
    )

    # Count total rows for pagination
    total_rows = await count_total_rows(app_session, start_dt, end_dt, employee_name)
    total_pages = (total_rows + page_size - 1) // page_size

    # Merge request data with attendance out
    response_items = [
        ReportDetailsResponse(
            id=row.id,
            employee_code=row.employee_code,
            employee_name=row.employee_name,
            employee_title=row.employee_title,
            department=row.department,
            requester_name=row.requester_name,
            requester_title=row.requester_title,
            request_time=row.request_time,
            meal=row.meal,
            attendance_in=row.attendance_in,
            attendance_out=find_closest_attendance_out(
                attendance_out_data.get(str(row.employee_code), []), row.request_time
            ),
            shift_hours=row.shift_hours,
            notes=row.notes,
        ).model_dump()
        for row in request_data
    ]

    return {
        "data": response_items,
        "current_page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "total_rows": total_rows,
    }
