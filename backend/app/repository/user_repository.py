from app.models.model import Users
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


class UserRepository:
    """Repository for user operations"""

    def __init__(self, session: AsyncSession):  
        self.session = session

    async def get_user_by_email(self, email: str) -> Users | None:
        result = await self.session.execute(select(Users).where(Users.email == email))
        return result.scalars().first()
    
    async def get_by_userid(self,user_id:int) -> Users | None:
        result = await self.session.execute(select(Users).where(Users.user_id == user_id))
        return result.scalars().first()
