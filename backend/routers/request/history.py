from datetime import datetime
from fastapi import HTTPException, status, APIRouter
from typing import Optional
import traceback
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Query
from routers.cruds import request as crud
from routers.cruds.request_lines import (
    read_request_lines,
    update_request_lines,
)
from services.http_schema import RequestBody, RequestLineRespose
import pytz
from services.http_schema import UpdateRequestLinesPayload
from src.dependencies import HRISSessionDep, SessionDep, CurrentUserDep
from icecream import ic
from collections import defaultdict
from routers.utils.request import continue_processing_meal_request
from pydantic import BaseModel
from collections import defaultdict
from sqlmodel import select
from db.models import Request

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")

# Logger setup
logger = logging.getLogger(__name__)


router = APIRouter()


@router.get(
    "/history",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
async def get_histyro_requests(
    user: CurrentUserDep,
    maria_session: SessionDep,
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
):
    try:
        ic(user)
        return await crud.read_requests(
            session=maria_session,
            start_time=start_time,
            end_time=end_time,
            requester_id=user.id,
            page=page,
            page_size=page_size,
            download=download,
        )
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

@router.put("/history/delete/{request_id}")
async def delete_request(
    current_user: CurrentUserDep, session: SessionDep, request_id: int
):
    statement = select(Request).where(Request.id == request_id)
    results = await session.execute(statement)
    request = results.scalars().first()
    ic(request)
    request.is_deleted = True
    session.add(request)
    await session.commit()

    return {"message": "Request deleted successfully."}


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
