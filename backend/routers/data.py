import logging
import asyncio
from fastapi import APIRouter, HTTPException, status
from typing import List
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Employee, Department, Meal
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
    """
    Retrieve a list of active meal types.
    """
    try:
        statement = select(Meal).where(Meal.is_active)
        result = await session.execute(statement)
        meals = result.scalars().all()
        logger.info("Retrieved %d active meal types.", len(meals))
        return meals
    except Exception as e:
        logger.exception("Error retrieving meals: %s", e)
        return []


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
