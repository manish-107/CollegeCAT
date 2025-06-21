from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.model import SubjectTypeEnum

class BatchBase(BaseModel):
    section: str = Field(..., description="Name of the batch")
    noOfStudent: int = Field(..., description="Number of students in batch")

class BatchCreate(BatchBase):
    pass

class BatchUpdate(BatchBase):
    id: Optional[int] = None

class BatchResponse(BatchBase):
    batch_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AcademicYearBase(BaseModel):
    academic_year: str = Field(..., description="Academic year (e.g., 2023-2024)")

class AcademicYearCreate(AcademicYearBase):
    pass

class AcademicYearResponse(AcademicYearBase):
    year_id: int
    class Config:
        from_attributes = True

class AcademicYearWithBatchesResponse(BaseModel):
    year_id: int
    academic_year: str
    batches: List[BatchResponse]

class AcademicYearBatchCreate(BaseModel):
    year: int
    batch: BatchBase

class AcademicYearBatchUpdate(BaseModel):
    academic_year: Optional[str] = None
    batch: Optional[List[BatchUpdate]] = None

class CreatedResponse(BaseModel):
    created_id: int
    message: str
    success: bool = True

class MessageResponse(BaseModel):
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    detail: str
    success: bool = False

class SubjectBase(BaseModel):
    subject_name: str = Field(..., description="Name of the subject")
    subject_code: str = Field(..., description="Unique code for the subject")
    subject_type: SubjectTypeEnum
    no_of_hours_required: int = Field(..., gt=0, description="Number of hours required for the subject")
    year_id: int = Field(..., description="Associated academic year ID")

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None
    subject_type: Optional[SubjectTypeEnum] = None
    no_of_hours_required: Optional[int] = Field(None, gt=0)

class SubjectResponse(SubjectBase):
    subject_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class LecturerPreferenceBase(BaseModel):
    subject_id: int
    year_id: int
    preferred_time: Optional[dict] = None

class LecturerPreferenceCreate(LecturerPreferenceBase):
    pass

class LecturerPreferenceResponse(LecturerPreferenceBase):
    preference_id: int
    lecturer_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TimetableFormatBase(BaseModel):
    format_name: str
    format_data: dict

class TimetableFormatCreate(TimetableFormatBase):
    pass

class TimetableFormatResponse(TimetableFormatBase):
    format_id: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True

class TimetableBase(BaseModel):
    batch_id: int
    subject_id: int
    format_id: int
    timetable_data: dict

class TimetableCreate(TimetableBase):
    pass

class TimetableResponse(TimetableBase):
    timetable_id: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True

class ApprovalBase(BaseModel):
    timetable_id: int
    approval_status: str
    approval_stage: int

class ApprovalCreate(ApprovalBase):
    pass

class ApprovalResponse(ApprovalBase):
    approval_id: int
    approved_by: int
    created_at: datetime

    class Config:
        from_attributes = True

# For GET /academic-years-with-batchs
class AcademicYearWithBatchesListResponse(BaseModel):
    items: List[AcademicYearWithBatchesResponse]

# For GET /batches/{year_id}
class BatchesListResponse(BaseModel):
    batches: List[BatchResponse]

# For GET /subjects/{year_id}
class SubjectsListResponse(BaseModel):
    subjects: List[SubjectResponse]

# For GET /subject/{subject_id}
class SubjectDetailResponse(SubjectResponse):
    pass 