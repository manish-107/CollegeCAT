from app.repositories.timetable_repository import TimetableRepository
from app.repositories.year_batch_repository import YearBatchRepository
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.model import AcademicYears, Batches
from typing import List, Optional, Dict
from fastapi import HTTPException

class TimetableService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.timetable_repo = TimetableRepository(db)
        self.year_batch_repo = YearBatchRepository(db)

    async def create_timetable_format(self, year_id: int, batch_id: int, format_name: str, format_data: Dict) -> Dict:
        """Create a new timetable format with validation"""
        # Validate year exists
        year_result = await self.db.execute(
            select(AcademicYears).where(AcademicYears.year_id == year_id)
        )
        year = year_result.scalar_one_or_none()
        if not year:
            raise HTTPException(status_code=404, detail="Academic year not found")

        # Validate batch exists
        batch_result = await self.db.execute(
            select(Batches).where(Batches.batch_id == batch_id)
        )
        batch = batch_result.scalar_one_or_none()
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")

        # Validate batch belongs to the year
        if batch.year_id != year_id:
            raise HTTPException(status_code=400, detail="Batch does not belong to the specified academic year")

        # Validate format_name is not empty
        if not format_name or not format_name.strip():
            raise HTTPException(status_code=400, detail="Format name cannot be empty")

        # Validate format_data is not empty
        if not format_data:
            raise HTTPException(status_code=400, detail="Format data cannot be empty")

        try:
            timetable_format = await self.timetable_repo.create_timetable_format(
                year_id=year_id,
                batch_id=batch_id,
                format_name=format_name.strip(),
                format_data=format_data
            )
            
            return {
                'format_id': timetable_format.format_id,
                'format_name': timetable_format.format_name,
                'format_data': timetable_format.format_data,
                'created_at': timetable_format.created_at,
                'year_details': {
                    'year_id': year.year_id,
                    'academic_year': year.academic_year,
                    'created_at': year.created_at
                },
                'batch_details': {
                    'batch_id': batch.batch_id,
                    'section': batch.section,
                    'noOfStudent': batch.noOfStudent,
                    'created_at': batch.created_at
                }
            }
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_timetable_formats_by_year(self, year_id: int) -> List[Dict]:
        """Get all timetable formats for a specific year"""
        # Validate year exists
        year_result = await self.db.execute(
            select(AcademicYears).where(AcademicYears.year_id == year_id)
        )
        if not year_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Academic year not found")

        formats = await self.timetable_repo.get_timetable_formats_by_year(year_id)
        return formats

    async def get_timetable_formats_by_year_and_batch(self, year_id: int, batch_id: int) -> List[Dict]:
        """Get all timetable formats for a specific year and batch"""
        # Validate year exists
        year_result = await self.db.execute(
            select(AcademicYears).where(AcademicYears.year_id == year_id)
        )
        if not year_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Academic year not found")

        # Validate batch exists
        batch_result = await self.db.execute(
            select(Batches).where(Batches.batch_id == batch_id)
        )
        batch = batch_result.scalar_one_or_none()
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")

        # Validate batch belongs to the year
        if batch.year_id != year_id:
            raise HTTPException(status_code=400, detail="Batch does not belong to the specified academic year")

        formats = await self.timetable_repo.get_timetable_formats_by_year_and_batch(year_id, batch_id)
        return formats

    async def get_timetable_format_by_id(self, format_id: int) -> Dict:
        """Get a specific timetable format by ID"""
        if format_id <= 0:
            raise HTTPException(status_code=400, detail="Invalid format ID")

        format_data = await self.timetable_repo.get_timetable_format_by_id(format_id)
        if not format_data:
            raise HTTPException(status_code=404, detail="Timetable format not found")

        return format_data

    async def get_all_timetable_formats(self) -> List[Dict]:
        """Get all timetable formats"""
        formats = await self.timetable_repo.get_all_timetable_formats()
        return formats

    async def delete_timetable_format(self, format_id: int) -> Dict:
        """Delete a timetable format by ID"""
        if format_id <= 0:
            raise HTTPException(status_code=400, detail="Invalid format ID")

        # Check if format exists
        existing_format = await self.timetable_repo.get_timetable_format_by_id(format_id)
        if not existing_format:
            raise HTTPException(status_code=404, detail="Timetable format not found")

        try:
            deleted = await self.timetable_repo.delete_timetable_format(format_id)
            if deleted:
                return {
                    'message': 'Timetable format deleted successfully',
                    'format_id': format_id
                }
            else:
                raise HTTPException(status_code=500, detail="Failed to delete timetable format")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def update_timetable_format(self, format_id: int, format_name: Optional[str] = None, format_data: Optional[Dict] = None) -> Dict:
        """Update a timetable format"""
        if format_id <= 0:
            raise HTTPException(status_code=400, detail="Invalid format ID")

        # Check if format exists
        existing_format = await self.timetable_repo.get_timetable_format_by_id(format_id)
        if not existing_format:
            raise HTTPException(status_code=404, detail="Timetable format not found")

        # Validate format_name if provided
        if format_name is not None and not format_name.strip():
            raise HTTPException(status_code=400, detail="Format name cannot be empty")

        # Validate format_data if provided
        if format_data is not None and not format_data:
            raise HTTPException(status_code=400, detail="Format data cannot be empty")

        try:
            updated_format = await self.timetable_repo.update_timetable_format(
                format_id=format_id,
                format_name=format_name.strip() if format_name else None,
                format_data=format_data
            )
            
            if not updated_format:
                raise HTTPException(status_code=500, detail="Failed to update timetable format")

            return updated_format
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e)) 