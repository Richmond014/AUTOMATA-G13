import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import QuizBotDetector from './components/QuizBotDetector';
import ResultScreen from './components/ResultScreen';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'quiz', 'results'
  const [quizResults, setQuizResults] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);

  const handleStartQuiz = () => {
    setCurrentPage('quiz');
    setQuizStartTime(Date.now());
  };

  const handleQuizComplete = (analysis) => {
    setQuizResults(analysis);
    setCurrentPage('results');
  };

  const handleQuizAgain = () => {
    setQuizResults(null);
    setQuizStartTime(Date.now());
    setCurrentPage('quiz');
  };

  const handleGoHome = () => {
    setQuizResults(null);
    setQuizStartTime(null);
    setCurrentPage('landing');
  };

  return (
    <div className="App">
      {currentPage === 'landing' && (
        <LandingPage onStartQuiz={handleStartQuiz} />
      )}
      
      {currentPage === 'quiz' && (
        <QuizBotDetector 
          onComplete={handleQuizComplete}
          startTime={quizStartTime}
        />
      )}
      
      {currentPage === 'results' && quizResults && (
        <ResultScreen 
          analysis={quizResults}
          startTime={quizStartTime}
          onQuizAgain={handleQuizAgain}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  );
}

export default App;