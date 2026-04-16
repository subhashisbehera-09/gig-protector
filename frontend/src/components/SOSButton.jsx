import { useState, useEffect } from 'react';
import apiService from '../services/api';

const EMERGENCY_STATES = {
  IDLE: 'IDLE',
  TRIGGERED: 'TRIGGERED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  ESCALATED: 'ESCALATED',
  RESOLVED: 'RESOLVED',
  ABORTED: 'ABORTED'
};

export function SOSButton() {
  const [emergencyState, setEmergencyState] = useState(EMERGENCY_STATES.IDLE);
  const [countdown, setCountdown] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);
  const [location, setLocation] = useState(null);
  const [incidentId, setIncidentId] = useState(null);
  const [error, setError] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (emergencyState === EMERGENCY_STATES.TRIGGERED && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, emergencyState]);

  useEffect(() => {
    if (!navigator.onLine) {
      const queued = localStorage.getItem('emergency_queue');
      if (queued) {
        setOfflineQueue(JSON.parse(queued));
      }
    }
  }, []);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude
        }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const triggerEmergency = async (triggerType = 'BUTTON') => {
    setIsLoading(true);
    setError(null);
    try {
      const loc = await getLocation();
      setLocation(loc);

      const payload = {
        worker_id: localStorage.getItem('user_id') || 'worker-001',
        location: loc,
        trigger_type: triggerType,
        ride_or_delivery_id: localStorage.getItem('current_delivery_id') || null,
        notes: null
      };

      if (!navigator.onLine) {
        const queue = [...offlineQueue, { ...payload, timestamp: Date.now() }];
        setOfflineQueue(queue);
        localStorage.setItem('emergency_queue', JSON.stringify(queue));
        setEmergencyState(EMERGENCY_STATES.TRIGGERED);
        setIncidentId(`offline-${Date.now()}`);
        setIsLoading(false);
        return;
      }

      const response = await apiService.post('/emergency/trigger', payload);

      if (!response || !response.id) {
        throw new Error('Invalid response from server');
      }
      setIncidentId(response.id);
      setEmergencyState(EMERGENCY_STATES.TRIGGERED);
      setCountdown(10);
      setError(null);
    } catch (err) {
      console.error('SOS Trigger Error:', err);
      setError(err.message || 'Failed to trigger emergency. Please try again.');
      setEmergencyState(EMERGENCY_STATES.IDLE);
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSOSPress = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    triggerEmergency('BUTTON');
    setShowConfirm(false);
  };

  const handleCancel = async () => {
    if (incidentId && incidentId.startsWith('offline-')) {
      const queue = offlineQueue.filter(item =>
        !item.timestamp || item.timestamp.toString() !== incidentId.replace('offline-', '')
      );
      setOfflineQueue(queue);
      localStorage.setItem('emergency_queue', JSON.stringify(queue));
    } else if (incidentId) {
      try {
        const workerId = localStorage.getItem('user_id') || 'worker-001';
        await apiService.post(`/emergency/${incidentId}/cancel`, { worker_id: workerId });
      } catch (err) {
        console.error('Failed to cancel:', err);
      }
    }
    setEmergencyState(EMERGENCY_STATES.IDLE);
    setIncidentId(null);
    setCountdown(10);
    setShowConfirm(false);
  };

  const resolveEmergency = async () => {
    if (incidentId && !incidentId.startsWith('offline-')) {
      try {
        await apiService.patch(`/emergency/${incidentId}/status`, {
          new_state: 'RESOLVED',
          reason: 'Worker confirmed safe'
        });
      } catch (err) {
        console.error('Failed to resolve:', err);
      }
    }
    setEmergencyState(EMERGENCY_STATES.RESOLVED);
  };

  if (emergencyState === EMERGENCY_STATES.IDLE) {
    return (
      <div style={styles.container}>
        {showConfirm ? (
          <div style={styles.confirmBox}>
            <p style={styles.confirmText}>Are you sure you need help?</p>
            {isLoading ? (
              <div style={styles.loadingBox}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Sending alert...</p>
              </div>
            ) : (
              <div style={styles.confirmButtons}>
                <button style={styles.cancelConfirmBtn} onClick={() => setShowConfirm(false)} disabled={isLoading}>
                  No, I'm OK
                </button>
                <button style={styles.confirmBtn} onClick={handleConfirm} disabled={isLoading}>
                  YES, Get Help
                </button>
              </div>
            )}
          </div>
        ) : (
          <button style={styles.sosButton} onClick={handleSOSPress} disabled={isLoading}>
            {isLoading ? '...' : 'SOS'}
          </button>
        )}
        {error && <p style={styles.error}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={styles.activeContainer}>
      <div style={styles.statusBox}>
        <div style={styles.pulsingDot}></div>
        <h2 style={styles.statusTitle}>
          {emergencyState === EMERGENCY_STATES.TRIGGERED && 'Getting Help...'}
          {emergencyState === EMERGENCY_STATES.ACKNOWLEDGED && 'Agent Responding'}
          {emergencyState === EMERGENCY_STATES.ESCALATED && 'Escalating to Emergency Services'}
          {emergencyState === EMERGENCY_STATES.RESOLVED && 'Incident Resolved'}
        </h2>
        
        {emergencyState === EMERGENCY_STATES.TRIGGERED && (
          <p style={styles.countdownText}>
            Tap "Cancel" within {countdown}s to abort
          </p>
        )}
        
        {location && (
          <p style={styles.locationText}>
            📍 Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        )}
        
        {!navigator.onLine && (
          <p style={styles.offlineWarning}>⚠️ Offline - Alert queued</p>
        )}
        
        <div style={styles.actionButtons}>
          {emergencyState === EMERGENCY_STATES.TRIGGERED && (
            <button style={styles.cancelBtn} onClick={handleCancel}>
              Cancel
            </button>
          )}
          
          {emergencyState === EMERGENCY_STATES.TRIGGERED && (
            <button style={styles.safeBtn} onClick={resolveEmergency}>
              I'm Safe Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: '100px',
    right: '20px',
    zIndex: 1000
  },
  sosButton: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff4757 0%, #c0392b 100%)',
    border: '4px solid white',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(255, 71, 87, 0.5)',
    transition: 'transform 0.2s'
  },
  confirmBox: {
    background: '#1a1a2e',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid #ff4757'
  },
  confirmText: {
    color: '#fff',
    marginBottom: '15px',
    fontSize: '16px'
  },
  confirmButtons: {
    display: 'flex',
    gap: '10px'
  },
  confirmBtn: {
    background: '#ff4757',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  cancelConfirmBtn: {
    background: '#2ecc71',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  error: {
    color: '#ff4757',
    fontSize: '12px',
    marginTop: '10px',
    maxWidth: '200px',
    textAlign: 'center'
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  spinner: {
    width: '30px',
    height: '30px',
    border: '3px solid rgba(255, 71, 87, 0.3)',
    borderTop: '3px solid #ff4757',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#fff',
    fontSize: '14px'
  },
  activeContainer: {
    position: 'fixed',
    bottom: '100px',
    right: '20px',
    zIndex: 1000
  },
  statusBox: {
    background: '#1a1a2e',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid #ff4757',
    minWidth: '250px'
  },
  pulsingDot: {
    width: '12px',
    height: '12px',
    background: '#ff4757',
    borderRadius: '50%',
    animation: 'pulse 1s infinite'
  },
  statusTitle: {
    color: '#fff',
    margin: '10px 0',
    fontSize: '18px'
  },
  countdownText: {
    color: '#f39c12',
    fontSize: '14px'
  },
  locationText: {
    color: '#aaa',
    fontSize: '12px',
    marginTop: '10px'
  },
  offlineWarning: {
    color: '#e74c3c',
    fontSize: '12px',
    marginTop: '10px'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  },
  cancelBtn: {
    background: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  safeBtn: {
    background: '#2ecc71',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};
