from datetime import datetime
from typing import Optional, Tuple

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

# Import models from both databases
from db.models import RequestLine, Employee, Department, Request, Account, Meal
from services.http_schema import ReportDetailsResponse
import logging

logger = logging.getLogger(__name__)


def apply_common_filters(
    query,
    start_dt: Optional[datetime],
    end_dt: Optional[datetime],
    employee_name: Optional[str],
):
    """
    Applies common filtering criteria to a SQLAlchemy query.

    :param query: The base SQLAlchemy query.
    :param start_dt: Parsed start datetime.
    :param end_dt: Parsed end datetime.
    :param employee_name: Partial employee name for case-insensitive search.
    :return: The query with filters applied.
    """
    query = query.where(Request.status_id == 3)
    query = query.where(RequestLine.is_accepted == True)

    if start_dt and end_dt:
        query = query.where(Request.request_time.between(start_dt, end_dt))
    if employee_name:
        query = query.where(Employee.name.ilike(f"%{employee_name}%"))
    return query


def build_joined_query(query):
    """
    Applies the standard joins used for both the count and data queries.

    :param query: The initial SQLAlchemy query.
    :return: The query with all required joins.
    """
    return (
        query.join(Employee, RequestLine.employee_id == Employee.id)
        .join(Department, Employee.department_id == Department.id)
        .join(Request, RequestLine.request_id == Request.id)
        .join(Account, Request.requester_id == Account.id)
        .join(Meal, RequestLine.meal_id == Meal.id)
    )


async def read_request_lines(
    session: AsyncSession,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    employee_name: Optional[str] = None,
):
    stmt = select(RequestLine).where(RequestLine.is_accepted == True)
    if start_time and end_time:
        stmt = stmt.where(Request.request_time.between(start_time, end_time))
    if employee_name:
        stmt = stmt.where(Employee.name.ilike(f"%{employee_name}%"))
    rows = await session.execute(stmt)

    result = rows.scalars().all()
    return result


async def read_request_lines_with_attendance(
    session: AsyncSession,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    employee_name: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    download: Optional[bool] = False,
) -> dict:
    """
    Retrieves paginated request data with optional filters.

    :param session: The async database session for MariaDB.
    :param start_time: Start date for filtering data (format: 'MM/DD/YYYY, HH:MM:SS AM/PM').
    :param end_time: End date for filtering data (format: 'MM/DD/YYYY, HH:MM:SS AM/PM').
    :param employee_name: Filter by employee name (case-insensitive, partial match).
    :param page: The current page number (1-based).
    :param page_size: Number of rows per page.
    :param download: If True, pagination is not applied.
    :return: A dictionary containing paginated data and metadata.
    """
    # Parse dates (if provided)

    # Calculate offset for pagination
    offset = (page - 1) * page_size

    # Build count query
    count_query = select(func.count()).select_from(RequestLine)
    count_query = build_joined_query(count_query)
    count_query = apply_common_filters(
        count_query, start_time, end_time, employee_name
    )

    total_rows_result = await session.execute(count_query)
    total_rows = total_rows_result.scalar() or 0
    total_pages = (total_rows + page_size - 1) // page_size

    # Build data query
    data_query = select(
        RequestLine.id,
        Employee.code.label("employee_code"),
        Employee.name.label("employee_name"),
        Employee.title.label("employee_title"),
        Department.name.label("department"),
        Account.username.label("requester_name"),
        Account.title.label("requester_title"),
        Request.request_time,
        Meal.name.label("meal"),
        RequestLine.attendance_in,
        RequestLine.attendance_out,
        RequestLine.shift_hours,
        RequestLine.notes,
    )
    data_query = build_joined_query(data_query)
    data_query = apply_common_filters(
        data_query, start_time, end_time, employee_name
    )

    # Apply pagination if not in download mode
    if not download:
        data_query = data_query.offset(offset).limit(page_size)

    result = await session.execute(data_query)
    rows = result.fetchall()

    # Transform rows into the expected response format
    request_lines = [ReportDetailsResponse.model_validate(row) for row in rows]

    return {
        "data": request_lines,
        "current_page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "total_rows": total_rows,
    }
