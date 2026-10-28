"""Octahedron as a folding template for planes A,B,C,D. (Fold the 'visible' axes (planes A,B) over the 'hidden' axes (planes C,D) and see which combinations survive a phi-step.
Self-contained; numpy + matplotlib.  Run: python3 octahedron_fold_template.py"""
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

from matplotlib.patches import Polygon
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
# ---------- octahedron: 6 vertices (+-e_i), 8 faces = sign triples; face (sx,sy,sz) has outward normal (sx,sy,sz)/sqrt(3)
verts=np.array([(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)],float)
vid=lambda s,axis:{(0,1):0,(0,-1):1,(1,1):2,(1,-1):3,(2,1):4,(2,-1):5}[(axis,s)]
faces=[(sx,sy,sz) for sx in (1,-1) for sy in (1,-1) for sz in (1,-1)]
fv={f:(vid(f[0],0),vid(f[1],1),vid(f[2],2)) for f in faces}
# the 4 plane normals used earlier for the XYZ window are 4 of these 8 face normals; the other 4 are their negatives
plane_normal={"A":(1,1,1),"B":(1,-1,-1),"C":(-1,1,-1),"D":(-1,-1,1)}
label={}
for p,n in plane_normal.items(): label[n]=p+"+"
for p,n in plane_normal.items(): label[tuple(-x for x in n)]=p+"-"
nm=np.array([plane_normal[p] for p in "ABCD"],float)/np.sqrt(3)
print("pairwise dot products of the 4 plane normals:",sorted(set(np.round((nm@nm.T)[np.triu_indices(4,1)],6))),"= -1/3 -> angle",round(np.degrees(np.arccos(-1/3)),4),"deg")
adjacent=lambda f,g:sum(a!=b for a,b in zip(f,g))==1
edges=[(f,g) for i,f in enumerate(faces) for g in faces[i+1:] if adjacent(f,g)]
n1=np.array(edges[0][0],float)/np.sqrt(3); n2=np.array(edges[0][1],float)/np.sqrt(3)
print("octahedron: 8 faces, 12 shared edges; outward-normal angle between adjacent faces:",round(np.degrees(np.arccos(n1@n2)),4),
      "deg  -> dihedral (the fold angle) =",round(180-np.degrees(np.arccos(n1@n2)),4),"deg   (= arccos(-1/3) =",round(np.degrees(np.arccos(-1/3)),4),")")
planes_of=lambda f:label[f][0]
types={}
for f,g in edges: types.setdefault("".join(sorted(planes_of(f)+planes_of(g))),0); types["".join(sorted(planes_of(f)+planes_of(g)))]+=1
print("each shared edge joins two DIFFERENT planes (a plane's own two sides are opposite faces); edges per plane pair:",types)
# ---------- unfold along a spanning tree (7 hinges) into a non-overlapping 2D net
def reflect(P,A,B):
    d=(B-A)/np.linalg.norm(B-A); q=A+d*np.dot(P-A,d); return 2*q-P
def unfold(tree_edges,root):
    pos={}; v=fv[root]; pos[root]={v[0]:np.array([0.,0.]),v[1]:np.array([1.,0.]),v[2]:np.array([.5,np.sqrt(3)/2])}
    seen={root}; stack=[root]; order=[root]
    while stack:
        f=stack.pop()
        for a,b in tree_edges:
            for p,c in ((a,b),(b,a)):
                if p==f and c not in seen:
                    shared=[x for x in fv[p] if x in fv[c]]; third_p=[x for x in fv[p] if x not in shared][0]; third_c=[x for x in fv[c] if x not in shared][0]
                    A,B=pos[p][shared[0]],pos[p][shared[1]]
                    pos[c]={shared[0]:A,shared[1]:B,third_c:reflect(pos[p][third_p],A,B)}; seen.add(c); stack.append(c); order.append(c)
    return pos
rng=np.random.default_rng(0); best=None
for trial in range(2000):
    perm=rng.permutation(len(edges)); parent={f:f for f in faces}
    def find(x):
        while parent[x]!=x: parent[x]=parent[parent[x]]; x=parent[x]
        return x
    tree=[]
    for k in perm:
        a,b=edges[k]
        if find(a)!=find(b): parent[find(a)]=find(b); tree.append((a,b))
    pos=unfold(tree,faces[0]); cent=np.array([np.mean(list(pos[f].values()),axis=0) for f in faces])
    D=np.linalg.norm(cent[:,None]-cent[None],axis=2)+np.eye(8)*9
    if D.min()>0.3: best=(tree,pos); break
tree,pos=best
print(f"found a non-overlapping net after {trial+1} random spanning trees; folds (hinges) needed = {len(tree)} = faces - 1")
print("hinges in this net (face - face : plane pair : combination that is invariant under the phi-step):")
inv={"AB":"rhoA/rhoB","CD":"rhoC/rhoD","AC":"rhoA*rhoC","AD":"rhoA*rhoD","BC":"rhoB*rhoC","BD":"rhoB*rhoD"}
for a,b in tree:
    k="".join(sorted(planes_of(a)+planes_of(b))); print(f"   {label[a]} - {label[b]} : {k} : {inv[k]}")
fn={"rhoA/rhoB":lambda r:r[0]/r[1],"rhoC/rhoD":lambda r:r[2]/r[3],"rhoA*rhoC":lambda r:r[0]*r[2],"rhoA*rhoD":lambda r:r[0]*r[3],"rhoB*rhoC":lambda r:r[1]*r[2],"rhoB*rhoD":lambda r:r[1]*r[3]}
print("check of those six combinations over all four phi-pairs (max |outer - inner|):",{k:float(f"{max(abs(fn[k](rows[j])-fn[k](rows[i])) for i,j in pairs):.1e}") for k in fn})
# ---------- figure
col={"A":"#1f77b4","B":"#d62728","C":"#2ca02c","D":"#ff7f0e"}
fig=plt.figure(figsize=(16,7.4),facecolor="white")
ax=fig.add_subplot(1,2,1); ax.set_aspect("equal"); ax.axis("off")
tset={frozenset(e) for e in tree}
for f in faces:
    pts=np.array(list(pos[f].values())); pl=label[f][0]; plus=label[f][1]=="+"
    ax.add_patch(Polygon(pts,closed=True,facecolor=col[pl],alpha=(0.95 if plus else 0.45),edgecolor="black",lw=1.6))
    c=pts.mean(0); ax.text(c[0],c[1],label[f],ha="center",va="center",fontsize=14,fontweight="bold",color="white" if plus else "black")
for a,b in tree:
    sh=[x for x in fv[a] if x in fv[b]]; P=pos[a][sh[0]],pos[a][sh[1]]; ax.plot([P[0][0],P[1][0]],[P[0][1],P[1][1]],color="black",lw=3.2,ls=(0,(3,2)))
allp=np.array([p for f in faces for p in pos[f].values()]); ax.set_xlim(allp[:,0].min()-.3,allp[:,0].max()+.3); ax.set_ylim(allp[:,1].min()-.3,allp[:,1].max()+.3)
ax.set_title("2D net: 8 faces = 4 planes x 2 sides (A+ ... D-)\ndashed = the 7 hinges; each folds by 109.47 deg",fontsize=12)
bx=fig.add_subplot(1,2,2,projection="3d")
import matplotlib.colors as mcolors
EL,AZ=22,35; view=np.array([np.cos(np.radians(EL))*np.cos(np.radians(AZ)),np.cos(np.radians(EL))*np.sin(np.radians(AZ)),np.sin(np.radians(EL))])
for f in faces:
    tri=verts[list(fv[f])]; pl=label[f][0]; plus=label[f][1]=="+"
    base=np.array(mcolors.to_rgb(col[pl])); rgb=base if plus else 0.45*base+0.55   # '-' side = lighter shade of the same colour
    bx.add_collection3d(Poly3DCollection([tri],facecolor=rgb,alpha=1.0,edgecolor="black",lw=1.6))
    if np.dot(np.array(f)/np.sqrt(3),view)>0.05:
        c=tri.mean(0)*1.02; bx.text(*c,label[f],fontsize=15,fontweight="bold",ha="center",va="center",color="white" if plus else "black",zorder=10)
bx.set_xlim(-1,1); bx.set_ylim(-1,1); bx.set_zlim(-1,1); bx.set_box_aspect((1,1,1)); bx.set_axis_off(); bx.view_init(EL,AZ)
bx.set_title("Folded: the octahedron in 3D (XYZ)\nopposite faces are the two sides of one plane\n(only the faces turned toward you are labelled)",fontsize=12)
fig.suptitle("The octahedron as a folding template: its 8 faces carry the 4 planes A, B, C, D (two sides each)",fontsize=13.5,y=0.99)
fig.subplots_adjust(top=0.86,bottom=0.02,left=0.02,right=0.98,wspace=0.05)
fig.savefig("E8_octahedron_fold_template.png",dpi=140)
