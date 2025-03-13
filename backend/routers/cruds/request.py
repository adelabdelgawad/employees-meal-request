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
    read_shifts_from_hris,
    update_request_lines_with_attendance,
)
from services.http_schema import RequestPageRecordResponse, RequestsResponse
import pytz
from fastapi import HTTPException, status

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")
logger = logging.getLogger(__name__)

# continue_processing_meal_request


async def add_attendance_and_shift_to_request_line(
    session: AsyncSession,
    hris_session: AsyncSession,
    request_lines: List[RequestLine],
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

        await update_request_lines_with_attendance(
            session=session,
            hris_session=hris_session,
            request_line_ids=[r.id for r in request_lines],
        )
        employee_ids = [line.employee_id for line in request_lines]

        today_shifts = await read_shifts_from_hris(hris_session, employee_ids)

        for line in request_lines:
            # Get the shift hours for the employee
            shift_hours = next(
                (
                    shift.duration_hours
                    for shift in today_shifts
                    if shift.employee_id == line.employee_id
                ),
                None,
            )

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
    start_time: str | None = None,
    end_time: str | None = None,
    requester_id: int | None = None,
    requester_name: str | None = None,
    page: int | None = 1,
    page_size: int | None = 15,
    download: bool | None = False,
    accept_future: bool | None = False,
) -> RequestsResponse:
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
    start_dt = start_time
    end_dt = end_time

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
        filters.append(Account.fullname.ilike(f"%{requester_name}%"))
    if not accept_future:
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
            Account.fullname.label("requester"),
            Account.title.label("requester_title"),
            Meal.name.label("meal"),
            Request.request_time,
            Request.closed_time,
            Request.notes,
            func.sum(
                case((RequestLine.is_deleted == False, 1), else_=0)
            ).label("total_lines"),
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
            Account.fullname,
            Account.title,
            Meal.name,
            Request.request_time,
            Request.closed_time,
            Request.notes,
        )
        .having(
            func.count(RequestLine.id) > 0
        )  # Use HAVING for aggregate conditions
        .having(
            func.sum(case((RequestLine.is_deleted == False, 1), else_=0)) > 0
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

    return RequestsResponse(
        data=items,
        current_page=page,
        page_size=page_size,
        total_pages=total_pages,
        total_rows=total_rows,
    )


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

        return request
    except Exception as e:
        logger.error(f"Error updating request status: {e}")
        raise e


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
            Request.requester_id.label("requester_id"),  # Added field
            RequestStatus.name.label("status_name"),
            RequestStatus.id.label("status_id"),
            Account.fullname.label("requester"),
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
            Request.requester_id,  # Added to GROUP BY clause
            RequestStatus.name,
            RequestStatus.id,
            Account.fullname,
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
