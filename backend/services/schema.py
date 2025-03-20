from typing import Optional, List
from pydantic import BaseModel, ConfigDict, field_serializer
from datetime import datetime
from sqlmodel import SQLModel, Field

from pydantic import BaseModel, ConfigDict
from typing import Optional


class UserAttributes(BaseModel):
    display_name: str
    telephone: str | None
    mail: str | None
    title: str | None


class Role(BaseModel):
    id: int
    name: str
    descreption: str | None

    model_config = ConfigDict(from_attributes=True)


class RequestSummary(BaseModel):
    request_id: int
    status_name: str
    requester_name: str
    requester_title: str | None
    notes: Optional[str]
    request_time: datetime
    closed_time: Optional[datetime]
    meal: str | None
    total_request_lines: int
    accepted_request_lines: Optional[int]

    # Configuration to allow Pydantic to work seamlessly with ORM objects
    model_config = ConfigDict(from_attributes=True)


class RequestLineRequest(BaseModel):
    employee_id: int
    employee_code: int
    department_id: int
    notes: str | None


class RequestResponse(BaseModel):
    request_id: int
    requester_name: str
    request_time: datetime
    request_notes: str | None
    total_request_lines: Optional[int]
    accepted_request_lines: Optional[int]
    status_name: str
    close_time: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class FormData(BaseModel):
    username: str
    password: str

    model_config = ConfigDict(from_attributes=True)


class RequestLineResponse(BaseModel):
    id: int
    code: int
    name: str
    title: str
    department: str
    shift_hours: Optional[int]
    sign_in_time: Optional[datetime]
    accepted: Optional[bool] = True
    notes: str | None
    meal: str | None

    model_config = ConfigDict(from_attributes=True)


class RequestDataResponse(BaseModel):
    name: str
    accepted_requests: int

    model_config = ConfigDict(from_attributes=True)


class RequestsPageRecord(BaseModel):
    id: Optional[int]
    code: Optional[int]
    name: str | None
    title: str | None
    department_id: Optional[int]
    department: str | None

    model_config = ConfigDict(from_attributes=True)


# Response model using SQLModel
class RolePermissionResponse(SQLModel):
    username: str
    roles: List[int] = Field(default_factory=list)


class UserCreateRequest(BaseModel):
    created_by: int
    username: str
    role_ids: List[int]

    model_config = ConfigDict(from_attributes=True)


class UserUpdateRequest(BaseModel):
    role_ids: List[int]

    model_config = ConfigDict(from_attributes=True)


class UpdateAccountPermissionRequest(BaseModel):
    requester_id: int
    username: str
    added_roles: Optional[List[int]]
    removed_roles: Optional[List[int]]

    model_config = ConfigDict(from_attributes=True)


class AuditRecordRequest(BaseModel):
    id: Optional[int]
    code: Optional[int]
    employee_name: Optional[str]
    title: Optional[str]
    department: Optional[str]
    requester: Optional[str]
    requester_title: Optional[str]
    meal: Optional[str]
    notes: Optional[str]
    request_time: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class AuditRecordResponse(AuditRecordRequest):
    in_time: Optional[datetime]
    out_time: Optional[datetime]
    working_hours: Optional[float]


class Attendance(BaseModel):
    code: Optional[int]
    in_time: Optional[datetime]
    out_time: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class DomainAccount(BaseModel):
    username: str
    fullname: str | None
    title: str | None

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    username: str
    password: str

    model_config = ConfigDict(from_attributes=True)


class ReportDetailsRecord(BaseModel):
    id: int
    employee_code: int | None
    employee_name: str | None
    employee_title: str | None
    department: str | None
    requester_name: str | None
    requester_title: str | None
    request_time: datetime | None
    meal: str | None
    attendance_in: datetime | None
    attendance_out: datetime | None
    shift_hours: int | None
    notes: str | None

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("attendance_in", "attendance_out", "request_time")
    def customize_datetime_format(self, value: datetime) -> str | None:
        if value is None:
            return None
        return value.isoformat(sep=" ", timespec="seconds")


class Department(BaseModel):
    id: int
    name: str | None

    model_config = ConfigDict(from_attributes=True)


class Meal(BaseModel):
    id: int
    name: str | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class Employee(BaseModel):
    id: int
    code: int
    name: str | None
    title: str | None
    is_active: bool
    department_id: int

    model_config = ConfigDict(from_attributes=True)


class DomainUser(BaseModel):
    id: int
    username: str
    fullname: str | None
    title: str | None

    model_config = ConfigDict(from_attributes=True)


class UserWithRoles(BaseModel):
    id: int
    username: str
    fullName: str
    title: str
    roles: List[Role]
    active: bool

    model_config = ConfigDict(from_attributes=True)
