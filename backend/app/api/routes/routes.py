from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.transit_schema import RouteOut, RouteDetailOut, HeadwayAnomalyOut
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/routes", tags=["Routes & Corridors"])

@router.get("", response_model=List[RouteOut])
def get_routes(db: Session = Depends(get_db)):
    """Lists all monitored corridors with on-time performance, active buses, and delays."""
    return AnalyticsService.get_routes(db)

@router.get("/{route_id}", response_model=RouteDetailOut)
def get_route_detail(route_id: str, db: Session = Depends(get_db)):
    """Returns detailed corridor breakdown including stop sequences and live vehicles."""
    detail = AnalyticsService.get_route_details(db, route_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Route '{route_id}' not found.")
    return detail

@router.get("/{route_id}/performance")
def get_route_performance(route_id: str, db: Session = Depends(get_db)):
    """Returns detailed performance indicators for a single route."""
    detail = AnalyticsService.get_route_details(db, route_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Route '{route_id}' not found.")
    return {
        "route_id": route_id,
        "performance": detail["route"],
        "bunching_detected": detail["bunching_detected"],
        "active_vehicle_count": len(detail["active_vehicles"])
    }

@router.get("/{route_id}/headways", response_model=List[HeadwayAnomalyOut])
def get_route_headways(route_id: str, db: Session = Depends(get_db)):
    """Returns headway deviations and detected bus bunching on a specific corridor."""
    return AnalyticsService.get_headway_anomalies(db, route_id=route_id)

