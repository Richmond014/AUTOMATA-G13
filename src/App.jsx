import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import QuizBotDetector from './components/QuizBotDetector';
import ResultScreen from './components/ResultScreen';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'quiz', 'results'
  const [quizResults, setQuizResults] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [savedEvents, setSavedEvents] = useState([]); // ← Add this to save events

  const handleStartQuiz = () => {
    setCurrentPage('quiz');
    setQuizStartTime(Date.now());
  };

  const handleQuizComplete = (analysis, events) => { // ← Accept events parameter
    setQuizResults(analysis);
    setSavedEvents(events); // ← Save the events
    setCurrentPage('results');
  };

  const handleQuizAgain = () => {
    setQuizResults(null);
    setSavedEvents([]); // ← Clear events
    setQuizStartTime(Date.now());
    setCurrentPage('quiz');
  };

  const handleGoHome = () => {
    setQuizResults(null);
    setSavedEvents([]); // ← Clear events
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
          events={savedEvents} // ← Pass the saved events
        />
      )}
    </div>
  );
}

export default App;