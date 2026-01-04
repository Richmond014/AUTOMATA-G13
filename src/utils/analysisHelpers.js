
const uniqueCount = (arr) => new Set(arr).size;

// Timing CV (coefficient of variation) T
export const calculateCV = (intervals) => {
  if (intervals.length < 2) return 0;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  return mean === 0 ? 0 : stdDev / mean;
};

// Repetition (attern repetition) R
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

// Compression ratio proxy (lower can indicate repetitive/simple patterns)
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

// Partition events into fixed-duration cells (5s by default) 
// This is used for writing the output tape and per-cell analysis
export const partitionIntoCells = (events, cellSizeMs = 5000) => {
  if (events.length === 0) return [];
  
  const cells = [];
  const startTime = events[0].timestamp;
  let currentCell = [];
  let currentCellStart = startTime;
  
  events.forEach(event => {
    const timeInCurrentCell = event.timestamp - currentCellStart;
    
    if (timeInCurrentCell >= cellSizeMs) {
      if (currentCell.length > 0) {
        cells.push({
          startTime: currentCellStart,
          endTime: currentCellStart + cellSizeMs,
          events: currentCell
        });
      }
      currentCell = [event];
      const dt = Math.max(0, event.timestamp - startTime);
      currentCellStart = startTime + Math.floor(dt / cellSizeMs) * cellSizeMs;
    } else {
      currentCell.push(event);
    }
  });

  if (currentCell.length > 0) {
    cells.push({
      startTime: currentCellStart,
      endTime: currentCellStart + cellSizeMs,
      events: currentCell
    });
  }
  
  return cells;
};

// Analyze single cell and return flags
export const analyzeCell = (cellEvents) => {
  const clickEvents = cellEvents.filter(e => e.type === "C");

  if (clickEvents.length < 2) {
    return {
      hasEnoughData: false,
      T: 'n', // n = not enough data
      R: 'n',
      E: 'n',
      C: 'n'
    };
  }
  
  const eventTypes = cellEvents.map(e => e.type);

  const entropyTypes = eventTypes;

  // Metric-specific weights (used for weighted cell averages)
  const repetitionTypes = eventTypes.filter(t =>
    t === 'C' || t === 'H' || t === 'S' || t === 'T' || t === 'R'
  );
  const compressionTypes = eventTypes.filter(t =>
    t === 'C' || t === 'H' || t === 'S'
  );

  const cvWeight = clickEvents.length >= 3 ? Math.max(0, clickEvents.length - 1) : 0; // #intervals
  const repetitionWeight = repetitionTypes.length;
  const entropyWeight = entropyTypes.length;
  const compressionWeight = compressionTypes.length;

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

  const repetitionIsValid = repetitionTypes.length >= 12 && uniqueCount(repetitionTypes) >= 2;
  const compressionIsValid = compressionTypes.length >= 4;
  
  // Return symbolic flags: s = suspicious, c = caution, h = human, n = not enough data
  return {
    hasEnoughData: true,
    T: Tflag,
    R: !repetitionIsValid ? 'n' : (repetition >= 0.75 ? 's' : (repetition >= 0.60 ? 'c' : 'h')),
    E: entropyIsSuspiciousSingleType
      ? 's'
      : (!hasEntropyDiversity ? 'n' : (entropyNorm < 0.40 ? 's' : (entropyNorm < 0.60 ? 'c' : 'h'))),
    C: !compressionIsValid ? 'n' : (compression <= 0.50 ? 's' : (compression <= 0.75 ? 'c' : 'h')),
    values: {
      cv,
      repetition,
      entropyNorm,
      compression,
      weights: {
        cv: cvWeight,
        repetition: repetitionWeight,
        entropyNorm: entropyWeight,
        compression: compressionWeight
      }
    }
  };
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

  // Partition into 5-second cells and analyze each
  const cells = partitionIntoCells(events, 5000);
  const cellAnalysisResults = cells.map((cell, idx) => {
    const t0 = events?.[0]?.timestamp ?? 0;
    const cellMeta = {
      start: (((cell.startTime - t0) / 1000)).toFixed(1),
      end: (((cell.endTime - t0) / 1000)).toFixed(1)
    };

    return {
      cell: cellMeta,
      eventCount: cell.events.length,
      analysis: analyzeCell(cell.events)
    };
  });
  
  let totalSuspicious = 0;
  let totalCaution = 0;
  let validCells = 0;
  let evidenceCells = 0;
  
  cellAnalysisResults.forEach(wa => {
    if (!wa?.analysis?.hasEnoughData) return;

    validCells++;

    const measurable = ['T', 'R', 'E', 'C'].filter((m) => wa.analysis[m] !== 'n').length;
    if (measurable < 2) return;

    evidenceCells++;
    ['T', 'R', 'E', 'C'].forEach(metric => {
      if (wa.analysis[metric] === 's') totalSuspicious++;
      else if (wa.analysis[metric] === 'c') totalCaution++;
    });
  });

  const useCellAnalysis = evidenceCells >= 2;

  const intervals = [];
  for (let i = 1; i < clickEvents.length; i++) {
    intervals.push(clickEvents[i].timestamp - clickEvents[i - 1].timestamp);
  }

  const eventTypes = events.map(e => e.type);
  const entropyTypes = eventTypes;
  const cv = calculateCV(intervals);
  const repetition = calculateRepetition(eventTypes);
  const entropyAlphabet = uniqueCount(entropyTypes);
  const entropyNorm = calculateNormalizedEntropy(entropyTypes, entropyAlphabet);
  const compression = calculateCompression(eventTypes);

  // Cell-aggregated metrics
  const validCellAnalysisResults = cellAnalysisResults.filter(wa => wa.analysis?.hasEnoughData);
  const weightedAvg = (items) => {
    let sum = 0;
    let weightSum = 0;
    items.forEach(({ value, weight }) => {
      if (typeof value !== 'number' || !Number.isFinite(value)) return;
      if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0) return;
      sum += value * weight;
      weightSum += weight;
    });
    return weightSum > 0 ? sum / weightSum : null;
  };

  const cellCvAvg = weightedAvg(validCellAnalysisResults.map(wa => ({
    value: wa.analysis?.values?.cv,
    weight: wa.analysis?.values?.weights?.cv
  })));

  const cellRepetitionAvg = weightedAvg(validCellAnalysisResults.map(wa => ({
    value: wa.analysis?.values?.repetition,
    weight: wa.analysis?.values?.weights?.repetition
  })));

  const cellEntropyNormAvg = weightedAvg(validCellAnalysisResults.map(wa => ({
    value: wa.analysis?.values?.entropyNorm,
    weight: wa.analysis?.values?.weights?.entropyNorm
  })));

  const cellCompressionAvg = weightedAvg(validCellAnalysisResults.map(wa => ({
    value: wa.analysis?.values?.compression,
    weight: wa.analysis?.values?.weights?.compression
  })));

  const celledMetrics = {
    cv: ((cellCvAvg ?? cv)).toFixed(3),
    repetition: (((cellRepetitionAvg ?? repetition) * 100)).toFixed(1),
    entropyNorm: ((cellEntropyNormAvg ?? entropyNorm)).toFixed(2),
    compression: ((cellCompressionAvg ?? compression)).toFixed(2),
    cellsUsed: {
      cv: validCellAnalysisResults.filter(wa => typeof wa.analysis?.values?.cv === 'number' && Number.isFinite(wa.analysis.values.cv)).length,
      all: validCellAnalysisResults.length
    }
  };

  // Keyboard-only usage 
  const keyboardEvents = events.filter(e => e.type === 'K');
  const keyboardClicks = clickEvents.filter(e => e.method === 'keyboard');
  const totalClicks = clickEvents.length;
  const keyboardRatio = totalClicks > 0 ? keyboardClicks.length / totalClicks : 0;
  
  // Heavy keyboard-only clicking
  const keyboardOnlyFlag = totalClicks >= 5
    ? (keyboardRatio >= 0.90 ? 1 : (keyboardRatio >= 0.70 ? 0.5 : 0))
    : 0;

  // Overall flags 
  const timingFlag = cv < 0.08 ? 1 : (cv < 0.20 ? 0.5 : 0);
  const repetitionFlag = uniqueCount(eventTypes.filter(t => t === 'C' || t === 'H' || t === 'S' || t === 'T' || t === 'R')) < 2 || eventTypes.length < 12
    ? 0
    : (repetition >= 0.75 ? 1 : (repetition >= 0.60 ? 0.5 : 0));
  const entropyUnique = uniqueCount(entropyTypes);
  const entropyFlag = entropyUnique < 2 ? 0 : (entropyNorm < 0.40 ? 1 : (entropyNorm < 0.60 ? 0.5 : 0));
  const compressionFlag = eventTypes.filter(t => t === 'C' || t === 'H' || t === 'S').length < 4
    ? 0
    : (compression <= 0.50 ? 1 : (compression <= 0.75 ? 0.5 : 0));
  const flagSum = timingFlag + repetitionFlag + entropyFlag + compressionFlag + keyboardOnlyFlag;

  // DFA-style classification based on per-cell analysis
  let suspiciousRatio, cautionRatio;
  
  if (useCellAnalysis && evidenceCells > 0) {
    const denom = evidenceCells * 4; // 4 metrics per evidence cell (T, R, E, C)
    suspiciousRatio = totalSuspicious / denom;
    cautionRatio = totalCaution / denom;
  } else {
    suspiciousRatio = flagSum / 5;
    cautionRatio = 0;
  }
  
  // Calculate total time and average time per question
  const totalTimeMs = Date.now() - startTimeValue;
  const totalTimeSec = (totalTimeMs / 1000).toFixed(0);
  const avgTimePerQuestion = totalTimeMs / questions.length / 1000;
  
  const tooFast = avgTimePerQuestion < 1.0;
  const perfectScore = score === questions.length;
  const suspiciousCombo = tooFast && perfectScore;

  const buildCellEvidenceReasons = () => {
    const reasons = [];

    if (suspiciousCombo) reasons.push('very fast answers with a perfect score');

    const metrics = ['T', 'R', 'E', 'C'];
    const metricCounts = {
      T: { s: 0, c: 0, h: 0, n: 0, denom: 0 },
      R: { s: 0, c: 0, h: 0, n: 0, denom: 0 },
      E: { s: 0, c: 0, h: 0, n: 0, denom: 0 },
      C: { s: 0, c: 0, h: 0, n: 0, denom: 0 }
    };

    cellAnalysisResults.forEach((wa) => {
      if (!wa?.analysis?.hasEnoughData) return;
      metrics.forEach((metric) => {
        const value = wa.analysis[metric];
        if (!metricCounts[metric]) return;
        if (value === 's') metricCounts[metric].s += 1;
        else if (value === 'c') metricCounts[metric].c += 1;
        else if (value === 'h') metricCounts[metric].h += 1;
        else metricCounts[metric].n += 1;
        if (value !== 'n') metricCounts[metric].denom += 1;
      });
    });

    const addReasonFromShares = (metric, strongText, mildText) => {
      const { s, c, denom } = metricCounts[metric];
      if (!denom) return;
      const suspiciousShare = s / denom;
      const cautionShare = c / denom;

      if (suspiciousShare >= 0.5) reasons.push(strongText);
      else if (cautionShare >= 0.35 || (suspiciousShare + cautionShare) >= 0.5) reasons.push(mildText);
    };

    addReasonFromShares('T', 'highly consistent click timing across time windows', 'unusually consistent click timing across time windows');
    addReasonFromShares('R', 'high repetition in action patterns across time windows', 'some repetition in action patterns across time windows');
    addReasonFromShares('E', 'low interaction variety across time windows', 'reduced interaction variety across time windows');
    addReasonFromShares('C', 'very simple repeated sequences across time windows', 'simple sequences across time windows');

    if (keyboardOnlyFlag >= 1) reasons.push('clicks mostly triggered via keyboard');
    else if (keyboardOnlyFlag >= 0.5) reasons.push('heavy keyboard-based clicking');

    return reasons;
  };

  const buildEvidenceReasons = () => {
    if (useCellAnalysis) return buildCellEvidenceReasons();

    const reasons = [];

    if (suspiciousCombo) reasons.push('very fast answers with a perfect score');

    if (timingFlag >= 1) reasons.push('highly consistent click timing');
    else if (timingFlag >= 0.5) reasons.push('unusually consistent click timing');

    if (repetitionFlag >= 1) reasons.push('high repetition in action patterns');
    else if (repetitionFlag >= 0.5) reasons.push('some repetition in action patterns');

    if (entropyFlag >= 1) reasons.push('low interaction variety');
    else if (entropyFlag >= 0.5) reasons.push('reduced interaction variety');

    if (compressionFlag >= 1) reasons.push('very simple repeated sequences');
    else if (compressionFlag >= 0.5) reasons.push('simple sequences');

    if (keyboardOnlyFlag >= 1) reasons.push('clicks mostly triggered via keyboard');
    else if (keyboardOnlyFlag >= 0.5) reasons.push('heavy keyboard-based clicking');

    return reasons;
  };

  const buildDetailsSentence = (leadIn, fallback) => {
    const reasons = buildEvidenceReasons();
    return reasons.length ? `${leadIn} ${reasons.join(', ')}.` : fallback;
  };

  // DFA classification: q_human / q_caution / q_suspicious
  let classification, color, suspicionLevel, dfaState;
  
  //q_suspicious
  if (
    // suspiciousRatio >= 0.65 ||
    // flagSum >= 3.5 ||
    suspiciousCombo ||
    suspiciousRatio >= 0.45 ||
    (suspiciousRatio + cautionRatio) >= 0.70 ||
    (!useCellAnalysis && flagSum >= 2.5)
  ) {
    classification = buildDetailsSentence('Detected:', 'Multiple indicators were elevated.');
    color = "#ef4444";
    suspicionLevel = "Suspicious";
    dfaState = "q_suspicious";
  }

  // q_caution
  else if (cautionRatio >= 0.35 || (!useCellAnalysis && flagSum >= 1.5)) {
    classification = buildDetailsSentence('Some signals flagged:', 'Minor irregularities detected.');
    color = "#fbbf24";
    suspicionLevel = "Caution";
    dfaState = "q_caution";
  }
  // q_human: Normal behavior
  else {
    classification = "No strong automation signals detected. Interaction patterns fall within a normal range for this quiz.";
    color = "#22c55e";
    suspicionLevel = "Human";
    dfaState = "q_human";
  }

  return {
    score,
    totalQuestions: questions.length,
    cv: cv.toFixed(3),
    repetition: (repetition * 100).toFixed(1),
    entropyNorm: entropyNorm.toFixed(2),
    compression: compression.toFixed(2),
    celledMetrics,
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
    
    cells: cellAnalysisResults,
    cellStats: {
      totalCells: cells.length,
      validCells,
      suspiciousRatio: (suspiciousRatio * 100).toFixed(1),
      cautionRatio: (cautionRatio * 100).toFixed(1),
      humanRatio: ((1 - suspiciousRatio - cautionRatio) * 100).toFixed(1)
    }
  };
};
