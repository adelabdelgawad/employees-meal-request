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
from typing import List
from routers.utils.hashing import hash_password
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, SQLModel
from dotenv import load_dotenv

from hris_db.database import get_hris_session
from hris_db.clone import replicate

# Import models from your project
from db.models import (
    DomainUser,
    Role,
    Account,
    Meal,
    EmailRole,
    RequestStatus,
    Menu,
)
from services.schema import DomainUser as DomainUserSchema
from services.active_directory import read_domain_users_from_ldap


# ------------------------------------------------------------------------------
#  Load environment variables
# ------------------------------------------------------------------------------


load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_SERVER = os.getenv("DB_SERVER")
DB_NAME = os.getenv("DB_NAME")
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
            await seed_meals(session)
            await seed_admin_user(session)
            await seed_request_status(session)
            await seed_menu(session)
            await seed_domain_users(session)
            await session.commit()

            print("Default values seeding complete.")
            async for hris_session in get_hris_session():
                await replicate(hris_session, session)
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
            Role(name="Admin", description="Has full access to the system"),
            Role(name="User", description="Can access basic features"),
            Role(
                name="Ordertaker",
                description="Handles customer orders and service",
            ),
            Role(name="Chef", description="Prepares food in the kitchen"),
            Role(
                name="Manager",
                description="Oversees the operations of the restaurant",
            ),
            Role(name="Cashier", description="Handles customer payments"),
            Role(
                name="Stockcontroller",
                description="Manages inventory and stock levels",
            ),
        ]
        session.add_all(roles)
        await session.commit()
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
async def seed_meals(session: AsyncSession) -> None:
    existing_meals = (await session.exec(select(Meal))).all()
    if not existing_meals:
        meals = [
            Meal(name="Lunch"),
            Meal(name="Dinner"),
            Meal(name="Iftart", is_active=False),
        ]
        session.add_all(meals)
        print("Default meal types added.")


async def seed_menu(session: AsyncSession) -> None:
    standard_menu = (
        await session.exec(select(Menu).where(Menu.name == "Standard"))
    ).first()
    if not standard_menu:
        standard_menu = Menu(
            name="Standard",
            details="routine Meal",
        )
        session.add(standard_menu)
        print("Default menu, added.")


# ------------------------------------------------------------------------------
# 3.4 Helper: Seed Admin User
# ------------------------------------------------------------------------------
async def seed_admin_user(session: AsyncSession) -> None:
    admin_user = (
        await session.exec(select(Account).where(Account.username == "admin"))
    ).first()
    if not admin_user:
        hashed_password = hash_password("Password123")
        # Ideally, use a hashed password in production
        admin_user = Account(
            username="admin",
            password=hashed_password,
            fullname="Administrator",
            title="Built-in Administrator",
            is_super_admin=True,
        )
        session.add(admin_user)
        print("Default admin account added.")


async def seed_request_status(session: AsyncSession) -> None:
    existing_meal_request_status = await session.exec(select(RequestStatus))
    if not existing_meal_request_status.all():
        request_status = [
            RequestStatus(name="Pending"),
            RequestStatus(name="Scheduled"),
            RequestStatus(name="Approved"),
            RequestStatus(name="Rejected"),
        ]
        session.add_all(request_status)
        print("Default request statuses added.")


async def seed_domain_users(session: AsyncSession):
    domain_users: List[DomainUserSchema] = await read_domain_users_from_ldap()
    if domain_users:
        users = [DomainUser(**user.model_dump()) for user in domain_users]
        session.add_all(users)

        print("Domain Users Added")


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
