from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from sqlalchemy.exc import IntegrityError
from app.models.model import TimetableHourFormats, Batches, AcademicYears
from typing import List, Optional, Dict, Any

class TimetableRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_timetable_format(self, year_id: int, batch_id: int, format_name: str, format_data: Dict) -> TimetableHourFormats:
        """Create a new timetable format"""
        try:
            timetable_format = TimetableHourFormats(
                year_id=year_id,
                batch_id=batch_id,
                format_name=format_name,
                format_data=format_data
            )
            self.db.add(timetable_format)
            await self.db.commit()
            await self.db.refresh(timetable_format)
            return timetable_format
        except IntegrityError as e:
            await self.db.rollback()
            raise ValueError(f"Error creating timetable format: {str(e)}")

    async def get_timetable_formats_by_year(self, year_id: int) -> List[Dict]:
        """Get all timetable formats for a specific year"""
        result = await self.db.execute(
            select(
                TimetableHourFormats,
                Batches,
                AcademicYears
            ).join(
                Batches, TimetableHourFormats.batch_id == Batches.batch_id
            ).join(
                AcademicYears, TimetableHourFormats.year_id == AcademicYears.year_id
            ).where(
                TimetableHourFormats.year_id == year_id
            ).order_by(TimetableHourFormats.format_id)
        )
        rows = result.all()
        
        return [
            {
                'format_id': row[0].format_id,
                'format_name': row[0].format_name,
                'format_data': row[0].format_data,
                'created_at': row[0].created_at,
                'year_details': {
                    'year_id': row[2].year_id,
                    'academic_year': row[2].academic_year,
                    'created_at': row[2].created_at
                },
                'batch_details': {
                    'batch_id': row[1].batch_id,
                    'section': row[1].section,
                    'noOfStudent': row[1].noOfStudent,
                    'created_at': row[1].created_at
                }
            }
            for row in rows
        ]

    async def get_timetable_formats_by_year_and_batch(self, year_id: int, batch_id: int) -> List[Dict]:
        """Get all timetable formats for a specific year and batch"""
        result = await self.db.execute(
            select(
                TimetableHourFormats,
                Batches,
                AcademicYears
            ).join(
                Batches, TimetableHourFormats.batch_id == Batches.batch_id
            ).join(
                AcademicYears, TimetableHourFormats.year_id == AcademicYears.year_id
            ).where(
                TimetableHourFormats.year_id == year_id,
                TimetableHourFormats.batch_id == batch_id
            ).order_by(TimetableHourFormats.format_id)
        )
        rows = result.all()
        
        return [
            {
                'format_id': row[0].format_id,
                'format_name': row[0].format_name,
                'format_data': row[0].format_data,
                'created_at': row[0].created_at,
                'year_details': {
                    'year_id': row[2].year_id,
                    'academic_year': row[2].academic_year,
                    'created_at': row[2].created_at
                },
                'batch_details': {
                    'batch_id': row[1].batch_id,
                    'section': row[1].section,
                    'noOfStudent': row[1].noOfStudent,
                    'created_at': row[1].created_at
                }
            }
            for row in rows
        ]

    async def get_timetable_format_by_id(self, format_id: int) -> Optional[Dict]:
        """Get a specific timetable format by ID"""
        result = await self.db.execute(
            select(
                TimetableHourFormats,
                Batches,
                AcademicYears
            ).join(
                Batches, TimetableHourFormats.batch_id == Batches.batch_id
            ).join(
                AcademicYears, TimetableHourFormats.year_id == AcademicYears.year_id
            ).where(
                TimetableHourFormats.format_id == format_id
            )
        )
        row = result.first()
        
        if not row:
            return None
        
        return {
            'format_id': row[0].format_id,
            'format_name': row[0].format_name,
            'format_data': row[0].format_data,
            'created_at': row[0].created_at,
            'year_details': {
                'year_id': row[2].year_id,
                'academic_year': row[2].academic_year,
                'created_at': row[2].created_at
            },
            'batch_details': {
                'batch_id': row[1].batch_id,
                'section': row[1].section,
                'noOfStudent': row[1].noOfStudent,
                'created_at': row[1].created_at
            }
        }

    async def get_all_timetable_formats(self) -> List[Dict]:
        """Get all timetable formats"""
        result = await self.db.execute(
            select(
                TimetableHourFormats,
                Batches,
                AcademicYears
            ).join(
                Batches, TimetableHourFormats.batch_id == Batches.batch_id
            ).join(
                AcademicYears, TimetableHourFormats.year_id == AcademicYears.year_id
            ).order_by(
                TimetableHourFormats.year_id,
                TimetableHourFormats.batch_id,
                TimetableHourFormats.format_id
            )
        )
        rows = result.all()
        
        return [
            {
                'format_id': row[0].format_id,
                'format_name': row[0].format_name,
                'format_data': row[0].format_data,
                'created_at': row[0].created_at,
                'year_details': {
                    'year_id': row[2].year_id,
                    'academic_year': row[2].academic_year,
                    'created_at': row[2].created_at
                },
                'batch_details': {
                    'batch_id': row[1].batch_id,
                    'section': row[1].section,
                    'noOfStudent': row[1].noOfStudent,
                    'created_at': row[1].created_at
                }
            }
            for row in rows
        ]

    async def delete_timetable_format(self, format_id: int) -> bool:
        """Delete a timetable format by ID"""
        try:
            result = await self.db.execute(
                delete(TimetableHourFormats).where(TimetableHourFormats.format_id == format_id)
            )
            await self.db.commit()
            return result.rowcount > 0
        except IntegrityError as e:
            await self.db.rollback()
            raise ValueError(f"Error deleting timetable format: {str(e)}")

    async def update_timetable_format(self, format_id: int, format_name: Optional[str] = None, format_data: Optional[Dict] = None) -> Optional[Dict]:
        """Update a timetable format"""
        try:
            update_data: Dict[str, Any] = {}
            if format_name is not None:
                update_data['format_name'] = format_name
            if format_data is not None:
                update_data['format_data'] = format_data
            
            if not update_data:
                raise ValueError("No fields to update")
            
            await self.db.execute(
                update(TimetableHourFormats)
                .where(TimetableHourFormats.format_id == format_id)
                .values(**update_data)
            )
            await self.db.commit()
            
            # Return the updated format
            return await self.get_timetable_format_by_id(format_id)
        except IntegrityError as e:
            await self.db.rollback()
            raise ValueError(f"Error updating timetable format: {str(e)}") 