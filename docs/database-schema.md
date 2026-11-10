# CorridorIQ — GTFS-Inspired Database Schema Specification
## Target Database: MySQL 8.0 (InnoDB) with SQLite Fallback

---

### 1. Relational Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    AGENCIES ||--o{ ROUTES : operates
    ROUTES ||--o{ TRIPS : schedules
    ROUTES ||--o{ STOP_TIMES : includes
    STOPS ||--o{ STOP_TIMES : served_by
    VEHICLES ||--o{ TRIPS : assigned_to
    TRIPS ||--o{ VEHICLE_POSITIONS : broadcasts
    TRIPS ||--o{ TRIP_UPDATES : assesses
    ROUTES ||--o{ PASSENGER_COUNTS : tracks
    STOPS ||--o{ PASSENGER_COUNTS : records
    ROUTES ||--o{ DISPATCH_EVENTS : generates
    VEHICLES ||--o{ DISPATCH_EVENTS : involves
    ROUTES ||--o{ SERVICE_ALERTS : impacts

    AGENCIES {
        int id PK
        string agency_id UK "TSRTC-HYD-SIM"
        string agency_name "Hyderabad Transit Authority"
        string agency_url
        string agency_timezone "Asia/Kolkata"
    }

    ROUTES {
        int id PK
        string route_id UK "R-101"
        string agency_id FK
        string route_short_name "101"
        string route_long_name "Secunderabad – Ameerpet – Hitech City"
        string corridor_name "IT Corridor Crosstown Link"
        string origin "Secunderabad Railway Station"
        string destination "Cyber Towers Hitech City"
        float distance_km "19.8"
        int target_travel_time_mins "50"
        int target_headway_mins "10"
        string status "ACTIVE"
    }

    STOPS {
        int id PK
        string stop_id UK "STP-07"
        string stop_code "AMP-01"
        string stop_name "Ameerpet Metro Interchange Hub"
        float stop_lat "17.4375"
        float stop_lon "78.4482"
        string zone_id "CENTRAL"
        int location_type "1 = Station"
    }

    VEHICLES {
        int id PK
        string vehicle_id UK "TS-09-UB-104"
        string vehicle_label "TS-09-UB-104"
        string model "Ashok Leyland Switch EiV 12 Electric"
        string propulsion_type "ELECTRIC, CNG, DIESEL"
        int capacity "65"
        float fuel_or_battery_level "14.5% - 98.0%"
        float odometer_km
        string status "IN_SERVICE, MAINTENANCE, IDLE"
    }

    TRIPS {
        int id PK
        string trip_id UK "TRIP-101-005"
        string route_id FK
        string vehicle_id FK
        datetime scheduled_departure
        datetime actual_departure
        datetime scheduled_arrival
        datetime actual_arrival
        float delay_arrival_mins "12.4"
        string trip_status "COMPLETED, IN_TRANSIT, SCHEDULED"
    }

    STOP_TIMES {
        int id PK
        string trip_id FK
        string route_id FK
        string stop_id FK
        int stop_sequence "1 to N"
        datetime scheduled_arrival
        datetime actual_arrival
        int delay_seconds "132"
        int boarding_count
        int alighting_count
        int current_occupancy
    }

    VEHICLE_POSITIONS {
        int id PK
        string vehicle_id FK
        string trip_id FK
        string route_id FK
        float latitude "17.4504"
        float longitude "78.3808"
        float speed_kmh "28.5"
        int passenger_count "42"
        float passenger_load_factor "0.65"
        string occupancy_status "STANDING_ROOM_ONLY"
        datetime timestamp
        boolean is_simulated "TRUE"
    }

    TRIP_UPDATES {
        int id PK
        string trip_id FK
        string vehicle_id FK
        string route_id FK
        float delay_mins "12.4"
        float scheduled_headway_mins "10.0"
        float actual_headway_mins "2.2"
        float headway_deviation_mins "-7.8"
        boolean is_bunching "TRUE"
        boolean is_long_headway "FALSE"
        datetime update_timestamp
    }

    PASSENGER_COUNTS {
        int id PK
        string route_id FK
        string stop_id FK
        date date_val
        int hour_of_day "0 to 23"
        int boardings "85"
        int alightings "62"
        float estimated_wait_time_mins "6.2"
    }

    DISPATCH_EVENTS {
        int id PK
        string recommendation_id UK "REC-HYD-001"
        string route_id FK
        string vehicle_id FK
        string issue_type "BUS_BUNCHING"
        string severity "HIGH"
        text evidence
        text recommended_action
        text expected_benefit
        float confidence_score "0.94"
        string status "PENDING_REVIEW, APPROVED, REJECTED, RESOLVED"
        datetime created_at
    }

    SERVICE_ALERTS {
        int id PK
        string alert_id UK "ALT-HYD-01"
        string route_id FK
        string cause "CONSTRUCTION_WORK"
        string effect "SIGNIFICANT_DELAYS"
        string header_text
        text description_text
        string severity "WARNING"
        boolean is_active "TRUE"
    }
```

---

### 2. Operational Extension Design

Unlike standard static GTFS feeds, CorridorIQ incorporates **Operational Telematics Extensions**:
1. **Dynamic Headway Deviations**: Headways are computed sequentially per stop and corridor, flagging bus bunching when actual headway is $\le 35\%$ of scheduled headway.
2. **Occupancy Status**: Passenger load factors exceeding 90% are automatically categorized as `STANDING_ROOM_ONLY` or `CRUSHED_STANDING_ROOM`.
3. **Dispatch Audit Logs**: Every corrective suggestion by the AI controller is recorded in `dispatch_events` with confidence scores and human status transitions.

