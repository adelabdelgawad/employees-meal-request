import os
from datetime import datetime, timedelta
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
from jose import jwt
from pydantic import BaseModel, ConfigDict
from typing import List, Optional

router = APIRouter()

# Configuration
SECRET_KEY = os.getenv("AUTH_SECRET", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # adjust as needed

###############################################################################
# Models
###############################################################################


class TokenPayload(BaseModel):
    """
    Model representing the token payload data to be encoded.
    """

    userId: int
    username: str
    fullName: str
    title: str
    email: str
    roles: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """
    Model for the login response containing the access token.
    """

    access_token: str
    token_type: str = "bearer"


###############################################################################
# Utility Functions
###############################################################################


def create_token(data: TokenPayload, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT token with the given data.

    Args:
        data (TokenPayload): The data to include in the token payload.
        expires_delta (Optional[timedelta]): Optional time delta until expiration.
            If provided, an "exp" claim will be added.

    Returns:
        str: The encoded JWT token.
    """
    to_encode = data.model_dump()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
        to_encode.update({"exp": expire})
        print("SECRET_KEY, ", SECRET_KEY)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def validate_user(
    session: SessionDep, username: str, password: str
) -> Optional[TokenPayload]:
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

    return TokenPayload(
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


@router.post("/login", response_model=TokenResponse)
async def login_for_access_token(
    maria_session: SessionDep, form_data: LoginRequest
) -> TokenResponse:
    """
    Authenticate the user and return a JWT access token.

    Args:
        maria_session (SessionDep): Database session dependency.
        form_data (LoginRequest): Login data containing username and password.

    Raises:
        HTTPException: If the credentials are invalid.

    Returns:
        TokenResponse: A response model containing the JWT access token.
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

    jwt_token = create_token(
        user_data, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return TokenResponse(access_token=jwt_token)
