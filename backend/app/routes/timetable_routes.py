from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.postgres_client import get_db
from app.schemas.lecturer_priority_schema import SuccessResponse
from app.services.timetable_service import TimetableService
from app.schemas.timetable_schema import (
    TimetableFormatCreate,
    TimetableFormatUpdate,
    TimetableFormatResponse,
)

router = APIRouter(prefix="/timetable")

@router.post("/formats", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED, operation_id="create_timetable_format")
async def create_timetable_format(
    format_data: TimetableFormatCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new timetable format.
    
    - **year_id**: ID of the academic year
    - **batch_id**: ID of the batch
    - **format_name**: Name of the timetable format
    - **format_data**: JSON data containing the timetable format structure
    """
    service = TimetableService(db)
    result = await service.create_timetable_format(
        year_id=format_data.year_id,
        batch_id=format_data.batch_id,
        format_name=format_data.format_name,
        format_data=format_data.format_data
    )
    return SuccessResponse(message="Timetable format created successfully",data=result["format_id"])

@router.get("/formats/year/{year_id}", response_model=List[TimetableFormatResponse], operation_id="get_timetable_formats_by_year")
async def get_timetable_formats_by_year(
    year_id: int = Path(..., description="ID of the academic year",examples=[1]),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all timetable formats for a specific academic year.
    
    - **year_id**: ID of the academic year
    """
    service = TimetableService(db)
    return await service.get_timetable_formats_by_year(year_id)

@router.get("/formats/year/{year_id}/batch/{batch_id}", response_model=List[TimetableFormatResponse], operation_id="get_timetable_formats_by_year_and_batch")
async def get_timetable_formats_by_year_and_batch(
    year_id: int = Path(..., description="ID of the academic year",examples=[1]),
    batch_id: int = Path(..., description="ID of the batch",examples=[1]),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all timetable formats for a specific academic year and batch.
    
    - **year_id**: ID of the academic year
    - **batch_id**: ID of the batch
    """
    service = TimetableService(db)
    return await service.get_timetable_formats_by_year_and_batch(year_id, batch_id)

@router.get("/formats/{format_id}", response_model=TimetableFormatResponse, operation_id="get_timetable_format_by_id")
async def get_timetable_format_by_id(
    format_id: int = Path(..., description="ID of the timetable format",examples=[1]),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific timetable format by ID.
    
    - **format_id**: ID of the timetable format
    """
    service = TimetableService(db)
    return await service.get_timetable_format_by_id(format_id)

@router.get("/formats", response_model=List[TimetableFormatResponse], operation_id="get_all_timetable_formats")
async def get_all_timetable_formats(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all timetable formats.
    """
    service = TimetableService(db)
    return await service.get_all_timetable_formats()

@router.put("/formats/{format_id}", response_model=SuccessResponse, operation_id="update_timetable_format")
async def update_timetable_format(
    format_data: TimetableFormatUpdate,
    format_id: int = Path(..., description="ID of the timetable format",examples=[1]),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a timetable format.
    
    - **format_id**: ID of the timetable format to update
    - **format_name**: Updated name of the timetable format (optional)
    - **format_data**: Updated JSON data containing the timetable format structure (optional)
    """
    service = TimetableService(db)
    result = await service.update_timetable_format(
        format_id=format_id,
        format_name=format_data.format_name,
        format_data=format_data.format_data
    )
    return SuccessResponse(message="Timetable format updated successfully",data=result["format_id"])

@router.delete("/formats/{format_id}", response_model=SuccessResponse, operation_id="delete_timetable_format")
async def delete_timetable_format(
    format_id: int = Path(..., description="ID of the timetable format",examples=[1]),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a timetable format.
    
    - **format_id**: ID of the timetable format to delete
    """
    service = TimetableService(db)
    result = await service.delete_timetable_format(format_id) 
    return SuccessResponse(message="Timetable format deleted successfully",data=result["format_id"])