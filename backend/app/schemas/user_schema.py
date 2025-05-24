from pydantic import BaseModel
from datetime import datetime

class signupData(BaseModel):
    uname:str
    role:str
    joining_year:str
    
class UserResponse(BaseModel):
    user_id: int
    uname: str
    email: str
    role: str
    oauth_provider: str
    oauth_id: str
    joining_year: int
    is_active: bool
    created_at: datetime

    model_config = {
        "from_attributes": True  
    }