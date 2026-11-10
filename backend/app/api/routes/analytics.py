from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.transit_schema import HeadwayAnomalyOut, PassengerDemandOut
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Transport Analytics"])

@router.get("/delays")
def get_delay_analytics(db: Session = Depends(get_db)):
    """Returns delay distributions, average minutes behind schedule, and top delayed routes."""
    summary = AnalyticsService.get_dashboard_summary(db)
    trends = AnalyticsService.get_dashboard_trends(db)
    routes = AnalyticsService.get_routes(db)
    top_delayed = sorted(routes, key=lambda r: r["avg_delay_mins"], reverse=True)[:5]

    return {
        "on_time_performance_pct": summary["on_time_performance_pct"],
        "avg_network_delay_mins": summary["avg_network_delay_mins"],
        "delay_distribution": trends["delay_distribution"],
        "top_delayed_corridors": top_delayed
    }

@router.get("/headways", response_model=List[HeadwayAnomalyOut])
def get_headway_anomalies(
    route_id: Optional[str] = Query(None, description="Optional route filter"),
    skip: int = Query(0, ge=0, description="Records to skip for pagination"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    db: Session = Depends(get_db)
):
    """Detects bus bunching and irregular headway gaps across the network."""
    anomalies = AnalyticsService.get_headway_anomalies(db, route_id=route_id)
    s = skip if isinstance(skip, int) else getattr(skip, "default", 0)
    l = limit if isinstance(limit, int) else getattr(limit, "default", 50)
    return anomalies[s: s + l]

@router.get("/passenger-demand", response_model=List[PassengerDemandOut])
def get_passenger_demand(
    route_id: Optional[str] = Query(None, description="Optional route filter"),
    db: Session = Depends(get_db)
):
    """Returns hourly boarding volume, peak hours, and overcrowding alerts."""
    return AnalyticsService.get_passenger_demand_analysis(db, route_id=route_id)

@router.get("/route-comparison")
def get_route_comparison(db: Session = Depends(get_db)):
    """Compares on-time performance, delay, and passenger load across all corridors."""
    trends = AnalyticsService.get_dashboard_trends(db)
    return trends["route_performance_comparison"]
