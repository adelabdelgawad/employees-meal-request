from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional


# ✅ DepartmentResponse Model
class DepartmentResponse(BaseModel):
    id: int
    name: str

    # Enabling model instantiation from ORM objects
    model_config = ConfigDict(from_attributes=True)


# ✅ RequestBody Model
class RequestBody(BaseModel):
    id: int
    name: str
    department_id: int
    meal_id: int
    meal_name: str
    notes: Optional[str] = Field(default="")

    model_config = ConfigDict(from_attributes=True)


# ✅ RequestResponse Model
class RequestResponse(BaseModel):
    id: int
    status_name: str
    status_id: int
    requester: Optional[str] = None
    requester_title: Optional[str] = None
    meal_type: str
    request_time: datetime
    closed_time: Optional[datetime] = None
    notes: str

    model_config = ConfigDict(from_attributes=True)


class RequestLineRespose(BaseModel):
    id: int
    name: str
    title: str
    code: int
    attendance: datetime | None = None
    shift: int | None = None
    is_accepted: bool

    model_config = ConfigDict(from_attributes=True)


class ChangedStatusRequest(BaseModel):
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
