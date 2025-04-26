from fastapi import Request,Response
from typing import Optional
from datetime import datetime
import httpx


"""
Get user details form google with provided access token
"""
async def get_userDetails_from_google(token:str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
            headers={"Authorization": f"Bearer {token}"},
        ) 

    if response.status_code != 200:
        return {"error": "Failed to fetch user info from Google"}
    
    return response.json()



"""
1. Using session ID, fetch refresh token from Redis
2. Request new access token from Google
3. Update the access token + expiry in Redis
"""
def refresh_access_token(session_id: str) -> str:
    pass


"""
Check if the access token is expired based on stored expiry time
Return True if expired, False otherwise
"""
def is_token_expired(session_data: dict) -> bool:
    pass


"""
Generate a new secure session ID
You can use uuid4 or secrets.token_urlsafe
"""
def generate_session_id() -> str:
    pass


"""
Store session data in Redis.
If user has not signed in yet, set a shorter TTL (e.g., 1 hour)
If user signed in, set a longer TTL (e.g., 7 days)
"""
def store_session_in_redis(session_id: str, data: dict, signed_in: bool):
    pass

"""
Fetch session data from Redis using session ID
Raises error if session is not found
"""
def get_session_data(session_id: str) -> dict:
    pass


"""
Clear the session from Redis (logout or invalidation)
"""
def delete_session(session_id: str):
    pass


"""
Utility: convert `expires_in` to actual datetime for Redis storage
"""
def calculate_expiry_time(seconds: int) -> datetime:
    pass

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
