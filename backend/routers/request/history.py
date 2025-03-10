from fastapi import HTTPException, status, APIRouter
import traceback
import logging
from typing import List
from fastapi import APIRouter, HTTPException, status

from services.http_schema import RequestHistoryRecordResponse
import pytz
from services.http_schema import ScheduleRequest
from src.dependencies import SessionDep, CurrentUserDep
from icecream import ic
from sqlmodel import select, func, case
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError
from db.models import Request, RequestStatus, Meal, RequestLine
from routers.cruds.request_lines import read_request_lines_by_request_id

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")

# Logger setup
logger = logging.getLogger(__name__)


router = APIRouter()


@router.get(
    "/history",
    response_model=List[RequestHistoryRecordResponse],
    status_code=status.HTTP_200_OK,
)
async def get_history_requests(
    user: CurrentUserDep,
    session: SessionDep,
):
    """
    Retrieve the history of requests made by the current user.

    Args:
        user (dict): The current authenticated user.
        session (AsyncSession): The asynchronous database session.

    Returns:
        List[RequestHistoryRecordResponse]: A list of request history records.

    Raises:
        HTTPException: If an error occurs while retrieving the data.
    """
    try:
        stmt = (
            select(
                Request.id,
                RequestStatus.name.label("status_name"),
                RequestStatus.id.label("status_id"),
                Meal.name.label("meal"),
                Request.request_time,
                Request.closed_time,
                Request.notes,
                func.count(RequestLine.id).label("total_lines"),
                func.sum(
                    case((RequestLine.is_accepted == True, 1), else_=0)
                ).label("accepted_lines"),
            )
            .join(RequestStatus, Request.status_id == RequestStatus.id)
            .outerjoin(RequestLine, Request.id == RequestLine.request_id)
            .outerjoin(Meal, RequestLine.meal_id == Meal.id)
            .where(
                Request.is_deleted == False,
                Request.requester_id == user.id,
            )
            .group_by(
                Request.id,
                RequestStatus.name,
                RequestStatus.id,
                Meal.name,
                Request.request_time,
                Request.closed_time,
                Request.notes,
            )
            .having(func.count(RequestLine.id) > 0)
            .order_by(desc(Request.request_time))
        )

        # Execute the query
        results = await session.execute(stmt)
        requests = results.all()

        # Transform results into the response model
        response = [
            RequestHistoryRecordResponse(
                id=row.id,
                status_name=row.status_name,
                status_id=row.status_id,
                meal=row.meal,
                request_time=row.request_time,
                closed_time=row.closed_time,
                notes=row.notes,
                total_lines=row.total_lines,
                accepted_lines=row.accepted_lines,
            )
            for row in requests
        ]

        return response

    except SQLAlchemyError as db_err:
        logger.error(f"Database error occurred: {str(db_err)}")
        logger.debug(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving request history.",
        )
    except Exception as err:
        logger.error(f"Unexpected error: {str(err)}")
        logger.debug(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        )


@router.post(
    "/history/copy-request",
    status_code=status.HTTP_200_OK,
)
async def schedule_request(
    user: CurrentUserDep,
    session: SessionDep,
    schedule_request: ScheduleRequest,
):
    """
    Copy an existing request along with its associated request lines and schedule it.

    This endpoint retrieves the original request using the provided request_id
    from the ScheduleRequest. It then creates a new request scheduled at the
    specified scheduled_time and duplicates all the associated request lines by
    updating their request_id to that of the newly created request.

    Parameters:
    - user: The currently authenticated user.
    - session: The database session.
    - schedule_request: A ScheduleRequest object containing:
        - request_id: ID of the original request to copy.
        - scheduled_time: The time at which the new request should be scheduled.

    Returns:
    - A JSON response with a success message if the request is copied successfully.

    Raises:
    - HTTPException 404: If the original request is not found.
    - HTTPException 500: For any unexpected errors during processing.
    """
    try:
        scheduled_time = schedule_request.scheduled_time
        request_id = schedule_request.request_id

        # Retrieve the original request from the database
        original_request = await session.get(Request, request_id)
        if not original_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found.",
            )

        # Create a new request based on the original
        new_request = Request(
            requester_id=user.id,
            meal_id=original_request.meal_id,
            notes=original_request.notes,
            status_id=2,  # Updated status for the new request
            request_time=scheduled_time,
        )
        session.add(new_request)
        await session.commit()
        await session.refresh(new_request)

        # Retrieve the request lines for the original request
        request_lines = await read_request_lines_by_request_id(
            session, request_id
        )

        # Duplicate each request line and assign it to the new request
        new_request_lines = [
            RequestLine(
                request_id=new_request.id,  # Associate with new request
                employee_id=line.employee_id,
                employee_code=line.employee_code,
                department_id=line.department_id,
                meal_id=line.meal_id,
                notes=line.notes,
                is_accepted=True,  # Mark as accepted for the new request
            )
            for line in request_lines
        ]
        session.add_all(new_request_lines)
        await session.commit()

        logger.info(
            f"user: {user.username} - scheduled_time: {scheduled_time} - original request_id: {request_id} - new request_id: {new_request.id}"
        )

        return {"message": "Request copied successfully."}

    except HTTPException as http_ex:
        # Re-raise HTTP exceptions to be handled by FastAPI
        raise http_ex

    except Exception as ex:
        # Log the exception and return a generic error message
        print(f"Error copying request: {ex}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while copying the request.",
        )


@router.delete("/history/request-line/{id}")
async def delete_request_line(
    current_user: CurrentUserDep, session: SessionDep, id: int
):
    """
    Delete a RequestLine by its ID.

    Args:
        id (int): The ID of the RequestLine to delete.
        session (Session): The database session dependency.
        current_user (str): The current authenticated user.

    Returns:
        dict: A message indicating the result of the deletion.

    Raises:
        HTTPException: If the RequestLine with the given ID is not found or if a database error occurs.
    """
    try:
        # Retrieve the RequestLine by ID
        request_line = await session.get(RequestLine, id)
        if not request_line:
            raise HTTPException(
                status_code=404, detail="Request Line not found"
            )

        request_line.is_deleted = True
        session.add(request_line)
        await session.commit()
        logger.info(
            f"User {current_user} successfully deleted RequestLine wsith id {id}."
        )
        return {"message": "RequestLine deleted successfully."}

    except Exception as e:
        logger.error(
            f"Database error occurred while user {current_user} attempted to delete RequestLine with id {id}: {e}"
        )
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail="An error occurred while deleting the RequestLine.",
        )


@router.delete("/history/delete/{id}")
async def delete_request(
    current_user: CurrentUserDep, session: SessionDep, id: int
):
    """
    Delete a Request by its ID.

    Args:
        id (int): The ID of the Request to delete.
        session (Session): The database session dependency.
        current_user (str): The current authenticated user.

    Returns:
        dict: A message indicating the result of the deletion.

    Raises:
        HTTPException: If the Request with the given ID is not found or if a database error occurs.
    """
    try:
        # Retrieve the Request by ID
        request = await session.get(Request, id)
        ic(request)
        if not request:
            raise HTTPException(status_code=404, detail="request not found")

        request.is_deleted = True
        session.add(request)
        await session.commit()
        logger.info(
            f"User {current_user.username} successfully deleted Request wsith id {id}."
        )
        return {"message": "Request deleted successfully."}

    except Exception as e:
        logger.error(
            f"Database error occurred while request {current_user.username} attempted to delete Request with id {id}: {e}"
        )
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail="An error occurred while deleting the Request.",
        )
