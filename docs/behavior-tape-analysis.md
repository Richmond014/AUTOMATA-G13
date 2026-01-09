# Behavior Tape Analysis (Turing‑Inspired Framing)

This project can be understood as a **multi‑pass behavior “tape” analyzer**:
raw user interaction events are treated like symbols on an input tape, segmented
into fixed‑time “cells,” transformed into per‑cell metric flags, and then reduced
to a final deterministic state (**Human / Caution / Suspicious**).

This is *inspired* by Turing machines and automata (tapes, symbols, deterministic state selection),
but it is not a literal universal Turing machine, and it is not a classic DFA that transitions on a
single symbol stream $\delta(q, a)$. Instead, it is a deterministic pipeline with discrete
intermediate representations (tokens).

## 1) Input tape alphabet

The recorded event stream is the “input tape.” Each event has a `type` (and metadata), e.g.:

- `M` mouse move
- `C` click
- `H` hover
- `S` scroll
- `T` tab away
- `R` tab return

So the input tape is a time‑ordered sequence:

$$\langle e_0, e_1, \dots, e_n \rangle$$

## 2) Cell partition (time‑window tape cells)

The analyzer performs a first pass that partitions events into fixed‑duration cells
(default **5 seconds**). This defines a discrete tape of time windows:

$$Cell_i = \{ e \mid t_i \le t(e) < t_{i+1} \}$$

Implementation:
- Partitioning into 5s cells happens in [src/utils/analysisHelpers.js](../src/utils/analysisHelpers.js).
- The visualization uses the same 5s concept in [src/utils/tapeSimulation.js](../src/utils/tapeSimulation.js).

## 3) Per‑cell feature pass: compute `T/R/E/C` flags

For each cell, the analyzer computes four metric flags:

$$\{T,R,E,C\} \in \{h, c, s, n\}$$

Where:
- `h` = human‑like
- `c` = caution
- `s` = suspicious
- `n` = not enough data (metric not reliable in that cell)

Metric meanings (high‑level):
- **T (Timing):** regularity of click intervals (very low variance can be bot‑like)
- **R (Repetition):** repeated interaction patterns in the event sequence
- **E (Entropy):** low diversity / predictability of meaningful event types
- **C (Compressibility):** highly compressible interaction sequences (plus a “zero mouse moves” signal)

Key idea: this is the “multi‑pass” part—raw events are transformed into a much smaller, discrete
per‑cell representation.

## 4) Output tape: write per‑cell tokens

Each analyzed cell becomes a token on an “output tape.” Conceptually:

`T_s R_h E_c C_n`

Implementation:
- Token construction/formatting is in [src/utils/tapeSimulation.js](../src/utils/tapeSimulation.js).
- The UI renders the output tape in [src/components/ResultScreen.jsx](../src/components/ResultScreen.jsx).

This is directly analogous to a machine that *reads* input symbols and *writes* derived symbols
to another tape.

## 5) Aggregation pass: reduce the output tape to a scalar score

After all cells are analyzed, the system aggregates evidence across all **valid cells**.

Definitions:
- A cell is **valid** if it has enough data and contributes at least one observed metric among `T/R/E/C`
  (i.e., at least one of `h/c/s`).
- Let `validCells` be the number of valid cells.
- Let $\#s$ be the total count of suspicious flags across all valid cells and metrics.
- Let $\#c$ be the total count of caution flags across all valid cells and metrics.
- Total metric slots (coverage‑aware denominator):

$$denomTotal = validCells \times 4$$

Coverage‑aware ratios:

$$suspiciousRatioTotal = \frac{\#s}{denomTotal}$$
$$cautionRatioTotal = \frac{\#c}{denomTotal}$$

Weighted score (suspicious weighs more than caution), normalized to $[0,1]$:

$$weightedScoreTotal = \frac{2\#s + 1\#c}{2 \cdot denomTotal}$$

Implementation:
- Aggregation + scoring is in [src/utils/analysisHelpers.js](../src/utils/analysisHelpers.js).

## 6) Deterministic state selection (automata‑style)

The analyzer maps the aggregate score to a discrete state:

- **InsufficientData** if `validCells < 2` or there are no observed metrics
- **Suspicious** if `weightedScoreTotal >= 0.32`
- **Caution** if `weightedScoreTotal >= 0.24`
- Else **Human**

This is an automata‑style “final state selection”: deterministic, discrete, and based on the
summarized evidence computed from the output tape.

## 7) How the visualization supports the framing

The Result screen shows two synchronized views:
- Input tape: the event stream with a moving “read head”
- Output tape: per‑cell tokens written as the read head progresses through time

This makes the pipeline visible:

read → segment → analyze → write token → aggregate → classify
