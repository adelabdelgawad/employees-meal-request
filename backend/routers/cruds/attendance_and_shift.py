import logging
from typing import List, Optional
from datetime import datetime, timedelta, date
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from hris_db.models import HRISEmployeeAttendanceWithDetails, HRISShiftAssignment
import pytz


# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")
logger = logging.getLogger(__name__)


async def read_attendances_from_hris(
    hris_session: AsyncSession,
    employee_codes: List[int],
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    batch_size: int = 200,
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
        three_days_ago = datetime.now(cairo_tz) - timedelta(days=3)
        all_attendances = []

        for i in range(0, len(employee_codes), batch_size):
            batch = employee_codes[i : i + batch_size]

            statement = select(HRISEmployeeAttendanceWithDetails).where(
                HRISEmployeeAttendanceWithDetails.employee_code.in_(batch)
            )

            if start_date and end_date:
                statement = statement.where(
                    HRISEmployeeAttendanceWithDetails.date.between(start_date, end_date)
                )
            else:
                statement = statement.where(
                    HRISEmployeeAttendanceWithDetails.date_in >= three_days_ago
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
                statement = statement.where(HRISShiftAssignment.date_from == today)

            result = await hris_session.execute(statement)
            all_shifts.extend(result.scalars().all())

        return all_shifts

    except Exception as e:
        logger.error(f"Error reading shifts: {e}")
        return []
