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
    let lastScrollTime = 0;

    // Mouse movement tracking
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

    // Scroll tracking - NO coordinates at all, only scroll position
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime > 200) {
        // Only record scrollY, no x or y coordinates
        recordEvent('S', { scrollY: window.scrollY });
        lastScrollTime = now;
      }
    };

    // Tab switching tracking
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordEvent('T'); // Tab switched away
      } else {
        recordEvent('R'); // Tab returned
      }
    };

    // Register all event listeners
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Hover tracking helper (to be called from components)
  const recordHover = (elementName, event) => {
    const metadata = { element: elementName };
    
    if (event && quizAreaRef.current) {
      const rect = quizAreaRef.current.getBoundingClientRect();
      metadata.x = event.clientX - rect.left;
      metadata.y = event.clientY - rect.top;
    }
    
    recordEvent('H', metadata);
  };

  return { events, quizAreaRef, recordEvent, recordHover };
};