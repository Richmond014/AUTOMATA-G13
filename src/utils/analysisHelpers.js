
const uniqueCount = (arr) => new Set(arr).size;

const LEVEL_META = {
  InsufficientData: { color: '#9CA3AF' },
  Human: { color: '#22c55e' },
  Caution: { color: '#fb923c' },
  Suspicious: { color: '#ef4444' }
};

const getMessageFromLevel = (level) => {
  if (level === 'InsufficientData') return 'Insufficient interaction data — keep interacting so behavior analysis can run.';
  if (level === 'Human') return 'Interaction pattern looks natural and human-like.';
  if (level === 'Caution') return 'Some indicators suggest possible automated behavior.';
  return 'Strong indicators of automated interaction detected.';
};

const METRICS = ['T', 'R', 'E', 'C'];

// Timing CV (coefficient of variation) = T
const calculateCV = (intervals) => {
  if (intervals.length < 2) return 0;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  return mean === 0 ? 0 : stdDev / mean;
};

// Repetition (pattern repetition) = R
const calculateRepetition = (eventTypes) => {
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
const calculateEntropy = (eventTypes) => {
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
const calculateCompression = (eventTypes) => {
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
const partitionIntoCells = (events, cellSizeMs = 5000) => {
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
const analyzeCell = (cellEvents) => {
  const clickEvents = cellEvents.filter(e => e.type === "C");

  if (clickEvents.length < 2) {
    const flags = {
      hasEnoughData: false,
      T: 'n', // n = not enough data
      R: 'n',
      E: 'n',
      C: 'n'
    };
    return flags;
  }
  
  const eventTypes = cellEvents.map(e => e.type);

  // Entropy should reflect meaningful interaction diversity, not noise (e.g., mouse moves).
  // Keep this consistent with repetition/tab-switch related event types.
  const entropyTypes = eventTypes.filter(t =>
    t === 'C' || t === 'H' || t === 'S' || t === 'T' || t === 'R'
  );

  const repetition = calculateRepetition(eventTypes);
  const entropyAlphabet = uniqueCount(entropyTypes);
  const entropyNorm = calculateNormalizedEntropy(entropyTypes, entropyAlphabet);
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

  const entropyUnique = uniqueCount(entropyTypes);
  const hasEntropyDiversity = entropyUnique >= 2;
  const hasEnoughEntropySamples = entropyTypes.length >= 20;
  const entropyIsSuspiciousSingleType = hasEnoughEntropySamples && entropyUnique === 1;
  // Penalize low diversity: flag suspicious if ≤2 unique types with ≥10 events
  const lowEntropyDiversity = entropyTypes.length >= 10 && entropyUnique <= 2;

  const repetitionTypes = eventTypes.filter(t =>
    t === 'C' || t === 'H' || t === 'S' || t === 'T' || t === 'R'
  );
  const compressionTypes = eventTypes.filter(t =>
    t === 'C' || t === 'H' || t === 'S'
  );
  
  // Check for zero mouse moves as a suspicious signal
  const mouseMovements = cellEvents.filter(e => e.type === 'M').length;
  const hasZeroMouseMoves = compressionTypes.length >= 4 && mouseMovements === 0;
  
  const repetitionIsValid = repetitionTypes.length >= 12 && uniqueCount(repetitionTypes) >= 2;
  const compressionIsValid = compressionTypes.length >= 4;
  
  const flags = {
    hasEnoughData: true,
    T: Tflag,
    R: !repetitionIsValid ? 'n' : (repetition >= 0.75 ? 's' : (repetition >= 0.60 ? 'c' : 'h')),
    E: entropyIsSuspiciousSingleType || lowEntropyDiversity
      ? 's'
      : (!hasEntropyDiversity ? 'n' : (entropyNorm < 0.40 ? 's' : (entropyNorm < 0.60 ? 'c' : 'h'))),
    C: !compressionIsValid ? 'n' : (hasZeroMouseMoves ? 's' : (compression <= 0.50 ? 's' : (compression <= 0.75 ? 'c' : 'h')))
  };

  return flags;
};


export const analyzeQuizBehavior = (score, events, questions, startTimeValue) => {
  const clickEvents = events.filter(e => e.type === "C");

  const totalQuestions = questions?.length ?? 0;

  // Partition into 5-second cells and analyze each event cell
  const cells = partitionIntoCells(events, 5000);
  const cellAnalysisResults = cells.map((cell) => {
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
    };
  });

  // Keyboard-only usage (informational only)
  const keyboardEvents = events.filter(e => e.type === 'K');
  const keyboardClicks = clickEvents.filter(e => e.method === 'keyboard');
  const totalClicks = clickEvents.length;
  const keyboardRatio = totalClicks > 0 ? keyboardClicks.length / totalClicks : 0;

  // Total time and average time per question
  const safeStartTimeMs = Number.isFinite(startTimeValue)
    ? startTimeValue
    : (events?.[0]?.timestamp ?? Date.now());
  const totalTimeMs = Math.max(0, Date.now() - safeStartTimeMs);
  const totalTimeSec = (totalTimeMs / 1000).toFixed(0);
  const avgTimePerQuestion = totalQuestions > 0 ? (totalTimeMs / totalQuestions / 1000) : 0;

  // Official detector: ratio aggregation across all valid cells.
  // Count 's' and 'c' across (T/R/E/C) for each cell with enough data.
  // 'n' (not enough data) is ignored in the ratios (does not affect numerator or denominator).
  let validCells = 0;
  let suspicious = 0;
  let caution = 0;
  let human = 0;
  let notEnough = 0;

  // Cell-level counters (do not replace per-cell T/R/E/C flags).
  // These help avoid "dilution" where a few suspicious windows get averaged away.
  let cellsWithSuspicious = 0;
  let cellsWithCaution = 0;

  for (const r of cellAnalysisResults) {
    const a = r?.analysis;
    if (!a?.hasEnoughData) continue;

    let cellSuspicious = 0;
    let cellCaution = 0;
    let cellHuman = 0;
    let cellNotEnough = 0;

    let cellHasS = false;
    let cellHasC = false;

    for (const m of METRICS) {
      const v = a?.[m];
      if (!v) continue;
      if (v === 'n') {
        cellNotEnough++;
        continue;
      }

      if (v === 's') {
        cellSuspicious++;
        cellHasS = true;
      } else if (v === 'c') {
        cellCaution++;
        cellHasC = true;
      } else if (v === 'h') {
        cellHuman++;
      }
    }

    // A "valid" cell must contribute at least 1 usable metric (s/c/h).
    const cellObserved = cellSuspicious + cellCaution + cellHuman;
    if (cellObserved === 0) continue;

    validCells++;
    suspicious += cellSuspicious;
    caution += cellCaution;
    human += cellHuman;
    notEnough += cellNotEnough;

    if (cellHasS) cellsWithSuspicious++;
    if (cellHasC) cellsWithCaution++;
  }

  const denomObserved = suspicious + caution + human;
  const denomTotal = validCells * METRICS.length;

  // Coverage-aware ratios (treat 'n' as missing evidence rather than excluding it)
  const suspiciousRatioTotal = denomTotal > 0 ? suspicious / denomTotal : 0;
  const cautionRatioTotal = denomTotal > 0 ? caution / denomTotal : 0;

  // Weighted score (s counts more than c), normalized 0..1
  const WEIGHT_S = 2;
  const WEIGHT_C = 1;
  const weightedScoreTotal = denomTotal > 0
    ? (WEIGHT_S * suspicious + WEIGHT_C * caution) / (WEIGHT_S * denomTotal)
    : 0;

  // Final classification is decided ONLY from per-cell analysis summary.
  // Low-data sessions: explicitly return InsufficientData (no overall-flag fallback).
  const hasInsufficientCellData = validCells < 2 || denomObserved === 0;

  let suspicionLevel;
  let dfaState;
  if (hasInsufficientCellData) {
    suspicionLevel = 'InsufficientData';
    dfaState = 'q_insufficient';
  } else if (
    // Single-score threshold (coverage-aware)
    weightedScoreTotal >= 0.32
  ) {
    suspicionLevel = 'Suspicious';
    dfaState = 'q_suspicious';
  } else if (weightedScoreTotal >= 0.24) {
    suspicionLevel = 'Caution';
    dfaState = 'q_caution';
  } else {
    suspicionLevel = 'Human';
    dfaState = 'q_human';
  }

  const color = LEVEL_META[suspicionLevel]?.color ?? LEVEL_META.InsufficientData.color;
  const classification = hasInsufficientCellData
    ? 'Insufficient interaction data to classify reliably — answer a few more questions and interact normally, then retry.'
    : getMessageFromLevel(suspicionLevel);

  // Keep a numeric score for display/debug consistency (0..100)
  const aggregatedScore = weightedScoreTotal * 100;

  return {
    score,
    totalQuestions,
    dfaState,
    classification,
    color,
    suspicionLevel,
    aggregatedScore: aggregatedScore.toFixed(1),
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
    
    cells: cellAnalysisResults,
    cellStats: {
      totalCells: cells.length,
      validCells,
      // Primary ratios are coverage-aware (denomTotal)
      suspiciousRatio: (suspiciousRatioTotal * 100).toFixed(1),
      cautionRatio: (cautionRatioTotal * 100).toFixed(1),

      suspiciousRatioTotal: (suspiciousRatioTotal * 100).toFixed(1),
      cautionRatioTotal: (cautionRatioTotal * 100).toFixed(1),
      weightedScoreTotal: (weightedScoreTotal * 100).toFixed(1),

      cellsWithSuspicious,
      cellsWithCaution,
      denom: denomObserved,
      denomObserved,
      denomTotal,
      counts: { s: suspicious, c: caution, h: human, n: notEnough }
    }
  };
};
