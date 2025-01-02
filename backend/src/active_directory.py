import os
from dotenv import load_dotenv
import logging
from ldap3 import Server, Connection, SIMPLE, ALL, SUBTREE
from typing import Optional, List
from src.schema import DomainAccount

# Load environment variables from the .env file
load_dotenv()

# Set up logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class LDAPAuthenticator:
    """
    A class to authenticate users against an LDAP server and retrieve user attributes.

    Attributes:
        domain (str): The domain of the LDAP server.
        dc (str): The domain controller (DC) hostname or IP address.
    """

    def get_domain_accounts(self) -> Optional[List[DomainAccount]]:
        """
        Authenticate a user against the LDAP server using simple bind and retrieve user attributes.

        Returns:
            Optional[List[DomainAccount]]: A list of DomainAccount objects if authenticated successfully, otherwise None.
        """
        try:
            DC = os.getenv("AD_SERVER")
            USERNAME = os.getenv("SERVICE_ACCOUNT")
            PASSWORD = os.getenv("SERVICE_PASSWORD")

            # Set up the server and connection
            server = Server(DC, port=389, use_ssl=False, get_info=ALL)
            connection = Connection(
                server,
                user=USERNAME,
                password=PASSWORD,
                authentication=SIMPLE,
                auto_bind=True,
            )

            # Search the directory for active users.
            search_base = 'OU=Andalusia,DC=andalusia,DC=loc'
            search_filter = '(&(objectCategory=person)(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))'

            # Use paged search to retrieve all results
            paged_size = 1000
            domain_accounts = []
            connection.search(
                search_base=search_base,
                search_filter=search_filter,
                search_scope=SUBTREE,
                attributes=['sAMAccountName', 'displayName', 'title'],
                paged_size=paged_size
            )

            while True:
                domain_accounts.extend([
                    DomainAccount(
                        username=entry.sAMAccountName.value,
                        fullName=entry.displayName.value,
                        title=entry.title.value
                    )
                    for entry in connection.entries
                ])

                # Check if there are more pages
                if 'controls' in connection.result and '1.2.840.113556.1.4.319' in connection.result['controls']:
                    cookie = connection.result['controls']['1.2.840.113556.1.4.319']['value']['cookie']
                    if cookie:
                        connection.search(
                            search_base=search_base,
                            search_filter=search_filter,
                            search_scope=SUBTREE,
                            attributes=['sAMAccountName',
                                        'displayName', 'title'],
                            paged_size=paged_size,
                            paged_cookie=cookie
                        )
                    else:
                        break
                else:
                    break

            connection.unbind()
            return domain_accounts if domain_accounts else None

        except Exception as e:
            logger.error(f"Authentication failed for users: {e}")
            return None
