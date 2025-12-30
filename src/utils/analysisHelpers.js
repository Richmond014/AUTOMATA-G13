// src/utils/analysisHelpers.js
// Analysis and calculation functions - IMPROVED & FAIR

export const calculateCV = (intervals) => {
  if (intervals.length < 2) return 0;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  return mean === 0 ? 0 : stdDev / mean;
};


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

  // Calculate click intervals
  const intervals = [];
  for (let i = 1; i < clickEvents.length; i++) {
    intervals.push(clickEvents[i].timestamp - clickEvents[i - 1].timestamp);
  }

  const eventTypes = events.map(e => e.type);
  const cv = calculateCV(intervals);
  const repetition = calculateRepetition(eventTypes);
  const entropy = calculateEntropy(eventTypes);
  const compression = calculateCompression(eventTypes);

  // THRESHOLDS:
  
  // Timing: Allow more variation for normal humans
  // CV < 0.08 = extremely consistent (bot-like)
  // CV 0.08-0.20 = borderline
  // CV > 0.20 = normal human variation
  const timingFlag = cv < 0.08 ? 1 : (cv < 0.20 ? 0.5 : 0);
  
  // Repetition:
  // ≥ 0.75 = very repetitive patterns
  // 0.60-0.75 = somewhat repetitive
  // < 0.60 = normal variation
  const repetitionFlag = repetition >= 0.75 ? 1 : (repetition >= 0.60 ? 0.5 : 0);
  
  // Entropy:
  // < 1.2 = very low variety (bot-like)
  // 1.2-1.8 = borderline
  // > 1.8 = good variety
  const entropyFlag = entropy < 1.2 ? 1 : (entropy < 1.8 ? 0.5 : 0);
  
  // Compression:
  // ≤ 0.50 = highly repetitive patterns (CCCCC)
  // 0.50-0.75 = somewhat repetitive
  // > 0.75 = varied behavior
  const compressionFlag = compression <= 0.50 ? 1 : (compression <= 0.75 ? 0.5 : 0);
  
  const flagSum = timingFlag + repetitionFlag + entropyFlag + compressionFlag;

  // Calculate total time and average time per question
  const totalTimeMs = Date.now() - startTimeValue;
  const totalTimeSec = (totalTimeMs / 1000).toFixed(0);
  const avgTimePerQuestion = totalTimeMs / questions.length / 1000;
  
  // More realistic "too fast" threshold
  const tooFast = avgTimePerQuestion < 2; // 2 seconds is unrealistic
  const perfectScore = score === questions.length;
  const suspiciousCombo = tooFast && perfectScore;

  // UPDATED CLASSIFICATION THRESHOLDS
  let classification, color, suspicionLevel;
  
  if (flagSum >= 3 || suspiciousCombo) {
    classification = "HIGH SUSPICION - Likely Automated";
    color = "#ef4444";
    suspicionLevel = "HIGH";
  } else if (flagSum >= 2) {
    classification = "MODERATE SUSPICION - Review Needed";
    color = "#fb923c";
    suspicionLevel = "MODERATE";
  } else if (flagSum >= 1) {
    classification = "LOW SUSPICION - Minor Irregularities";
    color = "#fbbf24";
    suspicionLevel = "LOW";
  } else {
    classification = "NO SUSPICION - Normal Human Behavior";
    color = "#22c55e";
    suspicionLevel = "NONE";
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
    compressionFlag
  };
};