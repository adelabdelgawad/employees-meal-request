from db.hris.database import get_hris_session
from db.hris.crud import read_hris_attendance
import asyncio
from icecream import ic


async def main():
    async for session in get_hris_session():
        employee_code = 14157
        record = await read_hris_attendance(session, employee_code=employee_code)
        ic(record)


if __name__ == "__main__":
    asyncio.run(main())
