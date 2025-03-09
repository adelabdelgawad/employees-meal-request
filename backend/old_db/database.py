from typing import AsyncGenerator
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv
from typing import AsyncGenerator, Any
from old_db.models import Base

# Load environment variables from the .env file
load_dotenv()

# Extracting database details from environment variables
DB_USER = os.getenv("OLD_DB_USER")
DB_PASSWORD = os.getenv("OLD_DB_PASSWORD")
DB_SERVER = os.getenv("OLD_DB_SERVER")
DB_NAME = os.getenv("OLD_DB_NAME")

# Validate environment variables
required_vars = ["OLD_DB_USER", "OLD_DB_PASSWORD",
                 "OLD_DB_SERVER", "OLD_DB_NAME"]
missing_vars = [var for var in required_vars if os.getenv(var) is None]
if missing_vars:
    raise EnvironmentError(f"Missing environment variables: {
                           ', '.join(missing_vars)}")

# URL for connecting to the database server (not a specific database)
SERVER_DATABASE_URL = (
    f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/?charset=utf8mb4"
)
# URL for connecting to the specific database
DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{
    DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?charset=utf8mb4"

# Create the SQLAlchemy engines at the module level
server_engine = create_async_engine(SERVER_DATABASE_URL, echo=False)


# Create sessionmakers at the module level
ServerSessionLocal = sessionmaker(
    bind=server_engine, class_=AsyncSession, expire_on_commit=False
)

database_engine = create_async_engine(DATABASE_URL, echo=False)
DatabaseSessionLocal = sessionmaker(
    bind=database_engine, class_=AsyncSession, expire_on_commit=False
)


async def create_tables():
    """
    Creates the database if it doesn't exist and initializes tables based on SQLAlchemy models.
    """
    # Step 1: Create the database with utf8mb4 character set if it doesn't exist
    async with server_engine.begin() as conn:
        await conn.execute(
            text(
                f"CREATE DATABASE IF NOT EXISTS `{
                    DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        )

    # Step 2: Create tables in the specified database
    async with database_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Engines can be disposed of if they are no longer needed, typically at application shutdown
    await server_engine.dispose()
    await database_engine.dispose()


async def get_old_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Asynchronous generator that yields a database session.
    Ensures the session is properly closed after use.
    """
    async with DatabaseSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise
        finally:
            await database_engine.dispose()
            await session.close()


# Example usage: Creating tables when the module is run directly
if __name__ == "__main__":
    import asyncio

    async def main():
        await create_tables()

    asyncio.run(main())
