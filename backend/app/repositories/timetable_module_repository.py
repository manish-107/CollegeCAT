from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, select
from typing import List, Optional, Dict, Any
from app.models.model import Timetable, TimetableHourFormats, Batches, AcademicYears
from app.schemas.timetable_module_schema import TimetableModuleCreate, TimetableModuleUpdate
import logging

logger = logging.getLogger(__name__)

class TimetableModuleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_timetable_module(self, timetable_data: TimetableModuleCreate) -> Timetable:
        """Create a new timetable module"""
        try:
            # Validate that format, year, and batch exist
            format_result = await self.db.execute(
                select(TimetableHourFormats).where(TimetableHourFormats.format_id == timetable_data.format_id)
            )
            format_exists = format_result.scalar_one_or_none()
            
            if not format_exists:
                raise ValueError(f"Timetable format with ID {timetable_data.format_id} not found")

            year_result = await self.db.execute(
                select(AcademicYears).where(AcademicYears.year_id == timetable_data.year_id)
            )
            year_exists = year_result.scalar_one_or_none()
            
            if not year_exists:
                raise ValueError(f"Academic year with ID {timetable_data.year_id} not found")

            batch_result = await self.db.execute(
                select(Batches).where(Batches.batch_id == timetable_data.batch_id)
            )
            batch_exists = batch_result.scalar_one_or_none()
            
            if not batch_exists:
                raise ValueError(f"Batch with ID {timetable_data.batch_id} not found")

            # Check if timetable already exists for this format, year, and batch combination
            existing_result = await self.db.execute(
                select(Timetable).where(
                    and_(
                        Timetable.format_id == timetable_data.format_id,
                        Timetable.year_id == timetable_data.year_id,
                        Timetable.batch_id == timetable_data.batch_id
                    )
                )
            )
            existing_timetable = existing_result.scalar_one_or_none()

            if existing_timetable:
                raise ValueError(f"Timetable already exists for format_id={timetable_data.format_id}, year_id={timetable_data.year_id}, batch_id={timetable_data.batch_id}")

            # Create new timetable
            new_timetable = Timetable(
                format_id=timetable_data.format_id,
                year_id=timetable_data.year_id,
                batch_id=timetable_data.batch_id,
                timetable_data=timetable_data.timetable_data
            )

            self.db.add(new_timetable)
            await self.db.commit()
            await self.db.refresh(new_timetable)

            logger.info(f"Created timetable module with ID: {new_timetable.timetable_id}")
            return new_timetable

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating timetable module: {str(e)}")
            raise

    async def get_timetable_by_id(self, timetable_id: int) -> Optional[Timetable]:
        """Get timetable module by ID with related data"""
        try:
            result = await self.db.execute(
                select(Timetable).where(Timetable.timetable_id == timetable_id)
            )
            timetable = result.scalar_one_or_none()
            
            return timetable

        except Exception as e:
            logger.error(f"Error getting timetable by ID {timetable_id}: {str(e)}")
            raise

    async def get_timetables_by_year(self, year_id: int) -> List[Timetable]:
        """Get all timetable modules for a specific year with related data"""
        try:
            result = await self.db.execute(
                select(Timetable).where(Timetable.year_id == year_id)
            )
            rows = result.fetchall()
            timetables = [row[0] for row in rows]
            
            return timetables

        except Exception as e:
            logger.error(f"Error getting timetables by year {year_id}: {str(e)}")
            raise

    async def get_timetable_by_year_and_batch(self, year_id: int, batch_id: int) -> Optional[Timetable]:
        """Get timetable module by year and batch with related data"""
        try:
            result = await self.db.execute(
                select(Timetable).where(
                    and_(
                        Timetable.year_id == year_id,
                        Timetable.batch_id == batch_id
                    )
                )
            )
            timetable = result.scalar_one_or_none()
            
            return timetable

        except Exception as e:
            logger.error(f"Error getting timetable by year {year_id} and batch {batch_id}: {str(e)}")
            raise

    async def update_timetable_module(self, timetable_id: int, update_data: TimetableModuleUpdate) -> Optional[Timetable]:
        """Update a timetable module"""
        try:
            result = await self.db.execute(
                select(Timetable).where(Timetable.timetable_id == timetable_id)
            )
            timetable = result.scalar_one_or_none()

            if not timetable:
                return None

            # Update timetable data
            timetable.timetable_data = update_data.timetable_data

            await self.db.commit()
            await self.db.refresh(timetable)

            logger.info(f"Updated timetable module with ID: {timetable_id}")
            return timetable

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating timetable module {timetable_id}: {str(e)}")
            raise

    async def delete_timetable_module(self, timetable_id: int) -> bool:
        """Delete a timetable module"""
        try:
            result = await self.db.execute(
                select(Timetable).where(Timetable.timetable_id == timetable_id)
            )
            timetable = result.scalar_one_or_none()

            if not timetable:
                return False

            await self.db.delete(timetable)
            await self.db.commit()

            logger.info(f"Deleted timetable module with ID: {timetable_id}")
            return True

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting timetable module {timetable_id}: {str(e)}")
            raise

    async def get_format_details(self, format_id: int) -> Optional[TimetableHourFormats]:
        """Get timetable format details"""
        try:
            result = await self.db.execute(
                select(TimetableHourFormats).where(TimetableHourFormats.format_id == format_id)
            )
            format_details = result.scalar_one_or_none()
            
            return format_details

        except Exception as e:
            logger.error(f"Error getting format details for ID {format_id}: {str(e)}")
            raise

    async def get_batch_details(self, batch_id: int) -> Optional[Batches]:
        """Get batch details"""
        try:
            result = await self.db.execute(
                select(Batches).where(Batches.batch_id == batch_id)
            )
            batch_details = result.scalar_one_or_none()
            
            return batch_details

        except Exception as e:
            logger.error(f"Error getting batch details for ID {batch_id}: {str(e)}")
            raise

    async def get_academic_year_details(self, year_id: int) -> Optional[AcademicYears]:
        """Get academic year details"""
        try:
            result = await self.db.execute(
                select(AcademicYears).where(AcademicYears.year_id == year_id)
            )
            year_details = result.scalar_one_or_none()
            
            return year_details

        except Exception as e:
            logger.error(f"Error getting academic year details for ID {year_id}: {str(e)}")
            raise

    async def check_timetable_exists(self, format_id: int, year_id: int, batch_id: int) -> bool:
        """Check if a timetable exists for the given format, year, and batch"""
        try:
            result = await self.db.execute(
                select(Timetable).where(
                    and_(
                        Timetable.format_id == format_id,
                        Timetable.year_id == year_id,
                        Timetable.batch_id == batch_id
                    )
                )
            )
            existing = result.scalar_one_or_none()
            
            return existing is not None

        except Exception as e:
            logger.error(f"Error checking timetable existence: {str(e)}")
            raise 