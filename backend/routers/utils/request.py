import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Request, RequestLine
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
):
    request_lines = await create_meal_request_lines(
        maria_session, request, request_lines
    )

    try:
        await update_request_lines(
            maria_session=maria_session,
            hris_session=hris_session,
            request_lines=request_lines,
        )
    except Exception as e:
        logger.error(f"Error updating request lines: {e}")

    await update_request_request_time(
        maria_session,
        request_id=request.id,
        request_time=datetime.now(cairo_tz),
    )
