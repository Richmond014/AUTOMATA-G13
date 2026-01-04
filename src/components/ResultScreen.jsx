import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Shield, TrendingUp, Activity, Play, Pause, RotateCcw } from 'lucide-react';
import {
  CELL_METRICS_DEFAULT,
  CELL_MS_DEFAULT,
  buildCellToken as buildCellTokenFromAnalysis,
  getCellIndexForEvent as getCellIndexForEventFromTape,
  groupEventsIntoBlocks
} from '../utils/tapeSimulation';

function ResultScreen({ analysis = {}, onQuizAgain, onGoHome, events = [] }) {
  const CELL_MS = CELL_MS_DEFAULT;
  const CELL_METRICS = CELL_METRICS_DEFAULT;

  const inputTape = events;

  const [currentIndex, setCurrentIndex] = useState(0); // Current event index (read head position)
  const [isPlaying, setIsPlaying] = useState(false);
  const tapeRef = useRef(null);

  const readHeadIndex = currentIndex;

  // Scroll to top when results page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const blocks = groupEventsIntoBlocks(inputTape);

  const getCellIndexForEvent = (event) => getCellIndexForEventFromTape(event, inputTape, CELL_MS);

  const currentCellIndex = inputTape && inputTape.length > 0
    ? getCellIndexForEvent(inputTape[readHeadIndex] || inputTape[0])
    : 0;

  // Only mark a cell as "written" after the read head has advanced into the next cell.
  // This prevents the first output cell from appearing immediately at time 0.
  const writeHeadCellIndexMax = Math.max(-1, currentCellIndex - 1);

  const buildCellToken = (cellAnalysis) => buildCellTokenFromAnalysis(cellAnalysis, CELL_METRICS);

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying || readHeadIndex >= inputTape.length - 1) return;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        const lastIndex = inputTape.length - 1;
        if (next >= lastIndex) setIsPlaying(false);
        return Math.min(next, lastIndex);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [isPlaying, readHeadIndex, inputTape.length]);

  // Auto-scroll to current event (only when playing)
  useEffect(() => {
    if (tapeRef.current && isPlaying) {
      const currentCell = tapeRef.current.querySelector(`[data-index="${readHeadIndex}"]`);
      if (currentCell) {
        currentCell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [readHeadIndex, isPlaying]);

  const formatEventType = (type) => {
    const types = {
      'M': 'Move',
      'C': 'Click',
      'H': 'Hover',
      'S': 'Scroll',
      'T': 'TabAway',
      'R': 'TabReturn'
    };
    return types[type] || type;
  };

  const getEventColor = (type) => {
    const colors = {
      'M': '#60A5FA',
      'C': '#F59E0B',
      'H': '#10B981',
      'S': '#8B5CF6',
      'T': '#EF4444',
      'R': '#22C55E'
    };
    return colors[type] || '#9CA3AF';
  };

  const handlePlayPause = () => {
    if (readHeadIndex >= inputTape.length - 1) {
      // If at the end, reset to beginning and start playing
      setCurrentIndex(0);
      setIsPlaying(true);
    } else {
      // Toggle play/pause
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '3rem 2rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#4F46E5',
      textAlign: 'center',
      marginBottom: '0.5rem'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#6B7280',
      textAlign: 'center',
      marginBottom: '3rem'
    },
    errorCard: {
      background: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      textAlign: 'center',
      border: '2px solid #EF4444',
      color: '#EF4444',
      fontSize: '1.2rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      background: 'white',
      borderRadius: '1rem',
      padding: '2.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '2rem',
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#1F2937'
    },
    scoreDisplay: {
      textAlign: 'center'
    },
    scoreNumber: {
      fontSize: '4rem',
      fontWeight: 'bold',
      color: '#4F46E5',
      marginBottom: '0.5rem'
    },
    scorePercent: {
      fontSize: '1.5rem',
      color: '#6B7280',
      marginBottom: '1rem'
    },
    scoreTime: {
      fontSize: '0.875rem',
      color: '#9CA3AF'
    },
    detectionCard: (color) => ({
      background: 'white',
      borderRadius: '1rem',
      padding: '2.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: `3px solid ${color}`
    }),
    detectionResult: {
      textAlign: 'center'
    },
    detectionIconWrapper: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '1.5rem'
    },
    detectionLevel: (color) => ({
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: color,
      marginBottom: '1rem'
    }),
    detectionText: {
      fontSize: '1rem',
      color: '#6B7280',
      marginBottom: '1.5rem'
    },
    metricsCard: {
      background: 'white',
      borderRadius: '1rem',
      padding: '2.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '3rem',
      marginTop: '3rem'
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1.5rem'
    },
    metricBox: {
      background: '#F9FAFB',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#E5E7EB'
    },
    metricHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    metricLabel: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#1F2937'
    },
    metricValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#4F46E5',
      marginBottom: '0.5rem'
    },
    metricStatus: (isFlag) => ({
      fontSize: '0.75rem',
      color: isFlag ? '#EF4444' : '#10B981'
    }),
    statsCard: {
      background: 'white',
      borderRadius: '1rem',
      padding: '2.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '3rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '2.5rem',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#4F46E5',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6B7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    // Turing Machine Tape Styles
    tapeCard: {
      background: 'white',
      borderRadius: '1rem',
      padding: '2.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '3rem'
    },
    tapeHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    tapeTitle: {
      fontSize: '1.75rem',
      fontWeight: '600',
      color: '#1F2937',
      fontFamily: 'monospace'
    },
    controls: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center'
    },
    controlButton: {
      background: '#4F46E5',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    counter: {
      color: '#6B7280',
      fontSize: '0.875rem',
      fontFamily: 'monospace',
      background: '#F9FAFB',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: '1px solid #E5E7EB'
    },
    headContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '1rem'
    },
    head: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.25rem'
    },
    headPointer: {
      color: '#F59E0B',
      fontSize: '2rem',
      lineHeight: '1'
    },
    headBox: {
      background: '#F59E0B',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      fontFamily: 'monospace'
    },
    outputHeadBox: {
      background: '#4F46E5',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      fontFamily: 'monospace'
    },
    tapeContainer: {
      background: '#F9FAFB',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      overflowX: 'auto',
      border: '1px solid #E5E7EB',
      marginBottom: '1.5rem'
    },
    outputTapeContainer: {
      background: '#F3F4F6',
      borderRadius: '0.75rem',
      padding: '1rem',
      overflowX: 'auto',
      border: '1px dashed #E5E7EB',
      marginBottom: '1.5rem'
    },
    tape: {
      display: 'flex',
      gap: '0.5rem',
      minWidth: 'min-content',
      padding: '0.5rem 0'
    },
    outputTape: {
      display: 'flex',
      gap: '0.75rem',
      minWidth: 'min-content',
      padding: '0.25rem 0'
    },
    outputCell: {
      minWidth: '220px',
      background: 'white',
      border: '2px solid #E5E7EB',
      borderRadius: '0.75rem',
      padding: '0.75rem',
      color: '#111827',
      transition: 'all 0.2s'
    },
    outputCellCurrent: {
      borderColor: '#4F46E5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.15)'
    },
    outputCellUnwritten: {
      background: '#F9FAFB',
      color: '#9CA3AF'
    },
    outputCellHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem',
      fontSize: '0.75rem',
      color: '#6B7280',
      fontWeight: 'bold',
      fontFamily: 'monospace'
    },
    outputToken: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: '0.95rem',
      lineHeight: '1.4',
      color: 'inherit'
    },
    cell: {
      minWidth: '140px',
      background: 'white',
      border: '3px solid',
      borderRadius: '0.75rem',
      padding: '0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      transition: 'all 0.3s',
      position: 'relative',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    cellCurrent: {
      background: '#EEF2FF',
      transform: 'scale(1.1)',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
      zIndex: 10
    },
    cellPast: {
      opacity: 0.6
    },
    cellHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.5rem'
    },
    eventType: {
      color: 'white',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontFamily: 'monospace'
    },
    timestamp: {
      color: '#6B7280',
      fontSize: '0.75rem',
      fontFamily: 'monospace'
    },
    coordinates: {
      color: '#9CA3AF',
      fontSize: '0.75rem',
      fontFamily: 'monospace'
    },
    currentIndicator: {
      color: '#F59E0B',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      fontFamily: 'monospace'
    },
    blockInfo: {
      padding: '1rem',
      background: '#F9FAFB',
      borderRadius: '0.75rem',
      color: '#6B7280',
      fontSize: '0.875rem',
      fontFamily: 'monospace',
      border: '1px solid #E5E7EB'
    },
    legend: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginTop: '0.75rem',
      fontSize: '0.75rem'
    },
    legendItem: {
      fontWeight: '500'
    },
    emptyTape: {
      textAlign: 'center',
      padding: '2rem',
      color: '#9CA3AF'
    },
    buttonContainer: {
      display: 'flex',
      gap: '1.5rem',
      justifyContent: 'center',
      marginTop: '3rem'
    },
    button: {
      padding: '1rem 3rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      border: 'none',
      borderRadius: '0.75rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    primaryButton: {
      background: '#4F46E5',
      color: 'white'
    },
    secondaryButton: {
      background: 'white',
      color: '#4F46E5',
      border: '2px solid #4F46E5'
    }
  };

  const getColor = () => {
    if (!analysis || !analysis.color) return '#10B981';
    if (typeof analysis.color === 'string') {
      if (analysis.color.includes('red') || analysis.color === '#ef4444') return '#EF4444';
      if (analysis.color.includes('orange') || analysis.color === '#fb923c') return '#F97316';
      if (analysis.color.includes('yellow') || analysis.color === '#fbbf24') return '#EAB308';
    }
    return '#10B981';
  };

  const borderColor = getColor();

  const safeAnalysis = {
    score: 0,
    totalQuestions: 10,
    avgTimePerQuestion: '0',
    suspicionLevel: 'Human',
    classification: 'No data available',
    flagSum: '0',
    flagMax: 5,
    cv: '0',
    repetition: '0',
    entropyNorm: '0',
    compression: '0',
    celledMetrics: null,
    totalEvents: 0,
    totalTime: '0',
    clicks: 0,
    mouseMovements: 0,
    ...analysis
  };

  const displayedMetrics = safeAnalysis.celledMetrics ?? {
    cv: safeAnalysis.cv,
    repetition: safeAnalysis.repetition,
    entropyNorm: safeAnalysis.entropyNorm,
    compression: safeAnalysis.compression
  };

  const analysisCells = safeAnalysis.cells ?? [];
  const analysisCellStats = safeAnalysis.cellStats;

  const outputTape = analysisCells;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Quiz Completed</h1>
        <p style={styles.subtitle}>Analysis Report</p>

        {safeAnalysis.error ? (
          <div style={styles.errorCard}>
            <p>{safeAnalysis.error}</p>
          </div>
        ) : (
          <>
            {/* Score and Detection Result */}
            <div style={styles.grid}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={{ fontSize: '1.5rem' }}>
                    Quiz Performance Summary
                  </span>
                </div>
                <div style={styles.scoreDisplay}>
                  <div style={styles.scoreNumber}>
                    {safeAnalysis.score}/{safeAnalysis.totalQuestions}
                  </div>
                  <div style={styles.scorePercent}>
                    {((safeAnalysis.score / safeAnalysis.totalQuestions) * 100).toFixed(0)}% Correct
                  </div>
                  <div style={styles.scoreTime}>
                    Average time per question: {safeAnalysis.avgTimePerQuestion}s
                  </div>
                </div>
              </div>

              <div style={styles.detectionCard(borderColor)}>
                <div style={styles.cardHeader}>
                  <span>Detection Result</span>
                </div>
                <div style={styles.detectionResult}>
                  <div style={styles.detectionIconWrapper}>
                    {borderColor === '#10B981' ? (
                      <CheckCircle size={48} style={{ color: '#10B981' }} />
                    ) : (
                      <AlertTriangle size={48} style={{ color: borderColor }} />
                    )}
                  </div>
                  <div style={styles.detectionLevel(borderColor)}>
                    {safeAnalysis.suspicionLevel || 'Human'}
                  </div>
                  <div style={styles.detectionText}>
                    {safeAnalysis.classification}
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Metrics */}
<div style={styles.metricsCard}>
  <div style={styles.cardHeader}>
    <span>Analysis Metrics</span>
  </div>

  <div style={styles.metricsGrid}>
    {(() => {
      // --- Compute statuses ---
      const cvNum = parseFloat(displayedMetrics.cv);
      const repetitionNum = parseFloat(displayedMetrics.repetition);
      const entropyNormNum = parseFloat(displayedMetrics.entropyNorm ?? safeAnalysis.entropyNorm);
      const compressionNum = parseFloat(displayedMetrics.compression);

      const cvStatus = cvNum < 0.10 ? 'danger' : cvNum < 0.25 ? 'warning' : 'normal';
      const repetitionStatus =
        repetitionNum >= 80 ? 'danger' : repetitionNum >= 60 ? 'warning' : 'normal';
      const entropyStatus = entropyNormNum < 0.4 ? 'danger' : entropyNormNum < 0.6 ? 'warning' : 'normal';
      const compressionStatus =
        compressionNum <= 0.60 ? 'danger' : compressionNum <= 0.85 ? 'warning' : 'normal';

      const isBad = (status) => status !== 'normal';

      // --- Helper to render each metric ---
      const renderMetric = (
        label,
        value,
        status,
        suffix,
        dangerText,
        warningText,
        normalText
      ) => (
        <div
          style={{
            ...styles.metricBox,
            borderColor: isBad(status) ? '#EF4444' : '#E5E7EB',
          }}
        >
          <div style={styles.metricHeader}>
            <span style={styles.metricLabel}>{label}</span>
            {status === 'normal' ? (
              <CheckCircle size={16} style={{ color: '#10B981' }} />
            ) : (
              <AlertTriangle size={16} style={{ color: '#EF4444' }} />
            )}
          </div>
          <div style={styles.metricValue}>
            {value}
            {suffix ? suffix : ''}
          </div>
          <div
            style={{
              ...styles.metricStatus,
              color: status === 'normal' ? '#10B981' : '#EF4444',
            }}
          >
            {status === 'danger'
              ? dangerText
              : status === 'warning'
              ? warningText
              : normalText}
          </div>
        </div>
      );

      return (
        <>
          {renderMetric(
            'Timing Consistency',
            displayedMetrics.cv,
            cvStatus,
            '',
            'Too Consistent',
            'Suspicious',
            'Normal'
          )}
          {renderMetric(
            'Pattern Repetition',
            displayedMetrics.repetition,
            repetitionStatus,
            '%',
            'High',
            'Suspicious',
            'Normal'
          )}
          {renderMetric(
            'Randomness',
            Number.isFinite(entropyNormNum) ? entropyNormNum.toFixed(2) : '—',
            entropyStatus,
            '',
            'Low',
            'Suspicious',
            'Normal'
          )}
          {renderMetric(
            'Pattern Complexity',
            displayedMetrics.compression,
            compressionStatus,
            '',
            'Too Simple',
            'Suspicious',
            'Normal'
          )}
        </>
      );
    })()}
  </div>
</div>

            {/* Interaction Statistics */}
            <div style={styles.statsCard}>
              <h3 style={styles.cardHeader}>Interaction Statistics</h3>
              <div style={styles.statsGrid}>
                <div>
                  <div style={styles.statNumber}>{safeAnalysis.totalEvents}</div>
                  <div style={styles.statLabel}>Total Events</div>
                </div>
                <div>
                  <div style={styles.statNumber}>{safeAnalysis.clicks}</div>
                  <div style={styles.statLabel}>Clicks</div>
                </div>
                <div>
                  <div style={styles.statNumber}>{safeAnalysis.mouseMovements}</div>
                  <div style={styles.statLabel}>Mouse Moves</div>
                </div>
                <div>
                  <div style={styles.statNumber}>
                    {safeAnalysis.totalTime || '0'}s
                  </div>
                  <div style={styles.statLabel}>Total Time</div>
                </div>
              </div>
            </div>

            {/* Cell Analysis Section */}
            {analysisCells && analysisCells.length > 0 && (
              <div style={styles.statsCard}>
                <h3 style={styles.cardHeader}>
                  <span>Cell Analysis (5-Second Intervals)</span>
                </h3>
                <div style={{ marginBottom: '1.5rem', color: '#6B7280', fontSize: '0.875rem' }}>
                  Analyzed {analysisCellStats?.totalCells} cells. 
                  DFA State: <strong style={{ color: borderColor }}>{safeAnalysis.dfaState}</strong>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '3px solid rgb(96, 165, 250)' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: 'black' }}>Cell</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: 'black' }}>Events</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: 'black' }}>Timing</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: 'black' }}>Repetition</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: 'black' }}>Entropy</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: 'black' }}>Compressibility</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: 'black' }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisCells.map((w, idx) => {
                        const suspiciousCount = ['T', 'R', 'E', 'C'].filter(m => w.analysis[m] === 's').length;
                        const cautionCount = ['T', 'R', 'E', 'C'].filter(m => w.analysis[m] === 'c').length;

                        const isNotApplicable = w.analysis?.hasEnoughData === false;

                        const NOT_INCLUDED_LABEL = 'Not included';

                        // 3-level cell result: Human / Caution / Suspicious
                        // Use both suspicious and caution flags so label + color stay consistent.
                        let cellResultLabel = 'Human';
                        let rowColor = '#22c55e';
                        
                        // Cell classification logic
                        if (isNotApplicable) {
                          cellResultLabel = NOT_INCLUDED_LABEL;
                          rowColor = '#9CA3AF';
                        } else {
                          const cellSuspiciousRatio = suspiciousCount / 4;                          
                          const cellCautionRatio = cautionCount / 4;

                          if (cellSuspiciousRatio >= 0.65) {
                            cellResultLabel = 'Suspicious';
                            rowColor = '#ef4444';
                          } else if ( // Mixed case: suspicious + caution = suspicious
                            cellSuspiciousRatio >= 0.45 || (cellSuspiciousRatio + cellCautionRatio) >= 0.70
                          ) {
                            cellResultLabel = 'Suspicious';
                            rowColor = '#ef4444';
                          } else if (cellCautionRatio >= 0.35) {
                            cellResultLabel = 'Caution';
                            rowColor = '#fbbf24';
                          } else {
                            cellResultLabel = 'Human';
                            rowColor = '#22c55e';
                          }
                        } 
                        
                        const getFlagEmoji = (flag, color) => {
                            if (flag === 's') return <AlertCircle size={16} color={color || '#ef4444'} />; 
                            if (flag === 'c') return <AlertTriangle size={16} color={color || '#fbbf24'} />; 
                            if (flag === 'h') return <CheckCircle size={16} color={color || '#22c55e'} />; 
                            return 'N/A'; 
                        };
                        
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid rgb(229, 231, 235)' }}>
                            <td style={{ padding: '0.75rem', color: 'black' }}>C{idx + 1}: {w.cell?.start}s - {w.cell?.end}s</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', color: 'black' }}>{w.eventCount}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', color: 'black' }}>{getFlagEmoji(w.analysis.T)}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', color: 'black' }}>{getFlagEmoji(w.analysis.R)}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', color: 'black' }}>{getFlagEmoji(w.analysis.E)}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', color: 'black' }}>{getFlagEmoji(w.analysis.C)}</td>
                            <td style={{ padding: '0.75rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: rowColor, fontWeight: 600 }}>
                            {cellResultLabel === 'Suspicious' && <AlertCircle size={18} />}
                            {cellResultLabel === 'Caution' && <AlertTriangle size={18} />}
                            {cellResultLabel === 'Human' && <CheckCircle size={18} />}
                            {cellResultLabel}
                            </span>
                          </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Turing Machine Tape Simulation */}
            <div style={styles.tapeCard}>
              <div style={styles.tapeHeader}>
                <h3 style={styles.tapeTitle}> Turing Machine Tape Simulation</h3>
                {inputTape && inputTape.length > 0 && (
                  <div style={styles.controls}>
                    <button 
                      onClick={handlePlayPause} 
                      style={styles.controlButton}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#4338CA';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#4F46E5';
                      }}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <button 
                      onClick={handleReset} 
                      style={styles.controlButton}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#4338CA';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#4F46E5';
                      }}
                    >
                      <RotateCcw size={18} />
                      <span>Reset</span>
                    </button>
                    <div style={styles.counter}>
                      Event {readHeadIndex + 1} / {inputTape.length}
                    </div>
                  </div>
                )}
              </div>

              {!inputTape || inputTape.length === 0 ? (
                <div style={styles.emptyTape}>
                  <p>No events recorded during the quiz.</p>
                </div>
              ) : (
                <>
                  <div style={styles.headContainer}>
                    <div style={styles.head}>
                      <div style={styles.headPointer}>▼</div>
                      <div style={styles.headBox}>READ HEAD</div>
                    </div>
                  </div>

                  <div ref={tapeRef} style={styles.tapeContainer}>
                    <div style={styles.tape}>
                      {inputTape.map((event, idx) => {
                        const isCurrent = idx === readHeadIndex;
                        const isPast = idx < readHeadIndex;
                        const relativeTime = idx > 0 
                          ? ((event.timestamp - inputTape[0].timestamp) / 1000).toFixed(1) 
                          : '0.0';

                        return (
                          <div
                            key={idx}
                            data-index={idx}
                            style={{
                              ...styles.cell,
                              ...(isCurrent ? styles.cellCurrent : {}),
                              ...(isPast ? styles.cellPast : {}),
                              borderColor: getEventColor(event.type)
                            }}
                          >
                            <div style={styles.cellHeader}>
                              <span style={{
                                ...styles.eventType,
                                background: getEventColor(event.type)
                              }}>
                                {formatEventType(event.type)}
                              </span>
                              <span style={styles.timestamp}>{relativeTime}s</span>
                            </div>
                            
                            {/* For Scroll: only show scroll position */}
                            {event.type === 'S' ? (
                              event.scrollY !== undefined && (
                                <div style={styles.coordinates}>
                                  Scroll: {Math.round(event.scrollY)}px
                                </div>
                              )
                            ) : (
                              /* For other events: show (x, y) coordinates if available */
                              (event.x !== undefined && event.y !== undefined) && (
                                <div style={styles.coordinates}>
                                  ({Math.round(event.x)}, {Math.round(event.y)})
                                </div>
                              )
                            )}
                            
                            {isCurrent && (
                              <div style={styles.currentIndicator}>◀ READING</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Output tape: writes per-cell (5s) tokens as the head advances */}
                  {outputTape.length > 0 && (
                    <>
                      <div style={styles.headContainer}>
                        <div style={styles.head}>
                          <div style={styles.headPointer}>▼</div>
                          <div style={styles.outputHeadBox}>WRITE HEAD</div>
                        </div>
                      </div>

                      <div style={styles.outputTapeContainer}>
                        <div style={styles.outputTape}>
                          {outputTape.map((w, wIdx) => {
                            const isCurrentCell = wIdx === currentCellIndex;
                            const isWritten = wIdx <= writeHeadCellIndexMax;
                            const token = isWritten ? buildCellToken(w.analysis) : '…';

                            return (
                              <div
                                key={wIdx}
                                style={{
                                  ...styles.outputCell,
                                  ...(isCurrentCell ? styles.outputCellCurrent : {}),
                                  ...(!isWritten ? styles.outputCellUnwritten : {})
                                }}
                              >
                                <div style={styles.outputCellHeader}>
                                  <span>{w.cell?.start}s - {w.cell?.end}s</span>
                                  <span>C{wIdx + 1}</span>
                                </div>
                                <div style={styles.outputToken}>{token}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <div style={styles.blockInfo}>
                    <strong>Tape Blocks:</strong> {blocks.length} segments detected
                    <div style={styles.legend}>
                      <span style={{...styles.legendItem, color: '#F59E0B'}}>● Click</span>
                      <span style={{...styles.legendItem, color: '#60A5FA'}}>● Move</span>
                      <span style={{...styles.legendItem, color: '#10B981'}}>● Hover</span>
                      <span style={{...styles.legendItem, color: '#8B5CF6'}}>● Scroll</span>
                      <span style={{...styles.legendItem, color: '#EF4444'}}>● TabAway</span>
                      <span style={{...styles.legendItem, color: '#22C55E'}}>● TabReturn</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Buttons */}
            <div style={styles.buttonContainer}>
              <button
                style={{ ...styles.button, ...styles.primaryButton }}
                onClick={onQuizAgain}
                onMouseEnter={(e) => {
                  e.target.style.background = '#4338CA';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#4F46E5';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Take Quiz Again
              </button>
              <button
                style={{ ...styles.button, ...styles.secondaryButton }}
                onClick={onGoHome}
                onMouseEnter={(e) => {
                  e.target.style.background = '#EEF2FF';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                }}
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResultScreen;