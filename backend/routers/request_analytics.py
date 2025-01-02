import traceback
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from typing import List, Annotated

from db.application.database import get_application_session
from db.application.models import MealRequest, MealRequestLine, Department

# Create API Router
router = APIRouter()
logger = logging.getLogger(__name__)

SessionDep = Annotated[Session, Depends(get_application_session)]


@router.get("/request-analysis", response_model=List[dict])
async def get_requests_data(
    start_time: datetime,
    end_time: datetime,
    session: SessionDep,
):
    """
    Retrieve analysis of meal requests grouped by department.

    Args:
        start_time (datetime): The start time of the analysis period.
        end_time (datetime): The end time of the analysis period.
        session (SessionDep): The database session dependency.

    Returns:
        List[dict]: A list of dictionaries containing department names and their respective request counts.
    """
    try:
        statement = (
            select(
                Department.name.label("department_name"),
                func.count(MealRequestLine.id).label("accepted_requests"),
            )
            .join(MealRequestLine, Department.meal_request_lines)
            .join(MealRequest, MealRequestLine.meal_request)
            .where(
                MealRequestLine.is_accepted == True,
                MealRequest.request_time.between(start_time, end_time),
                MealRequest.closed_time.isnot(None),
            )
            .group_by(Department.name)
        )

        records = session.exec(statement).all()

        result = [
            {"department_name": record[0], "accepted_requests": record[1]}
            for record in records
        ]

        return result

    except HTTPException as http_exc:
        logger.error(f"HTTP error occurred: {http_exc.detail}")
        raise http_exc

    except Exception as err:
        logger.error(f"Unexpected error: {err}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving meal request analysis.",
        )
