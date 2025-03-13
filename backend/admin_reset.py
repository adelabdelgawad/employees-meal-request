import asyncio
from getpass import getpass
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from hris_db.database import get_hris_session
from db.models import Account
from routers.utils.hashing import hash_password


async def reset_password():
    username = input("Enter the username: ")
    new_password = getpass("Enter the new password: ")

    async for session in get_hris_session():
        query = select(Account).where(Account.username == username)
        result = await session.execute(query)
        user: Account = result.one_or_none()

        if user:
            user.password = hash_password(new_password)
            await session.commit()
            print(f"Password for user '{username}' has been updated.")
        else:
            print(f"User '{username}' not found.")


if __name__ == "__main__":
    asyncio.run(reset_password())
