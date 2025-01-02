import traceback
import logging
import os
from dotenv import load_dotenv
from typing import List, Annotated
from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi.concurrency import run_in_threadpool
from passlib.context import CryptContext

from db.application.database import get_application_session, create_db_and_tables
from db.application.models import (
    Account,
    Page,
    MealRequestStatus,
    EmailRole,
    MealType,
    Role,
    PagePermission,
)
from db.hris.database import get_hris_session
from src.replicate_hris import schedule_replication, scheduler, replicate

# Load environment variables
load_dotenv()
logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependency annotations
SessionDep = Annotated[AsyncSession, Depends(get_application_session)]
HRISSessionDep = Annotated[AsyncSession, Depends(get_hris_session)]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan management. Sets up the database and replication process.
    """
    try:
        logger.info("Initializing database setup...")
        await create_db_and_tables()
        logger.info("Database setup completed successfully.")

        # async for app_session in get_application_session():
        #     async for hris_session in get_hris_session():
        #         await create_initial_data(app_session)
        #         await replicate(hris_session, app_session)

        schedule_replication(HRISSessionDep, SessionDep)
        if not scheduler.running:
            scheduler.start()
        else:
            logger.info("Scheduler already running, skipping start.")

        yield
    except Exception as e:
        logger.error(f"Error during app startup: {e}")
        logger.error(traceback.format_exc())
        yield
    finally:
        scheduler.shutdown()


async def create_initial_data(session: AsyncSession):
    """
    Initialize default application data.
    """
    await _create_root_account(session)
    await _create_roles(session)
    await _create_web_pages(session)
    await _create_request_statuses(session)
    await _create_email_roles(session)
    await _create_meal_types(session)
    await _create_page_permissions(session)


async def _add_and_commit(session: AsyncSession, items: List):
    """
    Add a list of items to the session and commit asynchronously.
    """
    session.add_all(items)
    await session.commit()
    for item in items:
        await session.refresh(item)


async def _create_root_account(session: AsyncSession):
    """
    Create a root account if it doesn't already exist.
    """
    username = os.getenv("APP_USERNAME")
    password = os.getenv("APP_PASSWORD")

    if not username or not password:
        logger.warning(
            "APP_USERNAME or APP_PASSWORD not set. Skipping root account creation."
        )
        return

    hashed_password = pwd_context.hash(password)

    existing_account = await session.execute(
        select(Account).where(Account.username == username)
    )
    existing_account = existing_account.scalar_one_or_none()

    if existing_account:
        logger.info("Root account already exists. Skipping creation.")
        return

    account = Account(username=username,
                      password=hashed_password, is_super_admin=True)
    await _add_and_commit(session, [account])
    logger.info("Root account created successfully.")


async def _create_web_pages(session: AsyncSession):
    """
    Create default web pages if they don't already exist.
    """
    existing_pages = await session.execute(select(Page))
    existing_page_names = {page.name for page in existing_pages.scalars()}

    new_pages = [
        Page(name="MealRequest"),
        Page(name="RequestDetails"),
        Page(name="RequestAnalysisDashboard"),
        Page(name="RoleManagement"),
        Page(name="AccountsManagement"),
    ]

    pages_to_add = [
        page for page in new_pages if page.name not in existing_page_names]
    if pages_to_add:
        await _add_and_commit(session, pages_to_add)
        logger.info("Default web pages created successfully.")


async def _create_request_statuses(session: AsyncSession):
    """
    Create default request statuses if they don't already exist.
    """
    existing_statuses = await session.execute(select(MealRequestStatus))
    existing_names = {status.name for status in existing_statuses.scalars()}

    new_statuses = [
        MealRequestStatus(name="Pending"),
        MealRequestStatus(name="Approved"),
        MealRequestStatus(name="Rejected"),
    ]

    statuses_to_add = [
        status for status in new_statuses if status.name not in existing_names
    ]
    if statuses_to_add:
        await _add_and_commit(session, statuses_to_add)
        logger.info("Default request statuses created successfully.")


async def _create_email_roles(session: AsyncSession):
    """
    Create default email roles if they don't already exist.
    """
    existing_roles = await session.execute(select(EmailRole))
    existing_names = {role.name for role in existing_roles.scalars()}

    new_roles = [
        EmailRole(name="Request_CC"),
        EmailRole(name="Confirmation_CC"),
        EmailRole(name="Rejected"),
    ]

    roles_to_add = [
        role for role in new_roles if role.name not in existing_names]
    if roles_to_add:
        await _add_and_commit(session, roles_to_add)
        logger.info("Default email roles created successfully.")


async def _create_meal_types(session: AsyncSession):
    """
    Create default meal types if they don't already exist.
    """
    existing_types = await session.execute(select(MealType))
    existing_names = {meal_type.name for meal_type in existing_types.scalars()}

    new_meal_types = [
        MealType(name="Breakfast"),
        MealType(name="Lunch"),
        MealType(name="Dinner"),
    ]

    types_to_add = [
        meal_type
        for meal_type in new_meal_types
        if meal_type.name not in existing_names
    ]
    if types_to_add:
        await _add_and_commit(session, types_to_add)
        logger.info("Default meal types created successfully.")


async def _create_roles(session: AsyncSession):
    """
    Create default roles if they don't already exist.
    """
    existing_roles = await session.execute(select(Role))
    existing_names = {role.name for role in existing_roles.scalars()}

    new_roles = [
        Role(name="Requester"),
        Role(name="RequestTaker"),
        Role(name="Captain"),
        Role(name="StockControl"),
    ]

    roles_to_add = [
        role for role in new_roles if role.name not in existing_names]
    if roles_to_add:
        await _add_and_commit(session, roles_to_add)
        logger.info("Default roles created successfully.")


async def _create_page_permissions(session: AsyncSession):
    """
    Create default page permissions if they don't already exist.
    """
    existing_permissions = await session.execute(select(PagePermission))
    existing_pairs = {
        (perm.role_id, perm.page_id) for perm in existing_permissions.scalars()
    }

    new_permissions = [
        # Requester Role
        (1, 1),
        # RequestTaker Role
        (2, 2),
        (2, 3),
        # Captain Role
        (3, 2),
        (3, 3),
        (3, 5),
        # StockControl Role
        (4, 2),
        (4, 3),
    ]

    perms_to_add = [
        PagePermission(role_id=role_id, page_id=page_id, created_by_id=1)
        for (role_id, page_id) in new_permissions
        if (role_id, page_id) not in existing_pairs
    ]

    if perms_to_add:
        await _add_and_commit(session, perms_to_add)
        logger.info("Default page permissions created successfully.")
