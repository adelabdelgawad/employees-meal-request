import logging
from typing import List
from fastapi import APIRouter, HTTPException
from sqlmodel import select
from db.models import Meal
from src.dependencies import CurrentUserDep, SessionDep

# Logger setup
logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/meal", response_model=List[Meal])
async def read_meals(
    session: SessionDep,
    user: CurrentUserDep,
) -> List[Meal]:
    """
    Retrieve all meals.

    Args:
        session (SessionDep): The database session dependency.
        user (CurrentUserDep): The current authenticated user dependency.

    Returns:
        List[Meal]: A list of Meal instances.

    Raises:
        HTTPException: If there is an error retrieving meals from the database.
    """
    try:
        result = await session.execute(select(Meal))
        meals = result.scalars().all()
        logger.info(f"Retrieved {len(meals)} meals from the database.")
        return meals
    except Exception as e:
        logger.error(f"Failed to fetch meals: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to fetch meals"
        ) from e
