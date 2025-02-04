from typing import List, Optional
from datetime import datetime
import pytz
from sqlmodel import Field, Relationship, SQLModel

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")


class Role(SQLModel, table=True):
    __tablename__ = "role"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=64)
    description: str = Field(nullable=False, max_length=64)

    role_permissions: List["RolePermission"] = Relationship(
        back_populates="role"
    )
    permission_logs_admin: Optional["LogRolePermission"] = Relationship(
        back_populates="role"
    )


class HRISSecurityUser(SQLModel, table=True):
    """
    Represents a user account in the HRIS system.
    """

    __tablename__ = "hris_security_user"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(nullable=False, max_length=64, unique=True)
    is_deleted: bool = Field(default=False)
    is_locked: bool = Field(default=False)


class Department(SQLModel, table=True):
    """
    Represents organizational departments.
    """

    __tablename__ = "department"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=64)

    # Relationships
    employees: List["Employee"] = Relationship(back_populates="department")


class Employee(SQLModel, table=True):
    """
    Represents staff members in the organization.
    """

    __tablename__ = "employee"

    id: Optional[int] = Field(default=None, primary_key=True)
    code: int = Field(nullable=False, unique=True)
    name: Optional[str] = Field(default=None, max_length=128)
    title: Optional[str] = Field(default=None, max_length=128)
    is_active: bool = Field(nullable=False)
    department_id: int = Field(foreign_key="department.id", nullable=False)

    # Relationships
    department: Optional["Department"] = Relationship(
        back_populates="employees"
    )
    request_lines: List["RequestLine"] = Relationship(
        back_populates="employee"
    )


class RequestStatus(SQLModel, table=True):
    """
    Represents the status of a Request.
    """

    __tablename__ = "request_status"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=64)

    # Relationships
    requests: List["Request"] = Relationship(back_populates="status")


class Meal(SQLModel, table=True):
    """
    Represents the type of a Request.
    """

    __tablename__ = "meal"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=64)

    # Relationships
    request_lines: List["RequestLine"] = Relationship(back_populates="meal")
    requests: List["Request"] = Relationship(back_populates="meal")


class Account(SQLModel, table=True):
    """
    Represents user login accounts.
    """

    __tablename__ = "account"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(nullable=False, unique=True, max_length=64)
    full_name: Optional[str] = Field(max_length=128, default=None)
    password: Optional[str] = Field(default=None, max_length=64)
    title: Optional[str] = Field(default=None, max_length=64)
    is_domain_user: bool = Field(default=False)

    role_permissions: List["RolePermission"] = Relationship(
        back_populates="account"
    )
    request_line_logs: List["LogRequestLine"] = Relationship(
        back_populates="account"
    )
    # Relationship: One Account can have many Requests they initiated
    requests: List["Request"] = Relationship(
        back_populates="requester",
        sa_relationship_kwargs={"foreign_keys": "[Request.requester_id]"},
    )

    # Relationship: One Account can audit many Requests
    audits: List["Request"] = Relationship(
        back_populates="auditor",
        sa_relationship_kwargs={"foreign_keys": "[Request.auditor_id]"},
    )


class RolePermission(SQLModel, table=True):
    __tablename__ = "role_permission"

    id: Optional[int] = Field(default=None, primary_key=True)
    role_id: int = Field(foreign_key="role.id", nullable=False)
    account_id: int = Field(foreign_key="account.id", nullable=False)

    # Relationships
    role: Optional["Role"] = Relationship(back_populates="role_permissions")
    account: Optional["Account"] = Relationship(
        back_populates="role_permissions"
    )


class Request(SQLModel, table=True):
    """
    Represents a request.
    """

    __tablename__ = "request"

    id: Optional[int] = Field(default=None, primary_key=True)
    status_id: int = Field(
        foreign_key="request_status.id", nullable=False, default=1
    )
    requester_id: int = Field(foreign_key="account.id", nullable=False)
    meal_id: int = Field(foreign_key="meal.id", nullable=False)
    request_time: Optional[datetime] = Field(default=None)
    created_time: datetime = Field(
        default_factory=lambda: datetime.now(cairo_tz)
    )
    closed_time: Optional[datetime] = Field(default=None)
    notes: Optional[str] = Field(default=None, max_length=256)
    auditor_id: Optional[int] = Field(foreign_key="account.id", default=None)
    menu_id: int = Field(foreign_key="menu.id", default=1)

    # Relationships
    meal: Optional["Meal"] = Relationship(back_populates="requests")

    status: Optional["RequestStatus"] = Relationship(back_populates="requests")
    menu: Optional["Menu"] = Relationship(back_populates="requests")

    request_lines: List["RequestLine"] = Relationship(back_populates="request")

    # Relationship back to the Account who requested
    requester: "Account" = Relationship(
        back_populates="requests",
        sa_relationship_kwargs={"foreign_keys": "[Request.requester_id]"},
    )

    # Relationship back to the Account who audits
    auditor: "Account" = Relationship(
        back_populates="audits",
        sa_relationship_kwargs={"foreign_keys": "[Request.auditor_id]"},
    )


class RequestLine(SQLModel, table=True):
    """
    Represents individual line items in a Request.
    """

    __tablename__ = "request_line"

    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id", nullable=False)
    employee_code: int = Field(nullable=False)
    department_id: int = Field(foreign_key="department.id", nullable=False)
    request_id: int = Field(foreign_key="request.id", nullable=False)
    meal_id: int = Field(foreign_key="meal.id", nullable=False)
    attendance: Optional[datetime] = Field(default=None)
    notes: Optional[str] = Field(default=None, max_length=256)
    is_accepted: bool = Field(default=True)
    shift_hours: Optional[int] = Field(default=None)
    data_collected: bool = Field(default=False)
    is_deleted: bool = Field(default=False)

    # Relationships
    meal: Optional["Meal"] = Relationship(back_populates="request_lines")

    employee: Optional["Employee"] = Relationship(
        back_populates="request_lines"
    )
    request: Optional["Request"] = Relationship(  # Change Request to Request
        back_populates="request_lines"
    )

    request_line_logs: List["LogRequestLine"] = Relationship(
        back_populates="request_line"
    )


class LogRolePermission(SQLModel, table=True):
    """
    Represents logs for permission-related actions taken by administrators.
    """

    __tablename__ = "log_role_permission"

    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: int = Field(foreign_key="account.id", nullable=False)
    role_id: int = Field(foreign_key="role.id", nullable=False)
    admin_id: int = Field(foreign_key="account.id", nullable=False)
    action: str = Field(nullable=False, max_length=32)
    is_successful: bool = Field(nullable=False)
    result: Optional[str] = Field(default=None)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(cairo_tz))

    # Relationships
    role: Optional["Role"] = Relationship(
        back_populates="permission_logs_admin"
    )


class LogRequestLine(SQLModel, table=True):
    """
    Represents logs for request lines, tracking actions and changes.
    """

    __tablename__ = "log_request_line"

    id: Optional[int] = Field(default=None, primary_key=True)
    request_line_id: int = Field(foreign_key="request_line.id", nullable=False)
    account_id: int = Field(foreign_key="account.id", nullable=False)
    action: str = Field(nullable=False, max_length=32)
    is_successful: bool = Field(nullable=False)
    result: Optional[str] = Field(default=None)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(cairo_tz))

    # Relationships
    request_line: Optional["RequestLine"] = Relationship(
        back_populates="request_line_logs"
    )
    account: Optional["Account"] = Relationship(
        back_populates="request_line_logs"
    )


class LogTraffic(SQLModel, table=True):
    """
    Represents logs for HTTP traffic, tracking requests, responses, and statuses.
    """

    __tablename__ = "log_traffic"

    id: Optional[int] = Field(default=None, primary_key=True)
    ip_address: str = Field(nullable=False, max_length=64)
    path: Optional[str] = Field(default=None, max_length=256)
    status: str = Field(nullable=False, max_length=64)
    result: Optional[str] = Field(default=None, max_length=256)
    request_body: Optional[str] = Field(default=None)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(cairo_tz))


class Email(SQLModel, table=True):
    """
    Represents email addresses associated with roles for notifications or communication.
    """

    __tablename__ = "email"

    id: Optional[int] = Field(default=None, primary_key=True)
    address: str = Field(nullable=False, max_length=200, unique=True)
    role_id: int = Field(foreign_key="email_role.id", nullable=False)

    # Relationships
    role: Optional["EmailRole"] = Relationship(back_populates="emails")


class EmailRole(SQLModel, table=True):
    """
    Represents roles associated with email addresses for managing access or notifications.
    """

    __tablename__ = "email_role"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=50)

    # Relationships
    emails: List["Email"] = Relationship(back_populates="role")


class Menu(SQLModel, table=True):
    """
    Represents the menu of available meals.
    """

    __tablename__ = "menu"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=128, unique=True)
    details: Optional[str] = Field(default=None, max_length=256)

    # Relationships
    requests: List["Request"] = Relationship(back_populates="menu")
