import logging
from typing import List, Optional, Dict
from datetime import datetime
from sqlmodel import select, func, case, desc
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import (
    Request,
    RequestLine,
    RequestStatus,
    Account,
    Meal,
)
from routers.cruds.attendance_and_shift import (
    read_attendances_from_hris,
    read_shifts_from_hris,
)
from services.http_schema import RequestPageRecordResponse
import pytz
from fastapi import HTTPException, status
from icecream import ic

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")
logger = logging.getLogger(__name__)

# continue_processing_meal_request


async def create_request(
    maria_session: AsyncSession,
    requester_id: int,
    meal_id: int,
    notes: str,
    request_time: Optional[datetime] = None,
) -> Request:
    try:
        new_request = Request(
            requester_id=requester_id,
            meal_id=meal_id,
            notes=notes,
        )
        if request_time:
            new_request.request_time = request_time
        maria_session.add(new_request)
        await maria_session.commit()
        await maria_session.refresh(new_request)

        await maria_session.commit()
        return new_request
    except Exception as e:
        logger.error(f"Error creating request lines: {e}")
        raise e


async def create_meal_request_lines(
    maria_session: AsyncSession,
    request: Request,
    request_lines: List[RequestLine],
):
    try:
        lines = [
            RequestLine(
                request_id=request.id,
                employee_id=line["employee_id"],
                employee_code=line["employee_code"],
                department_id=line["department_id"],
                notes=line["notes"],
                meal_id=request.meal_id,
                is_accepted=True,
            )
            for line in request_lines
        ]
        maria_session.add_all(lines)
        await maria_session.commit()
        return lines
    except Exception as e:
        logger.error(f"Error creating request lines: {e}")
        raise e


async def update_request_lines(
    maria_session: AsyncSession,
    hris_session: AsyncSession,
    request_lines: List[RequestLine],
):
    """
    Update request lines with attendance details.
    """
    try:
        employee_codes = [line.employee_code for line in request_lines]
        employee_ids = [line.employee_id for line in request_lines]

        # Read attendances and shifts
        recent_attendances = await read_attendances_from_hris(
            hris_session, employee_codes
        )
        today_shifts = await read_shifts_from_hris(hris_session, employee_ids)

        logger.info(f"Today Shifts: {len(today_shifts)}")
        logger.info(f"Recent Attendances: {len(recent_attendances)}")

        for line in request_lines:
            # Find attendance
            attendance = next(
                (
                    attendance.date_in
                    for attendance in recent_attendances
                    if attendance.employee_code == str(line.employee_code)
                ),
                None,
            )

            # Find shift hours
            shift_hours = next(
                (
                    shift.duration_hours
                    for shift in today_shifts
                    if shift.employee_id == line.employee_id
                ),
                None,
            )
            logger.info(
                f"Line {line.id} -> Attendance: {attendance}, Shift Hours: {shift_hours}"
            )

            # Update line
            if attendance:
                line.attendance = attendance
            if shift_hours:
                line.shift_hours = shift_hours
            line.data_collected == True

    except Exception as e:
        logger.error(f"Error updating request lines: {e}")
    finally:
        line.data_collected = True
        maria_session.add(line)
        await maria_session.commit()


async def read_requests(
    session: AsyncSession,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    requester_id: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    download: Optional[bool] = False,
) -> dict:
    """
    Retrieves paginated request data with optional filters.

    :param session: The async database session for MariaDB.
    :param start_time: Start date for filtering data (inclusive, format: 'MM/DD/YYYY, HH:MM:SS AM/PM').
    :param end_time: End date for filtering data (inclusive, format: 'MM/DD/YYYY, HH:MM:SS AM/PM').
    :param requester_id: Filter by requester ID.
    :param page: The current page number (1-based).
    :param page_size: Number of rows per page.
    :param download: Flag to indicate if the data is for download (disables pagination if True).
    :return: A dictionary containing paginated data and metadata.
    """

    # Parse start_time and end_time into datetime objects
    date_format = "%m/%d/%Y, %I:%M:%S %p"
    start_dt = end_dt = None
    if start_time:
        try:
            start_dt = datetime.strptime(start_time, date_format).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
        except ValueError:
            raise ValueError(
                "Invalid start_time format. Expected 'MM/DD/YYYY, HH:MM:SS AM/PM'."
            )
    if end_time:
        try:
            end_dt = datetime.strptime(end_time, date_format).replace(
                hour=23, minute=59, second=59, microsecond=0
            )
        except ValueError:
            raise ValueError(
                "Invalid end_time format. Expected 'MM/DD/YYYY, HH:MM:SS AM/PM'."
            )

    # Calculate offset for pagination
    offset = (page - 1) * page_size

    # Define the current time to filter out future requests
    current_time = datetime.now()

    # Base statement for counting total rows
    count_stmt = select(func.count()).select_from(Request)

    # Apply filters to the count statement
    if start_dt and end_dt:
        count_stmt = count_stmt.where(
            Request.request_time.between(start_dt, end_dt)
        )
    if requester_id:
        count_stmt = count_stmt.where(
            Request.requester_id == int(requester_id)
        )
    # Exclude future request_time records
    count_stmt = count_stmt.where(Request.request_time <= current_time)

    # Execute the total count query
    total_rows_result = await session.execute(count_stmt)
    total_rows = total_rows_result.scalar() or 0

    # Calculate total pages
    total_pages = (total_rows + page_size - 1) // page_size

    # Query to fetch paginated data
    data_stmt = (
        select(
            Request.id,
            RequestStatus.name.label("status_name"),
            RequestStatus.id.label("status_id"),
            Account.full_name.label("requester"),
            Account.title.label("requester_title"),
            Meal.name.label("meal"),
            Request.request_time,
            Request.closed_time,
            Request.notes,
            func.count(RequestLine.id).label("total_lines"),
            func.sum(
                case((RequestLine.is_accepted == True, 1), else_=0)
            ).label("accepted_lines"),
        )
        .join(Account, Request.requester_id == Account.id)
        .join(RequestStatus, Request.status_id == RequestStatus.id)
        .outerjoin(RequestLine, Request.id == RequestLine.request_id)
        .outerjoin(Meal, RequestLine.meal_id == Meal.id)
        .group_by(
            Request.id,
            RequestStatus.name,
            RequestStatus.id,
            Account.full_name,
            Account.title,
            Meal.name,
            Request.request_time,
            Request.closed_time,
            Request.notes,
        )
        .order_by(
            desc(Request.request_time)
        )  # Order by request_time descending
    )

    # Apply filters to the data statement
    if start_dt and end_dt:
        data_stmt = data_stmt.where(
            Request.request_time.between(start_dt, end_dt)
        )
    if requester_id:
        data_stmt = data_stmt.where(Request.requester_id == int(requester_id))
    # Exclude future request_time records
    data_stmt = data_stmt.where(Request.request_time <= current_time)

    # Apply pagination if not downloading
    if not download:
        data_stmt = data_stmt.offset(offset).limit(page_size)

    # Execute query and fetch data
    result = await session.execute(data_stmt)
    rows = result.fetchall()

    # Transform rows into the expected response format
    items = [
        RequestPageRecordResponse.model_validate(row).model_dump()
        for row in rows
    ]

    return {
        "data": items,
        "current_page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "total_rows": total_rows,
    }


async def update_request_status(
    session: AsyncSession, auditor_id: int, request_id: int, status_id: int
):
    """
    Update the status of a request and related lines.
    """
    try:
        statement = select(Request).where(Request.id == request_id)
        result = await session.execute(statement)
        request = result.scalar_one_or_none()

        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Request with ID {request_id} not found.",
            )

        request.status_id = status_id
        request.closed_time = datetime.now(cairo_tz)
        request.auditor_id = auditor_id
        session.add(request)
        await session.commit()
        await session.refresh(request)

        if status_id == 4:  # Additional logic for status 4
            await update_request_lines_status(session, request_id)

        return await read_request_by_id(session, request_id)
    except Exception as e:
        logger.error(f"Error updating request status: {e}")
        raise e


async def update_request_request_time(
    session: AsyncSession, request_id: int, request_time: datetime
) -> Request:
    """Update request time for a specific request"""

    try:
        # Get request
        result = await session.execute(
            select(Request).where(Request.id == request_id)
        )
        request = result.scalar_one_or_none()

        if not request:
            logger.warning(f"Request {request_id} not found")
            raise HTTPException(status_code=404, detail="Request not found")

        # Update and commit
        request.request_time = request_time
        session.add(request)
        await session.commit()
        await session.refresh(request)

        logger.info(f"Request {request_id} time updated successfully")
        return request

    except Exception as e:
        logger.error(f"Failed to update request {request_id}: {str(e)}")
        await session.rollback()
        raise HTTPException(status_code=500, detail="Update failed") from e


async def update_request_lines_status(session: AsyncSession, request_id: int):
    """
    Mark all lines of a request as not accepted.
    """
    try:
        statement = select(RequestLine).where(
            RequestLine.request_id == request_id
        )
        result = await session.execute(statement)
        lines = result.scalars().all()

        for line in lines:
            line.is_accepted = False
            session.add(line)

        await session.commit()
    except Exception as e:
        logger.error(f"Error updating request lines status: {e}")
        await session.rollback()


async def read_request_by_id(
    session: AsyncSession,
    request_id: int,
) -> RequestPageRecordResponse:
    """
    Retrieve a request by its ID.

    :param session: The async database session for MariaDB.
    :param request_id: The ID of the request to retrieve.
    :return: The request data if found, else None.
    """
    stmt = (
        select(
            Request.id,
            RequestStatus.name.label("status_name"),
            RequestStatus.id.label("status_id"),
            Account.full_name.label("requester"),
            Account.title.label("requester_title"),
            Meal.name.label("meal"),
            Request.created_time.label("request_time"),
            Request.closed_time,
            Request.notes,
            func.count(RequestLine.id).label("total_lines"),
            func.sum(
                case((RequestLine.is_accepted == True, 1), else_=0)
            ).label("accepted_lines"),
        )
        .join(Account, Request.requester_id == Account.id)
        .join(RequestStatus, Request.status_id == RequestStatus.id)
        .outerjoin(RequestLine, Request.id == RequestLine.request_id)
        .outerjoin(Meal, RequestLine.meal_id == Meal.id)
        .where(Request.id == request_id)
        .group_by(
            Request.id,
            RequestStatus.name,
            RequestStatus.id,
            Account.full_name,
            Account.title,
            Meal.name,
            Request.created_time,
            Request.closed_time,
            Request.notes,
        )
    )

    result = await session.execute(stmt)
    row = result.fetchone()

    if row:
        return RequestPageRecordResponse.model_validate(row).model_dump()
    return None
