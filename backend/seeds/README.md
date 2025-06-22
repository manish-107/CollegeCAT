# Database Seeds

This folder contains seed files to populate the database with initial data for testing and development.

## 📁 Files

- `seed_academic_years.py` - Creates academic years (2024-2025, 2025-2026)
- `seed_batches.py` - Creates batches (A & B for each year, 60 students each)
- `seed_subjects.py` - Creates subjects with unique codes per year (DSA2024, DSA2025, etc.)
- `seed_users.py` - Creates 30 users (1 HOD, 1 TIMETABLE_COORDINATOR, 28 LECTURERs)
- `seed_lecturer_subject_priorities.py` - Creates priorities for 3 lecturers (10 priorities each)
- `run_all_seeds.py` - Runs all seed files in the correct order
- `cleanup_database.py` - Removes all seeded data from the database
- `sequence_utils.py` - Utility functions for resetting database sequences
- `reset_sequences.py` - Standalone script to reset all sequences
- `README.md` - This documentation file

## 🚀 Usage

### Run All Seeds (Recommended)
```bash
cd seeds
python run_all_seeds.py
```

### Run Individual Seeds
```bash
# Run in order (dependencies matter)
python seed_academic_years.py
python seed_batches.py
python seed_subjects.py
python seed_users.py
python seed_lecturer_subject_priorities.py
```

### Reset Sequences (Fix ID Conflicts)
```bash
# Reset all sequences to prevent ID conflicts
python reset_sequences.py

# Or run the utility directly
python -c "import asyncio; from sequence_utils import reset_all_sequences; asyncio.run(reset_all_sequences())"
```

### Clean Up Database
```bash
# Full cleanup (all tables)
python cleanup_database.py

# Selective cleanup (main seeded tables only)
python cleanup_database.py --selective
```

## 🔄 Sequence Management

### What are Sequences?
PostgreSQL uses **sequences** to auto-generate IDs for tables with auto-incrementing primary keys. When you insert data with explicit IDs (like in seed files), the sequence doesn't automatically update to know about the highest existing ID.

### The Problem
If you have existing data with IDs 1, 2, 3, 4, 5, but the sequence is still at 1, the next insert will try to use ID 1 again, causing a **unique constraint violation**.

### The Solution
Each seed file now automatically resets its sequence after seeding data. Additionally, you can manually reset all sequences using the provided tools.

### Automatic Sequence Reset
Every seed file now includes:
```python
# Reset the sequence after seeding
await db.execute(text("SELECT setval('table_name_id_seq', (SELECT MAX(id) FROM table_name));"))
```

### Manual Sequence Reset
Use the standalone script:
```bash
python reset_sequences.py
```

This resets sequences for all tables:
- `users_user_id_seq`
- `academic_years_year_id_seq`
- `batches_batch_id_seq`
- `subjects_subject_id_seq`
- `lecturer_subject_priorities_id_seq`
- `timetable_hour_formats_format_id_seq`
- `timetable_timetable_id_seq`

## 🧹 Cleanup Options

### Full Cleanup
Removes all data from all tables in the correct order to respect foreign key constraints:
- Lecturer Subject Allocations
- Lecturer Subject Priorities
- Approvals
- Timetables
- Timetable Hour Formats
- Lecturer Sub Assignments
- Lecturer Preferences
- Users
- Subjects
- Batches
- Academic Years

### Selective Cleanup
Removes only the main seeded tables:
- Lecturer Subject Allocations
- Lecturer Subject Priorities
- Users
- Subjects
- Batches
- Academic Years

## 📊 Data Created

### Academic Years
- **ID 1**: 2024-2025
- **ID 2**: 2025-2026

### Batches
- **ID 1**: Year 2024, Section A (60 students)
- **ID 2**: Year 2024, Section B (60 students)
- **ID 3**: Year 2025, Section A (60 students)
- **ID 4**: Year 2025, Section B (60 students)

### Subjects (26 total)
**Year 2024-2025 (IDs 1-13):**
- **Core**: DSA2024 (ID: 1), DBMS2024 (ID: 2), CN2024 (ID: 3), OS2024 (ID: 4), SE2024 (ID: 5)
- **Elective**: ML2024 (ID: 6), WD2024 (ID: 7), MAD2024 (ID: 8)
- **Lab**: PL2024 (ID: 9), DL2024 (ID: 10), NL2024 (ID: 11), SEL2024 (ID: 12), OSL2024 (ID: 13)

**Year 2025-2026 (IDs 14-26):**
- **Core**: DSA2025 (ID: 14), DBMS2025 (ID: 15), CN2025 (ID: 16), OS2025 (ID: 17), SE2025 (ID: 18)
- **Elective**: ML2025 (ID: 19), WD2025 (ID: 20), MAD2025 (ID: 21)
- **Lab**: PL2025 (ID: 22), DL2025 (ID: 23), NL2025 (ID: 24), SEL2025 (ID: 25), OSL2025 (ID: 26)

### Users (30 total)
- **ID 1**: Dr. John Smith (HOD) - hod@college.edu
- **ID 2**: Prof. Sarah Johnson (TIMETABLE_COORDINATOR) - timetable.coordinator@college.edu
- **IDs 3-30**: Prof. Lecturer 1-28 (LECTURER) - lecturer1@college.edu to lecturer28@college.edu

### Lecturer Subject Priorities
- **3 lecturers** (IDs: 3, 4, 5) have priorities for **2 batches each**
- **10 priorities per lecturer** (5 for each batch)
- **Priority IDs**: Start from 1 and increment sequentially
- Priorities are randomly assigned from available subjects

## 🔢 Consistent IDs

All seed files use **explicit IDs** to ensure consistency across runs:

### **Benefits:**
- ✅ **Predictable IDs**: Same IDs every time you seed
- ✅ **Easy Testing**: You know exactly which IDs to use in tests
- ✅ **No Auto-increment Issues**: PostgreSQL won't create different IDs
- ✅ **Reliable References**: Foreign keys always point to the same records

### **ID Ranges:**
- **Academic Years**: 1-2
- **Batches**: 1-4
- **Subjects**: 1-26
- **Users**: 1-30
- **Priorities**: 1+ (incremental)

## ⚠️ Important Notes

1. **Dependencies**: Run seeds in order as they depend on each other
2. **Idempotent**: Seeds check for existing data and skip if already present
3. **Unique Constraints**: Subject codes are unique per year (DSA2024 ≠ DSA2025)
4. **Batch-Specific**: Lecturers can have different priorities for different batches
5. **Seniority**: Users have different joining years (2015-2025) for testing allocation logic
6. **Cleanup Safety**: Cleanup respects foreign key constraints and won't cause errors
7. **Consistent IDs**: All records have predictable, consistent IDs across runs

## 🔧 Customization

You can modify the seed files to:
- Add more academic years
- Change batch sections or student counts
- Add different subjects
- Modify user roles or details
- Adjust priority assignments
- Change ID assignments (ensure no conflicts)

## 🧪 Testing

After running seeds, you can test:
- Subject allocation algorithm
- Priority management
- User role-based access
- Batch-specific operations
- Year-specific data filtering
- ID-based lookups and references

## 🔄 Workflow

```bash
# 1. Clean up existing data (if any)
python cleanup_database.py

# 2. Run all seeds
python run_all_seeds.py

# 3. Test your application (use known IDs for testing)

# 4. Clean up when done testing
python cleanup_database.py
```

## 📝 Testing with Known IDs

With consistent IDs, you can easily test specific scenarios:

```python
# Test allocation for year 2024-2025 (ID: 1)
POST /lecturer-subject-priorities/allocate-subjects/1

# Test priorities for lecturer 3
GET /lecturer-subject-priorities/3/1

# Test specific subject (DSA2024, ID: 1)
GET /subjects/1
``` 