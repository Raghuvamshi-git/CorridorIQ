# CorridorIQ — Agentic Transport Operations Intelligence Platform
### Hyderabad Metropolitan Transit Operations Center (Telangana, India)

![Platform](https://img.shields.io/badge/Platform-CorridorIQ-indigo.svg)
![Location](https://img.shields.io/badge/Region-Hyderabad%20(IST)-emerald.svg)
![AI](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-blue.svg)
![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203-darkgreen.svg)
![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Tailwind%20%7C%20Vite-cyan.svg)
![Database](https://img.shields.io/badge/Database-MySQL%208.0%20%7C%20SQLite%20Fallback-amber.svg)

---

## 🚌 1. Executive Summary & Problem Statement

Urban public transit networks often suffer from unpredicted bottlenecks:
- **Bus Bunching**: Consecutive buses arrive within 2 minutes of each other, followed by a 30-minute service void.
- **Corridor Delay Propagation**: Single choke-points (such as the Tolichowki Flyover in West Hyderabad) cause cascading delays across the entire arterial route.
- **Overcrowded Metro Feeders**: Transfer hubs like Ameerpet Interchange and Cyber Towers Hitech City experience sudden surges exceeding standard bus capacities.

**CorridorIQ** is a local, production-minded operations platform built for the **Hyderabad Metropolitan Region (Telangana, India)**. It combines real-time operational analytics, GTFS-inspired relational data modeling, and **Google Gemini 2.5 Flash** native function calling to provide transport controllers with evidence-backed dispatch interventions.

> **⚠️ Simulation Disclosure:** All transit telematics, GPS coordinates, delays, and passenger load factors included in this platform are synthetically generated for demonstration and operational analysis. They do not represent live feeds from TSRTC, Hyderabad Metro Rail, or government agencies.

---

## 🏙️ 2. Hyderabad Geographic & Operational Scope

* **Operating City**: Hyderabad, Telangana, India.
* **Map Center**: $17.3850^\circ\text{ N}, 78.4867^\circ\text{ E}$.
* **Timezone**: Asia/Kolkata (IST, UTC+5:30).
* **Currency**: Indian Rupee (INR ₹).
* **12 Monitored Transport Corridors**:
  1. `R-101`: Secunderabad – Ameerpet – Hitech City (Crosstown IT Link)
  2. `R-102`: Hitech City – Madhapur – Gachibowli (Cyberabad Tech Spine)
  3. `R-103`: Kukatpally – Miyapur (Northwest Metro Trunk Line)
  4. `R-104`: LB Nagar – Dilsukhnagar – Koti (East-South Commercial Spine)
  5. `R-105`: Mehdipatnam – Tolichowki – Gachibowli (West Radial Corridor)
  6. `R-106`: Uppal – Tarnaka – Secunderabad (East-Central Express)
  7. `R-107`: Kondapur – Financial District Express (Tech Shuttle Rapid Line)
  8. `R-108`: Miyapur – Kukatpally – Ameerpet (Northwest Metro Feeder)
  9. `R-109`: Jubilee Hills Checkpost – KBR Park – Masab Tank (Central Hills Corridor)
  10. `R-110`: Charminar – Afzalgunj – Koti (Heritage City Trunk)
  11. `R-111`: Ameerpet – SR Nagar – Sanathnagar (Industrial Corridor Link)
  12. `R-112`: Gachibowli – Nanakramguda – WaveRock Circular (Financial District Circular)

---

## 🛠️ 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS (Dark Enterprise Palette), Recharts, Leaflet, Lucide Icons |
| **Backend** | Python 3, FastAPI, SQLAlchemy 2.0, Pydantic v2, PyMySQL, Uvicorn |
| **Database** | MySQL 8.0 (InnoDB) with zero-configuration SQLite development fallback (`corridoriq.db`) |
| **AI Intelligence** | Google Gemini 2.5 Flash via official `google-genai` Python SDK with 7 Native Tools |
| **Testing** | Pytest, Pytest-Asyncio, HTTPX |

---

## 📁 4. Project Folder Structure

```
corridor-iq/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application bootstrap & CORS
│   │   ├── core/
│   │   │   ├── config.py               # Pydantic Settings & regional parameters
│   │   │   └── database.py             # Engine factory (MySQL + SQLite fallback)
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── transit.py              # 11 GTFS-inspired SQLAlchemy ORM models
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── transit_schema.py       # Pydantic v2 validation contracts
│   │   ├── repositories/
│   │   │   ├── __init__.py
│   │   │   ├── route_repository.py     # Corridor data access abstraction
│   │   │   ├── vehicle_repository.py   # Fleet inventory & telemetry access
│   │   │   ├── trip_repository.py      # Timetable & stop arrival access
│   │   │   └── dispatch_repository.py  # Dispatch review audit persistence
│   │   ├── api/routes/
│   │   │   ├── health.py               # System & engine status
│   │   │   ├── dashboard.py            # Overview KPIs & Recharts trends
│   │   │   ├── routes.py               # Route intelligence & headway endpoints
│   │   │   ├── vehicles.py             # Fleet diagnostics & live GPS positions
│   │   │   ├── analytics.py            # Delays, headways, passenger demand
│   │   │   ├── dispatch.py             # Human controller recommendation review
│   │   │   └── agent.py                # Gemini tool calling chat endpoint
│   │   ├── services/
│   │   │   ├── analytics_service.py    # Analytical calculation engine
│   │   │   └── data_generator.py       # Synthetic transit data simulator
│   │   └── agent/
│   │       ├── gemini_agent.py         # Gemini SDK orchestrator & fallback
│   │       ├── tools.py                # 7 operational transit database tools
│   │       └── prompts.py              # Controller persona & domain instructions
│   ├── scripts/
│   │   └── seed_database.py            # Standalone database seeder
│   ├── tests/
│   │   └── test_api.py                 # Automated test suite (15 test cases)
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                 # Sidebar, Navbar, StatCard, Badge
│   │   │   └── map/                    # HyderabadTransitMap (Leaflet)
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx       # Executive Overview & Recharts
│   │   │   ├── LiveOperationsPage.jsx  # Live GPS Telemetry & Hyderabad Map
│   │   │   ├── RoutesPage.jsx          # Route Intelligence & Stop Progression
│   │   │   ├── FleetPage.jsx           # Fleet Health & Battery Analytics
│   │   │   ├── DemandPage.jsx          # Passenger Demand & Rush Hours
│   │   │   ├── AgentStudioPage.jsx     # AI Operations Agent & Tool Calling
│   │   │   ├── DispatchPage.jsx        # Dispatch Recommendation Action Center
│   │   │   └── SettingsPage.jsx        # System & Regional Settings
│   │   ├── services/
│   │   │   └── api.js                  # Native fetch API service layer
│   │   ├── App.jsx                     # Top-level navigation layout
│   │   ├── main.jsx                    # React entry
│   │   └── index.css                   # Tailwind styling & Leaflet CSS
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── database/
│   ├── schema.sql                      # Complete MySQL 8.0 DDL (11 tables)
│   └── seed.sql                        # SQL seed script
├── docs/
│   ├── architecture.md                 # System architecture specification
│   ├── database-schema.md              # ERD & GTFS operational extensions
│   ├── analytics-engine.md             # Transit formulas, thresholds & anomalies
│   ├── api-documentation.md            # REST API reference
│   └── ai-agent-workflow.md            # Gemini tool calling architecture
├── .gitignore
└── README.md
```

---

## ⚡ 5. Installation & Run Guide (Windows PowerShell)

### Prerequisites
* Python 3.10+
* Node.js v18+ & npm

### Step 1: Backend Setup
```powershell
# 1. Navigate to backend directory
cd backend

# 2. Create and activate Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Configure environment (Optional: set GEMINI_API_KEY)
Copy-Item .env.example .env

# 5. Seed the Hyderabad transport database
python scripts/seed_database.py

# 6. Start the FastAPI development server
uvicorn backend.app.main:app --reload --port 8000
```
* Backend API: `http://127.0.0.1:8000`
* Swagger / OpenAPI Interactive Docs: `http://127.0.0.1:8000/docs`

### Step 2: Frontend Setup
Open a second PowerShell terminal:
```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install frontend dependencies
npm install

# 3. Start the Vite development server
npm run dev
```
* Frontend Dashboard: `http://localhost:5173`

---

## 🤖 6. Google Gemini AI Agent & Tool Calling

The autonomous operations agent uses **Google Gemini 2.5 Flash** with native function calling.

### Activating Live Gemini Intelligence:
1. Open `backend/.env`
2. Add your Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.5-flash
   ```
3. Restart the backend. The AI Agent Studio immediately unlocks multi-turn GenAI reasoning!

*(If no key is configured, the agent gracefully runs using the exact same local database tools, answering queries with factual data and displaying a helpful setup notice.)*

### Callable Operational Tools:
1. `get_route_performance(route_id, start_date, end_date)`
2. `get_vehicle_positions(route_id)`
3. `detect_headway_anomalies(route_id, time_window)`
4. `analyze_passenger_demand(route_id, time_window)`
5. `get_delay_analysis(route_id, time_window)`
6. `compare_routes(route_ids)`
7. `create_dispatch_recommendation(route_id, issue_type, explanation, proposed_action, priority)`

---

## 🧪 7. Automated Testing

Run the automated test suite verifying all 15 backend test cases:
```powershell
.\backend\.venv\Scripts\pytest -p no:asyncio -v backend\tests\test_api.py
```

### Verified Test Results:
```text
backend/tests/test_api.py::test_health_endpoint PASSED                   [  6%]
backend/tests/test_api.py::test_dashboard_summary PASSED                 [ 13%]
backend/tests/test_api.py::test_dashboard_trends PASSED                  [ 20%]
backend/tests/test_api.py::test_get_routes PASSED                        [ 26%]
backend/tests/test_api.py::test_get_route_detail PASSED                  [ 33%]
backend/tests/test_api.py::test_get_vehicles PASSED                      [ 40%]
backend/tests/test_api.py::test_get_vehicle_positions PASSED             [ 46%]
backend/tests/test_api.py::test_analytics_headways_and_bunching PASSED   [ 53%]
backend/tests/test_api.py::test_analytics_passenger_demand PASSED        [ 60%]
backend/tests/test_api.py::test_dispatch_recommendations_and_update PASSED [ 66%]
backend/tests/test_api.py::test_agent_chat_bunching_query PASSED         [ 73%]
backend/tests/test_api.py::test_database_record_scale_compliance PASSED  [ 80%]
backend/tests/test_api.py::test_pagination_endpoints PASSED              [ 86%]
backend/tests/test_api.py::test_headway_anomalies_schema_fields PASSED   [ 93%]
backend/tests/test_api.py::test_dispatch_recommendation_generation PASSED [100%]

======================= 15 passed in 10.31s ========================
```

Frontend production build check:
```powershell
cd frontend
npm run build
# Output: ✓ built in 4.19s with 0 errors
```

---

## 🔒 8. Security & Best Practices
* **Zero Hardcoded Secrets**: Secrets and connection URLs are strictly loaded via `.env` files.
* **SQL Injection Prevention**: Parameterized queries enforced via SQLAlchemy 2.0 ORM.
* **Bounded Tool Execution**: Gemini has zero raw SQL execution privileges and can only invoke predefined read-only analytic methods and queued recommendation creation.
* **Human-in-the-Loop**: All AI dispatch recommendations require manual authorization by the controller.

---

## 🌐 9. Public Deployment & Sharing
CorridorIQ supports unified single-port full-stack container deployment:
* **Docker Multi-Stage Build**: Compiles React frontend and packages with FastAPI.
* **1-Click Render Deployment**: Configured via `render.yaml` and `Dockerfile`.
* **Deployment Guide**: See [docs/deployment-guide.md](file:///c:/Users/raghu%20vamshi/Desktop/bus%20project/docs/deployment-guide.md) for step-by-step instructions for Render, Railway, Cloudflare Tunnels, and Wi-Fi sharing.
