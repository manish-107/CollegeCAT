from fastapi import APIRouter,Request,Depends
from fastapi.responses import JSONResponse,RedirectResponse
from datetime import datetime, timedelta,timezone
import httpx
import json
from app.config import GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,REDIRECT_URI
from app.db.postgres_client import get_db
from app.db.radis_client import redis_client
from sqlalchemy.orm import Session
from app.schemas.user_schema import signupData
from app.config import FRONTEND_BASE_URL
from app.services.user_service import get_userby_email,insert_userDetails
from app.services.auth_services import get_userDetails_from_google,generate_session_id,store_session_in_redis,get_session_data

authRoute = APIRouter()

"""
1. Google redirects to your `/auth/callback` with `code` as a query param.
2. Use this `code` to request tokens (access, refresh, expires_in).
3. Create a session_id.
4. Store the session_id as key in Redis with value:
   (access, refresh, expires_in, signed_in=true/false, email,role)

5. Check if the user already exists in DB:
   - If exists:
     - Store session_id in cookie.
     - Redirect to dashboard.

   - If not exists:
     - Redirect to frontend `signup` page.
     - On POST `/users/signup`:
       - Read session_id from cookie.
       - Fetch data from Redis.
       - Store new user in DB.
       - Clean Redis data (remove temp fields like signed_in=false).
       - Redirect to dashboard.

       Redis TTL:
        Set an appropriate TTL (e.g., 1 hour for signed_in=false, longer for signed in).

    For long-lived sessions, store the refresh token securely.
"""

@authRoute.get("/callback")
async def signin_redirect(request: Request, db: Session = Depends(get_db)):
    code = request.query_params.get("code")

    if not code:
        return RedirectResponse(url=f"{FRONTEND_BASE_URL}/?error=code_missing")

    # Make request to Google's token endpoint
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": REDIRECT_URI,
                    "code": code,
                    "grant_type": "authorization_code",
                },
            )
            response.raise_for_status() 
        except httpx.RequestError as e:
            return RedirectResponse(url=f"{FRONTEND_BASE_URL}/?error=token_exchange_failed")
        
    token_data = response.json()

    if "error" in token_data:
        return RedirectResponse(url=f"{FRONTEND_BASE_URL}/?error=invalid_token_data")

    access_token = token_data.get("access_token")

    userData = await get_userDetails_from_google(access_token)

    print(userData.get("id"))

    if "error" in userData or "email" not in userData:
        return RedirectResponse(url=f"{FRONTEND_BASE_URL}/?error=user_info_fetch_failed")

    email = userData["email"]

    user_exists =  get_userby_email(email=email, db=db)

    if user_exists and user_exists.email == email:
        # User exists, create session ID
        sessionid =  generate_session_id()

        sessionData = {
            "user_id": user_exists.user_id,
            "oauth_id":userData.get("id"),
            "role": user_exists.role.value,
            "name": user_exists.uname,
            "email": user_exists.email,
            "image_url": userData.get("picture"),
            "access_token": token_data.get("access_token"),
            "refresh_token": token_data.get("refresh_token"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(seconds=token_data.get("expires_in"))).isoformat(),
            "is_signedUp": True
        }

        expire_seconds = "7d"  # Session expiration TTL
        
        old_session_id = await redis_client.get(f"user_session:{user_exists.user_id}")

        if old_session_id:
            await redis_client.delete(old_session_id)
            await redis_client.delete(f"user_session:{user_exists.user_id}")

        # Store session data in Redis
        res = await store_session_in_redis(session_id=f"sessionid:{sessionid}", data=sessionData, ttl=expire_seconds)

        # Redirect to dashboard and set cookie
        response = RedirectResponse(url=f"{FRONTEND_BASE_URL}/dashboard")

        response.set_cookie(key="session_id", value=sessionid, httponly=True, secure=True)
        return response

    else:

        sessionid =  generate_session_id()

        sessionData = {
            "role": "user",
            "oauth_id":userData.get("id"),  
            "name": userData.get("name"),
            "email": userData["email"],
            "image_url": userData.get("picture"),
            "access_token": token_data.get("access_token"),
            "refresh_token": token_data.get("refresh_token"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(seconds=token_data.get("expires_in"))).isoformat(),
            "is_signedUp": False
        }

        expire_seconds = "1h"  # Session expiration TTL

        # Store session data in Redis
        res = await store_session_in_redis(session_id=f"sessionid:{sessionid}", data=sessionData, ttl=expire_seconds)

        if not res:
            return RedirectResponse(url=f"{FRONTEND_BASE_URL}/?error=session_store_failed")
        
        # User does not exist, redirect to signup page
        response = RedirectResponse(url=f"{FRONTEND_BASE_URL}/signup")
        response.set_cookie(key="session_id", value=sessionid, httponly=True, secure=True)
        return response
         

"""
user enters the details and hits signup endpoint
get user details and cookies
user sessionid from cookie get previous stored data
store user details in db
delete old details from radis 
create a new sessionid and add correct details to radis
delete previous sessionid cookie
app another sessionid recently created 
redirect to /dashboard
"""

@authRoute.post("/signup")
async def complete_signup(signupData: signupData, request: Request, db: Session = Depends(get_db)):
    cookies = request.cookies  # no await here
    old_session_id = cookies.get("session_id")

    if not old_session_id:
        return JSONResponse(status_code=400, content={"error": "Session ID missing in cookie"})

    sessionData = await get_session_data(old_session_id) 

    if not sessionData:
        return JSONResponse(status_code=400, content={"error": "Invalid or expired session"})

    # Delete old session from Redis
    await redis_client.delete(f"sessionid:{old_session_id}")

    # Insert user into the database
    inserted_user = insert_userDetails(
        db=db,
        userDetails=signupData,
        email=sessionData.get("email"),
        oauth_provider="google",
        oauth_id=sessionData.get("oauth_id")
    )

    if not inserted_user:
        return JSONResponse(status_code=500, content={"error": "Failed to create user"})

    # Create new session
    new_session_id = generate_session_id()

    new_session_data = {
        "user_id": inserted_user.user_id,
        "role": inserted_user.role.value,
        "name": inserted_user.uname,
        "email": inserted_user.email,
        "image_url": sessionData.get("image_url"),
        "access_token": sessionData.get("access_token"),
        "refresh_token": sessionData.get("refresh_token"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": sessionData.get("expires_at"),
        "is_signedUp": True
    }

    expire_seconds = "7d"  # Session expiration TTL

    # Store new session
    await store_session_in_redis(session_id=f"sessionid:{new_session_id}", data=new_session_data, ttl=expire_seconds)

    response = JSONResponse({"redirect_to": f"{FRONTEND_BASE_URL}/dashboard"})

    # Set cookie properly
    response.set_cookie(
        key="session_id",
        value=new_session_id,
        httponly=True,
        secure=False,         # set False for localhost (True for production HTTPS)
        samesite="None",       # Important for cross-origin
    )

    return response
"""
- Get the session ID from cookies.
- Clear the session ID and associated token from Redis.
- Also delete the session ID cookie from the user's browser.
"""
@authRoute.get("/logout")
async def logout_user(request: Request):
    cookies = request.cookies
    session_id = cookies.get("session_id")

    if not session_id:
        # No session_id found, redirect anyway
        return RedirectResponse(url=f"{FRONTEND_BASE_URL}")

    session_data = await redis_client.get(f"sessionid:{session_id}") 

    if session_data:
        session_data = json.loads(session_data)
        user_id = session_data.get("user_id")

        # Delete session and user_session mapping
        await redis_client.delete(f"sessionid:{session_id}")
        await redis_client.delete(f"user_session:{user_id}")

    # Clear session cookie and redirect
    response = RedirectResponse(url=f"{FRONTEND_BASE_URL}")
    response.delete_cookie(key="session_id")

    return response


    