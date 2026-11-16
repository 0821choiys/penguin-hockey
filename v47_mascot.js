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
//  · team colours: a knitted team scarf (or a band / ribbon / flag) — no costumes
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
  fur:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.92,bumpMap:MS_FUR,bumpScale:.03}),1.2),
  feather:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.85,bumpMap:MS_FUR,bumpScale:.012}),1.1),
  skin:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.28,metalness:.06}),.85),
  scale:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.26,metalness:.42}),1),
  ice:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.1,metalness:.15,emissive:0x2a6a96,emissiveIntensity:.4}),1.3),
  berg:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.25,metalness:.05,flatShading:true,emissive:0x1d4a6e,emissiveIntensity:.22}),1.2),
  ivory:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.38,metalness:.02}),.6),
  cloud:new mT.MeshStandardMaterial({vertexColors:true,roughness:1}),
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
function mFin(pts,th,col){const s=new mT.Shape();pts.forEach((q,i)=>i?s.lineTo(q[0],q[1]):s.moveTo(q[0],q[1]));
  const g=new mT.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:th*.6,bevelSize:th*.6,bevelSegments:2,curveSegments:8});g.translate(0,0,-th/2);
  const n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set(col,i*3);g.setAttribute('color',new mT.BufferAttribute(a,3));return g;}
function mMesh(list,mat,shadow){const m=new mT.Mesh(list.length===1&&!list[0][1]?list[0][0]:pkMerge(list),mat);m.castShadow=shadow!==false;return m;}
const mG=(x,y,z)=>{const g=new mT.Group();g.position.set(x||0,y||0,z||0);return g;};
// character eyes (same family as the players': a flat white oval, a big pupil, two catch-lights)
function mEye(w,h,iris){const g=new mT.Group(),base=mEll([0,0,0],[w,h,w*.28],[.97,.97,.98],18);
  const pu=mEll([0,-h*.06,w*.22],[w*.8,h*.8,w*.12],d=>{const r=Math.hypot(d[0],d[1]);return r<.55?[.03,.03,.05]:iris;},18);
  const hl=pkMerge([[mEll([w*.28,h*.3,w*.36],[w*.22,w*.22,w*.06],null,10),null],[mEll([-w*.22,-h*.28,w*.34],[w*.11,w*.11,w*.04],null,8),null]]);
  g.add(new mT.Mesh(base,PK_MAT.eye));const p=new mT.Mesh(pu,PK_MAT.eye);g.add(p);g.add(new mT.Mesh(hl,PK_MAT.hl));g.userData.pu=p;g.userData.w=w;return g;}
// put a child on an ellipsoid surface at (yaw, pitch), facing out
function mOn(par,obj,c,r,yaw,pitch,out){const d=mV(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
  obj.position.set(c[0]+d.x*r[0]*(out||1),c[1]+d.y*r[1]*(out||1),c[2]+d.z*r[2]*(out||1));
  const n=mV(d.x/r[0],d.y/r[1],d.z/r[2]).normalize();obj.quaternion.setFromUnitVectors(mV(0,0,1),n);par.add(obj);return obj;}
function mEyes(h,R,c,r,yaw,pitch,w,hh,iris,tilt){for(const s of[1,-1]){const e=mEye(w,hh,iris);if(tilt)e.children.forEach(m=>m.rotation.z=s*tilt);mOn(h,e,c,r,s*yaw,pitch,.985);R.eyes.push(e);}}
function mSmile(h,R,c,r,pitch,w,col){const g=new mT.TorusGeometry(w,w*.13,6,14,Math.PI*.8);g.rotateZ(Math.PI*1.1);const n=g.attributes.position.count,a=new Float32Array(n*3);
  for(let i=0;i<n;i++)a.set(col||[.12,.07,.08],i*3);g.setAttribute('color',new mT.BufferAttribute(a,3));const m=new mT.Mesh(g,PK_MAT.vc),o=mG();o.add(m);mOn(h,o,c,r,0,pitch,1.0);R.ex.mouth=m;return m;}
function mBlush(h,c,r,yaw,pitch,s){for(const k of[1,-1]){const m=new mT.Mesh(mEll([0,0,0],[s,s*.62,s*.3],[1,.62,.7],10),MS_M.skin);mOn(h,m,c,r,k*yaw,pitch,1.0);}}
const mHash=d=>{const v=Math.sin(d[0]*91.3+d[1]*57.7+d[2]*113.1)*43758.5;return v-Math.floor(v);};
function mKitOf(teamKey,mas){const k=kitFor(teamKey);return Object.assign({c1:kitHex(TEAM[teamKey].color),c2:'#ffffff',pat:'classic',crest:'circle'},k||{},{mas});}
// the team mark: a knitted scarf (stripes in the kit's two colours) with two hanging ends; ring in the xz plane around +y
function mScarf(R,rx,rz,th,pos,tilt,ends){const c1=R.tc,c2=R.acc,g=mG(pos[0],pos[1],pos[2]);
  const ring=pkSurf(36,8,(u,v,p)=>{const a=u*TAU,b=v*TAU;p[0]=Math.sin(a)*(rx+Math.cos(b)*th);p[1]=Math.sin(b)*th*1.3;p[2]=Math.cos(a)*(rz+Math.cos(b)*th);},
    (u,v,p,o)=>{const q=(u*12|0)%3===1?c2:c1;o[0]=q[0];o[1]=q[1];o[2]=q[2];},8,1);const L=[[ring,null]];
  if(ends!==false)for(const s of[1,-1]){const q=mTube(-th*5.5,0,()=>th*.85,v=>(v*5|0)%2?c1:c2,.45,10);q.rotateZ(s*.2);q.translate(s*rx*.3,-th*.4,rz*.95);L.push([q,null]);}
  const m=new mT.Mesh(pkMerge(L),pkKnitVC([6,1]));m.castShadow=true;g.add(m);if(tilt)g.rotation.x=tilt;return g;}
function mBand(R,r,th,sx,sz){const g=new mT.TorusGeometry(r,th,6,18);g.rotateX(Math.PI/2);g.scale(sx||1,1,sz||1);const n=g.attributes.position.count,a=new Float32Array(n*3);
  for(let i=0;i<n;i++){const p=g.attributes.position;a.set(Math.atan2(p.getX(i),p.getZ(i))*3%2>1?R.acc:R.tc,i*3);}g.setAttribute('color',new mT.BufferAttribute(a,3));return new mT.Mesh(g,pkKnitVC([6,1]));}
// a disc of water (deep in the middle, lighter at the rim)
function mWaterDisc(r,seg){const g=new mT.CircleGeometry(r,seg||40);g.rotateX(-Math.PI/2);const p=g.attributes.position,n=p.count,a=new Float32Array(n*3);
  for(let i=0;i<n;i++){const d=Math.min(1,Math.hypot(p.getX(i),p.getZ(i))/r);a.set([mL(.02,.13,d*d*d),mL(.12,.36,d*d*d),mL(.26,.56,d*d*d)],i*3);}g.setAttribute('color',new mT.BufferAttribute(a,3));return g;}
// --- joints: every animated part is registered so each frame starts again from its rest placement ---
function mJ(R,n,o){R.j[n]=o;return o;}
function mRest(R){for(const k in R.j){const o=R.j[k],r=o.userData.r0;o.position.copy(r[0]);o.rotation.copy(r[1]);o.scale.copy(r[2]);}
  R.off={x:0,y:0,z:0,rx:0,ry:0,rz:0,s:1,px:0,py:0,pz:0};for(const e of R.eyes){e.scale.set(1,1,1);const u=e.userData;if(u.pu)u.pu.position.copy(u.pu0);}if(R.ex.mouth)R.ex.mouth.scale.set(1,1,1);if(R.ex.puck)R.ex.puck.visible=false;if(R.ex.mat)R.ex.mat.emissiveIntensity=.6;}
function mBlink(R,t,s){const q=(t*.37+(s||0))%3.1,b=q<.12?Math.max(.1,1-Math.sin(q/.12*mPI)):1;for(const e of R.eyes)e.scale.y*=b;}
function mEyeK(R,k,wink){R.eyes.forEach((e,i)=>{if(!wink||i===0)e.scale.y*=k;});}
function mLook(R,x,y){for(const e of R.eyes){const u=e.userData;if(u.pu)u.pu.position.set(u.pu0.x+x*u.w*.35,u.pu0.y+y*u.w*.35,u.pu0.z);}}
const mR=(R,n,x,y,z)=>{const o=R.j[n];if(!o)return;o.rotation.x+=x||0;o.rotation.y+=y||0;o.rotation.z+=z||0;};
// --- a leg of the four-legged: upper → lower → paw (rest: straight down) ---
function mLeg4(R,par,n,pos,l1,r1,l2,r2,col,paw,tz){const a=mJ(R,n,mG(pos[0],pos[1],pos[2]));par.add(a);
  a.add(mMesh([[mTube(-l1,0,v=>mL(r1*.82,r1,v),col,1,14),null],[mEll([0,0,0],[r1,r1,r1],col,12),null]],MS_M.fur));
  const b=mJ(R,n+'2',mG(0,-l1,0));a.add(b);b.add(mMesh([[mTube(-l2,0,v=>mL(r2*.9,r2,v),col,1,12),null],[mEll([0,0,0],[r2*1.05,r2*1.05,r2*1.05],col,12),null]],MS_M.fur));
  const p=mG(0,-l2,0);b.add(p);p.add(mMesh(paw,MS_M.fur));const tip=mG(0,.02,tz||.1);p.add(tip);return tip;}
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
// the puck the seal balances
function mPuck(R,on){let p=R.ex.puck;if(!on){if(p)p.visible=false;return null;}if(!p){p=new mT.Mesh(new mT.CylinderGeometry(.13,.13,.07,20),PK_MAT.vc);const n=p.geometry.attributes.position.count,a=new Float32Array(n*3);a.fill(.06);
  p.geometry.setAttribute('color',new mT.BufferAttribute(a,3));R.j.head.add(p);R.ex.puck=p;p.castShadow=true;}p.visible=true;return p;}
// ---------------- the cast ----------------
// each: med = 'ice' | 'water' | 'air'; k0 = size; pool = hole radius; cw = width of its close-up; flat = faces the camera while greeting;
// build(R); idle / enter / touch / bow / wave / win / lose (R, t, o); g = where its signature starts inside the victory act
const MS_W=[.96,.96,.97],MS_B=[.07,.08,.1];
var MS_SP={
  // 펭귄 — belly-slides in, waddles; flipper touch; ecstatic display call when it wins, face-flop tantrum when it loses
  peng:{med:'ice',k0:1.05,cw:2.0,g:0,build(R){const B=[.08,.09,.12],W=MS_W,bd=mJ(R,'body',mG(0,.04,0));R.root.add(bd);
      bd.add(mMesh([[mEll([0,.5,0],[.37,.5,.34],d=>d[2]>.1+.3*Math.abs(d[0])&&d[1]<.74?(d[1]>.48?[.99,.92,.7]:W):B,34,d=>1+.08*Math.max(0,-d[1])-.05*Math.max(0,d[1]-.5)),null],
        [mFin([[0,0],[.12,-.02],[0,-.17],[-.12,-.02]],.04,B).rotateX(-1.25).translate(0,.13,-.29),null]],PK_MAT.body));
      const hd=mJ(R,'head',mG(0,.93,.03));bd.add(hd);const c=[0,.19,.02],r=[.29,.27,.27];
      hd.add(mMesh([[mEll(c,r,d=>d[2]>.22&&d[1]<.42-.32*Math.abs(d[0])&&d[1]>-.72?W:B,30),null]],PK_MAT.body));
      mEyes(hd,R,c,r,.38,.2,.075,.088,[.25,.18,.12]);mBlush(hd,c,r,.62,-.12,.045);
      const bk=mHorn(.17,.075,(u,v)=>v<.15?[.95,.55,.12]:[1,.64,.16],0,14);bk.scale(1.25,1,.8);bk.rotateX(Math.PI/2);const bm=new mT.Mesh(bk,PK_MAT.beak);mOn(hd,bm,c,r,0,-.05,.93);R.ex.beak=bm;
      for(const s of[1,-1]){const w=mJ(R,s>0?'wL':'wR',mG(s*.355,.74,-.02));bd.add(w);w.rotation.z=s*.16;
        const f=mFin([[0,.02],[.07,-.04],[.085,-.3],[.045,-.5],[-.02,-.53],[-.065,-.32],[-.06,-.03]],.028,B);f.rotateY(Math.PI/2);w.add(mMesh([[f,null]],PK_MAT.body));
        const tp=mG(0,-.5,0);w.add(tp);R.tips[s>0?'L':'R']=tp;R.iks[s>0?'L':'R']=[w];
        const ft=mJ(R,s>0?'fL':'fR',mG(s*.15,.014,.06));R.root.add(ft);
        const g=mFin([[0,-.03],[.085,.06],[.06,.19],[.02,.15],[0,.2],[-.02,.15],[-.06,.19],[-.085,.06]],.024,[1,.6,.16]);g.rotateX(Math.PI/2);ft.add(mMesh([[g,null]],PK_MAT.beak));}
      bd.add(mScarf(R,.27,.26,.05,[0,.9,.02],.1));R.head=hd;R.sph=[[bd,[0,.5,0],.37],[hd,c,.28]];},
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
  orca:{med:'water',k0:.82,pool:1.35,cw:2.9,g:.5,gt:1.25,build(R){const B=[.05,.06,.08],W=[.97,.97,.98],Gy=[.62,.64,.68],bd=mJ(R,'body',mG(0,-.06,0));R.root.add(bd);
      bd.add(mMesh([[mRev(-.35,1.25,v=>pkLook([[0,.4],[.3,.45],[.6,.43],[.78,.37],[.88,.3],[.94,.22],[.98,.12],[1,.02]],v),(u,v,up,sd)=>{const ev=(v-.75)/.075,eu=(up-.33)/.24;
        return Math.abs(sd)>.45&&ev*ev+eu*eu<1?W:up<-.3?W:v<.22&&up>.55?Gy:B;},1,.92),null]],MS_M.skin));
      const tl=mJ(R,'tail',mG(0,0,-.35));bd.add(tl);tl.add(mMesh([[mRev(-1.25,.02,v=>pkLook([[0,.07],[.12,.1],[.45,.24],[.8,.37],[1,.4]],v),(u,v,up,sd)=>(up<-.3&&v>.45)||(v>.5&&v<.8&&up<.15&&up>-.35&&Math.abs(sd)>.6)?W:B,1,.92),null]],MS_M.skin));
      const fl=mJ(R,'fluke',mG(0,0,-1.22));tl.add(fl);for(const s of[1,-1]){const g=mFin([[0,.05],[s*.16,.02],[s*.5,-.22],[s*.62,-.13],[s*.44,.02],[s*.12,.1]],.035,B);g.rotateX(Math.PI/2);fl.add(mMesh([[g,null]],MS_M.skin));}
      const df=mFin([[-.26,0],[.14,0],[.04,.22],[-.1,.52],[-.17,.58],[-.15,.36]],.05,B);df.rotateY(-Math.PI/2);df.translate(0,.36,-.02);bd.add(mMesh([[df,null]],MS_M.skin));
      const bn=mBand(R,.12,.034,.42,1.45);bn.position.set(0,.46,-.07);bd.add(bn);
      for(const s of[1,-1]){const p=mJ(R,s>0?'pfL':'pfR',mG(s*.32,-.22,.7));bd.add(p);p.rotation.set(-.5,0,s*.85);
        const g=mFin([[0,.04],[.1,-.04],[.15,-.25],[.11,-.43],[.03,-.48],[-.05,-.36],[-.06,-.08]],.035,B);g.rotateY(Math.PI/2);p.add(mMesh([[g,null]],MS_M.skin));
        const tp=mG(0,-.46,0);p.add(tp);R.tips[s>0?'L':'R']=tp;R.iks[s>0?'L':'R']=[p];}
      const ec=[0,.02,.92],er=[.33,.34,.36];mEyes(bd,R,ec,er,1.0,.24,.055,.065,[.12,.1,.12]);mSmile(bd,R,[0,-.06,.98],[.24,.24,.27],-.22,.1);
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
    touch(R,t,o){const S=MS_SP.orca;S.spy(R,o.u);S.sw(R,t,.4);mR(R,o.L?'pfL':'pfR',-.9*o.u,0,-o.s*.3*o.u);mBlink(R,t);},
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
  bear:{med:'ice',k0:.86,cw:2.8,g:0,build(R){const F=[.95,.93,.86],D=[.1,.09,.09],bd=mJ(R,'body',mG(0,.98,0));R.root.add(bd);
      bd.add(mMesh([[mEll([0,0,0],[.47,.46,.84],F,30,d=>1+.07*Math.max(0,d[1])*(1-Math.abs(d[2]))),null],[mEll([0,.03,-.5],[.43,.44,.42],F,22),null],[mEll([0,.05,.48],[.43,.45,.4],F,22),null],[mEll([0,.15,-.86],[.08,.07,.07],F,10),null]],MS_M.fur));
      const paw=()=>[[mEll([0,.035,.05],[.17,.085,.2],F,16),null],[mEll([0,-.03,.08],[.08,.016,.1],D,10),null]];
      for(const s of[1,-1]){const tp=mLeg4(R,bd,s>0?'fL':'fR',[s*.3,-.12,.52],.42,.2,.38,.16,F,paw(),.17);R.tips[s>0?'L':'R']=tp;
        mLeg4(R,bd,s>0?'hL':'hR',[s*.28,-.1,-.55],.45,.24,.38,.17,F,paw(),.17);}
      R.iks={L:[R.j.fL,R.j.fL2],R:[R.j.fR,R.j.fR2]};
      const nk=mJ(R,'neck',mG(0,.1,.78));bd.add(nk);nk.add(mMesh([[mEll([0,0,.05],[.3,.3,.28],F,18),null]],MS_M.fur));
      const hd=mJ(R,'head',mG(0,.08,.22));nk.add(hd);const c=[0,0,0],r=[.29,.26,.28];
      hd.add(mMesh([[mEll(c,r,F,26),null],[mEll([0,-.02,.24],[.155,.115,.17],[.94,.91,.84],18),null],[mEll([0,.035,.4],[.068,.048,.04],D,12),null],
        [mEll([.19,.2,-.05],[.08,.075,.05],F,12),null],[mEll([-.19,.2,-.05],[.08,.075,.05],F,12),null],[mEll([.19,.2,-.02],[.045,.045,.02],[.78,.68,.66],10),null],[mEll([-.19,.2,-.02],[.045,.045,.02],[.78,.68,.66],10),null]],MS_M.fur));
      const jw=mJ(R,'jaw',mG(0,-.1,.17));hd.add(jw);jw.add(mMesh([[mEll([0,-.015,.12],[.12,.05,.13],[.93,.9,.83],14),null],[mEll([0,.012,.12],[.09,.02,.1],[.72,.3,.34],10),null]],MS_M.fur));
      mEyes(hd,R,c,r,.4,.14,.048,.056,[.12,.1,.1]);nk.add(mScarf(R,.31,.31,.055,[0,-.02,.02],1.25,false));R.head=hd;R.sph=[[bd,[0,0,.1],.6],[hd,c,.3]];},
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
  // 물범 — galumphs in; raises its chest and touches with a flipper; claps and balances a puck when it wins; tantrum on its back when it loses
  seal:{med:'ice',k0:.92,cw:2.3,g:0,build(R){MS_SP.walrus.pinn(R,{base:[.6,.62,.65],dk:[.36,.38,.42],lt:[.84,.84,.82],r:.31,fl:.78,rl:.85,head:[.23,.21,.24],eye:[.42,.17,.07,.08,[.06,.05,.05]],fin:.29,seal:1});},
    idle(R,t){mR(R,'chest',-.12-.03*Math.sin(t*1.4));mR(R,'head',.1*Math.sin(t*.9),.3*Math.sin(t*.5));mR(R,'rf',.15*Math.sin(t*2));mBlink(R,t,.2);},
    enter(R,t,o){R.off.z=-o.d;mGalumph(R,t,1.9,1-mWin(o.u,.9,1));mR(R,'chest',-.1);if(o.n%7==0&&o.u<.95)o.fx('snow',R.root,[0,0,0]);mBlink(R,t);},
    touch(R,t,o){mR(R,'chest',-.55*o.u);mR(R,'head',.35*o.u);mR(R,o.L?'ffL':'ffR',-1.4*o.u,0,o.s*.2*o.u);mBlink(R,t);},
    bow(R,o){const b=Math.sin(o.u*mPI);mR(R,'chest',-.1+.18*b);mR(R,'head',.6*b);},
    wave(R,t){mR(R,'chest',-.45);mR(R,'head',.25);mR(R,'ffR',-1.6,0,-.6-.4*Math.sin(t*10));mBlink(R,t);},
    win(R,t,o){
      if(t<1.7){const u=mWin(t,0,.25);mR(R,'chest',-.6*u);mR(R,'head',.4*u);const c=Math.abs(Math.sin(t*9));mR(R,'ffL',-1.2*u,0,(-.2-.9*c)*u);mR(R,'ffR',-1.2*u,0,(.2+.9*c)*u);
        if(t>.3&&Math.sin((t-o.dt)*9)*Math.sin(t*9)<=0){o.sfx('tap');}}
      else if(t<3.7){const u=mWin(t,1.7,1.9),p=mPuck(R,1);mR(R,'chest',-.6*u);mR(R,'head',-.45*u+.08*Math.sin(t*7)*u,0,.12*Math.sin(t*5)*u);
        const up=t<2.4?mArc((t-1.7)/.7,.7):0;p.position.set(0,.3+up+.02*Math.sin(t*9),.14);p.rotation.set(0,t*5,.2*Math.sin(t*6));mR(R,'ffL',-.6*u,0,-.5*u);mR(R,'ffR',-.6*u,0,.5*u);if(mAt(o,t,2.4))o.sfx('tap');}
      else if(t<4.7){mPuck(R,0);const u=(t-3.7);R.off.rz=mSm(u)*TAU;R.off.py=.3;if(o.n%5==0)o.fx('snow',R.root,[0,0,0]);}
      else{mR(R,'chest',-.5);mR(R,'head',-.2+.1*Math.sin(t*12));mR(R,'ffR',-1.5,0,-.6-.4*Math.sin(t*10));mR(R,'rf',.4*Math.sin(t*14));if(mAt(o,t,4.8)||mAt(o,t,5.2))o.sfx('honk');if(t>5.1)mEyeK(R,.15,1);}
      mBlink(R,t);},
    lose(R,t,o){
      if(t<.6){mR(R,'head',-.3*mWin(t,0,.15));mEyeK(R,1.25);}
      else if(t<3.4){const k=mWin(t,.6,.9)*(1-mWin(t,3.1,3.4));R.off.rz=mPI*.95*k;R.off.py=.31;const w=Math.sin(t*17);mR(R,'ffL',-1.0*k,0,(.4+.8*w)*k);mR(R,'ffR',-1.0*k,0,-(.4+.8*w)*k);mR(R,'rf',.5*Math.sin(t*15)*k);mR(R,'head',0,.5*Math.sin(t*8)*k);mR(R,'chest',-.2*k);
        if(mAt(o,t,1.0)||mAt(o,t,1.8)||mAt(o,t,2.6))o.sfx('honk');if(o.n%4==0&&k>.5)o.fx('snow',R.root,[0,.2,0]);mEyeK(R,.3);}
      else{const u=mWin(t,3.4,3.8);mR(R,'head',.25*u);mR(R,'chest',.06*u);mR(R,'ffR',-1.5*u,0,.9*u);mLook(R,0,.6*u);mEyeK(R,1.1);if(mAt(o,t,4.2))o.sfx('sob');}}},
  // 바다코끼리 — heavy galumph; flipper touch; bellows and drums its chest when it wins; slaps the ice and flops on its side when it loses
  walrus:{med:'ice',k0:.82,cw:2.6,g:0,
    pinn(R,P){const base=P.base,dk=P.dk,lt=P.lt,sl=!!P.seal,col=sl?(u,v,up)=>up<-.45?lt:(Math.sin(u*37+v*29)*Math.sin(v*61-u*11)>.5?dk:base):(u,v,up)=>up<-.45?lt:(Math.sin(v*46+Math.sin(u*TAU*3)*1.5)>.75?dk:base);
      const r=P.r,ch=mJ(R,'chest',mG(0,r,0)),rr=mJ(R,'rear',mG(0,r,0));R.root.add(ch);R.root.add(rr);
      ch.add(mMesh([[mRev(0,P.fl,v=>pkLook([[0,r],[.45,r],[.8,r*.8],[1,r*.55]],v),col,1.04,.98),null]],MS_M.skin));
      rr.add(mMesh([[mRev(-P.rl,.02,v=>pkLook([[0,r*.16],[.15,r*.33],[.55,r*.78],[1,r]],v),col,1.04,.98),null],[mEll([0,0,0],[r*1.02,r*.98,r*1.02],base,18),null]],MS_M.skin));
      const hd=mJ(R,'head',mG(0,r*.3,P.fl-.02));ch.add(hd);const c=[0,0,.04],hr=P.head,L=[[mEll(c,hr,base,26),null]];
      if(sl){for(const s of[1,-1])L.push([mEll([s*.07,-.07,.22],[.075,.06,.065],lt,12),null]);L.push([mEll([0,-.025,.27],[.042,.03,.025],[.15,.13,.14],10),null]);}
      else{for(const s of[1,-1]){L.push([mEll([s*.12,-.1,.24],[.14,.12,.12],lt,16),null]);for(let i=0;i<9;i++)L.push([mEll([s*(.06+(i%3)*.05),-.07-(i/3|0)*.045,.34-(i%3)*.02],[.012,.012,.008],[.35,.24,.2],6),null]);}L.push([mEll([0,0,.31],[.06,.04,.04],[.32,.2,.18],10),null]);}
      hd.add(mMesh(L,MS_M.skin));const e=P.eye;mEyes(hd,R,c,hr,e[0],e[1],e[2],e[3],e[4]);
      if(sl){for(const s of[1,-1])for(let i=0;i<3;i++){const w=new mT.CylinderGeometry(.004,.002,.22,4);w.rotateZ(Math.PI/2+(i-1)*.18);w.rotateY(-s*.35);w.translate(s*.2,-.07+(i-1)*.02,.24);hd.add(mMesh([[w,[.92,.92,.9]]],PK_MAT.vc,false));}}
      else{const tk=mJ(R,'tusks',mG(0,-.17,.27));hd.add(tk);R.ex.tusks=[];for(const s of[1,-1]){const m=new mT.Mesh(mHorn(.55,.05,(u,v)=>[.96-.1*v,.93-.12*v,.84-.15*v],0,14),MS_M.ivory);m.rotation.set(mPI-.18,0,-s*.06);m.position.x=s*.075;tk.add(m);R.ex.tusks.push(m);}}
      for(const s of[1,-1]){const a=mJ(R,s>0?'ffL':'ffR',mG(s*r*.84,-r*.55,P.fl*.62));ch.add(a);a.rotation.set(.9,0,s*.45);a.add(mMesh([[mTube(-.13,0,()=>r*.2,base,1,10),null]],MS_M.skin));
        const b=mJ(R,(s>0?'ffL':'ffR')+'2',mG(0,-.13,0));a.add(b);const f=P.fin,g=mFin([[0,.02],[f*.2,-.03],[f*.25,-f*.7],[f*.1,-f],[-f*.1,-f*.95],[-f*.2,-f*.4],[-f*.17,0]],.03,base);g.rotateY(Math.PI/2);b.add(mMesh([[g,null]],MS_M.skin));
        const tp=mG(0,-f,0);b.add(tp);R.tips[s>0?'L':'R']=tp;R.iks[s>0?'L':'R']=[a,b];}
      const rf=mJ(R,'rf',mG(0,0,-P.rl+.03));rr.add(rf);for(const s of[1,-1]){const q=P.fin*1.1,g=mFin([[0,0],[s*q*.3,-q*.15],[s*q*.75,-q],[s*q*.2,-q*.95],[0,-q*.3]],.025,dk);g.rotateX(Math.PI/2);rf.add(mMesh([[g,null]],MS_M.skin));}
      ch.add(mScarf(R,hr[0]*.98,hr[0]*.98,.032,[0,r*.25,P.fl-.06],1.45,false));R.head=hd;R.sph=[[ch,[0,0,P.fl*.4],r],[rr,[0,0,-P.rl*.35],r*.85],[hd,c,hr[0]]];},
    build(R){MS_SP.walrus.pinn(R,{base:[.64,.44,.36],dk:[.52,.33,.27],lt:[.78,.6,.5],r:.44,fl:.95,rl:1.05,head:[.3,.27,.29],eye:[.62,.32,.04,.046,[.08,.06,.05]],fin:.38});},
    idle(R,t){mR(R,'chest',-.25-.03*Math.sin(t*1.2));mR(R,'head',.08*Math.sin(t*.8),.22*Math.sin(t*.45));mBlink(R,t,.9);},
    enter(R,t,o){R.off.z=-o.d;mGalumph(R,t,1.3,1-mWin(o.u,.9,1));mR(R,'chest',-.15);if(o.n%8==0&&o.u<.95){o.fx('snow',R.root,[0,0,0]);}mBlink(R,t);},
    touch(R,t,o){mR(R,'chest',-.55*o.u);mR(R,'head',.4*o.u);mR(R,o.L?'ffL':'ffR',-1.35*o.u,0,o.s*.2*o.u);mBlink(R,t);},
    bow(R,o){const b=Math.sin(o.u*mPI);mR(R,'chest',-.2+.12*b);mR(R,'head',.45*b);},
    wave(R,t){mR(R,'chest',-.45);mR(R,'head',.25);mR(R,'ffR',-1.5,0,-.6-.35*Math.sin(t*9));mBlink(R,t);},
    win(R,t,o){
      if(t<1.4){const u=mWin(t,0,.3);mR(R,'chest',-.75*u);mR(R,'head',-.35*u);mR(R,'ffL',-.4*u,0,.6*u);mR(R,'ffR',-.4*u,0,-.6*u);if(mAt(o,t,.35)){o.sfx('bray');o.shake(.3);}
        if(t>.5&&o.n%6==0)for(const m of R.ex.tusks)o.fx('sparkle',m,[0,.5,0]);}
      else if(t<2.8){mR(R,'chest',-.55);mR(R,'head',.1);const b=Math.sin(t*13);mR(R,'ffL',-1.3,0,-(.5+.5*Math.max(0,b)));mR(R,'ffR',-1.3,0,.5+.5*Math.max(0,-b));if(Math.sin((t-o.dt)*13)*b<0)o.sfx('heart');}
      else if(t<4.1){mR(R,'chest',-.4);mR(R,'head',-.15+.12*Math.sin(t*14),.0,.1*Math.sin(t*7));R.j.chest.position.y+=.02*Math.sin(t*20);mEyeK(R,.3);if(mAt(o,t,2.9))o.sfx('bray');}
      else{const u=mWin(t,4.1,4.4);mR(R,'chest',-.6*u);mR(R,'head',-.3*u);mR(R,'ffR',-1.5*u,0,-(.6+.35*Math.sin(t*9))*u);if(o.n%7==0)for(const m of R.ex.tusks)o.fx('sparkle',m,[0,.5,0]);if(t>5)mEyeK(R,.15,1);}
      mBlink(R,t);},
    lose(R,t,o){
      if(t<.9){const u=mWin(t,0,.8);mR(R,'chest',-.25+.22*u);mR(R,'head',.45*u);mEyeK(R,mL(1,.6,u));if(mAt(o,t,.3))o.sfx('sob');}
      else if(t<2.7){mR(R,'chest',-.05);mR(R,'head',.4);const sl=Math.sin((t-.9)*8);mR(R,'ffR',-.4-.8*Math.max(0,sl),0,-.3);if(Math.sin((t-o.dt-.9)*8)>0&&sl<=0){o.sfx('bump');o.fx('snow',R.j.ffR2,[0,-.3,0]);}mEyeK(R,.6);}
      else{const u=mWin(t,2.7,3.3);R.off.rz=-1.0*u;R.off.py=.44;mR(R,'head',.3,0,.3*u);mR(R,'ffL',-.6*u,0,.8*u);if(mAt(o,t,3.2)){o.shake(.45);o.sfx('bump');o.fx('snow',R.root,[0,0,0]);}
        R.j.chest.scale.y=1+.05*Math.sin(t*1.6)*u;mEyeK(R,.4);if(mAt(o,t,4.4))o.sfx('sob');}}},
  // 북극여우 — trots in; sits and gives a paw; play-bow; the famous mousing dive + tail chase when it wins; curls up under its tail when it loses
  fox:{med:'ice',k0:1.25,cw:2.2,g:0,build(R){const F=[.97,.97,.98],D=[.1,.08,.08],bd=mJ(R,'body',mG(0,.6,0));R.root.add(bd);
      bd.add(mMesh([[mEll([0,0,0],[.22,.23,.44],F,26),null],[mEll([0,-.02,.33],[.2,.22,.18],F,18,d=>1+.1*mHash(d)),null]],MS_M.fur));
      const paw=()=>[[mEll([0,.032,.03],[.05,.033,.075],F,10),null]];
      for(const s of[1,-1]){const tp=mLeg4(R,bd,s>0?'fL':'fR',[s*.11,-.1,.3],.26,.068,.24,.05,F,paw(),.09);R.tips[s>0?'L':'R']=tp;mLeg4(R,bd,s>0?'hL':'hR',[s*.12,-.05,-.3],.29,.09,.25,.056,F,paw(),.09);}
      R.iks={L:[R.j.fL,R.j.fL2],R:[R.j.fR,R.j.fR2]};
      const nk=mJ(R,'neck',mG(0,.12,.38));nk.rotation.x=-.35;bd.add(nk);nk.add(mMesh([[mEll([0,.05,.02],[.13,.16,.13],F,14),null]],MS_M.fur));
      const hd=mJ(R,'head',mG(0,.15,.04));hd.rotation.x=.35;nk.add(hd);const c=[0,0,0],r=[.16,.14,.15];
      const mz=mHorn(.2,.075,F,0,12);mz.scale(1,1,.75);mz.rotateX(Math.PI/2);mz.translate(0,-.045,.1);
      hd.add(mMesh([[mEll(c,r,F,24),null],[mEll([.1,-.05,.02],[.09,.08,.08],F,12,d=>1+.12*mHash(d)),null],[mEll([-.1,-.05,.02],[.09,.08,.08],F,12,d=>1+.12*mHash(d)),null],[mz,null],[mEll([0,-.04,.3],[.03,.024,.024],D,10),null]],MS_M.fur));
      for(const s of[1,-1]){const e=mJ(R,s>0?'eL':'eR',mG(s*.085,.1,-.02));e.rotation.z=-s*.25;hd.add(e);e.add(mMesh([[mHorn(.17,.065,F,0,10),null],[mHorn(.13,.042,[.95,.76,.76],0,8).translate(0,.01,.018),null]],MS_M.fur));}
      const jw=mJ(R,'jaw',mG(0,-.08,.1));hd.add(jw);jw.add(mMesh([[mEll([0,-.01,.07],[.05,.025,.09],F,10),null]],MS_M.fur));
      mEyes(hd,R,c,r,.48,.15,.042,.048,[.78,.52,.15],.25);
      const tl=mJ(R,'tail',mG(0,.06,-.4));tl.rotation.x=-.35;bd.add(tl);tl.add(mMesh([[mEll([0,0,-.36],[.13,.13,.4],d=>d[2]<-.72?[1,1,1]:F,20,d=>1+.08*mHash(d)),null]],MS_M.fur));
      nk.add(mScarf(R,.15,.14,.035,[0,-.0,.02],.25,false));R.head=hd;R.sph=[[bd,[0,0,0],.3],[hd,c,.17]];},
    idle(R,t){mR(R,'tail',0,.35*Math.sin(t*2.5));mR(R,'head',0,.25*Math.sin(t*.8),.15*Math.sin(t*.6));mR(R,'eL',0,0,.15*Math.max(0,Math.sin(t*3.1)));mBlink(R,t,.1);},
    sit(R,k){mSit4(R,k,[0,.5,.3],.62,1.25,2.0);mR(R,'neck',-.3*k);mR(R,'tail',.4*k);},
    enter(R,t,o){R.off.z=-o.d;mWalk4(R,t,2.6,1-mWin(o.u,.9,1),.6);mR(R,'tail',.15,.2*Math.sin(t*16));if(o.n%7==0&&o.u<.95)o.fx('snow',R.root,[0,0,.2]);mBlink(R,t);},
    touch(R,t,o){MS_SP.fox.sit(R,mWin(o.u,0,.6));mR(R,o.L?'fL':'fR',-1.3*o.u);mR(R,'head',0,0,o.s*.25*o.u);mR(R,'tail',0,.4*Math.sin(t*12));mBlink(R,t);},
    bow(R,o){const b=Math.sin(o.u*mPI);R.off.py=.55;R.off.pz=-.3;R.off.rx+=.42*b;mR(R,'fL',-.9*b);mR(R,'fR',-.9*b);mR(R,'hL',-.4*b);mR(R,'hR',-.4*b);mR(R,'neck',.2*b);mR(R,'tail',.8*b,.6*Math.sin(o.u*30));},
    wave(R,t){MS_SP.fox.sit(R,1);mR(R,'fR',-1.6-.3*Math.sin(t*10));mR(R,'tail',0,.6*Math.sin(t*12));mBlink(R,t);},
    win(R,t,o){const S=MS_SP.fox;
      if(t<.55){const u=mWin(t,0,.3);R.off.py=.5;R.off.pz=-.3;R.off.rx+=.12*u;mR(R,'hL',-.5*u);mR(R,'hR',-.5*u);mR(R,'hL2',.9*u);mR(R,'hR2',.9*u);mR(R,'eL',0,0,.25*u);mR(R,'eR',0,0,-.25*u);mR(R,'head',0,0,.3*Math.sin(t*6)*u);}
      else if(t<1.55){const u=(t-.55)/.55;if(u<1){R.off.y=mArc(u,1.1);R.off.z=u*.7;R.off.py=.6;R.off.rx=mL(-.6,1.45,u);mR(R,'fL',-1.1);mR(R,'fR',-1.1);mR(R,'tail',.5);}
        else{R.off.z=.7;R.off.y=-.08;R.off.py=.6;R.off.rx=1.5;mR(R,'tail',.3,.7*Math.sin(t*16));mR(R,'hL',.4*Math.sin(t*15));mR(R,'hR',-.4*Math.sin(t*15));}
        if(mAt(o,t,1.1)){o.fx('snow',R.root,[0,0,.9],3);o.shake(.25);o.sfx('bump');}}
      else if(t<2.6){const u=mWin(t,1.55,1.75);R.off.z=.7;R.off.y=mArc((t-1.55)/.25,.25)*(t<1.8?1:0);mR(R,'head',0,.7*Math.sin(t*28)*mBmp(t,1.85,2.45));if(mAt(o,t,1.95))o.fx('snow',R.j.head,[0,.15,0],2);mEyeK(R,mBmp(t,1.85,2.45)>0?.2:1);}
      else if(t<4.0){const u=(t-2.6)/1.4;R.off.z=.7;R.off.ry=mSm(u)*TAU*2;mWalk4(R,t,3.2,1,.55);mR(R,'tail',0,.6);if(o.n%5==0)o.fx('snow',R.root,[0,0,0]);}
      else{const u=mWin(t,4.0,4.3);R.off.z=.7;S.sit(R,u);mR(R,'head',-.25*u);mR(R,'tail',0,.6*Math.sin(t*14)*u);if(mAt(o,t,4.4))o.sfx('yip');mR(R,'jaw',.25*mBmp(t,4.4,4.7));if(t>5)mEyeK(R,.15,1);}
      mBlink(R,t);},
    lose(R,t,o){const S=MS_SP.fox;
      if(t<.6){const u=mWin(t,0,.3);mR(R,'eL',-.9*u,0,.6*u);mR(R,'eR',-.9*u,0,-.6*u);mR(R,'tail',-.5*u);mR(R,'head',.2*u);}
      else if(t<1.6){mR(R,'eL',-.9,0,.6);mR(R,'eR',-.9,0,-.6);mR(R,'tail',-.5);const k=Math.max(0,Math.sin((t-.6)*12));mR(R,'hL',.9*k);mR(R,'hR',.9*k);mR(R,'hL2',-.4*k);mR(R,'hR2',-.4*k);if(o.n%3==0)o.fx('snow',R.root,[0,0,-.5]);if(mAt(o,t,.7))o.sfx('growl');}
      else{const u=mWin(t,1.6,2.3),c=mWin(t,2.6,3.2);R.off.ry=mPI*.9*u;mR(R,'eL',-.9,0,.6);mR(R,'eR',-.9,0,-.6);
        R.off.y-=.32*c;mR(R,'fL',-1.3*c);mR(R,'fR',-1.3*c);mR(R,'fL2',.4*c);mR(R,'fR2',.4*c);mR(R,'hL',-1.1*c);mR(R,'hR',-1.1*c);mR(R,'hL2',2.0*c);mR(R,'hR2',2.0*c);mR(R,'tail',.2*c,1.6*c);mR(R,'neck',.4*c,.5*c);
        mEyeK(R,mL(1,.25,c));if(t>4.4){mEyeK(R,1.8,1);mR(R,'tail',0,.15*Math.sin(t*9));}if(mAt(o,t,4.6))o.sfx('sob');}}},
  // 흰올빼미 — flies in and lands; touches with a wing tip; wings-wide display and a flight circle when it wins; puffs up and turns its head away when it loses
  owl:{med:'ice',k0:1,cw:2.6,g:0,build(R){const W=[.97,.97,.98],D=[.2,.19,.18],sp=(d,k)=>Math.sin(d[1]*k+Math.sin(d[0]*9)*1.2)>.86&&d[2]<.55?D:W;
      const bd=mJ(R,'body',mG(0,.1,0));R.root.add(bd);
      bd.add(mMesh([[mEll([0,.36,0],[.32,.38,.3],d=>sp(d,26),28,d=>1+.06*Math.max(0,-d[1])),null],[mFin([[0,0],[.1,-.05],[.08,-.24],[0,-.27],[-.08,-.24],[-.1,-.05]],.025,W).rotateX(1.25).translate(0,.14,-.24),null]],MS_M.feather));
      const hd=mJ(R,'head',mG(0,.7,.02));bd.add(hd);const c=[0,.15,0],r=[.28,.25,.26];
      const bk=mHorn(.1,.04,[.2,.18,.18],0,8);bk.rotateX(Math.PI/2+.7);bk.translate(0,.08,.23);
      hd.add(mMesh([[mEll(c,r,d=>Math.sin(d[1]*30+d[0]*5)>.93&&d[2]<.3?D:W,26),null],[mEll([0,.13,.14],[.22,.19,.11],W,22),null],[bk,null]],MS_M.feather));
      mEyes(hd,R,[0,.15,.07],[.24,.21,.2],.36,.12,.075,.085,[.98,.78,.12]);
      for(const s of[1,-1]){const n=s>0?'wL':'wR',a=mJ(R,n,mG(s*.29,.58,-.03));a.rotation.set(.12,0,s*.05);bd.add(a);
        const f1=mFin([[0,.03],[.1,-.02],[.14,-.24],[.02,-.31],[-.07,-.15],[-.06,0]],.03,W);f1.rotateY(Math.PI/2);a.add(mMesh([[f1,null]],MS_M.feather));
        const b=mJ(R,n+'2',mG(0,-.28,0));b.rotation.x=2.75;a.add(b);const f2=mFin([[0,.02],[.12,-.04],[.1,-.3],[.02,-.4],[-.05,-.32],[-.06,-.05]],.025,W);f2.rotateY(Math.PI/2);
        const bar=[];for(let i=0;i<3;i++){const q=new mT.BoxGeometry(.034,.02,.16);q.translate(0,-.14-i*.08,-.01);bar.push([q,D]);}b.add(mMesh([[f2,null],...bar],MS_M.feather));
        const tp=mG(0,-.38,0);b.add(tp);R.tips[s>0?'L':'R']=tp;R.iks[s>0?'L':'R']=[a,b];
        const ft=mJ(R,s>0?'fL':'fR',mG(s*.12,0,.08));R.root.add(ft);const L=[[mEll([0,.05,.02],[.08,.06,.1],W,12),null]];for(let i=-1;i<=1;i++){const q=mHorn(.06,.016,D,0,6);q.rotateX(Math.PI/2+.4);q.translate(i*.035,.02,.1);L.push([q,null]);}ft.add(mMesh(L,MS_M.feather));}
      bd.add(mScarf(R,.22,.21,.042,[0,.66,.0],.05));R.head=hd;R.sph=[[bd,[0,.36,0],.33],[hd,c,.27]];},
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
      else{const u=mWin(t,4.5,4.8);MS_SP.owl.unf(R,u);mR(R,'wL',0,0,2.0*u);mR(R,'wR',0,0,-2.0*u);mR(R,'head',0,0,.15*Math.sin(t*5)*u);if(o.n%6==0)o.fx('sparkle',R.j.head,[0,.4,0]);if(t>5.0)mEyeK(R,.15,1);}
      mBlink(R,t);},
    lose(R,t,o){
      if(t<.8){const u=mWin(t,0,.5);R.off.s=1+.16*u;R.j.body.scale.set(1+.08*u,1-.06*u,1+.08*u);mEyeK(R,mL(1,.45,u));}
      else{R.off.s=1.16;R.j.body.scale.set(1.08,.94,1.08);const a=mWin(t,.8,1.2),pk=mBmp(t,2.5,3.6);mR(R,'head',0,mPI*.95*a-1.2*pk);mEyeK(R,pk>.3?.9:.45);
        if(mAt(o,t,.9))o.sfx('growl');if(t>3.6){mR(R,'wL',0,0,-.2);mR(R,'wR',0,0,.2);R.j.body.scale.y*=.95;mEyeK(R,.5);if(mAt(o,t,4.5))o.sfx('sob');}}}},
  // 정어리 — porpoises in; stands on its tail like a show dolphin to touch fins; jumps and spits a fountain when it wins; floats belly-up when it loses
  fish:{med:'water',k0:1.15,pool:1.1,cw:2.4,g:0,gt:1.2,build(R){const col=(u,v,up)=>{if(up>.5)return [.1,.28,.42];if(up>.12)return Math.abs(up-.3)<.09&&v>.42&&v<.86&&(v*17|0)%2?[.08,.14,.22]:[.32,.56,.7];return up>-.5?[.8,.85,.9]:[.93,.95,.97];};
      const bd=mJ(R,'body',mG(0,0,0));R.root.add(bd);bd.add(mMesh([[mRev(-.45,.55,v=>pkLook([[0,.08],[.1,.15],[.35,.26],[.62,.27],[.82,.21],[.93,.14],[1,.03]],v),col,.52,1),null]],MS_M.scale));
      mEyes(bd,R,[0,.05,.33],[.13,.2,.2],1.2,.15,.075,.085,[.12,.22,.36]);
      const mo=mJ(R,'mouth',mG(0,-.03,.545));bd.add(mo);mo.add(mMesh([[new mT.TorusGeometry(.045,.018,8,16),[.88,.48,.52]],[mEll([0,0,-.005],[.04,.04,.01],[.25,.05,.08],10),null]],MS_M.skin));
      const fc=[.62,.76,.86],df=mFin([[-.13,0],[.1,0],[-.03,.17],[-.11,.14]],.02,fc);df.rotateY(-Math.PI/2);df.translate(0,.25,.02);const af=mFin([[-.1,0],[.06,0],[-.08,-.1]],.02,fc);af.rotateY(-Math.PI/2);af.translate(0,-.24,-.15);
      bd.add(mMesh([[df,null],[af,null]],MS_M.scale));
      for(const s of[1,-1]){const p=mJ(R,s>0?'pfL':'pfR',mG(s*.12,-.08,.26));p.rotation.set(-.9,0,s*.6);bd.add(p);const g=mFin([[0,.02],[.05,-.03],[.04,-.16],[-.01,-.19],[-.04,-.06]],.015,fc);g.rotateY(Math.PI/2);p.add(mMesh([[g,null]],MS_M.scale));
        const tp=mG(0,-.18,0);p.add(tp);R.tips[s>0?'L':'R']=tp;R.iks[s>0?'L':'R']=[p];}
      const tl=mJ(R,'tail',mG(0,0,-.42));bd.add(tl);const cf=mFin([[0,.04],[-.12,.07],[-.34,.3],[-.29,.1],[-.22,0],[-.29,-.1],[-.34,-.3],[-.12,-.07],[0,-.04]],.02,[.4,.6,.75]);cf.rotateY(-Math.PI/2);tl.add(mMesh([[cf,null]],MS_M.scale));
      const bn=mBand(R,.075,.022,.55,1);bn.rotation.x=Math.PI/2;bn.position.z=-.36;bd.add(bn);
      R.head=mJ(R,'head',mG(0,.05,.35));bd.add(R.head);R.sph=[[bd,[0,0,.05],.3]];},
    idle(R,t){R.off.y=.03*Math.sin(t*2);mSwim(R,t,1.4,.6,1);R.j.mouth.scale.setScalar(1+.25*Math.max(0,Math.sin(t*4)));mBlink(R,t,.6);},
    upright(R,t,k,h){mR(R,'body',-1.45*k);R.off.y+=(h==null?.42:h)*k;R.off.py=0;mR(R,'tail',.35*Math.sin(t*22)*k);},
    enter(R,t,o){
      if(t<.35)R.off.y=-2.5;
      else if(t<2.0){const n=3,u=(t-.35)/1.65*n,i=Math.min(n-1,u|0),f=u-i;R.off.z=mL(-.95,.05,(t-.35)/1.65);R.off.y=mArc(f,.45+.15*(i===1))-.12;mR(R,'body',mL(-.9,.9,f));mSwim(R,t,2.2,1,1);
        if(f<.06&&o.n%2==0)o.splash(R,0,0,.5);if(mAt(o,t,.36)||mAt(o,t,.9)||mAt(o,t,1.45))o.sfx('plop');}
      else{mSwim(R,t,1.6,.8,1);}mBlink(R,t);},
    touch(R,t,o){MS_SP.fish.upright(R,t,o.u);mR(R,o.L?'pfL':'pfR',-.8*o.u,0,o.s*.3*o.u);if(o.u>.5&&o.n%4==0)o.splash(R,0,0,.25);mBlink(R,t);},
    bow(R,o){const b=Math.sin(o.u*mPI);mR(R,'body',.7*b);R.off.y-=.12*b;mR(R,'tail',0,.6*Math.sin(o.u*25)*b);},
    wave(R,t){MS_SP.fish.upright(R,t,1,.36);mR(R,'pfR',-.5,0,-.4-.5*Math.sin(t*14));mBlink(R,t);},
    win(R,t,o){const S=MS_SP.fish;
      if(t<2.4){const n=3,u=t/2.4*n,i=Math.min(n-1,u|0),f=u-i,dir=i%2?-1:1;R.off.x=mL(-.55*dir,.55*dir,f);R.off.y=mArc(f,1.0)-.1;R.off.ry=dir*mPI/2;mR(R,'body',mL(-1.0,1.0,f));R.off.rz=f*TAU*(i===1?1:0);mSwim(R,t,2.6,1,1);
        if(f<.04||f>.96){if(o.n%2==0)o.splash(R,0,0,.6);}if(mAt(o,t,.05)||mAt(o,t,.85)||mAt(o,t,1.65))o.sfx('plop');}
      else if(t<3.6){const u=(t-2.4)/1.2;S.upright(R,t,mWin(t,2.4,2.6)*(1-mWin(t,3.4,3.6)),.5);R.off.z=mL(.3,-.4,u)*.6;if(o.n%2==0)o.splash(R,0,0,.4);}
      else{const u=mWin(t,3.6,3.9);S.upright(R,t,u,.25);mR(R,'body',.6*u);mEyeK(R,mL(1,.3,u));if(t>3.9&&t<5.2&&o.n%2==0)o.fx('fountain',R.j.mouth);R.j.mouth.scale.setScalar(1.3);}
      mBlink(R,t);},
    lose(R,t,o){
      if(t<.8){mEyeK(R,1.3);R.off.y=.03*Math.sin(t*20);}
      else if(t<2.7){const u=mWin(t,.8,1.2);R.off.rz=mPI*u+.25*Math.sin(t*2)*u;R.off.y=.06*u;R.off.ry=.6*Math.sin(t*.9)*u;mEyeK(R,.15+.85*(1-u));if(o.n%9==0)o.fx('bubble',R.j.mouth);}
      else if(t<3.4){const u=mWin(t,2.7,2.9);R.off.rz=mPI*(1-u);R.off.y=mArc((t-2.7)/.45,.35);if(mAt(o,t,2.95)){o.splash(R,0,0,1);o.sfx('splash');}}
      else{const u=mWin(t,3.4,3.9);R.off.y=-.16*u;R.off.ry=-.7*u;mR(R,'tail',0,.2*Math.sin(t*3));mEyeK(R,.6);if(o.n%10==0)o.fx('bubble',R.j.mouth);R.j.mouth.scale.setScalar(1+.3*Math.max(0,Math.sin(t*5)));}}},
  // 일각고래 — leaps in; spy-hops (horn to the sky) to touch with a fin; shows itself off when it wins; thrashes its horn wildly when it loses
  narwhal:{med:'water',k0:.85,pool:1.3,cw:2.8,g:0,gt:1.25,build(R){const base=[.58,.63,.69],dk=[.33,.37,.43],lt=[.86,.88,.9],col=(u,v,up)=>up<-.35?lt:(Math.sin(u*41+v*67)*Math.sin(v*53+u*13)>.42&&up>-.1?dk:base);
      const bd=mJ(R,'body',mG(0,-.05,0));R.root.add(bd);bd.add(mMesh([[mRev(-.3,1.0,v=>pkLook([[0,.36],[.3,.4],[.62,.38],[.8,.33],[.9,.28],[.96,.2],[.99,.1],[1,.02]],v),col,1,.95),null],
        ...[0,1,2,3].map(i=>[mEll([0,.36-.01*i,-.05-i*.12],[.03,.025,.05],dk,8),null])],MS_M.skin));
      const tl=mJ(R,'tail',mG(0,0,-.3));bd.add(tl);tl.add(mMesh([[mRev(-1.05,.02,v=>pkLook([[0,.06],[.15,.09],[.5,.21],[.85,.34],[1,.36]],v),col,1,.95),null]],MS_M.skin));
      const fl=mJ(R,'fluke',mG(0,0,-1.03));tl.add(fl);for(const s of[1,-1]){const g=mFin([[0,.03],[s*.14,0],[s*.38,-.08],[s*.52,.03],[s*.47,-.2],[s*.1,-.08]],.03,dk);g.rotateX(Math.PI/2);fl.add(mMesh([[g,null]],MS_M.skin));}
      for(const s of[1,-1]){const p=mJ(R,s>0?'pfL':'pfR',mG(s*.3,-.2,.55));p.rotation.set(-.5,0,s*.85);bd.add(p);const g=mFin([[0,.03],[.08,-.03],[.1,-.2],[.13,-.31],[.02,-.3],[-.05,-.07]],.03,dk);g.rotateY(Math.PI/2);p.add(mMesh([[g,null]],MS_M.skin));
        const tp=mG(0,-.3,0);p.add(tp);R.tips[s>0?'L':'R']=tp;R.iks[s>0?'L':'R']=[p];}
      const hn=mJ(R,'horn',mG(.06,.07,.95));hn.rotation.x=Math.PI/2-.2;bd.add(hn);hn.add(mMesh([[mHorn(1.3,.055,(u,v)=>{const q=.86+.08*Math.sin(u*TAU*2+v*44);return [q,q*.97,q*.88];},44,22),null]],MS_M.ivory));
      const hb=mBand(R,.07,.02);hb.position.y=.04;hn.add(hb);const ht=mG(0,1.3,0);hn.add(ht);R.ex.horn=hn;R.ex.hornTip=ht;
      mEyes(bd,R,[0,.02,.72],[.34,.33,.3],.95,.22,.05,.06,[.1,.1,.12]);mSmile(bd,R,[0,-.05,.86],[.22,.22,.18],-.3,.08);
      R.head=mJ(R,'head',mG(0,.1,.75));bd.add(R.head);const bh=mG(0,.36,.55);bd.add(bh);R.ex.spout=bh;R.sph=[[bd,[0,0,.35],.4],[bd,[0,.05,.8],.3]];},
    idle(R,t){R.off.y=.035*Math.sin(t*1.5);mSwim(R,t,.75,.6);mBlink(R,t,.8);},
    spy(R,k,h){mR(R,'body',-1.3*k);R.off.y+=(h==null?.5:h)*k;mR(R,'tail',.25*k);},
    enter(R,t,o){
      if(t<.3)R.off.y=-2.6;
      else if(t<1.9){const u=(t-.3)/1.6,i=u<.5?0:1,f=(u-i*.5)*2;R.off.z=mL(-1.05,.05,u);R.off.y=mArc(f,.75)-.2;mR(R,'body',mL(-.85,.85,f));mSwim(R,t,1.4,.8);
        if(mAt(o,t,.32)||mAt(o,t,1.1)||mAt(o,t,1.88)){o.splash(R,0,0,.9);o.sfx('splash');}}
      else{mSwim(R,t,1,1);}mBlink(R,t);},
    touch(R,t,o){MS_SP.narwhal.spy(R,o.u);mSwim(R,t,.6,.3);mR(R,o.L?'pfL':'pfR',-1.0*o.u,0,-o.s*.35*o.u);mBlink(R,t);},
    // a horned whale salutes instead of nodding (a nod would point the horn at the partner): spy-hop, horn up, a little dip of the whole body
    bow(R,o){const b=Math.sin(o.u*mPI);MS_SP.narwhal.spy(R,b,.35);R.off.y-=.18*Math.sin(o.u*mPI*2)*b;mR(R,'pfL',0,0,.5*b);mR(R,'pfR',0,0,-.5*b);},
    wave(R,t){MS_SP.narwhal.spy(R,1,.4);mR(R,'pfR',-.4,0,-.5-.45*Math.sin(t*10));mBlink(R,t);},
    win(R,t,o){const S=MS_SP.narwhal;
      if(t<1.2){const u=mWin(t,0,.5);S.spy(R,u,.95);mR(R,'body',.18*u);mR(R,'pfL',0,0,.9*u);mR(R,'pfR',0,0,-.9*u);mEyeK(R,mL(1,.55,u));if(mAt(o,t,.5)){o.sfx('chime');}if(t>.45&&o.n%2==0)o.fx('sparkle',R.ex.hornTip);}
      else if(t<2.6){const u=(t-1.2)/1.4;S.spy(R,1,.95);R.off.ry=mSm(u)*TAU*2;R.off.rz=.22*Math.sin(u*TAU*2);R.off.rx=.12*Math.cos(u*TAU*2);mR(R,'pfL',0,0,1.0);mR(R,'pfR',0,0,-1.0);if(o.n%2==0)o.fx('sparkle',R.ex.hornTip);
        if(o.n%5==0)o.splash(R,0,0,.25);}
      else if(t<3.8){const u=(t-2.6)/1.2;R.off.x=mL(-.6,.6,u);R.off.ry=-mPI/2;R.off.y=mArc(u,1.3)-.15;mR(R,'body',mL(-1.1,1.1,u));mSwim(R,t,1.8,1);if(mAt(o,t,2.62)||mAt(o,t,3.75)){o.splash(R,0,0,1.2);o.sfx('splash');}}
      else{const u=mWin(t,3.8,4.2);S.spy(R,u,.9);R.off.x=.6*(1-u);mR(R,'body',.15*u);mR(R,'pfL',0,0,.7*u);mR(R,'pfR',.0,0,-(.6+.35*Math.sin(t*9))*u);R.off.rz=.12*Math.sin(t*2.5)*u;if(o.n%3==0)o.fx('sparkle',R.ex.hornTip);if(t>4.6){mEyeK(R,.15,1);mR(R,'body',0,0,0);}if(mAt(o,t,4.7))o.sfx('chime');}
      mBlink(R,t);},
    lose(R,t,o){const S=MS_SP.narwhal;
      if(t<.6){const u=mWin(t,0,.3);S.spy(R,u*.6,.4);mEyeK(R,1.3);}
      else if(t<3.4){const k=mWin(t,.6,.8)*(1-mWin(t,3.2,3.4));S.spy(R,.55,.42);const a=Math.sin((t-.6)*3.1*TAU),b=Math.sin((t-.6)*2.6*TAU+1);
        R.off.rz=.75*a*k;R.off.ry=.6*b*k;mR(R,'body',.2*Math.sin((t-.6)*4.4*TAU)*k);mR(R,'pfL',0,0,(.6+.8*a)*k);mR(R,'pfR',0,0,-(.6-.8*a)*k);mR(R,'tail',.5*Math.sin(t*20)*k);
        mEyeK(R,.6);if(o.n%2==0)o.splash(R,mL(-.5,.5,mRnd()),mL(-.2,.6,mRnd()),.5*k);if(Math.sin((t-o.dt-.6)*3.1*TAU)*a<0){o.sfx('splash');o.shake(.18);}}
      else{const u=mWin(t,3.4,4.0);R.off.y=mL(-.05,-.22,u)+.025*Math.sin(t*14);mR(R,'body',.28*u);mR(R,'pfL',0,0,-.2*u);mR(R,'pfR',0,0,.2*u);mEyeK(R,.45);
        if(t>4.6&&t<5.2){R.off.rz=.3*mBmp(t,4.6,5.2);}if(mAt(o,t,4.3))o.sfx('sob');if(o.n%9==0)o.fx('bubble',R.head);}}},
  // 눈꽃 — floats down in a snowfall; touches with a crystal arm; spins, grows and flips when it wins; melts into a puddle when it loses
  flake:{med:'air',k0:1,cw:2.2,g:0,flat:1,build(R){const I=[.8,.92,1],I2=[.95,.99,1],bd=mJ(R,'body',mG(0,1.15,0));R.root.add(bd);
      const hx=new mT.CylinderGeometry(.24,.24,.13,6);hx.rotateX(Math.PI/2);hx.rotateZ(Math.PI/6);bd.add(mMesh([[hx,I2]],MS_M.ice));
      for(const s of[1,-1]){const e=mEye(.045,.052,[.2,.45,.75]);e.position.set(s*.085,.035,.072);bd.add(e);R.eyes.push(e);}
      const sm=new mT.TorusGeometry(.05,.008,6,12,Math.PI*.8);sm.rotateZ(Math.PI*1.1);sm.translate(0,-.045,.075);const sme=new mT.Mesh(sm,PK_MAT.vc);const sa=new Float32Array(sm.attributes.position.count*3);sa.fill(.15);sm.setAttribute('color',new mT.BufferAttribute(sa,3));bd.add(sme);R.ex.mouth=sme;
      const rg=mJ(R,'ring',mG());bd.add(rg);const arm=[[mFin([[0,0],[.05,.1],[.035,.48],[0,.6],[-.035,.48],[-.05,.1]],.035,I),null]];
      for(const y of[.2,.36])for(const s of[1,-1]){const b=mFin([[0,0],[.022,.04],[0,.17-y*.18],[-.022,.04]],.025,I2);b.rotateZ(-s*.95);b.translate(0,y,0);arm.push([b,null]);}
      const ag=pkMerge(arm);for(let k=0;k<6;k++){const a=mJ(R,'a'+k,mG(Math.cos(k*mPI/3)*.2,Math.sin(k*mPI/3)*.2,0));a.rotation.z=k*mPI/3-mPI/2;rg.add(a);const m=new mT.Mesh(ag,MS_M.ice);m.castShadow=true;a.add(m);const tp=mG(0,.6,0);a.add(tp);R.ex['tip'+k]=tp;}
      const bw=[];for(const s of[1,-1]){const q=new mT.TorusGeometry(.04,.016,6,10);q.scale(1.3,.8,1);q.translate(s*.05,0,0);bw.push([q,R.tc]);}bw.push([mEll([0,0,0],[.025,.025,.025],R.acc,8),null]);const bwm=mMesh(bw,MS_M.skin);bwm.position.set(0,.3,.04);R.j.a1.add(bwm);
      const pd=mJ(R,'puddle',new mT.Mesh(mWaterDisc(.55,28),MS_M.water));pd.position.y=.01;pd.scale.setScalar(.001);R.root.add(pd);
      R.tips={L:R.ex.tip0,R:R.ex.tip3};R.iks={L:[rg],R:[rg]};R.head=bd;R.sph=[[bd,[0,0,0],.75]];},
    idle(R,t,o){R.off.y=.06*Math.sin(t*1.6);mR(R,'ring',0,0,t*.35);mR(R,'body',.08*Math.sin(t*1.1));mBlink(R,t,.2);if(o&&o.n%25==0)o.fx('sparkle',R.ex['tip'+(o.n/25%6|0)]);},
    enter(R,t,o){const u=mWin(t,.2,2.0);R.off.y=mL(5.5,0,1-Math.pow(1-u,2));mR(R,'ring',0,0,(1-u)*14+t*.4);R.off.rz=.3*Math.sin(t*3)*(1-u);if(mAt(o,t,2.0)){o.fx('sparkle',R.j.body,[0,0,0],12);o.sfx('chime');}mBlink(R,t);},
    touch(R,t,o){R.off.y=.04*Math.sin(t*2);mR(R,'body',0,0,(o.side<0?-1:1)*.15*o.u);mBlink(R,t);if(o.n%8==0)o.fx('sparkle',R.touch);},
    bow(R,o){const b=Math.sin(o.u*mPI);mR(R,'body',.55*b);mR(R,'ring',0,0,o.u*mPI/3);},
    wave(R,t,o){mR(R,'ring',0,0,t*3);R.off.y=.08*Math.sin(t*4);mBlink(R,t);},
    win(R,t,o){const S=MS_SP.flake;
      if(t<2.0){const u=t/2;mR(R,'ring',0,0,mSm(u)*TAU*4);R.off.y=.45*mSm(u);if(o.n%2==0)o.fx('sparkle',R.ex['tip'+(o.n%6)]);if(mAt(o,t,.1))o.sfx('chime');}
      else if(t<3.2){const u=mWin(t,2.0,2.5);R.off.y=.45;for(let k=0;k<6;k++)R.j['a'+k].scale.y=1+.38*u;if(mAt(o,t,2.2)){o.sfx('chime');o.flash();o.fx('sparkle',R.j.body,[0,0,0],16);}}
      else if(t<4.4){const u=(t-3.2)/1.2;R.off.y=.45;for(let k=0;k<6;k++)R.j['a'+k].scale.y=1.38;mR(R,'body',mSm(u)*TAU);mR(R,'ring',0,0,u*2);}
      else{R.off.y=.45+.06*Math.sin(t*3);for(let k=0;k<6;k++){R.j['a'+k].scale.y=1.38-.38*mWin(t,5.0,5.5);mR(R,'a'+k,0,0,.15*Math.sin(t*6+k));}mEyeK(R,.35);if(o.n%3==0)o.fx('sparkle',R.ex['tip'+(o.n%6)]);}
      mBlink(R,t);},
    lose(R,t,o){const S=MS_SP.flake;
      if(t<.8){R.off.x=.02*Math.sin(t*60);mEyeK(R,1.2);if(o.n%6==0)o.fx('drip',R.j.body,[0,-.2,0]);}
      else{const u=mWin(t,.8,3.6);R.off.y=-.62*u;R.off.s=1-.3*u;for(let k=0;k<6;k++){const a=R.j['a'+k],side=Math.cos(k*mPI/3+mPI/2);mR(R,'a'+k,0,0,side*.7*u);a.scale.y=1-.25*u;}
        R.j.puddle.scale.setScalar((.05+1.0*u)/R.off.s);R.j.puddle.position.y=(.012-R.off.y)/(R.off.s*R.k0);mEyeK(R,mL(1,.5,u));R.ex.mouth.scale.y=-1;
        if(o.n%3==0&&t<3.8)o.fx('drip',R.ex['tip'+(o.n%6)]);if(mAt(o,t,4.4))o.sfx('sob');}}},
  // 빙산 — rises out of the water; touches with an ice ledge; grows a crystal spire when it wins; cracks and calves when it loses
  berg:{med:'water',k0:.8,pool:1.2,cw:2.6,g:0,build(R){const bd=mJ(R,'body',mG(0,0,0));R.root.add(bd);
      const pk=(c,r,s,det)=>{const g=new mT.IcosahedronGeometry(1,det==null?1:det);g.scale(r[0],r[1],r[2]);const p=g.attributes.position,n=p.count,a=new Float32Array(n*3);
        for(let i=0;i<n;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),q=mHash([x*3+s,y*3,z*3])*.16-.08;p.setXYZ(i,x*(1+q)+c[0],y*(1+q)+c[1],z*(1+q)+c[2]);
          const Y=y*(1+q)+c[1];a.set(Y>1.05||(Y>.8&&mHash([x,y,z])>.6)?[.97,.99,1]:[mL(.42,.74,Math.max(0,Math.min(1,(Y+.3)/1.3))),mL(.68,.9,Math.max(0,Math.min(1,(Y+.3)/1.3))),mL(.86,.99,Math.max(0,Math.min(1,(Y+.3)/1.3)))],i*3);}
        g.setAttribute('color',new mT.BufferAttribute(a,3));g.computeVertexNormals();return g;};
      bd.add(mMesh([[pk([0,.55,0],[.78,.95,.68],1),null],[pk([.52,.38,.14],[.42,.6,.42],2),null],[pk([-.5,.3,.05],[.46,.55,.45],3),null],[pk([.05,1.22,-.05],[.3,.38,.28],4),null]],MS_M.berg));
      const ck=mJ(R,'chunk',mG(-.42,.95,.12));bd.add(ck);ck.add(mMesh([[pk([0,0,0],[.26,.3,.24],6,0),null]],MS_M.berg));
      for(const s of[1,-1]){const e=mEye(.07,.08,[.15,.35,.6]);e.position.set(s*.17,.86,.63);e.rotation.y=s*.18;bd.add(e);R.eyes.push(e);}
      const sm=new mT.TorusGeometry(.09,.014,6,14,Math.PI*.8);sm.rotateZ(Math.PI*1.1);sm.translate(0,.7,.66);const sa=new Float32Array(sm.attributes.position.count*3);sa.fill(.12);sm.setAttribute('color',new mT.BufferAttribute(sa,3));const sme=new mT.Mesh(sm,PK_MAT.vc);bd.add(sme);R.ex.mouth=sme;
      for(const s of[1,-1]){const l=mJ(R,s>0?'lL':'lR',mG(s*.72,.45,.12));bd.add(l);l.add(mMesh([[pk([s*.08,0,0],[.22,.16,.22],5+s,0),null]],MS_M.berg));const tp=mG(s*.26,0,.04);l.add(tp);R.tips[s>0?'L':'R']=tp;R.iks[s>0?'L':'R']=[l];}
      const fg=mJ(R,'flag',mG(.05,1.52,-.05));bd.add(fg);const pole=new mT.CylinderGeometry(.015,.015,.6,6);pole.translate(0,.3,0);
      const fs=new mT.Shape();fs.moveTo(0,0);fs.lineTo(.36,-.1);fs.lineTo(0,-.22);const fgeo=new mT.ShapeGeometry(fs);fgeo.translate(.015,.6,0);const fa=new Float32Array(fgeo.attributes.position.count*3);
      for(let i=0;i<fgeo.attributes.position.count;i++)fa.set(fgeo.attributes.position.getY(i)>.49&&fgeo.attributes.position.getY(i)<.53?R.acc:R.tc,i*3);fgeo.setAttribute('color',new mT.BufferAttribute(fa,3));
      fg.add(mMesh([[pole,[.75,.78,.82]]],PK_MAT.metal));const fm=new mT.Mesh(fgeo,new mT.MeshStandardMaterial({vertexColors:true,side:mT.DoubleSide,roughness:.8}));fm.castShadow=true;fg.add(fm);R.ex.flagCloth=fm;
      const sp=mJ(R,'spire',mG(-.1,1.45,0));bd.add(sp);sp.add(mMesh([[mHorn(.75,.14,(u,v)=>[.85+.15*v,.95,1],0,8),null]],MS_M.ice));sp.scale.setScalar(.001);
      R.head=mJ(R,'head',mG(0,.82,.55));bd.add(R.head);R.sph=[[bd,[0,.6,0],.75]];},
    idle(R,t){R.off.y=.035*Math.sin(t*1.2);R.off.rz=.03*Math.sin(t*.9);mR(R,'flag',0,.3*Math.sin(t*3));mBlink(R,t,.5);},
    enter(R,t,o){const u=mWin(t,.3,1.9);R.off.y=mL(-2.3,0,1-Math.pow(1-u,2))+.06*Math.sin(t*4)*u;R.off.rz=.08*Math.sin(t*3)*(1-u);if(mAt(o,t,.35)){o.sfx('crack');o.shake(.3);}
      if(t>.6&&t<1.9&&o.n%2==0)o.fx('cascade',R.root,[mL(-.7,.7,mRnd()),1.1*u,mL(-.5,.5,mRnd())]);if(mAt(o,t,1.85)){o.splash(R,0,0,1.2);o.sfx('splash');}mR(R,'flag',0,.4*Math.sin(t*5));mBlink(R,t);},
    touch(R,t,o){R.off.rz=-o.s*.12*o.u;mR(R,o.L?'lL':'lR',0,-o.s*.3*o.u,o.s*.5*o.u);mR(R,'flag',0,.3*Math.sin(t*3));mBlink(R,t);},
    bow(R,o){const b=Math.sin(o.u*mPI);R.off.rx=.3*b;R.off.py=.2;if(b>.6&&o.n%6==0)o.fx('snow',R.j.body,[0,1.3,.3]);},
    wave(R,t){mR(R,'lR',0,0,-.9-.4*Math.sin(t*9));mR(R,'flag',0,.3*Math.sin(t*3));mBlink(R,t);},
    win(R,t,o){
      if(t<1.5){const u=mWin(t,0,.6);R.off.y=.5*u;R.off.rz=.1*Math.sin(t*5)*u;mR(R,'flag',0,.8*Math.sin(t*9));if(t>.2&&t<1.2&&o.n%3==0)o.fx('cascade',R.root,[mL(-.6,.6,mRnd()),.9,mL(-.4,.4,mRnd())]);}
      else if(t<3.0){R.off.y=.5;const u=mWin(t,1.5,2.4);R.j.spire.scale.setScalar(.001+u);if(mAt(o,t,1.6))o.sfx('chime');if(o.n%2==0&&u<1)o.fx('sparkle',R.j.spire,[0,.7*u,0]);if(mAt(o,t,2.4)){o.flash();o.fx('sparkle',R.j.spire,[0,.75,0],14);}mR(R,'flag',0,.5*Math.sin(t*7));}
      else if(t<4.4){R.j.spire.scale.setScalar(1);const b=Math.abs(Math.sin((t-3)*5));R.off.y=.5-.4*b;if(Math.sin((t-o.dt-3)*5)*Math.sin((t-3)*5)<0){o.splash(R,0,0,1);o.sfx('splash');o.shake(.25);}}
      else{R.j.spire.scale.setScalar(1);const u=mWin(t,4.4,4.7);R.off.y=.5;mR(R,'lL',0,0,1.0*u+.2*Math.sin(t*8)*u);mR(R,'lR',0,0,-1.0*u-.2*Math.sin(t*8)*u);mEyeK(R,.35);if(o.n%4==0)o.fx('sparkle',R.j.spire,[0,.75,0]);}
      mBlink(R,t);},
    lose(R,t,o){
      if(t<.8){R.off.x=.02*Math.sin(t*70)*mWin(t,0,.3);if(mAt(o,t,.2)){o.sfx('crack');o.shake(.25);}mEyeK(R,1.25);}
      else if(t<2.6){const u=mWin(t,.8,2.3),c=R.j.chunk;c.position.x-=.3*u;c.position.y-=1.25*u*u;c.rotation.z+=1.4*u;c.rotation.x+=.6*u;if(mAt(o,t,1.0))o.sfx('crack');if(mAt(o,t,2.25)){o.splash(R,-.6,.2,1.3);o.sfx('splash');o.shake(.4);}mEyeK(R,1.2);}
      else{const c=R.j.chunk;c.position.x-=.3;c.position.y-=1.12;c.rotation.z+=1.4;c.rotation.x+=.6;c.position.y+=.03*Math.sin(t*2);const u=mWin(t,2.6,3.8);R.off.rz=.3*u;R.off.y=-.45*u+.03*Math.sin(t*1.5);mR(R,'flag',.5*u,0,.6*u);mEyeK(R,.5);R.ex.mouth.scale.y=-1;if(mAt(o,t,4.2))o.sfx('sob');}}},
  // 번개 — strikes down from its storm cloud; touches with a zigzag spike (a spark); calls down a ring of strikes when it wins; its cloud rains it out when it loses
  bolt:{med:'air',k0:1,cw:2.6,g:.6,flat:1,build(R){const mat=rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.35,emissive:0xffb400,emissiveIntensity:.6}),.8);R.ex.mat=mat;
      const bd=mJ(R,'body',mG(0,.12,0));R.root.add(bd);const s=new mT.Shape();[[-.05,1.36],[.4,1.36],[.13,.86],[.37,.86],[-.2,-.02],[.0,.62],[-.25,.62]].forEach((q,i)=>i?s.lineTo(q[0]-.07,q[1]):s.moveTo(q[0]-.07,q[1]));
      const g=new mT.ExtrudeGeometry(s,{depth:.16,bevelEnabled:true,bevelThickness:.05,bevelSize:.045,bevelSegments:3,curveSegments:4});g.translate(0,0,-.08);const p=g.attributes.position,a=new Float32Array(p.count*3);
      for(let i=0;i<p.count;i++){const k=Math.max(0,Math.min(1,p.getY(i)/1.36));a.set([1,mL(.7,.93,k),mL(.08,.38,k)],i*3);}g.setAttribute('color',new mT.BufferAttribute(a,3));const bm=new mT.Mesh(g,mat);bm.castShadow=true;bd.add(bm);
      for(const x of[.03,.2]){const e=mEye(.045,.052,[.35,.2,.05]);e.position.set(x,1.12,.135);bd.add(e);R.eyes.push(e);}
      const sm=new mT.TorusGeometry(.055,.01,6,12,Math.PI*.8);sm.rotateZ(Math.PI*1.1);sm.translate(.115,1.0,.14);const sa=new Float32Array(sm.attributes.position.count*3);sa.fill(.25);sm.setAttribute('color',new mT.BufferAttribute(sa,3));const sme=new mT.Mesh(sm,PK_MAT.vc);bd.add(sme);R.ex.mouth=sme;
      const tp=mG(.33,.86,0),tn=mG(-.35,.62,0);bd.add(tp);bd.add(tn);R.ex.tipP=tp;R.ex.tipN=tn;R.tips={L:tp,R:tn};R.iks={L:[bd],R:[bd]};
      const cl=mJ(R,'cloud',mG(.06,2.05,0));R.root.add(cl);const C=[.42,.45,.53],C2=[.58,.61,.68];cl.add(mMesh([[mEll([0,0,0],[.34,.2,.22],C,16),null],[mEll([.3,-.03,.02],[.23,.16,.18],C,14),null],[mEll([-.29,-.04,0],[.21,.15,.17],C,14),null],[mEll([.06,.12,0],[.23,.16,.18],C2,14),null]],MS_M.cloud));
      bd.add(mScarf(R,.14,.11,.034,[.07,.95,0],0,false));R.head=mJ(R,'head',mG(.11,1.08,.1));bd.add(R.head);R.sph=[[bd,[.05,.7,0],.42]];},
    glow(R,v,t){R.ex.mat.emissiveIntensity=v;},
    idle(R,t,o){R.off.y=.05*Math.sin(t*2);MS_SP.bolt.glow(R,.55+.15*Math.sin(t*9));R.j.cloud.position.x+=.05*Math.sin(t*.7);if(o&&o.n%17==0)o.fx('spark',R.j.body,[mL(-.2,.3,mRnd()),mL(.1,1.3,mRnd()),0]);mBlink(R,t,.4);},
    enter(R,t,o){const S=MS_SP.bolt;const c=mWin(t,.05,.45);R.j.cloud.scale.setScalar(.001+c);R.j.cloud.position.y+=(1-c)*2;
      if(t<.55){R.off.s=.001;}else{R.off.s=Math.min(1,.4+(t-.55)*4);S.glow(R,mL(2.5,.6,mWin(t,.55,1.3)));if(o.n%3==0&&t<1.3)o.fx('spark',R.j.body,[0,.4,0]);}
      if(mAt(o,t,.55))o.strike(R,0,0);mBlink(R,t);},
    touch(R,t,o){const S=MS_SP.bolt;mR(R,'body',0,0,(o.side<0?-1:1)*.12*o.u);S.glow(R,.6+.4*o.u);if(o.u>.9&&o.n%3==0)o.fx('spark',R.touch);mBlink(R,t);},
    bow(R,o){const b=Math.sin(o.u*mPI);mR(R,'body',.45*b);},
    wave(R,t,o){mR(R,'body',0,0,.15*Math.sin(t*10));MS_SP.bolt.glow(R,.8);mBlink(R,t);},
    win(R,t,o){const S=MS_SP.bolt;
      if(t<.6){S.glow(R,.6+2*t);R.off.x=.02*Math.sin(t*70);if(o.n%2==0)o.fx('spark',R.j.body,[0,.6,0]);}
      else if(t<3.0){const i=Math.floor((t-.6)/.6),f=(t-.6)/.6-i;S.glow(R,1.2+1.2*(1-f));R.off.y=mArc(f,.25);const SP=[[0,-1.0],[-1.0,.35],[.85,.5],[.2,1.0]];for(let k=0;k<4;k++)if(mAt(o,t,.6+k*.6))o.strike(R,SP[k][0],SP[k][1]);}
      else if(t<4.2){const u=(t-3)/1.2;R.off.x=.45*Math.sign(Math.sin(u*mPI*5))*mSm(Math.abs(Math.sin(u*mPI*5)));R.off.y=.15*Math.abs(Math.sin(u*mPI*5));S.glow(R,1.4);if(o.n%2==0)o.fx('spark',R.j.body,[0,.6,0]);if(mAt(o,t,3.1))o.sfx('zap');}
      else{S.glow(R,1.0+.3*Math.sin(t*12));mR(R,'body',0,0,.12*Math.sin(t*4));mEyeK(R,.35);if(o.n%4==0)o.fx('spark',R.j.body,[mL(-.2,.3,mRnd()),mL(.2,1.3,mRnd()),0]);if(t>5)mEyeK(R,.4,1);}
      mBlink(R,t);},
    lose(R,t,o){const S=MS_SP.bolt;
      if(t<.6){S.glow(R,(t*20|0)%2?.1:.8);mEyeK(R,1.2);}
      else{const u=mWin(t,.6,3.4);S.glow(R,mL(.6,.04,u)*((t*14|0)%5===0&&u<.9?.2:1));mR(R,'body',.3*u);R.off.y=-.06*u;R.j.body.scale.y=1-.1*u;R.j.cloud.position.y-=.25*mWin(t,.6,1.2);
        if(o.n%1==0&&t<4.8)o.fx('rain',R.j.cloud,[mL(-.35,.35,mRnd()),-.1,mL(-.15,.15,mRnd())]);if(t>3.4&&t<4.4&&o.n%4==0)o.fx('smoke',R.j.body,[.1,1.4,0]);if(mAt(o,t,3.6))o.sfx('zap');if(mAt(o,t,4.4))o.sfx('sob');mEyeK(R,.45);R.ex.mouth.scale.y=-1;}}}
};
// --- build one mascot (cached per team + kit + mascot) ---
function mBody(teamKey,_,mas){const S=MS_SP[mas],k=mKitOf(teamKey,mas),R={root:mG(),sp:mas,team:teamKey,j:{},eyes:[],ex:{},sph:[],tips:{},iks:{},tc:mCol(k.c1),acc:mCol(k.c2),k0:S.k0||1,med:S.med};
  mRs=7+KIT.mas.indexOf(mas)*13;S.build(R,k);if(!R.iks.L)R.iks=null;
  for(const n in R.j){const o=R.j[n];o.userData.r0=[o.position.clone(),o.rotation.clone(),o.scale.clone()];}
  for(const e of R.eyes)if(e.userData.pu)e.userData.pu0=e.userData.pu.position.clone();
  R.root.traverse(o=>{if(o.isMesh&&o.castShadow!==false)o.castShadow=true;});mRest(R);R.root.scale.setScalar(R.k0);return R;}
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
function mascStrike(x,z){const N=12,H=9,pts=[],px=x+rnd(-.9,.9),pz=z+rnd(-.6,.6);for(let i=0;i<=N;i++){const k=i/N,j=i&&i<N;pts.push(mV(mL(px,x,k)+(j?rnd(-.32,.32):0),H*(1-k),mL(pz,z,k)+(j?rnd(-.25,.25):0)));}
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
function mascRig(key,team,mas){const k=team+mas+kitSig(mKitOf(team,mas))+pkLo();let R=MS_RIG[key];if(R&&R.k===k)return R;if(R){scene.remove(R.root);if(R.pool)scene.remove(R.pool);}
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
function mascSpots(A,B){const L=[[A,-1],[B,1]],O=side=>({u:1,side,n:0,dt:0});
  for(const [R,side] of L){mPose(R,'touch',.8,O(side));mPlace(R,{x:0,z:0,yaw:mascYaw(R,side)});R.root.updateMatrixWorld(true);const p=R.touch.getWorldPosition(mV());R.gs={x:-p.x,z:-p.z,y:p.y};}
  const y=Math.max(.45,Math.min(1.25,(A.gs.y+B.gs.y)/2)),M=mV(0,y,0);
  const fit=()=>{for(const [R,side] of L){mPose(R,'touch',.8,O(side));mPlace(R,{x:R.gs.x,z:R.gs.z,yaw:mascYaw(R,side)});mTouchTo(R,M,1,null,true);}};
  // limbs: where the bent limb really ends up at that height, so nobody has to shuffle while touching
  for(let k=0;k<4;k++){for(let it=0;it<3;it++){fit();for(const [R] of L){const p=R.touch.getWorldPosition(mV());R.gs.x-=p.x;R.gs.z-=p.z;}}
    fit();const g=mascGap(A,B);if(g>=.1)break;const d=(.13-g)/2;A.gs.x-=d;B.gs.x+=d;}
  return {y};}
// kind: 'intro' | 'end' | 'preview'; o.res: 'win' | 'lose' | 'draw' (my side), o.cb when it is over
function mascStart(kind,cfg,o){o=o||{};if(G.masc)mascEnd(false);
  const pr=o.pair||mascPair(cfg),A=mascRig('A',pr.mine,pr.my),B=mascRig('B',pr.oth,pr.op),key=pr.my+'|'+pr.op;
  let quick=!!(kind==='intro'&&(mascMode()==='short'||MS_SESS[key]));if(kind==='intro')MS_SESS[key]=1;
  const dur=kind==='intro'?(quick?MSC.introQ:MSC.intro):kind==='preview'?(o.dur||MSC.end+.6):MSC.end,res=o.res||'win';
  const sp=mascSpots(A,B),gr=kind==='intro'||res==='draw';
  // stage: greeting spots in the middle, or side by side towards the camera for the end
  for(const [R,side] of[[A,-1],[B,1]]){const S=MS_SP[R.sp];R.side=side;
    if(gr){R.at={x:R.gs.x,z:R.gs.z,yaw:mascYaw(R,side)};}else R.at={x:side*(R.med==='water'?1.45:1.3),z:0,yaw:-side*.12};
    if(R.pool){const r=S.pool*(gr?1:Math.min(1,1.1/S.pool));R.pool.userData.r=r;const off=gr?side*r*.45:0;R.pool.position.set(R.at.x+off,0,R.at.z);R.pool.scale.set(1,1,1);R.pool.userData.open=kind==='intro'&&!quick?0:1;R.pool.visible=true;
      R.pool.userData.base=r/S.pool;R.lim=Q=>{const P=R.pool,dx=Q.root.position.x-P.position.x,dz=Q.root.position.z-P.position.z,d=Math.hypot(dx,dz),m=P.userData.r*.75;if(d>m){Q.root.position.x=P.position.x+dx/d*m;Q.root.position.z=P.position.z+dz/d*m;}};}}
  G.masc={kind,quick,t:0,dur,A,B,pr,res,my:sp.y,cb:o.cb||null,lock:!!(kind==='intro'&&cfg&&cfg.net),skip:false,n:0,shake:0,fov:camera.fov,
    snow:A.sp==='flake'||B.sp==='flake',fxq:[]};
  A.root.visible=B.root.visible=true;mascHideWorld(true);
  const sub=kind==='intro'?__L('우리 팀 마스코트 등장'):kind==='preview'?(o.sub||''):res==='win'?__L('승리 세리머니'):res==='lose'?__L('아쉬운 패배'):__L('무승부 — 서로 악수');
  mascUI(true,mascCapOf(pr.my,pr.op,pr.mine,pr.oth),sub);mascFade(1,0);try{SFX.whoosh();SFX.crowd(.6);}catch(e){}
  return true;}
function mascFade(v,dur){const f=document.querySelector('#mascFx .ms-fade');if(!f)return;f.style.transition=dur?'opacity '+dur+'s':'none';f.style.opacity=v;if(!dur)void f.offsetWidth;}
function mascClear(){if(G.masc)mascEnd(false);}
function mascEnd(run){const M=G.masc;if(!M)return;G.masc=null;for(const k in MS_RIG){MS_RIG[k].root.visible=false;if(MS_RIG[k].pool)MS_RIG[k].pool.visible=false;}
  for(const b of MS_BOLTS){scene.remove(b.g);b.sc.material.dispose();}MS_BOLTS=[];if(MS_SNOW){MS_SNOW.visible=false;MS_SNOW.userData.k=0;}
  mascHideWorld(false);mascUI(false);camera.fov=M.fov;camera.updateProjectionMatrix();if(run!==false&&M.cb)try{M.cb();}catch(e){console.error(e);}}
// the hooks every animation gets (effects are queued and fired after the rigs are placed, at their real positions)
function mascHooks(M,dt){const q=M.fxq;return {n:M.n,dt,
  fx:(k,obj,p,n)=>q.push(()=>{const w=obj?obj.localToWorld(mV(...(p||[0,0,0]))):mV();mascFx(k,w,n);}),
  splash:(R,x,z,s)=>q.push(()=>{const w=R.root.localToWorld(mV(x/R.k0,0,z/R.k0));w.y=.02;mascFx('splash',w,s||1);if(R.pool)mascRipple(R.pool,w.x,w.z,s||1);}),
  sfx:k=>{try{SFX.msc(k);}catch(e){}},shake:a=>{M.shake=Math.max(M.shake,a);},flash:()=>mascFlash(),
  strike:(R,x,z)=>q.push(()=>{const w=R.root.localToWorld(mV(x/R.k0,0,z/R.k0));mascStrike(w.x,w.z);})};}
// where everyone is and what they do at time t
function mascStep(dt){const M=G.masc;if(!M||G.paused)return;M.t+=dt;M.n++;const t=M.t,A=M.A,B=M.B;
  if(M.t>.05&&!M.f0){M.f0=1;mascFade(0,.35);}
  if(M.skip){M.skip=false;if(M.t<M.dur-.42){M.t=M.dur-.42;}}
  if(M.t>=M.dur-.4&&!M.f1){M.f1=1;mascFade(1,.35);}
  if(M.t>=M.dur){mascEnd(true);return;}
  const H=mascHooks(M,dt),turn=(a,b,u)=>a+(b-a)*mSm(u),zk=M.kind==='intro'||M.res==='draw'?1:.35;
  const P=(R,name,tt,x)=>{const o=Object.assign({},H,{side:R.side},x||{});mPose(R,name,tt,o);mPlace(R,{x:R.at.x,z:R.at.z,yaw:x&&x.yaw!=null?x.yaw:R.at.yaw,zk});};
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
  mascBolts(dt);mascPools(dt);mascSnow(dt,M.snow,(A.sp==='flake'?A:B).root.position);
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
