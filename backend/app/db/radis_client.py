import redis.asyncio as redis
from app.config.config import REDIS_PASSWORD


redis_client = redis.Redis(
    host='redis-12648.c44.us-east-1-2.ec2.redns.redis-cloud.com',
    port=12648,
    decode_responses=True,
    username="default",
    password=REDIS_PASSWORD,
)

