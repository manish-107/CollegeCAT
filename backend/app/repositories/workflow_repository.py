from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional
from app.models.model import WorkflowStage
from app.schemas.workflow_schema import WorkflowStageCreate


class WorkflowRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_workflow_stage(self, workflow_data: WorkflowStageCreate) -> WorkflowStage:
        """Create a new workflow stage for an academic year"""
        workflow_stage = WorkflowStage(**workflow_data.model_dump())
        self.db.add(workflow_stage)
        await self.db.commit()
        await self.db.refresh(workflow_stage)
        return workflow_stage
    
    async def get_workflow_stage_by_year(self, year_id: int) -> Optional[WorkflowStage]:
        """Get workflow stage for a specific academic year"""
        query = select(WorkflowStage).where(WorkflowStage.year_id == year_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def increment_step(self, year_id: int) -> Optional[WorkflowStage]:
        """Increment the current step by 1"""
        current_workflow = await self.get_workflow_stage_by_year(year_id)
        if not current_workflow:
            return None
        
        # Check if we can increment (max step is 12)
        if current_workflow.current_step < 12:
            new_step = current_workflow.current_step + 1
            # Mark as completed if we reach step 12
            is_completed = new_step == 12
            
            query = (
                update(WorkflowStage)
                .where(WorkflowStage.year_id == year_id)
                .values(current_step=new_step, is_completed=is_completed)
                .returning(WorkflowStage)
            )
            
            result = await self.db.execute(query)
            await self.db.commit()
            return result.scalar_one_or_none()
        
        return current_workflow
    
    async def complete_workflow(self, year_id: int) -> Optional[WorkflowStage]:
        """Mark workflow as completed"""
        query = (
            update(WorkflowStage)
            .where(WorkflowStage.year_id == year_id)
            .values(is_completed=True)
            .returning(WorkflowStage)
        )
        
        result = await self.db.execute(query)
        await self.db.commit()
        return result.scalar_one_or_none() 