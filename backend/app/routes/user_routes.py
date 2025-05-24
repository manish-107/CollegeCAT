from fastapi import APIRouter, Request, Depends
from app.middlewares.auth_middleware import auth_dependency
from app.core.response_formatter import ResponseFormatter
from app.services.user_service import UserService
from app.repository.user_repository import UserRepository
from app.db.postgres_client import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user_schema import UserResponse
from starlette.exceptions import HTTPException


user_router = APIRouter()
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

    return ResponseFormatter.success(data=data,message="User details fetched")


@user_router.get("/", response_model=UserResponse)
async def get_by_user_email(email: str, service: UserService = Depends(get_user_service)):
    result = await service._repository.get_by_id(1)
    if not result:
        # Handle None (user not found)
        raise HTTPException(status_code=404, detail="User not found")

    user_response = UserResponse.model_validate(result)
    return user_response
    
    
    
    # return ResponseFormatter.success(data=UserResponse.model_validate(result))

@user_router.put("/update")
def update_user_details():
    return ResponseFormatter.success(data=1,message="User updated successfully")
