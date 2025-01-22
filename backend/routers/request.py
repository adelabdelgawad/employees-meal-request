import logging
from typing import List, Optional, Dict
from fastapi import (
    APIRouter,
    HTTPException,
    status,
    BackgroundTasks,
)
from routers.cruds import request as crud
from routers.cruds.request_lines import (
    read_request_lines,
    update_request_lines,
)


from src.http_schema import (
    RequestBody,
    RequestPageRecordResponse,
    RequestLineRespose,
    UpdateRequestStatus,
)
import pytz

from depandancies import HRISSessionDep, SessionDep
from datetime import datetime

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")

# Logger setup
logger = logging.getLogger(__name__)

# API Router instance
router = APIRouter()


@router.post("/request")
async def create_request_endpoint(
    maria_session: SessionDep,  # type: ignore
    request_lines: List[RequestBody],
    background_tasks: BackgroundTasks,
    hris_session: HRISSessionDep,
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
    response_model=List[RequestPageRecordResponse],
    status_code=status.HTTP_200_OK,
)
async def get_requests(
    maria_session: SessionDep,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    request_id: Optional[int] = None,
):
    """
    read requests based on filters.
    """
    try:
        requests = await crud.read_requests(
            maria_session, request_id, from_date, to_date
        )
        return requests
    except Exception as e:
        logger.error(f"Error reading requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while reading requests.",
        )


@router.put("/update-request-status", response_model=Dict[str, str])
async def update_order_status_endpoint(
    request_id: int,
    status_id: int,
    maria_session: SessionDep,
):
    """
    Update the status of a request by its ID.
    """
    try:
        await crud.update_request_status(maria_session, request_id, status_id)
        return {"status": "success", "message": "Request updated successfully"}
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
    maria_session: SessionDep, changes: List[UpdateRequestStatus]
):
    """
    API endpoint to update the status of request lines.

    Args:
        maria_session (Session): Database session for the application.
        changes (List[UpdateRequestStatus]): List of changes to apply.

    Returns:
        dict: Confirmation message upon successful update.
    """
    if not changes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No changes provided.",
        )

    logger.info(f"Updating {len(changes)} request lines.")
    try:
        await update_request_lines(maria_session, changes)
        return {"message": "Request lines updated successfully"}
    except ValueError as ve:
        logger.error(f"Validation error: {ve}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Unexpected error while updating request lines: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while updating request lines.",
        )
