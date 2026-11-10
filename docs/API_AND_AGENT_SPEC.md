# CorridorIQ – REST API & AI Agent Specification

---

## Part 1: REST API Endpoints

All endpoints are prefixed with `/api/v1` and follow standard HTTP conventions, returning structured JSON payloads.

### 1.1. System & Health Endpoints
* **`GET /api/v1/health`**
  * **Summary**: Verifies API and database connectivity.
  * **Response (200 OK)**:
    ```json
    {
      "status": "online",
      "timestamp": "2026-11-10T17:30:00Z",
      "database": "connected",
      "version": "1.0.0"
    }
    ```

### 1.2. Corridors & Route Endpoints
* **`GET /api/v1/routes`**
  * **Summary**: Lists all transit corridors and routes with on-time performance (OTP), active bus count, and average delay.
  * **Response (200 OK)**:
    ```json
    [
      {
        "id": 1,
        "route_code": "R-101",
        "route_name": "Metro Central - Tech Park",
        "corridor_name": "Arterial Expressway 1",
        "distance_km": 18.5,
        "target_travel_time_mins": 45,
        "active_buses": 6,
        "avg_delay_mins": 11.4,
        "on_time_rate_pct": 74.2,
        "status": "ACTIVE"
      }
    ]
    ```

* **`GET /api/v1/routes/{id}`**
  * **Summary**: Detailed route metadata including its sequence of stops and active trips.

* **`GET /api/v1/routes/{id}/performance`**
  * **Summary**: Route-specific hourly delay breakdown, headway variance, and passenger load distribution.

### 1.3. Fleet & Vehicle Endpoints
* **`GET /api/v1/vehicles`**
  * **Query Params**: `status` (optional: `IN_SERVICE`, `MAINTENANCE`, `IDLE`), `propulsion` (optional: `ELECTRIC`, `DIESEL`, `HYBRID`).
  * **Response (200 OK)**:
    ```json
    [
      {
        "id": 3,
        "vehicle_code": "BUS-204",
        "model": "Volvo 7900 Electric",
        "capacity": 70,
        "propulsion_type": "ELECTRIC",
        "fuel_or_battery_level": 34.5,
        "odometer_km": 84210.0,
        "status": "IN_SERVICE",
        "current_trip_id": 14,
        "current_speed_kmh": 32.0,
        "current_load_factor": 0.88
      }
    ]
    ```

* **`GET /api/v1/vehicles/{id}`**
  * **Summary**: Returns specific vehicle diagnostic details, recent telemetry points, and maintenance logs.

### 1.4. Operational Analytics & Inefficiency Endpoints
* **`GET /api/v1/analytics/overview`**
  * **Summary**: High-level network KPI cards for the executive dashboard.
  * **Response (200 OK)**:
    ```json
    {
      "network_otp_pct": 81.3,
      "total_active_buses": 24,
      "total_scheduled_trips": 180,
      "avg_network_delay_mins": 6.8,
      "bunching_incidents_active": 3,
      "critical_alerts_count": 2
    }
    ```

* **`GET /api/v1/analytics/bottlenecks`**
  * **Summary**: Identifies route segments experiencing severe headway irregularities, bus bunching, and recurring delay spikes.
  * **Response (200 OK)**:
    ```json
    [
      {
        "route_code": "R-101",
        "corridor_name": "Arterial Expressway 1",
        "bottleneck_type": "BUS_BUNCHING",
        "severity": "HIGH",
        "involved_vehicles": ["BUS-102", "BUS-103"],
        "headway_gap_mins": 2.1,
        "scheduled_headway_mins": 10.0,
        "description": "BUS-103 has caught up with BUS-102 due to passenger boarding surge at Metro Central."
      }
    ]
    ```

* **`GET /api/v1/analytics/passenger-demand`**
  * **Query Params**: `route_id` (optional), `date` (optional).
  * **Summary**: Hourly boardings vs. alightings across stops for demand heatmaps and load profiles.

### 1.5. Synthetic Data Management Endpoint
* **`POST /api/v1/seed/generate`**
  * **Summary**: Resets and generates statistically balanced synthetic transit data for routes, trips, telemetry, and incidents.
  * **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "message": "Generated 5 routes, 50 stops, 25 vehicles, 180 trips, and 850 telemetry logs.",
      "timestamp": "2026-11-10T17:30:00Z"
    }
    ```

### 1.6. Agentic AI Chat Endpoint
* **`POST /api/v1/agent/chat`**
  * **Request Body**:
    ```json
    {
      "message": "Which routes have the highest delays right now, and is there any bus bunching on R-101?",
      "conversation_history": [
        {"role": "user", "content": "Hello CorridorIQ"},
        {"role": "model", "content": "Hello Controller. How can I assist with your transit network today?"}
      ]
    }
    ```
  * **Response (200 OK)**:
    ```json
    {
      "reply": "Route R-101 is currently experiencing the highest delay in the network (11.4 mins avg delay). A bus bunching incident is confirmed between BUS-102 and BUS-103 at stop STP-03, where their headway has collapsed to 2.1 minutes.",
      "tools_executed": [
        {
          "tool_name": "get_network_delay_hotspots",
          "arguments": {"min_delay_minutes": 5.0},
          "result": [...]
        },
        {
          "tool_name": "detect_bus_bunching",
          "arguments": {"route_code": "R-101"},
          "result": [...]
        }
      ],
      "recommended_actions": [
        "Instruct BUS-103 to hold for 4 minutes at Stop STP-04 (Station West) to re-establish a 7-minute headway.",
        "Dispatch reserve vehicle BUS-208 to initiate an express run skipping low-boarding stops."
      ]
    }
    ```

---

## Part 2: AI Agent Architecture & Tool Calling

### 2.1. Agent Persona & System Prompt
The agent is configured with the persona:
> *"You are CorridorIQ Senior Transport Operations Controller & Dispatch Strategist. Your mission is to assist transit dispatchers and urban mobility managers in maintaining network punctuality, identifying bottlenecks, resolving bus bunching, managing electric fleet battery levels, and prescribing immediate corrective dispatch actions. Always query operational tools to obtain real data before drawing conclusions."*

### 2.2. Tool Registry (Python & Gemini Schemas)

The agent is equipped with five modular tools defined in Python:

#### Tool 1: `get_network_delay_hotspots`
* **Purpose**: Identifies which corridors and routes currently exceed acceptable delay thresholds.
* **Signature**:
  ```python
  def get_network_delay_hotspots(min_delay_mins: float = 5.0) -> list[dict]:
      """Fetches routes and corridors with average delays exceeding min_delay_mins."""
  ```

#### Tool 2: `detect_bus_bunching`
* **Purpose**: Scans active trips on a corridor to identify paired vehicles whose actual headway is under 30% of scheduled headway.
* **Signature**:
  ```python
  def detect_bus_bunching(route_code: str | None = None) -> list[dict]:
      """Detects bus bunching events across the network or for a specific route code."""
  ```

#### Tool 3: `get_fleet_health_and_battery`
* **Purpose**: Queries vehicles by status, low fuel or battery warning levels (< 25%), and pending maintenance.
* **Signature**:
  ```python
  def get_fleet_health_and_battery(status: str | None = None, low_battery_threshold: float = 25.0) -> list[dict]:
      """Lists fleet vehicles with low fuel/battery or critical maintenance status."""
  ```

#### Tool 4: `get_corridor_passenger_demand`
* **Purpose**: Examines boarding surges and passenger overcrowding for a given route and time window.
* **Signature**:
  ```python
  def get_corridor_passenger_demand(route_code: str, hour: int | None = None) -> dict:
      """Analyzes passenger boardings, wait times, and overcrowding hotspots along a route."""
  ```

#### Tool 5: `prescribe_dispatch_intervention`
* **Purpose**: Simulates and prescribes an operational dispatch action (e.g. hold bus, short-turn, inject relief bus).
* **Signature**:
  ```python
  def prescribe_dispatch_intervention(route_code: str, issue_type: str, vehicle_code: str | None = None) -> dict:
      """Calculates recommended headway adjustment, holding duration, or relief bus deployment."""
  ```

### 2.3. Multi-Turn Tool Calling Execution Loop
1. **User Request**: User sends query to `/api/v1/agent/chat`.
2. **First Gemini Invocation**: The conversation history and tool declarations are passed to Gemini (`gemini-2.5-flash` or `gemini-1.5-flash`).
3. **Model Function Call Decision**:
   - If Gemini requests function calls (e.g., `detect_bus_bunching`), the backend catches the `function_call` event.
4. **Local Tool Execution**: The backend executes the corresponding Python service function using an active MySQL session.
5. **Tool Feedback Injection**: The function execution result is packaged into a `function_response` and sent back to Gemini.
6. **Final Synthesis**: Gemini generates the final operational answer incorporating the live data and dispatch advice.
7. **Client Delivery**: The response delivers both the natural-language answer and the raw tool trace for operator transparency.

