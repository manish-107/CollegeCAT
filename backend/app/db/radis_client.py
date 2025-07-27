import redis.asyncio as redis
from app.config.config import settings

async def get_redis():
    """FastAPI dependency function using Redis URL"""
    
    client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            username=settings.REDIS_USERNAME,
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )   
    print("Redis Client Initialized with URL:", settings.REDIS_HOST)
    print("Redis Port:", settings.REDIS_PORT)
    print("Redis Username:", settings.REDIS_USERNAME)
    print("Redis Password:", settings.REDIS_PASSWORD)
    try:
        yield client
    finally:
        await client.close()
