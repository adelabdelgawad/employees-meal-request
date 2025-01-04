import traceback
import logging
from typing import List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import Session, select
from typing import Annotated
from collections import defaultdict

from db.database import get_application_session
from db.models import MealRequest, MealRequestLine
from hris_db.models import HRISEmployeeAttendanceWithDetails
from hris_db.database import get_hris_session
from src.http_schema import RequestBody

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
                (
                    a.date_in
                    for a in attendances
                    if a.employee_code == line.employee_id
                ),
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

            logger.info(
                f"Created meal request line for employee ID {line.employee_id}"
            )

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
                status_id=1,  # Assuming status ID `1` for a new request
                meal_type_id=meal_id,
                notes="Meal request created via API",
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
