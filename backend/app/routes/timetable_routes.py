from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.postgres_client import get_db
from app.services.timetable_service import TimetableService
from app.schemas.timetable_schema import (
    TimetableFormatCreate,
    TimetableFormatUpdate,
    TimetableFormatResponse,
    TimetableFormatListResponse,
    TimetableFormatDeleteResponse
)

router = APIRouter(prefix="/timetable")

@router.post("/formats", response_model=TimetableFormatResponse, status_code=status.HTTP_201_CREATED)
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
    return await service.create_timetable_format(
        year_id=format_data.year_id,
        batch_id=format_data.batch_id,
        format_name=format_data.format_name,
        format_data=format_data.format_data
    )

@router.get("/formats/year/{year_id}", response_model=List[TimetableFormatResponse])
async def get_timetable_formats_by_year(
    year_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all timetable formats for a specific academic year.
    
    - **year_id**: ID of the academic year
    """
    service = TimetableService(db)
    return await service.get_timetable_formats_by_year(year_id)

@router.get("/formats/year/{year_id}/batch/{batch_id}", response_model=List[TimetableFormatResponse])
async def get_timetable_formats_by_year_and_batch(
    year_id: int,
    batch_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all timetable formats for a specific academic year and batch.
    
    - **year_id**: ID of the academic year
    - **batch_id**: ID of the batch
    """
    service = TimetableService(db)
    return await service.get_timetable_formats_by_year_and_batch(year_id, batch_id)

@router.get("/formats/{format_id}", response_model=TimetableFormatResponse)
async def get_timetable_format_by_id(
    format_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific timetable format by ID.
    
    - **format_id**: ID of the timetable format
    """
    service = TimetableService(db)
    return await service.get_timetable_format_by_id(format_id)

@router.get("/formats", response_model=List[TimetableFormatResponse])
async def get_all_timetable_formats(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all timetable formats.
    """
    service = TimetableService(db)
    return await service.get_all_timetable_formats()

@router.put("/formats/{format_id}", response_model=TimetableFormatResponse)
async def update_timetable_format(
    format_id: int,
    format_data: TimetableFormatUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update a timetable format.
    
    - **format_id**: ID of the timetable format to update
    - **format_name**: Updated name of the timetable format (optional)
    - **format_data**: Updated JSON data containing the timetable format structure (optional)
    """
    service = TimetableService(db)
    return await service.update_timetable_format(
        format_id=format_id,
        format_name=format_data.format_name,
        format_data=format_data.format_data
    )

@router.delete("/formats/{format_id}", response_model=TimetableFormatDeleteResponse)
async def delete_timetable_format(
    format_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a timetable format.
    
    - **format_id**: ID of the timetable format to delete
    """
    service = TimetableService(db)
    return await service.delete_timetable_format(format_id) 