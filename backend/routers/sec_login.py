from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from depandancies import SessionDep
from src.login import Login

router = APIRouter()

# Secret key to encode the JWT
SECRET_KEY = os.getenv("AUTH_SECRET", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Updated to 60 minutes

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
REFRESH_TOKEN_EXPIRE_DAYS = 7  # Refresh token validity


# Pydantic models
class User(BaseModel):
    userId: int
    username: str
    fullName: Optional[str] = None
    userTitle: Optional[str] = None
    email: str
    userRoles: list[str] = []


class UserInDB(User):
    hashed_password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str


class LoginRequest(BaseModel):
    username: str
    password: str


def create_refresh_token(
    data: dict, expires_delta: Optional[timedelta] = None
):
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
async def login_for_access_token(
    maria_session: SessionDep, form_data: LoginRequest
):
    """
    Handles the user login process. Authenticates the user and generates a JWT access token.

    Args:
        request (LoginRequest): Contains the username, password, and optional domain scope.
        session (AsyncSession): The database session provided by FastAPI's dependency injection.

    Returns:
        Dict[str, Any]: Dictionary containing the access token, token type, account details, and optional pages information.

    Raises:
        HTTPException: Raised when authentication fails or when an internal server error occurs.
    """
    # Authenticate the user
    user = Login(
        session=maria_session,
        username=form_data.username,
        password=form_data.password,
    )
    await user.authenticate()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    access_token = create_access_token(
        data={
            "userId": user.user_id,
            "username": user.username,
            "fullName": user.full_name,
            "userTitle": user.title,
            "userRoles": user.roles,
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token = create_refresh_token(
        data={"userId": user.user_id, "username": user.username}
    )

    return {"access_token": access_token, "refresh_token": refresh_token}


@router.post("/refresh", response_model=Token)
async def refresh_access_token(refresh_token: str):
    try:
        # Decode refresh token
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("userId")
        username = payload.get("username")

        if not user_id or not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        # Generate a new access token
        new_access_token = create_access_token(
            data={"userId": user_id, "username": username},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        return {
            "access_token": new_access_token,
            "refresh_token": refresh_token,
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
