from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from sqlalchemy.exc import IntegrityError
from app.models.model import LecturerSubjectPriority, Users, Subjects, AcademicYears, Batches, LecturerSubjectAllocation
from typing import List, Optional

class LecturerPriorityRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def submit_priorities(self, lecturer_id: int, year_id: int, priorities: List[dict]):
        try:
            # Remove existing priorities for this lecturer/year
            await self.db.execute(
                delete(LecturerSubjectPriority).where(
                    LecturerSubjectPriority.lecturer_id == lecturer_id,
                    LecturerSubjectPriority.year_id == year_id
                )
            )
            # Add new priorities
            for entry in priorities:
                self.db.add(LecturerSubjectPriority(
                    lecturer_id=lecturer_id,
                    year_id=year_id,
                    subject_id=entry['subject_id'],
                    batch_id=entry['batch_id'],
                    priority=entry['priority']
                ))
            await self.db.commit()
        except IntegrityError as e:
            await self.db.rollback()
            raise ValueError(f"Error submitting priorities: {str(e)}")

    async def update_priority(self, lecturer_id: int, year_id: int, subject1_id: int, batch1_id: int, priority1: int, subject2_id: int, batch2_id: int, priority2: int):
        try:
            # Check if both priorities exist
            existing1 = await self.db.execute(
                select(LecturerSubjectPriority).where(
                    LecturerSubjectPriority.lecturer_id == lecturer_id,
                    LecturerSubjectPriority.year_id == year_id,
                    LecturerSubjectPriority.subject_id == subject1_id,
                    LecturerSubjectPriority.batch_id == batch1_id
                )
            )
            existing2 = await self.db.execute(
                select(LecturerSubjectPriority).where(
                    LecturerSubjectPriority.lecturer_id == lecturer_id,
                    LecturerSubjectPriority.year_id == year_id,
                    LecturerSubjectPriority.subject_id == subject2_id,
                    LecturerSubjectPriority.batch_id == batch2_id
                )
            )
            
            if not existing1.scalar_one_or_none():
                raise ValueError(f"Priority not found for lecturer {lecturer_id}, year {year_id}, subject {subject1_id}, batch {batch1_id}")
            if not existing2.scalar_one_or_none():
                raise ValueError(f"Priority not found for lecturer {lecturer_id}, year {year_id}, subject {subject2_id}, batch {batch2_id}")
            
            # Update both priorities
            await self.db.execute(
                update(LecturerSubjectPriority).where(
                    LecturerSubjectPriority.lecturer_id == lecturer_id,
                    LecturerSubjectPriority.year_id == year_id,
                    LecturerSubjectPriority.subject_id == subject1_id,
                    LecturerSubjectPriority.batch_id == batch1_id
                ).values(priority=priority1)
            )
            await self.db.execute(
                update(LecturerSubjectPriority).where(
                    LecturerSubjectPriority.lecturer_id == lecturer_id,
                    LecturerSubjectPriority.year_id == year_id,
                    LecturerSubjectPriority.subject_id == subject2_id,
                    LecturerSubjectPriority.batch_id == batch2_id
                ).values(priority=priority2)
            )
            await self.db.commit()
        except IntegrityError as e:
            await self.db.rollback()
            raise ValueError(f"Error updating priorities: {str(e)}")

    async def delete_priority(self, priority_id: int):
        try:
            # Check if priority exists
            existing = await self.db.execute(
                select(LecturerSubjectPriority).where(LecturerSubjectPriority.id == priority_id)
            )
            if not existing.scalar_one_or_none():
                raise ValueError(f"Priority with ID {priority_id} does not exist")
            
            await self.db.execute(
                delete(LecturerSubjectPriority).where(LecturerSubjectPriority.id == priority_id)
            )
            await self.db.commit()
        except IntegrityError as e:
            await self.db.rollback()
            raise ValueError(f"Error deleting priority: {str(e)}")

    async def get_priorities_by_lecturer_and_year(self, lecturer_id: int, year_id: int) -> Optional[dict]:
        result = await self.db.execute(
            select(
                LecturerSubjectPriority,
                Users.uname.label('lecturer_name'),
                Users.email.label('lecturer_email'),
                Users.role.label('lecturer_role'),
                Users.joining_year.label('lecturer_joining_year'),
                Subjects.subject_name,
                Subjects.subject_code,
                Subjects.subject_type,
                Batches.section.label('batch_section'),
                Batches.noOfStudent.label('batch_noOfStudent'),
                AcademicYears.academic_year
            ).join(
                Users, LecturerSubjectPriority.lecturer_id == Users.user_id
            ).join(
                Subjects, LecturerSubjectPriority.subject_id == Subjects.subject_id
            ).join(
                Batches, LecturerSubjectPriority.batch_id == Batches.batch_id
            ).join(
                AcademicYears, LecturerSubjectPriority.year_id == AcademicYears.year_id
            ).where(
                LecturerSubjectPriority.lecturer_id == lecturer_id,
                LecturerSubjectPriority.year_id == year_id
            ).order_by(LecturerSubjectPriority.priority)
        )
        rows = result.all()
        
        if not rows:
            return None
        
        # Get lecturer and year details from first row
        first_row = rows[0]
        lecturer_data = {
            'year_id': year_id,
            'year': first_row[10],  # academic_year
            'lecturer_id': lecturer_id,
            'uname': first_row[1],  # lecturer_name
            'role': first_row[3].value,  # lecturer_role
            'email': first_row[2],  # lecturer_email
            'joining_year': first_row[4],  # lecturer_joining_year
            'batches': {}
        }
        
        # Group by batch and subject
        for row in rows:
            priority = row[0]
            subject_name = row[5]
            subject_code = row[6]
            subject_type = row[7]
            batch_section = row[8]
            batch_noOfStudent = row[9]
            
            batch_id = priority.batch_id
            
            # Create batch entry if not exists
            if batch_id not in lecturer_data['batches']:
                lecturer_data['batches'][batch_id] = {
                    'batch_id': batch_id,
                    'section': batch_section,
                    'noOfStudent': batch_noOfStudent,
                    'subjects': []
                }
            
            # Add subject to batch
            lecturer_data['batches'][batch_id]['subjects'].append({
                'subject_id': priority.subject_id,
                'subject_name': subject_name,
                'subject_code': subject_code,
                'subject_type': subject_type.value,
                'priority': priority.priority
            })
        
        # Convert batches dict to list
        lecturer_data['batches'] = list(lecturer_data['batches'].values())
        
        return lecturer_data

    async def get_priority_by_lecturer_year_subject_batch(self, lecturer_id: int, year_id: int, subject_id: int, batch_id: int) -> Optional[LecturerSubjectPriority]:
        result = await self.db.execute(
            select(LecturerSubjectPriority).where(
                LecturerSubjectPriority.lecturer_id == lecturer_id,
                LecturerSubjectPriority.year_id == year_id,
                LecturerSubjectPriority.subject_id == subject_id,
                LecturerSubjectPriority.batch_id == batch_id
            )
        )
        return result.scalar_one_or_none()

    async def get_all_priorities_by_year_with_details(self, year_id: int) -> List[dict]:
        result = await self.db.execute(
            select(
                LecturerSubjectPriority,
                Users.uname.label('lecturer_name'),
                Users.email.label('lecturer_email'),
                Subjects.subject_name,
                Subjects.subject_code,
                Subjects.subject_type,
                Batches.section.label('batch_section'),
                Batches.noOfStudent.label('batch_noOfStudent'),
                AcademicYears.academic_year
            ).join(
                Users, LecturerSubjectPriority.lecturer_id == Users.user_id
            ).join(
                Subjects, LecturerSubjectPriority.subject_id == Subjects.subject_id
            ).join(
                Batches, LecturerSubjectPriority.batch_id == Batches.batch_id
            ).join(
                AcademicYears, LecturerSubjectPriority.year_id == AcademicYears.year_id
            ).where(
                LecturerSubjectPriority.year_id == year_id
            ).order_by(
                LecturerSubjectPriority.lecturer_id,
                LecturerSubjectPriority.priority
            )
        )
        rows = result.all()
        
        # Group by lecturer_id
        lecturer_priorities = {}
        for row in rows:
            lecturer_id = row[0].lecturer_id
            
            if lecturer_id not in lecturer_priorities:
                lecturer_priorities[lecturer_id] = {
                    'lecturer_id': lecturer_id,
                    'lecturer_name': row[1],
                    'lecturer_email': row[2],
                    'year_id': row[0].year_id,
                    'academic_year': row[8],
                    'priority_subjects': []
                }
            
            # Add priority subject to the lecturer's list
            lecturer_priorities[lecturer_id]['priority_subjects'].append({
                'id': row[0].id,
                'subject_id': row[0].subject_id,
                'subject_name': row[3],
                'subject_code': row[4],
                'subject_type': row[5].value,
                'batch_id': row[0].batch_id,
                'batch_section': row[6],
                'batch_noOfStudent': row[7],
                'priority': row[0].priority,
                'created_at': row[0].created_at
            })
        
        return list(lecturer_priorities.values())

    async def get_lecturers_with_priorities_by_year(self, year_id: int) -> List[dict]:
        """Get all lecturers who have submitted priorities for a year, ordered by joining_year (senior first)"""
        result = await self.db.execute(
            select(
                Users.user_id,
                Users.uname,
                Users.email,
                Users.joining_year
            ).join(
                LecturerSubjectPriority, Users.user_id == LecturerSubjectPriority.lecturer_id
            ).where(
                LecturerSubjectPriority.year_id == year_id
            ).distinct().order_by(Users.joining_year.asc())  # Senior lecturers first
        )
        rows = result.all()
        
        return [
            {
                'user_id': row[0],
                'uname': row[1],
                'email': row[2],
                'joining_year': row[3]
            }
            for row in rows
        ]

    async def get_priorities_by_lecturer_year(self, lecturer_id: int, year_id: int) -> List[dict]:
        """Get all priorities for a lecturer in a year, ordered by priority"""
        result = await self.db.execute(
            select(
                LecturerSubjectPriority.id,
                LecturerSubjectPriority.subject_id,
                LecturerSubjectPriority.batch_id,
                LecturerSubjectPriority.priority
            ).where(
                LecturerSubjectPriority.lecturer_id == lecturer_id,
                LecturerSubjectPriority.year_id == year_id
            ).order_by(LecturerSubjectPriority.priority)
        )
        rows = result.all()
        
        return [
            {
                'id': row[0],
                'subject_id': row[1],
                'batch_id': row[2],
                'priority': row[3]
            }
            for row in rows
        ]

    async def is_subject_batch_allocated(self, subject_id: int, batch_id: int, year_id: int) -> bool:
        """Check if a subject-batch combination is already allocated"""
        result = await self.db.execute(
            select(LecturerSubjectAllocation).where(
                LecturerSubjectAllocation.subject_id == subject_id,
                LecturerSubjectAllocation.batch_id == batch_id,
                LecturerSubjectAllocation.year_id == year_id
            )
        )
        return result.scalar_one_or_none() is not None

    async def create_allocation(self, lecturer_id: int, subject_id: int, batch_id: int, year_id: int, allocated_priority: int):
        """Create a new allocation"""
        allocation = LecturerSubjectAllocation(
            lecturer_id=lecturer_id,
            subject_id=subject_id,
            batch_id=batch_id,
            year_id=year_id,
            allocated_priority=allocated_priority
        )
        self.db.add(allocation)
        await self.db.commit()
        await self.db.refresh(allocation)
        return allocation

    async def get_allocations_by_year_with_details(self, year_id: int) -> List[dict]:
        """Get all allocations for a year with detailed information"""
        result = await self.db.execute(
            select(
                LecturerSubjectAllocation,
                Users.uname.label('lecturer_name'),
                Users.email.label('lecturer_email'),
                Subjects.subject_name,
                Subjects.subject_code,
                Subjects.subject_type,
                Batches.section.label('batch_section'),
                Batches.noOfStudent.label('batch_noOfStudent'),
                AcademicYears.academic_year
            ).join(
                Users, LecturerSubjectAllocation.lecturer_id == Users.user_id
            ).join(
                Subjects, LecturerSubjectAllocation.subject_id == Subjects.subject_id
            ).join(
                Batches, LecturerSubjectAllocation.batch_id == Batches.batch_id
            ).join(
                AcademicYears, LecturerSubjectAllocation.year_id == AcademicYears.year_id
            ).where(
                LecturerSubjectAllocation.year_id == year_id
            ).order_by(
                LecturerSubjectAllocation.lecturer_id
            )
        )
        rows = result.all()
        
        return [
            {
                'allocation_id': row[0].allocation_id,
                'lecturer_id': row[0].lecturer_id,
                'lecturer_name': row[1],
                'lecturer_email': row[2],
                'subject_id': row[0].subject_id,
                'subject_name': row[3],
                'subject_code': row[4],
                'subject_type': row[5].value,
                'batch_id': row[0].batch_id,
                'batch_section': row[6],
                'batch_noOfStudent': row[7],
                'year_id': row[0].year_id,
                'academic_year': row[8],
                'allocated_priority': row[0].allocated_priority,
                'created_at': row[0].created_at
            }
            for row in rows
        ]

    async def clear_allocations_for_year(self, year_id: int):
        """Clear all allocations for a specific year"""
        await self.db.execute(
            delete(LecturerSubjectAllocation).where(LecturerSubjectAllocation.year_id == year_id)
        )
        await self.db.commit()

    async def get_all_priorities_by_year_ordered(self, year_id: int) -> List[dict]:
        """Get all priorities for a year ordered by lecturer seniority and priority level"""
        result = await self.db.execute(
            select(
                LecturerSubjectPriority,
                Users.uname.label('lecturer_name'),
                Users.joining_year
            ).join(
                Users, LecturerSubjectPriority.lecturer_id == Users.user_id
            ).where(
                LecturerSubjectPriority.year_id == year_id
            ).order_by(
                Users.joining_year.asc(),  # Senior lecturers first
                LecturerSubjectPriority.priority.asc()  # Priority 1, 2, 3, 4, 5
            )
        )
        rows = result.all()
        
        return [
            {
                'lecturer_id': row[0].lecturer_id,
                'lecturer_name': row[1],
                'joining_year': row[2],
                'subject_id': row[0].subject_id,
                'batch_id': row[0].batch_id,
                'priority': row[0].priority
            }
            for row in rows
        ]

    async def get_allocations_grouped_by_year_batch_subject(self, year_id: int) -> List[dict]:
        """Get allocations grouped by year, batches, and subjects with allocated lecturers"""
        # First get all allocations with details
        result = await self.db.execute(
            select(
                LecturerSubjectAllocation,
                Users.uname.label('lecturer_name'),
                Users.email.label('lecturer_email'),
                Users.role.label('lecturer_role'),
                Users.joining_year.label('lecturer_joining_year'),
                Subjects.subject_name,
                Subjects.subject_code,
                Subjects.subject_type,
                Batches.section.label('batch_section'),
                Batches.noOfStudent.label('batch_noOfStudent'),
                AcademicYears.academic_year
            ).join(
                Users, LecturerSubjectAllocation.lecturer_id == Users.user_id
            ).join(
                Subjects, LecturerSubjectAllocation.subject_id == Subjects.subject_id
            ).join(
                Batches, LecturerSubjectAllocation.batch_id == Batches.batch_id
            ).join(
                AcademicYears, LecturerSubjectAllocation.year_id == AcademicYears.year_id
            ).where(
                LecturerSubjectAllocation.year_id == year_id
            ).order_by(
                Batches.batch_id,
                Subjects.subject_id
            )
        )
        rows = result.all()
        
        # Group by year, batch, and subject
        allocations_data = {}
        
        for row in rows:
            allocation = row[0]
            lecturer_name = row[1]
            lecturer_email = row[2]
            lecturer_role = row[3]
            lecturer_joining_year = row[4]
            subject_name = row[5]
            subject_code = row[6]
            subject_type = row[7]
            batch_section = row[8]
            batch_noOfStudent = row[9]
            academic_year = row[10]
            
            # Create year entry if not exists
            if year_id not in allocations_data:
                allocations_data[year_id] = {
                    'year_id': year_id,
                    'year': academic_year,
                    'batchs': {}
                }
            
            # Create batch entry if not exists
            if allocation.batch_id not in allocations_data[year_id]['batchs']:
                allocations_data[year_id]['batchs'][allocation.batch_id] = {
                    'batch_id': allocation.batch_id,
                    'section': batch_section,
                    'noOfStudent': batch_noOfStudent,
                    'subjects': {}
                }
            
            # Create subject entry if not exists
            if allocation.subject_id not in allocations_data[year_id]['batchs'][allocation.batch_id]['subjects']:
                allocations_data[year_id]['batchs'][allocation.batch_id]['subjects'][allocation.subject_id] = {
                    'subject_id': allocation.subject_id,
                    'subject_name': subject_name,
                    'subject_code': subject_code,
                    'subject_type': subject_type.value,
                    'allocated_lecturer': {
                        'lecturer_id': allocation.lecturer_id,
                        'uname': lecturer_name,
                        'role': lecturer_role.value,
                        'email': lecturer_email,
                        'joining_year': lecturer_joining_year
                    }
                }
        
        # Convert to list format but keep batchs and subjects as dictionaries
        final_result = []
        for year_data in allocations_data.values():
            year_entry = {
                'year_id': year_data['year_id'],
                'year': year_data['year'],
                'batchs': {}
            }
            
            # Convert batch_id keys to strings for JSON serialization
            for batch_id, batch_data in year_data['batchs'].items():
                batch_entry = {
                    'batch_id': batch_data['batch_id'],
                    'section': batch_data['section'],
                    'noOfStudent': batch_data['noOfStudent'],
                    'subjects': {}
                }
                
                # Convert subject_id keys to strings for JSON serialization
                for subject_id, subject_data in batch_data['subjects'].items():
                    batch_entry['subjects'][str(subject_id)] = subject_data
                
                year_entry['batchs'][str(batch_id)] = batch_entry
            
            final_result.append(year_entry)
        
        return final_result

    async def get_allocation_by_id(self, allocation_id: int) -> Optional[LecturerSubjectAllocation]:
        """Get allocation by ID"""
        result = await self.db.execute(
            select(LecturerSubjectAllocation).where(LecturerSubjectAllocation.allocation_id == allocation_id)
        )
        return result.scalar_one_or_none()

    async def update_allocation_lecturer(self, allocation_id: int, lecturer_id: int) -> Optional[LecturerSubjectAllocation]:
        """Update the lecturer for a specific allocation"""
        await self.db.execute(
            update(LecturerSubjectAllocation)
            .where(LecturerSubjectAllocation.allocation_id == allocation_id)
            .values(lecturer_id=lecturer_id)
        )
        await self.db.commit()
        
        # Return the updated allocation
        updated_allocation = await self.get_allocation_by_id(allocation_id)
        return updated_allocation 