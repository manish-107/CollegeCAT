from dotenv import load_dotenv
import os
from typing import Optional

# Load environment variables
load_dotenv()

class Settings:
    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/callback")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Redis
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    REDIS_USERNAME: Optional[str] = os.getenv("REDIS_USERNAME", "default") 
    
    # Frontend
    FRONTEND_BASE_URL: str = os.getenv("FRONTEND_BASE_URL", "http://localhost:3001")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    @property
    def async_database_url(self) -> str:
        """Convert PostgreSQL URL to async format for SQLAlchemy"""
        if self.DATABASE_URL:
            return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        return ""
    
    @property
    def sync_database_url(self) -> str:
        """Sync database URL for migrations"""
        return self.DATABASE_URL
    
    def validate_required_settings(self) -> None:
        """Validate that required environment variables are set"""
        required_vars = {
            "GOOGLE_CLIENT_ID": self.GOOGLE_CLIENT_ID,
            "GOOGLE_CLIENT_SECRET": self.GOOGLE_CLIENT_SECRET,
            "DATABASE_URL": self.DATABASE_URL,
        }
        
        missing_vars = [var for var, value in required_vars.items() if not value]
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

# Create global settings instance
settings = Settings()

# Validate settings on import (optional - you can remove this if you prefer)
if settings.ENVIRONMENT == "production":
    settings.validate_required_settings()
