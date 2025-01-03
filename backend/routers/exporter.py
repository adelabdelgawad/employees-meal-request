import logging
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Annotated

from db.database import get_application_session
from db.models import (
    MealRequest,
    MealRequestLine,
    Employee,
    Department,
    Account,
    MealType,
)
from hris_db.models import HRISEmployeeAttendanceWithDetails
from hris_db.database import get_hris_session
from src.schema import AuditRecordResponse

router = APIRouter()
logger = logging.getLogger(__name__)

SessionDep = Annotated[Session, Depends(get_application_session)]
HRISSessionDep = Annotated[Session, Depends(get_hris_session)]


@router.get("/audit-request", response_model=List[AuditRecordResponse])
async def read_audit_records(
    start_time: datetime,
    end_time: datetime,
    maria_session: SessionDep,
    hris_session: HRISSessionDep,
) -> List[AuditRecordResponse]:
    """
    Retrieve all audit records within the specified time range.

    Args:
        start_time (datetime): The start time for filtering audit records.
        end_time (datetime): The end time for filtering audit records.
        maria_session (SessionDep): The database session for the application database.
        hris_session (HRISSessionDep): The database session for the HRIS database.

    Returns:
        List[AuditRecordResponse]: A list of audit records containing employee details,
        meal requests, and attendance data.
    """
    try:
        statement = (
            select(
                MealRequestLine.id,
                Employee.code,
                Employee.name.label("employee_name"),
                Employee.title,
                Department.name.label("department"),
                Account.username.label("requester"),
                Account.title.label("requester_title"),
                MealType.name.label("meal_type"),
                MealRequestLine.notes,
                MealRequest.request_time,
            )
            .join(Employee, MealRequestLine.employee_id == Employee.id)
            .join(Department, MealRequestLine.department_id == Department.id)
            .join(MealRequest, MealRequestLine.meal_request_id == MealRequest.id)
            .join(Account, MealRequest.requester_id == Account.id)
            .join(MealType, MealRequest.meal_type_id == MealType.id)
            .where(
                MealRequestLine.is_accepted == True,
                MealRequest.request_time >= start_time,
                MealRequest.request_time <= end_time,
            )
        )

        employee_requests = maria_session.exec(statement).all()

        if not employee_requests:
            logger.info("No employee requests found for the specified time range.")
            return []

        results = []
        for request in employee_requests:
            attendance_query = select(HRISEmployeeAttendanceWithDetails).where(
                HRISEmployeeAttendanceWithDetails.employee_code == request.code,
                HRISEmployeeAttendanceWithDetails.date == start_time.date(),
            )
            attendance = hris_session.exec(attendance_query).first()

            date_in = attendance.date_in if attendance else None
            date_out = attendance.date_out if attendance else None
            working_hours = (date_out - date_in) if date_in and date_out else None

            record = AuditRecordResponse(
                id=request.id,
                code=request.code,
                employee_name=request.employee_name,
                title=request.title,
                department=request.department,
                requester=request.requester,
                requester_title=request.requester_title,
                meal_type=request.meal_type,
                notes=request.notes,
                request_time=request.request_time,
                in_time=date_in,
                out_time=date_out,
                working_hours=working_hours,
            )
            results.append(record)

        return results

    except Exception as e:
        logger.error("Error occurred while retrieving audit records.", exc_info=True)
        raise HTTPException(
            status_code=500, detail="An error occurred while retrieving audit records."
        )
