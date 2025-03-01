import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Request, RequestLine
from routers.cruds.request import (
    add_attendance_and_shift_to_request_line,
    confirm_request_creation,
)
from datetime import datetime
import pytz
from icecream import ic

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")
logger = logging.getLogger(__name__)


async def create_request_lines_and_confirm(
    session: AsyncSession,
    hris_session: AsyncSession,
    request: Request,
    request_lines: List[RequestLine],
    request_time: datetime,
    request_status_id: int,
):
    try:
        create_request_lines = [
            RequestLine(
                request_id=request.id,
                employee_id=line["employee_id"],
                employee_code=line["employee_code"],
                department_id=line["department_id"],
                notes=line["notes"],
                meal_id=request.meal_id,
                is_accepted=True,
            )
            for line in request_lines
        ]
        session.add_all(create_request_lines)
        await session.commit()

        # add The attendance and shift to the request line if the request is Pending
        if request_status_id == 1:
            await add_attendance_and_shift_to_request_line(
                session=session,
                hris_session=hris_session,
                request_lines=create_request_lines,
                attendance_in=True,
            )

        await confirm_request_creation(
            session,
            request_id=request.id,
            request_time=request_time,
        )
    except Exception as e:
        logger.error(f"Error creating request lines: {e}")
        raise e
