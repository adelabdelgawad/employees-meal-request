import traceback
import logging
from typing import List, Optional, Annotated
from datetime import datetime, timedelta
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    BackgroundTasks,
    Query,
)
from sqlmodel import Session, select, func
from typing import Annotated, Dict
from collections import defaultdict

from hris_db.models import HRISEmployeeAttendanceWithDetails
from hris_db.database import get_hris_session
from src.http_schema import ReportDashboardResponse
import pytz

from icecream import ic

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")

# Create API Router
router = APIRouter()
logger = logging.getLogger(__name__)

HRISSessionDep = Annotated[Session, Depends(get_hris_session)]


@router.get(
    "/dashboard-records",
    response_model=List[ReportDashboardResponse],
    status_code=status.HTTP_200_OK,
)
async def get_meal_requests(
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    request_id: Optional[int] = None,
):
    try:
        records = [
            {"id": 1, "department": "HR", "dinner_requests": 20, "lunch_requests": 25},
            {
                "id": 2,
                "department": "Finance",
                "dinner_requests": 30,
                "lunch_requests": 18,
            },
            {
                "id": 3,
                "department": "Engineering",
                "dinner_requests": 40,
                "lunch_requests": 35,
            },
            {
                "id": 4,
                "department": "Marketing",
                "dinner_requests": 15,
                "lunch_requests": 22,
            },
            {
                "id": 5,
                "department": "Sales",
                "dinner_requests": 50,
                "lunch_requests": 45,
            },
        ]
        return records
    except Exception as err:
        logger.error(f"Unexpected error while reading meal requests: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while reading meal requests.",
        )
