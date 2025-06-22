#!/usr/bin/env python3
"""
Standalone script to reset all database sequences.
Use this when you need to fix sequence conflicts without running all seeds.
"""

import asyncio
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from seeds.sequence_utils import reset_all_sequences

async def main():
    """Reset all database sequences"""
    print("🔄 Database Sequence Reset Tool")
    print("=" * 40)
    print("This will reset all auto-increment sequences to prevent ID conflicts.")
    print()
    
    try:
        await reset_all_sequences()
        print()
        print("✅ All sequences have been reset successfully!")
        print("You can now create new records without ID conflicts.")
        
    except Exception as e:
        print(f"❌ Error resetting sequences: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 