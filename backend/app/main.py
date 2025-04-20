from fastapi import FastAPI
from app.routes.authRoutes import authRoute
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Course Selection and Timetable System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authRoute,prefix="/api/auth",tags=["Auth"])

@app.get("/")
def say_hello():
    return {"msg":"hello"}


