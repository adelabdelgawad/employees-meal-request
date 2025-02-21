import asyncio
from getpass import getpass
from sqlmodel.ext.asyncio.session import AsyncSession
from db.database import get_application_session
from db.models import Account
from routers.utils.hashing import hash_password


async def create_user():
    username = input("Enter the new username: ")
    password = getpass("Enter the password: ")
    full_name = input("Enter the full name: ")
    title = input("Enter the title: ")
    is_super_admin = (
        input("Is this user a super admin? (yes/no): ").strip().lower()
        == "yes"
    )

    async for session in get_application_session():
        hashed_password = hash_password(password)
        new_user = Account(
            username=username,
            password=hashed_password,
            full_name=full_name,
            title=title,
            is_super_admin=is_super_admin,
        )
        session.add(new_user)
        await session.commit()
        print(f"User '{username}' has been created.")


if __name__ == "__main__":
    asyncio.run(create_user())
