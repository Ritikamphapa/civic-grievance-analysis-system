from pydantic import BaseModel, Field
from typing import Optional


class ComplaintCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    contact: Optional[str] = Field(None, max_length=50)
    description: str = Field(..., min_length=5, max_length=2000)


class ComplaintOut(BaseModel):
    id: str
    name: str
    contact: Optional[str] = None
    description: str
    category: str
    confidence: float
    sentiment_polarity: float
    sentiment_label: str
    created_at: str
