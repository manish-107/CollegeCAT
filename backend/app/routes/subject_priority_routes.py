from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres_client import get_db
from app.repositories.lecturer_priority_repository import LecturerPriorityRepository
from app.services.lecturer_priority_service import LecturerPriorityService
from app.schemas.lecturer_priority_schema import (
    LecturerPrioritySubmitRequest, LecturerPriorityUpdateRequest,

   LecturerPriorityDetailedListResponse,
    MessageResponse, ErrorResponse, 
    LecturerSubjectAllocationListResponse, AllocationResultResponse,
    AllocationResponse, LecturerPriorityDetailResponse, AllocationUpdateRequest
)
from typing import Union

router = APIRouter(prefix="/subject-priority")

def get_service(db: AsyncSession = Depends(get_db)) -> LecturerPriorityService:
    repository = LecturerPriorityRepository(db)
    return LecturerPriorityService(repository)

@router.post("/submit", response_model=Union[MessageResponse, ErrorResponse])
async def submit_priorities(
    data: LecturerPrioritySubmitRequest,
    service: LecturerPriorityService = Depends(get_service)
):
    """Submit lecturer subject priorities for a year"""
    try:
        return await service.submit_priorities(data)
    except ValueError as e:
        return ErrorResponse(detail=str(e))

@router.put("/update/{lecturer_id}/{year_id}", response_model=Union[MessageResponse, ErrorResponse])
async def update_priorities(
    lecturer_id: int,
    year_id: int,
    data: LecturerPriorityUpdateRequest,
    service: LecturerPriorityService = Depends(get_service)
):
    """Update lecturer subject priorities by swapping priorities between two subjects"""
    try:
        return await service.update_priority(lecturer_id, year_id, data)
    except ValueError as e:
        return ErrorResponse(detail=str(e))

@router.delete("/delete/{priority_id}", response_model=Union[MessageResponse, ErrorResponse])
async def delete_priority(
    priority_id: int,
    service: LecturerPriorityService = Depends(get_service)
):
    """Delete a specific priority entry"""
    try:
        return await service.delete_priority(priority_id)
    except ValueError as e:
        return ErrorResponse(detail=str(e))

@router.get("/lecturer/{lecturer_id}/year/{year_id}", response_model=Union[LecturerPriorityDetailResponse, ErrorResponse])
async def get_priorities_by_lecturer_and_year(
    lecturer_id: int,
    year_id: int,
    service: LecturerPriorityService = Depends(get_service)
):
    """Get all priorities for a specific lecturer and year"""
    try:
        return await service.get_priorities_by_lecturer_and_year(lecturer_id, year_id)
    except ValueError as e:
        return ErrorResponse(detail=str(e))

@router.get("/lecturer/{lecturer_id}/year/{year_id}/subject/{subject_id}/batch/{batch_id}", response_model=Union[dict, ErrorResponse])
async def get_priority_by_lecturer_year_subject_batch(
    lecturer_id: int,
    year_id: int,
    subject_id: int,
    batch_id: int,
    service: LecturerPriorityService = Depends(get_service)
):
    """Get a specific priority for a lecturer, year, subject, and batch combination"""
    try:
        result = await service.get_priority_by_lecturer_year_subject_batch(lecturer_id, year_id, subject_id, batch_id)
        if result is None:
            return ErrorResponse(detail="Priority not found")
        return result
    except ValueError as e:
        return ErrorResponse(detail=str(e))

@router.get("/year/{year_id}", response_model=Union[LecturerPriorityDetailedListResponse, ErrorResponse])
async def get_all_priorities_by_year(
    year_id: int,
    service: LecturerPriorityService = Depends(get_service)
):
    """Get all priorities for a year with detailed information"""
    try:
        return await service.get_all_priorities_by_year_with_details(year_id)
    except ValueError as e:
        return ErrorResponse(detail=str(e))


@router.post("/allocate-subjects/{year_id}", response_model=Union[AllocationResultResponse, ErrorResponse])
async def auto_allocate_subjects_for_year(
    year_id: int,
    service: LecturerPriorityService = Depends(get_service)
):
    """Automatically allocate subjects to lecturers based on priorities and seniority"""
    try:
        return await service.allocate_subjects_for_year(year_id)
    except ValueError as e:
        return ErrorResponse(detail=str(e))
    
@router.get("/allocated-ordered/{year_id}", response_model=Union[AllocationResponse, ErrorResponse])
async def get_allocated_ordered_by_seniority(
    year_id: int,
    service: LecturerPriorityService = Depends(get_service)
):
    """Get allocations grouped by year, batches, and subjects with allocated lecturers"""
    try:
        return await service.get_allocated_ordered_by_seniority(year_id)
    except ValueError as e:
        return ErrorResponse(detail=str(e))

@router.get("/allocations/{year_id}", response_model=Union[LecturerSubjectAllocationListResponse, ErrorResponse])
async def get_allocations_by_year(
    year_id: int,
    service: LecturerPriorityService = Depends(get_service)
):
    """Get all allocations for a specific year with details"""
    try:
        return await service.get_allocations_by_year(year_id)
    except ValueError as e:
        return ErrorResponse(detail=str(e))

@router.put("/allocations/{year_id}/batch/{batch_id}", response_model=Union[MessageResponse, ErrorResponse])
async def update_allocations_by_year_and_batch(
    year_id: int,
    batch_id: int,
    allocation_data: AllocationUpdateRequest,
    service: LecturerPriorityService = Depends(get_service)
):
    """Update allocation by year_id and batch_id"""
    try:
        return await service.update_allocation_by_year_and_batch(year_id, batch_id, allocation_data.allocation_id, allocation_data.lecturer_id)
    except ValueError as e:
        return ErrorResponse(detail=str(e))
