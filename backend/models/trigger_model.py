import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix
import os

class TriggerBacktester:
    """
    Trigger Backtesting Model
    Tests parametric triggers against historical disruption events
    Evaluates precision, recall, and false positive rates
    """
    
    def __init__(self):
        self.triggers = {
            'heavy_rain': {
                'threshold': 64.5,
                'metric': 'precipitation_24h',
                'unit': 'mm',
                'description': 'Heavy Rainfall > 64.5mm/24h'
            },
            'extreme_heat': {
                'threshold': 44,
                'metric': 'temperature_max',
                'unit': '°C',
                'description': 'Extreme Heat > 44°C for 2+ days'
            },
            'dense_fog': {
                'threshold': 200,
                'metric': 'visibility',
                'unit': 'meters',
                'description': 'Dense Fog < 200m visibility'
            },
            'severe_pollution': {
                'threshold': 300,
                'metric': 'aqi',
                'unit': 'AQI',
                'description': 'Severe AQI > 300'
            },
            'civic_disruption': {
                'threshold': 15,
                'metric': 'zone_activity_pct',
                'unit': '%',
                'description': 'Civic Disruption - Zone orders < 15%'
            }
        }
        
        self.results = {}
        self.model_path = 'models/trigger_backtest.joblib'
    
    def generate_historical_data(self, n_days=3650, city='mumbai'):
        """Generate synthetic historical weather and disruption data"""
        np.random.seed(42)
        
        city_configs = {
            'mumbai': {
                'rain_season': (6, 9),
                'heat_season': (4, 5),
                'fog_season': (12, 1),
                'rain_intensity': 15,
                'base_aqi': 145,
                'disruption_rate': 0.12
            },
            'delhi': {
                'rain_season': (7, 8),
                'heat_season': (4, 6),
                'fog_season': (12, 2),
                'rain_intensity': 10,
                'base_aqi': 180,
                'disruption_rate': 0.15
            },
            'bengaluru': {
                'rain_season': (9, 10),
                'heat_season': (3, 5),
                'fog_season': (12, 1),
                'rain_intensity': 8,
                'base_aqi': 65,
                'disruption_rate': 0.08
            },
            'kolkata': {
                'rain_season': (6, 9),
                'heat_season': (4, 6),
                'fog_season': (12, 1),
                'rain_intensity': 18,
                'base_aqi': 95,
                'disruption_rate': 0.14
            }
        }
        
        config = city_configs.get(city, city_configs['mumbai'])
        
        data = []
        start_date = datetime.now() - timedelta(days=n_days)
        
        for day_idx in range(n_days):
            date = start_date + timedelta(days=day_idx)
            month = date.month
            
            is_monsoon = config['rain_season'][0] <= month <= config['rain_season'][1]
            is_heat = config['heat_season'][0] <= month <= config['heat_season'][1]
            is_fog = config['fog_season'][0] <= month <= config['fog_season'][1]
            
            if is_monsoon:
                precip = np.random.exponential(config['rain_intensity'], 1)[0] + 20
            else:
                precip = np.random.exponential(3, 1)[0]
            precip = min(precip, 150)
            
            if is_heat:
                temp = np.random.uniform(38, 47)
            elif month in [12, 1, 2]:
                temp = np.random.uniform(12, 25)
            else:
                temp = np.random.uniform(28, 38)
            
            if precip > 50:
                visibility = np.random.uniform(300, 2000)
            elif precip > 20:
                visibility = np.random.uniform(2000, 6000)
            elif is_fog:
                visibility = np.random.uniform(100, 500)
            else:
                visibility = np.random.uniform(7000, 10000)
            
            aqi = config['base_aqi'] + np.random.exponential(40, 1)[0]
            if is_monsoon:
                aqi -= 30
            
            zone_activity = np.random.uniform(40, 90)
            
            actual_disruption = 0
            disruption_reasons = []
            
            if precip > 64.5:
                actual_disruption = 1
                disruption_reasons.append('heavy_rain')
            if temp > 44:
                actual_disruption = 1
                disruption_reasons.append('extreme_heat')
            if visibility < 200:
                actual_disruption = 1
                disruption_reasons.append('dense_fog')
            if aqi > 300:
                actual_disruption = 1
                disruption_reasons.append('severe_pollution')
            if zone_activity < 15:
                actual_disruption = 1
                disruption_reasons.append('civic_disruption')
            
            if np.random.random() < config['disruption_rate'] and not disruption_reasons:
                if np.random.random() < 0.3:
                    actual_disruption = 1
                    disruption_reasons.append('other')
            
            data.append({
                'date': date,
                'precipitation_24h': precip,
                'temperature_max': temp,
                'visibility': visibility,
                'aqi': aqi,
                'zone_activity_pct': zone_activity,
                'actual_disruption': actual_disruption,
                'disruption_reasons': disruption_reasons
            })
        
        return pd.DataFrame(data)
    
    def test_trigger(self, df, trigger_name):
        """Test a single trigger against historical data"""
        trigger = self.triggers[trigger_name]
        metric = trigger['metric']
        
        df = df.copy()
        df['trigger_fired'] = df[metric] > trigger['threshold']
        
        y_true = df['actual_disruption']
        y_pred = df['trigger_fired']
        
        tp = ((y_pred == True) & (y_true == 1)).sum()
        fp = ((y_pred == True) & (y_true == 0)).sum()
        tn = ((y_pred == False) & (y_true == 0)).sum()
        fn = ((y_pred == False) & (y_true == 1)).sum()
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0
        
        results = {
            'trigger': trigger_name,
            'description': trigger['description'],
            'threshold': trigger['threshold'],
            'unit': trigger['unit'],
            'true_positives': int(tp),
            'false_positives': int(fp),
            'true_negatives': int(tn),
            'false_negatives': int(fn),
            'precision': round(precision, 4),
            'recall': round(recall, 4),
            'f1_score': round(f1, 4),
            'false_positive_rate': round(fpr, 4),
            'total_firings': int(y_pred.sum()),
            'actual_disruptions': int(y_true.sum())
        }
        
        return results
    
    def backtest_all_triggers(self, city='mumbai', n_days=3650):
        """Run backtest for all triggers"""
        print(f"\n{'='*60}")
        print(f"TRIGGER BACKTESTING - {city.upper()}")
        print(f"{'='*60}")
        print(f"Testing {n_days} days of historical data\n")
        
        print("Generating historical data...")
        df = self.generate_historical_data(n_days, city)
        
        print(f"Total records: {len(df)}")
        print(f"Actual disruptions: {df['actual_disruption'].sum()}")
        print(f"Disruption rate: {df['actual_disruption'].mean()*100:.2f}%\n")
        
        all_results = []
        
        for trigger_name in self.triggers.keys():
            result = self.test_trigger(df, trigger_name)
            all_results.append(result)
            
            print(f"📊 {result['description']}")
            print(f"   Threshold: {result['threshold']} {result['unit']}")
            print(f"   Precision: {result['precision']*100:.1f}%")
            print(f"   Recall:    {result['recall']*100:.1f}%")
            print(f"   F1 Score:  {result['f1_score']*100:.1f}%")
            print(f"   False Pos:  {result['false_positives']} ({result['false_positive_rate']*100:.1f}%)")
            print()
        
        avg_precision = np.mean([r['precision'] for r in all_results])
        avg_recall = np.mean([r['recall'] for r in all_results])
        avg_f1 = np.mean([r['f1_score'] for r in all_results])
        
        print(f"{'='*60}")
        print("OVERALL PERFORMANCE:")
        print(f"{'='*60}")
        print(f"  Average Precision: {avg_precision*100:.1f}%")
        print(f"  Average Recall:    {avg_recall*100:.1f}%")
        print(f"  Average F1 Score:  {avg_f1*100:.1f}%")
        
        self.results[city] = {
            'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'n_days': n_days,
            'disruption_rate': df['actual_disruption'].mean(),
            'trigger_results': all_results,
            'summary': {
                'avg_precision': avg_precision,
                'avg_recall': avg_recall,
                'avg_f1': avg_f1
            }
        }
        
        return self.results[city]
    
    def optimize_thresholds(self, city='mumbai'):
        """Find optimal threshold values for each trigger"""
        print(f"\n{'='*60}")
        print(f"THRESHOLD OPTIMIZATION - {city.upper()}")
        print(f"{'='*60}")
        
        df = self.generate_historical_data(1000, city)
        
        optimized = {}
        
        for trigger_name in self.triggers.keys():
            trigger = self.triggers[trigger_name]
            metric = trigger['metric']
            
            best_f1 = 0
            best_threshold = trigger['threshold']
            
            thresholds = np.linspace(df[metric].min(), df[metric].quantile(0.95), 50)
            
            for thresh in thresholds:
                y_pred = df[metric] > thresh
                y_true = df['actual_disruption']
                
                tp = ((y_pred == True) & (y_true == 1)).sum()
                fp = ((y_pred == True) & (y_true == 0)).sum()
                fn = ((y_pred == False) & (y_true == 1)).sum()
                
                precision = tp / (tp + fp) if (tp + fp) > 0 else 0
                recall = tp / (tp + fn) if (tp + fn) > 0 else 0
                f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
                
                if f1 > best_f1:
                    best_f1 = f1
                    best_threshold = thresh
            
            original_f1 = self.test_trigger(df, trigger_name)['f1_score']
            
            optimized[trigger_name] = {
                'original_threshold': trigger['threshold'],
                'optimized_threshold': round(best_threshold, 2),
                'improvement': round((best_f1 - original_f1) * 100, 2)
            }
            
            print(f"\n{trigger['description']}:")
            print(f"  Original: {trigger['threshold']} -> F1: {original_f1*100:.1f}%")
            print(f"  Optimized: {best_threshold:.2f} -> F1: {best_f1*100:.1f}%")
            if best_f1 > original_f1:
                print(f"  ✅ Improvement: +{(best_f1 - original_f1)*100:.1f}%")
        
        return optimized
    
    def generate_report(self, city='mumbai'):
        """Generate detailed backtest report"""
        if city not in self.results:
            self.backtest_all_triggers(city)
        
        result = self.results[city]
        
        report = f"""
================================================================================
                    GIGPROTECTOR TRIGGER BACKTEST REPORT
================================================================================

City: {city.upper()}
Date: {result['date']}
Test Period: {result['n_days']} days
Historical Disruption Rate: {result['disruption_rate']*100:.2f}%

--------------------------------------------------------------------------------
                            TRIGGER PERFORMANCE
--------------------------------------------------------------------------------

"""
        
        for r in result['trigger_results']:
            status = '✅' if r['f1_score'] > 0.6 else '⚠️' if r['f1_score'] > 0.3 else '❌'
            
            report += f"""
{status} {r['description']}
    Threshold: {r['threshold']} {r['unit']}
    Precision: {r['precision']*100:6.1f}%  |  Recall: {r['recall']*100:6.1f}%  |  F1: {r['f1_score']*100:6.1f}%
    Trigger Firings: {r['total_firings']:4d}  |  False Positives: {r['false_positives']:4d}
"""
        
        report += f"""
--------------------------------------------------------------------------------
                              SUMMARY METRICS
--------------------------------------------------------------------------------

    Average Precision: {result['summary']['avg_precision']*100:.1f}%
    Average Recall:    {result['summary']['avg_recall']*100:.1f}%
    Average F1 Score:  {result['summary']['avg_f1']*100:.1f}%

================================================================================
"""
        
        return report
    
    def save(self):
        """Save backtest results"""
        os.makedirs('models', exist_ok=True)
        import joblib
        joblib.dump({
            'results': self.results,
            'triggers': self.triggers
        }, self.model_path)
        print(f"\nResults saved to {self.model_path}")
    
    def load(self):
        """Load backtest results"""
        import joblib
        if os.path.exists(self.model_path):
            data = joblib.load(self.model_path)
            self.results = data['results']
            self.triggers = data['triggers']
            print(f"Results loaded from {self.model_path}")
            return True
        return False


def main():
    print("=" * 60)
    print("GIGPROTECTOR - TRIGGER BACKTESTING SYSTEM")
    print("=" * 60)
    
    backtester = TriggerBacktester()
    
    for city in ['mumbai', 'delhi', 'bengaluru', 'kolkata']:
        backtester.backtest_all_triggers(city, n_days=1825)
    
    backtester.optimize_thresholds('mumbai')
    
    print(backtester.generate_report('mumbai'))
    
    backtester.save()


if __name__ == "__main__":
    main()
