from pydantic import BaseModel, ConfigDict, field_serializer, Field
from datetime import datetime
from typing import Optional, List, Dict
from services.schema import ReportDetailsRecord


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
    notes: Optional[str] = ""

    model_config = ConfigDict(from_attributes=True)


# ✅ RequestResponse Model
class RequestPageRecordResponse(BaseModel):
    id: int
    status_name: str
    status_id: int
    requester_id: int | None = None
    requester: Optional[str] = None
    requester_title: Optional[str] = None
    meal: Optional[str] = None
    request_time: Optional[datetime] = None
    closed_time: Optional[datetime] = None
    notes: str | None = None
    total_lines: int
    accepted_lines: int

    model_config = ConfigDict(from_attributes=True)


class RequestLineRespose(BaseModel):
    id: int
    name: str
    title: str
    code: int
    notes: str | None = None
    attendance_in: datetime | None = None
    shift_hours: int | None = None
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


class DomainUser(BaseModel):
    id: int
    username: str
    fullName: Optional[str] = None
    title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class RoleResponse(BaseModel):
    id: int
    name: str


class SettingUserResponse(BaseModel):
    id: int
    fullName: str | None = None
    username: str
    title: str | None = None
    roles: Optional[List[RoleResponse]] | None = None

    model_config = ConfigDict(from_attributes=True)


class UserCreateRequest(BaseModel):
    username: str
    full_name: str
    title: str
    roles: List[int]

    model_config = ConfigDict(from_attributes=True)


class UserCreateResponse(BaseModel):
    success: bool
    message: str
    data: dict

    model_config = ConfigDict(from_attributes=True)


class UpdateRolesRequest(BaseModel):
    added_roles: List[int] | None = None
    removed_roles: List[int] | None = None

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
    username: str | None = None
    full_name: str | None = None
    title: str | None = None
    email: str | None = None
    roles: list[str] = []

    model_config = ConfigDict(from_attributes=True)


class UserData(BaseModel):
    userId: int | None = None
    username: str | None = None
    fullName: str | None = None
    title: str | None = None
    email: str | None = None
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
    notes: str | None = None

    model_config = ConfigDict(from_attributes=True)


class RequestPayload(BaseModel):
    requests: List[RequestItem]
    request_time: datetime | None = None
    notes: str | None = None
    request_timing_option: str | None = None

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
    meal: Optional[str] = None
    request_time: Optional[datetime] = None
    closed_time: Optional[datetime] = None
    notes: str | None = None
    total_lines: int
    accepted_lines: int

    model_config = ConfigDict(from_attributes=True)


class ScheduleRequest(BaseModel):
    request_id: int
    scheduled_time: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportDetailsResponse(BaseModel):
    request_lines: List[ReportDetailsRecord] | None = None
    current_pages: int | None = None
    page_size: int | None = None
    total_pages: int | None = None
    total_rows: int | None = None

    model_config = ConfigDict(from_attributes=True)
