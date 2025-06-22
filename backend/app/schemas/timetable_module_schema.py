from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class TimetableModuleCreate(BaseModel):
    """Schema for creating a new timetable module"""
    format_id: int = Field(..., description="ID of the timetable format to use", examples=[1])
    year_id: int = Field(..., description="ID of the academic year", examples=[1])
    batch_id: int = Field(..., description="ID of the batch", examples=[1])
    timetable_data: Dict[str, List[str]] = Field(
        ..., 
        description="JSON structure containing daily subject schedules",
        examples=[{
            "monday": ["NoSQL", "C#.NET", "AWT", "CN", "Lab"],
            "tuesday": ["CN", "IoT", "AWT", "C#.NET", "Lab"],
            "wednesday": ["AWT", "Lab", "CN", "AWT"],
            "thursday": ["C#.NET", "CN", "NoSQL", "Lab", "Project"],
            "friday": ["IoT", "NoSQL", "C#.NET", "AWT", "Project"],
            "saturday": ["", "", "", "", "", "", ""]
        }]
    )

class TimetableModuleUpdate(BaseModel):
    """Schema for updating a timetable module"""
    timetable_data: Dict[str, List[str]] = Field(
        ..., 
        description="Updated JSON structure containing daily subject schedules",
        examples=[{
            "monday": ["Updated Subject 1", "Updated Subject 2", "AWT", "CN", "Lab"],
            "tuesday": ["CN", "IoT", "AWT", "C#.NET", "Lab"],
            "wednesday": ["AWT", "Lab", "CN", "AWT"],
            "thursday": ["C#.NET", "CN", "NoSQL", "Lab", "Project"],
            "friday": ["IoT", "NoSQL", "C#.NET", "AWT", "Project"],
            "saturday": ["", "", "", "", "", "", ""]
        }]
    )

class TimetableFormatDetails(BaseModel):
    """Schema for timetable format details in responses"""
    format_id: int = Field(..., description="Unique identifier for the timetable format", examples=[1])
    format_name: str = Field(..., description="Name of the timetable format", examples=["Standard 8-Hour Format"])
    format_data: Dict[str, List[int]] = Field(..., description="JSON data containing the timetable format structure with day arrays of period numbers")
    created_at: datetime = Field(..., description="Timestamp when the format was created")

class BatchDetails(BaseModel):
    """Schema for batch details in responses"""
    batch_id: int = Field(..., description="Unique identifier for the batch", examples=[1])
    section: str = Field(..., description="Section name of the batch", examples=["A"])
    noOfStudent: int = Field(..., description="Number of students in the batch", examples=[60])
    created_at: datetime = Field(..., description="Timestamp when the batch was created")

class AcademicYearDetails(BaseModel):
    """Schema for academic year details in responses"""
    year_id: int = Field(..., description="Unique identifier for the academic year", examples=[1])
    academic_year: str = Field(..., description="Academic year name", examples=["2024-2025"])
    created_at: datetime = Field(..., description="Timestamp when the academic year was created")

class TimetableModuleResponse(BaseModel):
    """Schema for timetable module response"""
    timetable_id: int = Field(..., description="Unique identifier for the timetable", examples=[1])
    format_id: int = Field(..., description="ID of the timetable format used", examples=[1])
    year_id: int = Field(..., description="ID of the academic year", examples=[1])
    batch_id: int = Field(..., description="ID of the batch", examples=[1])
    timetable_data: Dict[str, List[str]] = Field(..., description="JSON structure containing daily subject schedules")
    created_at: datetime = Field(..., description="Timestamp when the timetable was created")
    format_details: TimetableFormatDetails = Field(..., description="Details of the timetable format")
    batch_details: BatchDetails = Field(..., description="Details of the batch")
    academic_year_details: AcademicYearDetails = Field(..., description="Details of the academic year")

class TimetableModuleListResponse(BaseModel):
    """Schema for list of timetable modules response"""
    timetables: List[TimetableModuleResponse] = Field(..., description="List of timetable modules")
    total_count: int = Field(..., description="Total number of timetables", examples=[5])

class TimetableModuleDeleteResponse(BaseModel):
    """Schema for timetable module deletion response"""
    message: str = Field(..., description="Success message", examples=["Timetable module deleted successfully"])
    timetable_id: int = Field(..., description="ID of the deleted timetable", examples=[1])

class TimetableModuleUpdateResponse(BaseModel):
    """Schema for timetable module update response"""
    message: str = Field(..., description="Success message", examples=["Timetable module updated successfully"])
    timetable_id: int = Field(..., description="ID of the updated timetable", examples=[1])
    updated_data: TimetableModuleResponse = Field(..., description="Updated timetable data")

class ErrorResponse(BaseModel):
    """Schema for error responses"""
    detail: str = Field(..., description="Error message", examples=["Timetable module not found"]) 