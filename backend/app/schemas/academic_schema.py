from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.model import SubjectTypeEnum

class BatchBase(BaseModel):
    section: Optional[str] = Field(None, description="Name of the batch (e.g., 'A', 'B', 'C')",examples=["A"])
    noOfStudent: Optional[int] = Field(None, description="Number of students in the batch", gt=0,examples=[40])

class BatchCreate(BatchBase):
    section: str = Field(..., description="Name of the batch (e.g., 'A', 'B', 'C')",examples=["A"])
    noOfStudent: int = Field(..., description="Number of students in the batch", gt=0,examples=[40])

class BatchUpdate(BatchBase):
    id: Optional[int] = Field(None, description="Batch ID to update",examples=[1])

class BatchResponse(BatchBase):
    batch_id: int = Field(..., description="Unique identifier for the batch",examples=[1])
    created_at: datetime = Field(..., description="Timestamp when the batch was created",examples=[datetime.now()])

    class Config:
        from_attributes = True

class AcademicYearBase(BaseModel):
    academic_year: str = Field(..., description="Academic year in format YYYY-YYYY (e.g., '2023-2024')",examples=["2023-2024"])

class AcademicYearCreate(AcademicYearBase):
    pass

class AcademicYearResponse(AcademicYearBase):
    year_id: int = Field(..., description="Unique identifier for the academic year",examples=[2023])
    class Config:
        from_attributes = True

class AcademicYearWithBatchesResponse(BaseModel):
    year_id: int = Field(..., description="Unique identifier for the academic year",examples=[2023])
    academic_year: str = Field(..., description="Academic year in format YYYY-YYYY",examples=["2023-2024"])
    batches: List[BatchResponse] = Field(..., description="List of batches associated with this academic year",examples=[BatchResponse(batch_id=1, section="A", noOfStudent=40, created_at=datetime.now())])

class AcademicYearBatchCreate(BaseModel):
    year: str = Field(..., description="Academic year")
    batch: BatchBase = Field(..., description="Batch information to create")

class AcademicYearBatchUpdate(BaseModel):
    academic_year: Optional[str] = Field(None, description="Updated academic year in format YYYY-YYYY",examples=["2023-2024"])
    batch: Optional[List[BatchUpdate]] = Field(None, description="List of batch updates",examples=[BatchUpdate(id=1, section="A", noOfStudent=40)])

class CreatedResponse(BaseModel):
    created_id: int = Field(..., description="ID of the newly created resource")
    message: str = Field(..., description="Success message describing the creation")
    success: bool = Field(True, description="Indicates if the operation was successful")

class MessageResponse(BaseModel):
    message: str = Field(default="Success", description="Response message")
    success: bool = Field(True, description="Indicates if the operation was successful")

class SuccessResponse(BaseModel):
    message: str = Field(..., description="Success message describing the operation")
    pass 

class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Error message describing what went wrong")
    message: str = Field(default="Something went wrong", description="User-friendly error message",examples=["Something went wrong"])
    success: bool = Field(False, description="Indicates that the operation failed")

class SubjectBase(BaseModel):
    subject_name: str = Field(..., description="Name of the subject (e.g., 'Data Structures', 'Machine Learning')")
    subject_code: str = Field(..., description="Unique code for the subject (e.g., 'CS101', 'ML2023')")
    abbreviation: str = Field(..., description="Short abbreviation for the subject (e.g., 'DSA', 'CN', 'CA')")
    subject_type: SubjectTypeEnum = Field(..., description="Type of subject: CORE, ELECTIVE, or LAB")
    no_of_hours_required: int = Field(..., gt=0, description="Number of hours required for the subject")
    year_id: int = Field(..., description="Associated academic year ID")

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    subject_name: Optional[str] = Field(None, description="Updated name of the subject")
    subject_code: Optional[str] = Field(None, description="Updated unique code for the subject")
    abbreviation: Optional[str] = Field(None, description="Updated abbreviation for the subject")
    subject_type: Optional[SubjectTypeEnum] = Field(None, description="Updated type of subject")
    no_of_hours_required: Optional[int] = Field(None, gt=0, description="Updated number of hours required")

class SubjectResponse(SubjectBase):
    subject_id: int = Field(..., description="Unique identifier for the subject",examples=[1])
    created_at: datetime = Field(..., description="Timestamp when the subject was created",examples=[datetime.now()])

class FacultyPreferenceBase(BaseModel):
    subject_id: int = Field(..., description="ID of the subject",examples=[1])
    year_id: int = Field(..., description="ID of the academic year",examples=[2023])
    preference_type: str = Field(..., description="Type of preference (LIKED, DISLIKED, NEUTRAL)",examples=["LIKED"])

class FacultyPreferenceCreate(FacultyPreferenceBase):
    faculty_id: int = Field(..., description="ID of the faculty who set this preference")

class FacultyPreferenceResponse(FacultyPreferenceBase):
    id: int = Field(..., description="ID of the preference entry",examples=[1])
    faculty_id: int = Field(..., description="ID of the faculty who set this preference",examples=[1])

class TimetableFormatBase(BaseModel):
    format_name: str = Field(..., description="Name of the timetable format (e.g., 'Standard', 'Compact')",examples=["Standard"])
    format_data: dict = Field(..., description="JSON object containing the format configuration")

class TimetableFormatCreate(TimetableFormatBase):
    pass

class TimetableFormatResponse(TimetableFormatBase):
    format_id: int = Field(..., description="Unique identifier for the timetable format",examples=[1])
    created_by: int = Field(..., description="ID of the user who created this format",examples=[1])
    created_at: datetime = Field(..., description="Timestamp when the format was created",examples=[datetime.now()])

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
    approval_id: int = Field(..., description="Unique identifier for the approval",examples=[1])
    approved_by: int = Field(..., description="ID of the user who approved/rejected the timetable",examples=[1])
    created_at: datetime = Field(..., description="Timestamp when the approval was created",examples=[datetime.now()])

    class Config:
        from_attributes = True

# For GET /academic-years-with-batchs
class AcademicYearWithBatchesListResponse(BaseModel):
    items: List[AcademicYearWithBatchesResponse] = Field(..., description="List of academic years with their associated batches",examples=[AcademicYearWithBatchesResponse(year_id=2023, academic_year="2023-2024", batches=[BatchResponse(batch_id=1, section="A", noOfStudent=40, created_at=datetime.now())])])

# For GET /batches/{year_id}
class BatchesListResponse(BaseModel):
    batches: List[BatchResponse] = Field(..., description="List of batches for the specified academic year",examples=[BatchResponse(batch_id=1, section="A", noOfStudent=40, created_at=datetime.now())])

# For GET /subjects/{year_id}
class SubjectsListResponse(BaseModel):
    subjects: List[SubjectResponse] = Field(..., description="List of subjects for the specified academic year",examples=[SubjectResponse(subject_id=1, subject_name="Data Structures", subject_code="CS101", abbreviation="DSA", subject_type=SubjectTypeEnum.CORE, no_of_hours_required=4, year_id=2023,created_at=datetime.now())])

# For GET /subject/{subject_id}
class SubjectDetailResponse(SubjectResponse):
    pass 