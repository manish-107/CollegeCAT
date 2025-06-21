from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.model import SubjectTypeEnum

class BatchBase(BaseModel):
    section: str = Field(..., description="Name of the batch (e.g., 'A', 'B', 'C')")
    noOfStudent: int = Field(..., description="Number of students in the batch", gt=0)

class BatchCreate(BatchBase):
    pass

class BatchUpdate(BatchBase):
    id: Optional[int] = Field(None, description="Batch ID to update")

class BatchResponse(BatchBase):
    batch_id: int = Field(..., description="Unique identifier for the batch")
    created_at: datetime = Field(..., description="Timestamp when the batch was created")

    class Config:
        from_attributes = True

class AcademicYearBase(BaseModel):
    academic_year: str = Field(..., description="Academic year in format YYYY-YYYY (e.g., '2023-2024')")

class AcademicYearCreate(AcademicYearBase):
    pass

class AcademicYearResponse(AcademicYearBase):
    year_id: int = Field(..., description="Unique identifier for the academic year")
    class Config:
        from_attributes = True

class AcademicYearWithBatchesResponse(BaseModel):
    year_id: int = Field(..., description="Unique identifier for the academic year")
    academic_year: str = Field(..., description="Academic year in format YYYY-YYYY")
    batches: List[BatchResponse] = Field(..., description="List of batches associated with this academic year")

class AcademicYearBatchCreate(BaseModel):
    year: int = Field(..., description="Academic year ID")
    batch: BatchBase = Field(..., description="Batch information to create")

class AcademicYearBatchUpdate(BaseModel):
    academic_year: Optional[str] = Field(None, description="Updated academic year in format YYYY-YYYY")
    batch: Optional[List[BatchUpdate]] = Field(None, description="List of batch updates")

class CreatedResponse(BaseModel):
    created_id: int = Field(..., description="ID of the newly created resource")
    message: str = Field(..., description="Success message describing the creation")
    success: bool = Field(True, description="Indicates if the operation was successful")

class MessageResponse(BaseModel):
    message: str = Field(..., description="Response message")
    success: bool = Field(True, description="Indicates if the operation was successful")

class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Error message describing what went wrong")
    success: bool = Field(False, description="Indicates that the operation failed")

class SubjectBase(BaseModel):
    subject_name: str = Field(..., description="Name of the subject (e.g., 'Data Structures', 'Machine Learning')")
    subject_code: str = Field(..., description="Unique code for the subject (e.g., 'CS101', 'ML2023')")
    subject_type: SubjectTypeEnum = Field(..., description="Type of subject: CORE, ELECTIVE, or LAB")
    no_of_hours_required: int = Field(..., gt=0, description="Number of hours required for the subject")
    year_id: int = Field(..., description="Associated academic year ID")

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    subject_name: Optional[str] = Field(None, description="Updated name of the subject")
    subject_code: Optional[str] = Field(None, description="Updated unique code for the subject")
    subject_type: Optional[SubjectTypeEnum] = Field(None, description="Updated type of subject")
    no_of_hours_required: Optional[int] = Field(None, gt=0, description="Updated number of hours required")

class SubjectResponse(SubjectBase):
    subject_id: int = Field(..., description="Unique identifier for the subject")
    created_at: datetime = Field(..., description="Timestamp when the subject was created")

    class Config:
        from_attributes = True

class LecturerPreferenceBase(BaseModel):
    subject_id: int = Field(..., description="ID of the subject for which preference is set")
    year_id: int = Field(..., description="Academic year ID for the preference")
    preferred_time: Optional[dict] = Field(None, description="Preferred time slots for teaching this subject")

class LecturerPreferenceCreate(LecturerPreferenceBase):
    pass

class LecturerPreferenceResponse(LecturerPreferenceBase):
    preference_id: int = Field(..., description="Unique identifier for the preference")
    lecturer_id: int = Field(..., description="ID of the lecturer who set this preference")
    created_at: datetime = Field(..., description="Timestamp when the preference was created")

    class Config:
        from_attributes = True

class TimetableFormatBase(BaseModel):
    format_name: str = Field(..., description="Name of the timetable format (e.g., 'Standard', 'Compact')")
    format_data: dict = Field(..., description="JSON object containing the format configuration")

class TimetableFormatCreate(TimetableFormatBase):
    pass

class TimetableFormatResponse(TimetableFormatBase):
    format_id: int = Field(..., description="Unique identifier for the timetable format")
    created_by: int = Field(..., description="ID of the user who created this format")
    created_at: datetime = Field(..., description="Timestamp when the format was created")

    class Config:
        from_attributes = True

class TimetableBase(BaseModel):
    batch_id: int = Field(..., description="ID of the batch for which timetable is created")
    subject_id: int = Field(..., description="ID of the subject in the timetable")
    format_id: int = Field(..., description="ID of the timetable format used")
    timetable_data: dict = Field(..., description="JSON object containing the timetable schedule")

class TimetableCreate(TimetableBase):
    pass

class TimetableResponse(TimetableBase):
    timetable_id: int = Field(..., description="Unique identifier for the timetable")
    created_by: int = Field(..., description="ID of the user who created this timetable")
    created_at: datetime = Field(..., description="Timestamp when the timetable was created")

    class Config:
        from_attributes = True

class ApprovalBase(BaseModel):
    timetable_id: int = Field(..., description="ID of the timetable being approved")
    approval_status: str = Field(..., description="Status of approval: 'pending', 'approved', 'rejected'")
    approval_stage: int = Field(..., description="Current stage of the approval process (1, 2, 3, etc.)")

class ApprovalCreate(ApprovalBase):
    pass

class ApprovalResponse(ApprovalBase):
    approval_id: int = Field(..., description="Unique identifier for the approval")
    approved_by: int = Field(..., description="ID of the user who approved/rejected the timetable")
    created_at: datetime = Field(..., description="Timestamp when the approval was created")

    class Config:
        from_attributes = True

# For GET /academic-years-with-batchs
class AcademicYearWithBatchesListResponse(BaseModel):
    items: List[AcademicYearWithBatchesResponse] = Field(..., description="List of academic years with their associated batches")

# For GET /batches/{year_id}
class BatchesListResponse(BaseModel):
    batches: List[BatchResponse] = Field(..., description="List of batches for the specified academic year")

# For GET /subjects/{year_id}
class SubjectsListResponse(BaseModel):
    subjects: List[SubjectResponse] = Field(..., description="List of subjects for the specified academic year")

# For GET /subject/{subject_id}
class SubjectDetailResponse(SubjectResponse):
    pass 