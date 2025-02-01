import traceback
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, Dict, List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from db.database import get_application_session
from db.models import Employee, Department, Meal

# Create API Router
router = APIRouter()
logger = logging.getLogger(__name__)

# Dependency for AsyncSession
SessionDep = Annotated[AsyncSession, Depends(get_application_session)]


@router.get("/departments", response_model=List[Department])
async def read_departments_with_employees(session: SessionDep):
    """
    Endpoint to fetch a list of departments that have at least one employee.
    """
    try:
        # Use a subquery or join to fetch only departments with employees
        statement = select(Department).where(
            Department.id.in_(select(Employee.department_id).distinct())
        )

        result = await session.execute(statement)
        departments = result.scalars().all()
        return departments

    except Exception as e:
        logger.error(f"Error retrieving departments: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while fetching departments.",
        )


@router.get("/employees", response_model=List[Employee])
async def read_employees(session: SessionDep):
    """
    Fetch a list of employees from the database grouped by department.

    :param session: AsyncSession connected to the application database.
    :return: Dictionary of employees grouped by department.
    """
    try:
        statement = select(Employee)

        result = await session.execute(statement)
        employees = result.scalars().all()
        return employees

    except Exception as e:
        logger.error(f"Error retrieving employees: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while fetching employees.",
        )


@router.get("/meal-types", response_model=List[Meal])
async def read_meals(session: SessionDep):
    """
    Fetch a list of meal from the database grouped by department.

    :param session: AsyncSession connected to the application database.
    :return: Dictionary of meal grouped by department.
    """
    try:
        statement = select(Meal)

        result = await session.execute(statement)
        meal = result.scalars().all()
        return meal

    except Exception as e:
        logger.error(f"Error retrieving meal: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while fetching meals.",
        )
