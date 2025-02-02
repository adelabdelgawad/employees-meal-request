from dotenv import load_dotenv
import os
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from db.database import get_application_session
from hris_db.database import get_hris_session
from src.http_schema import User
from icecream import ic
from fastapi import Depends

# Define your secret key and algorithm
SECRET_KEY = os.getenv("AUTH_SECRET")

ALGORITHM = "HS256"

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("userId")  # Directly fetch userId

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: subject or id missing",
                headers={"WWW-Authenticate": "Bearer"},
            )
        ic(user_id)

        return User(
            id=user_id,
            username=payload.get("username"),
            roles=payload.get("userRoles"),
            full_name=payload.get("fullName"),
            title=payload.get("userTitle"),
            email=payload.get("email"),
        )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


SessionDep = Annotated[AsyncSession, Depends(get_application_session)]
HRISSessionDep = Annotated[AsyncSession, Depends(get_hris_session)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]
