from typing import Any

from fastapi import HTTPException,status
from app.db.postgres_client import get_db
from sqlalchemy.orm import Session
from app.models.model import Users as UserModel
from app.schemas.user_schema import UserResponse, signupData as userDetails
from app.core.service_base import BaseService
from app.repositories.user_repository import UserRepository
from app.core.exceptions import NotFoundException
from app.core.response_formatter import ResponseFormatter

class UserService(BaseService):
    
    def __init__(self,repository:UserRepository):
        self._repository = repository
        
    async def get_userby_email(self,email:str):
        result =  await self._repository.get_user_by_email(email=email)
        return result
    
    async def create_user(self,**user_data:Any):
        return await self._repository.create(**user_data)
    
    async def update_user(self, id: int, **user_data: Any):
        try:
            updated_user = await self._repository.update(id=id, **user_data)
            
            
            if not updated_user:
                raise NotFoundException(details={"user_id": id})
            
        except NotFoundException as ne:
             return ResponseFormatter.failure(error=ne.message, message="User not found", status_code=404)
        
        except Exception as e:
            raise RuntimeError(f"Error updating user: {str(e)}")

        res = UserResponse.model_validate(updated_user)

        data = {
            "id":res.user_id,
            "uname":res.uname
        }
        
        return ResponseFormatter.success(data=data, message="User updated successfully")
    
    async def delete_user(self,id:int):
        try:
            return await self._repository.delete(id=id)
        except Exception as e:
            raise RuntimeError(f"Error deleting user: {str(e)}")