from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres_client import get_db
from app.repositories.year_batch_repository import YearBatchRepository
from app.services.year_batch_service import YearBatchService
from app.schemas.academic_schema import (
    AcademicYearBatchCreate, AcademicYearBatchUpdate, BatchCreate, SubjectCreate, SubjectUpdate,
    MessageResponse, ErrorResponse, AcademicYearWithBatchesListResponse, BatchesListResponse,
    SubjectsListResponse, SubjectDetailResponse
)
from typing import Optional, Union
from app.schemas.lecturer_priority_schema import SuccessResponse

router = APIRouter()

def get_service(db: AsyncSession = Depends(get_db)) -> YearBatchService:
    repo = YearBatchRepository(db)
    return YearBatchService(repo)

@router.post("/academic-years-batch", response_model=SuccessResponse, operation_id="create_year_with_batch")
async def create_year_with_batch(
    data: AcademicYearBatchCreate,
    service: YearBatchService = Depends(get_service)
):
    result = await service.create_year_with_batch(data)
    return SuccessResponse(message="Academic year and batch created successfully",data=result)

@router.get("/academic-years-with-batchs", response_model=AcademicYearWithBatchesListResponse, operation_id="get_years_with_batches")
async def get_years_with_batches(
    service: YearBatchService = Depends(get_service)
):
    return await service.get_years_with_batches()

@router.get("/batches/{year_id}", response_model=BatchesListResponse, operation_id="get_batches_by_year_id")
async def get_batches_by_year_id(
    year_id: int,
    service: YearBatchService = Depends(get_service)
):
    return await service.get_batches_by_year(year_id)

@router.put("/academic-years/{year_id}", response_model=SuccessResponse, operation_id="update_year_and_batches")
async def update_year_and_batches(
    data: AcademicYearBatchUpdate,
    year_id: int = Path(..., description="The ID of the academic year to update"),
    service: YearBatchService = Depends(get_service)
):
    await service.update_year_and_batches(year_id, data)
    return SuccessResponse(message="Academic year and batch updated successfully",data=year_id)

@router.delete("/academic-years/{year_id}", response_model=Union[MessageResponse, ErrorResponse], operation_id="delete_year")
async def delete_year(
    year_id: int,
    service: YearBatchService = Depends(get_service)
):
    try:
        return await service.delete_year(year_id)
    except ValueError as e:
        return ErrorResponse(detail=str(e),success=False)

@router.post("/batches/{year_id}", response_model=SuccessResponse, operation_id="create_batch_for_year")
async def create_batch_for_year(
    year_id: int,
    data: BatchCreate,
    service: YearBatchService = Depends(get_service)
):
    await service.create_batch_for_year(year_id, data)
    return SuccessResponse(message="Batch created successfully",data=year_id)

@router.post("/subjects", response_model=SuccessResponse, operation_id="create_subject")
async def create_subject(
    data: SubjectCreate,
    service: YearBatchService = Depends(get_service)
):
    subject_id = await service.create_subject(data)
    return SuccessResponse(message="Subject created successfully",data=subject_id)

@router.get("/subjects/{year_id}", response_model=SubjectsListResponse, operation_id="get_subjects_by_year")
async def get_subjects_by_year(
    year_id: int,
    service: YearBatchService = Depends(get_service)
):
    return await service.get_subjects_by_year(year_id)

@router.get("/subject/{subject_id}", response_model=SubjectDetailResponse, operation_id="get_subject_by_id")
async def get_subject_by_id(
    subject_id: int,
    service: YearBatchService = Depends(get_service)
):
    subject = await service.get_subject_by_id(subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject

@router.put("/subject/{subject_id}", response_model=SuccessResponse, operation_id="update_subject")
async def update_subject(
    subject_id: int,
    data: SubjectUpdate,
    service: YearBatchService = Depends(get_service)
):
    await service.update_subject(subject_id, data)
    return SuccessResponse(message="Subject updated successfully",data=subject_id)

@router.delete("/subject/{subject_id}", response_model=SuccessResponse, operation_id="delete_subject")
async def delete_subject(
    subject_id: int,
    service: YearBatchService = Depends(get_service)
):
    try:
        await service.delete_subject(subject_id)
        return SuccessResponse(message="Subject deleted successfully",data=subject_id)
    except ValueError as e:
        return ErrorResponse(detail=str(e),success=False)

@router.delete("/batch/{batch_id}", response_model=SuccessResponse, operation_id="delete_batch")
async def delete_batch(
    batch_id: int,
    service: YearBatchService = Depends(get_service)
):
    try:
        await service.delete_batch(batch_id)
        return SuccessResponse(message="Batch deleted successfully",data=batch_id)
    except ValueError as e:
        return ErrorResponse(detail=str(e),success=False)
