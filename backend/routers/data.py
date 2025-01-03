import traceback
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, Dict, List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from collections import defaultdict

from db.database import get_application_session
from db.models import Employee, Department

# Create API Router
router = APIRouter()
logger = logging.getLogger(__name__)

# Dependency for AsyncSession
SessionDep = Annotated[AsyncSession, Depends(get_application_session)]


@router.get("/employees", response_model=Dict[str, List[dict]])
async def read_employees(session: SessionDep):
    """
    Fetch a list of employees from the database grouped by department.

    :param session: AsyncSession connected to the application database.
    :return: Dictionary of employees grouped by department.
    """
    try:
        statement = (
            select(
                Employee.id,
                Employee.code,
                Employee.name,
                Employee.title,
                Department.id.label("department_id"),
                Department.name.label("department_name"),
            )
            .join(Department, Employee.department)
            .where(Employee.is_active == True)
        )

        result = await session.execute(statement)
        records = result.fetchall()

        if not records:
            return {}

        # Group employees by department
        department_employees = defaultdict(list)
        for record in records:
            department_employees[record.department_name].append(
                {
                    "id": record.id,
                    "code": record.code,
                    "name": record.name,
                    "title": record.title,
                    "department_id": record.department_id,
                }
            )

        return department_employees

    except Exception as e:
        logger.error(f"Error retrieving employees: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while fetching employees.",
        )
