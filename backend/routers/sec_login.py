import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Annotated
from icecream import ic

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Response, Request, Depends, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlmodel import Session

from db.database import get_application_session
from db.models import Account
from src.custom_exceptions import AuthorizationError
from src.login import Login

# Load environment variables
load_dotenv()

# Logging
logger = logging.getLogger(__name__)

# Constants
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 20

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# API Router
router = APIRouter()

# Dependency for database session
SessionDep = Annotated[Session, Depends(get_application_session)]


class FormData(BaseModel):
    """
    Model for login form data.
    """
    username: str
    password: str


def create_jwt_token(payload: dict) -> str:
    """
    Generate a JWT token with the given payload.

    Args:
        payload (dict): Data to include in the JWT token.

    Returns:
        str: Encoded JWT token.
    """
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_jwt_token(token: str) -> dict:
    """
    Decode a JWT token and validate it.

    Args:
        token (str): JWT token to decode.

    Returns:
        dict: Decoded payload if valid.

    Raises:
        HTTPException: If the token is invalid or expired.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@router.post("/login")
async def login(form_data: FormData, hris_session: SessionDep, response: Response):
    try:
        logger.info(f"Processing login for user: {form_data.username}")

        account = Login(
            session=hris_session,
            username=form_data.username,
            password=form_data.password,
        )
        await account.authenticate()

        if not account.is_authenticated:
            logger.warning(
                f"Invalid credentials for user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        payload = {
            "userId": account.account.id,
            "roles": account.roles,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        }
        token = create_jwt_token(payload)

        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,  # Set to False for local development
            samesite="Lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

        logger.info(f"User {form_data.username} logged in successfully.")
        return {
            "userId": account.account.id,
            "roles": account.roles,
            "message": "Login successful",
        }

    except AuthorizationError as auth_error:
        logger.warning(
            f"Authorization error for user {form_data.username}: {auth_error}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(auth_error),
        )

    except Exception as e:
        logger.exception(
            f"Unexpected error during login for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login.",
        )


def verify_jwt(request: Request):
    """
    Verify the JWT token from the request cookie.

    Args:
        request (Request): The incoming HTTP request.

    Returns:
        dict: Decoded JWT payload.

    Raises:
        HTTPException: If token is missing or invalid.
    """
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return decode_jwt_token(token)
