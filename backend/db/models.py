from typing import List, Optional
from datetime import datetime
import pytz
from sqlmodel import Field, Relationship, SQLModel

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")



class Role(SQLModel, table=True):
    """
    Role model represents user roles and their associated permissions.
    """
    __tablename__ = "role"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=64)

    # Relationships
    permission: List["RolePermission"] = Relationship(
        back_populates="role")
    role_permissions: List["RolePermission"] = Relationship(
        back_populates="role")
    permission_logs_admin: List["LogPermission"] = Relationship(
        back_populates="role")


class HMISSecurityUser(SQLModel, table=True):
    """
    HMISSecurityUser model representing a user account in the HRIS system.
    """
    __tablename__ = "hmis_security_user"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(nullable=False, max_length=64)
    is_deleted: bool = Field(default=False)
    is_locked: bool = Field(default=False)

    # Relationships
    accounts: List["Account"] = Relationship(back_populates="hmis_security_user")


class Department(SQLModel, table=True):
    """
    Department model representing organizational departments.
    """
    __tablename__ = "department"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=64)

    # Relationships
    employees: List["Employee"] = Relationship(back_populates="department")
    meal_request_lines: List["MealRequestLine"] = Relationship(
        back_populates="department")


class Employee(SQLModel, table=True):
    """
    Employee model representing staff members in the organization.
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
        back_populates="employees")
    meal_request_lines: List["MealRequestLine"] = Relationship(
        back_populates="employee")


class MealRequestStatus(SQLModel, table=True):
    """
    MealRequestStatus model representing the status of a MealRequest.
    """
    __tablename__ = "meal_request_status"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=64)

    # Relationships
    meal_requests: List["MealRequest"] = Relationship(back_populates="status")


class MealType(SQLModel, table=True):
    """
    MealType model representing the type of a MealRequest.
    """
    __tablename__ = "meal_type"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=64)

    # Relationships
    meal_requests: List["MealRequest"] = Relationship(
        back_populates="meal_type")


class Account(SQLModel, table=True):
    """
    Account model represents user login accounts.
    """
    __tablename__ = "account"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(nullable=False, unique=True, max_length=64)
    password: Optional[str] = Field(default=None, max_length=64)
    title: Optional[str] = Field(default=None, max_length=64)
    is_domain_user: bool = Field(default=False)
    is_super_admin: bool = Field(default=False)
    hmis_security_user_id: Optional[int] = Field(foreign_key="hmis_security_user.id")

    # Relationships
    hmis_security_user: Optional["HMISSecurityUser"] = Relationship(
        back_populates="accounts")
    role_permissions: List["RolePermission"] = Relationship(
        back_populates="account")
    requests: List["MealRequest"] = Relationship(back_populates="requester")
    meal_request_line_logs: List["LogMealRequestLine"] = Relationship(
        back_populates="account")


class RolePermission(SQLModel, table=True):
    """
    RolePermission model for permissions granted to an Account.
    """
    __tablename__ = "role_permission"

    id: Optional[int] = Field(default=None, primary_key=True)
    role_id: int = Field(foreign_key="role.id", nullable=False)
    account_id: int = Field(foreign_key="account.id", nullable=False)

    # Relationships
    role: Optional["Role"] = Relationship(back_populates="role_permissions")
    account: Optional["Account"] = Relationship(
        back_populates="role_permissions")


class EmployeeShift(SQLModel, table=True):
    """
    EmployeeShift model representing shifts assigned to employees.
    """
    __tablename__ = "employee_shift"

    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id", nullable=False)
    duration_hours: int = Field(nullable=False)
    date_from: datetime = Field(nullable=False)

    # Relationships
    meal_request_lines: List["MealRequestLine"] = Relationship(
        back_populates="shift")


class MealRequest(SQLModel, table=True):
    """
    MealRequest model representing a meal request.
    """
    __tablename__ = "meal_request"

    id: Optional[int] = Field(default=None, primary_key=True)
    status_id: int = Field(
        foreign_key="meal_request_status.id", nullable=False)
    requester_id: int = Field(foreign_key="account.id", nullable=False)
    meal_type_id: int = Field(
        foreign_key="meal_type.id", default=1, nullable=False)
    request_time: datetime = Field(
        default_factory=lambda: datetime.now(cairo_tz))
    closed_time: Optional[datetime] = Field(default=None)
    notes: Optional[str] = Field(default=None, max_length=256)

    # Relationships
    status: Optional["MealRequestStatus"] = Relationship(
        back_populates="meal_requests")
    meal_type: Optional["MealType"] = Relationship(
        back_populates="meal_requests")
    requester: Optional["Account"] = Relationship(back_populates="requests")
    meal_request_lines: List["MealRequestLine"] = Relationship(
        back_populates="meal_request")


class MealRequestLine(SQLModel, table=True):
    """
    MealRequestLine model representing individual line items in a MealRequest.
    """
    __tablename__ = "meal_request_line"

    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id", nullable=False)
    department_id: int = Field(foreign_key="department.id", nullable=False)
    meal_request_id: int = Field(foreign_key="meal_request.id", nullable=False)
    attendance: Optional[datetime] = Field(default=None)
    notes: Optional[str] = Field(default=None, max_length=256)
    is_accepted: bool = Field(default=True)
    shift_id: Optional[int] = Field(
        foreign_key="employee_shift.id", default=None)

    # Relationships
    employee: Optional["Employee"] = Relationship(
        back_populates="meal_request_lines")
    department: Optional["Department"] = Relationship(
        back_populates="meal_request_lines")
    meal_request: Optional["MealRequest"] = Relationship(
        back_populates="meal_request_lines")
    shift: Optional["EmployeeShift"] = Relationship(
        back_populates="meal_request_lines")
    meal_request_line_logs: List["LogMealRequestLine"] = Relationship(
        back_populates="meal_request_line")


class LogPermission(SQLModel, table=True):
    """
    LogPermission model representing permission logs.
    """
    __tablename__ = "log_permission"

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
        back_populates="permission_logs_admin")


class LogMealRequestLine(SQLModel, table=True):
    """
    LogMealRequestLine model representing logs for meal request lines.
    """
    __tablename__ = "log_meal_request_line"

    id: Optional[int] = Field(default=None, primary_key=True)
    meal_request_line_id: int = Field(
        foreign_key="meal_request_line.id", nullable=False)
    account_id: int = Field(foreign_key="account.id", nullable=False)
    action: str = Field(nullable=False, max_length=32)
    is_successful: bool = Field(nullable=False)
    result: Optional[str] = Field(default=None)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(cairo_tz))

    # Relationships
    meal_request_line: Optional["MealRequestLine"] = Relationship(
        back_populates="meal_request_line_logs")
    account: Optional["Account"] = Relationship(
        back_populates="meal_request_line_logs")


class LogTraffic(SQLModel, table=True):
    """
    LogTraffic model representing HTTP traffic logs.
    """
    __tablename__ = "log_traffic"

    id: Optional[int] = Field(default=None, primary_key=True)
    ip_address: str = Field(nullable=False, max_length=64)
    path: Optional[str] = Field(default=None)
    status: str = Field(nullable=False, max_length=64)
    result: Optional[str] = Field(default=None)
    request_body: Optional[str] = Field(default=None)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(cairo_tz))


class Email(SQLModel, table=True):
    """
    Email model representing email addresses associated with roles.
    """
    __tablename__ = "email"

    id: Optional[int] = Field(default=None, primary_key=True)
    address: str = Field(nullable=False, max_length=200, unique=True)
    role_id: int = Field(foreign_key="email_role.id", nullable=False)

    # Relationships
    role: Optional["EmailRole"] = Relationship(back_populates="emails")


class EmailRole(SQLModel, table=True):
    """
    EmailRole model representing roles associated with emails.
    """
    __tablename__ = "email_role"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=50)

    # Relationships
    emails: List["Email"] = Relationship(back_populates="role")
