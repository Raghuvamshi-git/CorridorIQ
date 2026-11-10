# CorridorIQ — REST API Documentation
## Base URL: `/api` (or `http://127.0.0.1:8000/api`)

---

### 1. System Health
* **`GET /api/health`**
  * Verifies backend service, database engine dialect, operating region, and Gemini configuration status.
  * **Response**:
    ```json
    {
      "status": "online",
      "service": "CorridorIQ — Agentic Transport Operations Intelligence Platform",
      "version": "1.0.0",
      "region": "Hyderabad, Telangana, India",
      "database_dialect": "sqlite",
      "database_status": "connected",
      "gemini_configured": true,
      "timestamp": "2026-11-10T19:30:00"
    }
    ```

---

### 2. Dashboard Operations
* **`GET /api/dashboard/summary`**
  * Returns core KPI cards: network OTP %, total active fleet, avg delay in minutes, passenger count, active anomalies, pending recommendations.
* **`GET /api/dashboard/trends`**
  * Time-series dataset for Recharts: hourly passenger demand, corridor performance comparison, and delay distribution buckets.
* **`POST /api/dashboard/seed`**
  * Resets and regenerates realistic synthetic transport data for the 12 Hyderabad corridors.

---

### 3. Routes & Corridors
* **`GET /api/routes`**
  * Returns all 12 Hyderabad corridors with distance, headway, active bus count, avg delay, and OTP percentage.
* **`GET /api/routes/{route_id}`**
  * Returns detailed corridor information including stop sequence, scheduled/actual arrival times, current occupancy, and live vehicle positions.
* **`GET /api/routes/{route_id}/headways`**
  * Returns detected bus bunching or headway irregularities along the specified corridor.

---

### 4. Fleet & Telemetry
* **`GET /api/vehicles`**
  * Query parameters:
    * `status` (optional): `IN_SERVICE`, `MAINTENANCE`, `IDLE`
    * `propulsion` (optional): `ELECTRIC`, `CNG`, `DIESEL`
    * `skip` (optional, default `0`): Pagination offset
    * `limit` (optional, default `100`, max `500`): Max records
  * Returns fleet units with battery/fuel %, odometer, and current operational speed.
* **`GET /api/vehicles/positions`**
  * Query parameters:
    * `route_id` (optional): Filter coordinates by corridor
    * `skip` (optional, default `0`): Pagination offset
    * `limit` (optional, default `100`, max `500`): Max records
  * Returns simulated GPS latitude/longitude, speeds, bearing, and occupancy status for Leaflet map rendering.

---

### 5. Transport Analytics
* **`GET /api/analytics/delays`**
  * Aggregated delay distributions and top delayed corridors.
* **`GET /api/analytics/headways`**
  * Query parameters: `route_id` (optional), `skip` (default `0`), `limit` (default `50`).
  * Network-wide headway anomalies, identifying bus bunching events and service gaps with stop-level resolution, `actual_metric`, and `expected_metric`.
* **`GET /api/analytics/passenger-demand`**
  * Query parameters: `route_id` (optional).
  * 24-hour boarding profiles and morning/evening commuter peak volumes.
* **`GET /api/analytics/route-comparison`**
  * Multi-dimensional corridor rankings evaluating OTP, average delay, speed, and passenger load.

---

### 6. AI Operations Agent
* **`POST /api/agent/chat`**
  * Accepts an operational query from the transit controller and executes native Gemini tools.
  * **Request**:
    ```json
    {
      "message": "Are buses bunching on Route 101 between Secunderabad and Hitech City?",
      "conversation_history": []
    }
    ```
  * **Response**:
    ```json
    {
      "reply": "Route 101 has confirmed bus bunching at Ameerpet Metro Hub between TS09UB1001 and TS09UB1002 (headway: 3.2 mins vs 12.0 mins target).",
      "tools_executed": [
        {
          "tool_name": "detect_headway_anomalies",
          "arguments": {"route_id": "R-101"},
          "result": {...}
        }
      ],
      "gemini_active": true
    }
    ```

---

### 7. Dispatch Recommendations
* **`GET /api/dispatch/recommendations`**
  * Query parameters: `status` (`PENDING_REVIEW`, `APPROVED`, `REJECTED`, `RESOLVED`), `skip` (default `0`), `limit` (default `50`).
  * Returns operational interventions with evidence, confidence, and action items.
* **`POST /api/dispatch/generate`**
  * Triggers an automated scan across current telemetry and schedules to synthesize fresh dispatch recommendations for bunching, corridor delays, or battery depletion.
* **`POST /api/dispatch/recommendations/{recommendation_id}/status`**
  * Updates the status of a recommendation.
  * **Request**:
    ```json
    {
      "status": "APPROVED"
    }
    ```
    }
    ```

