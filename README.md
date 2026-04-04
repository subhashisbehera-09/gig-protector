# 🛡️ gig-protector

<div align="center">

**AI-Enabled Parametric Income Protection for India's Gig Workers**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Web-React_18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Flutter](https://img.shields.io/badge/Mobile-Flutter-02569B?style=flat-square&logo=flutter&logoColor=white)](https://flutter.dev/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)

> **50M+ gig workers. Zero safety net. One missed monsoon = one missed rent.**
> Pays out automatically — no forms, no calls, no waiting.

</div>

---

## 📋 Contents
1. [Problem](#-1-problem)
2. [Coverage Scope](#-2-coverage-scope)
3. [Personas & Workflows](#-3-personas--workflows)
4. [Weekly Premium Model](#-4-weekly-premium-model)
5. [Parametric Triggers](#-5-parametric-triggers)
6. [Platform Choice](#-6-platform-choice)
7. [AI/ML Plan](#-7-aiml-plan)
8. [Adversarial Defense](#-8-adversarial-defense--anti-spoofing)
9. [Architecture](#-9-architecture)
10. [Tech Stack](#-10-tech-stack)
11. [Project Structure](#-11-project-structure)
12. [Development Plan](#-12-development-plan)
13. [API Reference](#-13-api-reference)
14. [Running the Project](#-14-running-the-project)
15. [Environment Variables](#-15-environment-variables)
16. [Roadmap](#-16-roadmap)

---

## 🚨 1. Problem

Zomato, Swiggy, Zepto, Amazon Flex & Dunzo delivery partners lose **20–30% of monthly income** during monsoons, AQI spikes, and curfews — events fully outside their control. No employer. No paid leave. No insurance.

```
Traditional:   Event → Worker files claim → Assessment → Payout (30–90 days)
gig-protector: Event → Threshold crossed  → Auto-verify → Payout (2–4 hours)
```

| Why Traditional Insurance Fails | |
|---|---|
| Complex claim filing | Requires documents gig workers don't have |
| Monthly premiums | Doesn't match weekly payout cycles |
| Long settlements | 30–90 days when rent is due this week |
| Individual assessment | Too expensive at 50M+ worker scale |

---

## ✅ 2. Coverage Scope

| ✅ Covered (income lost due to) | ❌ Excluded |
|---|---|
| Extreme rainfall / IMD Red Alert flooding | Health / life insurance |
| AQI > 400 Severe+ / GRAP Stage IV | Accident / injury cover |
| Cyclones, dust storms | Vehicle repair or damage |
| Extreme heat > 44°C (2+ days) | Medical expenses |
| Unplanned curfews / bandh / zone closures | Property damage |
| Dense fog / zero-visibility events | Cost of fixing the disruption |

> **Rule:** Did an external, verifiable event cause income loss? Yes → covered. No → not covered.

---

## 👤 3. Personas & Workflows

### Persona A — Rahul | Zomato | Mumbai
**₹4,500/week · Monsoon risk · Standard Shield (75%) · ₹92/week**

```
7:00 AM → OpenWeatherMap: 68mm rainfall confirmed. IMD Red Alert active.
7:04 AM → Rahul's GPS in zone ✓ · 0 trips despite app open ✓ · Cell tower match ✓
7:06 AM → Fraud score: 18/100 → 🟢 Green
7:08 AM → Auto-claim: 75% × ₹700 baseline = ₹525/day
9:30 AM → ₹525 credited to UPI. Notification in Marathi.
Day 2–3 → Repeats automatically. Total: ₹1,575 over 3 days.
```

### Persona B — Kavitha | Zepto | Bengaluru
**₹3,800/week · Bandh/strike risk · Premium Shield (90%) · ₹108/week**

```
6:00 AM → NLP monitor detects "Karnataka bandh" on 3+ news sources
6:15 AM → Traffic API: near-zero movement. Zone orders at 8% of normal (<15% threshold)
6:22 AM → Fraud score: 12/100 → 🟢 Green
6:24 AM → Auto-claim: 90% × ₹600 = ₹540 credited. SMS in Kannada.
```

### Persona C — Arjun | Amazon Flex | Delhi NCR
**₹3,000/week · AQI/pollution risk · Basic Shield (60%) · ₹72/week**

```
6:00 AM → CPCB Safar: AQI 456 Severe+ ✓ · GRAP Stage IV active ✓
6:08 AM → Fraud score: 22/100 → 🟢 Green
6:10 AM → Auto-claim: 60% × ₹466 = ₹280/day credited. SMS in Hindi.
Day 2–4 → Auto-repeats. Total: ₹1,120 over 4 days. Zero action from Arjun.
```

### End-to-End Workflow
```
ONBOARD         → COVERAGE LIVE      → DISRUPTION        → PAYOUT
Register + KYC  → Monitor 15+ feeds  → Threshold crossed  → % baseline × days
Link platform   → Worker earns       → Location validated → UPI credit 2–4hrs
Choose tier     → AI updates zone    → Fraud scored       → Push + SMS alert
Pay ₹/week      → risk weekly        → Routed Green/Amber/Red → Auto-continues
```

---

## 💰 4. Weekly Premium Model

**Why weekly?** Platform payouts are weekly. Thin liquidity buffers make monthly premiums a barrier. ₹80–100/week aligns with when income actually arrives and enables continuous re-pricing each renewal.

```
Weekly Premium = Base Rate × Zone Risk Multiplier × Tier Factor × (1 − Loyalty Discount)
```

### Base Rates
| City Tier | Cities | Rate |
|---|---|---|
| Tier 1 | Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Kolkata | ₹70/week |
| Tier 2 | Pune, Ahmedabad, Jaipur, Lucknow, Surat, Nagpur | ₹50/week |
| Tier 3 | All other covered cities | ₹38/week |

### Zone Risk Multiplier (AI-updated every 4 weeks)
| Classification | Multiplier |
|---|---|
| Low Risk | 0.8× |
| Medium Risk | 1.0× |
| High Risk (flood-prone / pollution sink) | 1.3× |
| Extreme Risk (cyclone coast / heat island) | 1.5× |

### Coverage Tiers
| Tier | Replacement | Weekly Premium | Max Weekly Payout |
|---|---|---|---|
| 🥉 Basic Shield | 60% of daily baseline | ₹56–₹105 | ₹2,400 |
| 🥈 Standard Shield | 75% of daily baseline | ₹70–₹131 | ₹3,000 |
| 🥇 Premium Shield | 90% of daily baseline | ₹89–₹168 | ₹3,600 |

**Baseline** = last 8 weeks of verified platform earnings ÷ 6 working days. Recalculated every 4 weeks.

### Loyalty Discount
| Duration | Discount |
|---|---|
| Weeks 1–13 | 0% |
| Weeks 14–26 | −5% |
| Weeks 27–39 | −10% |
| Week 40+ | −20% (max) |

**Example — Rahul, Mumbai, Standard Shield:**
```
₹70 × 1.3 (flood zone) × 1.0 (Standard) = ₹91/week
Payout: 75% × ₹700 daily baseline = ₹525/day → ₹1,575 for 3-day event (17× premium)
```

---

## ⚡ 5. Parametric Triggers

Triggers fire only when **both** are true: (1) API threshold crossed + (2) worker zone/activity confirmed.

| Disruption | Threshold | Source | Backup |
|---|---|---|---|
| Heavy Rain / Flood | > 64.5mm/24h (IMD Red Alert) | OpenWeatherMap | IMD API |
| Extreme Heat | > 44°C for 2+ consecutive days | OpenWeatherMap | IMD Heat Wave API |
| Severe AQI | > 400 Severe+ AND GRAP Stage IV | CPCB Safar | OpenAQ |
| Cyclone | Category 2+ within 150km of zone | IMD Cyclone API | Copernicus |
| Civil Disruption | Zone orders < 15% normal for 4+ hrs | Platform API + Traffic API | News NLP |
| Dense Fog | Visibility < 200m for 4+ hrs | OpenWeatherMap | METAR |
| Earthquake | NDRF zone closure declared | NDMA API | State DM portals |

### Confidence Scoring
```
Score = (API Data Quality × 0.4) + (Zone Match × 0.3) + (Worker Activity × 0.3)

≥ 70  → Payout proceeds
50–69 → Amber hold (extra verification)
< 50  → Trigger not confirmed
```

---

## 📱 6. Platform Choice — Web vs. Mobile

### Decision: Mobile App (Flutter) for Workers + Web Dashboard (React) for Admin

This is not a default choice. Every aspect is driven by who the user actually is.

---

### Why Mobile (Flutter) — Worker-Facing App

Gig delivery workers are a **smartphone-only demographic**. Their phone is simultaneously their GPS device, order management terminal, payment receiver, and communication tool. They have no laptops, no home desktops, and no habit of using web browsers for work tasks.

| Factor | Evidence | Decision |
|---|---|---|
| **Device reality** | 100% of active gig workers own a smartphone; effectively 0% own a laptop | Mobile is the only viable channel |
| **No desktop habit** | Workers manage their entire work life — orders, earnings, navigation — through apps | A web portal would have near-zero adoption |
| **UPI payments** | Premium auto-debit (UPI AutoPay mandate) and payout credit are natively mobile-first | Flutter + `uni_links` for UPI deep link integration |
| **Push notifications** | Trigger alerts ("disruption active in your zone") and payout confirmations must be instant | Firebase Cloud Messaging — requires a native app |
| **Offline-first** | Network degrades in the exact zones that trigger payouts (floods, storms) — app must work offline | Hive local DB + `connectivity_plus` for offline queue |
| **6 Indian languages** | Workers operate in Hindi, Marathi, Kannada, Tamil, Telugu, Bengali — not English | `flutter_localizations` built into Flutter natively |
| **Sensor access** | Anti-spoof detection needs accelerometer, GPS, cell tower, Wi-Fi probe data simultaneously | `sensors_plus` + `geolocator` — first-class Flutter APIs |
| **Budget Android performance** | Typical delivery partner phone costs ₹6,000–₹12,000 | Flutter compiles to native ARM — no JS bridge lag |

**Why Flutter over React Native on budget Android:**
React Native runs JavaScript through a bridge to native modules. On low-RAM budget Android devices (2–3GB RAM), this bridge introduces stuttering. Flutter compiles Dart directly to native ARM code — the same ₹8,000 phone that jitters on React Native runs Flutter at 60fps. For a fraud detection SDK that needs continuous sensor polling, this reliability difference is critical.

---

### Why React 18 — Admin / Partner Web Dashboard

The React dashboard is **not** for gig workers. It serves an entirely different user:

| User | Task | Why Web |
|---|---|---|
| Insurance ops team | Claim review queue, fraud ring investigation | Multi-tab workflows, keyboard shortcuts, large screen data tables |
| Platform partners (Zomato/Swiggy) | Coverage stats for their partner fleet | Embedded iframe in existing partner portals |
| IRDAI regulators | Compliance dashboards, audit trail export | Desktop-first regulatory workflow |
| Data science team | ML model monitoring, trigger backtesting, A/B results | Complex chart interactions impractical on mobile |

These users sit at desks, work across multiple monitors, and need the kind of dense information layout that is impossible on a 6-inch screen. Building this as a mobile app would actively harm their productivity.

**Why React over alternatives:**
- Vite build tooling gives sub-1s hot reload for rapid dashboard iteration
- shadcn/ui + Tailwind CSS gives production-quality UI without a design system from scratch
- Zustand is lightweight enough to not add complexity for a dashboard that doesn't need global state at scale
- Leaflet.js integrates cleanly with React for the live zone disruption map

---

### Summary

```
WHO          PLATFORM     WHY
───────────────────────────────────────────────────────────────
Gig worker   Flutter app  Smartphone-only · UPI · offline · sensors · vernacular
Ops/Admin    React web    Desktop workflows · data viz · multi-tab · partner embed
```

> A single "responsive web app" serving both audiences would fail both.
> The worker needs offline capability, push notifications, and UPI deep links
> that a PWA cannot reliably deliver on budget Android. The admin needs dense
> data tables and multi-window workflows that a mobile UI cannot support.
> Two platforms, two audiences, zero compromise.

---

## 🤖 7. AI/ML Plan

### Four Layers

| Layer | Model | Input | Output | Retrain |
|---|---|---|---|---|
| Premium Engine | XGBoost Regressor | 14 worker + zone features | Weekly premium ₹ | Monthly |
| Risk Forecaster | LSTM + Seasonal | 28-day weather sequence | 7-day disruption probability | Weekly |
| Fraud Detection | Isolation Forest + NetworkX graph | 18 behavioral + network features | Fraud score 0–100 | Weekly |
| Claim Review | Llama 3 8B (Ollama, local) | Full claim evidence package | APPROVE / INVESTIGATE / DENY | On feedback |

### Layer 1 — Premium (XGBoost) Features
`zone_disruption_freq_5yr` · `zone_disruption_severity_avg` · `seasonal_risk_month` · `worker_earnings_cv` · `worker_platform_tenure_days` · `city_tier` · `zone_flood_risk_class` · `zone_pollution_sink_score` · `zone_heat_island_score` · `coverage_tier` · `weather_14d_disruption_prob` · `worker_loyalty_quarters` + 2 more

### Layer 3 — Fraud (Isolation Forest) Features
```python
FRAUD_FEATURES = [
    "gps_cell_tower_delta_km",           # GPS vs cell tower divergence
    "location_jump_velocity_kmh",         # Impossible travel speed
    "zone_entry_trajectory_naturalness",  # 0=teleport, 1=natural travel
    "wifi_probe_zone_match_score",        # Wi-Fi APs match zone landscape
    "platform_app_open_hours",            # App open during trigger window
    "trips_completed_trigger_window",     # Should be ~0 for genuine claim
    "earnings_other_platforms_during",    # Earning elsewhere while claiming loss
    "worker_zone_history_days",           # Days of history in this zone
    "behavioral_baseline_similarity",     # vs 90-day baseline
    "peer_cohort_behavior_match",         # vs other workers in same zone
    "days_since_registration",            # New user + immediate claim
    "kyc_verification_score",             # Identity completeness
    "network_quality_score",              # Weather leniency adjustment
    "sensor_data_coherence_score",        # Accelerometer + GPS coherence
    # + 4 more
]
```

### Layer 3 — Ring Detection (NetworkX Graph)
Device fingerprint clustering · IP address graph · temporal claim burst (Poisson outlier) · UPI destination overlap · Platform ID cross-reference · referral cohort clustering

**Ring flag:** ≥3 edges to flagged nodes → auto-escalate to Red regardless of individual score.

### Layer 4 — LLM Reviewer (Llama 3 8B, local Ollama)
Generates plain-language evidence summary + APPROVE/INVESTIGATE/DENY recommendation for human reviewers. Reduces review time 45 min → ~8 min. No data leaves the system.

---

## 🛡️ 8. Adversarial Defense & Anti-Spoofing

> **The attack:** Fake GPS location to an active trigger zone → collect payout for income never lost.
> **The defense:** A multi-signal fingerprint that is incoherent to fake across all streams simultaneously.

### 8.1 Genuine Worker vs. GPS Spoofer

| Signal | Genuine Worker | Spoofer (Detectable) |
|---|---|---|
| Platform activity | App open, available, 0 trips | Inconsistent vs. 90-day history |
| Accelerometer | Stationary / home-movement | Normal commuting motion while "stranded" |
| GPS trajectory | Natural drift to home, travel history | Instant jump to zone, no path, perfect coordinates |
| **Cell tower delta** | **GPS + cell tower agree (< 5km)** | **GPS says Zone A, towers say Zone B 14km away** |
| Wi-Fi probes | Match zone's residential AP landscape | Don't match zone, or absent (emulator) |
| Sensor coherence | Barometer + magnetometer consistent | Wrong altitude / magnetic declination for zone |
| Cross-platform earnings | Earnings drop matches event onset | Still earning on another platform |
| Peer cohort | Zone peers show same pattern | Isolated — doesn't match 20+ peer baseline |

**Key defense — GPS/Cell Tower Delta Check:**
Cell tower triangulation is entirely independent of GPS hardware. A >5km divergence between GPS fix and cell tower location = high-confidence spoof flag. Cannot be defeated without physical presence.

```
GPS:          Koramangala (12.9352°N, 77.6245°E)
Cell towers:  Whitefield  (12.9698°N, 77.7499°E)
Delta: 14.2km → 🚩 SPOOF FLAG → Amber/Red routing
```

### 8.2 Fraud Ring Detection — Data Beyond GPS

| Data Point | Catches |
|---|---|
| Device hardware fingerprint | Multiple identities on one physical device |
| IP address graph | Coordinated VPN / shared network claims |
| Temporal claim burst | Ring fraud spikes in minutes; genuine claims spread over hours |
| UPI destination graph | Multiple claimants routing to same beneficiary |
| Platform ID cross-reference | Same Aadhaar / phone across multiple accounts |
| Referral cohort clustering | Ring recruits registered same week + immediate claim |
| Behavioral history depth | Ring recruits have no zone history; real workers have months |

### 8.3 Three-Pathway Routing — No Penalty for Honest Workers

```
🟢 GREEN  (Score 0–35)   → Auto-payout in 2–4hrs. Zero worker action. ~72% of claims.

🟡 AMBER  (Score 36–65)  → 24hr soft hold. System auto-retries peer + activity checks.
                            If resolved → Green. If not → human review queue.
                            Worker sees: "Verifying your claim. Expected by [time]."
                            No action required. ~22% of claims.

🔴 RED    (Score 66+)    → Human review + LLM recommendation.
                            Worker action: ONE tap to confirm location. No forms. No calls.
                            ~6% of claims.
```

### 8.4 The Network Drop Problem

Bad weather degrades the network in the same zones that trigger payouts. Four protections:

1. **Weather Network Discount** — degraded signal in a trigger zone lowers fraud threshold by 15–20pts automatically
2. **Peer Validation** — 60%+ of zone workers showing degraded data = real event, zone-wide leniency applied
3. **Behavioral Anchor** — 90-day pre-event history absorbs single-day data gaps
4. **Hard policy rule:**
```
IF trigger_confirmed AND zone_match AND history_days ≥ 30
AND gap_reason = "weather_network_degradation"
→ APPROVE regardless of sensor completeness
```

**Appeals:** Denied claims appealable in 7 days — voice description (6 languages) + optional photo → human review in 48hrs → outcome fed back into model retraining.

---

## 🏗️ 9. Architecture

```
┌──────────────────────────────┬──────────────────────────────────────┐
│  FLUTTER APP (Workers)       │  REACT DASHBOARD (Admin/Partners)    │
│  Onboarding · UPI · Alerts   │  Trigger map · Claims · Fraud · ML   │
└──────────────┬───────────────┴──────────────────────────────────────┘
               │ HTTPS + WebSocket
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend                               │
│  Auth/Workers · Premium Engine · Trigger Monitor · Claims · Fraud   │
└───────────┬──────────────────────┬───────────────────────────────────┘
            ▼                      ▼                      ▼
   External APIs            Database Layer           ML Models
   OpenWeatherMap           SQLite (dev)             XGBoost premium
   CPCB Safar AQI           PostgreSQL (prod)        Isolation Forest
   IMD · Google Traffic     Redis (cache)            LSTM risk model
   Cashfree · Firebase      NetworkX graph           Ollama Llama 3 8B
```

---

## 🛠️ 10. Tech Stack

### Backend
`FastAPI 0.111` · `Python 3.11` · `SQLAlchemy 2.0` · `Alembic` · `SQLite/PostgreSQL` · `Redis` · `XGBoost` · `scikit-learn` · `PyTorch` · `NetworkX` · `Ollama + Llama 3 8B` · `MLflow` · `httpx` · `APScheduler` · `pytest`

### Frontend (React)
`React 18 + Vite` · `Tailwind CSS + shadcn/ui` · `Zustand` · `Axios` · `Leaflet.js` · `Recharts` · `WebSocket`

### Mobile (Flutter)
`Flutter 3.19 / Dart 3.3` · `Riverpod 2.x` · `Dio` · `Hive + flutter_secure_storage` · `geolocator + sensors_plus` · `firebase_messaging` · `uni_links (UPI)` · `fl_chart` · `flutter_localizations (6 langs)`

### All Free / Open Source
Everything in the stack is MIT/BSD/Apache licensed. Cashfree sandbox for payments (free). OpenWeatherMap free tier (1,000 calls/day). Firebase Spark plan (free). **Total prototype cost: ₹0.**

---

## 📁 11. Project Structure

```
gig-protector/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry point
│   │   ├── config.py             # pydantic-settings
│   │   ├── database.py           # SQLAlchemy engine
│   │   ├── api/
│   │   │   ├── auth.py           # Register · login · JWT
│   │   │   ├── workers.py        # Profile · earnings · zone
│   │   │   ├── premiums.py       # Quote · subscribe · history
│   │   │   ├── triggers.py       # Active · zone status · history
│   │   │   ├── claims.py         # Status · payouts · appeals
│   │   │   └── admin.py          # Ops · fraud alerts · review queue
│   │   ├── services/
│   │   │   ├── premium_engine.py
│   │   │   ├── trigger_monitor.py
│   │   │   ├── payout_service.py
│   │   │   ├── fraud_engine.py
│   │   │   ├── weather_service.py
│   │   │   ├── aqi_service.py
│   │   │   └── notification_service.py
│   │   ├── ml/
│   │   │   ├── premium_model.py
│   │   │   ├── fraud_model.py
│   │   │   ├── risk_model.py
│   │   │   ├── llm_reviewer.py
│   │   │   └── models/           # .joblib / .onnx files
│   │   ├── models/               # SQLAlchemy ORM
│   │   └── schemas/              # Pydantic schemas
│   ├── tests/
│   ├── alembic/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── pages/                # Dashboard · Claims · Triggers · Workers · Analytics
│       ├── components/           # TriggerMap · ClaimCard · FraudScoreGauge · Charts
│       ├── services/             # api.js · websocket.js
│       └── store/                # Zustand slices
│
├── mobile/
│   └── lib/
│       ├── screens/              # onboarding/ · home/ · claims/ · profile/
│       ├── services/             # api · location · notifications · payment
│       └── providers/            # Riverpod state
│
├── ml_notebooks/
│   ├── 01_premium_model_training.ipynb
│   ├── 02_fraud_detection_model.ipynb
│   ├── 03_zone_risk_lstm.ipynb
│   └── 04_trigger_backtesting.ipynb
│
├── data/
│   ├── mock/                     # workers · weather_events · zones · claims JSON
│   └── seeds/seed_dev.py
│
├── .env.example
│
├── LICENSE
└── README.md
```

---

## 📅 12. Development Plan

| Phase | Weeks | Key Deliverables | Milestone |
|---|---|---|---|
| **0 — Foundation** | 1–2 | Scaffold all 3 apps · Weather/AQI APIs · SQLite · JWT auth | All apps boot, APIs live |
| **1 — Worker Flow** | 3–6 | KYC onboarding · Premium quote · UPI AutoPay · FCM push | Worker registers + pays |
| **2 — Trigger & Payout** | 7–10 | APScheduler trigger monitor · Auto-claim pipeline · Cashfree payout · Rules fraud engine | End-to-end: trigger → UPI credit |
| **3 — ML Models** | 11–14 | XGBoost premium · Isolation Forest fraud · NetworkX rings · LSTM risk · Ollama LLM · MLflow | Fraud F1 > 0.85 |
| **4 — Defense** | 15–18 | GPS/cell tower check · Weather discount · Green/Amber/Red routing · Appeals flow · Spoof test suite | 95%+ spoof detection |
| **5 — Pilot** | 19–24 | 6 languages · IRDAI sandbox application · DPDPA audit · 3-city launch · 100 beta workers | 1,000 subscribers · payout < 4hrs |

---

## 📡 13. API Reference

Base URL: `http://localhost:8000/api/v1` · Swagger: `/docs` · ReDoc: `/redoc`

```
AUTH      POST /auth/register · POST /auth/login · POST /auth/refresh

WORKERS   GET  /workers/me · PUT /workers/me
          GET  /workers/me/earnings · GET  /workers/me/coverage

PREMIUMS  GET  /premiums/quote · GET  /premiums/tiers
          POST /premiums/subscribe · GET  /premiums/history

TRIGGERS  GET  /triggers/active · GET  /triggers/zone/{zone_id}
          GET  /triggers/history · WS /triggers/stream

CLAIMS    GET  /claims/ · GET  /claims/{id}
          POST /claims/{id}/appeal

ADMIN     GET  /admin/dashboard · GET  /admin/claims/queue
          POST /admin/claims/{id}/review
          GET  /admin/fraud/rings · GET  /admin/ml/metrics
```

---

## ▶️ 14. Running the Project

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python data/seeds/seed_dev.py
uvicorn app.main:app --reload --port 8000
```
→ API: `localhost:8000` · Docs: `localhost:8000/docs`

### Frontend
```bash
cd frontend && npm install && npm run dev
```
→ Dashboard: `localhost:5173`

### Mobile
```bash
cd mobile && flutter pub get && flutter run
```
> Set backend URL in `lib/services/api_service.dart`:
> `http://10.0.2.2:8000/api/v1` (emulator) or `http://192.168.1.X:8000/api/v1` (device)

### ML Models *(optional — pre-trained included)*
```bash
pip install jupyter && jupyter notebook ml_notebooks/
# Run notebooks 01 → 04 in order
```

### LLM Review Assistant *(optional)*
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3:8b && ollama serve
```

---

## 🔑 15. Environment Variables

```env
# App
APP_ENV=development
SECRET_KEY=change-in-production
JWT_ALGORITHM=HS256

# Database
DATABASE_URL=sqlite:///./gigprotector_dev.db

# Weather
OPENWEATHER_API_KEY=your_key
IMD_API_KEY=mock

# AQI
CPCB_SAFAR_API_KEY=mock
OPENAQ_API_KEY=your_key

# Traffic
GOOGLE_MAPS_API_KEY=your_key

# Payments (sandbox — free)
CASHFREE_APP_ID=your_test_id
CASHFREE_SECRET_KEY=your_test_secret
PAYMENT_ENV=sandbox

# Notifications
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# ML
PREMIUM_MODEL_PATH=./app/ml/models/premium_model.joblib
FRAUD_MODEL_PATH=./app/ml/models/fraud_model.joblib
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3:8b

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

---

## 🗺️ 16. Roadmap

- [x] Architecture design + README
- [ ] **Phase 0:** Scaffold · Weather API · JWT auth
- [ ] **Phase 1:** Onboarding · Premium quote · UPI · Push notifications
- [ ] **Phase 2:** Trigger monitor · Auto-payout · Rules fraud engine
- [ ] **Phase 3:** XGBoost · Isolation Forest · NetworkX · LSTM · Ollama · MLflow
- [ ] **Phase 4:** GPS/cell tower delta · Green/Amber/Red routing · Appeals · Spoof tests
- [ ] **Phase 5:** 6 languages · IRDAI sandbox · DPDPA audit · 3-city pilot · 100 beta workers

---

<div align="center">

**gig-protector** — *Because every delivery partner deserves a safety net.*

`FastAPI` · `React 18` · `Flutter` · `XGBoost` · `Isolation Forest` · `Parametric Insurance`

</div>