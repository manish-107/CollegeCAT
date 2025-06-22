# Database Migration Commands

## Generate Migration
```bash
alembic revision --autogenerate -m "Description of changes"
```

## Run Migration
```bash
alembic upgrade head
```

## Check Current Migration
```bash
alembic current
```

## List Migration History
```bash
alembic history
```

## Downgrade Migration
```bash
alembic downgrade -1
```

## Downgrade to Specific Migration
```bash
alembic downgrade <migration_id>
```

## Show Migration SQL
```bash
alembic upgrade head --sql
```

## Stamp Database (mark as current without running)
```bash
alembic stamp head
``` 