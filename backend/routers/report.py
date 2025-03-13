import traceback
import logging
from typing import List, Optional, Tuple
from fastapi import APIRouter, HTTPException, status, Query
from routers.cruds.attendance_and_shift import (
    update_request_lines_with_attendance,
)
from services.http_schema import ReportDashboardResponse, ReportDetailsResponse
from routers.utils.report_details import read_request_lines_with_attendance
from datetime import datetime
from routers.cruds.report import read_requests_data
from src.dependencies import SessionDep, HRISSessionDep

# Initialize the API router and logger.
router = APIRouter()
logger = logging.getLogger(__name__)

DATE_FORMAT = "%Y-%m-%d"


def parse_date_range(
    start_time: Optional[str], end_time: Optional[str]
) -> Tuple[Optional[datetime], Optional[datetime]]:
    """
    Parse the start and end time strings into datetime objects adjusted to
    the start and end of the day.

    :param start_time: Start date (format: 'MM/DD/YYYY, HH:MM:SS AM/PM')
    :param end_time: End date (format: 'MM/DD/YYYY, HH:MM:SS AM/PM')
    :return: Tuple of (start_dt, end_dt) or (None, None) if not provided.
    :raises ValueError: If the date strings cannot be parsed.
    """

    if start_time and end_time:
        try:
            start_dt = datetime.strptime(start_time, DATE_FORMAT).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            end_dt = datetime.strptime(end_time, DATE_FORMAT).replace(
                hour=23, minute=59, second=59, microsecond=0
            )
            return start_dt, end_dt
        except ValueError:
            raise ValueError(
                "Invalid date format. Expected 'MM/DD/YYYY, HH:MM:SS AM/PM'."
            )
    return None, None


@router.get(
    "/dashboard-records",
    response_model=List[ReportDashboardResponse],
    status_code=status.HTTP_200_OK,
)
async def get_requests(
    session: SessionDep,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
):
    """
    Retrieve the number of dinner and lunch requests grouped by department.

    This endpoint aggregates meal request data within an optional date range and groups
    the results by department. It returns a list of ReportDashboardResponse objects, each
    representing the aggregated request counts for a specific department.

    :param session: Asynchronous database session for MariaDB.
    :param from_date: Optional start date filter in 'YYYY-MM-DD' format.
    :param to_date: Optional end date filter in 'YYYY-MM-DD' format.
    :return: List of aggregated request data grouped by department.
    :raises HTTPException: If an error occurs during data retrieval.
    """
    try:
        # Fetch aggregated meal requests data from the database.
        start_time, end_time = parse_date_range(from_date, to_date)

        result = await read_requests_data(session, start_time, end_time)
        logger.info(
            "Successfully retrieved dashboard records with %d entries.",
            len(result),
        )
        return result
    except Exception as err:
        logger.error("Unexpected error while reading requests: %s", err)
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while reading requests.",
        )


@router.get(
    "/report/details",
    response_model=ReportDetailsResponse,
    status_code=status.HTTP_200_OK,
)
async def get_requests_data(
    session: SessionDep,
    hris_session: HRISSessionDep,
    start_time: str | None = None,
    end_time: str | None = None,
    page: int | None = 1,
    page_size: int | None = 15,
    query: str | None = None,
    update_attendance: bool | None = False,
    download: bool | None = False,
) -> ReportDetailsResponse:
    """
    Retrieve paginated request data with optional date filtering and search query.

    This endpoint returns detailed request data, including attendance information,
    and supports pagination. Users can filter results by start and end dates, search
    using a query parameter, and indicate if the results should be prepared for download.

    :param session: Asynchronous database session for MariaDB.
    :param hris_session: Asynchronous session for the HRIS system.
    :param start_time: Optional start date filter (format: 'YYYY-MM-DD').
    :param end_time: Optional end date filter (format: 'YYYY-MM-DD').
    :param page: Page number for pagination (must be >= 1).
    :param page_size: Number of records per page (between 1 and 100).
    :param query: Optional search query to filter results based on employee name.
    :param download: Boolean flag indicating if the data should be formatted for download.
    :return: Dictionary containing paginated request data along with metadata.
    :raises HTTPException: If an HTTP error or unexpected error occurs.
    """
    try:
        if start_time and not end_time:
            end_time = start_time
        start_time, end_time = parse_date_range(start_time, end_time)
        if update_attendance:
            await update_request_lines_with_attendance(
                session=session,
                hris_session=hris_session,
                start_time=start_time,
                end_time=end_time,
                employee_name=query,
                page=page,
                page_size=page_size,
                download=download,
            )

        request_lines = await read_request_lines_with_attendance(
            session=session,
            start_time=start_time,
            end_time=end_time,
            employee_name=query,
            page=page,
            page_size=page_size,
            download=download,
        )

        # Log the number of records returned from the data retrieval.
        data_count = len(request_lines.request_lines)
        logger.info(
            "Successfully retrieved report details for page %d with %d records.",
            page,
            data_count,
        )

        return request_lines

    except HTTPException as http_exc:
        # Log HTTP exceptions separately to distinguish client errors.
        logger.error("HTTP error occurred: %s", http_exc.detail)
        raise http_exc
    except Exception as err:
        logger.error("Unexpected error: %s", err)
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving request details.",
        )
