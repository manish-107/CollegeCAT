import asyncio
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from seeds.seed_academic_years import seed_academic_years
from seeds.seed_batches import seed_batches
from seeds.seed_subjects import seed_subjects
from seeds.seed_users import seed_users
from seeds.seed_lecturer_subject_priorities import seed_lecturer_subject_priorities
from seeds.sequence_utils import reset_all_sequences

async def run_all_seeds():
    """Run all seed files in the correct order"""
    print("🌱 Starting database seeding process...")
    print("=" * 50)
    
    try:
        # 1. Seed Academic Years
        print("📅 Seeding Academic Years...")
        await seed_academic_years()
        print("✅ Academic Years seeded successfully!")
        print()
        
        # 2. Seed Batches
        print("👥 Seeding Batches...")
        await seed_batches()
        print("✅ Batches seeded successfully!")
        print()
        
        # 3. Seed Subjects
        print("📚 Seeding Subjects...")
        await seed_subjects()
        print("✅ Subjects seeded successfully!")
        print()
        
        # 4. Seed Users
        print("👤 Seeding Users...")
        await seed_users()
        print("✅ Users seeded successfully!")
        print()
        
        # 5. Seed Lecturer Subject Priorities
        print("🎯 Seeding Lecturer Subject Priorities...")
        await seed_lecturer_subject_priorities()
        print("✅ Lecturer Subject Priorities seeded successfully!")
        print()
        
        # 6. Final sequence reset to ensure all sequences are properly set
        print("🔄 Performing final sequence reset...")
        await reset_all_sequences()
        print("✅ Final sequence reset completed!")
        print()
        
        print("🎉 All seeds completed successfully!")
        print("=" * 50)
        print("📊 Summary:")
        print("   • 2 Academic Years (2024-2025, 2025-2026)")
        print("   • 4 Batches (A & B for each year, 60 students each)")
        print("   • 16 Subjects (8 per year: 4 Core + 2 Elective + 2 Lab)")
        print("   • 30 Users (1 HOD, 1 TIMETABLE_COORDINATOR, 28 LECTURERs)")
        print("   • Lecturer Subject Priorities (distributed across lecturers)")
        print("   • All database sequences reset to prevent ID conflicts")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_all_seeds()) 