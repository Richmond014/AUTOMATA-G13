// src/hooks/useBehaviorTracking.js
// Custom hook for behavior tracking

import { useState, useEffect, useRef } from 'react';

export const useBehaviorTracking = () => {
  const [events, setEvents] = useState([]);
  const quizAreaRef = useRef(null);

  const recordEvent = (type, metadata = {}) => {
    const timestamp = Date.now();
    const newEvent = { type, timestamp, ...metadata };
    setEvents(prev => [...prev, newEvent]);
  };

  useEffect(() => {
    let lastMoveTime = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastMoveTime > 100) {
        if (quizAreaRef.current) {
          const rect = quizAreaRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          recordEvent('M', { x, y });
          lastMoveTime = now;
        }
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return { events, quizAreaRef, recordEvent };
};