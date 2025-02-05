import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from typing import AsyncGenerator
import os

# Load envir
load_dotenv()

# Database connection details from .env
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_SERVER = os.getenv("DB_SERVER")
AMH_DB_NAME = os.getenv("AMH_DB_NAME")


async def get_amh_application_session():
    """
    Dependency to provide a session for FastAPI endpoints.
    """
    DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{AMH_DB_NAME}?charset=utf8mb4"

    # Create the main engine
    engine = create_async_engine(DATABASE_URL, echo=False)

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    try:
        async with async_session() as session:
            yield session
    finally:
        await engine.dispose()


async def get_amh_hris_session() -> AsyncGenerator[AsyncSession, None]:

    SQL_DSN = (
        f"DRIVER={os.getenv("HRIS_DB_DRIVER")};"
        f"SERVER={os.getenv("HRIS_DB_SERVER")};"
        f"DATABASE={os.getenv("AMH_HRIS_DB_NAME")};"
        f"UID={os.getenv("HRIS_DB_USER")};"
        f"PWD={os.getenv("HRIS_DB_PASSWORD")}"
    )

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
