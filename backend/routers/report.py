import traceback
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from sqlalchemy.sql.expression import case
from decimal import Decimal
from datetime import datetime

from db.models import MealRequestLine, Department, MealRequest
from db.database import get_application_session
from src.http_schema import ReportDashboardResponse

from icecream import ic

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/dashboard-records",
    response_model=List[ReportDashboardResponse],
    status_code=status.HTTP_200_OK,
)
async def get_meal_requests(
    maria_session: Session = Depends(get_application_session),
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
):
    """
    Returns the number of dinner and lunch requests grouped by department.
    - Dinner is mapped to meal_type_id == 1
    - Lunch  is mapped to meal_type_id == 2
    """
    try:
        print("get_meal_requests")
        # Convert date strings to datetime objects
        if from_date:
            ic(from_date)
            from_date = datetime.strptime(from_date, "%Y-%m-%d").replace(
                hour=0, minute=0, second=0
            )
        if to_date:
            to_date = datetime.strptime(to_date, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59
            )

        # CASE expressions for dinner (meal_type_id=1) and lunch (meal_type_id=2)
        dinner_case = case((MealRequest.meal_type_id == 1, 1), else_=0)
        lunch_case = case((MealRequest.meal_type_id == 2, 1), else_=0)

        # Build the query
        statement = (
            select(
                Department.id,
                Department.name,
                func.sum(dinner_case).label("dinner_requests"),
                func.sum(lunch_case).label("lunch_requests"),
            )
            .join(MealRequestLine, MealRequestLine.department_id == Department.id)
            .join(MealRequest, MealRequest.id == MealRequestLine.meal_request_id)
            .where(MealRequestLine.is_accepted == True)
            .group_by(Department.id, Department.name)
        ).where(MealRequestLine.is_accepted == True)
        if from_date and to_date:
            statement = statement.where(
                MealRequest.created_time.between(from_date, to_date)
            )

        # Execute the query and fetch results
        result = await maria_session.execute(statement)
        rows = result.all()

        # Convert query rows to Pydantic models
        response_data: List[ReportDashboardResponse] = []
        for dept_id, dept_name, dinner_val, lunch_val in rows:
            # Convert Decimal to int if needed
            dinner_requests = (
                int(dinner_val) if isinstance(dinner_val, Decimal) else dinner_val
            )
            lunch_requests = (
                int(lunch_val) if isinstance(lunch_val, Decimal) else lunch_val
            )

            response_data.append(
                ReportDashboardResponse(
                    id=dept_id,
                    department=dept_name,
                    dinner_requests=dinner_requests,
                    lunch_requests=lunch_requests,
                )
            )

        return response_data

    except Exception as err:
        logger.error(f"Unexpected error while reading meal requests: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while reading meal requests.",
        )
