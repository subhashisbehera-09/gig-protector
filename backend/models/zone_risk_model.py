import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
import os

class ZoneRiskLSTM:
    """
    LSTM Model for Zone Risk Prediction
    Predicts 14-day disruption probability using historical weather patterns
    """
    
    def __init__(self, sequence_length=14, n_features=6):
        self.sequence_length = sequence_length
        self.n_features = n_features
        self.scaler = MinMaxScaler()
        self.model_path = 'models/zone_risk_lstm.joblib'
        
        self.feature_names = [
            'precipitation', 'temperature', 'visibility',
            'humidity', 'wind_speed', 'aqi'
        ]
        
    def generate_synthetic_weather_data(self, n_days=3650, city='mumbai'):
        """Generate synthetic weather data for LSTM training"""
        np.random.seed(42)
        
        city_configs = {
            'mumbai': {'rain_prob': 0.4, 'rain_intensity': 15, 'monsoon_months': [6,7,8,9]},
            'delhi': {'rain_prob': 0.25, 'rain_intensity': 10, 'monsoon_months': [7,8]},
            'bengaluru': {'rain_prob': 0.3, 'rain_intensity': 8, 'monsoon_months': [9,10]},
            'chennai': {'rain_prob': 0.35, 'rain_intensity': 12, 'monsoon_months': [10,11,12]},
            'kolkata': {'rain_prob': 0.45, 'rain_intensity': 18, 'monsoon_months': [6,7,8,9]},
        }
        
        config = city_configs.get(city, city_configs['mumbai'])
        
        data = []
        for day in range(n_days):
            month = (day % 365) // 30 + 1
            is_monsoon = month in config['monsoon_months']
            
            if is_monsoon:
                precip = np.random.exponential(config['rain_intensity'], 1)[0]
                precip = min(precip, 100)
                humidity = np.random.uniform(75, 95)
            else:
                precip = np.random.exponential(2, 1)[0]
                humidity = np.random.uniform(40, 65)
            
            if month in [4, 5]:
                temp = np.random.uniform(35, 45)
            elif month in [12, 1, 2]:
                temp = np.random.uniform(15, 25)
            else:
                temp = np.random.uniform(25, 35)
            
            if precip > 50:
                visibility = np.random.uniform(500, 2000)
            elif precip > 20:
                visibility = np.random.uniform(2000, 5000)
            else:
                visibility = np.random.uniform(8000, 10000)
            
            wind = np.random.exponential(15, 1)[0]
            
            aqi_base = 50 if city == 'delhi' else 40
            aqi = aqi_base + np.random.exponential(30, 1)[0] + (precip > 10) * 20
            
            data.append([precip, temp, visibility, humidity, wind, aqi])
        
        return np.array(data)
    
    def create_sequences(self, data, targets):
        """Create sequences for LSTM training"""
        X, y = [], []
        for i in range(len(data) - self.sequence_length):
            X.append(data[i:i + self.sequence_length])
            y.append(targets[i + self.sequence_length])
        return np.array(X), np.array(y)
    
    def calculate_disruption_risk(self, weather_data):
        """Calculate disruption risk from weather features"""
        precip, temp, visibility, humidity, wind, aqi = weather_data
        
        risk = 0
        
        if precip > 70:
            risk += 0.5
        elif precip > 40:
            risk += 0.25
        elif precip > 20:
            risk += 0.1
        
        if temp > 44:
            risk += 0.3
        elif temp > 40:
            risk += 0.15
        
        if visibility < 500:
            risk += 0.4
        elif visibility < 2000:
            risk += 0.2
        elif visibility < 5000:
            risk += 0.1
        
        if humidity > 90:
            risk += 0.15
        elif humidity > 80:
            risk += 0.08
        
        if aqi > 300:
            risk += 0.25
        elif aqi > 200:
            risk += 0.15
        
        return min(risk, 1.0)
    
    def train(self, city='mumbai', test_size=0.2):
        """Train LSTM model (simplified using dense layers)"""
        print(f"Generating weather data for {city}...")
        weather_data = self.generate_synthetic_weather_data(3650, city)
        
        print("Scaling features...")
        weather_scaled = self.scaler.fit_transform(weather_data)
        
        print("Calculating disruption targets...")
        targets = np.array([self.calculate_disruption_risk(w) for w in weather_data])
        
        print("Creating sequences...")
        X, y = self.create_sequences(weather_scaled, targets)
        
        print(f"Training data shape: X={X.shape}, y={y.shape}")
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, shuffle=False
        )
        
        print("Training Simple Neural Network (simplified LSTM)...")
        np.random.seed(42)
        
        input_dim = self.sequence_length * self.n_features
        hidden_dim = 64
        
        W1 = np.random.randn(input_dim, hidden_dim) * 0.01
        b1 = np.zeros(hidden_dim)
        W2 = np.random.randn(hidden_dim, 32) * 0.01
        b2 = np.zeros(32)
        W3 = np.random.randn(32, 1) * 0.01
        b3 = np.zeros(1)
        
        learning_rate = 0.001
        epochs = 100
        
        for epoch in range(epochs):
            X_flat = X_train.reshape(-1, input_dim)
            
            def relu(x):
                return np.maximum(0, x)
            
            def relu_grad(x):
                return (x > 0).astype(float)
            
            z1 = np.dot(X_flat, W1) + b1
            a1 = relu(z1)
            z2 = np.dot(a1, W2) + b2
            a2 = relu(z2)
            z3 = np.dot(a2, W3) + b3
            y_pred = z3.flatten()
            
            loss = np.mean((y_pred - y_train) ** 2)
            
            if epoch % 20 == 0:
                print(f"  Epoch {epoch}: Loss = {loss:.6f}")
            
            dz3 = 2 * (y_pred - y_train) / len(y_train)
            dW3 = np.dot(a2.T, dz3)
            db3 = np.sum(dz3, axis=0)
            
            da2 = np.dot(dz3, W3.T)
            dz2 = da2 * relu_grad(z2)
            dW2 = np.dot(a1.T, dz2)
            db2 = np.sum(dz2, axis=0)
            
            da1 = np.dot(dz2, W2.T)
            dz1 = da1 * relu_grad(z1)
            dW1 = np.dot(X_flat.T, dz1)
            db1 = np.sum(dz1, axis=0)
            
            W1 -= learning_rate * dW1
            b1 -= learning_rate * db1
            W2 -= learning_rate * dW2
            b2 -= learning_rate * db2
            W3 -= learning_rate * dW3
            b3 -= learning_rate * db3
        
        self.weights = {'W1': W1, 'b1': b1, 'W2': W2, 'b2': b2, 'W3': W3, 'b3': b3}
        
        y_pred_test = self.predict_batch(X_test)
        
        mse = mean_squared_error(y_test, y_pred_test)
        mae = mean_absolute_error(y_test, y_pred_test)
        
        print(f"\nModel Performance:")
        print(f"  MSE:  {mse:.6f}")
        print(f"  MAE:  {mae:.6f}")
        
        return {'mse': mse, 'mae': mae}
    
    def predict(self, weather_sequence):
        """Predict disruption risk for a 14-day sequence"""
        if isinstance(weather_sequence, list):
            weather_sequence = np.array(weather_sequence)
        
        if weather_sequence.shape[0] < self.sequence_length:
            weather_sequence = np.pad(
                weather_sequence, 
                ((self.sequence_length - len(weather_sequence), 0), (0, 0)),
                mode='edge'
            )
        
        weather_scaled = self.scaler.transform(weather_sequence)
        X = weather_scaled.reshape(1, -1)
        
        W1, b1 = self.weights['W1'], self.weights['b1']
        W2, b2 = self.weights['W2'], self.weights['b2']
        W3, b3 = self.weights['W3'], self.weights['b3']
        
        def relu(x):
            return np.maximum(0, x)
        
        a1 = relu(np.dot(X, W1) + b1)
        a2 = relu(np.dot(a1, W2) + b2)
        z3 = np.dot(a2, W3) + b3
        prediction = z3.flatten()[0]
        
        return max(0, min(1, prediction))
    
    def predict_batch(self, X):
        """Predict for multiple sequences"""
        W1, b1 = self.weights['W1'], self.weights['b1']
        W2, b2 = self.weights['W2'], self.weights['b2']
        W3, b3 = self.weights['W3'], self.weights['b3']
        
        def relu(x):
            return np.maximum(0, x)
        
        X_flat = X.reshape(X.shape[0], -1)
        a1 = relu(np.dot(X_flat, W1) + b1)
        a2 = relu(np.dot(a1, W2) + b2)
        z3 = np.dot(a2, W3) + b3
        return np.clip(z3.flatten(), 0, 1)
    
    def predict_14_day(self, city='mumbai'):
        """Predict 14-day disruption for a city"""
        print(f"\nGenerating 14-day forecast for {city}...")
        
        weather_data = self.generate_synthetic_weather_data(50, city)
        recent_data = weather_data[-50:]
        
        predictions = []
        for i in range(14):
            seq_start = i
            seq_end = i + self.sequence_length
            if seq_end > len(recent_data):
                seq_end = len(recent_data)
                seq_start = seq_end - self.sequence_length
            
            sequence = recent_data[seq_start:seq_end]
            risk = self.predict(sequence)
            
            date = pd.Timestamp.now() + pd.Timedelta(days=i)
            day_name = date.strftime('%a')
            
            risk_level = 'HIGH' if risk > 0.7 else 'MEDIUM' if risk > 0.4 else 'LOW'
            
            predictions.append({
                'date': date.strftime('%Y-%m-%d'),
                'day': day_name,
                'risk': round(risk, 3),
                'level': risk_level
            })
        
        return predictions
    
    def save(self):
        """Save model to disk"""
        os.makedirs('models', exist_ok=True)
        import joblib
        joblib.dump({
            'weights': self.weights,
            'scaler': self.scaler,
            'sequence_length': self.sequence_length,
            'n_features': self.n_features
        }, self.model_path)
        print(f"Model saved to {self.model_path}")
    
    def load(self):
        """Load model from disk"""
        import joblib
        if os.path.exists(self.model_path):
            data = joblib.load(self.model_path)
            self.weights = data['weights']
            self.scaler = data['scaler']
            self.sequence_length = data['sequence_length']
            self.n_features = data['n_features']
            print(f"Model loaded from {self.model_path}")
            return True
        return False


def main():
    print("=" * 60)
    print("ZONE RISK PREDICTION MODEL - LSTM")
    print("=" * 60)
    
    model = ZoneRiskLSTM(sequence_length=14, n_features=6)
    
    for city in ['mumbai', 'delhi', 'bengaluru']:
        print(f"\nTraining for {city}...")
        metrics = model.train(city=city)
    
    model.save()
    
    print("\n" + "=" * 60)
    print("14-Day Disruption Forecast:")
    print("=" * 60)
    
    for city in ['mumbai', 'delhi', 'bengaluru']:
        predictions = model.predict_14_day(city)
        high_risk = sum(1 for p in predictions if p['level'] == 'HIGH')
        
        print(f"\n{city.upper()}:")
        print(f"  High Risk Days: {high_risk}")
        for p in predictions[:7]:
            icon = '🔴' if p['level'] == 'HIGH' else '🟡' if p['level'] == 'MEDIUM' else '🟢'
            print(f"  {p['day']} {icon} {p['risk']:.1%}")


if __name__ == "__main__":
    main()
