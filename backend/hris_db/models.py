from typing import List, Optional
from datetime import datetime, date
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import (
    MetaData,
    Column,
    Integer,
    String,
    DateTime,
    Date,
    Boolean,
    Float,
    ForeignKey,
)

# Separate MetaData instance for the 'live' database models
live_metadata = MetaData()


class LiveBase(SQLModel):
    """
    Base class for live database models, assigning a custom metadata.
    """

    __abstract__ = True
    metadata = live_metadata

    class Config:
        arbitrary_types_allowed = True


class HRISEmployeeAttendanceWithDetails(LiveBase, table=True):
    __tablename__ = "TmsEmployeeAttendenceWithDetails"

    id: Optional[int] = Field(
        default=None,
        sa_column=Column("Id", Integer, primary_key=True, autoincrement=True),
    )
    employee_code: str = Field(sa_column=Column("EmployeeCode", String, nullable=False))
    date: Optional[datetime] = Field(default=None, sa_column=Column("Date", DateTime))
    date_in: Optional[datetime] = Field(
        default=None, sa_column=Column("DateIn", DateTime)
    )
    date_out: Optional[datetime] = Field(
        default=None, sa_column=Column("DateOut", DateTime)
    )


class HRISEmployee(LiveBase, table=True):
    """
    Maps to 'HR_Employee' table.

    Attributes:
        id (int): Maps to 'Id'.
        code (str): Maps to 'Code'.
        ar_f_name, ar_s_name, ar_th_name, ar_l_name: Arabic names.
        en_f_name, en_s_name, en_th_name, en_l_name: English names.
        birthdate (date): Maps to 'Birthdate'.
    """

    __tablename__ = "HR_Employee"

    id: Optional[int] = Field(
        default=None,
        sa_column=Column("Id", Integer, primary_key=True, autoincrement=True),
    )
    code: Optional[str] = Field(default=None, sa_column=Column("Code", String))
    ar_f_name: Optional[str] = Field(default=None, sa_column=Column("ArFName", String))
    ar_s_name: Optional[str] = Field(default=None, sa_column=Column("ArSName", String))
    ar_th_name: Optional[str] = Field(
        default=None, sa_column=Column("ArThName", String)
    )
    ar_l_name: Optional[str] = Field(default=None, sa_column=Column("ArLName", String))
    en_f_name: Optional[str] = Field(default=None, sa_column=Column("EnFName", String))
    en_s_name: Optional[str] = Field(default=None, sa_column=Column("EnSName", String))
    en_th_name: Optional[str] = Field(
        default=None, sa_column=Column("EnThName", String)
    )
    en_l_name: Optional[str] = Field(default=None, sa_column=Column("EnLName", String))
    birthdate: Optional[date] = Field(default=None, sa_column=Column("Birthdate", Date))
    is_active: Optional[Boolean] = Field(
        default=None, sa_column=Column("IsActive", Boolean)
    )

    positions: List["HRISEmployeePosition"] = Relationship(back_populates="employee")


class HRISEmployeePosition(LiveBase, table=True):
    """
    Maps to 'HR_EmployeePosition' table.

    Attributes:
        id (int): 'Id'
        employee_id (int): 'Employee_Id', FK to HR_Employee(Id)
        position_id (int): 'Position_Id', FK to HR_Position(Id)
        org_unit_id (int): 'Org_Unit_Id', FK to HR_OrganizationUnit(ID)
        is_active (bool): 'Is_Active'
    """

    __tablename__ = "HR_EmployeePosition"

    id: Optional[int] = Field(
        default=None,
        sa_column=Column("Id", Integer, primary_key=True, autoincrement=True),
    )
    employee_id: int = Field(
        sa_column=Column("EmployeeId", Integer, ForeignKey("HR_Employee.Id"))
    )
    position_id: int = Field(
        sa_column=Column("PositionId", Integer, ForeignKey("HR_Position.Id"))
    )
    org_unit_id: int = Field(
        sa_column=Column("OrgUnitId", Integer, ForeignKey("HR_OrganizationUnit.ID"))
    )
    is_active: Optional[bool] = Field(
        default=None, sa_column=Column("IsActive", Boolean)
    )

    employee: Optional[HRISEmployee] = Relationship(back_populates="positions")
    position: Optional["HRISPosition"] = Relationship(
        back_populates="employee_positions"
    )
    org_unit: Optional["HRISOrganizationUnit"] = Relationship(
        back_populates="employee_positions"
    )


class HRISPosition(LiveBase, table=True):
    """
    Maps to 'HR_Position' table.

    Attributes:
        id (int): 'Id'
        en_name (str): 'EnName'
    """

    __tablename__ = "HR_Position"

    id: Optional[int] = Field(
        default=None,
        sa_column=Column("Id", Integer, primary_key=True, autoincrement=True),
    )
    en_name: Optional[str] = Field(default=None, sa_column=Column("EnName", String))

    employee_positions: List[HRISEmployeePosition] = Relationship(
        back_populates="position"
    )


class HRISOrganizationUnit(LiveBase, table=True):
    """
    Maps to 'HR_OrganizationUnit' table.

    Attributes:
        ID (int): 'ID'
        en_name (str): 'EnName'
    """

    __tablename__ = "HR_OrganizationUnit"

    id: Optional[int] = Field(
        default=None,
        sa_column=Column("ID", Integer, primary_key=True, autoincrement=True),
    )
    name: Optional[str] = Field(default=None, sa_column=Column("EnName", String))

    employee_positions: List[HRISEmployeePosition] = Relationship(
        back_populates="org_unit"
    )


class HRISShiftAssignment(LiveBase, table=True):
    """
    Maps to 'TMS_ShiftAssignment'.

    Attributes:
        id (int): 'Id'
        employee_id (int): 'Employee_Id'
        duration_hours (float): 'DurationHours'
        date_from (date): 'Date_From'
        shift_hours (int): 'shift_hours', FK to TMS_Shift(Id)
    """

    __tablename__ = "TMS_ShiftAssignment"

    id: Optional[int] = Field(
        default=None,
        sa_column=Column("Id", Integer, primary_key=True, autoincrement=True),
    )
    employee_id: int = Field(sa_column=Column("EmployeeId", Integer, nullable=False))
    duration_hours: Optional[float] = Field(
        default=None, sa_column=Column("DurationHours", Float)
    )
    date_from: Optional[date] = Field(default=None, sa_column=Column("DateFrom", Date))
    shift_hours: Optional[int] = Field(
        default=None, sa_column=Column("ShiftId", Integer, ForeignKey("TMS_Shift.Id"))
    )

    shift: Optional["TMSShift"] = Relationship(back_populates="shift_assignments")


class TMSShift(LiveBase, table=True):
    """
    Maps to 'TMS_Shift'.

    Attributes:
        id (int): 'Id'
        code (str): 'Code'
    """

    __tablename__ = "TMS_Shift"

    id: Optional[int] = Field(
        default=None,
        sa_column=Column("Id", Integer, primary_key=True, autoincrement=True),
    )
    code: Optional[str] = Field(default=None, sa_column=Column("Code", String))

    shift_assignments: List[HRISShiftAssignment] = Relationship(back_populates="shift")


class HRISAttendanceEngineResult(LiveBase, table=True):
    """
    Maps to 'TMS_AttendanceEngineResult'.

    Attributes:
        id (int): 'Id'
        employee_id (int): 'Employee_Id'
        employee_code (str): 'Employee_Code'
        in_date (datetime): 'In_Date'
        out_date (datetime): 'Out_Date'
    """

    __tablename__ = "TMS_AttendanceEngineResult"

    id: Optional[int] = Field(
        default=None,
        sa_column=Column("Id", Integer, primary_key=True, autoincrement=True),
    )
    employee_id: int = Field(sa_column=Column("Employee_Id", Integer, nullable=False))
    employee_code: Optional[str] = Field(
        default=None, sa_column=Column("Employee_Code", String)
    )
    in_date: Optional[datetime] = Field(
        default=None, sa_column=Column("In_Date", DateTime)
    )
    out_date: Optional[datetime] = Field(
        default=None, sa_column=Column("Out_Date", DateTime)
    )


class HRISHRISSecurityUser(LiveBase, table=True):
    """
    Maps to 'User' table in the Security schema.

    Attributes:
        id (int): 'Id'
        name (str): 'Name'
        is_deleted (bool): 'IsDeleted'
        is_locked (bool): 'IsLocked'
    """

    __tablename__ = "User"
    __table_args__ = {"schema": "Security"}  # Explicitly set the schema

    id: Optional[int] = Field(
        default=None,
        sa_column=Column("ID", Integer, primary_key=True, autoincrement=True),
    )
    name: Optional[str] = Field(default=None, sa_column=Column("Name", String))
    is_locked: Optional[bool] = Field(
        default=None, sa_column=Column("IsLocked", Boolean)
    )
    is_deleted: Optional[bool] = Field(
        default=None, sa_column=Column("IsDeleted", Boolean)
    )

    # Relationships
    roles: List["HRISHRISSecurityUserRole"] = Relationship(back_populates="user")


class HRISHRISSecurityUserRole(LiveBase, table=True):
    """
    Maps to 'UserRole' table in the Security schema.

    Attributes:
        id (int): 'Id'
        user_id (int): FK to Security.User(Id)
        role_id (int): Role ID
    """

    __tablename__ = "UserRole"
    __table_args__ = {"schema": "Security"}

    id: Optional[int] = Field(
        default=None,
        sa_column=Column("ID", Integer, primary_key=True, autoincrement=True),
    )
    user_id: int = Field(
        sa_column=Column("UserId", Integer, ForeignKey("Security.User.ID"))
    )
    role_id: int = Field(default=None, sa_column=Column("RoleId", Integer))

    # Relationship
    user: Optional[HRISHRISSecurityUser] = Relationship(back_populates="roles")
