from pydantic import BaseModel, Field
from typing import Any, List, Optional
from datetime import datetime

class SubjectPriorityEntry(BaseModel):
    subject_id: int = Field(..., description="ID of the subject for which priority is set",examples=[1])
    batch_id: int = Field(..., description="ID of the batch for which priority is set",examples=[1])
    priority: int = Field(..., ge=1, le=5, description="Priority level from 1 (highest) to 5 (lowest)",examples=[1])

class FacultyPrioritySubmitRequest(BaseModel):
    faculty_id: int = Field(..., description="ID of the faculty submitting priorities",examples=[1])
    year_id: int = Field(..., description="Academic year ID for the priorities",examples=[1])
    priorities: List[SubjectPriorityEntry] = Field(..., description="List of subject-batch priorities",examples=[SubjectPriorityEntry(subject_id=1,batch_id=1,priority=1)])

class FacultyPriorityUpdateRequest(BaseModel):
    subject1_id: int = Field(..., description="ID of the first subject to update",examples=[1])
    batch1_id: int = Field(..., description="ID of the first batch to update",examples=[1])
    priority1: int = Field(..., ge=1, le=5, description="New priority level for first subject-batch (1-5)",examples=[1])
    subject2_id: int = Field(..., description="ID of the second subject to update",examples=[2])
    batch2_id: int = Field(..., description="ID of the second batch to update",examples=[2])
    priority2: int = Field(..., ge=1, le=5, description="New priority level for second subject-batch (1-5)",examples=[2])

class FacultyPriorityResponse(BaseModel):
    id: int = Field(..., description="Unique identifier for the priority entry")
    faculty_id: int = Field(..., description="ID of the faculty",examples=[1])
    subject_id: int = Field(..., description="ID of the subject",examples=[1])
    batch_id: int = Field(..., description="ID of the batch",examples=[1])
    year_id: int = Field(..., description="Academic year ID",examples=[1])
    priority: int = Field(..., description="Priority level (1-5)",examples=[1])
    created_at: datetime = Field(..., description="Timestamp when the priority was created",examples=[datetime.now()])

    class Config:
        from_attributes = True

class PrioritySubjectResponse(BaseModel):
    id: int = Field(..., description="Unique identifier for the priority entry",examples=[1])
    subject_id: int = Field(..., description="ID of the subject",examples=[1])
    subject_name: str = Field(..., description="Name of the subject",examples=["Data Structures and Algorithms"])
    subject_code: str = Field(..., description="Code of the subject",examples=["DSA"])
    subject_type: str = Field(..., description="Type of subject (CORE, ELECTIVE, LAB)",examples=["CORE"])
    abbreviation: str = Field(..., description="Short abbreviation for the subject (e.g., 'DSA', 'CN', 'CA')",examples=["DSA"])
    batch_id: int = Field(..., description="ID of the batch",examples=[1])
    batch_section: str = Field(..., description="Section name of the batch",examples=["A"])
    batch_noOfStudent: int = Field(..., description="Number of students in the batch",examples=[60])
    priority: int = Field(..., description="Priority level (1-5)",examples=[1])
    created_at: datetime = Field(..., description="Timestamp when the priority was created",examples=[datetime.now()])

class FacultyPriorityWithDetailsResponse(BaseModel):
    faculty_id: int = Field(..., description="ID of the faculty",examples=[1])
    faculty_name: str = Field(..., description="Name of the faculty",examples=["John Doe"])
    faculty_email: str = Field(..., description="Email address of the faculty",examples=["john.doe@example.com"])
    year_id: int = Field(..., description="Academic year ID",examples=[1])
    academic_year: str = Field(..., description="Academic year in format YYYY-YYYY",examples=["2023-2024"])
    priority_subjects: List[PrioritySubjectResponse] = Field(..., description="List of subjects with priorities",examples=[PrioritySubjectResponse(id=1,subject_id=1,subject_name="Data Structures and Algorithms",subject_code="DSA",subject_type="CORE",abbreviation="DSA",batch_id=1,batch_section="A",batch_noOfStudent=60,priority=1,created_at=datetime.now())])

class FacultyPriorityListResponse(BaseModel):
    priorities: List[FacultyPriorityResponse] = Field(..., description="List of priority entries",examples=[FacultyPriorityResponse(id=1,faculty_id=1,subject_id=1,batch_id=1,year_id=1,priority=1,created_at=datetime.now())])

class FacultyPriorityWithDetailsListResponse(BaseModel):
    priorities: List[FacultyPriorityWithDetailsResponse] = Field(..., description="List of faculty with their priority details",examples=[FacultyPriorityWithDetailsResponse(faculty_id=1,faculty_name="John Doe",faculty_email="john.doe@example.com",year_id=1,academic_year="2023-2024",priority_subjects=[PrioritySubjectResponse(id=1,subject_id=1,subject_name="Data Structures and Algorithms",subject_code="DSA",subject_type="CORE",abbreviation="DSA",batch_id=1,batch_section="A",batch_noOfStudent=60,priority=1,created_at=datetime.now())])])

# Base success response
class SuccessResponse(BaseModel):
    message: str = Field(..., description="Success message describing the operation",examples=["Priorities submitted successfully"])
    success: bool = Field( default=True, description="Indicates if the operation was successful",examples=[True])
    data: Any = Field(default=None, description="Data returned by the operation",examples=[1])



# Error response with both detail and user-friendly message
class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Error message describing what went wrong",examples=["Something went wrong"])
    message: str = Field(default="Something went wrong", description="User-friendly error message",examples=["Something went wrong"])
    success: bool = Field(False, description="Indicates that the operation failed",examples=[False])

class FacultyPriorityDetailedResponse(BaseModel):
    id: int = Field(..., description="Unique identifier for the priority entry",examples=[1])
    faculty_id: int = Field(..., description="ID of the faculty",examples=[1])
    faculty_name: str = Field(..., description="Name of the faculty",examples=["John Doe"])
    faculty_email: str = Field(..., description="Email address of the faculty",examples=["john.doe@example.com"])
    subject_id: int = Field(..., description="ID of the subject",examples=[1])
    subject_name: str = Field(..., description="Name of the subject",examples=["Data Structures and Algorithms"])
    subject_code: str = Field(..., description="Code of the subject",examples=["DSA"])
    subject_type: str = Field(..., description="Type of subject (CORE, ELECTIVE, LAB)",examples=["CORE"])
    abbreviation: str = Field(..., description="Short abbreviation for the subject (e.g., 'DSA', 'CN', 'CA')",examples=["DSA"])
    batch_id: int = Field(..., description="ID of the batch",examples=[1])
    batch_section: str = Field(..., description="Section name of the batch",examples=["A"])
    batch_noOfStudent: int = Field(..., description="Number of students in the batch",examples=[60])
    year_id: int = Field(..., description="Academic year ID",examples=[1])
    academic_year: str = Field(..., description="Academic year in format YYYY-YYYY",examples=["2023-2024"])
    priority: int = Field(..., description="Priority level (1-5)",examples=[1])
    created_at: datetime = Field(..., description="Timestamp when the priority was created",examples=[datetime.now()])

class FacultyPriorityDetailedListResponse(BaseModel):
    priorities: List[FacultyPriorityDetailedResponse] = Field(..., description="List of detailed priority entries")

class FacultySubjectAllocationResponse(BaseModel):
    allocation_id: int = Field(..., description="Unique identifier for the allocation",examples=[1])
    faculty_id: int = Field(..., description="ID of the allocated faculty",examples=[1])
    faculty_name: str = Field(..., description="Name of the allocated faculty",examples=["John Doe"])
    faculty_email: str = Field(..., description="Email address of the allocated faculty",examples=["john.doe@example.com"])
    subject_id: int = Field(..., description="ID of the allocated subject",examples=[1])
    subject_name: str = Field(..., description="Name of the allocated subject",examples=["Data Structures and Algorithms"])
    subject_code: str = Field(..., description="Code of the allocated subject",examples=["DSA"])
    subject_type: str = Field(..., description="Type of allocated subject (CORE, ELECTIVE, LAB)",examples=["CORE"])
    abbreviation: str = Field(..., description="Short abbreviation for the subject (e.g., 'DSA', 'CN', 'CA')",examples=["DSA"])
    batch_id: int = Field(..., description="ID of the allocated batch",examples=[1])
    batch_section: str = Field(..., description="Section name of the allocated batch",examples=["A"])
    batch_noOfStudent: int = Field(..., description="Number of students in the allocated batch",examples=[60])
    year_id: int = Field(..., description="Academic year ID",examples=[1])
    academic_year: str = Field(..., description="Academic year in format YYYY-YYYY",examples=["2023-2024"])
    allocated_priority: int = Field(..., description="Priority level that was allocated (1-5)",examples=[1])
    created_at: datetime = Field(..., description="Timestamp when the allocation was created",examples=[datetime.now()])
    co_faculty_id: Optional[int] = Field(None, description="ID of the co-faculty for this allocation, if any",examples=[1])
    venue: Optional[str] = Field(None, description="Venue for the allocation, if any",examples=["Room 101"])

class FacultySubjectAllocationListResponse(BaseModel):
    allocations: List[FacultySubjectAllocationResponse] = Field(..., description="List of subject allocations")

class AllocationResultResponse(BaseModel):
    total_allocations: int = Field(..., description="Total number of allocations made",examples=[1])
    allocations: List[FacultySubjectAllocationResponse] = Field(..., description="List of all allocations made",examples=[FacultySubjectAllocationResponse(allocation_id=1,faculty_id=1,faculty_name="John Doe",faculty_email="john.doe@example.com",subject_id=1,subject_name="Data Structures and Algorithms",subject_code="DSA",subject_type="CORE",abbreviation="DSA",batch_id=1,batch_section="A",batch_noOfStudent=60,year_id=1,academic_year="2023-2024",allocated_priority=1,created_at=datetime.now(),co_faculty_id=1,venue="Room 101")])

# New schemas for the allocation response format
class AllocatedFacultyResponse(BaseModel):
    faculty_id: int = Field(..., description="ID of the allocated faculty",examples=[1])
    uname: str = Field(..., description="Username/name of the allocated faculty",examples=["John Doe"])
    role: str = Field(..., description="Role of the allocated faculty",examples=["FACULTY"])
    email: str = Field(..., description="Email address of the allocated faculty",examples=["john.doe@example.com"])
    joining_year: int = Field(..., description="Year when the faculty joined",examples=[2023])

class AllocatedSubjectResponse(BaseModel):
    subject_id: int = Field(..., description="ID of the allocated subject",examples=[1])
    subject_name: str = Field(..., description="Name of the allocated subject",examples=["Data Structures and Algorithms"])
    subject_code: str = Field(..., description="Code of the allocated subject",examples=["DSA"])
    subject_type: str = Field(..., description="Type of allocated subject (CORE, ELECTIVE, LAB)",examples=["CORE"])
    abbreviation: str = Field(..., description="Short abbreviation for the subject (e.g., 'DSA', 'CN', 'CA')",examples=["DSA"])
    allocated_faculty: AllocatedFacultyResponse = Field(..., description="Details of the faculty allocated to this subject",examples=[AllocatedFacultyResponse(faculty_id=1,uname="John Doe",role="FACULTY",email="john.doe@example.com",joining_year=2023)])
    co_faculty: Optional[AllocatedFacultyResponse] = Field(None, description="Details of the co-faculty for this allocation, if any",examples=[AllocatedFacultyResponse(faculty_id=2,uname="Jane Smith",role="FACULTY",email="jane.smith@example.com",joining_year=2020)])
    venue: Optional[str] = Field(None, description="Venue for the allocation, if any",examples=["Room 101"])

class AllocatedBatchResponse(BaseModel):
    batch_id: int = Field(..., description="ID of the batch",examples=[1])
    section: str = Field(..., description="Section name of the batch",examples=["A"])
    noOfStudent: int = Field(..., description="Number of students in the batch",examples=[60])
    subjects: dict[str, AllocatedSubjectResponse] = Field(
        ..., 
        description="Dictionary of subjects allocated to this batch, keyed by subject ID",
        examples=[{
            "1": {
                "subject_id": 1,
                "subject_name": "Data Structures and Algorithms",
                "subject_code": "DSA",
                "subject_type": "CORE",
                "abbreviation": "DSA",
                "allocated_faculty": {
                    "faculty_id": 1,
                    "uname": "John Doe",
                    "role": "FACULTY",
                    "email": "john.doe@example.com",
                    "joining_year": 2023
                },
                "co_faculty_id": 1,
                "venue": "Room 101"
            }
        }]
    )

class AllocationYearResponse(BaseModel):
    year_id: int = Field(..., description="Academic year ID",examples=[1])
    year: str = Field(..., description="Academic year in format YYYY-YYYY",examples=["2023-2024"])
    batchs: dict[str, AllocatedBatchResponse] = Field(
        ..., 
        description="Dictionary of batches for this year, keyed by batch ID",
        examples=[{
            "1": {
                "batch_id": 1,
                "section": "A",
                "noOfStudent": 60,
                "subjects": {
                    "1": {
                        "subject_id": 1,
                        "subject_name": "Data Structures and Algorithms",
                        "subject_code": "DSA",
                        "subject_type": "CORE",
                        "abbreviation": "DSA",
                        "allocated_faculty": {
                            "faculty_id": 1,
                            "uname": "John Doe",
                            "role": "FACULTY",
                            "email": "john.doe@example.com",
                            "joining_year": 2023
                        },
                        "co_faculty_id": 1,
                        "venue": "Room 101"
                    }
                }
            }
        }]
    )

class AllocationResponse(BaseModel):
    allocations: List[AllocationYearResponse] = Field(
        ..., 
        description="List of academic years with their allocations",
        examples=[
            {
                "year_id": 1,
                "year": "2023-2024",
                "batchs": {
                    "1": {
                        "batch_id": 1,
                        "section": "A",
                        "noOfStudent": 60,
                        "subjects": {
                            "1": {
                                "subject_id": 1,
                                "subject_name": "Data Structures and Algorithms",
                                "subject_code": "DSA",
                                "subject_type": "CORE",
                                "abbreviation": "DSA",
                                "allocated_faculty": {
                                    "faculty_id": 1,
                                    "uname": "John Doe",
                                    "role": "FACULTY",
                                    "email": "john.doe@example.com",
                                    "joining_year": 2023
                                },
                                "co_faculty_id": 1,
                                "venue": "Room 101"
                            }
                        }
                    }
                }
            }
        ]
    )

# New schemas for faculty priorities with nested structure
class FacultyPrioritySubjectResponse(BaseModel):
    subject_id: int = Field(..., description="ID of the subject",examples=[1])
    subject_name: str = Field(..., description="Name of the subject",examples=["Data Structures and Algorithms"])
    subject_code: str = Field(..., description="Code of the subject",examples=["DSA"])
    subject_type: str = Field(..., description="Type of subject (CORE, ELECTIVE, LAB)",examples=["CORE"])
    abbreviation: str = Field(..., description="Short abbreviation for the subject (e.g., 'DSA', 'CN', 'CA')",examples=["DSA"])
    priority: int = Field(..., description="Priority level (1-5)",examples=[1])

class FacultyPriorityBatchResponse(BaseModel):
    batch_id: int = Field(..., description="ID of the batch")
    section: str = Field(..., description="Section name of the batch",examples=["A"])
    noOfStudent: int = Field(..., description="Number of students in the batch",examples=[60])
    subjects: List[FacultyPrioritySubjectResponse] = Field(..., description="List of subjects with priorities for this batch")

class FacultyPriorityDetailResponse(BaseModel):
    year_id: int = Field(..., description="Academic year ID",examples=[1])
    year: str = Field(..., description="Academic year in format YYYY-YYYY",examples=["2023-2024"])
    faculty_id: int = Field(..., description="ID of the faculty",examples=[1])
    uname: str = Field(..., description="Username/name of the faculty",examples=["John Doe"])
    role: str = Field(..., description="Role of the faculty",examples=["FACULTY","ADMIN","TIMETABLE_COORDINATOR"])
    email: str = Field(..., description="Email address of the faculty",examples=["john.doe@example.com"])
    joining_year: int = Field(..., description="Year when the faculty joined",examples=[2023] )
    batches: List[FacultyPriorityBatchResponse] = Field(..., description="List of batches with priorities for this faculty")

class FacultyPriorityDetailListResponse(BaseModel):
    priorities: List[FacultyPriorityDetailResponse] = Field(..., description="List of faculty with their detailed priority information")

class AllocationUpdateRequest(BaseModel):
    allocation_id: int = Field(..., description="ID of the allocation to update")
    faculty_id: int = Field(..., description="ID of the new faculty to assign to this allocation")
    co_faculty_id: Optional[int] = Field(None, description="ID of the co-faculty to assign to this allocation")
    venue: Optional[str] = Field(None, description="Venue for the allocation") 