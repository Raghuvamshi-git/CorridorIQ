from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.transit_schema import DispatchEventOut, DispatchStatusUpdate
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/dispatch", tags=["Dispatch Recommendations"])

@router.get("/recommendations", response_model=List[DispatchEventOut])
def get_recommendations(
    status: Optional[str] = Query(None, description="PENDING_REVIEW, APPROVED, REJECTED, RESOLVED"),
    skip: int = Query(0, ge=0, description="Records to skip for pagination"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    db: Session = Depends(get_db)
):
    """Returns AI and rule-generated dispatch recommendations for human controller review."""
    recs = AnalyticsService.get_dispatch_recommendations(db, status=status)
    s = skip if isinstance(skip, int) else getattr(skip, "default", 0)
    l = limit if isinstance(limit, int) else getattr(limit, "default", 50)
    return recs[s: s + l]

@router.post("/generate", response_model=List[DispatchEventOut])
def generate_recommendations(db: Session = Depends(get_db)):
    """Triggers analytical scan across current telemetry and generates fresh dispatch interventions."""
    return AnalyticsService.generate_operational_recommendations(db)

@router.post("/recommendations/{recommendation_id}/status", response_model=DispatchEventOut)
def update_recommendation_status(
    recommendation_id: str,
    payload: DispatchStatusUpdate,
    db: Session = Depends(get_db)
):
    """Updates status of a dispatch recommendation (e.g. APPROVED, REJECTED, RESOLVED)."""
    valid_statuses = ["PENDING_REVIEW", "APPROVED", "REJECTED", "RESOLVED"]
    if payload.status.upper() not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{payload.status}'. Must be one of {valid_statuses}."
        )

    updated = AnalyticsService.update_recommendation_status(db, recommendation_id, payload.status.upper())
    if not updated:
        raise HTTPException(
            status_code=404,
            detail=f"Dispatch recommendation '{recommendation_id}' not found."
        )

    return updated
