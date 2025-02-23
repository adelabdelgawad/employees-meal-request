import logging
from typing import List
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlmodel import select, or_
from sqlmodel.ext.asyncio.session import AsyncSession
from db.models import Employee, HRISSecurityUser, Department
from hris_db.models import (
    HRISOrganizationUnit,
    HRISEmployee,
    HRISPosition,
    HRISHRISSecurityUser,
    HRISEmployeePosition,
)
from sqlalchemy.dialects.mysql import insert

# Logger setup
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Scheduler instance
scheduler = AsyncIOScheduler()


async def add_and_commit(session: AsyncSession, items: List):
    """Add and commit multiple items in a single transaction."""
    session.add_all(items)
    await session.commit()
    for item in items:
        await session.refresh(item)


async def replicate(
    hris_session: AsyncSession, app_session: AsyncSession
) -> None:
    """
    Replicate data from HRIS database to the local application database.

    :param hris_session: AsyncSession connected to HRIS database.
    :param app_session: AsyncSession connected to the local application database.
    """
    logger.info("Starting data replication from HRIS to local database.")
    try:
        await _create_or_update_security_users(hris_session, app_session)
        await _create_or_update_departments(hris_session, app_session)
        await _create_or_update_employees(hris_session, app_session)
        logger.info("Data replication completed successfully.")
    except Exception as e:
        logger.error(
            f"An error occurred during data replication: {e}", exc_info=True
        )


def schedule_replication(
    hris_session: AsyncSession, app_session: AsyncSession
):
    """
    Schedule the data replication task to run periodically (every hour).
    """
    scheduler.add_job(
        replicate,
        trigger=IntervalTrigger(hours=1),
        args=[hris_session, app_session],
        id="replication_task",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduled data replication task.")


async def _create_or_update_security_users(
    hris_session: AsyncSession, app_session: AsyncSession
):
    """
    Fetch HRIS security users and update or insert them into the local database.
    """
    logger.info("Fetching active HRIS security users from the HRIS database.")
    try:
        # Fetch active and unlocked HRIS security users
        statement = select(HRISHRISSecurityUser).where(
            HRISHRISSecurityUser.is_deleted == False,
            HRISHRISSecurityUser.is_locked == False,
        )
        result = await hris_session.execute(statement)
        hris_sec_users = result.scalars().all()

        if not hris_sec_users:
            logger.info("No active HRIS security users found.")
            return

        logger.info(
            f"Retrieved {len(hris_sec_users)} security users from HRIS."
        )

        for hris_sec_user in hris_sec_users:
            try:
                # Check if the user exists in the local database
                statement = select(HRISSecurityUser).where(
                    or_(
                        HRISSecurityUser.id == hris_sec_user.id,
                        HRISSecurityUser.username == hris_sec_user.name,
                    )
                )
                result = await app_session.execute(statement)
                sec_user = result.scalars().first()

                if sec_user:
                    # Update existing user
                    logger.info(
                        f"Updating security user: {sec_user.username} (ID: {sec_user.id})"
                    )
                    sec_user.username = hris_sec_user.name
                    sec_user.is_deleted = hris_sec_user.is_deleted
                    sec_user.is_locked = hris_sec_user.is_locked
                else:
                    new_user = HRISSecurityUser(
                        id=hris_sec_user.id,
                        username=hris_sec_user.name,
                        is_deleted=hris_sec_user.is_deleted,
                        is_locked=hris_sec_user.is_locked,
                    )

                    app_session.add(new_user)
                    await app_session.commit()
                    
                    # Prepare new user for insertion
                    logger.info(
                        f"Inserting new security user: {hris_sec_user.name} (ID: {hris_sec_user.id})"
                    )
            except Exception as e:
                logger.error(
                    f"Error processing security user {hris_sec_user.id}: {e}"
                )

        else:
            # Commit updates to existing users
            await app_session.commit()
            logger.info(
                "No new users to insert; committed updates to existing users."
            )

    except Exception as e:
        logger.error(f"Error updating security users: {e}", exc_info=True)
        await app_session.rollback()


async def _create_or_update_departments(
    hris_session: AsyncSession, app_session: AsyncSession
):
    """
    Fetch HRIS organization units (departments) and update or insert them
    into the local database.
    """
    logger.info("Fetching HRIS departments from the HRIS database.")

    try:
        hris_departments = (
            (await hris_session.execute(select(HRISOrganizationUnit)))
            .scalars()
            .all()
        )
        if not hris_departments:
            logger.info("No HRIS departments found.")
            return

        new_departments = []
        for hris_dep in hris_departments:
            statement = select(Department).where(Department.id == hris_dep.id)
            result = await app_session.execute(statement)
            dep = result.scalars().first()

            if dep:
                logger.info(f"Updating department: {dep.name} (ID: {dep.id})")
                dep.name = hris_dep.name
            else:
                logger.info(
                    f"Inserting new department: {hris_dep.name} (ID: {hris_dep.id})"
                )
                new_departments.append(
                    Department(id=hris_dep.id, name=hris_dep.name)
                )

        if new_departments:
            await add_and_commit(app_session, new_departments)
        else:
            await app_session.commit()

        logger.info("Departments successfully updated in the local database.")

    except Exception as e:
        logger.error(f"Error updating departments: {e}", exc_info=True)


async def _create_or_update_employees(
    hris_session: AsyncSession, app_session: AsyncSession
):
    """
    Fetch HRIS employees and update or insert them into the local database.
    """
    logger.info("Fetching active HRIS employees from the HRIS database.")
    try:
        # Fetch active HRIS employees with their positions
        statement = (
            select(
                HRISEmployee.id,
                HRISEmployee.code,
                HRISEmployee.ar_f_name,
                HRISEmployee.ar_s_name,
                HRISEmployee.ar_th_name,
                HRISEmployee.ar_l_name,
                HRISEmployeePosition.org_unit_id,
                HRISPosition.en_name.label("title"),
            )
            .join(
                HRISEmployeePosition,
                HRISEmployee.id == HRISEmployeePosition.employee_id,
            )
            .join(
                HRISPosition,
                HRISEmployeePosition.position_id == HRISPosition.id,
            )
            .where(HRISEmployee.is_active == True)
        )

        result = await hris_session.execute(statement)
        hris_employees_with_positions = result.all()

        if not hris_employees_with_positions:
            logger.info("No active HRIS employees found.")
            return

        logger.info(
            f"Retrieved {len(hris_employees_with_positions)} employees from HRIS."
        )

        for emp_data in hris_employees_with_positions:
            full_name = " ".join(
                filter(
                    None,
                    [
                        emp_data.ar_f_name,
                        emp_data.ar_s_name,
                        emp_data.ar_th_name,
                        emp_data.ar_l_name,
                    ],
                )
            ).strip()

            # Prepare the insert statement with ON DUPLICATE KEY UPDATE
            insert_stmt = insert(Employee).values(
                id=emp_data.id,
                code=emp_data.code,
                name=full_name,
                title=emp_data.title,
                is_active=True,
                department_id=emp_data.org_unit_id,
            )

            # Define the update statement for duplicate keys
            update_stmt = {
                "code": insert_stmt.inserted.code,
                "name": insert_stmt.inserted.name,
                "title": insert_stmt.inserted.title,
                "is_active": insert_stmt.inserted.is_active,
                "department_id": insert_stmt.inserted.department_id,
            }

            # Combine insert and update statements
            upsert_stmt = insert_stmt.on_duplicate_key_update(update_stmt)

            # Execute the upsert statement
            await app_session.execute(upsert_stmt)

        # Commit the transaction
        await app_session.commit()
        logger.info("Upserted employees successfully.")

    except Exception as e:
        logger.error(f"Error updating employees: {e}", exc_info=True)
        await app_session.rollback()
