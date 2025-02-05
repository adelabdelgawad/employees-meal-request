from migration.db import get_amh_application_session
from sqlmodel import text
from icecream import ic


async def read_account():
    """
    Reads all accounts from the database and logs the results.
    """
    # Correct usage of the async generator with 'async for'
    async for session in get_amh_application_session():
        statement = text("SELECT * FROM account")
        result = await session.execute(statement)
        accounts = result.fetchall()
        return accounts
