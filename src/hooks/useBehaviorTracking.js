// src/hooks/useBehaviorTracking.js
// Custom hook for behavior tracking - PREVENT INITIAL CLICK

import { useState, useEffect, useRef } from 'react';

export const useBehaviorTracking = () => {
  const [events, setEvents] = useState([]);
  const quizAreaRef = useRef(null);
  const isInitialized = useRef(false);

  const recordEvent = (type, metadata = {}) => {
    const timestamp = Date.now();
    const newEvent = { type, timestamp, ...metadata };
    setEvents(prev => [...prev, newEvent]);
  };

  useEffect(() => {
    // Wait a bit before starting to track (ignore initial navigation clicks)
    const initTimer = setTimeout(() => {
      isInitialized.current = true;
    }, 300); // 300ms delay

    let lastMoveTime = 0;
    let lastScrollTime = 0;
    let lastClickInfo = { time: 0, x: 0, y: 0 };

    // Mouse movement tracking
    const handleMouseMove = (e) => {
      if (!isInitialized.current) return; // Don't track until initialized
      
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


    // GLOBAL CLICK TRACKING
   
    const handleGlobalClick = (e) => {

      if (!isInitialized.current) return;
      
      const now = Date.now();
      
      if (quizAreaRef.current) {
        const rect = quizAreaRef.current.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        
      
        const timeDiff = now - lastClickInfo.time;
        const xDiff = Math.abs(x - lastClickInfo.x);
        const yDiff = Math.abs(y - lastClickInfo.y);
        
        if (timeDiff < 100 && xDiff < 5 && yDiff < 5) {
          return;
        }
        
        lastClickInfo = { time: now, x, y };
        
        const target = e.target;
        let clickType = 'general';
        let elementType = target.tagName.toLowerCase();
        let elementText = '';
        
   
        if (target.matches('input[type="radio"]')) {
          return;
        }
        
        // Identify what was clicked
        if (target.matches('button')) {
          clickType = 'button';
          elementText = target.textContent?.trim().substring(0, 20) || 'button';
        } else if (target.closest('label[data-question]')) {
          const label = target.closest('label[data-question]');
          clickType = 'answer';
          elementType = 'answer-option';
          elementText = label.getAttribute('data-answer') || '';
        } else if (target.matches('a')) {
          clickType = 'link';
          elementText = target.textContent?.trim().substring(0, 20) || 'link';
        } else {
          clickType = 'background';
        }
        
        // Record the click event
        recordEvent('C', { 
          x, 
          y, 
          clickType,
          element: elementType,
          text: elementText,
          targetId: target.id || null,
          className: typeof target.className === 'string' ? target.className : null
        });
      }
    };

    // Scroll tracking
    const handleScroll = () => {
      if (!isInitialized.current) return;
      
      const now = Date.now();
      if (now - lastScrollTime > 200) {
        recordEvent('S', { scrollY: window.scrollY });
        lastScrollTime = now;
      }
    };

    // Tab switching tracking
    const handleVisibilityChange = () => {
      if (!isInitialized.current) return;
      
      if (document.hidden) {
        recordEvent('T');
      } else {
        recordEvent('R');
      }
    };

    // Register all event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleGlobalClick, false);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearTimeout(initTimer);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleGlobalClick, false);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Hover tracking helper
  const recordHover = (elementName, event) => {
    if (!isInitialized.current) return;
    
    const metadata = { element: elementName };
    
    if (event && quizAreaRef.current) {
      const rect = quizAreaRef.current.getBoundingClientRect();
      metadata.x = event.clientX - rect.left;
      metadata.y = event.clientY - rect.top;
    }
    
    recordEvent('H', metadata);
  };


  const recordKeyboard = (action, metadata = {}) => {
    if (!isInitialized.current) return;
    
    recordEvent('K', { action, ...metadata });
  };

  return { 
    events, 
    quizAreaRef, 
    recordEvent, 
    recordHover,
    recordKeyboard 
  };
};