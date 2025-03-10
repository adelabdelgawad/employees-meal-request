import logging
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Role, RolePermission, Account, LogRolePermission
from fastapi import HTTPException
from typing import Optional, Union, List
from sqlalchemy.exc import IntegrityError
from services.http_schema import (
    UserCreateRequest,
)

import pytz

from services.schema import UserWithRoles, Role as RoleSchema

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")

# Initialize logger
logger = logging.getLogger(__name__)


async def read_user(
    session: AsyncSession, user_id: Optional[int] = None
) -> Union[UserWithRoles, List[UserWithRoles]]:
    """
    Retrieve user(s) along with their associated roles from the database.

    Args:
        session (AsyncSession): The asynchronous database session.
        user_id (Optional[int]): The ID of a specific user to retrieve. If None, retrieves all users.

    Returns:
        Union[SettingUserResponse, List[SettingUserResponse]]:
            A list of user response objects containing user details and their roles.

    Raises:
        HTTPException: If an unexpected error occurs during the retrieval process.
    """
    try:
        # Build the SQL statement to fetch users.

        users_stmt = select(Account).where(
            Account.id.in_(select(RolePermission.account_id).distinct())
        )

        if user_id:
            users_stmt = users_stmt.where(Account.id == user_id)

        # Execute the query to fetch users.
        users_result = await session.execute(users_stmt)
        users = users_result.scalars().all()

        user_list = []
        # Iterate over each user and fetch their roles.
        for user in users:
            # Build the SQL statement to fetch roles for the current user.
            roles_stmt = (
                select(Role)
                .join(RolePermission)
                .where(RolePermission.account_id == user.id)
            )
            roles_result = await session.execute(roles_stmt)
            roles = roles_result.scalars().all()

            # Construct the response for the user, including role details.
            user_list.append(
                UserWithRoles(
                    id=user.id,
                    fullname=user.fullname,
                    username=user.username,
                    title=user.title,
                    roles=[
                        RoleSchema(
                            id=role.id,
                            name=role.name,
                            descreption=role.description,
                        )
                        for role in roles
                    ],
                )
            )

        return user_list

    except Exception as e:
        logger.error(f"Error reading user(s): {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


async def create_user(
    session: AsyncSession, request: UserCreateRequest, admin_id: int
) -> Account:
    """
    Create a new user and assign default roles.

    This function first checks if a user with the given username already exists.
    If not, it creates a new user record and commits the change. It then assigns
    the default roles provided in the request to the new user.

    Args:
        session (AsyncSession): The asynchronous database session.
        request (UserCreateRequest): The request object containing user details and roles.

    Returns:
        Account: The newly created user account (or the existing account if found).

    Raises:
        ValueError: If integrity constraints are violated during user creation or role assignment.
        HTTPException: If any unexpected error occurs during the process.
    """
    try:
        # Check if the user already exists.
        statement = select(Account).where(Account.username == request.username)
        result = await session.execute(statement)
        user = result.scalar_one_or_none()

        if not user:
            # Create a new user record.
            user = Account(
                fullname=request.fullname,
                username=request.username,
                title=request.title,
            )

        # Commit the transaction for user creation.
        session.add(user)
        await session.commit()

        log = LogRolePermission(
            account_id=user.id,
            role_id=1,
            admin_id=admin_id,
            action="created",
        )
        session.add(log)
        await session.commit()

        logger.info(f"Created new user: {user.username} (ID: {user.id})")

        await add_roles_to_user(
            session=session,
            account_id=user.id,
            role_ids=request.roles,
            admin_id=admin_id,
        )
        return user
    except IntegrityError as e:
        await session.rollback()
        logger.error(f"IntegrityError during role assignment: {e}")
        raise ValueError("Failed to Create User.")

        return user

    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


async def add_roles_to_user(
    session: AsyncSession, account_id: int, role_ids: List[int], admin_id: int
) -> List[RolePermission]:
    """
    Assign multiple roles to a user account.

    This function first retrieves existing role assignments to avoid duplicates,
    then adds any new roles provided in the role_ids list.

    Args:
        session (AsyncSession): The asynchronous database session.
        account_id (int): The ID of the user account.
        role_ids (List[int]): A list of role IDs to assign to the user.

    Returns:
        List[RolePermission]: A list of newly created RolePermission objects.

    Raises:
        ValueError: If integrity constraints are violated during role assignment.
        HTTPException: If an unexpected error occurs during the process.
    """
    try:
        # Retrieve existing roles for the user.
        statement = select(RolePermission).where(
            RolePermission.account_id == account_id
        )
        existing_roles_result = await session.execute(statement)
        existing_role_ids = {
            rp.role_id for rp in existing_roles_result.scalars().all()
        }

        # Determine which roles are new (i.e., not already assigned).
        new_role_ids = set(role_ids) - existing_role_ids
        new_roles = [
            RolePermission(role_id=role_id, account_id=account_id)
            for role_id in new_role_ids
        ]
        logs = [
            LogRolePermission(
                role_id=role_id,
                account_id=account_id,
                admin_id=admin_id,
                action="added",
            )
            for role_id in new_role_ids
        ]
        # If there are new roles, add them and commit the transaction.
        if new_roles:
            session.add_all(logs)
            session.add_all(new_roles)
            try:
                await session.commit()
                logger.info(
                    f"Assigned roles {new_role_ids} to user ID {account_id}"
                )
            except IntegrityError as e:
                await session.rollback()
                logger.error(f"IntegrityError during role assignment: {e}")
                raise ValueError(
                    "Failed to assign roles due to integrity constraints."
                )

        return new_roles

    except Exception as e:
        logger.error(f"Error adding roles to user: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


async def remove_roles_from_user(
    session: AsyncSession, account_id: int, role_ids: List[int], admin_id: int
):
    """
    Remove specified roles from a user account.

    This function fetches the RolePermission entries matching the given account and role IDs,
    deletes them from the session, and commits the changes.

    Args:
        session (AsyncSession): The asynchronous database session.
        account_id (int): The ID of the user account.
        role_ids (List[int]): A list of role IDs to remove from the user account.

    Raises:
        ValueError: If integrity constraints are violated during role removal.
        HTTPException: If an unexpected error occurs during the process.
    """
    try:
        print("role_ids", role_ids)
        # Fetch the role permissions that match the account and the specified role IDs.
        statement = select(RolePermission).where(
            (RolePermission.account_id == account_id)
            & (RolePermission.role_id.in_(role_ids))
        )
        roles_to_remove_result = await session.execute(statement)
        roles_to_remove = roles_to_remove_result.scalars().all()

        logs: List[LogRolePermission] = []

        if roles_to_remove:
            # Remove each role permission from the session.
            for role_permission in roles_to_remove:
                await session.delete(role_permission)
                logs.append(
                    LogRolePermission(
                        role_id=role_permission.role_id,
                        account_id=role_permission.account_id,
                        admin_id=admin_id,
                        action="removed",
                    )
                )

            try:
                session.add_all(logs)
                await session.commit()
                logger.info(
                    f"Removed roles {role_ids} from user ID {account_id}"
                )
            except IntegrityError as e:
                await session.rollback()
                logger.error(f"IntegrityError during role removal: {e}")
                raise ValueError(
                    "Failed to remove roles due to integrity constraints."
                )

    except Exception as e:
        logger.error(f"Error removing roles from user: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
