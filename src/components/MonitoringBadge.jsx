// src/components/quiz/MonitoringBadge.jsx
import React from 'react';

export const MonitoringBadge = () => {
  return (
    <div style={styles.monitoringSection}>
      <div style={styles.monitoringBadge}>
        <div style={styles.pulseDot} />
        <span style={styles.monitoringText}>Monitoring Active</span>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  monitoringSection: {
    position: 'sticky',
    top: '0',
    zIndex: 100,
    background: '#f5f5f5',
    padding: '1rem 0',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '1rem'
  },
  monitoringBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '2rem',
    border: '2px solid rgba(239, 68, 68, 0.3)'
  },
  pulseDot: {
    width: '10px',
    height: '10px',
    background: '#EF4444',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  },
  monitoringText: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#EF4444'
  }
};