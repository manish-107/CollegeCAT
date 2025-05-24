from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from typing import AsyncGenerator
from app.config.config import DATABASE_URL

# Make sure DATABASE_URL is in async format, e.g., 'postgresql+asyncpg://user:pass@host/db'
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)

SessionLocal = async_sessionmaker(
    bind=engine,
    autoflush=True,
    autocommit=False,
    expire_on_commit=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    db: AsyncSession = SessionLocal()
    try:
        yield db
    except Exception:
        await db.rollback()
        raise
    finally:
        await db.close()
