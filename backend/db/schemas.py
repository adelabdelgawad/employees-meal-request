from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# ----- Role Schemas -----
class RoleRead(BaseModel):
    id: int
    name: str
    description: str | None

    model_config = ConfigDict(from_attributes=True)


class RoleCreate(BaseModel):
    name: str


# ----- HRISSecurityUser Schemas -----
class HRISSecurityUserRead(BaseModel):
    id: int | None
    username: str
    is_deleted: bool
    is_locked: bool

    model_config = ConfigDict(from_attributes=True)


class HRISSecurityUserCreate(BaseModel):
    username: str
    is_deleted: Optional[bool] = False
    is_locked: Optional[bool] = False


# ----- Department Schemas -----
class DepartmentRead(BaseModel):
    id: int | None
    name: str

    model_config = ConfigDict(from_attributes=True)


class DepartmentCreate(BaseModel):
    name: str


# ----- Employee Schemas -----
class EmployeeRead(BaseModel):
    id: int | None
    code: int
    name: Optional[str]
    title: Optional[str]
    is_active: bool
    department_id: int

    model_config = ConfigDict(from_attributes=True)


class EmployeeCreate(BaseModel):
    code: int
    name: Optional[str]
    title: Optional[str]
    is_active: bool
    department_id: int


# ----- RequestStatus Schemas -----
class RequestStatusRead(BaseModel):
    id: int | None
    name: str

    model_config = ConfigDict(from_attributes=True)


class RequestStatusCreate(BaseModel):
    name: str


# ----- Meal Schemas -----
class MealRead(BaseModel):
    id: int | None
    name: str

    model_config = ConfigDict(from_attributes=True)


class MealCreate(BaseModel):
    name: str


# ----- Account Schemas -----
class AccountRead(BaseModel):
    id: int | None
    username: str
    fullname: Optional[str]
    title: Optional[str]
    is_domain_user: bool

    model_config = ConfigDict(from_attributes=True)


class AccountCreate(BaseModel):
    username: str
    fullname: Optional[str]
    title: Optional[str]
    is_domain_user: Optional[bool] = False


# ----- RolePermission Schemas -----
class RolePermissionRead(BaseModel):
    id: int | None
    role_id: int
    account_id: int

    model_config = ConfigDict(from_attributes=True)


class RolePermissionCreate(BaseModel):
    role_id: int
    account_id: int


# ----- Request Schemas -----
class RequestRead(BaseModel):
    id: int | None
    status_id: int
    requester_id: int
    id: int
    request_time: Optional[datetime]
    created_time: datetime
    closed_time: Optional[datetime]
    notes: Optional[str]
    auditor_id: int | None

    model_config = ConfigDict(from_attributes=True)


class RequestCreate(BaseModel):
    status_id: int
    requester_id: int
    id: int
    request_time: Optional[datetime] = None
    created_time: datetime
    closed_time: Optional[datetime] = None
    notes: Optional[str] = None
    auditor_id: int | None = None


# ----- RequestLine Schemas -----
class RequestLineRead(BaseModel):
    id: int | None
    employee_id: int
    department_id: int
    request_id: int
    attendance: Optional[datetime]
    notes: Optional[str]
    is_accepted: bool
    shift_hours: int | None

    model_config = ConfigDict(from_attributes=True)


class RequestLineCreate(BaseModel):
    employee_id: int
    department_id: int
    request_id: int
    attendance: Optional[datetime] = None
    notes: Optional[str] = None
    is_accepted: bool = True
    shift_hours: int | None = None


# ----- LogRolePermission Schemas -----
class LogRolePermissionRead(BaseModel):
    id: int | None
    account_id: int
    role_id: int
    admin_id: int
    action: str
    is_successful: bool
    result: Optional[str]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class LogRolePermissionCreate(BaseModel):
    account_id: int
    role_id: int
    admin_id: int
    action: str
    is_successful: bool
    result: Optional[str] = None
    timestamp: datetime


# ----- LogRequestLine Schemas -----
class LogRequestLineRead(BaseModel):
    id: int | None
    request_line_id: int
    account_id: int
    action: str
    is_successful: bool
    result: Optional[str]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class LogRequestLineCreate(BaseModel):
    request_line_id: int
    account_id: int
    action: str
    is_successful: bool
    result: Optional[str] = None
    timestamp: datetime


# ----- LogTraffic Schemas -----
class LogTrafficRead(BaseModel):
    id: int | None
    ip_address: str
    path: Optional[str]
    status: str
    result: Optional[str]
    request_body: Optional[str]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class LogTrafficCreate(BaseModel):
    ip_address: str
    path: Optional[str] = None
    status: str
    result: Optional[str] = None
    request_body: Optional[str] = None
    timestamp: datetime


# ----- Email Schemas -----
class EmailRead(BaseModel):
    id: int | None
    address: str
    role_id: int

    model_config = ConfigDict(from_attributes=True)


class EmailCreate(BaseModel):
    address: str
    role_id: int


# ----- EmailRole Schemas -----
class EmailRoleRead(BaseModel):
    id: int | None
    name: str

    model_config = ConfigDict(from_attributes=True)


class EmailRoleCreate(BaseModel):
    name: str
