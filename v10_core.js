
/* ================= v10: penguin personalities, arenas, aim preview, comfort settings ================= */
// --- per-type personality: a clear strength AND a weakness (applies to every skater of that type, AI included) ---
const TT={
  basic:{name:'올라운더',plus:'특수 기술 쿨다운 -12%',minus:'뚜렷한 강점은 없어요',cd:.88},
  fast:{name:'퀵 릴리스',plus:'슛 충전 속도 +15%',minus:'강슛 최대 위력 -6%',chg:1.15,pow:.94},
  strong:{name:'헤비 샷',plus:'강슛 위력 +6%',minus:'넘어지면 회복이 25% 느려요',pow:1.06,fall:1.25},
  defense:{name:'롱 스틱',plus:'상대 패스·슛 가로채기 범위 +0.25m',minus:'슛 정확도 -25%',reach:.25,spread:1.25},
  balanced:{name:'플레이메이커',plus:'패스 속도 +10% · 원타이머 위력 +5%',minus:'대시 재사용 +0.4초',pass:1.1,ot:1.05,dashCd:.4},
  auk:{name:'바다의 지배자',plus:'모든 능력이 최상급',minus:'특수 기술 쿨다운 +10%',cd:1.1}
};
const ttOf=p=>(p&&!p.goalie&&TT[p.type])||{};
const ttLine=k=>{const t=TT[k];return t?'<b>'+t.name+'</b> · 강점: '+t.plus+' · 약점: '+t.minus:'';};
// one-timer: shooting within this window after receiving a pass (pre-charge while the pass is coming!)
const OT_WIN=.75;

// --- comfort settings ---
function shakeK(){if(save.set.motion)return 0;const v={on:1,low:.4,off:0}[save.set.shake];return v===undefined?1:v;}
function applyFxSettings(){
  document.body.classList.toggle('noflash',!save.set.flash||save.set.motion);
  document.body.classList.toggle('rm',!!save.set.motion);
  SFX.setVol({low:.35,mid:.7,high:1}[save.set.vol]||.7);
}

// --- arenas (decorative; no stat effects) ---
const ARENAS={
  classic:{name:'기본 링크'},
  aurora:{name:'오로라 나이트',tod:.95,wx:'clear',lamp:[.45,.95,1],aur:1.7},
  blizzard:{name:'눈보라 아레나',tod:.16,wx:'blizzard',lamp:[.9,.95,1]},
  sunset:{name:'선셋 컵',tod:.5,wx:'clear',lamp:[1,.7,.42]},
  final:{name:'결승 무대',tod:.8,wx:'light',lamp:[1,.84,.42],aur:.9,fireworks:true,cheer:.35}
};
G.arena='classic';let arenaLampKey='',arenaWx='',fwT=0,champT=0;
function arenaPick(cfg){
  if(!cfg||cfg.demo)return 'classic';
  if(cfg.final)return 'final';
  const a=save.set.arena;if(a==='final'&&!save.cleared.tour)return 'classic';
  return ARENAS[a]&&a!=='auto'?a:'classic';
}
function arenaLamps(){
  const A=ARENAS[G.arena]||ARENAS.classic,key=G.arena;if(key===arenaLampKey)return;arenaLampKey=key;
  const c=A.lamp||[1,.94,.8];
  for(const l of lamps){l.pl.color.setRGB(c[0],c[1],c[2]);l.glow.material.color.setRGB(c[0],c[1],c[2]);}
}
function fireworkBurst(big){
  const x=rnd(-26,26),y=rnd(9,15),z=-rnd(D+5,D+11);
  const pal=[[1,.85,.3],[1,.45,.55],[.45,.85,1],[.7,1,.6],[1,1,1]],c=pal[(Math.random()*pal.length)|0];
  const n=big?80:46;
  for(let i=0;i<n;i++){const a=rnd(TAU),b=rnd(-1,1),s=rnd(6,10)*(big?1.2:1),r=Math.sqrt(1-b*b);emit(x,y,z,Math.cos(a)*r*s,b*s+4,Math.sin(a)*r*s,rnd(1,1.7),rnd(.45,.8),c[0],c[1],c[2]);}
  SFX.firework();
}
function arenaFrame(dt){
  arenaDecoFrame();nearLampFrame();
  if(G.view!=='game'){return;}
  const A=ARENAS[G.arena]||ARENAS.classic;
  if(A.cheer)G.cheer=Math.max(G.cheer,A.cheer);
  if(champT>0){champT-=dt;fwT-=dt;if(fwT<=0){fwT=.35;fireworkBurst(true);}return;}
  if(!A.fireworks||save.set.quality==='low'&&G.state==='play')return;
  fwT-=dt;
  const busy=G.state==='ready'||G.state==='goal';
  if(fwT<=0){fwT=busy?.7:rnd(5,8);fireworkBurst(busy);}
}

// --- arena dressing visible from the game camera: LED board strip, centre-ice logo, ice glow / sweeping spotlights ---
const ARENA_DECO={aurora:{led:[.35,1,.85],led2:[.7,.45,1],logo:'AURORA NIGHT',sym:'✦',lc:'#7ff6ff',exp:.8},
  blizzard:{led:[.4,.75,1],led2:[.85,.95,1],logo:'BLIZZARD ARENA',sym:'❄',lc:'#4f9be0',exp:1},
  sunset:{led:[1,.6,.25],logo:'SUNSET CUP',sym:'☀',lc:'#ffb15a',exp:1},
  final:{led:[1,.8,.3],led2:[1,1,1],logo:'GRAND FINAL',sym:'🏆',lc:'#ffd25a',exp:.9,spots:true}};
const arenaG=new T.Group();arenaG.visible=false;scene.add(arenaG);
const ledMat=new T.MeshBasicMaterial({color:0xffffff,toneMapped:false});
{
  const P=perimeter(),segs=[];
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;if(Math.abs(mx)>W-0.2&&Math.abs(mz)<GW+0.1)continue;segs.push({a,b,mx,mz});}
  const led=new T.InstancedMesh(new T.BoxGeometry(1,1,1),ledMat,segs.length),o=new T.Object3D();
  segs.forEach((sg,i)=>{const dx=sg.b[0]-sg.a[0],dz=sg.b[1]-sg.a[1],L=Math.hypot(dx,dz),n=outN(sg.mx,sg.mz);o.rotation.set(0,Math.atan2(-dz,dx),0);o.position.set(sg.mx-n[0]*.005,.4,sg.mz-n[1]*.005);o.scale.set(L+.08,.09,.03);o.updateMatrix();led.setMatrixAt(i,o.matrix);});
  arenaG.add(led);
}
const logoC=document.createElement('canvas');logoC.width=logoC.height=512;const logoX=logoC.getContext('2d'),logoTex=new T.CanvasTexture(logoC);
const logo=new T.Mesh(new T.PlaneGeometry(8.6,8.6),new T.MeshBasicMaterial({map:logoTex,transparent:true,opacity:.62,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
logo.rotation.x=-Math.PI/2;logo.position.y=.016;logo.renderOrder=1;arenaG.add(logo);
function drawLogo(d){
  const x=logoX;x.clearRect(0,0,512,512);x.save();x.translate(256,256);
  x.strokeStyle=d.lc;x.lineWidth=14;x.globalAlpha=.9;x.beginPath();x.arc(0,0,236,0,TAU);x.stroke();x.lineWidth=5;x.beginPath();x.arc(0,0,206,0,TAU);x.stroke();
  x.fillStyle=d.lc;x.font='bold 150px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(d.sym,0,-46);
  x.font='bold 54px sans-serif';x.fillText(d.logo,0,92,400);x.restore();logoTex.needsUpdate=true;
}
const glowM=new T.MeshBasicMaterial({map:glowTex('rgba(255,255,255,1)','rgba(255,255,255,.35)'),transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
const spots=[0,1].map(()=>{const m=new T.Mesh(new T.PlaneGeometry(13,13),glowM);m.rotation.x=-Math.PI/2;m.position.y=.02;m.renderOrder=1;arenaG.add(m);return m;});
let arenaDecoKey='';
function arenaDecoFrame(){
  const d=G.view==='game'&&ARENA_DECO[G.arena];
  if(!d){if(arenaDecoKey){arenaDecoKey='';arenaG.visible=false;}return;}
  if(arenaDecoKey!==G.arena){arenaDecoKey=G.arena;drawLogo(d);arenaG.visible=true;glowM.color.setRGB(d.led[0],d.led[1],d.led[2]);}
  const t=G.t,c2=d.led2||d.led,k=.5+.5*Math.sin(t*1.6);
  ledMat.color.setRGB(lerp(d.led[0],c2[0],k)*1.3,lerp(d.led[1],c2[1],k)*1.3,lerp(d.led[2],c2[2],k)*1.3);
  const on=d.spots||G.arena==='aurora';glowM.opacity=on?(G.arena==='aurora'?.13+.06*Math.sin(t*.7):.2):0;
  spots[0].position.x=Math.sin(t*.45)*W*.55;spots[0].position.z=Math.sin(t*.9)*D*.45;
  spots[1].position.x=-Math.sin(t*.4+1)*W*.55;spots[1].position.z=Math.cos(t*.8)*D*.45;
  spots[0].visible=spots[1].visible=on;
}

// --- shot preview: dashed line to the first board / goal it would hit (green = on frame) ---
const AIM_N=26,aimLineGeo=new T.BufferGeometry();aimLineGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(AIM_N*3),3));
const aimDotTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='rgba(0,40,60,.55)';x.beginPath();x.arc(32,32,30,0,Math.PI*2);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(32,32,20,0,Math.PI*2);x.fill();return new T.CanvasTexture(c);})();
const aimLine=new T.Points(aimLineGeo,new T.PointsMaterial({color:0xffffff,size:.78,map:aimDotTex,transparent:true,opacity:.9,depthTest:false,depthWrite:false,sizeAttenuation:true}));
aimLine.renderOrder=6;aimLine.frustumCulled=false;aimLine.visible=false;scene.add(aimLine);
const aimTgt=new T.Mesh(new T.RingGeometry(.32,.5,24),new T.MeshBasicMaterial({color:0x22d36a,transparent:true,opacity:.95,depthTest:false,depthWrite:false,side:T.DoubleSide}));
aimTgt.rotation.x=-Math.PI/2;aimTgt.visible=false;aimTgt.renderOrder=6;scene.add(aimTgt);
function shotPath(x0,z0,ax,az,dir){   // straight-line preview; returns end point and whether it enters the goal mouth
  let t=1e9;
  if(Math.abs(ax)>1e-4){const tx=((ax>0?W:-W)-x0)/ax;if(tx>0)t=Math.min(t,tx);}
  if(Math.abs(az)>1e-4){const tz=((az>0?D:-D)-z0)/az;if(tz>0)t=Math.min(t,tz);}
  t=Math.min(t,40);const ex=x0+ax*t,ez=z0+az*t;
  const on=ax*dir>.05&&Math.abs(ex-dir*W)<.05&&Math.abs(ez)<GW-.1;
  return{ex,ez,on,t};
}
function aimPreview(pl,a){
  const pk=G.puck,show=pl&&pl.charging&&canHit(pl)&&G.state==='play';
  if(!show){aimLine.visible=false;aimTgt.visible=false;return;}
  const r=shotPath(pk.rx,pk.rz,a[0],a[1],pl.team.dir),arr=aimLineGeo.attributes.position.array;
  // dots get denser with charge; they scroll toward the target so the direction reads at a glance
  const n=Math.max(6,Math.round(AIM_N*(.35+.65*pl.charge))),step=Math.max(.6,r.t/n),off=(G.t*3)%1;
  for(let i=0;i<AIM_N;i++){const d=i<n?Math.min(r.t,(i+off)*step+.6):-1;arr[i*3]=d<0?0:pk.rx+a[0]*d;arr[i*3+1]=d<0?-50:.08;arr[i*3+2]=d<0?0:pk.rz+a[1]*d;}
  aimLineGeo.attributes.position.needsUpdate=true;
  aimLine.material.color.setHex(r.on?0x14c864:0x2f86e0);aimLine.material.opacity=.6+.4*pl.charge;aimLine.visible=true;
  if(r.on){aimTgt.visible=true;aimTgt.position.set(r.ex-pl.team.dir*.15,.08,r.ez);aimTgt.scale.setScalar(1+.15*Math.sin(G.t*10));}else aimTgt.visible=false;
}

// --- feedback helpers ---
function passFeedback(ps,why){
  if(!G.mine||ps.from.team!==G.mine||!G.cfg||G.cfg.mode==='demo')return;
  const tgt=ps.to||ps.from;
  popAt(why==='cut'?'패스 차단!':'패스 실패',tgt.x,2.2,tgt.z);SFX.passBad(why==='cut');
}
function whiffFx(p){
  if(!p.human)return;
  popAt('헛스윙!',p.x,2.1,p.z);
  const fx=Math.sin(p.heading),fz=Math.cos(p.heading);for(let i=0;i<6;i++)emit(p.x+fx*.9,.25,p.z+fz*.9,fx*rnd(1,3)+rnd(-1,1),rnd(.5,1.6),fz*rnd(1,3)+rnd(-1,1),.35,.16,.8,.85,.9);
}
function fitBanner(){const b=$('#banner');b.style.fontSize='';const w=b.scrollWidth,lim=innerWidth*.94;if(w>lim){const fs=parseFloat(getComputedStyle(b).fontSize)||60;b.style.fontSize=Math.floor(fs*lim/w)+'px';}}

// --- match start hook ---
function v10MatchStart(cfg){
  G.arena=arenaPick(cfg);champT=0;fwT=1.2;arenaLampKey='';arenaWx='';
  const A=ARENAS[G.arena];
  if(G.arena!=='classic'&&!cfg.tutorial)setTimeout(()=>{if(G.view==='game'&&G.state==='ready')hypeToast((cfg.final?'🏆 ':'🏟 ')+A.name+(cfg.final?' · FINAL':''));},350);
  const ch=cfg.challenge;
  if(ch&&ch.kind==='comeback'&&G.mine){G.mine.opp.score=1;updateScoreHud();if(G.hype)G.hype.wasBehind=true;}
  aimLine.visible=false;aimTgt.visible=false;
  try{clearTimeout(hypeBanner.t);clearTimeout(showBanner.t);$('#banner').className='';$('#bannerSub').className='';$('#pops').innerHTML='';}catch(e){}   // nothing from the previous match carries over
}
// --- WebGL context loss: offer a reload if the browser never restores it ---
let ctxLostT=0;
function ctxWatch(){if(!ctxLost){ctxLostT=0;return;}ctxLostT++;if(ctxLostT===6){$('#fbMsg').textContent='그래픽(WebGL)이 복구되지 않았어요. 진행 상황은 저장되어 있으니 다시 불러와 주세요.';$('#fallback').style.display='flex';}}
setInterval(ctxWatch,1000);
function blurUI(){try{const a=document.activeElement;if(a&&a!==document.body&&a.blur)a.blur();}catch(e){}}
// --- AI judgement helpers ---
function gkRead(g,tm){   // a goalie reads a visible wind-up: the longer the charge, the clearer the aim. Quick releases and late aim changes beat it.
  const gk=G.diff.gk,pk=G.puck;if(!gk.read||!tm.opp)return null;let best=null;const gx=-tm.dir*W;
  for(const s of tm.opp.skaters){
    if(!s.charging||s.fall>0)continue;if(Math.hypot(pk.x-s.x,pk.z-s.z)>2.6||Math.abs(gx-pk.x)>19)continue;
    let a;if(s.human)a=humanAim(s);else{const tz=s.ai.plan&&s.ai.plan.tz!=null?s.ai.plan.tz:0,l=Math.hypot(gx-pk.x,tz-pk.z)||1;a=[(gx-pk.x)/l,(tz-pk.z)/l];}
    if(a[0]*(gx-pk.x)<=.05)continue;const z=pk.z+a[1]*((gx-pk.x)/a[0]);if(Math.abs(z)>GW+1.2)continue;
    const w=gk.read*clamp((s.charge-.12)/.5,0,1);if(!best||w>best.w)best={z:clamp(z,-(GW-.55),GW-.55),w};
  }
  return best;
}
function aiPlanTz(p){const og=p.team.opp.goalie,df=G.diff;let side;
  if(og){const gz=og.z;side=Math.abs(gz)<.5?(Math.random()<.5?-1:1):(gz>0?-1:1);}else side=Math.random()<.5?-1:1;
  return side*rnd(1.1,GW-.7)+(Math.random()-.5)*df.aim*5;}
function aiIntercept(p){   // read an opponent pass and step into its lane (chance depends on difficulty)
  const ps=G.pass,df=G.diff;if(!ps||ps.from.team===p.team||!df.icpt||p.passive||p.fall>0)return false;
  if(p.ai.icptRoll!==ps.t){p.ai.icptRoll=ps.t;p.ai.icptOk=Math.random()<df.icpt;}
  if(!p.ai.icptOk)return false;
  const pk=G.puck,vx=pk.vx,vz=pk.vz,v2=vx*vx+vz*vz;if(v2<16)return false;
  const t=clamp(((p.x-pk.x)*vx+(p.z-pk.z)*vz)/v2,0,1.2),ix=pk.x+vx*t,iz=pk.z+vz*t;
  const d=Math.hypot(ix-p.x,iz-p.z),reachT=d/Math.max(6,(7+1.4*p.ty.stats.speed)*.8);
  if(d>5||reachT>t+.25)return false;
  p.ai.tx=clamp(ix,-W+1,W-1);p.ai.tz=clamp(iz,-D+1,D-1);p.ai.full=true;p.ai.mode='icpt';return true;
}
function arenaWeather(w){
  const A=ARENAS[G.arena];
  if(G.view!=='game'||!A||!A.wx){if(arenaWx){arenaWx='';w.t=Math.min(w.t,3);}return;}
  w.t=Math.max(w.t,5);w.target={clear:.08,light:.3,blizzard:.88}[A.wx];w.wind=A.wx==='blizzard'?13:2;
  if(arenaWx!==A.wx){arenaWx=A.wx;w.mode=A.wx==='blizzard'?'blizzard':A.wx==='clear'?'clear':'snow';$('#wx').textContent=w.mode==='clear'?'☀️':w.mode==='snow'?'❄️':'🌨️';}
}
function chalMeta(c){
  let h='<small class="chal-r">보상: '+(save.cleared[c.id]?'클리어 완료 · 다시 하면 5P':'첫 클리어 ⭐'+(c.pts||40)+'P');
  if(c.kind==='types')h+='<br>진행 '+Math.min(c.need,save.chalTypes.length)+' / '+c.need+(save.chalTypes.length?' ('+save.chalTypes.map(k=>TYPES[k].name).join(', ')+')':'')+' · 현재 주장: '+TYPES[save.type].name;
  return h+'</small>';
}
// --- double-tap guard for actions that spend points/cards (a fast double tap on phones used to run them twice) ---
{let dupK='',dupT=0;
 document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-act="enh"],[data-act="mkref"],[data-sell],[data-sqbuy],[data-buy]');if(!b)return;
   const d=b.dataset,k=(d.act||'')+'|'+(d.k||'')+'|'+(d.g||'')+'|'+(d.sell||'')+'|'+(d.sqbuy||'')+'|'+(d.buy||''),now=performance.now();
   if(k===dupK&&now-dupT<350){e.stopImmediatePropagation();e.preventDefault();return;}dupK=k;dupT=now;},true);}
// --- redeem codes (설정 › 코드 입력) ---
function redeemCode(raw){
  const c=String(raw||'').trim().toLowerCase();
  if(!c){flashMsg('코드를 입력하세요');return false;}
  if(c!=='ysgames777'){flashMsg('올바르지 않은 코드예요');return false;}
  if(save.codes.includes(c)){flashMsg('이미 사용한 코드예요');return false;}
  const had=save.types.includes('auk');save.codes.push(c);
  if(!had)save.types.push('auk');save.lv.auk=Math.max(save.lv.auk|0,MAX_LV);persist();
  SFX.init();SFX.win();vib([30,40,30,40,120]);
  flashMsg(had?'코드 사용 완료! (큰바다쇠오리는 이미 가지고 있어요)':'🎉 큰바다쇠오리 획득! 팀 편성에서 주장으로 쓸 수 있어요');
  if(!had)hypeToast('🎉 큰바다쇠오리 (능력치 999) 획득!');
  return true;
}
$('#codeGo').onclick=()=>{if(redeemCode($('#codeIn').value))$('#codeIn').value='';};
$('#codeIn').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#codeGo').click();}});
// near-side lamp posts sit between the game camera and the rink at the ends of the ice: hide their meshes in matches (lights stay on)
const nearLampMeshes=[];for(const l of lamps){const g=l.bulb.parent;if(g&&g.position.z>0)for(const c of g.children)if(!c.isLight)nearLampMeshes.push(c);}
let nearLampOn=true;
function nearLampFrame(){const want=G.view!=='game';if(want===nearLampOn)return;nearLampOn=want;for(const m of nearLampMeshes)m.visible=want;}
