import logging
from sqlmodel import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import (
    RequestLine,
    Request,
    RequestStatus,
    Account,
    Meal,
)
from typing import Optional, List
from src.http_schema import RequestPageRecordResponse, RequestBody
import pytz


# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")

# Create API Router
logger = logging.getLogger(__name__)


async def create_meal_request_lines(
    meal_id: int, request_lines: List[RequestBody], maria_session: AsyncSession
) -> List[RequestLine]:
    """
    Handles the SQL logic for creating a meal request and its lines.

    Args:
        request_lines (List[RequestBody]): List of meal request lines.
        maria_session (AsyncSession): Application database session.

    Returns:
        dict: Contains the created meal request ID and created request line IDs.
    """
    try:
        # Step 1: Create a new meal request
        new_request = Request(
            requester_id=1,
            meal_id=meal_id,
            notes="",
        )
        maria_session.add(new_request)
        await maria_session.commit()
        await maria_session.refresh(new_request)

        logger.info(f"Created meal request with ID: {new_request.id}")

        # Step 2: Create meal request lines
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
        await maria_session.flush()

        # Retrieve created line IDs

        return lines

    except Exception as e:
        logger.error(f"Error in create_meal_request: {e}")
        raise e


async def read_request_for_request_page(
    session: AsyncSession,
    request_id: Optional[int] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
) -> List[RequestPageRecordResponse]:
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
            Request.created_time,
            Request.closed_time,
            Request.notes,
        )
        .order_by(Request.id.desc())
    )

    # Apply filters if provided
    if request_id:
        statement = statement.where(Request.id == request_id)

    if from_date and to_date:
        statement = statement.where(
            Request.created_time.between(from_date, to_date)
        )

    # Execute the query
    result = await session.execute(statement)
    requests = result.all()

    # Convert to list of RequestPageRecordResponse
    return [
        RequestPageRecordResponse(
            id=request.id,
            status_name=request.status_name,
            status_id=request.status_id,
            requester=request.requester,
            requester_title=request.requester_title,
            meal=request.meal,
            request_time=request.request_time,
            closed_time=request.closed_time,
            notes=request.notes,
            total_lines=request.total_lines,
            accepted_lines=request.accepted_lines,
        )
        for request in requests
    ]


async def update_Request_line(session: AsyncSession, request_id: int):
    """
    Update the is_accepted status of all meal request lines for a given request ID.

    Args:
        session (Session): The database session to use.
        request_id (int): The ID of the meal request to update.

    Returns:
        None
    """
    statement = select(RequestLine).where(RequestLine.request_id == request_id)
    result = await session.execute(statement)
    request_lines = result.scalars().all()

    for request_line in request_lines:
        request_line.is_accepted = False
        session.add(request_line)

    await session.commit()
    await session.refresh(request_line)
