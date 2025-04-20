from fastapi import APIRouter,Request
from app.config import GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,REDIRECT_URI
from fastapi.responses import JSONResponse
import httpx

authRoute = APIRouter()

@authRoute.get("/callback")
async def signin_redirect(request:Request):
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

    return {
        "access_token": access_token,
        "token": token_data,
        "refresh_token": refresh_token,
        "expires_in": expires_in,
    }