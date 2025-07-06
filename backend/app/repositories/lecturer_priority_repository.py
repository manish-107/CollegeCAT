from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from sqlalchemy.exc import IntegrityError
from app.models.model import FacultySubjectPriority, Users, Subjects, AcademicYears, Batches, FacultySubjectAllocation
from typing import List, Optional

class FacultyPriorityRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def submit_priorities(self, faculty_id: int, year_id: int, priorities: List[dict]):
        try:
            # Remove existing priorities for this faculty/year
            await self.db.execute(
                delete(FacultySubjectPriority).where(
                    FacultySubjectPriority.faculty_id == faculty_id,
                    FacultySubjectPriority.year_id == year_id
                )
            )
            # Add new priorities
            for entry in priorities:
                self.db.add(FacultySubjectPriority(
                    faculty_id=faculty_id,
                    year_id=year_id,
                    subject_id=entry['subject_id'],
                    batch_id=entry['batch_id'],
                    priority=entry['priority']
                ))
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise ValueError(f"Error submitting priorities: {str(e)}")

    async def update_priority(self, faculty_id: int, year_id: int, subject1_id: int, batch1_id: int, priority1: int, subject2_id: int, batch2_id: int, priority2: int):
        try:
            # Check if both priorities exist
            existing1 = await self.db.execute(
                select(FacultySubjectPriority).where(
                    FacultySubjectPriority.faculty_id == faculty_id,
                    FacultySubjectPriority.year_id == year_id,
                    FacultySubjectPriority.subject_id == subject1_id,
                    FacultySubjectPriority.batch_id == batch1_id
                )
            )
            existing2 = await self.db.execute(
                select(FacultySubjectPriority).where(
                    FacultySubjectPriority.faculty_id == faculty_id,
                    FacultySubjectPriority.year_id == year_id,
                    FacultySubjectPriority.subject_id == subject2_id,
                    FacultySubjectPriority.batch_id == batch2_id
                )
            )
            
            if not existing1.scalar_one_or_none():
                raise ValueError(f"Priority not found for faculty {faculty_id}, year {year_id}, subject {subject1_id}, batch {batch1_id}")
            if not existing2.scalar_one_or_none():
                raise ValueError(f"Priority not found for faculty {faculty_id}, year {year_id}, subject {subject2_id}, batch {batch2_id}")
            
            # Update both priorities
            await self.db.execute(
                update(FacultySubjectPriority).where(
                    FacultySubjectPriority.faculty_id == faculty_id,
                    FacultySubjectPriority.year_id == year_id,
                    FacultySubjectPriority.subject_id == subject1_id,
                    FacultySubjectPriority.batch_id == batch1_id
                ).values(priority=priority1)
            )
            await self.db.execute(
                update(FacultySubjectPriority).where(
                    FacultySubjectPriority.faculty_id == faculty_id,
                    FacultySubjectPriority.year_id == year_id,
                    FacultySubjectPriority.subject_id == subject2_id,
                    FacultySubjectPriority.batch_id == batch2_id
                ).values(priority=priority2)
            )
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            raise ValueError(f"Error updating priorities: {str(e)}")

    async def delete_priority(self, priority_id: int):
        try:
            # Check if priority exists
            existing = await self.db.execute(
                select(FacultySubjectPriority).where(FacultySubjectPriority.id == priority_id)
            )
            if not existing.scalar_one_or_none():
                raise ValueError(f"Priority with ID {priority_id} does not exist")
            
            await self.db.execute(
                delete(FacultySubjectPriority).where(FacultySubjectPriority.id == priority_id)
            )
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise ValueError(f"Error deleting priority: {str(e)}")

    async def get_priorities_by_faculty_and_year(self, faculty_id: int, year_id: int) -> Optional[dict]:
        result = await self.db.execute(
            select(
                FacultySubjectPriority,
                Users.uname.label('faculty_name'),
                Users.email.label('faculty_email'),
                Users.role.label('faculty_role'),
                Users.joining_year.label('faculty_joining_year'),
                Subjects.subject_name,
                Subjects.subject_code,
                Subjects.subject_type,
                Subjects.abbreviation,
                Batches.section.label('batch_section'),
                Batches.noOfStudent.label('batch_noOfStudent'),
                AcademicYears.academic_year
            ).join(
                Users, FacultySubjectPriority.faculty_id == Users.user_id
            ).join(
                Subjects, FacultySubjectPriority.subject_id == Subjects.subject_id
            ).join(
                Batches, FacultySubjectPriority.batch_id == Batches.batch_id
            ).join(
                AcademicYears, FacultySubjectPriority.year_id == AcademicYears.year_id
            ).where(
                FacultySubjectPriority.faculty_id == faculty_id,
                FacultySubjectPriority.year_id == year_id
            ).order_by(FacultySubjectPriority.priority)
        )
        rows = result.all()
        
        if not rows:
            return None
        
        # Get faculty and year details from first row
        first_row = rows[0]
        faculty_data = {
            'year_id': year_id,
            'year': first_row[11],  # academic_year (index 11)
            'faculty_id': faculty_id,
            'uname': first_row[1],  # faculty_name
            'role': first_row[3].value,  # faculty_role
            'email': first_row[2],  # faculty_email
            'joining_year': first_row[4],  # faculty_joining_year
            'batches': {}
        }
        
        # Group by batch and subject
        for row in rows:
            priority = row[0]
            subject_name = row[5]
            subject_code = row[6]
            subject_type = row[7]
            abbreviation = row[8]
            batch_section = row[9]
            batch_noOfStudent = row[10]  # batch_noOfStudent (index 10)
            
            batch_id = priority.batch_id
            
            # Create batch entry if not exists
            if batch_id not in faculty_data['batches']:
                faculty_data['batches'][batch_id] = {
                    'batch_id': batch_id,
                    'section': batch_section,
                    'noOfStudent': batch_noOfStudent,
                    'subjects': []
                }
            
            # Add subject to batch
            faculty_data['batches'][batch_id]['subjects'].append({
                'subject_id': priority.subject_id,
                'subject_name': subject_name,
                'subject_code': subject_code,
                'subject_type': subject_type.value,
                'abbreviation': abbreviation,
                'priority': priority.priority
            })
        
        # Convert batches dict to list
        faculty_data['batches'] = list(faculty_data['batches'].values())
        
        return faculty_data

    async def get_priority_by_faculty_year_subject_batch(self, faculty_id: int, year_id: int, subject_id: int, batch_id: int) -> Optional[FacultySubjectPriority]:
        result = await self.db.execute(
            select(FacultySubjectPriority).where(
                FacultySubjectPriority.faculty_id == faculty_id,
                FacultySubjectPriority.year_id == year_id,
                FacultySubjectPriority.subject_id == subject_id,
                FacultySubjectPriority.batch_id == batch_id
            )
        )
        return result.scalar_one_or_none()

    async def get_all_priorities_by_year_with_details(self, year_id: int) -> List[dict]:
        result = await self.db.execute(
            select(
                FacultySubjectPriority,
                Users.uname.label('faculty_name'),
                Users.email.label('faculty_email'),
                Subjects.subject_name,
                Subjects.subject_code,
                Subjects.subject_type,
                Subjects.abbreviation,
                Batches.section.label('batch_section'),
                Batches.noOfStudent.label('batch_noOfStudent'),
                AcademicYears.academic_year
            ).join(
                Users, FacultySubjectPriority.faculty_id == Users.user_id
            ).join(
                Subjects, FacultySubjectPriority.subject_id == Subjects.subject_id
            ).join(
                Batches, FacultySubjectPriority.batch_id == Batches.batch_id
            ).join(
                AcademicYears, FacultySubjectPriority.year_id == AcademicYears.year_id
            ).where(
                FacultySubjectPriority.year_id == year_id
            ).order_by(
                FacultySubjectPriority.faculty_id,
                FacultySubjectPriority.priority
            )
        )
        rows = result.all()
        
        # Group by faculty_id
        faculty_priorities = {}
        for row in rows:
            faculty_id = row[0].faculty_id
            
            if faculty_id not in faculty_priorities:
                faculty_priorities[faculty_id] = {
                    'faculty_id': faculty_id,
                    'faculty_name': row[1],
                    'faculty_email': row[2],
                    'year_id': row[0].year_id,
                    'academic_year': row[9],
                    'priority_subjects': []
                }
            
            # Add priority subject to the faculty's list
            faculty_priorities[faculty_id]['priority_subjects'].append({
                'id': row[0].id,
                'subject_id': row[0].subject_id,
                'subject_name': row[3],
                'subject_code': row[4],
                'subject_type': row[5].value,
                'abbreviation': row[6],
                'batch_id': row[0].batch_id,
                'batch_section': row[7],
                'batch_noOfStudent': row[8],
                'priority': row[0].priority,
                'created_at': row[0].created_at
            })
        
        return list(faculty_priorities.values())

    async def get_faculty_with_priorities_by_year(self, year_id: int) -> List[dict]:
        """Get all faculty who have submitted priorities for a year, ordered by joining_year (senior first)"""
        result = await self.db.execute(
            select(
                Users.user_id,
                Users.uname,
                Users.email,
                Users.joining_year
            ).join(
                FacultySubjectPriority, Users.user_id == FacultySubjectPriority.faculty_id
            ).where(
                FacultySubjectPriority.year_id == year_id
            ).distinct().order_by(Users.joining_year.asc())  # Senior faculty first
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

    async def get_priorities_by_faculty_year(self, faculty_id: int, year_id: int) -> List[dict]:
        """Get all priorities for a faculty in a year, ordered by priority"""
        result = await self.db.execute(
            select(
                FacultySubjectPriority.id,
                FacultySubjectPriority.subject_id,
                FacultySubjectPriority.batch_id,
                FacultySubjectPriority.priority
            ).where(
                FacultySubjectPriority.faculty_id == faculty_id,
                FacultySubjectPriority.year_id == year_id
            ).order_by(FacultySubjectPriority.priority)
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
            select(FacultySubjectAllocation).where(
                FacultySubjectAllocation.subject_id == subject_id,
                FacultySubjectAllocation.batch_id == batch_id,
                FacultySubjectAllocation.year_id == year_id
            )
        )
        return result.scalar_one_or_none() is not None

    async def create_allocation(self, faculty_id: int, subject_id: int, batch_id: int, year_id: int, allocated_priority: int):
        """Create a new allocation"""
        allocation = FacultySubjectAllocation(
            faculty_id=faculty_id,
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
                FacultySubjectAllocation,
                Users.uname.label('faculty_name'),
                Users.email.label('faculty_email'),
                Subjects.subject_name,
                Subjects.subject_code,
                Subjects.subject_type,
                Subjects.abbreviation,
                Batches.section.label('batch_section'),
                Batches.noOfStudent.label('batch_noOfStudent'),
                AcademicYears.academic_year
            ).join(
                Users, FacultySubjectAllocation.faculty_id == Users.user_id
            ).join(
                Subjects, FacultySubjectAllocation.subject_id == Subjects.subject_id
            ).join(
                Batches, FacultySubjectAllocation.batch_id == Batches.batch_id
            ).join(
                AcademicYears, FacultySubjectAllocation.year_id == AcademicYears.year_id
            ).where(
                FacultySubjectAllocation.year_id == year_id
            ).order_by(
                FacultySubjectAllocation.faculty_id
            )
        )
        rows = result.all()
        
        return [
            {
                'allocation_id': row[0].allocation_id,
                'faculty_id': row[0].faculty_id,
                'faculty_name': row[1],
                'faculty_email': row[2],
                'subject_id': row[0].subject_id,
                'subject_name': row[3],
                'subject_code': row[4],
                'subject_type': row[5].value,
                'abbreviation': row[6],
                'batch_id': row[0].batch_id,
                'batch_section': row[7],
                'batch_noOfStudent': row[8],
                'year_id': row[0].year_id,
                'academic_year': row[9],
                'allocated_priority': row[0].allocated_priority,
                'created_at': row[0].created_at,
                'co_faculty_id': getattr(row[0], 'co_faculty_id', None),
                'venue': getattr(row[0], 'venue', None)
            }
            for row in rows
        ]

    async def clear_allocations_for_year(self, year_id: int):
        """Clear all allocations for a specific year"""
        await self.db.execute(
            delete(FacultySubjectAllocation).where(FacultySubjectAllocation.year_id == year_id)
        )
        await self.db.commit()

    async def get_priorities_by_year_ordered(self, year_id: int) -> List[dict]:
        """Get all priorities for a year ordered by faculty seniority and priority level"""
        result = await self.db.execute(
            select(
                FacultySubjectPriority,
                Users.uname.label('faculty_name'),
                Users.joining_year
            ).join(
                Users, FacultySubjectPriority.faculty_id == Users.user_id
            ).where(
                FacultySubjectPriority.year_id == year_id
            ).order_by(
                Users.joining_year.asc(),  # Senior faculty first
                FacultySubjectPriority.priority.asc()  # Priority 1, 2, 3, 4, 5
            )
        )
        rows = result.all()
        
        return [
            {
                'faculty_id': row[0].faculty_id,
                'faculty_name': row[1],
                'joining_year': row[2],
                'subject_id': row[0].subject_id,
                'batch_id': row[0].batch_id,
                'priority': row[0].priority
            }
            for row in rows
        ]

    async def get_allocations_grouped_by_year_batch_subject(self, year_id: int) -> List[dict]:
        """Get allocations grouped by year, batches, and subjects with allocated faculty"""
        result = await self.db.execute(
            select(
                FacultySubjectAllocation,
                Users.uname.label('faculty_name'),
                Users.email.label('faculty_email'),
                Users.role.label('faculty_role'),
                Users.joining_year.label('faculty_joining_year'),
                Subjects.subject_name,
                Subjects.subject_code,
                Subjects.subject_type,
                Subjects.abbreviation,
                Batches.section.label('batch_section'),
                Batches.noOfStudent.label('batch_noOfStudent'),
                AcademicYears.academic_year
            ).join(
                Users, FacultySubjectAllocation.faculty_id == Users.user_id
            ).join(
                Subjects, FacultySubjectAllocation.subject_id == Subjects.subject_id
            ).join(
                Batches, FacultySubjectAllocation.batch_id == Batches.batch_id
            ).join(
                AcademicYears, FacultySubjectAllocation.year_id == AcademicYears.year_id
            ).where(
                FacultySubjectAllocation.year_id == year_id
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
            faculty_name = row[1]
            faculty_email = row[2]
            faculty_role = row[3]
            faculty_joining_year = row[4]
            subject_name = row[5]
            subject_code = row[6]
            subject_type = row[7]
            abbreviation = row[8]
            batch_section = row[9]
            batch_noOfStudent = row[10]
            academic_year = row[11]

            # Fetch co-faculty details if co_faculty_id is present
            co_faculty_obj = None
            co_faculty_id = getattr(allocation, 'co_faculty_id', None)
            if co_faculty_id:
                co_faculty_result = await self.db.execute(
                    select(Users).where(Users.user_id == co_faculty_id)
                )
                co_faculty = co_faculty_result.scalar_one_or_none()
                if co_faculty:
                    co_faculty_obj = {
                        'faculty_id': co_faculty.user_id,
                        'uname': co_faculty.uname,
                        'role': co_faculty.role.value if hasattr(co_faculty.role, 'value') else co_faculty.role,
                        'email': co_faculty.email,
                        'joining_year': co_faculty.joining_year
                    }

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
                    'abbreviation': abbreviation,
                    'allocated_faculty': {
                        'faculty_id': allocation.faculty_id,
                        'uname': faculty_name,
                        'role': faculty_role.value,
                        'email': faculty_email,
                        'joining_year': faculty_joining_year
                    },
                    'co_faculty': co_faculty_obj,
                    'venue': getattr(allocation, 'venue', None)
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

    async def get_allocation_by_id(self, allocation_id: int) -> Optional[FacultySubjectAllocation]:
        """Get allocation by ID"""
        result = await self.db.execute(
            select(FacultySubjectAllocation).where(FacultySubjectAllocation.allocation_id == allocation_id)
        )
        return result.scalar_one_or_none()

    async def update_allocation_faculty(self, allocation_id: int, faculty_id: int, co_faculty_id: Optional[int] = None, venue: Optional[str] = None) -> Optional[FacultySubjectAllocation]:
        """Update the faculty, co_faculty_id, and venue for a specific allocation if provided"""
        update_values = {"faculty_id": faculty_id}
        if co_faculty_id is not None:
            update_values["co_faculty_id"] = co_faculty_id
        if venue is not None:
            update_values["venue"] = str(venue) # type: ignore
        await self.db.execute(
            update(FacultySubjectAllocation)
            .where(FacultySubjectAllocation.allocation_id == allocation_id)
            .values(**update_values)
        )
        await self.db.commit()
        # Return the updated allocation
        return await self.get_allocation_by_id(allocation_id) 