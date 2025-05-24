from typing import Generic, TypeVar, Sequence, Any
from app.models.model import BaseClass
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

ModelType = TypeVar("ModelType", bound=BaseClass)

class BaseRepository(Generic[ModelType]):
    def __init__(self, session: AsyncSession, model_class: type[ModelType]):
        self.session = session
        self.model_class = model_class

    async def create(self, **kwargs) -> ModelType | None:
        instance = self.model_class(**kwargs)
        self.session.add(instance)
        await self.session.commit()
        await self.session.refresh(instance)
        return instance

    async def get_by_id(self, id: int) -> ModelType | None:
        print("------")
        try:
            result = await self.session.get(self.model_class, id)
        except Exception as e:
            print(f"error- {str(e)}")
        print(result)
        print("------")
        return result

    async def get_all(self) -> Sequence[ModelType]:
        result = await self.session.execute(select(self.model_class))
        return result.scalars().all()

    async def update(self, id: int, **kwargs) -> ModelType | None:
        instance = await self.get_by_id(id)
        if not instance:
            return None

        for key, value in kwargs.items():
            setattr(instance, key, value)

        await self.session.commit()
        await self.session.refresh(instance)
        return instance

    async def delete(self, id: int) -> bool:
        instance = await self.get_by_id(id)
        if not instance:
            return False

        await self.session.delete(instance)
        await self.session.commit()
        return True
    
    async def get_by_existing_field(self, field: str, value: Any) -> ModelType | None:
        if not hasattr(self.model_class, field):
            raise ValueError(f"'{field}' is not a valid field of {self.model_class.__name__}")
        
        column_attr = getattr(self.model_class, field)
        stmt = select(self.model_class).filter(column_attr == value)
        result = await self.session.execute(stmt)  # This is correct, DO NOT await `result`
        return result.scalar_one_or_none() 

    async def filter_by(self, **filters) -> Sequence[ModelType]:
        stmt = select(self.model_class).filter_by(**filters)
        result = await self.session.execute(stmt)
        return result.scalars().all()
