# Working Summary: Projection Loss, a Greater Bulk, and Spin(8) Triality

**Date:** October 26, 2026
**Purpose:** Bring other reviewers up to date on the current direction and state of thought.
**Prepared with:** Claude (Anthropic) as assistant. Part 1 is the author's position as the author stated it. Parts 2 and the Appendices are Claude's review and suggestions, and are labeled as such.

**Scope note:** Earlier draft papers contain further claims. Only the items the author has explicitly confirmed are listed in Part 1. Anything not listed there should not be assumed to be the author's position.

**Labels used for mathematical statements**
- **[Standard]** well-established mathematics, not re-derived here
- **[Derived]** follows from stated facts in steps a reader can follow
- **[Computed]** checked by running code (scripts provided, see Appendix B)
- **[Assessment]** Claude's judgment, not a proven statement
- **[Open]** unresolved

---

## Part 1: The Author's Conclusions (as stated by the author)

1. **Greater bulk, dimension open.** 3+1D spacetime is the boundary of a greater bulk. Its dimension is not decided (6, 8, 10, 11 all remain possible). Eight dimensions with triality is the current working candidate, because the author's earlier 6D framing ran into mathematical roadblocks that an 8D premise may avoid.
2. **Projection loss is the basis of the theory.** The author's central claim is that what is observed in 3+1D is subject to projection loss from the greater structure.
3. **Entanglement as a representation of projection loss.** Entangled particles are a representation of projection loss. Whether they are literally one bulk object is **not concluded** by the author.
4. **Foundation: the triality-invariant trilinear form.** The mathematical foundation the author wants is the invariant trilinear map 8_v × 8_s × 8_c → ℝ under Spin(8), with triality permuting the three 8-dimensional representations. The author sees this as replacing ambiguous spatial phrasing with representation-space structure in which no single sector is privileged, and as bearing on how entanglement works (correlation as structure rather than as a signal across distance).
5. **Fermi paradox.** The Fermi paradox can be resolved through this framework. That is the entirety of the Fermi claim.
6. **Illustration (not a claim to be tested).** The idea that advanced civilizations could exploit such a structure is offered as a speculative analogy for how and why the framework might matter. The author is not trying to prove or disprove it.
7. **Methodological stance.** Take the physics problems that are currently unexplained as the problem list, and treat a higher-dimensional, triality-structured picture as a candidate solution space not previously considered in this form. The author suspects that reliance on 3D spatial geometry as the basis of computation is what limits current approaches.
8. **Verification practice.** Every result is cross-checked at least three ways, using multiple reviewers.

---

## Part 2: Current Status and Review (Claude's view)

### 2.1 Where things stand

The framework is **mathematically coherent as a structure**, but it has **not yet produced a result that the standard theory does not**. It has no map from the representation-space structure to spacetime, no measurement settings, and no correlation functions. Those gaps determine what comes next.

### 2.2 What has been established

**Standard**
- Spin(8) has a unique (up to scale) invariant in 8_v ⊗ 8_s ⊗ 8_c, the octonion multiplication tensor. Triality is the S₃ outer automorphism group permuting the three representations.
- The spinor representations belong to **Spin(8)**, not SO(8). The statement of the foundation should say Spin(8).
- The compact group Spin(8) cannot contain the noncompact Spin(3,1). If Spin(8) is meant as an internal symmetry, a boundary subgroup must be chosen from compact options (for example Spin(4) × Spin(4) ≅ SU(2)⁴).

**Computed (script: check_E8_triality_icosian.py)**
- Diagonal triality τ (the same order-3 map on each D₄ factor of D₄ × D₄ ⊂ E₈) permutes all 240 E₈ roots. The transposition σ also does, and the S₃ relation στσ = τ⁻¹ holds.
- Projecting the 240 roots onto the 4D subspace from the Coxeter-element eigenspaces (exponents 1, 11, 19, 29) gives two shells of 120 points with norm² ratio equal to φ² to numerical precision, and the outer shell's inner products match the 600-cell set.
- For the one alignment tested, τ does **not** preserve the 4D subspace (residual 1.26), while σ does.
- Among 300,000 random Weyl-group rotations of that subspace, 620 are τ-invariant, and 486 of those are also σ-invariant. On those, τ acts as an order-3 rotation with eigenvalues {1, 1, ω, ω̄}.
- **Interpretation [Assessment]:** how triality sits relative to the φ-structured projection is a choice of alignment, not physics. Passing an equivariance test is therefore a weak test by itself.

**Computed (script: check_octonion_tripartite_state.py)**
- Treating the octonion tensor T_abc as a three-party state (one party per sector; this framing is an interpretive choice), each single-party reduced state is exactly I/8 (entropy 3 bits, the maximum), so the structure is maximally entangled across every cut and treats all three sectors symmetrically.
- Any two sectors together are entangled with each other, with partial-transpose negativity 0.75 (the maximum for two 8-dimensional systems would be 3.5). Entanglement is therefore graded and shared among three sectors.
- **Derived** (from the norm property |xy| = |x||y|, not separately run): measuring one sector along any real direction should leave the other two in a maximally entangled state.

### 2.3 Why the central claim is not yet established

- **[Standard]** Quantum mechanics is not stuck in 3D: its state space is a Hilbert space, and the singlet correlation −cos θ comes from the structure of that space (spin-1/2 representation of SU(2)), not from spatial dimension. Bell's theorem also does not assume three spatial dimensions. It assumes that each outcome depends only on its own setting and a shared variable. Changing the dimension count does not by itself change this.
- **[Standard]** The simplest "shared hidden direction" rule (A = sign(a·λ), B = −sign(b·λ), λ uniform on the sphere) gives a straight-line correlation with maximum CHSH value 2, not the cosine curve with 2√2. So the extra structure must supply the mechanism that bends the line into a cosine and stops at 2√2.
- **[Assessment]** As the author has revised it, "entanglement is a representation of projection loss" is already close to what standard quantum mechanics says (a pure joint state looks mixed when only a part is accessible). It becomes a new theory only if it predicts something standard theory does not.
- **[Assessment]** The triality-state result in 2.2 is the most concrete positive finding so far. A graded, shared entanglement structure arises natively from the invariant, which fits a relational reading better than a literal "one object" reading.

### 2.4 Open problems the framework must address

1. A map from the representation-space structure to spacetime and to boundary observables. **[Open]**
2. How the 3+1D slice sits inside the bulk (the codimension), and which subgroup plays the role of spacetime or internal symmetry. **[Open]**
3. An explicit outcome rule yielding −cos θ and CHSH = 2√2 for two of the sectors. **[Open]**
4. Triality of real forms: the compact Spin(8) and the split Spin(4,4) have triality, while Lorentzian forms such as Spin(7,1) are believed not to. **[to verify]**
5. Extra-dimension bounds: gravity is tested to roughly tens of microns and colliders see no extra dimensions, so large free extra dimensions are tightly constrained. A slice or confinement picture is not excluded by this.
6. The Fermi-paradox claim currently has no stated account of why non-detection follows. That account is needed before the claim can be tested. **[Open]**

---

## Appendix A: Suggested Tests to Verify or Falsify (Claude's suggestions, not the author's conclusions)

**Test 1: Toy model for the two-party correlation.**
Add measurement settings to the triality state (or to a slice of a larger pure state) and compute correlations between two sectors. Pass: reproduces E(θ) = −cos θ, CHSH = 2√2, and no signaling. Fail: any rule that depends only on local settings and a shared variable stays at CHSH ≤ 2.

**Test 2: Tsirelson bound.**
The model must stop at 2√2 and not at the no-signaling maximum of 4.

**Test 3: Monogamy and entanglement swapping.**
Extend to three or more parties and check that entanglement is monogamous in the way quantum mechanics requires, and that particles that never interacted can become entangled after a measurement on others. The tripartite state in 2.2 is a natural place to start.

**Test 4: Kochen–Specker.**
A deterministic geometric outcome assignment must handle the contextuality obstruction. The classic 4D proof (Peres) uses 24 rays, which come from the 24-cell **together with its dual** (not the 24 vertices alone, a correction to a looser statement made earlier in discussion). Check whether the 24-cell structure appearing under triality is affected.

**Test 5: A deviation from standard theory.**
Identify one quantity where the framework and standard quantum mechanics differ (for example, a correlation that depends on setting timing or separation) and state its predicted value before looking at data. Without such a deviation, the framework is an interpretation and cannot be tested against quantum mechanics.

**Test 6: Fix the alignment non-arbitrarily.**
Because the triality-versus-φ-projection alignment is free, any claim that depends on it needs the alignment fixed by something other than convenience. If a quantity depends on the alignment, that is a prediction only if the alignment is derived.

**Test 7: Three-generations check.**
Triality permutes exactly three representations. Test whether a representation-theoretic reason for exactly three generations of matter content follows from the structure. This is a counting problem and is checkable. Compare with existing octonionic and Spin(8) work on particle content (for example by Dixon and by Furey) to establish what is new.

**Test 8: Dimension-count independence.**
Check whether the key results survive in 6, 8, 10, and 11 dimensions. Results that hold only for one choice show where the structure is doing the work.

**Test 9: Prior-literature check.**
Before claiming novelty, search for earlier work on each separate ingredient: triality-based structures, octonionic tripartite states, and projection-based accounts of entanglement.

**On odds [Assessment]:** radical proposals rarely survive full testing. The value of pursuing it is that each test above either gives a concrete result or finds the exact point where the idea breaks.

---

## Appendix B: Reproducing the Computations

Two scripts accompany this file. Both use only numpy and standard Python.

- `check_E8_triality_icosian.py` builds the 240 E₈ roots in standard coordinates, constructs diagonal triality and the transposition on D₄ × D₄, builds the 4D subspace from Coxeter-element eigenspaces, and tests invariance on 300,000 random Weyl-group rotations (fixed random seed).
- `check_octonion_tripartite_state.py` builds the octonion multiplication table from the Fano plane, verifies |xy| = |x||y|, forms the tripartite state, and computes reduced-state entropies and partial-transpose negativity.

Reviewers are encouraged to rerun both independently. No data in either script is simulated or fabricated: both are exact constructions with deterministic or seeded sampling.
