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
