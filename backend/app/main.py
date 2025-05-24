from fastapi import FastAPI,Request
from app.routes.auth_routes import authRoute
from fastapi.middleware.cors import CORSMiddleware
from scalar_fastapi import get_scalar_api_reference
from app.routes.user_routes import userRoute
from app.core.global_exception_handler import GlobalExceptionHandler


app = FastAPI(title="Course Selection and Timetable System")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return await GlobalExceptionHandler.handle(request, exc)


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
        openapi_url=app.openapi_url or "/openapi.json",
        title=app.title,
    )

app.include_router(authRoute,prefix="/api/auth",tags=["Auth"])
app.include_router(userRoute,prefix="/api/users",tags=["Users"])

@app.get("/")
def say_hello():
    return {"msg":"hello"}

