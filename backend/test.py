import asyncio
from db.database import get_application_session
from hris_db.database import get_hris_session
from hris_db.clone import replicate


async def main():
    async for session in get_application_session():
        async for hris_session in get_hris_session():
            await replicate(hris_session, session)


if __name__ == "__main__":
    asyncio.run(main())
