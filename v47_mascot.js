/* ================= v47: 🎭 3D mascots — entrance greeting, victory and defeat cut-scenes (2026-11-16) ================= */
// Owner: "every mascot gets an entrance cut-scene (the two mascots take hands and greet face to face), a victory and a defeat cut-scene,
// as real as possible — e.g. the narwhal shows itself off when it wins and swings its horn wildly when it loses; 3D".
// Owner, after the first cut (people in costumes): "they must be animals, not people — the lightning strikes down, the fish does it in the water".
//  · 9 animals with their own bodies (legs, flippers, fins, wings) + 3 elements: a snowflake that floats down in a snowfall,
//    an iceberg that rises out of the water, a lightning bolt that strikes down from its storm cloud
//  · the sea animals and the iceberg live in a hole that cracks open in the ice; land animals walk / waddle / slide / galumph in; the owl flies
//  · greeting: both reach out (paw / flipper / fin / wing / crystal arm) and really touch at one point (limb IK, or the floating body moves),
//    hold it with a little shake, bow in their own way, then each one's signature move (the start of its victory act)
//  · end: the winner celebrates and the loser reacts (12 × 2 acts); a draw = they touch again and shrug happily
//  · team colours: a soft ring of light in the team colour on the ice under each one — real animals, no scarves or costumes
// Owner, 2026-11-16 evening: "more real, they look too much like toys" → real proportions, fur drawn strand by strand (shells), real eyes, painted skin,
//    a sardine school instead of one cartoon fish, a faceless storm cloud, a faceless iceberg and snowflake; no winks, no puck tricks
//  · the world is frozen while a scene plays; tap / any key / back skips (not online entrances); 설정 → 마스코트 연출; reduced motion → off
//  · my mascot = save.kit.mas; offline opponents get one picked from their name (never mine); online each side brings its own
//  · purely visual: nothing in the match depends on it
var MSC={intro:7.4,introQ:3.4,end:5.6,skipAfter:.35};
const mT=T,mV=(x,y,z)=>new mT.Vector3(x||0,y||0,z||0),mCol=h=>pkRGB(typeof h==='string'?parseInt(h.slice(1),16):h),mL=(a,b,t)=>a+(b-a)*t;
const mSm=x=>x<=0?0:x>=1?1:x*x*(3-2*x),mWin=(t,a,b)=>mSm((t-a)/(b-a)),mBmp=(t,a,b)=>t<=a||t>=b?0:Math.sin((t-a)/(b-a)*Math.PI),mPI=Math.PI;
const mArc=(u,h)=>u<=0||u>=1?0:4*h*u*(1-u),mHop=(t,f,h)=>Math.abs(Math.sin(t*f*mPI))*h,mSn=(t,f,p)=>Math.sin((t*f+(p||0))*TAU);
const mAt=(o,t,x)=>t>=x&&t-(o.dt||0)<x;   // crossed x this frame (a one-shot event)
let mRs=1;const mRnd=()=>(mRs=(mRs*16807)%2147483647)/2147483647;
const MS_FUR=pkTex(128,(x,N)=>{x.fillStyle='#808080';x.fillRect(0,0,N,N);for(let i=0;i<900;i++){const a=mRnd()*N,b=mRnd()*N,l=3+mRnd()*5,g=100+mRnd()*80|0;
  x.strokeStyle='rgb('+g+','+g+','+g+')';x.lineWidth=1;x.beginPath();x.moveTo(a,b);x.lineTo(a+(mRnd()-.5)*2,b+l);x.stroke();}},[3,3]);
const mPO=(m,f)=>Object.assign(m,{polygonOffset:true,polygonOffsetFactor:f,polygonOffsetUnits:f});
const MS_M={
  feather:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.85,bumpMap:MS_FUR,bumpScale:.012}),1.1),
  skin:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.28,metalness:.06}),.85),
  ice:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.1,metalness:.15,emissive:0x2a6a96,emissiveIntensity:.4}),1.3),
  berg:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.25,metalness:.05,flatShading:true,emissive:0x1d4a6e,emissiveIntensity:.22}),1.2),
  ivory:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.38,metalness:.02}),.6),
  water:mPO(new mT.MeshStandardMaterial({vertexColors:true,roughness:.22,metalness:0,envMapIntensity:.35}),-10),
  ripple:mPO(new mT.MeshBasicMaterial({color:0xe8f6ff,transparent:true,opacity:.6,depthWrite:false}),-11),
  crack:mPO(new mT.MeshBasicMaterial({color:0x2d5d86,transparent:true,opacity:.6,depthWrite:false}),-11),
  scorch:mPO(new mT.MeshBasicMaterial({color:0x14181e,transparent:true,opacity:.55,depthWrite:false}),-11),
  boltCore:new mT.MeshBasicMaterial({color:0xfffbe6}),boltGlow:new mT.MeshBasicMaterial({color:0x9fd6ff,transparent:true,opacity:.38,depthWrite:false})
};
// --- geometry helpers: everything ends up in a few vertex-coloured meshes per part ---
function mEll(c,r,col,seg,disp){const S=pkLo()?.6:1,U=Math.max(10,(seg||28)*S|0),V=Math.max(8,(seg||28)*.75*S|0),d=[0,0,0];
  return pkSurf(U,V,(u,v,p)=>{const ph=u*TAU,th=v*Math.PI;d[0]=Math.sin(th)*Math.sin(ph);d[1]=-Math.cos(th);d[2]=Math.sin(th)*Math.cos(ph);
    const k=disp?disp(d):1;p[0]=c[0]+r[0]*d[0]*k;p[1]=c[1]+r[1]*d[1]*k;p[2]=c[2]+r[2]*d[2]*k;},
    col?(u,v,p,o)=>{const ph=u*TAU,th=v*Math.PI;d[0]=Math.sin(th)*Math.sin(ph);d[1]=-Math.cos(th);d[2]=Math.sin(th)*Math.cos(ph);const q=typeof col==='function'?col(d,p):col;o[0]=q[0];o[1]=q[1];o[2]=q[2];}:null,1,1,[1,1]);}
// a tube along +y from y0 to y1 with radius r(v), closed at both ends
function mTube(y0,y1,rf,col,sz,seg){const S=pkLo()?.6:1,U=Math.max(8,(seg||20)*S|0);
  return pkSurf(U,10,(u,v,p)=>{const a=u*TAU,e=v<.06?v/.06:v>.94?(1-v)/.06:1,r=rf(v)*Math.sqrt(Math.max(0,Math.min(1,e*1.4)));p[0]=Math.sin(a)*r;p[1]=mL(y0,y1,v<.06?.06*mSm(v/.06):v>.94?1-.06*mSm((1-v)/.06):v);p[2]=Math.cos(a)*r*(sz||1);},
    col?(u,v,p,o)=>{const q=typeof col==='function'?col(u,v):col;o[0]=q[0];o[1]=q[1];o[2]=q[2];}:null,1,1,[1,1]);}
// a body of revolution along +z (rear z0 → front z1): r = prof(v, angle); col(u, v, up, side) — up = 1 on the back, -1 on the belly
function mRev(z0,z1,prof,col,sx,sy,seg,vs){const S=pkLo()?.6:1,U=Math.max(10,(seg||28)*S|0),V=Math.max(10,(vs||26)*S|0);
  const g=pkSurf(U,V,(u,v,p)=>{const a=u*TAU,r=prof(v,a);p[0]=-Math.sin(a)*r*(sx||1);p[1]=mL(z0,z1,v);p[2]=-Math.cos(a)*r*(sy||1);},
    col?(u,v,p,o)=>{const q=typeof col==='function'?col(u,v,Math.cos(u*TAU),Math.sin(u*TAU)):col;o[0]=q[0];o[1]=q[1];o[2]=q[2];}:null,1,1,[1,1]);g.rotateX(Math.PI/2);return g;}
function mHorn(len,r0,col,twist,seg){return pkSurf(seg||18,26,(u,v,p)=>{const a=u*TAU,r=r0*(1-v)*(1+(twist?.12*Math.sin(a*2+v*twist):0))+.002;p[0]=Math.sin(a)*r;p[1]=v*len;p[2]=Math.cos(a)*r;},
  (u,v,p,o)=>{const q=typeof col==='function'?col(u,v):col;o[0]=q[0];o[1]=q[1];o[2]=q[2];},1,1,[0,1]);}
// a flat fin / flipper / feather from a 2D outline (extruded, bevelled)
function mFin(pts,th,col,sm){const s=new mT.Shape();if(sm){s.moveTo(pts[0][0],pts[0][1]);s.splineThru(pts.slice(1).concat([pts[0]]).map(q=>new mT.Vector2(q[0],q[1])));}else pts.forEach((q,i)=>i?s.lineTo(q[0],q[1]):s.moveTo(q[0],q[1]));
  const g=new mT.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:th*.6,bevelSize:th*.6,bevelSegments:2,curveSegments:8});g.translate(0,0,-th/2);
  const n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set(col,i*3);g.setAttribute('color',new mT.BufferAttribute(a,3));return g;}
function mMesh(list,mat,shadow){const m=new mT.Mesh(list.length===1&&!list[0][1]?list[0][0]:pkMerge(list),mat);m.castShadow=shadow!==false;if(shadow===false)m.userData.ns=1;return m;}
const mG=(x,y,z)=>{const g=new mT.Group();g.position.set(x||0,y||0,z||0);return g;};
// put a child on an ellipsoid surface at (yaw, pitch), facing out
function mFace(obj,f){const z=f.clone().normalize(),x=mV(0,1,0).cross(z);if(x.lengthSq()<1e-6)x.set(1,0,0);x.normalize();const y=z.clone().cross(x);obj.quaternion.setFromRotationMatrix(new mT.Matrix4().makeBasis(x,y,z));}
function mOn(par,obj,c,r,yaw,pitch,out){const d=mV(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
  obj.position.set(c[0]+d.x*r[0]*(out||1),c[1]+d.y*r[1]*(out||1),c[2]+d.z*r[2]*(out||1));
  const n=mV(d.x/r[0],d.y/r[1],d.z/r[2]).normalize();mFace(obj,n);par.add(obj);return obj;}
const mHash=d=>{const v=Math.sin(d[0]*91.3+d[1]*57.7+d[2]*113.1)*43758.5;return v-Math.floor(v);};
function mKitOf(teamKey,mas){const k=kitFor(teamKey);return Object.assign({c1:kitHex(TEAM[teamKey].color),c2:'#ffffff',pat:'classic',crest:'circle'},k||{},{mas});}
// a disc of water (deep in the middle, lighter at the rim)
function mWaterDisc(r,seg){const g=new mT.CircleGeometry(r,seg||40);g.rotateX(-Math.PI/2);const p=g.attributes.position,n=p.count,a=new Float32Array(n*3);
  for(let i=0;i<n;i++){const d=Math.min(1,Math.hypot(p.getX(i),p.getZ(i))/r);a.set([mL(.02,.13,d*d*d),mL(.12,.36,d*d*d),mL(.26,.56,d*d*d)],i*3);}g.setAttribute('color',new mT.BufferAttribute(a,3));return g;}
// ---------- realism (owner, 2026-11-16 evening: "make them more real, they look too much like toys") ----------
// no plush: fur is drawn as shells (the part's surface pushed out along the normal several times; a shell keeps only the strands taller
// than its height — one texel of MS_STR = one strand of about 6 mm), real eyes (no white, no smile), painted skin detail, anatomical shapes
const MS_STR=(()=>{const N=128,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),d=x.createImageData(N,N);mRs=97;
  for(let i=0;i<N*N;i++){const v=mRnd(),h=v<.08?0:Math.round(255*Math.pow((v-.08)/.92,.75));d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=h;d.data[i*4+3]=255;}
  x.putImageData(d,0,0);const t=new mT.CanvasTexture(c);t.wrapS=t.wrapT=mT.RepeatWrapping;t.magFilter=t.minFilter=mT.NearestFilter;t.generateMipmaps=false;return t;})();
const MS_FURM={},mM4=new mT.Matrix4();
function mFurMat(len){const key=len.toFixed(3);if(MS_FURM[key])return MS_FURM[key];const m=rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.96,metalness:0}),1.3),pre=m.onBeforeCompile;
  m.onBeforeCompile=sh=>{pre(sh);sh.uniforms.uStr={value:MS_STR};
    sh.vertexShader='attribute float fsh;\nattribute float fln;\nattribute vec2 fuv;\nvarying float vSh;\nvarying float vFl;\nvarying vec2 vFu;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSh=fsh;vFl=fln;vFu=fuv;transformed+=normal*fsh*fln*'+len.toFixed(4)+';transformed.y-=fsh*fsh*fln*'+(len*.3).toFixed(4)+';');
    sh.fragmentShader='uniform sampler2D uStr;\nvarying float vSh;\nvarying float vFl;\nvarying vec2 vFu;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat fH=texture2D(uStr,vFu).r;if(vSh>0.001&&(fH<vSh||vFl<0.3))discard;diffuseColor.rgb*=mix(0.64,1.05,clamp(vSh*0.75+fH*0.35+(1.0-vFl)*0.6,0.0,1.0));');};
  m.customProgramCacheKey=()=>'pkRim1.30fur'+key;return MS_FURM[key]=m;}
// the shells for one part: su / sv = its size around / along in metres (strands stay the same size everywhere); kf(x,y,z) → 0..1 = how long
// the fur is there (short round the eyes, the nose, the lips; 0 = bare skin)
function mFurGeo(g,su,sv,kf){const n=pkLo()?5:pkHi()?12:8,P=g.attributes.position,Nn=g.attributes.normal,UV=g.attributes.uv,C=g.attributes.color,I=g.index,v=P.count,ru=Math.max(1,Math.round(su*1.3)),rv=Math.max(1,Math.round(sv*1.3));
  const pos=new Float32Array(v*n*3),nor=new Float32Array(v*n*3),col=new Float32Array(v*n*3),fuv=new Float32Array(v*n*2),fsh=new Float32Array(v*n),fln=new Float32Array(v*n),idx=new (v*n>65000?Uint32Array:Uint16Array)(I.count*n),kl=new Float32Array(v);
  for(let i=0;i<v;i++)kl[i]=kf?Math.max(0,Math.min(1,kf(P.getX(i),P.getY(i),P.getZ(i)))):1;
  for(let k=0;k<n;k++){pos.set(P.array,k*v*3);nor.set(Nn.array,k*v*3);if(C)col.set(C.array,k*v*3);else col.fill(1,k*v*3,(k+1)*v*3);fln.set(kl,k*v);
    for(let i=0;i<v;i++){fuv[(k*v+i)*2]=UV.getX(i)*ru;fuv[(k*v+i)*2+1]=UV.getY(i)*rv;fsh[k*v+i]=k/(n-1);}for(let j=0;j<I.count;j++)idx[k*I.count+j]=I.getX(j)+k*v;}
  const o=new mT.BufferGeometry();o.setAttribute('position',new mT.BufferAttribute(pos,3));o.setAttribute('normal',new mT.BufferAttribute(nor,3));o.setAttribute('color',new mT.BufferAttribute(col,3));
  o.setAttribute('fuv',new mT.BufferAttribute(fuv,2));o.setAttribute('fsh',new mT.BufferAttribute(fsh,1));o.setAttribute('fln',new mT.BufferAttribute(fln,1));o.setIndex(new mT.BufferAttribute(idx,1));return o;}
// the shells draw the fur; an invisible copy of the bare part casts the shadow (one shadow, not one per shell)
function mFur(par,g,su,sv,len,kf,ch){const m=new mT.Mesh(mFurGeo(g,su,sv,kf),mFurMat(len));m.userData.ns=1;m.receiveShadow=true;par.add(m);const s=new mT.Mesh(g,MS_M.shade);s.castShadow=true;par.add(s);m.userData.twin=s;if(ch)m.userData.ch=s.userData.ch=ch;return m;}
// stick obj onto the surface of geo (in par's space): a ray from → to; out = how far it stands off (negative = sunk in); +z of obj faces out
const MS_RC=new mT.Raycaster(),MS_RCM=new mT.MeshBasicMaterial({side:mT.DoubleSide});
function mStick(par,geo,obj,from,to,out,face){const o=mV(from[0],from[1],from[2]),d=mV(to[0],to[1],to[2]).sub(o).normalize();MS_RC.set(o,d);const h=MS_RC.intersectObject(new mT.Mesh(geo,MS_RCM),false)[0];
  par.add(obj);if(!h){obj.position.copy(o);return obj;}const n=h.face.normal.clone();if(n.dot(d)>0)n.negate();obj.position.copy(h.point).addScaledVector(n,out||0);
  mFace(obj,n.lerp(d.negate(),face==null?.35:face));return obj;}
// fur length that fades to 0 near some points (eyes, nose): r0 = bare, r1 = full length; f = another factor
const mKeep=(pts,r0,r1,f)=>(x,y,z)=>{let k=f?f(x,y,z):1;for(const p of pts)k=Math.min(k,mSm((Math.hypot(x-p[0],y-p[1],z-p[2])-r0)/(r1-r0)));return k;};
// merge and keep the texture coordinates (for painted skin)
function mMergeUV(list){const g=pkMerge(list),n=g.attributes.position.count,a=new Float32Array(n*2);let o=0;for(const it of list){const u=it[0].attributes.uv,c=it[0].attributes.position.count;if(u)a.set(u.array.subarray(0,c*2),o*2);o+=c;}g.setAttribute('uv',new mT.BufferAttribute(a,2));return g;}
// a real eye: glossy, iris + pupil (round or a slit), no white showing, a thin dark lid rim
// the iris, painted (owner, 2026-11-17 evening: "the eyes look unnatural"): fine radial fibres, lighter towards the pupil, a dark limbal ring,
// a round or slit pupil and the wet cornea's catch-lights; animals show almost no white, so the rest is dark
const MS_EYET={},MS_EYEM={};
function mEyeMat(iris,pup,ir){const key=iris.join()+'|'+pup+'|'+ir;if(MS_EYEM[key])return MS_EYEM[key];
  const t=pkTex(256,(x,N)=>{const c=N/2,Rr=N/2,ri=Rr*ir,col=(k,a)=>'rgba('+Math.min(255,iris[0]*k*255|0)+','+Math.min(255,iris[1]*k*255|0)+','+Math.min(255,iris[2]*k*255|0)+','+(a==null?1:a)+')';
    x.fillStyle='#140f0c';x.fillRect(0,0,N,N);const g=x.createRadialGradient(c,c,ri*.12,c,c,ri);g.addColorStop(0,col(1.3));g.addColorStop(.5,col(1.05));g.addColorStop(.85,col(.75));g.addColorStop(1,col(.4));
    x.fillStyle=g;x.beginPath();x.arc(c,c,ri,0,TAU);x.fill();mRs=17;
    for(let i=0;i<300;i++){const a=mRnd()*TAU,r0=ri*(.15+mRnd()*.25),r1=ri*(.55+mRnd()*.42),k=.6+mRnd()*.9,b=a+(mRnd()-.5)*.18;x.strokeStyle=col(k,.32);x.lineWidth=.5+mRnd()*1.3;x.beginPath();x.moveTo(c+Math.cos(a)*r0,c+Math.sin(a)*r0);x.lineTo(c+Math.cos(b)*r1,c+Math.sin(b)*r1);x.stroke();}
    x.strokeStyle='rgba(12,9,7,.85)';x.lineWidth=ri*.09;x.beginPath();x.arc(c,c,ri*.96,0,TAU);x.stroke();
    x.fillStyle='#040405';x.beginPath();if(pup==='slit')x.ellipse(c,c,ri*.11,ri*.66,0,0,TAU);else x.arc(c,c,Rr*pup,0,TAU);x.fill();
    const h=(px,py,r,a)=>{const q=x.createRadialGradient(c+px*Rr,c+py*Rr,0,c+px*Rr,c+py*Rr,r*Rr);q.addColorStop(0,'rgba(255,255,255,'+a+')');q.addColorStop(.4,'rgba(255,255,255,'+a*.6+')');q.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=q;x.fillRect(0,0,N,N);};
    h(-.3,-.32,.15,.9);h(.24,.3,.07,.3);});
  return MS_EYEM[key]=new mT.MeshStandardMaterial({map:t,roughness:.12,metalness:0});}
// a real eye: a smooth eyeball (slight cornea bulge) with the painted iris facing +z, and upper / lower lids (thin shells) whose edges make the
// almond-shaped opening; blinking closes the lids (mLid), looking turns the eyeball. lid: [rim colour] or {r: rim, c: lid skin, i: iris size, o: [up, down] opening, t: slant}
function mEyeObj(er,iris,pup,lid){const L=Array.isArray(lid)||!lid?{r:lid}:lid,rim=L.r||[.05,.04,.04],lc=L.c||rim,ir=L.i||.86,g=mG();
  const sg=new mT.SphereGeometry(er,pkLo()?18:28,pkLo()?14:20),P=sg.attributes.position,uv=sg.attributes.uv;
  for(let i=0;i<P.count;i++){let x=P.getX(i),y=P.getY(i),z=P.getZ(i);const q=(x*x+y*y)/(er*er);if(z>0)z*=1+.05*Math.max(0,1-q);P.setZ(i,z);
    const h=Math.hypot(x,y)||1e-6,k=z>0?1:1/h*er;uv.setXY(i,.5+x/(2*er)*(z>0?1:k),.5+y/(2*er)*(z>0?1:k));}
  sg.computeVertexNormals();const ball=new mT.Mesh(sg,mEyeMat(iris,pup,ir));g.add(ball);
  const lidG=up=>{const rr=er*(up?1.12:1.09),q=new mT.SphereGeometry(rr,pkLo()?16:24,8,0,TAU,up?0:mPI/2,mPI/2),A=q.attributes.position,n=A.count,c=new Float32Array(n*3);
    for(let i=0;i<n;i++){const t=Math.abs(A.getY(i))/rr,k=mSm((t-.06)/.2);c.set([mL(rim[0],lc[0],k),mL(rim[1],lc[1],k),mL(rim[2],lc[2],k)],i*3);}q.setAttribute('color',new mT.BufferAttribute(c,3));return new mT.Mesh(q,mSockMat(L.m||MS_M.sock));};
  const lu=lidG(1),ll=lidG(0);g.add(lu);g.add(ll);if(L.p)g.add(mSocket(er,L.p,rim,lc,L.m));const o=L.o||[.5,.42];Object.assign(g.userData,{ball,lu,ll,au:o[0],al:o[1],op:1,tilt:L.t||0});mLid(g);return g;}
// the skin around the eye (owner, 2026-11-17 night: "the eyes are still unnatural" — at match distance an eye on its own read as a bead stuck
// on the head or a speck lost in the fur): a ring that hugs the eyeball's edge and slopes out into the head, so the eye sits IN a socket.
// p = {a: inner edge radius (over the lids, default .92), h: lip height at the eye's edge, e: height of the outer edge (below the head surface, so it melts in), s: outer radius, all × eye radius;
// t / u: lip height above / below the eye (a walrus's heavy upper fold), st: outer radius above; d: how much of the ring is the dark rim colour
// (an arctic fox's black eyeliner ≈ .7; −1 = all skin, a walrus's wrinkled fold); w: almond (wider than tall); m (in lid): the head's own material}.
// Never touches the lids: every point stays > 1.12 × radius from the eye's centre, so blinking never cuts into it.
function mSocket(er,P,rim,lc,mat){const lo=pkLo(),nu=lo?20:36,nv=lo?5:9,pos=[],col=[],uv=[],idx=[],w=P.w||0,d=P.d==null?.3:P.d,ht=P.t==null?P.h:P.t,hb=P.u==null?P.h:P.u,st=P.st||P.s,a0=P.a||.92,z0=Math.sqrt(1.13*1.13-a0*a0);   // the inner edge lies just outside the lids' sphere (r 1.12), over their outer part: no gap between lid and socket
  for(let i=0;i<=nu;i++){const a=i/nu*TAU,ca=Math.cos(a),sa=Math.sin(a),up=Math.max(0,sa),dn=Math.max(0,-sa),S=mL(P.s,st,up)*(1+w*ca*ca),H=sa>0?mL(P.h,ht,Math.pow(up,1.3)):mL(P.h,hb,Math.pow(dn,1.3));
    for(let j=0;j<=nv;j++){const t=j/nv,r=j?mL(1.08,S,t):a0,z=j?mL(H,P.e,mSm(Math.min(1,t*1.1))):z0,k=mSm((t-d)/Math.max(.08,1-d)*1.4);
      pos.push(r*er*ca*(1+w*.5),r*er*sa,z*er);col.push(mL(rim[0],lc[0],k),mL(rim[1],lc[1],k),mL(rim[2],lc[2],k));uv.push(i/nu*3,t*.5);}}
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,c=a+nv+1;idx.push(a,a+1,c,a+1,c+1,c);}
  const q=new mT.BufferGeometry();q.setAttribute('position',new mT.Float32BufferAttribute(pos,3));q.setAttribute('color',new mT.Float32BufferAttribute(col,3));q.setAttribute('uv',new mT.Float32BufferAttribute(uv,2));q.setIndex(idx);q.computeVertexNormals();
  const m=new mT.Mesh(q,mSockMat(mat||MS_M.sock));m.userData.socket=1;return m;}
// the socket is seen from both sides (its inner wall faces the eye: from an angle the near side shows its back, and culling it opened a gap to the head)
const MS_SOCKM=new Map();function mSockMat(m){let c=MS_SOCKM.get(m);if(!c){c=m.clone();c.side=mT.DoubleSide;if(m.onBeforeCompile)c.onBeforeCompile=m.onBeforeCompile;if(m.customProgramCacheKey)c.customProgramCacheKey=m.customProgramCacheKey;MS_SOCKM.set(m,c);}return c;}
// lids from the eye's openness (1 = open, 0 = shut)
function mLid(e){const u=e.userData;if(!u.lu)return;const k=Math.max(0,Math.min(1,u.op));u.lu.rotation.x=mL(.26,-u.au,k);u.ll.rotation.x=mL(.06,u.al,k);}   // shut: the upper lid comes down over the lower one
function mEyeR(h,R,c,r,yaw,pitch,er,iris,pup,lid,out){for(const s of[1,-1]){const g=mEyeObj(er,iris,pup,lid);mOn(h,g,c,r,s*yaw,pitch,out||.97);g.rotateZ(s*g.userData.tilt);R.eyes.push(g);}}
// … set into a part by a ray (from → to for the left eye, the right one mirrors x); sink = how deep it sits (× its radius); returns where they are
function mEyeG(h,R,geo,from,to,er,iris,pup,lid,sink,face){const P=[];for(const s of[1,-1]){const g=mEyeObj(er,iris,pup,lid);mStick(h,geo,g,[from[0]*s,from[1],from[2]],[to[0]*s,to[1],to[2]],-er*(sink==null?.35:sink),face);g.rotateZ(s*g.userData.tilt);R.eyes.push(g);P.push(g.position.toArray());}return P;}
// skin detail painted at run time (multiplied with the vertex colours): narwhal mottling, harbour-seal spots, walrus folds, sardine scales, skin grain
const MS_TX={
  mottle:pkTex(256,(x,N)=>{x.fillStyle='#fff';x.fillRect(0,0,N,N);mRs=11;for(let i=0;i<900;i++){const a=mRnd()*N,b=mRnd()*N,w=(Math.cos(a/N*TAU)+1)/2;if(mRnd()>Math.pow(w,1.6))continue;const r=1.5+mRnd()*4.5,al=.25+.45*w;
    for(const dx of[-N,0,N])for(const dy of[-N,0,N]){x.fillStyle='rgba(34,40,50,'+al.toFixed(2)+')';x.beginPath();x.ellipse(a+dx,b+dy,r*1.3,r,0,0,TAU);x.fill();}}},[1,.55]),
  spots:pkTex(256,(x,N)=>{x.fillStyle='#fff';x.fillRect(0,0,N,N);mRs=23;for(let i=0;i<280;i++){const a=mRnd()*N,b=mRnd()*N,r=1.5+mRnd()*4.5,al=.4+mRnd()*.45,e=.6+mRnd()*.6,ro=mRnd()*3,ring=mRnd()<.3;for(const dx of[-N,0,N])for(const dy of[-N,0,N]){x.fillStyle='rgba(35,38,44,'+al+')';x.beginPath();x.ellipse(a+dx,b+dy,r,r*e,ro,0,TAU);x.fill();if(ring){x.strokeStyle='rgba(35,38,44,.45)';x.lineWidth=1;x.beginPath();x.arc(a+dx,b+dy,r+2,0,TAU);x.stroke();}}}},[1,.45]),
  folds:pkTex(256,(x,N)=>{x.fillStyle='#808080';x.fillRect(0,0,N,N);mRs=37;for(let i=0;i<260;i++){const y=mRnd()*N,a=mRnd()*N,l=8+mRnd()*34,g=96+mRnd()*50|0,w=.8+mRnd()*1.6,an=(mRnd()-.5)*.9,d=(mRnd()-.5)*8,c=Math.cos(an)*l,sn=Math.sin(an)*l;
    for(const dx of[-N,0,N])for(const dy of[-N,0,N]){x.strokeStyle='rgb('+g+','+g+','+g+')';x.lineWidth=w;x.beginPath();x.moveTo(a+dx,y+dy);x.quadraticCurveTo(a+dx+c/2,y+dy+sn/2+d,a+dx+c,y+dy+sn);x.stroke();}}},[3,2]),
  scales:pkTex(128,(x,N)=>{x.fillStyle='#d0d0d0';x.fillRect(0,0,N,N);const s=N/8;for(let j=0;j<=14;j++)for(let i=-1;i<=8;i++){const cx=i*s+(j%2)*s/2,cy=j*s*.6;const g=x.createRadialGradient(cx,cy-s*.2,s*.08,cx,cy,s*.62);g.addColorStop(0,'#ffffff');g.addColorStop(.8,'#cfcfcf');g.addColorStop(1,'#7a7a7a');x.fillStyle=g;x.beginPath();x.arc(cx,cy,s*.6,0,Math.PI);x.fill();}},[8,3]),
  grain:pkTex(128,(x,N)=>{const d=x.createImageData(N,N);mRs=53;for(let i=0;i<N*N;i++){const v=116+mRnd()*24|0;d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=v;d.data[i*4+3]=255;}x.putImageData(d,0,0);},[6,6])};
Object.assign(MS_M,{eyeR:new mT.MeshStandardMaterial({vertexColors:true,roughness:.04,metalness:0,envMapIntensity:1.5}),
  skin:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.24,metalness:.04,bumpMap:MS_TX.grain,bumpScale:.003}),.9),
  narw:rimify(new mT.MeshStandardMaterial({vertexColors:true,map:MS_TX.mottle,roughness:.3,metalness:.03,bumpMap:MS_TX.grain,bumpScale:.003}),.9),
  sealM:rimify(new mT.MeshStandardMaterial({vertexColors:true,map:MS_TX.spots,roughness:.3,metalness:.04,bumpMap:MS_TX.grain,bumpScale:.003}),1),
  walM:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.55,metalness:0,bumpMap:MS_TX.folds,bumpScale:.014}),.8),
  sock:new mT.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:0,bumpMap:MS_TX.grain,bumpScale:.002}),   // lids + the skin around an eye: matte and no rim light, so their edges never shine like a ring
  fishM:rimify(new mT.MeshStandardMaterial({vertexColors:true,map:MS_TX.scales,bumpMap:MS_TX.scales,bumpScale:.003,roughness:.28,metalness:.22}),1.2),
  crystal:new mT.MeshStandardMaterial({vertexColors:true,roughness:.05,metalness:.25,transparent:true,opacity:.86,emissive:0x5e9ccc,emissiveIntensity:.28,envMapIntensity:2}),
  cloudD:new mT.MeshStandardMaterial({vertexColors:true,roughness:1,emissive:0xbfd8ff,emissiveIntensity:0}),shade:new mT.MeshBasicMaterial({colorWrite:false,depthWrite:false})});
// a body lofted along +z (rear z0 → front z1): F(v,f) sets f = [centre height, half width, half height]; col(u, v, up, side)
function mLoft(z0,z1,F,col,seg,vs){const S=pkLo()?.6:1,U=Math.max(10,(seg||30)*S|0),V=Math.max(10,(vs||30)*S|0),f=[0,0,0];
  const g=pkSurf(U,V,(u,v,p)=>{const a=u*TAU;F(v,f);p[0]=-Math.sin(a)*f[1];p[1]=mL(z0,z1,v);p[2]=-(f[0]+Math.cos(a)*f[2]);},
    col?(u,v,p,o)=>{const q=col(u,v,Math.cos(u*TAU),Math.sin(u*TAU));o[0]=q[0];o[1]=q[1];o[2]=q[2];}:null,1,1,[1,1]);g.rotateX(Math.PI/2);return g;}
// … and one standing up along +y (y0 → y1): F(v,f) = [forward offset, half width, half depth]; col(u, v, front, side)
function mLoftY(y0,y1,F,col,seg,vs){const S=pkLo()?.6:1,U=Math.max(10,(seg||30)*S|0),V=Math.max(10,(vs||30)*S|0),f=[0,0,0];
  return pkSurf(U,V,(u,v,p)=>{const a=u*TAU;F(v,f);p[0]=Math.sin(a)*f[1];p[1]=mL(y0,y1,v);p[2]=f[0]+Math.cos(a)*f[2];},
    col?(u,v,p,o)=>{const q=col(u,v,Math.cos(u*TAU),Math.sin(u*TAU));o[0]=q[0];o[1]=q[1];o[2]=q[2];}:null,1,1,[1,1]);}
const mKf=(t,v)=>pkLook(t,v),mMix=(a,b,k)=>[mL(a[0],b[0],k),mL(a[1],b[1],k),mL(a[2],b[2],k)];
// a furred leg of the four-legged: thigh → lower leg → paw (paw(p) adds the paw); tip = where it touches
function mLeg4F(R,par,n,pos,l1,r1,l2,r2,col,paw,tz,fl){const a=mJ(R,n,mG(pos[0],pos[1],pos[2]));par.add(a);const b=mJ(R,n+'2',mG(0,-l1,0));a.add(b);
  // one furred tube from inside the body down to the paw, skinned to both joints: the knee bends smoothly (no step between pieces)
  const top=r1*1.2,L=l1+l2;mFur(a,mLimb(-L,top,y=>y>0?mL(r1*1.08,r1*.4,mSm(y/top)):y>-l1?mL(r1*.72,r1*1.08,mSm((y+l1)/l1)):mL(r2*.82,r1*.72,mSm((y+L)/l2)),col,16,30),TAU*r1,L,fl,null,[n,n+'2']);   // the top tapers away inside the body (no shelf at the shoulder)
  const p=mG(0,-l2,0);b.add(p);paw(p);const tip=mG(0,.02,tz||.1);p.add(tip);return tip;}
// claws: n small dark hooks across the front of a paw / flipper
function mClaws(n,w,len,z,y,col){const L=[];for(let i=0;i<n;i++){const c=mHorn(len,len*.25,col||[.1,.09,.08],0,6);c.rotateX(Math.PI/2+.55);c.translate((i-(n-1)/2)*w,y,z-Math.abs(i-(n-1)/2)*.012);L.push([c,null]);}return L;}
// the team's colour: a soft pool of light on the ice under each mascot (no costumes on real animals)
const MS_GLOW=pkTex(128,(x,N)=>{const g=x.createRadialGradient(N/2,N/2,N*.2,N/2,N/2,N/2);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.6,'rgba(255,255,255,.85)');g.addColorStop(.78,'rgba(255,255,255,.3)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,N,N);});
// ---------------- soft bodies: one skin over the joints (owner, 2026-11-17: "stiff, split into blocks — make it flexible and smooth") ----------------
// Everything that is flesh (fur, skin, feathers, the penguin's body) is merged per material into one skinned mesh whose bones are the rig's own
// joints. A vertex follows the joint it was built on; around each joint's pivot it is shared with the neighbour across a smooth band, so bodies
// bend like flesh instead of breaking into separate pieces. userData.ch on a mesh = joints along it (each vertex goes to the last pivot it has passed).
const MS_SOFT=new Set(),MS_THICK=new Set(['neck','head','tail','t2','t3','fluke','fL','fR','hL','hR','fL2','fR2','hL2','hR2','ffL2','ffR2','lead']);   // joints whose parent's flesh bends with them (thin flippers / wings / ears / jaws never pull the body)
function mSoftMat(m){return MS_SOFT.has(m)||m.customProgramCacheKey&&String(m.customProgramCacheKey()).indexOf('fur')>0;}
// skinned meshes get their own copy of a material (this three.js keeps one compiled shader per material: a shared one would stay unskinned)
const MS_SKM=new Map();function mSkMat(m){let c=MS_SKM.get(m);if(!c){c=m.clone();c.skinning=true;if(m.onBeforeCompile)c.onBeforeCompile=m.onBeforeCompile;if(m.customProgramCacheKey)c.customProgramCacheKey=m.customProgramCacheKey;MS_SKM.set(m,c);}return c;}
function mSkin(R,pairs){R.root.updateMatrixWorld(true);const inv=R.root.matrixWorld.clone().invert(),bones=[R.root],bi=new Map([[R.root,0]]);
  for(const k in R.j){const o=R.j[k];if(bi.has(o))continue;let p=o.parent;while(p&&p!==R.root)p=p.parent;if(p){bi.set(o,bones.length);bones.push(o);}}
  const piv=bones.map(b=>b.getWorldPosition(mV()).applyMatrix4(inv)),skip=new Set();for(const e of R.eyes)e.traverse(o=>skip.add(o));
  for(const k in R.ex){const v=R.ex[k];for(const o of(Array.isArray(v)?v:[v]))if(o&&o.isObject3D&&!bi.has(o))o.traverse(q=>skip.add(q));}
  // fur shells are not merged: each keeps its own mesh and borrows the weights of its bare twin (the shadow copy), block by block
  const ms=[],fur=[];R.root.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&!skip.has(o)&&!o.userData.rigid&&mSoftMat(o.material))(o.geometry.attributes.fsh?fur:ms).push(o);});if(!ms.length)return;
  const up=b=>{let p=b.parent;while(p&&!bi.has(p))p=p.parent;return p?bi.get(p):-1;},par=bones.map(up),v=mV(),nm=new mT.Matrix3();
  const parts=ms.map(m=>{const g=m.geometry,M=inv.clone().multiply(m.matrixWorld),P=g.attributes.position,N=g.attributes.normal,n=P.count,pos=new Float32Array(n*3),nor=new Float32Array(n*3),ob=new Uint16Array(n),b0=Math.max(0,up(m)),
      ch=m.userData.ch?m.userData.ch.map(x=>bi.get(R.j[x])):null,e=nm.getNormalMatrix(M).elements;
    for(let i=0;i<n;i++){v.fromBufferAttribute(P,i).applyMatrix4(M);pos[i*3]=v.x;pos[i*3+1]=v.y;pos[i*3+2]=v.z;let b=b0;
      if(ch)for(let k=1;k<ch.length;k++){const a=piv[ch[k-1]],c=piv[ch[k]];if((v.x-c.x)*(c.x-a.x)+(v.y-c.y)*(c.y-a.y)+(v.z-c.z)*(c.z-a.z)>=0)b=ch[k];}ob[i]=b;
      if(N){const x=N.getX(i),y=N.getY(i),z=N.getZ(i),X=e[0]*x+e[3]*y+e[6]*z,Y=e[1]*x+e[4]*y+e[7]*z,Z=e[2]*x+e[5]*y+e[8]*z,l=Math.hypot(X,Y,Z)||1;nor[i*3]=X/l;nor[i*3+1]=Y/l;nor[i*3+2]=Z/l;}}
    return {m,pos,nor,ob,n,si:new Uint16Array(n*4),sw:new Float32Array(n*4)};});
  // where each joint's flesh is (its centre), and the bands between neighbours: parent ↔ child, plus pairs that share a pivot (seal chest ↔ rear)
  const cen=bones.map(()=>[0,0,0,0]);for(const q of parts)for(let i=0;i<q.n;i++){const c=cen[q.ob[i]];c[0]+=q.pos[i*3];c[1]+=q.pos[i*3+1];c[2]+=q.pos[i*3+2];c[3]++;}
  const sub=b=>{const s=[0,0,0,0];for(let i=0;i<bones.length;i++){let p=i;while(p>=0&&p!==b)p=par[p];if(p===b)for(let k=0;k<4;k++)s[k]+=cen[i][k];}return s[3]?mV(s[0]/s[3],s[1]/s[3],s[2]/s[3]):null;},J=[];
  const bn=bones.map(o=>{for(const k in R.j)if(R.j[k]===o)return k;return "";}),add=(a,b,p,u,r,pb)=>{let rad=r;for(const q of parts)for(let i=0;i<q.n;i++)if(q.ob[i]===b){const dx=q.pos[i*3]-p.x,dy=q.pos[i*3+1]-p.y,dz=q.pos[i*3+2]-p.z;if(dx*u.x+dy*u.y+dz*u.z<2*r)rad=Math.max(rad,Math.hypot(dx,dy,dz));}
    J.push({a,b,p,u,r,rad,pb:pb!=null?pb:MS_THICK.has(bn[b])});};
  for(let b=1;b<bones.length;b++){const a=par[b];if(a<=0)continue;const c=sub(b);if(!c)continue;const p=piv[b],L=c.distanceTo(p);if(L<1e-4)continue;
    add(a,b,p,c.clone().sub(p).normalize(),bones[b].userData.br||Math.max(.025,Math.min(.2,L*.5)));}
  for(const [x,y,r] of pairs||[]){const a=bi.get(R.j[x]),b=bi.get(R.j[y]),ca=sub(a),cb=sub(b);if(ca&&cb)add(a,b,piv[b],cb.clone().sub(ca).normalize(),r,true);}
  // weights: the owner, minus what it shares across each band it is near; the 4 biggest are kept
  const ids=[0,0,0,0,0,0,0,0],ws=[0,0,0,0,0,0,0,0];
  for(const q of parts)for(let i=0;i<q.n;i++){const b=q.ob[i],x=q.pos[i*3],y=q.pos[i*3+1],z=q.pos[i*3+2];let n=1;ids[0]=b;ws[0]=1;
    for(const j of J){if(j.a!==b&&j.b!==b||j.a===b&&!j.pb)continue;const dx=x-j.p.x,dy=y-j.p.y,dz=z-j.p.z,f=1-mSm((Math.hypot(dx,dy,dz)-j.rad)/(j.rad*.5+j.r));if(f<=0)continue;
      const t=mSm((dx*j.u.x+dy*j.u.y+dz*j.u.z+j.r)/(2*j.r)),gv=(b===j.b?1-t:t*.6)*f*ws[0];if(gv<=1e-4)continue;const to=b===j.b?j.a:j.b;ws[0]-=gv;
      let k=1;while(k<n&&ids[k]!==to)k++;if(k===n){if(n>=8)continue;ids[n]=to;ws[n]=0;n++;}ws[k]+=gv;}
    let s=0;for(let a=0;a<4;a++){let m=-1,mv=0;for(let c=0;c<n;c++)if(ws[c]>mv){mv=ws[c];m=c;}if(m<0)break;q.si[i*4+a]=ids[m];q.sw[i*4+a]=mv;s+=mv;ws[m]=-1;}
    if(s>0)for(let a=0;a<4;a++)q.sw[i*4+a]/=s;else q.sw[i*4]=1;}
  const sk=new mT.Skeleton(bones),put=(geo,mat,ns,rs)=>{const S2=new mT.SkinnedMesh(geo,mSkMat(mat));S2.frustumCulled=false;S2.userData.ns=ns;S2.receiveShadow=rs;R.root.add(S2);S2.updateMatrixWorld(true);S2.bind(sk,S2.matrixWorld);};
  // one skinned mesh per material for the bare parts
  const groups=new Map();for(const q of parts){const k=q.m.material;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(q);}
  for(const [mat,L] of groups){let nv=0,ni=0;const names=new Set();for(const q of L){nv+=q.n;const g=q.m.geometry;ni+=g.index?g.index.count:q.n;for(const a in g.attributes)if(a!=='position'&&a!=='normal')names.add(a);}
    const G2=new mT.BufferGeometry(),pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),idx=new (nv>65000?Uint32Array:Uint16Array)(ni),si=new Uint16Array(nv*4),sw=new Float32Array(nv*4),ex={};
    for(const a of names){const s=L.find(q=>q.m.geometry.attributes[a]).m.geometry.attributes[a].itemSize;ex[a]=new Float32Array(nv*s).fill(a==='color'?1:0);ex[a].s=s;}
    let o=0,oi=0;for(const q of L){const g=q.m.geometry;pos.set(q.pos,o*3);nor.set(q.nor,o*3);si.set(q.si,o*4);sw.set(q.sw,o*4);
      for(const a of names){const A=g.attributes[a];if(!A)continue;const s=ex[a].s;if(A.itemSize===s&&A.array.length===q.n*s)ex[a].set(A.array,o*s);else for(let i=0;i<q.n;i++)for(let c=0;c<s;c++)ex[a][(o+i)*s+c]=A.getComponent(i,c);}
      if(g.index){const I=g.index.array;for(let k=0;k<I.length;k++)idx[oi+k]=I[k]+o;oi+=I.length;}else{for(let k=0;k<q.n;k++)idx[oi+k]=o+k;oi+=q.n;}o+=q.n;}
    G2.setAttribute('position',new mT.BufferAttribute(pos,3));G2.setAttribute('normal',new mT.BufferAttribute(nor,3));for(const a of names)G2.setAttribute(a,new mT.BufferAttribute(ex[a],ex[a].s));
    G2.setAttribute('skinIndex',new mT.Uint16BufferAttribute(si,4));G2.setAttribute('skinWeight',new mT.Float32BufferAttribute(sw,4));G2.setIndex(new mT.BufferAttribute(idx,1));
    put(G2,mat,L.every(q=>q.m.userData.ns),L.some(q=>q.m.receiveShadow));}
  // fur: the shells' own geometry, moved into the rig's space, with the twin's weights repeated for every shell
  for(const m of fur){const q=parts.find(p=>p.m===m.userData.twin);if(!q){m.parent.remove(m);continue;}const g=m.geometry,n=g.attributes.position.count;if(n%q.n){m.parent.remove(m);continue;}
    const pos=g.attributes.position.array,nor=g.attributes.normal.array,si=new Uint16Array(n*4),sw=new Float32Array(n*4);
    for(let k=0;k<n;k+=q.n){pos.set(q.pos,k*3);nor.set(q.nor,k*3);si.set(q.si,k*4);sw.set(q.sw,k*4);}g.attributes.position.needsUpdate=g.attributes.normal.needsUpdate=true;
    g.setAttribute('skinIndex',new mT.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new mT.Float32BufferAttribute(sw,4));m.parent.remove(m);put(g,m.material,true,true);}
  for(const q of parts)q.m.parent.remove(q.m);R.skin=sk;}
// ---------------- soft motion ----------------
// each frame the pose only gives targets: the joints follow them on critically damped springs (ω per joint — heads, tails, ears and flippers are
// a little slower than the body, so the motion eases in and out and the ends follow through); chain joints (from / share) take their share of
// the joint they hang from (a tail curls along its length instead of turning at one hinge); ice animals breathe
function mSpr(Z,i,g,w,dt){const x=Z[i],vv=Z[i+3],f=1+2*dt*w,ho=dt*w*w,hh=dt*ho,di=1/(f+hh);g+=TAU*Math.round((x-g)/TAU);Z[i]=(f*x+dt*vv+hh*g)*di;Z[i+3]=(vv+ho*(g-x))*di;return Z[i];}
function mSmooth(R,dt){const S=MS_SP[R.sp],om=S.om||{},snap=!R.sm||!(dt>0)||dt>.25;if(snap)R.sm={};const Z=R.sm,j=R.j;R.lt=(R.lt||0)+(dt>0&&dt<.25?dt:0);
  for(const n in j){const u=j[n].userData;if(!u.from)continue;const f=j[u.from],a=f.rotation,r=f.userData.r0[1],o=j[n].rotation;o.set(o.x+(a.x-r.x)*u.share,o.y+(a.y-r.y)*u.share,o.z+(a.z-r.z)*u.share);}
  for(const n in j){const u=j[n].userData;if(u.own==null)continue;const o=j[n].rotation,r=u.r0[1];o.set(r.x+(o.x-r.x)*u.own,r.y+(o.y-r.y)*u.own,r.z+(o.z-r.z)*u.own);}
  for(const n in j){const o=j[n].rotation,w=om[n]||j[n].userData.om||20;let z=Z[n];if(!z||snap){Z[n]=[o.x,o.y,o.z,0,0,0];continue;}
    o.set(mSpr(z,0,o.x,w,dt),mSpr(z,1,o.y,w,dt),mSpr(z,2,o.z,w,dt));}
  const f=R.off;let z=Z.off;if(!z||snap)Z.off=[f.x,f.y,f.z,0,0,0,f.rx,f.ry,f.rz,0,0,0];else{f.x=mSpr(z,0,f.x,26,dt);f.y=mSpr(z,1,f.y,26,dt);f.z=mSpr(z,2,f.z,26,dt);const q=z.slice(6);f.rx=mSpr(q,0,f.rx,22,dt);f.ry=mSpr(q,1,f.ry,22,dt);f.rz=mSpr(q,2,f.rz,22,dt);for(let i=0;i<6;i++)z[6+i]=q[i];}
  if(R.med==='ice'&&j.body&&S.breath!==0){const b=Math.sin(R.lt*2.2+R.k0*7)*.011;j.body.scale.y*=1+b;j.body.scale.x*=1+b*.6;j.body.scale.z*=1+b*.4;}}
// a smooth limb: a tube along +y with many rings (so it can bend), radius by height rf(y), closed at both ends
function mLimb(y0,y1,rf,col,seg,vs){const S=pkLo()?.6:1,U=Math.max(8,(seg||16)*S|0),V=Math.max(10,(vs||26)*S|0);
  return pkSurf(U,V,(u,v,p)=>{const a=u*TAU,e=v<.05?v/.05:v>.95?(1-v)/.05:1,y=mL(y0,y1,v<.05?.05*mSm(v/.05):v>.95?1-.05*mSm((1-v)/.05):v),r=rf(y)*Math.sqrt(Math.max(0,Math.min(1,e*1.4)));p[0]=Math.sin(a)*r;p[1]=y;p[2]=Math.cos(a)*r;},
    col?(u,v,p,o)=>{const q=typeof col==='function'?col(u,v):col;o[0]=q[0];o[1]=q[1];o[2]=q[2];}:null,1,1,[1,1]);}
// --- joints: every animated part is registered so each frame starts again from its rest placement ---
function mJ(R,n,o){R.j[n]=o;return o;}
function mRest(R){for(const k in R.j){const o=R.j[k],r=o.userData.r0;o.position.copy(r[0]);o.rotation.copy(r[1]);o.scale.copy(r[2]);}
  R.off={x:0,y:0,z:0,rx:0,ry:0,rz:0,s:1,px:0,py:0,pz:0};for(const e of R.eyes){e.scale.set(1,1,1);const u=e.userData;if(u.pu)u.pu.position.copy(u.pu0);u.op=1;mLid(e);if(u.ball)u.ball.rotation.set(0,0,0);}R.ex.mouth.scale.set(1,1,1);if(R.ex.mat){R.ex.mat.emissiveIntensity=0;R.ex.mat.color.setScalar(1);}}
function mBlink(R,t,s){const q=(t*.37+(s||0))%3.1,b=q<.12?Math.max(0,1-Math.sin(q/.12*mPI)):1;for(const e of R.eyes){e.userData.op*=b;mLid(e);}}
// lids: k < 1 narrows the eyes (real eyes do not wink or pop out, so a wink or k > 1 does nothing)
function mEyeK(R,k,wink){if(wink)return;k=Math.max(.2,Math.min(1,k));for(const e of R.eyes){e.userData.op*=k;mLid(e);}}
function mLook(R,x,y){for(const e of R.eyes){const u=e.userData;if(u.ball)u.ball.rotation.set(-y*.3,x*.4,0);}}
const mR=(R,n,x,y,z)=>{const o=R.j[n];if(!o)return;o.rotation.x+=x||0;o.rotation.y+=y||0;o.rotation.z+=z||0;};
function mWalk4(R,t,f,k,A){const p=t*f*TAU;A=A||.5;for(const [n,ph] of[['fL',0],['fR',mPI],['hL',mPI*.5],['hR',mPI*1.5]]){
    const sw=Math.sin(p+ph),lift=Math.max(0,Math.cos(p+ph));mR(R,n,-sw*A*k);mR(R,n+'2',lift*(n[0]==='f'?.9:.6)*k);}
  R.off.y+=Math.abs(Math.sin(p))*.03*k;mR(R,'body',0,0,Math.sin(p)*.035*k);mR(R,'head',Math.sin(p*2)*.05*k);}
// sit: the rear goes down around the front shoulders, hind legs fold, front legs stay upright
function mSit4(R,k,sh,a,hip,knee){R.off.py=sh[1];R.off.pz=sh[2];R.off.rx-=a*k;mR(R,'fL',a*k);mR(R,'fR',a*k);mR(R,'hL',-hip*k);mR(R,'hR',-hip*k);mR(R,'hL2',knee*k);mR(R,'hR2',knee*k);}
// pinnipeds: a galumph (chest and rear rock in turn)
function mGalumph(R,t,f,k){const p=t*f*TAU;mR(R,'chest',-Math.max(0,Math.sin(p))*.32*k);mR(R,'rear',Math.max(0,Math.sin(p+mPI*.9))*.22*k);R.off.y+=Math.max(0,Math.sin(p))*.05*k;
  mR(R,'ffL',-Math.sin(p)*.5*k);mR(R,'ffR',-Math.sin(p)*.5*k);mR(R,'rf',Math.sin(p+1)*.3*k);}
// swimmers: cetaceans beat up and down, fish side to side
function mSwim(R,t,f,k,fish){const p=t*f*TAU;if(fish){mR(R,'body',0,Math.sin(p)*.12*k);mR(R,'tail',0,Math.sin(p-1)*.55*k);}
  else{mR(R,'body',Math.sin(p)*.05*k);mR(R,'tail',Math.sin(p-.9)*.22*k);mR(R,'fluke',Math.sin(p-1.8)*.35*k);}}
// ---------------- the cast ----------------
// each: med = 'ice' | 'water' | 'air'; k0 = size; pool = hole radius; cw = width of its close-up; flat = faces the camera while greeting;
// build(R); idle / enter / touch / bow / wave / win / lose (R, t, o); g = where its signature starts inside the victory act
var MS_SP={
  // 펭귄 — belly-slides in, waddles; flipper touch; ecstatic display call when it wins, face-flop tantrum when it loses
  peng:{med:'ice',k0:1.05,cw:2.0,g:0,om:{head:13,wL:15,wR:15},build(R){const B=[.06,.07,.1],Bs=[.17,.21,.27],W=[.96,.96,.95],Yp=[1,.93,.72],Yo=[1,.7,.24],bd=mJ(R,'body',mG(0,.04,0));R.root.add(bd);
      // emperor penguin: tall and widest low, the white front narrows to a pale-yellow upper breast, blue-grey sheen on the black back,
      // a small black head with the yellow-orange ear patches, a long down-curved bill with an orange-pink plate, small dark eyes
      const body=mLoftY(0,.98,(v,f)=>{f[0]=mKf([[0,0],[.35,.035],[.7,.01],[1,0]],v);f[1]=mKf([[0,.02],[.04,.2],[.18,.3],[.4,.325],[.62,.29],[.82,.22],[.95,.165],[1,.02]],v);f[2]=mKf([[0,.02],[.04,.19],[.18,.29],[.4,.31],[.62,.27],[.82,.2],[.95,.15],[1,.02]],v);},
        (u,v,fr,sd)=>{const w=mKf([[0,.3],[.3,.02],[.6,.12],[.85,.4],[1,.55]],v);if(fr>w)return mMix(W,Yp,mSm((v-.6)/.28));if(fr>w-.12)return [.2,.22,.27];return mMix(Bs,B,.35+.65*Math.abs(sd));},34,32);
      bd.add(mMesh([[body,null],[mFin([[0,0],[.1,-.02],[0,-.16],[-.1,-.02]],.03,B).rotateX(-1.25).translate(0,.12,-.27),null]],PK_MAT.body));
      const hd=mJ(R,'head',mG(0,.9,.02));bd.add(hd);const c=[0,.11,.03],r=[.155,.145,.17];
      hd.add(mMesh([[mEll(c,r,d=>{if(Math.abs(d[0])>.5&&d[1]<.15&&d[1]>-.75&&d[2]<.45)return mMix(Yo,Yp,mSm(-d[1]-.1));if(d[2]>.25&&d[1]<-.45)return Yp;return B;},28),null]],PK_MAT.body));
      const bk=mHorn(.25,.04,(u,v)=>Math.cos(u*TAU)>.2&&v<.72?[1,.52,.36]:[.05,.05,.06],0,12),bp=bk.attributes.position;for(let i=0;i<bp.count;i++){const y=bp.getY(i);bp.setZ(i,bp.getZ(i)*.85+Math.pow(y/.25,2)*.035);}bk.computeVertexNormals();bk.rotateX(Math.PI/2);
      const bm=new mT.Mesh(bk,PK_MAT.beak);mOn(hd,bm,c,r,0,-.1,.88);R.ex.beak=bm;mEyeR(hd,R,c,r,.62,.2,.016,[.32,.17,.09],.36,{r:[.03,.03,.04],c:B,i:.8,o:[.48,.4]},1.0);
      for(const s of[1,-1]){const w=mJ(R,s>0?'wL':'wR',mG(s*.27,.72,-.02));bd.add(w);w.rotation.z=s*.2;
        const f=mFin([[0,.02],[.055,-.04],[.066,-.3],[.036,-.46],[-.01,-.49],[-.05,-.3],[-.045,-.03]],.016,B,1);f.rotateY(Math.PI/2);const fp=f.attributes.position,fc=f.attributes.color;for(let i=0;i<fp.count;i++)if(fp.getX(i)*s<-.004)fc.setXYZ(i,.92,.92,.9);
        w.add(mMesh([[f,null]],PK_MAT.body));const tp=mG(0,-.47,0);w.add(tp);R.tips[s>0?'L':'R']=tp;R.iks[s>0?'L':'R']=[bd,w];
        const ft=mJ(R,s>0?'fL':'fR',mG(s*.12,.014,.05));R.root.add(ft);const g=mFin([[0,-.03],[.07,.04],[.055,.15],[.02,.12],[0,.16],[-.02,.12],[-.055,.15],[-.07,.04]],.02,[.16,.15,.17]);g.rotateX(Math.PI/2);
        ft.add(mMesh([[g,null],...mClaws(3,.045,.03,.17,0,[.08,.07,.07])],PK_MAT.beak));}
      R.head=hd;R.sph=[[bd,[0,.45,0],.32],[hd,c,.16]];},
    idle(R,t){mR(R,'body',0,0,.03*Math.sin(t*1.3));mR(R,'head',0,.25*Math.sin(t*.7));mR(R,'wL',0,0,.05*Math.sin(t*2));mR(R,'wR',0,0,-.05*Math.sin(t*2+.4));mBlink(R,t,.3);},
    slide(R,t,k){mR(R,'body',1.32*k);R.off.y+=.19*k;mR(R,'head',-1.05*k);mR(R,'wL',0,0,1.0*k);mR(R,'wR',0,0,-1.0*k);
      for(const s of[1,-1]){const f=R.j[s>0?'fL':'fR'];f.position.z-=.08*k;f.position.y+=Math.max(0,Math.sin(t*9+(s>0?0:mPI)))*.07*k;f.rotation.x-=.8*k;}},
    waddle(R,t,k){const p=t*7;mR(R,'body',0,0,.14*Math.sin(p)*k);mR(R,'wL',0,0,.35*k);mR(R,'wR',0,0,-.35*k);
      for(const s of[1,-1]){const f=R.j[s>0?'fL':'fR'],q=Math.sin(p+(s>0?0:mPI));f.position.z+=q*.07*k;f.position.y+=Math.max(0,q)*.045*k;}},
    enter(R,t,o){const S=MS_SP.peng,sl=1-mWin(o.u,.7,.84);R.off.z=-o.d;S.slide(R,t,sl);S.waddle(R,t,(1-sl)*(1-mWin(o.u,.97,1)));if(sl>.5&&o.n%3==0)o.fx('snow',R.root,[0,0,-.5]);mBlink(R,t);},
    touch(R,t,o){mR(R,'body',.08*o.u);mR(R,o.L?'wL':'wR',-1.25*o.u,0,o.s*.15*o.u);mR(R,'head',.1*o.u,0,o.s*.12*o.u);mBlink(R,t);},
    bow(R,o){const b=Math.sin(o.u*mPI);mR(R,'body',.42*b);mR(R,'head',.32*b);mR(R,'wL',.3*b);mR(R,'wR',.3*b);},
    wave(R,t){mR(R,'wR',0,0,-1.9-.35*Math.sin(t*14));mR(R,'head',-.1,0,.12*Math.sin(t*3));mBlink(R,t);},
    win(R,t,o){const S=MS_SP.peng;
      if(t<1.1){const u=mWin(t,0,.25)*(1-mWin(t,.95,1.1));mR(R,'head',-.75*u);mR(R,'wL',.35*u,0,1.25*u);mR(R,'wR',.35*u,0,-1.25*u);mR(R,'body',-.12*u);if(mAt(o,t,.15))o.sfx('honk');R.ex.beak.scale.y=1+.25*u*(Math.sin(t*30)>0?1:.4);}
      else if(t<1.5){R.off.y=mHop(t-1.1,5,.22);mR(R,'wL',0,0,.9+.5*Math.sin(t*30));mR(R,'wR',0,0,-.9-.5*Math.sin(t*30));if(mAt(o,t,1.3))o.sfx('hop');}
      else if(t<3.6){const u=(t-1.5)/2.1,a=u*TAU,k=mWin(t,1.5,1.75)*(1-mWin(t,3.35,3.6));S.slide(R,t,k);R.off.x=o.side*(1-Math.cos(a))*.6*k;R.off.z=Math.sin(a)*.6*k;R.off.ry=-o.side*a*k;if(o.n%3==0&&k>.5)o.fx('snow',R.root,[0,0,-.4]);}
      else if(t<4.6){R.off.y=mHop(t-3.6,4,.2);mR(R,'wL',0,0,1.0+.6*Math.sin(t*34));mR(R,'wR',0,0,-1.0-.6*Math.sin(t*34));mEyeK(R,.35);}
      else{const u=mWin(t,4.6,4.85);mR(R,'body',-.12*u);mR(R,'wL',.6*u,0,.55*u);mR(R,'wR',.6*u,0,-.55*u);mR(R,'head',-.2*u,0,.15*Math.sin(t*4)*u);if(t>5)mEyeK(R,.15,1);}
      mBlink(R,t);},
    lose(R,t,o){const S=MS_SP.peng;
      if(t<.8){const u=mWin(t,0,.2);mR(R,'head',-.3*u);mR(R,'wL',0,0,1.4*u);mR(R,'wR',0,0,-1.4*u);R.off.y=mArc(t/.4,.08);mEyeK(R,1.25);}
      else if(t<3.6){const k=mWin(t,.8,1.15)*(1-mWin(t,3.3,3.6));mR(R,'body',1.4*k);R.off.y+=.16*k;mR(R,'head',-.3*k*(1+.3*Math.sin(t*9)));
        if(mAt(o,t,1.1)){o.shake(.3);o.sfx('bump');o.fx('snow',R.root,[0,0,.5]);}if(t>1.3&&t<3.3){mR(R,'wL',0,0,(.9+.7*Math.sin(t*16))*k);mR(R,'wR',0,0,-(.9+.7*Math.sin(t*16+1.5))*k);
          for(const s of[1,-1]){const f=R.j[s>0?'fL':'fR'];f.position.y+=Math.max(0,Math.sin(t*14+(s>0?0:mPI)))*.12;}if(o.n%5==0)o.fx('snow',R.root,[0,0,.3]);}mEyeK(R,.25);}
      else{const u=mWin(t,3.6,4);mR(R,'head',.5*u);mR(R,'wL',.2*u,0,-.1*u);mR(R,'wR',.2*u,0,.1*u);mR(R,'body',.1*u,0,.06*Math.sin(t*2));S.waddle(R,t*.5,.3*u);mEyeK(R,.55);if(mAt(o,t,4.3))o.sfx('sob');}}},
  // 범고래 — breaches out of its hole; spy-hops to touch with a pectoral fin; vertical breach + fin slaps + spout when it wins; sulks and slaps its tail when it loses
  orca:{med:'water',k0:.82,pool:1.35,cw:2.9,g:.5,gt:1.25,om:{tail:14,t2:10,t3:8,fluke:7,pfL:12,pfR:12},build(R){const B=[.035,.04,.055],W=[.96,.96,.97],Gy=[.56,.58,.62],bd=mJ(R,'body',mG(0,-.06,0));R.root.add(bd);
      // orca: glossy black, the white eye patch, white chin and belly, the grey saddle behind the tall dorsal fin, rounded paddle flippers; a small dark eye
      const bg=mRev(-.35,1.25,v=>pkLook([[0,.32],[.06,.4],[.3,.45],[.6,.43],[.78,.38],[.88,.31],[.94,.23],[.98,.13],[1,.02]],v),(u,v,up,sd)=>{const ev=(v-.735)/.085,eu=(up-.38)/.2;
        return Math.abs(sd)>.4&&ev*ev+eu*eu<1?W:up<mKf([[0,-.5],[.3,-.6],[.55,-.8],[.72,-.74],[.86,-.5],[1,-.35]],v)?W:v<.22&&up>.6?Gy:B;},1,.92,96,80);bd.add(mMesh([[bg,null]],MS_M.skin));
      const tl=mJ(R,'tail',mG(0,0,-.35));bd.add(tl);tl.add(mMesh([[mRev(-1.25,.25,v=>pkLook([[0,.07],[.1,.1],[.38,.24],[.68,.37],[.85,.4],[1,.34]],v),(u,v,up,sd)=>{const fv=(v-.57)/.135,fu=(up+.15)/.3;return (up<-.5&&v>.63)||(fv*fv+fu*fu<1&&Math.abs(sd)>.55)?W:B;},1,.92,56,56),null]],MS_M.skin));
      // the tail curls along its length (three joints share the tail's pose and lag behind it)
      tl.children[0].userData.ch=['tail','t2','t3','fluke'];const t2=mJ(R,'t2',mG(0,0,-.42));tl.add(t2);const t3=mJ(R,'t3',mG(0,0,-.4));t2.add(t3);tl.userData.own=.5;t2.userData.from=t3.userData.from='tail';t2.userData.share=.3;t3.userData.share=.25;const fl=mJ(R,'fluke',mG(0,0,-.4));t3.add(fl);for(const s of[1,-1]){const g=mFin([[0,.05],[s*.16,.02],[s*.5,-.22],[s*.62,-.13],[s*.44,.02],[s*.12,.1]],.035,B);g.rotateX(Math.PI/2);fl.add(mMesh([[g,null]],MS_M.skin));}
      const df=mFin([[-.26,0],[.14,0],[.04,.22],[-.1,.52],[-.17,.58],[-.15,.36]],.05,B);df.rotateY(-Math.PI/2);df.translate(0,.36,-.02);bd.add(mMesh([[df,null]],MS_M.skin));
      for(const s of[1,-1]){const p=mJ(R,s>0?'pfL':'pfR',mG(s*.32,-.22,.7));bd.add(p);p.rotation.set(-.5,0,s*.85);
        const g=mFin([[0,.04],[.11,-.02],[.17,-.18],[.17,-.34],[.11,-.45],[.02,-.46],[-.05,-.34],[-.06,-.08]],.035,B,1);g.rotateY(Math.PI/2);p.add(mMesh([[g,null]],MS_M.skin));
        const tp=mG(0,-.45,0);p.add(tp);R.tips[s>0?'L':'R']=tp;R.iks[s>0?'L':'R']=[p];}
      mEyeG(bd,R,bg,[.7,.03,.9],[0,.03,.9],.018,[.2,.12,.08],.4,{r:[.02,.02,.03],c:B,o:[.42,.36]},.45,.2);
      R.head=mJ(R,'head',mG(0,.12,.95));bd.add(R.head);const bh=mG(0,.43,.72);bd.add(bh);R.ex.spout=bh;R.sph=[[bd,[0,0,.45],.45],[bd,[0,.05,1.0],.34]];},
    idle(R,t){R.off.y=.035*Math.sin(t*1.6);MS_SP.orca.sw(R,t,.6);mBlink(R,t,.7);},
    sw(R,t,k){mSwim(R,t,.7,k);},
    spy(R,k,h){mR(R,'body',-1.25*k);R.off.y+=(h==null?.55:h)*k;mR(R,'tail',.25*k);},
    enter(R,t,o){const S=MS_SP.orca;
      if(t<.3){R.off.y=-2.6;}
      else if(t<1.5){const u=(t-.3)/1.2;R.off.z=mL(-1.15,.1,u);R.off.y=mArc(u,1.25)-.25;mR(R,'body',mL(-1.05,1.15,u));mR(R,'tail',.3*Math.sin(u*mPI));
        if(mAt(o,t,.32)){o.splash(R,0,-1.0,1.2);o.sfx('splash');}if(mAt(o,t,1.42)){o.splash(R,0,.4,1.4);o.sfx('splash');o.shake(.25);}}
      else{const u=mWin(t,1.5,2.15);R.off.y=mL(-.8,0,u);mR(R,'body',mL(.5,0,u));S.sw(R,t,1);if(mAt(o,t,2.0)){o.fx('spout',R.ex.spout);o.sfx('blow');}}
      mBlink(R,t);},
    touch(R,t,o){const S=MS_SP.orca;if(o.low){R.off.rz=o.s*.55*o.u;R.off.y=-.04*o.u;}else S.spy(R,o.u);S.sw(R,t,.4);mR(R,o.L?'pfL':'pfR',-.9*o.u,0,-o.s*.3*o.u);mBlink(R,t);},
    bow(R,o){const b=Math.sin(o.u*mPI);mR(R,'body',.45*b);R.off.y-=.15*b;MS_SP.orca.sw(R,o.u*2,.5);},
    wave(R,t){MS_SP.orca.spy(R,1,.45);mR(R,'pfR',-.4,0,-.5-.4*Math.sin(t*10));mBlink(R,t);},
    win(R,t,o){const S=MS_SP.orca;
      if(t<.5){R.off.y=-1.2*mWin(t,0,.45);mR(R,'body',.9*mWin(t,0,.3));S.sw(R,t,1);if(mAt(o,t,.25))o.splash(R,0,.3,.8);}
      else if(t<1.9){const u=(t-.5)/1.4;R.off.y=mL(-1.6,-1.2,u)+mArc(u,3.3);mR(R,'body',-1.45);R.off.ry=u*mPI*1.2;R.off.rz=mWin(u,.55,1)*1.3;R.off.py=.3;
        if(mAt(o,t,.6)){o.splash(R,0,0,1.4);o.sfx('splash');}if(mAt(o,t,1.85)){o.splash(R,0,0,2);o.sfx('splash');o.shake(.5);}}
      else if(t<3.7){const u=mWin(t,1.9,2.2);R.off.rz=1.35*u;R.off.y=-.05;S.sw(R,t,.3);const sl=Math.sin((t-2.2)*7);mR(R,'pfL',0,0,(1.2+sl*.9)*u);
        if(t>2.2&&Math.sin((t-o.dt-2.2)*7)>=0&&sl<0)o.splash(R,.5,.6,.6);}
      else{const u=mWin(t,3.7,4.0);S.spy(R,u,.5+.08*Math.sin(t*5));R.ex.mouth.scale.set(1.3,1.6,1);mR(R,'pfL',0,0,.4*Math.sin(t*9)*u);mR(R,'pfR',0,0,-.4*Math.sin(t*9)*u);
        if(mAt(o,t,4.2)){o.fx('spout',R.ex.spout);o.sfx('blow');}if(t>4.9)mEyeK(R,.15,1);}
      mBlink(R,t);},
    lose(R,t,o){const S=MS_SP.orca;
      if(t<1.1){R.off.y=-.3*mWin(t,0,.9);mEyeK(R,.6);S.sw(R,t,.2);if(o.n%7==0)o.fx('bubble',R.head);}
      else if(t<3.6){const k=mWin(t,1.1,1.4)*(1-mWin(t,3.3,3.6));mR(R,'body',1.15*k);R.off.y=-.3-.3*k;const sl=Math.sin((t-1.4)*6.5);mR(R,'tail',(.55+.5*sl)*k);mR(R,'fluke',.4*sl*k);
        if(t>1.4&&Math.sin((t-o.dt-1.4)*6.5)>=0&&sl<0){o.splash(R,0,-1.6,1);o.sfx('splash');o.shake(.2);}}
      else{const u=mWin(t,3.6,4.1);R.off.y=mL(-.3,-.08,u);R.off.rz=.45*u;S.sw(R,t*.5,.3);mEyeK(R,.45);if(mAt(o,t,4.3)){o.fx('spout',R.ex.spout,[0,0,0],.3);o.sfx('sob');}}}},
  // 북극곰 — lumbers in on all fours; sits and gives a paw; rears up and roars, rolls on its back when it wins; plops down and hides its face when it loses
  bear:{med:'ice',k0:.86,cw:2.8,g:0,om:{neck:15,head:12,jaw:14},build(R){const F=[.93,.9,.8],Fb=[.83,.79,.67],Fl=[.97,.95,.88],D=[.05,.045,.045],fc=(u,v,up)=>up<-.45?Fb:mMix(F,Fl,Math.max(0,up)*.7);
      const bd=mJ(R,'body',mG(0,.98,0));R.root.add(bd);
      // polar bear: a long body with the rump a little higher than the shoulders, a long neck, a small long head with a Roman nose,
      // small round ears, black nose and lips, small dark eyes; dense cream fur (shells), black pads and claws
      mFur(bd,mLoft(-.98,.86,(v,f)=>{f[0]=mKf([[0,.06],[.15,.05],[.5,-.03],[.82,0],[1,.05]],v);f[1]=mKf([[0,.04],[.06,.27],[.2,.41],[.5,.46],[.78,.42],[.93,.31],[1,.06]],v);f[2]=mKf([[0,.04],[.06,.3],[.2,.44],[.5,.5],[.78,.45],[.93,.35],[1,.08]],v);},fc,32,30),2.8,1.9,.045);
      mFur(bd,mEll([0,.15,-.95],[.07,.06,.07],F,10),.45,.2,.03);
      const paw=p=>{mFur(p,mEll([0,.045,.05],[.16,.085,.2],F,16),1.1,.5,.03);p.add(mMesh([...mClaws(5,.055,.05,.24,.02),[mEll([0,-.03,.07],[.1,.014,.11],[.08,.07,.07],10),null]],MS_M.skin));};
      for(const s of[1,-1]){R.tips[s>0?'L':'R']=mLeg4F(R,bd,s>0?'fL':'fR',[s*.21,-.12,.52],.42,.19,.38,.15,F,paw,.2,.04);mLeg4F(R,bd,s>0?'hL':'hR',[s*.2,-.1,-.58],.45,.22,.38,.16,F,paw,.2,.04);}
      R.iks={L:[R.j.fL,R.j.fL2],R:[R.j.fR,R.j.fR2]};
      const nk=mJ(R,'neck',mG(0,.12,.72));bd.add(nk);mFur(nk,mLoft(-.25,.42,(v,f)=>{f[0]=mKf([[0,-.02],[1,.07]],v);f[1]=mKf([[0,.05],[.1,.29],[.5,.25],[.9,.2],[1,.05]],v);f[2]=mKf([[0,.05],[.1,.32],[.5,.27],[.9,.21],[1,.05]],v);},fc,24,14),1.7,.67,.04);
      const hd=mJ(R,'head',mG(0,.08,.36));nk.add(hd);
      const hg=mLoft(-.18,.44,(v,f)=>{f[0]=mKf([[0,0],[.35,.03],[.7,0],[1,-.02]],v);f[1]=mKf([[0,.05],[.12,.18],[.4,.17],[.7,.11],[.92,.075],[1,.02]],v);f[2]=mKf([[0,.05],[.12,.17],[.4,.16],[.7,.1],[.92,.07],[1,.02]],v);},(u,v)=>v>.93?D:F,26,22);
      const eP=mEyeG(hd,R,hg,[.3,.22,.2],[0,0,.02],.018,[.24,.14,.07],.38,{r:[.03,.025,.025],c:[.08,.07,.07],i:.9,o:[.56,.42],t:.1,p:{h:.6,e:.2,s:1.6,d:.6,w:.2}},.45,.5);
      mFur(hd,hg,1.0,.62,.022,mKeep(eP,.034,.075,(x,y,z)=>mL(1,.3,mSm((z-.16)/.2))));
      for(const s of[1,-1])mFur(hd,mEll([s*.13,.14,-.05],[.05,.045,.028],F,10),.3,.15,.02);
      hd.add(mMesh([[mEll([0,-.005,.43],[.055,.04,.035],D,12),null],[mEll([0,-.05,.33],[.075,.01,.09],D,10),null]],MS_M.skin));
      const jw=mJ(R,'jaw',mG(0,-.07,.14));hd.add(jw);jw.add(mMesh([[mEll([0,-.012,.13],[.085,.035,.15],F,14),null],[mEll([0,.012,.13],[.07,.015,.13],[.3,.12,.14],10),null]],MS_M.skin));
      R.head=hd;R.sph=[[bd,[0,0,.1],.6],[hd,[0,0,.1],.22]];},
    idle(R,t){mR(R,'head',.05*Math.sin(t*1.1),.2*Math.sin(t*.6));R.j.body.scale.y=1+.015*Math.sin(t*2);mBlink(R,t,.5);},
    sit(R,k){mSit4(R,k,[0,.86,.52],.42,1.0,1.7);mR(R,'neck',-.25*k);},
    rear(R,k){R.off.py=.88;R.off.pz=-.55;R.off.rx-=1.2*k;mR(R,'hL',1.2*k);mR(R,'hR',1.2*k);mR(R,'fL',.5*k);mR(R,'fR',.5*k);mR(R,'fL2',-.6*k);mR(R,'fR2',-.6*k);mR(R,'neck',.7*k);},
    enter(R,t,o){R.off.z=-o.d;mWalk4(R,t,1.3,1-mWin(o.u,.9,1),.45);if(o.n%9==0&&o.u<.95)o.fx('snow',R.root,[0,0,.5]);mBlink(R,t);},
    touch(R,t,o){MS_SP.bear.sit(R,mWin(o.u,0,.6));mR(R,o.L?'fL':'fR',-1.2*o.u);mR(R,'head',0,0,o.s*.15*o.u);mBlink(R,t);},
    bow(R,o){const b=Math.sin(o.u*mPI);R.off.py=.88;R.off.pz=-.55;R.off.rx+=.2*b;mR(R,'fL',-.2*b);mR(R,'fR',-.2*b);mR(R,'fL2',.5*b);mR(R,'fR2',.5*b);mR(R,'neck',.55*b);mR(R,'hL',-.2*b);mR(R,'hR',-.2*b);},
    wave(R,t){MS_SP.bear.sit(R,1);mR(R,'fR',-2.0,0,-.3-.25*Math.sin(t*9));mR(R,'fR2',-.4);mBlink(R,t);},
    win(R,t,o){const S=MS_SP.bear;
      if(t<1.5){const k=mWin(t,0,.45)*(1-mWin(t,1.25,1.5));S.rear(R,k);mR(R,'head',-.5*k);mR(R,'jaw',.55*k*mWin(t,.4,.55));if(mAt(o,t,.45)){o.sfx('roar');o.shake(.55);}}
      else if(t<2.0){if(mAt(o,t,1.55)){o.shake(.6);o.sfx('bump');o.fx('snow',R.root,[0,0,.8],2);}mWalk4(R,t,1,0);}
      else if(t<3.5){const k=mWin(t,2.0,2.4)*(1-mWin(t,3.15,3.5));R.off.rz=mPI*.98*k;R.off.py=.5;R.off.y-=.12*k;const w=Math.sin(t*11);
        for(const n of['fL','fR','hL','hR'])mR(R,n,(-.7+.5*w*(n[1]==='L'?1:-1))*k);mR(R,'head',-.3*k,0,.2*Math.sin(t*5)*k);mEyeK(R,mL(1,.3,k));if(o.n%4==0&&k>.5)o.fx('snow',R.root,[0,.1,0]);}
      else if(t<4.6){const k=mWin(t,3.5,3.8)*(1-mWin(t,4.35,4.6));S.rear(R,k);const b=Math.sin(t*16);mR(R,'fL',-.6*k*(b>0?b:0)-.4*k,0,-.6*k);mR(R,'fR',-.6*k*(b<0?-b:0)-.4*k,0,.6*k);
        if(Math.sin((t-o.dt)*16)*b<0)o.sfx('heart');}
      else{const u=mWin(t,4.6,4.9);mR(R,'head',-.25*u,.2*Math.sin(t*2)*u);R.j.body.rotation.z+=.06*Math.sin(t*3)*u;if(t>5.05)mEyeK(R,.15,1);}
      mBlink(R,t);},
    lose(R,t,o){const S=MS_SP.bear;
      if(t<.7){mR(R,'head',-.2*mWin(t,0,.2));mEyeK(R,1.2);}
      else{const k=mWin(t,.7,1.0);S.sit(R,k);if(mAt(o,t,.95)){o.shake(.4);o.sfx('bump');o.fx('snow',R.root,[0,0,-.4]);}
        if(t>1.3&&t<3.4){const u=mWin(t,1.3,1.6)*(1-mWin(t,3.15,3.4));mR(R,'fL',-1.9*u,0,.25*u);mR(R,'fR',-1.9*u,0,-.25*u);mR(R,'fL2',-1.0*u);mR(R,'fR2',-1.0*u);mR(R,'head',.35*u,.0,.12*Math.sin(t*3.5)*u);R.off.rz+=.05*Math.sin(t*3.5)*u;if(mAt(o,t,1.7)||mAt(o,t,2.6))o.sfx('sob');}
        if(t>=3.4){const u=mWin(t,3.4,4.0);R.off.rx+=.42*u;R.off.y-=.45*u;for(const n of['fL','fR'])mR(R,n,-1.2*u,0,(n==='fL'?.3:-.3)*u);for(const n of['hL','hR'])mR(R,n,1.0*u);mR(R,'neck',.25*u);
          R.j.body.scale.y=1+.04*Math.sin(t*1.8)*u;if(mAt(o,t,4.5))o.sfx('sob');if(t>4.2){mR(R,'fR',-.5*mWin(t,4.2,4.6),0,.4*mWin(t,4.2,4.6));}}
        mEyeK(R,.3);}}},
  // 물범 — galumphs in; raises its chest and touches with a flipper; claps, arches into a banana and rolls when it wins; tantrum on its back when it loses
  seal:{med:'ice',k0:.92,cw:2.3,g:0,om:{head:12,rf:9,ffL2:13,ffR2:13},pair:[['chest','rear',.14]],build(R){MS_SP.walrus.pinn(R,{base:[.56,.57,.59],dk:[.38,.4,.43],lt:[.83,.82,.79],r:.31,fl:.78,rl:.85,head:[.22,.2,.23],fin:.25,seal:1});},
    idle(R,t){mR(R,'chest',-.12-.03*Math.sin(t*1.4));mR(R,'head',.1*Math.sin(t*.9),.3*Math.sin(t*.5));mR(R,'rf',.15*Math.sin(t*2));mBlink(R,t,.2);},
    enter(R,t,o){R.off.z=-o.d;mGalumph(R,t,1.9,1-mWin(o.u,.9,1));mR(R,'chest',-.1);if(o.n%7==0&&o.u<.95)o.fx('snow',R.root,[0,0,0]);mBlink(R,t);},
    touch(R,t,o){mR(R,'chest',-.68*o.u);mR(R,'head',.45*o.u);mR(R,o.L?'ffL':'ffR',-1.4*o.u,0,o.s*.2*o.u);mBlink(R,t);},
    bow(R,o){const b=Math.sin(o.u*mPI);mR(R,'chest',-.1+.18*b);mR(R,'head',.6*b);},
    wave(R,t){mR(R,'chest',-.45);mR(R,'head',.25);mR(R,'ffR',-1.6,0,-.6-.4*Math.sin(t*10));mBlink(R,t);},
    win(R,t,o){
      if(t<1.7){const u=mWin(t,0,.25);mR(R,'chest',-.6*u);mR(R,'head',.4*u);const c=Math.abs(Math.sin(t*9));mR(R,'ffL',-1.2*u,0,(-.2-.9*c)*u);mR(R,'ffR',-1.2*u,0,(.2+.9*c)*u);
        if(t>.3&&Math.sin((t-o.dt)*9)*Math.sin(t*9)<=0){o.sfx('tap');}}
      else if(t<3.7){const u=mWin(t,1.7,2.0)*(1-mWin(t,3.4,3.7)),sl=Math.sin((t-1.7)*10);mR(R,'chest',-.5*u);mR(R,'head',-.35*u);mR(R,'rear',.45*u);mR(R,'rf',.5*u+.25*Math.sin(t*9)*u);
        mR(R,'ffL',-.5*u,0,(-.3-.6*Math.max(0,sl))*u);mR(R,'ffR',-.5*u,0,(.3+.6*Math.max(0,sl))*u);if(t>1.9&&Math.sin((t-o.dt-1.7)*10)>0&&sl<=0)o.sfx('tap');}
      else if(t<4.7){const u=(t-3.7);R.off.rz=mSm(u)*TAU;R.off.py=.3;if(o.n%5==0)o.fx('snow',R.root,[0,0,0]);}
      else{mR(R,'chest',-.5);mR(R,'head',-.2+.1*Math.sin(t*12));mR(R,'ffR',-1.5,0,-.6-.4*Math.sin(t*10));mR(R,'rf',.4*Math.sin(t*14));if(mAt(o,t,4.8)||mAt(o,t,5.2))o.sfx('honk');if(t>5.1)mEyeK(R,.15,1);}
      mBlink(R,t);},
    lose(R,t,o){
      if(t<.6){mR(R,'head',-.3*mWin(t,0,.15));mEyeK(R,1.25);}
      else if(t<3.4){const k=mWin(t,.6,.9)*(1-mWin(t,3.1,3.4));R.off.rz=mPI*.95*k;R.off.py=.31;const w=Math.sin(t*17);mR(R,'ffL',-1.0*k,0,(.4+.8*w)*k);mR(R,'ffR',-1.0*k,0,-(.4+.8*w)*k);mR(R,'rf',.5*Math.sin(t*15)*k);mR(R,'head',0,.5*Math.sin(t*8)*k);mR(R,'chest',-.2*k);
        if(mAt(o,t,1.0)||mAt(o,t,1.8)||mAt(o,t,2.6))o.sfx('honk');if(o.n%4==0&&k>.5)o.fx('snow',R.root,[0,.2,0]);mEyeK(R,.3);}
      else{const u=mWin(t,3.4,3.8);mR(R,'head',.25*u);mR(R,'chest',.06*u);mR(R,'ffR',-1.5*u,0,.9*u);mLook(R,0,.6*u);mEyeK(R,1.1);if(mAt(o,t,4.2))o.sfx('sob');}}},
  // 바다코끼리 — heavy galumph; flipper touch; bellows and drums its chest when it wins; slaps the ice and flops on its side when it loses
  walrus:{med:'ice',k0:.82,cw:2.6,g:0,om:{head:12,rf:9,ffL2:13,ffR2:13},pair:[['chest','rear',.17]],
    pinn(R,P){const sl=!!P.seal,base=P.base,dk=P.dk,lt=P.lt,col=(u,v,up)=>up<-.45?lt:up<-.1?mMix(base,lt,mSm((-.1-up)/.35)):mMix(base,dk,mSm(up)*.8),MAT=sl?MS_M.sealM:MS_M.walM;
      // harbour seal: spotted grey coat, a round dog-like head, big dark eyes, V nostrils, pale beaded whiskers;
      // walrus: wrinkled pinkish-brown skin, small red-brown eyes, the broad whisker pad with stiff bristles, ivory tusks
      const r=P.r,ch=mJ(R,'chest',mG(0,r,0)),rr=mJ(R,'rear',mG(0,r,0));R.root.add(ch);R.root.add(rr);
      ch.add(new mT.Mesh(mRev(0,P.fl,v=>pkLook([[0,r],[.45,r],[.8,r*.8],[1,r*.55]],v),col,1.04,.98),MAT));
      rr.add(new mT.Mesh(mRev(-P.rl,.02,v=>pkLook([[0,r*.16],[.15,r*.33],[.55,r*.78],[1,r]],v),col,1.04,.98),MAT));rr.add(new mT.Mesh(mEll([0,0,0],[r*1.02,r*.98,r*1.02],d=>d[1]<-.45?lt:base,18),MAT));
      const hd=mJ(R,'head',mG(0,r*.3,P.fl-.02));ch.add(hd);const c=[0,0,.04],hr=P.head,hc=d=>d[1]<-.5?lt:base,L=[[mEll(c,hr,hc,26),null]];let mz;
      if(sl){mz=mEll([0,-.05,.19],[.105,.085,.1],hc,16);L.push([mz,null]);for(const s of[1,-1])L.push([mEll([s*.05,-.07,.235],[.058,.048,.05],lt,12),null]);}
      else{for(const s of[1,-1])L.push([mEll([s*.085,-.1,.22],[.14,.12,.11],lt,16),null]);mz=mEll([0,-.03,.25],[.12,.08,.09],hc,14);L.push([mz,null]);}
      hd.add(new mT.Mesh(mMergeUV(L),MAT));const S=[];
      for(const s of[1,-1]){const ns=new mT.Mesh(mEll([0,0,0],[sl?.015:.02,sl?.007:.01,.006],[.06,.05,.05],8),MS_M.skin);ns.rotation.z=s*(sl?.5:.2);mStick(hd,mz,ns,[s*(sl?.022:.045),.15,.4],[s*(sl?.022:.045),-.05,.15],-.002,0);}
      if(sl){for(const s of[1,-1])for(let i=0;i<7;i++){const w=new mT.CylinderGeometry(.0022,.0008,.2,4);w.translate(0,.1,0);w.rotateZ(-s*(Math.PI/2-.15)+(i-3)*.07*s);w.rotateY(s*(.55-.06*Math.abs(i-3)));w.translate(s*.07,-.06+(i-3)*.011,.25);S.push([w,[.9,.88,.84]]);}
        mEyeR(hd,R,c,hr,.55,.15,.034,[.13,.08,.05],.6,{r:[.04,.04,.05],c:base,i:.95,o:[.72,.62],t:.1},.9);}
      else{for(const s of[1,-1])for(let i=0;i<20;i++){const w=new mT.CylinderGeometry(.006,.004,.07,5);w.rotateX(Math.PI/2+.5);w.translate(s*(.03+(i%5)*.038),-.07-(i/5|0)*.035,.325-(i%5)*.017);S.push([w,[.86,.78,.62]]);}
        mEyeR(hd,R,c,hr,.72,.32,.02,[.36,.14,.08],.38,{r:[.42,.22,.18],c:base,i:.85,o:[.26,.22],m:MS_M.walM,p:{h:.42,t:1.1,u:.36,e:.05,s:2.3,st:3.1,d:-1,w:.25}},.965);const tk=mJ(R,'tusks',mG(0,-.17,.27));hd.add(tk);R.ex.tusks=[];
        for(const s of[1,-1]){const m=new mT.Mesh(mHorn(.55,.05,(u,v)=>[.96-.1*v,.93-.12*v,.84-.15*v],0,14),MS_M.ivory);m.rotation.set(mPI-.18,0,-s*.06);m.position.x=s*.075;tk.add(m);R.ex.tusks.push(m);}}
      hd.add(mMesh(S,MS_M.skin,false));
      for(const s of[1,-1]){const a=mJ(R,s>0?'ffL':'ffR',mG(s*r*.84,-r*.55,P.fl*.62));ch.add(a);a.rotation.set(.9,0,s*.45);const tl=sl?.1:.13;a.add(mMesh([[mTube(-tl-.02,.03,v=>r*mL(.17,.24,v),base,1,12),null]],MS_M.skin));
        const b=mJ(R,(s>0?'ffL':'ffR')+'2',mG(0,-tl,0));a.add(b);const f=P.fin,g=mFin([[0,.02],[f*.2,-.03],[f*.25,-f*.7],[f*.1,-f],[-f*.1,-f*.95],[-f*.2,-f*.4],[-f*.17,0]],.03,base,1);g.rotateY(-s*.5);
        const cl=[];for(let i=0;i<5;i++)cl.push([mEll([(i-2)*f*.075,-f*.82,.012],[.01,.014,.008],[.08,.07,.06],6).rotateY(-s*.5),null]);b.add(mMesh([[g,null],...cl],MS_M.skin));
        const tp=mG(0,-f,0);b.add(tp);R.tips[s>0?'L':'R']=tp;R.iks[s>0?'L':'R']=[a,b];}
      const rf=mJ(R,'rf',mG(0,0,-P.rl+.03));rr.add(rf);for(const s of[1,-1]){const q=P.fin*1.1,g=mFin([[0,0],[s*q*.3,-q*.15],[s*q*.75,-q],[s*q*.2,-q*.95],[0,-q*.3]],.025,dk);g.rotateX(Math.PI/2);rf.add(mMesh([[g,null]],MS_M.skin));}
      R.head=hd;R.sph=[[ch,[0,0,P.fl*.4],r],[rr,[0,0,-P.rl*.35],r*.85],[hd,c,hr[0]]];},
    build(R){MS_SP.walrus.pinn(R,{base:[.72,.5,.4],dk:[.6,.4,.31],lt:[.84,.66,.56],r:.44,fl:.95,rl:1.05,head:[.3,.27,.29],fin:.38});},
    idle(R,t){mR(R,'chest',-.25-.03*Math.sin(t*1.2));mR(R,'head',.08*Math.sin(t*.8),.22*Math.sin(t*.45));mBlink(R,t,.9);},
    enter(R,t,o){R.off.z=-o.d;mGalumph(R,t,1.3,1-mWin(o.u,.9,1));mR(R,'chest',-.15);if(o.n%8==0&&o.u<.95){o.fx('snow',R.root,[0,0,0]);}mBlink(R,t);},
    touch(R,t,o){mR(R,'chest',-.55*o.u);mR(R,'head',.4*o.u);mR(R,o.L?'ffL':'ffR',-1.35*o.u,0,o.s*.2*o.u);mBlink(R,t);},
    bow(R,o){const b=Math.sin(o.u*mPI);mR(R,'chest',-.2+.12*b);mR(R,'head',.45*b);},
    wave(R,t){mR(R,'chest',-.45);mR(R,'head',.25);mR(R,'ffR',-1.5,0,-.6-.35*Math.sin(t*9));mBlink(R,t);},
    win(R,t,o){
      if(t<1.4){const u=mWin(t,0,.3);mR(R,'chest',-.75*u);mR(R,'head',-.35*u);mR(R,'ffL',-.4*u,0,.6*u);mR(R,'ffR',-.4*u,0,-.6*u);if(mAt(o,t,.35)){o.sfx('bray');o.shake(.3);}}
      else if(t<2.8){mR(R,'chest',-.55);mR(R,'head',.1);const b=Math.sin(t*13);mR(R,'ffL',-1.3,0,-(.5+.5*Math.max(0,b)));mR(R,'ffR',-1.3,0,.5+.5*Math.max(0,-b));if(Math.sin((t-o.dt)*13)*b<0)o.sfx('heart');}
      else if(t<4.1){mR(R,'chest',-.4);mR(R,'head',-.15+.12*Math.sin(t*14),.0,.1*Math.sin(t*7));R.j.chest.position.y+=.02*Math.sin(t*20);mEyeK(R,.3);if(mAt(o,t,2.9))o.sfx('bray');}
      else{const u=mWin(t,4.1,4.4);mR(R,'chest',-.6*u);mR(R,'head',-.3*u);mR(R,'ffR',-1.5*u,0,-(.6+.35*Math.sin(t*9))*u);if(mAt(o,t,4.6))o.sfx('bray');}
      mBlink(R,t);},
    lose(R,t,o){
      if(t<.9){const u=mWin(t,0,.8);mR(R,'chest',-.25+.22*u);mR(R,'head',.45*u);mEyeK(R,mL(1,.6,u));if(mAt(o,t,.3))o.sfx('sob');}
      else if(t<2.7){mR(R,'chest',-.05);mR(R,'head',.4);const sl=Math.sin((t-.9)*8);mR(R,'ffR',-.4-.8*Math.max(0,sl),0,-.3);if(Math.sin((t-o.dt-.9)*8)>0&&sl<=0){o.sfx('bump');o.fx('snow',R.j.ffR2,[0,-.3,0]);}mEyeK(R,.6);}
      else{const u=mWin(t,2.7,3.3);R.off.rz=-1.0*u;R.off.py=.44;mR(R,'head',.3,0,.3*u);mR(R,'ffL',-.6*u,0,.8*u);if(mAt(o,t,3.2)){o.shake(.45);o.sfx('bump');o.fx('snow',R.root,[0,0,0]);}
        R.j.chest.scale.y=1+.05*Math.sin(t*1.6)*u;mEyeK(R,.4);if(mAt(o,t,4.4))o.sfx('sob');}}},
  // 북극여우 — trots in; sits and gives a paw; play-bow; the famous mousing dive + tail chase when it wins; curls up under its tail when it loses
  fox:{med:'ice',k0:1.25,cw:2.2,g:0,om:{neck:15,head:12,eL:8,eR:8,tail:11,t2:8,t3:6},build(R){const F=[.96,.96,.95],Fs=[.86,.86,.84],D=[.05,.04,.04],fc=(u,v,up)=>up<-.4?Fs:F;
      const bd=mJ(R,'body',mG(0,.45,0));R.root.add(bd);
      // arctic fox in its winter coat: compact and round, short legs, a short muzzle, small rounded ears, golden eyes with slit pupils, a huge brush of a tail
      mFur(bd,mLoft(-.44,.42,(v,f)=>{f[0]=mKf([[0,.03],[.5,-.01],[1,.03]],v);f[1]=mKf([[0,.04],[.08,.16],[.3,.21],[.6,.2],[.85,.18],[1,.05]],v);f[2]=mKf([[0,.04],[.08,.17],[.3,.23],[.6,.23],[.85,.21],[1,.06]],v);},fc,28,24),1.35,.86,.065);
      const paw=p=>{mFur(p,mEll([0,.03,.03],[.05,.03,.072],F,10),.35,.2,.03);p.add(mMesh(mClaws(4,.02,.02,.09,.01),MS_M.skin));};
      for(const s of[1,-1]){R.tips[s>0?'L':'R']=mLeg4F(R,bd,s>0?'fL':'fR',[s*.1,-.06,.3],.2,.07,.19,.05,F,paw,.09,.05);mLeg4F(R,bd,s>0?'hL':'hR',[s*.11,-.05,-.3],.21,.09,.19,.055,F,paw,.09,.05);}
      R.iks={L:[R.j.fL,R.j.fL2],R:[R.j.fR,R.j.fR2]};
      const nk=mJ(R,'neck',mG(0,.1,.34));nk.rotation.x=-.35;bd.add(nk);mFur(nk,mEll([0,.04,.02],[.14,.14,.14],F,14),.9,.45,.06);
      const hd=mJ(R,'head',mG(0,.11,.05));hd.rotation.x=.35;nk.add(hd);
      const hg=mLoft(-.14,.25,(v,f)=>{f[0]=mKf([[0,.01],[.45,.01],[.75,-.025],[1,-.035]],v);f[1]=mKf([[0,.04],[.15,.15],[.45,.15],[.7,.08],[.92,.04],[1,.012]],v);f[2]=mKf([[0,.04],[.15,.14],[.45,.13],[.7,.065],[.92,.035],[1,.012]],v);},()=>F,22,20);
      const eP=mEyeG(hd,R,hg,[.24,.12,.22],[0,.02,.02],.021,[.62,.4,.14],'slit',{r:[.03,.025,.025],c:[.09,.08,.08],i:.92,o:[.6,.42],t:.22,p:{h:.62,e:.2,s:1.75,d:.68,w:.25}},.42,.5);
      mFur(hd,hg,.9,.4,.035,mKeep(eP,.04,.08,(x,y,z)=>mL(1,.3,mSm((z-.07)/.12))));
      hd.add(mMesh([[mEll([0,-.03,.25],[.024,.019,.019],D,10),null],[mEll([0,-.06,.16],[.04,.006,.06],D,8),null]],MS_M.skin));
      for(const s of[1,-1]){const e=mJ(R,s>0?'eL':'eR',mG(s*.085,.1,-.04));e.rotation.z=-s*.35;hd.add(e);const g=mHorn(.072,.05,F,0,10),gp=g.attributes.position;for(let i=0;i<gp.count;i++)gp.setZ(i,gp.getZ(i)*.6);g.computeVertexNormals();mFur(e,g,.3,.12,.02);
        e.add(mMesh([[mEll([0,.03,.012],[.026,.026,.006],[.5,.42,.42],8),null]],MS_M.skin));}
      const jw=mJ(R,'jaw',mG(0,-.07,.08));hd.add(jw);jw.add(mMesh([[mEll([0,-.008,.07],[.045,.02,.08],F,10),null]],MS_M.skin));
      const tl=mJ(R,'tail',mG(0,.05,-.42));tl.rotation.x=-.35;bd.add(tl);mFur(tl,mLoft(-.85,0,(v,f)=>{f[0]=0;f[1]=f[2]=mKf([[0,.02],[.12,.1],[.5,.14],[.85,.11],[1,.06]],v);},()=>F,20,32),.8,.85,.09,null,['tail','t2','t3']);
      const t2=mJ(R,'t2',mG(0,0,-.28));tl.add(t2);const t3=mJ(R,'t3',mG(0,0,-.28));t2.add(t3);tl.userData.own=.5;t2.userData.from=t3.userData.from='tail';t2.userData.share=.3;t3.userData.share=.25;
      R.head=hd;R.sph=[[bd,[0,0,0],.3],[hd,[0,0,.05],.16]];},
    idle(R,t){mR(R,'tail',0,.35*Math.sin(t*2.5));mR(R,'head',0,.25*Math.sin(t*.8),.15*Math.sin(t*.6));mR(R,'eL',0,0,.15*Math.max(0,Math.sin(t*3.1)));mBlink(R,t,.1);},
    sit(R,k){mSit4(R,k,[0,.38,.3],.62,1.25,2.0);mR(R,'neck',-.3*k);mR(R,'tail',.4*k);},
    enter(R,t,o){R.off.z=-o.d;mWalk4(R,t,2.6,1-mWin(o.u,.9,1),.6);mR(R,'tail',.15,.2*Math.sin(t*16));if(o.n%7==0&&o.u<.95)o.fx('snow',R.root,[0,0,.2]);mBlink(R,t);},
    touch(R,t,o){MS_SP.fox.sit(R,mWin(o.u,0,.6));mR(R,o.L?'fL':'fR',-1.3*o.u);mR(R,'head',0,0,o.s*.25*o.u);mR(R,'tail',0,.4*Math.sin(t*12));mBlink(R,t);},
    bow(R,o){const b=Math.sin(o.u*mPI);R.off.py=.42;R.off.pz=-.3;R.off.rx+=.42*b;mR(R,'fL',-.9*b);mR(R,'fR',-.9*b);mR(R,'hL',-.4*b);mR(R,'hR',-.4*b);mR(R,'neck',.2*b);mR(R,'tail',.8*b,.6*Math.sin(o.u*30));},
    wave(R,t){MS_SP.fox.sit(R,1);mR(R,'fR',-1.6-.3*Math.sin(t*10));mR(R,'tail',0,.6*Math.sin(t*12));mBlink(R,t);},
    win(R,t,o){const S=MS_SP.fox;
      if(t<.55){const u=mWin(t,0,.3);R.off.py=.38;R.off.pz=-.3;R.off.rx+=.12*u;mR(R,'hL',-.5*u);mR(R,'hR',-.5*u);mR(R,'hL2',.9*u);mR(R,'hR2',.9*u);mR(R,'eL',0,0,.25*u);mR(R,'eR',0,0,-.25*u);mR(R,'head',0,0,.3*Math.sin(t*6)*u);}
      else if(t<1.55){const u=(t-.55)/.55;if(u<1){R.off.y=mArc(u,1.1);R.off.z=u*.7;R.off.py=.46;R.off.rx=mL(-.6,1.45,u);mR(R,'fL',-1.1);mR(R,'fR',-1.1);mR(R,'tail',.5);}
        else{R.off.z=.7;R.off.y=-.06;R.off.py=.46;R.off.rx=1.5;mR(R,'tail',.3,.7*Math.sin(t*16));mR(R,'hL',.4*Math.sin(t*15));mR(R,'hR',-.4*Math.sin(t*15));}
        if(mAt(o,t,1.1)){o.fx('snow',R.root,[0,0,.9],3);o.shake(.25);o.sfx('bump');}}
      else if(t<2.6){const u=mWin(t,1.55,1.75);R.off.z=.7;R.off.y=mArc((t-1.55)/.25,.25)*(t<1.8?1:0);mR(R,'head',0,.7*Math.sin(t*28)*mBmp(t,1.85,2.45));if(mAt(o,t,1.95))o.fx('snow',R.j.head,[0,.15,0],2);mEyeK(R,mBmp(t,1.85,2.45)>0?.2:1);}
      else if(t<4.0){const u=(t-2.6)/1.4;R.off.z=.7;R.off.ry=mSm(u)*TAU*2;mWalk4(R,t,3.2,1,.55);mR(R,'tail',0,.6);if(o.n%5==0)o.fx('snow',R.root,[0,0,0]);}
      else{const u=mWin(t,4.0,4.3);R.off.z=.7;S.sit(R,u);mR(R,'head',-.25*u);mR(R,'tail',0,.6*Math.sin(t*14)*u);if(mAt(o,t,4.4))o.sfx('yip');mR(R,'jaw',.25*mBmp(t,4.4,4.7));if(t>5)mEyeK(R,.15,1);}
      mBlink(R,t);},
    lose(R,t,o){const S=MS_SP.fox;
      if(t<.6){const u=mWin(t,0,.3);mR(R,'eL',-.9*u,0,.6*u);mR(R,'eR',-.9*u,0,-.6*u);mR(R,'tail',-.5*u);mR(R,'head',.2*u);}
      else if(t<1.6){mR(R,'eL',-.9,0,.6);mR(R,'eR',-.9,0,-.6);mR(R,'tail',-.5);const k=Math.max(0,Math.sin((t-.6)*12));mR(R,'hL',.9*k);mR(R,'hR',.9*k);mR(R,'hL2',-.4*k);mR(R,'hR2',-.4*k);if(o.n%3==0)o.fx('snow',R.root,[0,0,-.5]);if(mAt(o,t,.7))o.sfx('growl');}
      else{const u=mWin(t,1.6,2.3),c=mWin(t,2.6,3.2);R.off.ry=mPI*.9*u;mR(R,'eL',-.9,0,.6);mR(R,'eR',-.9,0,-.6);
        R.off.y-=.24*c;mR(R,'fL',-1.3*c);mR(R,'fR',-1.3*c);mR(R,'fL2',.4*c);mR(R,'fR2',.4*c);mR(R,'hL',-1.1*c);mR(R,'hR',-1.1*c);mR(R,'hL2',2.0*c);mR(R,'hR2',2.0*c);mR(R,'tail',.2*c,1.6*c);mR(R,'neck',.4*c,.5*c);
        mEyeK(R,mL(1,.25,c));if(t>4.4){mEyeK(R,1.8,1);mR(R,'tail',0,.15*Math.sin(t*9));}if(mAt(o,t,4.6))o.sfx('sob');}}},
  // 흰올빼미 — flies in and lands; touches with a wing tip; wings-wide display and a flight circle when it wins; puffs up and turns its head away when it loses
  owl:{med:'ice',k0:1,cw:2.6,g:0,om:{head:11,wL2:12,wR2:12},build(R){const W=[.97,.97,.96],D=[.24,.21,.18],bar=(d,k,ph)=>Math.sin(d[1]*k+Math.sin(d[0]*7+ph)*1.3)>.8&&d[2]<.55?D:W;
      const bd=mJ(R,'body',mG(0,.1,0));R.root.add(bd);
      // snowy owl: thick white plumage with dark bars, a round head with a facial disc, big yellow eyes, the beak half hidden in bristles, feathered feet, wings of real flight feathers
      mFur(bd,mEll([0,.36,0],[.3,.37,.29],d=>bar(d,24,0),28,d=>1+.06*Math.max(0,-d[1])),1.9,1.15,.03);
      const fan=[];for(let i=-2;i<=2;i++){const g=mFin([[0,0],[.03,-.03],[.026,-.24],[0,-.27],[-.026,-.24],[-.03,-.03]],.008,W);const p=g.attributes.position,cc=g.attributes.color;for(let k=0;k<p.count;k++)if(Math.sin(p.getY(k)*42)>.6)cc.setXYZ(k,D[0],D[1],D[2]);g.rotateZ(i*.18);g.rotateX(1.2);g.translate(0,.15,-.24);fan.push([g,null]);}
      bd.add(mMesh(fan,MS_M.feather));
      const hd=mJ(R,'head',mG(0,.69,.02));bd.add(hd);const hg=mEll([0,.15,0],[.27,.24,.2],d=>d[2]>.35&&d[1]>-.5?W:bar(d,30,1),26),fd=mEll([0,.13,.1],[.21,.18,.12],W,20);
      const eP=mEyeG(hd,R,fd,[.085,.175,.6],[.085,.175,0],.046,[1,.8,.1],.5,{r:[.06,.05,.05],c:W,i:.96,o:[.78,.7],p:{h:.5,e:.15,s:1.3,d:.5,w:.06}},.55,.15);
      mFur(hd,hg,1.6,.75,.025,mKeep(eP,.064,.1));mFur(hd,fd,1.2,.5,.02,mKeep(eP,.062,.095));
      const bk=mHorn(.07,.03,[.12,.11,.11],0,8);bk.rotateX(Math.PI/2+.75);bk.translate(0,.1,.215);hd.add(mMesh([[bk,null]],MS_M.skin));
      for(const s of[1,-1]){const n=s>0?'wL':'wR',a=mJ(R,n,mG(s*.27,.6,-.04));a.rotation.set(.12,0,s*.05);bd.add(a);
        const f1=mFin([[0,.03],[.1,-.02],[.14,-.24],[.02,-.31],[-.07,-.15],[-.06,0]],.025,W),p1=f1.attributes.position,c1=f1.attributes.color;for(let k=0;k<p1.count;k++)if(Math.sin(p1.getY(k)*38+p1.getX(k)*20)>.75)c1.setXYZ(k,D[0],D[1],D[2]);f1.rotateY(Math.PI/2);a.add(mMesh([[f1,null]],MS_M.feather));
        const b=mJ(R,n+'2',mG(0,-.28,0));b.rotation.x=2.75;a.add(b);const pr=[];for(let i=0;i<7;i++){const L=.37-i*.022,g=mFin([[0,0],[.022,-.03],[.026,-L*.8],[0,-L],[-.022,-L*.8],[-.018,-.03]],.007,W),p=g.attributes.position,cc=g.attributes.color;
          for(let k=0;k<p.count;k++)if(p.getY(k)<-.15&&Math.sin(p.getY(k)*50+i)>.4)cc.setXYZ(k,D[0],D[1],D[2]);g.rotateY(Math.PI/2);g.rotateX(i*.045);g.translate(-.003*i,0,.01-i*.007);pr.push([g,null]);}
        b.add(mMesh(pr,MS_M.feather));const tp=mG(0,-.37,0);b.add(tp);R.tips[s>0?'L':'R']=tp;R.iks[s>0?'L':'R']=[bd,a,b];
        const ft=mJ(R,s>0?'fL':'fR',mG(s*.12,0,.08));R.root.add(ft);mFur(ft,mEll([0,.05,.02],[.075,.055,.095],W,12),.5,.25,.025);ft.add(mMesh(mClaws(3,.035,.06,.1,.02,[.06,.05,.05]),MS_M.skin));}
      R.head=hd;R.sph=[[bd,[0,.36,0],.33],[hd,[0,.15,0],.27]];},
    idle(R,t){mR(R,'head',0,.9*Math.sin(t*.55)*Math.min(1,Math.abs(Math.sin(t*.55))*2));mBlink(R,t*.6,.4);},
    unf(R,k,n){mR(R,n||'wL2',-2.75*k);if(!n)mR(R,'wR2',-2.75*k);},
    fly(R,t,k){const f=Math.sin(t*15);MS_SP.owl.unf(R,k);mR(R,'wL',-.2*k,0,(1.2+1.0*f)*k);mR(R,'wR',-.2*k,0,-(1.2+1.0*f)*k);mR(R,'wL2',-.5*f*k,0,.3*f*k);mR(R,'wR2',-.5*f*k,0,-.3*f*k);mR(R,'body',.35*k);
      for(const n of['fL','fR'])R.j[n].position.y+=.05*k;},
    enter(R,t,o){const S=MS_SP.owl,u=o.u,k=1-mWin(u,.86,.97);R.off.z=-o.d*1.1;R.off.y=k*(.2+1.8*(1-u)+.1*Math.sin(t*15));S.fly(R,t,k);
      if(u>.86&&u<1){const b=mBmp(u,.86,1);MS_SP.owl.unf(R,b);mR(R,'wL',0,0,1.6*b);mR(R,'wR',0,0,-1.6*b);}if(mAt(o,t,1.95))o.fx('snow',R.root,[0,0,0]);mBlink(R,t);},
    touch(R,t,o){MS_SP.owl.unf(R,o.u,o.L?'wL2':'wR2');mR(R,o.L?'wL':'wR',-1.5*o.u,0,o.s*.5*o.u);mR(R,'head',0,0,o.s*.25*o.u);mBlink(R,t);},
    bow(R,o){const b=Math.sin(o.u*mPI);mR(R,'body',.35*b);mR(R,'head',.25*b);mR(R,'wL',0,0,.4*b);mR(R,'wR',0,0,-.4*b);},
    wave(R,t){MS_SP.owl.unf(R,1,'wR2');mR(R,'wR',0,0,-1.6-.5*Math.sin(t*12));mR(R,'wR2',0,0,-.4);mBlink(R,t);},
    win(R,t,o){const S=MS_SP.owl;
      if(t<1.0){const u=mWin(t,0,.3);MS_SP.owl.unf(R,u);mR(R,'wL',0,0,2.1*u);mR(R,'wR',0,0,-2.1*u);mR(R,'wL2',0,0,.4*u);mR(R,'wR2',0,0,-.4*u);R.off.s=1+.08*u;mR(R,'head',-.2*u);if(mAt(o,t,.3))o.sfx('hoot');}
      else if(t<3.3){const u=(t-1.0)/2.3,a=u*TAU,k=mWin(t,1.0,1.3)*(1-mWin(t,3.0,3.3));R.off.x=o.side*(1-Math.cos(a))*.7*k;R.off.z=-Math.sin(a)*.6*k;R.off.y=1.3*k+.08*Math.sin(t*15);R.off.ry=o.side*a*k;R.off.rz=-o.side*.35*k;S.fly(R,t,k);}
      else if(t<4.5){const u=mWin(t,3.3,4.5);mR(R,'head',0,Math.sin(u*mPI)*4.2);if(mAt(o,t,4.3))o.sfx('hoot');}
      else{const u=mWin(t,4.5,4.8);MS_SP.owl.unf(R,u);mR(R,'wL',0,0,2.0*u);mR(R,'wR',0,0,-2.0*u);mR(R,'head',0,0,.15*Math.sin(t*5)*u);if(mAt(o,t,4.9))o.sfx('hoot');}
      mBlink(R,t);},
    lose(R,t,o){
      if(t<.8){const u=mWin(t,0,.5);R.off.s=1+.16*u;R.j.body.scale.set(1+.08*u,1-.06*u,1+.08*u);mEyeK(R,mL(1,.45,u));}
      else{R.off.s=1.16;R.j.body.scale.set(1.08,.94,1.08);const a=mWin(t,.8,1.2),pk=mBmp(t,2.5,3.6);mR(R,'head',0,mPI*.95*a-1.2*pk);mEyeK(R,pk>.3?.9:.45);
        if(mAt(o,t,.9))o.sfx('growl');if(t>3.6){mR(R,'wL',0,0,-.2);mR(R,'wR',0,0,.2);R.j.body.scale.y*=.95;mEyeK(R,.5);if(mAt(o,t,4.5))o.sfx('sob');}}}},
  // 정어리 떼 — a sardine school boils up in its hole; the leader pokes its snout out to touch; the whole school leaps when it wins; it scatters and dives away under the ice when it loses
  fish:{med:'water',k0:1.15,pool:1.1,cw:2.4,g:0,gt:1.2,ty:.12,om:{tail:12},
    geo(){const k='g'+pkLo();if(this[k])return this[k];
      const col=(u,v,up,sd)=>{if(up>.42)return mMix([.16,.34,.42],[.36,.55,.6],mSm((.8-up)/.38));if(up>.2&&v>.3&&v<.82&&Math.abs(((v-.3)/.065)%1-.5)<.2&&Math.abs(sd)>.5)return [.12,.16,.2];
        if(v>.79&&v<.82&&up<.35)return [.55,.6,.64];return up>-.45?[.86,.89,.92]:[.97,.97,.98];};
      const body=mRev(-.13,.155,v=>pkLook([[0,.006],[.08,.012],[.3,.026],[.55,.031],[.75,.028],[.9,.02],[.97,.011],[1,.002]],v),col,.72,1,18,22),L=[[body,null]];
      for(const s of[1,-1])L.push([mEll([s*.0135,.006,.118],[.0055,.0068,.0068],d=>Math.abs(d[0])>.55?[.02,.02,.03]:[.78,.74,.58],8),null]);
      const df=mFin([[-.03,0],[.025,0],[-.005,.028],[-.025,.024]],.002,[.3,.42,.48]);df.rotateY(-Math.PI/2);df.translate(0,.027,.02);L.push([df,null]);
      for(const s of[1,-1]){const g=mFin([[0,0],[.006,-.004],[.004,-.025],[-.004,-.02]],.0015,[.75,.78,.82]);g.rotateY(Math.PI/2);g.rotateX(-.9);g.rotateZ(s*.5);g.translate(s*.016,-.012,.085);L.push([g,null]);}
      const tail=mFin([[0,.008],[-.02,.012],[-.058,.042],[-.046,.012],[-.036,0],[-.046,-.012],[-.058,-.042],[-.02,-.012],[0,-.008]],.002,[.32,.44,.52]);tail.rotateY(-Math.PI/2);
      const all=mMergeUV([...L,[tail.clone().translate(0,0,-.125),null]]);return this[k]={body:mMergeUV(L),tail,all};},
    build(R){const bd=mJ(R,'body',mG(0,0,0));R.root.add(bd);
      // ~28 silver sardines (dark blue-green backs, a row of dark spots, white bellies) that boil at the surface; one of them, the leader, greets
      const F=MS_SP.fish.geo(),n=pkLo()?16:28,im=new mT.InstancedMesh(F.all,MS_M.fishM,n);im.frustumCulled=false;bd.add(im);
      mRs=59;const P=[];for(let i=0;i<n;i++)P.push({a:i/n*TAU+mRnd()*.5,r:.14+mRnd()*.32,h:mRnd(),w:1.2+mRnd()*.9,ph:mRnd(),s:1.15+mRnd()*.4,lf:.35+mRnd()*.3});R.ex.sch={im,n,P};
      const ld=mJ(R,'lead',mG(.3,0,0));ld.scale.setScalar(1.4);bd.add(ld);ld.add(new mT.Mesh(F.body,MS_M.fishM));const tl=mJ(R,'tail',mG(0,0,-.125));ld.add(tl);tl.add(new mT.Mesh(F.tail,MS_M.fishM));
      const tp=mG(0,0,.157);ld.add(tp);R.tips={L:tp,R:tp};ld.add(mJ(R,'mouth',mG(0,0,.15)));
      R.head=mJ(R,'head',mG(0,.3,0));bd.add(R.head);R.sph=[[ld,[0,0,0],.08]];},
    // the school: every fish circles the middle at its own radius and speed, half out of the water; k = how much it leaps (each fish on its own beat),
    // sc = how far they spread, y = depth, sp = speed, cx = where the middle is; f(i, p) can move one fish (p = [x, y, z, yaw, pitch])
    sch(R,t,o,q){const S=R.ex.sch,M=mM4,p=[0,0,0,0,0];q=q||{};const sc=q.sc==null?1:q.sc,sp=q.sp==null?1:q.sp,lk=q.k==null?.25:q.k,cx=q.cx||0;
      if(o.dt>0&&o.dt<.2)S.t=(S.t||0)+o.dt*sp;const T=o.dt>0?S.t:t*sp;   // the swim keeps its place when the speed changes (no jumps between moves)
      for(let i=0;i<S.n;i++){const f=S.P[i],a=f.a+T*f.w,r=f.r*sc;p[0]=cx+Math.cos(a)*r;p[2]=Math.sin(a)*r*.8;p[1]=(q.y||0)+.008*Math.sin(t*3+i);p[3]=Math.atan2(-Math.sin(a),Math.cos(a)*.8)+.18*Math.sin(t*14+i*2);p[4]=0;
        const lq=(t*f.lf+f.ph)%1;if(lq<.22*lk){const u=lq/(.22*lk);p[1]+=mArc(u,.22+.18*f.h);p[4]=mL(-.9,.9,u);if(mAt(o,t,t-(lq-.002)/f.lf)||u<.06&&o.n%9===i%9)o.splash(R,p[0]*R.k0,p[2]*R.k0,.18);}
        if(q.f)q.f(i,p,f);mE1.set(p[4],p[3],.3*Math.sin(t*9+i),'YXZ');mQ1.setFromEuler(mE1);M.compose(mV1.set(p[0],p[1],p[2]),mQ1,mV2.setScalar(f.s));S.im.setMatrixAt(i,M);}
      S.im.instanceMatrix.needsUpdate=true;},
    // the leader at (x, y, z) heading yaw, pitched up / down (pitch), its tail beating at w
    lead(R,t,x,y,z,yaw,pitch,w){const l=R.j.lead;l.position.set(x,y,z);l.rotation.set(-pitch,yaw,0,'YXZ');mR(R,'tail',0,.4*Math.sin(t*(w||12)));},
    idle(R,t,o){const S=MS_SP.fish;o=o||{n:0,dt:0,splash:mNop};S.sch(R,t,o,{cx:-.1});S.lead(R,t,.32,.0,.1,mPI/2+.2*Math.sin(t*1.3),.0,10);},
    enter(R,t,o){const S=MS_SP.fish,u=mWin(t,.35,1.6);S.sch(R,t,o,{y:mL(-.5,0,u),k:u>.9?.6:0,sp:1.6-.6*u,sc:.6+.4*u,cx:-.1});S.lead(R,t,.32,mL(-.5,0,u),.1,mPI/2,0,16);
      if(mAt(o,t,1.0)||mAt(o,t,1.35))o.sfx('plop');if(t>.5&&t<1.6&&o.n%5==0)o.splash(R,mL(-.4,.4,mRnd()),mL(-.3,.3,mRnd()),.35);},
    // greeting: the leader stands up in the water and pokes its snout out; the school boils below it
    touch(R,t,o){const S=MS_SP.fish;S.sch(R,t,o,{k:.15,cx:-o.s*.12,sp:1.3});const u=o.u;S.lead(R,t,o.s*.42,mL(0,-.055,u),.1,mL(mPI/2,o.s*.3,u),mL(0,1.45,u),18);if(u>.5&&o.n%5==0)o.splash(R,o.s*.42*R.k0,.1,.15);},
    bow(R,o){const S=MS_SP.fish,b=Math.sin(o.u*mPI);S.sch(R,o.u*2+8,o,{k:0,sp:.6,y:-.03*b});S.lead(R,o.u*2,.35,-.15*b,.12,mPI/2,-1.2*b,10);},
    wave(R,t,o){const S=MS_SP.fish;S.sch(R,t,o,{k:.5,sp:1.4});const q=(t*1.2)%1;S.lead(R,t,.35,q<.4?mArc(q/.4,.3):0,.1,mPI/2,q<.4?mL(-.9,.9,q/.4):0,14);},
    win(R,t,o){const S=MS_SP.fish;
      // a wave of leaps runs round the school, then they bunch into a fast bait ball while the leader leaps high, then everyone leaps at once
      if(t<2.4){S.sch(R,t,o,{k:1.2,sp:1.5,cx:-.05});const q=(t*.9)%1;S.lead(R,t,.32,q<.45?mArc(q/.45,.45):0,.1,mPI/2,q<.45?mL(-1,1,q/.45):0,16);if(mAt(o,t,.3)||mAt(o,t,1.4))o.sfx('plop');}
      else if(t<3.8){const u=mWin(t,2.4,2.8);S.sch(R,t,o,{k:.2,sp:1+1.6*u,sc:1-.35*u});const q=(t-2.6)/.9;S.lead(R,t,mL(.32,0,u),q>0&&q<1?mArc(q,.75):0,.05,mPI/2+q*mPI,q>0&&q<1?mL(-1.2,1.2,q):0,20);if(mAt(o,t,2.62)||mAt(o,t,3.48)){o.splash(R,0,0,.6);o.sfx('splash');}}
      else{const u=mWin(t,3.8,4.0);S.sch(R,t,o,{k:2.4*u,sp:1.4,f:(i,p,f)=>{const q=((t-3.8)*.8+f.ph*.3)%1;if(q<.35){p[1]+=mArc(q/.35,.32+.15*f.h)*u;p[4]=mL(-.9,.9,q/.35);}}});S.lead(R,t,.32,mArc(((t-3.8)*.9)%1/.45,.4)*((t-3.8)*.9%1<.45?1:0),.1,mPI/2,0,16);
        if(o.n%3==0)o.splash(R,mL(-.4,.4,mRnd()),mL(-.3,.3,mRnd()),.3);if(mAt(o,t,3.85))o.sfx('splash');}},
    lose(R,t,o){const S=MS_SP.fish;
      // startled: the school bunches, then bursts outwards and dives away under the ice; the leader and a few stragglers are left circling slowly, with a few bubbles
      if(t<.7){S.sch(R,t,o,{k:0,sc:1-.4*mWin(t,0,.6),sp:2.2});S.lead(R,t,.3,0,.1,mPI/2,0,20);}
      else if(t<2.6){const u=mWin(t,.7,2.2);S.sch(R,t,o,{k:0,sp:1.2,f:(i,p,f)=>{if(i<5){p[0]*=.75;p[2]*=.75;return;}const d=u*(1.4+f.h);p[0]*=1+d*1.8;p[2]*=1+d*1.8;p[1]=-.4*u;p[4]=-.6*u;p[3]+=mPI/2*u;}});S.lead(R,t,.3,0,.1,mPI/2+.3*u,0,14);
        if(mAt(o,t,.75)){o.splash(R,0,0,.9);o.sfx('splash');o.shake(.15);}if(o.n%6==0&&u<.6)o.splash(R,mL(-.5,.5,mRnd()),mL(-.4,.4,mRnd()),.25);}
      else{S.sch(R,t,o,{k:0,sp:.35,f:(i,p)=>{if(i<5){p[0]*=.75;p[2]*=.75;p[4]=-.08;}else p[1]=-.8;}});const u=mWin(t,2.6,3.4);S.lead(R,t*.4,.3-.15*u,0,.12,mPI/2+.5*Math.sin(t*.6)*u,-.12*u,4);if(o.n%12==0)o.fx('bubble',R.j.mouth);if(mAt(o,t,4.2))o.sfx('sob');}}},
  // 일각고래 — leaps in; spy-hops (horn to the sky) to touch with a fin; shows itself off when it wins; thrashes its horn wildly when it loses
  narwhal:{med:'water',k0:.85,pool:1.3,cw:2.8,g:0,gt:1.25,om:{tail:14,t2:10,t3:8,fluke:7,pfL:12,pfR:12,horn:16},build(R){const dk=[.36,.39,.45],base=[.6,.63,.68],lt=[.9,.9,.89],col=(u,v,up)=>up<-.35?lt:up<-.05?mMix(base,lt,mSm((-.05-up)/.3)):mMix(base,dk,mSm(up));
      const bd=mJ(R,'body',mG(0,-.05,0));R.root.add(bd);
      // narwhal: mottled grey back fading to a pale belly, a blunt rounded head, no dorsal fin (a low ridge), a long left-hand spiral tusk, tiny eyes
      const bg=mRev(-.3,1.02,v=>pkLook([[0,.3],[.06,.38],[.3,.43],[.6,.42],[.8,.38],[.9,.33],[.95,.27],[.985,.17],[1,.02]],v),col,1,.95),bm=new mT.Mesh(bg,MS_M.narw);bd.add(bm);
      bd.add(mMesh([0,1,2,3].map(i=>[mEll([0,.38-.01*i,-.05-i*.12],[.03,.025,.05],dk,8),null]),MS_M.skin));
      const tl=mJ(R,'tail',mG(0,0,-.3));bd.add(tl);tl.add(new mT.Mesh(mRev(-1.1,.22,v=>pkLook([[0,.06],[.13,.09],[.42,.22],[.72,.36],[.86,.38],[1,.32]],v),col,1,.95,28,40),MS_M.narw));
      tl.children[0].userData.ch=['tail','t2','t3','fluke'];const t2=mJ(R,'t2',mG(0,0,-.36));tl.add(t2);const t3=mJ(R,'t3',mG(0,0,-.36));t2.add(t3);tl.userData.own=.5;t2.userData.from=t3.userData.from='tail';t2.userData.share=.3;t3.userData.share=.25;const fl=mJ(R,'fluke',mG(0,0,-.36));t3.add(fl);for(const s of[1,-1]){const g=mFin([[0,.03],[s*.15,0],[s*.4,-.06],[s*.55,.05],[s*.5,-.2],[s*.1,-.09]],.03,dk);g.rotateX(Math.PI/2);fl.add(mMesh([[g,null]],MS_M.skin));}
      for(const s of[1,-1]){const p=mJ(R,s>0?'pfL':'pfR',mG(s*.3,-.2,.55));p.rotation.set(-.5,0,s*.85);bd.add(p);const g=mFin([[0,.03],[.08,-.03],[.1,-.2],[.12,-.28],[.04,-.3],[-.04,-.2],[-.05,-.07]],.03,dk,1);g.rotateY(Math.PI/2);p.add(mMesh([[g,null]],MS_M.skin));
        const tp=mG(0,-.3,0);p.add(tp);R.tips[s>0?'L':'R']=tp;R.iks[s>0?'L':'R']=[p];}
      const hn=mJ(R,'horn',mG(.07,.06,.97));hn.rotation.x=Math.PI/2-.16;bd.add(hn);hn.add(mMesh([[mHorn(1.55,.055,(u,v)=>{const q=.8+.12*v+.05*Math.sin(u*TAU*2+v*60);return [q,q*.96,q*.84-.08*(1-v)];},60,24),null]],MS_M.ivory));
      const ht=mG(0,1.55,0);hn.add(ht);R.ex.horn=hn;R.ex.hornTip=ht;
      mEyeG(bd,R,bg,[.6,0,.7],[0,0,.7],.016,[.2,.13,.09],.4,{r:[.05,.05,.06],c:base,o:[.42,.36]},.45,.2);
      R.head=mJ(R,'head',mG(0,.1,.75));bd.add(R.head);const bh=mG(0,.36,.55);bd.add(bh);R.ex.spout=bh;R.sph=[[bd,[0,0,.35],.4],[bd,[0,.05,.8],.3]];},
    idle(R,t){R.off.y=.035*Math.sin(t*1.5);mSwim(R,t,.75,.6);mBlink(R,t,.8);},
    spy(R,k,h){mR(R,'body',-1.3*k);R.off.y+=(h==null?.5:h)*k;mR(R,'tail',.25*k);},
    enter(R,t,o){
      if(t<.3)R.off.y=-2.6;
      else if(t<1.9){const u=(t-.3)/1.6,i=u<.5?0:1,f=(u-i*.5)*2;R.off.z=mL(-1.05,.05,u);R.off.y=mArc(f,.75)-.2;mR(R,'body',mL(-.85,.85,f));mSwim(R,t,1.4,.8);
        if(mAt(o,t,.32)||mAt(o,t,1.1)||mAt(o,t,1.88)){o.splash(R,0,0,.9);o.sfx('splash');}}
      else{mSwim(R,t,1,1);}mBlink(R,t);},
    touch(R,t,o){if(o.low){R.off.rz=o.s*.55*o.u;R.off.y=-.04*o.u;}else MS_SP.narwhal.spy(R,o.u);mSwim(R,t,.6,.3);mR(R,o.L?'pfL':'pfR',-1.0*o.u,0,-o.s*.35*o.u);mBlink(R,t);},
    // a horned whale salutes instead of nodding (a nod would point the horn at the partner): spy-hop, horn up, a little dip of the whole body
    bow(R,o){const b=Math.sin(o.u*mPI);MS_SP.narwhal.spy(R,b,.35);R.off.y-=.18*Math.sin(o.u*mPI*2)*b;mR(R,'pfL',0,0,.5*b);mR(R,'pfR',0,0,-.5*b);},
    wave(R,t){MS_SP.narwhal.spy(R,1,.4);mR(R,'pfR',-.4,0,-.5-.45*Math.sin(t*10));mBlink(R,t);},
    win(R,t,o){const S=MS_SP.narwhal;
      if(t<1.2){const u=mWin(t,0,.5);S.spy(R,u,.95);mR(R,'body',.18*u);mR(R,'pfL',0,0,.9*u);mR(R,'pfR',0,0,-.9*u);mEyeK(R,mL(1,.55,u));if(mAt(o,t,.5)){o.sfx('chime');}if(t>.45&&o.n%2==0)o.fx('drip',R.ex.hornTip,[0,-.4,0]);}
      else if(t<2.6){const u=(t-1.2)/1.4;S.spy(R,1,.95);R.off.ry=mSm(u)*TAU*2;R.off.rz=.22*Math.sin(u*TAU*2);R.off.rx=.12*Math.cos(u*TAU*2);mR(R,'pfL',0,0,1.0);mR(R,'pfR',0,0,-1.0);if(o.n%2==0)o.fx('drip',R.ex.hornTip,[0,-.4,0]);
        if(o.n%5==0)o.splash(R,0,0,.25);}
      else if(t<3.8){const u=(t-2.6)/1.2;R.off.x=mL(-.6,.6,u);R.off.ry=-mPI/2;R.off.y=mArc(u,1.3)-.15;mR(R,'body',mL(-1.1,1.1,u));mSwim(R,t,1.8,1);if(mAt(o,t,2.62)||mAt(o,t,3.75)){o.splash(R,0,0,1.2);o.sfx('splash');}}
      else{const u=mWin(t,3.8,4.2);S.spy(R,u,.9);R.off.x=.6*(1-u);mR(R,'body',.15*u);mR(R,'pfL',0,0,.7*u);mR(R,'pfR',.0,0,-(.6+.35*Math.sin(t*9))*u);R.off.rz=.12*Math.sin(t*2.5)*u;if(o.n%3==0)o.fx('drip',R.ex.hornTip,[0,-.4,0]);if(t>4.6){mEyeK(R,.15,1);mR(R,'body',0,0,0);}if(mAt(o,t,4.7))o.sfx('chime');}
      mBlink(R,t);},
    lose(R,t,o){const S=MS_SP.narwhal;
      if(t<.6){const u=mWin(t,0,.3);S.spy(R,u*.6,.4);mEyeK(R,1.3);}
      else if(t<3.4){const k=mWin(t,.6,.8)*(1-mWin(t,3.2,3.4));S.spy(R,.55,.42);const a=Math.sin((t-.6)*3.1*TAU),b=Math.sin((t-.6)*2.6*TAU+1);
        R.off.rz=.75*a*k;R.off.ry=.6*b*k;mR(R,'body',.2*Math.sin((t-.6)*4.4*TAU)*k);mR(R,'pfL',0,0,(.6+.8*a)*k);mR(R,'pfR',0,0,-(.6-.8*a)*k);mR(R,'tail',.5*Math.sin(t*20)*k);
        mEyeK(R,.6);if(o.n%2==0)o.splash(R,mL(-.5,.5,mRnd()),mL(-.2,.6,mRnd()),.5*k);if(Math.sin((t-o.dt-.6)*3.1*TAU)*a<0){o.sfx('splash');o.shake(.18);}}
      else{const u=mWin(t,3.4,4.0);R.off.y=mL(-.05,-.22,u)+.025*Math.sin(t*14);mR(R,'body',.28*u);mR(R,'pfL',0,0,-.2*u);mR(R,'pfR',0,0,.2*u);mEyeK(R,.45);
        if(t>4.6&&t<5.2){R.off.rz=.3*mBmp(t,4.6,5.2);}if(mAt(o,t,4.3))o.sfx('sob');if(o.n%9==0)o.fx('bubble',R.head);}}},
  // 눈꽃 — floats down in a snowfall; touches with a crystal arm; spins, grows its arms and flips when it wins; melts into a puddle when it loses
  flake:{med:'air',k0:1,cw:2.2,g:0,flat:1,build(R){const I=[.84,.93,1],I2=[.97,.99,1],bd=mJ(R,'body',mG(0,1.15,0));R.root.add(bd);
      // a stellar dendrite: a ridged hexagonal plate and six fern-like arms (branches on branches) of clear ice that catch the light — no face
      const hx=new mT.CylinderGeometry(.16,.16,.03,6);hx.rotateX(Math.PI/2);hx.rotateZ(Math.PI/6);const L=[[hx,I2]];for(let k=0;k<6;k++){const q=new mT.BoxGeometry(.012,.12,.04);q.translate(0,.08,0);q.rotateZ(k*mPI/3);L.push([q,I]);}
      bd.add(mMesh(L,MS_M.crystal));const rg=mJ(R,'ring',mG());bd.add(rg);
      const arm=[[mFin([[0,0],[.022,.03],[.016,.56],[0,.64],[-.016,.56],[-.022,.03]],.014,I),null]];
      for(const [y,l] of[[.14,.18],[.25,.16],[.36,.13],[.46,.09]])for(const s of[1,-1]){const b=mFin([[0,0],[.012,.02],[.008,l*.9],[0,l],[-.008,l*.9],[-.012,.02]],.01,I2);
        for(const t of[.35,.65]){const q=mFin([[0,0],[.006,.01],[0,l*.32],[-.006,.01]],.008,I2);q.rotateZ(-s*1.05);q.translate(0,l*t,0);q.rotateZ(-s*mPI/3);q.translate(0,y,0);arm.push([q,null]);}
        b.rotateZ(-s*mPI/3);b.translate(0,y,0);arm.push([b,null]);}
      const ag=pkMerge(arm);for(let k=0;k<6;k++){const a=mJ(R,'a'+k,mG(Math.cos(k*mPI/3)*.16,Math.sin(k*mPI/3)*.16,0));a.rotation.z=k*mPI/3-mPI/2;rg.add(a);a.add(new mT.Mesh(ag,MS_M.crystal));const tp=mG(0,.64,0);a.add(tp);R.ex['tip'+k]=tp;}
      const pd=mJ(R,'puddle',new mT.Mesh(mWaterDisc(.55,28),MS_M.water));pd.userData.ns=1;pd.position.y=.01;pd.scale.setScalar(.001);R.root.add(pd);
      R.tips={L:R.ex.tip0,R:R.ex.tip3};R.iks={L:[rg],R:[rg]};R.head=bd;R.sph=[[bd,[0,0,0],.75]];},
    idle(R,t,o){R.off.y=.06*Math.sin(t*1.6);mR(R,'ring',0,0,t*.35);mR(R,'body',.08*Math.sin(t*1.1));if(o&&o.n%25==0)o.fx('sparkle',R.ex['tip'+(o.n/25%6|0)]);},
    enter(R,t,o){const u=mWin(t,.2,2.0);R.off.y=mL(5.5,0,1-Math.pow(1-u,2));mR(R,'ring',0,0,(1-u)*14+t*.4);R.off.rz=.3*Math.sin(t*3)*(1-u);if(mAt(o,t,2.0)){o.fx('sparkle',R.j.body,[0,0,0],12);o.sfx('chime');}},
    touch(R,t,o){R.off.y=.04*Math.sin(t*2);mR(R,'body',0,0,(o.side<0?-1:1)*.15*o.u);if(o.n%8==0)o.fx('sparkle',R.touch);},
    bow(R,o){const b=Math.sin(o.u*mPI);mR(R,'body',.55*b);mR(R,'ring',0,0,o.u*mPI/3);},
    wave(R,t,o){mR(R,'ring',0,0,t*3);R.off.y=.08*Math.sin(t*4);},
    win(R,t,o){const S=MS_SP.flake;
      if(t<2.0){const u=t/2;mR(R,'ring',0,0,mSm(u)*TAU*4);R.off.y=.45*mSm(u);if(o.n%2==0)o.fx('sparkle',R.ex['tip'+(o.n%6)]);if(mAt(o,t,.1))o.sfx('chime');}
      else if(t<3.2){const u=mWin(t,2.0,2.5);R.off.y=.45;for(let k=0;k<6;k++)R.j['a'+k].scale.y=1+.38*u;if(mAt(o,t,2.2)){o.sfx('chime');o.flash();o.fx('sparkle',R.j.body,[0,0,0],16);}}
      else if(t<4.4){const u=(t-3.2)/1.2;R.off.y=.45;for(let k=0;k<6;k++)R.j['a'+k].scale.y=1.38;mR(R,'body',mSm(u)*TAU);mR(R,'ring',0,0,u*2);}
      else{R.off.y=.45+.06*Math.sin(t*3);for(let k=0;k<6;k++){R.j['a'+k].scale.y=1.38-.38*mWin(t,5.0,5.5);mR(R,'a'+k,0,0,.15*Math.sin(t*6+k));}if(o.n%3==0)o.fx('sparkle',R.ex['tip'+(o.n%6)]);}
      },
    lose(R,t,o){const S=MS_SP.flake;
      if(t<.8){R.off.x=.02*Math.sin(t*60);if(o.n%6==0)o.fx('drip',R.j.body,[0,-.2,0]);}
      else{const u=mWin(t,.8,3.6);R.off.y=-.62*u;R.off.s=1-.3*u;for(let k=0;k<6;k++){const a=R.j['a'+k],side=Math.cos(k*mPI/3+mPI/2);mR(R,'a'+k,0,0,side*.7*u);a.scale.y=1-.25*u;}
        R.j.puddle.scale.setScalar((.05+1.0*u)/R.off.s);R.j.puddle.position.y=(.012-R.off.y)/(R.off.s*R.k0);
        if(o.n%3==0&&t<3.8)o.fx('drip',R.ex['tip'+(o.n%6)]);if(mAt(o,t,4.4))o.sfx('sob');}}},
  // 빙산 — rises out of the water; leans its ice shelf against the other one; grows a crystal spire when it wins; cracks and calves when it loses
  berg:{med:'water',k0:.8,pool:1.2,cw:2.6,g:0,build(R){const bd=mJ(R,'body',mG(0,0,0));R.root.add(bd);
      // a real iceberg: steep fluted cliffs of blue-white ice with vertical streaks, an uneven snow-covered top, turquoise where the water washes it — no face, no arms
      const ber=(c,r,h,s,tp)=>{const g=new mT.CylinderGeometry(r*(tp||.8),r,h,pkLo()?16:26,pkLo()?5:9);const p=g.attributes.position,n=p.count,a=new Float32Array(n*3);
        for(let i=0;i<n;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const an=Math.atan2(z,x),cap=y>h/2-1e-4,rr=Math.hypot(x,z)/r,
            k=1+.15*Math.sin(an*3+s)+.09*Math.sin(an*7+s*2)+.05*Math.sin(an*17+s*5)+.05*Math.sin(y*11+an*4+s);x*=k;z*=k;
          if(cap)y+=h*(.12*(1-rr)+.06*Math.sin(x*9+s)*Math.sin(z*8))-.05*h;else if(y>h*.3)y+=.04*h*Math.sin(an*5+s);
          const Y=y+c[1],st=Math.sin(an*23+s*3)>.55?.06:0,q=Math.max(0,Math.min(1,(Y+.1)/1.4));p.setXYZ(i,x+c[0],Y,z+c[2]);
          a.set(cap||(y>h*.42&&mHash([x,y,z])>.5)?[.97,.99,1]:Y<.18?[.48,.8,.88]:[mL(.68,.86,q)-st,mL(.85,.95,q)-st*.4,mL(.95,1,q)],i*3);}
        g.setAttribute('color',new mT.BufferAttribute(a,3));g.computeVertexNormals();return g;};
      bd.add(mMesh([[ber([0,.55,0],.62,1.3,1),null],[ber([.48,.32,.12],.38,.85,2,.7),null],[ber([-.46,.27,.04],.4,.72,3,.75),null],[ber([.08,1.32,-.04],.22,.5,4,.45),null],[ber([0,-.12,0],.98,.32,5,.95),null]],MS_M.berg));
      const ck=mJ(R,'chunk',mG(-.42,.95,.12));bd.add(ck);ck.add(mMesh([[ber([0,0,0],.2,.42,6,.7),null]],MS_M.berg));
      for(const s of[1,-1]){const l=mJ(R,s>0?'lL':'lR',mG(s*.8,.42,.1));bd.add(l);l.add(mMesh([[ber([s*.1,0,0],.24,.16,5+s,.9),null]],MS_M.berg));const tp=mG(s*.32,.03,.06);l.add(tp);R.tips[s>0?'L':'R']=tp;}
      const sp=mJ(R,'spire',mG(-.1,1.45,0));bd.add(sp);sp.add(mMesh([[mHorn(.75,.14,(u,v)=>[.85+.15*v,.95,1],0,8),null]],MS_M.ice));sp.scale.setScalar(.001);
      R.head=mJ(R,'head',mG(0,.9,.4));bd.add(R.head);R.sph=[[bd,[0,.6,0],.75]];},
    idle(R,t){R.off.y=.035*Math.sin(t*1.2);R.off.rz=.03*Math.sin(t*.9);},
    enter(R,t,o){const u=mWin(t,.3,1.9);R.off.y=mL(-2.3,0,1-Math.pow(1-u,2))+.06*Math.sin(t*4)*u;R.off.rz=.08*Math.sin(t*3)*(1-u);if(mAt(o,t,.35)){o.sfx('crack');o.shake(.3);}
      if(t>.6&&t<1.9&&o.n%2==0)o.fx('cascade',R.root,[mL(-.7,.7,mRnd()),1.1*u,mL(-.5,.5,mRnd())]);if(mAt(o,t,1.85)){o.splash(R,0,0,1.2);o.sfx('splash');}},
    touch(R,t,o){R.off.rz=-o.s*.07*o.u;R.off.y=.02*Math.sin(t*1.5);if(o.u>.9&&o.n%9==0)o.fx('cascade',R.touch);},
    bow(R,o){const b=Math.sin(o.u*mPI);R.off.rx=.3*b;R.off.py=.2;if(b>.6&&o.n%6==0)o.fx('snow',R.j.body,[0,1.3,.3]);},
    wave(R,t,o){R.off.rz=.05*Math.sin(t*2);R.off.y=.05*Math.sin(t*3);if(o.n%7==0)o.fx('cascade',R.root,[mL(-.6,.6,mRnd()),.8,mL(-.4,.4,mRnd())]);},
    win(R,t,o){
      if(t<1.5){const u=mWin(t,0,.6);R.off.y=.5*u;R.off.rz=.1*Math.sin(t*5)*u;if(t>.2&&t<1.2&&o.n%3==0)o.fx('cascade',R.root,[mL(-.6,.6,mRnd()),.9,mL(-.4,.4,mRnd())]);}
      else if(t<3.0){R.off.y=.5;const u=mWin(t,1.5,2.4);R.j.spire.scale.setScalar(.001+u);if(mAt(o,t,1.6))o.sfx('chime');if(o.n%2==0&&u<1)o.fx('sparkle',R.j.spire,[0,.7*u,0]);if(mAt(o,t,2.4)){o.flash();o.fx('sparkle',R.j.spire,[0,.75,0],14);}}
      else if(t<4.4){R.j.spire.scale.setScalar(1);const b=Math.abs(Math.sin((t-3)*5));R.off.y=.5-.4*b;if(Math.sin((t-o.dt-3)*5)*Math.sin((t-3)*5)<0){o.splash(R,0,0,1);o.sfx('splash');o.shake(.25);}}
      else{R.j.spire.scale.setScalar(1);const u=mWin(t,4.4,4.7);R.off.y=.5+.04*Math.sin(t*2.5);R.off.ry=.35*u*Math.sin((t-4.4)*1.6);if(o.n%4==0)o.fx('sparkle',R.j.spire,[0,.75,0]);}
      },
    lose(R,t,o){
      if(t<.8){R.off.x=.02*Math.sin(t*70)*mWin(t,0,.3);if(mAt(o,t,.2)){o.sfx('crack');o.shake(.25);}}
      else if(t<2.6){const u=mWin(t,.8,2.3),c=R.j.chunk;c.position.x-=.3*u;c.position.y-=1.25*u*u;c.rotation.z+=1.4*u;c.rotation.x+=.6*u;if(mAt(o,t,1.0))o.sfx('crack');if(mAt(o,t,2.25)){o.splash(R,-.6,.2,1.3);o.sfx('splash');o.shake(.4);}}
      else{const c=R.j.chunk;c.position.x-=.3;c.position.y-=1.12;c.rotation.z+=1.4;c.rotation.x+=.6;c.position.y+=.03*Math.sin(t*2);const u=mWin(t,2.6,3.8);R.off.rz=.3*u;R.off.y=-.45*u+.03*Math.sin(t*1.5);if(mAt(o,t,4.2))o.sfx('sob');}}},
  // 번개 — a storm cloud gathers and strikes down; it greets with an electric arc; it calls down a ring of strikes when it wins; it rains itself out when it loses
  bolt:{med:'air',k0:1,cw:2.6,g:.6,flat:1,build(R){const mat=MS_M.cloudD.clone();R.ex.mat=mat;
      const bd=mJ(R,'body',mG(0,1.6,0));R.root.add(bd);const cl=mJ(R,'cloud',mG());bd.add(cl);
      // a real storm cloud: billowing puffs, dark grey underneath and lighter on top, a flat base; it lights up from inside when it flashes — no face
      const L=[],PF=[[0,0,0,.42],[.38,-.04,.05,.32],[-.4,-.05,0,.33],[.15,.2,-.02,.3],[-.18,.18,.05,.28],[.64,-.1,0,.2],[-.66,-.1,-.02,.21],[0,-.08,.25,.27],[.05,-.06,-.24,.28],[.32,.12,.2,.2],[-.3,.08,-.2,.22],[.1,.36,0,.2]];
      for(const [x,y,z,r] of PF)L.push([mEll([x,y,z],[r*1.15,r*.85,r],d=>{const k=mSm((y+d[1]*r*.85+.22)/.6);return [mL(.18,.66,k),mL(.2,.69,k),mL(.25,.76,k)];},16,
        d=>{let k=1+.14*(mHash([d[0]*3+x,d[1]*3,d[2]*3+z])-.5);if(d[1]<0)k=Math.min(k,(y+.24)/(r*.85*-d[1]));return Math.max(.05,k);}),null]);
      cl.add(mMesh(L,mat));
      // the greeting arc: a crackling filament from under the cloud to the touching point
      for(const s of[1,-1]){const a=mJ(R,s>0?'arcL':'arcR',mG(s*.38,-.24,.05));bd.add(a);a.rotation.z=s*.5;const pts=[];mRs=s>0?3:5;for(let i=0;i<=8;i++){const k=i/8;pts.push(mV(i&&i<8?(mRnd()-.5)*.12:0,-k*.95,i&&i<8?(mRnd()-.5)*.1:0));}
        const g=mG();for(let i=0;i<8;i++){for(const [rr,m] of[[.012,MS_M.boltCore],[.05,MS_M.boltGlow]]){const d=mV().subVectors(pts[i+1],pts[i]),c=new mT.Mesh(MS_CYL,m);c.scale.set(rr,d.length(),rr);c.position.copy(pts[i]).add(pts[i+1]).multiplyScalar(.5);c.quaternion.setFromUnitVectors(mV(0,1,0),d.normalize());c.userData.ns=1;g.add(c);}}
        a.add(g);a.scale.setScalar(.001);const tp=mG(0,-.95,0);a.add(tp);R.tips[s>0?'L':'R']=tp;R.iks[s>0?'L':'R']=[a];R.ex[s>0?'arcL':'arcR']=g;}
      R.head=mJ(R,'head',mG(0,-.1,.2));bd.add(R.head);R.sph=[[bd,[0,.05,0],.45]];},
    // flash = how much it lights up inside (0..1.5), lt = how pale it is (raining itself out)
    glow(R,v,lt){R.ex.mat.emissiveIntensity=v*.55;R.ex.mat.color.setScalar(lt||1);},
    churn(R,t){mR(R,'cloud',0,.25*Math.sin(t*.4),.03*Math.sin(t*.9));const s=1+.025*Math.sin(t*1.7);R.j.cloud.scale.set(s,1-.5*(s-1),s);},
    fl(t){const q=(t*.61)%1;return q<.03||Math.abs(q-.37)<.012?1.2:0;},
    idle(R,t,o){const S=MS_SP.bolt;o=o||{n:0};R.off.y=.04*Math.sin(t*.9);S.churn(R,t);S.glow(R,S.fl(t,o));},
    enter(R,t,o){const S=MS_SP.bolt,c=mWin(t,.05,.85);R.j.cloud.scale.setScalar(.15+.85*mSm(c));R.off.y=(1-mSm(c))*1.5;S.churn(R,t);
      S.glow(R,t>.95&&t<1.25?((t*30|0)%2?1.5:.4):S.fl(t,o)*.6,mL(1.6,1,c));if(mAt(o,t,1.0))o.strike(R,0,0);if(mAt(o,t,.2))o.sfx('thunder');},
    touch(R,t,o){const S=MS_SP.bolt;S.churn(R,t);const a=R.j[o.L?'arcL':'arcR'],g=R.ex[o.L?'arcL':'arcR'];if(o.u>.02){a.scale.setScalar(Math.max(.001,o.u));g.rotation.y=(o.n*2.4)%TAU;g.visible=o.n%5!==2;}
      S.glow(R,.25+.35*o.u*((o.n%3)?1:.4));if(o.u>.9&&o.n%3==0)o.fx('spark',R.touch);},
    bow(R,o){const S=MS_SP.bolt,b=Math.sin(o.u*mPI);R.off.y-=.15*b;R.off.rx=.18*b;S.churn(R,o.u*2);S.glow(R,.15*b);},
    wave(R,t,o){const S=MS_SP.bolt;S.churn(R,t*1.5);R.off.y=.05*Math.sin(t*3);S.glow(R,(o.n%9<2)?1:.1);},
    win(R,t,o){const S=MS_SP.bolt;S.churn(R,t*1.5);
      if(t<.6){S.glow(R,.3+(o.n%4<2?t*2:0));R.off.x=.015*Math.sin(t*60);R.j.cloud.scale.multiplyScalar(1+.12*t);if(mAt(o,t,.1))o.sfx('thunder');}
      else if(t<3.0){const i=Math.floor((t-.6)/.6),f=(t-.6)/.6-i;S.glow(R,f<.15?1.5:.3);R.j.cloud.scale.multiplyScalar(1.07);const SP=[[0,-1.0],[-1.0,.35],[.85,.5],[.2,1.0]];for(let k=0;k<4;k++)if(mAt(o,t,.6+k*.6))o.strike(R,SP[k][0],SP[k][1]);}
      else if(t<4.2){S.glow(R,o.n%3?1.3:.2);R.j.cloud.scale.multiplyScalar(1.12+.04*Math.sin(t*20));if(o.n%2==0)o.fx('spark',R.j.body,[mL(-.6,.6,mRnd()),-.3,mL(-.3,.3,mRnd())]);if(mAt(o,t,3.1))o.sfx('zap');if(mAt(o,t,3.9))o.strike(R,0,.2);}
      else{S.glow(R,S.fl(t,o)+.2);R.j.cloud.scale.multiplyScalar(1.07);R.off.y=.05*Math.sin(t*2);if(o.n%5==0)o.fx('spark',R.j.body,[mL(-.5,.5,mRnd()),-.3,mL(-.2,.2,mRnd())]);}},
    lose(R,t,o){const S=MS_SP.bolt;S.churn(R,t*.6);
      if(t<.6){S.glow(R,(t*20|0)%2?.05:.7);}
      else{const u=mWin(t,.6,3.6);S.glow(R,u<.8&&o.n%23==0?.6:0,mL(1,1.75,u));R.j.cloud.scale.multiplyScalar(1-.3*u);R.off.y=-.35*u;
        if(t<4.6)o.fx('rain',R.j.cloud,[mL(-.5,.5,mRnd()),-.2,mL(-.25,.25,mRnd())]);if(t<4&&o.n%2==0)o.fx('rain',R.j.cloud,[mL(-.4,.4,mRnd()),-.2,mL(-.2,.2,mRnd())]);
        if(t>3.4&&t<4.4&&o.n%5==0)o.fx('smoke',R.j.body,[mL(-.3,.3,mRnd()),.1,0]);if(mAt(o,t,3.7)){o.fx('spark',R.j.body,[0,-.3,0]);o.sfx('zap');}if(mAt(o,t,4.4))o.sfx('sob');}}}
};
// --- build one mascot (cached per team + kit + mascot) ---
function mBody(teamKey,_,mas){const S=MS_SP[mas],k=mKitOf(teamKey,mas),R={root:mG(),sp:mas,team:teamKey,j:{},eyes:[],ex:{},sph:[],tips:{},iks:{},tc:mCol(k.c1),acc:mCol(k.c2),k0:S.k0||1,med:S.med};
  mRs=7+KIT.mas.indexOf(mas)*13;S.build(R,k);if(!R.iks.L)R.iks=null;if(!R.ex.mouth)R.ex.mouth=mG();
  for(const n in R.j){const o=R.j[n];o.userData.r0=[o.position.clone(),o.rotation.clone(),o.scale.clone()];}
  for(const e of R.eyes)if(e.userData.pu)e.userData.pu0=e.userData.pu.position.clone();
  if(!MS_SOFT.size)for(const m of[PK_MAT.body,MS_M.skin,MS_M.sealM,MS_M.walM,MS_M.narw,MS_M.feather,MS_M.shade,MS_M.fishM])MS_SOFT.add(m);
  try{mSkin(R,S.pair);}catch(e){console.warn('mascot skin',e);}
  R.root.traverse(o=>{if(o.isMesh)o.castShadow=!o.userData.ns;});mRest(R);R.root.scale.setScalar(R.k0);return R;}
// one call per frame: the named animation at time t (o: side, u, d, n, dt and the effect hooks)
const mNop=()=>{};
function mPose(R,name,t,o){o=o||{};for(const k of['fx','sfx','splash','shake','flash','strike'])if(!o[k])o[k]=mNop;if(o.dt==null)o.dt=0;if(o.n==null)o.n=0;if(o.side==null)o.side=-1;if(o.u==null)o.u=0;if(o.d==null)o.d=0;const S=MS_SP[R.sp];mRest(R);o.L=o.side<0;o.s=o.L?1:-1;const sd=o.L?'L':'R';R.touch=R.tips[sd];R.ik=R.iks?R.iks[sd]:null;
  if(name==='draw'){if(t<2.2)S.touch(R,t,Object.assign({},o,{u:mWin(t,0,.3)*(1-mWin(t,1.9,2.2))}));else{S.idle(R,t,o);R.off.y+=mHop(t-2.2,2.5,.08)*(R.med==='ice'?1:.5);mEyeK(R,.4);}return;}
  if(name==='sig'){S.win(R,(S.g||0)+t,o);return;}
  if(name==='bow'){S.bow(R,o);return;}
  const f=S[name]||S.idle;f(R,t,o);}
// put the rig where the scene wants it (b: x, z, yaw) plus the animation's own offsets; px/py/pz = the point it turns around
const mE1=new mT.Euler(),mV1=mV(),mV2=mV(),mV3=mV(),mQ1=new mT.Quaternion(),mQ2=new mT.Quaternion(),mQ3=new mT.Quaternion();
function mPlace(R,b){const o=R.off,y=b.yaw||0,c=Math.cos(y),s=Math.sin(y),zk=b.zk==null?1:b.zk,k=R.k0*o.s;mE1.set(o.rx,o.ry,o.rz,'YXZ');mV1.set(o.px,o.py,o.pz).multiplyScalar(k).applyEuler(mE1);
  const lx=o.x+o.px*k-mV1.x,ly=o.y+o.py*k-mV1.y,lz=o.z*zk+o.pz*k-mV1.z;R.root.position.set((b.x||0)+c*lx+s*lz,(b.y||0)+ly,(b.z||0)-s*lx+c*lz);
  R.root.rotation.set(o.rx,y+o.ry,o.rz,'YXZ');R.root.scale.setScalar(k);}
// the greeting: move the touching tip to M — a limb bends (CCD over its chain; what it cannot reach, the feet shuffle across the ice),
// a swimmer / floater moves its whole body; k blends it in
function mTouchTo(R,M,k,lim,still){if(k<=0)return;R.root.updateMatrixWorld(true);
  if(R.ik){const ch=R.ik,pre=ch.map(b=>b.quaternion.clone());
    for(let it=0;it<10;it++)for(let i=ch.length-1;i>=0;i--){const b=ch[i];b.getWorldPosition(mV1);R.touch.getWorldPosition(mV2);mV2.sub(mV1);mV3.copy(M).sub(mV1);
      if(mV2.lengthSq()<1e-8||mV3.lengthSq()<1e-8)continue;mQ1.setFromUnitVectors(mV2.normalize(),mV3.normalize());b.getWorldQuaternion(mQ2);mQ2.premultiply(mQ1);b.parent.getWorldQuaternion(mQ3);b.quaternion.copy(mQ3.invert().multiply(mQ2));b.updateMatrixWorld(true);}
    if(k<1){ch.forEach((b,i)=>{mQ1.copy(b.quaternion);b.quaternion.copy(pre[i]).slerp(mQ1,k);});R.root.updateMatrixWorld(true);}
    if(still)return;R.touch.getWorldPosition(mV2);mV3.copy(M).sub(mV2).multiplyScalar(k);if(R.med==='ice')mV3.y=0;else{mV3.x=mV3.z=0;}if(mV3.lengthSq()>1e-6){R.root.position.add(mV3);if(lim)lim(R);R.root.updateMatrixWorld(true);}}
  else{R.touch.getWorldPosition(mV2);mV3.copy(M).sub(mV2).multiplyScalar(k);R.root.position.add(mV3);if(lim)lim(R);R.root.updateMatrixWorld(true);}}
// ---------------- the scenes ----------------
const MS_SESS={};   // matchups already shown in full this session → the short version next time
function mascMode(){const m=save.set.masc;return m==='short'||m==='off'?m:'full';}
function mascCan(cfg){if(window.__NOFX||(navigator.webdriver&&!window.PH_MASC))return false;
  if(!cfg||save.set.motion||mascMode()==='off'||cfg.tutorial||cfg.mode==='demo'||cfg.mode==='practice'||cfg.mode==='free'||(cfg.challenge&&!cfg.challenge.match))return false;
  return typeof WebGLRenderingContext!=='undefined';}
// my mascot and the other side's: online each player's own kit; offline the opponent's comes from its name (never the same as mine)
function mascPair(cfg){const mine=G.mine&&G.mine.key||save.team||'blue',oth=mine==='blue'?'red':'blue',my=(kit().mas)||'peng';let op=null;
  if(cfg&&cfg.net&&typeof NET!=='undefined'&&NET.peer&&NET.peer.kit)op=kitClean(NET.peer.kit).mas;
  if(!op||op===my){const key=String(cfg&&(cfg.oppName||cfg.label||cfg.tag||'')+'|'+((cfg&&cfg.oppTypes)||[]).join(','));let h=7;for(const ch of key)h=(h*31+ch.charCodeAt(0))>>>0;
    const L=KIT.mas.filter(m=>m!==my);op=L[h%L.length];}
  return {mine,oth,my,op};}
// effects (all purely visual)
const MS_CYL=new mT.CylinderGeometry(1,1,1,6,1),MS_SCG=new mT.CircleGeometry(.45,20).rotateX(-Math.PI/2);let MS_BOLTS=[],MS_SNOW=null;
function mascFx(k,p,n){const E=(c,f)=>{for(let i=0;i<c;i++)f();};n=n||1;
  if(k==='snow')E(9*n,()=>emit(p.x,p.y+.05,p.z,rnd(-1.6,1.6),rnd(.6,2.2),rnd(-1.6,1.6),rnd(.35,.6),rnd(.08,.16),.92,.97,1));
  else if(k==='splash')E(Math.round(26*n),()=>{const a=rnd(TAU),v=rnd(1.2,3.2)*Math.sqrt(n);emit(p.x+Math.cos(a)*.2,p.y+.08,p.z+Math.sin(a)*.2,Math.cos(a)*v,rnd(2.2,4.8)*Math.sqrt(n),Math.sin(a)*v,rnd(.5,.9),rnd(.1,.2),.62,.82,.98);});
  else if(k==='spout')E(Math.round(22*n),()=>emit(p.x,p.y,p.z,rnd(-.35,.35),rnd(4,6.2)*Math.sqrt(n),rnd(-.35,.35),rnd(.5,.9),rnd(.1,.18),.86,.94,1));
  else if(k==='fountain')E(3,()=>emit(p.x,p.y,p.z,rnd(-.3,.3),rnd(3.6,4.6),rnd(.4,.9),rnd(.5,.8),rnd(.06,.11),.7,.88,1));
  else if(k==='cascade')E(2,()=>emit(p.x,p.y,p.z,rnd(-.3,.3),rnd(-.5,.3),rnd(-.3,.3),rnd(.4,.7),rnd(.07,.13),.7,.88,1));
  else if(k==='bubble')E(2,()=>emit(p.x+rnd(-.1,.1),p.y,p.z+rnd(-.1,.1),0,rnd(2.2,3),0,rnd(.2,.32),rnd(.05,.09),.85,.95,1));
  else if(k==='sparkle')E(n,()=>emit(p.x,p.y,p.z,rnd(-.4,.4)*(n>1?3:1),rnd(.3,.9)*(n>1?3:1),rnd(-.4,.4)*(n>1?3:1),rnd(.5,.9),rnd(.06,.12),1,.95,.7));
  else if(k==='spark')E(3*n,()=>emit(p.x,p.y,p.z,rnd(-2.5,2.5),rnd(-1,2.5),rnd(-2.5,2.5),rnd(.15,.32),rnd(.05,.1),1,.85,.25));
  else if(k==='smoke')emit(p.x,p.y,p.z,rnd(-.15,.15),rnd(.4,.8),rnd(-.15,.15),rnd(.9,1.4),rnd(.18,.3),.45,.45,.48);
  else if(k==='rain')emit(p.x,p.y,p.z,0,rnd(-3,-2),0,rnd(.35,.5),rnd(.04,.07),.55,.7,.95);
  else if(k==='drip')emit(p.x,p.y,p.z,rnd(-.1,.1),rnd(-.4,0),rnd(-.1,.1),rnd(.5,.8),rnd(.05,.09),.7,.88,1);}
// a jagged lightning bolt from the sky to (x, z): flicker, a flash, thunder, a scorch mark on the ice, sparks
function mascStrike(x,z,top){const N=12,H=top?top.y-.22:9,pts=[],px=top?top.x+rnd(-.15,.15):x+rnd(-.9,.9),pz=top?top.z:z+rnd(-.6,.6);for(let i=0;i<=N;i++){const k=i/N,j=i&&i<N;pts.push(mV(mL(px,x,k)+(j?rnd(-.32,.32):0),H*(1-k),mL(pz,z,k)+(j?rnd(-.25,.25):0)));}
  const g=new mT.Group(),seg=(a,b,r,mat)=>{const d=mV().subVectors(b,a),L=d.length(),c=new mT.Mesh(MS_CYL,mat);c.scale.set(r,L,r);c.position.copy(a).add(b).multiplyScalar(.5);c.quaternion.setFromUnitVectors(mV(0,1,0),d.normalize());g.add(c);};
  for(let i=0;i<N;i++){seg(pts[i],pts[i+1],.035,MS_M.boltCore);seg(pts[i],pts[i+1],.13,MS_M.boltGlow);}
  let q=pts[3+(rnd(0,4)|0)].clone();for(let i=0;i<4;i++){const nq=q.clone().add(mV(rnd(-.5,.5),-rnd(.4,.8),rnd(-.4,.4)));seg(q,nq,.02,MS_M.boltCore);q=nq;}
  const sc=new mT.Mesh(MS_SCG,MS_M.scorch.clone());sc.position.set(x,.008,z);g.add(sc);scene.add(g);MS_BOLTS.push({g,t:0,sc});
  mascFx('spark',mV(x,.06,z),6);mascFx('snow',mV(x,0,z));mascFlash();try{SFX.msc('thunder');}catch(e){}if(G.masc)G.masc.shake=Math.max(G.masc.shake,.6);}
function mascBolts(dt){for(let i=MS_BOLTS.length-1;i>=0;i--){const b=MS_BOLTS[i];b.t+=dt;for(const c of b.g.children)if(c!==b.sc)c.visible=b.t<.3&&((b.t*30|0)%3!==1);
  b.sc.material.opacity=.55*(1-mWin(b.t,.7,1.8));if(b.t>1.9){scene.remove(b.g);b.sc.material.dispose();MS_BOLTS.splice(i,1);}}}
// a light snowfall around a point (the snowflake's scenes)
function mascSnow(dt,on,c){if(!MS_SNOW){const N=pkLo()?90:180,g=new mT.BufferGeometry(),p=new Float32Array(N*3);for(let i=0;i<N;i++){p[i*3]=rnd(-3.2,3.2);p[i*3+1]=rnd(0,5);p[i*3+2]=rnd(-2.6,2.6);}
    g.setAttribute('position',new mT.BufferAttribute(p,3));MS_SNOW=new mT.Points(g,new mT.PointsMaterial({color:0xffffff,size:.075,transparent:true,opacity:.9,depthWrite:false}));MS_SNOW.visible=false;MS_SNOW.frustumCulled=false;MS_SNOW.userData.k=0;scene.add(MS_SNOW);}
  const S=MS_SNOW,U=S.userData;U.k=Math.max(0,Math.min(1,U.k+(on?dt*1.2:-dt*2)));S.visible=U.k>.01;if(!S.visible)return;S.material.opacity=.9*U.k;
  const p=S.geometry.attributes.position;for(let i=0;i<p.count;i++){let y=p.getY(i)-dt*(.45+(i%5)*.1);if(y<0)y+=5;p.setY(i,y);p.setX(i,p.getX(i)+Math.sin(y*2+i)*dt*.18);}p.needsUpdate=true;if(c)S.position.set(c.x,0,c.z);}
// the hole in the ice for the sea animals and the iceberg: water, broken ice around the rim, cracks, ripples
function mascPool(R){if(R.pool)return R.pool;const r=MS_SP[R.sp].pool||1.2,g=new mT.Group();const w=new mT.Mesh(mWaterDisc(r,44),MS_M.water);w.position.y=.012;w.receiveShadow=true;g.add(w);
  mRs=31;const L=[];for(let i=0;i<24;i++){const a=i/24*TAU+mRnd()*.2,rr=r+mRnd()*.07,s=.07+mRnd()*.11,q=new mT.IcosahedronGeometry(s,0);q.scale(1,.42+mRnd()*.3,1+mRnd()*.6);q.rotateY(mRnd()*3);q.translate(Math.cos(a)*rr,s*.18,Math.sin(a)*rr);L.push([q,[.86,.94,1]]);}
  g.add(mMesh(L,MS_M.berg,false));const C=[];for(let i=0;i<10;i++){const a=mRnd()*TAU,len=.35+mRnd()*.8,q=new mT.PlaneGeometry(.02+mRnd()*.02,len);q.rotateX(-Math.PI/2);q.translate(0,.006,-(r+len/2-.05));q.rotateY(a);C.push([q,null]);}
  const cm=new mT.Mesh(pkMerge(C),MS_M.crack);g.add(cm);const rip=[];for(let i=0;i<4;i++){const q=new mT.Mesh(new mT.RingGeometry(.9,1,40).rotateX(-Math.PI/2),MS_M.ripple.clone());q.position.y=.02;q.visible=false;q.userData.a=9;g.add(q);rip.push(q);}
  g.userData={r,rip,cm,open:1};g.visible=false;scene.add(g);R.pool=g;return g;}
function mascRipple(P,wx,wz,s){const R=P.userData.rip.reduce((a,b)=>a.userData.a>b.userData.a?a:b);const k=P.scale.x||1;R.position.set((wx-P.position.x)/k,.02,(wz-P.position.z)/k);R.userData.a=0;R.userData.s=s||1;R.visible=true;}
function mascPools(dt){for(const k in MS_RIG){const P=MS_RIG[k].pool;if(!P||!P.visible)continue;const U=P.userData,o=Math.max(.001,U.open)*(U.base||1);P.scale.set(o,1,o);U.cm.material.opacity=.6*Math.min(1,U.open*1.5);
  for(const q of U.rip){const a=q.userData.a+=dt;q.visible=a<1.1;if(!q.visible)continue;const s=(.15+a*1.3)*q.userData.s;q.scale.set(s,1,s);q.material.opacity=.6*(1-a/1.1);}}}
let MS_RIG={};
// the team's colour: a soft ring of light on the ice under each mascot, round the hole for the sea animals (real animals wear no scarves)
const MS_RINGR={peng:.85,bear:1.45,fox:.85,owl:.8,seal:1.2,walrus:1.5,flake:.8,bolt:1.0};
function mascRing(R){if(R.ring)return R.ring;const c=new mT.Color(R.tc[0],R.tc[1],R.tc[2]),l=c.r*.3+c.g*.59+c.b*.11;if(l>.7)c.multiplyScalar(.7/l);
  const m=new mT.Mesh(new mT.PlaneGeometry(2,2).rotateX(-Math.PI/2),mPO(new mT.MeshBasicMaterial({map:MS_GLOW,color:c,transparent:true,opacity:.8,depthWrite:false}),-12));m.renderOrder=2;m.visible=false;scene.add(m);return R.ring=m;}
function mascRings(on){for(const k in MS_RIG){const R=MS_RIG[k],g=mascRing(R),P=R.pool;g.visible=!!on&&R.root.visible;if(!g.visible)continue;let s;
  if(P&&P.visible){g.position.set(P.position.x,.014,P.position.z);s=MS_SP[R.sp].pool*P.scale.x*1.62;}else{g.position.set(R.root.position.x,.014,R.root.position.z);s=(MS_RINGR[R.sp]||1)*R.k0;}g.scale.set(s,1,s);}}
function mascRig(key,team,mas){const k=team+mas+kitSig(mKitOf(team,mas))+pkLo();let R=MS_RIG[key];if(R&&R.k===k)return R;if(R){scene.remove(R.root);if(R.pool)scene.remove(R.pool);if(R.ring)scene.remove(R.ring);}
  R=mBody(team,null,mas);R.k=k;R.root.visible=false;scene.add(R.root);if(R.med==='water')mascPool(R);MS_RIG[key]=R;return R;}
function mascHideWorld(on){const L=[];for(const p of G.pengs||[])if(p.pg)L.push(p.pg.root);for(const o of[typeof puckG!=='undefined'&&puckG,typeof puckRing!=='undefined'&&puckRing,typeof puckTrail!=='undefined'&&puckTrail,typeof marker!=='undefined'&&marker,typeof markerRing!=='undefined'&&markerRing,typeof passRing!=='undefined'&&passRing,typeof comboRing!=='undefined'&&comboRing,typeof aimTgt!=='undefined'&&aimTgt,typeof aimLine!=='undefined'&&aimLine,typeof aimArrow!=='undefined'&&aimArrow])if(o&&o.isObject3D)L.push(o);
  for(const o of L){if(on){if(o.userData.mscV==null)o.userData.mscV=o.visible;o.visible=false;}else if(o.userData.mscV!=null){o.visible=o.userData.mscV;delete o.userData.mscV;}}}
function mascUI(on,cap,sub){let e=$('#mascFx');if(!e){e=document.createElement('div');e.id='mascFx';e.innerHTML='<i class="ms-bar t"></i><i class="ms-bar b"></i><div class="ms-cap"><b></b><small></small></div><button id="mascSkip" class="ms-skip"></button><i class="ms-fade"></i><i class="ms-flash"></i>';document.body.appendChild(e);
    e.addEventListener('pointerdown',ev=>{if(G.masc&&!G.masc.lock&&G.masc.t>MSC.skipAfter){G.masc.skip=true;ev.preventDefault();}});}
  document.body.classList.toggle('mascOn',!!on);e.classList.toggle('on',!!on);if(!on)return;
  e.querySelector('.ms-cap b').innerHTML=cap||'';e.querySelector('.ms-cap small').textContent=sub||'';const sk=$('#mascSkip');sk.textContent=G.masc&&G.masc.lock?'':__L('탭해서 건너뛰기 ›');sk.style.visibility=G.masc&&G.masc.lock?'hidden':'visible';}
function mascCapOf(a,b,tA,tB){const c=k=>kitHex(TEAM[k].color);return '<span style="color:'+kitMix(c(tA),'#ffffff',.35)+'">'+KIT_MASN[a]+'</span><em>VS</em><span style="color:'+kitMix(c(tB),'#ffffff',.35)+'">'+KIT_MASN[b]+'</span>';}
// where both stand to greet: each one's touching tip lands exactly at the centre (measured from its own touch pose)
const mascYaw=(R,side)=>{const S=MS_SP[R.sp];if(S.flat)return 0;const a=mPI/2-(S.gt==null?.85:S.gt);return side<0?a:-a;};
// the closest the two bodies come (their spheres), negative = overlapping
function mascGap(A,B){let g=9;for(const a of A.sph)for(const b of B.sph){const p=a[0].localToWorld(mV1.set(a[1][0],a[1][1],a[1][2])).clone(),q=b[0].localToWorld(mV2.set(b[1][0],b[1][1],b[1][2]));
  if(p.y<-.15&&q.y<-.15)continue;g=Math.min(g,p.distanceTo(q)-a[2]*A.root.scale.x-b[2]*B.root.scale.x);}return g;}
function mascSpots(A,B){const ty=MS_SP[A.sp].ty!=null?MS_SP[A.sp].ty:MS_SP[B.sp].ty,low=ty!=null,L=[[A,-1],[B,1]],O=side=>({u:1,side,n:0,dt:0,low});
  for(const [R,side] of L){mPose(R,'touch',.8,O(side));mPlace(R,{x:0,z:0,yaw:mascYaw(R,side)});R.root.updateMatrixWorld(true);const p=R.touch.getWorldPosition(mV());R.gs={x:-p.x,z:-p.z,y:p.y};}
  const y=low?ty:Math.max(.45,Math.min(1.25,(A.gs.y+B.gs.y)/2)),M=mV(0,y,0);
  const fit=()=>{for(const [R,side] of L){mPose(R,'touch',.8,O(side));mPlace(R,{x:R.gs.x,z:R.gs.z,yaw:mascYaw(R,side)});mTouchTo(R,M,1,null,true);}};
  // limbs: where the bent limb really ends up at that height, so nobody has to shuffle while touching
  for(let k=0;k<4;k++){for(let it=0;it<3;it++){fit();for(const [R] of L){const p=R.touch.getWorldPosition(mV());R.gs.x-=p.x;R.gs.z-=p.z;}}
    fit();const g=mascGap(A,B);if(g>=.1)break;const d=(.13-g)/2;A.gs.x-=d;B.gs.x+=d;}
  return {y,low};}
// kind: 'intro' | 'end' | 'preview'; o.res: 'win' | 'lose' | 'draw' (my side), o.cb when it is over
function mascStart(kind,cfg,o){o=o||{};if(G.masc)mascEnd(false);
  const pr=o.pair||mascPair(cfg),A=mascRig('A',pr.mine,pr.my),B=mascRig('B',pr.oth,pr.op),key=pr.my+'|'+pr.op;
  let quick=!!(kind==='intro'&&(mascMode()==='short'||MS_SESS[key]));if(kind==='intro')MS_SESS[key]=1;
  const dur=kind==='intro'?(quick?MSC.introQ:MSC.intro):kind==='preview'?(o.dur||MSC.end+.6):MSC.end,res=o.res||'win';
  const sp=mascSpots(A,B),gr=kind==='intro'||res==='draw';
  // stage: greeting spots in the middle, or side by side towards the camera for the end
  for(const [R,side] of[[A,-1],[B,1]]){const S=MS_SP[R.sp];R.side=side;R.sm=null;
    if(gr){R.at={x:R.gs.x,z:R.gs.z,yaw:mascYaw(R,side)};}else R.at={x:side*(R.med==='water'?1.45:1.3),z:0,yaw:-side*.12};
    if(R.pool){const r=S.pool*(gr?1:Math.min(1,1.1/S.pool));R.pool.userData.r=r;const off=gr?side*r*.45:0;R.pool.position.set(R.at.x+off,0,R.at.z);R.pool.scale.set(1,1,1);R.pool.userData.open=kind==='intro'&&!quick?0:1;R.pool.visible=true;
      R.pool.userData.base=r/S.pool;R.lim=Q=>{const P=R.pool,dx=Q.root.position.x-P.position.x,dz=Q.root.position.z-P.position.z,d=Math.hypot(dx,dz),m=P.userData.r*.75;if(d>m){Q.root.position.x=P.position.x+dx/d*m;Q.root.position.z=P.position.z+dz/d*m;}};}}
  G.masc={kind,quick,t:0,dur,A,B,pr,res,my:sp.y,cb:o.cb||null,lock:!!(kind==='intro'&&cfg&&cfg.net),skip:false,n:0,shake:0,fov:camera.fov,low:sp.low,
    snow:A.sp==='flake'||B.sp==='flake',fxq:[]};
  A.root.visible=B.root.visible=true;mascHideWorld(true);
  const sub=kind==='intro'?__L('우리 팀 마스코트 등장'):kind==='preview'?(o.sub||''):res==='win'?__L('승리 세리머니'):res==='lose'?__L('아쉬운 패배'):__L('무승부 — 서로 악수');
  mascUI(true,mascCapOf(pr.my,pr.op,pr.mine,pr.oth),sub);mascFade(1,0);try{SFX.whoosh();SFX.crowd(.6);}catch(e){}
  return true;}
function mascFade(v,dur){const f=document.querySelector('#mascFx .ms-fade');if(!f)return;f.style.transition=dur?'opacity '+dur+'s':'none';f.style.opacity=v;if(!dur)void f.offsetWidth;}
function mascClear(){if(G.masc)mascEnd(false);}
function mascEnd(run){const M=G.masc;if(!M)return;G.masc=null;for(const k in MS_RIG){MS_RIG[k].root.visible=false;if(MS_RIG[k].pool)MS_RIG[k].pool.visible=false;}mascRings(false);
  for(const b of MS_BOLTS){scene.remove(b.g);b.sc.material.dispose();}MS_BOLTS=[];if(MS_SNOW){MS_SNOW.visible=false;MS_SNOW.userData.k=0;}
  mascHideWorld(false);mascUI(false);camera.fov=M.fov;camera.updateProjectionMatrix();if(run!==false&&M.cb)try{M.cb();}catch(e){console.error(e);}}
// the hooks every animation gets (effects are queued and fired after the rigs are placed, at their real positions)
function mascHooks(M,dt){const q=M.fxq;return {n:M.n,dt,low:M.low,
  fx:(k,obj,p,n)=>q.push(()=>{const w=obj?obj.localToWorld(mV(...(p||[0,0,0]))):mV();mascFx(k,w,n);}),
  splash:(R,x,z,s)=>q.push(()=>{const w=R.root.localToWorld(mV(x/R.k0,0,z/R.k0));w.y=.02;mascFx('splash',w,s||1);if(R.pool)mascRipple(R.pool,w.x,w.z,s||1);}),
  sfx:k=>{try{SFX.msc(k);}catch(e){}},shake:a=>{M.shake=Math.max(M.shake,a);},flash:()=>mascFlash(),
  strike:(R,x,z)=>q.push(()=>{const w=R.root.localToWorld(mV(x/R.k0,0,z/R.k0));mascStrike(w.x,w.z,R.j.cloud&&R.j.cloud.getWorldPosition(mV()));})};}
// where everyone is and what they do at time t
function mascStep(dt){const M=G.masc;if(!M||G.paused)return;M.t+=dt;M.n++;const t=M.t,A=M.A,B=M.B;
  if(M.t>.05&&!M.f0){M.f0=1;mascFade(0,.35);}
  if(M.skip){M.skip=false;if(M.t<M.dur-.42){M.t=M.dur-.42;}}
  if(M.t>=M.dur-.4&&!M.f1){M.f1=1;mascFade(1,.35);}
  if(M.t>=M.dur){mascEnd(true);return;}
  const H=mascHooks(M,dt),turn=(a,b,u)=>a+(b-a)*mSm(u),zk=M.kind==='intro'||M.res==='draw'?1:.35;
  const P=(R,name,tt,x)=>{const o=Object.assign({},H,{side:R.side},x||{});mPose(R,name,tt,o);mSmooth(R,dt);mPlace(R,{x:R.at.x,z:R.at.z,yaw:x&&x.yaw!=null?x.yaw:R.at.yaw,zk});};
  const both=(name,tt,x)=>{P(A,name,tt,x);P(B,name,tt,x);};
  let touchK=0,My=M.my;
  if(M.kind==='intro'){
    if(!M.quick&&t<2.2){const u=Math.min(1,t/2.1),e=1-Math.pow(1-u,2.2);
      for(const R of[A,B]){if(R.pool)R.pool.userData.open=mWin(t,.05,.45);if(R.pool&&mAt(H,t,.06)){try{SFX.msc('crack');}catch(e){}M.shake=Math.max(M.shake,.2);}}
      both('enter',t,{u:e,d:(1-e)*4.8});}
    else{const s0=M.quick?0:2.2,ts=t-s0;
      if(ts<1.7){touchK=mWin(ts,0,.32)*(1-mWin(ts,1.38,1.7));both('touch',ts,{u:touchK});My+=Math.sin(ts*3.2*TAU)*.045*mWin(ts,.4,.55)*(1-mWin(ts,1.2,1.35));
        if(mAt(H,ts,.34)){try{SFX.msc('boop');}catch(e){}M.fxq.push(()=>mascFx('sparkle',mV(0,My,0),10));}}
      else if(ts<2.4){both('bow',ts,{u:(ts-1.7)/.7});}
      else if(M.quick){const u=Math.min(1,(ts-2.4)/.35);P(A,'wave',ts,{yaw:turn(A.at.yaw,.2,u)});P(B,'wave',ts+.2,{yaw:turn(B.at.yaw,-.2,u)});}
      else if(ts<3.8){const u=Math.min(1,(ts-2.4)/.3);P(A,'sig',ts-2.4,{yaw:turn(A.at.yaw,.15,u)});P(B,'idle',ts,{yaw:turn(B.at.yaw,-.5,u)});if(mAt(H,ts,2.45))mascVoice(A.sp);}
      else{const u=Math.min(1,(ts-3.8)/.3);P(B,'sig',ts-3.8,{yaw:turn(-.5,-.15,u)});P(A,'idle',ts,{yaw:turn(.15,.5,u)});if(mAt(H,ts,3.85))mascVoice(B.sp);}}
  }else{
    // end / preview: my mascot on the left, the other on the right (a draw starts with the greeting again)
    const res=M.res,aN=res==='draw'?'draw':res==='win'?'win':'lose',bN=res==='draw'?'draw':res==='win'?'lose':'win';
    if(res==='draw'){touchK=t<2.2?mWin(t,0,.3)*(1-mWin(t,1.9,2.2)):0;const u=mWin(t,2.2,2.6);P(A,aN,t,{u:touchK,yaw:turn(A.at.yaw,.2,u)});P(B,bN,t,{u:touchK,yaw:turn(B.at.yaw,-.2,u)});}
    else{P(A,aN,t);P(B,bN,t);}
    if(mAt(H,t,.05)){try{if(M.kind==='end'){res==='win'?SFX.fanfare():res==='lose'?SFX.bray():SFX.honk();}}catch(e){}}
  }
  if(touchK>0){const T0=mV(0,My,0);for(const R of[A,B])mTouchTo(R,T0,touchK,R.lim);const g=mascGap(A,B);if(g<.02){const d=(.02-g)/2;A.root.position.x-=d;B.root.position.x+=d;}}
  for(const R of[A,B]){if(R.lim&&!touchK)R.lim(R);R.root.updateMatrixWorld(true);}
  const q=M.fxq;M.fxq=[];for(const f of q)try{f();}catch(e){}
  mascBolts(dt);mascPools(dt);mascRings(true);mascSnow(dt,M.snow,(A.sp==='flake'?A:B).root.position);
  M.shake*=Math.exp(-dt*6);
}
function mascVoice(sp){const v={peng:'honk',orca:'blow',bear:'roar',seal:'honk',walrus:'bray',fox:'yip',owl:'hoot',fish:'plop',narwhal:'chime',flake:'chime',berg:'crack',bolt:'zap'}[sp];try{v&&SFX.msc(v);}catch(e){}}
function mascFlash(){if(save.set.flash===false||RM0)return;const f=document.querySelector('#mascFx .ms-flash');if(!f)return;f.classList.remove('on');void f.offsetWidth;f.classList.add('on');}
// the camera: framed shots (a point of interest, how much must fit across / up, and the side the camera sits on) — the distance
// follows the screen shape, so a tall phone sees the same framing as a wide screen; shots blend over 0.3 s
function mascFrame(c,w,h,dir,fov){const vf=fov*Math.PI/180,hf=2*Math.atan(Math.tan(vf/2)*camera.aspect),bar=Math.min(innerHeight*(camera.aspect>1.3?.07:.09),64),fr=Math.max(.5,1-2*bar/innerHeight-36/innerHeight),
  d=Math.max(h/2/(Math.tan(vf/2)*fr),w/2/Math.tan(hf/2))*1.06,
  L=Math.hypot(dir[0],dir[1],dir[2]);return {p:[c[0]+dir[0]/L*d,c[1]+dir[1]/L*d,c[2]+dir[2]/L*d],l:c,fov};}
function mascShot(M){const t=M.t,A=M.A,B=M.B,ap=A.root.position,bp=B.root.position,hy=R=>R.head.getWorldPosition(mV()).y,cy=R=>Math.max(.5,Math.min(1.5,hy(R)*.75+.12)),cw=R=>MS_SP[R.sp].cw||2,my=M.my;
  const S=(a,b,c0,c1,w0,w1,h,dir,fov)=>({a,b,f:u=>{const w=mL(w0,w1,u);return mascFrame(c0.map((v,i)=>mL(v,c1[i],u)),w,h*w,dir,fov||38);}});let L;
  if(M.kind==='intro'){
    if(M.quick)L=[S(0,2.4,[0,my,0],[0,my,0],3.0,2.7,.78,[.12,.2,1]),S(2.4,3.4,[0,.95,0],[0,.95,0],3.6,3.9,.72,[0,.2,1])];
    else L=[S(0,2.2,[0,.95,0],[0,.95,0],5.0,4.2,.62,[0,.24,1],42),S(2.2,3.9,[0,my,0],[0,my,0],2.9,2.6,.8,[.12,.2,1]),S(3.9,4.6,[0,.85,0],[0,.85,0],3.6,3.4,.75,[0,.42,1]),
      S(4.6,6.0,[ap.x,cy(A),ap.z],[ap.x,cy(A),ap.z],cw(A),cw(A)*.86,.95,[.35,.12,1],36),S(6.0,7.0,[bp.x,cy(B),bp.z],[bp.x,cy(B),bp.z],cw(B),cw(B)*.88,.95,[-.35,.12,1],36),S(7.0,7.4,[0,1.0,0],[0,1.0,0],4.2,5.0,.66,[0,.3,1],42)];}
  // end / preview: the pair, then each mascot up close (mine first, then the other one's reaction), then the pair again
  else{const k=camera.aspect<.8?.85:1;L=[S(0,2.2,[0,1.0,.2],[0,1.0,.2],4.7,4.2,.66,[0,.18,1],40),S(2.2,3.6,[ap.x,cy(A),ap.z+.1],[ap.x,cy(A),ap.z+.1],cw(A)*k,cw(A)*k*.9,1.0,[.3,.12,1],36),
    S(3.6,4.8,[bp.x,cy(B),bp.z+.1],[bp.x,cy(B),bp.z+.1],cw(B)*k,cw(B)*k*.9,1.0,[-.3,.12,1],36),S(4.8,M.dur,[0,1.0,.2],[0,1.0,.2],4.4,5.2,.66,[0,.28,1],42)];}
  let i=0;while(i<L.length-1&&t>=L[i].b)i++;const c=L[i],now=c.f(mSm((t-c.a)/(c.b-c.a)));
  if(i>0&&t-c.a<.3){const pv=L[i-1].f(1),k=mSm((t-c.a)/.3);return {p:pv.p.map((v,j)=>mL(v,now.p[j],k)),l:pv.l.map((v,j)=>mL(v,now.l[j],k)),fov:mL(pv.fov,now.fov,k)};}
  return now;}
function mascCam(){const M=G.masc;if(!M)return false;const c=mascShot(M),sh=save.set.shake==='off'?0:save.set.shake==='low'?.5:1,j=M.shake*sh*.12;
  camera.position.set(c.p[0]+rnd(-j,j),c.p[1]+rnd(-j,j),c.p[2]+rnd(-j,j));camera.lookAt(c.l[0],c.l[1],c.l[2]);if(camera.fov!==c.fov){camera.fov=c.fov;camera.updateProjectionMatrix();}
  camera.clearViewOffset&&camera.clearViewOffset();return true;}
function mascLate(){if(G.masc)mascHideWorld(true);}
// match hooks: the entrance right after the match is set up, the end scene before the result screen
function mascIntro(cfg){if(!mascCan(cfg))return false;return mascStart('intro',cfg);}
function mascOutro(cb){const cfg=G.cfg,R=G.result;if(!R||!mascCan(cfg)||mascMode()==='off'||G.view!=='game')return false;return mascStart('end',cfg,{res:R.draw?'draw':R.win?'win':'lose',cb});}
if(typeof APP_OV!=='undefined'){APP_OV.push('#mascFx');APP_OVBTN.push('#mascSkip');}
document.addEventListener('keydown',e=>{if(G.masc&&!G.masc.lock&&G.masc.t>MSC.skipAfter&&e.key!=='Shift'){G.masc.skip=true;}},true);
document.addEventListener('click',e=>{if(e.target&&e.target.id==='mascSkip'&&G.masc&&!G.masc.lock)G.masc.skip=true;},true);
// the kit designer's preview: the chosen mascot's victory or defeat over the menu's ice (with another mascot reacting next to it)
function mascPreview(mas,res){if(G.masc||!mascPossible())return false;const scr=document.querySelector('.screen.on'),id=scr&&scr.id;
  const L=KIT.mas.filter(m=>m!==mas);const pr={mine:save.team||'blue',oth:(save.team||'blue')==='blue'?'red':'blue',my:mas,op:L[(KIT.mas.indexOf(mas)+3)%L.length]};
  if(scr)scr.classList.remove('on');
  return mascStart('preview',null,{pair:pr,res,dur:MSC.end,sub:res==='win'?__L('승리 세리머니'):__L('패배 리액션'),cb:()=>{if(id)show(id);if(id==='sKit')kitRender();}});}
function mascPossible(){return !window.__NOFX&&typeof WebGLRenderingContext!=='undefined';}
