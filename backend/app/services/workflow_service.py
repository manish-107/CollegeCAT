from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from fastapi.responses import JSONResponse
from app.repositories.workflow_repository import WorkflowRepository
from app.schemas.workflow_schema import WorkflowStageCreate
from app.models.model import WorkflowStageEnum
from app.core.response_formatter import ResponseFormatter
from fastapi import HTTPException

class WorkflowService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = WorkflowRepository(db)
    
    def get_step_name(self, step_number: int) -> str:
        """Get the name of a step by its number"""
        try:
            return WorkflowStageEnum(step_number).name
        except ValueError:
            return f"Step {step_number}"
    
    async def create_workflow_stage(self, workflow_data: WorkflowStageCreate) -> int:
        """Create a new workflow stage"""
        # Check if workflow already exists for this year
        existing = await self.repository.get_workflow_stage_by_year(workflow_data.year_id)
        if existing:
            raise HTTPException(status_code=400, detail="Workflow stage already exists for this academic year")
        
        workflow_stage = await self.repository.create_workflow_stage(workflow_data)
        return workflow_stage.id
            
  
    
    async def get_workflow_stage_by_year(self, year_id: int) -> JSONResponse:
        """Get workflow stage for a specific academic year"""
        workflow_stage = await self.repository.get_workflow_stage_by_year(year_id)
        
        if not workflow_stage:
            return ResponseFormatter.failure(
                error="Workflow stage not found for this academic year",
                message="Workflow stage not found for this academic year",
                status_code=404
            )
        
        # Create response with step name
        response_data = {
            "year_id": workflow_stage.year_id,
            "current_step": workflow_stage.current_step,
            "step_name": self.get_step_name(workflow_stage.current_step),
            "is_completed": workflow_stage.is_completed,
            "total_steps": 12
        }
        
        return ResponseFormatter.success(
            data=response_data,
            message="Workflow stage retrieved successfully"
        )
    
    async def increment_step(self, year_id: int) -> dict:
        """Increment the current step by 1"""
        workflow_stage = await self.repository.increment_step(year_id)
        
        if not workflow_stage:
            raise HTTPException(status_code=404, detail="Workflow stage not found or cannot increment further")
        
        # Create response with step name
        response_data = {
            "year_id": workflow_stage.year_id,
            "current_step": workflow_stage.current_step,
            "step_name": self.get_step_name(workflow_stage.current_step),
            "is_completed": workflow_stage.is_completed,
            "total_steps": 12
        }
        
        message = "Step incremented successfully"
        if workflow_stage.is_completed:
            message = "Workflow completed successfully!"
        
        return response_data
    
    async def complete_workflow(self, year_id: int) -> dict:
        """Mark workflow as completed"""
        workflow_stage = await self.repository.complete_workflow(year_id)
        
        if not workflow_stage:
            raise HTTPException(status_code=404, detail="Workflow stage not found")
        
        response_data = {
            "year_id": workflow_stage.year_id,
            "current_step": workflow_stage.current_step,
            "step_name": self.get_step_name(workflow_stage.current_step),
            "is_completed": workflow_stage.is_completed,
            "total_steps": 12
        }
        
        return response_data