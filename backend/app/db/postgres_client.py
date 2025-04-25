from sqlalchemy import create_engine
from typing import Generator
from sqlalchemy.orm import sessionmaker,Session

DATADASE_URL = ""

engine = create_engine(DATADASE_URL,echo=True,pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine,autoflush=True,autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


