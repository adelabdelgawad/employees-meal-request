import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from typing import AsyncGenerator

# Load environment variables from the .env file
load_dotenv()

SQL_DSN = (
    f"DRIVER={os.getenv("HRIS_DB_DRIVER")};"
    f"SERVER={os.getenv("HRIS_DB_SERVER")};"
    f"DATABASE={os.getenv("HRIS_DB_NAME")};"
    f"UID={os.getenv("HRIS_DB_USER")};"
    f"PWD={os.getenv("HRIS_DB_PASSWORD")}"
)


async def get_hris_session() -> AsyncGenerator[AsyncSession, None]:
    engine = create_async_engine(
        "mssql+aioodbc:///?odbc_connect=" + SQL_DSN, echo=False
    )

    # Set up the session
    AsyncSessionLocal = sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )

    try:
        async with AsyncSessionLocal() as session:
            yield session
    finally:
        await engine.dispose()
