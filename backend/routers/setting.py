import traceback
import logging
from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from sqlmodel import select
from db.crud import read_domain_users
from db.models import Account, DomainUser, Role, RolePermission
from routers.utils.auth import read_roles
from services.http_schema import (
    DomainUserResponse,
    RoleResponse,
    SettingUserInfoResponse,
)
from sqlalchemy.exc import IntegrityError
from routers.cruds import security as crud
from services.http_schema import (
    SettingUserResponse,
    UserCreateRequest,
    UserCreateResponse,
    UpdateRolesRequest,
)
from src.dependencies import SessionDep, CurrentUserDep
from icecream import ic

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/domain-users",
    response_model=List[DomainUser],
    status_code=status.HTTP_200_OK,
)
async def get_domain_users(
    session: SessionDep,
) -> Optional[List[DomainUser]]:
    """
    Retrieve all domain users from the external Active Directory.

    Returns:
        List[DomainUser]: A list of domain users.

    Raises:
        HTTPException: 500 Internal Server Error if an error occurs during fetching.
    """
    try:
        users = await read_domain_users(session)
        if not users:
            return []
        return users
    except Exception as err:
        # Logs the exception with the full stack trace for debugging purposes.
        logger.exception("Error fetching domain users")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching domain users.",
        )


@router.get(
    "/roles",
    response_model=List[Role],
    status_code=status.HTTP_200_OK,
)
async def get_roles(session: SessionDep):
    """
    Retrieve all roles from the database.

    Args:
        session (AsyncSession): The database session dependency.

    Returns:
        List[Role]: A list of roles from the database.

    Raises:
        HTTPException: 404 if no roles are found; 500 for unexpected errors.
    """
    try:
        statement = select(Role)
        result = await session.execute(statement)
        roles = result.all()

        if not roles:
            logger.info("No roles found in the database")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No roles found.",
            )

        logger.info(f"Fetched {len(roles)} roles successfully")
        return roles

    except HTTPException as http_exc:
        logger.error(f"HTTP error occurred: {http_exc.detail}")
        logger.exception("Traceback for HTTP error in get_roles")
        raise http_exc

    except Exception as err:
        logger.exception("Unexpected error while retrieving roles")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving roles.",
        )


@router.get(
    "/setting/users",
    response_model=SettingUserResponse,  # you can keep the response_model here
    status_code=status.HTTP_200_OK,
)
async def get_users(session: SessionDep):
    try:
        users = await crud.read_user(session)
        roles = await read_roles(session)
        domain_users = await read_domain_users(session)
        logger.info("Setting Users records Read successfully")
        response = SettingUserResponse(
            roles=roles, users=users, domain_users=domain_users
        )
        # Serialize the model to a dict before returning it.
        return response.model_dump()
    except Exception as e:
        logger.error(f"Unexpected error in Setting Users endpoint: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.put("/user/{user_id}/roles")
async def update_user_roles(
    session: SessionDep,
    user: CurrentUserDep,
    user_id: int,
    update_roles_request: UpdateRolesRequest,
):
    """
    Update roles for a given user by adding or removing specified roles.

    Args:
        session (AsyncSession): The database session dependency.
        user_id (int): The ID of the user to update.
        update_roles_request (UpdateRolesRequest): Contains lists of roles to add and remove.

    Returns:
        dict: A success message along with the user ID.

    Raises:
        HTTPException: 500 if updating roles fails.
    """
    try:
        if update_roles_request.added_roles:
            await crud.add_roles_to_user(
                session=session,
                account_id=user_id,
                role_ids=update_roles_request.added_roles,
                admin_id=user.id,
            )
            logger.info(
                f"Added roles {update_roles_request.added_roles} to user {user_id}"
            )
        # Remove roles if provided in the request.
        if update_roles_request.removed_roles:

            await crud.remove_roles_from_user(
                session=session,
                account_id=user_id,
                role_ids=update_roles_request.removed_roles,
                admin_id=user.id,
            )

            logger.info(
                f"Removed roles {update_roles_request.removed_roles} from user {user_id}"
            )

        return {"message": "Roles updated successfully", "user_id": user_id}

    except Exception as e:
        logger.exception(f"Error updating roles for user {user_id}")
        raise HTTPException(status_code=500, detail="Failed to update roles")


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_user(
    user_id: int, session: SessionDep, current_user: CurrentUserDep
):
    """        icecream.ic(new_schedule)

    Delete an existing user by their ID.

    Args:
        user_id (int): The ID of the user to delete.
        session (AsyncSession): The database session dependency.
        current_user (User): The currently authenticated user.

    Raises:
        HTTPException: 404 if the user is not found; 500 for any internal error.
    """
    try:
        # Retrieve the user from the database.
        result = await session.execute(
            select(Account).where(Account.id == user_id)
        )
        user = result.scalars().first()
        stmt = select(RolePermission).where(
            RolePermission.account_id == user_id
        )
        result = await session.execute(stmt)
        roles = result.scalars().all()

        await crud.remove_roles_from_user(
            session=session,
            account_id=user_id,
            role_ids=[role.role_id for role in roles],
            admin_id=current_user.id,
        )

        if not user:
            logger.warning(f"User with ID {user_id} not found for deletion")
            raise HTTPException(status_code=404, detail="User not found")

        logger.info(f"User with ID {user_id} deleted successfully")
        # No return statement needed for 204 No Content
    except HTTPException:
        raise  # Re-raise HTTP exceptions to be handled by FastAPI
    except Exception as err:
        logger.exception(
            f"Error occurred while deleting user with ID {user_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the user.",
        )


@router.post("/user", response_model=UserCreateResponse)
async def create_user(
    session: SessionDep,
    user: CurrentUserDep,
    request: UserCreateRequest,
):
    """
    Create a new user with the provided details.

    Args:
        request (UserCreateRequest): Contains the new user's details.
        session (AsyncSession): The database session dependency.

    Returns:
        UserCreateResponse: A response containing success status, a message, and the new user's ID.

    Raises:
        HTTPException: 400 if the username already exists; 500 for any other internal error.
    """
    try:
        user = await crud.create_user(
            session=session, request=request, admin_id=user.id
        )
        logger.info(f"User created successfully with ID {user.id}")
        return {
            "success": True,
            "message": "User added successfully",
            "data": {"userId": user.id},
        }
    except IntegrityError as e:
        logger.exception("IntegrityError in create_user endpoint")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with the given username already exists.",
        )
    except Exception as e:
        logger.exception("Unexpected error in create_user endpoint")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/setting/user-info/{user_id}")
async def get_user_info(session: SessionDep, user_id: int):
    try:
        user = await session.get(Account, user_id)
        if not user:
            logger.warning(f"User with ID {user_id} not found")
            raise HTTPException(status_code=404, detail="User not found")

        # Fetch all roles
        user_roles = await read_roles(session, user.id)
        user_roles_ids = [r.id for r in user_roles]
        all_roles = await read_roles(session)

        # Extract role IDs from all roles or adjust according to your logic.
        return {
            "user_roles_ids": user_roles_ids,
            "user": user,
            "all_roles": all_roles,
        }

    except IntegrityError:
        logger.exception("IntegrityError in get_user_info endpoint")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with the given username already exists.",
        )
    except Exception as e:
        logger.exception("Unexpected error in get_user_info endpoint")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
