from fastapi import Request, HTTPException, status
from app.db.radis_client import redis_client
import json

async def auth_dependency(request: Request):
    session_id = request.cookies.get("session_id")

    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: No session ID"
        )

    user_data = await redis_client.get(f"sessionid:{session_id}")

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid session"
        )

    try:
        user_data = json.loads(user_data)  # Only if it's a JSON string
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Session data is corrupted"
        )

    request.state.user = user_data  # Attach user info to request

    # You can optionally return user_data if needed in route handlers
    return user_data
