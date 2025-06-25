import asyncio
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.model import (
    LecturerSubjectAllocation, LecturerSubjectPriority, LecturerPreferences,
    LecturerSubAssignments, TimetableHourFormats, Timetable, Approvals,
    Users, Subjects, Batches, AcademicYears, WorkflowStage
)
from app.db.postgres_client import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete

async def cleanup_database():
    """Clean up all seeded data from the database"""
    async for db in get_db():
        try:
            print("🧹 Starting database cleanup...")
            print("=" * 50)
            
            # Clean up in reverse order of dependencies (respect foreign key constraints)
            
            # 1. Clean up allocations (depends on priorities, users, subjects, batches, years)
            print("🗑️ Cleaning up Lecturer Subject Allocations...")
            result = await db.execute(delete(LecturerSubjectAllocation))
            print(f"   Deleted {result.rowcount} allocations")
            
            # 2. Clean up lecturer subject priorities (depends on users, subjects, batches, years)
            print("🗑️ Cleaning up Lecturer Subject Priorities...")
            result = await db.execute(delete(LecturerSubjectPriority))
            print(f"   Deleted {result.rowcount} priorities")
            
            # 3. Clean up approvals (depends on timetables, users)
            print("🗑️ Cleaning up Approvals...")
            result = await db.execute(delete(Approvals))
            print(f"   Deleted {result.rowcount} approvals")
            
            # 4. Clean up timetables (depends on batches, subjects, formats)
            print("🗑️ Cleaning up Timetables...")
            result = await db.execute(delete(Timetable))
            print(f"   Deleted {result.rowcount} timetables")
            
            # 5. Clean up timetable hour formats (depends on batches)
            print("🗑️ Cleaning up Timetable Hour Formats...")
            result = await db.execute(delete(TimetableHourFormats))
            print(f"   Deleted {result.rowcount} timetable formats")
            
            # 6. Clean up lecturer sub assignments (depends on users, subjects, batches, years)
            print("🗑️ Cleaning up Lecturer Sub Assignments...")
            result = await db.execute(delete(LecturerSubAssignments))
            print(f"   Deleted {result.rowcount} assignments")
            
            # 7. Clean up lecturer preferences (depends on users, subjects, years)
            print("🗑️ Cleaning up Lecturer Preferences...")
            result = await db.execute(delete(LecturerPreferences))
            print(f"   Deleted {result.rowcount} preferences")
            
            # 8. Clean up users (but keep system users if any)
            print("🗑️ Cleaning up Users...")
            result = await db.execute(delete(Users))
            print(f"   Deleted {result.rowcount} users")
            
            # 9. Clean up subjects (depends on years)
            print("🗑️ Cleaning up Subjects...")
            result = await db.execute(delete(Subjects))
            print(f"   Deleted {result.rowcount} subjects")
            
            # 10. Clean up batches (depends on years)
            print("🗑️ Cleaning up Batches...")
            result = await db.execute(delete(Batches))
            print(f"   Deleted {result.rowcount} batches")
            
            # 11. Clean up workflow stages (depends on years)
            print("🗑️ Cleaning up Workflow Stages...")
            result = await db.execute(delete(WorkflowStage))
            print(f"   Deleted {result.rowcount} workflow stages")
            
            # 12. Clean up academic years
            print("🗑️ Cleaning up Academic Years...")
            result = await db.execute(delete(AcademicYears))
            print(f"   Deleted {result.rowcount} academic years")
            
            await db.commit()
            print("=" * 50)
            print("✅ Database cleanup completed successfully!")
            print("📊 All seeded data has been removed.")
            print("💡 You can now run the seeds again with: python run_all_seeds.py")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error during cleanup: {e}")
            raise
        finally:
            await db.close()
        break

async def cleanup_specific_tables():
    """Clean up specific tables only"""
    async for db in get_db():
        try:
            print("🧹 Starting selective database cleanup...")
            print("=" * 50)
            
            # Clean up only the main seeded tables
            tables_to_clean = [
                ("Lecturer Subject Allocations", LecturerSubjectAllocation),
                ("Lecturer Subject Priorities", LecturerSubjectPriority),
                ("Users", Users),
                ("Subjects", Subjects),
                ("Batches", Batches),
                ("Academic Years", AcademicYears),
            ]
            
            for table_name, table_model in tables_to_clean:
                print(f"🗑️ Cleaning up {table_name}...")
                result = await db.execute(delete(table_model))
                print(f"   Deleted {result.rowcount} records")
            
            await db.commit()
            print("=" * 50)
            print("✅ Selective cleanup completed successfully!")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error during selective cleanup: {e}")
            raise
        finally:
            await db.close()
        break

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--selective":
        print("Running selective cleanup (main tables only)...")
        asyncio.run(cleanup_specific_tables())
    else:
        print("Running full cleanup (all tables)...")
        asyncio.run(cleanup_database()) 