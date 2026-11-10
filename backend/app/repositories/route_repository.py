from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.models.transit import Route, Stop, StopTime, Trip

class RouteRepository:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Route]:
        return db.query(Route).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, route_id: str) -> Optional[Route]:
        target = route_id.upper()
        route = db.query(Route).filter(Route.route_id == target).first()
        if not route:
            # Also try matching route_short_name (e.g. "101" instead of "R-101")
            route = db.query(Route).filter(Route.route_short_name == target.replace("R-", "")).first()
        return route

    @staticmethod
    def count(db: Session) -> int:
        return db.query(Route).count()

