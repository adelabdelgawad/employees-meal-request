import traceback
import logging
from typing import List, Optional
from sqlmodel import Session, select, func, case
from db.models import (
    DomainUser,
    Email,
    Request,
    RequestStatus,
    Account,
    RequestLine,
    Meal,
    Employee,
    Department,
    Role,
    RolePermission,
)
from services.schema import RequestSummary, RequestLineResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload


logger = logging.getLogger(__name__)


async def read_request_line_for_requests_page(
    session: Session, request_id: int, requester_id: Optional[int] = None
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

    statment = (
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
    if requester_id:
        statment = statment.where(Request.requester_id == requester_id)

    try:
        request_lines = session.exec(statment).all()
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

        # Execute the statment asynchronously
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

        # Execute the statment asynchronously
        result = await session.execute(stmt)
        accounts = result.all()

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


async def read_domain_users(
    session: AsyncSession,
) -> Optional[List[DomainUser]]:
    try:
        statement = select(DomainUser)
        result = await session.execute(statement)
        users = result.scalars().all()
        logger.info("Successfully fetched domain users")
        return users

    except Exception as e:
        logger.error(
            "An error occurred while retrieving account(s): %s",
            str(e),
            exc_info=True,
        )
        return None


async def read_roles(session: AsyncSession) -> List[Role]:
    try:
        statement = select(Role)
        result = await session.execute(statement)
        users = result.scalars().all()
        logger.info("Successfully fetched Roles")
        return users
    except Exception as e:
        logger.error(
            "An error occurred while retrieving account(s): %s",
            str(e),
            exc_info=True,
        )
        return None


async def get_users_with_roles(
    session: AsyncSession, account_id: Optional[int] = None
) -> List[dict]:
    """
    Returns a list of dictionaries, one per user, containing:
        - "id": The user's account ID.
        - "username": The user's username.
        - "fullname": The user's full name.
        - "title": The user's title.
        - "active": The user's active status.
        - "roles": A dictionary where the keys are role names (fetched dynamically)
                   and the values are booleans indicating whether the user is a member of that role.

    If an account_id is provided, only the corresponding account is returned.

    :param session: AsyncSession to perform database operations.
    :param account_id: Optional account ID to filter the results.
    :return: A list of dictionaries representing users with their roles.
    """
    # Fetch all roles dynamically
    role_stmt = select(Role)
    role_result = await session.execute(role_stmt)
    roles = role_result.scalars().all()

    # Build the accounts query with eager loading for role_permissions and their Role
    account_stmt = select(Account).options(
        selectinload(Account.role_permissions).selectinload(
            RolePermission.role
        )
    )

    if account_id is not None:
        account_stmt = account_stmt.where(Account.id == account_id)

    account_result = await session.execute(account_stmt)
    accounts = account_result.scalars().all()

    users_with_roles = []
    for account in accounts:
        # Determine the role IDs assigned to the account
        account_role_ids = {rp.role_id for rp in account.role_permissions}
        # Build a dynamic roles dictionary: key is role name, value is True if assigned to the account
        roles_dict = {
            role.name: (role.id in account_role_ids) for role in roles
        }

        users_with_roles.append(
            {
                "id": account.id,
                "username": account.username,
                "fullname": account.fullname,
                "title": account.title,
                "active": account.is_active,
                "roles": roles_dict,
            }
        )

    return users_with_roles
