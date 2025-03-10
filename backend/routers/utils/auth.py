import logging
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from db.models import Account, Role, RolePermission, HRISSecurityUser
from db.schemas import RoleRead
from routers.utils.hashing import verify_password

# Configure logging
logger = logging.getLogger(__name__)


async def read_account_by_username(
    session: AsyncSession, username: str
) -> Optional[Account]:
    """
    Fetch an account by username.

    Args:
        session (AsyncSession): The SQLAlchemy async session.
        username (str): The username to search for.

    Returns:
        Optional[Account]: The found account instance or None.
    """
    statement = select(Account).where(Account.username == username)
    result = await session.execute(statement)
    account = result.scalar_one_or_none()

    if account:
        logger.info(f"User '{username}' found in database.")
    else:
        logger.warning(f"User '{username}' not found in database.")

    return account


async def validate_user_name_and_password(
    session: AsyncSession, username: str, password: str
) -> Optional[Account]:
    """
    Fetch an account by username.

    Args:
        session (AsyncSession): The SQLAlchemy async session.
        username (str): The username to search for.

    Returns:
        Optional[Account]: The found account instance or None.
    """
    statement = select(Account).where(Account.username == username)
    result = await session.execute(statement)
    account = result.scalar_one_or_none()

    if account and verify_password(password, account.password):
        logger.info(f"User '{username}' authenticated successfully.")
        return account
    else:
        logger.warning(f"Authentication failed for user '{username}'.")
        return None


async def read_user_by_id(
    session: AsyncSession, user_id: int
) -> Optional[Account]:
    """
    Fetch an account by user_id.

    Args:
        session (AsyncSession): The SQLAlchemy async session.
        user_id (int): The int to search for.

    Returns:
        Optional[Account]: The found account instance or None.
    """
    statement = select(Account).where(Account.id == user_id)
    result = await session.execute(statement)
    account = result.scalar_one_or_none()

    if account:
        logger.info(f"User '{user_id}' found in database.")
    else:
        logger.warning(f"User '{user_id}' not found in database.")

    return account


async def create_or_update_user(
    session: AsyncSession, username: str, fullname: str, title: str
) -> Account:
    """
    Create or update a user account, ensuring the correct role assignment.

    If the account exists, update its full name and title.
    If not, create a new account with the given details.

    Args:
        session (AsyncSession): The SQLAlchemy async session.
        username (str): The username of the account.
        fullname (str): The full name of the user.
        title (str): The job title of the user.

    Returns:
        Account: The created or updated account instance.
    """
    statement = select(Account).where(Account.username == username)
    result = await session.execute(statement)
    account = result.scalar_one_or_none()

    if account:
        account.fullname = fullname
        account.title = title
        message = f"Updated user '{username}' in database."
    else:
        account = Account(
            username=username,
            fullname=fullname,
            title=title,
            is_domain_user=True,
        )
        session.add(account)
        message = f"Created new user '{username}' in database."

    await session.commit()
    await session.refresh(account)

    logger.info(message)

    # Assign default role (Role ID: 1) if it's a new user
    role_message = await ensure_user_has_role(session, account.id, 2, username)
    logger.info(role_message)

    return account


async def ensure_user_has_role(
    session: AsyncSession, account_id: int, role_id: int, username: str
):
    """
    Ensure the user has a specific role assigned.

    Args:
        session (AsyncSession): The SQLAlchemy async session.
        account_id (int): The account ID of the user.
        role_id (int): The role ID to be assigned.
        username (str): The username associated with the account.

    Returns:
        str: Message indicating role assignment result.
    """
    statement = select(RolePermission).where(
        RolePermission.account_id == account_id,
        RolePermission.role_id == role_id,
    )
    result = await session.execute(statement)
    existing_role = result.scalar_one_or_none()

    if existing_role:
        logger.info(
            f"Role ID {role_id} already assigned to user '{username}'."
        )
        return f"Role already assigned to user '{username}'."

    role_permission = RolePermission(role_id=role_id, account_id=account_id)
    session.add(role_permission)
    await session.commit()

    logger.info(f"Assigned Role ID {role_id} to user '{username}'.")
    return f"Role successfully assigned to user '{username}'."


async def read_hirs_account_by_username(
    session: AsyncSession, username: str
) -> Optional[HRISSecurityUser]:
    """
    Fetch an HRIS security user by username.

    Args:
        session (AsyncSession): The SQLAlchemy async session.
        username (str): The username to search for.

    Returns:
        Optional[HRISSecurityUser]: The found HRIS security user instance or None.
    """
    statement = select(HRISSecurityUser).where(
        HRISSecurityUser.username == username
    )
    result = await session.execute(statement)
    account = result.scalar_one_or_none()

    if account:
        logger.info(f"HRIS user '{username}' found.")
    else:
        logger.warning(f"HRIS user '{username}' not found.")

    return account


async def read_roles_name(
    session: AsyncSession, account_id: Optional[int] = None
) -> List[str]:
    """
    Fetch the list of role names assigned to an account.

    Args:
        session (AsyncSession): The SQLAlchemy async session.
        account_id (int): The account ID to fetch roles for.

    Returns:
        List[str]: A list of role names associated with the given account.
    """
    if account_id:
        statement = (
            select(Role.name)
            .join(RolePermission, Role.id == RolePermission.role_id)
            .where(RolePermission.account_id == account_id)
        )
    else:
        statement = select(Role.name)

    results = await session.execute(statement)
    roles = results.scalars().all()

    if roles:
        logger.info(f"User ID {account_id} has roles: {roles}")
    else:
        logger.warning(f"User ID {account_id} has no assigned roles.")

    return roles


async def read_roles(
    session: AsyncSession, account_id: Optional[int] = None
) -> List[RoleRead]:
    """
    Fetch roles from the database, optionally filtering by account ID.

    Args:
        session (AsyncSession): The SQLAlchemy asynchronous session.
        account_id (Optional[int]): The account ID to filter roles.

    Returns:
        List[RoleRead]: A list of role.
    """
    statement = select(Role)

    if account_id:
        statement = statement.join(RolePermission).where(
            RolePermission.account_id == account_id
        )

    results = await session.execute(statement)
    roles = results.scalars().all()
    return [RoleRead.model_validate(role) for role in roles]
