import traceback
import logging
from typing import List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import Session, select
from typing import Annotated

from db.database import get_application_session
from db.models import MealRequest, MealRequestLine
from hmis_db.models import HRISEmployeeAttendanceWithDetails
from hmis_db.database import get_hris_session

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

    Args:
        hris_session (HRISSessionDep): HRIS database session.

    Returns:
        List[HRISEmployeeAttendanceWithDetails]: A list of recent employee attendance records.
    """
    try:
        three_days_ago = datetime.now() - timedelta(days=3)
        query = select(HRISEmployeeAttendanceWithDetails).where(
            HRISEmployeeAttendanceWithDetails.date_in >= three_days_ago
        )
        attendances = hris_session.exec(query).all()
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

    Args:
        request_lines (List[MealRequestLine]): List of meal request lines to process.
        meal_request_id (int): ID of the associated meal request.
        maria_session (SessionDep): Application database session.
        hris_session (HRISSessionDep): HRIS database session.

    Returns:
        List[MealRequestLine]: List of created meal request lines.
    """
    try:
        created_request_lines = []
        attendances = await fetch_recent_attendances(hris_session)

        for line in request_lines:
            # Match employee attendance or use None
            attendance = next(
                (a.date_in for a in attendances if a.employee_code == line.employee_id),
                None,
            )

            # Build and create meal request line
            meal_request_line = MealRequestLine(
                employee_id=line.employee_id,
                department_id=line.department_id,
                attendance=attendance,
                meal_request_id=meal_request_id,
            )
            maria_session.add(meal_request_line)
            maria_session.commit()
            created_request_lines.append(meal_request_line)

            logger.info(f"Created meal request line for employee ID {line.employee_id}")

        return created_request_lines

    except Exception as e:
        logger.error(f"Error processing meal requests for employees: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return []


@router.post("/create-meal-request")
async def create_meal_request_endpoint(
    requester_id: int,
    meal_type_id: int,
    request_lines: List[MealRequestLine],
    background_tasks: BackgroundTasks,
    maria_session: SessionDep,
    hris_session: HRISSessionDep,
):
    """
    Endpoint to create a meal request and process its lines in the background.

    Args:
        requester_id (int): ID of the requester.
        meal_type_id (int): ID of the meal type.
        request_lines (List[MealRequestLine]): List of meal request lines.
        background_tasks (BackgroundTasks): Background tasks manager.
        maria_session (SessionDep): Application database session.
        hris_session (HRISSessionDep): HRIS database session.

    Returns:
        dict: Success message and meal request ID.
    """
    try:
        logger.info(
            f"Creating new meal request: Requester {requester_id} | "
            f"Request Lines: {len(request_lines)}"
        )

        # Step 1: Create the main meal request
        new_meal_request = MealRequest(
            requester_id=requester_id,
            status_id=1,  # Assuming status ID `1` for a new request
            meal_type_id=meal_type_id,
            notes="Meal request created via API",
        )
        maria_session.add(new_meal_request)
        maria_session.commit()

        # Step 2: Add background task to process meal request lines
        background_tasks.add_task(
            process_meal_requests_for_employees,
            request_lines=request_lines,
            meal_request_id=new_meal_request.id,
            maria_session=maria_session,
            hris_session=hris_session,
        )

        return {
            "message": "Meal request created successfully",
            "meal_request_id": new_meal_request.id,
        }

    except Exception as e:
        logger.error(f"Error in create_meal_request_endpoint: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
