import logging
from sqlmodel import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from db.models import (
    Role,
    RolePermission,
    Account,
)
from fastapi import HTTPException
from typing import Optional, Union, List
from sqlalchemy.exc import IntegrityError
from src.http_schema import (
    SettingUserResponse,
    UserCreateRequest,
    RoleResponse,
)
import pytz


# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")

# Create API Router
logger = logging.getLogger(__name__)


async def read_user(
    session: AsyncSession,
    username: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    download: Optional[bool] = False,
) -> Union[SettingUserResponse, List[SettingUserResponse]]:

    # Calculate offset for pagination
    offset = (page - 1) * page_size

    statement = select(func.count()).select_from(Account)
    if username:
        statement = statement.where(Account.username.ilike(f"%{username}%"))

    # Execute the total count query
    total_rows_result = await session.execute(statement)
    total_rows = total_rows_result.scalar() or 0

    # Calculate total pages
    total_pages = (total_rows + page_size - 1) // page_size

    # Fetch all users
    statement = select(Account)
    if username:
        statement = statement.where(Account.username.ilike(f"%{username}%"))

    users_result = await session.execute(statement)
    users = users_result.scalars().all()

    # Fetch roles for each user
    user_list = []
    for user in users:
        roles_stmt = (
            select(Role)
            .join(RolePermission)
            .where(RolePermission.account_id == user.id)
        )
        roles_result = await session.execute(roles_stmt)
        roles = roles_result.scalars().all()

        user_list.append(
            SettingUserResponse(
                id=user.id,
                fullName=user.full_name,
                username=user.username,
                title=user.title,
                roles=[RoleResponse(id=role.id, name=role.name) for role in roles],
            )
        )

    # Apply pagination
    if not download:
        # Apply pagination (offset and limit)
        statement = statement.offset(offset).limit(page_size)

    return {
        "data": user_list,
        "current_page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "total_rows": total_rows,
    }


async def create_user(session: AsyncSession, request: UserCreateRequest) -> Account:
    """
    Checks if the user already exists, updates the user if it exists, or creates a new user if it doesn't.
    Also assigns default roles to the new user.

    Args:
    - session (AsyncSession): The database session to use for the operation.
    - request (UserCreateRequest): The request object containing the user's details.

    Returns:
    - Account: The newly created or updated user object.

    Raises:
    - ValueError: If there is an integrity constraint error during user creation/update or role assignment.
    """
    # Check if the user already exists
    statement = select(Account).where(Account.username == request.username)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()

    if user:
        # Update the existing user's details
        user.full_name = request.full_name
        user.title = request.title
        logger.info(f"Updated existing user: {user.username} (ID: {user.id})")
    else:
        # Create a new user
        user = Account(
            full_name=request.full_name,
            username=request.username,
            title=request.title,
        )
        session.add(user)
        logger.info(f"Created new user: {user.username} (ID: {user.id})")

    try:
        await session.commit()
        await session.refresh(user)
    except IntegrityError as e:
        await session.rollback()
        logger.error(f"IntegrityError during user creation/update: {e}")
        raise ValueError("Failed to create/update user due to integrity constraints.")

    # Assign default roles to the user
    for role_id in request.roles:
        logger.info(f"Assigning role ID {role_id} to user ID {user.id}")
        role_permission = RolePermission(
            role_id=role_id,
            account_id=user.id,
        )
        session.add(role_permission)

    try:
        await session.commit()
        logger.info(f"Assigned roles to user ID {user.id}")
    except IntegrityError as e:
        await session.rollback()
        logger.error(f"IntegrityError during role assignment: {e}")
        raise ValueError("Failed to assign roles due to integrity constraints.")

    return user


async def add_roles_to_user(
    session: AsyncSession, account_id: int, role_ids: List[int]
) -> List[RolePermission]:
    """
    Assign multiple roles to a user account.

    Args:
    - account_id (int): The ID of the user account to assign roles to.
    - role_ids (List[int]): A list of role IDs to assign to the user account.
    - session (AsyncSession): The database session to use for the operation.
    """
    # Fetch existing role permissions for the user
    statement = select(RolePermission).where(RolePermission.account_id == account_id)
    existing_roles = await session.execute(statement)
    existing_role_ids = {rp.role_id for rp in existing_roles.scalars().all()}

    # Determine which roles to add (skip already assigned roles)
    new_role_ids = set(role_ids) - existing_role_ids
    new_roles = [
        RolePermission(role_id=role_id, account_id=account_id)
        for role_id in new_role_ids
    ]

    if new_roles:
        session.add_all(new_roles)
        try:
            await session.commit()
            logger.info(f"Assigned roles {new_role_ids} to user ID {account_id}")
        except IntegrityError as e:
            await session.rollback()
            logger.error(f"IntegrityError during role assignment: {e}")
            raise ValueError("Failed to assign roles due to integrity constraints.")

    return new_roles


async def remove_roles_from_user(
    session: AsyncSession, account_id: int, role_ids: List[int]
):
    """
    Remove multiple roles from a user account.

    Args:
    - account_id (int): The ID of the user account to remove roles from.
    - role_ids (List[int]): A list of role IDs to remove from the user account.
    """
    # Fetch the roles to remove
    statement = select(RolePermission).where(
        (RolePermission.account_id == account_id)
        & (RolePermission.role_id.in_(role_ids))
    )
    roles_to_remove = await session.execute(statement)
    roles_to_remove = roles_to_remove.scalars().all()

    if roles_to_remove:
        for role_permission in roles_to_remove:
            await session.delete(role_permission)
        try:
            await session.commit()
            logger.info(f"Removed roles {role_ids} from user ID {account_id}")
        except IntegrityError as e:
            await session.rollback()
            logger.error(f"IntegrityError during role removal: {e}")
            raise ValueError("Failed to remove roles due to integrity constraints.")
