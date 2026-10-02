from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.models import ComplaintCreate, ComplaintOut
from app.nlp_utils import analyze_complaint
from app import database

router = APIRouter(prefix="/complaints", tags=["Complaints"])


@router.post("", response_model=ComplaintOut, status_code=201)
async def create_complaint(payload: ComplaintCreate):
    """Submit a new grievance. Category and sentiment are assigned automatically."""
    analysis = analyze_complaint(payload.description)

    doc = {
        "name": payload.name,
        "contact": payload.contact,
        "description": payload.description,
        **analysis,
    }
    saved = await database.insert_complaint(doc)
    return saved


@router.get("", response_model=list[ComplaintOut])
async def get_complaints(category: Optional[str] = Query(None, description="Filter by category")):
    """List all complaints, most recent first. Optionally filter by category."""
    return await database.list_complaints(category=category)


@router.get("/stats")
async def get_complaint_stats():
    """Aggregate counts by category and by sentiment, for a simple dashboard."""
    return await database.get_stats()
