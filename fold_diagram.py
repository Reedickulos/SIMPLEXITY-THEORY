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
