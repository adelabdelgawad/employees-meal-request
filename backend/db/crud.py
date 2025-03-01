import traceback
import logging
from typing import List, Optional
from sqlmodel import Session, select, func, case
from db.models import (
    Email,
    Request,
    RequestStatus,
    Account,
    RequestLine,
    Meal,
    Employee,
    Department,
)
from services.schema import RequestSummary, RequestLineResponse
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


def read_requests(session: Session) -> List[RequestSummary]:
    """
    Fetch all requests with aggregated data.

    Args:
        session (Session): SQLModel session.

    Returns:
        List[RequestSummary]: A list of request summaries.
    """
    logger.info("Fetching all requests with aggregated data.")

    query = (
        select(
            Request.id,
            RequestStatus.name.label("status_name"),
            Account.username.label("requester_name"),
            Account.title.label("requester_title"),
            Request.request_time,
            Request.notes,
            Request.closed_time,
            Meal.name.label("meal"),
            func.count(RequestLine.id).label("total_request_lines"),
            func.sum(
                case((RequestLine.is_accepted == True, 1), else_=0)
            ).label("accepted_request_lines"),
        )
        .join(RequestStatus, Request.status_id == RequestStatus.id)
        .join(Account, Request.requester_id == Account.id)
        .outerjoin(RequestLine, RequestLine.request_id == Request.id)
        .join(Meal, Request.id == Meal.id)
        .where(Request.request_time.isnot(None))
        .group_by(
            Request.id,
            RequestStatus.name,
            Account.username,
            Account.title,
            Request.notes,
            Meal.name,
            Request.request_time,
            Request.closed_time,
        )
        .order_by(Request.id.desc())
    )

    try:
        requests = session.exec(query).all()
        if not requests:
            logger.info("No requests found.")
            return []

        logger.info(
            f"Retrieved {len(requests)} requests with aggregated data."
        )
        return [
            RequestSummary(
                request_id=row.id,
                status_name=row.status_name,
                requester_name=row.requester_name,
                requester_title=row.requester_title,
                request_time=row.request_time,
                notes=row.notes,
                closed_time=row.closed_time,
                meal=row.meal,
                total_request_lines=row.total_request_lines,
                accepted_request_lines=row.accepted_request_lines,
            )
            for row in requests
        ]
    except Exception as e:
        logger.error(f"An error occurred while retrieving requests: {e}")
        logger.info(f"Traceback: {traceback.format_exc()}")
        return []


async def read_request_line_for_requests_page(
    session: Session, request_id: int
) -> List[RequestLineResponse]:
    """
    Fetch request lines for a given request ID.

    Args:
        session (Session): SQLModel session.
        request_id (int): request ID to fetch lines for.

    Returns:
        List[RequestLineResponse]: A list of request line responses.
    """
    logger.info(f"Reading request lines for request ID: {request_id}")

    query = (
        select(
            RequestLine.id,
            Employee.code.label("employee_code"),
            Employee.name.label("employee_name"),
            Employee.title.label("employee_title"),
            Department.name.label("department"),
            RequestLine.shift_hours.label("shift_hours"),
            RequestLine.attendance_in.label("attendance"),
            RequestLine.is_accepted.label("accepted"),
            Meal.name.label("meal"),
            RequestLine.notes.label("notes"),
        )
        .join(Request, RequestLine.request_id == Request.id)
        .join(Employee, RequestLine.employee_id == Employee.id)
        .join(Department, Employee.department_id == Department.id)
        .join(Meal, Request.id == Meal.id)
        .where(Request.id == request_id)
    )

    try:
        request_lines = session.exec(query).all()
        if not request_lines:
            logger.info(f"No request lines found for request ID: {request_id}")
            return []

        logger.info(
            f"Retrieved {len(request_lines)} request lines for request ID: {request_id}"
        )
        return [
            RequestLineResponse(
                id=row.id,
                code=row.employee_code,
                name=row.employee_name,
                title=row.employee_title,
                department=row.department,
                shift_hours=row.shift_hours,
                attendance=row.attendance_in,
                accepted=row.accepted,
                notes=row.notes,
                meal=row.meal,
            )
            for row in request_lines
        ]
    except Exception as e:
        logger.error(
            f"Failed to read request lines for request ID {request_id}: {e}"
        )
        logger.info(f"Traceback: {traceback.format_exc()}")
        return []


async def read_email_with_role(
    session: AsyncSession, role_id: Optional[int] = None
) -> List[Email]:
    """
    Retrieve emails from the database, optionally filtered by email role ID.

    Args:
        session (AsyncSession): SQLAlchemy async session for database communication.
        role_id (Optional[int]): The ID of the email role to filter emails.
            If None, retrieves all emails.

    Returns:
        List[Email]:
            - A list of Email instances matching the filters.
            - An empty list if no emails are found or an error occurs.
    """
    try:
        if role_id:
            logger.info(f"Fetching emails with role ID: {role_id}")
        else:
            logger.info("Fetching all emails.")

        stmt = select(Email)

        # Apply filter if role_id is provided
        if role_id:
            stmt = stmt.where(Email.role_id == role_id)

        # Execute the query asynchronously
        result = await session.execute(stmt)
        emails = result.scalars().all()

        logger.info(f"Retrieved {len(emails)} email(s).")
        return emails

    except Exception as e:
        logger.error(
            "An unexpected error occurred while retrieving emails with role.",
            exc_info=e,
        )
        logger.debug(f"Traceback: {traceback.format_exc()}")
        return []


async def read_account(session: AsyncSession, account_id: int = None):
    """
    Fetches account(s) from the database. If an account_id is provided, fetches a single account;
    otherwise, retrieves all accounts.

    Args:
        session (AsyncSession): The SQLAlchemy asynchronous session.
        account_id (int, optional): The ID of the account to retrieve. Defaults to None.

    Returns:
        Account | List[Account] | None: The requested account if found, a list of accounts, or None if not found.
    """
    try:
        stmt = select(Account)

        if account_id:
            stmt = stmt.where(Account.id == account_id)

        # Execute the query asynchronously
        result = await session.execute(stmt)
        accounts = result.scalars().all()

        if account_id:
            if accounts:
                logger.info(
                    "Successfully retrieved account with ID: %s", account_id
                )
                return accounts[0]
            else:
                logger.warning("No account found with ID: %s", account_id)
                return None

        logger.info("Successfully retrieved %d account(s).", len(accounts))
        return accounts

    except Exception as e:
        logger.error(
            "An error occurred while retrieving account(s): %s",
            str(e),
            exc_info=True,
        )
        return None if account_id else []
