import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db
from app.api import auth, workers, premiums, triggers, claims, admin, payments


MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="GigProtector API",
    description="Insurance protection for gig workers against weather and air quality risks",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(workers.router)
app.include_router(premiums.router)
app.include_router(triggers.router)
app.include_router(claims.router)
app.include_router(admin.router)
app.include_router(payments.router)


@app.get("/")
async def root():
    return {"message": "GigProtector API", "status": "running"}


@app.get("/health")
async def health_check():
    models_status = {
        "premium_model": os.path.exists(os.path.join(MODEL_DIR, "premium_model.joblib")),
        "fraud_model": os.path.exists(os.path.join(MODEL_DIR, "fraud_model.joblib")),
        "zone_risk_model": os.path.exists(os.path.join(MODEL_DIR, "zone_risk_lstm.joblib")),
        "trigger_backtest": os.path.exists(os.path.join(MODEL_DIR, "trigger_backtest.joblib")),
    }
    return {"status": "healthy", "models": models_status}