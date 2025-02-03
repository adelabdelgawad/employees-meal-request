from dotenv import load_dotenv
import os
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from fastapi import Request, HTTPException, Depends
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


async def decrypt(token: str):

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        print(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user(request: Request):
    token = request.cookies.get("session")  # Check cookies first
    if not token:
        # Fallback: Check Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify JWT token using the decrypt function
    try:
        payload = await decrypt(token)
        user = payload["user"]

        return User(
            id=user["userId"],
            username=user["username"],
            roles=user["roles"],
            email=user["email"],
            full_name=user["fullName"],
            title=user["title"],
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


SessionDep = Annotated[AsyncSession, Depends(get_application_session)]
HRISSessionDep = Annotated[AsyncSession, Depends(get_hris_session)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]
