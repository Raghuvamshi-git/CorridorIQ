from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.models.transit import DispatchEvent

class DispatchRepository:
    @staticmethod
    def get_all(
        db: Session,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[DispatchEvent]:
        query = db.query(DispatchEvent)
        if status and isinstance(status, str):
            query = query.filter(DispatchEvent.status == status)
        return query.order_by(desc(DispatchEvent.created_at)).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, recommendation_id: str) -> Optional[DispatchEvent]:
        return db.query(DispatchEvent).filter(DispatchEvent.recommendation_id == recommendation_id).first()

    @staticmethod
    def update_status(db: Session, recommendation_id: str, new_status: str) -> Optional[DispatchEvent]:
        event = db.query(DispatchEvent).filter(DispatchEvent.recommendation_id == recommendation_id).first()
        if not event:
            return None
        event.status = new_status
        event.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def create(db: Session, event_data: Dict[str, Any]) -> DispatchEvent:
        event = DispatchEvent(**event_data)
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def count_pending(db: Session) -> int:
        return db.query(DispatchEvent).filter(DispatchEvent.status == "PENDING_REVIEW").count()

