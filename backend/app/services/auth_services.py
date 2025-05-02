from fastapi import Request,Response
from typing import Optional
from datetime import datetime
from app.db.radis_client import redis_client
import json
import secrets
import httpx


"""
Get user details form google with provided access token
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
            return {"error": f"Failed to fetch user info from Google: {response.status_code} - {response.text}"}
        
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
You can use uuid4 or secrets.token_urlsafe
"""
def generate_session_id() -> str:
    session_id = secrets.token_urlsafe(32)
    return session_id


"""
Store session data in Redis.
If user has not signed in yet, set a shorter TTL (e.g., 1 hour(1h))
If user signed in, set a longer TTL (e.g., 7 days (7d))
"""

def parse_ttl(ttl: str) -> int:
    ttl = ttl.lower().strip() 
    if ttl.endswith('d'):
        return int(ttl[:-1]) * 24 * 60 * 60   # days → seconds
    elif ttl.endswith('h'):
        return int(ttl[:-1]) * 60 * 60        # hours → seconds
    else:
        raise ValueError("Invalid TTL format. Only 'h' (hours) or 'd' (days) are allowed.")

async def store_session_in_redis(session_id: str, data: dict, ttl: str):
    expire_seconds = parse_ttl(ttl)
    json_data = json.dumps(data, ensure_ascii=False)  # safer encoding
    res = await redis_client.set(session_id, json_data, ex=expire_seconds)

    if ttl == "7d":
       user_id = data['user_id']
       await redis_client.set(f"user_session:{user_id}", session_id, ex=expire_seconds)

    return res


"""
Fetch session data from Redis using session ID
Raises error if session is not found
"""
async def get_session_data(session_id: str) -> dict:
    sessionData = await redis_client.get(f"sessionid:{session_id}")
    if sessionData is None:
        return {}

    # if sessionData is bytes, decode it first
    if isinstance(sessionData, bytes):
        sessionData = sessionData.decode("utf-8")
        
    session_dict = json.loads(sessionData)
    return session_dict


def remove_radissession_ifalreadyexists():
    pass


"""
1. Using session ID, fetch refresh token from Redis
2. Request new access token from Google
3. Update the access token + expiry in Redis
"""
def refresh_access_token(session_id: str) -> str:
    return "hello"


"""
Check if the access token is expired based on stored expiry time
Return True if expired, False otherwise
"""
def is_token_expired(session_data: dict) -> bool:
    return False



"""
Clear the session from Redis (logout or invalidation)
"""
def delete_session(session_id: str):
    pass


"""
Utility: convert `expires_in` to actual datetime for Redis storage
"""
# def calculate_expiry_time(seconds: int) -> datetime:
#     pass

"""
Set session ID in browser cookie
"""
def set_cookie(response: Response, session_id: str):
    pass


"""
Get session ID from request cookies
"""
def get_cookie(request: Request) -> Optional[str]:
    pass
