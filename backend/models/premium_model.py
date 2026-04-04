import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import xgboost as xgb
import joblib
import os
from datetime import datetime

class PremiumModel:
    """
    XGBoost Model for Dynamic Premium Calculation
    Trains on historical disruption data and worker profiles
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'zone_flood_score', 'zone_aqi_score', 'monsoon_factor',
            'cyclone_risk', 'heat_exposure', 'tenure_score',
            'earnings_normalized', 'platform_type', 'working_hours'
        ]
        self.model_path = 'models/premium_model.joblib'
        
    def generate_synthetic_data(self, n_samples=50000):
        """Generate synthetic training data for premium model"""
        np.random.seed(42)
        
        data = {
            'zone_flood_score': np.random.beta(2, 5, n_samples),
            'zone_aqi_score': np.random.beta(2, 5, n_samples),
            'monsoon_factor': np.random.choice([0.3, 0.6, 0.9], n_samples, p=[0.4, 0.35, 0.25]),
            'cyclone_risk': np.random.beta(1, 10, n_samples),
            'heat_exposure': np.random.beta(2, 5, n_samples),
            'tenure_score': np.random.beta(1, 3, n_samples),
            'earnings_normalized': np.random.beta(2, 3, n_samples),
            'platform_type': np.random.randint(0, 4, n_samples),
            'working_hours': np.random.randint(4, 12, n_samples),
        }
        
        base_premium = 50
        
        risk_score = (
            data['zone_flood_score'] * 0.28 +
            data['zone_aqi_score'] * 0.12 +
            data['monsoon_factor'] * 0.18 +
            data['cyclone_risk'] * 0.08 +
            data['heat_exposure'] * 0.10
        )
        
        discount = data['tenure_score'] * 0.14 + data['earnings_normalized'] * 0.05
        
        premium = base_premium * (1 + risk_score * 2) * (1 - discount)
        premium += np.random.normal(0, 5, n_samples)
        premium = np.clip(premium, 25, 250)
        
        return pd.DataFrame(data), premium
    
    def train(self, n_estimators=100, learning_rate=0.1, max_depth=6):
        """Train XGBoost premium model"""
        print("Generating training data...")
        X, y = self.generate_synthetic_data(50000)
        
        print("Splitting data...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        print("Scaling features...")
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        print("Training XGBoost model...")
        self.model = xgb.XGBRegressor(
            n_estimators=n_estimators,
            learning_rate=learning_rate,
            max_depth=max_depth,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        print("Evaluating model...")
        y_pred = self.model.predict(X_test_scaled)
        
        metrics = {
            'mse': mean_squared_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'r2': r2_score(y_test, y_pred)
        }
        
        print(f"\nModel Performance:")
        print(f"  MSE:  {metrics['mse']:.4f}")
        print(f"  RMSE: {metrics['rmse']:.4f}")
        print(f"  MAE:  {metrics['mae']:.4f}")
        print(f"  R²:   {metrics['r2']:.4f}")
        
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\nFeature Importance:")
        for _, row in feature_importance.iterrows():
            print(f"  {row['feature']}: {row['importance']:.4f}")
        
        return metrics, feature_importance
    
    def predict(self, features):
        """Predict premium for given features"""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        features_scaled = self.scaler.transform([features])
        return self.model.predict(features_scaled)[0]
    
    def save(self):
        """Save model to disk"""
        os.makedirs('models', exist_ok=True)
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names
        }, self.model_path)
        print(f"Model saved to {self.model_path}")
    
    def load(self):
        """Load model from disk"""
        if os.path.exists(self.model_path):
            data = joblib.load(self.model_path)
            self.model = data['model']
            self.scaler = data['scaler']
            self.feature_names = data['feature_names']
            print(f"Model loaded from {self.model_path}")
            return True
        return False


def main():
    print("=" * 60)
    print("PREMIUM MODEL TRAINING - XGBoost")
    print("=" * 60)
    
    model = PremiumModel()
    
    metrics, importance = model.train(
        n_estimators=150,
        learning_rate=0.08,
        max_depth=7
    )
    
    model.save()
    
    print("\n" + "=" * 60)
    print("Sample Predictions:")
    print("=" * 60)
    
    test_cases = [
        [0.8, 0.3, 0.9, 0.3, 0.5, 0.6, 0.5, 0, 8],  # High risk monsoon
        [0.2, 0.1, 0.3, 0.05, 0.2, 0.8, 0.6, 1, 10],  # Low risk safe zone
        [0.5, 0.4, 0.6, 0.1, 0.4, 0.4, 0.4, 2, 6],  # Medium risk
    ]
    
    labels = ["High Risk (Mumbai Monsoon)", "Low Risk (Safe Zone)", "Medium Risk"]
    
    for features, label in zip(test_cases, labels):
        pred = model.predict(features)
        print(f"  {label}: ₹{pred:.2f}/week")


if __name__ == "__main__":
    main()
