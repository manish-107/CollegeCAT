from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres_client import get_db
from app.repositories.year_batch_repository import YearBatchRepository
from app.services.year_batch_service import YearBatchService
from app.schemas.academic_schema import (
    AcademicYearBatchCreate, AcademicYearBatchUpdate, BatchCreate, SubjectCreate, SubjectUpdate,
    CreatedResponse, MessageResponse, ErrorResponse, AcademicYearWithBatchesListResponse, BatchesListResponse,
    SubjectsListResponse, SubjectDetailResponse
)
from typing import Optional, Union

router = APIRouter()

def get_service(db: AsyncSession = Depends(get_db)) -> YearBatchService:
    repo = YearBatchRepository(db)
    return YearBatchService(repo)

@router.post("/academic-years-batch", response_model=CreatedResponse)
async def create_year_with_batch(
    data: AcademicYearBatchCreate,
    service: YearBatchService = Depends(get_service)
):
    return await service.create_year_with_batch(data)

@router.get("/academic-years-with-batchs", response_model=AcademicYearWithBatchesListResponse)
async def get_years_with_batches(
    service: YearBatchService = Depends(get_service)
):
    return await service.get_years_with_batches()

@router.get("/batches/{year_id}", response_model=BatchesListResponse)
async def get_batches_by_year_id(
    year_id: int,
    service: YearBatchService = Depends(get_service)
):
    return await service.get_batches_by_year(year_id)

@router.put("/academic-years/{year_id}", response_model=MessageResponse)
async def update_year_and_batches(
    year_id: int,
    data: AcademicYearBatchUpdate,
    service: YearBatchService = Depends(get_service)
):
    return await service.update_year_and_batches(year_id, data)

@router.delete("/academic-years/{year_id}", response_model=Union[MessageResponse, ErrorResponse])
async def delete_year(
    year_id: int,
    service: YearBatchService = Depends(get_service)
):
    try:
        return await service.delete_year(year_id)
    except ValueError as e:
        return ErrorResponse(detail=str(e))

@router.post("/batches/{year_id}", response_model=CreatedResponse)
async def create_batch_for_year(
    year_id: int,
    data: BatchCreate,
    service: YearBatchService = Depends(get_service)
):
    return await service.create_batch_for_year(year_id, data)

@router.post("/subjects", response_model=CreatedResponse)
async def create_subject(
    data: SubjectCreate,
    service: YearBatchService = Depends(get_service)
):
    return await service.create_subject(data)

@router.get("/subjects/{year_id}", response_model=SubjectsListResponse)
async def get_subjects_by_year(
    year_id: int,
    service: YearBatchService = Depends(get_service)
):
    return await service.get_subjects_by_year(year_id)

@router.get("/subject/{subject_id}", response_model=SubjectDetailResponse)
async def get_subject_by_id(
    subject_id: int,
    service: YearBatchService = Depends(get_service)
):
    subject = await service.get_subject_by_id(subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject

@router.put("/subject/{subject_id}", response_model=MessageResponse)
async def update_subject(
    subject_id: int,
    data: SubjectUpdate,
    service: YearBatchService = Depends(get_service)
):
    return await service.update_subject(subject_id, data)

@router.delete("/subject/{subject_id}", response_model=Union[MessageResponse, ErrorResponse])
async def delete_subject(
    subject_id: int,
    service: YearBatchService = Depends(get_service)
):
    try:
        return await service.delete_subject(subject_id)
    except ValueError as e:
        return ErrorResponse(detail=str(e))

@router.delete("/batch/{batch_id}", response_model=Union[MessageResponse, ErrorResponse])
async def delete_batch(
    batch_id: int,
    service: YearBatchService = Depends(get_service)
):
    try:
        return await service.delete_batch(batch_id)
    except ValueError as e:
        return ErrorResponse(detail=str(e))
