from typing import Any
from app.db.postgres_client import get_db
from sqlalchemy.orm import Session
from app.models.model import Users as UserModel
from app.schemas.user_schema import signupData as userDetails
from app.core.service_base import BaseService
from app.repository.user_repository import UserRepository

class UserService(BaseService):
    
    def __init__(self,repository:UserRepository):
        self._repository = repository
        
    async def get_userby_email(self,email:str):
        result =  await self._repository.get_user_by_email(email=email)
        return result
    
    async def create_user(self,**user_data:Any):
        return await self._repository.create(**user_data)