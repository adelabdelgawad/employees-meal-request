from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List
from db.schemas import AccountRead, RoleRead
from services.schema import (
    Department,
    Employee,
    Meal,
    ReportDetailsRecord,
    Role,
    UserWithRoles,
)


# ✅ DepartmentResponse Model
class DepartmentResponse(BaseModel):
    id: int
    name: str

    # Enabling model instantiation from ORM objects
    model_config = ConfigDict(from_attributes=True)


# ✅ RequestBody Model
class RequestBody(BaseModel):
    employee_id: int = Field(..., alias="id")
    employee_code: int = Field(..., alias="code")
    name: str
    department_id: int
    meal_id: int
    meal_name: str
    notes: str | None

    model_config = ConfigDict(from_attributes=True)


# ✅ RequestResponse Model
class RequestPageRecordResponse(BaseModel):
    id: int
    status_name: str
    status_id: int
    requester_id: int | None
    requester: str
    requester_title: str
    meal: str
    request_time: datetime
    closed_time: datetime | None
    notes: str | None
    total_lines: int
    accepted_lines: int

    model_config = ConfigDict(from_attributes=True)


class RequestLineRespose(BaseModel):
    id: int
    name: str
    title: str
    code: int
    notes: str | None
    attendance_in: datetime | None
    shift_hours: int | None
    is_accepted: bool

    model_config = ConfigDict(from_attributes=True)


class UpdateRequestStatus(BaseModel):
    id: int
    is_accepted: bool

    model_config = ConfigDict(from_attributes=True)


class ReportDashboardResponse(BaseModel):
    id: int
    department: str
    dinner_requests: int
    lunch_requests: int

    model_config = ConfigDict(from_attributes=True)


class DomainUserResponse(BaseModel):
    id: int
    username: str
    fullname: str
    title: str

    model_config = ConfigDict(from_attributes=True)


class RoleResponse(BaseModel):
    id: int
    name: str


class SettingUserResponse(BaseModel):
    roles: List[RoleRead]
    users: List[UserWithRoles]
    domain_users: List[DomainUserResponse]

    model_config = ConfigDict(from_attributes=True)


class UserCreateRequest(BaseModel):
    username: str
    fullname: str
    title: str
    roles: List[int]

    model_config = ConfigDict(from_attributes=True)


class UserCreateResponse(BaseModel):
    success: bool
    message: str
    data: dict

    model_config = ConfigDict(from_attributes=True)


class SettingUserInfoResponse(BaseModel):
    user_roles_ids: int | None
    user: SettingUserResponse | None
    all_roles: List[RoleResponse] | None

    model_config = ConfigDict(from_attributes=True)


class SettingUsersResponse(BaseModel):
    roles: List[RoleRead] | None
    user: List[AccountRead] | None
    all_roles: List[RoleResponse] | None

    model_config = ConfigDict(from_attributes=True)


class UpdateRolesRequest(BaseModel):
    added_roles: List[int] | None
    removed_roles: List[int] | None

    model_config = ConfigDict(from_attributes=True)


class UpdateRequestLinesPayload(BaseModel):
    request_id: int
    changed_statuses: List[UpdateRequestStatus]


class Token(BaseModel):
    access_token: str
    refresh_token: str


class LoginRequest(BaseModel):
    username: str
    password: str


class User(BaseModel):
    id: int
    username: str | None
    fullname: str | None
    title: str | None
    email: str | None
    roles: list[str] = []

    model_config = ConfigDict(from_attributes=True)


class UserData(BaseModel):
    userId: int | None
    username: str | None
    fullname: str | None
    title: str | None
    email: str | None
    roles: List[str] | None = []

    model_config = ConfigDict(from_attributes=True)


## Request Endpoint
class RequestItem(BaseModel):
    employee_id: int
    employee_code: int
    name: str
    department_id: int
    meal_id: int
    meal_name: str
    notes: str | None

    model_config = ConfigDict(from_attributes=True)


class RequestPayload(BaseModel):
    requests: List[RequestItem]
    request_time: datetime | None
    notes: str | None
    request_timing_option: str | None

    model_config = ConfigDict(from_attributes=True)


class RequestsResponse(BaseModel):
    data: List[RequestPageRecordResponse]
    current_page: int
    page_size: int
    total_pages: int
    total_rows: int

    model_config = ConfigDict(from_attributes=True)


class UpdateRequestStatusPayload(BaseModel):
    request_id: int
    status_id: int

    model_config = ConfigDict(from_attributes=True)


## Hsitory Endpoint
# ✅ RequestResponse Model
class RequestHistoryRecordResponse(BaseModel):
    id: int
    status_name: str
    status_id: int
    meal: str
    request_time: datetime
    closed_time: datetime
    notes: str | None
    total_lines: int
    accepted_lines: int

    model_config = ConfigDict(from_attributes=True)


class ScheduleRequest(BaseModel):
    request_id: int
    scheduled_time: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportDetailsResponse(BaseModel):
    request_lines: List[ReportDetailsRecord] | None
    current_pages: int | None
    page_size: int | None
    total_pages: int | None
    total_rows: int | None

    model_config = ConfigDict(from_attributes=True)


class NewRequestDataResponse(BaseModel):
    departments: List[Department] | None
    employees: List[Employee] | None
    meals: List[Meal] | None

    model_config = ConfigDict(from_attributes=True)
