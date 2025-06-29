from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres_client import get_db
from app.schemas.lecturer_priority_schema import SuccessResponse
from app.services.timetable_module_service import TimetableModuleService
from app.schemas.timetable_module_schema import (
    TimetableModuleCreate,
    TimetableModuleUpdate,
    TimetableModuleResponse,
    TimetableModuleListResponse,
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/timetable-modules")

@router.post(
    "/",
    response_model=SuccessResponse,
    status_code=status.HTTP_201_CREATED,
    operation_id="create_timetable_module",
    responses={
        201: {"description": "Timetable module created successfully"},
    }
)
async def create_timetable_module(
    timetable_data: TimetableModuleCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new timetable module.
    
    - **format_id**: ID of the timetable format to use
    - **year_id**: ID of the academic year
    - **batch_id**: ID of the batch
    - **timetable_data**: JSON structure containing daily subject schedules
    
    Returns the created timetable module with all related details.
    """
    try:
        service = TimetableModuleService(db)
        
        # Validate timetable data structure
        if not service.validate_timetable_data(timetable_data.timetable_data):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bad request - Invalid data"
            )
        
        result = await service.create_timetable_module(timetable_data)
        return SuccessResponse(message="Timetable module created successfully",data=result)

        
    except ValueError as e:
        logger.error(f"Validation error in create_timetable_module: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error in create_timetable_module route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error occurred while creating timetable module"
        )

@router.get(
    "/year/{year_id}",
    response_model=TimetableModuleListResponse,
    operation_id="get_timetables_by_year",
    responses={
        200: {"description": "Timetables retrieved successfully"},
    }
)
async def get_timetables_by_year(
    year_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all timetable modules for a specific academic year.
    
    - **year_id**: ID of the academic year
    
    Returns all timetables for the year with batch details, format details, and timetable details.
    """
    try:
        service = TimetableModuleService(db)
        result = await service.get_timetables_by_year(year_id)
        
        if result.total_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No timetables found for academic year ID: {year_id}"
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_timetables_by_year route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error occurred while retrieving timetables"
        )

@router.get(
    "/year/{year_id}/batch/{batch_id}",
    response_model=TimetableModuleResponse,
    operation_id="get_timetable_by_year_and_batch",
    responses={
        200: {"description": "Timetable retrieved successfully"},
    }
)
async def get_timetable_by_year_and_batch(
    year_id: int,
    batch_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get timetable module for a specific year and batch.
    
    - **year_id**: ID of the academic year
    - **batch_id**: ID of the batch
    
    Returns the timetable with batch details, format details, and timetable details.
    """
    try:
        service = TimetableModuleService(db)
        result = await service.get_timetable_by_year_and_batch(year_id, batch_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Timetable not found for year ID: {year_id} and batch ID: {batch_id}"
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_timetable_by_year_and_batch route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error occurred while retrieving timetable"
        )

@router.get(
    "/{timetable_id}",
    response_model=TimetableModuleResponse,
    operation_id="get_timetable_by_id",
    responses={
        200: {"description": "Timetable retrieved successfully"},
    }
)
async def get_timetable_by_id(
    timetable_id: int = Path(..., description="ID of the timetable",examples=[1]),
    db: AsyncSession = Depends(get_db)
):
    """
    Get timetable module by ID.
    
    - **timetable_id**: ID of the timetable
    
    Returns the timetable with all related details.
    """
    try:
        service = TimetableModuleService(db)
        result = await service.get_timetable_by_id(timetable_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Timetable not found with ID: {timetable_id}"
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_timetable_by_id route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error occurred while retrieving timetable"
        )

@router.put(
    "/{timetable_id}",
    response_model=SuccessResponse,
    operation_id="update_timetable_module",
    responses={
        200: {"description": "Timetable updated successfully"},
    }
)
async def update_timetable_module(
    update_data: TimetableModuleUpdate,
    timetable_id: int = Path(..., description="ID of the timetable",examples=[1]),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a timetable module.
    
    - **timetable_id**: ID of the timetable to update
    - **timetable_data**: Updated JSON structure containing daily subject schedules
    
    Returns the updated timetable module with all related details.
    """
    try:
        service = TimetableModuleService(db)
        
        # Validate timetable data structure
        if not service.validate_timetable_data(update_data.timetable_data):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid timetable data structure. Must contain all days (monday, tuesday, wednesday, thursday, friday, saturday) with list values."
            )
        
        result = await service.update_timetable_module(timetable_id, update_data)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Timetable not found with ID: {timetable_id}"
            )
        
        return SuccessResponse(message="Timetable module updated successfully",data=result.timetable_id)
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error in update_timetable_module: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error in update_timetable_module route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error occurred while updating timetable module"
        )

@router.delete(
    "/{timetable_id}",
    response_model=SuccessResponse,
    operation_id="delete_timetable_module",
    responses={
        200: {"description": "Timetable deleted successfully"},
    }
)
async def delete_timetable_module(
    timetable_id: int = Path(..., description="ID of the timetable",examples=[1]),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a timetable module.
    
    - **timetable_id**: ID of the timetable to delete
    
    Returns confirmation of deletion.
    """
    try:
        service = TimetableModuleService(db)
        result = await service.delete_timetable_module(timetable_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Timetable not found with ID: {timetable_id}"
            )
        
        return SuccessResponse(message="Timetable module deleted successfully",data=result.timetable_id)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_timetable_module route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error occurred while deleting timetable module"
        ) 