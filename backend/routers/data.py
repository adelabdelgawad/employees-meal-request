import datetime
import logging
import asyncio
from fastapi import APIRouter, HTTPException, status
from typing import List
import icecream
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Employee, Department, Meal, MealSchedule
from src.dependencies import SessionDep
from services.http_schema import (
    DepartmentWithEmployees,
    NewRequestDataResponse,
)
from sqlalchemy.orm import selectinload

router = APIRouter()
logger = logging.getLogger(__name__)


async def read_departments_with_employees(
    session: AsyncSession,
) -> List[DepartmentWithEmployees]:
    """
    Retrieve all departments along with their employees and return a NewRequestDataResponse.

    Args:
        session (SessionDep): The database session dependency.

    Returns:
        NewRequestDataResponse: The response data containing a list of departments and their employees.
    """
    # Eager load employees for each department.
    statement = (
        select(Department)
        .join(Employee, Department.id == Employee.department_id)
        .distinct()
        .options(selectinload(Department.employees))
    )
    result = await session.execute(statement)
    departments = result.scalars().all()

    # Map each department to the response model. The field "department" is set to the department's name.
    dept_with_employees = [
        DepartmentWithEmployees(department=dept.name, employees=dept.employees)
        for dept in departments
    ]

    return dept_with_employees


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
        meals = await read_meals(session)
        response = NewRequestDataResponse(departments=departments, meals=meals)
        return response
    except Exception as ex:
        logger.error(
            "Error retrieving active Meal Request Data", exc_info=True
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while fetching employees.",
        )
