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
