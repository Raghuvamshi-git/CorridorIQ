from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.transit_schema import VehicleOut, VehiclePositionOut
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/vehicles", tags=["Vehicles & Fleet"])

@router.get("", response_model=List[VehicleOut])
def get_vehicles(
    status: Optional[str] = Query(None, description="IN_SERVICE, MAINTENANCE, IDLE"),
    propulsion: Optional[str] = Query(None, description="ELECTRIC, DIESEL, CNG, HYBRID"),
    skip: int = Query(0, ge=0, description="Records to skip for pagination"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    db: Session = Depends(get_db)
):
    """Returns the fleet inventory with fuel/battery %, passenger load, and current trip."""
    vehicles = AnalyticsService.get_vehicles(db, status=status, propulsion=propulsion)
    s = skip if isinstance(skip, int) else getattr(skip, "default", 0)
    l = limit if isinstance(limit, int) else getattr(limit, "default", 100)
    return vehicles[s: s + l]

@router.get("/positions", response_model=List[VehiclePositionOut])
def get_vehicle_positions(
    route_id: Optional[str] = Query(None, description="Filter positions by route ID"),
    skip: int = Query(0, ge=0, description="Records to skip for pagination"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    db: Session = Depends(get_db)
):
    """Returns simulated live GPS positions, speeds, and occupancies for map visualization."""
    positions = AnalyticsService.get_vehicle_positions(db, route_id=route_id)
    s = skip if isinstance(skip, int) else getattr(skip, "default", 0)
    l = limit if isinstance(limit, int) else getattr(limit, "default", 100)
    return positions[s: s + l]

@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle_by_id(vehicle_id: str, db: Session = Depends(get_db)):
    """Returns telemetry and diagnostic details for a specific vehicle."""
    vehicles = AnalyticsService.get_vehicles(db)
    matched = [v for v in vehicles if v["vehicle_id"] == vehicle_id]
    if not matched:
        raise HTTPException(status_code=404, detail=f"Vehicle '{vehicle_id}' not found.")
    return matched[0]
