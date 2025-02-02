from fastapi import APIRouter, HTTPException, status, Body
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import jwt, JWTError
import os
from depandancies import SessionDep
from src.schema import LoginRequest, Token
from routers.utils.auth import (
    read_account_by_username,
    read_hirs_account_by_username,
    create_or_update_user,
    read_roles_by_account_id,
    read_user_by_id,
)
from src.active_directory import authenticate_and_get_user
import pytz

cairo_tz = pytz.timezone("Africa/Cairo")

router = APIRouter()

# Secret key to encode the JWT
SECRET_KEY = os.getenv("AUTH_SECRET", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # Access token validity
REFRESH_TOKEN_EXPIRE_DAYS = 7  # Refresh token validity


def create_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create a JWT token with the given data and expiration delta.

    Args:
        data (dict): The data to include in the token payload.
        expires_delta (Optional[timedelta]): The time delta until expiration.

    Returns:
        str: The encoded JWT token.
    """
    to_encode = data.copy()
    expire = datetime.now(cairo_tz) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def update_refresh_token(
    session: SessionDep, user_id: int, refresh_token: str
):
    """
    Updates the refresh token associated with a user ID in the database.

    Args:
        session (SessionDep): The SQLAlchemy async session.
        user_id (int): The ID of the user to update.
        refresh_token (str): The new refresh token to associate with the user.

    Returns:
        None
    """
    user = await read_user_by_id(session, user_id)
    if user:
        user.refresh_token = refresh_token
        await session.commit()


@router.post("/login", response_model=Token)
async def login_for_access_token(
    maria_session: SessionDep, form_data: LoginRequest
):
    """
    Authenticates a user against Active Directory (LDAP) and returns access and refresh tokens.

    Args:
        maria_session (SessionDep): Database session dependency.
        form_data (LoginRequest): The login request containing username and password.

    Returns:
        Token: A dictionary containing user information, access token, and refresh token.
    """
    user = None

    # Check if the user exists in the database
    account_exists = await read_account_by_username(
        maria_session, form_data.username
    )
    hirs_account_exists = await read_hirs_account_by_username(
        maria_session, form_data.username
    )

    if account_exists or hirs_account_exists:
        # Authenticate via Active Directory (LDAP)
        windows_account = await authenticate_and_get_user(
            form_data.username, form_data.password
        )

        if windows_account:
            # Create or update the user in the database
            user = await create_or_update_user(
                maria_session,
                windows_account.username,
                windows_account.fullName,
                windows_account.title,
            )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    # Retrieve user roles
    roles = await read_roles_by_account_id(maria_session, user.id)

    # Generate access and refresh tokens
    access_token = create_token(
        data={
            "userId": user.id,
            "username": user.username,
            "fullName": user.full_name,
            "email": f"{user.username}@andalusiagroup.net",
            "userTitle": user.title,
            "userRoles": roles,
            "type": "access",
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token = create_token(
        data={"userId": user.id, "type": "refresh"},
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )

    # Store the refresh token in the database or cache with association to the user
    # This step is essential for managing token revocation and validation

    return {
        "id": user.id,
        "username": user.username,
        "fullName": user.full_name,
        "title": user.title,
        "email": f"{user.username}@andalusiagroup.net",
        "roles": roles,
        "accessToken": access_token,
        "refreshToken": refresh_token,
    }


@router.post("/token/refresh", response_model=Token)
async def refresh_access_token(
    maria_session: SessionDep,
    refresh_data: Dict[str, str] = Body(...),
):
    refresh_token = refresh_data.get("refreshToken")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing refresh token",
        )

    try:
        # Verify refresh token signature and claims
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])

        # Validate token type
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )

        # Validate user ID exists
        user_id: int = payload.get("userId")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )

        # Retrieve user from database
        user = await read_user_by_id(maria_session, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Verify refresh token matches stored version
        if user.refresh_token != refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        # Get updated roles
        roles = await read_roles_by_account_id(maria_session, user.id)

        # Generate new tokens
        new_access_token = create_token(
            data={
                "userId": user.id,
                "username": user.username,
                "fullName": user.full_name,
                "email": f"{user.username}@andalusiagroup.net",
                "userTitle": user.title,
                "userRoles": roles,
                "type": "access",
            },
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        new_refresh_token = create_token(
            data={"userId": user.id, "type": "refresh"},
            expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        )

        # Update stored refresh token in database
        await update_refresh_token(maria_session, user.id, new_refresh_token)

        return {
            "accessToken": new_access_token,
            "refreshToken": new_refresh_token,
            "id": user.id,
            "username": user.username,
            "fullName": user.full_name,
            "title": user.title,
            "email": f"{user.username}@andalusiagroup.net",
            "roles": roles,
        }

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
