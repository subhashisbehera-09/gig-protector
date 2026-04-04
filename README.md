# GigProtector — Parametric Income Shield for India's Gig Workers

**Protect Your Worker** — An AI-powered parametric insurance platform that shields gig economy workers from income loss due to weather disruptions, civic disruptions, and environmental hazards.

## Features

### 1. Registration Process
- Multi-step KYC via DigiLocker integration
- Platform earnings verification
- Zone-based risk assessment
- UPI payout setup
- Real-time premium estimation

### 2. Insurance Policy Management
- Three coverage tiers: Basic, Standard, Premium
- 7 parametric triggers covered
- UPI AutoPay for weekly premiums
- Dynamic policy customization
- Real-time coverage visualization

### 3. Dynamic Premium Calculation (ML-Powered)
- **XGBoost ML Model** with 14 hyper-local features
- Zone flood risk history (5-year data)
- Seasonal monsoon risk adjustment
- 14-day weather forecast integration
- Worker consistency scoring
- Loyalty discount tiers
- Hyper-local micro-adjustments

### 4. Claims Management (Zero-Touch)
- Fully automated claim processing
- Isolation Forest fraud detection (18 features, 50K training samples)
- GPS + cell tower validation
- Platform activity verification
- Instant UPI payouts
- Three-path processing: Green (auto-approve), Amber (peer validation), Red (denied)

### 5. Automated Triggers (5 Live APIs)
1. **Heavy Rainfall / Flood** — OpenWeatherMap + IMD API
2. **Severe Air Pollution** — CPCB Safar + OpenAQ
3. **Civic Disruption / Bandh** — Traffic API + News NLP
4. **Extreme Heat Wave** — OpenWeatherMap + IMD Heat Wave
5. **Dense Fog** — OpenWeatherMap + METAR

## Tech Stack

- **Frontend**: React 19 + Vite
- **Routing**: React Router v7
- **Styling**: Custom CSS with CSS Variables
- **ML Services**: XGBoost-inspired pricing model
- **APIs**: Open-Meteo (weather), Simulated external APIs

## Getting Started

### Installation

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       # Navigation component
│   │   └── Toast.jsx       # Toast notifications
│   ├── context/
│   │   └── AppContext.jsx   # Global state management
│   ├── pages/
│   │   ├── Register.jsx    # Worker registration
│   │   ├── Policy.jsx       # Policy management
│   │   ├── Premium.jsx      # Dynamic premium calculator
│   │   ├── Claims.jsx       # Claims management
│   │   ├── Triggers.jsx     # Parametric trigger monitor
│   │   └── Dashboard.jsx    # Worker dashboard
│   ├── services/
│   │   ├── aiPricing.js     # ML pricing & fraud detection
│   │   └── api.js           # API service layer
│   └── styles/
│       └── index.css        # Global styles
└── data/
    └── mock/
        ├── zones.json       # Zone risk data
        ├── weather_events.json
        ├── workers.json
        └── claims.json
```

## AI Integration Examples

### Dynamic Pricing Model

```javascript
// Zone historically waterlogged 18+ days/year → +₹8/week
// No waterlogging in safe zones → −₹14/week
// Monsoon season active (Jun-Sep) → +₹6/week
// Worker 14+ months tenure → −₹4/week
```

### 14-Day Disruption Forecast

Uses Open-Meteo weather API to predict disruption probability:
- High risk (>70%): Red alerts
- Medium risk (40-70%): Yellow monitoring
- Low risk (<40%): Green status

### Fraud Detection

Isolation Forest model with 18 features:
- GPS-Cell tower delta
- Platform activity anomalies
- Claim frequency patterns
- Zone-trigger matching
- Weather correlation

## Public APIs Used

1. **Open-Meteo** — Weather data (temperature, rainfall, visibility)
2. **CPCB Safar** — Air quality index (simulated)
3. **Google Traffic** — Civic disruption detection (simulated)
4. **IMD** — India Meteorological Department alerts (simulated)

## Demo Video

Record a 2-minute demo showcasing:
1. Worker registration flow
2. Policy tier selection
3. Dynamic premium calculation with ML adjustments
4. Trigger monitoring with live API data
5. Zero-touch claim processing with fraud detection

## Screenshots

The application features:
- Dark theme UI with gradient accents
- Real-time weather data display
- Interactive zone maps
- Animated claim processing logs
- ML feature importance charts
- 14-day disruption forecasts

## License

MIT License
