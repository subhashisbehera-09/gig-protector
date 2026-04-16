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

## 🚀 Pitch Deck  

<p align="center">
  <a href="https://docs.google.com/presentation/d/1Ez_RYBx3z8uk7NlwWnSnnvhLeYVTt5xe/edit?slide=id.p15#slide=id.p15" target="_blank">
    <img src="https://img.shields.io/badge/View%20Pitch%20Deck-Click%20Here-ff69b4?style=for-the-badge&logo=google-drive&logoColor=white" />
  </a>
</p>

<p align="center">
  📊 A concise overview of <b>GigProtector</b> — problem, solution, architecture, and impact.
</p>


## 📋 Contents
1. [Problem](#-1-problem)
2. [Coverage Scope](#-2-coverage-scope)
3. [Personas & Workflows](#-3-personas--workflows)
4. [Weekly Premium Model](#-4-weekly-premium-model)
5. [Parametric Triggers](#-5-parametric-triggers)
6. [Admin & Worker Dashboards](#-6-admin--worker-dashboards)
7. [Emergency SOS System](#-7-emergency-sos-system)
8. [Instant Payout System](#-8-instant-payout-system)
9. [AI/ML Plan](#-9-aiml-plan)
10. [Adversarial Defense](#-10-adversarial-defense--anti-spoofing)
11. [Architecture](#-11-architecture)
12. [Tech Stack](#-12-tech-stack)
13. [Project Structure](#-13-project-structure)
14. [Development Plan](#-14-development-plan)
15. [API Reference](#-15-api-reference)
16. [Running the Project](#-16-running-the-project)
17. [Environment Variables](#-17-environment-variables)
18. [Roadmap](#-18-roadmap)

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
7:10 AM → Instant payout via UPI: ₹525 credited in seconds
7:30 AM → Notification in Marathi.
Day 2–3 → Repeats automatically. Total: ₹1,575 over 3 days.
```

### Persona B — Kavitha | Zepto | Bengaluru
**₹3,800/week · Bandh/strike risk · Premium Shield (90%) · ₹108/week**

```
6:00 AM → NLP monitor detects "Karnataka bandh" on 3+ news sources
6:15 AM → Traffic API: near-zero movement. Zone orders at 8% of normal (<15% threshold)
6:22 AM → Fraud score: 12/100 → 🟢 Green
6:24 AM → Auto-claim: 90% × ₹600 = ₹540 credited. Instant payout in seconds.
```

### Persona C — Arjun | Amazon Flex | Delhi NCR
**₹3,000/week · AQI/pollution risk · Basic Shield (60%) · ₹72/week**

```
6:00 AM → CPCB Safar: AQI 456 Severe+ ✓ · GRAP Stage IV active ✓
6:08 AM → Fraud score: 22/100 → 🟢 Green
6:10 AM → Auto-claim: 60% × ₹466 = ₹280/day credited via UPI
Day 2–4 → Auto-repeats. Total: ₹1,120 over 4 days. Zero action from Arjun.
```

### End-to-End Workflow
```
ONBOARD         → COVERAGE LIVE      → DISRUPTION        → PAYOUT
Register + KYC  → Monitor 15+ feeds  → Threshold crossed  → % baseline × days
Link platform   → Worker earns       → Location validated → UPI instant credit
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

### Automated Trigger Monitoring
- Scheduler runs every 15 minutes to check all weather/AQI thresholds
- Auto-claim service automatically creates claims when triggers are confirmed
- Workers receive instant notifications when coverage is activated

---

## 📊 6. Admin & Worker Dashboards

### Worker Dashboard
Real-time view of earnings protection status:

| Feature | Description |
|---|---|
| Earnings Protection | Monthly/total earnings tracked with protection rate |
| Coverage Status | Active plan, coverage amount, days remaining, next debit date |
| Claim History | Timeline of all claims with status and amounts |
| Quick Stats | Total protected, protection rate, recent claims count |

### Admin Dashboard
Comprehensive analytics for operations teams:

| Feature | Description |
|---|---|
| Loss Ratio | Total premiums vs payouts with health status |
| Claim Predictions | ML-predicted claims for next 7 days by zone |
| Weather Forecast | Disruption probability by city with recommended actions |
| Fraud Analysis | Unresolved alerts, risk scores, alert breakdown |
| Executive Summary | Total exposure, risk rating, action items |

### Admin Pages
- **Dashboard** — Overview with KPIs and charts
- **Claims** — Claim management with approval/rejection workflow
- **Fraud** — Fraud detection alerts and ring investigation
- **Reports** — Analytics and reporting tools
- **Safety** — Worker safety incidents and emergency tracking

---

## 🚨 7. Emergency SOS System

Worker safety feature for emergency situations during deliveries:

### Emergency Triggers
- **DOG_BITE** — Animal attack or dog chase
- **ASSAULT** — Physical assault or threat
- **ACCIDENT** — Vehicle or road accident
- **HARASSMENT** — Customer or public harassment
- **MEDICAL** — Medical emergency
- **OTHER** — Other safety concerns

### State Machine
```
IDLE → TRIGGERED → ACKNOWLEDGED → ESCALATED → RESOLVED
                  ↓
               ABORTED (worker cancels within 10s)
```

### Features
- One-tap SOS activation from worker app
- GPS location capture with accuracy metadata
- Optional customer info capture for incident context
- Live audio/video streaming capability
- Background notifications to emergency contacts
- State transitions with agent assignment and notes
- 10-second abort window for accidental triggers

### API Endpoints
```
POST /emergency/trigger       — Worker initiates emergency
GET  /emergency/{id}         — Get incident details
GET  /emergency/             — List incidents with filters
PATCH /emergency/{id}/status — Update incident state
POST /emergency/{id}/stream  — Start live stream
POST /emergency/{id}/cancel  — Worker cancels emergency
```

---

## 💸 8. Instant Payout System

Fast payment processing with multiple gateway support:

### Supported Gateways
| Gateway | Processing Time | Limit |
|---|---|---|
| UPI Instant | < 10 seconds | ₹1 - ₹1,00,000 |
| Razorpay | < 30 seconds | ₹100 - ₹5,00,000 |
| Stripe | < 60 seconds | ₹100 - ₹10,00,000 |

### Features
- Instant payout initiation for approved claims
- Multiple payment gateway support with fallback
- Transaction verification and reference tracking
- Payout history with status tracking
- Demo mode for testing
- Payment options discovery endpoint

### API Endpoints
```
POST /payouts/instant        — Initiate instant payout
GET  /payouts/options        — Get available payment options
GET  /payouts/status/{id}    — Check payout status
GET  /payouts/history        — Get payout history
POST /payouts/simulate-failure — Simulate failed payout (admin)
```

---

## 🤖 9. AI/ML Plan

### Four Layers

| Layer | Model | Input | Output | Retrain |
|---|---|---|---|---|
| Premium Engine | XGBoost Regressor | 14 worker + zone features | Weekly premium ₹ | Monthly |
| Risk Forecaster | LSTM + Seasonal | 28-day weather sequence | 7-day disruption probability | Weekly |
| Fraud Detection | Isolation Forest + NetworkX graph | 18 behavioral + network features | Fraud score 0–100 | Weekly |
| Claim Review | Llama 3 8B (Ollama, local) | Full claim evidence package | APPROVE / INVESTIGATE / DENY | On feedback |

### Analytics Service
Comprehensive analytics for workers and insurers:

**Worker Analytics:**
- Earnings protection summary
- Weekly coverage status
- Claim history with timeline

**Insurer Analytics:**
- Loss ratio calculation
- Next-week claim predictions by zone
- Weather disruption forecast
- Fraud analysis summary

---

## 🛡️ 10. Adversarial Defense & Anti-Spoofing

> **The attack:** Fake GPS location to an active trigger zone → collect payout for income never lost.
> **The defense:** A multi-signal fingerprint that is incoherent to fake across all streams simultaneously.

### 10.1 Genuine Worker vs. GPS Spoofer

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
Cell tower triangulation is entirely independent of GPS hardware. A >5km divergence between GPS fix and cell tower location = high-confidence spoof flag.

```
GPS:          Koramangala (12.9352°N, 77.6245°E)
Cell towers:  Whitefield  (12.9698°N, 77.7499°E)
Delta: 14.2km → 🚩 SPOOF FLAG → Amber/Red routing
```

### 10.2 Fraud Ring Detection — Data Beyond GPS

| Data Point | Catches |
|---|---|
| Device hardware fingerprint | Multiple identities on one physical device |
| IP address graph | Coordinated VPN / shared network claims |
| Temporal claim burst | Ring fraud spikes in minutes; genuine claims spread over hours |
| UPI destination graph | Multiple claimants routing to same beneficiary |
| Platform ID cross-reference | Same Aadhaar / phone across multiple accounts |
| Referral cohort clustering | Ring recruits registered same week + immediate claim |
| Behavioral history depth | Ring recruits have no zone history; real workers have months |

### 10.3 Three-Pathway Routing

```
🟢 GREEN  (Score 0–35)   → Auto-payout in 2–4hrs. Zero worker action. ~72% of claims.
🟡 AMBER  (Score 36–65)  → 24hr soft hold. System auto-retries. ~22% of claims.
🔴 RED    (Score 66+)    → Human review + LLM recommendation. ~6% of claims.
```

### 10.4 Network Drop Protection

Bad weather degrades the network in the same zones that trigger payouts:
- **Weather Network Discount** — 15–20pt threshold reduction
- **Peer Validation** — 60%+ zone workers = real event
- **Behavioral Anchor** — 90-day pre-event history

---

## 🏗️ 11. Architecture

```
┌────────────────────────────────┬──────────────────────────────────────────────┐
│  FLUTTER APP (Workers)         │  REACT DASHBOARD (Admin/Partners)          │
│  Onboarding · UPI · SOS · Alerts│  Dashboard · Claims · Fraud · Reports      │
└──────────────┬─────────────────┴────────────────────────────────────────────┘
               │ HTTPS + WebSocket
               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend                                        │
│  Auth/Workers · Premium Engine · Trigger Monitor · Claims · Fraud           │
│  Analytics · Emergency SOS · Instant Payout · Auto-Claim                    │
└──────────────┬──────────────────────────┬───────────────────────────────────┘
               ▼                          ▼                      ▼
      External APIs                Database Layer           ML Models
      OpenWeatherMap              SQLite (dev)            XGBoost premium
      CPCB Safar AQI              PostgreSQL (prod)       Isolation Forest
      IMD · Traffic              Redis (cache)           LSTM risk model
      Cashfree · Firebase                                 Ollama Llama 3 8B
```

### Background Processing
- **APScheduler** runs trigger monitoring every 15 minutes
- **Auto-Claim Service** creates claims from triggered alerts automatically
- **Notification Service** sends push/SMS alerts for payouts and emergencies

---

## 🛠️ 12. Tech Stack

### Backend
`FastAPI 0.111` · `Python 3.11` · `SQLAlchemy 2.0` · `Alembic` · `SQLite/PostgreSQL` · `Redis` · `XGBoost` · `scikit-learn` · `PyTorch` · `NetworkX` · `Ollama + Llama 3 8B` · `MLflow` · `httpx` · `APScheduler` · `pytest`

### Frontend (React)
`React 18 + Vite` · `Tailwind CSS + shadcn/ui` · `Zustand` · `Axios` · `Leaflet.js` · `Recharts` · `WebSocket`

### Mobile (Flutter)
`Flutter 3.19 / Dart 3.3` · `Riverpod 2.x` · `Dio` · `Hive + flutter_secure_storage` · `geolocator + sensors_plus` · `firebase_messaging` · `uni_links (UPI)` · `fl_chart` · `flutter_localizations (6 langs)`

### All Free / Open Source
Everything in the stack is MIT/BSD/Apache licensed. Cashfree sandbox for payments (free). OpenWeatherMap free tier (1,000 calls/day). Firebase Spark plan (free). **Total prototype cost: ₹0.**

---

## 📁 13. Project Structure

```
gig-protector/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry point
│   │   ├── config.py             # pydantic-settings
│   │   ├── database.py           # SQLAlchemy engine
│   │   ├── scheduler.py          # APScheduler background jobs
│   │   ├── api/
│   │   │   ├── auth.py           # Register · login · JWT
│   │   │   ├── workers.py        # Profile · earnings · zone
│   │   │   ├── premiums.py       # Quote · subscribe · history
│   │   │   ├── triggers.py       # Active · zone status · history
│   │   │   ├── claims.py         # Status · payouts · appeals
│   │   │   ├── dashboard.py      # Worker & admin dashboard analytics
│   │   │   ├── emergency.py      # SOS system endpoints
│   │   │   ├── payouts.py        # Instant payout endpoints
│   │   │   └── admin.py          # Ops · fraud alerts · review queue
│   │   ├── services/
│   │   │   ├── premium_engine.py
│   │   │   ├── trigger_monitor.py
│   │   │   ├── trigger_automation_service.py  # Automated trigger checking
│   │   │   ├── auto_claim_service.py           # Auto-create claims
│   │   │   ├── payout_service.py
│   │   │   ├── instant_payout.py   # Multi-gateway payout service
│   │   │   ├── fraud_engine.py
│   │   │   ├── analytics_service.py # Dashboard analytics
│   │   │   ├── emergency_service.py # SOS notification service
│   │   │   ├── weather_service.py
│   │   │   ├── aqi_service.py
│   │   │   └── notification_service.py
│   │   ├── ml/
│   │   │   ├── premium_model.py
│   │   │   ├── fraud_model.py
│   │   │   ├── risk_model.py
│   │   │   ├── llm_reviewer.py
│   │   │   └── models/
│   │   ├── models/
│   │   │   └── emergency.py     # Emergency event models
│   │   └── schemas/
│   │       └── emergency.py     # Emergency Pydantic schemas
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Claims.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminClaims.jsx
│       │   ├── AdminFraud.jsx
│       │   ├── AdminReports.jsx
│       │   ├── SafetyDashboard.jsx
│       │   └── ...
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── LoadingScreen.jsx
│       │   ├── SOSButton.jsx
│       │   └── ...
│       └── services/
│
├── mobile/
│   └── lib/
│       ├── screens/
│       ├── services/
│       └── providers/
│
├── ml_notebooks/
│   ├── 01_premium_model_training.ipynb
│   ├── 02_fraud_detection_model.ipynb
│   ├── 03_zone_risk_lstm.ipynb
│   └── 04_trigger_backtesting.ipynb
│
└── data/
    ├── mock/
    └── seeds/
```

---

## 📅 14. Development Plan

| Phase | Weeks | Key Deliverables | Milestone |
|---|---|---|---|
| **0 — Foundation** | 1–2 | Scaffold all 3 apps · Weather/AQI APIs · SQLite · JWT auth | All apps boot, APIs live |
| **1 — Worker Flow** | 3–6 | KYC onboarding · Premium quote · UPI AutoPay · FCM push | Worker registers + pays |
| **2 — Trigger & Payout** | 7–10 | APScheduler trigger monitor · Auto-claim pipeline · Cashfree payout · Rules fraud engine | End-to-end: trigger → UPI credit |
| **3 — ML Models** | 11–14 | XGBoost premium · Isolation Forest fraud · NetworkX rings · LSTM risk · Ollama LLM · MLflow | Fraud F1 > 0.85 |
| **4 — Defense** | 15–18 | GPS/cell tower check · Weather discount · Green/Amber/Red routing · Appeals flow · Spoof test suite | 95%+ spoof detection |
| **5 — Pilot** | 19–24 | 6 languages · IRDAI sandbox application · DPDPA audit · 3-city launch · 100 beta workers | 1,000 subscribers · payout < 4hrs |

---

## 📡 15. API Reference

Base URL: `http://localhost:8000/api/v1` · Swagger: `/docs` · ReDoc: `/redoc`

```
AUTH         POST /auth/register · POST /auth/login · POST /auth/refresh

WORKERS      GET  /workers/me · PUT /workers/me
             GET  /workers/me/earnings · GET  /workers/me/coverage

PREMIUMS     GET  /premiums/quote · GET  /premiums/tiers
             POST /premiums/subscribe · GET  /premiums/history

TRIGGERS     GET  /triggers/active · GET  /triggers/zone/{zone_id}
             GET  /triggers/history · WS /triggers/stream

CLAIMS       GET  /claims/ · GET  /claims/{id}
             POST /claims/{id}/appeal

DASHBOARD    GET  /dashboard/worker · GET  /dashboard/admin
             GET  /dashboard/earnings-protection · GET  /dashboard/coverage-status
             GET  /dashboard/admin/loss-ratio · GET  /dashboard/admin/predictions
             GET  /dashboard/admin/weather-forecast · GET  /dashboard/admin/fraud-summary

EMERGENCY    POST /emergency/trigger · GET  /emergency/{id}
             GET  /emergency/ · PATCH /emergency/{id}/status
             POST /emergency/{id}/stream · POST /emergency/{id}/cancel

PAYOUTS      POST /payouts/instant · GET  /payouts/options
             GET  /payouts/status/{id} · GET  /payouts/history

ADMIN        GET  /admin/dashboard · GET  /admin/claims/queue
             POST /admin/claims/{id}/review
             GET  /admin/fraud/rings · GET  /admin/ml/metrics
```

---

## ▶️ 16. Running the Project

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

## 🔑 17. Environment Variables

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

## 🗺️ 18. Roadmap

- [x] Architecture design + README
- [x] **Phase 0:** Scaffold · Weather API · JWT auth
- [x] **Phase 1:** Onboarding · Premium quote · UPI · Push notifications
- [x] **Phase 2:** Trigger monitor · Auto-payout · Rules fraud engine
- [ ] **Phase 3:** XGBoost · Isolation Forest · NetworkX · LSTM · Ollama · MLflow
- [ ] **Phase 4:** GPS/cell tower delta · Green/Amber/Red routing · Appeals · Spoof tests
- [ ] **Phase 5:** 6 languages · IRDAI sandbox · DPDPA audit · 3-city pilot · 100 beta workers

---

<div align="center">

**gig-protector** — *Because every delivery partner deserves a safety net.*

`FastAPI` · `React 18` · `Flutter` · `XGBoost` · `Isolation Forest` · `Parametric Insurance`

</div>
