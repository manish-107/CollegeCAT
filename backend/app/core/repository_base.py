from typing import Generic, TypeVar
from app.models.model import BaseClass
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict,Any,Sequence
from sqlalchemy import select

ModelType = TypeVar("ModelType", bound=BaseClass)


class BaseRepository(Generic[ModelType]):
    def __init__(self, session: AsyncSession, model_class: type[ModelType]):
        self.session = session
        self.model_class = model_class
        
    async def create(self, **kwargs:Dict[str,Any]) -> ModelType | None:
        """ create new record """
        instance  = self.model_class(**kwargs)
        self.session.add(instance)
        await self.session.commit()
        await self.session.refresh(instance)
        return instance
    
    async def get_by_id(self,id:int) -> ModelType | None:
        """ get record by id"""
        return await self.session.get(self.model_class,id)
    
    async def get_all(self) -> Sequence[ModelType]:
        result = await self.session.execute(select(self.model_class))
        return result.scalars().all()
    
    async def update(self,id:int,**kwargs:Dict[str,Any]) -> ModelType | None:
        """Update record by id"""
        instance =  await self.get_by_id(id=id)
        
        if not instance:
            return None
        
        for key,value in kwargs.items():
            setattr(instance,key,value)
            
        await self.session.commit()
        await self.session.refresh(instance)
        return instance
    
    async def delete(self,id:int) -> bool:
        """Delete record with id"""
        instance  = await self.get_by_id(id)
        
        if not instance:
            return False
        
        await self.session.delete(instance)
        await self.session.refresh(self.model_class)
        return True
    
    async def get_by_existing_field(self,field:str,value:Any) -> ModelType | None:
        """Get by existing field"""
        
        if not hasattr(self.model_class,field):
            return None
        
        column_attr = getattr(self.model_class,field)
        stmt = select(self.model_class).where(column_attr == value)
        
        result = await self.session.execute(stmt)
        return result.scalars().first()
        
        
            
        
