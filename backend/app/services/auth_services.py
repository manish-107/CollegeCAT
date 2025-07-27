from fastapi import Request, Response
from typing import Optional
from datetime import datetime, timedelta
import json
import secrets
import httpx
import redis.asyncio as redis

# Remove this line - it causes the async_generator error
# redis_client = get_redis()

"""
Get user details from google with provided access token
"""

async def get_userDetails_from_google(token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
                headers={"Authorization": f"Bearer {token}"},
            )

        # If the response status is not 200, return a detailed error
        if response.status_code != 200:
            return {
                "error": f"Failed to fetch user info from Google: {response.status_code} - {response.text}"
            }

        # If everything goes well, return the user data
        return response.json()

    except httpx.RequestError as e:
        # Catch network-related errors
        return {"error": f"Request failed: {str(e)}"}

    except Exception as e:
        # Catch any other exceptions that may occur
        return {"error": f"Unexpected error: {str(e)}"}

"""
Generate a new secure session ID
"""

def generate_session_id() -> str:
    session_id = secrets.token_urlsafe(32)
    return session_id

"""
Parse TTL string to seconds
"""

def parse_ttl(ttl: str) -> int:
    ttl = ttl.lower().strip()
    if ttl.endswith("d"):
        return int(ttl[:-1]) * 24 * 60 * 60  # days → seconds
    elif ttl.endswith("h"):
        return int(ttl[:-1]) * 60 * 60  # hours → seconds
    elif ttl.endswith("m"):
        return int(ttl[:-1]) * 60  # minutes → seconds
    elif ttl.endswith("s"):
        return int(ttl[:-1])  # seconds
    else:
        try:
            return int(ttl)  # assume seconds if no unit
        except ValueError:
            raise ValueError(
                "Invalid TTL format. Use formats like '7d', '1h', '30m', '60s', or just numbers for seconds."
            )

"""
Store session data in Redis.
Pass redis_client as parameter instead of using global variable
"""

async def store_session_in_redis(
    redis_client: redis.Redis,  # Add redis_client parameter
    session_id: str, 
    data: dict, 
    ttl: str
):
    expire_seconds = parse_ttl(ttl)
    json_data = json.dumps(data, ensure_ascii=False)
    res = await redis_client.set(session_id, json_data, ex=expire_seconds)

    # Store user session mapping for longer sessions
    if ttl == "7d" and "user_id" in data:
        user_id = data["user_id"]
        await redis_client.set(f"user_session:{user_id}", session_id, ex=expire_seconds)

    return res

"""
Fetch session data from Redis using session ID
"""

async def get_session_data(redis_client: redis.Redis, session_id: str) -> dict:
    session_data = await redis_client.get(f"sessionid:{session_id}")
    
    if session_data is None:
        return {}

    # if session_data is bytes, decode it first
    if isinstance(session_data, bytes):
        session_data = session_data.decode("utf-8")

    try:
        session_dict = json.loads(session_data)
        return session_dict
    except json.JSONDecodeError:
        return {}

"""
Remove existing Redis session for a user
"""

async def remove_redis_session_if_already_exists(
    redis_client: redis.Redis, 
    user_id: str
):
    old_session_id = await redis_client.get(f"user_session:{user_id}")
    
    if old_session_id:
        # Delete old session data
        await redis_client.delete(f"sessionid:{old_session_id}")
        # Delete user session mapping
        await redis_client.delete(f"user_session:{user_id}")

"""
Refresh access token using refresh token from Redis
"""

async def refresh_access_token(
    redis_client: redis.Redis, 
    session_id: str,
    client_id: str,
    client_secret: str
) -> dict:
    # Get current session data
    session_data = await get_session_data(redis_client, session_id)
    
    if not session_data or "refresh_token" not in session_data:
        return {"error": "No refresh token found"}

    refresh_token = session_data["refresh_token"]
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token",
                },
            )
            
            if response.status_code != 200:
                return {"error": f"Token refresh failed: {response.text}"}
            
            token_data = response.json()
            
            # Update session with new access token
            session_data["access_token"] = token_data.get("access_token")
            session_data["expires_at"] = (
                datetime.now() + timedelta(seconds=token_data.get("expires_in", 3600))
            ).isoformat()
            
            # Store updated session
            await redis_client.set(
                f"sessionid:{session_id}",
                json.dumps(session_data),
                ex=parse_ttl("7d")  # Keep original TTL
            )
            
            return {"access_token": token_data.get("access_token")}
            
    except Exception as e:
        return {"error": f"Token refresh error: {str(e)}"}

"""
Check if the access token is expired based on stored expiry time
"""

def is_token_expired(session_data: dict) -> bool:
    if "expires_at" not in session_data:
        return True
    
    try:
        expires_at = datetime.fromisoformat(session_data["expires_at"].replace('Z', '+00:00'))
        return datetime.now() < expires_at
    except (ValueError, TypeError):
        return True  # Assume expired if we can't parse the date

"""
Clear the session from Redis (logout or invalidation)
"""

async def delete_session(redis_client: redis.Redis, session_id: str, user_id: str):
    # Delete session data
    await redis_client.delete(f"sessionid:{session_id}")
    
    # Delete user session mapping if user_id provided
    if user_id:
        await redis_client.delete(f"user_session:{user_id}")

"""
Set session ID in browser cookie
"""

def set_cookie(response: Response, session_id: str, secure: bool = False):
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=secure,  # True for HTTPS, False for localhost
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 days
        path="/"
    )

"""
Get session ID from request cookies
"""

def get_cookie(request: Request) -> Optional[str]:
    return request.cookies.get("session_id")

"""
Validate session and return session data
"""

async def validate_session(redis_client: redis.Redis, session_id: str) -> dict:
    if not session_id:
        return {"error": "No session ID provided"}
    
    session_data = await get_session_data(redis_client, session_id)
    
    if not session_data:
        return {"error": "Invalid or expired session"}
    
    # Check if token is expired
    if is_token_expired(session_data):
        return {"error": "Session expired", "needs_refresh": True}
    
    return session_data
