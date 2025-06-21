from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.exc import IntegrityError
from app.models.model import AcademicYears, Batches, Subjects
from typing import List, Optional
from datetime import datetime

class YearBatchRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_year_with_batch(self, year: int, batch_data: dict) -> int:
        try:
            academic_year = AcademicYears(academic_year=str(year))
            self.db.add(academic_year)
            await self.db.flush()
            batch = Batches(section=batch_data['section'], noOfStudent=batch_data['noOfStudent'], year_id=academic_year.year_id)
            self.db.add(batch)
            await self.db.commit()
            return academic_year.year_id
        except IntegrityError as e:
            await self.db.rollback()
            if "uq_year_section" in str(e):
                raise ValueError(f"Batch section '{batch_data['section']}' already exists for this academic year")
            raise e

    async def get_years_with_batches(self) -> List[dict]:
        result = await self.db.execute(select(AcademicYears))
        years = result.scalars().all()
        items = []
        for year in years:
            batches = await self.db.execute(select(Batches).where(Batches.year_id == year.year_id))
            batch_list = batches.scalars().all()
            items.append({
                'year_id': year.year_id,
                'academic_year': year.academic_year,
                'batches': batch_list
            })
        return items

    async def get_batches_by_year(self, year_id: int) -> List[Batches]:
        result = await self.db.execute(select(Batches).where(Batches.year_id == year_id))
        return list(result.scalars().all())

    async def update_year_and_batches(self, year_id: int, academic_year: Optional[str], batch_updates: List[dict]) -> None:
        try:
            # Only update academic_year if provided
            if academic_year is not None:
                await self.db.execute(update(AcademicYears).where(AcademicYears.year_id == year_id).values(academic_year=academic_year))
            
            for batch in batch_updates:
                # Check for both 'id' and 'batch_id' fields
                batch_id = batch.get('id') or batch.get('batch_id')
                
                if batch_id:
                    # Check if batch exists before updating
                    existing_batch = await self.db.execute(select(Batches).where(Batches.batch_id == batch_id, Batches.year_id == year_id))
                    if not existing_batch.scalar_one_or_none():
                        raise ValueError(f"Batch with ID {batch_id} does not exist for year {year_id}")
                    
                    # Update existing batch
                    await self.db.execute(
                        update(Batches)
                        .where(Batches.batch_id == batch_id)
                        .values(section=batch['section'], noOfStudent=batch['noOfStudent'])
                    )
                else:
                    # Create new batch
                    new_batch = Batches(section=batch['section'], noOfStudent=batch['noOfStudent'], year_id=year_id)
                    self.db.add(new_batch)
            
            await self.db.commit()
        except IntegrityError as e:
            await self.db.rollback()
            if "uq_year_section" in str(e):
                raise ValueError(f"Batch section '{batch.get('section', 'unknown')}' already exists for this academic year")
            raise e

    async def delete_year(self, year_id: int) -> None:
        # Check if year exists before deleting
        existing_year = await self.db.execute(select(AcademicYears).where(AcademicYears.year_id == year_id))
        if not existing_year.scalar_one_or_none():
            raise ValueError(f"Academic year with ID {year_id} does not exist")
        
        await self.db.execute(delete(AcademicYears).where(AcademicYears.year_id == year_id))
        await self.db.commit()

    async def create_batch_for_year(self, year_id: int, section: str, noOfStudent: int) -> int:
        try:
            batch = Batches(section=section, noOfStudent=noOfStudent, year_id=year_id)
            self.db.add(batch)
            await self.db.commit()
            await self.db.refresh(batch)
            return batch.batch_id
        except IntegrityError as e:
            await self.db.rollback()
            if "uq_year_section" in str(e):
                raise ValueError(f"Batch section '{section}' already exists for this academic year")
            raise e

    async def create_subject(self, subject_data: dict) -> int:
        subject = Subjects(**subject_data)
        self.db.add(subject)
        await self.db.commit()
        await self.db.refresh(subject)
        return subject.subject_id

    async def get_subjects_by_year(self, year_id: int) -> List[Subjects]:
        result = await self.db.execute(select(Subjects).where(Subjects.year_id == year_id))
        return list(result.scalars().all())

    async def get_subject_by_id(self, subject_id: int) -> Optional[Subjects]:
        result = await self.db.execute(select(Subjects).where(Subjects.subject_id == subject_id))
        return result.scalar_one_or_none()

    async def update_subject(self, subject_id: int, update_data: dict) -> None:
        await self.db.execute(update(Subjects).where(Subjects.subject_id == subject_id).values(**update_data))
        await self.db.commit()

    async def delete_subject(self, subject_id: int) -> None:
        # Check if subject exists before deleting
        existing_subject = await self.db.execute(select(Subjects).where(Subjects.subject_id == subject_id))
        if not existing_subject.scalar_one_or_none():
            raise ValueError(f"Subject with ID {subject_id} does not exist")
        
        await self.db.execute(delete(Subjects).where(Subjects.subject_id == subject_id))
        await self.db.commit()

    async def delete_batch(self, batch_id: int) -> None:
        # Check if batch exists before deleting
        existing_batch = await self.db.execute(select(Batches).where(Batches.batch_id == batch_id))
        if not existing_batch.scalar_one_or_none():
            raise ValueError(f"Batch with ID {batch_id} does not exist")
        
        await self.db.execute(delete(Batches).where(Batches.batch_id == batch_id))
        await self.db.commit() 