#!/usr/bin/env python3
"""Test 55: exposed reproduction of Test 54's J diagnostics.

Starts from the intrinsic eight-dimensional 240-root realization. No lower-
dimensional construction, physical model, or external triality action is used.
Numerical eigenspaces recover the two complementary rank-four sectors; root
relations and permutation checks use exact integer arithmetic afterward.
"""
import hashlib
import itertools
import json
from pathlib import Path

import numpy as np

TOL = 1e-9
phi = (1 + 5 ** 0.5) / 2
roots = []
for i, j in itertools.combinations(range(8), 2):
    for si in (1, -1):
        for sj in (1, -1):
            v = np.zeros(8)
            v[i], v[j] = si, sj
            roots.append(v)
for signs in itertools.product((1, -1), repeat=8):
    if signs.count(-1) % 2 == 0:
        roots.append(np.array(signs) / 2)
R = np.array(roots)
N = len(R)
assert N == 240
key = lambda v: tuple(np.round(np.asarray(v) * 2).astype(int))
index = {key(r): i for i, r in enumerate(R)}
G = np.rint(R @ R.T).astype(int)
assert np.array_equal(G, G.T)
assert set(np.unique(G)) == {-2, -1, 0, 1, 2}

simple = [np.array([.5, -.5, -.5, -.5, -.5, -.5, -.5, .5])]
for v in [(1, 1), (-1, 1)]:
    x = np.zeros(8)
    x[0], x[1] = v
    simple.append(x)
for i in range(2, 7):
    x = np.zeros(8)
    x[i - 1], x[i] = -1, 1
    simple.append(x)
reflections = [np.eye(8) - np.outer(a, a) for a in simple]
c = np.eye(8)
for S in reflections:
    c = c @ S

w, V = np.linalg.eig(c)
m = np.round(np.angle(w) * 30 / (2 * np.pi)).astype(int) % 30
assert sorted(m.tolist()) == [1, 7, 11, 13, 17, 19, 23, 29]
def projector(exponents):
    W = V[:, np.isin(m, exponents)]
    P = W @ np.linalg.inv(W.conj().T @ W) @ W.conj().T
    return np.real_if_close(P, tol=1000).real
P_A = projector([1, 29, 11, 19])
P_B = projector([7, 23, 13, 17])
assert np.allclose(P_A + P_B, np.eye(8), atol=TOL)
assert np.allclose(P_A @ P_A, P_A, atol=TOL)
assert np.allclose(P_B @ P_B, P_B, atol=TOL)
A, B = R @ P_A, R @ P_B
levels = np.einsum('ij,ij->i', A, A)
lo, hi = np.sort(np.unique(np.round(levels, 9)))
inner = np.where(np.isclose(levels, lo, atol=TOL))[0]
outer = np.where(np.isclose(levels, hi, atol=TOL))[0]
assert (len(inner), len(outer)) == (120, 120)
U = A / np.linalg.norm(A, axis=1)[:, None]
cos = U @ U.T
part = {}
for i in inner:
    hits = outer[np.abs(cos[i, outer] - 1) < TOL]
    assert len(hits) == 1
    part[int(i)] = int(hits[0])
assert len(set(part.values())) == 120
J = np.arange(N)
for i, o in part.items():
    J[i], J[o] = o, i
assert np.array_equal(J[J], np.arange(N))
forward_residual = max(np.linalg.norm(A[o] - phi * A[i]) for i, o in part.items())
reverse_residual = max(np.linalg.norm(B[o] + (1 / phi) * B[i]) for i, o in part.items())
assert forward_residual < 1e-12 and reverse_residual < 1e-12
assert {int(G[i, o]) for i, o in part.items()} == {0}

D = G[np.ix_(J, J)] - G
values, counts = np.unique(D, return_counts=True)
r = np.array(sorted(part))
s = np.array([part[int(i)] for i in r])
K, H = G[np.ix_(r, r)], G[np.ix_(r, s)]
assert np.array_equal(H, H.T)
assert np.array_equal(G[np.ix_(s, s)], K + H)
assert np.array_equal(D[np.ix_(r, r)], H)
assert np.array_equal(D[np.ix_(s, s)], -H)
assert np.array_equal(D[np.ix_(r, s)], np.zeros((120, 120), dtype=int))
joint = sorted({(int(a), int(b)) for a, b in zip(K.flat, H.flat)})
row_profile = [int(((K[0] == a) & (H[0] == b)).sum()) for a, b in joint]
row_profiles_equal = all(all(int(((K[i] == a) & (H[i] == b)).sum()) == row_profile[k]
                           for k, (a, b) in enumerate(joint)) for i in range(120))
assert row_profiles_equal

def permutation(M):
    return np.array([index[key(M @ x)] for x in R])
def disagreements(t):
    return int(np.count_nonzero(t[J] != J[t]))
commutation = {"coxeter_c": disagreements(permutation(c)),
               "coxeter_c10": disagreements(permutation(np.linalg.matrix_power(c, 10))),
               "simple_reflections": [disagreements(permutation(S)) for S in reflections]}
assert commutation == {"coxeter_c": 0, "coxeter_c10": 0, "simple_reflections": [180] * 8}

result = {
    "test": 55,
    "audit_exposure": "exposed reproduction; not an independent cross-audit",
    "dimensional_origin": "intrinsic eight-dimensional 240-root realization",
    "counts": {"roots": N, "inner": len(inner), "outer": len(outer), "pairs": len(part)},
    "J_squared_is_identity": True,
    "partner_relation_values": [0],
    "max_forward_sectorA_residual": float(forward_residual),
    "max_reverse_sectorB_residual": float(reverse_residual),
    "gram_discrepancy_counts": {str(int(v)): int(n) for v, n in zip(values, counts)},
    "joint_KH_per_inner_row": {f"({a},{b})": n for (a, b), n in zip(joint, row_profile)},
    "commutation_disagreements": commutation,
    "gram_sha256": hashlib.sha256(G.tobytes()).hexdigest(),
    "J_sha256": hashlib.sha256(J.tobytes()).hexdigest(),
    "notes": [
        "J is a two-way matching, not the forward linear sector-scaling map L.",
        "J is not a Gram automorphism; Gram preservation was not an acceptance condition.",
        "Commutation with c or c^10 does not establish a triality correspondence.",
        "This is a reconstructed-realization reproduction, not index reconciliation with cycle-0 certificate data."
    ]
}
out = Path(__file__).with_name('55_results.json')
out.write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
