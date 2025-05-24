from fastapi import FastAPI
from app.routes.authRoutes import authRoute
from fastapi.middleware.cors import CORSMiddleware
from app.db.radis_client import redis_client
from pydantic import BaseModel
from scalar_fastapi import get_scalar_api_reference


app = FastAPI(title="Course Selection and Timetable System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # Frontend's origin
    allow_credentials=True,
    allow_methods=["*"],  # Ensure OPTIONS is allowed
    allow_headers=["*"],  # Allow all headers
)

@app.get("/api/sdocs", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )

app.include_router(authRoute,prefix="/api/auth",tags=["Auth"])

@app.get("/")
def say_hello():
    return {"msg":"hello"}

