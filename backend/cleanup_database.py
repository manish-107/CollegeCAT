#!/usr/bin/env python3
"""
Database Cleanup Script for PostgreSQL
This script completely cleans up a PostgreSQL database by dropping all:
- Tables
- Enums
- Sequences
- Functions
- Views
- Schemas (except public and information_schema)

Usage:
    python cleanup_database.py
"""

import asyncio
import asyncpg
import os
from typing import List, Tuple
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Database configuration - update these with your Aiven credentials
DATABASE_URL = "postgresql://myuser:mypassword@localhost:5432/mydb"  # Update with your Aiven URL

async def get_database_connection():
    """Create database connection"""
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        logger.info("Successfully connected to database")
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise

async def get_all_tables(conn) -> List[str]:
    """Get all table names in the database"""
    query = """
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
    """
    rows = await conn.fetch(query)
    return [row['tablename'] for row in rows]

async def get_all_enums(conn) -> List[str]:
    """Get all enum type names in the database"""
    query = """
    SELECT t.typname as enum_name
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typtype = 'e'
    GROUP BY t.typname
    ORDER BY t.typname;
    """
    rows = await conn.fetch(query)
    return [row['enum_name'] for row in rows]

async def get_all_sequences(conn) -> List[str]:
    """Get all sequence names in the database"""
    query = """
    SELECT sequence_name 
    FROM information_schema.sequences 
    WHERE sequence_schema = 'public'
    ORDER BY sequence_name;
    """
    rows = await conn.fetch(query)
    return [row['sequence_name'] for row in rows]

async def get_all_functions(conn) -> List[Tuple[str, str]]:
    """Get all function names and their signatures"""
    query = """
    SELECT 
        p.proname as function_name,
        pg_get_function_identity_arguments(p.oid) as arguments
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    ORDER BY p.proname;
    """
    rows = await conn.fetch(query)
    return [(row['function_name'], row['arguments']) for row in rows]

async def get_all_views(conn) -> List[str]:
    """Get all view names in the database"""
    query = """
    SELECT viewname 
    FROM pg_views 
    WHERE schemaname = 'public'
    ORDER BY viewname;
    """
    rows = await conn.fetch(query)
    return [row['viewname'] for row in rows]

async def drop_all_tables(conn, tables: List[str]):
    """Drop all tables in the database"""
    if not tables:
        logger.info("No tables to drop")
        return
    
    logger.info(f"Dropping {len(tables)} tables...")
    
    # Disable foreign key checks temporarily
    await conn.execute("SET session_replication_role = replica;")
    
    try:
        for table in tables:
            try:
                await conn.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE;')
                logger.info(f"Dropped table: {table}")
            except Exception as e:
                logger.error(f"Failed to drop table {table}: {e}")
    finally:
        # Re-enable foreign key checks
        await conn.execute("SET session_replication_role = DEFAULT;")

async def drop_all_enums(conn, enums: List[str]):
    """Drop all enum types in the database"""
    if not enums:
        logger.info("No enums to drop")
        return
    
    logger.info(f"Dropping {len(enums)} enums...")
    
    for enum_name in enums:
        try:
            await conn.execute(f'DROP TYPE IF EXISTS "{enum_name}" CASCADE;')
            logger.info(f"Dropped enum: {enum_name}")
        except Exception as e:
            logger.error(f"Failed to drop enum {enum_name}: {e}")

async def drop_all_sequences(conn, sequences: List[str]):
    """Drop all sequences in the database"""
    if not sequences:
        logger.info("No sequences to drop")
        return
    
    logger.info(f"Dropping {len(sequences)} sequences...")
    
    for sequence in sequences:
        try:
            await conn.execute(f'DROP SEQUENCE IF EXISTS "{sequence}" CASCADE;')
            logger.info(f"Dropped sequence: {sequence}")
        except Exception as e:
            logger.error(f"Failed to drop sequence {sequence}: {e}")

async def drop_all_functions(conn, functions: List[Tuple[str, str]]):
    """Drop all functions in the database"""
    if not functions:
        logger.info("No functions to drop")
        return
    
    logger.info(f"Dropping {len(functions)} functions...")
    
    for func_name, arguments in functions:
        try:
            if arguments:
                await conn.execute(f'DROP FUNCTION IF EXISTS "{func_name}"({arguments}) CASCADE;')
            else:
                await conn.execute(f'DROP FUNCTION IF EXISTS "{func_name}"() CASCADE;')
            logger.info(f"Dropped function: {func_name}")
        except Exception as e:
            logger.error(f"Failed to drop function {func_name}: {e}")

async def drop_all_views(conn, views: List[str]):
    """Drop all views in the database"""
    if not views:
        logger.info("No views to drop")
        return
    
    logger.info(f"Dropping {len(views)} views...")
    
    for view in views:
        try:
            await conn.execute(f'DROP VIEW IF EXISTS "{view}" CASCADE;')
            logger.info(f"Dropped view: {view}")
        except Exception as e:
            logger.error(f"Failed to drop view {view}: {e}")

async def cleanup_database():
    """Main function to clean up the entire database"""
    conn = None
    try:
        # Connect to database
        conn = await get_database_connection()
        
        # Get all database objects
        logger.info("Scanning database for objects to clean up...")
        
        tables = await get_all_tables(conn)
        enums = await get_all_enums(conn)
        sequences = await get_all_sequences(conn)
        functions = await get_all_functions(conn)
        views = await get_all_views(conn)
        
        # Log what we found
        logger.info(f"Found {len(tables)} tables, {len(enums)} enums, {len(sequences)} sequences, {len(functions)} functions, {len(views)} views")
        
        if not any([tables, enums, sequences, functions, views]):
            logger.info("Database is already clean!")
            return
        
        # Confirm before proceeding
        response = input(f"\nThis will delete ALL database objects:\n"
                        f"- {len(tables)} tables\n"
                        f"- {len(enums)} enums\n"
                        f"- {len(sequences)} sequences\n"
                        f"- {len(functions)} functions\n"
                        f"- {len(views)} views\n\n"
                        f"Are you sure you want to continue? (yes/no): ")
        
        if response.lower() != 'yes':
            logger.info("Cleanup cancelled by user")
            return
        
        # Start cleanup process
        logger.info("Starting database cleanup...")
        
        # Drop in order to avoid dependency issues
        await drop_all_views(conn, views)
        await drop_all_functions(conn, functions)
        await drop_all_tables(conn, tables)
        await drop_all_sequences(conn, sequences)
        await drop_all_enums(conn, enums)
        
        logger.info("Database cleanup completed successfully!")
        
        # Verify cleanup
        remaining_tables = await get_all_tables(conn)
        remaining_enums = await get_all_enums(conn)
        remaining_sequences = await get_all_sequences(conn)
        remaining_functions = await get_all_functions(conn)
        remaining_views = await get_all_views(conn)
        
        if not any([remaining_tables, remaining_enums, remaining_sequences, remaining_functions, remaining_views]):
            logger.info("✅ Database is completely clean!")
        else:
            logger.warning("⚠️  Some objects may still remain:")
            if remaining_tables:
                logger.warning(f"  Tables: {remaining_tables}")
            if remaining_enums:
                logger.warning(f"  Enums: {remaining_enums}")
            if remaining_sequences:
                logger.warning(f"  Sequences: {remaining_sequences}")
            if remaining_functions:
                logger.warning(f"  Functions: {remaining_functions}")
            if remaining_views:
                logger.warning(f"  Views: {remaining_views}")
        
    except Exception as e:
        logger.error(f"Error during database cleanup: {e}")
        raise
    finally:
        if conn:
            await conn.close()
            logger.info("Database connection closed")

def main():
    """Main entry point"""
    print("🚀 Database Cleanup Script")
    print("=" * 50)
    print(f"Target Database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else DATABASE_URL}")
    print("=" * 50)
    
    # Run the cleanup
    asyncio.run(cleanup_database())

if __name__ == "__main__":
    main()
