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
from pydantic import BaseModel
from collections import defaultdict
from types import SimpleNamespace

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")

# Logger setup
logger = logging.getLogger(__name__)


router = APIRouter()


class RequestItem(BaseModel):
    """
    Represents a single request item.

    Attributes:
        employee_id (int): The unique ID of the employee.
        employee_code (str): The employee's code.
        name (str): The name of the employee.
        department_id (int): The identifier for the department.
        meal_id (int): The identifier for the meal.
        meal_name (str): The name of the meal.
        notes (Optional[str]): Any additional notes.
    """

    employee_id: int
    employee_code: int
    name: str
    department_id: int
    meal_id: int
    meal_name: str
    notes: Optional[str] = None


class RequestPayload(BaseModel):
    """
    Represents the payload for the request endpoint.

    Attributes:
        requests (List[RequestItem]): A list of request items.
        request_time (Optional[datetime]): The time of the request in ISO format.
    """

    requests: List[RequestItem]
    request_time: Optional[datetime] = None
    notes: Optional[str] = None
    request_timing_option: Optional[str] = None


@router.post("/request")
async def create_request_endpoint(
    payload: RequestPayload,
    maria_session: SessionDep,
    background_tasks: BackgroundTasks,
    hris_session: HRISSessionDep,
    current_user: CurrentUserDep,
):
    """
    Create requests grouped by meal_id and process them in separate background tasks.

    Expects a JSON object with the following structure:
    {
        "requests": [ { ... }, ... ],
        "notes": "Optional notes",
        "request_timing_option": "request_now" | "schedule_request" | "save_for_later",
        "request_time": "ISO-formatted datetime string"
    }
    """
    if not payload.requests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No request lines provided",
        )
    ic(payload.request_timing_option)
    if payload.request_timing_option == "request_now":
        request_time = datetime.now(cairo_tz)
    elif payload.request_timing_option == "schedule_request":
        request_time = payload.request_time
    elif payload.request_timing_option == "save_for_later":
        request_time = None

    # Group requests by meal_id
    meal_groups = defaultdict(list)
    for req in payload.requests:
        # Convert each RequestBody to a dict if needed
        meal_groups[req.meal_id].append(req.model_dump())

    try:
        logger.info(f"Processing {len(meal_groups)} meal groups")

        # Process each meal group in a background task
        for meal_id, req_list in meal_groups.items():
            created_request = await crud.create_request(
                maria_session, current_user.id, meal_id, payload.notes, request_time
            )

        # Ensure attribute access for downstream code (if create_request returns a dict)
        if isinstance(created_request, dict):
            created_request = SimpleNamespace(**created_request)

        background_tasks.add_task(
            continue_processing_meal_request,
            maria_session=maria_session,
            hris_session=hris_session,
            request=created_request,
            request_lines=req_list,
            request_time=payload.request_time,
            request_timing_option=payload.request_timing_option,
        )

        return {
            "message": f"{len(payload.requests) * len(meal_groups)} Request(s) created successfully",
            "meal_groups": {
                meal_id: {"count": len(req_list)}
                for meal_id, req_list in meal_groups.items()
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
