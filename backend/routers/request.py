import traceback
import logging
from itertools import groupby
from operator import attrgetter
from typing import List, Optional, Annotated
from datetime import datetime, timedelta
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    BackgroundTasks,
)
from sqlmodel import Session, select, func, case
from typing import Annotated, Dict
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_application_session
from db.models import RequestLine, Request, Employee
from hris_db.models import HRISEmployeeAttendanceWithDetails
from hris_db.database import get_hris_session
from routers.cruds import request as crud
from src.http_schema import RequestBody, RequestPageRecordResponse
import pytz

from icecream import ic

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")

# Create API Router
router = APIRouter()
logger = logging.getLogger(__name__)

SessionDep = Annotated[Session, Depends(get_application_session)]
HRISSessionDep = Annotated[Session, Depends(get_hris_session)]


def group_requests_by_meal_id(request_lines: List) -> List:
    """
    Group request lines by meal_id.
    """
    request_lines.sort(key=attrgetter("meal_id"))
    return groupby(request_lines, key=attrgetter("meal_id"))


async def fetch_recent_attendances(
    hris_session: AsyncSession,
    employee_codes: List[int],
) -> List[HRISEmployeeAttendanceWithDetails]:
    """
    Fetch employee attendances within the last 3 days for the specified employee codes.

    Args:
        hris_session: The session to interact with the database.
        employee_codes: A list of employee codes to filter by.

    Returns:
        A list of HRISEmployeeAttendanceWithDetails objects matching the criteria.
    """
    try:
        three_days_ago = datetime.now() - timedelta(days=3)
        query = (
            select(HRISEmployeeAttendanceWithDetails)
            .where(HRISEmployeeAttendanceWithDetails.date_in >= three_days_ago)
            .where(
                HRISEmployeeAttendanceWithDetails.employee_code.in_(
                    employee_codes
                )
            )  # Use `in_` for multiple codes
        )
        result = await hris_session.execute(query)
        attendances = result.scalars().all()
        logger.info(
            f"Fetched {len(attendances)} recent attendances for employee codes {employee_codes}"
        )
        return attendances
    except Exception as e:
        logger.error(f"Error fetching recent attendances: {e}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        return []


async def update_request_lines(
    request_lines: List[RequestLine],
    maria_session: AsyncSession,
    hris_session: AsyncSession,
) -> List[RequestLine]:
    """
    Update existing request lines with the corresponding attendance details.

    Args:
        request_lines (List[RequestLine]): List of existing request lines to update.
        maria_session (AsyncSession): Database session for MariaDB operations.
        hris_session (AsyncSession): Session for interacting with HRIS data.

    Returns:
        List[RequestLine]: Updated request lines with attendance details.
    """
    try:
        # Extract unique employee codes from request lines
        employee_codes = [line.employee_code for line in request_lines]

        # Fetch attendances for these employee codes within the last 3 days
        recent_attendances = await fetch_recent_attendances(
            hris_session, employee_codes
        )

        # Update request lines with attendance details
        updated_request_lines = []
        for line in request_lines:
            # Ensure consistent types for comparison
            line_employee_code_str = str(line.employee_code)

            # Find attendance details for the current employee code
            attendance = [
                attendance.date_in
                for attendance in recent_attendances
                if attendance.employee_code == line_employee_code_str
            ]

            if attendance:
                # Update the attendance field for the existing request line
                line.attendance = attendance[0]
                updated_request_lines.append(line)

            # Commit the changes in a single transaction
            maria_session.add(line)
        await maria_session.commit()

        logger.info(
            f"Updated {len(updated_request_lines)} request lines with attendance details."
        )
        return updated_request_lines
    except Exception as e:
        logger.error(f"Error updating request lines: {e}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        # Rollback in case of any failure
        await maria_session.rollback()
        return []


@router.post("/request")
async def create_request_endpoint(
    request_lines: List[RequestBody],
    background_tasks: BackgroundTasks,
    maria_session: SessionDep,
    hris_session: HRISSessionDep,
):
    """
    Endpoint to create meal requests grouped by meal_id and process each group in the background.
    """
    try:
        logger.info(f"Received {len(request_lines)} request(s)")

        if not request_lines:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No request lines provided",
            )

        # Step 1: Group request lines by meal_id
        grouped_lines = group_requests_by_meal_id(request_lines)

        # Variables to track created request and line IDs
        created_request_ids = []
        created_lines: List[RequestLine] = []

        # Step 2: Process each group of meal_id separately
        for meal_id, lines in grouped_lines:
            lines_list = list(lines)
            result = await crud.create_meal_request_lines(
                meal_id, lines_list, maria_session
            )

            # Collect IDs
            created_request_ids.append(meal_id)
            created_lines.extend(result)

        # Step 3: Add background task to process meal request lines
        background_tasks.add_task(
            update_request_lines,
            request_lines=created_lines,
            maria_session=maria_session,
            hris_session=hris_session,
        )

        # Step 4: Return the response
        return {
            "message": "Request created successfully",
            "total_requests": len(created_request_ids),
            "created_request_ids": created_request_ids,
            "created_lines_ids": [line.id for line in created_lines],
        }

    except Exception as e:
        logger.error(f"Error in create_request_endpoint: {e}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
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
    try:
        # Convert date strings to datetime objects
        if from_date:
            from_date = datetime.strptime(from_date, "%Y-%m-%d").replace(
                hour=0, minute=0, second=0
            )
        if to_date:
            to_date = datetime.strptime(to_date, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59
            )

        requests = await crud.read_request_for_request_page(
            maria_session, request_id, from_date, to_date
        )

        return requests
    except Exception as err:
        logger.error(f"Unexpected error while reading meal requests: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while reading meal requests.",
        )


@router.put("/update-request-status", response_model=Dict[str, str])
async def update_order_status_endpoint(
    request_id: int,
    status_id: int,
    maria_session: SessionDep,
) -> Dict[str, str]:
    """
    Update the status of a meal request by ID.

    Args:
        request_id (int): The ID of the meal request to update.
        status_id (int): The new status ID to assign to the meal request.
        maria_session (AsyncSession): Async SQLModel session.

    Returns:
        dict: A success message with the HTTP status code.
    """
    try:
        logger.info(
            f"Updating meal order {request_id} with status {status_id}"
        )

        # Fetch the meal request
        statement = select(Request).where(Request.id == request_id)
        result = await maria_session.execute(statement)
        request = result.scalar_one_or_none()

        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meal request with ID {request_id} not found.",
            )

        # Update the status
        request.status_id = status_id
        request.closed_time = datetime.now(cairo_tz)
        maria_session.add(request)

        await maria_session.commit()
        await maria_session.refresh(request)

        if status_id == 4:
            await crud.update_Request_line(maria_session, request_id)

        logger.info("Successfully updated meal request.")
        return {"status": "success", "message": "Request updated successfully"}

    except HTTPException as http_exc:
        logger.error(f"HTTP error: {http_exc.detail}")
        raise http_exc

    except Exception as err:
        logger.error(f"Unexpected error while updating meal request: {err}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while updating meal request.",
        )
