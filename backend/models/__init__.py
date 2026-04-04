"""
GigProtector ML Models Package

This package contains the machine learning models used for:
1. Premium Model (XGBoost) - Dynamic premium calculation
2. Fraud Detection (Isolation Forest) - Anomaly detection for claims
3. Zone Risk Model (LSTM) - 14-day disruption prediction
4. Trigger Backtester - Historical trigger performance evaluation

Usage:
    from models.premium_model import PremiumModel
    from models.fraud_model import FraudDetectionModel
    from models.zone_risk_model import ZoneRiskLSTM
    from models.trigger_model import TriggerBacktester
"""

from .premium_model import PremiumModel
from .fraud_model import FraudDetectionModel
from .zone_risk_model import ZoneRiskLSTM
from .trigger_model import TriggerBacktester

__all__ = [
    'PremiumModel',
    'FraudDetectionModel',
    'ZoneRiskLSTM',
    'TriggerBacktester',
]

__version__ = '1.0.0'
