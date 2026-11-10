

USE corridoriq_db;

-- 1. Agency
INSERT INTO agencies (agency_id, agency_name, agency_url, agency_timezone, agency_phone)
VALUES ('TSRTC-HYD-SIM', 'Hyderabad Metropolitan Transport Operations Authority (Simulated)', 'https://transport.telangana.gov.in', 'Asia/Kolkata', '+91-40-23450000');

-- 2. Core Corridors
INSERT INTO routes (route_id, agency_id, route_short_name, route_long_name, corridor_name, origin, destination, color, distance_km, target_travel_time_mins, target_headway_mins, status) VALUES
('R-101', 'TSRTC-HYD-SIM', '101', 'Secunderabad – Ameerpet – Hitech City', 'IT Corridor Crosstown Link', 'Secunderabad Station', 'Cyber Towers Hitech City', '#4F46E5', 19.8, 50, 10, 'ACTIVE'),
('R-102', 'TSRTC-HYD-SIM', '102', 'Hitech City – Madhapur – Gachibowli', 'Cyberabad Tech Spine', 'Cyber Towers Hitech City', 'Gachibowli Stadium', '#06B6D4', 14.2, 38, 8, 'ACTIVE'),
('R-103', 'TSRTC-HYD-SIM', '103', 'Kukatpally – Miyapur Metro Corridor', 'Northwest Metro Trunk Line', 'Kukatpally Y Junction', 'Miyapur Metro Terminal', '#10B981', 11.5, 30, 10, 'ACTIVE'),
('R-104', 'TSRTC-HYD-SIM', '104', 'LB Nagar – Dilsukhnagar – Koti', 'East-South Commercial Spine', 'LB Nagar Ring Road', 'Koti Women\'s College', '#F59E0B', 16.4, 45, 12, 'ACTIVE'),
('R-105', 'TSRTC-HYD-SIM', '105', 'Mehdipatnam – Tolichowki – Gachibowli', 'West Radial Corridor', 'Mehdipatnam Bus Terminal', 'Gachibowli Stadium', '#EC4899', 17.0, 44, 12, 'ACTIVE'),
('R-106', 'TSRTC-HYD-SIM', '106', 'Uppal – Tarnaka – Secunderabad', 'East-Central Transitway', 'Uppal Ring Road', 'Secunderabad Station', '#8B5CF6', 13.5, 35, 10, 'ACTIVE'),
('R-107', 'TSRTC-HYD-SIM', '107', 'Kondapur – Financial District Express', 'Tech Shuttle Rapid Line', 'Kondapur X Roads', 'Financial District WaveRock', '#14B8A6', 12.8, 32, 10, 'ACTIVE'),
('R-108', 'TSRTC-HYD-SIM', '108', 'Miyapur – Kukatpally – Ameerpet', 'Northwest Metro Feeder', 'Miyapur Metro Terminal', 'Ameerpet Metro Hub', '#3B82F6', 18.2, 48, 10, 'ACTIVE');

-- 3. Core Stops Sample
INSERT INTO stops (stop_id, stop_code, stop_name, stop_lat, stop_lon, zone_id, location_type) VALUES
('STP-01', 'SEC-01', 'Secunderabad Railway Station Hub', 17.4344, 78.5015, 'SECUNDERABAD', 1),
('STP-07', 'AMP-01', 'Ameerpet Metro Interchange Hub', 17.4375, 78.4482, 'CENTRAL', 1),
('STP-14', 'KPK-01', 'Kukatpally Y Junction', 17.4842, 78.4088, 'NORTH_WEST', 0),
('STP-17', 'MYP-01', 'Miyapur Metro Terminal Depot', 17.4968, 78.3614, 'NORTH_WEST', 1),
('STP-19', 'HIT-01', 'Cyber Towers Hitech City', 17.4504, 78.3808, 'HITECH_CORRIDOR', 1),
('STP-25', 'GCH-01', 'Gachibowli Stadium', 17.4438, 78.3498, 'GACHIBOWLI', 0),
('STP-28', 'WVR-01', 'Financial District WaveRock', 17.4172, 78.3421, 'FINANCIAL_DIST', 0),
('STP-31', 'MHD-01', 'Mehdipatnam Bus Terminal', 17.3915, 78.4412, 'WEST_CENTRAL', 1),
('STP-33', 'TLK-01', 'Tolichowki Flyover Junction', 17.4015, 78.4125, 'WEST_CENTRAL', 0),
('STP-38', 'LBN-01', 'LB Nagar Ring Road Depot', 17.3458, 78.5521, 'EAST_SOUTH', 1),
('STP-44', 'KTI-01', 'Koti Women\'s College Terminal', 17.3865, 78.4875, 'OLD_CITY_CENTRAL', 1),
('STP-47', 'UPL-01', 'Uppal Ring Road Depot', 17.4025, 78.5595, 'EAST_CORRIDOR', 1);

-- 4. Initial Dispatch Recommendations
INSERT INTO dispatch_events (recommendation_id, route_id, vehicle_id, issue_type, severity, evidence, recommended_action, expected_benefit, confidence_score, status) VALUES
('REC-HYD-001', 'R-101', 'TS-09-UB-104', 'BUS_BUNCHING', 'HIGH', 'Trip TRIP-101-005 and TRIP-101-004 running with 2.2-minute headway at Ameerpet Metro Hub (target: 10.0 mins). Lead bus delayed by passenger boarding surge.', 'Hold trailing vehicle TS-09-UB-104 for 4.5 minutes at Mythrivanam Complex stop to restore 7+ minute headway spacing.', 'Prevents downstream platooning along Cyber Towers corridor and balances passenger load across both buses.', 0.94, 'PENDING_REVIEW'),
('REC-HYD-002', 'R-105', 'TS-09-UB-112', 'SEVERE_DELAY', 'CRITICAL', 'Average corridor delay reached 23.4 minutes on Mehdipatnam-Tolichowki-Gachibowli corridor due to heavy flyover approach traffic and rain runoff.', 'Inject standby relief bus TS-09-UB-141 from Mehdipatnam depot to start short-trip run originating directly from Shaikpet Dargah.', 'Restores 12-minute service frequency for stranded Gachibowli IT park bound commuters.', 0.89, 'APPROVED');

-- 5. Service Alerts
INSERT INTO service_alerts (alert_id, route_id, cause, effect, header_text, description_text, severity, is_active) VALUES
('ALT-HYD-01', 'R-101', 'CONSTRUCTION_WORK', 'SIGNIFICANT_DELAYS', 'Metro Feeder Roadwork near Ameerpet Interchange', 'Road resurfacing work restricting lanes to single file between Punjagutta and Ameerpet. Expect 10-15 minute delays on Route 101.', 'WARNING', 1),
('ALT-HYD-02', 'R-105', 'HEAVY_TRAFFIC', 'MODIFIED_SERVICE', 'Tolichowki Flyover Traffic Surge', 'Heavy peak hour bottleneck on Mehdipatnam-Gachibowli radial corridor. Relief buses injected at Shaikpet.', 'SEVERE', 1);
