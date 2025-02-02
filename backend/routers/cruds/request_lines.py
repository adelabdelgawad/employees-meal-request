import logging
from typing import List
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import RequestLine, Employee
from src.http_schema import UpdateRequestStatus, RequestLineRespose

# Logger setup
logger = logging.getLogger(__name__)


async def read_request_lines(
    session: AsyncSession, request_id: int
) -> List[RequestLineRespose]:
    """
    Reads request lines for a given request ID.

    Args:
        session (AsyncSession): Database session.
        request_id (int): ID of the request.

    Returns:
        List[RequestLineRespose]: List of request lines.
    """
    try:
        statement = (
            select(
                RequestLine.id,
                Employee.name.label("name"),
                Employee.title.label("title"),
                Employee.code.label("code"),
                RequestLine.notes,
                RequestLine.attendance,
                RequestLine.is_accepted,
                RequestLine.shift_hours,
            )
            .join(Employee, RequestLine.employee_id == Employee.id)
            .where(RequestLine.request_id == request_id)
        )

        result = await session.execute(statement)
        lines = result.mappings().all()

        if not lines:
            logger.info(f"No request lines found for request_id: {request_id}")
            return []

        return [RequestLineRespose(**row) for row in lines]
    except Exception as e:
        logger.error(f"Error reading request lines for request_id {request_id}: {e}")
        raise


async def update_request_lines(
    session: AsyncSession, changes: List[UpdateRequestStatus]
):
    """
    Updates the `is_accepted` status for request lines.

    Args:
        session (AsyncSession): Database session.
        changes (List[UpdateRequestStatus]): List of changes to apply.

    Returns:
        None
    """
    try:
        for change in changes:
            record = await session.get(RequestLine, change.id)
            if not record:
                raise ValueError(f"RequestLine with ID {change.id} not found")

            record.is_accepted = change.is_accepted
            session.add(record)

        await session.commit()
    except Exception as e:
        logger.error(f"Error updating request lines: {e}")
        await session.rollback()
        raise
