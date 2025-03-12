from datetime import datetime
from collections import defaultdict
from typing import List, Optional, Dict, Tuple

import pytz
import traceback
import logging

from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Query

from db.crud import read_account
from routers.cruds import request as crud
from routers.cruds.request_lines import (
    read_request_lines,
    update_request_lines,
)
from services.http_schema import (
    RequestLineRespose,
    RequestPayload,
    RequestsResponse,
    UpdateRequestLinesPayload,
    UpdateRequestStatusPayload,
)
from src.dependencies import HRISSessionDep, SessionDep, CurrentUserDep
from routers.utils.request import (
    create_request_lines_and_confirm,
    send_confirmation_notification,
)
from db.models import Request
from icecream import ic

# Default timezone for Cairo
cairo_tz = pytz.timezone("Africa/Cairo")

# Logger setup
logger = logging.getLogger(__name__)

router = APIRouter()

DATE_FORMAT = "%Y-%m-%d"


def parse_date_range(
    start_time: Optional[str], end_time: Optional[str]
) -> Tuple[Optional[datetime], Optional[datetime]]:
    """
    Parse the start and end time strings into datetime objects adjusted to
    the start and end of the day.

    :param start_time: Start date (format: 'MM/DD/YYYY, HH:MM:SS AM/PM')
    :param end_time: End date (format: 'MM/DD/YYYY, HH:MM:SS AM/PM')
    :return: Tuple of (start_dt, end_dt) or (None, None) if not provided.
    :raises ValueError: If the date strings cannot be parsed.
    """

    if start_time and end_time:
        try:
            start_dt = datetime.strptime(start_time, DATE_FORMAT).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            end_dt = datetime.strptime(end_time, DATE_FORMAT).replace(
                hour=23, minute=59, second=59, microsecond=0
            )
            return start_dt, end_dt
        except ValueError:
            raise ValueError(
                "Invalid date format. Expected 'MM/DD/YYYY, HH:MM:SS AM/PM'."
            )
    return None, None


def get_request_time_and_status(
    payload: RequestPayload,
) -> Tuple[Optional[datetime], int]:
    """
    Determine the request time and status id based on the payload's timing option.

    Returns:
        Tuple[Optional[datetime], int]: A tuple containing the request_time and status_id.
    """
    # Default: pending, and using current time (if needed)
    request_status_id: int = 1  # Pending
    request_time: Optional[datetime] = None

    if payload.request_timing_option == "schedule_request":
        if payload.request_time is not None:
            # If the datetime is naive, assume it is in Cairo time.
            if payload.request_time.tzinfo is None:
                request_time = payload.request_time.replace(tzinfo=cairo_tz)
            else:
                request_time = payload.request_time.astimezone(cairo_tz)
        request_status_id = 2  # Scheduled
    elif payload.request_timing_option == "save_for_later":
        request_time = None
    else:  # "request_now"
        request_time = None

    return request_time, request_status_id


def group_requests_by_meal(
    requests: List,
) -> Dict[int, List[Dict]]:
    """
    Group request lines by meal_id.

    Returns:
        Dict[int, List[Dict]]: A dictionary mapping meal_id to a list of request data.
    """
    meal_groups = defaultdict(list)
    for req in requests:
        meal_groups[req.meal_id].append(req.model_dump())
    return meal_groups


async def create_and_schedule_meal_group(
    meal_id: int,
    req_list: List[Dict],
    user: CurrentUserDep,
    payload: RequestPayload,
    request_time: Optional[datetime],
    request_status_id: int,
    session: SessionDep,
    background_tasks: BackgroundTasks,
    hris_session: HRISSessionDep,
) -> None:
    """
    Create a new Request for a specific meal group, commit it to the database,
    and schedule the background task for processing request lines.
    """
    if request_time:
        new_request = Request(
            requester_id=user.id,
            meal_id=meal_id,
            notes=payload.notes,
            status_id=request_status_id,
            request_time=request_time,
        )
    else:
        new_request = Request(
            requester_id=user.id,
            meal_id=meal_id,
            notes=payload.notes,
            status_id=request_status_id,
        )
    session.add(new_request)
    await session.commit()
    await session.refresh(new_request)
    background_tasks.add_task(
        create_request_lines_and_confirm,
        session=session,
        hris_session=hris_session,
        request=new_request,
        request_lines=req_list,
        request_status_id=request_status_id,
        requester=user.username,
    )


@router.post("/request")
async def create_request_endpoint(
    payload: RequestPayload,
    session: SessionDep,
    background_tasks: BackgroundTasks,
    hris_session: HRISSessionDep,
    user: CurrentUserDep,
):
    """
    Create requests grouped by meal_id and process them in separate background tasks.

    Expected JSON payload structure:
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

    # Determine the request time and status based on the payload.
    request_time, request_status_id = get_request_time_and_status(payload)

    # Group requests by meal_id.
    meal_groups = group_requests_by_meal(payload.requests)
    total_requests = sum(len(req_list) for req_list in meal_groups.values())

    try:
        logger.info(f"Processing {len(meal_groups)} meal group(s)")
        # Process each meal group in a background task.
        for meal_id, req_list in meal_groups.items():
            await create_and_schedule_meal_group(
                meal_id=meal_id,
                req_list=req_list,
                user=user,
                payload=payload,
                request_time=request_time,
                request_status_id=request_status_id,
                session=session,
                background_tasks=background_tasks,
                hris_session=hris_session,
            )

        return {
            "message": f"{total_requests} Request(s) created successfully",
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
        )


@router.get(
    "/requests",
    response_model=RequestsResponse,
    status_code=status.HTTP_200_OK,
)
async def get_requests(
    session: SessionDep,
    hris_session: HRISSessionDep,
    background_tasks: BackgroundTasks,
    user_id: int,
    is_admin: bool = Query(False, description="Admin status"),
    start_time: Optional[str] = Query(
        None, description="Start date (YYYY-MM-DD)"
    ),
    end_time: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(
        10, ge=1, le=100, description="Number of rows per page"
    ),
    query: Optional[str] = Query(None, description="Search parameters"),
    download: bool = Query(False, description="Download status"),
) -> RequestsResponse:
    """
    Retrieve a paginated list of requests with optional filtering.
    """

    try:
        if is_admin:
            user_id = None
        background_tasks.add_task(
            crud.prepare_scheduled_requests, session, hris_session
        )
        
        start_time, end_time = parse_date_range(start_time, end_time)

        requests = await crud.read_requests(
            session=session,
            requester_id=user_id,
            start_time=start_time,
            end_time=end_time,
            requester_name=query,
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
    payload: UpdateRequestStatusPayload,
    session: SessionDep,
    current_user: CurrentUserDep,
    background_tasks: BackgroundTasks,
):
    """
    Update the status of a request by its ID.
    """
    try:
        request_id: int = payload.request_id
        status_id: int = payload.status_id

        request = await crud.update_request_status(
            session, current_user.id, request_id, status_id
        )
        requester = await read_account(session, request.requester_id)
        """
        Email Sender
        """
        background_tasks.add_task(
            send_confirmation_notification,
            session=session,
            request=request,
            requester_name=requester.fullname,
        )

        return {
            "status": "success",
            "message": "Request updated successfully",
            "data": request,
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
    session: SessionDep, request_id: int
) -> List[RequestLineRespose]:
    """
    Retrieve request lines for a specific request ID.
    """
    logger.info(f"Reading request lines for request_id: {request_id}")
    try:
        lines = await read_request_lines(session, request_id)
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
    session: SessionDep,
    payload: UpdateRequestLinesPayload,
):
    """
    Update the status of request lines.
    """
    try:
        request_id = payload.request_id
        changed_statuses = payload.changed_statuses

        logger.info(
            f"Updating {len(changed_statuses)} request lines for request_id {request_id}"
        )

        # Validate and update the request lines
        await update_request_lines(session, changed_statuses)

        # Retrieve the updated request details
        response = await crud.read_request_by_id(session, request_id)
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
