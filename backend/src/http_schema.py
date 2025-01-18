from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict


# ✅ DepartmentResponse Model
class DepartmentResponse(BaseModel):
    id: int
    name: str

    # Enabling model instantiation from ORM objects
    model_config = ConfigDict(from_attributes=True)


# ✅ RequestBody Model
class RequestBody(BaseModel):
    employee_id: int
    employee_code: int
    department_id: int
    meal_id: int
    notes: Optional[str] = Field(default="")

    model_config = ConfigDict(from_attributes=True)


# ✅ RequestResponse Model
class RequestPageRecordResponse(BaseModel):
    id: int
    status_name: str
    status_id: int
    requester: Optional[str] = None
    requester_title: Optional[str] = None
    meal: Optional[str] = None
    request_time: datetime
    closed_time: Optional[datetime] = None
    notes: str
    total_lines: int
    accepted_lines: int

    model_config = ConfigDict(from_attributes=True)


class RequestLineRespose(BaseModel):
    id: int
    name: str
    title: str
    code: int
    attendance: datetime | None = None
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


class ReportDetailsResponse(BaseModel):
    id: int
    employee_code: int | None = None
    employee_name: str | None = None
    employee_title: str | None = None
    department: str | None = None
    requester_name: str | None = None
    requester_title: str | None = None
    request_time: datetime | None = None
    meal: str | None = None
    attendance_in: datetime | None = None
    attendance_out: datetime | None = None
    shift_hours: int | None = None
    notes: str | None = None

    model_config = ConfigDict(from_attributes=True)
