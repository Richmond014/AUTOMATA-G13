// src/utils/tapeSimulation.js

// TM terminology: a tape is divided into discrete "cells".
// In this project, one output tape cell corresponds to one fixed-duration time slice.
export const CELL_MS_DEFAULT = 5000;
export const CELL_METRICS_DEFAULT = ['T', 'R', 'E', 'C'];

export const groupEventsIntoBlocks = (tape, { gapMs = 2000, maxBlockSize = 7 } = {}) => {
  if (!tape || tape.length === 0) return [];

  const blocks = [];
  let currentBlock = [];
  let lastTimestamp = tape[0]?.timestamp || 0;

  tape.forEach((event) => {
    if (event.timestamp - lastTimestamp > gapMs || currentBlock.length >= maxBlockSize) {
      if (currentBlock.length > 0) {
        blocks.push([...currentBlock]);
        currentBlock = [];
      }
    }
    currentBlock.push(event);
    lastTimestamp = event.timestamp;
  });

  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  return blocks;
};

export const getCellIndexForEvent = (event, tape, cellMs = CELL_MS_DEFAULT) => {
  if (!event || !tape || tape.length === 0) return 0;
  const t0 = tape[0]?.timestamp ?? 0;
  const dt = Math.max(0, (event.timestamp ?? t0) - t0);
  return Math.floor(dt / cellMs);
};

export const buildCellToken = (
  cellAnalysis,
  metrics = CELL_METRICS_DEFAULT
) => {
  const analysisObj = cellAnalysis?.analysis || cellAnalysis || {};
  const flagToToken = (metric, flag) => {
    const suffix = flag === 's' ? 's' : flag === 'c' ? 'c' : flag === 'h' ? 'h' : 'n';
    return `${metric}_${suffix}`;
  };

  return metrics.map((m) => flagToToken(m, analysisObj[m])).join(' | ');
};
