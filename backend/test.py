import asyncio
from routers.cruds.attendance_and_shift import (
    update_request_lines_with_attendance,
)
from datetime import datetime, date, time
from db.database import get_application_session
from hris_db.database import get_hris_session
from icecream import ic


async def main():
    target_date = date(2025, 2, 27)
    # Example 2: "Range" mode (using start and end datetime)
    start_dt = datetime(2025, 2, 27, 0, 0, 0)
    end_dt = datetime(2025, 2, 28, 23, 59, 59)
    async for hris_session in get_hris_session():
        async for session in get_application_session():
            updated_lines = await update_request_lines_with_attendance(
                session, hris_session, start=start_dt, end=end_dt
            )
            print(f"Updated {len(updated_lines)} request lines:")
            for rl in updated_lines:
                print(
                    f"RequestLine ID: {rl.id}, Employee Code: {rl.employee_code}, "
                    f"Attendance In: {rl.attendance_in}, Attendance Out: {rl.attendance_out}"
                )


if __name__ == "__main__":

    asyncio.run(main())
