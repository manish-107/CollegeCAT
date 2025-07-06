from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any, Awaitable
from app.repositories.timetable_module_repository import TimetableModuleRepository
from app.schemas.timetable_module_schema import (
    TimetableModuleCreate,
    TimetableModuleUpdate,
    TimetableModuleResponse,
    TimetableModuleListResponse,
    TimetableModuleDeleteResponse,
    TimetableModuleUpdateResponse,
    TimetableFormatDetails,
    BatchDetails,
    AcademicYearDetails
)
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class TimetableModuleService:
    def __init__(self, db: AsyncSession) -> None:
        self.db: AsyncSession = db
        self.repository: TimetableModuleRepository = TimetableModuleRepository(db)

    def _convert_datetime(self, dt) -> datetime:
        """Convert SQLAlchemy DateTime to Python datetime"""
        if dt is None:
            return datetime.now()
        if hasattr(dt, 'isoformat'):
            return datetime.fromisoformat(dt.isoformat().replace('Z', '+00:00'))
        return dt

    async def create_timetable_module(self, timetable_data: TimetableModuleCreate) -> int:
        """Create a new timetable module"""
        try:
            # Create the timetable module
            timetable = await self.repository.create_timetable_module(timetable_data)
            
            # Get related details
            format_details = await self.repository.get_format_details(timetable.format_id)
            batch_details = await self.repository.get_batch_details(timetable.batch_id)
            year_details = await self.repository.get_academic_year_details(timetable.year_id)

            if not format_details or not batch_details or not year_details:
                raise ValueError("Related data not found")

            # Build response
            response = TimetableModuleResponse(
                timetable_id=timetable.timetable_id,
                format_id=timetable.format_id,
                year_id=timetable.year_id,
                batch_id=timetable.batch_id,
                timetable_data=timetable.timetable_data,
                created_at=self._convert_datetime(timetable.created_at),
                format_details=TimetableFormatDetails(
                    format_id=format_details.format_id,
                    format_name=format_details.format_name,
                    format_data=format_details.format_data,
                    created_at=self._convert_datetime(format_details.created_at)
                ),
                batch_details=BatchDetails(
                    batch_id=batch_details.batch_id,
                    section=batch_details.section,
                    noOfStudent=batch_details.noOfStudent,
                    created_at=self._convert_datetime(batch_details.created_at)
                ),
                academic_year_details=AcademicYearDetails(
                    year_id=year_details.year_id,
                    academic_year=year_details.academic_year,
                    created_at=self._convert_datetime(year_details.created_at)
                )
            )

            logger.info(f"Successfully created timetable module with ID: {timetable.timetable_id}")
            return response.format_id

        except Exception as e:
            logger.error(f"Error in create_timetable_module service: {str(e)}")
            raise

    async def get_timetable_by_id(self, timetable_id: int) -> Optional[TimetableModuleResponse]:
        """Get timetable module by ID"""
        try:
            timetable = await self.repository.get_timetable_by_id(timetable_id)
            
            if not timetable:
                return None

            # Get related details
            format_details = await self.repository.get_format_details(timetable.format_id)
            batch_details = await self.repository.get_batch_details(timetable.batch_id)
            year_details = await self.repository.get_academic_year_details(timetable.year_id)

            if not format_details or not batch_details or not year_details:
                raise ValueError("Related data not found")

            # Build response
            response = TimetableModuleResponse(
                timetable_id=timetable.timetable_id,
                format_id=timetable.format_id,
                year_id=timetable.year_id,
                batch_id=timetable.batch_id,
                timetable_data=timetable.timetable_data,
                created_at=self._convert_datetime(timetable.created_at),
                format_details=TimetableFormatDetails(
                    format_id=format_details.format_id,
                    format_name=format_details.format_name,
                    format_data=format_details.format_data,
                    created_at=self._convert_datetime(format_details.created_at)
                ),
                batch_details=BatchDetails(
                    batch_id=batch_details.batch_id,
                    section=batch_details.section,
                    noOfStudent=batch_details.noOfStudent,
                    created_at=self._convert_datetime(batch_details.created_at)
                ),
                academic_year_details=AcademicYearDetails(
                    year_id=year_details.year_id,
                    academic_year=year_details.academic_year,
                    created_at=self._convert_datetime(year_details.created_at)
                )
            )

            return response

        except Exception as e:
            logger.error(f"Error in get_timetable_by_id service: {str(e)}")
            raise

    async def get_timetables_by_year(self, year_id: int) -> TimetableModuleListResponse:
        """Get all timetable modules for a specific year"""
        try:
            timetables = await self.repository.get_timetables_by_year(year_id)
            
            timetable_responses = []
            for timetable in timetables:
                # Get related details
                format_details = await self.repository.get_format_details(timetable.format_id)
                batch_details = await self.repository.get_batch_details(timetable.batch_id)
                year_details = await self.repository.get_academic_year_details(timetable.year_id)

                if format_details and batch_details and year_details:
                    response = TimetableModuleResponse(
                        timetable_id=timetable.timetable_id,
                        format_id=timetable.format_id,
                        year_id=timetable.year_id,
                        batch_id=timetable.batch_id,
                        timetable_data=timetable.timetable_data,
                        created_at=self._convert_datetime(timetable.created_at),
                        format_details=TimetableFormatDetails(
                            format_id=format_details.format_id,
                            format_name=format_details.format_name,
                            format_data=format_details.format_data,
                            created_at=self._convert_datetime(format_details.created_at)
                        ),
                        batch_details=BatchDetails(
                            batch_id=batch_details.batch_id,
                            section=batch_details.section,
                            noOfStudent=batch_details.noOfStudent,
                            created_at=self._convert_datetime(batch_details.created_at)
                        ),
                        academic_year_details=AcademicYearDetails(
                            year_id=year_details.year_id,
                            academic_year=year_details.academic_year,
                            created_at=self._convert_datetime(year_details.created_at)
                        )
                    )
                    timetable_responses.append(response)

            return TimetableModuleListResponse(
                timetables=timetable_responses,
                total_count=len(timetable_responses)
            )

        except Exception as e:
            logger.error(f"Error in get_timetables_by_year service: {str(e)}")
            raise

    async def get_timetable_by_year_and_batch(self, year_id: int, batch_id: int) -> Optional[TimetableModuleResponse]:
        """Get timetable module by year and batch"""
        try:
            timetable = await self.repository.get_timetable_by_year_and_batch(year_id, batch_id)
            
            if not timetable:
                return None

            # Get related details
            format_details = await self.repository.get_format_details(timetable.format_id)
            batch_details = await self.repository.get_batch_details(timetable.batch_id)
            year_details = await self.repository.get_academic_year_details(timetable.year_id)

            if not format_details or not batch_details or not year_details:
                raise ValueError("Related data not found")

            # Build response
            response = TimetableModuleResponse(
                timetable_id=timetable.timetable_id,
                format_id=timetable.format_id,
                year_id=timetable.year_id,
                batch_id=timetable.batch_id,
                timetable_data=timetable.timetable_data,
                created_at=self._convert_datetime(timetable.created_at),
                format_details=TimetableFormatDetails(
                    format_id=format_details.format_id,
                    format_name=format_details.format_name,
                    format_data=format_details.format_data,
                    created_at=self._convert_datetime(format_details.created_at)
                ),
                batch_details=BatchDetails(
                    batch_id=batch_details.batch_id,
                    section=batch_details.section,
                    noOfStudent=batch_details.noOfStudent,
                    created_at=self._convert_datetime(batch_details.created_at)
                ),
                academic_year_details=AcademicYearDetails(
                    year_id=year_details.year_id,
                    academic_year=year_details.academic_year,
                    created_at=self._convert_datetime(year_details.created_at)
                )
            )

            return response

        except Exception as e:
            logger.error(f"Error in get_timetable_by_year_and_batch service: {str(e)}")
            raise

    async def update_timetable_module(self, timetable_id: int, update_data: TimetableModuleUpdate) -> Optional[TimetableModuleUpdateResponse]:
        """Update a timetable module"""
        try:
            updated_timetable = await self.repository.update_timetable_module(timetable_id, update_data)
            
            if not updated_timetable:
                return None

            # Get the updated timetable with all details
            timetable_response = await self.get_timetable_by_id(timetable_id)
            
            if not timetable_response:
                raise ValueError("Failed to retrieve updated timetable")

            response = TimetableModuleUpdateResponse(
                message="Timetable module updated successfully",
                timetable_id=timetable_id,
                updated_data=timetable_response
            )

            logger.info(f"Successfully updated timetable module with ID: {timetable_id}")
            return response

        except Exception as e:
            logger.error(f"Error in update_timetable_module service: {str(e)}")
            raise

    async def delete_timetable_module(self, timetable_id: int) -> Optional[TimetableModuleDeleteResponse]:
        """Delete a timetable module"""
        try:
            success = await self.repository.delete_timetable_module(timetable_id)
            
            if not success:
                return None

            response = TimetableModuleDeleteResponse(
                message="Timetable module deleted successfully",
                timetable_id=timetable_id
            )

            logger.info(f"Successfully deleted timetable module with ID: {timetable_id}")
            return response

        except Exception as e:
            logger.error(f"Error in delete_timetable_module service: {str(e)}")
            raise

    def validate_timetable_data(self, timetable_data: Dict[str, List[str]]) -> bool:
        """Validate timetable data structure"""
        try:
            required_days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
            
            # Check if all required days are present
            for day in required_days:
                if day not in timetable_data:
                    return False
                
                # Check if the value is a list
                if not isinstance(timetable_data[day], list):
                    return False

            return True

        except Exception as e:
            logger.error(f"Error validating timetable data: {str(e)}")
            return False 