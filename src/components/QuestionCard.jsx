// src/components/quiz/QuestionCard.jsx
import React from 'react';

export const QuestionCard = ({ question, index, selectedAnswer, warning, onAnswerChange, onHover }) => {
  return (
    <div 
      id={`question-${index}`} 
      style={styles.questionCard}
      onMouseEnter={(e) => onHover && onHover('question-card', e)}  // ✅ Pass event
    >
      <h3 style={styles.questionTitle}>
        {index + 1}. {question.question}
      </h3>
      {warning && (
        <p style={styles.warningText}>⚠ Please answer this question</p>
      )}
      <div style={styles.optionsContainer}>
        {question.options.map(option => {
          const isSelected = selectedAnswer === option.value;
          return (
            <label
              key={option.value}
              style={{
                ...styles.optionLabel,
                ...(isSelected ? styles.optionLabelSelected : {})
              }}
              onMouseEnter={(e) => {
                onHover && onHover('option', e);  // ✅ Pass event
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={isSelected}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
                style={{ display: 'none' }}
              />
              <div style={{
                ...styles.radioOuter,
                ...(isSelected ? styles.radioOuterSelected : {})
              }}>
                {isSelected && <div style={styles.radioInner} />}
              </div>
              <span style={styles.optionText}>{option.text}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  questionCard: {
    background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
    borderRadius: '1rem',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  questionTitle: {
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1.5rem'
  },
  warningText: {
    color: '#FCD34D',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  optionLabel: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1rem 1.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '2px solid transparent'
  },
  optionLabelSelected: {
    background: '#EEF2FF',
    borderColor: '#6366F1'
  },
   radioOuter: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #D1D5DB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s',
    backgroundColor: 'white', // Ensure white background
    boxSizing: 'border-box' // Ensure border is included in dimensions
  },
  radioOuterSelected: {
    border: '2px solid #6366F1', // Explicitly set border instead of just borderColor
    backgroundColor: 'white' // Keep white background when selected
  },
  radioInner: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#6366F1'
  },
  optionText: {
    color: '#1F2937',
    fontSize: '1rem',
    margin: 0
  }
};