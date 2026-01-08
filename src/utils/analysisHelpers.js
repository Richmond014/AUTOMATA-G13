
const uniqueCount = (arr) => new Set(arr).size;

// TURING MACHINE TRANSITION TABLE 
const TM_TRANSITIONS = {
  // q0 - (Start State/ Not Enough Data)  
  q0: { s: 'q5', c: 'q3', h: 'q1', n: 'q0' },
  
  // q1 - (Human) 
  q1: { s: 'q5', c: 'q3', h: 'q1', n: 'q2' },
  
  // q2 - (Human-Not enough data)  
  q2: { s: 'q5', c: 'q3', h: 'q1', n: 'q2' },
  
  // q3 - (Mild Evidence) (Human Label)
  q3: { s: 'q7', c: 'q5', h: 'q1', n: 'q4' },
  
  // q4 - (Mild Evidence-Not enough data) (Human Label)
  q4: { s: 'q7', c: 'q5', h: 'q1', n: 'q4' },
  
  // q5 - (Caution) 
  q5: { s: 'q9', c: 'q7', h: 'q3', n: 'q6' },
  
  // q6 - (Caution-Not enough data) 
  q6: { s: 'q9', c: 'q7', h: 'q3', n: 'q6' },
  
  // q7 - (Strong Evidence) 
  q7: { s: 'q9', c: 'q9', h: 'q5', n: 'q8' },
  
  // q8 - (Strong Evidence-Not enough data)
  q8: { s: 'q9', c: 'q9', h: 'q5', n: 'q8' },
  
  // q9 - (Suspicious) 
  q9: { s: 'q9', c: 'q9', h: 'q7', n: 'q10' },
  
  // q10 - (Suspicious-Not enough data) 
  q10: { s: 'q9', c: 'q9', h: 'q7', n: 'q10' }
};

// Map final TM state to simplified classification result
const STATE_TO_CLASSIFICATION = {
  q0: { suspicionLevel: 'Not Enough Data', color: '#9CA3AF' },
  q1: { suspicionLevel: 'Human', color: '#22c55e' },
  q2: { suspicionLevel: 'Human', color: '#22c55e' },
  q3: { suspicionLevel: 'Human', color: '#22c55e' },
  q4: { suspicionLevel: 'Human', color: '#22c55e' },
  q5: { suspicionLevel: 'Caution', color: '#fb923c' },
  q6: { suspicionLevel: 'Caution', color: '#fb923c' },
  q7: { suspicionLevel: 'Suspicious', color: '#ef4444' },
  q8: { suspicionLevel: 'Suspicious', color: '#ef4444' },
  q9: { suspicionLevel: 'Suspicious', color: '#ef4444' },
  q10: { suspicionLevel: 'Suspicious', color: '#ef4444' }
};

// This function convert 4 metric flags (Multi-pass) to single cell symbol using composition
const getCellSymbol = (flags) => {
  const counts = { s: 0, c: 0, h: 0, n: 0 };
  ['T', 'R', 'E', 'C'].forEach(metric => {
    if (flags[metric]) counts[flags[metric]]++;
  });
  
  // Decision logic based on flag composition
  if (counts.s >= 2) return 's';
  if (counts.s === 1 && counts.c >= 1) return 's';
  if (counts.c >= 2) return 'c';
  if (counts.c === 1 && counts.h >= 2) return 'h';
  if (counts.h >= 2) return 'h';
  return 'n';
};

// Function to get simplified classification message based on TM state
const getClassificationMessage = (state) => {
  const messages = {
    'q0': 'Not enough data to analyze behavior.',
    'q1': 'Interaction pattern looks natural and human-like.',
    'q2': 'Interaction pattern looks natural and human-like.',
    'q3': 'Interaction pattern looks natural and human-like.',
    'q4': 'Interaction pattern looks natural and human-like.',
    'q5': 'Some indicators suggest possible automated behavior.',
    'q6': 'Some indicators suggest possible automated behavior.',
    'q7': 'Strong indicators of automated interaction detected.',
    'q8': 'Strong indicators of automated interaction detected.',
    'q9': 'Strong indicators of automated interaction detected.',
    'q10': 'Strong indicators of automated interaction detected.'
  };
  return messages[state] || 'Unable to determine behavior pattern.';
};

// Run TM transition
const runTMStep = (currentState, symbol) => {
  return TM_TRANSITIONS[currentState]?.[symbol] ?? currentState;
};

// Timing CV (coefficient of variation) = T
export const calculateCV = (intervals) => {
  if (intervals.length < 2) return 0;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  return mean === 0 ? 0 : stdDev / mean;
};

// Repetition (pattern repetition) = R
export const calculateRepetition = (eventTypes) => {
  // Filter out mouse movements (Not included in calculation of R)
  const meaningfulEvents = eventTypes.filter(t => 
    t === 'C' || t === 'H' || t === 'S' || t === 'T' || t === 'R'
  );

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
  
  // Compare other blocks against the first block
  blocks.slice(1).forEach(block => {
    let similarity = 0;
    for (let i = 0; i < Math.min(block.length, firstBlock.length); i++) {
      if (block[i] === firstBlock[i]) similarity++;
    }
    if (similarity / blockSize >= 0.8) matches++;
  });
  
  const denom = Math.max(1, blocks.length - 1);
  return matches / denom;
};

// Shannon entropy
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

// Normalized entropy E
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

// Compression Ratio - C
export const calculateCompression = (eventTypes) => {
  // Only analyze clicks, hovers, scrolls
  const meaningfulEvents = eventTypes.filter(t => 
    t === 'C' || t === 'H' || t === 'S'
  );
  
  if (meaningfulEvents.length < 4) return 1.0;
  if (uniqueCount(meaningfulEvents) < 2) return 1.0;
  
  const original = meaningfulEvents.join('');
  const compressed = original.split('').reduce((acc, char, i, arr) => {
    if (i === 0 || char !== arr[i - 1]) acc += char;
    return acc;
  }, '');
  
  return compressed.length / original.length;
};

// This is where the events are grouped into time segments (5s) for analysis and outputted it to the tape 2(Output tape).
export const partitionIntoCells = (events, cellSizeMs = 5000) => {
  if (events.length === 0) return [];
  
  const cells = [];
  const startTime = events[0].timestamp;
  const endTime = events[events.length - 1].timestamp;
  
  const totalCells = Math.floor((endTime - startTime) / cellSizeMs) + 1;
  
  for (let i = 0; i < totalCells; i++) {
    const cellStart = startTime + (i * cellSizeMs);
    const cellEnd = cellStart + cellSizeMs;
    
    const cellEvents = events.filter(event => 
      event.timestamp >= cellStart && event.timestamp < cellEnd
    );
    
    if (cellEvents.length > 0) {
      cells.push({
        startTime: cellStart,
        endTime: cellEnd,
        events: cellEvents
      });
    }
  }
  
  return cells;
};

// Inaanalyse per cell for the 4 metric flags and the overall result of it. 
export const analyzeCell = (cellEvents) => {
  const clickEvents = cellEvents.filter(e => e.type === "C");

  if (clickEvents.length < 2) {
    const flags = {
      hasEnoughData: false,
      T: 'n', // n = not enough data
      R: 'n',
      E: 'n',
      C: 'n'
    };
    flags.cellSymbol = getCellSymbol(flags);
    return flags;
  }
  
  const eventTypes = cellEvents.map(e => e.type);

  const repetition = calculateRepetition(eventTypes);
  const entropyAlphabet = uniqueCount(eventTypes);
  const entropyNorm = calculateNormalizedEntropy(eventTypes, entropyAlphabet);
  const compression = calculateCompression(eventTypes);

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

  const entropyUnique = uniqueCount(eventTypes);
  const hasEntropyDiversity = entropyUnique >= 2;
  const hasEnoughEntropySamples = eventTypes.length >= 20;
  const entropyIsSuspiciousSingleType = hasEnoughEntropySamples && entropyUnique === 1;

  const repetitionTypes = eventTypes.filter(t =>
    t === 'C' || t === 'H' || t === 'S' || t === 'T' || t === 'R'
  );
  const compressionTypes = eventTypes.filter(t =>
    t === 'C' || t === 'H' || t === 'S'
  );
  
  const repetitionIsValid = repetitionTypes.length >= 12 && uniqueCount(repetitionTypes) >= 2;
  const compressionIsValid = compressionTypes.length >= 4;
  
  const flags = {
    hasEnoughData: true,
    T: Tflag,
    R: !repetitionIsValid ? 'n' : (repetition >= 0.75 ? 's' : (repetition >= 0.60 ? 'c' : 'h')),
    E: entropyIsSuspiciousSingleType
      ? 's'
      : (!hasEntropyDiversity ? 'n' : (entropyNorm < 0.40 ? 's' : (entropyNorm < 0.60 ? 'c' : 'h'))),
    C: !compressionIsValid ? 'n' : (compression <= 0.50 ? 's' : (compression <= 0.75 ? 'c' : 'h'))
  };
  
  // Output the final cell symbol based on the 4 flags
  flags.cellSymbol = getCellSymbol(flags);
  
  return flags;
};


export const analyzeQuizBehavior = (score, events, questions, startTimeValue) => {
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

  // Partition into 5-second cells and analyze each event cell
  const cells = partitionIntoCells(events, 5000);
  const cellAnalysisResults = cells.map((cell, idx) => {
    const t0 = events?.[0]?.timestamp ?? 0;
    const cellMeta = {
      start: (((cell.startTime - t0) / 1000)).toFixed(1),
      end: (((cell.endTime - t0) / 1000)).toFixed(1)
    };

    const analysis = analyzeCell(cell.events);
    
    return {
      cell: cellMeta,
      eventCount: cell.events.length,
      analysis,
      finalDetectionResult: analysis.cellSymbol
    };
  });

  // Calculate overall metrics for display
  const intervals = [];
  for (let i = 1; i < clickEvents.length; i++) {
    intervals.push(clickEvents[i].timestamp - clickEvents[i - 1].timestamp);
  }

  const eventTypes = events.map(e => e.type);
  const cv = calculateCV(intervals);
  const repetition = calculateRepetition(eventTypes);
  const entropyAlphabet = uniqueCount(eventTypes);
  const entropyNorm = calculateNormalizedEntropy(eventTypes, entropyAlphabet);
  const compression = calculateCompression(eventTypes);

  // Keyboard-only usage 
  const keyboardEvents = events.filter(e => e.type === 'K');
  const keyboardClicks = clickEvents.filter(e => e.method === 'keyboard');
  const totalClicks = clickEvents.length;
  const keyboardRatio = totalClicks > 0 ? keyboardClicks.length / totalClicks : 0;
  
  const keyboardOnlyFlag = totalClicks >= 5
    ? (keyboardRatio >= 0.90 ? 1 : (keyboardRatio >= 0.70 ? 0.5 : 0))
    : 0;

  // Total time and average time per question
  const totalTimeMs = Date.now() - startTimeValue;
  const totalTimeSec = (totalTimeMs / 1000).toFixed(0);
  const avgTimePerQuestion = totalTimeMs / questions.length / 1000;

  // Extract Tape 2 symbols (per-cell) from cell analysis results that will be used for Tape 2 processing
  const cellTapeSymbols = cellAnalysisResults.map(result => result.analysis.cellSymbol);
  
  // This is where the symbols are run to Tape 2 for the final state and track state progression
  let currentState = 'q0';
  const stateProgression = [{ state: 'q0', symbol: null }];
  
  cellTapeSymbols.forEach((symbol, idx) => {
    const nextState = runTMStep(currentState, symbol);
    stateProgression.push({
      cellIndex: idx,
      symbol: symbol,
      fromState: currentState,
      toState: nextState
    });
    currentState = nextState;
  });
  
  const finalTMState = currentState;
  const stateClassification = STATE_TO_CLASSIFICATION[finalTMState];
  
  const classification = getClassificationMessage(finalTMState);
  
  const color = stateClassification.color;
  const suspicionLevel = stateClassification.suspicionLevel;
  const dfaState = finalTMState;

  return {
    score,
    totalQuestions: questions.length,
    cv: cv.toFixed(3),
    repetition: (repetition * 100).toFixed(1),
    entropyNorm: entropyNorm.toFixed(2),
    compression: compression.toFixed(2),
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
    keyboardOnlyFlag,
    
    cells: cellAnalysisResults,
    cellTapeSymbols,
    stateProgression,
    cellStats: {
      totalCells: cells.length
    }
  };
};
