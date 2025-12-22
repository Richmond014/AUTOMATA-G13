// src/utils/analysisHelpers.js
// Analysis and calculation functions

export const calculateCV = (intervals) => {
  if (intervals.length < 2) return 0;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  return mean === 0 ? 0 : stdDev / mean;
};

export const calculateRepetition = (eventTypes) => {
  if (eventTypes.length < 12) return 0;
  const blockSize = 4;
  const blocks = [];
  for (let i = 0; i <= eventTypes.length - blockSize; i += blockSize) {
    blocks.push(eventTypes.slice(i, i + blockSize).join(''));
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
  const original = eventTypes.join('');
  const compressed = original.split('').reduce((acc, char, i, arr) => {
    if (i === 0 || char !== arr[i - 1]) acc += char;
    return acc;
  }, '');
  return compressed.length / original.length;
};

export const analyzeQuizBehavior = (score, events, questions, startTimeValue) => {
  if (events.length < 20) {
    return {
      error: "Not enough behavior data",
      score,
      totalQuestions: questions.length
    };
  }

  const clickEvents = events.filter(e => e.type === "C");
  const intervals = [];
  for (let i = 1; i < clickEvents.length; i++) {
    intervals.push(clickEvents[i].timestamp - clickEvents[i - 1].timestamp);
  }

  const eventTypes = events.map(e => e.type);
  const cv = calculateCV(intervals);
  const repetition = calculateRepetition(eventTypes);
  const entropy = calculateEntropy(eventTypes);
  const compression = calculateCompression(eventTypes);

  const timingFlag = cv < 0.10 ? 1 : (cv >= 0.25 ? 0 : 0.5);
  const repetitionFlag = repetition >= 0.80 ? 1 : 0;
  const entropyFlag = entropy < 2.3 ? 1 : (entropy < 3 ? 0.5 : 0);
  const compressionFlag = compression <= 0.60 ? 1 : (compression <= 0.85 ? 0.5 : 0);
  const flagSum = timingFlag + repetitionFlag + entropyFlag + compressionFlag;

  const avgTimePerQuestion = (Date.now() - startTimeValue) / questions.length / 1000;
  const tooFast = avgTimePerQuestion < 3;
  const perfectScore = score === questions.length;
  const suspiciousCombo = tooFast && perfectScore;

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
    avgTimePerQuestion: avgTimePerQuestion.toFixed(1),
    mouseMovements: events.filter(e => e.type === "M").length,
    clicks: clickEvents.length,
    timingFlag,
    repetitionFlag,
    entropyFlag,
    compressionFlag
  };
};