from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class TimetableFormatCreate(BaseModel):
    """Schema for creating a new timetable format"""
    year_id: int = Field(..., description="ID of the academic year", examples=[1])
    batch_id: int = Field(..., description="ID of the batch", examples=[1])
    format_name: str = Field(..., description="Name of the timetable format", examples=["Standard 8-Hour Format"])
    format_data: Dict[str, List[int]] = Field(..., description="JSON data containing the timetable format structure with day arrays of period numbers", examples=[{
        "monday": [1, 1, 1, 1, 3],
        "tuesday": [1, 1, 1, 1, 3],
        "wednesday": [1, 3, 1, 1],
        "thursday": [1, 1, 1, 1, 3],
        "friday": [1, 1, 1, 1, 3],
        "saturday": [1, 1, 1, 1, 1, 1, 1]
    }])

class TimetableFormatUpdate(BaseModel):
    """Schema for updating a timetable format"""
    format_name: Optional[str] = Field(None, description="Name of the timetable format", examples=["Updated Format Name"])
    format_data: Optional[Dict[str, List[int]]] = Field(None, description="JSON data containing the updated timetable format structure with day arrays of period numbers", examples=[{
        "monday": [1, 1, 1, 1, 3],
        "tuesday": [1, 1, 1, 1, 3],
        "wednesday": [1, 3, 1, 1],
        "thursday": [1, 1, 1, 1, 3],
        "friday": [1, 1, 1, 1, 3],
        "saturday": [1, 1, 1, 1, 1, 1, 1]
    }])

class YearDetails(BaseModel):
    """Schema for academic year details"""
    year_id: int = Field(..., description="Unique identifier for the academic year", examples=[1])
    academic_year: str = Field(..., description="Academic year name", examples=["2024-2025"])
    created_at: datetime = Field(..., description="Timestamp when the academic year was created")

class BatchDetails(BaseModel):
    """Schema for batch details"""
    batch_id: int = Field(..., description="Unique identifier for the batch", examples=[1])
    section: str = Field(..., description="Section name of the batch", examples=["A"])
    noOfStudent: int = Field(..., description="Number of students in the batch", examples=[60])
    created_at: datetime = Field(..., description="Timestamp when the batch was created")

class TimetableFormatResponse(BaseModel):
    """Schema for timetable format response"""
    format_id: int = Field(..., description="Unique identifier for the timetable format", examples=[1])
    format_name: str = Field(..., description="Name of the timetable format", examples=["Standard 8-Hour Format"])
    format_data: Dict[str, List[int]] = Field(..., description="JSON data containing the timetable format structure with day arrays of period numbers")
    created_at: datetime = Field(..., description="Timestamp when the format was created")
    year_details: YearDetails = Field(..., description="Details of the academic year")
    batch_details: BatchDetails = Field(..., description="Details of the batch")

class TimetableFormatListResponse(BaseModel):
    """Schema for list of timetable formats response"""
    formats: List[TimetableFormatResponse] = Field(..., description="List of timetable formats")
    total_count: int = Field(..., description="Total number of formats", examples=[5])

class TimetableFormatDeleteResponse(BaseModel):
    """Schema for timetable format deletion response"""
    message: str = Field(..., description="Success message", examples=["Timetable format deleted successfully"])
    format_id: int = Field(..., description="ID of the deleted format", examples=[1])

class ErrorResponse(BaseModel):
    """Schema for error responses"""
    detail: str = Field(..., description="Error message", examples=["Timetable format not found"]) 