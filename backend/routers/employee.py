import traceback
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Annotated, List, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from icecream import ic
from db.database import get_application_session
from db.models import Employee

# Create API Router
router = APIRouter()
logger = logging.getLogger(__name__)

# Dependency for AsyncSession
SessionDep = Annotated[AsyncSession, Depends(get_application_session)]


@router.get("/employees", response_model=List[Employee])
async def read_employees(
    session: SessionDep,
    departments: Optional[List[int]] = Query(
        None, description="List of department IDs to filter employees")
):
    """
    Endpoint to fetch a list of employees, optionally filtered by department IDs.
    """
    try:
        # Base query
        statement = select(Employee)

        # Apply department filter if provided
        if departments:
            statement = statement.where(
                Employee.department_id.in_(departments))
            ic(departments)

        # Execute the query
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
