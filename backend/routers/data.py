import traceback
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from db.database import get_application_session
from db.models import Employee, Department, Meal
from icecream import ic

# Create API Router instance for our endpoints.
router = APIRouter()
logger = logging.getLogger(__name__)

# Dependency injection for the asynchronous session using FastAPI's Depends.
SessionDep = Annotated[AsyncSession, Depends(get_application_session)]


@router.get("/departments", response_model=List[Department])
async def read_departments_with_employees(session: SessionDep):
    """
    Retrieve a list of departments that have at least one associated employee.

    This endpoint performs a database query to select all department records
    where there exists one or more employee records. It uses a subquery to
    filter departments by checking if their IDs appear in the list of employee
    department IDs.

    :param session: An asynchronous session provided by FastAPI's dependency injection.
    :return: A list of Department objects with associated employees.
    :raises HTTPException: If an error occurs during query execution.
    """
    logger.debug("Entered read_departments_with_employees endpoint.")
    try:
        # Construct SQL query: select departments with IDs present in the set of employee.department_id.
        statement = select(Department).where(
            Department.id.in_(select(Employee.department_id).distinct())
        )

        # Execute the SQL statement asynchronously.
        result = await session.execute(statement)
        departments = result.scalars().all()

        logger.info(
            f"Successfully retrieved {len(departments)} departments with employees."
        )
        return departments

    except Exception as e:
        # Log the error along with its traceback for debugging.
        logger.error(f"Error retrieving departments: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        # Raise an HTTPException to indicate an internal server error.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while fetching departments.",
        )


@router.get("/employees", response_model=List[Employee])
async def read_employees(session: SessionDep):
    """
    Retrieve a list of all employees.

    This endpoint queries the database for all employee records. The returned list
    can later be used to display or process employee information, such as grouping by department.

    :param session: An asynchronous session provided by FastAPI's dependency injection.
    :return: A list of Employee objects.
    :raises HTTPException: If an error occurs during query execution.
    """
    logger.debug("Entered read_employees endpoint.")
    try:
        # Construct SQL query to select all employee records.
        statement = select(Employee)

        # Execute the query asynchronously.
        result = await session.execute(statement)
        employees = result.scalars().all()

        # Debug output using icecream for quick inspection.
        logger.info(f"Successfully retrieved {len(employees)} employees.")
        return employees

    except Exception as e:
        # Log error details along with a full traceback.
        logger.error(f"Error retrieving employees: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        # Raise an HTTPException with a 500 status code.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while fetching employees.",
        )


@router.get("/meal-types", response_model=List[Meal])
async def read_meals(session: SessionDep):
    """
    Retrieve a list of meal types.

    This endpoint fetches all meal records from the database, representing
    the available meal options. The data can be used for display purposes or further processing.

    :param session: An asynchronous session provided by FastAPI's dependency injection.
    :return: A list of Meal objects.
    :raises HTTPException: If an error occurs during query execution.
    """
    logger.debug("Entered read_meals endpoint.")
    try:
        # Construct SQL query to select all meal records.
        statement = select(Meal).where(Meal.is_active == True)

        # Execute the query asynchronously.
        result = await session.execute(statement)
        meals = result.scalars().all()

        logger.info(f"Successfully retrieved {len(meals)} meal types.")
        return meals

    except Exception as e:
        # Log the encountered error and its traceback for debugging purposes.
        logger.error(f"Error retrieving meals: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        # Raise an HTTPException indicating an internal server error.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while fetching meals.",
        )
