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
from backend.app.api.routes.dispatch import get_recommendations, update_recommendation_status, generate_recommendations
from backend.app.api.routes.agent import chat_with_agent
from backend.app.schemas.transit_schema import AgentChatRequest, DispatchStatusUpdate
from backend.app.models.transit import Route, Stop, Vehicle, Trip, StopTime, VehiclePosition

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


def test_database_record_scale_compliance(db):
    """Verifies that synthetic data meets enterprise scale specifications."""
    route_count = db.query(Route).count()
    stop_count = db.query(Stop).count()
    vehicle_count = db.query(Vehicle).count()
    trip_count = db.query(Trip).count()
    stop_times_count = db.query(StopTime).count()
    pos_count = db.query(VehiclePosition).count()

    assert route_count == 12, f"Expected 12 routes, got {route_count}"
    assert 60 <= stop_count <= 100, f"Expected 60-100 stops, got {stop_count}"
    assert 40 <= vehicle_count <= 60, f"Expected 40-60 vehicles, got {vehicle_count}"
    assert 150 <= trip_count <= 250, f"Expected 150-250 trips, got {trip_count}"
    assert stop_times_count >= 1000, f"Expected >= 1000 stop_times, got {stop_times_count}"
    assert pos_count >= 3000, f"Expected >= 3000 vehicle_positions, got {pos_count}"


def test_pagination_endpoints(db):
    """Verifies skip and limit query parameters across multiple endpoints."""
    # Test vehicles pagination
    page1 = get_vehicles(skip=0, limit=10, db=db)
    assert len(page1) == 10
    page2 = get_vehicles(skip=10, limit=10, db=db)
    assert len(page2) == 10
    assert page1[0]["vehicle_id"] != page2[0]["vehicle_id"]

    # Test vehicle positions pagination
    pos_page = get_vehicle_positions(skip=0, limit=25, db=db)
    assert len(pos_page) == 25

    # Test dispatch recommendations pagination
    rec_page = get_recommendations(skip=0, limit=2, db=db)
    assert len(rec_page) <= 2


def test_headway_anomalies_schema_fields(db):
    """Verifies that headway anomalies return comprehensive operational metadata."""
    data = get_headway_anomalies(db=db)
    assert len(data) > 0
    for anomaly in data:
        # Check dictionary keys or attributes
        item = anomaly if isinstance(anomaly, dict) else anomaly.__dict__
        assert "route_id" in item
        assert "anomaly_type" in item
        assert "severity" in item
        assert "stop_name" in item
        assert "actual_metric" in item
        assert "expected_metric" in item
        assert "detected_at" in item


def test_dispatch_recommendation_generation(db):
    """Verifies automated scanning and creation of dispatch recommendations."""
    generated = generate_recommendations(db=db)
    assert isinstance(generated, list)
    # The scan should produce valid recommendation items
    all_recs = get_recommendations(db=db)
    assert len(all_recs) >= 4
