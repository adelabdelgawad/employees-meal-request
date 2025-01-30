from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
import os

router = APIRouter()

# Secret key to encode the JWT
SECRET_KEY = os.getenv("AUTH_SECRET", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Updated to 60 minutes

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Pydantic models
class User(BaseModel):
    userId: int
    username: str
    fullName: Optional[str] = None
    userTitle: Optional[str] = None
    email: str
    userRoles: list[str] = []


class UserInDB(User):
    hashed_password: str


class Token(BaseModel):
    access_token: str


class LoginRequest(BaseModel):
    username: str
    password: str


# Fake user database
fake_users_db = {
    "admin": {
        "userId": 1,
        "username": "admin",
        "fullName": "Administrator",
        "userTitle": "Admin",
        "email": "admin@example.com",
        "hashed_password": pwd_context.hash("admin"),
        "userRoles": ["admin"],
    }
}


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)


def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: LoginRequest):
    user = authenticate_user(
        fake_users_db, form_data.username, form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    access_token = create_access_token(
        data={
            "userId": user.userId,
            "username": user.username,
            "fullName": user.fullName,
            "userTitle": user.userTitle,
            "userRoles": user.userRoles,
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token}
