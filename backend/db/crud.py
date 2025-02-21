import traceback
import logging
from typing import List, Optional
from sqlmodel import Session, select, func, case
from db.models import (
    Request,
    RequestStatus,
    Account,
    RequestLine,
    Meal,
    Employee,
    Department,
)
from services.schema import RequestSummary, RequestLineResponse

logger = logging.getLogger(__name__)


def read_requests(session: Session) -> List[RequestSummary]:
    """
    Fetch all requests with aggregated data.

    Args:
        session (Session): SQLModel session.

    Returns:
        List[RequestSummary]: A list of request summaries.
    """
    logger.info("Fetching all requests with aggregated data.")

    query = (
        select(
            Request.id,
            RequestStatus.name.label("status_name"),
            Account.username.label("requester_name"),
            Account.title.label("requester_title"),
            Request.request_time,
            Request.notes,
            Request.closed_time,
            Meal.name.label("meal"),
            func.count(RequestLine.id).label("total_request_lines"),
            func.sum(case((RequestLine.is_accepted == True, 1), else_=0)).label(
                "accepted_request_lines"
            ),
        )
        .join(RequestStatus, Request.status_id == RequestStatus.id)
        .join(Account, Request.requester_id == Account.id)
        .outerjoin(RequestLine, RequestLine.request_id == Request.id)
        .join(Meal, Request.id == Meal.id)
        .where(Request.request_time.isnot(None))
        .group_by(
            Request.id,
            RequestStatus.name,
            Account.username,
            Account.title,
            Request.notes,
            Meal.name,
            Request.request_time,
            Request.closed_time,
        )
        .order_by(Request.id.desc())
    )

    try:
        requests = session.exec(query).all()
        if not requests:
            logger.info("No requests found.")
            return []

        logger.info(f"Retrieved {len(requests)} requests with aggregated data.")
        return [
            RequestSummary(
                request_id=row.id,
                status_name=row.status_name,
                requester_name=row.requester_name,
                requester_title=row.requester_title,
                request_time=row.request_time,
                notes=row.notes,
                closed_time=row.closed_time,
                meal=row.meal,
                total_request_lines=row.total_request_lines,
                accepted_request_lines=row.accepted_request_lines,
            )
            for row in requests
        ]
    except Exception as e:
        logger.error(f"An error occurred while retrieving requests: {e}")
        logger.info(f"Traceback: {traceback.format_exc()}")
        return []


async def read_request_line_for_requests_page(
    session: Session, request_id: int
) -> List[RequestLineResponse]:
    """
    Fetch request lines for a given request ID.

    Args:
        session (Session): SQLModel session.
        request_id (int): request ID to fetch lines for.

    Returns:
        List[RequestLineResponse]: A list of request line responses.
    """
    logger.info(f"Reading request lines for request ID: {request_id}")

    query = (
        select(
            RequestLine.id,
            Employee.code.label("employee_code"),
            Employee.name.label("employee_name"),
            Employee.title.label("employee_title"),
            Department.name.label("department"),
            RequestLine.shift_hours.label("shift_hours"),
            RequestLine.attendance.label("attendance"),
            RequestLine.is_accepted.label("accepted"),
            Meal.name.label("meal"),
            RequestLine.notes.label("notes"),
        )
        .join(Request, RequestLine.request_id == Request.id)
        .join(Employee, RequestLine.employee_id == Employee.id)
        .join(Department, Employee.department_id == Department.id)
        .join(Meal, Request.id == Meal.id)
``        .where(Request.id == request_id)
    )

    try:
        request_lines = session.exec(query).all()
        if not request_lines:
            logger.info(f"No request lines found for request ID: {request_id}")
            return []

        logger.info(
            f"Retrieved {len(request_lines)} request lines for request ID: {request_id}"
        )
        return [
            RequestLineResponse(
                id=row.id,
                code=row.employee_code,
                name=row.employee_name,
                title=row.employee_title,
                department=row.department,
                shift_hours=row.shift_hours,
                attendance=row.attendance,
                accepted=row.accepted,
                notes=row.notes,
                meal=row.meal,
            )
            for row in request_lines
        ]
    except Exception as e:
        logger.error(
            f"Failed to read request lines for request ID {request_id}: {e}"
        )
        logger.info(f"Traceback: {traceback.format_exc()}")
        return []
