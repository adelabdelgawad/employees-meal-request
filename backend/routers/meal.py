import datetime
import logging
from typing import List
from fastapi import APIRouter, HTTPException
import icecream
from sqlmodel import select, delete
from db.models import Meal, MealSchedule
from services.http_schema import MealWithScheduleResponse
from src.dependencies import CurrentUserDep, SessionDep
from sqlalchemy.orm import selectinload

# Logger setup
logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/meal", response_model=List[MealWithScheduleResponse])
async def read_meals(
    session: SessionDep,
    user: CurrentUserDep,
) -> List[MealWithScheduleResponse]:
    """
    Retrieve all meals along with their schedules.

    Args:
        session (SessionDep): The database session dependency.
        user (CurrentUserDep): The current authenticated user dependency.

    Returns:
        List[MealWithScheduleResponse]: A list of Meal instances, each including its schedules.

    Raises:
        HTTPException: If there is an error retrieving meals from the database.
    """
    try:
        result = await session.execute(
            select(Meal).options(selectinload(Meal.meal_schedules))
        )
        meals = result.scalars().all()
        logger.info(f"Retrieved {len(meals)} meals from the database.")
        return meals
    except Exception as e:
        logger.error(f"Failed to fetch meals: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to fetch meals"
        ) from e
        


@router.get("/active-meal", response_model=List[Meal])
def get_active_meals_in_schedule(session: SessionDep):
    """
    Retrieves meals that are active and currently within one of their scheduled appearance intervals.

    A meal is considered active if:
      - Its `is_active` property is True.
      - The current time is between any associated MealSchedule's `schedule_from` and `schedule_to`.

    Args:
        session (SessionDep): A SQLModel session for database operations.

    Returns:
        List[Meal]: A list of Meal instances meeting the criteria.
    """
    try:
        current_time = datetime.datetime.now().time()
        statement = (
            select(Meal)
            .join(MealSchedule)
            .where(
                Meal.is_active == True,
                MealSchedule.schedule_from <= current_time,
                MealSchedule.schedule_to >= current_time,
            )
        )
        meals = session.execute(statement).all()
        return meals
    except Exception as exc:
        logger.error("Error retrieving active meals", exc_info=True)
        raise HTTPException(
            status_code=500, detail="Error retrieving active meals"
        )


@router.get("/meals/{meal_id}/schedules", response_model=List[MealSchedule])
async def get_meal_schedules(meal_id: int, session: SessionDep):
    """
    Load all schedule intervals for a specific meal.
    """
    meal = await session.get(Meal, meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    result = await session.execute(
        select(MealSchedule).where(MealSchedule.meal_id == meal_id)
    )
    schedules = result.scalars().all()
    return schedules


@router.post("/meals/{meal_id}/schedules")
async def update_meal_schedules(
    meal_id: int, schedules: List[MealSchedule], session: SessionDep
):
    """
    Updates a meal's schedule intervals by:
      - Deleting existing schedules for the meal.
      - Inserting the new schedule intervals provided.

    Args:
        meal_id (int): The ID of the meal to update.
        schedules (List[MealSchedule]): A list of new MealSchedule objects.
        session (SessionDep): A SQLModel session for database operations.

    Returns:
        A success message if the update is successful.

    Raises:
        HTTPException: If the meal is not found or an error occurs during the update.
    """
    meal = await session.get(Meal, meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    try:
        # Delete existing schedules for the specified meal.
        await session.execute(
            delete(MealSchedule).where(MealSchedule.meal_id == meal_id)
        )
        # Add new schedules.
        for schedule in schedules:
            new_schedule = MealSchedule(
                meal_id=meal_id,
                schedule_from=schedule.schedule_from,
                schedule_to=schedule.schedule_to,
            )
            session.add(new_schedule)

        await session.commit()
        icecream.ic(new_schedule)

        logger.info(f"Updated schedules for meal {meal_id}")
        return {"status": "success", "meal_id": meal_id}
    except Exception as exc:
        logger.error(
            f"Error updating schedules for meal {meal_id}: {exc}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500, detail="Failed to update meal schedules"
        )
