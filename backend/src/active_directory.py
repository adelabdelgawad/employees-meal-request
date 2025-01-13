import asyncio
import os
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from src.http_schema import DomainUser  # Ensure this path is correct
from fastapi import APIRouter, HTTPException, status
import logging

import bonsai
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Fix Windows event loop issue for Windows
if os.name == "nt":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Load environment variables
load_dotenv()

# Environment variables
ldap_url: str = os.getenv("LDAP_URL")
ldap_user: str = os.getenv("LDAP_USER")
ldap_password: str = os.getenv("LDAP_PASSWORD")

# The OUs to search
search_bases: List[str] = [
    "OU=Users,OU=SMH,OU=Andalusia,DC=andalusia,DC=loc",
    "OU=Users,OU=ARC,OU=Andalusia,DC=andalusia,DC=loc",
    "OU=Users,OU=ANC,OU=Andalusia,DC=andalusia,DC=loc",
]


async def search_ldap(ou: str) -> List[DomainUser]:
    """Search a specific OU and return a list of DomainUser objects."""

    client = bonsai.LDAPClient(ldap_url)
    client.set_credentials("SIMPLE", user=ldap_user, password=ldap_password)

    try:
        async with client.connect(is_async=True) as conn:
            logger.info(f"Connected to LDAP: {ldap_url}")

            # Search filter for active user accounts
            search_filter: str = (
                "(&(objectCategory=person)(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))"
            )
            attrlist: List[str] = ["sAMAccountName", "displayName", "title"]

            # Perform the search
            results = await conn.search(ou, 2, search_filter, attrlist)
            logger.info(f"Found {len(results)} users in {ou}")

            # Convert the results to Pydantic models
            users: List[DomainUser] = [
                DomainUser(
                    id=0,  # Temporary ID, will be set later
                    username=entry.get("sAMAccountName", ["N/A"])[0],
                    fullName=entry.get("displayName", ["N/A"])[0],
                    title=entry.get("title", ["N/A"])[0],
                )
                for entry in results
            ]
            return users
    except Exception as e:
        logger.error(f"Error during LDAP search: {e}")
        raise


async def read_domain_users() -> List[DomainUser]:
    """Perform parallel searches on multiple OUs and return a list of DomainUser objects."""
    # Perform parallel searches
    tasks = [search_ldap(ou) for ou in search_bases]
    results = await asyncio.gather(*tasks)

    # Flatten the list of lists into a single list
    all_users: List[DomainUser] = [
        user for sublist in results for user in sublist
    ]

    # Add an ID to each record
    for i, user in enumerate(all_users, start=1):
        user.id = i

    return all_users
