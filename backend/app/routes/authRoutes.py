from fastapi import APIRouter,Request,Depends
from fastapi.responses import JSONResponse
import httpx
from app.config import GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,REDIRECT_URI
from app.db.postgres_client import get_db
from sqlalchemy.orm import Session
from app.services.user_service import get_userby_email
from app.services.auth_services import get_userDetails_from_google

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
async def signin_redirect(request:Request,db:Session = Depends(get_db)):
    code = request.query_params.get("code")

    if not code:
        return JSONResponse(status_code=400, content={"error": "Authorization code missing"})
    
    # Make request to Google's token endpoint
    async with httpx.AsyncClient() as client:
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

    token_data = response.json()


    if "error" in token_data:
        return JSONResponse(
            status_code=400,
            content={"error": token_data.get("error_description", "OAuth token exchange failed")},
        )

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in")

    userData = await get_userDetails_from_google(access_token)

    if "error" in userData or "email" not in userData:
        return JSONResponse(status_code=400, content={"error": "Failed to fetch user info from Google"})

    email = userData["email"]

    user_exists = get_userby_email(email=email, db=db)

    if user_exists and user_exists.email == email:
        # store it in Redis
        pass


    return {
        "access_token": access_token,
        "token": token_data,
        "refresh_token": refresh_token,
        "expires_in": expires_in,
        "userData" : userData
    }



"""
- Get the session ID from cookies.
- Clear the session ID and associated token from Redis.
- Also delete the session ID cookie from the user's browser.
"""
# authRoute.get("\logout")
# def logout_user():
#     pass