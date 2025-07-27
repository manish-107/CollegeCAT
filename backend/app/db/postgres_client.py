from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config.config import settings

async_url = str(settings.DATABASE_URL).replace("postgresql://", "postgresql+asyncpg://", 1)
engine = create_async_engine(
    async_url, 
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
    print("Async URL:", async_url)
    db = SessionLocal()
    try:
        yield db
    except:
        await db.rollback()
        raise
    finally:
        await db.close()
