import traceback
import logging
import os
from dotenv import load_dotenv
from typing import  Annotated
from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from sqlmodel.ext.asyncio.session import AsyncSession
from passlib.context import CryptContext

from db.database import get_application_session

from hris_db.database import get_hris_session
from hris_db.clone import schedule_replication, scheduler

# Load environment variables
load_dotenv()
logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependency annotations
SessionDep = Annotated[AsyncSession, Depends(get_application_session)]
HRISSessionDep = Annotated[AsyncSession, Depends(get_hris_session)]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan management. Sets up the database and replication process.
    """
    try:

        schedule_replication(HRISSessionDep, SessionDep)
        if not scheduler.running:
            scheduler.start()
        else:
            logger.info("Scheduler already running, skipping start.")

        yield
    except Exception as e:
        logger.error(f"Error during app startup: {e}")
        logger.error(traceback.format_exc())
        yield
    finally:
        scheduler.shutdown()
