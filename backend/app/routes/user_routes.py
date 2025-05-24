from fastapi import APIRouter, Request, Depends
from app.middlewares.auth_middleware import auth_dependency
from app.core.response_formatter import ResponseFormatter

userRoute = APIRouter(dependencies=[Depends(auth_dependency)])

"""
get sessionid from cookie 
get user details from radis
query the db for details
"""


@userRoute.get("/me")
async def get_current_user(request: Request):
    user = request.state.user

    data = {
        "user_id": user["user_id"],
        "role": user["role"],
        "name": user["name"],
        "email": user["email"],
        "image_url": user["image_url"],
    }

    return ResponseFormatter.success(data=data,message="User details fetched")


@userRoute.put("/update")
def update_user_details():
    return ResponseFormatter.success(data=1,message="User updated successfully")
