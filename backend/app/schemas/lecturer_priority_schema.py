from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class SubjectPriorityEntry(BaseModel):
    subject_id: int
    batch_id: int
    priority: int = Field(..., ge=1, le=5)

class LecturerPrioritySubmitRequest(BaseModel):
    lecturer_id: int
    year_id: int
    priorities: List[SubjectPriorityEntry]

class LecturerPriorityUpdateRequest(BaseModel):
    subject1_id: int
    batch1_id: int
    priority1: int = Field(..., ge=1, le=5)
    subject2_id: int
    batch2_id: int
    priority2: int = Field(..., ge=1, le=5)

class LecturerPriorityResponse(BaseModel):
    id: int
    lecturer_id: int
    subject_id: int
    batch_id: int
    year_id: int
    priority: int
    created_at: datetime

    class Config:
        from_attributes = True

class PrioritySubjectResponse(BaseModel):
    id: int
    subject_id: int
    subject_name: str
    subject_code: str
    subject_type: str
    batch_id: int
    batch_section: str
    batch_noOfStudent: int
    priority: int
    created_at: datetime

class LecturerPriorityWithDetailsResponse(BaseModel):
    lecturer_id: int
    lecturer_name: str
    lecturer_email: str
    year_id: int
    academic_year: str
    priority_subjects: List[PrioritySubjectResponse]

class LecturerPriorityListResponse(BaseModel):
    priorities: List[LecturerPriorityResponse]

class LecturerPriorityWithDetailsListResponse(BaseModel):
    priorities: List[LecturerPriorityWithDetailsResponse]

class MessageResponse(BaseModel):
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    detail: str
    success: bool = False

class LecturerPriorityDetailedResponse(BaseModel):
    id: int
    lecturer_id: int
    lecturer_name: str
    lecturer_email: str
    subject_id: int
    subject_name: str
    subject_code: str
    subject_type: str
    batch_id: int
    batch_section: str
    batch_noOfStudent: int
    year_id: int
    academic_year: str
    priority: int
    created_at: datetime

class LecturerPriorityDetailedListResponse(BaseModel):
    priorities: List[LecturerPriorityDetailedResponse]

class LecturerSubjectAllocationResponse(BaseModel):
    allocation_id: int
    lecturer_id: int
    lecturer_name: str
    lecturer_email: str
    subject_id: int
    subject_name: str
    subject_code: str
    subject_type: str
    batch_id: int
    batch_section: str
    batch_noOfStudent: int
    year_id: int
    academic_year: str
    allocated_priority: int
    created_at: datetime

class LecturerSubjectAllocationListResponse(BaseModel):
    allocations: List[LecturerSubjectAllocationResponse]

class AllocationResultResponse(BaseModel):
    message: str
    success: bool = True
    total_allocations: int
    allocations: List[LecturerSubjectAllocationResponse]

# New schemas for the allocation response format
class AllocatedLecturerResponse(BaseModel):
    lecturer_id: int
    uname: str
    role: str
    email: str
    joining_year: int

class AllocatedSubjectResponse(BaseModel):
    subject_id: int
    subject_name: str
    subject_code: str
    subject_type: str
    allocated_lecturer: AllocatedLecturerResponse

class AllocatedBatchResponse(BaseModel):
    batch_id: int
    section: str
    noOfStudent: int
    subjects: dict[str, AllocatedSubjectResponse]

class AllocationYearResponse(BaseModel):
    year_id: int
    year: str
    batchs: dict[str, AllocatedBatchResponse]

class AllocationResponse(BaseModel):
    allocations: List[AllocationYearResponse]

# New schemas for lecturer priorities with nested structure
class LecturerPrioritySubjectResponse(BaseModel):
    subject_id: int
    subject_name: str
    subject_code: str
    subject_type: str
    priority: int

class LecturerPriorityBatchResponse(BaseModel):
    batch_id: int
    section: str
    noOfStudent: int
    subjects: List[LecturerPrioritySubjectResponse]

class LecturerPriorityDetailResponse(BaseModel):
    year_id: int
    year: str
    lecturer_id: int
    uname: str
    role: str
    email: str
    joining_year: int
    batches: List[LecturerPriorityBatchResponse]

class LecturerPriorityDetailListResponse(BaseModel):
    priorities: List[LecturerPriorityDetailResponse]

class AllocationUpdateRequest(BaseModel):
    allocation_id: int
    lecturer_id: int 