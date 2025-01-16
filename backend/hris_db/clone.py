import logging
from typing import List, Annotated
from datetime import date

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from fastapi import Depends
from sqlmodel import select, func, Date
from sqlmodel.ext.asyncio.session import AsyncSession

from db.models import Employee, HRISSecurityUser, Department, EmployeeShift
from hris_db.database import get_hris_session
from hris_db.models import (
    HRISOrganizationUnit,
    HRISEmployee,
    HRISPosition,
    HRISShiftAssignment,
    HRISHRISSecurityUser,
    HRISEmployeePosition,
    TMSShift,
)

# Logger setup
logger = logging.getLogger(__name__)

# Scheduler instance
scheduler = AsyncIOScheduler()


async def add_and_commit(session: AsyncSession, items: List):
    """
    Add a list of items to the database session and commit the transaction.
    Also refreshes the items after commit.

    :param session: SQLModel AsyncSession for database operations.
    :param items: A list of new items to add and commit to the database.
    """
    session.add_all(items)
    await session.commit()
    for item in items:
        await session.refresh(item)


async def replicate(
    hris_session: AsyncSession, app_session: AsyncSession
) -> None:
    """
    Replicate data from the HRIS database to the local application database.
    This includes departments, employees, shifts, and security users.

    :param hris_session: AsyncSession connected to the HRIS database.
    :param app_session: AsyncSession connected to the local application database.
    """
    logger.info("Starting data replication from HRIS to local database.")
    try:
        await _create_or_update_security_users(hris_session, app_session)
        await _create_or_update_departments(hris_session, app_session)
        await _create_or_update_employees(hris_session, app_session)
        await _create_or_update_shifts(hris_session, app_session)
        logger.info("Data replication completed successfully.")
    except Exception as e:
        logger.error(
            "An error occurred during data replication:", exc_info=True
        )


def schedule_replication(
    hris_session: AsyncSession, app_session: AsyncSession
):
    """
    Schedule the data replication task to run periodically (every hour).

    :param hris_session: AsyncSession connected to the HRIS database.
    :param app_session: AsyncSession connected to the local application database.
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


async def _create_or_update_departments(
    hris_session: AsyncSession, app_session: AsyncSession
):
    """
    Fetch HRIS organization units (departments) and update or insert them
    into the local database.

    :param hris_session: AsyncSession connected to the HRIS database.
    :param app_session: AsyncSession connected to the local application database.
    """
    hris_departments = (
        (await hris_session.execute(select(HRISOrganizationUnit)))
        .scalars()
        .all()
    )
    for hris_dep in hris_departments:
        dep = (
            await app_session.execute(
                select(Department).where(Department.id == hris_dep.id)
            )
        ).scalar_one_or_none()
        if dep:
            dep.name = hris_dep.name  # Update existing department
        else:
            new_dep = Department(id=hris_dep.id, name=hris_dep.name)
            app_session.add(new_dep)
    await app_session.commit()


async def _create_or_update_employees(
    hris_session: AsyncSession, app_session: AsyncSession
):
    """
    Fetch HRIS employees and their active positions, update or insert them into the local database.

    :param hris_session: AsyncSession connected to the HRIS database.
    :param app_session: AsyncSession connected to the local application database.
    """
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
            HRISPosition, HRISEmployeePosition.position_id == HRISPosition.id
        )
        .where(HRISEmployee.is_active == True)
    )

    hris_employees_with_positions = (
        await hris_session.execute(statement)
    ).all()
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
        emp = (
            await app_session.execute(
                select(Employee).where(Employee.id == emp_data.id)
            )
        ).scalar_one_or_none()
        if emp:
            emp.code, emp.name, emp.title, emp.is_active, emp.department_id = (
                emp_data.code,
                full_name,
                emp_data.title,
                True,
                emp_data.org_unit_id,
            )
        else:
            new_emp = Employee(
                id=emp_data.id,
                code=emp_data.code,
                name=full_name,
                title=emp_data.title,
                is_active=True,
                department_id=emp_data.org_unit_id,
            )
            app_session.add(new_emp)
    await app_session.commit()


async def _create_or_update_shifts(
    hris_session: AsyncSession, app_session: AsyncSession
):
    """
    Fetch HRIS shift assignments and update or insert them into the local database.

    :param hris_session: AsyncSession connected to the HRIS database.
    :param app_session: AsyncSession connected to the local application database.
    """
    try:
        statement = (
            select(
                HRISShiftAssignment.id,
                HRISShiftAssignment.employee_id,
                HRISShiftAssignment.duration_hours,
                HRISShiftAssignment.date_from,
            )
            .join(
                TMSShift,
                HRISShiftAssignment.shift_id == TMSShift.id,
                isouter=True,
            )
            .where(
                func.cast(HRISShiftAssignment.date_from, Date)
                == func.cast(func.getdate(), Date)
            )
        )
        hris_shifts = (await hris_session.execute(statement)).fetchall()
        for hris_shift in hris_shifts:
            shift = (
                await app_session.execute(
                    select(EmployeeShift).where(
                        EmployeeShift.id == hris_shift.id
                    )
                )
            ).scalar_one_or_none()
            if shift:
                shift.employee_id, shift.duration_hours, shift.date_from = (
                    hris_shift.employee_id,
                    hris_shift.duration_hours,
                    hris_shift.date_from,
                )
            else:
                new_shift = EmployeeShift(
                    id=hris_shift.id,
                    employee_id=hris_shift.employee_id,
                    duration_hours=hris_shift.duration_hours,
                    date_from=hris_shift.date_from,
                )
                app_session.add(new_shift)
        await app_session.commit()

    except Exception as e:
        logger.error(f"An error occurred during data replication: {e}")


async def _create_or_update_security_users(
    hris_session: AsyncSession, app_session: AsyncSession
):
    """
    Fetch HRIS security users and update or insert them into the local database.

    :param hris_session: AsyncSession connected to the HRIS database.
    :param app_session: AsyncSession connected to the local application database.
    """
    statement = select(HRISHRISSecurityUser).where(
        HRISHRISSecurityUser.is_deleted == False,
        HRISHRISSecurityUser.is_locked == False,
    )
    hris_sec_users = (await hris_session.execute(statement)).scalars().all()
    for hris_sec_user in hris_sec_users:
        sec_user = (
            await app_session.execute(
                select(HRISSecurityUser).where(
                    HRISSecurityUser.id == hris_sec_user.id
                )
            )
        ).scalar_one_or_none()
        if not sec_user:
            sec_user = (
                await app_session.execute(
                    select(HRISSecurityUser).where(
                        HRISSecurityUser.username == hris_sec_user.name
                    )
                )
            ).scalar_one_or_none()
        if sec_user:
            sec_user.username, sec_user.is_deleted, sec_user.is_locked = (
                hris_sec_user.name,
                hris_sec_user.is_deleted,
                hris_sec_user.is_locked,
            )
        else:
            new_sec_user = HRISSecurityUser(
                id=hris_sec_user.id,
                username=hris_sec_user.name,
                is_deleted=hris_sec_user.is_deleted,
                is_locked=hris_sec_user.is_locked,
            )
            app_session.add(new_sec_user)
    await app_session.commit()
