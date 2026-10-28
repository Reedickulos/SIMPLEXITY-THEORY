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
