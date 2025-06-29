import asyncio
import sys
import os
import re

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.model import FacultySubjectPriority, Users, Subjects, Batches, AcademicYears, RoleEnum
from app.db.postgres_client import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
import random

async def seed_faculty_subject_priorities():
    """Seed faculty subject priorities data"""
    async for db in get_db():
        try:
            # Get faculty (only FACULTY role)
            result = await db.execute(select(Users).where(Users.role == RoleEnum.FACULTY))
            faculty = result.scalars().all()
            
            if len(faculty) < 10:
                print("Need at least 10 faculty members. Please run seed_users.py first.")
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
            existing_priorities = await db.execute(select(FacultySubjectPriority.faculty_id, FacultySubjectPriority.year_id))
            existing_priorities = existing_priorities.fetchall()
            existing_faculty_years = [(p[0], p[1]) for p in existing_priorities]
            
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
                
                # For each faculty member, assign 1-5 priority subjects per batch with balanced distribution
                # First, determine which faculty will have priorities in each batch
                faculty_per_batch = {}
                faculty_in_single_batch = []
                cross_batch_faculty = []
                
                # Step 1: Select exactly 2 faculty for cross-batch assignment
                available_faculty = [f for f in faculty if f.user_id not in [x[0] for x in existing_faculty_years]]
                if len(available_faculty) >= 2:
                    cross_batch_faculty = random.sample(available_faculty, 2)
                    print(f"  Cross-batch faculty selected: {[f.user_id for f in cross_batch_faculty]}")
                    # Remove cross-batch faculty from available pool
                    available_faculty = [f for f in available_faculty if f.user_id not in [fac.user_id for fac in cross_batch_faculty]]
                else:
                    print(f"  Warning: Only {len(available_faculty)} faculty available, using all for cross-batch")
                    cross_batch_faculty = available_faculty
                    available_faculty = []
                
                # Step 2: Assign cross-batch faculty to both batches
                for batch in year_batches:
                    faculty_per_batch[batch.batch_id] = cross_batch_faculty.copy()
                    print(f"  Batch {batch.section}: {len(cross_batch_faculty)} cross-batch faculty assigned")
                
                # Step 3: Distribute remaining faculty evenly across batches (single batch only)
                for i, faculty_member in enumerate(available_faculty):
                    selected_batch = year_batches[i % len(year_batches)]
                    faculty_per_batch[selected_batch.batch_id].append(faculty_member)
                    faculty_in_single_batch.append(faculty_member.user_id)
                    print(f"  Faculty {faculty_member.user_id} assigned to single batch {selected_batch.section}")
                
                # Step 4: Create priorities for each batch
                for batch in year_batches:
                    batch_faculty = faculty_per_batch.get(batch.batch_id, [])
                    print(f"  Processing batch {batch.section} with {len(batch_faculty)} faculty")
                    
                    for faculty_member in batch_faculty:
                        # Check if this faculty already has priorities for this year
                        if (faculty_member.user_id, year.year_id) in existing_faculty_years:
                            print(f"    Faculty {faculty_member.user_id} already has priorities for year {year.year_id}, skipping...")
                            continue
                        
                        # Determine if this faculty should have multiple priorities or just one
                        if faculty_member.user_id in faculty_in_single_batch:
                            # Single batch faculty: exactly 4 priorities
                            num_priorities = 4
                        else:
                            # Cross-batch faculty: exactly 4 priorities per batch
                            num_priorities = 4
                        
                        print(f"    Faculty {faculty_member.user_id}: {num_priorities} priorities")
                        
                        # Select random subjects for this faculty
                        available_subjects = [s for s in year_subjects if s.year_id == year.year_id]
                        selected_subjects = random.sample(available_subjects, min(num_priorities, len(available_subjects)))
                        
                        # Create priority entries
                        for i, subject in enumerate(selected_subjects):
                            priorities_data.append({
                                "id": priority_id,
                                "faculty_id": faculty_member.user_id,
                                "subject_id": subject.subject_id,
                                "batch_id": batch.batch_id,
                                "year_id": year.year_id,
                                "priority": i + 1  # Priority 1-4
                            })
                            priority_id += 1
                            print(f"      Priority {i + 1}: {subject.subject_name}")
            
            # Remove duplicates (same faculty-subject-batch-year combination)
            unique_priorities = {}
            for priority in priorities_data:
                key = (priority["faculty_id"], priority["subject_id"], priority["batch_id"], priority["year_id"])
                if key not in unique_priorities:
                    unique_priorities[key] = priority
            
            final_priorities = list(unique_priorities.values())
            
            # Insert priorities into database
            for priority_data in final_priorities:
                priority = FacultySubjectPriority(**priority_data)
                db.add(priority)
                print(f"Added priority ID {priority_data['id']}: Faculty {priority_data['faculty_id']}, Subject {priority_data['subject_id']}, Batch {priority_data['batch_id']}, Priority {priority_data['priority']}")
            
            await db.commit()
            print("Faculty subject priorities seeding completed successfully!")
            print(f"Total priorities created: {len(final_priorities)}")
            
            # Print summary
            faculty_counts = {}
            for priority in final_priorities:
                faculty_id = priority["faculty_id"]
                if faculty_id not in faculty_counts:
                    faculty_counts[faculty_id] = 0
                faculty_counts[faculty_id] += 1
            
            print(f"Faculty members with priorities: {len(faculty_counts)}")
            print(f"Average priorities per faculty member: {len(final_priorities) / len(faculty_counts):.1f}")
            
            # Print breakdown by year
            for year in academic_years:
                year_priorities = [p for p in final_priorities if p["year_id"] == year.year_id]
                print(f"Year {year.academic_year}: {len(year_priorities)} priorities")
            
            # Reset the sequence after seeding
            print("🔄 Resetting faculty_subject_priorities sequence...")
            await db.execute(text("SELECT setval('faculty_subject_priorities_id_seq', (SELECT MAX(id) FROM faculty_subject_priorities));"))
            await db.commit()
            print("✅ Faculty subject priorities sequence reset successfully!")
            
        except Exception as e:
            await db.rollback()
            print(f"Error seeding faculty subject priorities: {e}")
            raise
        finally:
            await db.close()

if __name__ == "__main__":
    asyncio.run(seed_faculty_subject_priorities()) 