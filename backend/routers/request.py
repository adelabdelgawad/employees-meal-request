from datetime import datetime
from fastapi import HTTPException, status, APIRouter
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
from src.http_schema import RequestBody, RequestLineRespose
import pytz
from src.http_schema import UpdateRequestLinesPayload
from dependencies import HRISSessionDep, SessionDep, CurrentUserDep
from icecream import ic
from collections import defaultdict
from routers.utils.request import continue_processing_meal_request

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")

# Logger setup
logger = logging.getLogger(__name__)


router = APIRouter()


@router.post("/request")
async def create_request_endpoint(
    maria_session: SessionDep,
    request_lines: List[RequestBody],
    background_tasks: BackgroundTasks,
    hris_session: HRISSessionDep,
    current_user: CurrentUserDep,
    notes: Optional[str] = None,
):
    """
    Create requests grouped by meal_id and process them in separate background tasks
    """
    if not request_lines:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No request lines provided",
        )

    # Group requests by meal_id
    meal_groups = defaultdict(list)
    for request in request_lines:
        ic(request)
        meal_groups[request.meal_id].append(request.model_dump())

    try:
        logger.info(f"Processing {len(meal_groups)} meal groups")

        # Create a background task for each meal group
        for meal_id, request_lines in meal_groups.items():
            ic(request_lines)
            # Create a request in the database
            request = await crud.create_request(
                maria_session, current_user.id, meal_id, notes
            )

            background_tasks.add_task(
                continue_processing_meal_request,
                maria_session=maria_session,
                hris_session=hris_session,
                request=request,
                request_lines=request_lines,
            )

        return {
            "message": f"{len(request_lines)* len(meal_groups)} Request(s) created successfully",
            "meal_groups": {
                meal_id: {"count": len(requests)}
                for meal_id, requests in meal_groups.items()
            },
        }

    except Exception as e:
        logger.error(f"Error processing meal groups: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing meal groups",
        ) from e


@router.get(
    "/requests",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
async def get_requests(
    maria_session: SessionDep,
    start_time: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_time: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(10, ge=1, le=100, description="Number of rows per page"),
    query: str = Query(None, description="Search parameters"),
    download: bool = Query(False, description="Download status"),
):
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
    current_user: CurrentUserDep,
):
    """
    Update the status of a request by its ID.
    """
    try:
        result = await crud.update_request_status(
            maria_session, current_user.id, request_id, status_id
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
        ic(lines)
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
