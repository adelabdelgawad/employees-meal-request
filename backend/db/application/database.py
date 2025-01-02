import os
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from sqlalchemy.sql import text

# Load environment variables
load_dotenv()

# Database connection details from .env
DB_USER = os.getenv("APP_DB_USER")
DB_PASSWORD = os.getenv("APP_DB_PASSWORD")
DB_SERVER = os.getenv("APP_DB_SERVER")
DB_NAME = os.getenv("APP_DB_NAME")

# Connection URLs
SERVER_DATABASE_URL = (
    f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/?charset=utf8mb4"
)
DATABASE_URL = (
    f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?charset=utf8mb4"
)

# Create the main engine
engine = create_async_engine(DATABASE_URL, echo=False)


async def ensure_database_exists():
    """
    Ensure the target database exists. If it does not exist, create it.
    """
    server_engine = create_async_engine(SERVER_DATABASE_URL, echo=False)

    async with server_engine.begin() as conn:
        await conn.execute(
            text(
                f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
                f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        )

    await server_engine.dispose()


async def create_db_and_tables():
    """
    Ensure the database exists and create all tables defined in SQLModel.
    """
    await ensure_database_exists()

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        print("Tables created successfully.")


def get_session_maker():
    """
    Return a sessionmaker configured for the AsyncSession.
    """
    return sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_application_session():
    """
    Dependency to provide a session for FastAPI endpoints.
    """
    async_session = get_session_maker()
    async with async_session() as session:
        yield session
