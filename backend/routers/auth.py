from fastapi import APIRouter, HTTPException, status
from dependencies import SessionDep
from src.schema import LoginRequest
from src.http_schema import UserData
from routers.utils.auth import (
    validate_user_name_and_password,
    read_account_by_username,
    read_hirs_account_by_username,
    create_or_update_user,
    read_roles,
)
from src.active_directory import authenticate_and_get_user
from exceptions import InvalidCredentialsException, InternalServerException

router = APIRouter()


@router.post("/login", response_model=UserData)
async def login_for_access_token(
    session: SessionDep, form_data: LoginRequest
) -> UserData:
    """
    Authenticate the user and return user data.

    Args:
        session (SessionDep): Database session dependency.
        form_data (LoginRequest): Login credentials (username and password).

    Raises:
        InvalidCredentialsException: If the credentials are incorrect.
        InternalServerException: If an unexpected error occurs.

    Returns:
        UserData: Authenticated user's data.
    """
    try:
        if not form_data or not form_data.username or not form_data.password:
            raise InvalidCredentialsException()

        username = form_data.username
        password = form_data.password
        login_type: str = "local"

        # Check if user exists in HRIS database
        hris_user = await read_hirs_account_by_username(session, username)
        autherized_user = None

        if hris_user:
            login_type = "domain"
        else:
            autherized_user = await read_account_by_username(session, username)
            if autherized_user and autherized_user.is_domain_user:
                login_type = "domain"

        # If user does not exist in both HRIS and local DB
        if not hris_user and not autherized_user:
            raise InvalidCredentialsException()

        # Authenticate Domain Users (Active Directory)
        if login_type == "domain":
            windows_account = await authenticate_and_get_user(username, password)
            print(windows_account)
            if not windows_account:
                raise InvalidCredentialsException()

            # Create or update the user in the database
            user = await create_or_update_user(
                session,
                windows_account.username,
                windows_account.fullName,
                windows_account.title,
            )
            if not user:
                raise InternalServerException()

        else:  # Authenticate Local Users
            user = await validate_user_name_and_password(session, username, password)
            if not user:
                raise InvalidCredentialsException()

        # Retrieve User Roles
        roles = (
            await read_roles(session)
            if user.is_super_admin
            else await read_roles(session, user.id)
        )

        # Return user data
        return UserData(
            userId=user.id,
            username=user.username,
            email=f"{user.username}@andalusiagroup.net",
            fullName=user.full_name,
            title=user.title,
            roles=roles,
        )

    except InvalidCredentialsException as e:
        raise e  # Return 401 Unauthorized

    except Exception as e:
        raise InternalServerException()  # Return 500 Internal Server Error
