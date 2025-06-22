from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres_client import get_db
from app.schemas.workflow_schema import WorkflowStageCreate
from app.services.workflow_service import WorkflowService
from app.middlewares.auth_middleware import mock_auth_dependency

workflow_router = APIRouter(prefix="/workflow", tags=["Workflow Management"])


@workflow_router.post("/create")
async def create_workflow_stage(
    workflow_data: WorkflowStageCreate,
    db: AsyncSession = Depends(get_db),
    user_data = Depends(mock_auth_dependency)
):
    """Create a new workflow stage for an academic year"""
    service = WorkflowService(db)
    return await service.create_workflow_stage(workflow_data)


@workflow_router.get("/year/{year_id}")
async def get_workflow_stage_by_year(
    year_id: int,
    db: AsyncSession = Depends(get_db),
    user_data = Depends(mock_auth_dependency)
):
    """Get workflow stage for a specific academic year"""
    service = WorkflowService(db)
    return await service.get_workflow_stage_by_year(year_id)


@workflow_router.put("/increment/{year_id}")
async def increment_workflow_step(
    year_id: int,
    db: AsyncSession = Depends(get_db),
    user_data = Depends(mock_auth_dependency)
):
    """Increment the current workflow step by 1"""
    service = WorkflowService(db)
    return await service.increment_step(year_id)


@workflow_router.put("/complete/{year_id}")
async def complete_workflow(
    year_id: int,
    db: AsyncSession = Depends(get_db),
    user_data = Depends(mock_auth_dependency)
):
    """Mark workflow as completed"""
    service = WorkflowService(db)
    return await service.complete_workflow(year_id) 