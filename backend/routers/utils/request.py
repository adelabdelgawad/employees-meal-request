import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Request
from routers.cruds.request import (
    create_meal_request_lines,
    update_request_lines,
    update_request_request_time,
)
from datetime import datetime
import pytz
from icecream import ic

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")
logger = logging.getLogger(__name__)


async def continue_processing_meal_request(
    maria_session: AsyncSession,
    hris_session: AsyncSession,
    request: Request,
    request_lines: List[dict],
    request_time: Optional[datetime] = None,
    request_timing_option=Optional[str],
):
    request_lines = await create_meal_request_lines(
        maria_session, request, request_lines
    )
    ic(request_lines)
    # Set the request time if it hasn't been provided and the timing option is "request_now"
    if request_timing_option == "save_for_later":
        request_time = None
    if not request_time and request_timing_option == "request_now":
        request_time = datetime.now(cairo_tz)

    if request_timing_option == "request_now":
        request_time = datetime.now(cairo_tz)
        await update_request_lines(
            maria_session=maria_session,
            hris_session=hris_session,
            request_lines=request_lines,
        )

    await update_request_request_time(
        maria_session,
        request_id=request.id,
        request_time=request_time,
    )
