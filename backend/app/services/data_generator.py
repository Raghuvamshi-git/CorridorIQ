import random
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from backend.app.models.transit import (
    Agency, Route, Stop, Vehicle, Trip, StopTime,
    VehiclePosition, TripUpdate, PassengerCount, DispatchEvent, ServiceAlert
)

# Seed for reproducible synthetic data
RANDOM_SEED = 42

HYDERABAD_STOPS_CATALOG = [
    {"stop_id": "STP-01", "stop_code": "SEC-01", "name": "Secunderabad Railway Station Hub", "lat": 17.4344, "lon": 78.5015, "zone": "SECUNDERABAD"},
    {"stop_id": "STP-02", "stop_code": "SEC-02", "name": "Patny Center", "lat": 17.4428, "lon": 78.4982, "zone": "SECUNDERABAD"},
    {"stop_id": "STP-03", "stop_code": "SEC-03", "name": "Paradise Circle", "lat": 17.4421, "lon": 78.4878, "zone": "SECUNDERABAD"},
    {"stop_id": "STP-04", "stop_code": "BGP-01", "name": "Begumpet Airport Bus Stop", "lat": 17.4526, "lon": 78.4682, "zone": "CENTRAL"},
    {"stop_id": "STP-05", "stop_code": "BGP-02", "name": "Prakash Nagar Metro Stop", "lat": 17.4435, "lon": 78.4612, "zone": "CENTRAL"},
    {"stop_id": "STP-06", "stop_code": "PNJ-01", "name": "Punjagutta X Roads", "lat": 17.4262, "lon": 78.4525, "zone": "CENTRAL"},
    {"stop_id": "STP-07", "stop_code": "AMP-01", "name": "Ameerpet Metro Interchange Hub", "lat": 17.4375, "lon": 78.4482, "zone": "CENTRAL"},
    {"stop_id": "STP-08", "stop_code": "AMP-02", "name": "Mythrivanam Complex", "lat": 17.4390, "lon": 78.4455, "zone": "CENTRAL"},
    {"stop_id": "STP-09", "stop_code": "SRN-01", "name": "SR Nagar Bus Station", "lat": 17.4438, "lon": 78.4410, "zone": "CENTRAL"},
    {"stop_id": "STP-10", "stop_code": "ESI-01", "name": "ESI Hospital", "lat": 17.4485, "lon": 78.4358, "zone": "CENTRAL"},
    {"stop_id": "STP-11", "stop_code": "ERG-01", "name": "Erragadda Bus Stop", "lat": 17.4542, "lon": 78.4285, "zone": "NORTH_WEST"},
    {"stop_id": "STP-12", "stop_code": "BHN-01", "name": "Bharat Nagar Metro", "lat": 17.4610, "lon": 78.4225, "zone": "NORTH_WEST"},
    {"stop_id": "STP-13", "stop_code": "MSP-01", "name": "Moosapet X Roads", "lat": 17.4678, "lon": 78.4168, "zone": "NORTH_WEST"},
    {"stop_id": "STP-14", "stop_code": "KPK-01", "name": "Kukatpally Y Junction", "lat": 17.4842, "lon": 78.4088, "zone": "NORTH_WEST"},
    {"stop_id": "STP-15", "stop_code": "KPH-01", "name": "KPHB Colony Metro Stop", "lat": 17.4932, "lon": 78.3995, "zone": "NORTH_WEST"},
    {"stop_id": "STP-16", "stop_code": "JNT-01", "name": "JNTU College Stop", "lat": 17.4985, "lon": 78.3912, "zone": "NORTH_WEST"},
    {"stop_id": "STP-17", "stop_code": "MYP-01", "name": "Miyapur Metro Terminal Depot", "lat": 17.4968, "lon": 78.3614, "zone": "NORTH_WEST"},
    {"stop_id": "STP-18", "stop_code": "MDP-01", "name": "Madhapur Police Station", "lat": 17.4482, "lon": 78.3905, "zone": "HITECH_CORRIDOR"},
    {"stop_id": "STP-19", "stop_code": "HIT-01", "name": "Cyber Towers Hitech City", "lat": 17.4504, "lon": 78.3808, "zone": "HITECH_CORRIDOR"},
    {"stop_id": "STP-20", "stop_code": "SHL-01", "name": "Shilparamam Arts Village", "lat": 17.4530, "lon": 78.3755, "zone": "HITECH_CORRIDOR"},
    {"stop_id": "STP-21", "stop_code": "HIT-02", "name": "Hitech City MMTS Station", "lat": 17.4620, "lon": 78.3732, "zone": "HITECH_CORRIDOR"},
    {"stop_id": "STP-22", "stop_code": "MND-01", "name": "Mindspace Tech Junction", "lat": 17.4412, "lon": 78.3812, "zone": "HITECH_CORRIDOR"},
    {"stop_id": "STP-23", "stop_code": "DGC-01", "name": "Durgam Cheruvu Cable Bridge Stop", "lat": 17.4335, "lon": 78.3860, "zone": "HITECH_CORRIDOR"},
    {"stop_id": "STP-24", "stop_code": "BIO-01", "name": "Bio-Diversity Park", "lat": 17.4278, "lon": 78.3742, "zone": "GACHIBOWLI"},
    {"stop_id": "STP-25", "stop_code": "GCH-01", "name": "Gachibowli Stadium", "lat": 17.4438, "lon": 78.3498, "zone": "GACHIBOWLI"},
    {"stop_id": "STP-26", "stop_code": "IIT-01", "name": "IIIT Hyderabad Circle", "lat": 17.4452, "lon": 78.3490, "zone": "GACHIBOWLI"},
    {"stop_id": "STP-27", "stop_code": "WPR-01", "name": "Wipro Circle Gachibowli", "lat": 17.4215, "lon": 78.3458, "zone": "FINANCIAL_DIST"},
    {"stop_id": "STP-28", "stop_code": "WVR-01", "name": "Financial District WaveRock", "lat": 17.4172, "lon": 78.3421, "zone": "FINANCIAL_DIST"},
    {"stop_id": "STP-29", "stop_code": "KND-01", "name": "Kondapur X Roads", "lat": 17.4685, "lon": 78.3582, "zone": "HITECH_CORRIDOR"},
    {"stop_id": "STP-30", "stop_code": "KTG-01", "name": "Kothaguda Botanical Garden", "lat": 17.4625, "lon": 78.3610, "zone": "HITECH_CORRIDOR"},
    {"stop_id": "STP-31", "stop_code": "MHD-01", "name": "Mehdipatnam Bus Terminal", "lat": 17.3915, "lon": 78.4412, "zone": "WEST_CENTRAL"},
    {"stop_id": "STP-32", "stop_code": "RTB-01", "name": "Rethi Bowli Junction", "lat": 17.3942, "lon": 78.4312, "zone": "WEST_CENTRAL"},
    {"stop_id": "STP-33", "stop_code": "TLK-01", "name": "Tolichowki Flyover Junction", "lat": 17.4015, "lon": 78.4125, "zone": "WEST_CENTRAL"},
    {"stop_id": "STP-34", "stop_code": "SHK-01", "name": "Shaikpet Dargah Stop", "lat": 17.4110, "lon": 78.3985, "zone": "WEST_CENTRAL"},
    {"stop_id": "STP-35", "stop_code": "DRG-01", "name": "Darga Junction Whisper Valley", "lat": 17.4165, "lon": 78.3872, "zone": "GACHIBOWLI"},
    {"stop_id": "STP-36", "stop_code": "MNK-01", "name": "Manikonda Marrichettu", "lat": 17.4045, "lon": 78.3780, "zone": "GACHIBOWLI"},
    {"stop_id": "STP-37", "stop_code": "KHJ-01", "name": "Khajaguda X Roads", "lat": 17.4190, "lon": 78.3685, "zone": "GACHIBOWLI"},
    {"stop_id": "STP-38", "stop_code": "LBN-01", "name": "LB Nagar Ring Road Depot", "lat": 17.3458, "lon": 78.5521, "zone": "EAST_SOUTH"},
    {"stop_id": "STP-39", "stop_code": "KMN-01", "name": "Kamineni Hospital Stop", "lat": 17.3512, "lon": 78.5432, "zone": "EAST_SOUTH"},
    {"stop_id": "STP-40", "stop_code": "DLS-01", "name": "Dilsukhnagar Bus Depot", "lat": 17.3688, "lon": 78.5245, "zone": "EAST_SOUTH"},
    {"stop_id": "STP-41", "stop_code": "CHP-01", "name": "Chaitanyapuri Metro Stop", "lat": 17.3625, "lon": 78.5312, "zone": "EAST_SOUTH"},
    {"stop_id": "STP-42", "stop_code": "MLK-01", "name": "Malakpet Metro Station", "lat": 17.3785, "lon": 78.4998, "zone": "EAST_SOUTH"},
    {"stop_id": "STP-43", "stop_code": "NLG-01", "name": "Nalgonda X Roads", "lat": 17.3792, "lon": 78.4912, "zone": "EAST_SOUTH"},
    {"stop_id": "STP-44", "stop_code": "KTI-01", "name": "Koti Women's College Terminal", "lat": 17.3865, "lon": 78.4875, "zone": "OLD_CITY_CENTRAL"},
    {"stop_id": "STP-45", "stop_code": "AFZ-01", "name": "Afzalgunj Bus Station", "lat": 17.3742, "lon": 78.4795, "zone": "OLD_CITY_CENTRAL"},
    {"stop_id": "STP-46", "stop_code": "CHR-01", "name": "Charminar Monument Bus Stop", "lat": 17.3616, "lon": 78.4747, "zone": "OLD_CITY_CENTRAL"},
    {"stop_id": "STP-47", "stop_code": "UPL-01", "name": "Uppal Ring Road Depot", "lat": 17.4025, "lon": 78.5595, "zone": "EAST_CORRIDOR"},
    {"stop_id": "STP-48", "stop_code": "UPL-02", "name": "Uppal Metro Station", "lat": 17.4055, "lon": 78.5570, "zone": "EAST_CORRIDOR"},
    {"stop_id": "STP-49", "stop_code": "SOI-01", "name": "Survey of India", "lat": 17.4125, "lon": 78.5492, "zone": "EAST_CORRIDOR"},
    {"stop_id": "STP-50", "stop_code": "HBG-01", "name": "Habsiguda X Roads", "lat": 17.4192, "lon": 78.5398, "zone": "EAST_CORRIDOR"},
    {"stop_id": "STP-51", "stop_code": "NGR-01", "name": "NGRI Metro Station", "lat": 17.4225, "lon": 78.5321, "zone": "EAST_CORRIDOR"},
    {"stop_id": "STP-52", "stop_code": "TRN-01", "name": "Tarnaka Metro Hub", "lat": 17.4285, "lon": 78.5285, "zone": "EAST_CORRIDOR"},
    {"stop_id": "STP-53", "stop_code": "LLG-01", "name": "Lalaguda Railway Gate", "lat": 17.4385, "lon": 78.5175, "zone": "EAST_CORRIDOR"},
    {"stop_id": "STP-54", "stop_code": "MTG-01", "name": "Mettuguda Metro Stop", "lat": 17.4362, "lon": 78.5125, "zone": "EAST_CORRIDOR"},
    {"stop_id": "STP-55", "stop_code": "JBL-01", "name": "Jubilee Hills Checkpost Metro", "lat": 17.4312, "lon": 78.4095, "zone": "CENTRAL_HILLS"},
    {"stop_id": "STP-56", "stop_code": "PDG-01", "name": "Peddamma Gudi Temple Stop", "lat": 17.4335, "lon": 78.3998, "zone": "CENTRAL_HILLS"},
    {"stop_id": "STP-57", "stop_code": "KBR-01", "name": "KBR National Park Gate", "lat": 17.4245, "lon": 78.4235, "zone": "CENTRAL_HILLS"},
    {"stop_id": "STP-58", "stop_code": "BNJ-01", "name": "Banjara Hills Road No 12", "lat": 17.4165, "lon": 78.4342, "zone": "CENTRAL_HILLS"},
    {"stop_id": "STP-59", "stop_code": "MSB-01", "name": "Masab Tank Flyover", "lat": 17.3995, "lon": 78.4528, "zone": "WEST_CENTRAL"},
    {"stop_id": "STP-60", "stop_code": "LDP-01", "name": "Lakdikapul Metro Station", "lat": 17.4042, "lon": 78.4635, "zone": "CENTRAL"},
    {"stop_id": "STP-61", "stop_code": "NMP-01", "name": "Nampally Hyderabad Station", "lat": 17.3925, "lon": 78.4695, "zone": "OLD_CITY_CENTRAL"},
    {"stop_id": "STP-62", "stop_code": "NNK-01", "name": "Nanakramguda Financial Circle", "lat": 17.4195, "lon": 78.3512, "zone": "FINANCIAL_DIST"},
    {"stop_id": "STP-63", "stop_code": "SNT-01", "name": "Sanathnagar Industrial Area", "lat": 17.4582, "lon": 78.4390, "zone": "NORTH_WEST"},
]

HYDERABAD_ROUTES_CATALOG = [
    {
        "route_id": "R-101",
        "short_name": "101",
        "long_name": "Secunderabad – Ameerpet – Hitech City",
        "corridor": "IT Corridor Crosstown Link",
        "origin": "Secunderabad Railway Station",
        "destination": "Cyber Towers Hitech City",
        "color": "#4F46E5",
        "dist": 19.8,
        "travel_time": 50,
        "headway": 10,
        "stops": ["STP-01", "STP-02", "STP-03", "STP-04", "STP-06", "STP-07", "STP-08", "STP-18", "STP-19"],
        "anomaly": "BUNCHING"
    },
    {
        "route_id": "R-102",
        "short_name": "102",
        "long_name": "Hitech City – Madhapur – Gachibowli",
        "corridor": "Cyberabad Tech Spine",
        "origin": "Cyber Towers Hitech City",
        "destination": "Gachibowli Stadium",
        "color": "#06B6D4",
        "dist": 14.2,
        "travel_time": 38,
        "headway": 8,
        "stops": ["STP-19", "STP-20", "STP-22", "STP-23", "STP-24", "STP-25", "STP-26"],
        "anomaly": "OVERCROWDING"
    },
    {
        "route_id": "R-103",
        "short_name": "103",
        "long_name": "Kukatpally – Miyapur Metro Corridor",
        "corridor": "Northwest Metro Trunk Line",
        "origin": "Kukatpally Y Junction",
        "destination": "Miyapur Metro Terminal",
        "color": "#10B981",
        "dist": 11.5,
        "travel_time": 30,
        "headway": 10,
        "stops": ["STP-14", "STP-15", "STP-16", "STP-17"],
        "anomaly": None
    },
    {
        "route_id": "R-104",
        "short_name": "104",
        "long_name": "LB Nagar – Dilsukhnagar – Koti",
        "corridor": "East-South Commercial Spine",
        "origin": "LB Nagar Ring Road",
        "destination": "Koti Women's College Terminal",
        "color": "#F59E0B",
        "dist": 16.4,
        "travel_time": 45,
        "headway": 12,
        "stops": ["STP-38", "STP-39", "STP-40", "STP-41", "STP-42", "STP-43", "STP-44"],
        "anomaly": None
    },
    {
        "route_id": "R-105",
        "short_name": "105",
        "long_name": "Mehdipatnam – Tolichowki – Gachibowli",
        "corridor": "West Radial Corridor",
        "origin": "Mehdipatnam Bus Terminal",
        "destination": "Gachibowli Stadium",
        "color": "#EC4899",
        "dist": 17.0,
        "travel_time": 44,
        "headway": 12,
        "stops": ["STP-31", "STP-32", "STP-33", "STP-34", "STP-35", "STP-37", "STP-25"],
        "anomaly": "SEVERE_DELAY"
    },
    {
        "route_id": "R-106",
        "short_name": "106",
        "long_name": "Uppal – Tarnaka – Secunderabad",
        "corridor": "East-Central Transitway",
        "origin": "Uppal Ring Road",
        "destination": "Secunderabad Railway Station",
        "color": "#8B5CF6",
        "dist": 13.5,
        "travel_time": 35,
        "headway": 10,
        "stops": ["STP-47", "STP-48", "STP-49", "STP-50", "STP-51", "STP-52", "STP-53", "STP-54", "STP-01"],
        "anomaly": None
    },
    {
        "route_id": "R-107",
        "short_name": "107",
        "long_name": "Kondapur – Financial District Express",
        "corridor": "Tech Shuttle Rapid Line",
        "origin": "Kondapur X Roads",
        "destination": "Financial District WaveRock",
        "color": "#14B8A6",
        "dist": 12.8,
        "travel_time": 32,
        "headway": 10,
        "stops": ["STP-29", "STP-30", "STP-19", "STP-25", "STP-27", "STP-28"],
        "anomaly": None
    },
    {
        "route_id": "R-108",
        "short_name": "108",
        "long_name": "Miyapur – Kukatpally – Ameerpet",
        "corridor": "Northwest Metro Feeder",
        "origin": "Miyapur Metro Terminal",
        "destination": "Ameerpet Metro Interchange",
        "color": "#3B82F6",
        "dist": 18.2,
        "travel_time": 48,
        "headway": 10,
        "stops": ["STP-17", "STP-16", "STP-15", "STP-14", "STP-13", "STP-12", "STP-11", "STP-10", "STP-09", "STP-07"],
        "anomaly": "LONG_HEADWAY"
    },
    {
        "route_id": "R-109",
        "short_name": "109",
        "long_name": "Jubilee Hills Checkpost – KBR Park – Masab Tank",
        "corridor": "Central Hills Transitway",
        "origin": "Jubilee Hills Checkpost",
        "destination": "Masab Tank Flyover",
        "color": "#F97316",
        "dist": 10.4,
        "travel_time": 28,
        "headway": 15,
        "stops": ["STP-55", "STP-56", "STP-57", "STP-58", "STP-59"],
        "anomaly": None
    },
    {
        "route_id": "R-110",
        "short_name": "110",
        "long_name": "Charminar – Afzalgunj – Koti",
        "corridor": "Heritage City Trunk",
        "origin": "Charminar Bus Stop",
        "destination": "Koti Women's College Terminal",
        "color": "#E11D48",
        "dist": 8.5,
        "travel_time": 25,
        "headway": 12,
        "stops": ["STP-46", "STP-45", "STP-44"],
        "anomaly": None
    },
    {
        "route_id": "R-111",
        "short_name": "111",
        "long_name": "Ameerpet – SR Nagar – Sanathnagar",
        "corridor": "Industrial Link Feeder",
        "origin": "Ameerpet Metro Interchange",
        "destination": "Sanathnagar Industrial Area",
        "color": "#84CC16",
        "dist": 9.6,
        "travel_time": 26,
        "headway": 15,
        "stops": ["STP-07", "STP-08", "STP-09", "STP-63"],
        "anomaly": None
    },
    {
        "route_id": "R-112",
        "short_name": "112",
        "long_name": "Gachibowli – Nanakramguda – WaveRock Circular",
        "corridor": "Financial District Circular Line",
        "origin": "Gachibowli Stadium",
        "destination": "Financial District WaveRock",
        "color": "#6366F1",
        "dist": 8.0,
        "travel_time": 22,
        "headway": 10,
        "stops": ["STP-25", "STP-26", "STP-27", "STP-62", "STP-28"],
        "anomaly": None
    }
]


def seed_database_data(db: Session) -> dict:
    """Populates relational database with statistically realistic synthetic Hyderabad transit data."""
    random.seed(RANDOM_SEED)

    # 1. Clean existing records in dependency order
    db.query(DispatchEvent).delete()
    db.query(ServiceAlert).delete()
    db.query(PassengerCount).delete()
    db.query(TripUpdate).delete()
    db.query(VehiclePosition).delete()
    db.query(StopTime).delete()
    db.query(Trip).delete()
    db.query(Vehicle).delete()
    db.query(Route).delete()
    db.query(Stop).delete()
    db.query(Agency).delete()
    db.commit()

    # 2. Agency
    agency = Agency(
        agency_id="TSRTC-HYD-SIM",
        agency_name="Hyderabad Metropolitan Transport Operations Authority (Simulated)",
        agency_url="https://transport.telangana.gov.in (Simulated Demonstration)",
        agency_timezone="Asia/Kolkata",
        agency_phone="+91-40-23450000",
        agency_lang="en"
    )
    db.add(agency)
    db.flush()

    # 3. Stops
    stop_map = {}
    for item in HYDERABAD_STOPS_CATALOG:
        stop = Stop(
            stop_id=item["stop_id"],
            stop_code=item["stop_code"],
            stop_name=item["name"],
            stop_lat=item["lat"],
            stop_lon=item["lon"],
            zone_id=item["zone"],
            location_type=1 if "Hub" in item["name"] or "Depot" in item["name"] else 0,
            corridor_name=item["zone"]
        )
        db.add(stop)
        stop_map[item["stop_id"]] = item
    db.flush()

    # 4. Routes
    routes_added = []
    for r_data in HYDERABAD_ROUTES_CATALOG:
        route = Route(
            route_id=r_data["route_id"],
            agency_id=agency.agency_id,
            route_short_name=r_data["short_name"],
            route_long_name=r_data["long_name"],
            corridor_name=r_data["corridor"],
            origin=r_data["origin"],
            destination=r_data["destination"],
            color=r_data["color"],
            distance_km=r_data["dist"],
            target_travel_time_mins=r_data["travel_time"],
            target_headway_mins=r_data["headway"],
            status="ACTIVE"
        )
        db.add(route)
        routes_added.append(route)
    db.flush()

    # 5. Vehicles (48 vehicles: 40% Electric, 30% CNG, 30% Clean Diesel)
    vehicles = []
    propulsion_options = ["ELECTRIC", "ELECTRIC", "CNG", "CNG", "DIESEL"]
    for i in range(1, 49):
        prop = propulsion_options[(i - 1) % len(propulsion_options)]
        model_name = (
            "Ashok Leyland Switch EiV 12 Electric" if prop == "ELECTRIC"
            else "Tata Starbus Ultra CNG BS-VI" if prop == "CNG"
            else "Volvo 8400 Low Floor Diesel"
        )
        
        # Vehicle 44 has low battery / fuel anomaly
        fuel_level = 14.5 if i == 44 else round(random.uniform(35.0, 98.0), 1)
        v_status = "MAINTENANCE" if i == 44 else "IN_SERVICE" if i <= 42 else "IDLE"

        vehicle = Vehicle(
            vehicle_id=f"TS-09-UB-{100 + i}",
            vehicle_label=f"TS-09-UB-{100 + i}",
            model=model_name,
            propulsion_type=prop,
            capacity=65 if prop == "ELECTRIC" else 55,
            fuel_or_battery_level=fuel_level,
            odometer_km=round(random.uniform(12000.0, 95000.0), 1),
            status=v_status,
            last_maintenance_date=date.today() - timedelta(days=random.randint(5, 60))
        )
        db.add(vehicle)
        vehicles.append(vehicle)
    db.flush()

    # 6. Trips, StopTimes, Positions, and TripUpdates
    today = datetime.now()
    base_time = today.replace(hour=6, minute=0, second=0, microsecond=0)

    trips_created = []
    stop_times_count = 0
    positions_count = 0
    updates_count = 0

    for r_idx, r_data in enumerate(HYDERABAD_ROUTES_CATALOG):
        r_id = r_data["route_id"]
        stops_in_route = r_data["stops"]
        anomaly = r_data.get("anomaly")
        num_stops = len(stops_in_route)

        # 4 dedicated fleet buses assigned per corridor
        route_vehicles = vehicles[r_idx * 4 : (r_idx + 1) * 4]

        # Generate 18 trips per route across operating day (06:00 to 22:00)
        for trip_num in range(1, 19):
            trip_id = f"TRIP-{r_data['short_name']}-{trip_num:03d}"
            v_idx = (trip_num - 1) % len(route_vehicles)
            assigned_vehicle = route_vehicles[v_idx]

            sched_dep = base_time + timedelta(minutes=(trip_num - 1) * r_data["headway"] * 5)
            sched_arr = sched_dep + timedelta(minutes=r_data["travel_time"])

            # Base delay modeling
            delay_mins = 0.0
            if anomaly == "SEVERE_DELAY":
                # Tolichowki / Mehdipatnam corridor congestion
                delay_mins = random.uniform(18.0, 26.5)
            elif anomaly == "BUNCHING" and trip_num in [4, 5]:
                # Trip 5 caught up with Trip 4
                delay_mins = 1.8 if trip_num == 4 else 12.4
            elif anomaly == "LONG_HEADWAY" and trip_num == 7:
                delay_mins = 22.0
            else:
                delay_mins = random.uniform(-1.0, 6.5)

            actual_dep = sched_dep + timedelta(minutes=delay_mins)
            actual_arr = sched_arr + timedelta(minutes=delay_mins + random.uniform(-1.0, 3.0))

            trip_status = "COMPLETED" if trip_num <= 14 else "IN_TRANSIT" if trip_num <= 16 else "SCHEDULED"

            trip = Trip(
                trip_id=trip_id,
                route_id=r_id,
                vehicle_id=assigned_vehicle.vehicle_id,
                service_id="DAILY_REGULAR",
                trip_headsign=f"{r_data['origin']} -> {r_data['destination']}",
                direction_id=0,
                scheduled_departure=sched_dep,
                actual_departure=actual_dep if trip_status != "SCHEDULED" else None,
                scheduled_arrival=sched_arr,
                actual_arrival=actual_arr if trip_status == "COMPLETED" else None,
                delay_departure_mins=round(delay_mins, 1),
                delay_arrival_mins=round(delay_mins + 1.2, 1),
                trip_status=trip_status
            )
            db.add(trip)
            trips_created.append(trip)

            # Generate StopTimes
            time_per_stop = max(2, r_data["travel_time"] // max(1, num_stops - 1))
            current_stop_time = sched_dep

            running_passengers = 20
            for seq, s_id in enumerate(stops_in_route, 1):
                s_arr = current_stop_time
                s_dep = s_arr + timedelta(seconds=45)
                a_arr = s_arr + timedelta(minutes=delay_mins) if trip_status != "SCHEDULED" else None
                a_dep = s_dep + timedelta(minutes=delay_mins) if trip_status != "SCHEDULED" else None

                # Realistic boarding / alighting counts
                board = random.randint(3, 16) if seq < num_stops else 0
                alight = 0 if seq == 1 else random.randint(2, min(running_passengers, 14))
                running_passengers = max(5, running_passengers + board - alight)
                if anomaly == "OVERCROWDING":
                    running_passengers = min(assigned_vehicle.capacity + 12, running_passengers + 15)

                st = StopTime(
                    trip_id=trip_id,
                    route_id=r_id,
                    stop_id=s_id,
                    stop_sequence=seq,
                    scheduled_arrival=s_arr,
                    scheduled_departure=s_dep,
                    actual_arrival=a_arr,
                    actual_departure=a_dep,
                    delay_seconds=int(delay_mins * 60),
                    boarding_count=board,
                    alighting_count=alight,
                    current_occupancy=running_passengers
                )
                db.add(st)
                stop_times_count += 1
                current_stop_time += timedelta(minutes=time_per_stop)

            # Generate Vehicle Positions (telemetry)
            # Create a sequence of position logs simulating bus progression
            base_stop_idx = int(v_idx * (num_stops / 4.0)) % num_stops
            for p_step in range(1, 16):
                # Historical vs active telemetry timestamp
                if trip_num <= 14:
                    pos_timestamp = sched_dep + timedelta(minutes=p_step * 2)
                    stop_idx = min(num_stops - 1, (base_stop_idx + p_step) % num_stops)
                    target_stop = stop_map[stops_in_route[stop_idx]]
                    jitter_lat = target_stop["lat"] + random.uniform(-0.002, 0.002)
                    jitter_lon = target_stop["lon"] + random.uniform(-0.002, 0.002)
                else:
                    # Active current run (trips 15-18): latest breadcrumbs leading up to now
                    pos_timestamp = today - timedelta(minutes=(16 - p_step) * 2 + v_idx * 1)
                    if p_step == 15 and r_id == "R-101" and v_idx in [0, 1]:
                        # R-101 bunching pair at Ameerpet Metro Interchange (STP-07)
                        ameerpet = stop_map["STP-07"]
                        if v_idx == 0:
                            jitter_lat = ameerpet["lat"] + 0.0006
                            jitter_lon = ameerpet["lon"] + 0.0005
                        else:
                            jitter_lat = ameerpet["lat"] - 0.0005
                            jitter_lon = ameerpet["lon"] - 0.0004
                    else:
                        stop_idx = min(num_stops - 1, (base_stop_idx + (p_step % max(1, num_stops // 2))) % num_stops)
                        target_stop = stop_map[stops_in_route[stop_idx]]
                        jitter_lat = target_stop["lat"] + random.uniform(-0.0015, 0.0015)
                        jitter_lon = target_stop["lon"] + random.uniform(-0.0015, 0.0015)

                speed = 0.0 if p_step % 5 == 0 else random.uniform(18.0, 42.0)
                pass_count = random.randint(25, 68) if anomaly == "OVERCROWDING" else random.randint(15, 52)
                load_factor = round(pass_count / assigned_vehicle.capacity, 2)
                
                occ_status = (
                    "CRUSHED_STANDING_ROOM" if load_factor > 1.05
                    else "STANDING_ROOM_ONLY" if load_factor > 0.85
                    else "FEW_SEATS_AVAILABLE" if load_factor > 0.50
                    else "MANY_SEATS_AVAILABLE"
                )

                vpos = VehiclePosition(
                    vehicle_id=assigned_vehicle.vehicle_id,
                    trip_id=trip_id,
                    route_id=r_id,
                    latitude=round(jitter_lat, 6),
                    longitude=round(jitter_lon, 6),
                    bearing=random.uniform(0.0, 360.0),
                    speed_kmh=round(speed, 1),
                    passenger_count=pass_count,
                    passenger_load_factor=load_factor,
                    occupancy_status=occ_status,
                    timestamp=pos_timestamp,
                    is_simulated=True
                )
                db.add(vpos)
                positions_count += 1

            # Trip Updates (Headway & Bunching metrics)
            sched_headway = float(r_data["headway"])
            if anomaly == "BUNCHING" and trip_num == 5:
                # Bus bunching: actual headway collapsed to 2.2 mins (22% of 10m target)
                act_headway = 2.2
                is_bunch = True
                is_long = False
            elif anomaly == "LONG_HEADWAY" and trip_num == 7:
                # Long headway: actual headway ballooned to 28.5 mins (285% of 10m target)
                act_headway = 28.5
                is_bunch = False
                is_long = True
            else:
                act_headway = round(sched_headway + random.uniform(-2.5, 3.5), 1)
                is_bunch = act_headway <= (sched_headway * 0.35)
                is_long = act_headway >= (sched_headway * 1.80)

            tup = TripUpdate(
                trip_id=trip_id,
                vehicle_id=assigned_vehicle.vehicle_id,
                route_id=r_id,
                delay_mins=round(delay_mins, 1),
                scheduled_headway_mins=sched_headway,
                actual_headway_mins=act_headway,
                headway_deviation_mins=round(act_headway - sched_headway, 1),
                is_bunching=is_bunch,
                is_long_headway=is_long,
                update_timestamp=today - timedelta(minutes=random.randint(2, 45))
            )
            db.add(tup)
            updates_count += 1

    db.flush()

    # 7. Passenger Counts by Hour (Morning Peak 8-11, Evening Peak 17-21)
    for route in routes_added:
        selected_stops = [s for s in HYDERABAD_STOPS_CATALOG if s["stop_id"] in [
            HYDERABAD_ROUTES_CATALOG[int(route.route_short_name) - 101]["stops"][0],
            HYDERABAD_ROUTES_CATALOG[int(route.route_short_name) - 101]["stops"][-1]
        ]]
        for stop_item in selected_stops:
            for hour in range(6, 23):
                # Peak hour multiplier
                if 8 <= hour <= 10:
                    multiplier = 3.2
                elif 17 <= hour <= 20:
                    multiplier = 3.6
                else:
                    multiplier = 1.0

                b_count = int(random.randint(35, 95) * multiplier)
                a_count = int(random.randint(30, 88) * multiplier)
                wait_time = round(random.uniform(4.0, 9.0) * (1.6 if multiplier > 2 else 1.0), 1)

                p_count = PassengerCount(
                    route_id=route.route_id,
                    stop_id=stop_item["stop_id"],
                    date_val=date.today(),
                    hour_of_day=hour,
                    boardings=b_count,
                    alightings=a_count,
                    estimated_wait_time_mins=wait_time
                )
                db.add(p_count)

    # 8. Operational Dispatch Events & Evidence-Backed Recommendations
    dispatch_seed = [
        {
            "rec_id": "REC-HYD-001",
            "route_id": "R-101",
            "vehicle_id": "TS-09-UB-104",
            "issue_type": "BUS_BUNCHING",
            "severity": "HIGH",
            "evidence": "Trip TRIP-101-005 (TS-09-UB-104) and TRIP-101-004 (TS-09-UB-103) running with 2.2-minute headway at Ameerpet Metro Hub (target: 10.0 mins). Lead bus delayed by passenger boarding surge.",
            "recommended_action": "Hold trailing vehicle TS-09-UB-104 for 4.5 minutes at Mythrivanam Complex stop to restore 7+ minute headway spacing.",
            "expected_benefit": "Prevents downstream platooning along Cyber Towers corridor and balances passenger load across both buses.",
            "confidence_score": 0.94,
            "status": "PENDING_REVIEW"
        },
        {
            "rec_id": "REC-HYD-002",
            "route_id": "R-105",
            "vehicle_id": "TS-09-UB-112",
            "issue_type": "SEVERE_DELAY",
            "severity": "CRITICAL",
            "evidence": "Average corridor delay reached 23.4 minutes on Mehdipatnam-Tolichowki-Gachibowli corridor due to heavy flyover approach traffic and rain runoff.",
            "recommended_action": "Inject standby relief bus TS-09-UB-141 from Mehdipatnam depot to start short-trip run originating directly from Shaikpet Dargah.",
            "expected_benefit": "Restores 12-minute service frequency for stranded Gachibowli IT park bound commuters.",
            "confidence_score": 0.89,
            "status": "APPROVED"
        },
        {
            "rec_id": "REC-HYD-003",
            "route_id": "R-102",
            "vehicle_id": "TS-09-UB-108",
            "issue_type": "OVERCROWDING",
            "severity": "HIGH",
            "evidence": "Passenger load factor sustained at 1.14 (74 passengers on 65-capacity Electric Bus) between Mindspace Tech Junction and Gachibowli Stadium.",
            "recommended_action": "Authorize temporary peak-hour headway reduction from 8 minutes to 6 minutes by deploying idle Electric Bus TS-09-UB-143.",
            "expected_benefit": "Reduces platform wait time from 11.2 mins to 6.4 mins and alleviates safety hazards from doorway standing.",
            "confidence_score": 0.92,
            "status": "PENDING_REVIEW"
        },
        {
            "rec_id": "REC-HYD-004",
            "route_id": "R-108",
            "vehicle_id": "TS-09-UB-118",
            "issue_type": "LONG_HEADWAY",
            "severity": "MEDIUM",
            "evidence": "Observed 28.5-minute headway gap at KPHB Colony Metro following mechanical pull-out of previous scheduled vehicle.",
            "recommended_action": "Express-run the next scheduled departure from Miyapur Terminal skipping Bharat Nagar and Erragadda stops.",
            "expected_benefit": "Closes the 28-minute service hole in Ameerpet by approximately 9 minutes.",
            "confidence_score": 0.86,
            "status": "RESOLVED"
        }
    ]

    for d in dispatch_seed:
        de = DispatchEvent(
            recommendation_id=d["rec_id"],
            route_id=d["route_id"],
            vehicle_id=d["vehicle_id"],
            issue_type=d["issue_type"],
            severity=d["severity"],
            evidence=d["evidence"],
            recommended_action=d["recommended_action"],
            expected_benefit=d["expected_benefit"],
            confidence_score=d["confidence_score"],
            status=d["status"],
            created_at=datetime.utcnow() - timedelta(minutes=random.randint(15, 120))
        )
        db.add(de)

    # 9. Service Alerts
    alerts_seed = [
        {
            "alert_id": "ALT-HYD-01",
            "route_id": "R-101",
            "cause": "CONSTRUCTION_WORK",
            "effect": "SIGNIFICANT_DELAYS",
            "header": "Metro Feeder Roadwork near Ameerpet Interchange",
            "desc": "Road resurfacing work restricting lanes to single file between Punjagutta and Ameerpet. Expect 10-15 minute delays on Route 101.",
            "severity": "WARNING"
        },
        {
            "alert_id": "ALT-HYD-02",
            "route_id": "R-105",
            "cause": "HEAVY_TRAFFIC",
            "effect": "MODIFIED_SERVICE",
            "header": "Tolichowki Flyover Traffic Surge",
            "desc": "Heavy peak hour bottleneck on Mehdipatnam-Gachibowli radial corridor. Relief buses injected at Shaikpet.",
            "severity": "SEVERE"
        }
    ]

    for a in alerts_seed:
        sa = ServiceAlert(
            alert_id=a["alert_id"],
            route_id=a["route_id"],
            cause=a["cause"],
            effect=a["effect"],
            header_text=a["header"],
            description_text=a["desc"],
            severity=a["severity"],
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(sa)

    db.commit()

    return {
        "agency": 1,
        "routes": len(routes_added),
        "stops": len(HYDERABAD_STOPS_CATALOG),
        "vehicles": len(vehicles),
        "trips": len(trips_created),
        "stop_times": stop_times_count,
        "telemetry_positions": positions_count,
        "trip_updates": updates_count,
        "dispatch_events": len(dispatch_seed),
        "service_alerts": len(alerts_seed)
    }

