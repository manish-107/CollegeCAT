from fastapi import FastAPI
from app.routes.authRoutes import authRoute
from fastapi.middleware.cors import CORSMiddleware
from app.db.radis_client import redis_client
from pydantic import BaseModel

app = FastAPI(title="Course Selection and Timetable System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # Frontend's origin
    allow_credentials=True,
    allow_methods=["*"],  # Ensure OPTIONS is allowed
    allow_headers=["*"],  # Allow all headers
)

app.include_router(authRoute,prefix="/api/auth",tags=["Auth"])

@app.get("/")
def say_hello():
    return {"msg":"hello"}

