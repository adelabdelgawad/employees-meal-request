from db.models import Role, RolePermission
from sqlmodel import select
from typing import List
from src.dependencies import SessionDep


async def read_role(session: SessionDep, user_id: int) -> list[str]:
    """Fetches a list of role names assigned to a specific user.

    Args:
        session (SessionDep): The database session dependency.
        user_id (int): The ID of the user.

    Returns:
        list[str]: A list of role names associated with the user.
    """
    statement = (
        select(Role.name)
        .join(RolePermission, Role.id == RolePermission.role_id)
        .where(RolePermission.account_id == user_id)
    )

    results = await session.execute(statement)
    return [row for row in results.scalars()]
