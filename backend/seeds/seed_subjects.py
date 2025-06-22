import asyncio
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.model import Subjects, AcademicYears, SubjectTypeEnum
from app.db.postgres_client import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

async def seed_subjects():
    """Seed subjects data"""
    async for db in get_db():
        try:
            # Get academic years
            result = await db.execute(select(AcademicYears))
            academic_years = result.scalars().all()
            
            if not academic_years:
                print("No academic years found. Please run seed_academic_years.py first.")
                return
            
            # Check if subjects already exist
            existing_subjects = await db.execute(select(Subjects.subject_code))
            existing_subjects = existing_subjects.scalars().all()
            
            subjects_data = [
                # Year 2024-2025 (ID: 1) - 4 Core Subjects
                {
                    "subject_id": 1,
                    "year_id": 1,
                    "subject_name": "Data Structures and Algorithms",
                    "subject_code": "DSA2024",
                    "subject_type": SubjectTypeEnum.CORE,
                    "no_of_hours_required": 4
                },
                {
                    "subject_id": 2,
                    "year_id": 1,
                    "subject_name": "Database Management Systems",
                    "subject_code": "DBMS2024",
                    "subject_type": SubjectTypeEnum.CORE,
                    "no_of_hours_required": 3
                },
                {
                    "subject_id": 3,
                    "year_id": 1,
                    "subject_name": "Computer Networks",
                    "subject_code": "CN2024",
                    "subject_type": SubjectTypeEnum.CORE,
                    "no_of_hours_required": 3
                },
                {
                    "subject_id": 4,
                    "year_id": 1,
                    "subject_name": "Operating Systems",
                    "subject_code": "OS2024",
                    "subject_type": SubjectTypeEnum.CORE,
                    "no_of_hours_required": 3
                },
                # Year 2024-2025 (ID: 1) - 2 Elective Subjects
                {
                    "subject_id": 5,
                    "year_id": 1,
                    "subject_name": "Machine Learning",
                    "subject_code": "ML2024",
                    "subject_type": SubjectTypeEnum.ELECTIVE,
                    "no_of_hours_required": 3
                },
                {
                    "subject_id": 6,
                    "year_id": 1,
                    "subject_name": "Web Development",
                    "subject_code": "WD2024",
                    "subject_type": SubjectTypeEnum.ELECTIVE,
                    "no_of_hours_required": 3
                },
                # Year 2024-2025 (ID: 1) - 2 Lab Subjects
                {
                    "subject_id": 7,
                    "year_id": 1,
                    "subject_name": "Programming Lab",
                    "subject_code": "PL2024",
                    "subject_type": SubjectTypeEnum.LAB,
                    "no_of_hours_required": 2
                },
                {
                    "subject_id": 8,
                    "year_id": 1,
                    "subject_name": "Database Lab",
                    "subject_code": "DL2024",
                    "subject_type": SubjectTypeEnum.LAB,
                    "no_of_hours_required": 2
                },
                # Year 2025-2026 (ID: 2) - 4 Core Subjects
                {
                    "subject_id": 9,
                    "year_id": 2,
                    "subject_name": "Data Structures and Algorithms",
                    "subject_code": "DSA2025",
                    "subject_type": SubjectTypeEnum.CORE,
                    "no_of_hours_required": 4
                },
                {
                    "subject_id": 10,
                    "year_id": 2,
                    "subject_name": "Database Management Systems",
                    "subject_code": "DBMS2025",
                    "subject_type": SubjectTypeEnum.CORE,
                    "no_of_hours_required": 3
                },
                {
                    "subject_id": 11,
                    "year_id": 2,
                    "subject_name": "Computer Networks",
                    "subject_code": "CN2025",
                    "subject_type": SubjectTypeEnum.CORE,
                    "no_of_hours_required": 3
                },
                {
                    "subject_id": 12,
                    "year_id": 2,
                    "subject_name": "Operating Systems",
                    "subject_code": "OS2025",
                    "subject_type": SubjectTypeEnum.CORE,
                    "no_of_hours_required": 3
                },
                # Year 2025-2026 (ID: 2) - 2 Elective Subjects
                {
                    "subject_id": 13,
                    "year_id": 2,
                    "subject_name": "Machine Learning",
                    "subject_code": "ML2025",
                    "subject_type": SubjectTypeEnum.ELECTIVE,
                    "no_of_hours_required": 3
                },
                {
                    "subject_id": 14,
                    "year_id": 2,
                    "subject_name": "Web Development",
                    "subject_code": "WD2025",
                    "subject_type": SubjectTypeEnum.ELECTIVE,
                    "no_of_hours_required": 3
                },
                # Year 2025-2026 (ID: 2) - 2 Lab Subjects
                {
                    "subject_id": 15,
                    "year_id": 2,
                    "subject_name": "Programming Lab",
                    "subject_code": "PL2025",
                    "subject_type": SubjectTypeEnum.LAB,
                    "no_of_hours_required": 2
                },
                {
                    "subject_id": 16,
                    "year_id": 2,
                    "subject_name": "Database Lab",
                    "subject_code": "DL2025",
                    "subject_type": SubjectTypeEnum.LAB,
                    "no_of_hours_required": 2
                }
            ]
            
            for subject_data in subjects_data:
                if subject_data["subject_code"] not in existing_subjects:
                    subject = Subjects(**subject_data)
                    db.add(subject)
                    print(f"Added subject: {subject_data['subject_name']} ({subject_data['subject_code']}) (ID: {subject_data['subject_id']})")
                else:
                    print(f"Subject {subject_data['subject_code']} already exists")
            
            await db.commit()
            print("Subjects seeding completed successfully!")
            print(f"Total subjects created: {len(subjects_data)}")
            print("Year 2024-2025: 4 Core + 2 Elective + 2 Lab = 8 subjects")
            print("Year 2025-2026: 4 Core + 2 Elective + 2 Lab = 8 subjects")
            
            # Reset the sequence after seeding
            print("🔄 Resetting subjects sequence...")
            await db.execute(text("SELECT setval('subjects_subject_id_seq', (SELECT MAX(subject_id) FROM subjects));"))
            await db.commit()
            print("✅ Subjects sequence reset successfully!")
            
        except Exception as e:
            await db.rollback()
            print(f"Error seeding subjects: {e}")
            raise
        finally:
            await db.close()
        break

if __name__ == "__main__":
    asyncio.run(seed_subjects()) 