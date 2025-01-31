import logging
from typing import List, Optional, Dict
from datetime import datetime
from sqlmodel import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import (
    Request,
    RequestLine,
    RequestStatus,
    Account,
    Meal,
)
from routers.utils.attendance_and_shift import (
    read_attendances_from_hris,
    read_shifts_from_hris,
)
from src.http_schema import RequestBody, RequestPageRecordResponse
from itertools import groupby
from operator import attrgetter
import pytz
from fastapi import HTTPException, status
from icecream import ic

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")
logger = logging.getLogger(__name__)


def group_requests_by_meal_id(request_lines: List[RequestBody]) -> List:
    """
    Group request lines by meal_id.
    """
    request_lines.sort(key=attrgetter("meal_id"))
    return groupby(request_lines, key=attrgetter("meal_id"))


async def create_requests_with_background_task(
    requester_id: int,
    request_lines: List[RequestBody],
    request_time: datetime,
    background_tasks,
    maria_session: AsyncSession,
    hris_session: AsyncSession,
) -> Dict:
    """
    Create grouped requests and schedule background updates.
    """
    # Seperate requests by meal_id (Dinner, Lunch, etch..)
    grouped_lines = group_requests_by_meal_id(request_lines)
    created_request_ids = []
    created_lines = []

    for meal_id, lines in grouped_lines:
        lines_list = list(lines)
        created_lines_batch = await create_meal_request_lines(
            requester_id, meal_id, request_time, lines_list, maria_session
        )
        created_request_ids.append(meal_id)
        created_lines.extend(created_lines_batch)

    background_tasks.add_task(
        update_request_lines, created_lines, maria_session, hris_session
    )

    return {
        "total_requests": len(created_request_ids),
        "created_request_ids": created_request_ids,
        "created_lines_ids": [line.id for line in created_lines],
    }


async def create_meal_request_lines(
    requester_id: int,
    meal_id: int,
    request_time: datetime,
    request_lines: List[RequestBody],
    maria_session: AsyncSession,
) -> List[RequestLine]:
    """
    Create a new request and its lines.
    """

    try:
        new_request = Request(
            requester_id=requester_id,
            meal_id=meal_id,
            notes="",
            request_time=request_time,
        )
        maria_session.add(new_request)
        await maria_session.commit()
        await maria_session.refresh(new_request)

        lines = [
            RequestLine(
                employee_id=line.employee_id,
                employee_code=line.employee_code,
                department_id=line.department_id,
                request_id=new_request.id,
                meal_id=line.meal_id,
                notes=line.notes,
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
    request_lines: List[RequestLine],
    maria_session: AsyncSession,
    hris_session: AsyncSession,
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

            maria_session.add(line)

        await maria_session.commit()
    except Exception as e:
        logger.error(f"Error updating request lines: {e}")
        await maria_session.rollback()


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

    statement = select(func.count()).select_from(Request)

    # Apply filters
    if start_time and end_time:
        statement = statement.where(Request.request_time.between(start_dt, end_dt))
    if requester_id:
        statement = statement.where(Request.requester_id == int(requester_id))

    # Execute the total count query
    total_rows_result = await session.execute(statement)
    total_rows = total_rows_result.scalar() or 0

    # Calculate total pages
    total_pages = (total_rows + page_size - 1) // page_size

    # Query to fetch paginated data
    statement = (
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
            func.sum(case((RequestLine.is_accepted == True, 1), else_=0)).label(
                "accepted_lines"
            ),
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
            Request.created_time,
            Request.closed_time,
            Request.notes,
        )
        .order_by(Request.id.desc())
    )
    # Apply filters
    if start_time and end_time:
        statement = statement.where(Request.request_time.between(start_dt, end_dt))
    if requester_id:
        statement = statement.where(Request.requester_id == int(requester_id))

    # Apply pagination
    if not download:
        # Apply pagination (offset and limit)
        statement = statement.offset(offset).limit(page_size)

    # Execute query and fetch data
    result = await session.execute(statement)
    rows = result.fetchall()

    # Transform rows into the expected response format
    items = [RequestPageRecordResponse.model_validate(row).model_dump() for row in rows]

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


async def update_request_lines_status(session: AsyncSession, request_id: int):
    """
    Mark all lines of a request as not accepted.
    """
    try:
        statement = select(RequestLine).where(RequestLine.request_id == request_id)
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
            func.sum(case((RequestLine.is_accepted == True, 1), else_=0)).label(
                "accepted_lines"
            ),
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
