import datetime
import logging
from typing import List
from fastapi import APIRouter, HTTPException
import icecream
from sqlmodel import select, delete
from db.models import Meal, MealSchedule
from services.http_schema import (
    MealActivationUpdateRequest,
    MealScheduleResponse,
    MealWithScheduleResponse,
    ScheduleUpdateRequest,
)
from src.dependencies import CurrentUserDep, SessionDep
from sqlalchemy.orm import selectinload

# Logger setup
logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/meal/", response_model=List[MealWithScheduleResponse])
async def get_meals_with_schedules(session: SessionDep):
    """
    Fetch all meals with their schedules.

    Returns:
        List[MealWithScheduleResponse]: A list of meals with their associated schedules.
    """
    logger.info("Fetching all meals with their schedules")
    try:
        # Eagerly load related meal schedules
        statement = select(Meal).options(selectinload(Meal.meal_schedules))
        result = await session.execute(statement)
        meals = result.scalars().all()  # Directly get Meal instances

        if not meals:
            logger.info("No meals found")
            return []

        return [serialize_meal(meal) for meal in meals]

    except Exception as e:
        logger.exception("Error fetching meals")
        raise HTTPException(status_code=500, detail="Failed to fetch meals")


def serialize_meal(meal: Meal) -> MealWithScheduleResponse:
    """
    Convert a Meal SQLModel instance into a MealWithScheduleResponse.

    Args:
        meal (Meal): The Meal instance to transform.

    Returns:
        MealWithScheduleResponse: The serialized meal with schedules.
    """
    schedules = (
        [
            MealScheduleResponse(
                id=schedule.id,
                meal_id=schedule.meal_id,
                schedule_id=schedule.id,
                schedule_from=schedule.schedule_from.isoformat(),  # Convert time to ISO format string
                schedule_to=schedule.schedule_to.isoformat(),  # Convert time to ISO format string
            )
            for schedule in meal.meal_schedules
        ]
        if meal.meal_schedules
        else None
    )

    result = MealWithScheduleResponse(
        id=meal.id,
        name=meal.name,
        is_active=meal.is_active,
        meal_schedules=schedules,
    )
    icecream.ic(result)
    return result


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


@router.put("/meals/{meal_id}/schedules")
async def update_meal_schedules(
    session: SessionDep,
    user: CurrentUserDep,
    meal_id: int,
    schedules: ScheduleUpdateRequest,
):
    """
    Updates the schedules for a specific meal by adding new schedules and removing specified ones.

    - **meal_id**: The ID of the meal to update.
    - **schedules**: Object containing `added` and `removed` arrays of schedules.
    """
    try:
        icecream.ic(schedules)
        # Process removed schedules
        for removed in schedules.removed:
            schedule = await session.get(MealSchedule, removed.id)
            await session.delete(schedule)

        # Process added schedules
        for added in schedules.added:
            new_schedule = MealSchedule(
                meal_id=meal_id,
                schedule_from=added.schedule_from,
                schedule_to=added.schedule_to,
            )
            session.add(new_schedule)

        await session.commit()
        return {"message": "Meal schedules updated successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.exception(f"Error updating schedules for meal {meal_id}")
        raise HTTPException(
            status_code=500, detail="Failed to update schedules"
        )


@router.put("/meals/{meal_id}/activation")
async def update_meal_activation(
    session: SessionDep,
    user: CurrentUserDep,
    meal_id: int,
    activation: MealActivationUpdateRequest,
):
    try:
        meal = await session.get(Meal, meal_id)
        logger.info(f"Queried meal {meal_id}: {meal}")
        if meal is None:
            raise HTTPException(status_code=404, detail="Meal not found")

        meal.is_active = activation.is_active
        session.add(meal)
        await session.commit()
        return {"message": "Meal activation updated successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.exception(f"Error updating activation for meal {meal_id}")
        raise HTTPException(
            status_code=500, detail="Failed to update activation"
        )
