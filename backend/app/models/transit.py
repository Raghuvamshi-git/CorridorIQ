from datetime import datetime
from sqlalchemy import (
    Column, Integer, BigInteger, String, Float, DateTime, Time, Date,
    ForeignKey, Boolean, Text, Enum as SQLEnum, Index
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class Agency(Base):
    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True, index=True)
    agency_id = Column(String(64), unique=True, nullable=False, index=True)
    agency_name = Column(String(255), nullable=False)
    agency_url = Column(String(255), nullable=False)
    agency_timezone = Column(String(64), default="Asia/Kolkata")
    agency_phone = Column(String(64), nullable=True)
    agency_lang = Column(String(16), default="en")

    routes = relationship("Route", back_populates="agency", cascade="all, delete-orphan")


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(String(64), unique=True, nullable=False, index=True)
    agency_id = Column(String(64), ForeignKey("agencies.agency_id"), nullable=True)
    route_short_name = Column(String(32), nullable=False, index=True) # e.g. "R-101"
    route_long_name = Column(String(255), nullable=False)            # e.g. "Secunderabad - Ameerpet - Hitech City"
    corridor_name = Column(String(255), nullable=False, index=True)  # e.g. "IT Corridor Crosstown Link"
    origin = Column(String(128), nullable=False)
    destination = Column(String(128), nullable=False)
    route_type = Column(Integer, default=3) # 3 = Bus
    color = Column(String(16), default="#4F46E5") # UI Color
    distance_km = Column(Float, default=15.0)
    target_travel_time_mins = Column(Integer, default=45)
    target_headway_mins = Column(Integer, default=10)
    status = Column(String(32), default="ACTIVE", index=True)

    agency = relationship("Agency", back_populates="routes")
    trips = relationship("Trip", back_populates="route", cascade="all, delete-orphan")
    stop_times = relationship("StopTime", back_populates="route", cascade="all, delete-orphan")
    dispatch_events = relationship("DispatchEvent", back_populates="route", cascade="all, delete-orphan")
    service_alerts = relationship("ServiceAlert", back_populates="route", cascade="all, delete-orphan")
    passenger_counts = relationship("PassengerCount", back_populates="route", cascade="all, delete-orphan")


class Stop(Base):
    __tablename__ = "stops"

    id = Column(Integer, primary_key=True, index=True)
    stop_id = Column(String(64), unique=True, nullable=False, index=True)
    stop_code = Column(String(32), nullable=True)
    stop_name = Column(String(255), nullable=False, index=True)
    stop_lat = Column(Float, nullable=False)
    stop_lon = Column(Float, nullable=False)
    zone_id = Column(String(64), default="HYD_ZONE_1")
    location_type = Column(Integer, default=0) # 0 = Stop, 1 = Station
    corridor_name = Column(String(255), nullable=True)

    stop_times = relationship("StopTime", back_populates="stop", cascade="all, delete-orphan")
    passenger_counts = relationship("PassengerCount", back_populates="stop", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_stop_coords", "stop_lat", "stop_lon"),
    )


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String(64), unique=True, nullable=False, index=True) # e.g. "TS-09-UB-101"
    vehicle_label = Column(String(64), nullable=False)
    model = Column(String(128), default="Ashok Leyland Electric Bus")
    propulsion_type = Column(String(32), default="ELECTRIC", index=True) # ELECTRIC, DIESEL, CNG, HYBRID
    capacity = Column(Integer, default=60)
    fuel_or_battery_level = Column(Float, default=100.0) # Percentage 0-100
    odometer_km = Column(Float, default=15000.0)
    status = Column(String(32), default="IN_SERVICE", index=True) # IN_SERVICE, MAINTENANCE, IDLE
    last_maintenance_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    trips = relationship("Trip", back_populates="vehicle")
    positions = relationship("VehiclePosition", back_populates="vehicle", cascade="all, delete-orphan")
    trip_updates = relationship("TripUpdate", back_populates="vehicle", cascade="all, delete-orphan")
    dispatch_events = relationship("DispatchEvent", back_populates="vehicle")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(String(64), unique=True, nullable=False, index=True)
    route_id = Column(String(64), ForeignKey("routes.route_id"), nullable=False, index=True)
    vehicle_id = Column(String(64), ForeignKey("vehicles.vehicle_id"), nullable=True, index=True)
    service_id = Column(String(64), default="DAILY_SERVICE")
    trip_headsign = Column(String(255), nullable=True)
    direction_id = Column(Integer, default=0) # 0 = Outbound, 1 = Inbound
    scheduled_departure = Column(DateTime, nullable=False, index=True)
    actual_departure = Column(DateTime, nullable=True)
    scheduled_arrival = Column(DateTime, nullable=False)
    actual_arrival = Column(DateTime, nullable=True)
    delay_departure_mins = Column(Float, default=0.0)
    delay_arrival_mins = Column(Float, default=0.0)
    trip_status = Column(String(32), default="COMPLETED", index=True) # SCHEDULED, IN_TRANSIT, COMPLETED, CANCELLED

    route = relationship("Route", back_populates="trips")
    vehicle = relationship("Vehicle", back_populates="trips")
    stop_times = relationship("StopTime", back_populates="trip", cascade="all, delete-orphan")
    positions = relationship("VehiclePosition", back_populates="trip", cascade="all, delete-orphan")
    trip_updates = relationship("TripUpdate", back_populates="trip", cascade="all, delete-orphan")


class StopTime(Base):
    __tablename__ = "stop_times"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    trip_id = Column(String(64), ForeignKey("trips.trip_id"), nullable=False, index=True)
    route_id = Column(String(64), ForeignKey("routes.route_id"), nullable=False, index=True)
    stop_id = Column(String(64), ForeignKey("stops.stop_id"), nullable=False, index=True)
    stop_sequence = Column(Integer, nullable=False)
    scheduled_arrival = Column(DateTime, nullable=False)
    scheduled_departure = Column(DateTime, nullable=False)
    actual_arrival = Column(DateTime, nullable=True)
    actual_departure = Column(DateTime, nullable=True)
    delay_seconds = Column(Integer, default=0)
    boarding_count = Column(Integer, default=0)
    alighting_count = Column(Integer, default=0)
    current_occupancy = Column(Integer, default=0)

    trip = relationship("Trip", back_populates="stop_times")
    route = relationship("Route", back_populates="stop_times")
    stop = relationship("Stop", back_populates="stop_times")

    __table_args__ = (
        Index("idx_trip_sequence", "trip_id", "stop_sequence"),
        Index("idx_route_stop", "route_id", "stop_id"),
    )


class VehiclePosition(Base):
    __tablename__ = "vehicle_positions"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    vehicle_id = Column(String(64), ForeignKey("vehicles.vehicle_id"), nullable=False, index=True)
    trip_id = Column(String(64), ForeignKey("trips.trip_id"), nullable=True, index=True)
    route_id = Column(String(64), ForeignKey("routes.route_id"), nullable=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    bearing = Column(Float, default=0.0)
    speed_kmh = Column(Float, default=25.0)
    passenger_count = Column(Integer, default=30)
    passenger_load_factor = Column(Float, default=0.50) # 0.0 - 1.0+
    occupancy_status = Column(String(32), default="MANY_SEATS_AVAILABLE") # MANY_SEATS_AVAILABLE, FEW_SEATS_AVAILABLE, STANDING_ROOM_ONLY, CRUSHED_STANDING_ROOM
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    is_simulated = Column(Boolean, default=True)

    vehicle = relationship("Vehicle", back_populates="positions")
    trip = relationship("Trip", back_populates="positions")

    __table_args__ = (
        Index("idx_vehicle_time", "vehicle_id", "timestamp"),
        Index("idx_route_time", "route_id", "timestamp"),
    )


class TripUpdate(Base):
    __tablename__ = "trip_updates"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    trip_id = Column(String(64), ForeignKey("trips.trip_id"), nullable=False, index=True)
    vehicle_id = Column(String(64), ForeignKey("vehicles.vehicle_id"), nullable=True, index=True)
    route_id = Column(String(64), ForeignKey("routes.route_id"), nullable=False, index=True)
    delay_mins = Column(Float, default=0.0)
    scheduled_headway_mins = Column(Float, default=10.0)
    actual_headway_mins = Column(Float, default=10.0)
    headway_deviation_mins = Column(Float, default=0.0)
    is_bunching = Column(Boolean, default=False, index=True)
    is_long_headway = Column(Boolean, default=False, index=True)
    update_timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    trip = relationship("Trip", back_populates="trip_updates")
    vehicle = relationship("Vehicle", back_populates="trip_updates")


class PassengerCount(Base):
    __tablename__ = "passenger_counts"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    route_id = Column(String(64), ForeignKey("routes.route_id"), nullable=False, index=True)
    stop_id = Column(String(64), ForeignKey("stops.stop_id"), nullable=False, index=True)
    date_val = Column(Date, nullable=False, index=True)
    hour_of_day = Column(Integer, nullable=False, index=True) # 0 - 23
    boardings = Column(Integer, default=0)
    alightings = Column(Integer, default=0)
    estimated_wait_time_mins = Column(Float, default=5.0)

    route = relationship("Route", back_populates="passenger_counts")
    stop = relationship("Stop", back_populates="passenger_counts")

    __table_args__ = (
        Index("idx_route_hour", "route_id", "hour_of_day"),
    )


class DispatchEvent(Base):
    __tablename__ = "dispatch_events"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(String(64), unique=True, nullable=False, index=True)
    route_id = Column(String(64), ForeignKey("routes.route_id"), nullable=False, index=True)
    vehicle_id = Column(String(64), ForeignKey("vehicles.vehicle_id"), nullable=True, index=True)
    issue_type = Column(String(64), nullable=False, index=True) # BUS_BUNCHING, SEVERE_DELAY, OVERCROWDING, LONG_HEADWAY
    severity = Column(String(32), default="MEDIUM", index=True) # LOW, MEDIUM, HIGH, CRITICAL
    evidence = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    expected_benefit = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.88)
    status = Column(String(32), default="PENDING_REVIEW", index=True) # PENDING_REVIEW, APPROVED, REJECTED, RESOLVED
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    route = relationship("Route", back_populates="dispatch_events")
    vehicle = relationship("Vehicle", back_populates="dispatch_events")


class ServiceAlert(Base):
    __tablename__ = "service_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(64), unique=True, nullable=False, index=True)
    route_id = Column(String(64), ForeignKey("routes.route_id"), nullable=True, index=True)
    cause = Column(String(64), default="HEAVY_TRAFFIC")
    effect = Column(String(64), default="SIGNIFICANT_DELAYS")
    header_text = Column(String(255), nullable=False)
    description_text = Column(Text, nullable=False)
    severity = Column(String(32), default="WARNING") # INFO, WARNING, SEVERE
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    route = relationship("Route", back_populates="service_alerts")
