/* ================= v25: skill cinematics (기술 시네마틱) ================= */
// Your own special skill now gets a real cut-scene, built the way fighting-game super moves and mobile hero games do it:
//  ① cut-in: the world freezes (match clock too), letterbox bars snap in, the camera whips from the game view to a low hero shot
//  ② portrait: a diagonal band with the card art + skill name slashes across, focus lines, the camera orbits the penguin
//     while it winds up (its own v23 animation, slowed down), energy streams into a glowing rune circle under its feet
//  ③ impact: impact frame (flash + inverted frame), the shout stamped huge, shock-wave, the camera punches in then pulls out wide
//  ④ return: bars retract, the camera glides back to the game view and play resumes in slow motion for a beat.
// The skill's effect is already decided when the scene starts; nothing advances in the world while it plays (fair: no free time).
// Full scene ≈2.5 s the first time and whenever ≥25 s of play passed since the last full one, otherwise a 1.2 s quick version.
// Any button / a tap skips to the return. Settings → 기술 연출: 시네마틱 / 짧게 (always quick) / 끄기 (the old call-out banner).
// 모션 줄이기 (reduced motion) also falls back to the banner.
const CINE={full:2.5,quick:1.2,repeat:25,skipAfter:.4,
  P:{band:.32,impact:1.42,out:2.02},   // phase starts, full version
  Q:{band:.14,impact:.62,out:.92},     // quick version
  HIT:{strong:.6,defense:.5,galapagos:.45,african:.45,king:.4,yelloweye:.3,magellanic:.3}};
function cineMode(){const m=save.set.cine;return m==='short'||m==='off'?m:'full';}
function cineOk(p){return !!(p&&p.human&&G.view==='game'&&G.state==='play'&&!G.paused&&!save.set.motion&&cineMode()!=='off'&&G.cfg&&G.cfg.mode!=='demo'&&CAST[p.type]&&p.cast&&!p.cast.whiff);}
// keep the cinematic camera inside the rink (rounded rectangle) so the boards never block the shot
function cineInside(x,z,m){const ax=Math.abs(x),az=Math.abs(z);if(ax>W-m||az>D-m)return false;if(ax>W-CR&&az>D-CR)return Math.hypot(ax-(W-CR),az-(D-CR))<CR-m;return true;}
function cineNear(p){const s=(p.pg&&p.pg.root.scale.x)||1,h=1.73*s;   // penguin height ≈ 1.73 m × scale (measured in the browser)
  return{s,h,near:(innerWidth<innerHeight?3.15:2.9)*h,far:(innerWidth<innerHeight?5.4:4.4)*h};}
// the ground positions the camera passes through for a given base angle / orbit direction
function cineShots(p,a,sd){const {near,far}=cineNear(p),x=p.rx,z=p.rz,at=(o,d)=>[x+Math.sin(a+sd*o)*d,z+Math.cos(a+sd*o)*d];
  return[at(.55,near*1.05),at(.1,near),at(-.3,near*.92),at(-.3,near*.74),at(0,far*.6),at(.25,far)];}
function cineAngle(p){
  const a0=p.heading;let best=null,bm=-1e9;
  for(const o of[0,.35,-.35,.7,-.7,1.05,-1.05,1.45,-1.45,1.9,-1.9,2.4,-2.4,Math.PI])for(const sd of[1,-1]){
    const pts=cineShots(p,a0+o,sd);if(pts.every(q=>cineInside(q[0],q[1],.7)))return{a:a0+o,sd};
    // nothing fully inside (deep in a corner): keep the angle whose worst point sticks out least
    let m=1e9;for(const q of pts){let d=Math.min(W-Math.abs(q[0]),D-Math.abs(q[1]));m=Math.min(m,d);}if(m>bm){bm=m;best={a:a0+o,sd};}}
  return best;
}
function cineStart(p){
  if(!cineOk(p)||G.cine)return false;
  const C=CAST[p.type],short=cineMode()==='short';
  const quick=short||(G.cineFull!=null&&G.elapsed-G.cineFull<CINE.repeat);
  if(!quick)G.cineFull=G.elapsed;
  const P=quick?CINE.Q:CINE.P,an=cineAngle(p);
  G.cine={p,t:0,dur:quick?CINE.quick:CINE.full,P,quick,hit:false,ph:'',a:an.a,sd:an.sd,H:CINE.HIT[p.type]||.55,fov:camera.fov||48,
    from:{x:camera.position.x,y:camera.position.y,z:camera.position.z,lx:G.cam.x,ly:0,lz:G.cam.z-1},look:null};
  G.slow=null;   // the scene replaces any slow-motion that was still pending
  cineDom(p,C,quick);document.body.classList.add('cine');
  SFX.cineIn();vib(16);
  return true;
}
function cineDom(p,C,quick){
  const el=$('#cine');if(!el)return;const sp=p.ty.special,tc=p.team.key==='blue'?'#2f7bff':'#ff3b4e',g=GRADES[RAR[p.type]||0];
  el.style.setProperty('--c1',C.c[0]);el.style.setProperty('--c2',C.c[1]);el.style.setProperty('--tc',tc);el.style.setProperty('--gc',g.c);el.style.setProperty('--sl',Math.max(8,C.shout.length));
  el.innerHTML='<i class="cn-bar t"></i><i class="cn-bar b"></i><div class="cn-dim"></div><div class="cn-lines"></div>'
    +'<div class="cn-band"><div class="cn-bg"></div><div class="cn-art">'+pengSVG(p.type)+'</div>'
    +'<div class="cn-txt"><small>'+C.ico+' SPECIAL MOVE</small><b>'+(SPECIALS[sp]||'')+'</b><em><i>'+g.n+'</i>'+p.ty.name+'</em></div></div>'
    +'<div class="cn-burst"></div><div class="cn-shout"><b data-t="'+C.shout.replace(/"/g,'&quot;')+'">'+C.shout+'</b></div><div class="cn-flash"></div>'
    +'<div class="cn-skip">'+'탭하면 건너뛰기'+' ▸▸</div>';
  el.className='on p0'+(quick?' quick':'');
}
function cineSkip(){const c=G.cine;if(c&&c.t>CINE.skipAfter&&c.t<c.P.out){if(!c.hit){c.hit=true;cineImpact(c,true);}c.t=c.P.out;c.skipped=true;}}
// cast progress (0..1): a slow wind-up under the portrait band, the strike lands exactly on the impact beat, then the follow-through
function cineCastU(c){
  const P=c.P,t=c.t,H=c.H;
  if(t<P.band)return .04*t/P.band;
  if(t<P.impact){const u=(t-P.band)/(P.impact-P.band);return .04+(H-.12)*(1-Math.pow(1-u,2));}
  const k=t-P.impact;if(k<.06)return H-.08+.08*k/.06;
  return Math.min(1,H+(1-H)*(k-.06)/Math.max(.1,P.out-P.impact-.06));
}
function cineStep(rdt){
  const c=G.cine;if(!c)return;
  if(G.view!=='game'||G.state!=='play'||!c.p||!G.pengs.includes(c.p)){cineClear();return;}
  if(input.shootPress||input.pass||input.dash||input.special||input.swap){
    if((input.special||input.dash)&&c.p&&c.p.dbl>0&&c.p.dblT>0)c.queued=input.special?'special':'dash';   // 마젤란: the second-dash press is kept and fires when play resumes
    cineSkip();input.shootPress=input.pass=input.dash=input.special=input.swap=false;input.shootRel=false;}
  c.t+=rdt;const P=c.P,el=$('#cine'),p=c.p,C=CAST[p.type];
  const ph=c.t<P.band?'p0':c.t<P.impact?'p1':c.t<P.out?'p2':'p3';
  if(ph!==c.ph){c.ph=ph;if(el)el.className='on '+ph+(c.quick?' quick':'')+(c.skipped?' skipped':'');
    if(ph==='p1'){SFX.flare();SFX.cineCharge(P.impact-P.band);}
    if(ph==='p2'&&!c.hit){c.hit=true;cineImpact(c,false);}
    if(ph==='p3'){document.body.classList.remove('cine');SFX.whoosh();}}
  if(p.cast)p.cast.t=cineCastU(c)*p.cast.dur;
  cineWorld(c,rdt,C);
  if(c.t>=c.dur)cineEnd();
}
// in-world dressing while time is stopped: rune circle under the feet, a halo behind, energy streaming in, rising aura
function cineWorld(c,rdt,C){
  const p=c.p,P=c.P,t=c.t,x=p.rx,z=p.rz,o=cineObjs(),col=new T.Color(C.c[1]),s=(p.pg&&p.pg.root.scale.x)||1;
  const fadeIn=Math.min(1,t/.25),fadeOut=t>P.out?Math.max(0,1-(t-P.out)/.35):1,k=fadeIn*fadeOut,boom=c.hit?Math.max(0,1-(t-P.impact)/.35):0;
  o.rune.visible=k>0;o.rune.position.set(x,.035,z);o.rune.rotation.z=t*(c.hit?2.6:1.2);o.rune.material.color.copy(col);o.rune.material.opacity=.95*k;
  o.rune.scale.setScalar((c.quick?2.6:3.4)*s*(t<P.band?.4+.6*Math.pow(t/P.band,.5):1)*(1+boom*.9));
  o.rune2.visible=k>0;o.rune2.position.set(x,.04,z);o.rune2.rotation.z=-t*1.8;o.rune2.material.color.set(C.c[0]);o.rune2.material.opacity=.7*k*(t<P.band?0:1);o.rune2.scale.setScalar((c.quick?1.7:2.2)*s*(1+boom*1.6));
  // halo: a big soft glow behind the penguin, on the far side from the camera
  const dx=x-camera.position.x,dz=z-camera.position.z,dl=Math.hypot(dx,dz)||1;
  o.halo.visible=k>0;o.halo.position.set(x+dx/dl*.7,1.05*s,z+dz/dl*.7);o.halo.material.color.copy(col);o.halo.material.opacity=k*(.55+.25*Math.sin(t*14))+boom*.4;o.halo.scale.setScalar((2.8+boom*3)*s);
  if(save.set.quality==='low'&&Math.random()<.5)return;
  if(c.ph==='p1'){
    const n=Math.random()<rdt*70?2:0;   // energy streams in from all around …
    for(let i=0;i<n;i++){const a=rnd(TAU),r=rnd(2.6,3.6),l=rnd(.3,.45);emit(x+Math.cos(a)*r,rnd(.2,2),z+Math.sin(a)*r,-Math.cos(a)*r/l,rnd(-.5,.5),-Math.sin(a)*r/l,l,rnd(.08,.14),col.r,col.g,col.b);}
    if(Math.random()<rdt*45){const a=rnd(TAU),r=rnd(.5,.9);emit(x+Math.cos(a)*r,.1,z+Math.sin(a)*r,0,rnd(2.5,4.5),0,rnd(.5,.8),rnd(.1,.18),1,1,1);}   // … and rises around it
  }
}
function cineImpact(c,skip){
  const p=c.p,C=CAST[p.type],fx=save.set.flash!==false&&!save.set.motion,cv=$('#c');
  SFX.cineHit();vib([40,30,70]);c.shake=.32;
  if(fx&&cv&&!skip){cv.style.filter='invert(1) hue-rotate(180deg) contrast(1.6)';setTimeout(()=>{cv.style.filter='contrast(1.45) saturate(1.6) brightness(1.15)';},55);setTimeout(()=>{cv.style.filter='';},170);}
  if(p){const col=new T.Color(C.c[1]),hi=new T.Color(C.c[0]);
    for(let i=0;i<44;i++){const a=rnd(TAU),v=rnd(4,11),w=Math.random()<.4?hi:col;emit(p.rx,rnd(.2,1.4),p.rz,Math.cos(a)*v,rnd(1.5,6),Math.sin(a)*v,rnd(.5,1),rnd(.14,.3),w.r,w.g,w.b);}
    ring18(p.rx,p.rz,5,[hi.r,hi.g,hi.b]);ring18(p.rx,p.rz,2.6,[col.r,col.g,col.b]);}
}
function cineEnd(){
  const c=G.cine;if(!c)return;G.cine=null;
  const q=camera.quaternion&&camera.quaternion.clone?camera.quaternion.clone():null;
  G.cineBlend={t:0,d:.45,x:camera.position.x,y:camera.position.y,z:camera.position.z,q,fov:camera.fov,fov0:c.fov};
  cineHide();
  if(c.queued)input[c.queued]=true;
  if(!c.skipped)G.slow={t:.4,s:.4};   // the world comes back in slow motion for a beat
}
function cineHide(){const el=$('#cine');if(el){el.className='';el.innerHTML='';}document.body.classList.remove('cine');const cv=$('#c');if(cv)cv.style.filter='';
  const o=CX.cine;if(o){o.rune.visible=o.rune2.visible=o.halo.visible=false;}}
function cineClear(){const had=G.cine||G.cineBlend;if(G.cine&&G.cine.fov&&camera.fov!==G.cine.fov){camera.fov=G.cine.fov;camera.updateProjectionMatrix();}
  G.cine=null;G.cineBlend=null;if(had)cineHide();}
function cineTex(){
  if(CX.tRune)return CX.tRune;const c=document.createElement('canvas'),S=c.width=c.height=256,x=c.getContext('2d');x.translate(128,128);
  x.strokeStyle='#fff';x.fillStyle='#fff';x.shadowColor='#fff';x.shadowBlur=8;
  x.lineWidth=5;x.beginPath();x.arc(0,0,120,0,TAU);x.stroke();x.lineWidth=2.5;x.beginPath();x.arc(0,0,106,0,TAU);x.stroke();
  for(let i=0;i<48;i++){x.save();x.rotate(i*TAU/48);x.fillRect(-1.5,-118,3,i%4?7:13);x.restore();}
  x.lineWidth=3;x.beginPath();for(let i=0;i<=6;i++){const a=i*TAU/3;x[i?'lineTo':'moveTo'](Math.sin(a)*100,-Math.cos(a)*100);}x.stroke();
  x.beginPath();for(let i=0;i<=6;i++){const a=i*TAU/3+Math.PI;x[i?'lineTo':'moveTo'](Math.sin(a)*100,-Math.cos(a)*100);}x.stroke();
  x.lineWidth=2;x.beginPath();x.arc(0,0,50,0,TAU);x.stroke();
  for(let i=0;i<6;i++){x.save();x.rotate(i*TAU/6+TAU/12);x.beginPath();x.arc(0,-78,9,0,TAU);x.stroke();x.restore();}
  return CX.tRune=new T.CanvasTexture(c);
}
function cineObjs(){
  if(CX.cine)return CX.cine;
  const mk=sc=>{const m=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:cineTex(),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));m.rotation.x=-Math.PI/2;m.renderOrder=3;m.visible=false;m.scale.setScalar(sc);scene.add(m);return m;};
  const halo=new T.Sprite(new T.SpriteMaterial({map:cxTex('glow'),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));halo.visible=false;scene.add(halo);
  return CX.cine={rune:mk(3),rune2:mk(2),halo};
}
// camera: whip from the game view into a low hero shot → slow orbit + push-in → punch-in on the hit → pull out wide.
// While the penguin powers up, the arena dissolves into a coloured void (dense fog + sky in the skill's colour) and comes back on the hit.
function cineCam(){
  const c=G.cine;if(!c||!c.p)return false;
  const p=c.p,P=c.P,t=c.t,sd=c.sd,W_=innerWidth,H_=innerHeight;
  let a,dist,y,ly,fov=c.fov,off=0,void_=0;const ez3=u=>1-Math.pow(1-u,3),sm=u=>u*u*(3-2*u);
  const {h,near,far}=cineNear(p),hy=.52*h,OF=W_<H_?.11:.1;
  if(t<P.band){const u=t/P.band;a=c.a+sd*.55;dist=near*1.05;y=.36*h;ly=hy;off=OF*ez3(u);void_=ez3(u);}
  else if(t<P.impact){const u=(t-P.band)/(P.impact-P.band),e=sm(u);a=c.a+sd*lerp(.55,-.3,e);dist=lerp(near*1.05,near*.92,e);y=lerp(.36,.46,e)*h;ly=hy;fov=lerp(c.fov,c.fov-5,e);off=OF;void_=1;}
  else{const k=t-P.impact,pi=k<.09;   // .09 s punch-in, then the pull-out
    const u=pi?0:ez3(Math.min(1,(k-.09)/Math.max(.2,P.out-P.impact-.09)));
    a=c.a+sd*lerp(-.3,.25,u);dist=pi?near*.74:lerp(near*.74,far,u);y=pi?.46*h:lerp(.46*h,1.6*h,u);ly=lerp(hy,.45*h,u);fov=pi?c.fov-10:lerp(c.fov+6,c.fov,u);
    off=OF*(pi?1:Math.max(0,1-u*3));void_=pi?1:Math.max(0,1-u*2.2);}
  let px=p.rx+Math.sin(a)*dist,pz=p.rz+Math.cos(a)*dist;
  if(t<P.band){   // whip-in from wherever the game camera was
    const u=ez3(t/P.band),f=c.from;px=lerp(f.x,px,u);y=lerp(f.y,y,u);pz=lerp(f.z,pz,u);
    c.lk=[lerp(f.lx,p.rx,u),lerp(f.ly,ly,u),lerp(f.lz,p.rz,u)];
  }else c.lk=[p.rx,ly,p.rz];
  let sh=0;if(c.shake>0){sh=c.shake*shakeK();c.shake=Math.max(0,c.shake-(G.rdt||.016)*1.2);}
  camera.position.set(px+rnd(-sh,sh),y+rnd(-sh,sh)*.6,pz+rnd(-sh,sh));camera.lookAt(c.lk[0],c.lk[1],c.lk[2]);
  cineClearView(p);
  if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}
  // shift the picture up a little while the portrait band covers the bottom (keeps the penguin clear of it)
  if(off>.002)camera.setViewOffset(W_,H_,0,H_*off,W_,H_);else camera.clearViewOffset();
  c.void=void_;
  if(void_>0&&scene.fog){   // setTOD rewrites fog + sky every frame, so this needs no restore
    if(!c.fogC){c.fogC=new T.Color(0x060b1e).lerp(new T.Color(CAST[p.type].c[1]),.3);}
    scene.fog.color.lerp(c.fogC,void_);scene.fog.density=lerp(scene.fog.density,.075,void_);
    for(const k of['topC','midC','horC'])skyU[k].value.lerp(c.fogC,void_*.92);
  }
  return true;
}
// nothing may stand between the camera and the star: penguins (and the referee) in the line of sight or right at the lens are hidden
// for the frame, and the puck stays out of the close-up until the hit (step() makes them visible again every frame)
function cineClearView(p){
  const c=G.cine,cx=camera.position.x,cz=camera.position.z,vx=p.rx-cx,vz=p.rz-cz,L=Math.hypot(vx,vz)||1,ux=vx/L,uz=vz/L;
  const blocks=(x,z,r)=>{const wx=x-cx,wz=z-cz,al=wx*ux+wz*uz,pe=Math.abs(wx*uz-wz*ux);return(al>-.6&&al<L-.2&&pe<r)||Math.hypot(wx,wz)<2.6;};
  for(const q of G.pengs)if(q!==p&&q.pg&&q.pg.root.visible&&blocks(q.rx,q.rz,1.25*((q.pg.root.scale&&q.pg.root.scale.x)||1)))q.pg.root.visible=false;
  const R=G.ref;if(R&&R.pg&&R.pg.root.visible&&R.pg.root.position&&blocks(R.pg.root.position.x,R.pg.root.position.z,1.2))R.pg.root.visible=false;
  marker.visible=markerRing.visible=aimArrow.visible=passRing.visible=aimLine.visible=aimTgt.visible=false;   // your own HUD rings / aim arrow
  if(c&&(c.ph==='p0'||c.ph==='p1')){puckG.visible=false;puckRing.visible=false;puckTrail.visible=false;}
}
// after the scene the gameplay camera takes over smoothly from where the cinematic camera stopped
function cineCamBlend(){
  const b=G.cineBlend;if(!b)return;b.t+=G.rdt||.016;const k=Math.min(1,b.t/b.d),e=k*k*(3-2*k);
  camera.position.set(lerp(b.x,camera.position.x,e),lerp(b.y,camera.position.y,e),lerp(b.z,camera.position.z,e));
  if(b.q&&camera.quaternion.slerp){const g=camera.quaternion.clone();camera.quaternion.copy(b.q).slerp(g,e);}
  const f=lerp(b.fov,b.fov0,e);if(camera.fov!==f){camera.fov=f;camera.updateProjectionMatrix();}
  if(k>=1)G.cineBlend=null;
}
{const el=$('#cine');if(el)el.addEventListener('pointerdown',e=>{cineSkip();e.preventDefault();});}
