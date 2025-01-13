import traceback
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlmodel import Session, select
from db.models import Account, Role
from db.database import get_application_session
from src.http_schema import DomainUser
from src.active_directory import read_domain_users

router = APIRouter()
logger = logging.getLogger(__name__)


SessionDep = Annotated[Session, Depends(get_application_session)]


@router.get(
    "/domain-users",
    response_model=List[DomainUser],
    status_code=status.HTTP_200_OK,
)
async def get_users(session: SessionDep):
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
        logger.debug(f"Traceback: {traceback.format_exc()}")
        raise http_exc

    except Exception as err:
        logger.error(f"Unexpected error while reading roles: {err}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while reading roles.",
        )


@router.get(
    "/users",
    response_model=List[Account],
    status_code=status.HTTP_200_OK,
)
async def get_users(session: SessionDep):
    """
    Retrieve all users from the database.
    """
    try:
        users = session.exec(select(Account)).all()
        return users
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching users.",
        )


@router.put(
    "/users/{user_id}",
    response_model=Account,
    status_code=status.HTTP_200_OK,
)
async def update_user(user_id: int, user_data: Account, session: SessionDep):
    """
    Update an existing user by their ID.
    """
    try:
        user = session.get(Account, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.username = user_data.username
        user.is_deleted = user_data.is_deleted
        user.is_locked = user_data.is_locked
        session.commit()
        session.refresh(user)
        return user
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the user.",
        )


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
