// src/utils/analysisHelpers.js
// Analysis and calculation functions - IMPROVED & FAIR

const uniqueCount = (arr) => new Set(arr).size;

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

  // If the meaningful sequence contains only one unique symbol (e.g., only clicks),
  // repetition is not informative for bot detection in a quiz context.
  if (uniqueCount(meaningfulEvents) < 2) return 0;
  
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
  if (total === 0) return 0;
  Object.values(freq).forEach(c => {
    const p = c / total;
    if (p > 0) entropy -= p * Math.log2(p);
  });
  return entropy;
};

// Normalized entropy: H_norm = H / log2(k)
// This makes entropy comparable across sessions by scaling by the maximum possible
// entropy of a k-symbol alphabet. For this app, we use k=8 corresponding to the
// primary event symbols: M, C, H, S, T, R, SUBMIT, CLEAR.
const DEFAULT_ENTROPY_ALPHABET_SIZE = 8;

export const calculateNormalizedEntropy = (
  eventTypes,
  alphabetSize = DEFAULT_ENTROPY_ALPHABET_SIZE
) => {
  const H = calculateEntropy(eventTypes);
  const k = Math.max(1, alphabetSize);
  if (k <= 1) return 0;

  const Hmax = Math.log2(k);
  if (Hmax === 0) return 0;

  const Hnorm = H / Hmax;
  return Math.max(0, Math.min(1, Hnorm));
};

// FIX #3: Focus on meaningful events, ignore mouse spam
export const calculateCompression = (eventTypes) => {
  // Only analyze clicks, hovers, scrolls - ignore mouse movements
  const meaningfulEvents = eventTypes.filter(t => 
    t === 'C' || t === 'H' || t === 'S'
  );
  
  if (meaningfulEvents.length < 4) return 1.0; // Not enough data, assume normal

  // If the sequence is effectively one-symbol (e.g., all clicks), compressibility is expected
  // and not a reliable automation signal for a quiz.
  if (uniqueCount(meaningfulEvents) < 2) return 1.0;
  
  const original = meaningfulEvents.join('');
  const compressed = original.split('').reduce((acc, char, i, arr) => {
    if (i === 0 || char !== arr[i - 1]) acc += char;
    return acc;
  }, '');
  
  return compressed.length / original.length;
};

// NEW: Partition events into 5-second windows
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

// Analyze single window and return flags
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
  
  const eventTypes = windowEvents.map(e => e.type);
  const repetition = calculateRepetition(eventTypes);
  const entropy = calculateEntropy(eventTypes);
  const entropyNorm = calculateNormalizedEntropy(eventTypes);
  const compression = calculateCompression(eventTypes);

  // Timing CV requires at least 2 intervals (>= 3 clicks). With only 2 clicks,
  // CV collapses to 0 and incorrectly looks "perfectly regular".
  let cv = null;
  let Tflag = 'n';
  if (clickEvents.length >= 3) {
    const intervals = [];
    for (let i = 1; i < clickEvents.length; i++) {
      intervals.push(clickEvents[i].timestamp - clickEvents[i - 1].timestamp);
    }
    cv = calculateCV(intervals);
    Tflag = cv < 0.08 ? 's' : (cv < 0.20 ? 'c' : 'h');
  }

  // Entropy is only meaningful when there's some diversity in observed event symbols.
  const hasEntropyDiversity = uniqueCount(eventTypes) >= 2;
  
  // Return symbolic flags: s=suspicious, c=caution, h=human, n=not enough data
  return {
    hasEnoughData: true,
    T: Tflag,
    R: repetition >= 0.75 ? 's' : (repetition >= 0.60 ? 'c' : 'h'),
    // Use normalized entropy thresholds (mapped from previous raw thresholds)
    E: !hasEntropyDiversity ? 'n' : (entropyNorm < 0.40 ? 's' : (entropyNorm < 0.60 ? 'c' : 'h')),
    C: compression <= 0.50 ? 's' : (compression <= 0.75 ? 'c' : 'h'),
    values: { cv, repetition, entropy, entropyNorm, compression }
  };
};

export const analyzeQuizBehavior = (score, events, questions, startTimeValue) => {
  // FIX #2: Check for minimum CLICK events, not just total events
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

  //  Partition into 5-second windows and analyze each
  const windows = partitionIntoWindows(events, 5000);
  const windowAnalyses = windows.map((window, idx) => ({
    window: {
      start: (idx * 5).toFixed(1),  
      end: ((idx + 1) * 5).toFixed(1)  
    },
    eventCount: window.events.length,
    analysis: analyzeWindow(window.events)
  }));
  
  // Count total flags across all windows (DFA state accumulation)
  // Only count windows with enough data
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
        // 'n' (not enough data) is ignored
      });
    }
  });

  // If less than 2 valid windows, use overall metrics instead
  const useWindowedAnalysis = validWindows >= 2;

  // Calculate overall metrics (for backward compatibility)
  const intervals = [];
  for (let i = 1; i < clickEvents.length; i++) {
    intervals.push(clickEvents[i].timestamp - clickEvents[i - 1].timestamp);
  }

  const eventTypes = events.map(e => e.type);
  const cv = calculateCV(intervals);
  const repetition = calculateRepetition(eventTypes);
  const entropy = calculateEntropy(eventTypes);
  const entropyNorm = calculateNormalizedEntropy(eventTypes);
  const compression = calculateCompression(eventTypes);

  // Check for keyboard-only usage (suspicious for a quiz)
  const keyboardEvents = events.filter(e => e.type === 'TAB_NAV' || e.type === 'KEY_SELECT');
  const keyboardClicks = clickEvents.filter(e => e.metadata && e.metadata.method === 'keyboard');
  const totalClicks = clickEvents.length;
  const keyboardRatio = totalClicks > 0 ? keyboardClicks.length / totalClicks : 0;
  
  // Red flag: Using ONLY keyboard (bots often use keyboard automation)
  const keyboardOnlyFlag = totalClicks >= 5
    ? (keyboardRatio >= 0.90 ? 1 : (keyboardRatio >= 0.70 ? 0.5 : 0))
    : 0;

  // Overall flags (including keyboard usage)
  const timingFlag = cv < 0.08 ? 1 : (cv < 0.20 ? 0.5 : 0);
  const repetitionFlag = repetition >= 0.75 ? 1 : (repetition >= 0.60 ? 0.5 : 0);
  // Normalized entropy thresholds (mapped from previous raw thresholds)
  const entropyFlag = uniqueCount(eventTypes) < 2 ? 0 : (entropyNorm < 0.40 ? 1 : (entropyNorm < 0.60 ? 0.5 : 0));
  const compressionFlag = compression <= 0.50 ? 1 : (compression <= 0.75 ? 0.5 : 0);
  const flagSum = timingFlag + repetitionFlag + entropyFlag + compressionFlag + keyboardOnlyFlag;

  // DFA State Machine: Determine final state based on window analyses
  // Use windowed analysis if we have enough windows, otherwise fall back to overall metrics
  let suspiciousRatio, cautionRatio;
  
  if (useWindowedAnalysis && validWindows > 0) {
    suspiciousRatio = totalSuspicious / (validWindows * 4);
    cautionRatio = totalCaution / (validWindows * 4);
  } else {
    // Fallback: convert overall flags to ratios
    // flagSum includes 5 possible evidence sources (T/R/E/C + keyboard)
    suspiciousRatio = flagSum / 5;
    cautionRatio = 0;
  }
  
  // Calculate total time and average time per question
  const totalTimeMs = Date.now() - startTimeValue;
  const totalTimeSec = (totalTimeMs / 1000).toFixed(0);
  const avgTimePerQuestion = totalTimeMs / questions.length / 1000;
  
  // Stricter "too fast" threshold to avoid flagging legitimately fast humans
  const tooFast = avgTimePerQuestion < 1.0;
  const perfectScore = score === questions.length;
  const suspiciousCombo = tooFast && perfectScore;

  // DFA Classification (enhanced with windowed analysis)
  // NOTE: This project uses a strict 3-state DFA: q_human / q_caution / q_suspicious
  // UI requirement: Detection Result must show only Human / Caution / Suspicious,
  // and the description must not include sub-labels like "HIGH SUSPICION".
  let classification, color, suspicionLevel, dfaState;
  
  // More lenient thresholds for realistic human behavior
  // High suspicion maps to q_suspicious (no separate q_bot state)
  if (suspiciousRatio >= 0.65 || flagSum >= 3.5 || suspiciousCombo) {
    classification = "Behavior matches multiple automation-like patterns. Review recommended.";
    color = "#ef4444";
    suspicionLevel = "Suspicious";
    dfaState = "q_suspicious";
  } 
  // Moderate suspicion also maps to q_suspicious
  else if (suspiciousRatio >= 0.45 || (suspiciousRatio + cautionRatio) >= 0.70 || flagSum >= 2.5) {
    classification = "Some signals are unusual and may indicate automation. Review recommended.";
    color = "#fb923c";
    suspicionLevel = "Suspicious";
    dfaState = "q_suspicious";
  }
  // q_caution: Some irregularities (raised from 0.25 to 0.35)
  else if (cautionRatio >= 0.35 || flagSum >= 1.5) {
    classification = "Minor irregularities detected. Could be normal behavior or assisted input.";
    color = "#fbbf24";
    suspicionLevel = "Caution";
    dfaState = "q_caution";
  }
  // q_human: Normal behavior
  else {
    classification = "No strong automation signals detected.";
    color = "#22c55e";
    suspicionLevel = "Human";
    dfaState = "q_human";
  }

  return {
    score,
    totalQuestions: questions.length,
    cv: cv.toFixed(3),
    repetition: (repetition * 100).toFixed(1),
    entropy: entropy.toFixed(2),
    entropyNorm: entropyNorm.toFixed(2),
    compression: compression.toFixed(2),
    flagSum: flagSum.toFixed(1),
    flagMax: 5,
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
    keyboardNavigation: keyboardEvents.length,
    keyboardClicks: keyboardClicks.length,
    keyboardRatio: (keyboardRatio * 100).toFixed(1),
    timingFlag,
    repetitionFlag,
    entropyFlag,
    compressionFlag,
    keyboardOnlyFlag,
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

