import logging
from typing import List, Optional
from datetime import datetime, timedelta, date
import pytz
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from icecream import ic

from hris_db.models import (
    HRISEmployeeAttendanceWithDetails,
    HRISShiftAssignment,
)
from db.models import RequestLine, Request

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")
logger = logging.getLogger(__name__)


async def get_min_and_max_time(
    session: AsyncSession,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
):
    """
    Retrieves the minimum and maximum request_time values from the Request table,
    filtered by the given start and end datetimes.
    """
    stmt = select(
        func.min(Request.request_time).label("min_request_time"),
        func.max(Request.request_time).label("max_request_time"),
    ).join(RequestLine, Request.id == RequestLine.request_id)

    if start_time and end_time:
        stmt = stmt.where(Request.request_time.between(start_time, end_time))
    else:
        raise ValueError("Both start_time and end_time must be provided.")

    result = await session.execute(stmt)
    return result.fetchone()


async def update_request_lines_with_attendance(
    session: AsyncSession,
    hris_session: AsyncSession,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    employee_name: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    download: Optional[bool] = False,
) -> List[RequestLine]:
    """
    Updates RequestLine records with attendance_in and attendance_out values from
    HRISEmployeeAttendanceWithDetails based on the Request's request_time.

    Filters Requests with request_time between start_time and end_time and updates
    each RequestLine by matching on both employee_code and the date portion of the
    Request's request_time.

    Args:
        session (AsyncSession): Session used for RequestLine updates.
        hris_session (AsyncSession): Session used for querying the attendance table.
        start_time (Optional[datetime]): Start datetime for filtering.
        end_time (Optional[datetime]): End datetime for filtering.
        employee_name (Optional[str]): (Not used currently) Employee name to filter by.
        page (int): Pagination page number.
        page_size (int): Number of records per page.
        download (Optional[bool]): Flag to bypass pagination.

    Returns:
        List[RequestLine]: The list of updated RequestLine records.

    Raises:
        ValueError: If both start_time and end_time are not provided.
    """
    offset = (page - 1) * page_size

    # Eagerly load the associated Request to avoid lazy-loading issues.
    stmt = (
        select(RequestLine)
        .options(selectinload(RequestLine.request))
        .join(Request, Request.id == RequestLine.request_id)
    )

    if start_time and end_time:
        # Filter by Request.request_time
        stmt = stmt.where(Request.request_time.between(start_time, end_time))
    else:
        raise ValueError(
            "Either target_date or both start_time and end_time must be provided."
        )
    if not download:
        stmt = stmt.offset(offset).limit(page_size)

    result = await session.execute(stmt)
    request_lines = result.scalars().all()
    print(f"Found {len(request_lines)} request lines to update.")

    if not request_lines:
        return []  # Nothing to update.

    # Get min and max request_time from the filtered Requests.
    min_request_time, max_request_time = await get_min_and_max_time(
        session, start_time, end_time
    )
    if not min_request_time or not max_request_time:
        raise ValueError("Could not determine the min/max request times.")

    # Convert min and max request times to dates for matching attendance records.
    min_request_date = min_request_time.date()
    max_request_date = max_request_time.date()

    # Collect employee_codes from the RequestLine records.
    employee_codes = {str(rl.employee_code) for rl in request_lines}

    # Query all attendance records for these employee codes within the date range.
    attendance_stmt = (
        select(HRISEmployeeAttendanceWithDetails)
        .where(
            HRISEmployeeAttendanceWithDetails.employee_code.in_(employee_codes)
        )
        .where(
            HRISEmployeeAttendanceWithDetails.date.between(
                min_request_date, max_request_date
            )
        )
    )
    attendance_result = await hris_session.execute(attendance_stmt)
    attendance_records = attendance_result.scalars().all()

    # Build a mapping from (employee_code, attendance_date) to its attendance record.
    # Convert rec.date (a datetime) to a date object with .date()
    attendance_map = {
        (str(rec.employee_code), rec.date.date()): rec
        for rec in attendance_records
    }

    # Update each RequestLine with the matching attendance record.
    for rl in request_lines:
        # Ensure the associated Request and its request_time are available.
        if not rl.request or not rl.request.request_time:
            continue
        # Extract the date portion of the Request's request_time.
        request_date = rl.request.request_time.date()
        key = (str(rl.employee_code), request_date)
        attendance_record = attendance_map.get(key)
        ic(attendance_record)
        if attendance_record:
            ic(attendance_record.date_in, attendance_record.date_out)
            rl.attendance_in = attendance_record.date_in
            rl.attendance_out = attendance_record.date_out
            session.add(rl)

    await session.commit()
    return request_lines


async def read_attendances_from_hris(
    hris_session: AsyncSession,
    employee_codes: List[int],
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    batch_size: int = 100,
) -> List[HRISEmployeeAttendanceWithDetails]:
    """
    Reads employee attendances within the last 3 days or a specified date range for the specified employee codes.

    Args:
        hris_session (AsyncSession): The database session.
        employee_codes (List[int]): List of employee codes.
        start_date (Optional[datetime]): Start date for filtering attendance.
        end_date (Optional[datetime]): End date for filtering attendance.
        batch_size (int): Number of employee codes to include per batch.

    Returns:
        List[HRISEmployeeAttendanceWithDetails]: List of attendances matching the criteria.
    """
    try:
        filter_duration = datetime.now(cairo_tz) - timedelta(days=1)
        all_attendances = []

        for i in range(0, len(employee_codes), batch_size):
            batch = employee_codes[i : i + batch_size]

            statement = select(HRISEmployeeAttendanceWithDetails).where(
                HRISEmployeeAttendanceWithDetails.employee_code.in_(batch)
            )

            if start_date and end_date:
                statement = statement.where(
                    HRISEmployeeAttendanceWithDetails.date.between(
                        start_date, end_date
                    )
                )
            else:
                statement = statement.where(
                    HRISEmployeeAttendanceWithDetails.date_in
                    >= filter_duration
                )

            statement = statement.order_by(
                HRISEmployeeAttendanceWithDetails.date_in.desc()
            )

            result = await hris_session.execute(statement)
            all_attendances.extend(result.scalars().all())

        return all_attendances

    except Exception as e:
        logger.error(f"Error reading recent attendances: {e}")
        return []


async def read_shifts_from_hris(
    hris_session: AsyncSession,
    employee_ids: List[int],
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    batch_size: int = 200,
) -> List[HRISShiftAssignment]:
    """
    Reads employee shifts that match today's date for the specified employee IDs.

    Args:
        hris_session (AsyncSession): The database session.
        employee_ids (List[int]): List of employee IDs.
        start_date (Optional[datetime]): Start date for filtering shifts.
        end_date (Optional[datetime]): End date for filtering shifts.
        batch_size (int): Number of IDs to include per batch.

    Returns:
        List[HRISShiftAssignment]: List of shifts for the specified period.
    """
    try:
        today = date.today()
        all_shifts = []

        for i in range(0, len(employee_ids), batch_size):
            batch = employee_ids[i : i + batch_size]
            statement = select(HRISShiftAssignment).where(
                HRISShiftAssignment.employee_id.in_(batch)
            )
            if start_date and end_date:
                statement = statement.where(
                    HRISShiftAssignment.date_from.between(start_date, end_date)
                )
            else:
                statement = statement.where(
                    HRISShiftAssignment.date_from == today
                )

            result = await hris_session.execute(statement)
            all_shifts.extend(result.scalars().all())

        return all_shifts

    except Exception as e:
        logger.error(f"Error reading shifts: {e}")
        return []
