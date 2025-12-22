import { AlertTriangle, CheckCircle, Shield, TrendingUp, Activity } from 'lucide-react';

function ResultScreen({ analysis = {}, startTime, onQuizAgain, onGoHome }) {
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
      gap: '2rem',
      marginBottom: '3rem'
    },
    card: {
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
    flagScore: {
      fontSize: '0.875rem',
      color: '#9CA3AF'
    },
    metricsCard: {
      background: 'white',
      borderRadius: '1rem',
      padding: '2.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '3rem'
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
      border: '1px solid #E5E7EB'
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
    explanationCard: {
      background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
      borderRadius: '1rem',
      padding: '2.5rem',
      border: '1px solid #C7D2FE',
      marginBottom: '3rem'
    },
    explanationTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#4F46E5',
      marginBottom: '1.5rem'
    },
    explanationText: {
      color: '#4338CA',
      marginBottom: '2rem',
      lineHeight: '1.6'
    },
    explanationGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem'
    },
    explanationItem: {
      background: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem'
    },
    explanationItemTitle: {
      fontWeight: '600',
      color: '#4F46E5',
      marginBottom: '0.5rem',
      fontSize: '0.875rem'
    },
    explanationItemText: {
      fontSize: '0.875rem',
      color: '#6B7280',
      lineHeight: '1.5'
    },
    buttonContainer: {
      display: 'flex',
      gap: '1.5rem',
      justifyContent: 'center'
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

  // Default values if analysis is incomplete
  const safeAnalysis = {
    score: 0,
    totalQuestions: 10,
    avgTimePerQuestion: '0',
    suspicionLevel: 'NONE',
    classification: 'No data available',
    flagSum: '0',
    cv: '0',
    repetition: '0',
    entropy: '0',
    compression: '0',
    totalEvents: 0,
    clicks: 0,
    mouseMovements: 0,
    ...analysis
  };

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
              {/* Score Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <TrendingUp size={24} style={{ color: '#4F46E5' }} />
                  <span>Quiz Performance</span>
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

              {/* Detection Card */}
              <div style={styles.detectionCard(borderColor)}>
                <div style={styles.cardHeader}>
                  <Shield size={24} style={{ color: borderColor }} />
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
                    {safeAnalysis.suspicionLevel || 'ANALYZED'}
                  </div>
                  <div style={styles.detectionText}>
                    {safeAnalysis.classification}
                  </div>
                  <div style={styles.flagScore}>
                    Flag Score: {safeAnalysis.flagSum} / 4.0
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Metrics */}
            <div style={styles.metricsCard}>
              <div style={styles.cardHeader}>
                <Activity size={24} style={{ color: '#4F46E5' }} />
                <span>Analysis Metrics</span>
              </div>
              <div style={styles.metricsGrid}>
                {/* Timing CV */}
                <div style={styles.metricBox}>
                  <div style={styles.metricHeader}>
                    <span style={styles.metricLabel}>Timing Consistency</span>
                    {parseFloat(safeAnalysis.cv) < 0.10 || parseFloat(safeAnalysis.cv) < 0.25 ? (
                      <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                    ) : (
                      <CheckCircle size={16} style={{ color: '#10B981' }} />
                    )}
                  </div>
                  <div style={styles.metricValue}>{safeAnalysis.cv}</div>
                  <div style={styles.metricStatus(parseFloat(safeAnalysis.cv) < 0.10)}>
                    {parseFloat(safeAnalysis.cv) < 0.10 ? '⚠️ Too Consistent' : 
                     parseFloat(safeAnalysis.cv) >= 0.25 ? '✓ Normal' : 
                     '⚠️ Suspicious'}
                  </div>
                </div>

                {/* Repetition */}
                <div style={styles.metricBox}>
                  <div style={styles.metricHeader}>
                    <span style={styles.metricLabel}>Pattern Repetition</span>
                    {parseFloat(safeAnalysis.repetition) >= 80 ? (
                      <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                    ) : (
                      <CheckCircle size={16} style={{ color: '#10B981' }} />
                    )}
                  </div>
                  <div style={styles.metricValue}>{safeAnalysis.repetition}%</div>
                  <div style={styles.metricStatus(parseFloat(safeAnalysis.repetition) >= 80)}>
                    {parseFloat(safeAnalysis.repetition) >= 80 ? '⚠️ High' : '✓ Normal'}
                  </div>
                </div>

                {/* Entropy */}
                <div style={styles.metricBox}>
                  <div style={styles.metricHeader}>
                    <span style={styles.metricLabel}>Randomness</span>
                    {parseFloat(safeAnalysis.entropy) < 2.3 ? (
                      <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                    ) : (
                      <CheckCircle size={16} style={{ color: '#10B981' }} />
                    )}
                  </div>
                  <div style={styles.metricValue}>{safeAnalysis.entropy}</div>
                  <div style={styles.metricStatus(parseFloat(safeAnalysis.entropy) < 2.3)}>
                    {parseFloat(safeAnalysis.entropy) < 2.3 ? '⚠️ Low' :
                     parseFloat(safeAnalysis.entropy) < 3.0 ? '⚠️ Suspicious' :
                     '✓ Normal'}
                  </div>
                </div>

                {/* Compression */}
                <div style={styles.metricBox}>
                  <div style={styles.metricHeader}>
                    <span style={styles.metricLabel}>Pattern Complexity</span>
                    {parseFloat(safeAnalysis.compression) <= 0.60 ? (
                      <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                    ) : (
                      <CheckCircle size={16} style={{ color: '#10B981' }} />
                    )}
                  </div>
                  <div style={styles.metricValue}>{safeAnalysis.compression}</div>
                  <div style={styles.metricStatus(parseFloat(safeAnalysis.compression) <= 0.60)}>
                    {parseFloat(safeAnalysis.compression) <= 0.60 ? '⚠️ Too Simple' :
                     parseFloat(safeAnalysis.compression) <= 0.85 ? '⚠️ Suspicious' :
                     '✓ Normal'}
                  </div>
                </div>
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
                    {startTime ? ((Date.now() - startTime) / 1000).toFixed(0) : '0'}s
                  </div>
                  <div style={styles.statLabel}>Total Time</div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div style={styles.explanationCard}>
              <h3 style={styles.explanationTitle}>How Detection Works</h3>
              <p style={styles.explanationText}>
                This system analyzes your interaction patterns through four key metrics to ensure academic integrity:
              </p>
              <div style={styles.explanationGrid}>
                <div style={styles.explanationItem}>
                  <h4 style={styles.explanationItemTitle}>1. Timing Consistency</h4>
                  <p style={styles.explanationItemText}>
                    Measures how consistent your click timings are. Natural human behavior shows variation.
                  </p>
                </div>
                <div style={styles.explanationItem}>
                  <h4 style={styles.explanationItemTitle}>2. Pattern Repetition</h4>
                  <p style={styles.explanationItemText}>
                    Looks for repeated patterns in your behavior that might indicate automation.
                  </p>
                </div>
                <div style={styles.explanationItem}>
                  <h4 style={styles.explanationItemTitle}>3. Randomness Level</h4>
                  <p style={styles.explanationItemText}>
                    Checks how unpredictable your actions are. Automated systems show predictable patterns.
                  </p>
                </div>
                <div style={styles.explanationItem}>
                  <h4 style={styles.explanationItemTitle}>4. Pattern Complexity</h4>
                  <p style={styles.explanationItemText}>
                    Evaluates the complexity of your interaction patterns over time.
                  </p>
                </div>
              </div>
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