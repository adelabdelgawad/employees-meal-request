import os
from dotenv import load_dotenv
import logging
from ldap3 import Server, Connection, SIMPLE, ALL
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import traceback
from pyad.adquery import ADQuery
from typing import Optional
from src.schema import UserAttributes

# Load environment variables from the .env file
load_dotenv()

# Set up logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Load environment variables
DOMAIN = os.getenv("AD_DOMAIN")
DC = os.getenv("AD_SERVER")


class LDAPAuthenticator:
    """
    A class to authenticate users against an LDAP server.

    Attributes:
        domain (str): The domain of the LDAP server.
        dc (str): The domain controller (DC) hostname or IP address.
    """

    def __init__(self, domain: str, dc: str):
        self.domain = domain
        self.dc = dc

    def authenticate(self, username: str, password: str) -> bool:
        """
        Authenticate a user against the LDAP server using simple bind.

        Args:
            username (str): The username to authenticate.
            password (str): The password for the given username.

        Returns:
            bool: True if authenticated successfully, otherwise False.
        """
        connection = None
        try:
            server = Server(self.dc, port=389, use_ssl=False, get_info=ALL)
            connection = Connection(
                server,
                user=f"{username}@{self.domain}",
                password=password,
                authentication=SIMPLE,
                auto_bind=True,
            )
            return True

        except Exception as e:
            logger.error(f"Authentication failed for user {
                username}: {e}", exc_info=True)
            return False

        finally:
            if connection:
                connection.unbind()


class AuthDependency:
    """
    Dependency for FastAPI to authenticate users using LDAP.

    Attributes:
        authenticator (LDAPAuthenticator): The LDAPAuthenticator instance to authenticate users.
    """

    def __init__(self, authenticator: LDAPAuthenticator):
        self.authenticator = authenticator

    async def __call__(self, credentials: HTTPBasicCredentials = Depends(HTTPBasic())) -> str:
        """
        Authenticate the user via LDAP using the provided credentials.

        Args:
            credentials (HTTPBasicCredentials): Credentials extracted by FastAPI's HTTPBasic security scheme.

        Returns:
            str: The authenticated username.

        Raises:
            HTTPException: If authentication fails.
        """
        if not self.authenticator.authenticate(credentials.username, credentials.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return credentials.username


def get_user_attributes(username: str) -> Optional[UserAttributes]:
    """
    Fetches and returns user attributes for a given username from Active Directory.

    Args:
        username (str): The username to query.

    Returns:
        Optional[UserAttributes]: A UserAttributes object if the user is found, otherwise None.
    """
    q = ADQuery()
    q.execute_query(
        attributes=["displayName", "mail",  "telephoneNumber", "title"],
        where_clause=f"SamAccountName = '{username}'",
        base_dn="DC=andalusia,DC=loc",
    )

    result = list(q.get_results())
    if result:
        return UserAttributes(
            display_name=result[0]["displayName"],
            telephone=result[0]["telephoneNumber"],
            mail=result[0]["mail"],
            title=result[0]["title"])
    else:
        return None


# Initialize the LDAP authenticator with the domain and DC from environment variables
ldap_authenticator = LDAPAuthenticator(DOMAIN, DC)

# Dependency to check LDAP authentication in FastAPI
security = AuthDependency(ldap_authenticator)


async def authenticate(username: str, password: str) -> Optional[UserAttributes]:
    """
    Check LDAP authentication for the given username and password.

    Args:
        username (str): The username to authenticate.
        password (str): The password for the username.

    Returns:
        bool: True if authenticated, otherwise False.
    """
    if ldap_authenticator.authenticate(username, password):
        return get_user_attributes(username)
