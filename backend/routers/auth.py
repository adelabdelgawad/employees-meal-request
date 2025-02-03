import os
from datetime import timedelta
from fastapi import APIRouter, HTTPException, status
from dependencies import SessionDep
from src.schema import LoginRequest  # assuming LoginRequest is a Pydantic model
from routers.utils.auth import (
    read_account_by_username,
    read_hirs_account_by_username,
    create_or_update_user,
    read_roles_by_account_id,
)
from src.active_directory import authenticate_and_get_user
from src.http_schema import UserData
from typing import List, Optional

router = APIRouter()


async def validate_user(
    session: SessionDep, username: str, password: str
) -> Optional[UserData]:
    """
    Validate user credentials against Active Directory and the database.

    Args:
        session (SessionDep): Database session dependency.
        username (str): The username provided.
        password (str): The password provided.

    Returns:
        Optional[TokenPayload]: The token payload data if the user is validated;
            otherwise, None.
    """
    # Check if account exists in either source
    account_exists = any(
        [
            await read_account_by_username(session, username),
            await read_hirs_account_by_username(session, username),
        ]
    )
    if not account_exists:
        return None

    # Authenticate against Active Directory
    windows_account = await authenticate_and_get_user(username, password)
    if not windows_account:
        return None

    # Create or update the user in the database
    user = await create_or_update_user(
        session,
        windows_account.username,
        windows_account.fullName,
        windows_account.title,
    )
    if not user:
        return None

    # Retrieve user roles
    roles = await read_roles_by_account_id(session, user.id)

    return UserData(
        userId=user.id,
        username=user.username,
        email=f"{user.username}@andalusiagroup.net",
        fullName=user.full_name,
        title=user.title,
        roles=roles,
    )


###############################################################################
# Route Handlers
###############################################################################


@router.post("/login", response_model=UserData)
async def login_for_access_token(
    maria_session: SessionDep, form_data: LoginRequest
) -> UserData:
    """
    Authenticate the user and return a User data.

    Args:
        maria_session (SessionDep): Database session dependency.
        form_data (LoginRequest): Login data containing username and password.

    Raises:
        HTTPException: If the credentials are invalid.

    Returns:
        UserData: A response model containing the User data.
    """
    user_data = await validate_user(
        maria_session, form_data.username, form_data.password
    )
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_data
