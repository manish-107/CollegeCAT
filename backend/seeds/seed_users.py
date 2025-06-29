import asyncio
import sys
import os
import random

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.model import Users, RoleEnum
from app.db.postgres_client import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

async def seed_users():
    """Seed users data"""
    async for db in get_db():
        try:
            # Check if users already exist
            result = await db.execute(select(Users.email))
            existing_emails = result.scalars().all()
            
            users_data = [
                # HOD
                {
                    "user_id": 1,
                    "uname": "Dr. John Smith",
                    "email": "hod@college.edu",
                    "role": RoleEnum.HOD,
                    "oauth_provider": "google",
                    "oauth_id": "hod_google_123",
                    "joining_year": 2015,
                    "is_active": True
                },
                # TIMETABLE_COORDINATOR
                {
                    "user_id": 2,
                    "uname": "Prof. Sarah Johnson",
                    "email": "timetable.coordinator@college.edu",
                    "role": RoleEnum.TIMETABLE_COORDINATOR,
                    "oauth_provider": "google",
                    "oauth_id": "coordinator_google_123",
                    "joining_year": 2018,
                    "is_active": True
                }
            ]
            
            # Add 28 FACULTY members
            for i in range(1, 29):
                user_data = {
                    "user_id": i + 2,  # Start from 3 (after HOD and coordinator)
                    "uname": f"Prof. Faculty {i}",
                    "email": f"faculty{i}@college.edu",
                    "role": RoleEnum.FACULTY,
                    "oauth_provider": "google",
                    "oauth_id": f"faculty{i}_google_123",
                    "joining_year": 2018 + (i % 8),  # Different joining years from 2018-2025
                    "is_active": True
                }
                users_data.append(user_data)
            
            for user_data in users_data:
                if user_data["email"] not in existing_emails:
                    user = Users(**user_data)
                    db.add(user)
                    print(f"Added user: {user_data['uname']} ({user_data['role'].value}) (ID: {user_data['user_id']})")
                else:
                    print(f"User {user_data['email']} already exists")
            
            await db.commit()
            print("Users seeding completed successfully!")
            print(f"Total users created: {len(users_data)}")
            print(f"Breakdown: 1 HOD, 1 TIMETABLE_COORDINATOR, 28 FACULTY members")
            
            # Reset the sequence after seeding
            print("🔄 Resetting users sequence...")
            await db.execute(text("SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));"))
            await db.commit()
            print("✅ Users sequence reset successfully!")
            
        except Exception as e:
            await db.rollback()
            print(f"Error seeding users: {e}")
            raise
        finally:
            await db.close()
        break

if __name__ == "__main__":
    asyncio.run(seed_users()) 