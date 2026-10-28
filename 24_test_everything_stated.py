# Tests, one by one, statements I made earlier that rested on recall.  float64; tolerance 1e-9 unless stated.
# No time, entanglement or 3D view. Inputs: the 240 roots / simple roots already used; the octonion algebra by Cayley-Dickson.
import numpy as np, itertools, math, time
phi=(1+5**.5)/2; TOL=1e-9
roots=[]
for i in range(8):
  for j in range(i+1,8):
    for si in (1,-1):
      for sj in (1,-1):
        v=np.zeros(8); v[i]=si; v[j]=sj; roots.append(v)
for s in itertools.product((1,-1),repeat=8):
  if s.count(-1)%2==0: roots.append(np.array(s)/2)
R=np.array(roots); key=lambda v: tuple(np.round(np.asarray(v)*2).astype(int)); RS={key(r) for r in R}
sm=[np.array([.5,-.5,-.5,-.5,-.5,-.5,-.5,.5])]
for v in [(1,1),(-1,1)]:
  x=np.zeros(8);x[0]=v[0];x[1]=v[1];sm.append(x)
for i in range(2,7):
  x=np.zeros(8);x[i-1]=-1;x[i]=1;sm.append(x)
refl=lambda a: np.eye(8)-np.outer(a,a)*2/(a@a)
c=np.eye(8)
for a in sm: c=c@refl(a)
print("=== S1. facets of the convex hull of the 240 roots (claimed: 17,280 simplices + 2,160 orthoplexes)")
from scipy.spatial import ConvexHull
t0=time.time(); H=ConvexHull(R); eq=np.unique(np.round(H.equations,5),axis=0)
cnt=np.abs(R@eq[:,:8].T+eq[:,8])<1e-4; vc=cnt.sum(0)
print(f"   distinct facet hyperplanes: {len(eq)} ; vertices per facet: { {int(k):int((vc==k).sum()) for k in set(vc)} } ({time.time()-t0:.0f}s)")
print("=== S2. the 5 coordinate-half blocks as products of weight sets (claimed: (8v,8v),(8s,8s),(8c,8c) + two D4)")
def blk(r):
  nz=np.nonzero(np.abs(r)>1e-9)[0]
  if len(nz)==2: return "D4a" if all(k<4 for k in nz) else ("D4b" if all(k>=4 for k in nz) else "M")
  return "Heven" if (r[:4]<0).sum()%2==0 else "Hodd"
B={}
for r in R: B.setdefault(blk(r),[]).append(r)
for k,v in B.items():
  v=np.array(v); f={tuple(x) for x in v[:,:4]}; s={tuple(x) for x in v[:,4:]}
  print(f"   {k}: {len(v)} roots; first-half distinct {len(f)}, second-half distinct {len(s)}, equals full product: {len(v)==len(f)*len(s) and {(a,b) for a,b in zip(map(tuple,v[:,:4]),map(tuple,v[:,4:]))}==set(itertools.product(f,s))}")
for k in ("D4a","D4b"):
  v=np.array(B[k]); ok=all(key(refl(a)@b) in {key(x) for x in v} for a in v for b in v); print(f"   {k} closed under its own mirror swaps:",ok)
nzc={int((np.abs(r)>1e-9).sum()) for r in R}; print("   number of nonzero coordinates per root (a root along a coordinate axis would have 1):",nzc)
print("=== S3. Coxeter number, exponents, and sqrt5")
Mc=np.eye(8); order=None
for k in range(1,61):
  Mc=Mc@c
  if np.allclose(Mc,np.eye(8),atol=1e-9): order=k;break
print("   order of the Coxeter element (smallest k with c^k = I):",order)
th=math.radians(12); print("   Chebyshev: cos(6*12deg) from cos(12deg):",32*np.cos(th)**6-48*np.cos(th)**4+18*np.cos(th)**2-1,"  cos72 =",np.cos(math.radians(72)),"  (sqrt5-1)/4 =",(5**.5-1)/4)
print("   so cos(72deg)=(sqrt5-1)/4 is a polynomial in cos(12deg): sqrt5 lies in the number field of the Coxeter angles")
print("=== S4. is the 3-part of the Coxeter element (c^10) the same as the triality map tau?")
e=np.eye(4); a=[e[0]-e[1],e[1]-e[2],e[2]-e[3],e[2]+e[3]]; b=[a[2],a[1],a[3],a[0]]
T4=np.array(b).T@np.linalg.inv(np.array(a).T); tau=np.block([[T4,np.zeros((4,4))],[np.zeros((4,4)),T4]])
c10=np.linalg.matrix_power(c,10)
fd=lambda M:int((np.linalg.svd(M-np.eye(8),compute_uv=False)<1e-9).sum())
print(f"   c^10: order-3 check {np.allclose(np.linalg.matrix_power(c10,3),np.eye(8),atol=1e-9)}, fixed-space dimension {fd(c10)}, trace {np.trace(c10):.6f}")
print(f"   tau : order-3 check {np.allclose(np.linalg.matrix_power(tau,3),np.eye(8),atol=1e-9)}, fixed-space dimension {fd(tau)}, trace {np.trace(tau):.6f}")
print("   conjugate maps have equal traces and fixed dimensions; here they differ ->",not(abs(np.trace(c10)-np.trace(tau))<1e-9))
print("=== S5. unit icosians: the standard 600-cell vertices as quaternions")
def qm(a,b):
  a0,a1,a2,a3=a; b0,b1,b2,b3=b
  return np.array([a0*b0-a1*b1-a2*b2-a3*b3, a0*b1+a1*b0+a2*b3-a3*b2, a0*b2-a1*b3+a2*b0+a3*b1, a0*b3+a1*b2-a2*b1+a3*b0])
S=[]
for i in range(4):
  for sg in (1,-1):
    x=np.zeros(4);x[i]=sg;S.append(x)
S+=[np.array(s)/2 for s in itertools.product((1,-1),repeat=4)]
par=lambda pm: sum(1 for i in range(4) for j in range(i+1,4) if pm[i]>pm[j])%2
for pm in itertools.permutations(range(4)):
  if par(pm)==0:
    base=[phi/2,.5,1/(2*phi),0]
    for sg in itertools.product((1,-1),repeat=3):
      vv=[sg[0]*base[0],sg[1]*base[1],sg[2]*base[2],0]; x=np.zeros(4)
      for k in range(4): x[pm[k]]=vv[k]
      S.append(x)
S=np.array(S); ks=lambda v: tuple(np.round(v,7)); SS={ks(x) for x in S}; print("   vertices:",len(SS))
print("   closed under quaternion multiplication (all 14400 products are vertices):",all(ks(qm(x,y)) in SS for x in S for y in S))
def dec(vv):
  for a2 in range(-4,5):
    for b2 in range(-4,5):
      if abs(a2/2+b2/2*phi-vv)<1e-9: return a2/2,b2/2
sig=lambda v: np.array([ (lambda ab: ab[0]+ab[1]*(1-phi))(dec(t)) for t in v])
Sc=np.array([sig(x) for x in S]); print("   Galois-flipped set (sqrt5 -> -sqrt5): unit lengths",np.allclose(np.linalg.norm(Sc,axis=1),1),"| also closed under quaternion product:",all(ks(qm(x,y)) in {ks(z) for z in Sc} for x in Sc[::7] for y in Sc))
print("   sigma(xy)=sigma(x)sigma(y) on 14400 products:",max(np.abs(sig(qm(x,y))-qm(sig(x),sig(y))).max() for x in S for y in S[::3])<1e-9)
print("   phi -> 1-phi equals -1/phi:",abs((1-phi)+1/phi)<1e-12)
print("=== S6. norm property |xy|=|x||y| along the Cayley-Dickson sequence")
def conj(v): w=-v.copy(); w[0]=v[0]; return w
def cd(x,y):
  n=len(x)
  if n==1: return x*y
  h=n//2; a,b=x[:h],x[h:]; c_,d=y[:h],y[h:]
  return np.concatenate([cd(a,c_)-cd(conj(d),b), cd(d,a)+cd(b,conj(c_))])
rng=np.random.default_rng(1)
for n in (1,2,4,8,16,32):
  dev=max(abs(np.linalg.norm(cd(x,y))-np.linalg.norm(x)*np.linalg.norm(y)) for x,y in [(rng.normal(size=n),rng.normal(size=n)) for _ in range(200)])
  print(f"   dimension {n:2d}: max deviation over 200 random pairs {dev:.3e}")
print("=== S7. the three 8-dim representations of so(8) (vector, B, C from local triality) pairwise inequivalent?")
E8m=np.eye(8); Tt=np.array([[cd(E8m[i],E8m[j]) for j in range(8)] for i in range(8)])
def solve_BC(A):
  rows=[];rhs=[]
  for i in range(8):
    for j in range(8):
      M=np.zeros((8,128))
      for a_ in range(8):
        M[:,a_*8+i]+=Tt[a_,j,:]; M[:,64+a_*8+j]+=Tt[i,a_,:]
      rows.append(M); rhs.append(A@Tt[i,j,:])
  sol=np.linalg.lstsq(np.vstack(rows),np.concatenate(rhs),rcond=None)[0]; return sol[:64].reshape(8,8),sol[64:].reshape(8,8)
basis=[]
for a_ in range(8):
  for b_ in range(a_+1,8):
    A=np.zeros((8,8));A[a_,b_]=1;A[b_,a_]=-1;basis.append(A)
BC=[solve_BC(A) for A in basis]
for t in range(3):
  w=rng.normal(size=28); A=sum(wi*Ai for wi,Ai in zip(w,basis)); Bm=sum(wi*bc[0] for wi,bc in zip(w,BC)); Cm=sum(wi*bc[1] for wi,bc in zip(w,BC))
  tr=lambda M,p: np.trace(np.linalg.matrix_power(M,p))
  print(f"   random element {t}: tr(X^2) vector {tr(A,2):.5f} B {tr(Bm,2):.5f} C {tr(Cm,2):.5f} | tr(X^4) vector {tr(A,4):.5f} B {tr(Bm,4):.5f} C {tr(Cm,4):.5f}")
print("=== S8. algebra of octonion derivations: is it the 14-dimensional simple Lie algebra G2?")
rows=[]
for i in range(8):
  for j in range(8):
    M=np.zeros((8,64)); N=np.zeros((8,64))
    for a_ in range(8):
      M[:,a_*8+i]+=Tt[a_,j,:]; M[:,a_*8+j]+=Tt[i,a_,:]
    for k in range(8): N[:,[a_*8+k for a_ in range(8)]]+=Tt[i,j,k]*np.eye(8)
    rows.append(M-N)
U_,s_,Vt=np.linalg.svd(np.vstack(rows)); null=Vt[(s_>1e-9).sum():]; D=[v.reshape(8,8) for v in null]; d=len(D)
Dm=np.array([x.flatten() for x in D]).T
print("   dimension:",d,"| all antisymmetric (compact):",max(np.abs(x+x.T).max() for x in D)<1e-9)
f=np.zeros((d,d,d)); res=0
for i in range(d):
  for j in range(d):
    cm=D[i]@D[j]-D[j]@D[i]; co=np.linalg.lstsq(Dm,cm.flatten(),rcond=None)[0]; res=max(res,np.abs(Dm@co-cm.flatten()).max()); f[i,j]=co
print("   closed under commutator (max residual):",res)
ad=[f[i].T for i in range(d)]   # ad(D_i)[k,j]=f[i,j,k]
K=np.array([[np.trace(ad[i]@ad[j]) for j in range(d)] for i in range(d)]); ev=np.linalg.eigvalsh((K+K.T)/2)
print("   Killing form eigenvalues all negative (compact semisimple):",bool((ev<-1e-9).all()))
# adjoint irreducibility: commutant of all ad matrices
Mrows=[np.kron(np.eye(d),a)-np.kron(a.T,np.eye(d)) for a in ad]; sv=np.linalg.svd(np.vstack(Mrows),compute_uv=False)
print("   matrices commuting with every ad(D): dimension",int((sv<1e-9).sum()),"(1 means the adjoint action is irreducible, so the algebra is simple)")
w=rng.normal(size=d); X=sum(wi*Di for wi,Di in zip(w,D)); Mr=np.array([ (X@Dk-Dk@X).flatten() for Dk in D]).T
cen=d-np.linalg.matrix_rank(np.linalg.lstsq(Dm,Mr,rcond=None)[0],tol=1e-9); print("   centraliser dimension of a generic element (= rank):",cen)
simple_dims=sorted({n*(n+2) for n in range(1,12)}|{n*(2*n+1) for n in range(2,12)}|{n*(2*n-1) for n in range(4,12)}|{14,52,78,133,248})
print("   dimensions of simple compact Lie algebras up to 20 (families A,B/C,D + exceptional):",[x for x in simple_dims if x<=20])
print("=== S9. exponents of the Coxeter group H4, built from the 120 standard 600-cell vertices")
from scipy.optimize import linprog
ff=np.array([0.31,0.57,0.83,0.12]); P=S[S@ff>0]; simp=[]
for i in range(len(P)):
  Aub=[];bub=[]
  for j in range(len(P)):
    if j!=i: Aub.append(list(-P[j])+[1]); bub.append(0)
  r=linprog([0,0,0,0,-1],A_ub=Aub,b_ub=bub,A_eq=[list(P[i])+[0]],b_eq=[0],bounds=[(-1,1)]*4+[(0,1)])
  if r.status==0 and -r.fun>1e-7: simp.append(P[i])
print("   positive roots",len(P),"| simple roots found",len(simp))
Ch=np.eye(4)
for r_ in simp: Ch=Ch@(np.eye(4)-2*np.outer(r_,r_))
ang=np.sort(np.degrees(np.abs(np.angle(np.linalg.eigvals(Ch)))))
print("   H4 Coxeter element: order",min(k for k in range(1,100) if np.allclose(np.linalg.matrix_power(Ch,k),np.eye(4),atol=1e-9)),"| turn angles (deg)",np.round(ang,4),"-> exponents",np.round(ang*30/360,4))
print("=== S10. S3 inside A5 (group theory)")
from sympy.combinatorics import Permutation, PermutationGroup
G=PermutationGroup([Permutation([1,2,0,3,4]),Permutation([1,0,2,4,3])])
print("   subgroup generated by (0 1 2) and (0 1)(3 4): order",G.order(),"| non-abelian:",not G.is_abelian,"| all elements even permutations (inside A5):",all(g.is_even for g in G.elements))
