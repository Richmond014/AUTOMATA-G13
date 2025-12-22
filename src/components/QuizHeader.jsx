// src/components/quiz/QuizHeader.jsx
import React from 'react';

export const QuizHeader = () => {
  return (
    <>
      <h1 style={styles.title}>Computer Science Quiz</h1>
      <div style={styles.descriptionBox}>
        <p style={styles.descriptionText}>
          Test your knowledge of fundamental computer science concepts. This quiz covers topics including 
          data structures, algorithms, programming basics, and computer hardware.
        </p>
      </div>
    </>
  );
};

const styles = {
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center',
    marginBottom: '2rem'
  },
  descriptionBox: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  descriptionText: {
    fontSize: '1rem',
    color: '#4B5563',
    lineHeight: 1.6,
    margin: 0
  }
};