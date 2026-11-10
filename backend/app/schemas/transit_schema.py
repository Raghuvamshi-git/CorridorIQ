from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# --- Agency & Core Transit ---
class AgencyOut(BaseModel):
    agency_id: str
    agency_name: str
    agency_url: str
    agency_timezone: str

    model_config = ConfigDict(from_attributes=True)


class StopOut(BaseModel):
    stop_id: str
    stop_code: Optional[str] = None
    stop_name: str
    stop_lat: float
    stop_lon: float
    zone_id: Optional[str] = None
    corridor_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class RouteOut(BaseModel):
    id: int
    route_id: str
    route_short_name: str
    route_long_name: str
    corridor_name: str
    origin: str
    destination: str
    color: str
    distance_km: float
    target_travel_time_mins: int
    target_headway_mins: int
    status: str
    active_buses: Optional[int] = 0
    avg_delay_mins: Optional[float] = 0.0
    on_time_percentage: Optional[float] = 0.0
    total_trips: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class StopSequenceOut(BaseModel):
    stop_id: str
    stop_name: str
    stop_sequence: int
    stop_lat: float
    stop_lon: float
    scheduled_arrival: str
    actual_arrival: Optional[str] = None
    delay_seconds: int = 0
    boarding_count: int = 0
    alighting_count: int = 0
    current_occupancy: int = 0


class RouteDetailOut(BaseModel):
    route: RouteOut
    stops: List[StopSequenceOut]
    active_vehicles: List[Dict[str, Any]]
    bunching_detected: bool
    service_alerts: List[Dict[str, Any]]


# --- Vehicle & Position ---
class VehicleOut(BaseModel):
    id: int
    vehicle_id: str
    vehicle_label: str
    model: str
    propulsion_type: str
    capacity: int
    fuel_or_battery_level: float
    odometer_km: float
    status: str
    current_route_id: Optional[str] = None
    current_trip_id: Optional[str] = None
    current_speed_kmh: Optional[float] = 0.0
    passenger_count: Optional[int] = 0
    passenger_load_factor: Optional[float] = 0.0
    latest_lat: Optional[float] = None
    latest_lon: Optional[float] = None
    last_updated: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class VehiclePositionOut(BaseModel):
    vehicle_id: str
    vehicle_label: str
    route_id: Optional[str] = None
    route_short_name: Optional[str] = None
    corridor_name: Optional[str] = None
    latitude: float
    longitude: float
    bearing: float
    speed_kmh: float
    passenger_count: int
    passenger_load_factor: float
    occupancy_status: str
    status: str
    timestamp: datetime
    is_simulated: bool = True

    model_config = ConfigDict(from_attributes=True)


# --- Analytics & Dashboard ---
class DashboardSummaryOut(BaseModel):
    city: str
    region: str
    timestamp: datetime
    total_active_vehicles: int
    total_routes: int
    completed_trips_today: int
    on_time_performance_pct: float
    avg_network_delay_mins: float
    total_passengers_today: int
    active_anomalies_count: int
    bunching_corridors_count: int
    pending_recommendations_count: int
    database_dialect: str
    is_simulated: bool = True


class DashboardTrendsOut(BaseModel):
    hourly_passenger_demand: List[Dict[str, Any]]
    route_performance_comparison: List[Dict[str, Any]]
    delay_distribution: List[Dict[str, Any]]
    hourly_active_vehicles: List[Dict[str, Any]]


class HeadwayAnomalyOut(BaseModel):
    route_id: str
    route_short_name: str
    corridor_name: str
    trip_id: str
    vehicle_id: str
    scheduled_headway_mins: float
    actual_headway_mins: float
    deviation_mins: float
    anomaly_type: str # BUS_BUNCHING, LONG_HEADWAY
    severity: str     # HIGH, MEDIUM, LOW
    explanation: str


class PassengerDemandOut(BaseModel):
    route_id: str
    route_short_name: str
    corridor_name: str
    hourly_totals: List[Dict[str, Any]]
    peak_morning_volume: int
    peak_evening_volume: int
    overcrowding_alerts: List[Dict[str, Any]]


# --- Dispatch Recommendations ---
class DispatchEventOut(BaseModel):
    id: int
    recommendation_id: str
    route_id: str
    route_short_name: Optional[str] = None
    vehicle_id: Optional[str] = None
    issue_type: str
    severity: str
    evidence: str
    recommended_action: str
    expected_benefit: str
    confidence_score: float
    status: str # PENDING_REVIEW, APPROVED, REJECTED, RESOLVED
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DispatchStatusUpdate(BaseModel):
    status: str = Field(..., description="PENDING_REVIEW, APPROVED, REJECTED, RESOLVED")


# --- AI Agent ---
class AgentChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []


class ToolExecutionTrace(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result: Any


class AgentChatResponse(BaseModel):
    reply: str
    tools_executed: List[ToolExecutionTrace] = []
    evidence: Optional[List[str]] = []
    proposed_recommendations: Optional[List[Dict[str, Any]]] = []
    gemini_active: bool = True
    notice: Optional[str] = None
