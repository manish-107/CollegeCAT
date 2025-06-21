from logging.config import fileConfig
import os
from sqlalchemy import pool
from sqlalchemy import engine_from_config
from alembic import context
from app.config.config import DATABASE_URL
from app.models.model import BaseClass
# Alembic Config object
config = context.config

# Set up loggers
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import your models to ensure they are registered

# Set target metadata
target_metadata = BaseClass.metadata

# Get database URL from your config and convert to sync
# Convert async URL to sync URL for Alembic
sync_database_url = DATABASE_URL.replace('postgresql+asyncpg://', 'postgresql://')
config.set_main_option('sqlalchemy.url', sync_database_url)

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode using sync engine."""

    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,  # Optional: Detect column type changes
            render_as_batch=True,  # Optional: Useful for SQLite migrations
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
