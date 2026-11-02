/* ================= v23: skill cast animations (one per species, from the name) ================= */
// 황제 펭귄은 황제의 홀을 얼음에 내려치며 "I'M KING!", 임금 펭귄은 황금 트럼펫, 젠투는 어뢰처럼, 쇠푸른(요정) 펭귄은 요정 날개…
// Purely visual: the skill itself still fires at once (no input delay). Your own casts also get a big call-out banner.
const CAST={
  strong:{shout:"I'M KING!",ico:'👑',c:['#fff1a8','#ffb21f'],dur:.8},          // 황제: emperor's sceptre slam + crown
  king:{shout:"KING'S CALL!",ico:'🎺',c:['#fff1a8','#ffc93c'],dur:.95},        // 임금: golden fanfare trumpet
  basic:{shout:'ADÉLIE DASH!',ico:'💨',c:['#ffffff','#9fd8ff'],dur:.5},        // 아델리: feisty sprinter crouch
  balanced:{shout:'ROCK HOP!',ico:'🪨',c:['#ffe2a8','#ff9a3c'],dur:.6},        // 바위뛰기: two hops off the rocks
  fast:{shout:'GENTOO TORPEDO!',ico:'🌊',c:['#d8f4ff','#3db7ff'],dur:.7},     // 젠투: fastest swimmer, belly torpedo + spray
  defense:{shout:'CHINSTRAP SLAM!',ico:'🪖',c:['#e8f6ff','#7cc4ff'],dur:.7},  // 턱끈: two-flipper hammer, the ice cracks
  macaroni:{shout:'CREST CHARGE!',ico:'🔥',c:['#fff0a0','#ff8a1a'],dur:.65},  // 마카로니: golden crest blazes
  royal:{shout:'ROYAL PASS!',ico:'💎',c:['#fff1a8','#c58bff'],dur:.8},        // 로열: royal crown + golden carpet to the mate
  fiordland:{shout:'FOREST SHADOW!',ico:'🌲',c:['#d6ffd8','#2e8b57'],dur:.85}, // 피오르드랜드: rainforest leaves swirl
  yelloweye:{shout:'GOLDEN EYE!',ico:'👁️',c:['#fff6b8','#ffd21f'],dur:.8},    // 노란눈: eyes glow gold
  little:{shout:'FAIRY HOP!',ico:'🧚',c:['#e4f6ff','#7fd6ff'],dur:.6},        // 쇠푸른(요정): fairy wings + sparkles
  african:{shout:'HEE-HAW!',ico:'📣',c:['#fff2d6','#ff9c5a'],dur:.85},        // 아프리카(당나귀 펭귄): head back, bray
  humboldt:{shout:'HUMBOLDT CURRENT!',ico:'🌀',c:['#d8f4ff','#2fa6ff'],dur:.85}, // 훔볼트: swim strokes, ocean swirl
  magellanic:{shout:"MAGELLAN'S ROUTE!",ico:'🧭',c:['#fff1c4','#e0a83c'],dur:.65}, // 마젤란: navigator's compass rose
  galapagos:{shout:'SUN FLARE!',ico:'☀️',c:['#fff6c4','#ffb21f'],dur:.85},    // 갈라파고스: equator sun overhead
  auk:{shout:'GREAT SEA SURGE!',ico:'🌊',c:['#d8f4ff','#2b7bff'],dur:.85}      // 큰바다쇠오리: a great wave behind
};
function castShout(p,def){const c=p&&CAST[p.type];return c?c.shout:def;}
const CX={};   // shared meshes / textures (built on first use)
function cxMat(){if(!CX.gold){CX.gold=new T.MeshStandardMaterial({color:0xffc93c,metalness:.85,roughness:.28,emissive:0x3a2600});
  CX.ruby=new T.MeshStandardMaterial({color:0xe0213c,metalness:.3,roughness:.2,emissive:0x400008});CX.saph=new T.MeshStandardMaterial({color:0x8a4bff,metalness:.3,roughness:.2,emissive:0x1c0840});}return CX;}
function cxTex(kind){
  if(CX['t'+kind])return CX['t'+kind];
  const c=document.createElement('canvas'),S=c.width=c.height=128,x=c.getContext('2d');x.translate(64,64);
  if(kind==='note'){x.shadowColor='rgba(60,30,0,.9)';x.shadowBlur=6;x.fillStyle='#ffd34d';x.strokeStyle='#ffd34d';x.lineWidth=9;x.beginPath();x.ellipse(-14,26,20,14,-.4,0,TAU);x.fill();x.beginPath();x.moveTo(4,22);x.lineTo(4,-44);x.stroke();x.beginPath();x.moveTo(4,-44);x.quadraticCurveTo(34,-34,30,-6);x.stroke();}
  else if(kind==='star'){x.shadowColor='rgba(120,80,0,.85)';x.shadowBlur=5;x.fillStyle='#fff';for(let i=0;i<4;i++){x.rotate(Math.PI/2);x.beginPath();x.moveTo(0,0);x.lineTo(10,-10);x.lineTo(0,-58);x.lineTo(-10,-10);x.closePath();x.fill();}const g=x.createRadialGradient(0,0,0,0,0,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(-64,-64,128,128);}
  else if(kind==='leaf'){x.rotate(.5);x.fillStyle='#1f5e3a';x.beginPath();x.ellipse(0,0,22,50,0,0,TAU);x.fill();x.strokeStyle='#7fd39a';x.lineWidth=4;x.beginPath();x.moveTo(0,-46);x.lineTo(0,46);x.stroke();}
  else if(kind==='sun'){const g=x.createRadialGradient(0,0,0,0,0,64);g.addColorStop(0,'rgba(255,255,230,1)');g.addColorStop(.32,'rgba(255,214,80,1)');g.addColorStop(.5,'rgba(255,170,40,.55)');g.addColorStop(1,'rgba(255,150,30,0)');x.fillStyle=g;x.fillRect(-64,-64,128,128);
    x.strokeStyle='rgba(255,230,140,.9)';x.lineWidth=5;for(let i=0;i<12;i++){x.rotate(TAU/12);x.beginPath();x.moveTo(0,-30);x.lineTo(0,-60);x.stroke();}}
  else if(kind==='wing'){x.translate(-64,-64);const gr=x.createLinearGradient(0,0,128,0);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(150,215,255,.65)');x.fillStyle=gr;
    x.beginPath();x.moveTo(4,70);x.bezierCurveTo(30,8,104,0,124,26);x.bezierCurveTo(128,60,90,96,4,78);x.closePath();x.fill();x.strokeStyle='rgba(90,170,235,.95)';x.lineWidth=3;x.stroke();
    x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=2;for(const [a,b] of[[60,22],[96,30],[110,52]]){x.beginPath();x.moveTo(6,72);x.quadraticCurveTo(a*.5,b+20,a,b);x.stroke();}}
  else if(kind==='glow'){const g=x.createRadialGradient(0,0,0,0,0,64);g.addColorStop(0,'rgba(255,250,200,1)');g.addColorStop(.3,'rgba(255,210,40,.9)');g.addColorStop(1,'rgba(255,200,0,0)');x.fillStyle=g;x.fillRect(-64,-64,128,128);}
  else if(kind==='crack'){x.strokeStyle='rgba(235,250,255,.95)';x.lineCap='round';
    for(let i=0;i<11;i++){let a=i/11*TAU+Math.sin(i*7)*.2,r=6,px=0,py=0;x.lineWidth=5;x.beginPath();x.moveTo(0,0);
      while(r<60){const nx=Math.cos(a)*r,ny=Math.sin(a)*r;x.lineTo(nx,ny);if(r>24&&Math.sin(i*13+r)>.6){x.moveTo(nx,ny);x.lineTo(nx+Math.cos(a+1.1)*10,ny+Math.sin(a+1.1)*10);x.moveTo(nx,ny);}px=nx;py=ny;a+=Math.sin(i*3.1+r)*.35;r+=9;x.lineWidth=Math.max(1.5,x.lineWidth-.5);}x.stroke();}
    x.strokeStyle='rgba(150,210,255,.6)';x.lineWidth=3;x.beginPath();x.arc(0,0,22,0,TAU);x.stroke();}
  else if(kind==='compass'){x.strokeStyle='rgba(255,214,110,.95)';x.fillStyle='rgba(255,201,60,.9)';x.lineWidth=3;x.beginPath();x.arc(0,0,56,0,TAU);x.stroke();x.beginPath();x.arc(0,0,46,0,TAU);x.stroke();
    for(let i=0;i<8;i++){const L=i%2?30:52;x.save();x.rotate(i*TAU/8);x.beginPath();x.moveTo(0,-L);x.lineTo(7,-7);x.lineTo(0,0);x.lineTo(-7,-7);x.closePath();x.fillStyle=i===0?'rgba(255,90,90,.95)':i%2?'rgba(255,230,160,.85)':'rgba(255,201,60,.95)';x.fill();x.restore();}}
  const t=new T.CanvasTexture(c);CX['t'+kind]=t;return t;
}
/* --- sprites (notes, sparkles, leaves) and ice decals (cracks, compass rose) --- */
const cxS=[],cxD=[];
function cxSprite(kind,x,y,z,vx,vy,vz,life,size,col){
  if(save.set.quality==='low'&&Math.random()<.5)return;
  let o=cxS.find(q=>q.life<=0);
  if(!o){if(cxS.length>=64)return;const m=new T.Sprite(new T.SpriteMaterial({transparent:true,depthWrite:false,fog:false}));scene.add(m);o={m,life:0};cxS.push(o);}
  o.m.material.map=cxTex(kind);o.m.material.blending=T.NormalBlending;o.m.material.color.set(col||0xffffff);o.m.material.needsUpdate=true;
  o.m.position.set(x,y,z);o.vx=vx;o.vy=vy;o.vz=vz;o.life=o.max=life;o.size=size;o.spin=rnd(-3,3);o.grav=kind==='leaf'?-1.2:kind==='note'?-.3:0;o.m.visible=true;
}
function cxDecal(kind,x,z,size,life,rot,spin){
  let o=cxD.find(q=>q.life<=0&&q.kind===kind);
  if(!o){if(cxD.length>=10)return null;const m=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:cxTex(kind),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));m.rotation.x=-Math.PI/2;m.renderOrder=2;scene.add(m);o={m,kind,life:0};cxD.push(o);}
  o.m.position.set(x,.025,z);o.m.rotation.z=rot||0;o.size=size;o.life=o.max=life;o.spin=spin||0;o.m.visible=true;o.m.scale.setScalar(.01);return o;
}
function castFrame(dt){
  for(const o of cxS){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}
    o.vy+=o.grav*dt;o.m.position.x+=o.vx*dt;o.m.position.y+=o.vy*dt;o.m.position.z+=o.vz*dt;const k=o.life/o.max;
    o.m.material.opacity=Math.min(1,k*2.2);o.m.material.rotation+=o.spin*dt;o.m.scale.setScalar(o.size*(.6+.4*Math.min(1,(1-k)*5)));}
  for(const o of cxD){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}
    const k=o.life/o.max,g=Math.min(1,(1-k)*6);o.m.scale.setScalar(o.size*(.3+.7*g));o.m.material.opacity=Math.min(1,k*2.5);o.m.rotation.z+=o.spin*dt;}
  if(G.view!=='game'){for(const o of cxS)if(o.life>0){o.life=0;o.m.visible=false;}for(const o of cxD)if(o.life>0){o.life=0;o.m.visible=false;}}
}
/* --- props attached to a penguin (built once per penguin, on its first cast) --- */
function castProps(p){
  const P=p.pg;if(P.cx)return P.cx;const M=cxMat(),cx={};
  const k=p.type;
  if(k==='strong'){   // sceptre (held upright, butt end strikes the ice) + crown
    const g=new T.Group(),rod=new T.Mesh(new T.CylinderGeometry(.045,.058,1.75,12),M.gold);rod.position.y=.875;g.add(rod);
    const orb=new T.Mesh(new T.SphereGeometry(.17,18,14),M.gold);orb.position.y=1.9;g.add(orb);
    const gem=new T.Mesh(new T.SphereGeometry(.075,12,10),M.ruby);gem.position.set(0,1.9,.14);g.add(gem);const gem2=gem.clone();gem2.position.set(0,1.9,-.14);g.add(gem2);
    const cr=new T.Mesh(new T.CylinderGeometry(.02,.02,.26,6),M.gold);cr.position.y=2.17;g.add(cr);const cr2=cr.clone();cr2.rotation.z=Math.PI/2;cr2.scale.y=.6;cr2.position.y=2.18;g.add(cr2);
    for(const y of[.12,1.25,1.62]){const b=new T.Mesh(new T.TorusGeometry(.072,.026,8,16),M.gold);b.rotation.x=Math.PI/2;b.position.y=y;g.add(b);}
    g.visible=false;P.inner.add(g);cx.sceptre=g;
  }
  if(k==='strong'||k==='royal'){
    const g=new T.Group(),band=new T.Mesh(new T.CylinderGeometry(.2,.22,.12,22,1,true),M.gold);band.material.side=T.DoubleSide;g.add(band);
    for(let i=0;i<5;i++){const a=i/5*TAU,sp=new T.Mesh(new T.ConeGeometry(.045,.16,8),M.gold);sp.position.set(Math.sin(a)*.2,.13,Math.cos(a)*.2);g.add(sp);
      const gm=new T.Mesh(new T.SphereGeometry(.03,8,6),k==='royal'?M.saph:M.ruby);gm.position.set(Math.sin(a)*.215,0,Math.cos(a)*.215);g.add(gm);}
    g.position.y=1.9;g.visible=false;P.headAbs.add(g);cx.crown=g;
  }
  if(k==='king'){   // fanfare trumpet at the beak
    const g=new T.Group(),tube=new T.Mesh(new T.CylinderGeometry(.028,.028,.5,10),M.gold);tube.rotation.x=Math.PI/2;tube.position.z=.25;g.add(tube);
    const bell=new T.Mesh(new T.CylinderGeometry(.15,.035,.22,18,1,true),M.gold);bell.material=M.gold.clone();bell.material.side=T.DoubleSide;bell.rotation.x=Math.PI/2;bell.position.z=.6;g.add(bell);
    for(const z of[.16,.24,.32]){const v=new T.Mesh(new T.CylinderGeometry(.018,.018,.09,8),M.gold);v.position.set(0,.06,z);g.add(v);}
    const flag=new T.Mesh(new T.PlaneGeometry(.26,.18),new T.MeshStandardMaterial({color:0xd22a3c,side:T.DoubleSide,roughness:.7}));flag.position.set(0,-.12,.32);g.add(flag);
    g.position.copy(pkHeadPt(0,1.36,-.02));g.rotation.x=-.35;g.visible=false;P.headAbs.add(g);cx.trumpet=g;
  }
  if(k==='little'){  // fairy wings on the back
    const mat=new T.MeshBasicMaterial({map:cxTex('wing'),transparent:true,side:T.DoubleSide,depthWrite:false});
    const geo=new T.PlaneGeometry(.95,.62);geo.translate(.47,.12,0);
    const g=new T.Group(),wl=new T.Mesh(geo,mat),wr=new T.Mesh(geo,mat);wr.scale.x=-1;
    const pl=new T.Group(),pr=new T.Group();pl.add(wr);pr.add(wl);pl.position.x=-.08;pr.position.x=.08;g.add(pl,pr);g.position.set(0,1.0,-.38);g.visible=false;P.inner.add(g);cx.wings=g;cx.wl=pl;cx.wr=pr;
  }
  if(k==='yelloweye'){
    const mk=()=>{const s=new T.Sprite(new T.SpriteMaterial({map:cxTex('glow'),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));s.scale.setScalar(.26);s.visible=false;return s;};
    cx.eyeL=mk();cx.eyeR=mk();P.eyeL.add(cx.eyeL);P.eyeR.add(cx.eyeR);
  }
  if(k==='galapagos'){const s=new T.Sprite(new T.SpriteMaterial({map:cxTex('sun'),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));s.position.y=2.7;s.visible=false;P.root.add(s);cx.sun=s;}
  P.cx=cx;return cx;
}
/* --- start a cast (called after the skill really fired) --- */
function castStart(p){
  const C=CAST[p.type];if(!C||!p.pg||G.view!=='game')return;
  const whiff=(p.specMax||0)<=2.6;   // a whiffed flipper smash / royal pass with no puck: small version, no banner
  p.cast={k:p.type,t:0,dur:C.dur*(whiff?.6:1),hit:false,whiff,hx:p.x,hz:p.z,h:p.heading,to:G.royal&&G.royal.by===p?G.royal.to:null};
  castProps(p);
  if(p.human&&!whiff){castBanner(p,C);if(!save.set.motion&&G.cfg&&G.cfg.mode!=='demo')G.slow={t:.18,s:.5};}
}
function castBanner(p,C){
  const el=$('#castBan');if(!el)return;const sp=p.ty.special;
  el.style.setProperty('--c1',C.c[0]);el.style.setProperty('--c2',C.c[1]);
  el.innerHTML='<b>'+C.shout+'</b><small>'+C.ico+' '+p.ty.name+' · '+(SPECIALS[sp]||'')+'</small>';
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(castBanner.t);castBanner.t=setTimeout(()=>el.classList.remove('on'),1250);
}
const ez=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
const seg=(u,a,b)=>clamp((u-a)/(b-a),0,1);
// flippers + body (runs right after animatePenguin set the normal flipper pose)
function castFlip(p,dt){
  const c=p.cast;if(!c)return;const P=p.pg,u=c.t/c.dur,L=P.flipL.rotation,Rr=P.flipR.rotation,k=c.k;
  if(k==='strong'){   // both flippers lift the sceptre high … and drive it down into the ice
    const up=ez(seg(u,0,.45)),dn=ez(seg(u,.5,.6)),back=seg(u,.85,1),ax=lerp(lerp(-.9,-2.25,up),-1.05,dn),w=Math.min(1,u*6)*(1-back);
    L.set(lerp(L.x,ax,w),0,lerp(L.z,.32,w));Rr.set(lerp(Rr.x,ax,w),0,lerp(Rr.z,-.32,w));P.piv.rotation.x+=lerp(-.2*up,.28,dn)*(1-back);
  }else if(k==='king'){const w=ez(seg(u,0,.25))*(1-seg(u,.85,1));Rr.set(lerp(Rr.x,-1.55,w),0,lerp(Rr.z,-.45,w));L.set(lerp(L.x,-1.2,w),0,lerp(L.z,.35,w));}
  else if(k==='basic'){const w=1-seg(u,.6,1);L.set(lerp(L.x,1.3,w),0,lerp(L.z,-.5,w));Rr.set(lerp(Rr.x,1.3,w),0,lerp(Rr.z,.5,w));P.piv.rotation.x+=.35*w;}
  else if(k==='balanced'){const w=1-seg(u,.75,1);L.set(L.x,0,lerp(L.z,-1.25,w));Rr.set(Rr.x,0,lerp(Rr.z,1.25,w));}
  else if(k==='fast'){const w=1-seg(u,.8,1);L.set(lerp(L.x,1.45,w),0,lerp(L.z,-.08,w));Rr.set(lerp(Rr.x,1.45,w),0,lerp(Rr.z,.08,w));}
  else if(k==='defense'){   // both flippers overhead, then down together
    if(u<.42){const w=ez(seg(u,0,.38));L.set(lerp(L.x,-.5,w),0,lerp(L.z,-2.7,w));Rr.set(lerp(Rr.x,-.5,w),0,lerp(Rr.z,2.7,w));P.piv.rotation.x-=.2*w;}
    else{const w=ez(seg(u,.42,.55)),b=seg(u,.8,1);L.set(lerp(-.5,-1.25,w)*(1-b)+L.x*b,0,lerp(-2.7,-.25,w)*(1-b)+L.z*b);Rr.set(lerp(-.5,-1.25,w)*(1-b)+Rr.x*b,0,lerp(2.7,.25,w)*(1-b)+Rr.z*b);P.piv.rotation.x+=.35*w*(1-b);}
  }else if(k==='macaroni'){const w=1-seg(u,.8,1);L.set(lerp(L.x,1.2,w),0,L.z);Rr.set(lerp(Rr.x,1.2,w),0,Rr.z);P.piv.rotation.x+=.3*w;}
  else if(k==='royal'){const w=ez(seg(u,0,.25))*(1-seg(u,.8,1));Rr.set(lerp(Rr.x,-1.45,w),0,lerp(Rr.z,.15,w));}
  else if(k==='fiordland'){const w=1-seg(u,.8,1),s=Math.sin(c.t*12);L.set(lerp(L.x,-.6+s*.3,w),0,lerp(L.z,-1.0,w));Rr.set(lerp(Rr.x,-.6-s*.3,w),0,lerp(Rr.z,1.0,w));}
  else if(k==='yelloweye'){const w=ez(seg(u,0,.3))*(1-seg(u,.8,1));Rr.set(lerp(Rr.x,-1.6,w),0,lerp(Rr.z,-.55,w));}
  else if(k==='little'){const s=Math.sin(c.t*30)*.4;L.set(L.x,0,-1.1+s);Rr.set(Rr.x,0,1.1-s);}
  else if(k==='african'){const w=ez(seg(u,0,.2))*(1-seg(u,.85,1));L.set(lerp(L.x,.6,w),0,lerp(L.z,-1.35,w));Rr.set(lerp(Rr.x,.6,w),0,lerp(Rr.z,1.35,w));P.piv.rotation.x-=.25*w;}
  else if(k==='humboldt'){const w=1-seg(u,.85,1),a=c.t*11;L.set(lerp(L.x,Math.sin(a)*1.6,w),0,lerp(L.z,-.6-Math.cos(a)*.4,w));Rr.set(lerp(Rr.x,Math.sin(a+Math.PI)*1.6,w),0,lerp(Rr.z,.6+Math.cos(a)*.4,w));}
  else if(k==='magellanic'){const w=ez(seg(u,0,.25))*(1-seg(u,.8,1));Rr.set(lerp(Rr.x,-1.5,w),0,lerp(Rr.z,.1,w));}
  else if(k==='galapagos'){const w=ez(seg(u,0,.3))*(1-seg(u,.85,1));L.set(lerp(L.x,-.25,w),0,lerp(L.z,-2.55,w));Rr.set(lerp(Rr.x,-.25,w),0,lerp(Rr.z,2.55,w));P.piv.rotation.x-=.15*w;}
  else if(k==='auk'){const w=1-seg(u,.8,1);L.set(lerp(L.x,1.25,w),0,lerp(L.z,-.4,w));Rr.set(lerp(Rr.x,1.25,w),0,lerp(Rr.z,.4,w));P.piv.rotation.x+=.4*w;}
}
// head, beak, hops, props and effects (runs at the end of animatePenguin)
function castPost(p,dt,t){
  const P=p.pg,cx=P.cx;
  // lasting looks while the skill itself is active
  if(cx){
    if(cx.eyeL){const on=p.eyeT>0||!!(p.cast&&p.cast.k==='yelloweye');cx.eyeL.visible=cx.eyeR.visible=on;if(on){const s=.24+.05*Math.sin(t*9);cx.eyeL.scale.setScalar(s);cx.eyeR.scale.setScalar(s);}}
    if(cx.wings){const on=p.hopT>0||!!(p.cast&&p.cast.k==='little');cx.wings.visible=on;if(on){const f=Math.sin(t*38)*.35;cx.wl.rotation.set(0,1.05+f,.35);cx.wr.rotation.set(0,-1.05-f,-.35);}}
  }
  if(p.shadowT>0&&p.type==='fiordland'&&Math.random()<dt*9)cxSprite('leaf',p.rx+rnd(-.8,.8),rnd(.3,1.6),p.rz+rnd(-.8,.8),rnd(-1,1),rnd(.2,1),rnd(-1,1),rnd(.6,1),rnd(.25,.4));
  const c=p.cast;if(!c)return;
  c.t+=dt;const u=Math.min(1,c.t/c.dur),k=c.k,x=p.rx,z=p.rz,fx=Math.sin(p.heading),fz=Math.cos(p.heading),near=p.human||p.team===G.mine;
  const once=(f,at)=>{if(!c[f]&&u>=at){c[f]=true;return true;}return false;};
  if(k==='strong'){
    const s=cx.sceptre;s.visible=true;if(P.stick)P.stick.visible=false;
    const up=ez(seg(u,0,.45)),dn=seg(u,.5,.6);s.position.set(0,lerp(lerp(.25,.95,up),-.02,dn*dn),.66);s.rotation.set(0,0,0);s.scale.setScalar(Math.min(1,u*8)*(1-seg(u,.9,1))+.001);
    if(once('hit',.6)&&!c.whiff){const ix=x+fx*.9,iz=z+fz*.9;ring18(ix,iz,4,[1,.84,.3]);for(let i=0;i<26;i++){const a=rnd(TAU),v=rnd(2,6);emit(ix,.2,iz,Math.cos(a)*v,rnd(2,6),Math.sin(a)*v,rnd(.5,.9),rnd(.15,.3),1,rnd(.75,.95),rnd(.2,.5));}
      cxDecal('crack',ix,iz,3.2,1.4,rnd(TAU));for(let i=0;i<6;i++)cxSprite('star',ix+rnd(-1,1),rnd(.6,2),iz+rnd(-1,1),rnd(-1,1),rnd(1,2.5),rnd(-1,1),.7,.5,0xffe27a);
      if(near||Math.hypot(x-G.cam.x,z-G.cam.z)<14)G.cam.shake=Math.max(G.cam.shake,.4);SFX.bump(1);}
    const cr=cx.crown;cr.visible=c.hit&&!c.whiff;if(cr.visible){const a=c.t-c.dur*.6,pop=a<.18?a/.18*1.25:a<.3?1.25-(a-.18)/.12*.25:1;cr.scale.setScalar(Math.max(.01,pop*(1-seg(u,.92,1))));cr.rotation.y=t*2;cr.position.y=1.9+Math.sin(t*6)*.03;}
  }else if(k==='king'){
    const tr=cx.trumpet;tr.visible=u<.92;if(P.stick)P.stick.visible=false;if(P.head)P.head.rotation.x-=.3*Math.sin(Math.PI*u);
    tr.scale.setScalar(1+.08*Math.sin(t*30)*(u>.2?1:0));
    if(u>.2&&Math.random()<dt*14){const bx=x+fx*1.1,bz=z+fz*1.1;cxSprite('note',bx,rnd(1.6,2.1),bz,fx*rnd(.6,1.4)+rnd(-.6,.6),rnd(.8,1.6),fz*rnd(.6,1.4)+rnd(-.6,.6),rnd(.8,1.2),rnd(.35,.5),0xffd34d);}
  }else if(k==='basic'){
    if(u>.25&&Math.random()<dt*40)emit(x-fx*.7+rnd(-.3,.3),rnd(.3,1.1),z-fz*.7+rnd(-.3,.3),-fx*rnd(4,8),rnd(0,.5),-fz*rnd(4,8),rnd(.2,.35),rnd(.1,.18),.95,.98,1);
  }else if(k==='balanced'){
    const hp=u<.7?Math.abs(Math.sin(u/.7*Math.PI*2))*.55:0;P.root.position.y+=hp;
    if(once('h1',.35)||once('h2',.7))for(let i=0;i<8;i++){const a=rnd(TAU),v=rnd(1.5,3.5);emit(x,.1,z,Math.cos(a)*v,rnd(1.5,3.5),Math.sin(a)*v,rnd(.4,.7),rnd(.1,.2),.55,.5,.46);}
  }else if(k==='fast'){
    if(Math.random()<dt*50){const a=rnd(TAU);emit(x+rnd(-.4,.4),.15,z+rnd(-.4,.4),-fx*rnd(1,3)+Math.cos(a)*1.5,rnd(1.5,4),-fz*rnd(1,3)+Math.sin(a)*1.5,rnd(.35,.6),rnd(.1,.22),.75,.9,1);}
  }else if(k==='defense'){
    if(once('hit',.5)){cxDecal('crack',x+fx*.7,z+fz*.7,5.5,1.7,rnd(TAU));if(near||Math.hypot(x-G.cam.x,z-G.cam.z)<14)G.cam.shake=Math.max(G.cam.shake,.45);
      for(let i=0;i<20;i++){const a=rnd(TAU),v=rnd(2,5);emit(x,.2,z,Math.cos(a)*v,rnd(3,6),Math.sin(a)*v,rnd(.5,.9),rnd(.12,.26),.85,.95,1);}}
    if(P.head)P.head.rotation.x+=u<.5?-.2:.15;
  }else if(k==='macaroni'){
    if(P.head)P.head.rotation.x+=.45*(1-seg(u,.8,1));
    if(Math.random()<dt*45){const hy=1.7*(P.root.scale.y||1);emit(x+fx*.15,hy,z+fz*.15,-fx*rnd(2,4)+rnd(-.5,.5),rnd(.5,1.8),-fz*rnd(2,4)+rnd(-.5,.5),rnd(.3,.5),rnd(.12,.22),1,rnd(.55,.85),.15);}
  }else if(k==='royal'){
    const cr=cx.crown;cr.visible=u<.97;cr.scale.setScalar(Math.max(.01,Math.min(1,u*5)*(1-seg(u,.85,1))));cr.rotation.y=t*2;
    const to=c.to;if(to&&once('carpet',.05)){const pk=G.puck,n=14;for(let i=0;i<=n;i++){const w=i/n;cxSprite('star',lerp(pk.x,to.x,w),.25,lerp(pk.z,to.z,w),0,rnd(.2,.6),0,.9+w*.3,.45,0xffd34d);}}
  }else if(k==='fiordland'){
    if(Math.random()<dt*30){const a=c.t*8+rnd(TAU),r=rnd(.8,1.3);cxSprite('leaf',x+Math.cos(a)*r,rnd(.3,1.7),z+Math.sin(a)*r,-Math.sin(a)*2,rnd(.3,1),Math.cos(a)*2,rnd(.6,.9),rnd(.3,.45));}
  }else if(k==='yelloweye'){
    if(P.head)P.head.rotation.y=clamp(angDiff(Math.atan2(p.team.dir*W-x,-z),p.heading),-.7,.7);
    if(once('hit',.15))for(let i=0;i<8;i++)cxSprite('star',x+fx*.4+rnd(-.3,.3),rnd(1.3,1.7),z+fz*.4+rnd(-.3,.3),rnd(-1.2,1.2),rnd(.4,1.4),rnd(-1.2,1.2),.6,.35,0xffe14d);
  }else if(k==='little'){
    if(Math.random()<dt*30)cxSprite('star',x+rnd(-.5,.5),rnd(.5,1.8)+(p.hopT>0?.6:0),z+rnd(-.5,.5),rnd(-.6,.6),rnd(.2,1),rnd(-.6,.6),rnd(.5,.8),rnd(.25,.4),0x9fe4ff);
  }else if(k==='african'){
    if(P.head)P.head.rotation.x-=.5*Math.sin(Math.PI*Math.min(1,u*1.2));if(P.jaw)P.jaw.rotation.x=Math.max(P.jaw.rotation.x,.55*Math.sin(Math.PI*u));
    if(once('w1',.2)||once('w2',.45)||once('w3',.7))ring18(x,z,2.5,[1,.85,.65]);
  }else if(k==='humboldt'){
    if(Math.random()<dt*40){const a=c.t*7+rnd(TAU),r=rnd(1,1.6);emit(x+Math.cos(a)*r,rnd(.2,1.2),z+Math.sin(a)*r,-Math.sin(a)*3,rnd(.5,2),Math.cos(a)*3,rnd(.4,.7),rnd(.12,.22),.3,.7,1);}
  }else if(k==='magellanic'){
    if(once('hit',.02)){const d=cxDecal('compass',x,z,3.6,1.3,-p.heading,0);}
    if(Math.random()<dt*25)emit(x-fx*.6,rnd(.2,.8),z-fz*.6,-fx*3,rnd(0,.6),-fz*3,rnd(.3,.5),rnd(.1,.18),1,.85,.45);
  }else if(k==='galapagos'){
    const s=cx.sun;s.visible=u<.98;const g=Math.min(1,u*3.5)*(1-seg(u,.82,1));s.scale.setScalar(Math.max(.01,1.8*g));s.material.rotation=t*.8;
    if(once('hit',.45)){const og=p.team.opp.goalie;if(og){const n=14;for(let i=0;i<n;i++){const w=i/n;emit(lerp(x,og.x,w),lerp(2.6,1.6,w),lerp(z,og.z,w),rnd(-.4,.4),rnd(-.2,.4),rnd(-.4,.4),.35+w*.25,.28,1,.9,.45);}}}
  }else if(k==='auk'){
    if(u<.85)for(let j=0;j<3;j++)if(Math.random()<dt*60){const a=rnd(-1.4,1.4),side=-fz*Math.sin(a),sz=fx*Math.sin(a),h=Math.cos(a),wh=Math.random()<.35;emit(x-fx*1.2+side*1.4,.2+h*.6,z-fz*1.2+sz*1.4,fx*rnd(3,5.5)+side,rnd(4,7.5)*h,fz*rnd(3,5.5)+sz,rnd(.55,.9),rnd(.18,.34),wh?.92:.25,wh?.97:.55,1);}
  }
  if(c.t>=c.dur){p.cast=null;if(cx){if(cx.sceptre)cx.sceptre.visible=false;if(cx.crown)cx.crown.visible=false;if(cx.trumpet)cx.trumpet.visible=false;if(cx.sun)cx.sun.visible=false;}}
}
function v23Frame(dt){castFrame(dt);}
