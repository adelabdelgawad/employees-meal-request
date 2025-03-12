# Standard Library Imports
from datetime import datetime
from typing import List, Optional
import icecream
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func, case
from sqlalchemy import func

# Project-Specific Imports
from db.models import Department, Request, RequestLine, Employee, Account, Meal
from services.http_schema import ReportDashboardResponse, ReportDetailsResponse


async def read_requests_data(
    session: AsyncSession, from_date: Optional[str], to_date: Optional[str]
) -> List[ReportDashboardResponse]:
    """
    Fetches the number of dinner and lunch requests grouped by department.

    Args:
        session (AsyncSession): The database session.
        from_date (Optional[str]): Start date filter (inclusive).
        to_date (Optional[str]): End date filter (inclusive).

    Returns:
        List[ReportDashboardResponse]: Aggregated data for dinner and lunch requests.
    """
    # Convert date strings to datetime objects
    if from_date:
        from_date = datetime.strptime(from_date, "%Y-%m-%d").replace(
            hour=0, minute=0, second=0
        )
    if to_date:
        to_date = datetime.strptime(to_date, "%Y-%m-%d").replace(
            hour=23, minute=59, second=59
        )

    # CASE expressions for dinner (meal_id=1) and lunch (meal_id=2)
    dinner_case = case((Request.meal_id == 1, 1), else_=0)
    lunch_case = case((Request.meal_id == 2, 1), else_=0)

    # Build the query
    statement = (
        select(
            Department.id,
            Department.name,
            func.sum(dinner_case).label("dinner_requests"),
            func.sum(lunch_case).label("lunch_requests"),
        )
        .join(RequestLine, RequestLine.department_id == Department.id)
        .join(Request, Request.id == RequestLine.request_id)
        .where(RequestLine.is_accepted == True)  # Only accepted request lines
    )

    # Apply date filters if provided
    if from_date and to_date:
        statement = statement.where(
            Request.created_time.between(from_date, to_date)
        )

    # Group by department
    statement = statement.group_by(Department.id, Department.name)

    # Execute the query
    result = await session.execute(statement)
    rows = result.all()

    # Convert query rows to Pydantic models
    response_data: List[ReportDashboardResponse] = [
        ReportDashboardResponse(
            id=dept_id,
            department=dept_name,
            dinner_requests=int(dinner_val or 0),  # Convert Decimal to int
            lunch_requests=int(lunch_val or 0),  # Convert Decimal to int
        )
        for dept_id, dept_name, dinner_val, lunch_val in rows
    ]

    return response_data
