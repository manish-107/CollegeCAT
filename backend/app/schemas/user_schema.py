import enum
from typing import Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


def uname_field_doc(default: Any = ...) -> Any:
    """Create a Field for 'name' with consistent metadata."""
    return Field(
        default=default,
        min_length=1,
        max_length=100,
        description="Full name of the user",
        examples=["John doe"],
    )


def role_field_doc(default: Any = ...) -> Any:
    """Create a Field for 'role' with consistent metadata."""
    return Field(
        default=default,
        description="Role of the user in the system",
        examples=["HOD", "TIMETABLE_COORDINATOR", "LECTURER"],
    )


def joining_year_field_doc(default: Any = ...) -> Any:
    """Create a Field for 'joining_year' with consistent metadata."""
    current_year = datetime.now().year
    return Field(
        default=default,
        description="The academic year in which the user joined (e.g., 2023).",
        ge=1900,
        le=current_year,
        examples=[2023],
    )


def is_active_field_doc(default: Any = ...) -> Any:
    """Create a Field for 'is_active' with consistent metadata."""
    return Field(
        default=default,
        description="Indicates whether the user is active.",
        examples=[True],
    )


# Define Enum
class RoleEnum(str, enum.Enum):
    HOD = "HOD"
    TIMETABLE_COORDINATOR = "TIMETABLE_COORDINATOR"
    LECTURER = "LECTURER"


class UserBase(BaseModel):
    uname: Optional[str] = uname_field_doc(default=None)
    role: Optional[RoleEnum] = role_field_doc(default=None)
    joining_year: Optional[int] = joining_year_field_doc(default=None)
    is_active: Optional[bool] = is_active_field_doc(default=None)


class signupData(BaseModel):
    uname: str = uname_field_doc(default=None)
    role: RoleEnum = role_field_doc(default=None)
    joining_year: int = joining_year_field_doc(default=None)
    
class UpdateUserData(UserBase):
    
    class Config:
        orm_mode = True


class UserResponse(BaseModel):
    user_id: int
    uname: str = uname_field_doc(default=None)
    email: str 
    role: RoleEnum = role_field_doc(default=None)
    oauth_provider: str
    joining_year: int = joining_year_field_doc(default=None)
    is_active: bool = is_active_field_doc(default=None)
    created_at: datetime

    model_config = {"from_attributes": True}
