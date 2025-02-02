import traceback
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from icecream import ic
from typing import List, Optional
from sqlmodel import select
from db.models import Account, Role
from src.http_schema import DomainUser
from src.active_directory import read_domain_users
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from routers.cruds import security as crud
from src.http_schema import (
    SettingUserResponse,
    UserCreateRequest,
    UserCreateResponse,
    UpdateRolesRequest,
)
from dependencies import SessionDep


router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/domain-users",
    response_model=List[DomainUser],
    status_code=status.HTTP_200_OK,
)
async def get_domain_users():
    """
    Retrieve all users from the database.
    """
    try:
        users = await read_domain_users()
        return users
    except Exception as err:
        logger.error(f"Error fetching users: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching users.",
        )


@router.get(
    "/roles",
    response_model=List[Role],
    status_code=status.HTTP_200_OK,
)
async def get_roles(maria_session: SessionDep):
    """
    Retrieve all roles from the database.
    """
    try:
        statement = select(Role)
        result = await maria_session.execute(statement)
        roles = result.scalars().all()

        if not roles:
            logger.info("No roles found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No roles found.",
            )
        return roles

    except HTTPException as http_exc:
        logger.error(f"HTTP error: {http_exc.detail}")
        logger.info(f"Traceback: {traceback.format_exc()}")
        raise http_exc

    except Exception as err:
        logger.error(f"Unexpected error while reading roles: {err}")
        logger.info(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while reading roles.",
        )


@router.get(
    "/user",
    response_model=List[SettingUserResponse],
    status_code=status.HTTP_200_OK,
)
async def get_users(maria_session: SessionDep, user_id: Optional[int] = None):
    """
    Retrieve users from the database. If user_id is provided, retrieve the specific user.
    """
    try:
        if user_id is not None:
            users = await crud.read_user(maria_session, user_id)
            return [users[0]] if users else []
        else:
            users = await crud.read_user(maria_session)
            return users
    except IntegrityError as e:
        logger.error(f"IntegrityError in create_user endpoint: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with the given username already exists.",
        )
    except Exception as e:
        logger.error(f"Unexpected error in create_user endpoint: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.put("/user/{user_id}/roles")
async def update_user_roles(
    maria_session: SessionDep,
    user_id: int,
    update_roles_request: UpdateRolesRequest,
):
    try:
        # Handle added roles
        if update_roles_request.added_roles:
            await crud.add_roles_to_user(
                maria_session, user_id, update_roles_request.added_roles
            )
            logger.info(
                f"Added roles {update_roles_request.added_roles} to user {user_id}"
            )

        # Handle removed roles
        if update_roles_request.removed_roles:
            await crud.remove_roles_from_user(
                maria_session, user_id, update_roles_request.removed_roles
            )
            logger.info(
                f"Removed roles {update_roles_request.removed_roles} from user {user_id}"
            )

        return {"message": "Roles updated successfully", "user_id": user_id}

    except Exception as e:
        logger.error(f"Error updating roles for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update roles")


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_user(user_id: int, session: SessionDep):
    """
    Delete an existing user by their ID.
    """
    try:
        user = session.get(Account, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        session.delete(user)
        session.commit()
        return {"message": "User deleted successfully"}
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the user.",
        )


@router.post("/user", response_model=UserCreateResponse)
async def create_user(
    request: UserCreateRequest,
    maria_session: SessionDep,
):
    try:
        user = await crud.create_user(maria_session, request)
        return {
            "success": True,
            "message": "User added successfully",
            "data": {"userId": user.id},
        }
    except IntegrityError as e:
        logger.error(f"IntegrityError in create_user endpoint: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with the given username already exists.",
        )
    except Exception as e:
        logger.error(f"Unexpected error in create_user endpoint: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
