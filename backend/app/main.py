   # CI/CD pipeline test
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routers import complaints
from app import database

app = FastAPI(
    title="Civic Grievance Analysis System",
    description="AI-powered platform for classifying and analyzing civic complaints.",
    version="1.0.0",
)

# Allow the React frontend (local dev + deployed) to call this API.
# In production, replace "*" with your actual frontend URL for tighter security.
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints.router)


@app.get("/")
async def root():
    return {
        "message": "Civic Grievance Analysis System API is running.",
        "using_mongo": database.using_mongo(),
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}
