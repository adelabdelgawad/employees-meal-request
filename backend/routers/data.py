import datetime
import logging
import asyncio
from fastapi import APIRouter, HTTPException, status
from typing import List
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Employee, Department, Meal, MealSchedule
from src.dependencies import SessionDep
from services.http_schema import NewRequestDataResponse

router = APIRouter()
logger = logging.getLogger(__name__)


async def read_departments_with_employees(
    session: AsyncSession,
) -> List[Department]:
    """
    Retrieve a list of departments that have at least one associated employee.
    """
    try:
        # Create a subquery to get distinct department IDs from Employee
        subquery = select(Employee.department_id).distinct()
        statement = select(Department).where(Department.id.in_(subquery))
        result = await session.execute(statement)
        departments = result.scalars().all()
        logger.info(
            "Retrieved %d departments with employees.", len(departments)
        )
        return departments
    except Exception as e:
        logger.exception("Error retrieving departments: %s", e)
        return []


async def read_employees(session: AsyncSession) -> List[Employee]:
    """
    Retrieve a list of all employees.
    """
    try:
        statement = select(Employee)
        result = await session.execute(statement)
        employees = result.scalars().all()
        logger.info("Retrieved %d employees.", len(employees))
        return employees
    except Exception as e:
        logger.exception("Error retrieving employees: %s", e)
        return []


async def read_meals(session: AsyncSession) -> List[Meal]:
    try:
        current_time = datetime.datetime.now().time()
        statement = (
            select(Meal)
            .join(MealSchedule)
            .where(
                Meal.is_active == True,
                MealSchedule.schedule_from <= current_time,
                MealSchedule.schedule_to >= current_time,
            )
        )
        result = await session.execute(statement)
        meals = result.scalars().all()
        return meals
    except Exception as exc:
        logger.error("Error retrieving active meals", exc_info=True)
        raise HTTPException(
            status_code=500, detail="Error retrieving active meals"
        )


@router.get(
    "/new-request-data",
    response_model=NewRequestDataResponse,
    status_code=status.HTTP_200_OK,
)
async def read_new_request_data(session: SessionDep) -> NewRequestDataResponse:
    try:
        departments = await read_departments_with_employees(session)
        employees = await read_employees(session)  # Fixed typo here
        meals = await read_meals(session)
        response = NewRequestDataResponse(
            departments=departments, employees=employees, meals=meals
        )
        return response
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while fetching employees.",
        )
