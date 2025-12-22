// src/components/quiz/QuizInstructions.jsx
import React from 'react';

export const QuizInstructions = () => {
  return (
    <div style={styles.instructionsBox}>
      <h2 style={styles.instructionsTitle}>Instructions:</h2>
      <ul style={styles.instructionsList}>
        <li>Read each question carefully before selecting your answer</li>
        <li>Select one answer per question</li>
        <li>You can change your answers before submitting</li>
        <li>Click "Submit Quiz" when you're done to see your results</li>
        <li>Your behavior is being monitored for academic integrity</li>
      </ul>
    </div>
  );
};

const styles = {
  instructionsBox: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  instructionsTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 0,
    marginBottom: '1rem'
  },
  instructionsList: {
    margin: 0,
    paddingLeft: '1.5rem',
    color: '#4B5563',
    lineHeight: 1.8
  }
};