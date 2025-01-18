from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_application_session
from hris_db.database import get_hris_session

from src.http_schema import RequestBody, RequestPageRecordResponse

# Define session dependencies with proper type hints
SessionDep = Annotated[AsyncSession, Depends(get_application_session)]
HRISSessionDep = Annotated[AsyncSession, Depends(get_hris_session)]
