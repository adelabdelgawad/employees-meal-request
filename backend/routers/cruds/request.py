import logging
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from sqlmodel import select, func, case
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
    request_lines: List[RequestBody],
    background_tasks,
    maria_session: AsyncSession,
    hris_session: AsyncSession,
) -> Dict:
    """
    Create grouped requests and schedule background updates.
    """
    grouped_lines = group_requests_by_meal_id(request_lines)
    created_request_ids = []
    created_lines = []

    for meal_id, lines in grouped_lines:
        lines_list = list(lines)
        created_lines_batch = await create_meal_request_lines(
            meal_id, lines_list, maria_session
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
    meal_id: int, request_lines: List[RequestBody], maria_session: AsyncSession
) -> List[RequestLine]:
    """
    Create a new request and its lines.
    """
    try:
        new_request = Request(requester_id=1, meal_id=meal_id, notes="")
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

        logger.debug(f"Today Shifts: {today_shifts}")
        logger.debug(f"Recent Attendances: {recent_attendances}")

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
            logger.debug(
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
    request_id: Optional[int],
    from_date: Optional[str],
    to_date: Optional[str],
) -> List[RequestPageRecordResponse]:
    """
    read requests with filters.
    """
    try:
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

        if request_id:
            statement = statement.where(Request.id == request_id)
        if from_date and to_date:
            from_date = datetime.strptime(from_date, "%Y-%m-%d")
            to_date = datetime.strptime(to_date, "%Y-%m-%d")
            statement = statement.where(
                Request.created_time.between(from_date, to_date)
            )

        result = await session.execute(statement)
        return [RequestPageRecordResponse(**row) for row in result.mappings().all()]
    except Exception as e:
        logger.error(f"Error reading requests: {e}")
        raise e


async def update_request_status(session: AsyncSession, request_id: int, status_id: int):
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
        session.add(request)
        await session.commit()

        if status_id == 4:  # Additional logic for status 4
            await update_request_lines_status(session, request_id)
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
