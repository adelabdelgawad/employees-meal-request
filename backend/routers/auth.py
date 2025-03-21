import logging
from fastapi import APIRouter
from src.dependencies import SessionDep
from services.schema import LoginRequest
from services.http_schema import UserData
from routers.utils.auth import (
    validate_user_name_and_password,
    read_account_by_username,
    read_hirs_account_by_username,
    create_or_update_user,
    read_role_name,
)
from services.active_directory import authenticate_and_get_user
from src.exceptions import InvalidCredentialsException, InternalServerException

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/login", response_model=UserData)
async def login_for_access_token(
    session: SessionDep, form_data: LoginRequest
) -> UserData:
    """
    Authenticate the user and return user data with enhanced logging.
    """
    try:
        logger.info(
            f"Login attempt initiated for username: {form_data.username}"
        )

        if not form_data or not form_data.username or not form_data.password:
            logger.warning("Missing username or password in request")
            raise InvalidCredentialsException()

        username = form_data.username
        password = form_data.password
        login_type = "local"

        # Check user existence in HRIS and local DB
        hris_user = await read_hirs_account_by_username(session, username)
        authorized_user = await read_account_by_username(session, username)
        logger.debug(
            f"HRIS user check: {hris_user is not None}, Local user check: {authorized_user is not None}"
        )

        if hris_user:
            login_type = "domain"
            logger.debug(
                f"HRIS user found, login type set to domain for {username}"
            )
        elif authorized_user and authorized_user.is_domain_user:
            login_type = "domain"
            logger.debug(
                f"Local domain user found, login type set to domain for {username}"
            )

        # Validate user existence
        if not hris_user and not authorized_user:
            logger.warning(
                f"User {username} not found in HRIS or local database"
            )
            raise InvalidCredentialsException()

        logger.info(
            f"Authentication type determined as {login_type} for {username}"
        )

        # Domain User Authentication
        if login_type == "domain":
            logger.debug(
                f"Attempting Active Directory authentication for {username}"
            )
            windows_account = await authenticate_and_get_user(
                username, password
            )

            if not windows_account:
                logger.warning(
                    f"Active Directory authentication failed for {username}"
                )
                raise InvalidCredentialsException()

            logger.info(
                f"Active Directory authentication successful for {username}"
            )

            # Sync user with local database
            logger.debug(f"Syncing domain user {username} with local database")
            user = await create_or_update_user(
                session,
                windows_account.username,
                windows_account.fullname,
                windows_account.title,
            )
            if not user:
                logger.error(
                    f"Failed to create/update domain user {username} in database"
                )
                raise InternalServerException()

            logger.info(f"Domain user {username} synchronized successfully")

        # Local User Authentication
        else:
            logger.debug(f"Attempting local authentication for {username}")
            user = await validate_user_name_and_password(
                session, username, password
            )

            if not user:
                logger.warning(f"Local authentication failed for {username}")
                raise InvalidCredentialsException()

            logger.info(f"Local authentication successful for {username}")

        # Retrieve user roles
        logger.debug(f"Retrieving roles for user {user.id}")
        roles = (
            await read_role_name(session)
            if user.is_super_admin
            else await read_role_name(session, user.id)
        )
        logger.info(f"Retrieved {len(roles)} roles for user {user.id}")

        # Prepare response
        user_data = UserData(
            userId=user.id,
            username=user.username,
            email=f"{user.username}@andalusiagroup.net",
            fullname=user.fullname,
            title=user.title,
            roles=roles,
        )

        logger.info(f"Login successful for {username}")
        return user_data

    except InvalidCredentialsException as e:
        logger.warning(f"Authentication failed for {username}: {str(e)}")
        raise e

    except Exception as e:
        logger.error(
            f"Unexpected error during login for {username}: {str(e)}",
            exc_info=True,
        )
        raise InternalServerException()
