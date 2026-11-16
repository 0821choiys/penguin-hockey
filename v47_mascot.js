/* ================= v47: 🎭 3D mascots — entrance handshake, victory and defeat cut-scenes (2026-11-16) ================= */
// The owner: "every mascot gets an entrance cut-scene (the two mascots take hands and greet face to face), a victory and a defeat
// cut-scene, as real as possible — e.g. the narwhal shows itself off when it wins and swings its horn wildly when it loses; 3D".
//  · a mascot = a costumed character like real hockey mascots: the team's own jersey (kit or classic), sleeves, hockey pants, socks,
//    skates, mitten hands, and a species head (+ tail / fin / wings / horn…) for each of the 12 kit mascots
//  · intro: both skate in to centre ice, shake hands (two-handed), bow to each other, then each shows its signature move
//  · end: the winner celebrates and the loser reacts, each in its own way (12 × victory, 12 × defeat); a draw ends in a handshake
//  · the world is frozen while a scene plays (like the skill cinematics); tap / any key skips; 설정 → 마스코트 연출 켜기 / 끄기;
//    reduced motion turns them off; online the intro cannot be skipped (both devices keep the same timing)
//  · my mascot = save.kit.mas (펭귄 by default); offline opponents get one picked from their name (always different from mine);
//    online each side brings its own (NET.peer.kit)
//  · purely visual: own random numbers, nothing in the match result depends on it
var MSC={h:2.12,intro:7.4,introQ:3.4,end:5.6,skipAfter:.35,gap:1.35};
const mT=T,mV=(x,y,z)=>new mT.Vector3(x,y,z),mCol=h=>pkRGB(typeof h==='string'?parseInt(h.slice(1),16):h),mL=(a,b,t)=>a+(b-a)*t;
const mSm=x=>x<=0?0:x>=1?1:x*x*(3-2*x),mWin=(t,a,b)=>mSm((t-a)/(b-a)),mSin=(t,f,a,p)=>a*Math.sin((t*f+(p||0))*TAU);
let mRs=1;const mRnd=()=>(mRs=(mRs*16807)%2147483647)/2147483647;
// fur bump (soft short strokes)
const MS_FUR=pkTex(128,(x,N)=>{x.fillStyle='#808080';x.fillRect(0,0,N,N);for(let i=0;i<900;i++){const a=mRnd()*N,b=mRnd()*N,l=3+mRnd()*5,g=100+mRnd()*80|0;
  x.strokeStyle='rgb('+g+','+g+','+g+')';x.lineWidth=1;x.beginPath();x.moveTo(a,b);x.lineTo(a+(mRnd()-.5)*2,b+l);x.stroke();}},[3,3]);
const MS_M={
  fur:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.9,bumpMap:MS_FUR,bumpScale:.025}),1.15),
  skin:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.32,metalness:.06}),.8),
  cloth:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.92,bumpMap:PK_KNIT,bumpScale:.02}),1),
  ice:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.12,metalness:.15,emissive:0x2a5a80,emissiveIntensity:.35}),1.3),
  berg:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.25,metalness:.05,flatShading:true,emissive:0x1d4a6e,emissiveIntensity:.25}),1.2),
  ivory:rimify(new mT.MeshStandardMaterial({vertexColors:true,roughness:.38,metalness:.02}),.6)
};
// --- geometry helpers: everything ends up in a few vertex-coloured meshes per part ---
// ellipsoid (centre c, radii r) with an optional colour function of the unit direction and a displacement
function mEll(c,r,col,seg,disp){const S=pkLo()?.6:1,U=Math.max(10,(seg||28)*S|0),V=Math.max(8,(seg||28)*.75*S|0),d=[0,0,0];
  return pkSurf(U,V,(u,v,p)=>{const ph=u*TAU,th=v*Math.PI;d[0]=Math.sin(th)*Math.sin(ph);d[1]=-Math.cos(th);d[2]=Math.sin(th)*Math.cos(ph);
    const k=disp?disp(d):1;p[0]=c[0]+r[0]*d[0]*k;p[1]=c[1]+r[1]*d[1]*k;p[2]=c[2]+r[2]*d[2]*k;},
    col?(u,v,p,o)=>{const ph=u*TAU,th=v*Math.PI;d[0]=Math.sin(th)*Math.sin(ph);d[1]=-Math.cos(th);d[2]=Math.sin(th)*Math.cos(ph);const q=typeof col==='function'?col(d,p):col;o[0]=q[0];o[1]=q[1];o[2]=q[2];}:null,1,1,[1,1]);}
// a tube along +y from y0 to y1 with radius r(v) (elliptical: sz), closed at both ends
function mTube(y0,y1,rf,col,sz,seg){const S=pkLo()?.6:1,U=Math.max(8,(seg||20)*S|0);
  return pkSurf(U,10,(u,v,p)=>{const a=u*TAU,e=v<.06?v/.06:v>.94?(1-v)/.06:1,r=rf(v)*Math.sqrt(Math.max(0,Math.min(1,e*1.4)));p[0]=Math.sin(a)*r;p[1]=mL(y0,y1,v<.06?.06*mSm(v/.06):v>.94?1-.06*mSm((1-v)/.06):v);p[2]=Math.cos(a)*r*(sz||1);},
    col?(u,v,p,o)=>{const q=typeof col==='function'?col(u,v):col;o[0]=q[0];o[1]=q[1];o[2]=q[2];}:null,1,1,[1,1]);}
// a cone / horn along a direction, with a twist groove (narwhal)
function mHorn(len,r0,col,twist,seg){return pkSurf(seg||18,26,(u,v,p)=>{const a=u*TAU,r=r0*(1-v)*(1+(twist?.12*Math.sin(a*2+v*twist):0))+.002;p[0]=Math.sin(a)*r;p[1]=v*len;p[2]=Math.cos(a)*r;},
  (u,v,p,o)=>{const q=typeof col==='function'?col(u,v):col;o[0]=q[0];o[1]=q[1];o[2]=q[2];},1,1,[0,1]);}
// a flat fin / flipper / feather from a 2D outline (extruded, bevelled)
function mFin(pts,th,col){const s=new mT.Shape();pts.forEach((q,i)=>i?s.lineTo(q[0],q[1]):s.moveTo(q[0],q[1]));
  const g=new mT.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:th*.6,bevelSize:th*.6,bevelSegments:2,curveSegments:8});g.translate(0,0,-th/2);
  const c=col,n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=c[0];a[i*3+1]=c[1];a[i*3+2]=c[2];}g.setAttribute('color',new mT.BufferAttribute(a,3));return g.index?g:g;}
function mMesh(list,mat,shadow){const m=new mT.Mesh(list.length===1&&!list[0][1]?list[0][0]:pkMerge(list),mat);m.castShadow=shadow!==false;return m;}
const mG=(x,y,z)=>{const g=new mT.Group();g.position.set(x||0,y||0,z||0);return g;};
// character eyes (same family as the players': a flat white oval, a big pupil, two catch-lights)
function mEye(w,h,iris){const g=new mT.Group(),base=mEll([0,0,0],[w,h,w*.28],[.97,.97,.98],18);
  const pu=mEll([0,-h*.06,w*.22],[w*.8,h*.8,w*.12],d=>{const r=Math.hypot(d[0],d[1]);return r<.55?[.03,.03,.05]:iris;},18);
  const hl=pkMerge([[mEll([w*.28,h*.3,w*.36],[w*.22,w*.22,w*.06],null,10),null],[mEll([-w*.22,-h*.28,w*.34],[w*.11,w*.11,w*.04],null,8),null]]);
  g.add(new mT.Mesh(base,PK_MAT.eye));const p=new mT.Mesh(pu,PK_MAT.eye);g.add(p);g.add(new mT.Mesh(hl,PK_MAT.hl));g.userData.pu=p;return g;}
// put a child on the head ellipsoid surface at (yaw, pitch), facing out
function mOn(head,obj,c,r,yaw,pitch,out){const d=mV(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
  obj.position.set(c[0]+d.x*r[0]*(out||1),c[1]+d.y*r[1]*(out||1),c[2]+d.z*r[2]*(out||1));
  const n=mV(d.x/r[0],d.y/r[1],d.z/r[2]).normalize();obj.quaternion.setFromUnitVectors(mV(0,0,1),n);head.add(obj);return obj;}
// --- the costume: the team jersey (with the mascot's own crest), sleeves, hockey pants, socks, skates, mitten hands ---
function mKitOf(teamKey,mas){const k=kitFor(teamKey);return Object.assign({c1:kitHex(TEAM[teamKey].color),c2:'#ffffff',pat:'classic',crest:'circle'},k||{},{mas});}
function mJersey(teamKey,mas){const k=mKitOf(teamKey,mas),key='mj'+teamKey+kitSig(k)+pkLo();if(pkMatC[key])return pkMatC[key];
  const c=document.createElement('canvas');c.width=c.height=pkLo()?256:512;const x=c.getContext('2d');x.scale(c.width/512,c.height/256);
  // the torso is ~1.3× denser up than across: the crest is drawn a little tall to look round
  kitPaint(x,k,'00',{cy:96,rx:42,ry:54});const t=new mT.CanvasTexture(c);t.anisotropy=Math.min(4,maxAniso||1);
  return pkMatC[key]=rimify(new mT.MeshStandardMaterial({map:t,roughness:.85,side:mT.DoubleSide}),.9);}
const MS_TORSO=[[0,.31],[.1,.36],[.24,.405],[.4,.41],[.52,.385],[.62,.335],[.69,.25],[.73,.15],[.75,.09]];
function mTorsoR(y){return pkLook(MS_TORSO,y);}
function mBody(teamKey,sp,mas){
  const S=MS_SP[mas],k=mKitOf(teamKey,mas),tc=mCol(k.c1),acc=mCol(k.c2),dk=mCol(kitMix(k.c1,'#000000',.55)),fur=mCol(S.fur),hand=mCol(S.hand||S.fur),
    wh=[.95,.96,.97],blk=[.06,.07,.09],steel=[.82,.85,.9],R={};
  const root=mG(),hips=mG(0,.84,0),spine=mG(0,.1,0);root.add(hips);hips.add(spine);
  // pants (puffy hockey shorts) + belt line
  hips.add(mMesh([[mTube(-.25,.14,v=>.27+.05*Math.sin(v*Math.PI)+.02*v,v=>v>.86?tc:dk,.82,22),null]],MS_M.cloth));
  // torso: jersey (u around from the front, v up — same layout as the players' jerseys)
  const tor=pkSurf(pkLo()?26:42,18,(u,v,p)=>{const a=u*TAU,y=v*.75,r=mTorsoR(y);p[0]=Math.sin(a)*r;p[1]=y;p[2]=Math.cos(a)*r*.82+(y>.18&&y<.5?.03*Math.cos(a)*Math.sin((y-.18)/.32*Math.PI):0);},null,1,1,[0,1]);
  const tm=new mT.Mesh(tor,mJersey(teamKey,mas));tm.castShadow=true;spine.add(tm);
  // neck collar
  spine.add(mMesh([[mTube(.7,.8,()=>.17,dk,.9,16),null]],MS_M.cloth));
  const neck=mG(0,.76,0);spine.add(neck);
  // arms: shoulder → sleeve (team colour, two stripes) → elbow → forearm (species colour) → mitten
  for(const s of[1,-1]){
    const sh=mG(s*.4,.58,0),fa=mG(0,-.3,0),hd=mG(0,-.27,0);spine.add(sh);sh.add(fa);fa.add(hd);
    sh.add(mMesh([[mEll([0,-.02,0],[.135,.13,.12],tc,18),null],[mTube(-.31,0,v=>.105+.02*v,v=>v<.2&&v>.08||v<.32&&v>.24?acc:tc,1,16),null]],MS_M.cloth));
    fa.add(mMesh([[mEll([0,0,0],[.1,.1,.1],fur,14),null],[mTube(-.25,0,v=>.085+.012*v,fur,1,14),null],[mTube(-.26,-.19,()=>.098,tc,1,14),null]],MS_M[S.mat]||MS_M.fur));
    // mitten: palm + four-finger lump + thumb (thumb on the inside)
    hd.add(mMesh([[mEll([0,-.06,0],[.1,.12,.075],hand,16),null],[mEll([0,-.15,.005],[.088,.07,.07],hand,14),null],[mEll([-s*.075,-.05,.04],[.04,.065,.04],hand,10),null]],MS_M[S.mat]||MS_M.fur));
    if(S.arm)S.arm(fa,s,R);
    R[s>0?'aL':'aR']=sh;R[s>0?'fL':'fR']=fa;R[s>0?'hL':'hR']=hd;
    // legs: thigh (pants) → knee → shin (sock with stripes) → skate
    const th=mG(s*.15,-.12,0),kn=mG(0,-.33,0),ft=mG(0,-.29,0);hips.add(th);th.add(kn);kn.add(ft);
    th.add(mMesh([[mTube(-.33,0,v=>.13+.02*v,dk,.95,14),null]],MS_M.cloth));
    kn.add(mMesh([[mTube(-.29,0,v=>.095+.015*v,v=>v>.55&&v<.66||v>.74&&v<.8?acc:tc,1,14),null]],MS_M.cloth));
    ft.add(mMesh([[mEll([0,.03,.05],[.1,.1,.17],blk,16),null],[mEll([0,.12,-.02],[.095,.1,.1],blk,14),null],[mEll([0,.035,.17],[.07,.05,.06],wh,10),null]],PK_MAT.vc));
    const bl=new mT.BoxGeometry(.018,.05,.4);bl.translate(0,-.085,.04);const hold=new mT.BoxGeometry(.05,.03,.32);hold.translate(0,-.055,.04);
    ft.add(mMesh([[bl,steel],[hold,[.75,.78,.82]]],PK_MAT.metal));
    R[s>0?'lL':'lR']=th;R[s>0?'kL':'kR']=kn;R[s>0?'tL':'tR']=ft;
  }
  const head=mG();head.scale.setScalar(1.22);neck.add(head);const tail=mG(0,-.08,-.25);hips.add(tail);
  Object.assign(R,{root,hips,spine,neck,head,tail,sp:mas,team:teamKey,eyes:[],ex:{}});
  S.head(head,R,mas);if(S.tail)S.tail(tail,R);
  // remember the rest placement of every special part so each frame can start from it
  for(const k in R.ex){for(const o of[].concat(R.ex[k]))if(o&&o.isObject3D)o.userData.b0=[o.position.clone(),o.rotation.clone(),o.scale.clone()];}
  root.scale.setScalar(MSC.h/2.58);root.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  return R;
}
// --- faces ---
function mEyes(h,R,c,r,yaw,pitch,w,hh,iris,tilt){for(const s of[1,-1]){const e=mEye(w,hh,iris);if(tilt)e.children.forEach(m=>m.rotation.z=s*tilt);mOn(h,e,c,r,s*yaw,pitch,.985);R.eyes.push(e);}}
function mSmile(h,R,c,r,pitch,w,col){const g=new mT.TorusGeometry(w,w*.13,6,14,Math.PI*.8);g.rotateZ(Math.PI*1.1);const m=new mT.Mesh(g,PK_MAT.vc);
  const cc=col||[.12,.07,.08],n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set(cc,i*3);g.setAttribute('color',new mT.BufferAttribute(a,3));
  const o=mG();o.add(m);mOn(h,o,c,r,0,pitch,1.0);R.ex.mouth=m;return m;}
const mHash=d=>{const v=Math.sin(d[0]*91.3+d[1]*57.7+d[2]*113.1)*43758.5;return v-Math.floor(v);};
const mSpots=(d,base,dark,k)=>{const q=Math.sin(d[0]*k*1.7+3)*Math.sin(d[1]*k*1.3+1)*Math.sin(d[2]*k+2);return q>.55?dark:base;};
function mFlukes(t,R,col,col2){const a=[[0,0],[.1,.05],[.32,.12],[.42,.06],[.3,-.02],[.08,-.06]],g=new mT.Group();
  for(const s of[1,-1]){const f=mFin(a.map(q=>[q[0]*s,q[1]]),.03,col);const m=new mT.Mesh(f,MS_M.skin);m.rotation.x=Math.PI/2;g.add(m);}
  const st=mEll([0,0,0],[.07,.06,.16],col,12);const sm=new mT.Mesh(st,MS_M.skin);sm.position.z=-.08;g.add(sm);g.position.set(0,-.05,-.08);g.rotation.x=.35;t.add(g);R.ex.tail=g;}
function mFeather(len,w,col){return mFin([[0,0],[w*.5,len*.25],[w*.45,len*.8],[0,len],[-w*.45,len*.8],[-w*.5,len*.25]],.012,col);}
var MS_SP={
  peng:{fur:'#1c2028',mat:null,head(h,R){const c=[0,.36,.02],r=[.37,.36,.35],blk=[.09,.1,.13],wh=[.96,.96,.97];
      h.add(mMesh([[mEll(c,r,d=>{const face=d[2]>.18&&d[1]<.5-.35*Math.abs(d[0])&&d[1]>-.7;return face?wh:blk;},34,d=>1+.04*Math.max(0,d[1])),null]],PK_MAT.body));
      mEyes(h,R,c,r,.36,.2,.085,.1,[.25,.18,.12]);
      const bk=mHorn(.2,.085,(u,v)=>v<.15?[.95,.55,.12]:[1,.62,.15],0,16);bk.scale(1.2,1,.8);const bm=new mT.Mesh(bk,PK_MAT.beak);bm.rotation.x=Math.PI/2+.08;mOn(h,bm,c,r,0,-.04,.95);R.ex.beak=bm;
      h.add(mMesh([[mEll([.2,.18,.25],[.05,.035,.02],[1,.6,.68],10),null],[mEll([-.2,.18,.25],[.05,.035,.02],[1,.6,.68],10),null]],MS_M.skin));},
    tail(t){t.add(mMesh([[mFin([[0,0],[.1,-.02],[0,-.16],[-.1,-.02]],.04,[.09,.1,.13]),null]],MS_M.fur));t.children[0].rotation.x=-1.1;}},
  orca:{fur:'#121418',mat:'skin',head(h,R){const c=[0,.34,.04],r=[.35,.33,.4],blk=[.05,.055,.07],wh=[.96,.97,.98];
      h.add(mMesh([[mEll(c,r,d=>{const ep=Math.hypot((Math.abs(d[0])-.66)/.26,(d[1]-.3)/.2,(d[2]-.3)/.55)<1,jaw=d[1]<-.12&&d[2]>.05&&Math.abs(d[0])<.75-.4*Math.max(0,d[1]+.12)*4;return ep||jaw?wh:blk;},36,d=>1+.06*Math.max(0,d[2]-.6)),null]],MS_M.skin));
      mEyes(h,R,c,r,.42,.12,.075,.09,[.2,.25,.32]);mSmile(h,R,c,r,-.24,.16,[.02,.02,.03]);},
    tail(t,R){mFlukes(t,R,[.05,.055,.07]);const fin=mFin([[0,0],[.34,0],[.06,.62],[-.04,.56],[.02,.3]],.05,[.05,.055,.07]);const fm=new mT.Mesh(fin,MS_M.skin);fm.rotation.y=-Math.PI/2;fm.position.set(0,.88,.08);fm.castShadow=true;R.spine.add(fm);R.ex.fin=fm;}},
  bear:{fur:'#efe9dc',head(h,R){const c=[0,.35,0],r=[.38,.35,.35],cr=[.94,.91,.84],dk=[.08,.07,.08];
      h.add(mMesh([[mEll(c,r,cr,34,d=>1+.05*Math.max(0,-d[1])*Math.abs(d[0])),null],
        ...[1,-1].map(s=>[mEll([s*.25,.66,-.02],[.11,.11,.07],cr,14),null]),...[1,-1].map(s=>[mEll([s*.25,.66,.03],[.065,.065,.03],[.78,.66,.6],12),null]),
        [mEll([0,.25,.29],[.18,.13,.15],[.98,.96,.9],22),null]],MS_M.fur));
      h.add(mMesh([[mEll([0,.3,.43],[.065,.045,.04],dk,14),null]],MS_M.skin));mEyes(h,R,c,r,.3,.18,.06,.07,[.22,.15,.1]);mSmile(h,R,[0,.22,.3],[.18,.13,.15],-.2,.07,dk);},
    tail(t){t.add(mMesh([[mEll([0,0,-.02],[.08,.08,.08],[.94,.91,.84],12),null]],MS_M.fur));}},
  seal:{fur:'#aeb8c2',mat:'skin',head(h,R){const c=[0,.35,0],r=[.36,.34,.35],g1=[.68,.73,.78],g2=[.46,.51,.57];
      h.add(mMesh([[mEll(c,r,d=>mSpots(d,d[1]<-.2&&d[2]>0?[.82,.85,.88]:g1,g2,7),34),null],...[1,-1].map(s=>[mEll([s*.085,.22,.31],[.1,.08,.08],[.88,.9,.92],16),null])],MS_M.skin));
      h.add(mMesh([[mEll([0,.29,.38],[.05,.035,.03],[.1,.08,.09],12),null]],MS_M.skin));
      mEyes(h,R,c,r,.36,.16,.1,.115,[.12,.1,.12]);
      const wl=[];for(const s of[1,-1])for(let i=0;i<3;i++){const w=new mT.CylinderGeometry(.004,.004,.24,4);w.rotateZ(Math.PI/2+s*(i-1)*.18);w.translate(s*.2,.23+(i-1)*.025,.33);wl.push([w,[.95,.95,.95]]);}h.add(mMesh(wl,PK_MAT.vc,false));},
    arm(fa,s){const f=mFin([[0,0],[.07,-.05],[.06,-.2],[0,-.24],[-.06,-.2],[-.07,-.05]],.02,[.6,.66,.72]);const m=new mT.Mesh(f,MS_M.skin);m.position.set(s*.07,-.14,0);m.rotation.y=Math.PI/2;fa.add(m);},
    tail(t){for(const s of[1,-1]){const m=new mT.Mesh(mFin([[0,0],[.06,-.04],[.04,-.2],[-.04,-.2],[-.06,-.04]],.02,[.55,.6,.66]),MS_M.skin);m.position.x=s*.07;m.rotation.set(-1.2,0,s*.3);t.add(m);}}},
  walrus:{fur:'#8a5f42',head(h,R){const c=[0,.33,0],r=[.38,.33,.34],br=[.55,.37,.26],lt=[.7,.52,.38];
      h.add(mMesh([[mEll(c,r,br,34,d=>1+.012*Math.sin(d[1]*40)*(d[2]>0?1:.3)),null],...[1,-1].map(s=>[mEll([s*.115,.19,.27],[.16,.12,.12],d=>mHash(d.map(x=>x*3))>.82?[.32,.2,.14]:lt,18),null])],MS_M.fur));
      for(const s of[1,-1]){const t=new mT.Mesh(mHorn(.46,.052,(u,v)=>[mL(.92,.98,v),mL(.86,.95,v),mL(.72,.88,v)]),MS_M.ivory);t.rotation.set(Math.PI*.96,0,s*.08);t.position.set(s*.11,.14,.33);h.add(t);(R.ex.tusks=R.ex.tusks||[]).push(t);}
      h.add(mMesh([[mEll([0,.3,.37],[.07,.04,.03],[.3,.18,.14],12),null]],MS_M.skin));mEyes(h,R,c,r,.36,.32,.05,.058,[.2,.13,.08]);},
  },
  fox:{fur:'#f4f3ef',head(h,R){const c=[0,.33,0],r=[.33,.3,.31],w=[.96,.96,.95];
      h.add(mMesh([[mEll(c,r,w,34,d=>1+.1*Math.max(0,-d[1]-.1)*Math.abs(d[0])*2),null],[mEll([0,.25,.29],[.11,.09,.22],w,20),null]],MS_M.fur));
      for(const s of[1,-1]){const e=new mT.Mesh(mHorn(.3,.12,(u,v)=>Math.cos(u*TAU)>.35&&v<.8?[.86,.72,.75]:w,0,14),MS_M.fur);e.scale.z=.45;e.position.set(s*.19,.53,-.02);e.rotation.z=-s*.42;h.add(e);(R.ex.ears=R.ex.ears||[]).push(e);}
      h.add(mMesh([[mEll([0,.27,.5],[.045,.035,.03],[.06,.06,.07],12),null]],MS_M.skin));mEyes(h,R,c,r,.34,.18,.075,.06,[.85,.55,.12],.25);mSmile(h,R,[0,.22,.3],[.11,.09,.22],-.35,.06,[.15,.1,.1]);},
    tail(t,R){const g=new mT.Group();g.add(mMesh([[mEll([0,.12,-.32],[.15,.17,.36],d=>d[2]<-.75?[.82,.84,.88]:[.97,.97,.96],22),null]],MS_M.fur));g.rotation.x=-.35;t.add(g);R.ex.tail=g;}},
  owl:{fur:'#f5f4f0',head(h,R){const c=[0,.36,0],r=[.37,.36,.34],w=[.97,.97,.96],sp=[.18,.18,.2];
      h.add(mMesh([[mEll(c,r,d=>(d[2]<.3||d[1]>.55)&&mHash([d[0]*4|0,d[1]*9|0,d[2]*4|0])>.62&&Math.abs((d[1]*18)%2)<.6?sp:w,34),null],...[1,-1].map(s=>[mEll([s*.13,.38,.27],[.15,.15,.06],[.99,.99,.99],18),null])],MS_M.fur));
      mEyes(h,R,c,r,.32,.04,.095,.095,[1,.78,.1]);
      const bk=new mT.Mesh(mHorn(.11,.04,[.13,.12,.14]),PK_MAT.beak);bk.rotation.x=Math.PI*.82;bk.position.set(0,.31,.36);h.add(bk);},
    arm(fa,s){for(let i=0;i<4;i++){const m=new mT.Mesh(mFeather(.26-i*.03,.07,i%2?[.9,.9,.88]:[.97,.97,.96]),MS_M.fur);m.position.set(s*.08,-.04-i*.06,-.02);m.rotation.set(0,Math.PI/2,s*(1.25+i*.1));fa.add(m);}},
    tail(t,R){const g=new mT.Group();for(let i=-2;i<=2;i++){const m=new mT.Mesh(mFeather(.26,.08,i%2?[.9,.9,.88]:[.97,.97,.96]),MS_M.fur);m.rotation.set(-1.9,0,i*.28);g.add(m);}t.add(g);R.ex.tail=g;}},
  fish:{fur:'#8fb4c8',mat:'skin',head(h,R){const c=[0,.36,.06],r=[.33,.34,.42];
      h.add(mMesh([[mEll(c,r,d=>{if(Math.abs(d[1]-.08)<.06&&d[2]<.4&&d[2]>-.5&&Math.sin(d[2]*22)>.4)return[.12,.2,.3];return d[1]>.25?[.18,.38,.5]:d[1]>-.15?[.66,.78,.86]:[.92,.94,.95];},36),null]],MS_M.skin));
      h.add(mMesh([[new mT.TorusGeometry(.06,.025,8,16).translate(0,.24,.47),[.55,.3,.35]],[mEll([0,.24,.45],[.05,.04,.02],[.1,.05,.07],10),null]],MS_M.skin));
      mEyes(h,R,c,r,.5,.18,.1,.1,[.75,.8,.85]);
      const fin=mFin([[0,0],[.42,0],[.2,.3],[.02,.26]],.025,[.25,.45,.58]);const fm=new mT.Mesh(fin,MS_M.skin);fm.rotation.y=-Math.PI/2;fm.position.set(0,.64,-.2);h.add(fm);R.ex.fin=fm;},
    arm(fa,s){const m=new mT.Mesh(mFin([[0,0],[.08,-.06],[.04,-.22],[-.04,-.16]],.015,[.6,.72,.8]),MS_M.skin);m.position.set(s*.07,-.1,0);m.rotation.y=Math.PI/2;fa.add(m);},
    tail(t,R){const g=new mT.Group();const f=mFin([[0,0],[.12,.08],[.3,.26],[.22,0],[.3,-.26],[.12,-.08]],.02,[.3,.5,.62]);const m=new mT.Mesh(f,MS_M.skin);m.rotation.y=Math.PI/2;g.add(m);g.rotation.x=.2;t.add(g);R.ex.tail=g;}},
  narwhal:{fur:'#8ea2b4',mat:'skin',head(h,R){const c=[0,.35,.02],r=[.36,.34,.37],g1=[.62,.69,.76],g2=[.38,.45,.53];
      h.add(mMesh([[mEll(c,r,d=>d[1]<-.35&&d[2]>-.2?[.84,.87,.9]:mSpots(d,g1,g2,9),36,d=>1+.05*Math.max(0,d[2]-.5)),null]],MS_M.skin));
      mEyes(h,R,c,r,.46,.14,.08,.09,[.2,.3,.42]);mSmile(h,R,c,r,-.2,.14,[.12,.12,.16]);
      const hg=mG(0,.44,.3);const hm=new mT.Mesh(mHorn(1.05,.058,(u,v)=>[mL(.9,.99,v),mL(.86,.97,v),mL(.74,.9,v)],34,22),MS_M.ivory);hm.castShadow=true;hg.add(hm);hg.rotation.x=.98;h.add(hg);R.ex.horn=hg;},
    tail(t,R){mFlukes(t,R,[.5,.57,.65]);}},
  flake:{fur:'#cfe6f7',head(h,R){const g=mG(0,.38,0),ic=[.86,.94,1],ic2=[.66,.84,.98],parts=[];
      const d=new mT.CylinderGeometry(.27,.27,.12,6,1);d.rotateX(Math.PI/2);parts.push([d,ic]);
      for(let i=0;i<6;i++){const a=i*Math.PI/3+Math.PI/6,arm=new mT.BoxGeometry(.075,.36,.07);arm.translate(0,.42,0);arm.rotateZ(a);parts.push([arm,ic2]);
        for(const s of[1,-1]){const b=new mT.BoxGeometry(.05,.15,.05);b.translate(0,.08,0);b.rotateZ(s*.8);b.translate(0,.44,0);b.rotateZ(a);parts.push([b,ic]);}
        const tip=new mT.OctahedronGeometry(.07);tip.translate(0,.62,0);tip.rotateZ(a);parts.push([tip,[.95,.98,1]]);}
      g.add(mMesh(parts,MS_M.ice));h.add(g);R.ex.spin=g;
      const fc=mG(0,0,.065);g.add(fc);const cc=[0,0,0],rr=[.27,.27,.06];mEyes(fc,R,cc,rr,.0,0,.06,.07,[.3,.5,.75]);R.eyes.forEach((e,i)=>{e.position.set(i?-.09:.09,.04,.01);e.quaternion.identity();});
      const m=mSmile(fc,R,cc,rr,0,.07,[.2,.35,.55]);m.parent.position.set(0,-.08,.01);m.parent.quaternion.identity();}},
  berg:{fur:'#bfe1f2',head(h,R){const g=new mT.IcosahedronGeometry(.38,1),p=g.attributes.position,col=new Float32Array(p.count*3);
      for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+.16*Math.sin(x*9+y*5)*Math.cos(z*7-y*3),pk=y>0?1+.9*Math.max(0,y/.38)**2*(.6+.4*Math.sin(x*11+z*6)):1;
        const Y=y*k*1.1*pk-(y>0?0:.02);p.setXYZ(i,x*k*(1.08-.25*Math.max(0,Y-.2)),Y,z*k*(1.02-.2*Math.max(0,Y-.2)));
        const c=Y>.24?[.98,.99,1]:Y>-.05?[.74,.89,.98]:[.52,.75,.93];col.set(c,i*3);}
      g.setAttribute('color',new mT.BufferAttribute(col,3));g.computeVertexNormals();g.translate(0,.38,0);const m=new mT.Mesh(g,MS_M.berg);m.castShadow=true;h.add(m);
      const ch=new mT.Mesh(new mT.DodecahedronGeometry(.13,0).translate(0,0,0),MS_M.berg);const cc=ch.geometry.attributes.position,c2=new Float32Array(cc.count*3);for(let i=0;i<cc.count;i++)c2.set([.95,.98,1],i*3);ch.geometry.setAttribute('color',new mT.BufferAttribute(c2,3));
      ch.position.set(.22,.7,.06);ch.castShadow=true;h.add(ch);R.ex.chunk=ch;R.ex.chunk0=ch.position.clone();
      mEyes(h,R,[0,.38,0],[.4,.42,.38],.32,.1,.075,.085,[.2,.45,.7]);mSmile(h,R,[0,.38,0],[.4,.42,.38],-.22,.11,[.18,.32,.5]);}},
  bolt:{fur:'#ffd84a',head(h,R){const c=[0,.34,.02],r=[.35,.33,.33];
      const mat=MS_M.skin.clone();mat.emissive=new mT.Color(0xffa200);mat.emissiveIntensity=.35;R.ex.mat=mat;
      const hm=new mT.Mesh(mEll(c,r,d=>d[1]<-.3&&d[2]>0?[1,.93,.6]:[1,.82,.18],34),mat);hm.castShadow=true;h.add(hm);
      const bp=[[.02,.56],[-.2,.12],[-.03,.15],[-.12,-.18],[.2,.22],[.04,.2],[.13,.56]].map(q=>[q[0]*1.3,q[1]*1.25]);
      const cr=new mT.Mesh(mFin(bp,.09,[1,.9,.35]),mat);cr.position.set(.0,.5,-.02);cr.rotation.z=-.12;cr.castShadow=true;h.add(cr);R.ex.crest=cr;
      for(const s of[1,-1]){const k=new mT.Mesh(mFin([[0,0],[.1,.06],[.04,.08],[.14,.18],[-.02,.06],[.04,.04]],.04,[1,.9,.35]),mat);k.position.set(s*.3,.42,0);k.rotation.set(0,s*.5,s*-1.1);h.add(k);}
      mEyes(h,R,c,r,.33,.15,.075,.085,[.5,.32,.04]);mSmile(h,R,c,r,-.18,.12,[.45,.25,.04]);}}
};
// ---------------- poses & animations ----------------
// every frame: back to the rest pose, then the animation writes joint angles. R.off = local offsets the scene adds to its own
// placement: x / y / z (metres; z = forward), rx (tip forward), ry (turn), rz (lean), s (squash: y scale)
function mRest(R){const J=['hips','spine','neck','head','aL','aR','fL','fR','hL','hR','lL','lR','kL','kR','tL','tR','tail'];for(const j of J)if(R[j])R[j].rotation.set(0,0,0);
  R.hips.position.y=.84;R.off={x:0,y:0,z:0,rx:0,ry:0,rz:0,s:1};
  mArm(R,1,.14,.06,-.3);mArm(R,-1,.14,.06,-.3);mLeg(R,1,-.08,.16);mLeg(R,-1,-.08,.16);R.spine.rotation.x=.03;
  for(const e of R.eyes){e.scale.y=1;if(e.userData.pu)e.userData.pu.position.set(0,0,0);}if(R.ex.mouth)R.ex.mouth.rotation.z=0;
  if(R.ex.mat)R.ex.mat.emissiveIntensity=.35;R.root.visible=true;
  for(const k in R.ex)for(const o of[].concat(R.ex[k]))if(o&&o.userData&&o.userData.b0){const b=o.userData.b0;o.position.copy(b[0]);o.rotation.copy(b[1]);o.scale.copy(b[2]);o.visible=true;}}
// arm s (1 = left, -1 = right): out = raised sideways, fw = swung forward, el = elbow bend (negative bends forward), tw = twist
function mArm(R,s,out,fw,el,tw,ez){const a=R[s>0?'aL':'aR'],f=R[s>0?'fL':'fR'];a.rotation.set(-(fw||0),(tw||0)*s,s*(out||0));f.rotation.set(el||0,0,-s*(ez||0));}
function mLeg(R,s,fw,kn,out){const l=R[s>0?'lL':'lR'],k=R[s>0?'kL':'kR'],t=R[s>0?'tL':'tR'];l.rotation.set(-(fw||0),0,s*(out||0));k.rotation.set(kn||0,0,0);t.rotation.set(-(kn||0)*.5+(fw||0)*.3,0,0);}
function mHead(R,nod,turn,tilt){R.head.rotation.set(nod||0,turn||0,tilt||0);}
function mSad(R,k){for(const e of R.eyes)if(e.userData.pu)e.userData.pu.position.y=-.025*k;if(R.ex.mouth)R.ex.mouth.rotation.z=k>.5?Math.PI:0;}
function mBlink(R,t,seed){const q=(t*.37+(seed||0))%3.1;const b=q<.12?1-Math.sin(q/.12*Math.PI):1;for(const e of R.eyes)e.scale.y=Math.max(.08,b);}
const mHop=(t,f,h)=>Math.abs(Math.sin(t*f*Math.PI))*h;
// skating stride (speed 0..1): long side pushes, lean, opposite arm swing
function mSkate(R,t,k){const ph=t*1.6*TAU,a=Math.sin(ph),b=Math.cos(ph);R.spine.rotation.x=.18*k+.03;R.off.y=-.04*k;
  for(const s of[1,-1]){const q=s*a;mLeg(R,s,-.15*k+(q>0?.35*q*k:.15*q*k),.25*k+.25*Math.max(0,-q)*k,(.12+.18*Math.max(0,q))*k);mArm(R,s,.2,.45*q*k,-.4);}
  R.off.rz=.06*a*k;R.spine.rotation.y=.12*b*k;}
// the two-handed handshake (R stands facing the partner; side: the hand reaching across). u: 0..1 through the shake
function mShake(R,t,u){const reach=mWin(u,0,.18)*(1-mWin(u,.86,1)),pump=Math.sin(t*3.2*TAU)*.13*mWin(u,.2,.3)*(1-mWin(u,.72,.8)),cover=mWin(u,.3,.42)*(1-mWin(u,.78,.9));
  mArm(R,-1,mL(.14,-.5,reach),mL(.06,1.42+pump,reach),mL(-.3,-.08,reach),0,mL(0,.22,reach));mArm(R,1,mL(.14,-.72,cover),mL(.06,1.36+pump*.8,cover),mL(-.3,-.4,cover),0,mL(0,.3,cover));
  R.spine.rotation.x=.03+.2*reach;mHead(R,.08*reach,0,0);mHornSafe(R,reach);R.off.y=.02*Math.sin(t*3.2*TAU)*reach*.3;}
// a horned mascot turns its head aside up close so the horn passes the partner's face (k: 0..1)
function mHornSafe(R,k){if(!R.ex.horn||!k)return;R.head.rotation.y-=.62*k;R.head.rotation.x-=.3*k;R.head.rotation.z-=.18*k;}
function mBow(R,u){const b=Math.sin(Math.min(1,u)*Math.PI);R.spine.rotation.x=.03+.55*b;mHead(R,.25*b,0,0);mArm(R,1,.08,-.05,-.15*b);mArm(R,-1,.08,-.05,-.15*b);mLeg(R,1,-.08-.1*b,.16+.1*b);mLeg(R,-1,-.08-.1*b,.16+.1*b);mHornSafe(R,1.35*Math.min(1,u*3)*(1-mWin(u,.85,1)));}
function mWave(R,t,s){mArm(R,s,2.4+.25*Math.sin(t*4*TAU),.2,-.35-.25*Math.sin(t*4*TAU));}
const mWP=(o,x,y,z)=>o.localToWorld(mV(x||0,y||0,z||0));
// victory (w) and defeat (l) for every mascot; g = where the short "signature" used in the entrance starts inside w
var MS_WL={
  peng:{g:0,w(R,t,o){const hop=t<1.5?mHop(t,2,.28):0,fl=Math.sin(t*14)*.5;R.off.y=hop;
      if(t<1.5){mArm(R,1,.7+fl,0,-.1);mArm(R,-1,.7-fl,0,-.1);mHead(R,-.15,0,Math.sin(t*6)*.1);mLeg(R,1,-.1,.25*(1-hop*3));mLeg(R,-1,-.1,.25*(1-hop*3));}
      else if(t<2.2){const u=mWin(t,1.5,2.2);R.spine.rotation.x=.4*u;mArm(R,1,.5,-.8*u,-.2);mArm(R,-1,.5,-.8*u,-.2);mSkate(R,t,.8);R.off.z=.5*u;}
      else if(t<3.6){const u=mWin(t,2.2,2.5),v=1-Math.pow(1-mWin(t,2.2,3.6),2);R.off.rx=1.38*u;R.off.y=.36*u;R.off.z=.5+2.1*v;mArm(R,1,.3,-1.4,0);mArm(R,-1,.3,-1.4,0);mLeg(R,1,-.2,0);mLeg(R,-1,-.2,0);mHead(R,-.9*u,0,0);
        if(t<3.4&&o.n%3==0)o.fx('snow',mWP(R.root,0,.1,1.1));}
      else{const u=mWin(t,3.6,4),j=mHop(Math.max(0,t-4),2.2,.18);R.off.rx=1.38*(1-u);R.off.y=.36*(1-u)+j;R.off.z=2.6;mArm(R,1,mL(.3,2.5,u),0,-.2);mArm(R,-1,mL(.3,2.5,u),0,-.2);mHead(R,-.2*u,0,0);}
      mBlink(R,t,.3);},
    l(R,t,o){if(t<1.3){const st=Math.sin(t*9);mLeg(R,1,.45*Math.max(0,st),.6*Math.max(0,st));mLeg(R,-1,.45*Math.max(0,-st),.6*Math.max(0,-st));mArm(R,1,.35,.1+.1*st,-.9);mArm(R,-1,.35,.1-.1*st,-.9);mHead(R,.1,.3*Math.sin(t*12),0);R.off.y=.04*Math.abs(st);
        if(Math.abs(st)>.98&&o.n%2==0)o.fx('snow',mWP(R.root,st>0?.15:-.15,0,.2));}
      else{const u=mWin(t,1.3,2.1),e=u*u;R.off.rx=1.46*e;R.off.y=.34*mWin(t,1.6,2.1);mArm(R,1,.25+.3*Math.max(0,Math.sin(t*3))*(t>2.4?1:0),-.2,0);mArm(R,-1,.25+.3*Math.max(0,Math.sin(t*3+1))*(t>2.4?1:0),-.2,0);
        mLeg(R,1,-.2,.7*Math.max(0,Math.sin(t*5))*(t>2.4?1:0));mLeg(R,-1,-.2,.7*Math.max(0,Math.sin(t*5+2))*(t>2.4?1:0));mHead(R,-.7*u,.25*Math.sin(t*4)*(t>2.4?1:0),0);if(t>2.08&&t<2.13)o.shake(.25);}
      mSad(R,1);mBlink(R,t,.7);}},
  orca:{g:2.4,w(R,t,o){if(t<.8){const u=mWin(t,0,.8);R.off.y=-.16*u;R.spine.rotation.x=.3*u;mLeg(R,1,.35*u,.8*u);mLeg(R,-1,.35*u,.8*u);mArm(R,1,.3,-.6*u,-.2);mArm(R,-1,.3,-.6*u,-.2);}
      else if(t<2.1){const u=(t-.8)/1.3;R.off.y=4.2*u*(1-u)*1.1;R.off.rx=-TAU*mSm(u);R.off.ph=.72;mArm(R,1,.3,1.4,-1.8);mArm(R,-1,.3,1.4,-1.8);mLeg(R,1,.9,1.6);mLeg(R,-1,.9,1.6);R.spine.rotation.x=.5;if(u>.97)o.fx('splash',mWP(R.root,0,0,0));}
      else if(t<2.4){const u=mWin(t,2.1,2.4);R.off.y=-.15*(1-u);mLeg(R,1,.3*(1-u),.7*(1-u));mLeg(R,-1,.3*(1-u),.7*(1-u));if(t<2.14)o.shake(.3);}
      else{const u=mWin(t,2.4,2.9);mArm(R,1,mL(.14,-.35,u),mL(.06,.95,u),mL(-.3,-1.7,u),.3*u);mArm(R,-1,mL(.14,-.35,u),mL(.06,.82,u),mL(-.3,-1.75,u),.3*u);mHead(R,-.22*u,.25*Math.sin(t*1.2),0);R.spine.rotation.x=-.08*u;
        if(R.ex.fin)R.ex.fin.rotation.z=.12*Math.sin(t*6);}
      if(R.ex.tail)R.ex.tail.rotation.x=.35+.3*Math.sin(t*5);mBlink(R,t,.1);},
    l(R,t,o){const u=mWin(t,0,.7);R.off.y=-.48*u;mLeg(R,1,mL(-.08,-1.35,u),mL(.16,2.3,u));mLeg(R,-1,mL(-.08,-1.35,u),mL(.16,2.3,u));R.spine.rotation.x=.45*u;
      if(t>.7){const p=Math.sin(t*7);mArm(R,1,.2,.9+.5*Math.max(0,p),-.4);mArm(R,-1,.2,.9+.5*Math.max(0,-p),-.4);if(Math.abs(p)>.99)o.fx('snow',mWP(R.root,p>0?.3:-.3,0,.5));
        if(R.ex.tail)R.ex.tail.rotation.x=.35+1.1*Math.abs(Math.sin(t*4.5));if(Math.abs(Math.sin(t*4.5))>.995&&o.n%2==0)o.shake(.12);}
      mHead(R,.35*u,.25*Math.sin(t*3),0);mSad(R,1);mBlink(R,t,.5);}},
  bear:{g:3,w(R,t,o){if(t<1){const u=mWin(t,0,1);R.spine.rotation.x=-.18*u;mArm(R,1,mL(.14,2.2,u),.1,-.9*u);mArm(R,-1,mL(.14,2.2,u),.1,-.9*u);mHead(R,-.35*u,0,0);if(t>.6&&t<.65)o.shake(.35);}
      else if(t<3){const b=Math.sin((t-1)*4*Math.PI);mArm(R,1,.25,1.1+.25*Math.max(0,b),-1.9,.2);mArm(R,-1,.25,1.1+.25*Math.max(0,-b),-1.9,.2);mHead(R,-.15,.1*Math.sin(t*3),0);R.spine.rotation.x=-.1;if(Math.abs(b)>.995)o.shake(.1);}
      else{const u=mWin(t,3,3.4);mArm(R,1,mL(.25,1.55,u),mL(1.1,.1,u),mL(-1.9,-2,u));mArm(R,-1,mL(.25,1.55,u),mL(1.1,.1,u),mL(-1.9,-2,u));R.spine.rotation.y=.3*Math.sin((t-3)*3);mHead(R,-.1,.2*Math.sin((t-3)*3),0);}
      mLeg(R,1,-.1,.2,.18);mLeg(R,-1,-.1,.2,.18);mBlink(R,t,.2);},
    l(R,t,o){const u=mWin(t,0,1),e=u*u;R.off.y=-.66*e;mLeg(R,1,mL(-.08,1.45,u),mL(.16,.25,u),.25*u);mLeg(R,-1,mL(-.08,1.45,u),mL(.16,.25,u),.25*u);R.off.rx=-.08*u;if(t>.98&&t<1.03){o.shake(.35);o.fx('snow',mWP(R.root,0,0,0));}
      if(t>1.2){const c=mWin(t,1.2,1.7);mArm(R,1,mL(.14,.3,c),mL(.06,2.15,c),mL(-.3,-1.95,c));mArm(R,-1,mL(.14,.3,c),mL(.06,2.15,c),mL(-.3,-1.95,c));R.off.rz=.09*Math.sin((t-1.2)*3.6)*c;mHead(R,.32*c,0,0);R.spine.rotation.x=.25*c;}
      mSad(R,1);mBlink(R,t,.9);}},
  seal:{g:0,w(R,t,o){if(t<2.4){const c=Math.abs(Math.sin(t*4*Math.PI));mArm(R,1,.08+.55*c,1.15,-.25);mArm(R,-1,.08+.55*c,1.15,-.25);R.off.y=mHop(t,2,.07);mHead(R,-.15+.08*Math.sin(t*8),0,0);if(c<.06&&o.n%3==0)o.clap();}
      else{const u=mWin(t,2.4,2.9);mHead(R,-.65*u,0,.08*Math.sin(t*5)*u);mArm(R,1,1.2*u+.14,.1,-.2);mArm(R,-1,1.2*u+.14,.1,-.2);R.off.rz=.04*Math.sin(t*5);mPuck(R,u>.5);}
      if(t<2.4)mPuck(R,false);mBlink(R,t,.4);},
    l(R,t,o){const u=mWin(t,0,1);R.off.rx=-1.42*u*u;R.off.y=.33*mWin(t,.4,1);if(t>.95&&t<1){o.shake(.25);o.fx('snow',mWP(R.root,0,0,0));}
      if(t>1){const f=Math.sin(t*16);mArm(R,1,.9+.4*f,.3,-.2);mArm(R,-1,.9-.4*f,.3,-.2);mLeg(R,1,.3+.3*Math.sin(t*11),.4);mLeg(R,-1,.3-.3*Math.sin(t*11),.4);R.off.rz=.35*Math.sin((t-1)*2.4*Math.PI);mHead(R,0,.4*Math.sin(t*9),0);}
      mPuck(R,false);mSad(R,1);mBlink(R,t,.6);}},
  walrus:{g:0,w(R,t,o){if(t<1.6){mArm(R,-1,.3,1.75,-1.85,.4*Math.sin(t*5));mArm(R,1,.75,-.15,-.3,0,1.7);mHead(R,-.18,.1*Math.sin(t*3),0);R.spine.rotation.x=-.1;}
      else if(t<2.5){const q=Math.sin(t*38)*.06;R.spine.rotation.x=-.18+q;mArm(R,1,.4,.4,-1.9);mArm(R,-1,.4,.4,-1.9);mHead(R,-.35+q,0,0);R.off.y=Math.abs(q)*.5;}
      else{const w=Math.sin((t-2.5)*2.6*Math.PI);R.spine.rotation.x=-.25;R.off.z=(t-2.5)*.35;mLeg(R,1,.35*w,.2+.3*Math.max(0,w));mLeg(R,-1,-.35*w,.2+.3*Math.max(0,-w));mArm(R,1,.5,-.4*w,-1.5);mArm(R,-1,.5,.4*w,-1.5);R.off.rz=.07*w;
        if(R.ex.tusks&&o.n%5==0)o.fx('sparkle',mWP(R.ex.tusks[o.n%2],0,.3,0));}
      mBlink(R,t,.8);},
    l(R,t,o){const u=mWin(t,0,1.2),sg=.5+.5*Math.sin(t*2.4);R.spine.rotation.x=.55*u+.05*sg;mHead(R,.45*u,.38*Math.sin(t*4.2)*mWin(t,1,1.5),0);mArm(R,1,.05+.08*sg,.15,-.1);mArm(R,-1,.05+.08*sg,.15,-.1);
      mLeg(R,1,-.15,.3);mLeg(R,-1,-.15,.3);R.off.y=-.05*u;mSad(R,1);mBlink(R,t,.2);}},
  fox:{g:0,w(R,t,o){const wag=Math.sin(t*30);if(R.ex.tail)R.ex.tail.rotation.y=.7*wag;
      if(t<1.5){R.off.y=mHop(t,3,.08);mArm(R,1,.3,.6,-1.2);mArm(R,-1,.3,.6,-1.2);mHead(R,-.1,0,.2*Math.sin(t*6));}
      else if(t<2.5){const u=mWin(t,1.5,2.5);R.off.ry=TAU*u;mArm(R,1,1.4,0,-.2);mArm(R,-1,1.4,0,-.2);mLeg(R,1,-.1,.2,.3);}
      else if(t<3.6){const u=(t-2.5)/1.1,c=t<2.8?mWin(t,2.5,2.8):1;if(t<2.8){R.off.y=-.15*c;mLeg(R,1,.4*c,.9*c);mLeg(R,-1,.4*c,.9*c);}else{const v=(t-2.8)/.8;R.off.y=Math.max(0,3.2*v*(1-v)*.55);R.off.z=1.1*mSm(v);R.off.rx=.55*Math.sin(v*Math.PI);mArm(R,1,.2,1.6,-.2);mArm(R,-1,.2,1.6,-.2);mLeg(R,1,-.6,.3);mLeg(R,-1,-.6,.3);if(v>.97)o.fx('snow',mWP(R.root,0,0,.3));}}
      else{R.off.z=1.1;mArm(R,1,.2,.4,-.9);mArm(R,-1,.2,.4,-.9);mHead(R,-.08,0,.15);}
      mBlink(R,t,.5);},
    l(R,t,o){const u=mWin(t,0,.5);if(R.ex.ears)R.ex.ears.forEach((e,i)=>e.rotation.x=-.9*u);if(R.ex.tail){R.ex.tail.rotation.x=-.35+1.05*u;R.ex.tail.rotation.y=.2*Math.sin(t*2);}
      const k1=t>.5&&t<1.1?Math.sin((t-.5)/.6*Math.PI):0,k2=t>1.3&&t<1.9?Math.sin((t-1.3)/.6*Math.PI):0;mLeg(R,-1,.9*k1-.08,.16);mLeg(R,1,.9*k2-.08,.16);if(k1>.97||k2>.97)o.fx('snow',mWP(R.root,k1?-.15:.15,0,.6));
      if(t>2){const v=mWin(t,2,3);R.off.ry=Math.PI*v;mHead(R,.35*v,0,0);R.spine.rotation.x=.2*v;mArm(R,1,.05,-.1,-.6);mArm(R,-1,.05,-.1,-.6);}else{mArm(R,1,.3,.2,-1.1);mArm(R,-1,.3,.2,-1.1);}
      mSad(R,1);mBlink(R,t,.1);}},
  owl:{g:0,w(R,t,o){if(t<1.6||t>3.2){const f=Math.sin(t*3*TAU);mArm(R,1,1.35+.45*f,0,-.15);mArm(R,-1,1.35+.45*f,0,-.15);R.off.y=t>3.2?mHop(t-3.2,2,.12):.05*Math.max(0,f);mHead(R,t>3.2?.15*Math.sin(t*10):0,0,0);}
      else{const u=mWin(t,1.6,3.2);mHead(R,0,TAU*u,0);mArm(R,1,.5,0,-.3);mArm(R,-1,.5,0,-.3);}
      mBlink(R,t,.15);},
    l(R,t,o){const u=mWin(t,0,1),pk=t>2.2&&t<3?Math.sin((t-2.2)/.8*Math.PI):0;mHead(R,.1,Math.PI*u-1.1*pk,0);mArm(R,1,.04,-.1,-.05);mArm(R,-1,.04,-.1,-.05);
      R.off.rz=.03*Math.sin(t*60)*mWin(t,1,1.3);R.spine.rotation.x=.2*u;mSad(R,1);mBlink(R,t,.35);}},
  fish:{g:0,w(R,t,o){const d=Math.sin(t*2*TAU);R.spine.rotation.z=.25*d;R.hips.rotation.z=-.18*d;mArm(R,1,.8+.5*Math.sin(t*5),.3,-.6);mArm(R,-1,.8+.5*Math.sin(t*5+1.6),.3,-.6);if(R.ex.tail)R.ex.tail.rotation.y=.6*Math.sin(t*14);
      mLeg(R,1,.15*d,.2+.15*d,.15);mLeg(R,-1,-.15*d,.2-.15*d,.15);
      if(t>2.4&&t<3.4){const v=(t-2.4);R.off.y=3.6*v*(1-v)*.7;R.off.rx=mL(-.4,.4,v);if(v>.95&&o.n%2==0)o.fx('splash',mWP(R.root,0,0,0));}
      mBlink(R,t,.6);},
    l(R,t,o){const u=mWin(t,0,.8),sd=o.side>0?-1:1;R.off.rz=1.5*u*u*sd;R.off.y=.32*u;
      if(t>.8){const b=Math.abs(Math.sin((t-.8)*2.6*Math.PI))*Math.max(.25,1-(t-.8)/4);R.off.y=.32+.25*b;R.off.rz=1.5*sd;R.spine.rotation.z=.3*Math.sin(t*9);if(R.ex.tail)R.ex.tail.rotation.y=.8*Math.sin(t*13);if(b>.95&&o.n%3==0)o.fx('splash',mWP(R.root,0,0,0));
        if(R.ex.mouth)R.ex.mouth.scale.setScalar(1+.35*Math.max(0,Math.sin(t*7)));}
      mArm(R,1,.6+.4*Math.sin(t*8),.2,-.3);mArm(R,-1,.6+.4*Math.sin(t*8+2),.2,-.3);mSad(R,1);mBlink(R,t,.9);}},
  narwhal:{g:0,w(R,t,o){if(t<1.4){const u=mWin(t,0,.6);mArm(R,1,.62*u+.14,-.15*u,-.3,0,1.7*u);mArm(R,-1,.62*u+.14,-.15*u,-.3,0,1.7*u);R.spine.rotation.x=-.18*u;mHead(R,-.25*u,0,0);mLeg(R,1,-.08,.1,.12*u);mLeg(R,-1,-.08,.1,.12*u);}
      else if(t<2.9){const a=(t-1.4)*1.4*TAU;mArm(R,1,.76,-.15,-.3,0,1.7);mArm(R,-1,.76,-.15,-.3,0,1.7);R.spine.rotation.x=-.18;mHead(R,-.25+.2*Math.sin(a),.25*Math.cos(a),.1*Math.sin(a));
        if(R.ex.horn&&o.n%2==0)o.fx('sparkle',mWP(R.ex.horn,0,.25+((o.n*.137)%1)*.8,0));}
      else{const u=mWin(t,2.9,4.4);R.off.ry=TAU*u;mArm(R,-1,1.5,.2,-2.1);mArm(R,1,.76,-.15,-.3,0,1.7);mHead(R,-.2,0,.1);if(t>4)R.eyes[0].scale.y=.08;if(R.ex.horn&&o.n%4==0)o.fx('sparkle',mWP(R.ex.horn,0,1,0));}
      mBlink(R,t,.25);},
    l(R,t,o){const k=Math.min(1,t/.4)*(t>4?Math.max(.15,1-(t-4)*1.2):1),a=t*3.2*TAU;mHead(R,.15*k*Math.sin(a*.5),1.05*k*Math.sin(a),.42*k*Math.sin(a+1));R.spine.rotation.z=-.25*k*Math.sin(a);R.spine.rotation.x=.12;
      mArm(R,1,.9+1.1*k*Math.sin(a*.8),.3,-.6);mArm(R,-1,.9+1.1*k*Math.sin(a*.8+2.2),.3,-.6);const st=Math.sin(t*10);mLeg(R,1,.35*Math.max(0,st)*k,.6*Math.max(0,st)*k);mLeg(R,-1,.35*Math.max(0,-st)*k,.6*Math.max(0,-st)*k);
      if(Math.abs(st)>.99&&k>.5)o.fx('snow',mWP(R.root,st>0?.15:-.15,0,.2));if(t>4){R.spine.rotation.x=.35;mArm(R,1,.1,.3,-.3);mArm(R,-1,.1,.3,-.3);R.off.y=.02*Math.sin(t*10);}
      mSad(R,1);mBlink(R,t,.45);}},
  flake:{g:0,w(R,t,o){const u=t<3?1-Math.pow(1-t/3,2):1;R.off.ry=u*TAU*4;mArm(R,1,2.6,0,-.2);mArm(R,-1,2.6,0,-.2);if(R.ex.spin)R.ex.spin.rotation.z=t*9;mLeg(R,1,0,.05);mLeg(R,-1,-.4,.8);
      if(o.n%2==0)o.fx('sparkle',mWP(R.head,(Math.random()-.5)*.8,.4+Math.random()*.4,0));if(t>3)R.off.y=mHop(t-3,1.6,.1);mBlink(R,t,.55);},
    l(R,t,o){const u=mWin(t,0,3.2);R.off.s=1-.24*u;R.spine.rotation.x=.35*u;mHead(R,.3*u,0,.15*u);mArm(R,1,.05,.05,-.05);mArm(R,-1,.05,.05,-.05);mLeg(R,1,-.1,.4*u);mLeg(R,-1,-.1,.4*u);
      if(R.ex.spin)R.ex.spin.scale.set(1+.05*u,1-.15*u,1);if(o.n%3==0)o.fx('drip',mWP(R.head,(Math.random()-.5)*.6,.25,.2));mSad(R,1);mBlink(R,t,.85);}},
  berg:{g:0,w(R,t,o){const u=mWin(t,0,.5);mLeg(R,1,-.05,.15,.3*u);mLeg(R,-1,-.05,.15,.3*u);
      if(t<1.2||t>2.6){mArm(R,1,1.5,.05,-1.95);mArm(R,-1,1.5,.05,-1.95);if(t>2.6){const v=mWin(t,2.6,2.9);if(t<3.1){mArm(R,1,.3,1.2,-2);}mHead(R,.1*Math.sin(t*3),0,0);}}
      else{const st=(t-1.2)/.7,ph=st%1,leg=st<1?1:-1,lift=Math.sin(Math.min(1,ph/.75)*Math.PI);mLeg(R,leg,.7*lift,1.1*lift,.3);mArm(R,1,1.2,.2,-1.6);mArm(R,-1,1.2,.2,-1.6);R.off.rz=-.06*leg*lift;
        if(ph>.74&&ph<.8){o.shake(.4);o.fx('snow',mWP(R.root,leg*.2,0,.1));}}
      mBlink(R,t,.65);},
    l(R,t,o){const tr=t<1.4?.025*Math.sin(t*70):0;R.off.rz=tr;const ch=R.ex.chunk;
      if(ch&&t>1.4){const v=Math.min(t-1.4,.8),b=ch.userData.b0;ch.position.set(b[0].x+.5*v,b[0].y+2*v-5.6*v*v,b[0].z+.35*v);ch.rotation.set(v*4,v*2,v*5);if(t>2.2){ch.position.y=Math.max(ch.position.y,-1.6);}if(t>2.15&&t<2.2){o.shake(.2);o.fx('snow',mWP(ch,0,0,0));}}
      if(t>1.4&&t<1.45)o.crack();
      const v=mWin(t,2.2,2.8);mHead(R,.5*v,-.5*v,0);mArm(R,1,mL(.14,.9,mWin(t,1.4,1.7))*(1-v)+.08*v,.3,-.5);mArm(R,-1,mL(.14,.9,mWin(t,1.4,1.7))*(1-v)+.08*v,.3,-.5);R.spine.rotation.x=.3*v;
      mSad(R,mWin(t,1.4,1.6));mBlink(R,t,.15);}},
  bolt:{g:1,w(R,t,o){const m=R.ex.mat;if(t<1){const u=mWin(t,0,1);R.off.y=-.12*u;mArm(R,1,.2,.9*u,-2*u);mArm(R,-1,.2,.9*u,-2*u);mLeg(R,1,.3*u,.7*u);mLeg(R,-1,.3*u,.7*u);if(m)m.emissiveIntensity=.35+.8*u;}
      else if(t<2.2){const u=mWin(t,1,1.15);mArm(R,1,2.5*u,0,-.2);mArm(R,-1,2.5*u,0,-.2);R.off.y=.15*mHop(t-1,1.6,1);if(m)m.emissiveIntensity=1.6-.5*mWin(t,1.2,2.2);if(t<1.05)o.flash();if(o.n%1==0)o.fx('spark',mWP(R.head,(Math.random()-.5)*.9,.3+Math.random()*.6,0));}
      else{const z=Math.floor((t-2.2)*3.2),f=(t-2.2)*3.2-z,dir=z%2?1:-1;R.off.x=dir*.45*mSm(Math.min(1,f*3))-dir*.45*(1-mSm(Math.min(1,f*3)));R.off.rz=-.15*dir;mArm(R,dir,2.2,0,-.3);mArm(R,-dir,.4,.3,-1);if(m)m.emissiveIntensity=.9+.3*Math.sin(t*20);if(f<.1)o.fx('spark',mWP(R.root,0,.6,0));}
      mBlink(R,t,.95);},
    l(R,t,o){const m=R.ex.mat,u=mWin(t,0,3.5),fl=Math.random()<.25?.1:1;if(m)m.emissiveIntensity=Math.max(.04,(.4*(1-u))*fl);R.spine.rotation.x=.45*u;mHead(R,.3*u,0,.2*u);mArm(R,1,.04,.05,-.05);mArm(R,-1,.04,.05,-.05);mLeg(R,1,-.1,.35*u);mLeg(R,-1,-.1,.35*u);
      if(o.n%4==0)o.fx('smoke',mWP(R.head,0,.7,0));if(o.n%17==0)o.fx('spark',mWP(R.head,.2,.4,.2));mSad(R,1);mBlink(R,t,.05);}}
};
// the seal's puck (balanced on its nose)
function mPuck(R,on){let p=R.ex.puck;if(!on){if(p)p.visible=false;return;}if(!p){p=new mT.Mesh(new mT.CylinderGeometry(.16,.16,.09,20),PK_MAT.vc);const n=p.geometry.attributes.position.count,a=new Float32Array(n*3);a.fill(.06);p.geometry.setAttribute('color',new mT.BufferAttribute(a,3));
  p.position.set(0,.42,.42);R.head.add(p);R.ex.puck=p;p.castShadow=true;}p.visible=true;p.rotation.set(-.6,0,0);}
// one call per frame: the named animation at time t
function mPose(R,name,t,o){o=o||{};o.fx=o.fx||(()=>{});o.shake=o.shake||(()=>{});o.clap=o.clap||(()=>{});o.crack=o.crack||(()=>{});o.flash=o.flash||(()=>{});o.n=o.n||0;
  mRest(R);const W=MS_WL[R.sp];
  if(name==='idle'){R.spine.rotation.x=.03+.02*Math.sin(t*2.2);mArm(R,1,.14+.03*Math.sin(t*2.2),.06,-.3);mArm(R,-1,.14+.03*Math.sin(t*2.2+.5),.06,-.3);mBlink(R,t,R.sp.length*.31);}
  else if(name==='skate'){mSkate(R,t,o.k==null?1:o.k);mBlink(R,t);}
  else if(name==='shake'){mShake(R,t,o.u||0);mBlink(R,t);}
  else if(name==='bow'){mBow(R,o.u||0);}
  else if(name==='wave'){mWave(R,t,-1);mHead(R,-.1,0,.12*Math.sin(t*3));mBlink(R,t);}
  else if(name==='greet'){W.w(R,W.g+t,o);}
  else if(name==='win')W.w(R,t,o);
  else if(name==='lose')W.l(R,t,o);
  else if(name==='draw'){mShake(R,t,Math.min(1,t/2.2));if(t>2.4){const u=mWin(t,2.4,2.9);mArm(R,1,.5*u+.14,.3,-1.5*u-.3,-.4*u);mArm(R,-1,.5*u+.14,.3,-1.5*u-.3,-.4*u);mHead(R,0,0,.22*u*Math.sin(t*2));}mBlink(R,t);}
}
// put the rig where the scene wants it (b: x, z, yaw) plus the animation's own offsets
// o.ph: turn around a point that high instead of the feet (a flip turns around the hips)
function mPlace(R,b){const o=R.off,y=b.yaw||0,fx=Math.sin(y),fz=Math.cos(y),ph=o.ph||0,oz=o.z*(b.zk==null?1:b.zk)-ph*Math.sin(o.rx);R.root.position.set(b.x+fx*oz+fz*o.x,o.y+ph*(1-Math.cos(o.rx)),b.z+fz*oz-fx*o.x);
  R.root.rotation.set(o.rx,y+o.ry,o.rz,'YXZ');const k=MSC.h/2.58;R.root.scale.set(k,k*o.s,k);}
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
function mascFx(k,p){const E=(n,f)=>{for(let i=0;i<n;i++)f();};
  if(k==='snow')E(9,()=>emit(p.x,p.y+.05,p.z,rnd(-1.6,1.6),rnd(.6,2.2),rnd(-1.6,1.6),rnd(.35,.6),rnd(.08,.16),.92,.97,1));
  else if(k==='splash')E(26,()=>{const a=rnd(TAU),v=rnd(1.5,3.5);emit(p.x,p.y+.1,p.z,Math.cos(a)*v,rnd(2,4.5),Math.sin(a)*v,rnd(.5,.9),rnd(.1,.2),.75,.9,1);});
  else if(k==='sparkle')emit(p.x,p.y,p.z,rnd(-.3,.3),rnd(.3,.9),rnd(-.3,.3),rnd(.5,.9),rnd(.06,.12),1,.95,.7);
  else if(k==='spark')E(3,()=>emit(p.x,p.y,p.z,rnd(-2.5,2.5),rnd(-1,2.5),rnd(-2.5,2.5),rnd(.15,.32),rnd(.05,.1),1,.85,.25));
  else if(k==='smoke')emit(p.x,p.y,p.z,rnd(-.15,.15),rnd(.4,.8),rnd(-.15,.15),rnd(.9,1.4),rnd(.18,.3),.45,.45,.48);
  else if(k==='drip')emit(p.x,p.y,p.z,rnd(-.1,.1),rnd(-.4,0),rnd(-.1,.1),rnd(.5,.8),rnd(.05,.09),.7,.88,1);}
let MS_RIG={};
function mascRig(key,team,mas){const k=team+mas+kitSig(mKitOf(team,mas))+pkLo();let R=MS_RIG[key];if(R&&R.k===k)return R;if(R){scene.remove(R.root);}R=mBody(team,null,mas);R.k=k;R.root.visible=false;scene.add(R.root);MS_RIG[key]=R;return R;}
function mascHideWorld(on){const L=[];for(const p of G.pengs||[])if(p.pg)L.push(p.pg.root);for(const o of[typeof puckG!=='undefined'&&puckG,typeof puckRing!=='undefined'&&puckRing,typeof puckTrail!=='undefined'&&puckTrail,typeof marker!=='undefined'&&marker,typeof markerRing!=='undefined'&&markerRing,typeof passRing!=='undefined'&&passRing,typeof comboRing!=='undefined'&&comboRing,typeof aimTgt!=='undefined'&&aimTgt,typeof aimLine!=='undefined'&&aimLine,typeof aimArrow!=='undefined'&&aimArrow])if(o&&o.isObject3D)L.push(o);
  for(const o of L){if(on){if(o.userData.mscV==null)o.userData.mscV=o.visible;o.visible=false;}else if(o.userData.mscV!=null){o.visible=o.userData.mscV;delete o.userData.mscV;}}}
function mascUI(on,cap,sub){let e=$('#mascFx');if(!e){e=document.createElement('div');e.id='mascFx';e.innerHTML='<i class="ms-bar t"></i><i class="ms-bar b"></i><div class="ms-cap"><b></b><small></small></div><button id="mascSkip" class="ms-skip"></button><i class="ms-fade"></i><i class="ms-flash"></i>';document.body.appendChild(e);
    e.addEventListener('pointerdown',ev=>{if(G.masc&&!G.masc.lock&&G.masc.t>MSC.skipAfter){G.masc.skip=true;ev.preventDefault();}});}
  document.body.classList.toggle('mascOn',!!on);e.classList.toggle('on',!!on);if(!on)return;
  e.querySelector('.ms-cap b').innerHTML=cap||'';e.querySelector('.ms-cap small').textContent=sub||'';const sk=$('#mascSkip');sk.textContent=G.masc&&G.masc.lock?'':__L('탭해서 건너뛰기 ›');sk.style.visibility=G.masc&&G.masc.lock?'hidden':'visible';}
function mascCapOf(a,b,tA,tB){const c=k=>kitHex(TEAM[k].color);return '<span style="color:'+kitMix(c(tA),'#ffffff',.35)+'">'+KIT_MASN[a]+'</span><em>VS</em><span style="color:'+kitMix(c(tB),'#ffffff',.35)+'">'+KIT_MASN[b]+'</span>';}
// kind: 'intro' | 'end' | 'preview'; o.res: 'win' | 'lose' | 'draw' (my side), o.cb when it is over
function mascStart(kind,cfg,o){o=o||{};if(G.masc)mascEnd(false);
  const pr=o.pair||mascPair(cfg),A=mascRig('A',pr.mine,pr.my),B=mascRig('B',pr.oth,pr.op),key=pr.my+'|'+pr.op;
  let quick=!!(kind==='intro'&&(mascMode()==='short'||MS_SESS[key]));if(kind==='intro')MS_SESS[key]=1;
  const dur=kind==='intro'?(quick?MSC.introQ:MSC.intro):kind==='preview'?(o.dur||MSC.end+.6):MSC.end;
  G.masc={kind,quick,t:0,dur,A,B,pr,res:o.res||'win',cb:o.cb||null,lock:!!(kind==='intro'&&cfg&&cfg.net),skip:false,n:0,shake:0,fov:camera.fov,cam:null,
    from:{p:camera.position.clone(),q:camera.quaternion.clone()},prev:o.prev||null};
  A.root.visible=B.root.visible=true;mascHideWorld(true);
  const sub=kind==='intro'?__L('우리 팀 마스코트 등장'):kind==='preview'?(o.sub||''):G.masc.res==='win'?__L('승리 세리머니'):G.masc.res==='lose'?__L('아쉬운 패배'):__L('무승부 — 서로 악수');
  mascUI(true,mascCapOf(pr.my,pr.op,pr.mine,pr.oth),sub);mascFade(1,0);try{SFX.whoosh();SFX.crowd(.6);}catch(e){}
  return true;}
function mascFade(v,dur){const f=document.querySelector('#mascFx .ms-fade');if(!f)return;f.style.transition=dur?'opacity '+dur+'s':'none';f.style.opacity=v;if(!dur)void f.offsetWidth;}
function mascClear(){if(G.masc)mascEnd(false);}
function mascEnd(run){const M=G.masc;if(!M)return;G.masc=null;for(const k in MS_RIG){MS_RIG[k].root.visible=false;}mascHideWorld(false);mascUI(false);
  camera.fov=M.fov;camera.updateProjectionMatrix();if(run!==false&&M.cb)try{M.cb();}catch(e){console.error(e);}}
const MS_X=.64,MS_XB=.96;
// where everyone stands and what they do at time t
function mascStep(dt){const M=G.masc;if(!M||G.paused)return;M.t+=dt;M.n++;const t=M.t,A=M.A,B=M.B,W=MS_WL,n=M.n;
  if(M.t>.05&&!M.f0){M.f0=1;mascFade(0,.35);}
  if(M.skip){M.skip=false;if(M.t<M.dur-.42){M.t=M.dur-.42;}}
  if(M.t>=M.dur-.4&&!M.f1){M.f1=1;mascFade(1,.35);}
  if(M.t>=M.dur){mascEnd(true);return;}
  const o={n,fx:mascFx,shake:a=>{M.shake=Math.max(M.shake,a);},clap:()=>{try{SFX.tap();}catch(e){}},crack:()=>{try{SFX.hit(1);SFX.bump();}catch(e){}},flash:()=>mascFlash()};
  const pl=(R,x,z,yaw)=>mPlace(R,{x,z,yaw,zk:M.kind==='intro'?1:.35}),turn=(a,b,u)=>a+(b-a)*mSm(u);
  if(M.kind==='intro'){
    if(!M.quick&&t<2.2){const u=1-Math.pow(1-Math.min(1,t/2.1),2.2),x=mL(5.4,MS_X,u),k=Math.max(.25,1-u*.9);
      mPose(A,'skate',t,{k});pl(A,-x,0,Math.PI/2);mPose(B,'skate',t+.31,{k});pl(B,x,0,-Math.PI/2);if(n%4==0&&u<.95){mascFx('snow',mV(-x-.1,0,.1));mascFx('snow',mV(x+.1,0,-.1));}}
    else{const s0=M.quick?0:2.2,ts=t-s0;
      if(ts<1.7){const u=ts/1.7;mPose(A,'shake',ts,{u});mPose(B,'shake',ts,{u});pl(A,-MS_X,0,Math.PI/2);pl(B,MS_X,0,-Math.PI/2);if(Math.abs(u-.3)<.01||Math.abs(u-.45)<.01)o.clap();}
      else if(ts<2.4){const u=(ts-1.7)/.7,x=mL(MS_X,MS_XB,mSm(Math.min(1,u*1.6)));mPose(A,'bow',ts,{u});mPose(B,'bow',ts,{u});pl(A,-x,0,Math.PI/2);pl(B,x,0,-Math.PI/2);}
      else if(M.quick){const u=Math.min(1,(ts-2.4)/.35);mPose(A,'wave',ts);mPose(B,'wave',ts+.2);pl(A,-MS_XB,0,turn(Math.PI/2,0,u));pl(B,MS_XB,0,turn(-Math.PI/2,0,u));}
      else if(ts<3.8){const u=Math.min(1,(ts-2.4)/.3);mPose(A,'greet',ts-2.4,o);pl(A,-MS_XB,0,turn(Math.PI/2,.15,u));mPose(B,'idle',ts);pl(B,MS_XB,0,turn(-Math.PI/2,-.45,u));if(ts-dt<2.45)mascVoice(A.sp);}
      else{const u=Math.min(1,(ts-3.8)/.3);mPose(B,'greet',ts-3.8,o);pl(B,MS_XB,0,turn(-.45,-.15,u));mPose(A,'idle',ts);pl(A,-MS_XB,0,.25);if(ts-dt<3.85)mascVoice(B.sp);}}
  }else{
    // end / preview: my mascot on the left, the other on the right, both towards the camera (a draw starts with a handshake)
    const res=M.res,aN=res==='draw'?'draw':res==='win'?'win':'lose',bN=res==='draw'?'draw':res==='win'?'lose':'win',dr=res==='draw'&&t<2.4,X=dr?MS_X:1.05;
    o.side=-1;mPose(A,aN,t,o);o.side=1;mPose(B,bN,t,o);pl(A,-X,0,dr?Math.PI/2:turn(Math.PI/2,.12,Math.min(1,t*4)+(res==='draw'?0:1)));pl(B,X,0,dr?-Math.PI/2:turn(-Math.PI/2,-.12,Math.min(1,t*4)+(res==='draw'?0:1)));
    if(res==='draw'&&t>=2.4){const u=Math.min(1,(t-2.4)/.4);pl(A,-mL(MS_X,1.05,u),0,turn(Math.PI/2,.12,u));pl(B,mL(MS_X,1.05,u),0,turn(-Math.PI/2,-.12,u));}
    if(Math.abs(t-.05)<dt*1.01){try{if(M.kind==='end'){res==='win'?SFX.fanfare():res==='lose'?SFX.bray():SFX.honk();}}catch(e){}}
  }
  for(const R of[A,B])R.root.updateMatrixWorld(true);
  M.shake*=Math.exp(-dt*6);
}
function mascVoice(sp){try{({peng:'honk',walrus:'bray',seal:'honk',bear:'bump',berg:'bump',bolt:'flare',flake:'flare',narwhal:'flare',owl:'heart',fox:'hop',fish:'hop',orca:'whoosh'})[sp]&&SFX[({peng:'honk',walrus:'bray',seal:'honk',bear:'bump',berg:'bump',bolt:'flare',flake:'flare',narwhal:'flare',owl:'heart',fox:'hop',fish:'hop',orca:'whoosh'})[sp]]();}catch(e){}}
function mascFlash(){if(save.set.flash===false||RM0)return;const f=document.querySelector('#mascFx .ms-flash');if(!f)return;f.classList.remove('on');void f.offsetWidth;f.classList.add('on');}
// the camera: framed shots (a point of interest, how much must fit across / up, and the side the camera sits on) — the distance
// follows the screen shape, so a tall phone sees the same framing as a wide screen; shots blend over 0.3 s
function mascFrame(c,w,h,dir,fov){const vf=fov*Math.PI/180,hf=2*Math.atan(Math.tan(vf/2)*camera.aspect),bar=Math.min(innerHeight*(camera.aspect>1.3?.07:.09),64),fr=Math.max(.5,1-2*bar/innerHeight-36/innerHeight),
  d=Math.max(h/2/(Math.tan(vf/2)*fr),w/2/Math.tan(hf/2))*1.06,
  L=Math.hypot(dir[0],dir[1],dir[2]);return {p:[c[0]+dir[0]/L*d,c[1]+dir[1]/L*d,c[2]+dir[2]/L*d],l:c,fov};}
function mascShot(M){const t=M.t,A=M.A,B=M.B,ap=A.root.position,bp=B.root.position,hy=R=>R.head.getWorldPosition(mV(0,0,0)).y,cy=R=>Math.max(.55,Math.min(1.5,hy(R)*.78));
  const S=(a,b,c0,c1,w0,w1,h,dir,fov)=>({a,b,f:u=>{const w=mL(w0,w1,u);return mascFrame(c0.map((v,i)=>mL(v,c1[i],u)),w,h*w,dir,fov||38);}});let L;
  if(M.kind==='intro'){
    if(M.quick)L=[S(0,2.4,[0,1.2,0],[0,1.2,0],2.9,2.5,.78,[.5,.2,1]),S(2.4,3.4,[0,1.15,0],[0,1.15,0],3.4,3.6,.75,[0,.2,1])];
    else L=[S(0,2.2,[0,1.1,0],[0,1.1,0],3.9,3.3,.72,[0,.17,1],42),S(2.2,3.9,[0,1.25,0],[0,1.25,0],2.8,2.4,.78,[.55,.2,1]),S(3.9,4.6,[0,1.0,0],[0,1.0,0],3.1,3.0,.8,[0,.48,1]),
      S(4.6,6.0,[ap.x,cy(A),ap.z],[ap.x,cy(A),ap.z],1.75,1.45,1.05,[.35,.1,1],34),S(6.0,7.0,[bp.x,cy(B),bp.z],[bp.x,cy(B),bp.z],1.75,1.5,1.05,[-.35,.1,1],34),S(7.0,7.4,[0,1.1,0],[0,1.1,0],3.6,4.6,.72,[0,.3,1],42)];}
  // end / preview: the pair, then each mascot up close (mine first, then the other one's reaction), then the pair again
  else{const cw=camera.aspect<.8?1.5:1.85;L=[S(0,2.2,[0,1.1,.3],[0,1.1,.3],4.2,3.7,.7,[0,.15,1],40),S(2.2,3.6,[ap.x,cy(A),ap.z+.1],[ap.x,cy(A),ap.z+.1],cw,cw*.88,1.05,[.32,.12,1],36),
    S(3.6,4.8,[bp.x,cy(B),bp.z+.1],[bp.x,cy(B),bp.z+.1],cw,cw*.88,1.05,[-.32,.12,1],36),S(4.8,M.dur,[0,1.0,.2],[0,1.0,.2],4.0,4.8,.7,[0,.28,1],42)];}
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
// the kit designer's preview: the chosen mascot's victory or defeat over the menu's ice (both played back to back)
function mascPreview(mas,res){if(G.masc||!mascPossible())return false;const scr=document.querySelector('.screen.on'),id=scr&&scr.id;
  const L=KIT.mas.filter(m=>m!==mas);const pr={mine:save.team||'blue',oth:(save.team||'blue')==='blue'?'red':'blue',my:mas,op:L[(KIT.mas.indexOf(mas)+3)%L.length]};
  if(scr)scr.classList.remove('on');
  return mascStart('preview',null,{pair:pr,res,dur:MSC.end,sub:res==='win'?__L('승리 세리머니'):__L('패배 리액션'),cb:()=>{if(id)show(id);if(id==='sKit')kitRender();}});}
function mascPossible(){return !window.__NOFX&&typeof WebGLRenderingContext!=='undefined';}
