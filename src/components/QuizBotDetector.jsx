// src/pages/QuizBotDetector.jsx
import { useState, useRef } from 'react';
import { QuizHeader } from '../components/QuizHeader';
import { QuizInstructions } from '../components/QuizInstructions';
import { MonitoringBadge } from '../components/MonitoringBadge';
import { BehaviorInfo } from '../components/BehaviorInfo';
import { QuestionCard } from '../components/QuestionCard';
import { QuizButtons } from '../components/QuizButtons';
import { useBehaviorTracking } from '../hooks/useBehaviorTracking';
import { analyzeQuizBehavior } from '../utils/AnalysisHelpers';
import { questions } from '../utils/quizData';

function QuizBotDetector({ onComplete, startTime: propStartTime }) {
  const [answers, setAnswers] = useState({});
  const [warnings, setWarnings] = useState({});
  const startTime = useRef(propStartTime || Date.now());
  
  const { events, quizAreaRef, recordEvent, recordHover, recordKeyboard } = useBehaviorTracking();

  const handleAnswerChange = (question, value) => {
    // ❌ REMOVE THIS - Global click listener already handles it!
    // Don't record here, the global click listener will catch it
    
    setAnswers(prev => ({ ...prev, [question]: value }));
    setWarnings(prev => ({ ...prev, [question]: false }));
  };

  const handleClear = () => {
    // Only record the CLEAR action, not the click itself
    recordEvent('CLEAR', { 
      previousAnswerCount: Object.keys(answers).length 
    });
    
    setAnswers({});
    setWarnings({});
  };

  const handleSubmit = () => {
    const unansweredQuestions = questions
      .map((q, i) => answers[q.id] === undefined ? i : null)
      .filter(i => i !== null);

    if (unansweredQuestions.length > 0) {
      const newWarnings = {};
      unansweredQuestions.forEach(i => newWarnings[questions[i].id] = true);
      setWarnings(newWarnings);

      const firstUnansweredEl = document.getElementById(`question-${unansweredQuestions[0]}`);
      if (firstUnansweredEl) {
        firstUnansweredEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Only record SUBMIT action, not the click itself
    recordEvent('SUBMIT', {
      answeredQuestions: Object.keys(answers).length,
      totalQuestions: questions.length
    });

    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct) score++;
    });

    const analysis = analyzeQuizBehavior(score, events, questions, startTime.current);
    if (onComplete) onComplete(analysis, events);
  };

  return (
    <div ref={quizAreaRef} style={styles.container}>
      <div style={styles.content}>
        <QuizHeader />
        <QuizInstructions />
        <MonitoringBadge />
        <BehaviorInfo events={events} />

        {questions.map((q, index) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={index}
            selectedAnswer={answers[q.id]}
            warning={warnings[q.id]}
            onAnswerChange={handleAnswerChange}
            onHover={recordHover}
            onKeyboard={recordKeyboard}
          />
        ))}

        <QuizButtons onSubmit={handleSubmit} onClear={handleClear} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
    padding: '0',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '3rem 2rem'
  }
};

export default QuizBotDetector;