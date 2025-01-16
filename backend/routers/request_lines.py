import traceback
import logging
from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from db.database import get_application_session
from db.models import RequestLine, Employee, EmployeeShift
from src.http_schema import RequestLineRespose, ChangedStatusRequest
from hris_db.database import get_hris_session

from icecream import ic

# Create API Router
router = APIRouter()
logger = logging.getLogger(__name__)

SessionDep = Annotated[Session, Depends(get_application_session)]
HRISSessionDep = Annotated[Session, Depends(get_hris_session)]


@router.get(
    "/request-lines",
    response_model=List[RequestLineRespose],
    status_code=status.HTTP_200_OK,
)
async def get_request_line(
    maria_session: SessionDep, request_id: int
) -> List[RequestLineRespose]:
    """
    Retrieves meal request lines based on a request ID.

    Args:
        maria_session (Session): Database session for the application.
        request_id (Optional[int]): ID of the meal request to filter lines.

    Returns:
        List[RequestLine]: A list of meal request lines.
    """
    logger.info(
        f"Attempting to read meal request lines for request_id: {request_id}"
    )
    try:
        statement = select(
            RequestLine.id,
            Employee.name,
            Employee.title,
            Employee.code,
            RequestLine.attendance,
            RequestLine.is_accepted,
            RequestLine.shift_id,
        ).join(RequestLine.employee)

        statement = statement.where(RequestLine.request_id == request_id)

        # Execute the query
        result = await maria_session.execute(statement)
        lines = result.all()

        if not lines:
            logger.info("No meal request lines found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No meal request lines found.",
            )
        return lines

    except HTTPException as http_exc:
        logger.error(f"HTTP error: {http_exc.detail}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        raise http_exc

    except Exception as err:
        logger.error(
            f"Unexpected error while reading meal request lines: {err}"
        )
        logger.debug(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while reading meal request lines.",
        )


# API endpoint to handle changed statuses
@router.put("/update-request-lines")
async def update_request_lines(
    maria_session: SessionDep, changes: List[ChangedStatusRequest]
):
    if not changes:
        raise HTTPException(status_code=400, detail="No changes provided")

    # Process each change
    for change in changes:
        # Fetch the RequestLine record by ID
        record = await maria_session.get(RequestLine, change.id)
        if not record:
            raise HTTPException(
                status_code=404,
                detail=f"RequestLine with ID {change.id} not found",
            )

        # Update the is_accepted field
        record.is_accepted = change.is_accepted

        # Add the record to the session
        maria_session.add(record)

    # Commit the changes to the database
    await maria_session.commit()

    return {"message": "Changes saved successfully"}
