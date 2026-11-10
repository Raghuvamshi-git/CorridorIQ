from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.models.transit import Vehicle, VehiclePosition

class VehicleRepository:
    @staticmethod
    def get_all(
        db: Session,
        status: Optional[str] = None,
        propulsion: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Vehicle]:
        query = db.query(Vehicle)
        if status and isinstance(status, str):
            query = query.filter(Vehicle.status == status)
        if propulsion and isinstance(propulsion, str):
            query = query.filter(Vehicle.propulsion_type == propulsion)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, vehicle_id: str) -> Optional[Vehicle]:
        return db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()

    @staticmethod
    def get_latest_position(db: Session, vehicle_id: str) -> Optional[VehiclePosition]:
        return db.query(VehiclePosition)\
            .filter(VehiclePosition.vehicle_id == vehicle_id)\
            .order_by(desc(VehiclePosition.timestamp))\
            .first()

    @staticmethod
    def get_positions(
        db: Session,
        route_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[VehiclePosition]:
        # Return latest position per vehicle
        vehicles = db.query(Vehicle).offset(skip).limit(limit).all()
        positions = []
        for v in vehicles:
            pos_query = db.query(VehiclePosition).filter(VehiclePosition.vehicle_id == v.vehicle_id)
            if route_id and isinstance(route_id, str):
                pos_query = pos_query.filter(VehiclePosition.route_id == route_id)
            latest = pos_query.order_by(desc(VehiclePosition.timestamp)).first()
            if latest:
                positions.append(latest)
        return positions

    @staticmethod
    def count(db: Session) -> int:
        return db.query(Vehicle).count()

