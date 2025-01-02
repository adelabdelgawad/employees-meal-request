from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from sqlmodel import SQLModel, Field

from pydantic import BaseModel, ConfigDict
from typing import Optional


class UserAttributes(BaseModel):
    display_name: str
    telephone: Optional[str] = None
    mail: Optional[str] = None
    title: Optional[str] = None


class MealRequestSummary(BaseModel):
    meal_request_id: int
    status_name: str
    requester_name: str
    requester_title: Optional[str] = None
    notes: Optional[str]
    request_time: datetime
    closed_time: Optional[datetime]
    meal_type: Optional[str] = None
    total_request_lines: int
    accepted_request_lines: Optional[int]

    # Configuration to allow Pydantic to work seamlessly with ORM objects
    model_config = ConfigDict(from_attributes=True)


class MealRequestLineRequest(BaseModel):
    employee_id: int
    employee_code: int
    department_id: int
    notes: Optional[str] = None


class MealRequestResponse(BaseModel):
    meal_request_id: int
    requester_name: str
    request_time: datetime
    request_notes: Optional[str] = None
    total_request_lines: Optional[int] = None
    accepted_request_lines: Optional[int] = None
    status_name: str
    close_time: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class FormData(BaseModel):
    username: str
    password: str

    model_config = ConfigDict(from_attributes=True)


class MealRequestLineResponse(BaseModel):
    id: int
    code: int
    name: str
    title: str
    department: str
    shift_hours: Optional[int] = None
    sign_in_time: Optional[datetime] = None
    accepted: Optional[bool] = True
    notes: Optional[str] = None
    meal_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class RequestDataResponse(BaseModel):
    name: str
    accepted_requests: int

    model_config = ConfigDict(from_attributes=True)


class RequestsPageRecord(BaseModel):
    id: Optional[int]
    code: Optional[int] = None
    name: Optional[str] = None
    title: Optional[str] = None
    department_id: Optional[int] = None
    department: Optional[str] = None

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
    requester_id: int = None
    username: str
    added_roles: Optional[List[int]] = None
    removed_roles: Optional[List[int]] = None

    model_config = ConfigDict(from_attributes=True)


class AuditRecordRequest(BaseModel):
    id: Optional[int]
    code: Optional[int]
    employee_name: Optional[str]
    title: Optional[str]
    department: Optional[str]
    requester: Optional[str]
    requester_title: Optional[str]
    meal_type: Optional[str]
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
    fullName: Optional[str] = None
    title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str | None
    token_type: str | None
