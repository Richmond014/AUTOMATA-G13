// src/components/quiz/BehaviorInfo.jsx
import React from 'react';
import { Activity } from 'lucide-react';

export const BehaviorInfo = ({ events }) => {
  return (
    <div style={styles.infoBox}>
      <Activity size={16} style={{ color: '#4F46E5', marginTop: '2px', flexShrink: 0 }} />
      <p style={styles.infoText}>
        Your behavior is being analyzed: click timing ({events.filter(e => e.type === 'C').length} clicks),
        mouse movements ({events.filter(e => e.type === 'M').length} moves), and interaction patterns.
      </p>
    </div>
  );
};

const styles = {
  infoBox: {
    position: 'sticky',
    top: '80px',
    zIndex: 99,
    background: '#f5f5f5',
    borderRadius: '0.75rem',
    padding: '1rem',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    border: '2px solid #4F46E5',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
  },
  infoText: {
    fontSize: '0.875rem',
    color: '#4F46E5',
    margin: 0,
    lineHeight: 1.5
  }
};