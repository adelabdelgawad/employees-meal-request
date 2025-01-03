import traceback
import logging
from typing import List, Optional, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from db.models import MealRequest, MealRequestLine
from db.database import get_application_session
from hmis_db.database import get_hris_session
from db.crud import read_meal_requests, read_meal_request_line_for_requests_page

# Create API Router
router = APIRouter()
logger = logging.getLogger(__name__)

# Dependency Annotations
SessionDep = Annotated[Session, Depends(get_application_session)]
HRISSessionDep = Annotated[Session, Depends(get_hris_session)]


@router.get(
    "/requests", response_model=List[MealRequest], status_code=status.HTTP_200_OK
)
async def get_meal_requests(maria_db_session: SessionDep):
    """
    Retrieves a list of meal requests from the database.

    Args:
        maria_db_session (Session): Database session for the application.

    Returns:
        List[MealRequest]: A list of meal requests.
    """
    logger.info("Attempting to read meal requests")
    try:
        meal_requests = read_meal_requests(maria_db_session)
        if not meal_requests:
            logger.info("No meal requests found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No meal requests found.",
            )
        logger.info(f"Found {len(meal_requests)} meal requests")
        return meal_requests

    except HTTPException as http_exc:
        logger.error(f"HTTP error: {http_exc.detail}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        raise http_exc

    except Exception as err:
        logger.error(f"Unexpected error while reading meal requests: {err}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while reading meal requests.",
        )


@router.get(
    "/request-lines",
    response_model=List[MealRequestLine],
    status_code=status.HTTP_200_OK,
)
async def get_meal_request_line(
    maria_session: SessionDep,
    request_id: Optional[int] = None,
):
    """
    Retrieves meal request lines based on a request ID.

    Args:
        maria_session (Session): Database session for the application.
        request_id (Optional[int]): ID of the meal request to filter lines.

    Returns:
        List[MealRequestLine]: A list of meal request lines.
    """
    logger.info(f"Attempting to read meal request lines for request_id: {request_id}")
    try:
        lines = read_meal_request_line_for_requests_page(maria_session, request_id)
        if not lines:
            logger.info("No meal request lines found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No meal request lines found.",
            )
        logger.info(f"Found {len(lines)} meal request lines")
        return lines

    except HTTPException as http_exc:
        logger.error(f"HTTP error: {http_exc.detail}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        raise http_exc

    except Exception as err:
        logger.error(f"Unexpected error while reading meal request lines: {err}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while reading meal request lines.",
        )
