import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.core.database import init_db, SessionLocal, ACTIVE_DIALECT
from backend.app.services.data_generator import seed_database_data

def run_seed():
    print("=" * 70)
    print("CorridorIQ — Hyderabad Transport Operations Synthetic Seeder")
    print(f"Target Database Dialect: {ACTIVE_DIALECT}")
    print("=" * 70)

    # Initialize tables
    init_db()

    # Seed data
    db = SessionLocal()
    try:
        stats = seed_database_data(db)
        print("\n[SUCCESS] Simulated Transit Network Seeded Successfully!")
        print(f"- Agencies:             {stats['agency']}")
        print(f"- Corridors & Routes:   {stats['routes']} (Hyderabad Arterials & Tech Corridors)")
        print(f"- Transit Stops:        {stats['stops']} (Geocoded Hyderabad Points)")
        print(f"- Active Fleet:         {stats['vehicles']} (Electric, CNG, Diesel)")
        print(f"- Scheduled Trips:      {stats['trips']}")
        print(f"- Stop-Time Records:    {stats['stop_times']}")
        print(f"- Vehicle Telemetry:    {stats['telemetry_positions']}")
        print(f"- Headway/Trip Updates: {stats['trip_updates']}")
        print(f"- Dispatch Events:      {stats['dispatch_events']}")
        print(f"- Active Alerts:        {stats['service_alerts']}")
        print("\nNote: All records are simulated for operational analysis demonstration.")
        print("=" * 70)
    except Exception as e:
        print(f"\n[ERROR] Seeding failed: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()

