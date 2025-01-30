from datetime import datetime, timedelta, timezone
from typing import Annotated
import os

import jwt
from fastapi import Depends, FastAPI, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Optional
import traceback
import logging
from typing import List, Optional, Dict
from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Query
from routers.cruds import request as crud
from routers.cruds.request_lines import (
    read_request_lines,
    update_request_lines,
)
from src.http_schema import (
    RequestBody,
    RequestLineRespose,
    UpdateRequestStatus,
)
import pytz
from src.http_schema import UpdateRequestLinesPayload
from depandancies import HRISSessionDep, SessionDep, CurrentUserDep
from datetime import datetime
from icecream import ic

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")

# Logger setup
logger = logging.getLogger(__name__)
# openssl rand -hex 32
SECRET_KEY = os.getenv("AUTH_SECRET", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: int | None = None


class User(BaseModel):
    userId: int
    username: str
    fullName: Optional[str] = None
    userTitle: Optional[str] = None
    email: str
    userRoles: list[str] = []


class UserInDB(User):
    hashed_password: str


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("userId")
        ic(user_id)
        print("Payload", payload)
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except InvalidTokenError:
        raise credentials_exception

    return token_data


@router.post("/request")
async def create_request_endpoint(
    maria_session: SessionDep,  # type: ignore
    request_lines: List[RequestBody],
    background_tasks: BackgroundTasks,
    hris_session: HRISSessionDep,
    current_user: Annotated[User, Depends(get_current_user)],
    request_time: Optional[datetime] = datetime.now(cairo_tz),
):
    """
    Create requests and process them in the background.
    """
    if not request_lines:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No request lines provided",
        )
    request_time = request_time if request_time else datetime.now(cairo_tz)

    try:
        logger.info(f"Received {len(request_lines)} request(s)")

        # Create requests and background task
        response_data = await crud.create_requests_with_background_task(
            request_lines,
            request_time,
            background_tasks,
            maria_session,
            hris_session,
        )

        return {
            "message": "Request created successfully",
            **response_data,
        }
    except Exception as e:
        logger.error(f"Error in create_request_endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get(
    "/requests",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
async def get_requests(
    maria_session: SessionDep,
    start_time: Optional[str] = Query(
        None, description="Start date (YYYY-MM-DD)"
    ),
    end_time: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(
        10, ge=1, le=100, description="Number of rows per page"
    ),
    query: str = Query(None, description="Search parameters"),
    download: bool = Query(False, description="Download status"),
):
    """
    Retrieves paginated request data with optional date filtering.

    :param maria_session: The async database session for MariaDB.
    :param from_date: Filter requests from this date (inclusive, format: 'YYYY-MM-DD').
    :param to_date: Filter requests up to this date (inclusive, format: 'YYYY-MM-DD').
    :param page: The current page number (1-based).
    :param page_size: The number of rows per page.
    :return: A dictionary containing paginated data and metadata.
    """
    try:
        requests = await crud.read_requests(
            session=maria_session,
            start_time=start_time,
            end_time=end_time,
            requester_id=query,
            page=page,
            page_size=page_size,
            download=download,
        )
        return requests
    except HTTPException as http_exc:
        logger.error(f"HTTP error occurred: {http_exc.detail}")
        raise http_exc
    except Exception as err:
        logger.error(f"Unexpected error: {err}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving request details.",
        )


@router.put("/update-request-status")
async def update_order_status_endpoint(
    request_id: int,
    status_id: int,
    maria_session: SessionDep,
):
    """
    Update the status of a request by its ID.
    """
    try:
        result = await crud.update_request_status(
            maria_session, request_id, status_id
        )
        return {
            "status": "success",
            "message": "Request updated successfully",
            "data": result,
        }
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Error updating request status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while updating request.",
        )


@router.get(
    "/request-lines",
    response_model=List[RequestLineRespose],
    status_code=status.HTTP_200_OK,
)
async def get_request_lines_endpoint(
    maria_session: SessionDep, request_id: int
) -> List[RequestLineRespose]:
    """
    API endpoint to retrieve request lines for a specific request ID.

    Args:
        maria_session (Session): Database session for the application.
        request_id (int): ID of the request to retrieve lines for.

    Returns:
        List[RequestLineRespose]: A list of request lines.
    """
    logger.info(f"reading request lines for request_id: {request_id}")
    try:
        lines = await read_request_lines(maria_session, request_id)
        if not lines:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No request lines found for request ID {request_id}.",
            )
        return lines
    except HTTPException as http_exc:
        logger.error(f"HTTP error: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        logger.error(f"Unexpected error while reading request lines: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while reading request lines.",
        )


@router.put("/update-request-lines", status_code=status.HTTP_200_OK)
async def update_request_lines_endpoint(
    maria_session: SessionDep,
    payload: UpdateRequestLinesPayload,
):
    """
    API endpoint to update the status of request lines.

    Args:
        maria_session (Session): Database session for the application.
        request_id (int): ID of the request to update.
        changed_statuses (List[dict]): List of changes to apply.

    Returns:
        dict: Confirmation message upon successful update.
    """
    try:
        request_id = payload.request_id
        changed_statuses = payload.changed_statuses

        logger.info(
            f"Updating {len(changed_statuses)} request lines for request_id {request_id}"
        )

        # Validate and transform the data if needed
        await update_request_lines(maria_session, changed_statuses)

        # Fetch the updated request details
        response = await crud.read_request_by_id(maria_session, request_id)
        return {
            "message": "Request lines updated successfully",
            "data": response,
        }

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Unexpected error while updating request lines: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while updating request lines.",
        )
