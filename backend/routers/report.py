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
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
async def get_requests_data(
    maria_session: SessionDep,
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(10, ge=1, le=100, description="Number of rows per page"),
    query: str = Query(None, description="Search parameters"),
):
    """
    Retrieves paginated request data with optional date filtering.

    :param maria_session: The async database session for MariaDB.
    :param from_date: Filter requests from this date (inclusive, format: 'YYYY-MM-DD').
    :param to_date: Filter requests up to this date (inclusive, format: 'YYYY-MM-DD').
    :param page: The current page number (1-based).
    :param page_size: The number of rows per page.
    :return: A dictionary containing paginated data and metadata.
    """
    try:
        # Call CRUD function to fetch paginated data and metadata
        result = await crud.read_request_lines_with_attendance(
            session=maria_session,
            start_date=from_date,
            employee_name=query,
            end_date=to_date,
            page=page,
            page_size=page_size,
        )

        ic(result)
        return result

    except HTTPException as http_exc:
        logger.error(f"HTTP error occurred: {http_exc.detail}")
        raise http_exc
    except Exception as err:
        logger.error(f"Unexpected error: {err}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving request details.",
        )
