import asyncio
import sys
import os
import re

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.model import LecturerSubjectPriority, Users, Subjects, Batches, AcademicYears, RoleEnum
from app.db.postgres_client import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
import random

async def seed_lecturer_subject_priorities():
    """Seed lecturer subject priorities data"""
    async for db in get_db():
        try:
            # Get lecturers (only LECTURER role)
            result = await db.execute(select(Users).where(Users.role == RoleEnum.LECTURER))
            lecturers = result.scalars().all()
            
            if len(lecturers) < 10:
                print("Need at least 10 lecturers. Please run seed_users.py first.")
                return
            
            # Get academic years
            result = await db.execute(select(AcademicYears))
            academic_years = result.scalars().all()
            
            if not academic_years:
                print("No academic years found. Please run seed_academic_years.py first.")
                return
            
            # Get subjects for each year
            result = await db.execute(select(Subjects))
            subjects = result.scalars().all()
            
            if not subjects:
                print("No subjects found. Please run seed_subjects.py first.")
                return
            
            # Get batches for each year
            result = await db.execute(select(Batches))
            batches = result.scalars().all()
            
            if not batches:
                print("No batches found. Please run seed_batches.py first.")
                return
            
            # Check if priorities already exist
            existing_priorities = await db.execute(select(LecturerSubjectPriority.lecturer_id, LecturerSubjectPriority.year_id))
            existing_priorities = existing_priorities.all()
            existing_lecturer_years = [(p[0], p[1]) for p in existing_priorities]
            
            priorities_data = []
            priority_id = 1
            
            for year in academic_years:
                # Get subjects and batches for this year
                year_subjects = [s for s in subjects if s.year_id == year.year_id]
                year_batches = [b for b in batches if b.year_id == year.year_id]
                
                if not year_subjects or not year_batches:
                    continue
                
                print(f"\nProcessing year: {year.academic_year}")
                print(f"  Subjects in this year: {len(year_subjects)}")
                print(f"  Batches in this year: {len(year_batches)}")
                
                # For each lecturer, assign 1-5 priority subjects per batch with balanced distribution
                # First, determine which lecturers will have priorities in each batch
                lecturers_per_batch = {}
                lecturers_in_single_batch = []
                cross_batch_lecturers = []
                
                # Step 1: Select exactly 2 lecturers for cross-batch assignment
                available_lecturers = [l for l in lecturers if l.user_id not in [x[0] for x in existing_lecturer_years]]
                if len(available_lecturers) >= 2:
                    cross_batch_lecturers = random.sample(available_lecturers, 2)
                    print(f"  Cross-batch lecturers selected: {[l.user_id for l in cross_batch_lecturers]}")
                    # Remove cross-batch lecturers from available pool
                    available_lecturers = [l for l in available_lecturers if l.user_id not in [lect.user_id for lect in cross_batch_lecturers]]
                else:
                    print(f"  Warning: Only {len(available_lecturers)} lecturers available, using all for cross-batch")
                    cross_batch_lecturers = available_lecturers
                    available_lecturers = []
                
                # Step 2: Assign cross-batch lecturers to both batches
                for batch in year_batches:
                    lecturers_per_batch[batch.batch_id] = cross_batch_lecturers.copy()
                    print(f"  Batch {batch.section}: {len(cross_batch_lecturers)} cross-batch lecturers assigned")
                
                # Step 3: Distribute remaining lecturers evenly across batches (single batch only)
                for i, lecturer in enumerate(available_lecturers):
                    batch_index = i % len(year_batches)
                    selected_batch = year_batches[batch_index]
                    lecturers_per_batch[selected_batch.batch_id].append(lecturer)
                    lecturers_in_single_batch.append(lecturer.user_id)
                    print(f"  Lecturer {lecturer.user_id} assigned to single batch {selected_batch.section}")
                
                # Now assign priorities for each batch
                for batch in year_batches:
                    batch_lecturers = lecturers_per_batch.get(batch.batch_id, [])
                    print(f"  Processing batch {batch.section} with {len(batch_lecturers)} lecturers")
                    
                    for lecturer in batch_lecturers:
                        # Check if this lecturer already has priorities for this year
                        if (lecturer.user_id, year.year_id) in existing_lecturer_years:
                            print(f"    Lecturer {lecturer.user_id} already has priorities for year {year.year_id}, skipping...")
                            continue
                        
                        # Determine if this lecturer should have multiple priorities or just one
                        if lecturer.user_id in lecturers_in_single_batch:
                            # Single batch lecturer: exactly 4 priorities
                            num_priorities = 4
                        else:
                            # Cross-batch lecturer: exactly 4 priorities per batch
                            num_priorities = 4
                        
                        print(f"    Lecturer {lecturer.user_id}: {num_priorities} priorities")
                        
                        # Get all subjects for this year
                        available_subjects = year_subjects.copy()
                        
                        # Ensure we have enough subjects for 4 priorities
                        if len(available_subjects) < num_priorities:
                            print(f"      Warning: Only {len(available_subjects)} subjects available, using all")
                            num_priorities = len(available_subjects)
                        
                        # Randomly select exactly 4 subjects for this batch
                        selected_subjects = random.sample(available_subjects, num_priorities)
                        
                        # Assign priorities 1, 2, 3, 4 for this batch
                        for priority_level, subject in enumerate(selected_subjects, 1):
                            priorities_data.append({
                                "id": priority_id,
                                "lecturer_id": lecturer.user_id,
                                "subject_id": subject.subject_id,
                                "batch_id": batch.batch_id,
                                "year_id": year.year_id,
                                "priority": priority_level
                            })
                            priority_id += 1
                            print(f"      Priority {priority_level}: {subject.subject_name}")
            
            # Remove duplicates (same lecturer-subject-batch-year combination)
            unique_priorities = {}
            for priority in priorities_data:
                key = (priority["lecturer_id"], priority["subject_id"], priority["batch_id"], priority["year_id"])
                if key not in unique_priorities:
                    unique_priorities[key] = priority
                else:
                    # Keep the higher priority (lower number)
                    if priority["priority"] < unique_priorities[key]["priority"]:
                        unique_priorities[key] = priority
            
            # Convert back to list and renumber IDs
            final_priorities = list(unique_priorities.values())
            for i, priority in enumerate(final_priorities, 1):
                priority["id"] = i
            
            # Add to database
            for priority_data in final_priorities:
                priority = LecturerSubjectPriority(**priority_data)
                db.add(priority)
                print(f"Added priority ID {priority_data['id']}: Lecturer {priority_data['lecturer_id']}, Subject {priority_data['subject_id']}, Batch {priority_data['batch_id']}, Priority {priority_data['priority']}")
            
            await db.commit()
            print(f"\nLecturer subject priorities seeding completed successfully!")
            print(f"Total priorities created: {len(final_priorities)}")
            
            # Print summary
            lecturer_counts = {}
            for priority in final_priorities:
                lecturer_id = priority["lecturer_id"]
                if lecturer_id not in lecturer_counts:
                    lecturer_counts[lecturer_id] = 0
                lecturer_counts[lecturer_id] += 1
            
            print(f"Lecturers with priorities: {len(lecturer_counts)}")
            print(f"Average priorities per lecturer: {len(final_priorities) / len(lecturer_counts):.1f}")
            
            # Print breakdown by year
            for year in academic_years:
                year_priorities = [p for p in final_priorities if p["year_id"] == year.year_id]
                print(f"Year {year.academic_year}: {len(year_priorities)} priorities")
            
            # Reset the sequence after seeding
            print("🔄 Resetting lecturer_subject_priorities sequence...")
            await db.execute(text("SELECT setval('lecturer_subject_priorities_id_seq', (SELECT MAX(id) FROM lecturer_subject_priorities));"))
            await db.commit()
            print("✅ Lecturer subject priorities sequence reset successfully!")
            
        except Exception as e:
            await db.rollback()
            print(f"Error seeding lecturer subject priorities: {e}")
            raise
        finally:
            await db.close()
        break

if __name__ == "__main__":
    asyncio.run(seed_lecturer_subject_priorities()) 