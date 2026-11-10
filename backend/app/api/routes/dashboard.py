from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.transit_schema import DashboardSummaryOut, DashboardTrendsOut
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.data_generator import seed_database_data

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Returns top-level KPI cards and transport network overview metrics."""
    return AnalyticsService.get_dashboard_summary(db)

@router.get("/trends", response_model=DashboardTrendsOut)
def get_dashboard_trends(db: Session = Depends(get_db)):
    """Returns hourly ridership, delay distribution, and route comparison trends."""
    return AnalyticsService.get_dashboard_trends(db)

@router.post("/seed")
def trigger_seed(db: Session = Depends(get_db)):
    """Resets and regenerates realistic synthetic transport data for Hyderabad corridors."""
    stats = seed_database_data(db)
    return {
        "status": "success",
        "message": "Hyderabad transport network simulated data refreshed successfully.",
        "stats": stats
    }

