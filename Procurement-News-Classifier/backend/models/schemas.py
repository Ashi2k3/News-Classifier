from pydantic import BaseModel
from typing import Optional

class RiskClassification(BaseModel):
    category: str
    risk_score: int
    entity: str
    impact_summary: str

class NewsItem(BaseModel):
    id: str
    title: str
    description: str
    url: str
    published_at: str
    classification: Optional[RiskClassification] = None