
CREATE DATABASE IF NOT EXISTS corridoriq_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE corridoriq_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS service_alerts;
DROP TABLE IF EXISTS dispatch_events;
DROP TABLE IF EXISTS passenger_counts;
DROP TABLE IF EXISTS trip_updates;
DROP TABLE IF EXISTS vehicle_positions;
DROP TABLE IF EXISTS stop_times;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS stops;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS agencies;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Agencies (GTFS core)
CREATE TABLE agencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agency_id VARCHAR(64) NOT NULL UNIQUE,
    agency_name VARCHAR(255) NOT NULL,
    agency_url VARCHAR(255) NOT NULL,
    agency_timezone VARCHAR(64) DEFAULT 'Asia/Kolkata',
    agency_phone VARCHAR(64),
    agency_lang VARCHAR(16) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_agency_id (agency_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Routes (Corridors across Hyderabad)
CREATE TABLE routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id VARCHAR(64) NOT NULL UNIQUE,
    agency_id VARCHAR(64),
    route_short_name VARCHAR(32) NOT NULL,
    route_long_name VARCHAR(255) NOT NULL,
    corridor_name VARCHAR(255) NOT NULL,
    origin VARCHAR(128) NOT NULL,
    destination VARCHAR(128) NOT NULL,
    route_type INT DEFAULT 3, -- 3 = Bus
    color VARCHAR(16) DEFAULT '#4F46E5',
    distance_km DECIMAL(6, 2) DEFAULT 15.00,
    target_travel_time_mins INT DEFAULT 45,
    target_headway_mins INT DEFAULT 10,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_routes_agency FOREIGN KEY (agency_id) REFERENCES agencies(agency_id) ON DELETE SET NULL,
    INDEX idx_route_short (route_short_name),
    INDEX idx_corridor (corridor_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Stops (Geocoded Hyderabad Points)
CREATE TABLE stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stop_id VARCHAR(64) NOT NULL UNIQUE,
    stop_code VARCHAR(32),
    stop_name VARCHAR(255) NOT NULL,
    stop_lat DECIMAL(9, 6) NOT NULL,
    stop_lon DECIMAL(9, 6) NOT NULL,
    zone_id VARCHAR(64) DEFAULT 'HYD_ZONE_1',
    location_type INT DEFAULT 0, -- 0 = Stop, 1 = Station/Hub
    corridor_name VARCHAR(255),
    INDEX idx_stop_coords (stop_lat, stop_lon),
    INDEX idx_stop_name (stop_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Vehicles (Fleet inventory: Electric, CNG, Diesel)
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id VARCHAR(64) NOT NULL UNIQUE,
    vehicle_label VARCHAR(64) NOT NULL,
    model VARCHAR(128) DEFAULT 'Ashok Leyland Electric Bus',
    propulsion_type ENUM('ELECTRIC', 'DIESEL', 'CNG', 'HYBRID') DEFAULT 'ELECTRIC',
    capacity INT DEFAULT 60,
    fuel_or_battery_level DECIMAL(5, 2) DEFAULT 100.00,
    odometer_km DECIMAL(10, 2) DEFAULT 15000.00,
    status ENUM('IN_SERVICE', 'MAINTENANCE', 'IDLE') DEFAULT 'IN_SERVICE',
    last_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_vehicle_status (status),
    INDEX idx_propulsion (propulsion_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Trips (Scheduled and executed operational trips)
CREATE TABLE trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL UNIQUE,
    route_id VARCHAR(64) NOT NULL,
    vehicle_id VARCHAR(64),
    service_id VARCHAR(64) DEFAULT 'DAILY_REGULAR',
    trip_headsign VARCHAR(255),
    direction_id TINYINT DEFAULT 0,
    scheduled_departure DATETIME NOT NULL,
    actual_departure DATETIME,
    scheduled_arrival DATETIME NOT NULL,
    actual_arrival DATETIME,
    delay_departure_mins DECIMAL(6, 2) DEFAULT 0.00,
    delay_arrival_mins DECIMAL(6, 2) DEFAULT 0.00,
    trip_status ENUM('SCHEDULED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    CONSTRAINT fk_trips_route FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    CONSTRAINT fk_trips_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
    INDEX idx_trip_route (route_id),
    INDEX idx_trip_sched_dep (scheduled_departure),
    INDEX idx_trip_status (trip_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Stop Times (Scheduled and actual stop timings + boardings)
CREATE TABLE stop_times (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL,
    route_id VARCHAR(64) NOT NULL,
    stop_id VARCHAR(64) NOT NULL,
    stop_sequence INT NOT NULL,
    scheduled_arrival DATETIME NOT NULL,
    scheduled_departure DATETIME NOT NULL,
    actual_arrival DATETIME,
    actual_departure DATETIME,
    delay_seconds INT DEFAULT 0,
    boarding_count INT DEFAULT 0,
    alighting_count INT DEFAULT 0,
    current_occupancy INT DEFAULT 0,
    CONSTRAINT fk_stop_times_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    CONSTRAINT fk_stop_times_route FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    CONSTRAINT fk_stop_times_stop FOREIGN KEY (stop_id) REFERENCES stops(stop_id) ON DELETE CASCADE,
    INDEX idx_trip_seq (trip_id, stop_sequence),
    INDEX idx_route_stop (route_id, stop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Vehicle Positions (Real-time simulated telemetry logs)
CREATE TABLE vehicle_positions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id VARCHAR(64) NOT NULL,
    trip_id VARCHAR(64),
    route_id VARCHAR(64),
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    bearing DECIMAL(5, 2) DEFAULT 0.00,
    speed_kmh DECIMAL(5, 2) DEFAULT 25.00,
    passenger_count INT DEFAULT 30,
    passenger_load_factor DECIMAL(4, 2) DEFAULT 0.50,
    occupancy_status VARCHAR(64) DEFAULT 'MANY_SEATS_AVAILABLE',
    timestamp DATETIME NOT NULL,
    is_simulated BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_vpos_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    CONSTRAINT fk_vpos_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE SET NULL,
    INDEX idx_vpos_vehicle_time (vehicle_id, timestamp),
    INDEX idx_vpos_route_time (route_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Trip Updates (Headway adherence, bus bunching flags)
CREATE TABLE trip_updates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL,
    vehicle_id VARCHAR(64),
    route_id VARCHAR(64) NOT NULL,
    delay_mins DECIMAL(6, 2) DEFAULT 0.00,
    scheduled_headway_mins DECIMAL(5, 2) DEFAULT 10.00,
    actual_headway_mins DECIMAL(5, 2) DEFAULT 10.00,
    headway_deviation_mins DECIMAL(5, 2) DEFAULT 0.00,
    is_bunching BOOLEAN DEFAULT FALSE,
    is_long_headway BOOLEAN DEFAULT FALSE,
    update_timestamp DATETIME NOT NULL,
    CONSTRAINT fk_tup_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    CONSTRAINT fk_tup_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
    INDEX idx_tup_bunching (is_bunching),
    INDEX idx_tup_route_time (route_id, update_timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Passenger Counts (Hourly ridership for demand heatmaps)
CREATE TABLE passenger_counts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_id VARCHAR(64) NOT NULL,
    stop_id VARCHAR(64) NOT NULL,
    date_val DATE NOT NULL,
    hour_of_day TINYINT NOT NULL,
    boardings INT DEFAULT 0,
    alightings INT DEFAULT 0,
    estimated_wait_time_mins DECIMAL(5, 2) DEFAULT 5.00,
    CONSTRAINT fk_pcount_route FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    CONSTRAINT fk_pcount_stop FOREIGN KEY (stop_id) REFERENCES stops(stop_id) ON DELETE CASCADE,
    UNIQUE KEY uq_route_stop_hour (route_id, stop_id, date_val, hour_of_day),
    INDEX idx_pcount_hour (date_val, hour_of_day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Dispatch Events (Operational recommendations & reviews)
CREATE TABLE dispatch_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recommendation_id VARCHAR(64) NOT NULL UNIQUE,
    route_id VARCHAR(64) NOT NULL,
    vehicle_id VARCHAR(64),
    issue_type VARCHAR(64) NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    evidence TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    expected_benefit TEXT NOT NULL,
    confidence_score DECIMAL(4, 2) DEFAULT 0.88,
    status ENUM('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED') DEFAULT 'PENDING_REVIEW',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dispatch_route FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    CONSTRAINT fk_dispatch_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
    INDEX idx_dispatch_status (status),
    INDEX idx_dispatch_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Service Alerts (Traffic and incident disruptions)
CREATE TABLE service_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id VARCHAR(64) NOT NULL UNIQUE,
    route_id VARCHAR(64),
    cause VARCHAR(64) DEFAULT 'HEAVY_TRAFFIC',
    effect VARCHAR(64) DEFAULT 'SIGNIFICANT_DELAYS',
    header_text VARCHAR(255) NOT NULL,
    description_text TEXT NOT NULL,
    severity ENUM('INFO', 'WARNING', 'SEVERE') DEFAULT 'WARNING',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerts_route FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE SET NULL,
    INDEX idx_alerts_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
