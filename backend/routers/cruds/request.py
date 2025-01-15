import logging
from sqlmodel import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import MealRequestLine, MealRequest, MealRequestStatus, Account, MealType
from typing import Optional
from src.http_schema import RequestPageRecordResponse
import pytz


# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")

# Create API Router
logger = logging.getLogger(__name__)


async def read_meal_request_for_request_page(
    session: AsyncSession,
    request_id: int,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
) -> RequestPageRecordResponse:
    # Build the statement
    statement = (
        select(
            MealRequest.id,
            MealRequestStatus.name.label("status_name"),
            MealRequestStatus.id.label("status_id"),
            Account.full_name.label("requester"),
            Account.title.label("requester_title"),
            MealType.name.label("meal_type"),
            MealRequest.created_time.label("request_time"),
            MealRequest.closed_time,
            MealRequest.notes,
            func.count(MealRequestLine.id).label("total_order_lines"),
            func.sum(case((MealRequestLine.is_accepted == True, 1), else_=0)).label(
                "accepted_order_lines"
            ),
            Account.full_name.label("auditor"),
        )
        .join(Account, MealRequest.requester_id == Account.id)
        .join(MealRequestStatus, MealRequest.status)
        .join(MealType, MealRequest.meal_type_id == MealType.id)
        .outerjoin(
            MealRequestLine, MealRequest.id == MealRequestLine.meal_request_id
        )  # Correct join
        .group_by(
            MealRequest.id,
            MealRequestStatus.name,
            Account.username,
            MealRequest.created_time,
            MealRequest.closed_time,
        )
        .order_by(MealRequest.id.desc())
    )

    if request_id:
        statement = statement.where(MealRequest.id == request_id)

    if from_date and to_date:
        statement = statement.where(
            MealRequest.created_time.between(from_date, to_date)
        )

    # Execute the query
    result = await session.execute(statement)
    meal_requests = result.all()

    return [request for request in meal_requests]


async def update_mealrequest_line(session: AsyncSession, request_id: int):
    """
    Update the is_accepted status of all meal request lines for a given request ID.

    Args:
        session (Session): The database session to use.
        request_id (int): The ID of the meal request to update.

    Returns:
        None
    """
    statement = select(MealRequestLine).where(
        MealRequestLine.meal_request_id == request_id
    )
    result = await session.execute(statement)
    meal_request_lines = result.scalars().all()

    for meal_request_line in meal_request_lines:
        meal_request_line.is_accepted = False
        session.add(meal_request_line)

    await session.commit()
    await session.refresh(meal_request_line)
