# Standard Library Imports
import logging
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.sql.expression import case
from sqlmodel import select, func

# Project-Specific Imports
from db.models import Department, Request, RequestLine
from src.http_schema import ReportDashboardResponse


async def read_requests_data(
    session: AsyncSession, from_date: Optional[str], to_date: Optional[str]
) -> List[ReportDashboardResponse]:
    """
    Fetches the number of dinner and lunch requests grouped by department.
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

    # CASE expressions for dinner (id=1) and lunch (id=2)
    dinner_case = case((Request.id == 1, 1), else_=0)
    lunch_case = case((Request.id == 2, 1), else_=0)

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
        .where(RequestLine.is_accepted == True)
        .group_by(Department.id, Department.name)
    )

    if from_date and to_date:
        statement = statement.where(
            Request.created_time.between(from_date, to_date)
        )

    # Execute the query
    result = await session.execute(statement)
    rows = result.all()

    # Convert query rows to Pydantic models
    response_data: List[ReportDashboardResponse] = [
        ReportDashboardResponse(
            id=dept_id,
            department=dept_name,
            dinner_requests=(
                int(dinner_val)
                if isinstance(dinner_val, Decimal)
                else dinner_val
            ),
            lunch_requests=(
                int(lunch_val) if isinstance(lunch_val, Decimal) else lunch_val
            ),
        )
        for dept_id, dept_name, dinner_val, lunch_val in rows
    ]

    return response_data


# async def read_closed_accepted_requests_for_audit_page(
#     session: AsyncSession,
#     start_time: Optional[datetime] = None,
#     end_time: Optional[datetime] = None,
# ) -> List[AuditRecordRequest]:
#     stmt = (
#         select(
#             RequestLine.id,
#             Employee.code,
#             Employee.name.label("employee_name"),
#             Employee.title,
#             Department.name.label("department"),
#             Account.username.label("requester"),
#             Account.title.label("requester_title"),
#             Meal.name.label("meal"),
#             RequestLine.notes,
#             Request.request_time,
#         )
#         .join(Employee, RequestLine.employee_id == Employee.id)
#         .join(Department, RequestLine.department_id == Department.id)
#         .join(Request, RequestLine.request_id == Request.id)
#         .join(Account, Request.requester_id == Account.id)
#         .join(Meal, Request.id == Meal.id)
#         .where(RequestLine.is_accepted == True, Request.status_id == 2)
#     )

#     # Add date range filter if start_time and/or end_time are provided
#     if start_time and end_time:
#         stmt = stmt.where(
#             and_(
#                 Request.request_time >= start_time,
#                 Request.request_time <= end_time,
#             )
#         )
#     elif start_time:
#         stmt = stmt.where(Request.request_time >= start_time)
#     elif end_time:
#         stmt = stmt.where(Request.request_time <= end_time)

#     # Execute the query asynchronously
#     result = await session.execute(stmt)
#     records = result.fetchall()

#     # Convert to list of AuditRecordRequest
#     response = [AuditRecordRequest.model_validate(row) for row in records]
#     return response
