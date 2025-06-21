from app.repositories.lecturer_priority_repository import LecturerPriorityRepository
from app.schemas.lecturer_priority_schema import (
    LecturerPrioritySubmitRequest, LecturerPriorityUpdateRequest,
    LecturerPriorityResponse, LecturerPriorityWithDetailsResponse,
    LecturerPriorityListResponse, LecturerPriorityWithDetailsListResponse,
    LecturerPriorityDetailedResponse, LecturerPriorityDetailedListResponse,
    MessageResponse, ErrorResponse, LecturerSubjectAllocationResponse,
    LecturerSubjectAllocationListResponse, AllocationResultResponse,
    AllocationResponse, AllocationYearResponse
)
from typing import List, Optional, Union

class LecturerPriorityService:
    def __init__(self, repository: LecturerPriorityRepository):
        self.repository = repository

    async def submit_priorities(self, data: LecturerPrioritySubmitRequest):
        try:
            await self.repository.submit_priorities(data.lecturer_id, data.year_id, [p.dict() for p in data.priorities])
            return {"message": "Priorities submitted successfully", "success": True}
        except ValueError as e:
            raise ValueError(str(e))

    async def update_priority(self, lecturer_id: int, year_id: int, data: LecturerPriorityUpdateRequest):
        try:
            await self.repository.update_priority(
                lecturer_id, year_id, 
                data.subject1_id, data.batch1_id, data.priority1, 
                data.subject2_id, data.batch2_id, data.priority2
            )
            return {"message": "Priorities updated successfully", "success": True}
        except ValueError as e:
            raise ValueError(str(e))

    async def delete_priority(self, priority_id: int):
        try:
            await self.repository.delete_priority(priority_id)
            return {"message": "Priority deleted successfully", "success": True}
        except ValueError as e:
            raise ValueError(str(e))

    async def get_priorities_by_lecturer_and_year(self, lecturer_id: int, year_id: int):
        priorities = await self.repository.get_priorities_by_lecturer_and_year(lecturer_id, year_id)
        if not priorities:
            raise ValueError(f"No priorities found for lecturer {lecturer_id} in year {year_id}")
        return priorities

    async def get_priority_by_lecturer_year_subject_batch(self, lecturer_id: int, year_id: int, subject_id: int, batch_id: int):
        priority = await self.repository.get_priority_by_lecturer_year_subject_batch(lecturer_id, year_id, subject_id, batch_id)
        if not priority:
            return None
        return {
            "id": priority.id,
            "lecturer_id": priority.lecturer_id,
            "subject_id": priority.subject_id,
            "batch_id": priority.batch_id,
            "year_id": priority.year_id,
            "priority": priority.priority,
            "created_at": priority.created_at
        }

    async def get_all_priorities_by_year_with_details(self, year_id: int):
        priorities_data = await self.repository.get_all_priorities_by_year_with_details(year_id)
        
        # Flatten the grouped data into individual priority entries
        flattened_priorities = []
        for lecturer_data in priorities_data:
            for priority_subject in lecturer_data['priority_subjects']:
                flattened_priorities.append({
                    'id': priority_subject['id'],
                    'lecturer_id': lecturer_data['lecturer_id'],
                    'lecturer_name': lecturer_data['lecturer_name'],
                    'lecturer_email': lecturer_data['lecturer_email'],
                    'subject_id': priority_subject['subject_id'],
                    'subject_name': priority_subject['subject_name'],
                    'subject_code': priority_subject['subject_code'],
                    'subject_type': priority_subject['subject_type'],
                    'batch_id': priority_subject['batch_id'],
                    'batch_section': priority_subject['batch_section'],
                    'batch_noOfStudent': priority_subject['batch_noOfStudent'],
                    'year_id': lecturer_data['year_id'],
                    'academic_year': lecturer_data['academic_year'],
                    'priority': priority_subject['priority'],
                    'created_at': priority_subject['created_at']
                })
        
        return {"priorities": flattened_priorities}

    async def allocate_subjects_for_year(self, year_id: int) -> AllocationResultResponse:
        """Automatically allocate subjects to lecturers based on priorities and seniority"""
        try:
            # Clear existing allocations for this year
            await self.repository.clear_allocations_for_year(year_id)
            
            # Get all lecturers with priorities, ordered by seniority (joining_year ascending)
            lecturers = await self.repository.get_lecturers_with_priorities_by_year(year_id)
            
            if not lecturers:
                return AllocationResultResponse(
                    message="No lecturers have submitted priorities for this year",
                    success=True,
                    total_allocations=0,
                    allocations=[]
                )
            
            allocations = []
            allocated_subject_batches = set()  # Track allocated (subject_id, batch_id) combinations
            
            # First pass: Handle priority 1 conflicts
            # Group all priority 1 selections by subject-batch
            priority_1_selections: dict[tuple[int, int], list[dict]] = {}
            
            for lecturer in lecturers:
                lecturer_id = lecturer['user_id']
                priorities = await self.repository.get_priorities_by_lecturer_year(lecturer_id, year_id)
                
                for priority in priorities:
                    if priority['priority'] == 1:
                        subject_id = priority['subject_id']
                        batch_id = priority['batch_id']
                        key = (subject_id, batch_id)
                        
                        if key not in priority_1_selections:
                            priority_1_selections[key] = []
                        
                        priority_1_selections[key].append({
                            'lecturer_id': lecturer_id,
                            'joining_year': lecturer['joining_year'],
                            'priority_id': priority['id']
                        })
            
            # Resolve priority 1 conflicts - senior lecturer wins
            for (subject_id, batch_id), selections in priority_1_selections.items():
                if len(selections) > 1:
                    # Multiple lecturers want this as priority 1 - senior wins
                    selections.sort(key=lambda x: x['joining_year'])  # Sort by joining_year (ascending = senior first)
                    winner = selections[0]
                    
                    # Allocate to the senior lecturer
                    allocation = await self.repository.create_allocation(
                        lecturer_id=winner['lecturer_id'],
                        subject_id=subject_id,
                        batch_id=batch_id,
                        year_id=year_id,
                        allocated_priority=1
                    )
                    
                    allocated_subject_batches.add((subject_id, batch_id))
                    allocations.append(allocation)
                    print(f"Priority 1 conflict resolved: Subject {subject_id}, Batch {batch_id} allocated to senior lecturer {winner['lecturer_id']} (joining_year: {winner['joining_year']})")
                else:
                    # Only one lecturer wants this as priority 1
                    selection = selections[0]
                    allocation = await self.repository.create_allocation(
                        lecturer_id=selection['lecturer_id'],
                        subject_id=subject_id,
                        batch_id=batch_id,
                        year_id=year_id,
                        allocated_priority=1
                    )
                    
                    allocated_subject_batches.add((subject_id, batch_id))
                    allocations.append(allocation)
                    print(f"Priority 1 allocation: Subject {subject_id}, Batch {batch_id} allocated to lecturer {selection['lecturer_id']}")
            
            # Second pass: Process remaining lecturers for their next available priorities
            for lecturer in lecturers:
                lecturer_id = lecturer['user_id']
                
                # Get all priorities for this lecturer, ordered by priority (1, 2, 3, 4, 5)
                priorities = await self.repository.get_priorities_by_lecturer_year(lecturer_id, year_id)
                
                # Check if this lecturer already got an allocation
                lecturer_allocated = any(allocation.lecturer_id == lecturer_id for allocation in allocations)
                
                if not lecturer_allocated:
                    # Try to allocate the highest priority subject that's available
                    for priority in priorities:
                        subject_id = priority['subject_id']
                        batch_id = priority['batch_id']
                        priority_level = priority['priority']
                        
                        # Check if this subject-batch combination is already allocated
                        if (subject_id, batch_id) not in allocated_subject_batches:
                            # This subject-batch is available, allocate it to this lecturer
                            allocation = await self.repository.create_allocation(
                                lecturer_id=lecturer_id,
                                subject_id=subject_id,
                                batch_id=batch_id,
                                year_id=year_id,
                                allocated_priority=priority_level
                            )
                            
                            allocated_subject_batches.add((subject_id, batch_id))
                            allocations.append(allocation)
                            print(f"Fallback allocation: Subject {subject_id}, Batch {batch_id} allocated to lecturer {lecturer_id} (Priority {priority_level})")
                            break
            
            # Get detailed allocation information
            allocation_details = await self.repository.get_allocations_by_year_with_details(year_id)
            
            return AllocationResultResponse(
                message=f"Successfully allocated {len(allocations)} subjects to lecturers",
                success=True,
                total_allocations=len(allocations),
                allocations=[
                    LecturerSubjectAllocationResponse(**detail) 
                    for detail in allocation_details
                ]
            )
            
        except Exception as e:
            raise ValueError(f"Error during subject allocation: {str(e)}")

    async def get_allocations_by_year(self, year_id: int):
        allocations = await self.repository.get_allocations_by_year_with_details(year_id)
        return {"allocations": allocations}

    async def update_allocation_by_year_and_batch(self, year_id: int, batch_id: int, allocation_id: int, lecturer_id: int):
        """Update allocation by year_id and batch_id"""
        if not lecturer_id:
            raise ValueError("lecturer_id is required")
        
        # Verify the allocation exists and belongs to the specified year and batch
        allocation = await self.repository.get_allocation_by_id(allocation_id)
        if not allocation:
            raise ValueError(f"Allocation with ID {allocation_id} not found")
        
        if allocation.year_id != year_id or allocation.batch_id != batch_id:
            raise ValueError(f"Allocation {allocation_id} does not belong to year {year_id} and batch {batch_id}")
        
        # Update the allocation
        updated_allocation = await self.repository.update_allocation_lecturer(allocation_id, lecturer_id)
        
        return MessageResponse(message=f"Allocation {allocation_id} updated successfully with lecturer {lecturer_id}")

    async def get_allocated_ordered_by_seniority(self, year_id: int) -> AllocationResponse:
        """Get allocations grouped by year, batches, and subjects with allocated lecturers"""
        try:
            allocations_data = await self.repository.get_allocations_grouped_by_year_batch_subject(year_id)
            
            return AllocationResponse(
                allocations=[
                    AllocationYearResponse(**year_data) 
                    for year_data in allocations_data
                ]
            )
        except Exception as e:
            raise ValueError(f"Error retrieving ordered allocations: {str(e)}") 