from app.repositories.lecturer_priority_repository import FacultyPriorityRepository
from app.schemas.lecturer_priority_schema import (
    FacultyPrioritySubmitRequest,
    FacultyPriorityUpdateRequest,
    FacultyPriorityResponse,
    FacultySubjectAllocationResponse,
    AllocationResultResponse
)
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class FacultyPriorityService:
    def __init__(self, repository: FacultyPriorityRepository):
        self.repository = repository

    async def submit_priorities(self, faculty_id: int, year_id: int, priorities: List[dict]):
        """Submit priorities for a faculty"""
        try:
            await self.repository.submit_priorities(faculty_id, year_id, priorities)
            return {"message": "Priorities submitted successfully"}
        except Exception as e:
            logger.error(f"Error submitting priorities: {str(e)}")
            raise

    async def update_priority(self, faculty_id: int, year_id: int, subject1_id: int, batch1_id: int, priority1: int, subject2_id: int, batch2_id: int, priority2: int):
        """Update priorities for a faculty"""
        try:
            await self.repository.update_priority(faculty_id, year_id, subject1_id, batch1_id, priority1, subject2_id, batch2_id, priority2)
            return {"message": "Priorities updated successfully"}
        except Exception as e:
            logger.error(f"Error updating priorities: {str(e)}")
            raise

    async def delete_priority(self, priority_id: int):
        """Delete a priority"""
        try:
            await self.repository.delete_priority(priority_id)
            return {"message": "Priority deleted successfully"}
        except Exception as e:
            logger.error(f"Error deleting priority: {str(e)}")
            raise

    async def get_priorities_by_faculty_and_year(self, faculty_id: int, year_id: int):
        priorities = await self.repository.get_priorities_by_faculty_and_year(faculty_id, year_id)
        if not priorities:
            raise ValueError(f"No priorities found for faculty {faculty_id} in year {year_id}")

        return priorities

    async def get_priority_by_faculty_year_subject_batch(self, faculty_id: int, year_id: int, subject_id: int, batch_id: int):
        priority = await self.repository.get_priority_by_faculty_year_subject_batch(faculty_id, year_id, subject_id, batch_id)
        if priority:
            return {
                "id": priority.id,
                "faculty_id": priority.faculty_id,
                "year_id": priority.year_id,
                "subject_id": priority.subject_id,
                "batch_id": priority.batch_id,
                "priority": priority.priority,
                "created_at": priority.created_at
            }
        return None

    async def get_all_priorities_by_year_with_details(self, year_id: int):
        """Get all priorities for a year with detailed information"""
        priorities = await self.repository.get_all_priorities_by_year_with_details(year_id)
        
        # Transform the data to match the expected response format
        transformed_priorities = []
        for faculty_data in priorities:
            transformed_faculty = {
                'faculty_id': faculty_data['faculty_id'],
                'faculty_name': faculty_data['faculty_name'],
                'faculty_email': faculty_data['faculty_email'],
                'year_id': faculty_data['year_id'],
                'academic_year': faculty_data['academic_year'],
                'priority_subjects': []
            }
            
            for priority_subject in faculty_data['priority_subjects']:
                transformed_faculty['priority_subjects'].append({
                    'id': priority_subject['id'],
                    'subject_id': priority_subject['subject_id'],
                    'subject_name': priority_subject['subject_name'],
                    'subject_code': priority_subject['subject_code'],
                    'subject_type': priority_subject['subject_type'],
                    'abbreviation': priority_subject['abbreviation'],
                    'batch_id': priority_subject['batch_id'],
                    'batch_section': priority_subject['batch_section'],
                    'batch_noOfStudent': priority_subject['batch_noOfStudent'],
                    'priority': priority_subject['priority'],
                    'created_at': priority_subject['created_at']
                })
            
            transformed_priorities.append(transformed_faculty)
        
        return {'priorities': transformed_priorities}

    async def allocate_subjects_for_year(self, year_id: int) -> AllocationResultResponse:
        """Automatically allocate subjects to faculty based on priorities and seniority"""
        try:
            # Clear existing allocations for this year
            await self.repository.clear_allocations_for_year(year_id)
            
            # Get all faculty with priorities, ordered by seniority (joining_year ascending)
            faculty = await self.repository.get_faculty_with_priorities_by_year(year_id)
            
            if not faculty:
                return AllocationResultResponse(
                    total_allocations=0,
                    allocations=[]
                )
            
            allocations = []
            allocated_subject_batches = set()  # Track allocated (subject_id, batch_id) combinations
            
            # First pass: Handle priority 1 conflicts
            # Group all priority 1 selections by subject-batch
            priority_1_selections: dict[tuple[int, int], list[dict]] = {}
            
            for faculty_member in faculty:
                faculty_id = faculty_member['user_id']
                priorities = await self.repository.get_priorities_by_faculty_year(faculty_id, year_id)
                
                for priority in priorities:
                    if priority['priority'] == 1:
                        subject_id = priority['subject_id']
                        batch_id = priority['batch_id']
                        key = (subject_id, batch_id)
                        
                        if key not in priority_1_selections:
                            priority_1_selections[key] = []
                        
                        priority_1_selections[key].append({
                            'faculty_id': faculty_id,
                            'joining_year': faculty_member['joining_year'],
                            'priority_id': priority['id']
                        })
            
            # Resolve priority 1 conflicts - senior faculty wins
            for (subject_id, batch_id), selections in priority_1_selections.items():
                if len(selections) > 1:
                    # Multiple faculty want this as priority 1 - senior wins
                    selections.sort(key=lambda x: x['joining_year'])  # Sort by joining_year (ascending = senior first)
                    winner = selections[0]
                    
                    # Allocate to the senior faculty
                    allocation = await self.repository.create_allocation(
                        faculty_id=winner['faculty_id'],
                        subject_id=subject_id,
                        batch_id=batch_id,
                        year_id=year_id,
                        allocated_priority=1
                    )
                    
                    allocated_subject_batches.add((subject_id, batch_id))
                    allocations.append(allocation)
                    print(f"Priority 1 conflict resolved: Subject {subject_id}, Batch {batch_id} allocated to senior faculty {winner['faculty_id']} (joining_year: {winner['joining_year']})")
                else:
                    # Only one faculty wants this as priority 1
                    selection = selections[0]
                    allocation = await self.repository.create_allocation(
                        faculty_id=selection['faculty_id'],
                        subject_id=subject_id,
                        batch_id=batch_id,
                        year_id=year_id,
                        allocated_priority=1
                    )
                    
                    allocated_subject_batches.add((subject_id, batch_id))
                    allocations.append(allocation)
                    print(f"Priority 1 allocation: Subject {subject_id}, Batch {batch_id} allocated to faculty {selection['faculty_id']}")
            
            # Second pass: Process remaining faculty for their next available priorities
            for faculty_member in faculty:
                faculty_id = faculty_member['user_id']
                
                # Get all priorities for this faculty, ordered by priority (1, 2, 3, 4, 5)
                priorities = await self.repository.get_priorities_by_faculty_year(faculty_id, year_id)
                
                # Check if this faculty already got an allocation
                faculty_allocated = any(allocation.faculty_id == faculty_id for allocation in allocations)
                
                if not faculty_allocated:
                    # Try to allocate the highest priority subject that's available
                    for priority in priorities:
                        subject_id = priority['subject_id']
                        batch_id = priority['batch_id']
                        priority_level = priority['priority']
                        
                        # Check if this subject-batch combination is already allocated
                        if (subject_id, batch_id) not in allocated_subject_batches:
                            # This subject-batch is available, allocate it to this faculty
                            allocation = await self.repository.create_allocation(
                                faculty_id=faculty_id,
                                subject_id=subject_id,
                                batch_id=batch_id,
                                year_id=year_id,
                                allocated_priority=priority_level
                            )
                            
                            allocated_subject_batches.add((subject_id, batch_id))
                            allocations.append(allocation)
                            print(f"Fallback allocation: Subject {subject_id}, Batch {batch_id} allocated to faculty {faculty_id} (Priority {priority_level})")
                            break
            
            # Get detailed allocation information
            allocation_details = await self.repository.get_allocations_by_year_with_details(year_id)
            
            return AllocationResultResponse(
                total_allocations=len(allocations),
                allocations=[
                    FacultySubjectAllocationResponse(**detail) 
                    for detail in allocation_details
                ]
            )
            
        except Exception as e:
            raise ValueError(f"Error during subject allocation: {str(e)}")

    async def get_priorities_by_faculty_year(self, faculty_id: int, year_id: int):
        """Get all priorities for a faculty in a year"""
        priorities = await self.repository.get_priorities_by_faculty_year(faculty_id, year_id)
        return priorities

    async def get_allocations_by_year_with_details(self, year_id: int):
        """Get all allocations for a year with detailed information"""
        allocations = await self.repository.get_allocations_by_year_with_details(year_id)
        return {'allocations': allocations}

    async def get_allocations_grouped_by_year_batch_subject(self, year_id: int):
        """Get allocations grouped by year, batches, and subjects with allocated faculty"""
        allocations = await self.repository.get_allocations_grouped_by_year_batch_subject(year_id)
        return {'allocations': allocations}

    async def update_allocation_faculty(self, allocation_id: int, faculty_id: int):
        """Update the faculty for a specific allocation"""
        try:
            updated_allocation = await self.repository.update_allocation_faculty(allocation_id, faculty_id)
            if updated_allocation:
                return {
                    "message": "Allocation updated successfully",
                    "allocation_id": updated_allocation.allocation_id,
                    "faculty_id": updated_allocation.faculty_id,
                    "subject_id": updated_allocation.subject_id,
                    "batch_id": updated_allocation.batch_id,
                    "year_id": updated_allocation.year_id,
                    "allocated_priority": updated_allocation.allocated_priority
                }
            else:
                raise ValueError("Allocation not found")
        except Exception as e:
            logger.error(f"Error updating allocation: {str(e)}")
            raise

    async def get_allocation_by_id(self, allocation_id: int):
        """Get allocation by ID"""
        allocation = await self.repository.get_allocation_by_id(allocation_id)
        if allocation:
            return {
                "allocation_id": allocation.allocation_id,
                "faculty_id": allocation.faculty_id,
                "subject_id": allocation.subject_id,
                "batch_id": allocation.batch_id,
                "year_id": allocation.year_id,
                "allocated_priority": allocation.allocated_priority,
                "created_at": allocation.created_at
            }
        return None 