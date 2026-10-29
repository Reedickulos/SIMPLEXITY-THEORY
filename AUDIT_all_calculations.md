# Audit Record: every calculation run in this conversation

**Prepared:** October 26, 2026   |   **Prepared by:** Claude (assistant), at the author's request   |   **For:** independent cross-checking by the author and other reviewers

## 0. How to use this document

This is the single record of every calculation that was run (or stated analytically) in the conversation. It is built so you can check two things for each calculation:

1. **Alignment:** were the inputs yours, or did I (or a pasted review, or standard physics) add something you hadn't agreed to?
2. **Manner:** was the calculation done in the way your concept needs, or did it drift into something adjacent?

**Everything quoted in the "Captured output" boxes was produced by re-running the scripts for this document, not copied from memory.** The scripts are in Appendix B in full. If any sentence I wrote under "Reported in the thread" differs from the captured output, the captured output is correct, and the difference is itself something to flag.

**Origin tags used for every input**

| Tag | Meaning |
|---|---|
| **[YOU]** | a premise, instruction, or idea you stated |
| **[REVIEW]** | introduced by a pasted model-written review (drafts of unknown origin, not your endorsed position) |
| **[ME]** | a choice or addition I made without asking you |
| **[STD-MATH]** | standard mathematics (a theorem, identity, or textbook construction) |
| **[STD-PHYS]** | borrowed from standard physics (for example the singlet formula E = -cos(theta), the CHSH expression, entanglement measures, the Born rule) |

**Cosmetic note on outputs:** numpy printed some numbers wrapped as `np.float64(...)`; I removed those wrappers. No digits were altered.

**Numerical precision (applies to everything):** all computations are Python float64. `pi = 3.141592653589793`, `phi = (1 + 5**0.5)/2 = 1.618033988749895`, machine epsilon 2.22e-16. Pair-counting tests used a tolerance of 1e-6 (some 1e-8 or 1e-9, stated per script). Values printed as "1.000000" are rounded to 6 decimals. Agreement of "exact" quantities was typically about 1e-15.

---

## 1. The most important finding of this audit (read this first)

**The central test of your concept was never computed.** Your premises, as you stated them, are: one bulk object is projected; there is a geometric relationship between two projections of the same object (not a correlation between separate systems); measurement fixes a projection angle and nothing collapses; golden ratio determines the shape; the space is 8-dimensional; going from the 3D perception to the 8D reality takes multiple folds.

What was actually computed is mostly the **geometry of a particular construction** (the 240 E8 roots, projected, with a golden-ratio structure appearing in special windows), plus **CHSH numbers that use the standard singlet formula**. Specifically:

* No calculation took one object, cut it at two projection angles, and derived the joint relationship from the geometry. (Closest: C02, which shows that two alternative measurement directions on one sector of the invariant tensor leave the other two sectors in states whose overlap equals the cosine of the angle between the directions. That is an inner-product fact, not a derivation of correlations.)
* No calculation modelled "measurement as fixing a projection angle".
* No calculation produced the multi-step folding from the 3D perception up to 8D. The folding calculations (C24, C27, C28) fold a diagram or an octahedron net, which is a different thing.
* No calculation addressed the Fermi-paradox claim.
* The CHSH tables (C11, C12, C13) use standard physics as the yardstick. You later said you do not treat standard results as benchmarks. Those results were computed before that instruction and should be read accordingly.

The sections below show where each drift entered.

---

## 2. Summary table of all calculations

| ID | What was computed | Inputs from you | Added by me / a review / standard physics | Uses standard physics? | Script |
|---|---|---|---|---|---|
| C01 | Invariant trilinear tensor T read as a three-party state: entropies, entanglement | trilinear form as foundation | [ME] read T as a quantum state; [STD-PHYS] entropy, negativity | **Yes** | 01 |
| C02 | Steering: measuring one sector along c leaves the other two in a state; overlap vs angle | trilinear form | [ME] definition of "steered state" | Partly (name only) | 02 |
| C03 | 240 E8 roots; diagonal triality tau and transposition sigma permute them | triality | [REVIEW] E8 / D4xD4 plan; [ME] code | No | 03 |
| C04 | Coxeter-eigenspace projection to 4D: two shells, ratio phi squared, 600-cell inner products | golden ratio, 8D | [REVIEW] icosian E8 to H4 projection; [ME] construction | No | 03 |
| C05 | Does triality preserve the projection plane? fixed alignment and 300,000 random alignments | triality | [REVIEW] equivariance test; [ME] sampling | No | 03 |
| C06 | Icosahedron from your image: radii along 3-fold axis, edges, equiangular axes | your image, golden ratio | [ME] read it as an icosahedron; [STD-MATH] coordinates | No | 10 |
| C07 | Icosahedron as vertex figure of the 600-cell, computed from the E8 projection | (derived) | [ME] | No | 04 |
| C08 | View along the triality axis in alignments where triality acts | your image | [ME] | No | 05 |
| C09 | Same-direction partners across the two shells; 8D relation; hidden-space radii | (derived) | [ME] | No | 06 |
| C10 | Overlap/collision counts in 4D, 2D and 3D views | "no overlap in 2D, but in 6 or 8?" | [ME] method | No | 07 |
| C11 | Max CHSH value when measurement directions are axes of octahedron, cube, icosahedron, dodecahedron | angles produced by geometry | [STD-PHYS] E=-cos(theta), CHSH; [ME] direction sets | **Yes** | 08 |
| C12 | Max CHSH with golden-ratio angle grids; closed form 2*phi - 1/2 | "use the golden ratio" | [STD-PHYS] same; [ME] grid choices | **Yes** | 09 |
| C13 | Baseline "shared hidden direction" rule: CHSH = 2; singlet identity | (my baseline) | [STD-PHYS] | **Yes** | 12 (X5) |
| C14 | Icosahedron view: visible vs hidden ratios (phi, phi^-3); depth-flip ambiguity | "picture is a 2D representation" | [ME] | No | 12 (X4) |
| C15 | Four perpendicular planes A,B,C,D; rings; phi-paired rings; rebuild error | "how do you represent 8D" | [ME] plane decomposition | No | 11 (s1-2) |
| C16 | Ring angular grid (12 degrees); golden angle not on it | "angle set by golden ratio?" | [ME] | No | 12 (X2) |
| C17 | pi meets phi: decagon edge = inner radius; pentagon diagonal/side = phi; arc vs chord | "C = pi d, places where they meet" | [ME] chose decagon/pentagon | No | 11 (s2) |
| C18 | 4D view: shell ratio, 600-cell edge = inner radius, 72 decagon planes, 6 per vertex | "intersections dimensionally" | [ME] | No | 11 (s3) |
| C19 | 4D to 3D projections: what survives of C18 | "3D doesn't hold because of projection loss" | [ME] measures | No | 11 (s4) |
| C20 | Chain 8D down to 2D: shells, phi-parallel pairs, 36/72-degree pairs, edge length; random frames; 8D angles | "8 down to 3 and every dimension between" | [ME] prefix chain, measures | No | 11 (s5), 12 (X1) |
| C21 | Length lost per step = sqrt(d/8); restoring factors vs powers of phi | "apply the ratio at every step" | [ME] | No | 12 (X6), 11 (s5) |
| C22 | k factors of phi (k=1,2,3) per dimension; weighting hidden planes | "ratio multiplied when stepping up" | [ME] my reading of the rule | No | 11 (s6), 12 (X3) |
| C23 | Eight orbits of 30 roots; their four radii; phi-partner scaling (x phi, x phi, x 1/phi, x 1/phi) | "C = 2 pi r as necessity" | [ME] | No | 11 (s7) |
| C24 | "Fold" visible over hidden: which combinations of radii are invariant | "how would you fold the second diagram" | [ME] defined fold = overlay + product | No | 13 |
| C25 | Eight axes seen through an XYZ window: lengths, inner products | "represent XYZ and 8 axes" | [ME] tetrahedral window | No | 14 |
| C26 | Four planes centered at the origin (tetrahedral tilt) | "centered at 0" | [ME] tilt choice | No | 14, 15 |
| C27 | Octahedron as folding template: face normals, fold angle, hinges | "use the octahedron as template" | [ME] face-to-plane labelling | No | 15 |
| C28 | 3D hinge-fold illustration (figure) | "represent the fold in 3D" | [ME] 180 degree hinge | No | 16 |
| C29 | Precision and tolerances | "how many decimals of pi" | -- | No | 12 header |

Analytic statements (not run in code) are listed in section 4.

---

## 3. Calculation records

### C01 — Invariant tensor as a three-party state

* **Triggered by:** You asked how entanglement would operate with triality as a constant; I proposed testing the trilinear form directly.
* **What was computed:** Built the octonion multiplication table (Fano plane), checked |xy|=|x||y|, formed T_abc = Re((e_a e_b) e_c), normalised it as a state, and computed each party's entropy, the two-party entropy, and the two-party partial-transpose negativity.
* **Inputs and their origin:** [YOU] the invariant trilinear form 8v x 8s x 8c -> R. [ME] realising it with octonions; [ME] reading the tensor as a quantum state (a framing choice you did not give). [STD-PHYS] von Neumann entropy and negativity as the measures.
* **Uses standard physics?** Yes: the entanglement measures are standard quantum-information definitions.
* **Script:** `01_octonion_tripartite_state.py`
* **Tolerance / precision:** float64; eigenvalue cutoff 1e-12 for entropy
* **Reported in the thread:** Each party alone is maximally mixed (entropy 3 bits, the maximum). Any two together have entropy 3 bits and negativity 0.75 (the maximum for two 8-dimensional systems would be 3.5, an analytic value).
* **Alignment questions:** Is reading T as a quantum state acceptable in your framework, or does that import quantum mechanics you do not accept?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output (script re-run for this document):**

```text
algebra check |xy|=|x||y| (octonion property): True
nonzero entries: 64 entries in {-1,0,1}: {0.0, 1.0, -1.0}
party A (8_v-like) entropy (bits): 3.0 max possible: 3 rho=I/8: True
party B (8_s-like) entropy (bits): 3.0 max possible: 3 rho=I/8: True
party C (8_c-like) entropy (bits): 3.0 max possible: 3 rho=I/8: True
rho_AB: entropy 3.0 bits
partial transpose min eigenvalue: -0.09375 negativity: 0.75
```

### C02 — Steering overlap equals cos(angle)

* **Triggered by:** You asked what the invariant alone gives; you also said angles produced by geometry are the point.
* **What was computed:** For 2000 random unit directions in one sector, contracted T with that direction to get the state of the other two sectors; checked it is a (scaled) orthogonal matrix and that the overlap of two such states equals the inner product of the two directions.
* **Inputs and their origin:** [YOU] T. [ME] the definition of a steered state (contraction with a unit vector). Random seed 0.
* **Uses standard physics?** Only the word 'steering'. The computation is pure inner-product algebra; no Born rule was used.
* **Script:** `02_octonion_steering.py`
* **Tolerance / precision:** errors ~1e-16
* **Reported in the thread:** Maximum error of orthogonality 4.4e-16; maximum error of overlap = c1.c2 is 3.3e-16.
* **Alignment questions:** These are two alternative projections of one sector, not two simultaneous measurements at two places; the angle is an 8D angle. Does this match your 'two projections of the same object'?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output (script re-run for this document):**

```text
steered AB state is maximally entangled (matrix orthogonal), max error: 4.440892098500626e-16
overlap of steered states = cos(angle between the two C-directions), max error: 3.3306690738754696e-16
```

### C03 — E8 roots and diagonal triality

* **Triggered by:** A pasted review proposed testing whether triality lifts to E8 and whether the icosian projection respects it; you asked me to look at that review.
* **What was computed:** Built the 240 E8 roots (112 + 128), a diagonal triality tau (the same order-3 map of the D4 Cartan on both D4 factors), and a transposition sigma, and checked that they permute the root set and satisfy sigma tau sigma = tau^-1.
* **Inputs and their origin:** [REVIEW] the E8 / D4xD4 construction and the 'diagonal triality' plan. [ME] explicit matrices. [STD-MATH] root system.
* **Uses standard physics?** No.
* **Script:** `03_E8_triality_icosian.py` (first part)
* **Tolerance / precision:** exact permutation checks
* **Reported in the thread:** tau and sigma both permute the 240 roots; the S3 relation holds.
* **Alignment questions:** E8 was not an input from you. Do you want E8 in the framework at all?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C04 — Projection to a 4D 'view': two shells with ratio phi

* **Triggered by:** Same pasted review (icosian cut-and-project).
* **What was computed:** Took the real 4D subspace spanned by the Coxeter-element eigenvectors with exponents 1 and 11 (and their conjugates), projected the 240 roots, and measured the radii and inner products.
* **Inputs and their origin:** [REVIEW] the icosian E8 to H4 projection idea. [ME] the specific Coxeter-eigenspace construction. [STD-MATH].
* **Uses standard physics?** No.
* **Script:** `03_E8_triality_icosian.py` (second part)
* **Tolerance / precision:** shell norms printed to 6 decimals, so the printed ratio 2.6180366 differs from phi^2 = 2.6180340 only in the 6th decimal because of that rounding
* **Reported in the thread:** Two shells of 120 points; radius ratio phi (norm-squared ratio phi^2); outer-shell inner products are exactly the nine 600-cell values.
* **Alignment questions:** Is a 4D view of an 8D root system the structure you want?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C05 — Does triality preserve the projection plane? (alignment test)

* **Triggered by:** Same pasted review, item (c).
* **What was computed:** (a) at the one alignment built in C04: residual of tau and sigma on the 4D subspace. (b) rotated that subspace by 300,000 random Weyl-group elements (80 random reflections each, seed 1) and counted alignments where tau, or tau and sigma, preserve it.
* **Inputs and their origin:** [REVIEW] the test; [ME] the sampling method and sample size.
* **Uses standard physics?** No.
* **Script:** `03_E8_triality_icosian.py` (third part)
* **Tolerance / precision:** invariance residual < 1e-8; sampling estimate (not an exact count)
* **Reported in the thread:** Fixed alignment: tau fails (residual 1.26), sigma passes. Random alignments: 620 of 300,000 (about 0.2%) are tau-invariant; 486 of those are also sigma-invariant; tau acts as an order-3 rotation with eigenvalues {1,1,omega,omega-bar}.
* **Alignment questions:** I concluded that alignment is a gauge choice, so the test is weak. The 0.2% is a sampling estimate. Does this matter to your concept?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output (script re-run for this document):**

```text
roots 240
T orthogonal True order3 True
(i) tau permutes the 240 roots: True
    sigma permutes roots: True  S3 relation sig tau sig = tau^-1: True
Coxeter exponents [1, 7, 11, 13, 17, 19, 23, 29]
projected norm^2 values/counts {0.552786: 120, 1.447214: 120} ratio 2.6180366362389784 phi^2 2.618033988749895
outer shell inner products subset of 600-cell set: True 9
(c) fixed alignment: tau residual 1.2649110640673518 sigma residual 1.8020320139715477e-15
tau-invariant among 300000 random W(E8)-conjugates of V: 620
tau eigenvalues on V: [-0.5+0.866j -0.5-0.866j  1. +0.j     1. +0.j   ]
of those, also sigma-invariant: 486
```

### C06 — Icosahedron from your image

* **Triggered by:** You sent the icosahedron picture and asked what the golden-ratio geometry gives.
* **What was computed:** Built an icosahedron (vertices (0,+-1,+-phi) cyclic), projected along a 3-fold axis, and measured radii, edges, vertex degrees, and the angles between the six axes.
* **Inputs and their origin:** [YOU] the image and the golden ratio. [ME] reading the image as an icosahedron along a 3-fold axis. [STD-MATH] coordinates.
* **Uses standard physics?** No.
* **Script:** `10_icosahedron_geometry.py`
* **Tolerance / precision:** float64
* **Reported in the thread:** Outer/inner hexagon radius ratio 1.6180; 30 edges, degree 5; the 6 axes are pairwise at arccos(1/sqrt5) = 63.43 degrees.
* **Alignment questions:** Did I identify your image correctly?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output (script re-run for this document):**

```text
12 vertices; projected radii along the 3-fold axis (1,1,1): {0.6071: 6, 0.9822: 6}
outer/inner radius ratio: 1.6179  (phi=1.6180)  image estimate ~1.645
edges: 30 each vertex degree: {5}
6 axes (antipodal pairs): |cos| between every pair of axes: [0.4472]  1/sqrt5=0.4472  angle=63.43 deg
```

### C07 — Icosahedron as the vertex figure of the 600-cell

* **Triggered by:** Following C04 and C06, to check whether the icosahedron arises from the 8D structure.
* **What was computed:** In the outer 4D shell, took one vertex, found its nearest neighbours (inner product phi/2), and checked their geometry.
* **Inputs and their origin:** [ME]; [STD-MATH] vertex-figure concept.
* **Uses standard physics?** No.
* **Script:** `04_icosahedron_vertex_figure.py`
* **Tolerance / precision:** tolerance 1e-4 for neighbour selection
* **Reported in the thread:** 12 neighbours; pairwise inner products +-1 and +-1/sqrt5; each vertex has 5 neighbours and one antipode: an icosahedron.
* **Alignment questions:** Is 'vertex figure' (a local cross-section) an acceptable stand-in for your 3D 'perception'?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output (script re-run for this document):**

```text
outer-shell vertices: 120 | nearest neighbours of one vertex (inner product phi/2): 12
pairwise inner products among the 12 (icosahedron should give +-1, +-1/sqrt5=0.4472): [-1.0, -0.4472, 0.4472, 1.0]
each vertex has exactly 5 neighbours at 1/sqrt5: True | one antipode: True
```

### C08 — View along the triality axis

* **Triggered by:** You asked whether the picture you sent corresponds to triality.
* **What was computed:** Using the alignments from C05 where tau and sigma both act, found vertices fixed by tau, checked tau permutes their 12 neighbours, and viewed the neighbours along tau's rotation axis.
* **Inputs and their origin:** [ME]; uses C05 alignments (found by random search).
* **Uses standard physics?** No.
* **Script:** `05_triality_axis_view.py`
* **Tolerance / precision:** tolerance 1e-6
* **Reported in the thread:** tau fixes 6 outer vertices; its axis is a 3-fold axis (4 heights x 3 points); the view along it gives two hexagons with radius ratio 1.618.
* **Alignment questions:** This only holds in the alignments found by search. Is that acceptable?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output (script re-run for this document):**

```text
tau- and sigma-invariant alignments found: 486
alignment #1161: tau-fixed outer vertices: 6; tau permutes the 12 neighbours: True
  heights along tau's axis (count per value): {-0.7947: 3, -0.1876: 3, 0.1876: 3, 0.7947: 3}
  distance from axis (two hexagon radii): [0.6071, 0.9822]  ratio 1.6179
alignment #1354: tau-fixed outer vertices: 6; tau permutes the 12 neighbours: True
  heights along tau's axis (count per value): {-0.7947: 3, -0.1876: 3, 0.1876: 3, 0.7947: 3}
  distance from axis (two hexagon radii): [0.6071, 0.9822]  ratio 1.6179
```

### C09 — Same-direction partners across the shells

* **Triggered by:** You asked about overlap and 'perceived pairs'. You later said perceived entangled points do not exist, so I retracted that label.
* **What was computed:** Matched each outer-shell root to the inner-shell root in the same direction; computed their 8D inner product and distance; compared radii in the visible and hidden 4D spaces.
* **Inputs and their origin:** [ME].
* **Uses standard physics?** No.
* **Script:** `06_same_direction_pairs.py` (one printed label was wrong in the first run and is corrected here: the two 4D spaces span all 8D, so the rebuild error 0.0 is exact)
* **Tolerance / precision:** tolerance 1e-6
* **Reported in the thread:** Each outer root has exactly one same-direction inner partner; they are orthogonal in 8D (inner product 0, distance 2); roots outer in the visible space are inner in the hidden space (radii 0.7435 and 1.203, ratio 1.618).
* **Alignment questions:** The partners are two distinct 8D points that look parallel after the hidden part is dropped. Is that the idea of 'projection loss' you mean?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output (script re-run for this document):**

```text
parallel space: outer shell 120 inner shell 120 | radius ratio 1.618
perp space radii (outer-in-parallel roots): {0.7435} inner-in-parallel: {1.203}
each outer root has exactly one inner root in the same direction: {1} | each inner has one: {1}
8D inner products between a root and its same-direction partner: {0.0}
8D distance between partners: {2.0}
(parallel,perp) pair rebuilds the 8D root (two 4D spaces span all 8D); rebuild error: 0.0
```

### C10 — Overlap (collision) counts

* **Triggered by:** You asked: 'There is no overlap in 2D, but in 6 or 8?'
* **What was computed:** Counted distinct image points among the 240 roots in the 4D view, the 2D Coxeter plane, and 3D/2D projections of the 4D view (generic and along a vertex axis).
* **Inputs and their origin:** [ME] method.
* **Uses standard physics?** No.
* **Script:** `07_overlap_counts.py`
* **Tolerance / precision:** rounding 1e-6
* **Reported in the thread:** 240 distinct in the 4D view and the 2D Coxeter plane (8 rings of 30); 240 for generic 3D/2D projections; 137 distinct when looking along a vertex axis.
* **Alignment questions:** 'Overlap' here means coincident points. Did you mean that, or overlap of something else?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output (script re-run for this document):**

```text
8D roots: 240 -> 4D view distinct points: 240
-> 2D Coxeter-plane view distinct points: 240 | rings: 8 | points per ring: [30]
4D view -> 3D looking along a 600-cell vertex axis: 240 points -> distinct 137
4D view -> 3D looking along a generic axis: distinct 240
4D view -> 2D along a generic plane: distinct 240
```

### C11 — CHSH ceiling for discrete direction sets

* **Triggered by:** You said the geometric angles the slice produces are the point; I tested sets of directions from symmetric solids.
* **What was computed:** For each direction set (octahedron, cube, icosahedron, dodecahedron, unions), enumerated every choice of four settings (each direction and its opposite) and computed the largest |E(a,b)+E(a,b')+E(a',b)-E(a',b')| with E = -a.b.
* **Inputs and their origin:** [YOU] geometric angles matter. [STD-PHYS] E = -a.b (the singlet correlation) and the CHSH expression. [ME] which solids and unions.
* **Uses standard physics?** **Yes.** You later said standard results are not benchmarks; this table is only meaningful if you accept the singlet formula as the rule for the correlation.
* **Script:** `08_chsh_discrete_direction_sets.py`
* **Tolerance / precision:** exact enumeration
* **Reported in the thread:** Octahedron 2.0000; cube 2.0000; icosahedron 2.3416; dodecahedron 2.5694; icosahedron+dodecahedron 2.6680; octahedron+cube 2.4880; continuous 2.8284.
* **Alignment questions:** Do you accept E = -cos(theta) as the way to compute any of this? If not, this table should be set aside.
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output (script re-run for this document):**

```text
octahedron (3 axes)          max CHSH = 2.0000
cube (4 axes)                max CHSH = 2.0000
icosahedron (6 axes)         max CHSH = 2.3416
dodecahedron (10 axes)       max CHSH = 2.5694
icosa+dodeca (16 axes)       max CHSH = 2.6680
octa+cube (7 axes)           max CHSH = 2.4880
standard quantum (continuous directions): 2*sqrt2 = 2.8284
```

### C12 — CHSH with golden-ratio angle grids

* **Triggered by:** You said 'use the golden ratio'.
* **What was computed:** Computed the maximum CHSH for settings on planar grids of 72, 36, 18 and 45 degrees, and the closed form S(d) = 3cos d - cos 3d for equally spaced settings.
* **Inputs and their origin:** [YOU] golden ratio. [STD-PHYS] E = -cos(theta). [ME] chose 72/36/18/45 degree grids (36 and 72 because cos 36 = phi/2).
* **Uses standard physics?** **Yes** (same caveat as C11).
* **Script:** `09_chsh_phi_angle_grids.py`
* **Tolerance / precision:** exact enumeration on the grids
* **Reported in the thread:** 72 and 36 degree grids: 2.736068 = 2*phi - 1/2; 18 degrees: 2.793604; 45 degrees: 2.828427.
* **Alignment questions:** I presented 2*phi - 1/2 as a possible prediction 'if allowed angles must be pentagonal'. You did not say that. Does it belong in your framework?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output (script re-run for this document):**

```text
settings on a 72 deg grid: max CHSH = 2.736068  at [  0.  72. 216. 144.]
settings on a 36 deg grid: max CHSH = 2.736068  at [  0.  72.  36. 288.]
settings on a 18 deg grid: max CHSH = 2.793604  at [  0.  72.  36. 306.]
settings on a 45 deg grid: max CHSH = 2.828427  at [  0.  90.  45. 315.]
closed form 2*phi-1/2 = 2.73606797749979  | 2*sqrt2 = 2.8284271247461903  | ratio 0.9673461103387316
general planar family S(d)=3cos d - cos 3d: d=36deg -> 2.73606797749979 , d=45deg -> 2.8284271247461903
```

*C13 (baseline hidden-direction rule), C14, C16, C20-C22, C29 are produced by `12_extra_checks.py`; its full output is in the box under C29 below.*

### C13 — Baseline 'shared hidden direction' rule and singlet identity

* **Triggered by:** I stated that the simplest 'one object, shared direction' rule gives CHSH = 2 and cannot reach 2.83; this computes it.
* **What was computed:** Evaluated the closed form E(theta) = -(1 - 2*theta/pi) (for A = sign(a.lam), B = -sign(b.lam), lam uniform on the sphere) at the standard settings and over a coarse grid; checked the identity 2*sin^2(theta/2) - 1 = -cos(theta).
* **Inputs and their origin:** [STD-PHYS] the local hidden-variable model and the singlet formula; [ME] choosing this as a baseline (not something you proposed).
* **Uses standard physics?** **Yes.**
* **Script:** `12_extra_checks.py` (X5)
* **Tolerance / precision:** closed-form evaluation, no sampling
* **Reported in the thread:** CHSH = 2.000000 at the standard settings and as the best over the grid; identity holds to 3.3e-16.
* **Alignment questions:** This is my baseline, not your model. Your premise is that the relationship is a joint property of the two projections, which this baseline is not. Should it be dropped?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C14 — Icosahedron view: what is visible and what is hidden

* **Triggered by:** You said the picture is a 2D representation of the actual object.
* **What was computed:** For the icosahedron along a 3-fold axis: radii in the picture (visible), depths along the axis (hidden), distinct 2D points, whether flipping depth reproduces the same 3D point set, and edge/circumradius in 2D and 3D.
* **Inputs and their origin:** [YOU] the picture-as-representation premise. [ME] method. [STD-MATH].
* **Uses standard physics?** No.
* **Script:** `12_extra_checks.py` (X4)
* **Tolerance / precision:** 6-decimal rounding of radii and depths
* **Reported in the thread:** Radii ratio 1.618034 (phi); depth ratio 0.236068 (phi^-3); all 12 points distinct; the depth-flipped point set differs from the original, so the picture alone does not fix the object; 3D edge/circumradius is 1.0515 (not 1/phi) while the 2D decagon's is 0.618034 (1/phi).
* **Alignment questions:** Is 'depth lost in the picture' the sense of projection loss you intend?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C15 — Four perpendicular planes, rings, phi-paired rings

* **Triggered by:** You asked how a 2D circle-of-dots picture could be 'folded up' to 8D.
* **What was computed:** Split R^8 into four perpendicular 2D planes A,B,C,D (real parts of the Coxeter eigenvectors for exponents 1,11,7,13); checked orthonormality, that each root's four radii satisfy rho_A^2+...+rho_D^2 = 2, rebuilt the 8D roots from the four 2D positions, and found rings and their phi-pairs in plane A.
* **Inputs and their origin:** [YOU] the desire to represent 8D via 2D pictures. [ME] choosing this particular decomposition (it comes from the E8 Coxeter element, which came from the review). [STD-MATH].
* **Uses standard physics?** No.
* **Script:** `11_phi_pi_calculations.py` (sections 1-2)
* **Tolerance / precision:** orthonormality and rebuild at machine precision; ring labels rounded to 9 decimals, ring radii used unrounded
* **Reported in the thread:** Planes orthonormal and fill 8D; sum of squared radii = 2 for all roots; rebuild error ~2e-15; 8 rings of 30 points; four phi-pairs of rings (inner, outer): (0,1), (2,5), (3,6), (4,7).
* **Alignment questions:** Is a decomposition into four planes the 'representation of 8D' you wanted?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C16 — Angular grid of the rings; golden angle

* **Triggered by:** You asked whether the angle from the centre was determined by the golden ratio.
* **What was computed:** Measured angular spacing and offset of each ring in plane A; compared the golden angle 137.5078 degrees to that grid; listed the Coxeter rotation per step in each plane.
* **Inputs and their origin:** [YOU] the question. [ME] method.
* **Uses standard physics?** No.
* **Script:** `12_extra_checks.py` (X2)
* **Tolerance / precision:** angles rounded to 3 decimals
* **Reported in the thread:** Every ring has 30 points spaced exactly 12 degrees apart, with offset 0 or 6 degrees; the golden angle is not on this grid (5.5078 mod 12); Coxeter step per plane: 12, 132, 84, 156 degrees.
* **Alignment questions:** In this object, phi is in radii and in cosines of the grid angles, not in the angles themselves. Does that match what you meant?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C17 — Where pi and phi meet: decagon and pentagon in a ring pair

* **Triggered by:** You asked for the places where pi (circle) and phi meet.
* **What was computed:** For each phi-paired ring pair: chord between outer-ring points 36 degrees apart (decagon edge) divided by inner radius; chord ratio of pentagon diagonal (144 degrees) to side (72 degrees); arc length 2*pi*R/10 divided by chord; same rays check.
* **Inputs and their origin:** [YOU] C = pi d = 2 pi r and 'where they meet'. [ME] choosing decagon and pentagon relations. [STD-MATH] decagon edge = R/phi.
* **Uses standard physics?** No.
* **Script:** `11_phi_pi_calculations.py` (section 2)
* **Tolerance / precision:** deviations printed at ~1e-15 (an earlier version rounded radii to 9 decimals and showed 2e-9; fixed)
* **Reported in the thread:** Decagon edge / inner radius = 1.000000 (max deviation ~1e-15); pentagon diagonal/side = phi (~1e-15); arc/chord = 1.0166 (close, not exact); inner/outer rings share the same 30 rays.
* **Alignment questions:** The exact relations involve angles and chords, not circumference. Is that consistent with your intent for C = 2 pi r?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C18 — The 4D view: shells, edge, decagon planes

* **Triggered by:** You asked how the meeting of pi and phi shows up dimensionally.
* **What was computed:** In the 4D view: shell radii and ratio; shortest outer-outer distance (600-cell edge) vs inner radius; number of flat planes through the origin containing a decagon of outer vertices; planes per vertex; roots in one such plane.
* **Inputs and their origin:** [ME]; [STD-MATH].
* **Uses standard physics?** No.
* **Script:** `11_phi_pi_calculations.py` (section 3)
* **Tolerance / precision:** tolerance 1e-6
* **Reported in the thread:** Outer radius 1.203002, inner 0.743496, ratio phi; edge = inner radius (ratio 1.0); 72 decagon planes; 6 planes through each outer vertex; one plane holds 20 roots (10 outer, 10 inner).
* **Alignment questions:** 
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C19 — 4D to 3D projections: what survives

* **Triggered by:** You said the relation fails in 3D because 3D is a formalisation of projection loss.
* **What was computed:** Orthogonally projected the 4D view to 3D along a generic axis (seed 2) and along vertex, edge, face and cell axes; counted decagon planes kept exactly, how often 'edge = inner radius' still holds, the range of edge/inner-radius, and outer vertices lost to overlap.
* **Inputs and their origin:** [YOU] the idea. [ME] the measures chosen.
* **Uses standard physics?** No.
* **Script:** `11_phi_pi_calculations.py` (section 4)
* **Tolerance / precision:** tolerance 1e-9 for 'holds'
* **Reported in the thread:** See captured output (table of five viewing axes).
* **Alignment questions:** Any non-isometric projection breaks metric relations, so this is not specific evidence for your idea. Do you accept the measures I chose?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C20 — The chain from 8D down to 2D

* **Triggered by:** You said the previous test (4D to 3D) was one step; you needed 8 down to 3 and every dimension between.
* **What was computed:** Kept the first d coordinates of the frame (A_x, A_y, B_x, B_y, C_x, ...) for d = 8..2 and measured: distinct norm shells, same-direction pairs at ratio phi, pairs at 36/72 degrees, mean root-edge length kept; repeated on 200 random frames (seed 4); checked the angles between roots in 8D.
* **Inputs and their origin:** [YOU] the request. [ME] 'first d coordinates of frame A,B,C,D' as the chain, and the measures. For odd d the axis chosen inside a plane is arbitrary.
* **Uses standard physics?** No.
* **Script:** `11_phi_pi_calculations.py` (section 5), `12_extra_checks.py` (X1)
* **Tolerance / precision:** tolerance 1e-6
* **Reported in the thread:** Structure (phi-parallel pairs, 36/72-degree pairs) appears at d = 4 (and persists partly at 3 and 2) and is absent at 6,7,8; random frames give 0 phi-parallel pairs and at most 4 pairs at 36/72 degrees; in 8D all root angles are 60, 90, 120 or 180 degrees.
* **Alignment questions:** Is a prefix chain of coordinates how you would step down? You may have meant a different sequence.
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C21 — Length lost per step is sqrt(d/8)

* **Triggered by:** You said I was not applying the ratio properly at each step.
* **What was computed:** Computed the rms root-edge length kept at each d, compared it to sqrt(d/8), and the factor needed to restore it, next to powers of phi.
* **Inputs and their origin:** [ME].
* **Uses standard physics?** No.
* **Script:** `12_extra_checks.py` (X6)
* **Tolerance / precision:** 6 decimals
* **Reported in the thread:** rms kept equals sqrt(d/8) exactly (0.935414, 0.866025, 0.790569, 0.707107, 0.612372, 0.5); restoring factors 1.069, 1.155, 1.265, 1.414, 1.633, 2.0 are not powers of phi.
* **Alignment questions:** 
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C22 — Factors of phi per step; weighting the hidden planes

* **Triggered by:** You said: at 3D the ratio is phi, stepping up it must be multiplied each time.
* **What was computed:** (a) For each d, scaled the d-dimensional image by phi^k (k = 1,2,3) and counted points that land exactly on points of the image. (b) Weighted the hidden planes C,D by lambda in the full 8D object and counted phi-parallel pairs.
* **Inputs and their origin:** [YOU] the multiplying idea. [ME] my reading of it (k factors applied to a d-dimensional image, comparing images 1, 2, 3 steps apart).
* **Uses standard physics?** No.
* **Script:** `11_phi_pi_calculations.py` (section 6), `12_extra_checks.py` (X3)
* **Tolerance / precision:** tolerance 1e-6
* **Reported in the thread:** k=1: 120 points land at d = 2,3,4; 4 at d=5; none at 6,7; k=2 and k=3: none anywhere. Weighting C,D by 1/phi, phi, phi^2 or 1 gives 0 phi-parallel pairs; only dropping them (lambda = 0) gives 120.
* **Alignment questions:** **Correction:** my first version of this test applied phi once at each dimension and was labelled as if it were your cumulative rule. This is the corrected presentation. Is my reading of your rule right?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C23 — The eight orbits and their four radii

* **Triggered by:** You asked whether C = 2 pi r is necessary for the representation.
* **What was computed:** For each of the 8 orbits of 30 roots (the rings), took the radii (rho_A, rho_B, rho_C, rho_D); compared each phi-pair of orbits.
* **Inputs and their origin:** [YOU] circle/circumference question. [ME] orbits and radii.
* **Uses standard physics?** No.
* **Script:** `11_phi_pi_calculations.py` (section 7)
* **Tolerance / precision:** float64
* **Reported in the thread:** Going to the phi-partner orbit multiplies the radii by (phi, phi, 1/phi, 1/phi); each orbit's four radii satisfy sum of squares = 2.
* **Alignment questions:** 
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C24 — 'Folding' visible over hidden

* **Triggered by:** You asked how the second diagram would have to be folded to make axes line up or intersect.
* **What was computed:** Defined a fold as overlaying plane pairs and combining the overlaid radii (product across visible/hidden, ratio within a side); tested which combinations are identical for the inner and outer orbit of each phi-pair.
* **Inputs and their origin:** [YOU] the idea of folding. [ME] defining the fold as overlay + product/ratio, and choosing radii (not in-plane x,y values).
* **Uses standard physics?** No.
* **Script:** `13_fold_invariants.py`
* **Tolerance / precision:** machine precision
* **Reported in the thread:** Products rho_A*rho_C, rho_A*rho_D, rho_B*rho_C, rho_B*rho_D and the ratios rho_A/rho_B, rho_C/rho_D are invariant (max difference ~1e-15); the ratio rho_A/rho_D is not.
* **Alignment questions:** You later said you never gave the folding mechanism. This is my definition of a fold. Does it match what you meant by folding?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output (script re-run for this document):**

```text
phi-pairs (inner,outer): [(0, 1), (2, 5), (3, 6), (4, 7)]
outer/inner radius ratios on A,B,C,D: [1.61803399 1.61803399 0.61803399 0.61803399] (phi, phi, 1/phi, 1/phi)
  rhoA*rhoD (fold A over D)    inner 0.220846916797  outer 0.220846916797  |diff| 0.0e+00  (max over all 4 pairs 3.3e-16)
  rhoB*rhoC (fold B over C)    inner 0.539998296239  outer 0.539998296239  |diff| 1.1e-16  (max over all 4 pairs 4.4e-16)
  rhoA*rhoC                    inner 0.182660478551  outer 0.182660478551  |diff| 1.7e-16  (max over all 4 pairs 4.4e-16)
  rhoB*rhoD                    inner 0.652888680385  outer 0.652888680385  |diff| 4.4e-16  (max over all 4 pairs 4.4e-16)
  rhoA/rhoB (A over B)         inner 0.338261212718  outer 0.338261212718  |diff| 2.2e-16  (max over all 4 pairs 1.0e-15)
  rhoA/rhoD (divide instead)   inner 0.256992983168  outer 0.672816364803  |diff| 4.2e-01  (max over all 4 pairs 2.0e+00)
```

### C25 — Eight axes through an XYZ window

* **Triggered by:** You asked how to represent the 3D axes and eight dimensions.
* **What was computed:** Placed the four planes in 3D with normals along the cube diagonals, formed the 3x8 map M, and checked M M^T = I_3, the length of each axis's shadow, and the inner products between shadows.
* **Inputs and their origin:** [YOU] the request. [ME] the tetrahedral tilt (a choice; other windows give other shadows).
* **Uses standard physics?** No.
* **Script:** `14_eight_axes_xyz_window.py`
* **Tolerance / precision:** np.allclose defaults
* **Reported in the thread:** M M^T = I_3 (orthogonal projection onto 3D); all 8 shadows have length 0.612372 = sqrt(3/8); sum of squared lengths 3.
* **Alignment questions:** 
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output (script re-run for this document):**

```text
M M^T = I_3 (orthogonal projection onto 3D): True
shadow length of every axis: [0.612372 0.612372 0.612372 0.612372 0.612372 0.612372 0.612372 0.612372] | sqrt(3/8) = 0.612372 | sum of squares = 3.0
distinct inner products between different axes' shadows: [-0.375, -0.2165, -0.0, 0.125, 0.2165, 0.25]
that root's 8 coordinates: [-0.     -0.7667 -0.927  -0.      0.      0.7043 -0.2382  0.    ] | its XYZ image: [-0.3183  0.8092 -0.5826]
```

### C26 — Four planes centered at the origin

* **Triggered by:** You said the layers should be centred at the origin.
* **What was computed:** Same tilted arrangement as C25 (normals at 109.4712 degrees to each other).
* **Inputs and their origin:** [YOU] 'centered'. [ME] tilt.
* **Uses standard physics?** No.
* **Script:** `14_eight_axes_xyz_window.py` (projection identity) and `15_octahedron_fold_template.py` (prints the 109.4712 degree angle between plane normals)
* **Tolerance / precision:** as C25
* **Reported in the thread:** Any two plane normals are 109.47 degrees apart; the sum of the four plane embeddings is an orthogonal projection (C25).
* **Alignment questions:** 
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C27 — Octahedron as a folding template

* **Triggered by:** You asked how the octahedron (8 faces) would apply as a template for folding.
* **What was computed:** Mapped the 8 faces to the four planes (two sides each), computed face-normal angles and the dihedral angle, counted hinges, found a non-overlapping net by random spanning trees (seed 0), and matched each hinge to the plane-pair invariants from C24.
* **Inputs and their origin:** [YOU] the octahedron-as-template idea. [ME] reading 'eight' as the octahedron's 8 faces; [ME] the face-to-plane labelling (tetrahedral set).
* **Uses standard physics?** No.
* **Script:** `15_octahedron_fold_template.py`
* **Tolerance / precision:** exact trigonometry; invariants to ~1e-15
* **Reported in the thread:** Plane normals pairwise -1/3 (109.4712 degrees); octahedron dihedral = arccos(-1/3) = 109.4712 degrees; 12 shared edges, every edge joins two different planes; net needs 7 hinges; each hinge corresponds to a plane pair whose combination is invariant.
* **Alignment questions:** I did not know whether 'eight' meant the octahedron's faces. Did it?
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output (script re-run for this document):**

```text
phi-pairs (inner,outer): [(0, 1), (2, 5), (3, 6), (4, 7)]
outer/inner radius ratios on A,B,C,D: [1.61803399 1.61803399 0.61803399 0.61803399] (phi, phi, 1/phi, 1/phi)
  rhoA*rhoD (fold A over D)    inner 0.220846916797  outer 0.220846916797  |diff| 0.0e+00  (max over all 4 pairs 3.3e-16)
  rhoB*rhoC (fold B over C)    inner 0.539998296239  outer 0.539998296239  |diff| 1.1e-16  (max over all 4 pairs 4.4e-16)
  rhoA*rhoC                    inner 0.182660478551  outer 0.182660478551  |diff| 1.7e-16  (max over all 4 pairs 4.4e-16)
  rhoB*rhoD                    inner 0.652888680385  outer 0.652888680385  |diff| 4.4e-16  (max over all 4 pairs 4.4e-16)
  rhoA/rhoB (A over B)         inner 0.338261212718  outer 0.338261212718  |diff| 2.2e-16  (max over all 4 pairs 1.0e-15)
  rhoA/rhoD (divide instead)   inner 0.256992983168  outer 0.672816364803  |diff| 4.2e-01  (max over all 4 pairs 2.0e+00)
pairwise dot products of the 4 plane normals: [-0.333333] = -1/3 -> angle 109.4712 deg
octahedron: 8 faces, 12 shared edges; outward-normal angle between adjacent faces: 70.5288 deg  -> dihedral (the fold angle) = 109.4712 deg   (= arccos(-1/3) = 109.4712 )
each shared edge joins two DIFFERENT planes (a plane's own two sides are opposite faces); edges per plane pair: {'AD': 2, 'AC': 2, 'AB': 2, 'BD': 2, 'CD': 2, 'BC': 2}
found a non-overlapping net after 1 random spanning trees; folds (hinges) needed = 7 = faces - 1
hinges in this net (face - face : plane pair : combination that is invariant under the phi-step):
   B- - D+ : BD : rhoB*rhoD
   A+ - B- : AB : rhoA/rhoB
   B+ - A- : AB : rhoA/rhoB
   D- - C+ : CD : rhoC/rhoD
   C- - B+ : BC : rhoB*rhoC
   D+ - A- : AD : rhoA*rhoD
   A+ - D- : AD : rhoA*rhoD
check of those six combinations over all four phi-pairs (max |outer - inner|): {'rhoA/rhoB': 1e-15, 'rhoC/rhoD': 1.3e-15, 'rhoA*rhoC': 4.4e-16, 'rhoA*rhoD': 3.3e-16, 'rhoB*rhoC': 4.4e-16, 'rhoB*rhoD': 4.4e-16}
```

### C28 — 3D hinge-fold illustration

* **Triggered by:** You asked whether I was representing the fold in 3D.
* **What was computed:** A figure only: the diagram as a sheet, right half hinged 0, 90, 180 degrees about the dashed line. The one number printed is that after 180 degrees axis D lands on A and C on B.
* **Inputs and their origin:** [ME] the 180 degree hinge (you said you never gave a folding mechanism).
* **Uses standard physics?** No.
* **Script:** `16_fold_3d_illustration.py`
* **Tolerance / precision:** --
* **Reported in the thread:** Figure `E8_fold_in_3D.png`.
* **Alignment questions:** You said multiple folds are required from the 3D perception to 8D. This figure does not do that.
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________

### C29 — Precision and tolerances

* **Triggered by:** You asked how many decimals of pi I used.
* **What was computed:** Printed pi, phi, epsilon; listed tolerances; measured deviations of the exact relations.
* **Inputs and their origin:** --
* **Uses standard physics?** No.
* **Script:** `12_extra_checks.py` header, `11_phi_pi_calculations.py` section 2
* **Tolerance / precision:** see Section 0
* **Reported in the thread:** pi = 3.141592653589793, phi = 1.618033988749895; exact relations agreed to ~1e-15.
* **Alignment questions:** 
* **Your verdict:** ☐ aligned  ☐ drifted  ☐ unsure    Notes: ____________________________
**Captured output of `11_phi_pi_calculations.py` (covers C15, C17-C23):**

```text
pi = 3.141592653589793   phi = 1.618033988749895   counting tolerance = 1e-06

1. planes orthonormal & fill 8D: True | roots rebuilt from 4 planes, max error: 1.9984014443252818e-15 | rho_A^2+rho_B^2+rho_C^2+rho_D^2 = 2 for all roots: True

2. plane A: 8 rings of 30 points; phi-paired rings (inner, outer): [(0, 1), (2, 5), (3, 6), (4, 7)]
   rings (0,1): R_out/r_in=1.618033988750 | decagon edge/r_in=1.000000000000 (max dev from 1: 1.4e-15) | pentagon diag/side=1.618033988750 (max dev from phi: 1.3e-15) | arc/chord=1.0166 | same 30 rays: True
   rings (2,5): R_out/r_in=1.618033988750 | decagon edge/r_in=1.000000000000 (max dev from 1: 1.1e-15) | pentagon diag/side=1.618033988750 (max dev from phi: 6.7e-16) | arc/chord=1.0166 | same 30 rays: True
   rings (3,6): R_out/r_in=1.618033988750 | decagon edge/r_in=1.000000000000 (max dev from 1: 5.6e-16) | pentagon diag/side=1.618033988750 (max dev from phi: 6.7e-16) | arc/chord=1.0166 | same 30 rays: True
   rings (4,7): R_out/r_in=1.618033988750 | decagon edge/r_in=1.000000000000 (max dev from 1: 8.9e-16) | pentagon diag/side=1.618033988750 (max dev from phi: 1.1e-15) | arc/chord=1.0166 | same 30 rays: True

3. 4D view: outer radius 1.203002, inner radius 0.743496, ratio 1.618033989; 600-cell edge 0.743496; edge/inner radius 1.000000000
   edges 720 | decagon planes through the origin 72 | planes per outer vertex {6} | roots (of all 240) lying in one such plane: 20

4. 4D -> 3D (drop one axis):
   generic (seed 2)       planes kept  0/72 | edge=inner radius holds   0.0% | ratio range 0.286..3.501 | overlap-lost 0
   vertex axis            planes kept  6/72 | edge=inner radius holds  27.1% | ratio range 0.000..1.701 | overlap-lost 45
   edge axis              planes kept  1/72 | edge=inner radius holds  15.6% | ratio range 0.309..3.236 | overlap-lost 4
   face axis              planes kept  0/72 | edge=inner radius holds  10.0% | ratio range 0.357..2.803 | overlap-lost 2
   cell axis              planes kept  0/72 | edge=inner radius holds  13.3% | ratio range 0.378..2.642 | overlap-lost 6

5. chain A,B,C,D, first d coordinates:  d | shells | phi-parallel pairs | 36/72-deg pairs | mean edge kept | rms edge kept (sqrt(d/8))
   8 |   1 |   0 |     0 | 1.000 | 1.000000 (1.000000)
   7 |  37 |   0 |     0 | 0.931 | 0.935414 (0.935414)
   6 |   8 |   0 |     0 | 0.857 | 0.866025 (0.866025)
   5 |  46 |   4 |     0 | 0.777 | 0.790569 (0.790569)
   4 |   2 | 120 | 11520 | 0.688 | 0.707107 (0.707107)
   3 |  46 | 120 |     0 | 0.584 | 0.612372 (0.612372)
   2 |   8 | 120 |  3840 | 0.460 | 0.500000 (0.500000)
   random frames (200, seed 4): max phi-parallel pairs / max 36-72deg pairs at each d: {7: (0, 0), 6: (0, 4), 5: (0, 4), 4: (0, 4), 3: (0, 4), 2: (0, 4)}

6. points of (phi^k * d-dim image) landing exactly (within 1e-6) on points of the d-dim image, k=1,2,3:
   d=2: [120, 0, 0]
   d=3: [120, 0, 0]
   d=4: [120, 0, 0]
   d=5: [4, 0, 0]
   d=6: [0, 0, 0]
   d=7: [0, 0, 0]

7. radii (rho_A, rho_B, rho_C, rho_D) of each orbit of 30 roots; phi-pair ratios outer/inner:
   ring 0: [0.2382 0.7043 0.7667 0.927 ]
   ring 1: [0.3855 1.1396 0.4739 0.5729]
   ring 2: [0.4739 0.5729 1.1396 0.3855]
   ring 3: [0.5729 0.4739 0.3855 1.1396]
   ring 4: [0.7043 0.2382 0.927  0.7667]
   ring 5: [0.7667 0.927  0.7043 0.2382]
   ring 6: [0.927  0.7667 0.2382 0.7043]
   ring 7: [1.1396 0.3855 0.5729 0.4739]
   rings (0,1) ratios: [1.618 1.618 0.618 0.618]
   rings (2,5) ratios: [1.618 1.618 0.618 0.618]
   rings (3,6) ratios: [1.618 1.618 0.618 0.618]
   rings (4,7) ratios: [1.618 1.618 0.618 0.618]
```
**Captured output of `12_extra_checks.py` (covers C13, C14, C16, C21, C22, C29):**

```text
pi = 3.141592653589793  phi = 1.618033988749895  float64 epsilon = 2.220446049250313e-16  counting tolerance = 1e-06

X1. cosines between different roots in 8D: [-1.0, -0.5, 0.0, 0.5] -> only 0, +-1/2, +-1 (60/90/120/180 deg): no 36/72 deg angles in 8D

X2. plane A rings: points, angular spacing (deg), offset of ring modulo 12 deg
   ring 0: radius 0.238235  points 30  spacings [12.]  offsets mod 12 [ 0. 12.]
   ring 1: radius 0.385473  points 30  spacings [12.]  offsets mod 12 [ 0. 12.]
   ring 2: radius 0.473861  points 30  spacings [12.]  offsets mod 12 [6.]
   ring 3: radius 0.572925  points 30  spacings [12.]  offsets mod 12 [6.]
   ring 4: radius 0.704294  points 30  spacings [12.]  offsets mod 12 [ 0. 12.]
   ring 5: radius 0.766723  points 30  spacings [12.]  offsets mod 12 [6.]
   ring 6: radius 0.927011  points 30  spacings [12.]  offsets mod 12 [6.]
   ring 7: radius 1.139572  points 30  spacings [12.]  offsets mod 12 [ 0. 12.]
   golden angle 360/phi^2 = 137.5078 deg; modulo 12 deg = 5.5078  (a multiple of 6 would be 0 or 6)
   rotation of the Coxeter element per step in planes A,B,C,D (deg): [12, 132, 84, 156]

X3. phi-parallel ordered pairs (point j = phi * point i, same direction) after weighting the hidden planes C,D by lambda
   lambda = 0.618034: 0
   lambda = 1.618034: 0
   lambda = 2.618034: 0
   lambda = 1.000000: 0
   lambda = 0 (drop C,D = project to the 4D view): 120
   8D inner product between the two roots of each phi-parallel pair: {0.0}

X4. icosahedron along (1,1,1): depths |z| [0.187592, 0.794654] ratio 0.2360675 (phi^-3 = 0.2360680); radii [0.607062, 0.982247] ratio 1.6180341 (phi = 1.6180340)
   distinct 2D points: 12 of 12
   depth-flipped point set equals the original: False
   3D icosahedron edge/circumradius = 1.051462 (1/phi = 0.618034);  2D decagon edge/circumradius = 0.618034

X5. shared-hidden-direction rule, closed form E(theta) = -(1-2*theta/pi): CHSH at the standard settings = 2.000000; best over a 15-degree grid = 2.000000
    singlet identity: 2*P(equal)-1 with P(equal)=sin^2(theta/2) equals -cos(theta); max difference over 361 angles: 3.3306690738754696e-16

X6. root-edge length kept (rms) after keeping the first d coordinates; sqrt(d/8); factor needed to restore it
   d=7: rms 0.935414  sqrt(d/8)=0.935414  restoring factor 1.0690   (phi=1.618, phi^2=2.618)
   d=6: rms 0.866025  sqrt(d/8)=0.866025  restoring factor 1.1547   (phi=1.618, phi^2=2.618)
   d=5: rms 0.790569  sqrt(d/8)=0.790569  restoring factor 1.2649   (phi=1.618, phi^2=2.618)
   d=4: rms 0.707107  sqrt(d/8)=0.707107  restoring factor 1.4142   (phi=1.618, phi^2=2.618)
   d=3: rms 0.612372  sqrt(d/8)=0.612372  restoring factor 1.6330   (phi=1.618, phi^2=2.618)
   d=2: rms 0.500000  sqrt(d/8)=0.500000  restoring factor 2.0000   (phi=1.618, phi^2=2.618)
```
**Captured output of `16_fold_3d_illustration.py` (C28; its first lines repeat C24):**

```text
phi-pairs (inner,outer): [(0, 1), (2, 5), (3, 6), (4, 7)]
outer/inner radius ratios on A,B,C,D: [1.61803399 1.61803399 0.61803399 0.61803399] (phi, phi, 1/phi, 1/phi)
  rhoA*rhoD (fold A over D)    inner 0.220846916797  outer 0.220846916797  |diff| 0.0e+00  (max over all 4 pairs 3.3e-16)
  rhoB*rhoC (fold B over C)    inner 0.539998296239  outer 0.539998296239  |diff| 1.1e-16  (max over all 4 pairs 4.4e-16)
  rhoA*rhoC                    inner 0.182660478551  outer 0.182660478551  |diff| 1.7e-16  (max over all 4 pairs 4.4e-16)
  rhoB*rhoD                    inner 0.652888680385  outer 0.652888680385  |diff| 4.4e-16  (max over all 4 pairs 4.4e-16)
  rhoA/rhoB (A over B)         inner 0.338261212718  outer 0.338261212718  |diff| 2.2e-16  (max over all 4 pairs 1.0e-15)
  rhoA/rhoD (divide instead)   inner 0.256992983168  outer 0.672816364803  |diff| 4.2e-01  (max over all 4 pairs 2.0e+00)
folded 180 deg: axis D lands on axis A and C on B (x -> 3 - x): [1.0, 0.0]
```

---

## 4. Analytic statements (not run in code)

These appeared in my replies as reasoning or standard facts. They are listed so you can check them against other sources. **None was run as a calculation.**

| ID | Statement | Status |
|---|---|---|
| A01 | The invariant in 8v x 8s x 8c is unique up to scale (octonion multiplication tensor); triality is the S3 outer automorphism permuting 8v, 8s, 8c | standard |
| A02 | Spin(6) = SU(4): the octahedron's 6 vertices are the weights of the 6; a tetrahedron's 4 vertices are the weights of the 4; Spin(6) has only a Z2 outer automorphism, not triality | standard |
| A03 | Under Spin(4) x Spin(4) = SU(2)^4, 8v, 8s, 8c branch into the (2,2,1,1)+(1,1,2,2)-type pieces I listed | standard, stated in my first reply, labelling conventions not checked |
| A04 | The boundary three-point function carries the tensor T^{abc} times an OPE coefficient (first pasted text) | standard CFT form; the pasted text, not yours |
| A05 | Spin(3,1) x Spin(4) cannot sit inside the compact Spin(8) | standard |
| A06 | Compact Spin(8) and split Spin(4,4) have triality; Lorentzian real forms do not | **my belief, unverified** |
| A07 | If each outcome depends only on its own setting and a shared variable, CHSH <= 2 (Bell); quantum maximum 2*sqrt2 (Tsirelson) | standard theorems |
| A08 | The Kochen-Specker (Peres) set uses 24 rays, from the 24-cell together with its dual | standard; I first stated it loosely and corrected it |
| A09 | The maximum negativity for two 8-dimensional systems is (8-1)/2 = 3.5 | standard |
| A10 | A regular decagon in a circle of radius R has edge R/phi; phi = 2 cos(pi/5) | exact identity |
| A11 | Octahedron dihedral angle = arccos(-1/3) | standard |
| A12 | A net of a polyhedron with F faces needs F-1 hinges; the 16-cell has 16 cells (so 15 hinges) | standard counting; the 16-cell net was not built |
| A13 | A purification of any mixed state exists (so 'entanglement as a slice of a larger pure state' is always possible) | standard theorem |
| A14 | Photonic Bell tests report CHSH values near 2.8 | **my recollection, unverified** |
| A15 | Elser-Sloane is the E8 to 4D construction; 6D to 3D icosahedral work is Kramer-Neri, Kalugin-Kitaev-Levitov, Elser | **my recollection, unverified; the pasted review's date and attribution were not checked** |

---

## 5. Where inputs entered that were not yours (drift audit)

In order of appearance:

1. **E8, icosians, Coxeter planes, D4xD4 triality (C03-C05, C07-C09 and everything after).** These came from a pasted model review, not from you. Your inputs were the trilinear form, triality, the golden ratio, the octahedron/tetrahedron, and eight dimensions. Everything built on E8 inherits this choice.
2. **Treating T as a quantum state (C01).** This imports quantum entanglement measures into a framework you did not say accepts them.
3. **CHSH tables and the closed-form 2*phi - 1/2 (C11-C13).** These use the singlet formula as the yardstick. This was before you said standard models are not benchmarks.
4. **Labels I invented:** 'visible' (planes A,B) and 'hidden' (planes C,D); 'perceived pairs' (retracted at your correction); 'outer/inner' orbit; the face-to-plane labelling of the octahedron.
5. **Choices of window and chain:** the tetrahedral tilt for the XYZ window (C25-C26); the 'first d coordinates' chain (C20); the 180 degree hinge (C28). You gave none of these.
6. **Measures I chose:** phi-parallel pairs, 36/72-degree pairs, decagon planes kept, edge length kept (C19-C21). They are reasonable, but they are my definitions of 'what survives projection'.
7. **A mislabelled test:** the first 'phi step' test applied one factor of phi per dimension but was described as your cumulative rule (corrected in C22).
8. **A mistaken image reference:** in my reply after your message beginning 'the problem with your math is you're doing it on the premise that this is a three-dimensional space', I wrote about 'your image' as an icosahedron view. The image attached to that message was the earlier octahedron-style drawing (6 vertices, 12 edges). I should have said so.
9. **Statements stated as likely but unverified:** A06, A14, A15.

---

## 6. What was not computed (gaps against your concept)

* Two projections of one object producing a joint relationship, derived from the geometry (the core of your second premise).
* Measurement as fixing a projection angle.
* Multi-step folding from the 3D perception to 8D reality (the rule for which parts fold at each step has not been specified).
* A golden-angle layout (offered, not built).
* The Fermi-paradox mechanism.
* A test that does not borrow standard physics for the correlation.

---

## 7. Files that exist

* This document.
* Figures: `E8_to_2D_views.png`, `E8_four_linked_planes.png`, `E8_four_planes_on_XYZ.png` (layered, which you objected to), `E8_four_planes_centered.png`, `pi_meets_phi_ring_pair.png`, `pi_phi_across_dimensions.png`, `E8_eight_axes_and_XYZ.png`, `E8_fold_visible_over_hidden.png`, `E8_fold_in_3D.png`, `E8_octahedron_fold_template.png`.
* Earlier documents from the thread: `working_summary_2026-10-26.md` (an earlier summary, written before several of your clarifications), and the single-purpose scripts. The scripts are all reproduced in Appendix B of this document.

---

## 8. Audit checklist (one row per calculation; mark and return)

| ID | Premises all yours? | Method matches the concept? | Standard physics used without your approval? | Keep / drop / redo |
|---|---|---|---|---|
| C01 | ☐ | ☐ | ☐ | |
| C02 | ☐ | ☐ | ☐ | |
| C03 | ☐ | ☐ | ☐ | |
| C04 | ☐ | ☐ | ☐ | |
| C05 | ☐ | ☐ | ☐ | |
| C06 | ☐ | ☐ | ☐ | |
| C07 | ☐ | ☐ | ☐ | |
| C08 | ☐ | ☐ | ☐ | |
| C09 | ☐ | ☐ | ☐ | |
| C10 | ☐ | ☐ | ☐ | |
| C11 | ☐ | ☐ | ☐ | |
| C12 | ☐ | ☐ | ☐ | |
| C13 | ☐ | ☐ | ☐ | |
| C14 | ☐ | ☐ | ☐ | |
| C15 | ☐ | ☐ | ☐ | |
| C16 | ☐ | ☐ | ☐ | |
| C17 | ☐ | ☐ | ☐ | |
| C18 | ☐ | ☐ | ☐ | |
| C19 | ☐ | ☐ | ☐ | |
| C20 | ☐ | ☐ | ☐ | |
| C21 | ☐ | ☐ | ☐ | |
| C22 | ☐ | ☐ | ☐ | |
| C23 | ☐ | ☐ | ☐ | |
| C24 | ☐ | ☐ | ☐ | |
| C25 | ☐ | ☐ | ☐ | |
| C26 | ☐ | ☐ | ☐ | |
| C27 | ☐ | ☐ | ☐ | |
| C28 | ☐ | ☐ | ☐ | |
| C29 | ☐ | ☐ | ☐ | |

---

## Appendix A. Corrections log (my own errors in this thread)

1. The 'phi step' test mislabelled as cumulative (see C22).
2. Printed deviation of 2e-9 (and 2.1e-12) came from my own rounding of ring radii; unrounded values agree to ~1e-15.
3. A printed label in the same-direction-pairs script said 'missing 4D part', which was wrong; the two 4D spaces span all 8D and the 0.0 residual is exact.
4. 'Perceived pairs' label for same-direction partners was retracted at your correction.
5. The Peres/Kochen-Specker 24-ray statement was first made loosely and was corrected.
6. In an early reply to the first pasted review I worded one critique item confusingly; I noted this in the thread.
7. Reference to the wrong image in one reply (section 5, item 8).
8. Several figure titles initially printed literal backslash sequences instead of line breaks (cosmetic; fixed in the delivered figures).

## Appendix B. All scripts, in full

Run any script with `python3 <name>.py`. Dependencies: numpy, and matplotlib for the scripts that draw figures. Random seeds: 1 (C05), 0 (C02, C27), 2 (C19 generic axis), 4 (C20 random frames), 5 (figure sampling).

### `01_octonion_tripartite_state.py`

```python
import numpy as np, itertools
# octonion mult table via Fano plane (index 0 = real unit)
tr=[(1,2,3),(1,4,5),(1,7,6),(2,4,6),(2,5,7),(3,4,7),(3,6,5)]
M=np.zeros((8,8,8)) # M[a,b,c]: e_a e_b = sum_c M[a,b,c] e_c
for a in range(8): M[0,a,a]=1; M[a,0,a]=1
for a in range(1,8): M[a,a,0]=-1
for (i,j,k) in tr:
    for (x,y,z) in [(i,j,k),(j,k,i),(k,i,j)]:
        M[x,y,z]=1; M[y,x,z]=-1
rng=np.random.default_rng(0)
def mul(x,y): return np.einsum('a,b,abc->c',x,y,M)
ok=all(abs(np.linalg.norm(mul(x,y))-np.linalg.norm(x)*np.linalg.norm(y))<1e-9
       for x,y in [(rng.normal(size=8),rng.normal(size=8)) for _ in range(200)])
print("algebra check |xy|=|x||y| (octonion property):",ok)
# T_abc = Re((e_a e_b) e_c)
T=np.einsum('abd,dce->abce',M,M)[...,0]
print("nonzero entries:",int((T!=0).sum()),"entries in {-1,0,1}:",set(np.unique(T)))
psi=T/np.linalg.norm(T)
def S(rho):
    w=np.linalg.eigvalsh(rho); w=w[w>1e-12]; return float(-(w*np.log2(w)).sum())
for name,ax in (("party A (8_v-like)",0),("party B (8_s-like)",1),("party C (8_c-like)",2)):
    rho=np.tensordot(psi,psi,axes=([i for i in range(3) if i!=ax],[i for i in range(3) if i!=ax]))
    print(name,"entropy (bits):",round(S(rho),6),"max possible:",3,"rho=I/8:",np.allclose(rho,np.eye(8)/8))
# two-party reduced state rho_AB and its partial transpose
rAB=np.einsum('abc,dec->abde',psi,psi)  # indices a b ; d e
R=rAB.reshape(64,64)
print("rho_AB: entropy",round(S(R),6),"bits")
PT=rAB.transpose(0,3,2,1).reshape(64,64)
ev=np.linalg.eigvalsh(PT)
print("partial transpose min eigenvalue:",round(ev.min(),6),"negativity:",round(-ev[ev<0].sum(),6))
```

### `02_octonion_steering.py`

```python
import numpy as np
tr=[(1,2,3),(1,4,5),(1,7,6),(2,4,6),(2,5,7),(3,4,7),(3,6,5)]
M=np.zeros((8,8,8))
for a in range(8): M[0,a,a]=1; M[a,0,a]=1
for a in range(1,8): M[a,a,0]=-1
for (i,j,k) in tr:
    for (x,y,z) in [(i,j,k),(j,k,i),(k,i,j)]:
        M[x,y,z]=1; M[y,x,z]=-1
T=np.einsum('abd,dce->abce',M,M)[...,0]          # T_abc = Re((e_a e_b) e_c)
rng=np.random.default_rng(0)
def steer(c):                                     # state of sectors A,B after measuring sector C along unit direction c
    S=np.einsum('abc,c->ab',T,c); return S/np.linalg.norm(S)
err_orth=0; err_ov=0
for _ in range(2000):
    c1,c2=rng.normal(size=8),rng.normal(size=8); c1/=np.linalg.norm(c1); c2/=np.linalg.norm(c2)
    S1=steer(c1)*np.sqrt(8)
    err_orth=max(err_orth,np.abs(S1@S1.T-np.eye(8)).max())      # steered state is an orthogonal matrix (maximally entangled)
    ov=(steer(c1)*steer(c2)).sum()                              # overlap of the two steered states
    err_ov=max(err_ov,abs(ov-c1@c2))
print("steered AB state is maximally entangled (matrix orthogonal), max error:",err_orth)
print("overlap of steered states = cos(angle between the two C-directions), max error:",err_ov)
```

### `03_E8_triality_icosian.py`

```python
import numpy as np, itertools
phi=(1+5**.5)/2
roots=[]
for i in range(8):
  for j in range(i+1,8):
    for si in (1,-1):
      for sj in (1,-1):
        v=np.zeros(8); v[i]=si; v[j]=sj; roots.append(v)
for s in itertools.product((1,-1),repeat=8):
  if s.count(-1)%2==0: roots.append(np.array(s)/2)
R=np.array(roots); print("roots",len(R))
key=lambda A:set(map(tuple,np.round(A*2).astype(int)))
RS=key(R)
# D4 triality on Cartan R^4 (a1->a3->a4->a1, a2 fixed)
e=np.eye(4)
a=[e[0]-e[1],e[1]-e[2],e[2]-e[3],e[2]+e[3]]
b=[a[2],a[1],a[3],a[0]]
T=np.array(b).T@np.linalg.inv(np.array(a).T)
Z=np.zeros((4,4)); tau=np.block([[T,Z],[Z,T]])
print("T orthogonal",np.allclose(T@T.T,np.eye(4)),"order3",np.allclose(np.linalg.matrix_power(T,3),np.eye(4)))
print("(i) tau permutes the 240 roots:",key(R@tau.T)==RS)
sig=np.diag([1,1,1,-1,1,1,1,-1.])
print("    sigma permutes roots:",key(R@sig.T)==RS, " S3 relation sig tau sig = tau^-1:",np.allclose(sig@tau@sig,np.linalg.inv(tau)))
# E8 simple roots (Bourbaki), Coxeter element
s=[np.array([.5,-.5,-.5,-.5,-.5,-.5,-.5,.5])]
for v in [(1,1),(-1,1)]:
  x=np.zeros(8);x[0]=v[0];x[1]=v[1];s.append(x)
for i in range(2,7):
  x=np.zeros(8);x[i-1]=-1;x[i]=1;s.append(x)
assert all(tuple(np.round(x*2).astype(int)) in RS for x in s)
Ms=np.array([np.eye(8)-np.outer(x,x) for x in s])
c=np.eye(8)
for M in Ms:c=c@M
w,v=np.linalg.eig(c)
m=np.round(np.angle(w)*30/(2*np.pi)).astype(int)%30
print("Coxeter exponents",sorted(m))
cols=[]
for k in (1,11):
  i=[j for j in range(8) if m[j]==k][0]
  cols+= [v[:,i].real,v[:,i].imag]
Q,_=np.linalg.qr(np.array(cols).T)
X=R@Q; n=np.round((X**2).sum(1),6)
print("projected norm^2 values/counts",{x:int((n==x).sum()) for x in set(n)}, "ratio",max(n)/min(n),"phi^2",phi**2)
big=X[n==max(n)]/np.sqrt(max(n)); ip=set(np.round(big@big.T,5).flatten())
ref={0,1,-1,round(phi/2,5),round(-phi/2,5),.5,-.5,round(1/(2*phi),5),round(-1/(2*phi),5)}
print("outer shell inner products subset of 600-cell set:",ip<=ref,len(ip))
def res(V,t):
  Y=t@V; return np.linalg.norm(Y-V@(V.T@Y))
print("(c) fixed alignment: tau residual",res(Q,tau),"sigma residual",res(Q,sig))
# random W(E8) conjugates of V
rng=np.random.default_rng(1); N=300000
W=np.broadcast_to(np.eye(8),(N,8,8)).copy()
for step in range(80):
  k=rng.integers(0,8,N); W=Ms[k]@W
V=W@Q
def bres(V,t):
  Y=t@V; C=np.swapaxes(V,1,2)@Y; return np.linalg.norm(Y-V@C,axis=(1,2)),C
rt,Ct=bres(V,tau); hit=rt<1e-8
print("tau-invariant among",N,"random W(E8)-conjugates of V:",hit.sum())
if hit.sum():
  C=Ct[hit][0]; print("tau eigenvalues on V:",np.round(np.linalg.eigvals(C),4))
  rs,_=bres(V[hit],sig); print("of those, also sigma-invariant:",(rs<1e-8).sum())
```

### `04_icosahedron_vertex_figure.py`

```python
import numpy as np, itertools
phi=(1+5**.5)/2
roots=[]
for i in range(8):
  for j in range(i+1,8):
    for si in (1,-1):
      for sj in (1,-1):
        v=np.zeros(8); v[i]=si; v[j]=sj; roots.append(v)
for s in itertools.product((1,-1),repeat=8):
  if s.count(-1)%2==0: roots.append(np.array(s)/2)
R=np.array(roots)
s=[np.array([.5,-.5,-.5,-.5,-.5,-.5,-.5,.5])]
for v in [(1,1),(-1,1)]:
  x=np.zeros(8);x[0]=v[0];x[1]=v[1];s.append(x)
for i in range(2,7):
  x=np.zeros(8);x[i-1]=-1;x[i]=1;s.append(x)
c=np.eye(8)
for x in s: c=c@(np.eye(8)-np.outer(x,x))
w,v=np.linalg.eig(c); m=np.round(np.angle(w)*30/(2*np.pi)).astype(int)%30
cols=[]
for k in (1,11):
  i=[j for j in range(8) if m[j]==k][0]; cols+=[v[:,i].real,v[:,i].imag]
Q,_=np.linalg.qr(np.array(cols).T)
X=R@Q; n=(X**2).sum(1)
big=X[n>1]/np.sqrt(n[n>1].max())
p=big[0]; ip=big@p
nb=big[np.isclose(ip,phi/2,atol=1e-4)]
print("outer-shell vertices:",len(big),"| nearest neighbours of one vertex (inner product phi/2):",len(nb))
# vertex figure: project neighbours into the 3D space orthogonal to p
u=nb-np.outer(nb@p,p)
u/=np.linalg.norm(u,axis=1)[:,None]
G=np.round(u@u.T,4)
vals=sorted(set(G.flatten()))
print("pairwise inner products among the 12 (icosahedron should give +-1, +-1/sqrt5=%.4f):"%(1/5**.5),vals)
print("each vertex has exactly 5 neighbours at 1/sqrt5:",all((np.isclose(G[i],1/5**.5,atol=1e-3)).sum()==5 for i in range(12)),
      "| one antipode:",all((np.isclose(G[i],-1,atol=1e-3)).sum()==1 for i in range(12)))
```

### `05_triality_axis_view.py`

```python
import numpy as np, itertools
phi=(1+5**.5)/2
roots=[]
for i in range(8):
  for j in range(i+1,8):
    for si in (1,-1):
      for sj in (1,-1):
        v=np.zeros(8); v[i]=si; v[j]=sj; roots.append(v)
for s in itertools.product((1,-1),repeat=8):
  if s.count(-1)%2==0: roots.append(np.array(s)/2)
R=np.array(roots)
e=np.eye(4); a=[e[0]-e[1],e[1]-e[2],e[2]-e[3],e[2]+e[3]]; b=[a[2],a[1],a[3],a[0]]
T=np.array(b).T@np.linalg.inv(np.array(a).T); Z=np.zeros((4,4))
tau=np.block([[T,Z],[Z,T]]); sig=np.diag([1,1,1,-1,1,1,1,-1.])
s=[np.array([.5,-.5,-.5,-.5,-.5,-.5,-.5,.5])]
for v in [(1,1),(-1,1)]:
  x=np.zeros(8);x[0]=v[0];x[1]=v[1];s.append(x)
for i in range(2,7):
  x=np.zeros(8);x[i-1]=-1;x[i]=1;s.append(x)
Ms=np.array([np.eye(8)-np.outer(x,x) for x in s])
c=np.eye(8)
for M in Ms: c=c@M
w,v=np.linalg.eig(c); m=np.round(np.angle(w)*30/(2*np.pi)).astype(int)%30
cols=[]
for k in (1,11):
  i=[j for j in range(8) if m[j]==k][0]; cols+=[v[:,i].real,v[:,i].imag]
Q=np.linalg.qr(np.array(cols).T)[0]
rng=np.random.default_rng(1); N=300000
W=np.broadcast_to(np.eye(8),(N,8,8)).copy()
for step in range(80):
  k=rng.integers(0,8,N); W=Ms[k]@W
V=W@Q
def bres(V,t):
  Y=t@V; C=np.swapaxes(V,1,2)@Y; return np.linalg.norm(Y-V@C,axis=(1,2))
hit=np.where((bres(V,tau)<1e-8)&(bres(V,sig)<1e-8))[0]
print("tau- and sigma-invariant alignments found:",len(hit))
done=0
for h in hit[:40]:
  Vp=V[h]; X=R@Vp; n=(X**2).sum(1); big=X[n>1]; rad=np.sqrt(n[n>1].max()); U=big/rad
  Lt=Vp.T@tau@Vp
  # tau-fixed outer vertices
  ev,evec=np.linalg.eig(Lt); F=np.linalg.svd(Lt-np.eye(4))[2][-2:].T   # 2-dim fixed space
  fixed=[u for u in U if np.linalg.norm(u-F@(F.T@u))<1e-6]
  if not fixed: continue
  p=fixed[0]; nb=np.array([u for u in U if abs(u@p-phi/2)<1e-6])
  perm_ok=all(np.min(np.linalg.norm(nb-(Lt@x),axis=1))<1e-6 for x in nb)
  f=F-np.outer(p,p@F); f=f[:,np.argmax(np.linalg.norm(f,axis=0))]; f/=np.linalg.norm(f)   # rotation axis (in 3D space orthogonal to p)
  u=nb-np.outer(nb@p,p)                     # neighbours as a 3D icosahedron
  hts=np.round(u@f/np.linalg.norm(u,axis=1)[0],4); perp=np.round(np.linalg.norm(u-np.outer(u@f,f),axis=1)/np.linalg.norm(u,axis=1)[0],4)
  print(f"alignment #{h}: tau-fixed outer vertices: {len(fixed)}; tau permutes the 12 neighbours: {perm_ok}")
  print("  heights along tau's axis (count per value):",{float(x):int((hts==x).sum()) for x in sorted(set(hts))})
  r=sorted(set(perp)); print("  distance from axis (two hexagon radii):",r," ratio %.4f"%(max(r)/min([x for x in r if x>1e-3])) if len(r)>1 else r)
  done+=1
  if done>=2: break
```

### `06_same_direction_pairs.py`

```python
import numpy as np, itertools
phi=(1+5**.5)/2
roots=[]
for i in range(8):
  for j in range(i+1,8):
    for si in (1,-1):
      for sj in (1,-1):
        v=np.zeros(8); v[i]=si; v[j]=sj; roots.append(v)
for s in itertools.product((1,-1),repeat=8):
  if s.count(-1)%2==0: roots.append(np.array(s)/2)
R=np.array(roots)
s=[np.array([.5,-.5,-.5,-.5,-.5,-.5,-.5,.5])]
for v in [(1,1),(-1,1)]:
  x=np.zeros(8);x[0]=v[0];x[1]=v[1];s.append(x)
for i in range(2,7):
  x=np.zeros(8);x[i-1]=-1;x[i]=1;s.append(x)
c=np.eye(8)
for x in s: c=c@(np.eye(8)-np.outer(x,x))
w,v=np.linalg.eig(c); m=np.round(np.angle(w)*30/(2*np.pi)).astype(int)%30
def space(ks):
  cols=[]
  for k in ks:
    i=[j for j in range(8) if m[j]==k][0]; cols+=[v[:,i].real,v[:,i].imag]
  return np.linalg.qr(np.array(cols).T)[0]
Qp=space((1,11)); Qq=space((7,13))      # physical (parallel) and internal (perp) spaces
Xp=R@Qp; Xq=R@Qq
n=(Xp**2).sum(1); out=n>1; inn=~out
print("parallel space: outer shell",out.sum(),"inner shell",inn.sum(),"| radius ratio",round(np.sqrt(n[out].max()/n[inn].max()),4))
print("perp space radii (outer-in-parallel roots):",set(np.round(np.linalg.norm(Xq[out],axis=1),4)),"inner-in-parallel:",set(np.round(np.linalg.norm(Xq[inn],axis=1),4)))
# same-direction pairing across shells
U=Xp/np.linalg.norm(Xp,axis=1)[:,None]
Uo=U[out]; Ui=U[inn]; Ro=R[out]; Ri=R[inn]
M=Uo@Ui.T
match=(np.abs(M-1)<1e-6)
print("each outer root has exactly one inner root in the same direction:",set(match.sum(1)),"| each inner has one:",set(match.sum(0)))
ip=set()
for a,b in zip(*np.where(match)): ip.add(round(float(Ro[a]@Ri[b]),4))
print("8D inner products between a root and its same-direction partner:",ip)
# is partner = fixed multiple structure? check difference vector norms
d=set()
for a,b in zip(*np.where(match)): d.add(round(float(np.linalg.norm(Ro[a]-Ri[b])),4))
print("8D distance between partners:",d)
# invertibility: parallel + perp coordinates recover the root
rec=Xp@Qp.T+Xq@Qq.T
print("(parallel,perp) pair rebuilds the 8D root (two 4D spaces span all 8D); rebuild error:",round(float(np.linalg.norm(R-rec)),4))
```

### `07_overlap_counts.py`

```python
import numpy as np, itertools
phi=(1+5**.5)/2
roots=[]
for i in range(8):
  for j in range(i+1,8):
    for si in (1,-1):
      for sj in (1,-1):
        v=np.zeros(8); v[i]=si; v[j]=sj; roots.append(v)
for s in itertools.product((1,-1),repeat=8):
  if s.count(-1)%2==0: roots.append(np.array(s)/2)
R=np.array(roots)
s=[np.array([.5,-.5,-.5,-.5,-.5,-.5,-.5,.5])]
for v in [(1,1),(-1,1)]:
  x=np.zeros(8);x[0]=v[0];x[1]=v[1];s.append(x)
for i in range(2,7):
  x=np.zeros(8);x[i-1]=-1;x[i]=1;s.append(x)
c=np.eye(8)
for x in s: c=c@(np.eye(8)-np.outer(x,x))
w,v=np.linalg.eig(c); m=np.round(np.angle(w)*30/(2*np.pi)).astype(int)%30
def space(ks):
  cols=[]
  for k in ks:
    i=[j for j in range(8) if m[j]==k][0]; cols+=[v[:,i].real,v[:,i].imag]
  return np.linalg.qr(np.array(cols).T)[0]
def distinct(X,tol=1e-6): return len(np.unique(np.round(X/tol).astype(np.int64),axis=0))
Q4=space((1,11)); X4=R@Q4
print("8D roots:",len(R),"-> 4D view distinct points:",distinct(X4))
# 2D Coxeter plane (eigenvalue m=1)
Q2=space((1,)); X2=R@Q2
rad=np.round(np.linalg.norm(X2,axis=1),4)
print("-> 2D Coxeter-plane view distinct points:",distinct(X2),"| rings:",len(set(rad)),"| points per ring:",sorted(set(int((rad==r).sum()) for r in set(rad))))
# 3D views of the 4D picture: look along a 600-cell vertex axis, a generic axis
n=(X4**2).sum(1); big=X4[n>1]
vtx=big[0]/np.linalg.norm(big[0])
def proj3(X,axis):
  axis=axis/np.linalg.norm(axis)
  B=np.linalg.svd(np.eye(4)-np.outer(axis,axis))[0][:,:3]
  return X@B
print("4D view -> 3D looking along a 600-cell vertex axis: 240 points -> distinct",distinct(proj3(X4,vtx)))
rng=np.random.default_rng(3); g=rng.normal(size=4)
print("4D view -> 3D looking along a generic axis: distinct",distinct(proj3(X4,g)))
# 2D views of the 4D picture along two axes: generic and symmetric
def proj2(X,a,b):
  Bm=np.linalg.qr(np.array([a,b]).T)[0]; return X@Bm
print("4D view -> 2D along a generic plane: distinct",distinct(proj2(X4,rng.normal(size=4),rng.normal(size=4))))
```

### `08_chsh_discrete_direction_sets.py`

```python
import numpy as np, itertools
phi=(1+5**.5)/2
def axes(vs):
    vs=[np.array(v,float) for v in vs]; vs=[v/np.linalg.norm(v) for v in vs]
    out=[]
    for v in vs:
        for u in out:
            if np.allclose(u,v) or np.allclose(u,-v): break
        else: out.append(v)
    return out
def sets():
    oct_=axes([(1,0,0),(0,1,0),(0,0,1)])
    cube=axes([(1,1,1),(1,1,-1),(1,-1,1),(-1,1,1)])
    ico=axes([(0,1,phi),(0,1,-phi),(1,phi,0),(1,-phi,0),(phi,0,1),(phi,0,-1)])
    dod=axes([(1,1,1),(1,1,-1),(1,-1,1),(-1,1,1),(0,1/phi,phi),(0,1/phi,-phi),(1/phi,phi,0),(1/phi,-phi,0),(phi,0,1/phi),(phi,0,-1/phi)])
    return {"octahedron (3 axes)":oct_,"cube (4 axes)":cube,"icosahedron (6 axes)":ico,"dodecahedron (10 axes)":dod,"icosa+dodeca (16 axes)":axes(ico+dod),"octa+cube (7 axes)":axes(oct_+cube)}
def best(A):
    V=[s*a for a in A for s in (1,-1)]  # allow +/- direction (flip outcome labels)
    E=lambda a,b:-np.dot(a,b)
    m=0
    for a,a2,b,b2 in itertools.product(V,repeat=4):
        S=abs(E(a,b)+E(a,b2)+E(a2,b)-E(a2,b2)); m=max(m,S)
    return m
for k,A in sets().items():
    print(f"{k:28s} max CHSH = {best(A):.4f}")
print("standard quantum (continuous directions): 2*sqrt2 =",round(2*2**.5,4))
```

### `09_chsh_phi_angle_grids.py`

```python
import numpy as np, itertools
phi=(1+5**.5)/2
def best(step_deg):
    n=int(round(360/step_deg)); ang=[2*np.pi*k/n for k in range(n)]
    E=lambda x,y:-np.cos(x-y)
    m=0;arg=None
    for a,a2,b,b2 in itertools.product(ang,repeat=4):
        S=abs(E(a,b)+E(a,b2)+E(a2,b)-E(a2,b2))
        if S>m+1e-12: m=S;arg=(a,a2,b,b2)
    return m,np.round(np.degrees(arg),1)
for st in (72,36,18,45):
    m,arg=best(st); print(f"settings on a {st} deg grid: max CHSH = {m:.6f}  at {arg}")
print("closed form 2*phi-1/2 =",2*phi-.5," | 2*sqrt2 =",2*2**.5," | ratio",(2*phi-.5)/(2*2**.5))
print("general planar family S(d)=3cos d - cos 3d: d=36deg ->",3*np.cos(np.radians(36))-np.cos(np.radians(108)),", d=45deg ->",3*np.cos(np.radians(45))-np.cos(np.radians(135)))
```

### `10_icosahedron_geometry.py`

```python
import numpy as np, itertools
phi=(1+5**.5)/2
V=[]
for a in (1,-1):
  for b in (phi,-phi):
    V+= [(0,a,b),(a,b,0),(b,0,a)]
V=np.array(V,float); V/=np.linalg.norm(V[0])
d=np.array([1,1,1.])/3**.5
P=V-np.outer(V@d,d)
r=np.round(np.linalg.norm(P,axis=1),4)
print("12 vertices; projected radii along the 3-fold axis (1,1,1):",{x:int((r==x).sum()) for x in set(r)})
print("outer/inner radius ratio:",round(max(r)/min(r),4)," (phi=%.4f)"%phi, " image estimate ~1.645")
D=np.linalg.norm(V[:,None]-V[None],axis=2); e=D[D>1e-9].min()
print("edges:",int(((np.abs(D-e)<1e-6)).sum()//2),"each vertex degree:",set((np.abs(D-e)<1e-6).sum(1)))
ax=[]
for v in V:
  if not any(np.allclose(v,u) or np.allclose(v,-u) for u in ax): ax.append(v)
c=sorted(set(np.round(np.abs([a@b for a,b in itertools.combinations(ax,2)]),4)))
print("6 axes (antipodal pairs): |cos| between every pair of axes:",c," 1/sqrt5=%.4f"%(1/5**.5)," angle=%.2f deg"%np.degrees(np.arccos(1/5**.5)))
```

### `11_phi_pi_calculations.py`

```python
"""
Calculations used in the E8 / golden-ratio (phi) / pi discussion.  Pure numpy, float64.
Run:  python3 phi_pi_calculations.py
Every section prints its own numbers.  Tolerances are stated where used.
Nothing here is simulated data: the 240 E8 roots are an exact construction, and the only random
parts (sections 4 and 5) use fixed seeds and are labelled.
"""
import itertools
import numpy as np

PI  = np.pi                    # 3.141592653589793 (float64, ~15-16 significant digits)
PHI = (1 + 5 ** 0.5) / 2       # 1.618033988749895
TOL = 1e-6                     # tolerance used when COUNTING "same direction" / "ratio = phi" pairs
print(f"pi = {PI!r}   phi = {PHI!r}   counting tolerance = {TOL}\n")

# ---------------------------------------------------------------- 1. E8 roots, Coxeter element, four planes
roots = []
for i in range(8):
    for j in range(i + 1, 8):
        for si in (1, -1):
            for sj in (1, -1):
                v = np.zeros(8); v[i] = si; v[j] = sj; roots.append(v)          # 112 roots +-e_i +-e_j
for s in itertools.product((1, -1), repeat=8):
    if s.count(-1) % 2 == 0:
        roots.append(np.array(s) / 2)                                           # 128 roots (+-1/2)^8, even # of minus signs
R = np.array(roots)                                                             # 240 x 8
simple = [np.array([.5, -.5, -.5, -.5, -.5, -.5, -.5, .5])]                     # Bourbaki simple roots
for v in [(1, 1), (-1, 1)]:
    x = np.zeros(8); x[0], x[1] = v; simple.append(x)
for i in range(2, 7):
    x = np.zeros(8); x[i - 1] = -1; x[i] = 1; simple.append(x)
cox = np.eye(8)
for a in simple:
    cox = cox @ (np.eye(8) - np.outer(a, a))                                    # reflection s_a = I - a a^T  (|a|^2 = 2)
w, vec = np.linalg.eig(cox)
m = np.round(np.angle(w) * 30 / (2 * PI)).astype(int) % 30                      # exponents 1,7,11,13,17,19,23,29
planes = {}
for k in (1, 11, 7, 13):                                                        # real 2-planes: A=1, B=11, C=7, D=13
    i = [j for j in range(8) if m[j] == k][0]
    planes[k] = np.linalg.qr(np.array([vec[:, i].real, vec[:, i].imag]).T)[0]
ORDER = (1, 11, 7, 13)
Qall = np.hstack([planes[k] for k in ORDER])
X = {k: R @ planes[k] for k in planes}                                          # 2D coordinates of every root in each plane
Y = np.hstack([X[k] for k in ORDER])                                            # 240 x 8 coordinates in the frame (A,B,C,D)
print("1. planes orthonormal & fill 8D:", np.allclose(Qall.T @ Qall, np.eye(8)),
      "| roots rebuilt from 4 planes, max error:", np.abs(Y @ Qall.T - R).max(),
      "| rho_A^2+rho_B^2+rho_C^2+rho_D^2 = 2 for all roots:", np.allclose((Y ** 2).sum(1), 2))

# ---------------------------------------------------------------- 2. plane A: rings, phi pairs, decagon, pentagon, shared rays
rho_A = np.linalg.norm(X[1], axis=1)
ring_r = sorted(set(np.round(rho_A, 9)))
ring_id = np.array([ring_r.index(round(r, 9)) for r in rho_A])
ring_exact = np.array([rho_A[ring_id == k].mean() for k in range(8)])           # unrounded ring radii (rounding above is only used to label rings)
pairs = [(i, j) for i in range(8) for j in range(8) if abs(ring_exact[j] / ring_exact[i] - PHI) < 1e-6]
ang = np.degrees(np.arctan2(X[1][:, 1], X[1][:, 0])) % 360
def ring_points(k):
    ids = np.where(ring_id == k)[0]
    return X[1][ids[np.argsort(ang[ids])]], np.sort(ang[ids])
print(f"\n2. plane A: {len(ring_r)} rings of {int((ring_id == 0).sum())} points; phi-paired rings (inner, outer): {pairs}")
for i, j in pairs:
    P, a_out = ring_points(j); n = len(P); r_in = ring_exact[i]
    chord = lambda s: np.array([np.linalg.norm(P[k] - P[(k + s) % n]) for k in range(n)])   # chord between points s steps apart (12 deg per step)
    dec, side, diag = chord(3), chord(6), chord(12)                                          # decagon edge (36 deg), pentagon side (72), diagonal (144)
    arc = 2 * PI * ring_exact[j] / 10                                                            # C = 2*pi*R, one tenth of it
    same_rays = np.allclose(ring_points(i)[1], a_out, atol=1e-6)
    print(f"   rings ({i},{j}): R_out/r_in={ring_exact[j]/r_in:.12f} | decagon edge/r_in={dec.mean()/r_in:.12f} "
          f"(max dev from 1: {abs(dec/r_in - 1).max():.1e}) | pentagon diag/side={ (diag/side).mean():.12f} "
          f"(max dev from phi: {abs(diag/side - PHI).max():.1e}) | arc/chord={arc/dec.mean():.4f} | same 30 rays: {same_rays}")

# ---------------------------------------------------------------- 3. the 4D view (planes A+B): shells, edge = inner radius, 72 decagon planes
X4 = Y[:, :4]; n4 = (X4 ** 2).sum(1); outer = n4 > 1
O = X4[outer]; R4 = np.sqrt(n4[outer].max()); r4 = np.sqrt(n4[~outer].max())
Dm = np.linalg.norm(O[:, None] - O[None], axis=2); edge = Dm[Dm > 1e-9].min()
print(f"\n3. 4D view: outer radius {R4:.6f}, inner radius {r4:.6f}, ratio {R4/r4:.9f}; "
      f"600-cell edge {edge:.6f}; edge/inner radius {edge/r4:.9f}")
U4 = O / np.linalg.norm(O, axis=1)[:, None]
G = U4 @ U4.T
adj4 = np.argwhere(np.triu(np.abs(G - PHI / 2) < TOL))                          # neighbours: cos = phi/2 (36 deg apart)
dec_planes = {}
for a, b in adj4:
    B = np.linalg.qr(np.c_[U4[a], U4[b]])[0]
    dec_planes[tuple(np.where(np.linalg.norm(U4 - U4 @ B @ B.T, axis=1) < 1e-6)[0])] = B
per_vertex = np.zeros(len(U4), int)
for p in dec_planes:
    per_vertex[list(p)] += 1
Bp = next(iter(dec_planes.values()))
in_plane = np.where(np.linalg.norm(X4 - X4 @ Bp @ Bp.T, axis=1) < 1e-6)[0]
print(f"   edges {len(adj4)} | decagon planes through the origin {len(dec_planes)} | planes per outer vertex {set(per_vertex)} "
      f"| roots (of all 240) lying in one such plane: {len(in_plane)}")

# ---------------------------------------------------------------- 4. 4D -> 3D projections of the 4D object (seeded)
def proj3_report(name, axis):
    axis = axis / np.linalg.norm(axis); Pr = np.eye(4) - np.outer(axis, axis)
    kept = sum(1 for k in dec_planes if np.all(np.abs(U4[list(k)] @ axis) < 1e-9))
    r = []
    for a, b in adj4:
        for v in (a, b):
            inn = np.linalg.norm(Pr @ O[v]) / PHI
            if inn > 1e-9: r.append(np.linalg.norm(Pr @ O[a] - Pr @ O[b]) / inn)
    r = np.array(r); ok = np.mean(np.abs(r - 1) < 1e-9)
    lost = len(O) - len(np.unique(np.round(O - np.outer(O @ axis, axis), 6), axis=0))
    print(f"   {name:22s} planes kept {kept:2d}/72 | edge=inner radius holds {100*ok:5.1f}% | ratio range {r.min():.3f}..{r.max():.3f} | overlap-lost {lost}")
print("\n4. 4D -> 3D (drop one axis):")
v0 = U4[0]; nbs = np.where(np.abs(U4 @ v0 - PHI / 2) < TOL)[0]; e1 = nbs[0]
f1 = [k for k in nbs[1:] if abs(U4[k] @ U4[e1] - PHI / 2) < TOL][0]
c1 = [k for k in nbs[1:] if k not in (e1, f1) and abs(U4[k] @ U4[e1] - PHI / 2) < TOL and abs(U4[k] @ U4[f1] - PHI / 2) < TOL]
proj3_report("generic (seed 2)", np.random.default_rng(2).normal(size=4))
proj3_report("vertex axis", v0); proj3_report("edge axis", v0 + U4[e1]); proj3_report("face axis", v0 + U4[e1] + U4[f1])
if c1: proj3_report("cell axis", v0 + U4[e1] + U4[f1] + U4[c1[0]])

# ---------------------------------------------------------------- 5. chain 8 -> 2: first d coordinates of the frame
Gr = R @ R.T; adj8 = np.argwhere(np.triu(np.isclose(Gr, 1)))                    # adjacent roots (60 deg, inner product 1)
def measures(P):
    nrm = np.linalg.norm(P, axis=1); nz = nrm > 1e-9
    U = np.zeros_like(P); U[nz] = P[nz] / nrm[nz, None]
    cos = U @ U.T; ratio = np.where(nz[None, :] & nz[:, None], nrm[None, :] / np.maximum(nrm[:, None], 1e-12), 0)
    shells = len(set(np.round(nrm, 6)))
    phipar = int(((np.abs(cos - 1) < TOL) & (np.abs(ratio - PHI) < TOL)).sum())   # ordered pairs: point j = phi * point i, same direction
    cs = np.abs(cos[np.triu_indices(240, 1)])
    five = int(((np.abs(cs - PHI / 2) < TOL) | (np.abs(cs - (PHI - 1) / 2) < TOL)).sum())   # angle 36 or 72 deg
    el = np.linalg.norm(P[adj8[:, 0]] - P[adj8[:, 1]], axis=1) / np.sqrt(2)
    return shells, phipar, five, el.mean(), np.sqrt((el ** 2).mean())
print("\n5. chain A,B,C,D, first d coordinates:  d | shells | phi-parallel pairs | 36/72-deg pairs | mean edge kept | rms edge kept (sqrt(d/8))")
for d in (8, 7, 6, 5, 4, 3, 2):
    s, p, f, me, rms = measures(Y[:, :d]); print(f"   {d} | {s:3d} | {p:3d} | {f:5d} | {me:.3f} | {rms:.6f} ({np.sqrt(d/8):.6f})")
rng = np.random.default_rng(4); acc = {d: [] for d in (7, 6, 5, 4, 3, 2)}
for _ in range(200):
    Yr = R @ np.linalg.qr(rng.normal(size=(8, 8)))[0]
    for d in acc: acc[d].append(measures(Yr[:, :d]))
print("   random frames (200, seed 4): max phi-parallel pairs / max 36-72deg pairs at each d:",
      {d: (max(a[1] for a in acc[d]), max(a[2] for a in acc[d])) for d in acc})

# ---------------------------------------------------------------- 6. the "factors of phi" test: k factors of phi applied to the d-dim image
print("\n6. points of (phi^k * d-dim image) landing exactly (within 1e-6) on points of the d-dim image, k=1,2,3:")
for d in (2, 3, 4, 5, 6, 7):
    A = Y[:, :d]
    print(f"   d={d}:", [sum(1 for p in (PHI ** k) * A if np.min(np.linalg.norm(A - p, axis=1)) < TOL) for k in (1, 2, 3)])

# ---------------------------------------------------------------- 7. the 8 orbits and their four radii
print("\n7. radii (rho_A, rho_B, rho_C, rho_D) of each orbit of 30 roots; phi-pair ratios outer/inner:")
rho = np.stack([np.linalg.norm(X[k], axis=1) for k in ORDER], axis=1)
rows = np.array([rho[ring_id == k].mean(0) for k in range(8)])
for k in range(8): print(f"   ring {k}:", np.round(rows[k], 4))
for i, j in pairs: print(f"   rings ({i},{j}) ratios:", np.round(rows[j] / rows[i], 4))
```

### `12_extra_checks.py`

```python
"""Checks that were run inline during the conversation, now saved so they can be re-run.
Self-contained.  numpy only.   Python float64 throughout."""
import itertools, numpy as np
PI=np.pi; PHI=(1+5**.5)/2; TOL=1e-6
print(f"pi = {PI!r}  phi = {PHI!r}  float64 epsilon = {np.finfo(float).eps}  counting tolerance = {TOL}\n")
# ---- E8 roots, Coxeter element, four planes A,B,C,D (same construction as 11_phi_pi_calculations.py section 1)
roots=[]
for i in range(8):
    for j in range(i+1,8):
        for si in (1,-1):
            for sj in (1,-1):
                v=np.zeros(8); v[i]=si; v[j]=sj; roots.append(v)
for s in itertools.product((1,-1),repeat=8):
    if s.count(-1)%2==0: roots.append(np.array(s)/2)
R=np.array(roots)
simple=[np.array([.5,-.5,-.5,-.5,-.5,-.5,-.5,.5])]
for v in [(1,1),(-1,1)]:
    x=np.zeros(8); x[0],x[1]=v; simple.append(x)
for i in range(2,7):
    x=np.zeros(8); x[i-1]=-1; x[i]=1; simple.append(x)
cox=np.eye(8)
for a in simple: cox=cox@(np.eye(8)-np.outer(a,a))
w,vec=np.linalg.eig(cox); m=np.round(np.angle(w)*30/(2*PI)).astype(int)%30
planes={}
for k in (1,11,7,13):
    i=[j for j in range(8) if m[j]==k][0]; planes[k]=np.linalg.qr(np.array([vec[:,i].real,vec[:,i].imag]).T)[0]
ORDER=(1,11,7,13); X={k:R@planes[k] for k in planes}; Y=np.hstack([X[k] for k in ORDER])

# ---- X1: all angles between E8 roots in 8D
Gr=R@R.T
print("X1. cosines between different roots in 8D:",sorted(set(np.round(Gr[np.triu_indices(240,1)]/2,4))),"-> only 0, +-1/2, +-1 (60/90/120/180 deg): no 36/72 deg angles in 8D")

# ---- X2: angular grid of the rings in plane A
rho_A=np.linalg.norm(X[1],axis=1); rr=sorted(set(np.round(rho_A,9))); rid=np.array([rr.index(round(r,9)) for r in rho_A])
ang=np.degrees(np.arctan2(X[1][:,1],X[1][:,0]))%360
print("\nX2. plane A rings: points, angular spacing (deg), offset of ring modulo 12 deg")
for k in range(8):
    a=np.sort(ang[rid==k]); print(f"   ring {k}: radius {rho_A[rid==k].mean():.6f}  points {len(a)}  spacings {np.unique(np.round(np.diff(a),3))}  offsets mod 12 {np.unique(np.round(a%12,3))}")
ga=360*(1-1/PHI); print(f"   golden angle 360/phi^2 = {ga:.4f} deg; modulo 12 deg = {ga%12:.4f}  (a multiple of 6 would be 0 or 6)")
print("   rotation of the Coxeter element per step in planes A,B,C,D (deg):",[12*mm%360 for mm in (1,11,7,13)])

# ---- X3: weighting the hidden planes (an invertible linear map) vs dropping them
def phipar(P):
    n=np.linalg.norm(P,axis=1); nz=n>1e-9; U=np.zeros_like(P); U[nz]=P[nz]/n[nz,None]
    cos=U@U.T; ratio=np.where(nz[None,:]&nz[:,None],n[None,:]/np.maximum(n[:,None],1e-12),0)
    return int(((np.abs(cos-1)<TOL)&(np.abs(ratio-PHI)<TOL)).sum())
print("\nX3. phi-parallel ordered pairs (point j = phi * point i, same direction) after weighting the hidden planes C,D by lambda")
for lam in (1/PHI,PHI,PHI**2,1.0): print(f"   lambda = {lam:.6f}: {phipar(Y*np.r_[np.ones(4),lam*np.ones(4)])}")
print("   lambda = 0 (drop C,D = project to the 4D view):",phipar(Y[:,:4]))
nr=(Y[:,:4]**2).sum(1); out=nr>1
Uo=Y[out,:4]/np.linalg.norm(Y[out,:4],axis=1)[:,None]; Ui=Y[~out,:4]/np.linalg.norm(Y[~out,:4],axis=1)[:,None]
Mx=np.abs(Uo@Ui.T-1)<TOL; ips=set(round(float(R[out][a]@R[~out][b]),4) for a,b in zip(*np.where(Mx)))
print("   8D inner product between the two roots of each phi-parallel pair:",ips)

# ---- X4: icosahedron seen along a 3-fold axis: visible radii, hidden depths; 3D and 2D edge/circumradius
V=np.array([(0,s1,s2*PHI) for s1 in (1,-1) for s2 in (1,-1)]+[(s1,s2*PHI,0) for s1 in (1,-1) for s2 in (1,-1)]+[(s2*PHI,0,s1) for s1 in (1,-1) for s2 in (1,-1)],float)
V/=np.linalg.norm(V[0]); d3=np.array([1,1,1.])/3**.5; z=V@d3; P=V-np.outer(z,d3); r=np.linalg.norm(P,axis=1)
zs=sorted(set(np.round(np.abs(z),6))); rs=sorted(set(np.round(r,6)))
print(f"\nX4. icosahedron along (1,1,1): depths |z| {zs} ratio {zs[0]/zs[1]:.7f} (phi^-3 = {PHI**-3:.7f}); radii {rs} ratio {rs[1]/rs[0]:.7f} (phi = {PHI:.7f})")
print("   distinct 2D points:",len(set(map(tuple,np.round(P,6)))),"of 12")
Vf=P+np.outer(-z,d3); print("   depth-flipped point set equals the original:",all(np.min(np.linalg.norm(V-x,axis=1))<1e-6 for x in Vf))
Dv=np.linalg.norm(V[:,None]-V[None],axis=2); e3=Dv[Dv>1e-9].min()
print(f"   3D icosahedron edge/circumradius = {e3/np.linalg.norm(V[0]):.6f} (1/phi = {1/PHI:.6f});  2D decagon edge/circumradius = {2*np.sin(PI/10):.6f}")

# ---- X5: baseline 'shared hidden direction' rule and the singlet identity
E_lhv=lambda th:-(1-2*th/PI)          # E for A=sign(a.lam), B=-sign(b.lam), lam uniform on the sphere (closed form)
a,a2,b,b2=0,np.radians(90),np.radians(45),np.radians(-45)
S=abs(E_lhv(abs(a-b))+E_lhv(abs(a-b2))+E_lhv(abs(a2-b))-E_lhv(abs(a2-b2)))
grid=np.radians(np.arange(0,360,5)); best=0
for aa,aa2,bb,bb2 in itertools.product(grid[::3],grid[::3],grid[::3],grid[::3]):
    th=lambda x,y:abs(((x-y)+PI)%(2*PI)-PI)
    best=max(best,abs(E_lhv(th(aa,bb))+E_lhv(th(aa,bb2))+E_lhv(th(aa2,bb))-E_lhv(th(aa2,bb2))))
print(f"\nX5. shared-hidden-direction rule, closed form E(theta) = -(1-2*theta/pi): CHSH at the standard settings = {S:.6f}; best over a 15-degree grid = {best:.6f}")
print("    singlet identity: 2*P(equal)-1 with P(equal)=sin^2(theta/2) equals -cos(theta); max difference over 361 angles:",
      max(abs((2*np.sin(np.radians(t)/2)**2-1)+np.cos(np.radians(t))) for t in range(361)))

# ---- X6: length lost per dimension step, and the factor that would restore it, against powers of phi
Gm=R@R.T; adj=np.argwhere(np.triu(np.isclose(Gm,1)))
print("\nX6. root-edge length kept (rms) after keeping the first d coordinates; sqrt(d/8); factor needed to restore it")
for d in (7,6,5,4,3,2):
    P=Y[:,:d]; el=np.linalg.norm(P[adj[:,0]]-P[adj[:,1]],axis=1)/np.sqrt(2); rms=np.sqrt((el**2).mean())
    print(f"   d={d}: rms {rms:.6f}  sqrt(d/8)={np.sqrt(d/8):.6f}  restoring factor {1/rms:.4f}   (phi={PHI:.3f}, phi^2={PHI**2:.3f})")
```

### `13_fold_invariants.py`

```python
"""Fold the 'visible' axes (planes A,B) over the 'hidden' axes (planes C,D) and see which combinations survive a phi-step.
Self-contained; numpy + matplotlib.  Run: python3 fold_diagram.py   (writes E8_fold_visible_over_hidden.png)"""
import itertools, numpy as np, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
PI=np.pi; PHI=(1+5**.5)/2
roots=[]
for i in range(8):
    for j in range(i+1,8):
        for si in (1,-1):
            for sj in (1,-1):
                v=np.zeros(8); v[i]=si; v[j]=sj; roots.append(v)
for s in itertools.product((1,-1),repeat=8):
    if s.count(-1)%2==0: roots.append(np.array(s)/2)
R=np.array(roots)
simple=[np.array([.5,-.5,-.5,-.5,-.5,-.5,-.5,.5])]
for v in [(1,1),(-1,1)]:
    x=np.zeros(8); x[0],x[1]=v; simple.append(x)
for i in range(2,7):
    x=np.zeros(8); x[i-1]=-1; x[i]=1; simple.append(x)
cox=np.eye(8)
for a in simple: cox=cox@(np.eye(8)-np.outer(a,a))
w,vec=np.linalg.eig(cox); m=np.round(np.angle(w)*30/(2*PI)).astype(int)%30
planes={}
for k in (1,11,7,13):
    i=[j for j in range(8) if m[j]==k][0]; planes[k]=np.linalg.qr(np.array([vec[:,i].real,vec[:,i].imag]).T)[0]
Y=np.hstack([R@planes[k] for k in (1,11,7,13)])
rho=np.stack([np.linalg.norm(Y[:,2*k:2*k+2],axis=1) for k in range(4)],axis=1)     # radii on planes A,B,C,D
rhoA=rho[:,0]; labels=sorted(set(np.round(rhoA,9))); ring_id=np.array([labels.index(round(r,9)) for r in rhoA])
rows=np.array([rho[ring_id==k].mean(0) for k in range(8)])                          # one (rhoA,rhoB,rhoC,rhoD) per orbit of 30 roots
pairs=[(i,j) for i in range(8) for j in range(8) if abs(rows[j,0]/rows[i,0]-PHI)<1e-6]
i0,j0=pairs[0]; inner,outer=rows[i0],rows[j0]
print("phi-pairs (inner,outer):",pairs)
print("outer/inner radius ratios on A,B,C,D:",np.round(outer/inner,9),"(phi, phi, 1/phi, 1/phi)")
quant={"rhoA*rhoD\n(fold A over D)":lambda r:r[0]*r[3],"rhoB*rhoC\n(fold B over C)":lambda r:r[1]*r[2],
       "rhoA*rhoC":lambda r:r[0]*r[2],"rhoB*rhoD":lambda r:r[1]*r[3],"rhoA/rhoB\n(A over B)":lambda r:r[0]/r[1],
       "rhoA/rhoD\n(divide instead)":lambda r:r[0]/r[3]}
for n,f in quant.items():
    print(f"  {n.replace(chr(10),' '):28s} inner {f(inner):.12f}  outer {f(outer):.12f}  |diff| {abs(f(outer)-f(inner)):.1e}  (max over all 4 pairs {max(abs(f(rows[j])-f(rows[i])) for i,j in pairs):.1e})")
fig,(ax,bx)=plt.subplots(1,2,figsize=(15,7),facecolor="white",gridspec_kw={"width_ratios":[1,1.35]})
xs=np.arange(4)
for r_ in rows: ax.plot(xs,r_,color="#ddd",lw=1)
ax.plot(xs,inner,color="#1f77b4",lw=3.5,marker="o",ms=9,label="inner orbit")
ax.plot(xs,outer,color="#d62728",lw=3.5,marker="o",ms=9,label="outer orbit (its phi-partner)")
ax.axvline(1.5,color="black",ls="--",lw=2); ax.text(1.5,2.0,"fold here",ha="center",fontsize=12,fontweight="bold")
ax.set_xticks(xs); ax.set_xticklabels(["rho_A","rho_B","rho_C","rho_D"],fontsize=12); ax.set_ylim(0,2.15); ax.legend(loc="lower center",fontsize=10)
ax.set_title("Before folding: the 4 radii of one phi-pair\nvisible axes (A,B) go UP by phi, hidden axes (C,D) go DOWN by 1/phi",fontsize=11.5)
for sp in ("top","right"): ax.spines[sp].set_visible(False)
names=list(quant.keys()); wd=0.38; xx=np.arange(len(names))
vi=[quant[n](inner) for n in names]; vo=[quant[n](outer) for n in names]
bx.bar(xx-wd/2,vi,wd,color="#1f77b4",label="inner orbit"); bx.bar(xx+wd/2,vo,wd,color="#d62728",label="outer orbit")
for k,(a,b) in enumerate(zip(vi,vo)):
    bx.text(k-wd/2,a+0.02,f"{a:.4f}",ha="center",fontsize=9); bx.text(k+wd/2,b+0.02,f"{b:.4f}",ha="center",fontsize=9)
bx.set_xticks(xx); bx.set_xticklabels(names,fontsize=10); bx.legend(fontsize=10,loc="upper left")
bx.axvspan(-0.5,4.5,color="#e8f5e9",zorder=0); bx.text(2.0,0.98,"inner and outer match to 1e-16",ha="center",fontsize=11,color="#1b5e20")
bx.text(5.0,0.85,"not invariant",ha="center",fontsize=11,color="#b71c1c")
bx.set_ylim(0,1.45); bx.set_title("After folding: inner and outer bars match exactly;\nthe divide-visible-by-hidden fold (last group) does not",fontsize=11.5)
for sp in ("top","right"): bx.spines[sp].set_visible(False)
fig.suptitle("Fold the diagram so visible axes lie over hidden axes",fontsize=14,y=0.99)
fig.subplots_adjust(top=0.85,bottom=0.12,left=0.04,right=0.99,wspace=0.12)
fig.savefig("E8_fold_visible_over_hidden.png",dpi=150)
```

### `14_eight_axes_xyz_window.py`

```python
"""Draws 8 perpendicular axes (a) seen through an XYZ window and (b) side by side (parallel coordinates).
Self-contained; numpy + matplotlib.  Run: python3 draw_eight_axes.py   (writes E8_eight_axes_and_XYZ.png)"""
import itertools, numpy as np, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
PI=np.pi
roots=[]
for i in range(8):
    for j in range(i+1,8):
        for si in (1,-1):
            for sj in (1,-1):
                v=np.zeros(8); v[i]=si; v[j]=sj; roots.append(v)
for s in itertools.product((1,-1),repeat=8):
    if s.count(-1)%2==0: roots.append(np.array(s)/2)
R=np.array(roots)
simple=[np.array([.5,-.5,-.5,-.5,-.5,-.5,-.5,.5])]
for v in [(1,1),(-1,1)]:
    x=np.zeros(8); x[0],x[1]=v; simple.append(x)
for i in range(2,7):
    x=np.zeros(8); x[i-1]=-1; x[i]=1; simple.append(x)
cox=np.eye(8)
for a in simple: cox=cox@(np.eye(8)-np.outer(a,a))
w,vec=np.linalg.eig(cox); m=np.round(np.angle(w)*30/(2*PI)).astype(int)%30
planes={}
for k in (1,11,7,13):
    i=[j for j in range(8) if m[j]==k][0]; planes[k]=np.linalg.qr(np.array([vec[:,i].real,vec[:,i].imag]).T)[0]
Y=np.hstack([R@planes[k] for k in (1,11,7,13)])                 # 240 x 8: coordinates on axes A_x,A_y,B_x,B_y,C_x,C_y,D_x,D_y
rho_A=np.linalg.norm(Y[:,:2],axis=1); rings=sorted(set(np.round(rho_A,9))); ring_id=np.array([rings.index(round(r,9)) for r in rho_A])
# the XYZ window: tilt the four planes symmetrically (normals = cube diagonals); sum of the four plane embeddings is an orthogonal projection
normals=np.array([(1,1,1),(1,-1,-1),(-1,1,-1),(-1,-1,1)],float); normals/=np.linalg.norm(normals,axis=1)[:,None]
U=[];V=[]
for n in normals:
    u=np.array([0,0,1.])-(n[2])*n; u/=np.linalg.norm(u); U.append(u); V.append(np.cross(n,u))
M=np.hstack([np.c_[U[i],V[i]] for i in range(4)])/np.sqrt(8/3)   # 3 x 8
shadow=M.T                                                         # row k = shadow of axis k inside XYZ
L=np.linalg.norm(shadow,axis=1)
print("M M^T = I_3 (orthogonal projection onto 3D):",np.allclose(M@M.T,np.eye(3)))
print("shadow length of every axis:",np.round(L,6),"| sqrt(3/8) =",round(np.sqrt(3/8),6),"| sum of squares =",round(float((L**2).sum()),6))
print("distinct inner products between different axes' shadows:",sorted(set(np.round((shadow@shadow.T)[np.triu_indices(8,1)],4))))
lab=["A_x","A_y","B_x","B_y","C_x","C_y","D_x","D_y"]; cols=["#1f77b4"]*2+["#d62728"]*2+["#2ca02c"]*2+["#ff7f0e"]*2
star=int(np.where(ring_id==5)[0][0]); rng=np.random.default_rng(5); others=[int(rng.choice(np.where(ring_id==k)[0])) for k in (0,2,3,6)]
fig=plt.figure(figsize=(15,7.6),facecolor="white")
ax=fig.add_subplot(1,2,1,projection="3d")
for vv,name in (((1.25,0,0),"X"),((0,1.25,0),"Y"),((0,0,1.25),"Z")):
    ax.plot([-vv[0],vv[0]],[-vv[1],vv[1]],[-vv[2],vv[2]],color="#888",lw=1.2,ls="--"); ax.text(*(np.array(vv)*1.08),name,fontsize=13,fontweight="bold")
for k in range(8):
    ax.quiver(0,0,0,*shadow[k],color=cols[k],lw=3.2,arrow_length_ratio=0.12); ax.text(*(shadow[k]*1.22),lab[k],color=cols[k],fontsize=11,fontweight="bold")
p=M@Y[star]; ax.scatter(*p,marker="*",s=380,c="black",zorder=10,depthshade=False); ax.text(*(p*1.12),"one root",fontsize=10)
ax.set_xlim(-1,1); ax.set_ylim(-1,1); ax.set_zlim(-1,1); ax.set_box_aspect((1,1,1)); ax.view_init(22,40); ax.set_axis_off()
ax.set_title("The 8 axes seen through an XYZ window\nevery shadow has length 0.612 = sqrt(3/8);\nthe shadows are no longer perpendicular",fontsize=11.5)
bx=fig.add_subplot(1,2,2)
for r_ in others: bx.plot(range(8),Y[r_],color="#bbb",lw=1.6,marker="o",ms=4)
bx.plot(range(8),Y[star],color="black",lw=3.2,marker="*",ms=16)
for k in range(8): bx.axvline(k,color=cols[k],lw=2.2,alpha=0.5)
bx.set_xticks(range(8)); bx.set_xticklabels(lab,fontsize=12); bx.set_ylim(-1.25,1.25); bx.axhline(0,color="#999",lw=0.8)
bx.set_ylabel("coordinate value on that axis"); bx.spines[["top","right"]].set_visible(False)
bx.set_title("The same object written on 8 perpendicular axes\nblack = the root shown as a star at left; grey = 4 other roots",fontsize=11.5)
bx.text(1.5,-1.2,"A, B = the 4D 'view'",ha="center",fontsize=10); bx.text(5.5,-1.2,"C, D = the 4D 'hidden' part",ha="center",fontsize=10)
fig.suptitle("Representing 8 axes: through an XYZ window (left) and side by side (right)",fontsize=13.5,y=0.985)
fig.subplots_adjust(top=0.80,bottom=0.08,left=0.02,right=0.98,wspace=0.12)
fig.savefig("E8_eight_axes_and_XYZ.png",dpi=150)
print("that root's 8 coordinates:",np.round(Y[star],4),"| its XYZ image:",np.round(p,4))
```

### `15_octahedron_fold_template.py`

```python
"""Octahedron as a folding template for planes A,B,C,D. (Fold the 'visible' axes (planes A,B) over the 'hidden' axes (planes C,D) and see which combinations survive a phi-step.
Self-contained; numpy + matplotlib.  Run: python3 octahedron_fold_template.py"""
import itertools, numpy as np, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
PI=np.pi; PHI=(1+5**.5)/2
roots=[]
for i in range(8):
    for j in range(i+1,8):
        for si in (1,-1):
            for sj in (1,-1):
                v=np.zeros(8); v[i]=si; v[j]=sj; roots.append(v)
for s in itertools.product((1,-1),repeat=8):
    if s.count(-1)%2==0: roots.append(np.array(s)/2)
R=np.array(roots)
simple=[np.array([.5,-.5,-.5,-.5,-.5,-.5,-.5,.5])]
for v in [(1,1),(-1,1)]:
    x=np.zeros(8); x[0],x[1]=v; simple.append(x)
for i in range(2,7):
    x=np.zeros(8); x[i-1]=-1; x[i]=1; simple.append(x)
cox=np.eye(8)
for a in simple: cox=cox@(np.eye(8)-np.outer(a,a))
w,vec=np.linalg.eig(cox); m=np.round(np.angle(w)*30/(2*PI)).astype(int)%30
planes={}
for k in (1,11,7,13):
    i=[j for j in range(8) if m[j]==k][0]; planes[k]=np.linalg.qr(np.array([vec[:,i].real,vec[:,i].imag]).T)[0]
Y=np.hstack([R@planes[k] for k in (1,11,7,13)])
rho=np.stack([np.linalg.norm(Y[:,2*k:2*k+2],axis=1) for k in range(4)],axis=1)     # radii on planes A,B,C,D
rhoA=rho[:,0]; labels=sorted(set(np.round(rhoA,9))); ring_id=np.array([labels.index(round(r,9)) for r in rhoA])
rows=np.array([rho[ring_id==k].mean(0) for k in range(8)])                          # one (rhoA,rhoB,rhoC,rhoD) per orbit of 30 roots
pairs=[(i,j) for i in range(8) for j in range(8) if abs(rows[j,0]/rows[i,0]-PHI)<1e-6]
i0,j0=pairs[0]; inner,outer=rows[i0],rows[j0]
print("phi-pairs (inner,outer):",pairs)
print("outer/inner radius ratios on A,B,C,D:",np.round(outer/inner,9),"(phi, phi, 1/phi, 1/phi)")
quant={"rhoA*rhoD\n(fold A over D)":lambda r:r[0]*r[3],"rhoB*rhoC\n(fold B over C)":lambda r:r[1]*r[2],
       "rhoA*rhoC":lambda r:r[0]*r[2],"rhoB*rhoD":lambda r:r[1]*r[3],"rhoA/rhoB\n(A over B)":lambda r:r[0]/r[1],
       "rhoA/rhoD\n(divide instead)":lambda r:r[0]/r[3]}
for n,f in quant.items():
    print(f"  {n.replace(chr(10),' '):28s} inner {f(inner):.12f}  outer {f(outer):.12f}  |diff| {abs(f(outer)-f(inner)):.1e}  (max over all 4 pairs {max(abs(f(rows[j])-f(rows[i])) for i,j in pairs):.1e})")

from matplotlib.patches import Polygon
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
# ---------- octahedron: 6 vertices (+-e_i), 8 faces = sign triples; face (sx,sy,sz) has outward normal (sx,sy,sz)/sqrt(3)
verts=np.array([(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)],float)
vid=lambda s,axis:{(0,1):0,(0,-1):1,(1,1):2,(1,-1):3,(2,1):4,(2,-1):5}[(axis,s)]
faces=[(sx,sy,sz) for sx in (1,-1) for sy in (1,-1) for sz in (1,-1)]
fv={f:(vid(f[0],0),vid(f[1],1),vid(f[2],2)) for f in faces}
# the 4 plane normals used earlier for the XYZ window are 4 of these 8 face normals; the other 4 are their negatives
plane_normal={"A":(1,1,1),"B":(1,-1,-1),"C":(-1,1,-1),"D":(-1,-1,1)}
label={}
for p,n in plane_normal.items(): label[n]=p+"+"
for p,n in plane_normal.items(): label[tuple(-x for x in n)]=p+"-"
nm=np.array([plane_normal[p] for p in "ABCD"],float)/np.sqrt(3)
print("pairwise dot products of the 4 plane normals:",sorted(set(np.round((nm@nm.T)[np.triu_indices(4,1)],6))),"= -1/3 -> angle",round(np.degrees(np.arccos(-1/3)),4),"deg")
adjacent=lambda f,g:sum(a!=b for a,b in zip(f,g))==1
edges=[(f,g) for i,f in enumerate(faces) for g in faces[i+1:] if adjacent(f,g)]
n1=np.array(edges[0][0],float)/np.sqrt(3); n2=np.array(edges[0][1],float)/np.sqrt(3)
print("octahedron: 8 faces, 12 shared edges; outward-normal angle between adjacent faces:",round(np.degrees(np.arccos(n1@n2)),4),
      "deg  -> dihedral (the fold angle) =",round(180-np.degrees(np.arccos(n1@n2)),4),"deg   (= arccos(-1/3) =",round(np.degrees(np.arccos(-1/3)),4),")")
planes_of=lambda f:label[f][0]
types={}
for f,g in edges: types.setdefault("".join(sorted(planes_of(f)+planes_of(g))),0); types["".join(sorted(planes_of(f)+planes_of(g)))]+=1
print("each shared edge joins two DIFFERENT planes (a plane's own two sides are opposite faces); edges per plane pair:",types)
# ---------- unfold along a spanning tree (7 hinges) into a non-overlapping 2D net
def reflect(P,A,B):
    d=(B-A)/np.linalg.norm(B-A); q=A+d*np.dot(P-A,d); return 2*q-P
def unfold(tree_edges,root):
    pos={}; v=fv[root]; pos[root]={v[0]:np.array([0.,0.]),v[1]:np.array([1.,0.]),v[2]:np.array([.5,np.sqrt(3)/2])}
    seen={root}; stack=[root]; order=[root]
    while stack:
        f=stack.pop()
        for a,b in tree_edges:
            for p,c in ((a,b),(b,a)):
                if p==f and c not in seen:
                    shared=[x for x in fv[p] if x in fv[c]]; third_p=[x for x in fv[p] if x not in shared][0]; third_c=[x for x in fv[c] if x not in shared][0]
                    A,B=pos[p][shared[0]],pos[p][shared[1]]
                    pos[c]={shared[0]:A,shared[1]:B,third_c:reflect(pos[p][third_p],A,B)}; seen.add(c); stack.append(c); order.append(c)
    return pos
rng=np.random.default_rng(0); best=None
for trial in range(2000):
    perm=rng.permutation(len(edges)); parent={f:f for f in faces}
    def find(x):
        while parent[x]!=x: parent[x]=parent[parent[x]]; x=parent[x]
        return x
    tree=[]
    for k in perm:
        a,b=edges[k]
        if find(a)!=find(b): parent[find(a)]=find(b); tree.append((a,b))
    pos=unfold(tree,faces[0]); cent=np.array([np.mean(list(pos[f].values()),axis=0) for f in faces])
    D=np.linalg.norm(cent[:,None]-cent[None],axis=2)+np.eye(8)*9
    if D.min()>0.3: best=(tree,pos); break
tree,pos=best
print(f"found a non-overlapping net after {trial+1} random spanning trees; folds (hinges) needed = {len(tree)} = faces - 1")
print("hinges in this net (face - face : plane pair : combination that is invariant under the phi-step):")
inv={"AB":"rhoA/rhoB","CD":"rhoC/rhoD","AC":"rhoA*rhoC","AD":"rhoA*rhoD","BC":"rhoB*rhoC","BD":"rhoB*rhoD"}
for a,b in tree:
    k="".join(sorted(planes_of(a)+planes_of(b))); print(f"   {label[a]} - {label[b]} : {k} : {inv[k]}")
fn={"rhoA/rhoB":lambda r:r[0]/r[1],"rhoC/rhoD":lambda r:r[2]/r[3],"rhoA*rhoC":lambda r:r[0]*r[2],"rhoA*rhoD":lambda r:r[0]*r[3],"rhoB*rhoC":lambda r:r[1]*r[2],"rhoB*rhoD":lambda r:r[1]*r[3]}
print("check of those six combinations over all four phi-pairs (max |outer - inner|):",{k:float(f"{max(abs(fn[k](rows[j])-fn[k](rows[i])) for i,j in pairs):.1e}") for k in fn})
# ---------- figure
col={"A":"#1f77b4","B":"#d62728","C":"#2ca02c","D":"#ff7f0e"}
fig=plt.figure(figsize=(16,7.4),facecolor="white")
ax=fig.add_subplot(1,2,1); ax.set_aspect("equal"); ax.axis("off")
tset={frozenset(e) for e in tree}
for f in faces:
    pts=np.array(list(pos[f].values())); pl=label[f][0]; plus=label[f][1]=="+"
    ax.add_patch(Polygon(pts,closed=True,facecolor=col[pl],alpha=(0.95 if plus else 0.45),edgecolor="black",lw=1.6))
    c=pts.mean(0); ax.text(c[0],c[1],label[f],ha="center",va="center",fontsize=14,fontweight="bold",color="white" if plus else "black")
for a,b in tree:
    sh=[x for x in fv[a] if x in fv[b]]; P=pos[a][sh[0]],pos[a][sh[1]]; ax.plot([P[0][0],P[1][0]],[P[0][1],P[1][1]],color="black",lw=3.2,ls=(0,(3,2)))
allp=np.array([p for f in faces for p in pos[f].values()]); ax.set_xlim(allp[:,0].min()-.3,allp[:,0].max()+.3); ax.set_ylim(allp[:,1].min()-.3,allp[:,1].max()+.3)
ax.set_title("2D net: 8 faces = 4 planes x 2 sides (A+ ... D-)\ndashed = the 7 hinges; each folds by 109.47 deg",fontsize=12)
bx=fig.add_subplot(1,2,2,projection="3d")
import matplotlib.colors as mcolors
EL,AZ=22,35; view=np.array([np.cos(np.radians(EL))*np.cos(np.radians(AZ)),np.cos(np.radians(EL))*np.sin(np.radians(AZ)),np.sin(np.radians(EL))])
for f in faces:
    tri=verts[list(fv[f])]; pl=label[f][0]; plus=label[f][1]=="+"
    base=np.array(mcolors.to_rgb(col[pl])); rgb=base if plus else 0.45*base+0.55   # '-' side = lighter shade of the same colour
    bx.add_collection3d(Poly3DCollection([tri],facecolor=rgb,alpha=1.0,edgecolor="black",lw=1.6))
    if np.dot(np.array(f)/np.sqrt(3),view)>0.05:
        c=tri.mean(0)*1.02; bx.text(*c,label[f],fontsize=15,fontweight="bold",ha="center",va="center",color="white" if plus else "black",zorder=10)
bx.set_xlim(-1,1); bx.set_ylim(-1,1); bx.set_zlim(-1,1); bx.set_box_aspect((1,1,1)); bx.set_axis_off(); bx.view_init(EL,AZ)
bx.set_title("Folded: the octahedron in 3D (XYZ)\nopposite faces are the two sides of one plane\n(only the faces turned toward you are labelled)",fontsize=12)
fig.suptitle("The octahedron as a folding template: its 8 faces carry the 4 planes A, B, C, D (two sides each)",fontsize=13.5,y=0.99)
fig.subplots_adjust(top=0.86,bottom=0.02,left=0.02,right=0.98,wspace=0.05)
fig.savefig("E8_octahedron_fold_template.png",dpi=140)
```

### `16_fold_3d_illustration.py`

```python
"""(3D version) Fold the 'visible' axes (planes A,B) over the 'hidden' axes (planes C,D) and see which combinations survive a phi-step.
Self-contained; numpy + matplotlib.  Run: python3 fold_diagram.py   (writes E8_fold_visible_over_hidden.png)"""
import itertools, numpy as np, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
PI=np.pi; PHI=(1+5**.5)/2
roots=[]
for i in range(8):
    for j in range(i+1,8):
        for si in (1,-1):
            for sj in (1,-1):
                v=np.zeros(8); v[i]=si; v[j]=sj; roots.append(v)
for s in itertools.product((1,-1),repeat=8):
    if s.count(-1)%2==0: roots.append(np.array(s)/2)
R=np.array(roots)
simple=[np.array([.5,-.5,-.5,-.5,-.5,-.5,-.5,.5])]
for v in [(1,1),(-1,1)]:
    x=np.zeros(8); x[0],x[1]=v; simple.append(x)
for i in range(2,7):
    x=np.zeros(8); x[i-1]=-1; x[i]=1; simple.append(x)
cox=np.eye(8)
for a in simple: cox=cox@(np.eye(8)-np.outer(a,a))
w,vec=np.linalg.eig(cox); m=np.round(np.angle(w)*30/(2*PI)).astype(int)%30
planes={}
for k in (1,11,7,13):
    i=[j for j in range(8) if m[j]==k][0]; planes[k]=np.linalg.qr(np.array([vec[:,i].real,vec[:,i].imag]).T)[0]
Y=np.hstack([R@planes[k] for k in (1,11,7,13)])
rho=np.stack([np.linalg.norm(Y[:,2*k:2*k+2],axis=1) for k in range(4)],axis=1)     # radii on planes A,B,C,D
rhoA=rho[:,0]; labels=sorted(set(np.round(rhoA,9))); ring_id=np.array([labels.index(round(r,9)) for r in rhoA])
rows=np.array([rho[ring_id==k].mean(0) for k in range(8)])                          # one (rhoA,rhoB,rhoC,rhoD) per orbit of 30 roots
pairs=[(i,j) for i in range(8) for j in range(8) if abs(rows[j,0]/rows[i,0]-PHI)<1e-6]
i0,j0=pairs[0]; inner,outer=rows[i0],rows[j0]
print("phi-pairs (inner,outer):",pairs)
print("outer/inner radius ratios on A,B,C,D:",np.round(outer/inner,9),"(phi, phi, 1/phi, 1/phi)")
quant={"rhoA*rhoD\n(fold A over D)":lambda r:r[0]*r[3],"rhoB*rhoC\n(fold B over C)":lambda r:r[1]*r[2],
       "rhoA*rhoC":lambda r:r[0]*r[2],"rhoB*rhoD":lambda r:r[1]*r[3],"rhoA/rhoB\n(A over B)":lambda r:r[0]/r[1],
       "rhoA/rhoD\n(divide instead)":lambda r:r[0]/r[3]}
for n,f in quant.items():
    print(f"  {n.replace(chr(10),' '):28s} inner {f(inner):.12f}  outer {f(outer):.12f}  |diff| {abs(f(outer)-f(inner)):.1e}  (max over all 4 pairs {max(abs(f(rows[j])-f(rows[i])) for i,j in pairs):.1e})")

from mpl_toolkits.mplot3d import Axes3D
axcol=["#1f77b4","#d62728","#2ca02c","#ff7f0e"]; axname=["A","B","C","D"]
HINGE=1.5; ZMAX=1.3; xs=np.linspace(0,3,121)
def place(x,z,t,off):
    """paper point (x,z) -> 3D point after folding the part right of the hinge by angle t (radians) about the vertical line x=1.5"""
    x=np.asarray(x,float); z=np.asarray(z,float); s=x-HINGE; right=s>0
    X=np.where(right,HINGE+s*np.cos(t),x); Y=np.where(right,s*np.sin(t)+off*np.sin(t),0*x); return X,Y,z
fig=plt.figure(figsize=(18,7),facecolor="white")
for n,deg in enumerate((0,90,180)):
    t=np.radians(deg); off=0.07
    ax=fig.add_subplot(1,3,n+1,projection="3d")
    Sg,Zg=np.meshgrid(np.linspace(-0.4,0,2),np.linspace(0,ZMAX,2))
    X1,Y1,Z1=place(HINGE+Sg-0.0+0.0*Sg,Zg,t,off)                       # left half (never moves)
    xl=np.linspace(-0.4,HINGE,2); XL,ZL=np.meshgrid(xl,np.linspace(0,ZMAX,2)); ax.plot_surface(XL,0*XL,ZL,color="#f2f2f2",alpha=0.55,linewidth=0)
    xr=np.linspace(HINGE,3.4,2); XR,ZR=np.meshgrid(xr,np.linspace(0,ZMAX,2)); a,b,c=place(XR,ZR,t,off); ax.plot_surface(a,b,c,color="#dbe9f6",alpha=0.55,linewidth=0)
    for k in range(4):
        a,b,c=place(np.full(2,float(k)),np.array([0,ZMAX]),t,off); ax.plot(a,b,c,color=axcol[k],lw=3)
        a,b,c=place(np.array([float(k)]),np.array([-0.08]),t,off); ax.text(a[0],b[0],c[0],axname[k],color=axcol[k],fontsize=13,fontweight="bold")
    for vals,cl,nm in ((inner,"#1f77b4","inner orbit"),(outer,"#d62728","outer orbit")):
        a,b,c=place(xs,np.interp(xs,[0,1,2,3],vals),t,off); ax.plot(a,b,c,color=cl,lw=3.2,label=nm)
        a,b,c=place(np.arange(4.0),vals,t,off); ax.scatter(a,b,c,color=cl,s=55,depthshade=False)
    ax.plot([HINGE,HINGE],[0,0],[0,ZMAX],color="black",ls="--",lw=2.2)
    ax.set_xlim(-0.4,3.4); ax.set_ylim(-0.3,2.0); ax.set_zlim(-0.1,ZMAX); ax.set_box_aspect((3.8,1.5,1.5)); ax.view_init(28,-68)
    ax.set_xlabel("axis position"); ax.set_zlabel("radius"); ax.set_yticks([])
    ttl={0:"0\u00b0  flat: A B | C D",90:"90\u00b0  hinge turning at the dashed line",180:"180\u00b0  folded: D over A, C over B"}[deg]
    ax.set_title(ttl,fontsize=12.5)
    if deg==0: ax.legend(loc="upper right",fontsize=10)
    if deg==180:
        ax.text2D(0.02,0.04,f"folded pairs, inner vs outer orbit\nD over A:  {inner[0]*inner[3]:.6f}  vs  {outer[0]*outer[3]:.6f}\nC over B:  {inner[1]*inner[2]:.6f}  vs  {outer[1]*outer[2]:.6f}\n(products of the values that land on top of each other)",transform=ax.transAxes,fontsize=9.5,family="monospace")
fig.suptitle("The fold drawn in 3D: the diagram is a sheet in the XZ plane; the right half hinges 180\u00b0 about the dashed line",fontsize=14,y=0.99)
fig.subplots_adjust(top=0.88,bottom=0.02,left=0.0,right=1.0,wspace=0.0)
fig.savefig("E8_fold_in_3D.png",dpi=140)
print("folded 180 deg: axis D lands on axis A and C on B (x -> 3 - x):",[float(place(np.array([x]),np.array([0.]),np.pi,0)[0][0]) for x in (2.,3.)])
```
