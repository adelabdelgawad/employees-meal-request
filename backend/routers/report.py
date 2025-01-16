import traceback
import logging
from typing import List, Optional, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_application_session
from db.models import RequestLine
from hris_db.database import get_hris_session
from src.http_schema import ReportDashboardResponse, ReportDetailsResponse
from routers.cruds import report as crud

router = APIRouter()
logger = logging.getLogger(__name__)

SessionDep = Annotated[AsyncSession, Depends(get_application_session)]
HRISSessionDep = Annotated[AsyncSession, Depends(get_hris_session)]


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
        result = await crud.read_requests_data(
            maria_session, from_date, to_date
        )
        return result
    except Exception as err:
        logger.error(f"Unexpected error while reading meal requests: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while reading meal requests.",
        )


@router.get(
    "/report-details",
    response_model=List[ReportDetailsResponse],
    status_code=status.HTTP_200_OK,
)
async def get_requests_data(
    maria_session: SessionDep,
    hris_session: HRISSessionDep,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
):
    try:
        """
        Retrieve all account permissions with associated usernames and role IDs.
        """

        requests_lines = await read_closed_accepted_requests_for_audit_page(
            maria_session, start_time, end_time
        )
        data = await get_employee_attendance(hris_session, employee_requests)
        if data is not None:
            return data

    except HTTPException as http_exc:
        # Log and re-raise HTTP-related exceptions
        logger.error(f"HTTP error occurred: {http_exc.detail}")
        raise http_exc

    except Exception as err:
        # Log unexpected exceptions with full traceback and raise a 500 HTTPException
        logger.error(f"Unexpected error: {err}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while updating meal request line.",
        )
