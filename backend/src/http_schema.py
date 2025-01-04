from pydantic import BaseModel, ConfigDict


class DepartmentResonse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class RequestBody(BaseModel):
    id: int
    name: str
    department_id: int
    meal_id: int
    meal_name: str
    notes: str | None = ""

    model_config = ConfigDict(from_attributes=True)
