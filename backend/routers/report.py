import traceback
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse

from src.http_schema import ReportDashboardResponse, ReportDetailsResponse
from routers.cruds import report as crud
from depandancies import SessionDep, HRISSessionDep

from icecream import ic

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/dashboard-records",
    response_model=List[ReportDashboardResponse],
    status_code=status.HTTP_200_OK,
)
async def get_requests(
    maria_session: SessionDep,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
):
    """
    Returns the number of dinner and lunch requests grouped by department.
    """
    try:
        result = await crud.read_requests_data(maria_session, from_date, to_date)
        return result
    except Exception as err:
        logger.error(f"Unexpected error while reading requests: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while reading requests.",
        )


# Code 	Name 	Title 	Department 	Requester 	Requester Title 	Request Time 	Meal Type 	Attendance In 	Attendance Out 	Hours 	Not
@router.get(
    "/report-details",
    response_model=List[ReportDetailsResponse],
    status_code=status.HTTP_200_OK,
)
async def get_requests_data(
    maria_session: SessionDep,
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    """
    Streams all request lines in JSON lines (one record per line).

    :param maria_session: The async database session for MariaDB.
    :type maria_session: AsyncSession
    :param from_date: Filter requests from this date (inclusive, format: 'YYYY-MM-DD').
    :type from_date: str | None
    :param to_date: Filter requests up to this date (inclusive, format: 'YYYY-MM-DD').
    :type to_date: str | None
    :return: A StreamingResponse that yields each row as a line of JSON.
    :rtype: StreamingResponse
    :raises HTTPException: Raises HTTP 500 if an unexpected error occurs.
    """
    try:

        # Create streaming response
        response = await crud.read_request_lines_with_attendance(
            session=maria_session, start_date=from_date, end_date=to_date
        )
        return response

    except HTTPException as http_exc:
        logger.error(f"HTTP error occurred: {http_exc.detail}")
        raise http_exc
    except Exception as err:
        logger.error(f"Unexpected error: {err}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while streaming request details.",
        )
