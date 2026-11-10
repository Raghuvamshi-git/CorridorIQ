from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.models.transit import Trip, StopTime, TripUpdate, Stop

class TripRepository:
    @staticmethod
    def get_trips(
        db: Session,
        route_id: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Trip]:
        query = db.query(Trip)
        if route_id and isinstance(route_id, str):
            query = query.filter(Trip.route_id == route_id)
        if status and isinstance(status, str):
            query = query.filter(Trip.trip_status == status)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_trip_updates(
        db: Session,
        route_id: Optional[str] = None,
        is_bunching: Optional[bool] = None,
        is_long_headway: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[TripUpdate]:
        query = db.query(TripUpdate)
        if route_id and isinstance(route_id, str):
            query = query.filter(TripUpdate.route_id == route_id)
        if is_bunching is not None:
            query = query.filter(TripUpdate.is_bunching == is_bunching)
        if is_long_headway is not None:
            query = query.filter(TripUpdate.is_long_headway == is_long_headway)
        return query.order_by(desc(TripUpdate.update_timestamp)).offset(skip).limit(limit).all()

    @staticmethod
    def get_stop_times_for_trip(db: Session, trip_id: str) -> List[StopTime]:
        return db.query(StopTime)\
            .filter(StopTime.trip_id == trip_id)\
            .order_by(StopTime.stop_sequence)\
            .all()

