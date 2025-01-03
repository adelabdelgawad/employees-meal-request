import logging
import traceback
from typing import Optional, List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.ldap import authenticate
from src.custom_exceptions import AuthorizationError, AuthenticationError
from db.models import Account, HMISSecurityUser, RolePermission, Role
from src.schema import UserAttributes

logger = logging.getLogger(__name__)


class Login:
    """
    Handles user authentication and account management.
    Supports both local and domain (LDAP) authentication.
    """

    def __init__(self, session: AsyncSession, username: str, password: Optional[str] = None) -> None:
        """
        Initializes the Login class.

        Args:
            session (AsyncSession): Database session for CRUD operations.
            username (str): Username for authentication.
            password (Optional[str]): Password for authentication.
        """
        self.session: AsyncSession = session
        self.username: str = username
        self.password: Optional[str] = password
        self.is_authenticated: bool = False
        self.account: Optional[Account] = None
        self.roles: List[str] = []

    async def authenticate(self) -> None:
        """
        Authenticates the user.

        Raises:
            AuthenticationError: If authentication fails.
        """
        logger.info(f"Starting authentication for user: {self.username}")

        try:
            # Authenticate the user
            if not await self._authenticate_domain_user():
                raise AuthenticationError(
                    f"Authentication failed for user: {self.username}")

            # Fetch user roles
            self.roles = await self._get_user_roles()
            self.is_authenticated = True
            
            logger.info(
                f"User '{self.username}' authenticated successfully with roles: {self.roles}")

        except AuthorizationError as auth_err:
            logger.error(
                f"Authorization error for user '{self.username}': {auth_err}")
            raise
        except Exception as e:
            logger.error(
                f"Unexpected error during authentication for user '{self.username}': {e}")
            logger.debug(traceback.format_exc())
            raise AuthenticationError(
                f"Unexpected error during authentication for {self.username}.")

    async def _authenticate_domain_user(self) -> bool:
        """
        Authenticates the user against the domain using LDAP.

        Returns:
            bool: True if authentication is successful, False otherwise.
        """
        try:
            logger.info(
                f"Attempting domain authentication for user: {self.username}")
            domain_user = await authenticate(self.username, self.password)

            if not domain_user:
                logger.warning(
                    f"LDAP authentication failed for user: {self.username}")
                return False

            # Check or create a local account for the domain user
            self.account = await self._get_local_account() or await self._create_local_account(domain_user)
            return True

        except Exception as e:
            logger.error(
                f"Error in domain authentication for user '{self.username}': {e}")
            logger.debug(traceback.format_exc())
            return False

    async def _get_local_account(self) -> Optional[Account]:
        """
        Fetches the local account for the user, if it exists.

        Returns:
            Optional[Account]: The local account object or None if not found.
        """
        statement = select(Account).where(Account.username == self.username)
        results = await self.session.execute(statement)
        return results.scalars().first()

    async def _create_local_account(self, domain_user: UserAttributes) -> Account:
        """
        Creates a local account for the domain user.

        Args:
            domain_user (UserAttributes): Domain user details obtained from LDAP.

        Returns:
            Account: The newly created account object.

        Raises:
            AuthorizationError: If no corresponding security user is found.
        """
        logger.info(f"Creating local account for domain user: {self.username}")

        # Check for a corresponding security user
        statement = select(HMISSecurityUser).where(
            HMISSecurityUser.username == self.username)
        results = await self.session.execute(statement)
        hris_security_user = results.scalars().first()

        if not hris_security_user:
            logger.warning(
                f"No security user found for domain user: {self.username}")
            raise AuthorizationError(
                "User lacks necessary security permissions.")

        # Create the new account
        new_account = Account(
            username=self.username,
            title=domain_user.title,
            is_domain_user=True,
        )
        self.session.add(new_account)
        await self.session.commit()
        await self.session.refresh(new_account)

        # Assign a default role to the new account
        default_role_permission = RolePermission(
            role_id=1,  # Default role ID, adjust as needed
            account_id=new_account.id,
        )
        self.session.add(default_role_permission)
        await self.session.commit()
        await self.session.refresh(default_role_permission)

        logger.info(f"Local account created for domain user: {self.username}")
        return new_account

    async def _get_user_roles(self) -> List[str]:
        """
        Fetch the role names assigned to the current user.

        Returns:
            List[str]: A list of role names assigned to the user.
        """
        if not self.account:
            raise ValueError(
                "Account is not set. Authenticate the user first.")

        statement = (
            select(Role.name)
            .join(RolePermission, Role.id == RolePermission.role_id)
            .where(RolePermission.account_id == self.account.id)
        )
        results = await self.session.execute(statement)
        return [row for row in results.scalars()]
