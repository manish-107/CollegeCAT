from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class WorkflowStageBase(BaseModel):
    year_id: int = Field(..., description="Academic year ID")
    current_step: int = Field(..., description="Current workflow step (1-12)")
    is_completed: bool = Field(default=False, description="Whether the workflow is completed")


class WorkflowStageCreate(WorkflowStageBase):
    pass


class WorkflowStageResponse(WorkflowStageBase):
    id: int = Field(..., description="Workflow stage ID")
    created_at: datetime = Field(..., description="When the record was created")
    
    class Config:
        from_attributes = True


class WorkflowStepResponse(BaseModel):
    year_id: int = Field(..., description="Academic year ID")
    current_step: int = Field(..., description="Current workflow step")
    step_name: str = Field(..., description="Name of the current step")
    is_completed: bool = Field(..., description="Whether the workflow is completed")
    total_steps: int = Field(..., description="Total number of steps (12)")
    
    class Config:
        from_attributes = True 