#!/usr/bin/env python3
"""
GigProtector ML Models Runner

This script runs all ML models and demonstrates their usage.
Run with: python run_models.py

Models:
1. PremiumModel - XGBoost for dynamic premium calculation
2. FraudDetectionModel - Isolation Forest for fraud detection
3. ZoneRiskLSTM - LSTM for 14-day disruption prediction
4. TriggerBacktester - Backtesting system for trigger optimization
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def run_premium_model():
    """Run Premium Model (XGBoost)"""
    print("\n" + "="*60)
    print("RUNNING PREMIUM MODEL")
    print("="*60)
    
    try:
        from models.premium_model import PremiumModel
        
        model = PremiumModel()
        metrics, importance = model.train(n_estimators=100, learning_rate=0.1, max_depth=6)
        model.save()
        
        print("\nSample Predictions:")
        test_cases = [
            ([0.8, 0.3, 0.9, 0.3, 0.5, 0.6, 0.5, 0, 8], "High Risk Mumbai Monsoon"),
            ([0.2, 0.1, 0.3, 0.05, 0.2, 0.8, 0.6, 1, 10], "Low Risk Safe Zone"),
            ([0.5, 0.4, 0.6, 0.1, 0.4, 0.4, 0.4, 2, 6], "Medium Risk"),
        ]
        
        for features, label in test_cases:
            pred = model.predict(features)
            print(f"  {label}: ₹{pred:.2f}/week")
            
    except ImportError as e:
        print(f"  Skipping: {e}")
        print("  Install xgboost: pip install xgboost")


def run_fraud_model():
    """Run Fraud Detection Model (Isolation Forest)"""
    print("\n" + "="*60)
    print("RUNNING FRAUD DETECTION MODEL")
    print("="*60)
    
    try:
        from models.fraud_model import FraudDetectionModel
        
        model = FraudDetectionModel()
        metrics = model.train(n_estimators=100, contamination=0.05)
        model.save()
        
        print("\nSample Fraud Predictions:")
        test_claims = [
            {
                'name': 'Normal Claim',
                'gps_cell_delta': 0.5,
                'activity_anomaly': 0.2,
                'claim_frequency': 2,
                'zone_trigger_match': 1,
                'weather_correlation': 0.9,
            },
            {
                'name': 'Suspicious Claim',
                'gps_cell_delta': 4.0,
                'activity_anomaly': 4.0,
                'claim_frequency': 10,
                'zone_trigger_match': 0,
                'weather_correlation': 0.3,
            },
        ]
        
        for claim in test_claims:
            result = model.analyze_claim(claim)
            print(f"\n  {claim['name']}:")
            print(f"    Fraud Score: {result['fraud_score']}%")
            print(f"    Route: {result['route']}")
            print(f"    Confidence: {result['confidence']}")
            
    except ImportError as e:
        print(f"  Skipping: {e}")


def run_zone_risk_model():
    """Run Zone Risk Model (LSTM)"""
    print("\n" + "="*60)
    print("RUNNING ZONE RISK MODEL")
    print("="*60)
    
    try:
        from models.zone_risk_model import ZoneRiskLSTM
        
        model = ZoneRiskLSTM(sequence_length=14, n_features=6)
        
        for city in ['mumbai', 'delhi', 'bengaluru']:
            print(f"\nTraining for {city}...")
            metrics = model.train(city=city)
        
        model.save()
        
        print("\n14-Day Forecasts:")
        for city in ['mumbai', 'delhi', 'bengaluru']:
            predictions = model.predict_14_day(city)
            high_risk = sum(1 for p in predictions if p['level'] == 'HIGH')
            avg_risk = sum(p['risk'] for p in predictions) / len(predictions)
            
            print(f"\n  {city.upper()}:")
            print(f"    High Risk Days: {high_risk}")
            print(f"    Average Risk: {avg_risk:.1%}")
            
    except Exception as e:
        print(f"  Skipping: {e}")


def run_trigger_backtest():
    """Run Trigger Backtester"""
    print("\n" + "="*60)
    print("RUNNING TRIGGER BACKTESTING")
    print("="*60)
    
    try:
        from models.trigger_model import TriggerBacktester
        
        backtester = TriggerBacktester()
        
        for city in ['mumbai', 'delhi', 'bengaluru', 'kolkata']:
            backtester.backtest_all_triggers(city, n_days=1000)
        
        backtester.optimize_thresholds('mumbai')
        
        print(backtester.generate_report('mumbai'))
        backtester.save()
        
    except Exception as e:
        print(f"  Skipping: {e}")


def main():
    """Run all models"""
    print("="*60)
    print("GIGPROTECTOR ML MODELS")
    print("="*60)
    print("Training and evaluating all machine learning models...")
    print("Models: Premium (XGBoost), Fraud (Isolation Forest),")
    print("        Zone Risk (LSTM), Trigger Backtesting")
    print("="*60)
    
    run_premium_model()
    run_fraud_model()
    run_zone_risk_model()
    run_trigger_backtest()
    
    print("\n" + "="*60)
    print("ALL MODELS COMPLETED")
    print("="*60)
    print("\nTrained models are saved in: backend/models/")
    print("  - premium_model.joblib")
    print("  - fraud_model.joblib")
    print("  - zone_risk_lstm.joblib")
    print("  - trigger_backtest.joblib")


if __name__ == "__main__":
    main()
