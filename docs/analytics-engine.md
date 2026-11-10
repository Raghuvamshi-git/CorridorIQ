# CorridorIQ — Transport Analytics Engine Specification

CorridorIQ features a specialized, deterministic transit operational analytics engine engineered for high-density metropolitan bus networks. The engine executes continuous metric computation, headway regularity tracking, anomaly detection, and automated dispatch intervention synthesis directly against the relational operational database.

---

## 1. Core Transit Metrics & Mathematical Formulations

### A. On-Time Performance (OTP)
On-Time Performance measures the percentage of completed scheduled transit trips that reach their destination or checkpoints within the operational tolerance window.

$$\text{OTP} = \left( \frac{\sum_{i=1}^{N_{\text{trips}}} \mathbb{I}(\text{delay}_i \le \tau_{\text{OTP}})}{N_{\text{trips}}} \right) \times 100\%$$

- **Configured Threshold ($\tau_{\text{OTP}}$)**: `5.0 minutes` (300 seconds).
- **Classification**:
  - **On-Time**: $\text{delay} \le 5.0\text{ min}$
  - **Minor Delay**: $5.0 < \text{delay} \le 10.0\text{ min}$
  - **Major Delay**: $10.0 < \text{delay} \le 20.0\text{ min}$
  - **Severe / Critical Delay**: $\text{delay} > 20.0\text{ min}$

---

### B. Average Network Delay
Calculates the mean deviation across all completed and active transit services against scheduled timetables.

$$\bar{D}_{\text{network}} = \frac{1}{N} \sum_{i=1}^{N} \max(0, t_{\text{actual}, i} - t_{\text{scheduled}, i})$$

Corridor-level delays aggregate trip-update delay intervals along specific directional routes (e.g. Route 101 Ameerpet Choke Point).

---

### C. Headway Regularity & Headway Ratio
Headway measures the elapsed time between consecutive vehicles serving the same stop, route, and travel direction.

$$H_{\text{actual}} = t_{v_k} - t_{v_{k-1}}$$
$$R_H = \frac{H_{\text{actual}}}{H_{\text{scheduled}}}$$

Where:
- $t_{v_k}$: Arrival timestamp of vehicle $k$ at stop $S$.
- $t_{v_{k-1}}$: Arrival timestamp of the immediately preceding vehicle $k-1$ at stop $S$.
- $H_{\text{scheduled}}$: Timetabled dispatch frequency (typically 10 to 18 minutes in Hyderabad corridors).
- $R_H$: Normalized headway ratio.

---

### D. Bus Bunching Detection
Bus bunching occurs when a trailing vehicle catches up to the leading vehicle due to heavy passenger boardings on the leader and light boardings on the trailer.

$$\text{Bunching Trigger}: R_H \le 0.35 \quad \text{or} \quad H_{\text{actual}} \le 4.0\text{ min (when } H_{\text{scheduled}} \ge 12.0\text{ min)}$$

**Severity Assignment**:
- **CRITICAL**: $R_H \le 0.20$ (trailing bus right behind lead bus, $\le 2$ minutes)
- **HIGH**: $0.20 < R_H \le 0.35$ (gap collapsed to roughly a third of scheduled headway)
- **MEDIUM**: $0.35 < R_H \le 0.50$ (moderate compression)

---

### E. Long Headway (Service Gap) Detection
Long headways represent major gaps in service leading to passenger platform crowding and extended wait times.

$$\text{Service Gap Trigger}: R_H \ge 1.80 \quad \text{or} \quad H_{\text{actual}} \ge 1.80 \times H_{\text{scheduled}}$$

**Severity Assignment**:
- **CRITICAL**: $R_H \ge 2.50$ (passenger wait time $> 250\%$ of scheduled interval)
- **HIGH**: $1.80 \le R_H < 2.50$ (significant gap requiring dispatch adjustment)
- **MEDIUM**: $1.40 \le R_H < 1.80$ (developing service deficit)

---

### F. Passenger Demand & Overcrowding
Passenger load factor compares actual onboard passenger counts against the vehicle's rated seating plus standing capacity.

$$L_v = \frac{P_{\text{current}}}{C_{\text{capacity}}}$$

- **Overcrowding Alert Threshold**: $L_v \ge 0.90$ ($90\%$ capacity utilization).
- **Critical Overcrowding**: $L_v \ge 1.05$ (exceeding crush capacity; safety hazard).
- **Peak Hour Windows (Hyderabad IST)**:
  - Morning Peak: 08:00 – 11:30 IST (IT corridor inbound: Miyapur/Secunderabad $\rightarrow$ Hitech City / Financial District).
  - Evening Peak: 17:00 – 21:00 IST (Outbound: Hitech City / Gachibowli $\rightarrow$ Koti / LB Nagar / Kukatpally).

---

### G. Fleet Utilization Rate
Measures active capital asset deployment across the transport authority.

$$\text{Utilization} = \left( \frac{N_{\text{IN\_SERVICE}}}{N_{\text{TOTAL\_FLEET}}} \right) \times 100\%$$

Fleet status breakdown:
- `IN_SERVICE`: Actively running scheduled passenger trips or revenue deadheading.
- `MAINTENANCE`: In depot for preventative maintenance, charging, or mechanical repairs.
- `IDLE`: Staged at terminal or depot on reserve standby.

---

## 2. Headway Anomaly Output Schema

Every anomaly detected by the analytics engine returns rich, actionable operational context:

```json
{
  "route_id": "R-101",
  "route_short_name": "101",
  "anomaly_type": "BUS_BUNCHING",
  "severity": "CRITICAL",
  "stop_id": "STOP-003",
  "stop_name": "Ameerpet Metro Interchange",
  "actual_metric": "3.2 min actual headway",
  "expected_metric": "12.0 min scheduled headway",
  "ratio": 0.27,
  "description": "Bus TS09UB1001 (101-UP-1) and TS09UB1002 (101-UP-2) are separated by only 3.2 minutes at Ameerpet Metro Interchange (expected 12.0 mins).",
  "detected_at": "2026-11-10T14:40:00+05:30"
}
```

---

## 3. Automated Dispatch Recommendation Engine

The engine continuously evaluates operational telemetry and synthesizes mitigation orders:

| Anomaly Detected | Trigger Rule | Recommended Operational Intervention | Expected Benefit |
| :--- | :--- | :--- | :--- |
| **Bus Bunching** | $R_H \le 0.35$ at high-boarding stop | "Hold trailing bus TS09UB1002 for 4.5 minutes at Ameerpet; instruct lead bus TS09UB1001 to bypass minor boarding stops." | Restores scheduled 12-minute headway and balances passenger load across both vehicles. |
| **Severe Corridor Delay** | Route average delay $> 15.0$ mins | "Deploy standby reserve electric bus from nearest depot to initiate short-turning trips skipping minor stops." | Clears platform congestion and restores terminal punctuality. |
| **Low Battery / Fuel** | Vehicle battery $< 20\%$ | "Route vehicle to nearest depot (Sanathnagar/Miyapur) for immediate fast charging; swap with standby fleet unit." | Prevents on-corridor stalling and avoids mid-trip passenger stranding. |
| **Crush Overcrowding** | Load factor $L_v \ge 0.95$ | "Inject relief tripper bus ahead of overcrowded service at upstream junction." | Relieves platform crowding and accelerates dwell times. |

### Human-In-The-Loop Governance
To safeguard transit operations:
1. All AI and rule-generated interventions enter the system with status `PENDING_REVIEW`.
2. Operations controllers review evidence, projected benefits, and confidence scores.
3. Controller clicks `APPROVE` or `REJECT` via the Dispatch Command Center.
4. Once field execution completes, controller marks the intervention as `RESOLVED`.

