from old_db.database import get_old_session
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from old_db.models import Department as Department_old
from old_db.models import Account as Account_old
from old_db.models import Employee as Employee_old
from old_db.models import MealRequest as Request_old
from old_db.models import MealRequestLine as RequestLine_old
from setup_database import main_async


import asyncio
from sqlmodel import select
from icecream import ic
from db.models import (
    Department,
    Account,
    Employee,
    RolePermission,
    Request,
    RequestLine,
)
from typing import Optional, List
from db.database import get_application_session


async def get_old_departments() -> Optional[Department_old]:
    async for session in get_old_session():
        stmt = select(Department_old)
        result = await session.execute(stmt)
        old_departments = result.scalars().all()
        return old_departments if old_departments else None


async def update_departments():
    old_departments: List[Department] = await get_old_departments()
    async for session in get_application_session():
        new_departments = [
            Department(id=d.id, name=d.name) for d in old_departments
        ]
        session.add_all(new_departments)
        await session.commit()


async def get_old_accounts() -> Optional[List[Account_old]]:
    """Fetch all old accounts from the database."""
    async for session in get_old_session():
        try:
            print("Fetching old accounts...")
            stmt = select(Account_old)
            result = await session.execute(stmt)
            old_accounts = result.scalars().all()

            if old_accounts:
                print(f"Found {len(old_accounts)} old accounts.")
                return old_accounts
            else:
                print("No old accounts found.")
                return None
        except Exception as e:
            print(f"Error fetching old accounts: {e}")
            return None


async def update_account():
    """Update accounts by fetching old records, searching LDAP, and saving new accounts."""
    old_accounts: Optional[List[Account_old]] = await get_old_accounts()

    if not old_accounts:
        print("No old accounts to update.")
        return

    async for session in get_application_session():
        try:
            print("Updating accounts...")
            for acc in old_accounts:
                print(f"Processing account: {acc.username}")

                # Fetch user details from LDAP
                # ad_user: DomainUser = await search_ldap(SEARCH_BASES, acc.username)
                # Create updated account
                account = Account(
                    id=acc.id,
                    username=acc.username,
                    fullname="Full Name",
                    title="Title",
                    is_domain_user=acc.is_domain_user,
                    is_super_admin=acc.is_super_admin,
                )

                print(f"Updated account for: {acc.username}")
                session.add(account)
                permission = RolePermission(role_id=2, account_id=account.id)
                session.add(permission)

                await session.commit()

        except Exception as e:
            print(f"Error updating accounts: {e}")
            await session.rollback()


async def get_old_employees() -> Optional[Employee_old]:
    async for session in get_old_session():
        stmt = select(Employee_old)
        result = await session.execute(stmt)
        old_departments = result.scalars().all()
        return old_departments if old_departments else None


async def update_employees():
    old_employees: List[Employee_old] = await get_old_employees()
    async for session in get_application_session():
        new_employees = [
            Employee(
                id=e.id,
                code=e.code,
                name=e.name,
                title=e.title,
                is_active=e.is_active,
                department_id=e.department_id,
            )
            for e in old_employees
        ]

        session.add_all(new_employees)
        await session.commit()


async def get_old_requests() -> Optional[List[Request_old]]:
    """Fetch all old requests from the database."""
    async for session in get_old_session():
        try:
            print("Fetching old requests...")
            stmt = select(Request_old)
            result = await session.execute(stmt)
            old_requests = result.scalars().all()

            if old_requests:
                print(f"Found {len(old_requests)} old requests.")
                return old_requests
            else:
                print("No old requests found.")
                return None
        except Exception as e:
            print(f"Error fetching old requests: {e}")
            return None


async def update_requests():
    """Copy old requests into the new database as new instances."""

    def update_status_id(id):
        if id == 3:
            return 4
        if id == 2:
            return 3

    def update_meal_id(id):
        if id == 2:
            return 1
        if id == 3:
            return 2

    old_requests: Optional[List[Request_old]] = await get_old_requests()

    if not old_requests:
        print("No old requests to update.")
        return

    async for session in get_application_session():
        try:
            print("Updating requests...")

            new_requests = [
                Request(
                    id=req.id,
                    status_id=update_status_id(req.status_id),
                    requester_id=req.requester_id,
                    meal_id=update_meal_id(req.meal_type_id),
                    request_time=req.request_time,
                    created_time=req.request_time,
                    closed_time=req.closed_time,
                    notes=req.notes,
                    is_deleted=False,
                    auditor_id=req.closed_by_id,
                    menu_id=1,
                )
                for req in old_requests
            ]

            print(f"Saving {len(new_requests)} new requests...")
            session.add_all(new_requests)
            await session.commit()
            print("Requests successfully updated.")

        except Exception as e:
            print(f"Error updating requests: {e}")
            await session.rollback()


async def get_old_request_lines() -> Optional[List[RequestLine_old]]:
    """Fetch all old request lines with necessary joins."""
    async for session in get_old_session():
        try:
            print("Fetching old request lines with joins...")

            stmt = select(RequestLine_old).options(
                joinedload(
                    RequestLine_old.meal_request
                ),  # Load Request (Parent)
                joinedload(RequestLine_old.employee),  # Load Employee
            )

            result = await session.execute(stmt)
            old_request_lines = result.scalars().all()

            if old_request_lines:
                print(f"Found {len(old_request_lines)} old request lines.")
                return old_request_lines
            else:
                print("No old request lines found.")
                return None

        except Exception as e:
            print(f"Error fetching old request lines: {e}")
            return None


async def update_request_lines():
    """Copy old request lines into the new database with correct meal_id and employee_code."""
    old_request_lines: Optional[List[RequestLine_old]] = (
        await get_old_request_lines()
    )

    if not old_request_lines:
        print("No old request lines to update.")
        return

    async for session in get_application_session():
        try:
            print("Validating request IDs...")

            # Fetch all valid request IDs from the new `Request` table
            valid_request_ids = {
                r.id
                for r in (await session.execute(select(Request)))
                .scalars()
                .all()
            }

            new_request_lines = []
            for req_line in old_request_lines:
                # Extract the related meal_id from the parent Request
                meal_id = (
                    req_line.meal_request.meal_type_id
                    if req_line.meal_request
                    else None
                )

                # Extract the employee_code from the related Employee table
                employee_code = (
                    req_line.employee.code if req_line.employee else None
                )

                # Validate `request_id`
                if req_line.meal_request_id not in valid_request_ids:
                    print(
                        f"Skipping request line {req_line.id} because request_id {req_line.meal_request_id} does not exist in the new database."
                    )
                    continue

                # Create the new RequestLine instance
                new_request_line = RequestLine(
                    id=req_line.id,
                    employee_id=req_line.employee_id,
                    employee_code=employee_code,  # Now correctly fetched from Employee table
                    department_id=req_line.department_id,
                    request_id=req_line.meal_request_id,
                    meal_id=meal_id,  # Now correctly fetched from the Request table
                    attendance_in=None,
                    attendance_out=None,
                    notes=req_line.notes,
                    is_accepted=req_line.is_accepted,
                    shift_hours=None,
                    is_deleted=False,
                )

                new_request_lines.append(new_request_line)

            if new_request_lines:
                print(f"Saving {len(new_request_lines)} new request lines...")
                session.add_all(new_request_lines)
                await session.commit()
                print("Request lines successfully updated.")
            else:
                print("No valid request lines to insert.")

        except Exception as e:
            print(f"Error updating request lines: {e}")
            await session.rollback()


async def main():
    # await update_departments()
    # await update_account()
    # await update_employees()
    # await main_async()
    await update_requests()
    await update_request_lines()


if __name__ == "__main__":
    asyncio.run(main())
