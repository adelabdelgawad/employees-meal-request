import traceback
import logging
from typing import List, Optional
from sqlmodel import Session, select, func, case
from db.models import (
    MealRequest,
    MealRequestStatus,
    Account,
    MealRequestLine,
    MealType,
    Employee,
    Department,
    EmployeeShift,
)
from src.schema import MealRequestSummary, MealRequestLineResponse

logger = logging.getLogger(__name__)


def read_meal_requests(session: Session) -> List[MealRequestSummary]:
    """
    Fetch all meal requests with aggregated data.

    Args:
        session (Session): SQLModel session.

    Returns:
        List[MealRequestSummary]: A list of meal request summaries.
    """
    logger.info("Fetching all meal requests with aggregated data.")

    query = (
        select(
            MealRequest.id,
            MealRequestStatus.name.label("status_name"),
            Account.username.label("requester_name"),
            Account.title.label("requester_title"),
            MealRequest.request_time,
            MealRequest.notes,
            MealRequest.closed_time,
            MealType.name.label("meal_type"),
            func.count(MealRequestLine.id).label("total_request_lines"),
            func.sum(case((MealRequestLine.is_accepted == True, 1), else_=0)).label(
                "accepted_request_lines"),
        )
        .join(MealRequestStatus, MealRequest.status_id == MealRequestStatus.id)
        .join(Account, MealRequest.requester_id == Account.id)
        .outerjoin(MealRequestLine, MealRequestLine.meal_request_id == MealRequest.id)
        .join(MealType, MealRequest.meal_type_id == MealType.id)
        .where(MealRequest.request_time.isnot(None))
        .group_by(
            MealRequest.id,
            MealRequestStatus.name,
            Account.username,
            Account.title,
            MealRequest.notes,
            MealType.name,
            MealRequest.request_time,
            MealRequest.closed_time,
        )
        .order_by(MealRequest.id.desc())
    )

    try:
        meal_requests = session.exec(query).all()
        if not meal_requests:
            logger.info("No meal requests found.")
            return []

        logger.info(
            f"Retrieved {len(meal_requests)} meal requests with aggregated data.")
        return [
            MealRequestSummary(
                meal_request_id=row.id,
                status_name=row.status_name,
                requester_name=row.requester_name,
                requester_title=row.requester_title,
                request_time=row.request_time,
                notes=row.notes,
                closed_time=row.closed_time,
                meal_type=row.meal_type,
                total_request_lines=row.total_request_lines,
                accepted_request_lines=row.accepted_request_lines,
            )
            for row in meal_requests
        ]
    except Exception as e:
        logger.error(f"An error occurred while retrieving meal requests: {e}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        return []


async def read_meal_request_line_for_requests_page(
    session: Session, request_id: int
) -> List[MealRequestLineResponse]:
    """
    Fetch meal request lines for a given request ID.

    Args:
        session (Session): SQLModel session.
        request_id (int): Meal request ID to fetch lines for.

    Returns:
        List[MealRequestLineResponse]: A list of meal request line responses.
    """
    logger.info(f"Reading meal request lines for request ID: {request_id}")

    query = (
        select(
            MealRequestLine.id,
            Employee.code.label("employee_code"),
            Employee.name.label("employee_name"),
            Employee.title.label("employee_title"),
            Department.name.label("department"),
            EmployeeShift.duration_hours.label("shift_hours"),
            MealRequestLine.attendance.label("attendance"),
            MealRequestLine.is_accepted.label("accepted"),
            MealType.name.label("meal_type"),
            MealRequestLine.notes.label("notes"),
        )
        .join(MealRequest, MealRequestLine.meal_request_id == MealRequest.id)
        .join(Employee, MealRequestLine.employee_id == Employee.id)
        .join(Department, Employee.department_id == Department.id)
        .join(MealType, MealRequest.meal_type_id == MealType.id)
        .outerjoin(EmployeeShift, MealRequestLine.shift_id == EmployeeShift.id)
        .where(MealRequest.id == request_id)
    )

    try:
        meal_request_lines = session.exec(query).all()
        if not meal_request_lines:
            logger.info(
                f"No meal request lines found for request ID: {request_id}")
            return []

        logger.info(
            f"Retrieved {len(meal_request_lines)} meal request lines for request ID: {request_id}")
        return [
            MealRequestLineResponse(
                id=row.id,
                code=row.employee_code,
                name=row.employee_name,
                title=row.employee_title,
                department=row.department,
                shift_hours=row.shift_hours,
                attendance=row.attendance,
                accepted=row.accepted,
                notes=row.notes,
                meal_type=row.meal_type,
            )
            for row in meal_request_lines
        ]
    except Exception as e:
        logger.error(
            f"Failed to read meal request lines for request ID {request_id}: {e}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        return []
