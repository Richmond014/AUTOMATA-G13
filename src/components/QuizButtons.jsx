// src/components/quiz/QuizButtons.jsx
import React from 'react';

export const QuizButtons = ({ onSubmit, onClear }) => {
  return (
    <div style={styles.buttonContainer}>
      <button
        style={{ ...styles.button, ...styles.submitButton }}
        onClick={onSubmit}
        onMouseEnter={(e) => {
          e.target.style.background = '#4338CA';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#4F46E5';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }}
      >
        Submit Quiz
      </button>
      <button
        style={{ ...styles.button, ...styles.clearButton }}
        onClick={onClear}
        onMouseEnter={(e) => {
          e.target.style.background = '#EEF2FF';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'white';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }}
      >
        Clear Form
      </button>
    </div>
  );
};

const styles = {
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    marginTop: '3rem',
    justifyContent: 'center'
  },
  button: {
    padding: '1rem 3rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  submitButton: {
    background: '#4F46E5',
    color: 'white'
  },
  clearButton: {
    background: 'white',
    color: '#4F46E5',
    border: '2px solid #4F46E5'
  }
};