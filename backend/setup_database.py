"""
setup_database.py

An async-compatible database setup and seed script for a SQLModel project.

Steps:
1. Create the database if it doesn't exist (synchronous).
2. Create tables if they don't exist (synchronous).
3. Seed default values (async).
"""

import asyncio
import os
from typing import Optional

from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, SQLModel
from dotenv import load_dotenv

# Import models from your project
from db.models import Role, Account, MealType, EmailRole, MealRequestStatus


# ------------------------------------------------------------------------------
#  Load environment variables
# ------------------------------------------------------------------------------
load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_SERVER = os.getenv("DB_SERVER", "localhost")
DB_NAME = os.getenv("DB_NAME", "mealrequestdb")
if not DB_USER or not DB_PASSWORD or not DB_SERVER or not DB_NAME:
    raise ValueError(
        "Missing required environment variables for the database connection."
    )

# ------------------------------------------------------------------------------
#  Database URLs
# ------------------------------------------------------------------------------
ASYNC_DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?charset=utf8mb4"
SYNC_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?charset=utf8mb4"
BASE_SYNC_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}"


# ------------------------------------------------------------------------------
# 1. Create Database If Not Exists (Synchronous)
# ------------------------------------------------------------------------------
def create_database_if_not_exists() -> None:
    """
    Creates the database if it does not already exist.
    Uses a synchronous connection to ensure compatibility with SQLModel table creation.

    Raises:
        SystemExit: If there is an error connecting to the database server.
    """
    print("Checking if database exists...")

    try:
        engine = create_engine(BASE_SYNC_URL, echo=False, future=True)
        with engine.connect() as connection:
            result = connection.execute(
                text(
                    f"SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA "
                    f"WHERE SCHEMA_NAME = '{DB_NAME}'"
                )
            )
            if not result.scalar():
                connection.execute(
                    text(
                        f"CREATE DATABASE {DB_NAME} "
                        "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                    )
                )
                print(f"Database '{DB_NAME}' created successfully.")
            else:
                print(f"Database '{DB_NAME}' already exists.")
    except OperationalError as e:
        print(f"Error connecting to the database server: {e}")
        exit(1)


# ------------------------------------------------------------------------------
# 2. Create Tables If Not Exists (Synchronous)
# ------------------------------------------------------------------------------
async def create_tables(async_engine: AsyncEngine) -> None:
    """
    Creates all tables in the database if they don't already exist.
    Uses SQLModel's metadata to generate the schema.

    Raises:
        SystemExit: If there is an error creating tables in the database.
    """
    try:
        print("Creating tables...")
        async with async_engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        print("Tables created successfully.")
    except OperationalError as e:
        print(f"Error creating tables: {e}")
        exit(1)


# ------------------------------------------------------------------------------
# 3. Seed Default Values (Asynchronous)
# ------------------------------------------------------------------------------
async def seed_default_values(engine: AsyncEngine) -> None:
    """
    Inserts default values into the database using an async session.

    Args:
        engine (AsyncEngine): The asynchronous engine to use.
    """
    print("Seeding default values...")

    async with AsyncSession(engine) as session:
        try:
            await seed_roles(session)
            await seed_email_roles(session)
            await seed_meal_types(session)
            await seed_admin_user(session)
            await seed_meal_request_status(session)
            await session.commit()
            print("Default values seeding complete.")
        except Exception as e:
            print(f"Error seeding default values: {e}")
            await session.rollback()


# ------------------------------------------------------------------------------
# 3.1 Helper: Seed Roles
# ------------------------------------------------------------------------------
async def seed_roles(session: AsyncSession) -> None:
    existing_roles = (await session.exec(select(Role))).all()
    if not existing_roles:
        roles = [
            Role(name="Admin"),
            Role(name="User"),
            Role(name="Waiter"),
            Role(name="Chef"),
            Role(name="Manager"),
            Role(name="Cashier"),
            Role(name="Stockcontroller"),
        ]
        session.add_all(roles)
        print("Default roles added.")


# ------------------------------------------------------------------------------
# 3.2 Helper: Seed Email Roles
# ------------------------------------------------------------------------------
async def seed_email_roles(session: AsyncSession) -> None:
    existing_email_roles = (await session.exec(select(EmailRole))).all()
    if not existing_email_roles:
        email_roles = [
            EmailRole(name="Request"),
            EmailRole(name="Confirmation"),
        ]
        session.add_all(email_roles)
        print("Default email roles added.")


# ------------------------------------------------------------------------------
# 3.3 Helper: Seed Meal Types
# ------------------------------------------------------------------------------
async def seed_meal_types(session: AsyncSession) -> None:
    existing_meal_types = (await session.exec(select(MealType))).all()
    if not existing_meal_types:
        meal_types = [
            MealType(name="Lunch"),
            MealType(name="Dinner"),
        ]
        session.add_all(meal_types)
        print("Default meal types added.")


# ------------------------------------------------------------------------------
# 3.4 Helper: Seed Admin User
# ------------------------------------------------------------------------------
async def seed_admin_user(session: AsyncSession) -> None:
    admin_user = (
        await session.exec(select(Account).where(Account.username == "admin"))
    ).first()
    if not admin_user:
        # Ideally, use a hashed password in production
        admin_user = Account(
            username="admin",
            password="securepassword123",
        )
        session.add(admin_user)
        print("Default admin account added.")


async def seed_meal_request_status(session: AsyncSession) -> None:
    existing_meal_request_status = await session.exec(
        select(MealRequestStatus)
    )
    if not existing_meal_request_status.all():
        request_status = [
            MealRequestStatus(name="Pending"),
            MealRequestStatus(name="Hold"),
            MealRequestStatus(name="Approved"),
            MealRequestStatus(name="Rejected"),
        ]
        session.add_all(request_status)
        print("Default meal request statuses added.")


# ------------------------------------------------------------------------------
# Main Entry Point
# ------------------------------------------------------------------------------
async def main_async() -> None:
    """
    Orchestrates the entire database setup process:
    - Create database (if doesn't exist)
    - Create tables (if don't exist)
    - Seed default values
    """
    create_database_if_not_exists()

    async_engine = create_async_engine(
        ASYNC_DATABASE_URL, echo=False, future=True
    )

    try:
        await create_tables(async_engine)
        await seed_default_values(async_engine)
    finally:
        await async_engine.dispose()


if __name__ == "__main__":
    print("Starting database setup...")
    asyncio.run(main_async())
    print(
        "Database setup and default values insertion completed successfully."
    )
