import asyncio
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.postgres_client import get_db
from sqlalchemy import text

async def reset_sequence(table_name: str, id_column: str):
    """Reset the sequence for a given table's ID column"""
    async for db in get_db():
        try:
            # Reset the sequence to the maximum ID value in the table
            query = text(f"SELECT setval('{table_name}_{id_column}_seq', (SELECT MAX({id_column}) FROM {table_name}));")
            result = await db.execute(query)
            await db.commit()
            
            # Get the next value to confirm
            next_val_query = text(f"SELECT nextval('{table_name}_{id_column}_seq');")
            next_result = await db.execute(next_val_query)
            next_val = next_result.scalar()
            
            print(f"✅ Reset sequence for {table_name}.{id_column}: next value will be {next_val}")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error resetting sequence for {table_name}.{id_column}: {e}")
            raise
        finally:
            await db.close()
        break

async def reset_all_sequences():
    """Reset sequences for all tables that have auto-incrementing IDs"""
    sequences_to_reset = [
        ("users", "user_id"),
        ("academicyears", "year_id"),
        ("batches", "batch_id"),
        ("subjects", "subject_id"),
        ("lecturer_subject_priorities", "id"),
        ("timetablehourformats", "format_id"),
        ("timetables", "timetable_id")
    ]
    
    print("🔄 Resetting all database sequences...")
    print("=" * 50)
    
    for table_name, id_column in sequences_to_reset:
        try:
            await reset_sequence(table_name, id_column)
        except Exception as e:
            print(f"⚠️  Warning: Could not reset sequence for {table_name}.{id_column}: {e}")
            # Continue with other sequences even if one fails
    
    print("=" * 50)
    print("✅ All sequence resets completed!")

if __name__ == "__main__":
    asyncio.run(reset_all_sequences()) 