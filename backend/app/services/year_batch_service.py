from app.repositories.year_batch_repository import YearBatchRepository
from app.schemas.academic_schema import (
    AcademicYearBatchCreate, AcademicYearBatchUpdate, BatchCreate, BatchUpdate,
    SubjectCreate, SubjectUpdate
)
from typing import List, Optional
from datetime import datetime

class YearBatchService:
    def __init__(self, repository: YearBatchRepository):
        self.repository = repository

    async def create_year_with_batch(self, data: AcademicYearBatchCreate):
        year_id = await self.repository.create_year_with_batch(data.year, data.batch.dict())
        return {"created_id": year_id, "message": "successful"}

    async def get_years_with_batches(self):
        items = await self.repository.get_years_with_batches()
        # Convert batches to dicts for response
        for item in items:
            item['batches'] = [
                {
                    "batch_id": b.batch_id,
                    "section": b.section,
                    "noOfStudent": b.noOfStudent,
                    "created_at": b.created_at
                } for b in item['batches']
            ]
        return {"items": items}

    async def get_batches_by_year(self, year_id: int):
        batches = await self.repository.get_batches_by_year(year_id)
        return {"batches": [
            {
                "batch_id": b.batch_id,
                "section": b.section,
                "noOfStudent": b.noOfStudent,
                "created_at": b.created_at
            } for b in batches
        ]}

    async def update_year_and_batches(self, year_id: int, data: AcademicYearBatchUpdate):
        if data.batch is None:
            raise ValueError("batch cannot be None")
        
        # Only update academic_year if provided
        academic_year: Optional[str] = data.academic_year
        batch_list: List[BatchUpdate] = data.batch
        
        await self.repository.update_year_and_batches(year_id, academic_year, [b.dict() for b in batch_list])
        return {"message": "Academic year updated successfully"}

    async def delete_year(self, year_id: int):
        try:
            await self.repository.delete_year(year_id)
            return {"message": "Academic year deleted successfully", "success": True}
        except ValueError as e:
            raise ValueError(str(e))

    async def create_batch_for_year(self, year_id: int, data: BatchCreate):
        batch_id = await self.repository.create_batch_for_year(year_id, data.section, data.noOfStudent)
        return {"created_id": batch_id, "message": "Batch created successfully"}

    async def create_subject(self, data: SubjectCreate):
        subject_id = await self.repository.create_subject(data.dict())
        return {"created_id": subject_id, "message": "Subject created successfully"}

    async def get_subjects_by_year(self, year_id: int):
        subjects = await self.repository.get_subjects_by_year(year_id)
        return {"subjects": [
            {
                "subject_id": s.subject_id,
                "subject_name": s.subject_name,
                "subject_code": s.subject_code,
                "abbreviation": s.abbreviation,
                "subject_type": s.subject_type.value,
                "no_of_hours_required": s.no_of_hours_required,
                "year_id": s.year_id,
                "created_at": s.created_at
            } for s in subjects
        ]}

    async def get_subject_by_id(self, subject_id: int):
        s = await self.repository.get_subject_by_id(subject_id)
        if not s:
            return None
        return {
            "subject_id": s.subject_id,
            "subject_name": s.subject_name,
            "subject_code": s.subject_code,
            "abbreviation": s.abbreviation,
            "subject_type": s.subject_type.value,
            "no_of_hours_required": s.no_of_hours_required,
            "year_id": s.year_id,
            "created_at": s.created_at
        }

    async def update_subject(self, subject_id: int, data: SubjectUpdate):
        await self.repository.update_subject(subject_id, {k: v for k, v in data.dict().items() if v is not None})
        return {"message": "Subject updated successfully"}

    async def delete_subject(self, subject_id: int):
        try:
            await self.repository.delete_subject(subject_id)
            return {"message": "Subject deleted successfully", "success": True}
        except ValueError as e:
            raise ValueError(str(e))

    async def delete_batch(self, batch_id: int):
        try:
            await self.repository.delete_batch(batch_id)
            return {"message": "Batch deleted successfully", "success": True}
        except ValueError as e:
            raise ValueError(str(e)) 