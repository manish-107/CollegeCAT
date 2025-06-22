from app.models.model import Users
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.repository_base import BaseRepository
from typing import List


class UserRepository(BaseRepository[Users]):
    """Repository for user operations"""

    def __init__(self, session: AsyncSession):
        super().__init__(session=session, model_class=Users)

    async def get_user_by_email(self, email: str) -> Users | None:
        column_attr = getattr(self.model_class, "email")
        stmt = select(self.model_class).filter(column_attr == email)
        result = await self.session.execute(stmt)  # This is correct, DO NOT await `result`
        return result.scalar_one_or_none() 
     

    async def get_by_userid(self, user_id: int) -> Users | None:
        result = await self.session.execute(
            select(Users).where(Users.user_id == user_id)
        )
        return result.scalars().first()

    async def get_all_users(self) -> List[Users]:
        """Get all users from the database"""
        result = await self.session.execute(select(Users))
        return list(result.scalars().all())
