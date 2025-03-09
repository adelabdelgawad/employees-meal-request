from sqlalchemy import Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship, DeclarativeBase, Mapped, mapped_column
from sqlalchemy.dialects.mysql import LONGTEXT

from typing import List, Optional
from datetime import datetime
import pytz

# Base class using the new DeclarativeBase


class Base(DeclarativeBase):
    pass


# -------------------
# SQLAlchemy Models
# -------------------


class PagePermission(Base):
    __tablename__ = "page_permission"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("role.id"), nullable=False)
    page_id: Mapped[int] = mapped_column(ForeignKey("page.id"), nullable=False)
    created_by_id: Mapped[int] = mapped_column(
        ForeignKey("account.id"), nullable=False)

    # Relationships
    role: Mapped["Role"] = relationship(back_populates="page_permissions")
    page: Mapped["Page"] = relationship(back_populates="page_permissions")
    created_by: Mapped["Account"] = relationship(
        back_populates="page_permissions_created"
    )

    def __repr__(self):
        return (
            f"<PagePermission(id={self.id}, role_id={self.role_id}, "
            f"page_id={self.page_id}, created_by_id={self.created_by_id})>"
        )


class Page(Base):
    __tablename__ = "page"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False)

    # Relationships
    page_permissions: Mapped[List["PagePermission"]] = relationship(
        back_populates="page"
    )

    def __repr__(self):
        return f"<Page(id={self.id}, name='{self.name}')>"


class Role(Base):
    __tablename__ = "role"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False)

    # Relationships
    permission_logs_admin: Mapped[List["LogPermission"]] = relationship(
        back_populates="role"
    )
    page_permissions: Mapped[List["PagePermission"]] = relationship(
        back_populates="role"
    )
    role_permissions: Mapped[List["RolePermission"]] = relationship(
        back_populates="role"
    )

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"


class SecurityUser(Base):
    __tablename__ = "security_user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_name: Mapped[str] = mapped_column(String(32), nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False)
    is_locked: Mapped[bool] = mapped_column(Boolean, nullable=False)

    # Relationships

    accounts: Mapped[List["Account"]] = relationship(
        back_populates="hris_user")
    department_assignments: Mapped[List["DepartmentAssignment"]] = relationship(
        back_populates="security_user"
    )

    def __repr__(self):
        return (
            f"<SecurityUser(id={self.id}, user_name='{self.user_name}', "
            f"is_deleted={self.is_deleted}, is_locked={self.is_locked})>"
        )


# In Account model
class Account(Base):
    __tablename__ = "account"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(
        String(64), nullable=False, unique=True)
    password: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    hris_user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("security_user.id"), nullable=True
    )
    is_domain_user: Mapped[bool] = mapped_column(Boolean, default=False)
    is_super_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    # Existing Relationships
    hris_user: Mapped["SecurityUser"] = relationship(back_populates="accounts")
    meal_requests_requested: Mapped[List["MealRequest"]] = relationship(
        back_populates="requester", foreign_keys="MealRequest.requester_id"
    )
    meal_requests_closed: Mapped[List["MealRequest"]] = relationship(
        back_populates="closed_by", foreign_keys="MealRequest.closed_by_id"
    )
    page_permissions_created: Mapped[List["PagePermission"]] = relationship(
        back_populates="created_by"
    )
    role_permissions: Mapped[List["RolePermission"]] = relationship(
        back_populates="account"
    )

    # New Logging Relationships
    permission_logs_effected: Mapped[List["LogPermission"]] = relationship(
        "LogPermission",
        foreign_keys="LogPermission.account_id",
        back_populates="effected_account",
    )
    permission_logs_admin: Mapped[List["LogPermission"]] = relationship(
        "LogPermission", foreign_keys="LogPermission.admin_id", back_populates="admin"
    )
    meal_request_line_logs: Mapped[List["LogMealRequestLine"]] = relationship(
        back_populates="account"
    )

    def __repr__(self):
        return (
            f"<Account(id={self.id}, username='{self.username}', "
            f"title='{self.title}', hris_user_id={self.hris_user_id}, "
            f"is_domain_user={self.is_domain_user}, "
            f"is_super_admin={self.is_super_admin})>"
        )


class Employee(Base):
    __tablename__ = "employee"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False)
    department_id: Mapped[int] = mapped_column(
        ForeignKey("department.id"), nullable=False
    )

    # Relationships
    department: Mapped["Department"] = relationship(back_populates="employees")
    meal_request_lines: Mapped[List["MealRequestLine"]] = relationship(
        back_populates="employee"
    )
    employee_shifts: Mapped[List["EmployeeShift"]] = relationship(
        back_populates="employee"
    )

    def __repr__(self):
        return (
            f"<Employee(id={self.id}, code={self.code}, name='{self.name}', "
            f"title='{self.title}', is_active={self.is_active}, "
            f"department_id={self.department_id})>"
        )


class Department(Base):
    __tablename__ = "department"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False)

    # Relationships
    employees: Mapped[List["Employee"]] = relationship(
        back_populates="department")
    department_assignments: Mapped[List["DepartmentAssignment"]] = relationship(
        back_populates="department"
    )
    meal_request_lines: Mapped[List["MealRequestLine"]] = relationship(
        back_populates="department"
    )

    def __repr__(self):
        return f"<Department(id={self.id}, name='{self.name}')>"


class DepartmentAssignment(Base):
    __tablename__ = "department_assignment"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    department_id: Mapped[int] = mapped_column(
        ForeignKey("department.id"), nullable=False
    )
    security_user_id: Mapped[int] = mapped_column(
        ForeignKey("security_user.id"), nullable=False
    )

    # Relationships
    department: Mapped["Department"] = relationship(
        back_populates="department_assignments"
    )
    security_user: Mapped["SecurityUser"] = relationship(
        back_populates="department_assignments"
    )

    def __repr__(self):
        return (
            f"<DepartmentAssignment(id={self.id}, department_id={
                self.department_id}, "
            f"security_user_id={self.security_user_id})>"
        )


# In MealRequest model
class MealRequest(Base):
    __tablename__ = "meal_request"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    requester_id: Mapped[int] = mapped_column(
        ForeignKey("account.id"), nullable=False)
    status_id: Mapped[int] = mapped_column(
        ForeignKey("meal_request_status.id"), nullable=False
    )
    meal_type_id: Mapped[int] = mapped_column(
        ForeignKey("meal_type.id"), nullable=False
    )
    request_time: Mapped[Optional[DateTime]
                         ] = mapped_column(DateTime, nullable=False, default=lambda: datetime.now(pytz.timezone("Africa/Cairo")))
    closed_by_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("account.id"), nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    closed_time: Mapped[Optional[DateTime]
                        ] = mapped_column(DateTime, nullable=True)

    # Existing Relationships
    requester: Mapped["Account"] = relationship(
        back_populates="meal_requests_requested", foreign_keys=[requester_id]
    )
    closed_by: Mapped["Account"] = relationship(
        back_populates="meal_requests_closed", foreign_keys=[closed_by_id]
    )
    status: Mapped["MealRequestStatus"] = relationship(
        back_populates="meal_requests")
    meal_type: Mapped["MealType"] = relationship(
        back_populates="meal_requests")
    meal_request_lines: Mapped[List["MealRequestLine"]] = relationship(
        back_populates="meal_request"
    )

    def __repr__(self):
        return (
            f"<MealRequest(id={self.id}, requester_id={self.requester_id}, "
            f"status_id={self.status_id}, meal_type_id={self.meal_type_id}, "
            f"request_time={self.request_time}, closed_by_id={
                self.closed_by_id}, "
            f"closed_time={self.closed_time})>"
        )


# In MealRequestLine model
class MealRequestLine(Base):
    __tablename__ = "meal_request_line"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employee.id"), nullable=False)
    department_id: Mapped[int] = mapped_column(
        ForeignKey("department.id"), nullable=False
    )
    meal_request_id: Mapped[int] = mapped_column(
        ForeignKey("meal_request.id"), nullable=False
    )
    attendance_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("attendance.id"))
    notes: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    is_accepted: Mapped[bool] = mapped_column(Boolean, default=False)
    shift_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("employee_shift.id"), nullable=True
    )

    # Existing Relationships
    attendance: Mapped["Attendance"] = relationship(
        back_populates="meal_request_lines")
    shift: Mapped["EmployeeShift"] = relationship(
        back_populates="meal_request_lines")
    employee: Mapped["Employee"] = relationship(
        back_populates="meal_request_lines")
    department: Mapped["Department"] = relationship(
        back_populates="meal_request_lines")
    meal_request: Mapped["MealRequest"] = relationship(
        back_populates="meal_request_lines"
    )

    # New Logging Relationship
    meal_request_line_logs: Mapped[List["LogMealRequestLine"]] = relationship(
        back_populates="meal_request_line"
    )

    def __repr__(self):
        return (
            f"<MealRequestLine(id={self.id}, employee_id={self.employee_id}, "
            f"department_id={self.department_id}, meal_request_id={
                self.meal_request_id}, "
            f"shift_id={self.shift_id}, is_accepted={self.is_accepted})>"
        )


class MealRequestStatus(Base):
    __tablename__ = "meal_request_status"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False)

    # Relationships
    meal_requests: Mapped[List["MealRequest"]
                          ] = relationship(back_populates="status")

    def __repr__(self):
        return f"<MealRequestStatus(id={self.id}, name='{self.name}')>"


class MealType(Base):
    __tablename__ = "meal_type"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False)

    # Relationships
    meal_requests: Mapped[List["MealRequest"]] = relationship(
        back_populates="meal_type"
    )

    def __repr__(self):
        return f"<MealType(id={self.id}, name='{self.name}')>"


class Email(Base):
    __tablename__ = "email"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    address: Mapped[str] = mapped_column(
        String(200), nullable=False, unique=True)
    role_id: Mapped[int] = mapped_column(
        ForeignKey("email_role.id"), nullable=False)

    # Relationships
    role: Mapped["EmailRole"] = relationship(back_populates="emails")

    def __repr__(self):
        return f"<Email(id={self.id}, address='{
            self.address}', role_id={self.role_id})>"


class EmailRole(Base):
    __tablename__ = "email_role"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)

    # Relationships
    emails: Mapped[List["Email"]] = relationship(back_populates="role")

    def __repr__(self):
        return f"<EmailRole(id={self.id}, name='{self.name}')>"


class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_code: Mapped[int] = mapped_column(Integer, nullable=False)
    timestamp: Mapped[Optional[DateTime]] = mapped_column(
        DateTime, nullable=True)

    meal_request_lines: Mapped[List["MealRequestLine"]] = relationship(
        back_populates="attendance"
    )

    def __repr__(self):
        return f"<Attendance(id={self.id}, timestamp={self.timestamp})>"


class EmployeeShift(Base):
    __tablename__ = "employee_shift"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employee.id"), nullable=False)
    duration_hours: Mapped[int] = mapped_column(Integer, nullable=False)
    date_from: Mapped[Optional[DateTime]] = mapped_column(
        DateTime, nullable=False)
    shift_type: Mapped[str] = mapped_column(String(16), nullable=False)

    # Relationships
    employee: Mapped["Employee"] = relationship(
        back_populates="employee_shifts")
    meal_request_lines: Mapped[List["MealRequestLine"]] = relationship(
        back_populates="shift"
    )

    def __repr__(self):
        return (
            f"<EmployeeShift(id={self.id}, employee_id={self.employee_id}, "
            f"duration_hours={self.duration_hours}, shift_type='{
                self.shift_type}')>"
        )


class AttendanceDevice(Base):
    __tablename__ = "attendance_device"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    device_id: Mapped[int] = mapped_column(Integer, nullable=False)
    type_id: Mapped[int] = mapped_column(
        ForeignKey("attendance_device_type.id"))
    device_type: Mapped["AttendanceDeviceType"] = relationship(
        back_populates="attendance_devices"
    )

    def __repr__(self):
        return f"<AttendanceDevice(id={self.id}, device_id={self.device_id})>"


class AttendanceDeviceType(Base):
    __tablename__ = "attendance_device_type"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String(16), nullable=False)
    attendance_devices: Mapped[List["AttendanceDevice"]] = relationship(
        back_populates="device_type"
    )


class RolePermission(Base):
    __tablename__ = "role_permission"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("role.id"), nullable=False)
    account_id: Mapped[int] = mapped_column(
        ForeignKey("account.id"), nullable=False)

    # Relationships
    role: Mapped["Role"] = relationship(back_populates="role_permissions")
    account: Mapped["Account"] = relationship(
        back_populates="role_permissions")

    def __repr__(self):
        return (
            f"<RolePermission(id={self.id}, role_id={self.role_id}, "
            f"account_id={self.account_id})>"
        )


class LogTraffic(Base):
    __tablename__ = "log_traffic"

    id: Mapped[int] = mapped_column(primary_key=True)
    ip_address: Mapped[str] = mapped_column(String(64))
    path: Mapped[str] = mapped_column(LONGTEXT, nullable=True)
    status: Mapped[str] = mapped_column(String(64))
    result: Mapped[Optional[str]] = mapped_column(LONGTEXT, nullable=True)
    request_body: Mapped[Optional[str]] = mapped_column(
        LONGTEXT, nullable=True)

    timestamp: Mapped[Optional[DateTime]] = mapped_column(
        DateTime, default=lambda: datetime.now(pytz.timezone("Africa/Cairo"))
    )


class LogPermission(Base):
    __tablename__ = "log_permission"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    account_id: Mapped[int] = mapped_column(
        ForeignKey("account.id"), nullable=False
    )
    role_id: Mapped[int] = mapped_column(
        ForeignKey("role.id"), nullable=False
    )
    admin_id: Mapped[int] = mapped_column(
        ForeignKey("account.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(32), nullable=False)
    is_successful: Mapped[bool] = mapped_column(Boolean, nullable=False)
    result: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[Optional[DateTime]] = mapped_column(
        DateTime, default=lambda: datetime.now(pytz.timezone("Africa/Cairo"))
    )

    effected_account: Mapped["Account"] = relationship(
        "Account",
        foreign_keys=[account_id],
        back_populates="permission_logs_effected",
    )
    admin: Mapped["Account"] = relationship(
        "Account", foreign_keys=[admin_id], back_populates="permission_logs_admin"
    )
    role: Mapped["Role"] = relationship(back_populates="permission_logs_admin")

    def __repr__(self):
        return (
            f"<LogPermission(id={self.id}, account_id={
                self.account_id}, "
            f"admin_id={self.admin_id}, action='{
                self.action}', timestamp={self.timestamp})>"
        )


class LogMealRequestLine(Base):
    __tablename__ = "log_meal_request_line"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meal_request_line_id: Mapped[int] = mapped_column(
        ForeignKey("meal_request_line.id"), nullable=False
    )
    account_id: Mapped[int] = mapped_column(
        ForeignKey("account.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(32), nullable=False)
    is_successful: Mapped[bool] = mapped_column(Boolean, nullable=False)
    result: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[Optional[DateTime]] = mapped_column(
        DateTime, default=lambda: datetime.now(pytz.timezone("Africa/Cairo"))
    )

    meal_request_line: Mapped["MealRequestLine"] = relationship(
        "MealRequestLine", back_populates="meal_request_line_logs"
    )
    account: Mapped["Account"] = relationship(
        "Account", back_populates="meal_request_line_logs"
    )

    def __repr__(self):
        return (
            f"<LogMealRequestLine(id={self.id}, meal_request_line_id={
                self.meal_request_line_id}, "
            f"account_id={self.account_id}, action='{self.action}', "
            f"timestamp={self.timestamp})>"
        )
