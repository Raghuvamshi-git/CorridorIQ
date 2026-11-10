# CorridorIQ — System Architecture Specification
## Operating Region: Hyderabad, Telangana, India

---

### 1. Executive Summary

**CorridorIQ** is an enterprise-grade agentic transport operations platform engineered for municipal transit controllers, fleet managers, and corridor dispatchers in the **Hyderabad Metropolitan Region (Telangana, India)**.

It pairs high-throughput relational transit telematics with **Google Gemini 2.5 Flash** native function calling to detect bus bunching, calculate schedule deviation, analyze commuter surges across Metro interchanges (Ameerpet, Miyapur, Hitech City), and prescribe operational dispatch actions.

---

### 2. High-Level Architecture Diagram

```mermaid
flowchart TB
    subgraph Client ["Frontend: React 19 + Vite + Tailwind CSS + Recharts + Leaflet"]
        UI_Dash["Executive Dashboard\n(Hyderabad Transport Operations Center)"]
        UI_Live["Live Operations & Leaflet GPS Map\n(17.3850° N, 78.4867° E)"]
        UI_Routes["Route Intelligence & Headway Consistency\n(Stop-by-Stop Schedule Adherence)"]
        UI_Fleet["Fleet Health & Battery Analytics\n(Switch EiV Electric, Tata CNG, Volvo)"]
        UI_Demand["Passenger Demand & Overcrowding Profiler\n(Morning & Evening Commuter Rush)"]
        UI_Agent["AI Agent Studio & Tool Calling Visualizer\n(Natural Language Operational Inquiries)"]
        UI_Dispatch["Dispatch Recommendation Action Center\n(Interactive Human Controller Review)"]
    end

    subgraph Server ["Backend: Python 3 FastAPI + SQLAlchemy 2.0 + Pydantic v2"]
        Gateway["FastAPI Gateway (/api)"]
        
        subgraph Endpoints ["REST Controllers"]
            API_Health["/health"]
            API_Dash["/dashboard/summary & /dashboard/trends"]
            API_Routes["/routes, /routes/{id}, /routes/{id}/headways"]
            API_Vehicles["/vehicles, /vehicles/positions"]
            API_Analytics["/analytics/delays, /analytics/passenger-demand"]
            API_Dispatch["/dispatch/recommendations, /dispatch/.../status"]
            API_Agent["/agent/chat (Tool Calling Loop)"]
        end

        subgraph CoreEngine ["Services & Analytics Engine"]
            S_Analytics["Analytics Service\n(OTP, Headway Gaps, Bunching, Delay Distributions)"]
            S_DataGen["Synthetic Transit Simulator\n(12 Corridors, 63 Stops, 48 Buses, 216 Trips)"]
            S_Agent["Gemini Agent Controller\n(Tool Dispatcher & Reasoning Trace)"]
        end
    end

    subgraph AI ["AI Intelligence Layer"]
        Gemini["Google Gemini 2.5 Flash Model\n(google-genai SDK)"]
        Tools["7 Native Transit Tools\n(Read-Only Database Querying)"]
    end

    subgraph Database ["Persistence: MySQL 8.0 / SQLite Fallback"]
        DB[("MySQL 8.0 (InnoDB) / SQLite Development Fallback\n11 Relational Tables with Foreign Keys & Spatial Indexes")]
    end

    Client <-->|HTTP REST / JSON| Gateway
    Gateway --> Endpoints
    Endpoints --> CoreEngine
    CoreEngine <-->|SQLAlchemy ORM| DB

    S_Agent <-->|System Prompt & Tool Schemas| Gemini
    Gemini -->|Function Call Request| Tools
    Tools -->|Structured Tool Results| S_Agent
```

---

### 3. Architecture Pillars

1. **Deterministic Grounding**:
   - The AI agent never performs arbitrary SQL queries or direct database mutations.
   - All analytical calculations (OTP, Headways, Delays) are calculated by verified Python service methods.
2. **Human-in-the-Loop Dispatch**:
   - The AI agent can *formulate* and *queue* dispatch recommendations, but cannot unilaterally alter vehicle schedules.
   - Transit dispatchers review, approve, reject, or resolve interventions via the `/api/dispatch/recommendations` endpoints.
3. **Regional Realism (Hyderabad, Telangana)**:
   - Centered around Hyderabad landmarks: Cyber Towers, Ameerpet Metro Hub, Tolichowki Flyover, Gachibowli Stadium, LB Nagar Ring Road.
   - IST Timezone (UTC+5:30), INR (₹) currency, DD-MM-YYYY dates.
   - Clearly disclosed synthetic data simulation.
4. **Dual-Dialect Database Layer**:
   - Production-ready MySQL 8.0 schema with foreign key constraints.
   - Zero-configuration SQLite development fallback (`corridoriq.db`) allowing instant local demonstration without external database servers.

