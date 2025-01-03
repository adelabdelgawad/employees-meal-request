import traceback
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from db.database import get_application_session
from db.models import Department, Employee

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
        statement = (
            select(Department)
            .where(
                Department.id.in_(
                    select(Employee.department_id).distinct()
                )
            )
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
