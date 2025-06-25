from dotenv import load_dotenv
import os

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

DATABASE_URL = os.getenv("DATABASE_URL") or ""

print("DATABASE_URL:", repr(DATABASE_URL))

FRONTEND_BASE_URL = "http://localhost:3001"

async_url = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
