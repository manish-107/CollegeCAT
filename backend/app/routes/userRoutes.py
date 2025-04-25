from fastapi import APIRouter

userRoute = APIRouter()

"""
get sessionid from cookie 
get user details from radis
query the db for details
"""
@userRoute.get("/me")
def get_current_user():
    pass


@userRoute.put("/update")
def update_user_details():
    pass