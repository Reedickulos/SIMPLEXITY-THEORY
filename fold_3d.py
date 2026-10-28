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
