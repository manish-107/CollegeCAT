import asyncio
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.model import Batches, AcademicYears
from app.db.postgres_client import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

async def seed_batches():
    """Seed batches data"""
    async for db in get_db():
        try:
            # Get academic years
            result = await db.execute(select(AcademicYears))
            academic_years = result.scalars().all()
            
            if not academic_years:
                print("No academic years found. Please run seed_academic_years.py first.")
                return
            
            # Check if batches already exist
            existing_batches = await db.execute(select(Batches.year_id, Batches.section))
            existing_batches = existing_batches.all()
            existing_batches = [(batch[0], batch[1]) for batch in existing_batches]
            
            batches_data = [
                # Year 2024-2025 (ID: 1)
                {
                    "batch_id": 1,
                    "year_id": 1,
                    "section": "A",
                    "noOfStudent": 60
                },
                {
                    "batch_id": 2,
                    "year_id": 1,
                    "section": "B",
                    "noOfStudent": 60
                },
                # Year 2025-2026 (ID: 2)
                {
                    "batch_id": 3,
                    "year_id": 2,
                    "section": "A",
                    "noOfStudent": 60
                },
                {
                    "batch_id": 4,
                    "year_id": 2,
                    "section": "B",
                    "noOfStudent": 60
                }
            ]
            
            for batch_data in batches_data:
                if (batch_data["year_id"], batch_data["section"]) not in existing_batches:
                    batch = Batches(**batch_data)
                    db.add(batch)
                    print(f"Added batch: Section {batch_data['section']} for year_id {batch_data['year_id']} (ID: {batch_data['batch_id']})")
                else:
                    print(f"Batch Section {batch_data['section']} for year_id {batch_data['year_id']} already exists")
            
            await db.commit()
            print("Batches seeding completed successfully!")
            
            # Reset the sequence after seeding
            print("🔄 Resetting batches sequence...")
            await db.execute(text("SELECT setval('batches_batch_id_seq', (SELECT MAX(batch_id) FROM batches));"))
            await db.commit()
            print("✅ Batches sequence reset successfully!")
            
        except Exception as e:
            await db.rollback()
            print(f"Error seeding batches: {e}")
            raise
        finally:
            await db.close()
        break

if __name__ == "__main__":
    asyncio.run(seed_batches()) 