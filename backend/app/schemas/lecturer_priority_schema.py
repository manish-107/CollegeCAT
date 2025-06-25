from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class SubjectPriorityEntry(BaseModel):
    subject_id: int = Field(..., description="ID of the subject for which priority is set")
    batch_id: int = Field(..., description="ID of the batch for which priority is set")
    priority: int = Field(..., ge=1, le=5, description="Priority level from 1 (highest) to 5 (lowest)")

class LecturerPrioritySubmitRequest(BaseModel):
    lecturer_id: int = Field(..., description="ID of the lecturer submitting priorities")
    year_id: int = Field(..., description="Academic year ID for the priorities")
    priorities: List[SubjectPriorityEntry] = Field(..., description="List of subject-batch priorities")

class LecturerPriorityUpdateRequest(BaseModel):
    subject1_id: int = Field(..., description="ID of the first subject to update")
    batch1_id: int = Field(..., description="ID of the first batch to update")
    priority1: int = Field(..., ge=1, le=5, description="New priority level for first subject-batch (1-5)")
    subject2_id: int = Field(..., description="ID of the second subject to update")
    batch2_id: int = Field(..., description="ID of the second batch to update")
    priority2: int = Field(..., ge=1, le=5, description="New priority level for second subject-batch (1-5)")

class LecturerPriorityResponse(BaseModel):
    id: int = Field(..., description="Unique identifier for the priority entry")
    lecturer_id: int = Field(..., description="ID of the lecturer")
    subject_id: int = Field(..., description="ID of the subject")
    batch_id: int = Field(..., description="ID of the batch")
    year_id: int = Field(..., description="Academic year ID")
    priority: int = Field(..., description="Priority level (1-5)")
    created_at: datetime = Field(..., description="Timestamp when the priority was created")

    class Config:
        from_attributes = True

class PrioritySubjectResponse(BaseModel):
    id: int = Field(..., description="Unique identifier for the priority entry")
    subject_id: int = Field(..., description="ID of the subject")
    subject_name: str = Field(..., description="Name of the subject")
    subject_code: str = Field(..., description="Code of the subject")
    subject_type: str = Field(..., description="Type of subject (CORE, ELECTIVE, LAB)")
    abbreviation: str = Field(..., description="Short abbreviation for the subject (e.g., 'DSA', 'CN', 'CA')")
    batch_id: int = Field(..., description="ID of the batch")
    batch_section: str = Field(..., description="Section name of the batch")
    batch_noOfStudent: int = Field(..., description="Number of students in the batch")
    priority: int = Field(..., description="Priority level (1-5)")
    created_at: datetime = Field(..., description="Timestamp when the priority was created")

class LecturerPriorityWithDetailsResponse(BaseModel):
    lecturer_id: int = Field(..., description="ID of the lecturer")
    lecturer_name: str = Field(..., description="Name of the lecturer")
    lecturer_email: str = Field(..., description="Email address of the lecturer")
    year_id: int = Field(..., description="Academic year ID")
    academic_year: str = Field(..., description="Academic year in format YYYY-YYYY")
    priority_subjects: List[PrioritySubjectResponse] = Field(..., description="List of subjects with priorities")

class LecturerPriorityListResponse(BaseModel):
    priorities: List[LecturerPriorityResponse] = Field(..., description="List of priority entries")

class LecturerPriorityWithDetailsListResponse(BaseModel):
    priorities: List[LecturerPriorityWithDetailsResponse] = Field(..., description="List of lecturers with their priority details")

class MessageResponse(BaseModel):
    message: str = Field(..., description="Response message")
    success: bool = Field(True, description="Indicates if the operation was successful")

class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Error message describing what went wrong")
    success: bool = Field(False, description="Indicates that the operation failed")

class LecturerPriorityDetailedResponse(BaseModel):
    id: int = Field(..., description="Unique identifier for the priority entry")
    lecturer_id: int = Field(..., description="ID of the lecturer")
    lecturer_name: str = Field(..., description="Name of the lecturer")
    lecturer_email: str = Field(..., description="Email address of the lecturer")
    subject_id: int = Field(..., description="ID of the subject")
    subject_name: str = Field(..., description="Name of the subject")
    subject_code: str = Field(..., description="Code of the subject")
    subject_type: str = Field(..., description="Type of subject (CORE, ELECTIVE, LAB)")
    abbreviation: str = Field(..., description="Short abbreviation for the subject (e.g., 'DSA', 'CN', 'CA')")
    batch_id: int = Field(..., description="ID of the batch")
    batch_section: str = Field(..., description="Section name of the batch")
    batch_noOfStudent: int = Field(..., description="Number of students in the batch")
    year_id: int = Field(..., description="Academic year ID")
    academic_year: str = Field(..., description="Academic year in format YYYY-YYYY")
    priority: int = Field(..., description="Priority level (1-5)")
    created_at: datetime = Field(..., description="Timestamp when the priority was created")

class LecturerPriorityDetailedListResponse(BaseModel):
    priorities: List[LecturerPriorityDetailedResponse] = Field(..., description="List of detailed priority entries")

class LecturerSubjectAllocationResponse(BaseModel):
    allocation_id: int = Field(..., description="Unique identifier for the allocation")
    lecturer_id: int = Field(..., description="ID of the allocated lecturer")
    lecturer_name: str = Field(..., description="Name of the allocated lecturer")
    lecturer_email: str = Field(..., description="Email address of the allocated lecturer")
    subject_id: int = Field(..., description="ID of the allocated subject")
    subject_name: str = Field(..., description="Name of the allocated subject")
    subject_code: str = Field(..., description="Code of the allocated subject")
    subject_type: str = Field(..., description="Type of allocated subject (CORE, ELECTIVE, LAB)")
    abbreviation: str = Field(..., description="Short abbreviation for the subject (e.g., 'DSA', 'CN', 'CA')")
    batch_id: int = Field(..., description="ID of the allocated batch")
    batch_section: str = Field(..., description="Section name of the allocated batch")
    batch_noOfStudent: int = Field(..., description="Number of students in the allocated batch")
    year_id: int = Field(..., description="Academic year ID")
    academic_year: str = Field(..., description="Academic year in format YYYY-YYYY")
    allocated_priority: int = Field(..., description="Priority level that was allocated (1-5)")
    created_at: datetime = Field(..., description="Timestamp when the allocation was created")

class LecturerSubjectAllocationListResponse(BaseModel):
    allocations: List[LecturerSubjectAllocationResponse] = Field(..., description="List of subject allocations")

class AllocationResultResponse(BaseModel):
    message: str = Field(..., description="Result message describing the allocation process")
    success: bool = Field(True, description="Indicates if the allocation was successful")
    total_allocations: int = Field(..., description="Total number of allocations made")
    allocations: List[LecturerSubjectAllocationResponse] = Field(..., description="List of all allocations made")

# New schemas for the allocation response format
class AllocatedLecturerResponse(BaseModel):
    lecturer_id: int = Field(..., description="ID of the allocated lecturer")
    uname: str = Field(..., description="Username/name of the allocated lecturer")
    role: str = Field(..., description="Role of the allocated lecturer")
    email: str = Field(..., description="Email address of the allocated lecturer")
    joining_year: int = Field(..., description="Year when the lecturer joined")

class AllocatedSubjectResponse(BaseModel):
    subject_id: int = Field(..., description="ID of the allocated subject")
    subject_name: str = Field(..., description="Name of the allocated subject")
    subject_code: str = Field(..., description="Code of the allocated subject")
    subject_type: str = Field(..., description="Type of allocated subject (CORE, ELECTIVE, LAB)")
    abbreviation: str = Field(..., description="Short abbreviation for the subject (e.g., 'DSA', 'CN', 'CA')")
    allocated_lecturer: AllocatedLecturerResponse = Field(..., description="Details of the lecturer allocated to this subject")

class AllocatedBatchResponse(BaseModel):
    batch_id: int = Field(..., description="ID of the batch")
    section: str = Field(..., description="Section name of the batch")
    noOfStudent: int = Field(..., description="Number of students in the batch")
    subjects: dict[str, AllocatedSubjectResponse] = Field(..., description="Dictionary of subjects allocated to this batch, keyed by subject ID")

class AllocationYearResponse(BaseModel):
    year_id: int = Field(..., description="Academic year ID")
    year: str = Field(..., description="Academic year in format YYYY-YYYY")
    batchs: dict[str, AllocatedBatchResponse] = Field(..., description="Dictionary of batches for this year, keyed by batch ID")

class AllocationResponse(BaseModel):
    allocations: List[AllocationYearResponse] = Field(..., description="List of academic years with their allocations")

# New schemas for lecturer priorities with nested structure
class LecturerPrioritySubjectResponse(BaseModel):
    subject_id: int = Field(..., description="ID of the subject")
    subject_name: str = Field(..., description="Name of the subject")
    subject_code: str = Field(..., description="Code of the subject")
    subject_type: str = Field(..., description="Type of subject (CORE, ELECTIVE, LAB)")
    abbreviation: str = Field(..., description="Short abbreviation for the subject (e.g., 'DSA', 'CN', 'CA')")
    priority: int = Field(..., description="Priority level (1-5)")

class LecturerPriorityBatchResponse(BaseModel):
    batch_id: int = Field(..., description="ID of the batch")
    section: str = Field(..., description="Section name of the batch")
    noOfStudent: int = Field(..., description="Number of students in the batch")
    subjects: List[LecturerPrioritySubjectResponse] = Field(..., description="List of subjects with priorities for this batch")

class LecturerPriorityDetailResponse(BaseModel):
    year_id: int = Field(..., description="Academic year ID")
    year: str = Field(..., description="Academic year in format YYYY-YYYY")
    lecturer_id: int = Field(..., description="ID of the lecturer")
    uname: str = Field(..., description="Username/name of the lecturer")
    role: str = Field(..., description="Role of the lecturer")
    email: str = Field(..., description="Email address of the lecturer")
    joining_year: int = Field(..., description="Year when the lecturer joined")
    batches: List[LecturerPriorityBatchResponse] = Field(..., description="List of batches with priorities for this lecturer")

class LecturerPriorityDetailListResponse(BaseModel):
    priorities: List[LecturerPriorityDetailResponse] = Field(..., description="List of lecturers with their detailed priority information")

class AllocationUpdateRequest(BaseModel):
    allocation_id: int = Field(..., description="ID of the allocation to update")
    lecturer_id: int = Field(..., description="ID of the new lecturer to assign to this allocation") 