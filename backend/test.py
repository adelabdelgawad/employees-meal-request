"""
drop_and_recreate_meal_table.py

This script asynchronously drops and recreates the 'Meal' table using SQLModel.
WARNING: Dropping a table will result in the loss of all data within that table.
"""

import asyncio
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import SQLModel
from db.models import Meal  # Ensure this import matches your project structure
from dotenv import load_dotenv
import os

# Configure your asynchronous database URL
load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_SERVER = os.getenv("DB_SERVER")
DB_NAME = os.getenv("DB_NAME")
ASYNC_DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?charset=utf8mb4"

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def drop_and_recreate_meal_table():
    """
    Asynchronously drops and recreates the 'Meal' table.
    """
    async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)

    async with async_engine.begin() as conn:
        try:
            # Drop the 'Meal' table if it exists
            logger.info("Attempting to drop the 'Meal' table...")
            await conn.run_sync(Meal.__table__.drop)
            logger.info("Successfully dropped the 'Meal' table.")
        except SQLAlchemyError as drop_error:
            logger.error(
                "Error occurred while dropping the 'Meal' table: %s",
                drop_error,
            )
            return

        try:
            # Recreate the 'Meal' table
            logger.info("Attempting to recreate the 'Meal' table...")
            await conn.run_sync(
                SQLModel.metadata.create_all, tables=[Meal.__table__]
            )
            logger.info("Successfully recreated the 'Meal' table.")
        except SQLAlchemyError as create_error:
            logger.error(
                "Error occurred while recreating the 'Meal' table: %s",
                create_error,
            )
            return

    await async_engine.dispose()


if __name__ == "__main__":
    logger.info(
        "Starting the process to drop and recreate the 'Meal' table..."
    )
    asyncio.run(drop_and_recreate_meal_table())
    logger.info("Process completed.")
