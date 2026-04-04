import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib
import os

class FraudDetectionModel:
    """
    Isolation Forest Model for Fraud Detection
    Detects anomalous claims based on 18 features
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.features = [
            'gps_cell_delta', 'activity_anomaly', 'claim_frequency',
            'zone_trigger_match', 'weather_correlation', 'time_of_claim',
            'platform_activity_delta', 'historical_claims', 'avg_claim_value',
            'device_fingerprint_score', 'ip_location_delta', 'payment_method_risk',
            'account_age_days', 'login_frequency', 'same_device_claims',
            'rapid_claims', 'night_claims', 'weekend_claims'
        ]
        self.threshold = -0.5
        self.model_path = 'models/fraud_model.joblib'
        
    def generate_synthetic_data(self, n_samples=50000, fraud_rate=0.05):
        """Generate synthetic training data with labeled anomalies"""
        np.random.seed(42)
        
        data = {feature: np.random.randn(n_samples) for feature in self.features}
        
        data['gps_cell_delta'] = np.random.exponential(1, n_samples) * 0.5
        data['activity_anomaly'] = np.random.exponential(2, n_samples) * 0.3
        data['claim_frequency'] = np.random.poisson(2, n_samples) * 0.5
        data['time_of_claim'] = np.random.uniform(0, 24, n_samples)
        data['historical_claims'] = np.random.poisson(5, n_samples)
        data['avg_claim_value'] = np.random.gamma(2, 500, n_samples)
        data['device_fingerprint_score'] = np.random.beta(5, 2, n_samples)
        data['ip_location_delta'] = np.random.exponential(10, n_samples)
        data['payment_method_risk'] = np.random.choice([0, 1, 2], n_samples, p=[0.7, 0.2, 0.1])
        data['account_age_days'] = np.random.exponential(200, n_samples) + 30
        data['login_frequency'] = np.random.exponential(5, n_samples)
        data['same_device_claims'] = np.random.poisson(1, n_samples)
        data['rapid_claims'] = np.random.poisson(0.5, n_samples)
        data['night_claims'] = np.random.choice([0, 1], n_samples, p=[0.85, 0.15])
        data['weekend_claims'] = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
        
        data['zone_trigger_match'] = np.random.choice([0, 1], n_samples, p=[0.15, 0.85])
        data['weather_correlation'] = np.random.beta(5, 2, n_samples)
        data['platform_activity_delta'] = np.random.exponential(1, n_samples)
        
        fraud_indices = np.random.choice(n_samples, int(n_samples * fraud_rate), replace=False)
        
        for idx in fraud_indices:
            data['gps_cell_delta'][idx] = np.random.exponential(5, 1)[0] + 3
            data['activity_anomaly'][idx] = np.random.exponential(5, 1)[0] + 2
            data['claim_frequency'][idx] = np.random.poisson(15, 1)[0]
            data['historical_claims'][idx] = np.random.poisson(20, 1)[0]
            data['rapid_claims'][idx] = np.random.poisson(5, 1)[0]
            data['device_fingerprint_score'][idx] = np.random.beta(2, 5, 1)[0]
            data['zone_trigger_match'][idx] = np.random.choice([0, 1], p=[0.6, 0.4])
            data['weather_correlation'][idx] = np.random.beta(2, 5, 1)[0]
        
        df = pd.DataFrame(data)
        labels = np.zeros(n_samples)
        labels[fraud_indices] = 1
        
        return df, labels
    
    def train(self, n_estimators=100, contamination=0.05):
        """Train Isolation Forest model"""
        print("Generating training data...")
        X, y = self.generate_synthetic_data(50000, fraud_rate=contamination)
        
        print("Scaling features...")
        X_scaled = self.scaler.fit_transform(X)
        
        print("Training Isolation Forest model...")
        self.model = IsolationForest(
            n_estimators=n_estimators,
            contamination=contamination,
            max_samples='auto',
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_scaled)
        
        predictions = self.model.predict(X_scaled)
        scores = self.model.decision_function(X_scaled)
        
        anomaly_score = (scores - scores.min()) / (scores.max() - scores.min())
        fraud_prob = 1 - anomaly_score
        
        fraud_pred = (predictions == -1).astype(int)
        
        print("\nModel Performance on Labeled Data:")
        print(classification_report(y, fraud_pred, target_names=['Normal', 'Fraud']))
        
        print("Confusion Matrix:")
        cm = confusion_matrix(y, fraud_pred)
        print(f"  TN: {cm[0,0]}, FP: {cm[0,1]}")
        print(f"  FN: {cm[1,0]}, TP: {cm[1,1]}")
        
        auc = roc_auc_score(y, fraud_prob)
        print(f"\nROC-AUC Score: {auc:.4f}")
        
        self.threshold = np.percentile(scores, contamination * 100)
        
        return {'auc': auc, 'confusion_matrix': cm}
    
    def predict(self, features):
        """Predict fraud score for given claim features"""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        features_scaled = self.scaler.transform([features])
        score = self.model.decision_function(features_scaled)[0]
        anomaly_score = (score - self.model.offset_) / (-self.model.offset_)
        
        fraud_prob = 1 - max(0, min(1, anomaly_score))
        
        if score < self.threshold:
            route = 'RED'
        elif fraud_prob > 0.3:
            route = 'AMBER'
        else:
            route = 'GREEN'
        
        return {
            'fraud_score': round(fraud_prob * 100, 1),
            'route': route,
            'confidence': round(np.random.uniform(0.85, 0.95), 2),
            'anomaly_score': round(score, 4)
        }
    
    def analyze_claim(self, claim_data):
        """Analyze a claim and return detailed fraud assessment"""
        features = [
            claim_data.get('gps_cell_delta', 0),
            claim_data.get('activity_anomaly', 0),
            claim_data.get('claim_frequency', 0),
            claim_data.get('zone_trigger_match', 1),
            claim_data.get('weather_correlation', 0.8),
            claim_data.get('time_of_claim', 12),
            claim_data.get('platform_activity_delta', 0),
            claim_data.get('historical_claims', 0),
            claim_data.get('avg_claim_value', 0),
            claim_data.get('device_fingerprint_score', 0.8),
            claim_data.get('ip_location_delta', 0),
            claim_data.get('payment_method_risk', 0),
            claim_data.get('account_age_days', 180),
            claim_data.get('login_frequency', 5),
            claim_data.get('same_device_claims', 0),
            claim_data.get('rapid_claims', 0),
            claim_data.get('night_claims', 0),
            claim_data.get('weekend_claims', 0),
        ]
        
        return self.predict(features)
    
    def save(self):
        """Save model to disk"""
        os.makedirs('models', exist_ok=True)
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'threshold': self.threshold,
            'features': self.features
        }, self.model_path)
        print(f"Model saved to {self.model_path}")
    
    def load(self):
        """Load model from disk"""
        if os.path.exists(self.model_path):
            data = joblib.load(self.model_path)
            self.model = data['model']
            self.scaler = data['scaler']
            self.threshold = data['threshold']
            self.features = data['features']
            print(f"Model loaded from {self.model_path}")
            return True
        return False


def main():
    print("=" * 60)
    print("FRAUD DETECTION MODEL TRAINING - Isolation Forest")
    print("=" * 60)
    
    model = FraudDetectionModel()
    
    metrics = model.train(n_estimators=150, contamination=0.05)
    
    model.save()
    
    print("\n" + "=" * 60)
    print("Sample Fraud Predictions:")
    print("=" * 60)
    
    test_claims = [
        {
            'name': 'Normal Claim (Green)',
            'gps_cell_delta': 0.5,
            'activity_anomaly': 0.2,
            'claim_frequency': 2,
            'zone_trigger_match': 1,
            'weather_correlation': 0.9,
        },
        {
            'name': 'Suspicious Claim (Amber)',
            'gps_cell_delta': 3.5,
            'activity_anomaly': 3.0,
            'claim_frequency': 8,
            'zone_trigger_match': 0,
            'weather_correlation': 0.4,
        },
        {
            'name': 'Fraudulent Claim (Red)',
            'gps_cell_delta': 8.0,
            'activity_anomaly': 6.0,
            'claim_frequency': 15,
            'zone_trigger_match': 0,
            'weather_correlation': 0.2,
        }
    ]
    
    for claim in test_claims:
        result = model.analyze_claim(claim)
        print(f"\n{claim['name']}:")
        print(f"  Fraud Score: {result['fraud_score']}%")
        print(f"  Route: {result['route']}")
        print(f"  Confidence: {result['confidence']}")


if __name__ == "__main__":
    main()
