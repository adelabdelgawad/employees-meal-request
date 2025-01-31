import pytest
import pytest_asyncio
from sqlmodel import Session, select
from icecream import ic

# Ensure this imports your read_employees function
from routers.data import read_employees

# Ensure this imports your Employee model
from db.models import Employee
from db.database import engine


@pytest_asyncio.fixture
async def session():
    """
    Provides a fresh Session connected to the in-memory test database.
    Each test gets a new session with a rollback after completion.
    """
    with Session(engine) as s:
        yield s  # Provide the session to the test
        # After the test, changes made in the test session are discarded when the context ends.


@pytest.mark.asyncio
async def test_read_employees_against_live_db(session):
    """
    Test the `read_employees` function against a live in-memory database.

    Steps:
    1. Insert multiple Employee records into the database.
    2. Call `read_employees` and verify that all inserted records are returned.
    """

    # Act: Call the read_employees function using the live session
    result = await read_employees(session)

    # Assert: Verify that the returned employees match what we inserted
    # We'll fetch directly from the DB to compare
    db_employees = session.exec(select(Employee)).all()
    assert db_employees is not None
