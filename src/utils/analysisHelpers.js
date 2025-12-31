// src/utils/analysisHelpers.js
// Analysis and calculation functions - IMPROVED & FAIR

export const calculateCV = (intervals) => {
  if (intervals.length < 2) return 0;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  return mean === 0 ? 0 : stdDev / mean;
};

// FIX #4: Focus on meaningful actions, not mouse spam
export const calculateRepetition = (eventTypes) => {
  // Filter out mouse movements - they naturally cluster
  const meaningfulEvents = eventTypes.filter(t => 
    t === 'C' || t === 'H' || t === 'S' || t === 'T' || t === 'R'
  );
  
  if (meaningfulEvents.length < 12) return 0;
  
  const blockSize = 4;
  const blocks = [];
  
  for (let i = 0; i <= meaningfulEvents.length - blockSize; i += blockSize) {
    blocks.push(meaningfulEvents.slice(i, i + blockSize).join(''));
  }
  
  if (blocks.length < 3) return 0;
  
  const firstBlock = blocks[0];
  let matches = 0;
  
  blocks.forEach(block => {
    let similarity = 0;
    for (let i = 0; i < Math.min(block.length, firstBlock.length); i++) {
      if (block[i] === firstBlock[i]) similarity++;
    }
    if (similarity / blockSize >= 0.8) matches++;
  });
  
  return matches / blocks.length;
};

export const calculateEntropy = (eventTypes) => {
  const freq = {};
  eventTypes.forEach(t => freq[t] = (freq[t] || 0) + 1);
  let entropy = 0;
  const total = eventTypes.length;
  Object.values(freq).forEach(c => {
    const p = c / total;
    if (p > 0) entropy -= p * Math.log2(p);
  });
  return entropy;
};

//Focus on meaningful events, ignore mouse spam
export const calculateCompression = (eventTypes) => {
  // Only analyze clicks, hovers, scrolls - ignore mouse movements
  const meaningfulEvents = eventTypes.filter(t => 
    t === 'C' || t === 'H' || t === 'S'
  );
  
  if (meaningfulEvents.length < 4) return 1.0; // Not enough data, assume normal
  
  const original = meaningfulEvents.join('');
  const compressed = original.split('').reduce((acc, char, i, arr) => {
    if (i === 0 || char !== arr[i - 1]) acc += char;
    return acc;
  }, '');
  
  return compressed.length / original.length;
};

//Partition events into 5-second windows
export const partitionIntoWindows = (events, windowSizeMs = 5000) => {
  if (events.length === 0) return [];
  
  const windows = [];
  const startTime = events[0].timestamp;
  let currentWindow = [];
  let currentWindowStart = startTime;
  
  events.forEach(event => {
    const timeInCurrentWindow = event.timestamp - currentWindowStart;
    
    if (timeInCurrentWindow >= windowSizeMs) {
      // Save current window and start new one
      if (currentWindow.length > 0) {
        windows.push({
          startTime: currentWindowStart,
          endTime: currentWindowStart + windowSizeMs,
          events: currentWindow
        });
      }
      currentWindow = [event];
      currentWindowStart = Math.floor(event.timestamp / windowSizeMs) * windowSizeMs;
    } else {
      currentWindow.push(event);
    }
  });
  
  // Add last window
  if (currentWindow.length > 0) {
    windows.push({
      startTime: currentWindowStart,
      endTime: currentWindowStart + windowSizeMs,
      events: currentWindow
    });
  }
  
  return windows;
};

//Analyze single window and return flags
export const analyzeWindow = (windowEvents) => {
  const clickEvents = windowEvents.filter(e => e.type === "C");
  
  // Need at least 2 clicks for timing analysis
  if (clickEvents.length < 2) {
    return {
      hasEnoughData: false,
      T: 'n', // n = not enough data
      R: 'n',
      E: 'n',
      C: 'n'
    };
  }
  
  // Calculate intervals for this window
  const intervals = [];
  for (let i = 1; i < clickEvents.length; i++) {
    intervals.push(clickEvents[i].timestamp - clickEvents[i - 1].timestamp);
  }
  
  const eventTypes = windowEvents.map(e => e.type);
  const cv = calculateCV(intervals);
  const repetition = calculateRepetition(eventTypes);
  const entropy = calculateEntropy(eventTypes);
  const compression = calculateCompression(eventTypes);
  
  //Return symbolic flags: s=suspicious, c=caution, h=human, n=not enough data
  return {
    hasEnoughData: true,
    T: cv < 0.08 ? 's' : (cv < 0.20 ? 'c' : 'h'),
    R: repetition >= 0.75 ? 's' : (repetition >= 0.60 ? 'c' : 'h'),
    E: entropy < 1.2 ? 's' : (entropy < 1.8 ? 'c' : 'h'),
    C: compression <= 0.50 ? 's' : (compression <= 0.75 ? 'c' : 'h'),
    values: { cv, repetition, entropy, compression }
  };
};

export const analyzeQuizBehavior = (score, events, questions, startTimeValue) => {
  //Check for minimum CLICK events, not just total events
  const clickEvents = events.filter(e => e.type === "C");
  
  if (clickEvents.length < 3) {
    return {
      error: "Not enough timing data to analyze behavior",
      message: "Please complete at least 3 questions for behavior analysis",
      score,
      totalQuestions: questions.length,
      clicks: clickEvents.length,
      totalEvents: events.length
    };
  }

  // Partition into 5-second windows and analyze each
  const windows = partitionIntoWindows(events, 5000);
  const windowAnalyses = windows.map(window => ({
    window: {
      start: ((window.startTime - events[0].timestamp) / 1000).toFixed(1),
      end: ((window.endTime - events[0].timestamp) / 1000).toFixed(1)
    },
    eventCount: window.events.length,
    analysis: analyzeWindow(window.events)
  }));
  
  // Count total flags across all windows (DFA state accumulation)
  let totalSuspicious = 0;
  let totalCaution = 0;
  let totalHuman = 0;
  let validWindows = 0;
  
  windowAnalyses.forEach(wa => {
    if (wa.analysis.hasEnoughData) {
      validWindows++;
      ['T', 'R', 'E', 'C'].forEach(metric => {
        if (wa.analysis[metric] === 's') totalSuspicious++;
        else if (wa.analysis[metric] === 'c') totalCaution++;
        else if (wa.analysis[metric] === 'h') totalHuman++;
      });
    }
  });

  // Calculate overall metrics (for backward compatibility)
  const intervals = [];
  for (let i = 1; i < clickEvents.length; i++) {
    intervals.push(clickEvents[i].timestamp - clickEvents[i - 1].timestamp);
  }

  const eventTypes = events.map(e => e.type);
  const cv = calculateCV(intervals);
  const repetition = calculateRepetition(eventTypes);
  const entropy = calculateEntropy(eventTypes);
  const compression = calculateCompression(eventTypes);

  // Overall flags
  const timingFlag = cv < 0.08 ? 1 : (cv < 0.20 ? 0.5 : 0);
  const repetitionFlag = repetition >= 0.75 ? 1 : (repetition >= 0.60 ? 0.5 : 0);
  const entropyFlag = entropy < 1.2 ? 1 : (entropy < 1.8 ? 0.5 : 0);
  const compressionFlag = compression <= 0.50 ? 1 : (compression <= 0.75 ? 0.5 : 0);
  const flagSum = timingFlag + repetitionFlag + entropyFlag + compressionFlag;

  // DFA State Machine: Determine final state based on window analyses
  const suspiciousRatio = validWindows > 0 ? totalSuspicious / (validWindows * 4) : 0;
  const cautionRatio = validWindows > 0 ? totalCaution / (validWindows * 4) : 0;
  
  // Calculate total time and average time per question
  const totalTimeMs = Date.now() - startTimeValue;
  const totalTimeSec = (totalTimeMs / 1000).toFixed(0);
  const avgTimePerQuestion = totalTimeMs / questions.length / 1000;
  
  const tooFast = avgTimePerQuestion < 2;
  const perfectScore = score === questions.length;
  const suspiciousCombo = tooFast && perfectScore;

  // DFA Classification (enhanced with windowed analysis)
  let classification, color, suspicionLevel, dfaState;
  
  // q_bot: High suspicion across multiple windows
  if (suspiciousRatio >= 0.50 || flagSum >= 3 || suspiciousCombo) {
    classification = "HIGH SUSPICION - Likely Automated";
    color = "#ef4444";
    suspicionLevel = "HIGH";
    dfaState = "q_bot";
  } 
  // q_suspicious: Moderate flags or mix of suspicious/caution
  else if (suspiciousRatio >= 0.25 || (suspiciousRatio + cautionRatio) >= 0.50 || flagSum >= 2) {
    classification = "MODERATE SUSPICION - Review Needed";
    color = "#fb923c";
    suspicionLevel = "MODERATE";
    dfaState = "q_suspicious";
  }
  // q_caution: Some irregularities but mostly normal
  else if (cautionRatio >= 0.25 || flagSum >= 1) {
    classification = "LOW SUSPICION - Minor Irregularities";
    color = "#fbbf24";
    suspicionLevel = "LOW";
    dfaState = "q_caution";
  }
  // q_human: Normal behavior
  else {
    classification = "NO SUSPICION - Normal Human Behavior";
    color = "#22c55e";
    suspicionLevel = "NONE";
    dfaState = "q_human";
  }

  return {
    score,
    totalQuestions: questions.length,
    cv: cv.toFixed(3),
    repetition: (repetition * 100).toFixed(1),
    entropy: entropy.toFixed(2),
    compression: compression.toFixed(2),
    flagSum: flagSum.toFixed(1),
    classification,
    color,
    suspicionLevel,
    dfaState,
    totalEvents: events.length,
    totalTime: totalTimeSec,
    avgTimePerQuestion: avgTimePerQuestion.toFixed(1),
    mouseMovements: events.filter(e => e.type === "M").length,
    clicks: clickEvents.length,
    hovers: events.filter(e => e.type === "H").length,
    scrolls: events.filter(e => e.type === "S").length,
    tabSwitches: events.filter(e => e.type === "T" || e.type === "R").length,
    submits: events.filter(e => e.type === "SUBMIT").length,
    clears: events.filter(e => e.type === "CLEAR").length,
    timingFlag,
    repetitionFlag,
    entropyFlag,
    compressionFlag,
    // NEW: Windowed analysis data
    windows: windowAnalyses,
    windowStats: {
      totalWindows: windows.length,
      validWindows,
      suspiciousRatio: (suspiciousRatio * 100).toFixed(1),
      cautionRatio: (cautionRatio * 100).toFixed(1),
      humanRatio: ((1 - suspiciousRatio - cautionRatio) * 100).toFixed(1)
    }
  };
};