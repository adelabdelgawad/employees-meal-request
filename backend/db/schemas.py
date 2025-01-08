from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


# ----- Role Schemas -----
class RoleRead(BaseModel):
    id: Optional[int]
    name: str

    model_config = {"from_attributes": True}


class RoleCreate(BaseModel):
    name: str


# ----- HRISSecurityUser Schemas -----
class HRISSecurityUserRead(BaseModel):
    id: Optional[int]
    username: str
    is_deleted: bool
    is_locked: bool

    model_config = {"from_attributes": True}


class HRISSecurityUserCreate(BaseModel):
    username: str
    is_deleted: Optional[bool] = False
    is_locked: Optional[bool] = False


# ----- Department Schemas -----
class DepartmentRead(BaseModel):
    id: Optional[int]
    name: str

    model_config = {"from_attributes": True}


class DepartmentCreate(BaseModel):
    name: str


# ----- Employee Schemas -----
class EmployeeRead(BaseModel):
    id: Optional[int]
    code: int
    name: Optional[str]
    title: Optional[str]
    is_active: bool
    department_id: int

    model_config = {"from_attributes": True}


class EmployeeCreate(BaseModel):
    code: int
    name: Optional[str]
    title: Optional[str]
    is_active: bool
    department_id: int


# ----- MealRequestStatus Schemas -----
class MealRequestStatusRead(BaseModel):
    id: Optional[int]
    name: str

    model_config = {"from_attributes": True}


class MealRequestStatusCreate(BaseModel):
    name: str


# ----- MealType Schemas -----
class MealTypeRead(BaseModel):
    id: Optional[int]
    name: str

    model_config = {"from_attributes": True}


class MealTypeCreate(BaseModel):
    name: str


# ----- Account Schemas -----
class AccountRead(BaseModel):
    id: Optional[int]
    username: str
    full_name: Optional[str]
    title: Optional[str]
    is_domain_user: bool

    model_config = {"from_attributes": True}


class AccountCreate(BaseModel):
    username: str
    full_name: Optional[str]
    title: Optional[str]
    is_domain_user: Optional[bool] = False
    hris_security_user_id: Optional[int]


# ----- RolePermission Schemas -----
class RolePermissionRead(BaseModel):
    id: Optional[int]
    role_id: int
    account_id: int

    model_config = {"from_attributes": True}


class RolePermissionCreate(BaseModel):
    role_id: int
    account_id: int


# ----- EmployeeShift Schemas -----
class EmployeeShiftRead(BaseModel):
    id: Optional[int]
    employee_id: int
    duration_hours: int
    date_from: datetime

    model_config = {"from_attributes": True}


class EmployeeShiftCreate(BaseModel):
    employee_id: int
    duration_hours: int
    date_from: datetime


# ----- MealRequest Schemas -----
class MealRequestRead(BaseModel):
    id: Optional[int]
    status_id: int
    requester_id: int
    meal_type_id: int
    request_time: Optional[datetime]
    created_time: datetime
    closed_time: Optional[datetime]
    notes: Optional[str]
    auditor_id: Optional[int]

    model_config = {"from_attributes": True}


class MealRequestCreate(BaseModel):
    status_id: int
    requester_id: int
    meal_type_id: int
    request_time: Optional[datetime] = None
    created_time: datetime
    closed_time: Optional[datetime] = None
    notes: Optional[str] = None
    auditor_id: Optional[int] = None


# ----- MealRequestLine Schemas -----
class MealRequestLineRead(BaseModel):
    id: Optional[int]
    employee_id: int
    department_id: int
    meal_request_id: int
    attendance: Optional[datetime]
    notes: Optional[str]
    is_accepted: bool
    shift_id: Optional[int]

    model_config = {"from_attributes": True}


class MealRequestLineCreate(BaseModel):
    employee_id: int
    department_id: int
    meal_request_id: int
    attendance: Optional[datetime] = None
    notes: Optional[str] = None
    is_accepted: bool = True
    shift_id: Optional[int] = None


# ----- LogRolePermission Schemas -----
class LogRolePermissionRead(BaseModel):
    id: Optional[int]
    account_id: int
    role_id: int
    admin_id: int
    action: str
    is_successful: bool
    result: Optional[str]
    timestamp: datetime

    model_config = {"from_attributes": True}


class LogRolePermissionCreate(BaseModel):
    account_id: int
    role_id: int
    admin_id: int
    action: str
    is_successful: bool
    result: Optional[str] = None
    timestamp: datetime


# ----- LogMealRequestLine Schemas -----
class LogMealRequestLineRead(BaseModel):
    id: Optional[int]
    meal_request_line_id: int
    account_id: int
    action: str
    is_successful: bool
    result: Optional[str]
    timestamp: datetime

    model_config = {"from_attributes": True}


class LogMealRequestLineCreate(BaseModel):
    meal_request_line_id: int
    account_id: int
    action: str
    is_successful: bool
    result: Optional[str] = None
    timestamp: datetime


# ----- LogTraffic Schemas -----
class LogTrafficRead(BaseModel):
    id: Optional[int]
    ip_address: str
    path: Optional[str]
    status: str
    result: Optional[str]
    request_body: Optional[str]
    timestamp: datetime

    model_config = {"from_attributes": True}


class LogTrafficCreate(BaseModel):
    ip_address: str
    path: Optional[str] = None
    status: str
    result: Optional[str] = None
    request_body: Optional[str] = None
    timestamp: datetime


# ----- Email Schemas -----
class EmailRead(BaseModel):
    id: Optional[int]
    address: str
    role_id: int

    model_config = {"from_attributes": True}


class EmailCreate(BaseModel):
    address: str
    role_id: int


# ----- EmailRole Schemas -----
class EmailRoleRead(BaseModel):
    id: Optional[int]
    name: str

    model_config = {"from_attributes": True}


class EmailRoleCreate(BaseModel):
    name: str
