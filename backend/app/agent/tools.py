import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.services.analytics_service import AnalyticsService
from backend.app.models.transit import Route, Trip, TripUpdate, Vehicle, VehiclePosition, DispatchEvent


def get_route_performance(db: Session, route_id: str = "", start_date: str = "", end_date: str = "") -> Dict[str, Any]:
    """Retrieves on-time performance, average delay, active bus count, and trip volume for a route or all corridors."""
    routes = AnalyticsService.get_routes(db)
    if route_id:
        target = route_id.upper()
        # Allow passing "101" or "R-101"
        matched = [r for r in routes if r["route_id"] == target or r["route_short_name"] == target.replace("R-", "")]
        if matched:
            details = AnalyticsService.get_route_details(db, matched[0]["route_id"])
            return {"status": "success", "route_performance": matched[0], "details": details}
        return {"status": "error", "message": f"Route '{route_id}' not found in Hyderabad catalog."}
    
    return {"status": "success", "total_routes": len(routes), "routes": routes}


def get_vehicle_positions(db: Session, route_id: str = "") -> Dict[str, Any]:
    """Retrieves current simulated GPS coordinates, speeds, passenger occupancies, and status of fleet vehicles."""
    target_route = route_id.upper() if route_id else None
    if target_route and not target_route.startswith("R-"):
        target_route = f"R-{target_route}"
    positions = AnalyticsService.get_vehicle_positions(db, route_id=target_route)
    return {
        "status": "success",
        "total_vehicles_reported": len(positions),
        "positions": positions[:15] # Top 15 to avoid context bloat
    }


def detect_headway_anomalies(db: Session, route_id: str = "", time_window: str = "") -> Dict[str, Any]:
    """Scans Hyderabad corridors for bus bunching (headway < 35% target) or long gaps (headway > 180% target)."""
    target_route = route_id.upper() if route_id else None
    if target_route and not target_route.startswith("R-"):
        target_route = f"R-{target_route}"
    anomalies = AnalyticsService.get_headway_anomalies(db, route_id=target_route)
    return {
        "status": "success",
        "total_anomalies": len(anomalies),
        "anomalies": anomalies
    }


def analyze_passenger_demand(db: Session, route_id: str = "", time_window: str = "") -> Dict[str, Any]:
    """Analyzes hourly passenger boardings, alightings, peak morning/evening volumes, and overcrowding hotspots."""
    target_route = route_id.upper() if route_id else None
    if target_route and not target_route.startswith("R-"):
        target_route = f"R-{target_route}"
    demand_data = AnalyticsService.get_passenger_demand_analysis(db, route_id=target_route)
    return {
        "status": "success",
        "demand_analysis": demand_data
    }


def get_delay_analysis(db: Session, route_id: str = "", time_window: str = "") -> Dict[str, Any]:
    """Analyzes delay distribution, average minutes behind schedule, and bottlenecks across Hyderabad corridors."""
    summary = AnalyticsService.get_dashboard_summary(db)
    trends = AnalyticsService.get_dashboard_trends(db)
    
    # Identify top 3 delayed routes
    routes = AnalyticsService.get_routes(db)
    sorted_delayed = sorted(routes, key=lambda r: r["avg_delay_mins"], reverse=True)
    
    return {
        "status": "success",
        "avg_network_delay_mins": summary["avg_network_delay_mins"],
        "on_time_performance_pct": summary["on_time_performance_pct"],
        "top_delayed_corridors": sorted_delayed[:3],
        "delay_distribution": trends["delay_distribution"]
    }


def compare_routes(db: Session, route_ids: List[str]) -> Dict[str, Any]:
    """Compares operational punctuality, delays, frequency, and ridership between two or more Hyderabad corridors."""
    all_routes = AnalyticsService.get_routes(db)
    normalized_ids = [rid.upper() if rid.startswith("R-") else f"R-{rid}" for rid in route_ids]
    
    matched = [r for r in all_routes if r["route_id"] in normalized_ids or r["route_short_name"] in route_ids]
    if not matched:
        return {"status": "error", "message": f"None of the requested routes {route_ids} could be found."}
    
    return {
        "status": "success",
        "compared_routes_count": len(matched),
        "comparison": matched
    }


def create_dispatch_recommendation(
    db: Session,
    route_id: str,
    issue_type: str,
    explanation: str,
    proposed_action: str,
    priority: str = "HIGH"
) -> Dict[str, Any]:
    """Creates a new operational dispatch recommendation in the database for controller review."""
    target_route = route_id.upper() if route_id.startswith("R-") else f"R-{route_id}"
    route = db.query(Route).filter(Route.route_id == target_route).first()
    if not route:
        target_route = "R-101"
    
    rec_id = f"REC-HYD-{str(uuid.uuid4())[:6].upper()}"
    new_event = DispatchEvent(
        recommendation_id=rec_id,
        route_id=target_route,
        issue_type=issue_type,
        severity=priority.upper(),
        evidence=explanation,
        recommended_action=proposed_action,
        expected_benefit="Restores schedule adherence and headway stability along corridor.",
        confidence_score=0.91,
        status="PENDING_REVIEW",
        created_at=datetime.utcnow()
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    return {
        "status": "success",
        "recommendation_id": rec_id,
        "route_id": target_route,
        "issue_type": issue_type,
        "severity": priority,
        "message": f"Dispatch recommendation {rec_id} has been logged and queued for human controller review."
    }


# Tool declarations for Google Gen AI SDK
TOOL_DECLARATIONS = [
    get_route_performance,
    get_vehicle_positions,
    detect_headway_anomalies,
    analyze_passenger_demand,
    get_delay_analysis,
    compare_routes,
    create_dispatch_recommendation
]

