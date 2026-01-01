# AUTOMATA-G13 (Quiz Behavior Detector)

This project is a quiz app that records interaction events during a session and produces a behavior-based classification: **Human**, **Caution**, or **Suspicious**.

Behavior evidence is computed from:
- Session-level metrics (computed across the whole attempt)
- Window-level metrics (computed per 5-second window)

The UI also includes a Turing Machine–inspired visualization showing:
- An input tape (raw events)
- An output tape (per-window metric tokens)

## Formal DFA-like Model (Aggregated Evidence)

The implementation is **automata-inspired**: it uses a finite set of states and a deterministic mapping from observed symbols/evidence to a final state. It does **not** implement a classic step-by-step DFA transition function $\delta(q, a)$ over a single symbol stream.

### States

Let the state set be:
$$Q = \{q_{human},\ q_{caution},\ q_{suspicious}\}$$

### Per-window symbols

Events are partitioned into 5-second windows. For each window, the analyzer computes 4 metric flags:
$$\{T, R, E, C\} \in \{h, c, s, n\}$$

Where:
- $h$ = human-like
- $c$ = caution
- $s$ = suspicious
- $n$ = not enough data

The output tape token is rendered as:

`T_h | R_c | E_n | C_h`

### Evidence aggregation

Across all valid windows, the implementation counts how many per-window metric flags are suspicious or caution:

$$suspiciousRatio = \frac{\#(s)}{validWindows \times 4}$$
$$cautionRatio = \frac{\#(c)}{validWindows \times 4}$$

In parallel, it computes a session-level score `flagSum` by converting each metric into a discrete flag in $\{0, 0.5, 1\}$ (plus a keyboard-dominance flag) and summing them.

### Deterministic final-state selection

The final DFA state is selected deterministically from the aggregated evidence:
- Strong evidence of automation-like behavior maps to $q_{suspicious}$
- Moderate evidence maps to $q_{caution}$
- Otherwise maps to $q_{human}$

This choice is implemented in [src/utils/analysisHelpers.js](src/utils/analysisHelpers.js).

