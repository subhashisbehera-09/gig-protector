import { useState, useEffect } from 'react';
import { api } from '../services/api';

const EMERGENCY_STATES = {
  IDLE: 'IDLE',
  TRIGGERED: 'TRIGGERED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  ESCALATED: 'ESCALATED',
  RESOLVED: 'RESOLVED',
  ABORTED: 'ABORTED'
};

const STATE_COLORS = {
  IDLE: '#95a5a6',
  TRIGGERED: '#e74c3c',
  ACKNOWLEDGED: '#f39c12',
  ESCALATED: '#9b59b6',
  RESOLVED: '#2ecc71',
  ABORTED: '#3498db'
};

export default function SafetyDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [agentId] = useState(`agent-${Math.random().toString(36).substr(2, 9)}`);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await api.get('/emergency/');
      setIncidents(response.data);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeIncident = async (incidentId) => {
    try {
      await api.patch(`/emergency/${incidentId}/status`, {
        new_state: EMERGENCY_STATES.ACKNOWLEDGED,
        agent_id: agentId,
        reason: 'Agent acknowledged'
      });
      fetchIncidents();
    } catch (err) {
      console.error('Failed to acknowledge:', err);
    }
  };

  const escalateIncident = async (incidentId) => {
    try {
      await api.patch(`/emergency/${incidentId}/status`, {
        new_state: EMERGENCY_STATES.ESCALATED,
        agent_id: agentId,
        reason: 'Escalating to emergency services',
        agent_notes: 'Worker confirmed danger'
      });
      fetchIncidents();
    } catch (err) {
      console.error('Failed to escalate:', err);
    }
  };

  const resolveIncident = async (incidentId) => {
    try {
      await api.patch(`/emergency/${incidentId}/status`, {
        new_state: EMERGENCY_STATES.RESOLVED,
        agent_id: agentId,
        reason: 'Incident resolved'
      });
      fetchIncidents();
    } catch (err) {
      console.error('Failed to resolve:', err);
    }
  };

  const abortIncident = async (incidentId) => {
    try {
      await api.patch(`/emergency/${incidentId}/status`, {
        new_state: EMERGENCY_STATES.ABORTED,
        agent_id: agentId,
        reason: 'False alarm'
      });
      fetchIncidents();
    } catch (err) {
      console.error('Failed to abort:', err);
    }
  };

  const activeIncidents = incidents.filter(i => 
    [EMERGENCY_STATES.TRIGGERED, EMERGENCY_STATES.ACKNOWLEDGED].includes(i.state)
  );
  const recentIncidents = incidents.filter(i => 
    i.state === EMERGENCY_STATES.RESOLVED || i.state === EMERGENCY_STATES.ABORTED
  ).slice(0, 10);

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Loading safety dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🛡️ Safety Agent Dashboard</h1>
        <p style={styles.subtitle}>Agent ID: {agentId}</p>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{activeIncidents.length}</span>
          <span style={styles.statLabel}>Active Incidents</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>
            {incidents.filter(i => i.state === EMERGENCY_STATES.TRIGGERED).length}
          </span>
          <span style={styles.statLabel}>Pending Response</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>
            {incidents.filter(i => i.state === EMERGENCY_STATES.ESCALATED).length}
          </span>
          <span style={styles.statLabel}>Escalated to PSAP</span>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.incidentsList}>
          <h2 style={styles.sectionTitle}>Active Incidents</h2>
          {activeIncidents.length === 0 ? (
            <p style={styles.emptyText}>No active incidents</p>
          ) : (
            activeIncidents.map(incident => (
              <div 
                key={incident.id} 
                style={styles.incidentCard}
                onClick={() => setSelectedIncident(incident)}
              >
                <div style={styles.incidentHeader}>
                  <span style={styles.incidentId}>#{incident.id.slice(0, 8)}</span>
                  <span style={{
                    ...styles.stateBadge,
                    background: STATE_COLORS[incident.state]
                  }}>
                    {incident.state}
                  </span>
                </div>
                <p style={styles.incidentInfo}>
                  Worker: {incident.worker_id} | Trigger: {incident.trigger_type}
                </p>
                <p style={styles.incidentLocation}>
                  📍 {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
                </p>
                <p style={styles.incidentTime}>
                  {new Date(incident.created_at).toLocaleString()}
                </p>
                <div style={styles.incidentActions}>
                  {incident.state === EMERGENCY_STATES.TRIGGERED && (
                    <button 
                      style={styles.acknowledgeBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        acknowledgeIncident(incident.id);
                      }}
                    >
                      Acknowledge
                    </button>
                  )}
                  {incident.state === EMERGENCY_STATES.ACKNOWLEDGED && (
                    <button 
                      style={styles.escalateBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        escalateIncident(incident.id);
                      }}
                    >
                      Escalate to 911
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.detailsPanel}>
          {selectedIncident ? (
            <div style={styles.detailsCard}>
              <h3 style={styles.detailsTitle}>Incident Details</h3>
              <div style={styles.detailRow}>
                <strong>ID:</strong> {selectedIncident.id}
              </div>
              <div style={styles.detailRow}>
                <strong>Worker:</strong> {selectedIncident.worker_id}
              </div>
              <div style={styles.detailRow}>
                <strong>Trigger:</strong> {selectedIncident.trigger_type}
              </div>
              <div style={styles.detailRow}>
                <strong>Location:</strong> {selectedIncident.lat}, {selectedIncident.lng}
              </div>
              {selectedIncident.accuracy && (
                <div style={styles.detailRow}>
                  <strong>Accuracy:</strong> ±{selectedIncident.accuracy}m
                </div>
              )}
              {selectedIncident.customer_name && (
                <div style={styles.detailRow}>
                  <strong>Customer:</strong> {selectedIncident.customer_name}
                </div>
              )}
              {selectedIncident.notes && (
                <div style={styles.detailRow}>
                  <strong>Notes:</strong> {selectedIncident.notes}
                </div>
              )}
              <div style={styles.detailRow}>
                <strong>Created:</strong> {new Date(selectedIncident.created_at).toLocaleString()}
              </div>
              <div style={styles.detailRow}>
                <strong>Acknowledged:</strong> {
                  selectedIncident.acknowledged_at 
                    ? new Date(selectedIncident.acknowledged_at).toLocaleString()
                    : 'Pending'
                }
              </div>
              
              <div style={styles.detailsActions}>
                {selectedIncident.state === EMERGENCY_STATES.TRIGGERED && (
                  <>
                    <button 
                      style={styles.acknowledgeBtn}
                      onClick={() => acknowledgeIncident(selectedIncident.id)}
                    >
                      Acknowledge
                    </button>
                    <button 
                      style={styles.escalateBtn}
                      onClick={() => escalateIncident(selectedIncident.id)}
                    >
                      Escalate
                    </button>
                  </>
                )}
                {selectedIncident.state === EMERGENCY_STATES.ACKNOWLEDGED && (
                  <>
                    <button 
                      style={styles.escalateBtn}
                      onClick={() => escalateIncident(selectedIncident.id)}
                    >
                      Escalate to 911
                    </button>
                    <button 
                      style={styles.resolveBtn}
                      onClick={() => resolveIncident(selectedIncident.id)}
                    >
                      Resolve
                    </button>
                  </>
                )}
                {(selectedIncident.state === EMERGENCY_STATES.TRIGGERED || 
                  selectedIncident.state === EMERGENCY_STATES.ACKNOWLEDGED) && (
                  <button 
                    style={styles.abortBtn}
                    onClick={() => abortIncident(selectedIncident.id)}
                  >
                    Mark False Alarm
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p style={styles.emptyText}>Select an incident to view details</p>
          )}
        </div>
      </div>

      <div style={styles.recentSection}>
        <h2 style={styles.sectionTitle}>Recent Resolved Incidents</h2>
        <div style={styles.recentList}>
          {recentIncidents.map(incident => (
            <div key={incident.id} style={styles.recentCard}>
              <span style={styles.incidentId}>#{incident.id.slice(0, 8)}</span>
              <span style={{
                ...styles.stateBadge,
                background: STATE_COLORS[incident.state]
              }}>
                {incident.state}
              </span>
              <span style={styles.recentTime}>
                {new Date(incident.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    background: '#0f0f1e',
    minHeight: '100vh',
    color: '#fff'
  },
  header: {
    marginBottom: '20px'
  },
  title: {
    fontSize: '28px',
    margin: 0
  },
  subtitle: {
    color: '#888',
    marginTop: '5px'
  },
  loadingText: {
    textAlign: 'center',
    color: '#888'
  },
  statsRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px'
  },
  statCard: {
    flex: 1,
    background: '#1a1a2e',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center'
  },
  statNumber: {
    display: 'block',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ff4757'
  },
  statLabel: {
    color: '#888',
    fontSize: '14px'
  },
  content: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px'
  },
  incidentsList: {
    flex: 2
  },
  detailsPanel: {
    flex: 1
  },
  sectionTitle: {
    fontSize: '20px',
    marginBottom: '15px'
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    padding: '20px'
  },
  incidentCard: {
    background: '#1a1a2e',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '10px',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'border-color 0.2s'
  },
  incidentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  incidentId: {
    fontWeight: 'bold',
    color: '#ff4757'
  },
  stateBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  incidentInfo: {
    color: '#aaa',
    margin: '5px 0',
    fontSize: '14px'
  },
  incidentLocation: {
    color: '#666',
    fontSize: '13px',
    margin: '5px 0'
  },
  incidentTime: {
    color: '#555',
    fontSize: '12px',
    margin: '5px 0'
  },
  incidentActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  acknowledgeBtn: {
    background: '#f39c12',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  escalateBtn: {
    background: '#9b59b6',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  resolveBtn: {
    background: '#2ecc71',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  abortBtn: {
    background: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  detailsCard: {
    background: '#1a1a2e',
    padding: '20px',
    borderRadius: '12px',
    position: 'sticky',
    top: '20px'
  },
  detailsTitle: {
    margin: '0 0 15px 0',
    fontSize: '18px'
  },
  detailRow: {
    marginBottom: '10px',
    fontSize: '14px'
  },
  detailsActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px'
  },
  recentSection: {
    marginTop: '20px'
  },
  recentList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  recentCard: {
    background: '#1a1a2e',
    padding: '10px 15px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  recentTime: {
    color: '#666',
    fontSize: '12px'
  }
};
