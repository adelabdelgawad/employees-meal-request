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
    session: AsyncSession,
    requester_id: int,
    meal_id: int,
    notes: str,
    request_status_id: int,
    request_time: Optional[datetime] = None,
) -> Request:
    try:
        new_request = Request(
            requester_id=requester_id,
            meal_id=meal_id,
            notes=notes,
            status_id=request_status_id,
        )
        if request_time:
            new_request.request_time = request_time
        session.add(new_request)
        await session.commit()
        await session.refresh(new_request)

        await session.commit()
        return new_request
    except Exception as e:
        logger.error(f"Error creating request lines: {e}")
        raise e


async def add_attendance_and_shift_to_request_line(
    session: AsyncSession,
    hris_session: AsyncSession,
    request_lines: List[RequestLine],
    attendance_in: bool = True,
    attendance_out: bool = False,
) -> List[RequestLine]:
    """
    Update request lines with attendance details and shift hours.

    Parameters:
        session (AsyncSession): The database session to commit updates.
        hris_session (AsyncSession): The HRIS session used to read attendance and shift data.
        request_lines (List[RequestLine]): List of request line objects to update.
        attendance_in (bool): If True, update the attendance_in field.
        attendance_out (bool): If True, update the attendance_out field.

    Returns:
        List[RequestLine]: The updated list of request lines.
    """
    try:
        logger.info(
            f"Start Getting Shifts and Attendance for: {len(request_lines)} request lines"
        )

        employee_codes = [line.employee_code for line in request_lines]
        employee_ids = [line.employee_id for line in request_lines]

        # Read attendance and shift data from HRIS
        recent_attendances = await read_attendances_from_hris(
            hris_session, employee_codes
        )
        today_shifts = await read_shifts_from_hris(hris_session, employee_ids)

        for line in request_lines:
            # Get the entire attendance record for the employee
            attendance_record = next(
                (
                    att
                    for att in recent_attendances
                    if att.employee_code == str(line.employee_code)
                ),
                None,
            )

            # Get the shift hours for the employee
            shift_hours = next(
                (
                    shift.duration_hours
                    for shift in today_shifts
                    if shift.employee_id == line.employee_id
                ),
                None,
            )

            # Update attendance fields based on the provided flags
            if attendance_record:

                if attendance_in:
                    line.attendance_in = attendance_record.date_in
                if attendance_out:
                    line.attendance_out = attendance_record.date_out

            # Update shift hours if available
            if shift_hours is not None:
                line.shift_hours = shift_hours

            # Mark that data has been collected

        logger.info(
            f"Data Retrieved Successfully for: {len(request_lines)} request lines"
        )

    except Exception as e:
        logger.error(f"Error updating request lines: {e}")
    finally:
        # Add all updated lines to the session and commit changes
        for line in request_lines:
            session.add(line)
        await session.commit()

    return request_lines


def parse_datetime(date_str: str, fmt: str) -> datetime:
    """
    Parse a datetime string into a datetime object using the given format.
    Raises ValueError if parsing fails.
    """
    try:
        return datetime.strptime(date_str, fmt)
    except ValueError as ve:
        raise ValueError(
            f"Invalid datetime format for '{date_str}'. Expected format: {fmt}"
        ) from ve


async def read_requests(
    session: AsyncSession,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    requester_id: Optional[int] = None,
    requester_name: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    download: Optional[bool] = False,
) -> Dict:
    """
    Retrieves paginated request data with optional filters.

    :param session: The async database session.
    :param start_time: Start date for filtering (format: 'MM/DD/YYYY, HH:MM:SS AM/PM').
    :param end_time: End date for filtering (format: 'MM/DD/YYYY, HH:MM:SS AM/PM').
    :param requester_id: Filter by requester ID.
    :param requester_name: Filter by requester full name.
    :param page: The current page number (1-based).
    :param page_size: Number of rows per page.
    :param download: If True, disables pagination.
    :return: A dictionary containing paginated data and metadata.
    """
    date_format = "%m/%d/%Y, %I:%M:%S %p"
    start_dt = end_dt = None

    # Parse start_time and end_time if provided
    if start_time:
        # Set time to beginning of the day
        start_dt = parse_datetime(start_time, date_format).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
    if end_time:
        # Set time to end of the day
        end_dt = parse_datetime(end_time, date_format).replace(
            hour=23, minute=59, second=59, microsecond=0
        )

    # Calculate pagination offset
    offset = (page - 1) * page_size

    # Current time used to filter out future requests
    current_time = datetime.now()

    # Build common filter conditions
    filters = []
    if start_dt and end_dt:
        filters.append(Request.request_time.between(start_dt, end_dt))
    if requester_id is not None:
        filters.append(Request.requester_id == requester_id)
    if requester_name:
        # Assuming Account is imported and available
        filters.append(Account.full_name.ilike(f"%{requester_name}%"))
    filters.append(Request.request_time <= current_time)
    filters.append(Request.is_deleted == False)

    # Count total rows using the common filters
    count_stmt = select(func.count()).select_from(Request)
    for condition in filters:
        count_stmt = count_stmt.where(condition)
    total_rows_result = await session.execute(count_stmt)
    total_rows = total_rows_result.scalar() or 0
    total_pages = (total_rows + page_size - 1) // page_size

    # Build the data query with necessary joins and aggregations
    data_stmt = (
        select(
            Request.id,
            RequestStatus.name.label("status_name"),
            RequestStatus.id.label("status_id"),
            Account.id.label("requester_id"),
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
            Account.id,
            Account.full_name,
            Account.title,
            Meal.name,
            Request.request_time,
            Request.closed_time,
            Request.notes,
        )
        .order_by(desc(Request.request_time))
    )

    # Apply the same filters to the data query
    for condition in filters:
        data_stmt = data_stmt.where(condition)

    # Apply pagination if data is not being downloaded
    if not download:
        data_stmt = data_stmt.offset(offset).limit(page_size)

    # Execute the data query
    result = await session.execute(data_stmt)
    rows = result.fetchall()

    # Transform each row into a response dictionary using Pydantic model validation
    items: List[Dict] = [
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


async def prepare_scheduled_requests(
    session: AsyncSession,
    hris_session: AsyncSession,
):
    scheduled_requests = await session.execute(
        select(Request).where(Request.status_id == 2)
    )
    requests = scheduled_requests.scalars().all()
    if requests:
        for request in requests:
            if request.request_time <= datetime.now():
                request.status_id = 1
                session.add(request)
                request_lines = await session.execute(
                    select(RequestLine).where(
                        RequestLine.request_id == request.id
                    )
                )
                lines = request_lines.scalars().all()
                for line in lines:
                    line.is_accepted = True
                    session.add(line)
                await add_attendance_and_shift_to_request_line(
                    session, hris_session, lines
                )
        await session.commit()


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


async def confirm_request_creation(
    session: AsyncSession, request_id: int, request_time: datetime
) -> Request:
    """Update request time for a specific request"""

    try:
        # Get request
        request = await session.get(Request, request_id)

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
