from fastapi import APIRouter, Request, Depends
from app.core.response_formatter import ResponseFormatter
from app.middlewares.auth_middleware import auth_dependency, mock_auth_dependency
from app.services.user_service import UserService
from app.repositories.user_repository import UserRepository
from app.db.postgres_client import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user_schema import UpdateUserData, UserResponse
from starlette.exceptions import HTTPException
from typing import List


user_router = APIRouter(dependencies=[Depends(mock_auth_dependency)])
# user_router = APIRouter()

# dependencies=[Depends(auth_dependency)]
"""
get sessionid from cookie 
get user details from radis
query the db for details
"""


async def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    """Dependency to get UserService instance."""
    repository = UserRepository(db)
    return UserService(repository)
    

@user_router.get("/me")
async def get_current_user(request: Request):
    user = request.state.user

    data = {
        "user_id": user["user_id"],
        "role": user["role"],
        "name": user["name"],
        "email": user["email"],
        "image_url": user["image_url"],
    }

    return ResponseFormatter.success(data=data, message="User details fetched")


@user_router.get("/", response_model=UserResponse)
async def get_by_user_email(
    email: str, service: UserService = Depends(get_user_service)
):
    result = await service.get_userby_email(email=email)
    if not result:
        # Handle None (user not found)
        raise HTTPException(status_code=404, detail="User not found")

    user_response = UserResponse.model_validate(result)
    return user_response

    # return ResponseFormatter.success(data=UserResponse.model_validate(result))


@user_router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int, service: UserService = Depends(get_user_service)
):
    """
    Get user by ID.
    
    - **user_id**: ID of the user to retrieve
    
    Returns the user details if found, otherwise returns 404.
    """
    result = await service.get_user_by_id(user_id=user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    user_response = UserResponse.model_validate(result)
    return user_response


@user_router.get("/all", response_model=List[UserResponse])
async def get_all_users(service: UserService = Depends(get_user_service)):
    """
    Get all users with their details.
    
    Returns a list of all users in the system with complete user information.
    """
    try:
        users = await service.get_all_users()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")


@user_router.put("/update")
async def update_user_details(id:int,user_data:UpdateUserData,service: UserService = Depends(get_user_service)):
    try:
        return await service.update_user(id=id,**user_data.model_dump(exclude_unset=True))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@user_router.delete("/delete")
async def delete_user(id:int,service: UserService = Depends(get_user_service)):
    try:
        return await service.delete_user(id=id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))