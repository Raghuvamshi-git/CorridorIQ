import os
import sys
import pytest

# Ensure root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.core.database import SessionLocal, init_db
from backend.app.services.data_generator import seed_database_data
from backend.app.api.routes.health import get_health
from backend.app.api.routes.dashboard import get_dashboard_summary, get_dashboard_trends
from backend.app.api.routes.routes import get_routes, get_route_detail, get_route_headways
from backend.app.api.routes.vehicles import get_vehicles, get_vehicle_positions
from backend.app.api.routes.analytics import get_delay_analytics, get_headway_anomalies, get_passenger_demand
from backend.app.api.routes.dispatch import get_recommendations, update_recommendation_status
from backend.app.api.routes.agent import chat_with_agent
from backend.app.schemas.transit_schema import AgentChatRequest, DispatchStatusUpdate
from backend.app.models.transit import Route

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Ensures database has records."""
    init_db()
    db = SessionLocal()
    if db.query(Route).count() == 0:
        seed_database_data(db)
    db.close()


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_health_endpoint(db):
    data = get_health(db)
    assert data["status"] == "online"
    assert "Hyderabad" in data["region"]
    assert data["database_status"] == "connected"


def test_dashboard_summary(db):
    data = get_dashboard_summary(db)
    assert data["city"] == "Hyderabad"
    assert data["total_routes"] == 12
    assert data["total_active_vehicles"] > 0
    assert data["on_time_performance_pct"] >= 0.0
    assert data["total_passengers_today"] > 0
    assert data["is_simulated"] is True


def test_dashboard_trends(db):
    data = get_dashboard_trends(db)
    assert "hourly_passenger_demand" in data
    assert len(data["hourly_passenger_demand"]) > 0
    assert "route_performance_comparison" in data
    assert len(data["route_performance_comparison"]) == 12
    assert "delay_distribution" in data


def test_get_routes(db):
    data = get_routes(db)
    assert len(data) == 12
    # Verify R-101 (Secunderabad - Ameerpet - Hitech City) is present
    r101 = next((r for r in data if r["route_id"] == "R-101"), None)
    assert r101 is not None
    assert "Ameerpet" in r101["route_long_name"]
    assert r101["distance_km"] > 0


def test_get_route_detail(db):
    data = get_route_detail("R-101", db)
    assert "route" in data
    assert "stops" in data
    assert len(data["stops"]) > 0
    assert "active_vehicles" in data


def test_get_vehicles(db):
    data = get_vehicles(db=db)
    assert len(data) == 48
    
    # Test filter by propulsion
    electric_data = get_vehicles(propulsion="ELECTRIC", db=db)
    assert len(electric_data) > 0
    assert all(v["propulsion_type"] == "ELECTRIC" for v in electric_data)


def test_get_vehicle_positions(db):
    data = get_vehicle_positions(db=db)
    assert len(data) > 0
    first_pos = data[0]
    assert "latitude" in first_pos
    assert "longitude" in first_pos
    assert 17.0 <= first_pos["latitude"] <= 18.0
    assert 78.0 <= first_pos["longitude"] <= 79.0


def test_analytics_headways_and_bunching(db):
    data = get_headway_anomalies(db=db)
    assert len(data) > 0
    bunching = [a for a in data if a["anomaly_type"] == "BUS_BUNCHING"]
    assert len(bunching) > 0
    assert bunching[0]["route_id"] == "R-101"


def test_analytics_passenger_demand(db):
    data = get_passenger_demand(db=db)
    assert len(data) == 12
    assert data[0]["peak_morning_volume"] > 0
    assert data[0]["peak_evening_volume"] > 0


def test_dispatch_recommendations_and_update(db):
    data = get_recommendations(db=db)
    assert len(data) > 0
    
    first_rec = data[0]
    rec_id = first_rec["recommendation_id"]
    
    updated = update_recommendation_status(
        recommendation_id=rec_id,
        payload=DispatchStatusUpdate(status="APPROVED"),
        db=db
    )
    assert updated["status"] == "APPROVED"


def test_agent_chat_bunching_query(db):
    req = AgentChatRequest(
        message="Are buses bunching on Route 101 between Secunderabad and Hitech City?"
    )
    data = chat_with_agent(payload=req, db=db)
    assert "reply" in data
    assert len(data["tools_executed"]) > 0
    assert data["tools_executed"][0]["tool_name"] == "detect_headway_anomalies"
    assert "bunching" in data["reply"].lower() or "ameerpet" in data["reply"].lower()
