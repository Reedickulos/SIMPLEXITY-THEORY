# Intrinsic Eight-Dimensional Geometric Framework

**Status:** Working research formulation — mathematical investigation, not an established physical theory  
**Date:** 26 October 2026

## 1. Governing framing

The investigation begins with an **intrinsic eight-dimensional mathematical structure**, rather than attempting to reconstruct eight dimensions from three-dimensional geometry. Three-dimensional projections, fold diagrams, and observer analogies are excluded as foundational premises and as proof mechanisms. They may later be used only as optional illustrations, clearly distinguished from derivations.

This methodological restriction does **not** establish that conventional three-dimensional physics is false. Whether an eight-dimensional structure describes physical reality is a separate empirical question.

**Central question:** What intrinsic eight-dimensional geometric formulation permits golden-ratio relationships among its components, and which invariants follow necessarily from that formulation?

## 2. Distinct research questions

1. **Intrinsic geometry:** Identify and characterize an eight-dimensional structure and its natural symmetries without relying on a three-dimensional embedding or visualization.
2. **Golden-ratio relations:** Determine whether reciprocal φ-scaling relations follow from the chosen structure, rather than being imposed during selection of orbit pairs.
3. **Triality and entanglement:** Investigate separately whether triality offers a useful mathematical model for correlations conventionally discussed in quantum entanglement. This is not assumed to define the eight-dimensional geometry or establish a physical mechanism.
4. **Physical interpretation:** Only after a mathematical model is specified should one ask for observables and predictions that distinguish it from established theories.

## 3. Mathematical starting points

Let φ = (1 + √5)/2, satisfying φ² = φ + 1 and φ⁻¹ = φ − 1.

Use the **E8 root system** as one candidate intrinsic eight-dimensional object. Its 240 roots are vectors in an eight-dimensional Euclidean space with squared length 2, with an established reflection-group structure. The **icosian construction** is a distinct algebraic route connecting golden-ratio arithmetic and the E8 lattice; its exact correspondence should be specified before drawing conclusions about the orbit pairings.

An eight-dimensional space can be decomposed into four mutually orthogonal two-dimensional subspaces, V = P_A ⊕ P_B ⊕ P_C ⊕ P_D. For a vector v, write its components v_A, v_B, v_C, v_D, and radii ρ_i = ||v_i||. Orthogonality gives the intrinsic identity:

ρ_A² + ρ_B² + ρ_C² + ρ_D² = ||v||².

For an E8 root this equals 2. The decomposition is a mathematical choice unless a symmetry or construction specifies it canonically.

## 4. Candidate reciprocal-scaling relationship

Earlier computations organized selected Coxeter-plane root orbits into pairs whose radii were reported to obey:

(ρ_A, ρ_B, ρ_C, ρ_D) ↦ (φρ_A, φρ_B, φ⁻¹ρ_C, φ⁻¹ρ_D).

Under **this specified map**, the following products are invariant:

- ρ_Aρ_C
- ρ_Aρ_D
- ρ_Bρ_C
- ρ_Bρ_D

For example, (φρ_A)(φ⁻¹ρ_D) = ρ_Aρ_D. These identities follow algebraically from the assumed reciprocal scaling; they do not by themselves prove that E8 or icosian geometry requires that scaling.

**Important constraint:** The map is not a general orthogonal symmetry of eight-dimensional Euclidean space. For arbitrary vectors it does not preserve the squared norm. If it relates two E8 roots of equal length, the particular radii must additionally satisfy the norm constraint. This is a testable restriction, not an inconsistency to ignore.

## 5. What the existing scripts establish and what they do not

The shared `fold_diagram.py` and `octahedron_fold_template.py` scripts construct 240 E8 roots, choose Coxeter eigenspaces, calculate four plane radii, and search for orbit pairs using a φ ratio in plane A. They then evaluate reciprocal scaling and product relations. The displayed comparisons are meaningful numerical checks **conditional on the construction and pair-selection rule**.

Because the pair-selection code explicitly checks whether ρ_A(outer)/ρ_A(inner) ≈ φ, that result alone is not an independent discovery of φ. The other plane ratios and conserved cross-products are further checks, but require independent derivation and verification before being called necessary consequences of the icosian structure.

The octahedron folding diagrams are visualization aids and are **not part of the intrinsic proof**. In particular, identifying four two-dimensional orthogonal planes with the eight faces of a three-dimensional octahedron is an analogy, not an eight-dimensional equivalence.

## 6. Proof programme, with falsification criteria

**A. Specify the intrinsic object.** Define the E8 root system and a precise icosian-to-E8 correspondence, including normalization and the relevant algebraic maps. Reject claims that depend on an undefined identification.

**B. Derive the four subspaces.** Define the Coxeter element and its invariant real two-dimensional eigenspaces intrinsically in eight dimensions. Show their orthogonality and clarify whether the decomposition depends on the Coxeter-element choice.

**C. Derive, rather than select, φ relationships.** Classify root orbits using only the intrinsic group action. Compute exact algebraic radii and identify all reciprocal φ correspondences, if any, without searching for φ-matching pairs as the defining criterion.

**D. Check structural necessity.** Determine whether the proposed pairing is unique, symmetry-equivalent to alternatives, or contingent on the chosen Coxeter element. Distinguish an invariant of a selected correspondence from an invariant under the entire E8 Weyl group.

**E. Seek counterexamples.** Test every root and relevant orbit, not just a representative pair. Evaluate whether the scaling maps valid roots to valid roots, preserves norms on its claimed domain, and respects the proposed icosian algebraic correspondence.

**F. Separate physics from mathematics.** Even a complete proof of the geometry would not, without additional assumptions and measurements, establish an eight-dimensional physical universe, a biological perception limit, or a new account of entanglement.

## 7. Claim ledger

| Statement | Current status |
|---|---|
| E8 has 240 roots of squared length 2 in its standard normalization | Established mathematical fact |
| φ obeys φ² = φ + 1 | Established mathematical fact |
| Four orthogonal 2D components obey a sum-of-squared-radii identity | Established linear algebra |
| Reciprocal φ scaling preserves cross-products | Proven conditional algebraic identity |
| Selected computed Coxeter orbit pairs exhibit the stated scaling | Reported by prior scripts; independently reproduce and audit |
| The icosian construction uniquely or necessarily produces these specific pairs | Open proof question |
| The structure describes the fundamental physical universe | Speculative; requires physical predictions and evidence |
| Triality explains entanglement | Separate speculative research hypothesis |

## 8. Methodological commitment

**Work from eight-dimensional geometry outward.** Do not impose three-dimensional geometry as a starting axiom or judge intrinsic mathematical validity by whether a 3D illustration looks intuitive. At the same time, do not discard valid mathematical counterexamples or established physical evidence merely because they are usually expressed in three-dimensional terms. A proposed theory earns acceptance through exact definitions, derivations, falsifiable consequences, and independent tests.
