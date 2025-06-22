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

# Mock version for development - bypasses Redis
async def mock_auth_dependency(request: Request):
    """
    Mock authentication dependency for development.
    Returns a mock user session without requiring Redis or actual authentication.
    """
    # Mock user data - you can customize this based on your needs
    mock_user_data = {
        "user_id": 1,
        "name": "Dr. John Smith",
        "uname": "Dr. John Smith",
        "email": "hod@college.edu",
        "role": "HOD",
        "oauth_provider": "google",
        "oauth_id": "hod_google_123",
        "joining_year": 2015,
        "is_active": True,
        "image_url": "https://example.com/avatar.jpg"
    }
    
    # Attach mock user info to request
    request.state.user = mock_user_data
    
    return mock_user_data

# Alternative mock with different roles for testing
async def mock_lecturer_auth_dependency(request: Request):
    """
    Mock authentication dependency for lecturer role testing.
    """
    mock_user_data = {
        "user_id": 3,
        "name": "Prof. Lecturer 1",
        "uname": "Prof. Lecturer 1",
        "email": "lecturer1@college.edu",
        "role": "LECTURER",
        "oauth_provider": "google",
        "oauth_id": "lecturer1_google_123",
        "joining_year": 2019,
        "is_active": True,
        "image_url": "https://example.com/lecturer1.jpg"
    }
    
    request.state.user = mock_user_data
    return mock_user_data

async def mock_coordinator_auth_dependency(request: Request):
    """
    Mock authentication dependency for timetable coordinator role testing.
    """
    mock_user_data = {
        "user_id": 2,
        "name": "Prof. Sarah Johnson",
        "uname": "Prof. Sarah Johnson",
        "email": "timetable.coordinator@college.edu",
        "role": "TIMETABLE_COORDINATOR",
        "oauth_provider": "google",
        "oauth_id": "coordinator_google_123",
        "joining_year": 2018,
        "is_active": True,
        "image_url": "https://example.com/coordinator.jpg"
    }
    
    request.state.user = mock_user_data
    return mock_user_data
