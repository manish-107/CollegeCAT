from pydantic import BaseModel

class signupData(BaseModel):
    uname:str
    role:str
    joining_year:str