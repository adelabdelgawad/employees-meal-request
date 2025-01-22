# Standard Library Imports
from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func, case
from icecream import ic

# Project-Specific Imports
from db.models import Department, Request, RequestLine, Employee, Account, Meal
from src.http_schema import ReportDashboardResponse, ReportDetailsResponse


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


# Id, Code 	Name 	Title 	Department 	Requester 	Requester Title 	Request Time 	Meal Type 	Attendance In 	Attendance Out 	Hours 	Notes


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
    :param start_time: Start date for filtering data (inclusive, format: 'YYYY-MM-DD').
    :param end_time: End date for filtering data (inclusive, format: 'YYYY-MM-DD').
    :param employee_name: Filter by employee name (case-insensitive, partial match).
    :param page: The current page number (1-based).
    :param page_size: Number of rows per page.
    :return: A dictionary containing paginated data and metadata.
    """

    # Calculate offset for pagination
    offset = (page - 1) * page_size

    # Base query with joins
    statement = (
        select(func.count())
        .select_from(RequestLine)
        .join(Employee, RequestLine.employee_id == Employee.id)
        .join(Department, Employee.department_id == Department.id)
        .join(Request, RequestLine.request_id == Request.id)
        .join(Account, Request.requester_id == Account.id)
        .join(Meal, RequestLine.meal_id == Meal.id)
    )

    # Add filters to the base query
    if start_time and end_time:
        statement = statement.where(
            Request.created_time.between(start_time, end_time)
        )

    if start_time and end_time:
        statement = statement.where(
            Request.request_time.between(start_time, end_time)
        )
    if employee_name:
        statement = statement.where(Employee.name.ilike(f"%{employee_name}%"))

    # Execute the total count query
    total_rows_result = await session.execute(statement)
    total_rows = total_rows_result.scalar()

    # Calculate total pages
    total_pages = (total_rows + page_size - 1) // page_size

    # Query to fetch paginated data
    statement = (
        select(
            RequestLine.id,
            Employee.code.label("employee_code"),
            Employee.name.label("employee_name"),
            Employee.title.label("employee_title"),
            Department.name.label("department"),
            Account.username.label("requester_name"),
            Account.title.label("requester_title"),
            Request.request_time,
            Meal.name.label("meal"),
            RequestLine.attendance.label("attendance_in"),
            RequestLine.attendance.label("attendance_out"),
            RequestLine.shift_hours,
            RequestLine.notes,
        )
        .join(Employee, RequestLine.employee_id == Employee.id)
        .join(Department, Employee.department_id == Department.id)
        .join(Request, RequestLine.request_id == Request.id)
        .join(Account, Request.requester_id == Account.id)
        .join(Meal, RequestLine.meal_id == Meal.id)
    )

    # Add filters to the data query

    if start_time and end_time:
        ic(start_time, end_time)
        # statement = statement.where(
        #     Request.request_time.between(start_time, end_time)
        # )
    if employee_name:
        statement = statement.where(Employee.name.ilike(f"%{employee_name}%"))
    if not download:
        # Apply pagination (offset and limit)
        statement = statement.offset(offset).limit(page_size)

    # Execute query and fetch data
    result = await session.execute(statement)
    rows = result.fetchall()

    # Transform rows into the expected response format
    items = [
        ReportDetailsResponse.model_validate(row).model_dump() for row in rows
    ]

    # Return the paginated data along with metadata
    return {
        "data": items,
        "current_page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "total_rows": total_rows,
    }
