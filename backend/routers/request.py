import traceback
import logging
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
from collections import defaultdict

from db.database import get_application_session
from db.models import (
    MealRequest,
    MealRequestLine,
    Account,
    MealType,
    MealRequestStatus,
)
from hris_db.models import HRISEmployeeAttendanceWithDetails
from hris_db.database import get_hris_session
from db.cruds import request as crud
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


async def fetch_recent_attendances(
    hris_session: HRISSessionDep,
) -> List[HRISEmployeeAttendanceWithDetails]:
    """
    Fetch employee attendances within the last 3 days.
    """
    try:
        three_days_ago = datetime.now() - timedelta(days=3)
        query = select(HRISEmployeeAttendanceWithDetails).where(
            HRISEmployeeAttendanceWithDetails.date_in >= three_days_ago
        )
        result = await hris_session.execute(query)
        attendances = result.scalars().all()
        logger.info(f"Fetched {len(attendances)} recent attendances")
        return attendances
    except Exception as e:
        logger.error(f"Error fetching recent attendances: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return []


async def process_meal_requests_for_employees(
    request_lines: List[MealRequestLine],
    meal_request_id: int,
    maria_session: SessionDep,
    hris_session: HRISSessionDep,
) -> List[MealRequestLine]:
    """
    Process meal requests for employees, linking them to recent attendances.
    """
    try:
        created_request_lines = []
        attendances = await fetch_recent_attendances(hris_session)

        for line in request_lines:
            attendance = next(
                (a.date_in for a in attendances if a.employee_code == line.employee_id),
                None,
            )

            meal_request_line = MealRequestLine(
                employee_id=line.employee_id,
                department_id=line.department_id,
                attendance=attendance,
                meal_request_id=meal_request_id,
            )
            maria_session.add(meal_request_line)
            created_request_lines.append(meal_request_line)

            logger.info(f"Created meal request line for employee ID {line.employee_id}")

        await maria_session.commit()
        return created_request_lines

    except Exception as e:
        logger.error(f"Error processing meal requests for employees: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return []


@router.post("/submit-request")
async def create_meal_request_endpoint(
    requests: List[RequestBody],
    background_tasks: BackgroundTasks,
    maria_session: SessionDep,
    hris_session: HRISSessionDep,
):
    """
    Endpoint to create a meal request and process its lines in the background.

    Args:
        requests (List[RequestData]): List of meal request data.
        background_tasks (BackgroundTasks): Background tasks manager.
        maria_session (SessionDep): Application database session.
        hris_session (HRISSessionDep): HRIS database session.

    Returns:
        dict: Success message and meal request IDs.
    """
    try:
        logger.info(f"Received {len(requests)} request(s)")

        if not requests:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No requests provided",
            )

        # Group requests by meal_id
        requests_by_meal_id = defaultdict(list)
        for request_data in requests:
            requests_by_meal_id[request_data.meal_id].append(request_data)

        created_meal_request_ids = []

        # Process each meal_id group
        for meal_id, grouped_requests in requests_by_meal_id.items():
            # Step 1: Create the main meal request
            new_meal_request = MealRequest(
                requester_id=1,
                meal_type_id=meal_id,
                notes="",
            )
            maria_session.add(new_meal_request)
            await maria_session.commit()

            logger.info(f"Created meal request with ID: {new_meal_request.id}")
            created_meal_request_ids.append(new_meal_request.id)

            # Step 2: Create meal request lines
            meal_request_lines = [
                MealRequestLine(
                    employee_id=req.id,
                    department_id=req.department_id,
                    meal_request_id=new_meal_request.id,
                    notes=req.notes,
                )
                for req in grouped_requests
            ]
            maria_session.add_all(meal_request_lines)
            await maria_session.commit()

            # Step 3: Add background task to process meal request lines
            background_tasks.add_task(
                process_meal_requests_for_employees,
                request_lines=meal_request_lines,
                meal_request_id=new_meal_request.id,
                maria_session=maria_session,
                hris_session=hris_session,
            )

        return {
            "message": "Meal requests created successfully",
            "total_requests": len(requests),
            "created_meal_request_ids": created_meal_request_ids,
        }

    except Exception as e:
        logger.error(f"Error in create_meal_request_endpoint: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get(
    "/requests",
    response_model=List[RequestPageRecordResponse],
    status_code=status.HTTP_200_OK,
)
async def get_meal_requests(
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

        requests = await crud.read_meal_request_for_request_page(
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
async def update_meal_order_status_endpoint(
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
        logger.info(f"Updating meal order {request_id} with status {status_id}")

        # Fetch the meal request
        statement = select(MealRequest).where(MealRequest.id == request_id)
        result = await maria_session.execute(statement)
        meal_request = result.scalar_one_or_none()

        if not meal_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meal request with ID {request_id} not found.",
            )

        # Update the status
        meal_request.status_id = status_id
        meal_request.closed_time = datetime.now(cairo_tz)
        maria_session.add(meal_request)

        await maria_session.commit()
        await maria_session.refresh(meal_request)

        if status_id == 4:
            await update_mealrequest_line(maria_session, request_id)

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
