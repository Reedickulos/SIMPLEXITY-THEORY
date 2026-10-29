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
