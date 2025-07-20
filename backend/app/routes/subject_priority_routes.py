from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres_client import get_db
from app.repositories.lecturer_priority_repository import FacultyPriorityRepository
from app.services.lecturer_priority_service import FacultyPriorityService
from app.schemas.lecturer_priority_schema import (
    FacultyPrioritySubmitRequest,
    FacultyPriorityUpdateRequest,
    FacultyPriorityResponse,
    FacultyPriorityWithDetailsListResponse,
    SuccessResponse,
    FacultySubjectAllocationListResponse,
    AllocationResultResponse,
    AllocationResponse,
    AllocationUpdateRequest,
    FacultyPriorityDetailResponse
)

subject_priority_router = APIRouter()

def get_service(db: AsyncSession = Depends(get_db)) -> FacultyPriorityService:
    repository = FacultyPriorityRepository(db)
    return FacultyPriorityService(repository)

@subject_priority_router.post("/submit", response_model=SuccessResponse, operation_id="submit_faculty_priorities")
async def submit_priorities(
    data: FacultyPrioritySubmitRequest,
    service: FacultyPriorityService = Depends(get_service)
):
    """Submit faculty subject priorities for a year"""
    try:
        await service.submit_priorities(data.faculty_id, data.year_id, [p.dict() for p in data.priorities])
        return SuccessResponse(message="Priorities submitted successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@subject_priority_router.put("/update/{faculty_id}/{year_id}", response_model=SuccessResponse, operation_id="update_faculty_priorities")
async def update_priorities(
    data: FacultyPriorityUpdateRequest,
    faculty_id: int = Path(..., description="ID of the faculty"),
    year_id: int = Path(..., description="ID of the year"),
    service: FacultyPriorityService = Depends(get_service)
):
    """Update faculty subject priorities by swapping priorities between two subjects"""
    await service.update_priority(faculty_id, year_id, data.subject1_id, data.batch1_id, data.priority1, data.subject2_id, data.batch2_id, data.priority2)
    return SuccessResponse(message="Priorities updated successfully",data=faculty_id)

@subject_priority_router.delete("/delete/{priority_id}", response_model=SuccessResponse, operation_id="delete_faculty_priority")
async def delete_priority(
    priority_id: int = Path(..., description="ID of the priority"),
    service: FacultyPriorityService = Depends(get_service)
):
    """Delete a specific priority entry"""
    await service.delete_priority(priority_id)
    return SuccessResponse(message="Priority deleted successfully",data=priority_id)

@subject_priority_router.get("/faculty/{faculty_id}/year/{year_id}", response_model=FacultyPriorityDetailResponse, operation_id="get_priorities_by_faculty_and_year")
async def get_priorities_by_faculty_and_year(
    faculty_id: int = Path(..., description="ID of the faculty"),
    year_id: int = Path(..., description="ID of the year"),
    service: FacultyPriorityService = Depends(get_service)
):
    """Get all priorities for a specific faculty and year"""
    return await service.get_priorities_by_faculty_and_year(faculty_id, year_id)

@subject_priority_router.get("/faculty/{faculty_id}/year/{year_id}/subject/{subject_id}/batch/{batch_id}", response_model=FacultyPriorityResponse, operation_id="get_priority_by_faculty_year_subject_batch")
async def get_priority_by_faculty_year_subject_batch(
    faculty_id: int = Path(..., description="ID of the faculty"),
    year_id: int = Path(..., description="ID of the year"),
    subject_id: int = Path(..., description="ID of the subject"),
    batch_id: int = Path(..., description="ID of the batch"),
    service: FacultyPriorityService = Depends(get_service)
):
    """Get a specific priority for a faculty, year, subject, and batch combination"""
    result = await service.get_priority_by_faculty_year_subject_batch(faculty_id, year_id, subject_id, batch_id)
    if not result:
        raise HTTPException(status_code=404, detail="Priority not found")
    return result

@subject_priority_router.get("/year/{year_id}", response_model=FacultyPriorityWithDetailsListResponse, operation_id="get_all_priorities_by_year")
async def get_all_priorities_by_year(
    year_id: int = Path(..., description="ID of the year"),
    service: FacultyPriorityService = Depends(get_service)
):
    """Get all priorities for a year with detailed information"""
    return await service.get_all_priorities_by_year_with_details(year_id)

@subject_priority_router.post("/allocate-subjects/{year_id}", response_model=AllocationResultResponse, operation_id="auto_allocate_subjects_for_year")
async def auto_allocate_subjects_for_year(
    year_id: int = Path(..., description="ID of the year"),
    service: FacultyPriorityService = Depends(get_service)
):
    """Automatically allocate subjects to faculty based on priorities and seniority"""
    return await service.allocate_subjects_for_year(year_id)

@subject_priority_router.get("/allocated-ordered/{year_id}", response_model=AllocationResponse, operation_id="get_allocated_ordered_by_seniority")
async def get_allocated_ordered_by_seniority(
    year_id: int = Path(..., description="ID of the year"),
    service: FacultyPriorityService = Depends(get_service)
):
    """Get allocations grouped by year, batches, and subjects with allocated faculty"""
    return await service.get_allocations_grouped_by_year_batch_subject(year_id)

@subject_priority_router.get("/allocations/{year_id}", response_model=FacultySubjectAllocationListResponse, operation_id="get_allocations_by_year")
async def get_allocations_by_year(
    year_id: int = Path(..., description="ID of the year"),
    service: FacultyPriorityService = Depends(get_service)
):
    """Get all allocations for a specific year with details"""
    return await service.get_allocations_by_year_with_details(year_id)

@subject_priority_router.put("/allocations", response_model=SuccessResponse, operation_id="update_allocations")
async def update_allocations_by_year_and_batch(
    allocation_data: AllocationUpdateRequest,
    service: FacultyPriorityService = Depends(get_service)
):
    """Update allocation by year_id and batch_id"""
    await service.update_allocation_faculty(
        allocation_data.allocation_id,
        allocation_data.faculty_id,
        co_faculty_id=allocation_data.co_faculty_id,
        venue=allocation_data.venue
    )
    return SuccessResponse(message="Allocation updated successfully",data=allocation_data.allocation_id)

