/* ================= v26: signature props & effects (대표 소품 · 효과) ================= */
// Every species' skill gets a recognisable, modelled centre-piece instead of a few dots:
// 황제 = jewelled sceptre + crown + golden light pillar · 임금 = herald trumpet with banner + sound rings · 큰바다쇠오리 = a real breaking wave ·
// 턱끈 = ice crystals erupting · 바위뛰기 = rocks · 마카로니 = flame crest · 로열 = red carpet · 피오르드랜드 = leaf whirlwind ·
// 노란눈 = eye beams · 쇠푸른 = fairy wings · 아프리카 = bray rings · 훔볼트 = water vortex · 마젤란 = compass rose · 갈라파고스 = the sun ·
// 젠투 = water torpedo jet · 아델리 = wind rings. All geometry is built in code (no downloads, a few KB).
// The cinematic camera (v25) frames each one so the centre-piece is in shot (SIGCAM).
const SIGCAM={   // a: camera angle around the penguin (0 = in front, ±π/2 = side, π = behind) · d: distance × · y / ly: camera / look height (× penguin height)
  king:{a:1.2,ta:.9,d:.92,ly:.66},little:{a:2.55,d:1.1,ly:.6},auk:{a:.3,d:1.75,y:.5,ly:.95,v:.3},fast:{a:1.35,d:1.15},galapagos:{a:.35,d:1.3,y:.3,ly:.85},
  defense:{a:.45,d:1.3},balanced:{a:.5,d:1.25},royal:{a:.75,d:1.15,ly:.62},humboldt:{a:.4,d:1.35},magellanic:{a:.3,d:1.35,y:1.3,ly:.3},
  yelloweye:{a:.55,d:1.1,ly:.62},strong:{a:.75,d:1.1,ly:.62},fiordland:{a:.4,d:1.3},african:{a:1.0,d:1.05,ly:.62},macaroni:{a:.5,d:1.05,ly:.62},basic:{a:1.2,d:1.15}};
const SG={};   // shared materials, geometries, pools
function sgMat(){
  if(SG.gold)return SG;
  const std=o=>new T.MeshStandardMaterial(o);
  SG.gold=std({color:0xffc43d,metalness:1,roughness:.22,emissive:0x5a3a00,envMapIntensity:1.7});
  SG.goldD=std({color:0xd99a1c,metalness:1,roughness:.32,emissive:0x2a1800,envMapIntensity:1.3});
  SG.ruby=std({color:0xff1f45,metalness:.2,roughness:.08,emissive:0x5a0010,envMapIntensity:2});
  SG.saph=std({color:0x4a7dff,metalness:.2,roughness:.08,emissive:0x0a1a5a,envMapIntensity:2});
  SG.amet=std({color:0xa45bff,metalness:.2,roughness:.08,emissive:0x2a0a5a,envMapIntensity:2});
  SG.pearl=std({color:0xfff6ea,metalness:.1,roughness:.25,emissive:0x221d18});
  SG.velvet=std({color:0xb0102a,metalness:0,roughness:.85,side:T.DoubleSide});
  SG.velvetP=std({color:0x5a1aa0,metalness:0,roughness:.85,side:T.DoubleSide});
  SG.ermine=std({color:0xf4f6fa,metalness:0,roughness:.9});
  SG.ice=std({color:0xbfe9ff,metalness:.1,roughness:.04,transparent:true,opacity:.82,emissive:0x1b4f7a,envMapIntensity:2,flatShading:true});
  SG.stone=std({color:0x7d7468,metalness:0,roughness:.95,flatShading:true});
  SG.leaf=std({color:0x2f9a4f,metalness:0,roughness:.6,side:T.DoubleSide,emissive:0x07240f});
  SG.leaf2=std({color:0x8fd14f,metalness:0,roughness:.6,side:T.DoubleSide,emissive:0x15300a});
  return SG;
}
const sgAdd=(col,op)=>new T.MeshBasicMaterial({color:col,transparent:true,opacity:op==null?1:op,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false});
function sgCanvas(S,draw){const c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');draw(x,S);const t=new T.CanvasTexture(c);return t;}
function sgTex(k){
  const K='t_'+k;if(SG[K])return SG[K];let t;
  if(k==='banner')t=sgCanvas(128,(x,S)=>{const g=x.createLinearGradient(0,0,0,S);g.addColorStop(0,'#e01b3a');g.addColorStop(1,'#8c0a20');x.fillStyle=g;x.fillRect(0,0,S,S);
    x.strokeStyle='#ffd04a';x.lineWidth=7;x.strokeRect(8,8,S-16,S-28);x.fillStyle='#ffd04a';for(let i=0;i<8;i++){x.beginPath();x.moveTo(i*16,S-18);x.lineTo(i*16+16,S-18);x.lineTo(i*16+8,S);x.fill();}
    x.translate(S/2,S/2-8);x.fillStyle='#ffd04a';x.beginPath();x.moveTo(-30,14);x.lineTo(-34,-18);x.lineTo(-17,-4);x.lineTo(0,-26);x.lineTo(17,-4);x.lineTo(34,-18);x.lineTo(30,14);x.closePath();x.fill();
    x.fillRect(-30,16,60,8);x.fillStyle='#fff';for(const a of[-34,0,34])x.beginPath(),x.arc(a,a?-18:-26,5,0,TAU),x.fill();});
  else if(k==='carpet')t=sgCanvas(128,(x,S)=>{x.fillStyle='#b3122d';x.fillRect(0,0,S,S);x.fillStyle='#ffcf4a';x.fillRect(0,0,14,S);x.fillRect(S-14,0,14,S);x.fillStyle='#7a0a1e';x.fillRect(16,0,5,S);x.fillRect(S-21,0,5,S);
    x.fillStyle='rgba(255,207,74,.55)';for(let y=0;y<S;y+=32){x.beginPath();x.moveTo(S/2,y+4);x.lineTo(S/2+10,y+16);x.lineTo(S/2,y+28);x.lineTo(S/2-10,y+16);x.fill();}});
  else if(k==='flow')t=sgCanvas(64,(x,S)=>{for(let y=0;y<S;y++){const a=.5+.5*Math.sin(y/S*TAU*2);x.fillStyle='rgba(255,255,255,'+(.25+.75*a*a).toFixed(3)+')';x.fillRect(0,y,S,1);}});
  else if(k==='rays')t=sgCanvas(256,(x,S)=>{x.translate(S/2,S/2);for(let i=0;i<16;i++){x.rotate(TAU/16);const L=i%2?.62:.98,g=x.createLinearGradient(0,0,0,-S/2*L);g.addColorStop(0,'rgba(255,240,170,1)');g.addColorStop(1,'rgba(255,170,40,0)');x.fillStyle=g;x.beginPath();x.moveTo(-14,0);x.lineTo(0,-S/2*L);x.lineTo(14,0);x.fill();}
    const g=x.createRadialGradient(0,0,0,0,0,S*.3);g.addColorStop(0,'rgba(255,255,235,1)');g.addColorStop(.45,'rgba(255,220,90,.9)');g.addColorStop(1,'rgba(255,180,40,0)');x.fillStyle=g;x.fillRect(-S/2,-S/2,S,S);});
  else if(k==='wing2')t=sgCanvas(256,(x,S)=>{
    const lobe=(cx,cy,rx,ry,rot,a,b)=>{x.save();x.translate(cx,cy);x.rotate(rot);const g=x.createLinearGradient(-rx,0,rx,0);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.beginPath();x.ellipse(0,0,rx,ry,0,0,TAU);x.fill();
      x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=3;x.stroke();x.strokeStyle='rgba(120,200,255,.7)';x.lineWidth=1.5;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(-rx*.9,0);x.quadraticCurveTo(0,i*ry*.35,rx*.95,i*ry*.3);x.stroke();}x.restore();};
    lobe(140,92,110,52,-.42,'rgba(190,240,255,.85)','rgba(255,190,250,.75)');lobe(118,176,82,36,.32,'rgba(170,230,255,.85)','rgba(200,170,255,.75)');
    for(let i=0;i<40;i++){x.fillStyle='rgba(255,255,255,'+(.4+.6*Math.random()).toFixed(2)+')';x.beginPath();x.arc(40+Math.random()*200,40+Math.random()*170,1+Math.random()*2.2,0,TAU);x.fill();}});
  SG[K]=t;return t;
}
/* ---------- props (attached to the penguin; replace the v23 placeholders) ---------- */
function lathe(pts,seg){return new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg||24);}
function sgSceptre(){
  const M=sgMat(),g=new T.Group();
  const rod=lathe([[0,0],[.075,.0],[.085,.04],[.06,.08],[.05,.1],[.072,.13],[.05,.16],[.042,.2],[.038,.6],[.06,.63],[.07,.66],[.06,.69],[.038,.72],[.036,1.18],[.065,1.22],[.08,1.26],[.065,1.3],[.04,1.34],[.04,1.55],[.07,1.6],[.13,1.68],[.15,1.72],[.11,1.74],[0,1.75]],20);
  g.add(new T.Mesh(rod,M.gold));
  const orb=new T.Mesh(new T.SphereGeometry(.17,28,20),M.gold);orb.position.y=1.9;g.add(orb);
  const band=new T.Mesh(new T.TorusGeometry(.172,.02,8,40),M.goldD);band.position.y=1.9;band.rotation.x=Math.PI/2;g.add(band);
  const mer=new T.Mesh(new T.TorusGeometry(.172,.018,8,40),M.goldD);mer.position.y=1.9;g.add(mer);
  const cv=new T.Mesh(new T.BoxGeometry(.045,.24,.045),M.gold);cv.position.y=2.17;g.add(cv);const ch=new T.Mesh(new T.BoxGeometry(.16,.045,.045),M.gold);ch.position.y=2.2;g.add(ch);
  for(const [y,s,m] of[[1.9,.06,M.ruby],[1.26,.045,M.saph],[.66,.035,M.ruby]])for(const a of[0,Math.PI]){const gm=new T.Mesh(new T.SphereGeometry(s,14,10),m);gm.position.set(Math.sin(a)*(y>1.8?.175:y>1?.08:.07),y,Math.cos(a)*(y>1.8?.175:y>1?.08:.07));g.add(gm);}
  for(let i=0;i<6;i++){const a=i/6*TAU,gm=new T.Mesh(new T.SphereGeometry(.022,8,6),i%2?M.saph:M.ruby);gm.position.set(Math.sin(a)*.14,1.7,Math.cos(a)*.14);g.add(gm);}
  return g;
}
function sgCrown(royal){
  const M=sgMat(),g=new T.Group();
  const band=lathe([[.2,0],[.215,.0],[.215,.02],[.205,.05],[.21,.1],[.225,.12],[.2,.12]],32);band.computeVertexNormals();
  const bm=new T.Mesh(band,M.gold);bm.material=M.gold.clone();bm.material.side=T.DoubleSide;g.add(bm);
  const rim=new T.Mesh(new T.TorusGeometry(.212,.028,8,36),M.ermine);rim.rotation.x=Math.PI/2;rim.position.y=-.005;g.add(rim);
  const cap=new T.Mesh(new T.SphereGeometry(.19,20,12,0,TAU,0,Math.PI/2),royal?M.velvetP:M.velvet);cap.position.y=.06;cap.scale.y=1.05;g.add(cap);
  for(let i=0;i<8;i++){const a=i/8*TAU,big=i%2===0;
    const pt=new T.Mesh(new T.ConeGeometry(big?.045:.03,big?.16:.1,6),M.gold);pt.position.set(Math.sin(a)*.21,.12+(big?.08:.05),Math.cos(a)*.21);g.add(pt);
    const ball=new T.Mesh(new T.SphereGeometry(big?.028:.02,10,8),M.pearl);ball.position.set(Math.sin(a)*.21,.12+(big?.17:.105),Math.cos(a)*.21);g.add(ball);
    const gm=new T.Mesh(new T.SphereGeometry(.026,10,8),royal?(big?M.amet:M.saph):(big?M.ruby:M.saph));gm.position.set(Math.sin(a)*.222,.06,Math.cos(a)*.222);gm.scale.z=.6;gm.lookAt(0,.06,0);g.add(gm);}
  for(const r of[0,Math.PI/2]){const ar=new T.Mesh(new T.TorusGeometry(.2,.016,8,24,Math.PI),M.gold);ar.position.y=.12;ar.rotation.y=r;ar.scale.y=.85;g.add(ar);}
  const orb=new T.Mesh(new T.SphereGeometry(.04,14,10),M.gold);orb.position.y=.31;g.add(orb);
  const cv=new T.Mesh(new T.BoxGeometry(.018,.08,.018),M.gold);cv.position.y=.37;g.add(cv);const chh=new T.Mesh(new T.BoxGeometry(.055,.018,.018),M.gold);chh.position.y=.38;g.add(chh);
  g.scale.setScalar(1.05);return g;
}
function sgTrumpet(){
  const M=sgMat(),g=new T.Group();
  const mouth=lathe([[0,0],[.03,0],[.032,.012],[.02,.03],[.012,.06],[.012,.08]],16);mouth.rotateX(Math.PI/2);g.add(new T.Mesh(mouth,M.gold));
  const pipe=new T.Mesh(new T.CylinderGeometry(.014,.014,.62,12),M.gold);pipe.rotation.x=Math.PI/2;pipe.position.z=.08+.31;g.add(pipe);
  const pts=[];for(let i=0;i<=26;i++){const t=i/26;pts.push([.014+.19*Math.pow(t,3.4)+.004*t,.0+.32*t]);}pts.push([.205,.322],[.2,.318]);
  const bell=lathe(pts,32);bell.rotateX(Math.PI/2);bell.translate(0,0,.62);const bm=new T.Mesh(bell,M.gold.clone());bm.material.side=T.DoubleSide;g.add(bm);
  const lip=new T.Mesh(new T.TorusGeometry(.203,.008,6,40),M.goldD);lip.position.z=.942;g.add(lip);
  // valve block + finger buttons, the tuning loop under the pipe
  for(let i=0;i<3;i++){const z=.24+i*.055,v=new T.Mesh(new T.CylinderGeometry(.022,.022,.12,12),M.goldD);v.position.set(0,-.02,z);g.add(v);
    const cap=new T.Mesh(new T.CylinderGeometry(.026,.026,.012,12),M.gold);cap.position.set(0,.045,z);g.add(cap);const bt=new T.Mesh(new T.CylinderGeometry(.016,.016,.03,10),M.pearl);bt.position.set(0,.065,z);g.add(bt);}
  const path=new T.CatmullRomCurve3([new T.Vector3(0,-.07,.22),new T.Vector3(0,-.12,.18),new T.Vector3(0,-.15,.32),new T.Vector3(0,-.12,.5),new T.Vector3(0,-.04,.56),new T.Vector3(0,0,.6)]);
  g.add(new T.Mesh(new T.TubeGeometry(path,24,.012,8,false),M.gold));
  for(const z of[.2,.48]){const ring=new T.Mesh(new T.TorusGeometry(.019,.006,6,14),M.goldD);ring.position.z=z;g.add(ring);}
  // the banner: a little grid that waves (vertices moved every frame)
  const bg=new T.PlaneGeometry(.34,.3,8,5);bg.translate(0,-.15,0);const ban=new T.Mesh(bg,new T.MeshStandardMaterial({map:sgTex('banner'),side:T.DoubleSide,roughness:.75,metalness:0}));
  ban.rotation.y=Math.PI/2;ban.position.set(0,-.012,.48);g.add(ban);g.userData.ban=ban;g.userData.b0=Float32Array.from(bg.attributes.position.array);
  const bar=new T.Mesh(new T.CylinderGeometry(.008,.008,.36,8),M.gold);bar.rotation.x=Math.PI/2;bar.position.set(0,-.012,.48);g.add(bar);
  return g;
}
function sgBannerWave(g,t){const ban=g.userData.ban;if(!ban)return;const a=ban.geometry.attributes.position,b=g.userData.b0;
  for(let i=0;i<a.count;i++){const x=b[i*3],y=b[i*3+1],k=(x+.17)/.34;a.array[i*3+2]=Math.sin(t*9+k*5+y*6)*.025*k+Math.sin(t*5+y*9)*.01;}a.needsUpdate=true;}
/* called by castProps (v23) once per penguin: swap the placeholder props for the modelled ones and add the per-species pieces */
function sigProps(p,cx){
  const P=p.pg,k=p.type;sgMat();
  const swap=(o,n)=>{if(!o)return;for(const ch of[...o.children])o.remove(ch);for(const ch of[...n.children])o.add(ch);};
  try{
    if(cx.sceptre)swap(cx.sceptre,sgSceptre());
    if(cx.crown){swap(cx.crown,sgCrown(k==='royal'));cx.crown.position.y=1.6;}   // sits on the head (head top ≈ 1.71)
    if(cx.trumpet){const n=sgTrumpet();swap(cx.trumpet,n);cx.trumpet.userData=n.userData;cx.trumpet.position.copy(pkHeadPt(0,1.37,-.03));cx.trumpet.rotation.set(-.22,0,0);cx.trumpet.userData.s=1.3;}
    if(cx.wings){for(const w of[cx.wl,cx.wr]){const m=w.children[0];m.material=new T.MeshBasicMaterial({map:sgTex('wing2'),transparent:true,side:T.DoubleSide,depthWrite:false});m.scale.set(1.45,1.45,1);}}
    if(k==='macaroni'){const g=new T.Group();const fl=lathe([[0,0],[.06,.04],[.075,.12],[.05,.26],[.02,.4],[0,.5]],12);for(let i=0;i<7;i++){const out=new T.Mesh(fl,sgAdd(i%2?0xff3a0a:0xff7a10,.75)),core=new T.Mesh(fl,sgAdd(0xffe27a,.9));core.scale.setScalar(.55);core.position.y=.02;out.add(core);
        out.position.set((i-3)*.06,0,-.05*Math.abs(i-3));out.rotation.z=(i-3)*-.24;out.rotation.x=-.75;const sc=1.6-.18*Math.abs(i-3);out.scale.setScalar(sc);out.userData.s=sc;g.add(out);}
      g.position.copy(pkHeadPt(0,1.72,-.05));g.visible=false;P.headAbs.add(g);cx.flames=g;}
    if(k==='yelloweye'){const mk=()=>{const geo=new T.CylinderGeometry(.02,.3,1,14,1,true);geo.translate(0,.5,0);const m=new T.Mesh(geo,sgAdd(0xffd84a,.6));m.visible=false;m.frustumCulled=false;scene.add(m);return m;};cx.beamL=mk();cx.beamR=mk();}
    if(k==='galapagos'){const g=new T.Group(),core=new T.Mesh(new T.SphereGeometry(.26,24,16),new T.MeshBasicMaterial({color:0xfff6c8,fog:false}));g.add(core);
      const rays=new T.Sprite(new T.SpriteMaterial({map:sgTex('rays'),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));rays.scale.setScalar(2.4);g.add(rays);cx.sunRays=rays;
      const glow=new T.Sprite(new T.SpriteMaterial({map:cxTex('glow'),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,color:0xffc040}));glow.scale.setScalar(3.4);g.add(glow);
      g.position.y=2.9;g.visible=false;P.root.add(g);cx.sun3=g;if(cx.sun)cx.sun.visible=false;}
  }catch(e){dbgErr('sigProps',e);}
}
/* ---------- world effects: pooled ---------- */
const sgP={rings:[],shards:[],rocks:[],leaves:[],beams:[],waves:[],carpets:[],vort:[],rose:[],discs:[]};
function sgGet(kind,make){const L=sgP[kind];let o=L.find(q=>q.life<=0);if(!o){if(L.length>=({rings:14,shards:16,rocks:16,leaves:18,beams:3,waves:2,carpets:2,vort:2,rose:2,discs:4}[kind]))return null;o={m:make(),life:0};scene.add(o.m);L.push(o);}o.m.visible=true;o.seen=G.frame;return o;}
function sgRing(x,y,z,dx,dy,dz,col,r0,r1,life,tube){
  const o=sgGet('rings',()=>new T.Mesh(new T.TorusGeometry(1,.06,10,56),sgAdd(0xffffff,1)));if(!o)return;
  o.m.position.set(x,y,z);o.m.lookAt(x+dx,y+dy,z+dz);o.m.material.color.set(col);o.r0=r0;o.r1=r1;o.life=o.max=life;o.tube=tube||1;o.vx=dx*1.6;o.vy=dy*1.6;o.vz=dz*1.6;
}
function sgDisc(x,z,col,r1,life){   // flat shock-wave on the ice
  const o=sgGet('discs',()=>{const m=new T.Mesh(new T.RingGeometry(.86,1,64),sgAdd(0xffffff,1));m.rotation.x=-Math.PI/2;return m;});if(!o)return;
  o.m.position.set(x,.06,z);o.m.material.color.set(col);o.r1=r1;o.life=o.max=life;
}
function sgCrystalGeo(){if(!SG.crys){const g=lathe([[0,0],[.16,0],[.2,.15],[.16,.72],[0,1]],6);g.computeVertexNormals();SG.crys=g;}return SG.crys;}
function sgShards(x,z,n,r0,r1,h){
  for(let i=0;i<n;i++){const o=sgGet('shards',()=>new T.Mesh(sgCrystalGeo(),sgMat().ice));if(!o)return;
    const a=i/n*TAU+rnd(-.2,.2),r=rnd(r0,r1),sx=x+Math.cos(a)*r,sz=z+Math.sin(a)*r;o.m.position.set(sx,-.05,sz);
    o.m.rotation.set(0,0,0);o.m.rotateY(-a);o.m.rotateZ(-rnd(.25,.6));o.h=h*rnd(.6,1.25)*(1-.25*(r-r0)/(r1-r0+.01));o.w=rnd(.8,1.3);o.life=o.max=rnd(1.3,1.7);o.delay=r*.06;o.m.scale.set(.001,.001,.001);}
}
function sgRock(x,y,z){const o=sgGet('rocks',()=>{const g=new T.DodecahedronGeometry(.18,0),a=g.attributes.position;for(let i=0;i<a.count;i++)a.setXYZ(i,a.getX(i)*rnd(.7,1.25),a.getY(i)*rnd(.6,1.1),a.getZ(i)*rnd(.7,1.25));g.computeVertexNormals();return new T.Mesh(g,sgMat().stone);});if(!o)return;
  const a=rnd(TAU),v=rnd(1.5,3.5);o.m.position.set(x,y,z);o.vx=Math.cos(a)*v;o.vz=Math.sin(a)*v;o.vy=rnd(3.5,6);o.sp=[rnd(-8,8),rnd(-8,8)];o.life=o.max=rnd(.9,1.3);o.m.scale.setScalar(rnd(.7,1.6));}
function sgLeaf(p,i,n){const o=sgGet('leaves',()=>{const s=new T.Shape();s.moveTo(0,-.2);s.quadraticCurveTo(.13,-.05,0,.22);s.quadraticCurveTo(-.13,-.05,0,-.2);return new T.Mesh(new T.ShapeGeometry(s,6),Math.random()<.5?sgMat().leaf:sgMat().leaf2);});if(!o)return;
  o.p=p;o.ph=i/n*TAU;o.r=rnd(.9,1.4);o.hy=rnd(.1,.5);o.vy=rnd(.6,1.3);o.life=o.max=rnd(1.2,1.6);o.m.scale.setScalar(rnd(1,1.6));}
function sgBeam(x0,y0,z0,x1,y1,z1,col,life,w){const o=sgGet('beams',()=>{const g=new T.CylinderGeometry(1,1,1,16,1,true);g.translate(0,.5,0);return new T.Mesh(g,sgAdd(0xffffff,.8));});if(!o)return;
  const dx=x1-x0,dy=y1-y0,dz=z1-z0,L=Math.hypot(dx,dy,dz)||1;o.m.position.set(x0,y0,z0);o.m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(dx/L,dy/L,dz/L));o.L=L;o.w=w||.25;o.m.material.color.set(col);o.life=o.max=life;}
/* the wave: a swept surface (profile × width) rebuilt every frame from a rise / crash parameter */
const WAVE={NX:40,NV:24,W:7.5,
  swell:[[-3,0],[-2.2,.05],[-1.5,.15],[-.8,.3],[-.2,.42],[.4,.5],[1,.48],[1.5,.38],[1.9,.22],[2.1,.1],[2.2,0]],
  full:[[-3,0],[-1.9,.3],[-1,1],[-.3,2],[.25,3],[.75,3.75],[1.35,3.98],[1.95,3.62],[2.3,2.95],[2.2,2.3],[1.85,1.98]],
  crash:[[-3,0],[-2.2,.2],[-1.4,.5],[-.6,.85],[.2,1.15],[1,1.25],[1.8,1.15],[2.5,.9],[3.1,.55],[3.5,.25],[3.8,0]]};
function waveProfile(k){   // 0 = swell, 1 = full breaking wave, 2 = crashed forward
  const A=k<=1?WAVE.swell:WAVE.full,B=k<=1?WAVE.full:WAVE.crash,f=k<=1?k:k-1,e=f*f*(3-2*f);
  return new T.CatmullRomCurve3(A.map((a,i)=>new T.Vector3(lerp(a[0],B[i][0],e),lerp(a[1],B[i][1],e),0)));
}
function sgWaveMake(){
  const NX=WAVE.NX,NV=WAVE.NV,n=(NX+1)*(NV+1),g=new T.BufferGeometry(),pos=new Float32Array(n*3),col=new Float32Array(n*3),idx=[];
  for(let i=0;i<NX;i++)for(let j=0;j<NV;j++){const a=i*(NV+1)+j,b=a+NV+1;idx.push(a,b,a+1,b,b+1,a+1);}
  g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.setIndex(idx);
  const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:0,transparent:true,opacity:.96,side:T.DoubleSide,envMapIntensity:.35,emissive:0x03203d,depthWrite:true}));
  m.frustumCulled=false;return m;
}
function sgWaveSet(o,k,t,alpha){
  const NX=WAVE.NX,NV=WAVE.NV,g=o.m.geometry,pos=g.attributes.position.array,col=g.attributes.color.array,cv=waveProfile(k),pts=cv.getPoints(NV);
  for(let i=0;i<=NX;i++){const u=i/NX,x=(u-.5)*WAVE.W,bell=Math.pow(Math.cos((u-.5)*Math.PI),.9),amp=.22+.78*bell,fwd=.45*bell;
    for(let j=0;j<=NV;j++){const v=j/NV,P=pts[j],q=(i*(NV+1)+j)*3,rip=.07*Math.sin(x*2.3-t*5+v*5)+.04*Math.sin(x*5.1+t*7);
      pos[q]=x;pos[q+1]=Math.max(0,P.y*amp+rip*v);pos[q+2]=P.x*(.8+.2*amp)+fwd*v*v;
      // colour: deep blue at the base → turquoise face → pale crest → white foam on the lip (foam patches vary across the width)
      const foam=clamp((v-.8)/.12+.4*Math.sin(x*3.7+t*2)*(v>.7?1:0),0,1),face=clamp(v/.7,0,1);
      const crest=clamp((v-.55)/.25,0,1),streak=.5+.5*Math.sin(x*4.3+v*9-t*3);let r=lerp(0,.02,face),gg=lerp(.08,.36,face),b=lerp(.26,.66,face);r=lerp(r,.28,crest*.85);gg=lerp(gg,.78,crest*.85);b=lerp(b,.95,crest*.85);
      const fm=Math.min(1,foam+(v>.45&&v<.7?.18*streak*streak:0));r=lerp(r,.97,fm);gg=lerp(gg,.99,fm);b=lerp(b,1,fm);
      col[q]=r;col[q+1]=gg;col[q+2]=b;}}
  g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;g.computeVertexNormals();o.m.material.opacity=.93*alpha;
  return pts;
}
function sgCarpet(){const o=sgGet('carpets',()=>{const g=new T.PlaneGeometry(1,1);g.rotateX(-Math.PI/2);g.translate(0,0,.5);const tx=sgTex('carpet');tx.wrapT=T.RepeatWrapping;
  const m=new T.Mesh(g,new T.MeshStandardMaterial({map:tx,roughness:.9,metalness:0,polygonOffset:true,polygonOffsetFactor:-4}));const roll=new T.Mesh(new T.CylinderGeometry(.13,.13,1,16),new T.MeshStandardMaterial({color:0xb3122d,roughness:.8}));roll.rotation.z=Math.PI/2;m.add(roll);m.userData.roll=roll;return m;});return o;}
function sgVortex(){return sgGet('vort',()=>{const g=new T.Group(),tx=sgTex('flow');tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(1,6);
  for(let s=0;s<3;s++){const pts=[];for(let i=0;i<=60;i++){const t=i/60,a=t*TAU*1.6+s*TAU/3,r=lerp(1.35,.55,t);pts.push(new T.Vector3(Math.cos(a)*r,.1+t*2.3,Math.sin(a)*r));}
    const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),80,.07+s*.015,8,false),new T.MeshBasicMaterial({map:tx,color:s===1?0x9fe8ff:0x2fa6ff,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false,fog:false}));g.add(m);}
  g.userData.tx=tx;return g;});}
function sgRose(){return sgGet('rose',()=>{const g=new T.Group(),M=sgMat(),s=new T.Shape();for(let i=0;i<16;i++){const a=i/16*TAU,r=i%4===0?1.5:i%2===0?.85:.32;s[i?'lineTo':'moveTo'](Math.sin(a)*r,Math.cos(a)*r);}s.closePath();
  const st=new T.Mesh(new T.ExtrudeGeometry(s,{depth:.05,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:1}),M.gold);st.rotation.x=-Math.PI/2;g.add(st);
  const n=new T.Shape();n.moveTo(0,1.55);n.lineTo(.16,.3);n.lineTo(-.16,.3);n.closePath();const nm=new T.Mesh(new T.ExtrudeGeometry(n,{depth:.06,bevelEnabled:false}),sgMat().ruby);nm.rotation.x=-Math.PI/2;nm.position.y=.04;g.add(nm);
  const rg=new T.Mesh(new T.TorusGeometry(1.75,.045,8,64),M.gold);rg.rotation.x=Math.PI/2;g.add(rg);const rg2=new T.Mesh(new T.TorusGeometry(1.6,.02,6,64),M.goldD);rg2.rotation.x=Math.PI/2;g.add(rg2);
  for(let i=0;i<4;i++){const b=new T.Mesh(new T.SphereGeometry(.07,10,8),i?M.saph:M.ruby);b.position.set(Math.sin(i*Math.PI/2)*1.75,.02,Math.cos(i*Math.PI/2)*1.75);g.add(b);}
  return g;});}
function sgWorld(dt){
  for(const o of sgP.rings){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}const k=1-o.life/o.max,e=1-Math.pow(1-k,2);
    o.m.scale.set(lerp(o.r0,o.r1,e),lerp(o.r0,o.r1,e),o.tube*(1-k*.6));o.m.position.x+=o.vx*dt;o.m.position.y+=o.vy*dt;o.m.position.z+=o.vz*dt;o.m.material.opacity=Math.min(1,(1-k)*1.6);}
  for(const o of sgP.discs){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}const k=1-o.life/o.max;o.m.scale.setScalar(.2+o.r1*(1-Math.pow(1-k,3)));o.m.material.opacity=(1-k)*.9;}
  for(const o of sgP.shards){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}const age=o.max-o.life-o.delay;if(age<0){o.m.scale.setScalar(.001);continue;}
    const up=age<.14?Math.pow(age/.14,.5)*1.12:age<.24?1.12-(age-.14)/.1*.12:1,out=o.life<.45?o.life/.45:1;o.m.scale.set(o.w*up,o.h*up*out+.001,o.w*up);}
  for(const o of sgP.rocks){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}o.vy-=14*dt;o.m.position.x+=o.vx*dt;o.m.position.z+=o.vz*dt;o.m.position.y+=o.vy*dt;
    if(o.m.position.y<.12){o.m.position.y=.12;o.vy*=-.35;o.vx*=.6;o.vz*=.6;}o.m.rotation.x+=o.sp[0]*dt;o.m.rotation.z+=o.sp[1]*dt;if(o.life<.25)o.m.scale.multiplyScalar(.9);}
  for(const o of sgP.leaves){if(o.life<=0)continue;o.life-=dt;if(o.life<=0||!o.p){o.m.visible=false;o.life=0;continue;}const k=1-o.life/o.max;o.ph+=dt*(4.5-k*2);o.hy+=o.vy*dt;
    const r=o.r*(1+k*.6);o.m.position.set(o.p.rx+Math.cos(o.ph)*r,o.hy,o.p.rz+Math.sin(o.ph)*r);o.m.rotation.set(o.ph*2,o.ph,o.ph*.7);const s=o.life<.3?o.life/.3:1;o.m.scale.setScalar(Math.max(.01,s*1.3));}
  for(const o of sgP.beams){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}const k=1-o.life/o.max,w=o.w*(k<.15?k/.15:1)*(1-k*.5);o.m.scale.set(w,o.L,w);o.m.material.opacity=(1-k)*.85;}
  for(const kk of['waves','carpets','vort','rose'])for(const o of sgP[kk])if(o.life>0&&G.frame-(o.seen||0)>20){o.life=0;o.m.visible=false;}   // a cast that ended without sigEnd
  if(G.view!=='game')for(const L of Object.values(sgP))for(const o of L)if(o.life>0){o.life=0;o.m.visible=false;}
}
/* ---------- per-cast driver: called from castPost every frame while p.cast is alive (u = 0..1) ---------- */
function sigFrame(p,c,dt,t){
  const P=p.pg,cx=P.cx||{},k=c.k,u=Math.min(1,c.t/c.dur),x=p.rx,z=p.rz,fx=Math.sin(p.heading),fz=Math.cos(p.heading),s=P.root.scale.x||1,big=!c.whiff;
  const once=(f,at)=>{if(!c['s_'+f]&&u>=at){c['s_'+f]=true;return true;}return false;};
  if(k==='strong'){
    if(once('hit',.6)&&big){const ix=x+fx*.9,iz=z+fz*.9;sgDisc(ix,iz,0xffd76a,6,.7);sgDisc(ix,iz,0xffffff,3.5,.45);sgBeam(ix,0,iz,ix,9,iz,0xffd24a,1.1,.55);sgBeam(ix,0,iz,ix,9,iz,0xffffff,.6,.22);}
  }else if(k==='king'){
    const tr=cx.trumpet;if(tr&&tr.visible){sgBannerWave(tr,t);
      if(u>.22&&u<.9&&Math.floor(c.t*7)!==c.rk){c.rk=Math.floor(c.t*7);tr.updateMatrixWorld(true);const b=new T.Vector3(0,0,.95).applyMatrix4(tr.matrixWorld),d=new T.Vector3(0,0,1).transformDirection(tr.matrixWorld);sgRing(b.x,b.y,b.z,d.x,d.y,d.z,0xffc21a,.25,1.6,.75,1.8);}}
  }else if(k==='auk'){
    if(!c.wave&&big){c.wave=sgGet('waves',sgWaveMake);if(c.wave){c.wave.life=1;c.wx=x-fx*2.3;c.wz=z-fz*2.3;c.wh=p.heading;}}
    const o=c.wave;if(o){const rise=clamp((u-.04)/.46,0,1),crash=clamp((u-.55)/.35,0,1),kk=crash>0?1+crash:rise*rise*(3-2*rise),al=u>.85?Math.max(0,1-(u-.85)/.15):1;
      o.m.position.set(c.wx,0,c.wz);o.m.rotation.y=c.wh;o.m.scale.setScalar(s*1.05);const pts=sgWaveSet(o,kk,c.t,al);
      if(Math.random()<dt*(crash>0?120:50)*(save.set.quality==='low'?.4:1)){const j=(Math.random()*.25+.75)*WAVE.NV|0,P2=pts[Math.min(WAVE.NV,j)],xx=rnd(-3,3),cs=Math.cos(c.wh),sn=Math.sin(c.wh),lz=P2.x,ly=P2.y*(.45+.55*Math.cos(xx/WAVE.W*Math.PI));
        emit(c.wx+xx*cs+lz*sn,ly,c.wz-xx*sn+lz*cs,sn*rnd(1,4)+rnd(-1,1),rnd(.5,3),cs*rnd(1,4)+rnd(-1,1),rnd(.4,.8),rnd(.16,.32),.92,.97,1);}
      if(once('crash',.62)){for(let i=0;i<30;i++){const a=rnd(TAU),v=rnd(3,8);emit(x+fx*.8,rnd(.2,1),z+fz*.8,Math.cos(a)*v,rnd(3,7),Math.sin(a)*v,rnd(.5,1),rnd(.2,.36),.85,.95,1);}sgDisc(x,z,0x9fe0ff,5,.7);}}
  }else if(k==='defense'){if(once('hit',.5))sgShards(x+fx*.7,z+fz*.7,big?11:6,.6,2.4,1.3*s);}
  else if(k==='balanced'){if(once('r1',.35)||once('r2',.7))for(let i=0;i<5;i++)sgRock(x+rnd(-.4,.4),.2,z+rnd(-.4,.4));}
  else if(k==='macaroni'){const f=cx.flames;if(f){f.visible=u<.92;const fl=Math.min(1,u*6)*(1-seg(u,.8,.92));f.children.forEach((m,i)=>{const q=m.userData.s||1;m.scale.set(q*fl*(.9+.2*Math.sin(t*23+i)),q*fl*(1+.35*Math.sin(t*31+i*2)),q*fl);});
    if(Math.random()<dt*30){const hp=pkHeadPt(0,1.8,0).applyMatrix4(P.headAbs.matrixWorld);emit(hp.x,hp.y+.2,hp.z,-fx*rnd(1,3),rnd(1.5,3),-fz*rnd(1,3),rnd(.3,.5),rnd(.18,.3),1,rnd(.4,.7),.1);}}}
  else if(k==='royal'){const to=c.to;if(to&&big){if(!c.rugO){c.rugO=sgCarpet();if(c.rugO){c.rugO.life=1;c.cx0=G.puck.rx||x;c.cz0=G.puck.rz||z;}}
      const o=c.rugO;if(o){const dx=to.rx-c.cx0,dz=to.rz-c.cz0,L=Math.hypot(dx,dz)||1,e=clamp(u/.6,0,1),f=u>.85?(1-u)/.15:1;o.m.position.set(c.cx0,.035,c.cz0);o.m.rotation.y=Math.atan2(dx,dz);o.m.scale.set(1.05*Math.max(.01,f),1,Math.max(.01,L*(1-Math.pow(1-e,2))));
        o.m.material.map.repeat.set(1,Math.max(1,L/1.2));o.m.userData.roll.position.set(0,.13,1);o.m.userData.roll.scale.set(1,1,1/Math.max(.01,L*(1-Math.pow(1-e,2))));o.m.userData.roll.visible=e<1;}}}
  else if(k==='fiordland'){if(Math.random()<dt*26*(save.set.quality==='low'?.5:1))sgLeaf(p,Math.random()*16|0,16);}
  else if(k==='yelloweye'){const on=u>.12&&u<.92,L=on?(u<.3?(u-.12)/.18:1)*9:0,gx=p.team.dir*W,gy=1.2,gz=0,_v=SG._v||(SG._v=new T.Vector3()),_d=SG._d||(SG._d=new T.Vector3()),up=SG._u||(SG._u=new T.Vector3(0,1,0));
    [[cx.beamL,P.eyeL],[cx.beamR,P.eyeR]].forEach(([b,e])=>{if(!b)return;b.visible=on;if(!on)return;e.updateMatrixWorld(true);_v.setFromMatrixPosition(e.matrixWorld);_d.set(gx-_v.x,gy-_v.y,gz-_v.z).normalize();
      b.position.copy(_v);b.quaternion.setFromUnitVectors(up,_d);const w=1+.18*Math.sin(t*40);b.scale.set(w,Math.max(.01,L),w);b.material.opacity=.5+.2*Math.sin(t*25);});}
  else if(k==='african'){if(once('w1',.2)||once('w2',.42)||once('w3',.64)){P.headAbs.updateMatrixWorld(true);const b=pkHeadPt(0,1.4,-.1).applyMatrix4(P.headAbs.matrixWorld);sgRing(b.x,b.y,b.z,fx,.25,fz,0xffb070,.25,2.2,.8,1.5);sgRing(b.x,b.y,b.z,fx,.25,fz,0xffffff,.15,1.4,.55,1);}}
  else if(k==='humboldt'){if(!c.vort&&big){c.vort=sgVortex();if(c.vort)c.vort.life=1;}const o=c.vort;if(o){const e=Math.min(1,u*4)*(u>.85?(1-u)/.15:1);o.m.position.set(x,0,z);o.m.rotation.y=-c.t*5;o.m.scale.set(e*s,(.3+.7*e)*s,e*s);o.m.userData.tx.offset.y=-c.t*2.5;}}
  else if(k==='magellanic'){if(!c.rose&&big){c.rose=sgRose();if(c.rose){c.rose.life=1;c.rh=Math.atan2(p.team.dir*W-x,-z);}}const o=c.rose;if(o){const e=Math.min(1,u*5),f=u>.85?(1-u)/.15:1;o.m.position.set(x,.03,z);o.m.scale.setScalar(Math.max(.01,e*f*s));o.m.rotation.y=c.rh+(1-Math.min(1,u*1.6))*5;}}
  else if(k==='galapagos'){const g=cx.sun3;if(g){g.visible=u<.97;const e=Math.min(1,u*3.5)*(1-seg(u,.85,.97));g.scale.setScalar(Math.max(.01,e));if(cx.sunRays)cx.sunRays.material.rotation=t*.9;
      if(once('beam',.45)&&big){const og=p.team.opp.goalie;if(og){g.updateMatrixWorld(true);const sp=new T.Vector3().setFromMatrixPosition(g.matrixWorld);sgBeam(sp.x,sp.y,sp.z,og.rx,1,og.rz,0xffd76a,.9,.3);sgBeam(sp.x,sp.y,sp.z,og.rx,1,og.rz,0xffffff,.6,.1);}}}}
  else if(k==='fast'){if(Math.floor(c.t*10)!==c.rk&&u<.85){c.rk=Math.floor(c.t*10);sgRing(x-fx*.7,.45*s,z-fz*.7,-fx,0,-fz,0x7fd4ff,.35,.9,.45,1.4);}}
  else if(k==='basic'){if(Math.floor(c.t*9)!==c.rk&&u>.15&&u<.8){c.rk=Math.floor(c.t*9);sgRing(x-fx*.5,.8*s,z-fz*.5,-fx,0,-fz,0xffffff,.55,1.25,.4,.8);}}
  else if(k==='little'){if(cx.wings&&cx.wings.visible){const fl=Math.sin(t*26)*.45;cx.wl.rotation.set(0,1.0+fl,.4);cx.wr.rotation.set(0,-1.0-fl,-.4);}}
  for(const kk of['wave','rugO','vort','rose'])if(c[kk]){c[kk].seen=G.frame;if(c[kk].life<=0){c[kk].life=1;c[kk].m.visible=true;}}
}
function sigEnd(p,c){const cx=p.pg&&p.pg.cx;if(cx){if(cx.flames)cx.flames.visible=false;if(cx.beamL)cx.beamL.visible=cx.beamR.visible=false;if(cx.sun3)cx.sun3.visible=false;}
  for(const kk of['wave','rugO','vort','rose'])if(c&&c[kk]){c[kk].life=0;c[kk].m.visible=false;}}
// pre-compile every effect material once after start-up, so the first skill of a match does not stutter while shaders compile
function sigWarm(){
  try{
    if(!renderer||!renderer.compile)return;const M=sgMat(),geo=new T.BoxGeometry(.01,.01,.01),g=new T.Group(),add=m=>g.add(new T.Mesh(geo,m));
    [M.gold,M.goldD,M.ruby,M.saph,M.pearl,M.velvet,M.ermine,M.ice,M.stone,M.leaf].forEach(add);add(sgAdd(0xffffff,1));
    g.add(sgWaveMake());add(new T.MeshStandardMaterial({map:sgTex('carpet'),roughness:.9,metalness:0,polygonOffset:true,polygonOffsetFactor:-4}));
    add(new T.MeshStandardMaterial({map:sgTex('banner'),side:T.DoubleSide,roughness:.75,metalness:0}));
    add(new T.MeshBasicMaterial({map:sgTex('flow'),transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false}));
    add(new T.MeshBasicMaterial({map:sgTex('wing2'),transparent:true,side:T.DoubleSide,depthWrite:false}));
    g.add(new T.Sprite(new T.SpriteMaterial({map:sgTex('rays'),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false})));
    g.position.set(0,-40,0);scene.add(g);renderer.compile(scene,camera);scene.remove(g);
  }catch(e){}
}
setTimeout(sigWarm,1200);
