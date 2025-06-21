import asyncio
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.model import AcademicYears
from app.db.postgres_client import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

async def seed_academic_years():
    """Seed academic years data"""
    async for db in get_db():
        try:
            # Check if data already exists
            result = await db.execute(select(AcademicYears.academic_year))
            existing_years = result.scalars().all()
            
            academic_years_data = [
                {
                    "year_id": 1,
                    "academic_year": "2024-2025"
                },
                {
                    "year_id": 2,
                    "academic_year": "2025-2026"
                }
            ]
            
            for year_data in academic_years_data:
                if year_data["academic_year"] not in existing_years:
                    academic_year = AcademicYears(**year_data)
                    db.add(academic_year)
                    print(f"Added academic year: {year_data['academic_year']} (ID: {year_data['year_id']})")
                else:
                    print(f"Academic year {year_data['academic_year']} already exists")
            
            await db.commit()
            print("Academic years seeding completed successfully!")
            
        except Exception as e:
            await db.rollback()
            print(f"Error seeding academic years: {e}")
            raise
        finally:
            await db.close()
        break

if __name__ == "__main__":
    asyncio.run(seed_academic_years()) 