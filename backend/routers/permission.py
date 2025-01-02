import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import Annotated

from db.application.database import get_application_session
from db.application.models import RolePermission, Role, Account, LogPermission
from db.hris.database import get_hris_session
from src.schema import (
    RolePermissionResponse,
    UpdateAccountPermissionRequest,
    UserCreateRequest,
    DomainAccount,
)
from src.active_directory import LDAPAuthenticator

router = APIRouter()
logger = logging.getLogger(__name__)

SessionDep = Annotated[AsyncSession, Depends(get_application_session)]
HRISSessionDep = Annotated[AsyncSession, Depends(get_hris_session)]
active_directory = LDAPAuthenticator()


@router.get("/permissions", response_model=List[RolePermissionResponse])
async def read_permissions_endpoint(
    session: SessionDep
) -> List[RolePermissionResponse]:
    """
    Retrieve all account permissions grouped by username.

    :param session: The database session dependency.
    :return: A list of RolePermissionResponse objects or an empty list.
    """
    try:
        # Perform the query
        result = await session.execute(
            select(RolePermission, Account.username)
            .join(Account, RolePermission.account_id == Account.id)
        )
        permissions = result.all()

        # Group roles by username
        roles_by_username = {}
        for permission, username in permissions:
            if username not in roles_by_username:
                roles_by_username[username] = []
            roles_by_username[username].append(permission.role_id)

        # Return grouped results as RolePermissionResponse
        return [
            RolePermissionResponse(username=username, roles=role_ids)
            for username, role_ids in roles_by_username.items()
        ]

    except Exception as exc:
        # Log and raise 500 error
        logger.exception(f"Unexpected error: {str(exc)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving account permissions.",
        )


@router.get("/roles", response_model=Optional[List[Role]])
async def read_role_endpoint(session: SessionDep) -> Optional[List[Role]]:
    """
    Retrieve all available roles in the system.

    :param session: The database session dependency.
    :type session: SessionDep
    :return: A list of Role objects or None if no roles found.
    :rtype: Optional[List[Role]]
    """
    try:
        roles = await session.execute(select(Role))
        roles = roles.scalars().all()
        return roles if roles else None
    except HTTPException as http_exc:
        logger.exception("HTTP Exception during role retrieval.")
        raise http_exc
    except Exception:
        logger.exception("Unexpected error during role retrieval.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving roles.",
        )


@router.put("/remove-role-permission")
async def remove_role_permission_endpoint(
    body: UpdateAccountPermissionRequest, session: SessionDep
):
    """
    Remove specified roles from a user account.

    :param body: The request body containing username, requester_id, and removed_roles.
    :type body: UpdateAccountPermissionRequest
    :param session: The database session dependency.
    :type session: SessionDep
    :raises HTTPException: If the user is not found or any database error occurs.
    """
    try:
        logger.info(f"Removing roles for user: {body.username}")
        account = await session.execute(
            select(Account).where(Account.username == body.username)
        )
        account = account.scalars().first()

        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        for role_id in body.removed_roles:
            permission = await session.execute(
                select(RolePermission).where(
                    RolePermission.account_id == account.id,
                    RolePermission.role_id == role_id,
                )
            )
            permission = permission.scalars().first()

            if permission:
                await session.delete(permission)
                await session.commit()

                log = LogPermission(
                    account_id=account.id,
                    role_id=role_id,
                    admin_id=body.requester_id,
                    action="Remove",
                    result="Successfully removed",
                    is_successful=True,
                )
                session.add(log)
                await session.commit()

        return {"detail": "Roles removed successfully."}

    except HTTPException as http_exc:
        logger.exception(
            f"HTTP Exception during role removal for {body.username}")
        raise http_exc
    except Exception:
        logger.exception(
            f"Error during role removal for user: {body.username}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error occurred while removing roles.",
        )


@router.put("/add-role-permission")
async def add_role_permission_endpoint(
    body: UpdateAccountPermissionRequest, session: SessionDep
):
    """
    Add specified roles to a user account.

    :param body: The request body containing username, requester_id, and added_roles.
    :type body: UpdateAccountPermissionRequest
    :param session: The database session dependency.
    :type session: SessionDep
    :raises HTTPException: If the user is not found or any database error occurs.
    """
    try:
        logger.info(f"Adding roles for user: {body.username}")

        account = await session.execute(
            select(Account).where(Account.username == body.username)
        )
        account = account.scalars().first()

        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        for role_id in body.added_roles:
            permission = RolePermission(role_id=role_id, account_id=account.id)
            session.add(permission)
            await session.commit()

            log = LogPermission(
                account_id=account.id,
                role_id=role_id,
                admin_id=body.requester_id,
                action="Add",
                result="Successfully added",
                is_successful=True,
            )
            session.add(log)
            await session.commit()

        return {"detail": "Roles added successfully."}

    except HTTPException as http_exc:
        logger.exception(
            f"HTTP Exception during role addition for {body.username}")
        raise http_exc
    except Exception:
        logger.exception(
            f"Error during role addition for user: {body.username}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error occurred while adding roles.",
        )


@router.post("/create-user")
async def create_user_endpoint(body: UserCreateRequest, session: SessionDep):
    """
    Create a new user account with specified roles.

    :param body: The request body containing username, role_ids, and requester_id.
    :type body: UserCreateRequest
    :param session: The database session dependency.
    :type session: SessionDep
    :raises HTTPException: If user creation fails.
    """
    try:
        logger.info(
            f"Creating user: {body.username} with roles {body.role_ids}")

        new_account = Account(username=body.username, is_domain_user=True)
        session.add(new_account)
        await session.commit()
        await session.refresh(new_account)

        if not new_account:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User creation failed.",
            )

        for role_id in body.role_ids:
            permission = RolePermission(
                role_id=role_id, account_id=new_account.id)
            session.add(permission)
            await session.commit()

            log = LogPermission(
                account_id=new_account.id,
                role_id=role_id,
                admin_id=body.requester_id,
                action="Add",
                result="Successfully added",
                is_successful=True,
            )
            session.add(log)
            await session.commit()

        return {"detail": "User created successfully."}

    except HTTPException as http_exc:
        logger.exception(
            f"HTTP Exception during user creation for {body.username}")
        raise http_exc
    except Exception:
        logger.exception(
            f"Unexpected error during user creation for {body.username}.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error occurred while creating the user.",
        )


@router.get("/domain-users", response_model=Optional[List[DomainAccount]])
async def read_domain_accounts_endpoint(request: Request):
    """
    Retrieve a list of domain users from the Active Directory.

    :param request: The FastAPI request object (not currently used).
    :type request: Request
    :return: A list of domain accounts or None if none found.
    :rtype: Optional[List[DomainAccount]]
    """
    try:
        domain_accounts = active_directory.get_domain_accounts()

        if domain_accounts and len(domain_accounts) > 0:
            logger.info(f"Found {len(domain_accounts)} domain accounts.")
            return domain_accounts
        return None

    except HTTPException as http_exc:
        logger.exception("HTTP Exception during Domain Accounts retrieval.")
        raise http_exc
    except Exception:
        logger.exception("Unexpected error during Domain Accounts retrieval.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving Domain Accounts.",
        )
