# AUTOMATA-G13 (Quiz Behavior Detector)

This project is a quiz app that records interaction events during a session and produces a behavior-based classification: **Human**, **Caution**, or **Suspicious**.

Behavior evidence is computed primarily from **cell/window-level metrics** (computed per 5-second cell).

The UI also includes a Turing Machine–inspired visualization showing:
- An input tape (raw events)
- An output tape (per-cell metric tokens)

See the conceptual write-up: [docs/behavior-tape-analysis.md](docs/behavior-tape-analysis.md).

## Formal DFA-like Model (Aggregated Evidence)

The implementation is **automata-inspired**: it uses a finite set of states and a deterministic mapping from observed symbols/evidence to a final state. It does **not** implement a classic step-by-step DFA transition function $\delta(q, a)$ over a single symbol stream.

### States

Let the state set be:
$$Q = \{q_{human},\ q_{caution},\ q_{suspicious}\}$$

### Per-cell symbols

Events are partitioned into 5-second cells. For each cell, the analyzer computes 4 metric flags:
$$\{T, R, E, C\} \in \{h, c, s, n\}$$

Where:
- $h$ = human-like
- $c$ = caution
- $s$ = suspicious
- $n$ = not enough data

The output tape token is rendered as:

`T_s R_h E_c C_n`

### Evidence aggregation

Across all **valid cells**, the implementation counts how many per-cell metric flags are suspicious or caution.

Let:
- `validCells` = number of cells that contribute at least one observed metric (`h/c/s`)
- `denomTotal = validCells \times 4` (coverage-aware denominator)

Coverage-aware ratios:
$$suspiciousRatioTotal = \frac{\#(s)}{validCells \times 4}$$
$$cautionRatioTotal = \frac{\#(c)}{validCells \times 4}$$

Weighted score (suspicious weighs more than caution):
$$weightedScoreTotal = \frac{2\#(s) + 1\#(c)}{2\cdot(validCells \times 4)}$$

### Deterministic final-state selection

The final DFA state is selected deterministically from the aggregated evidence:
- Strong evidence of automation-like behavior maps to $q_{suspicious}$
- Moderate evidence maps to $q_{caution}$
- Otherwise maps to $q_{human}$

Thresholds (current implementation):
- InsufficientData if `validCells < 2` (or no observed metrics)
- Suspicious if `weightedScoreTotal >= 0.32`
- Caution if `weightedScoreTotal >= 0.24`

This choice is implemented in [src/utils/analysisHelpers.js](src/utils/analysisHelpers.js).

