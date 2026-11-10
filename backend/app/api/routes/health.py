from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.core.database import get_db, ACTIVE_DIALECT
from backend.app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def get_health(db: Session = Depends(get_db)):
    """Verifies backend service, database engine, and regional configuration."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "region": settings.OPERATING_REGION,
        "database_dialect": ACTIVE_DIALECT,
        "database_status": db_status,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "timestamp": datetime.now()
    }

