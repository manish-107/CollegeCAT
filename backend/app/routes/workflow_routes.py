from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres_client import get_db
from app.schemas.workflow_schema import WorkflowStageCreate
from app.services.workflow_service import WorkflowService
from app.schemas.lecturer_priority_schema import SuccessResponse

workflow_router = APIRouter(prefix="/workflow", tags=["Workflow Management"])


@workflow_router.post("/create", response_model=SuccessResponse, operation_id="create_workflow_stage")
async def create_workflow_stage(
    workflow_data: WorkflowStageCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new workflow stage for an academic year"""
    service = WorkflowService(db)
    result = await service.create_workflow_stage(workflow_data)
    return SuccessResponse(message="Workflow stage created successfully",data=result)


@workflow_router.get("/year/{year_id}", operation_id="get_workflow_stage_by_year")
async def get_workflow_stage_by_year(
    year_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get workflow stage for a specific academic year"""
    service = WorkflowService(db)
    return await service.get_workflow_stage_by_year(year_id)


@workflow_router.put("/increment/{year_id}", operation_id="increment_workflow_step")
async def increment_workflow_step(
    year_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Increment the current workflow step by 1"""
    service = WorkflowService(db)
    return await service.increment_step(year_id)


@workflow_router.put("/complete/{year_id}", response_model=SuccessResponse, operation_id="complete_workflow")
async def complete_workflow(
    year_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Mark workflow as completed"""
    service = WorkflowService(db)
    await service.complete_workflow(year_id) 
    return SuccessResponse(message="Workflow completed successfully",data=year_id)