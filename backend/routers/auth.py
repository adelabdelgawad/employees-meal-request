from fastapi import APIRouter, HTTPException, status, Request
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from depandancies import SessionDep
from src.schema import LoginRequest, Token
from typing import List, Optional
from sqlmodel import select
from routers.utils.auth import (
    read_account_by_username,
    read_hirs_account_by_username,
    create_or_update_user,
    read_roles_by_account_id,
)
from src.active_directory import authenticate_and_get_user
from src.http_schema import DomainUser
from icecream import ic


router = APIRouter()

# Secret key to encode the JWT
SECRET_KEY = os.getenv("AUTH_SECRET", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Updated to 60 minutes

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
REFRESH_TOKEN_EXPIRE_DAYS = 7  # Refresh token validity


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/login", response_model=Token)
async def login_for_access_token(maria_session: SessionDep, form_data: LoginRequest):
    """
    Authenticates a user against Active Directory (LDAP) and returns an access token.

    Steps:
    1. Check if the username exists in either `Account` or `HRISSecurityUser` (local DB).
    2. If found, attempt LDAP authentication using `authenticate_and_get_user`.
    3. If LDAP authentication is successful:
       - Create or update the local user account.
       - Retrieve the user's roles.
       - Generate and return an access token & refresh token.
    4. If authentication fails, return `401 Unauthorized`.

    Args:
        maria_session (AsyncSession): SQLAlchemy AsyncSession for database operations.
        form_data (LoginRequest): The login request payload (username & password).

    Returns:
        Token: A dictionary containing `access_token` and `refresh_token`.
    """

    user = None  # Initialize user variable

    # Check if the user exists in the database (either in `Account` or `HRISSecurityUser`)
    account_exists = await read_account_by_username(maria_session, form_data.username)
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

    # If authentication fails, return `401 Unauthorized`
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    # Retrieve user roles
    roles = await read_roles_by_account_id(maria_session, user.id)

    # Generate JWT access and refresh tokens
    access_token = create_access_token(
        data={
            "userId": user.id,
            "username": user.username,
            "fullName": user.full_name,
            "email": f"{user.username}@andalusiagroup.net",
            "userTitle": user.title,
            "userRoles": roles,
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {
        "id": user.id,
        "username": user.username,
        "fullName": user.full_name,
        "title": user.title,
        "email": f"{user.username}@andalusiagroup.net",
        "roles": roles,
        "accessToken": access_token,
    }
