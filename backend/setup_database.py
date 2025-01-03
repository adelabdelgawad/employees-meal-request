"""
setup_database.py

An async-compatible database setup and seed script for a SQLModel + Alembic project.

Steps:
1. Create the database if it doesn't exist (synchronous).
2. Run Alembic migrations (synchronous).
3. Seed default values (async).
"""

import asyncio
import os
from typing import Optional
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.engine import URL
from alembic.config import Config
from alembic import command

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

# Import your models (make sure they are all in one place or properly imported)
from db.models import (
    Role,
    Account,
    MealType,
    EmailRole,
)


# ------------------------------------------------------------------------------
# Load environment variables
# ------------------------------------------------------------------------------
load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_SERVER = os.getenv("DB_SERVER", "localhost")
DB_NAME = os.getenv("DB_NAME", "mealrequestdb")

# ------------------------------------------------------------------------------
# Database URLs
# ------------------------------------------------------------------------------
# 1) Async URL (used by AsyncEngine in SQLModel):
ASYNC_DATABASE_URL = (
    f"mysql+asyncmy://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?charset=utf8mb4"
)

# 2) Synchronous base URL (used to create DB if it doesn't exist and run Alembic):
BASE_SYNC_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}"
SYNC_DATABASE_URL = f"{BASE_SYNC_URL}/{DB_NAME}?charset=utf8mb4"


# ------------------------------------------------------------------------------
# 1. Create Database If Not Exists (Synchronous)
# ------------------------------------------------------------------------------
def create_database_if_not_exists() -> None:
    """
    Check and create the database if it does not exist.
    Uses a synchronous connection so that we can run Alembic migrations after.
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
def create_tables() -> None:
    """
    Create all tables in the database if they don't exist.
    Uses the SQLModel metadata to generate the schema.
    """
    from db.models import SQLModel  # Import all models

    print("Creating tables...")
    try:
        engine = create_engine(SYNC_DATABASE_URL, echo=True, future=True)
        SQLModel.metadata.create_all(engine)
        print("Tables created successfully.")
    except OperationalError as e:
        print(f"Error creating tables: {e}")
        exit(1)


# ------------------------------------------------------------------------------
# 3. Seed Default Values (Async)
# ------------------------------------------------------------------------------
async def seed_default_values() -> None:
    """
    Insert default values into the database using an async session.
    Includes:
      - Roles: Admin, User, Waiter, Chef, Manager, Cashier, Stockcontroller
      - EmailRoles: Request, Confirmation
      - MealTypes: Lunch, Dinner
      - A default admin user (username='admin', password='securepassword123', role='Admin')
    """
    print("Seeding default values (async) ...")

    # Create an async engine
    engine = create_async_engine(ASYNC_DATABASE_URL, echo=False, future=True)

    # Open async session
    async with AsyncSession(engine) as session:
        # -------------------------------------------
        # Create Roles
        # -------------------------------------------
        existing_roles = (await session.exec(select(Role))).all()
        if not existing_roles:
            roles_to_insert = [
                Role(name="Admin"),
                Role(name="User"),
                Role(name="Waiter"),
                Role(name="Chef"),
                Role(name="Manager"),
                Role(name="Cashier"),
                Role(name="Stockcontroller"),
            ]
            session.add_all(roles_to_insert)
            print("Default roles added.")

        # -------------------------------------------
        # Create Email Roles
        # -------------------------------------------
        existing_email_roles = (await session.exec(select(EmailRole))).all()
        if not existing_email_roles:
            email_roles_to_insert = [
                EmailRole(name="Request"),
                EmailRole(name="Confirmation"),
            ]
            session.add_all(email_roles_to_insert)
            print("Default email roles added.")

        # -------------------------------------------
        # Create Meal Types
        # -------------------------------------------
        existing_meal_types = (await session.exec(select(MealType))).all()
        if not existing_meal_types:
            meal_types_to_insert = [
                MealType(name="Lunch"),
                MealType(name="Dinner"),
            ]
            session.add_all(meal_types_to_insert)
            print("Default meal types added.")

        # -------------------------------------------
        # Create Admin User
        # -------------------------------------------
        # For demonstration, we'll only create 'admin' if not present
        admin_user = (
            await session.exec(select(Account).where(Account.username == "admin"))
        ).first()
        if not admin_user:
            # You can store hashed passwords in a real scenario
            admin_user = Account(
                username="admin",
                password="securepassword123",  # ideally hashed
            )
            session.add(admin_user)
            print("Default admin account added.")

        await session.commit()
    print("Default values seeding complete.")


# ------------------------------------------------------------------------------
# Main Entry Point
# ------------------------------------------------------------------------------
async def main_async() -> None:
    """
    Main async entry to orchestrate the entire DB setup.
    """
    create_database_if_not_exists()  # Step 1: Create the database (synchronous)
    create_tables()  # Step 2
    await seed_default_values()  # Step 3


if __name__ == "__main__":
    print("Starting database setup...")
    asyncio.run(main_async())
    print("Database setup and default values insertion completed successfully.")
