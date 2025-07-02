import React, { useState, useEffect } from 'react';
import './DoctorHealthDashboard.css';

const DoctorHealthDashboard = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch health data from backend
  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/doctor/health');
      if (!response.ok) throw new Error('Failed to fetch health data');
      
      const data = await response.json();
      setHealthData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'HEALTHY': return '#00ff88';
      case 'DEGRADED': return '#ffa500';
      case 'CRITICAL': return '#ff4444';
      case 'DOWN': return '#ff0000';
      case 'ERROR': return '#ff6666';
      default: return '#888888';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'HEALTHY': return '✅';
      case 'DEGRADED': return '⚠️';
      case 'CRITICAL': return '🚨';
      case 'DOWN': return '❌';
      case 'ERROR': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="doctor-dashboard loading">
        <div className="loading-spinner">🏥</div>
        <p>Loading Doctor Agent Status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-dashboard error">
        <h2>🚨 Doctor Agent Communication Error</h2>
        <p>Error: {error}</p>
        <button onClick={fetchHealthData} className="retry-button">
          🔄 Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      <div className="doctor-header">
        <h1>🏥 Doctor Agent 24/7 Health Monitor</h1>
        <div className="doctor-status">
          <span className="status-indicator" style={{ color: getStatusColor(healthData?.overall_status) }}>
            {getStatusIcon(healthData?.overall_status)} {healthData?.overall_status || 'UNKNOWN'}
          </span>
          <div className="last-update">
            Last Update: {lastUpdate?.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Overall System Vitals */}
      <div className="vitals-section">
        <h2>🫀 System Vital Signs</h2>
        <div className="vitals-grid">
          <div className="vital-card">
            <div className="vital-label">CPU Usage</div>
            <div className="vital-value">{healthData?.vital_signs?.cpu_percent?.toFixed(1) || '---'}%</div>
            <div className="vital-bar">
              <div 
                className="vital-fill cpu" 
                style={{ width: `${healthData?.vital_signs?.cpu_percent || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="vital-card">
            <div className="vital-label">Memory Usage</div>
            <div className="vital-value">{healthData?.vital_signs?.memory_percent?.toFixed(1) || '---'}%</div>
            <div className="vital-bar">
              <div 
                className="vital-fill memory" 
                style={{ width: `${healthData?.vital_signs?.memory_percent || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="vital-card">
            <div className="vital-label">Disk Usage</div>
            <div className="vital-value">{healthData?.vital_signs?.disk_percent?.toFixed(1) || '---'}%</div>
            <div className="vital-bar">
              <div 
                className="vital-fill disk" 
                style={{ width: `${healthData?.vital_signs?.disk_percent || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="vital-card">
            <div className="vital-label">Uptime</div>
            <div className="vital-value">{healthData?.uptime_hours?.toFixed(1) || '---'}h</div>
            <div className="vital-info">Doctor Agent Running</div>
          </div>
        </div>
      </div>

      {/* Component Health Status */}
      <div className="components-section">
        <h2>🔧 System Components Health</h2>
        <div className="components-grid">
          <div className="component-card">
            <div className="component-header">
              <span className="component-icon">🖥️</span>
              <span className="component-name">Backend (Flask)</span>
              <span 
                className="component-status" 
                style={{ color: getStatusColor(healthData?.component_status?.backend) }}
              >
                {getStatusIcon(healthData?.component_status?.backend)} {healthData?.component_status?.backend}
              </span>
            </div>
          </div>
          
          <div className="component-card">
            <div className="component-header">
              <span className="component-icon">⚛️</span>
              <span className="component-name">Frontend (React)</span>
              <span 
                className="component-status" 
                style={{ color: getStatusColor(healthData?.component_status?.frontend) }}
              >
                {getStatusIcon(healthData?.component_status?.frontend)} {healthData?.component_status?.frontend}
              </span>
            </div>
          </div>
          
          <div className="component-card">
            <div className="component-header">
              <span className="component-icon">🗄️</span>
              <span className="component-name">Databases</span>
              <span 
                className="component-status" 
                style={{ color: getStatusColor(healthData?.component_status?.database) }}
              >
                {getStatusIcon(healthData?.component_status?.database)} {healthData?.component_status?.database}
              </span>
            </div>
          </div>
          
          <div className="component-card">
            <div className="component-header">
              <span className="component-icon">🌐</span>
              <span className="component-name">External APIs</span>
              <span 
                className="component-status" 
                style={{ color: getStatusColor(healthData?.component_status?.apis) }}
              >
                {getStatusIcon(healthData?.component_status?.apis)} {healthData?.component_status?.apis}
              </span>
            </div>
          </div>
          
          <div className="component-card">
            <div className="component-header">
              <span className="component-icon">🔐</span>
              <span className="component-name">Security</span>
              <span 
                className="component-status" 
                style={{ color: getStatusColor(healthData?.component_status?.security) }}
              >
                {getStatusIcon(healthData?.component_status?.security)} {healthData?.component_status?.security}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="alerts-section">
        <h2>🚨 Recent Alerts</h2>
        <div className="alerts-summary">
          <div className="alert-stat">
            <span className="alert-count">{healthData?.alerts_in_last_hour || 0}</span>
            <span className="alert-label">Alerts in Last Hour</span>
          </div>
          <div className="alert-stat">
            <span className="alert-count">{healthData?.learned_issues_count || 0}</span>
            <span className="alert-label">Known Issues</span>
          </div>
          <div className="alert-stat">
            <span className="alert-count">{healthData?.treatment_protocols_count || 0}</span>
            <span className="alert-label">Treatment Protocols</span>
          </div>
        </div>
      </div>

      {/* Doctor Actions */}
      <div className="actions-section">
        <h2>🩺 Doctor Actions</h2>
        <div className="actions-grid">
          <button className="action-button" onClick={() => window.open('/doctor-logs', '_blank')}>
            📊 View Detailed Logs
          </button>
          <button className="action-button" onClick={() => window.open('/doctor-reports', '_blank')}>
            📋 View Medical Reports
          </button>
          <button className="action-button emergency" onClick={() => alert('Emergency restart initiated!')}>
            🚨 Emergency System Restart
          </button>
          <button className="action-button" onClick={fetchHealthData}>
            🔄 Refresh Health Data
          </button>
        </div>
      </div>

      {/* Doctor Status Footer */}
      <div className="doctor-footer">
        <div className="doctor-info">
          <span>🏥 Doctor Agent Status: </span>
          <span className="status-badge" style={{ backgroundColor: getStatusColor(healthData?.overall_status) }}>
            ACTIVE & MONITORING
          </span>
        </div>
        <div className="protection-level">
          <span>🛡️ Protection Level: </span>
          <span className="protection-badge">MAXIMUM SECURITY</span>
        </div>
      </div>
    </div>
  );
};

export default DoctorHealthDashboard;