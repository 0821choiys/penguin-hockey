/* ================= v18: ten more real penguin species ================= */
// 임금 · 마카로니 · 로열 · 피오르드랜드 · 노란눈 · 쇠푸른 · 아프리카 · 훔볼트 · 마젤란 · 갈라파고스 펭귄.
// Stats, prices, gacha weights, market prices and jersey numbers are in the tables patched by v18_species.py.
// This module: their special skills (+ AI use), personalities, positions, team chemistry, 3D plumage / bills / crests,
// card art, and the help texts (built from the same numbers the code uses).
const NEW18=['king','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos'];

/* ---------- special skills ---------- */
const SPX={
  trumpet:{cd:10,r:10,t:2.5,cut:3},           // King: rally the team
  crest:{cd:8,t:.6,mul:1.9,knock:1.1},        // Macaroni: head-first charge
  royalpass:{cd:8,spd:1.45,max:28,win:1.5,mul:1.12},   // Royal: pass nobody can cut + a long one-timer window
  shadow:{cd:9,t:3,spd:1.12},                 // Fiordland: can't be knocked down or stripped
  keeneye:{cd:9,t:5,mul:1.08},                // Yellow-eyed: next shot to the open corner
  hop:{cd:7,t:.5,v:11,h:.85},                 // Little: leap over sticks and bodies
  bray:{cd:9,r:7.5,t:1.4},                    // African: startle everyone nearby
  current:{cd:11,t:3},                        // Humboldt: the whole team skates faster
  double:{cd:8,t:2.5},                        // Magellanic: dash now + one free dash
  sunflare:{cd:10,t:2.5,react:1.8,err:1.6},   // Galápagos: dazzle the opposing goalie
  rush:1.2                                    // speed boost of the King's Trumpet / Humboldt Current (top speed and acceleration ×)
};
for(const k in SPX)if(SPX[k].cd)SPEC[k]={cd:SPX[k].cd};
Object.assign(SPECIALS,{trumpet:'킹 트럼펫',crest:'크레스트 돌격',royalpass:'로열 패스',shadow:'숲 그림자',keeneye:'골든 아이',hop:'요정 점프',bray:'당나귀 울음',current:'훔볼트 해류',double:'더블 대시',sunflare:'적도의 태양'});
// one line per skill for the card detail / squad / select screens (numbers come from SPX)
function spDesc(sp){
  const X=SPX[sp]||{},P=v=>Math.round((v-1)*100);
  switch(sp){
    case 'surge':return '길고 강한 돌진 · 주변 상대를 느리게 해요';
    case 'dash':return '빠르게 돌진해요 · 부딪힌 상대를 강하게 밀쳐요';
    case 'slide':return '배로 미끄러지며 태클해요 · 빗나가면 잠깐 느려져요';
    case 'flipper':return '퍽 가까이에서 쓰면 아주 강한 슛 · 퍽이 멀면 헛스윙하고 잠깐 느려져요';
    case 'icebreak':return '얼음을 내려쳐 주변 상대를 밀어내고 느리게 해요 · 아주 가까운 상대는 넘어져요';
    case 'trumpet':return fmtL('동료 전원의 대시를 바로 채우고 특수 기술 대기 시간을 {c}초 줄여요 · 넘어진 동료를 일으키고, {r}m 안의 우리 팀은 {t}초 동안 빨라져요',{c:X.cut,r:X.r,t:X.t});
    case 'crest':return fmtL('{t}초 동안 머리로 돌진해요 · 처음 부딪힌 상대를 넘어뜨리고 퍽을 떨어뜨리게 해요',{t:X.t});
    case 'royalpass':return fmtL('아무도 끊을 수 없는 빠른 패스 · 받은 동료는 {w}초 안에 원타이머를 쏠 수 있어요 (위력 +{m}%) · 퍽이 멀면 헛스윙해요',{w:X.win,m:P(X.mul)});
    case 'shadow':return fmtL('{t}초 동안 넘어지지 않고 퍽을 빼앗기지 않아요 · 속도 +{s}%',{t:X.t,s:P(X.spd)});
    case 'keeneye':return fmtL('{t}초 안에 쏘는 다음 슛이 골키퍼 반대쪽 구석으로 정확히 날아가요 (위력 +{m}%)',{t:X.t,m:P(X.mul)});
    case 'hop':return '높이 뛰어올라 상대를 넘어가요 · 뛰는 동안 부딪히거나 넘어지지 않고 퍽도 지켜요';
    case 'bray':return fmtL('{r}m 안의 상대가 깜짝 놀라 {t}초 동안 느려지고 슛 준비가 끊겨요 · 퍽을 가진 상대는 퍽을 놓쳐요',{r:X.r,t:X.t});
    case 'current':return fmtL('우리 팀 전원이 {t}초 동안 빨라져요 (속도 +{s}%)',{t:X.t,s:P(SPX.rush)});
    case 'double':return fmtL('바로 대시하고, {t}초 안에 대시를 한 번 더 쓸 수 있어요 (대기 시간 없이)',{t:X.t});
    case 'sunflare':return fmtL('상대 골키퍼가 {t}초 동안 눈이 부셔 반응이 느려지고 슛 방향을 읽지 못해요',{t:X.t});
  }
  return '';
}
const hopY18=p=>p.hopT>0?Math.sin(Math.PI*clamp(1-p.hopT/SPX.hop.t,0,1))*SPX.hop.h:0;
function ring18(x,z,r,c){const n=Math.min(56,Math.round(16+r*3.5)),s=r/.6;for(let i=0;i<n;i++){const a=i/n*TAU;emit(x+Math.cos(a)*.5,.55,z+Math.sin(a)*.5,Math.cos(a)*s,2.6,Math.sin(a)*s,.6,.24,c[0],c[1],c[2]);}}
function dash18(p,dx,dz){p.dashT=.45;p.dashMul=1.6;p.dashSpec=false;p.vx+=dx*5;p.vz+=dz*5;burst(p.x,p.z,9,1.1);SFX.whoosh();}
function dbl18(p){   // Magellanic: the free second dash (dash / special button, the AI fires it by itself)
  const m=Math.hypot(p.ix,p.iz);let dx,dz;if(m>.2){dx=p.ix/m;dz=p.iz/m;}else{dx=Math.sin(p.heading);dz=Math.cos(p.heading);}
  p.dbl=0;p.dblT=0;dash18(p,dx,dz);popAt('x2!',p.x,2.3,p.z);if(p.human)tutEvent('dash');return true;
}
function spec18(p,sp,dx,dz){
  const X=SPX[sp];if(!X||!X.cd)return false;
  const tm=p.team,pk=G.puck,cast=()=>{p.specMax=X.cd;p.cd.special=X.cd;};
  if(sp==='trumpet'){
    cast();
    for(const m of tm.skaters){
      if(m!==p){m.cd.dash=0;m.cd.special=Math.max(0,m.cd.special-X.cut);if(m.fall>0)m.fall=Math.min(m.fall,.08);}
      if(Math.hypot(m.x-p.x,m.z-p.z)<=X.r)m.rushT=Math.max(m.rushT||0,X.t);
    }
    ring18(p.x,p.z,X.r,[1,.83,.35]);SFX.fanfare();popAt("KING'S CALL!",p.x,2.7,p.z);
  }else if(sp==='crest'){
    cast();p.dashT=X.t;p.dashMul=X.mul;p.dashSpec=true;p.ramT=X.t;p.vx+=dx*7;p.vz+=dz*7;
    burst(p.x,p.z,16,1.3);SFX.whoosh();popAt('CREST CHARGE!',p.x,2.5,p.z);
  }else if(sp==='royalpass'){
    let mate=null;
    if(canHit(p)){if(p.human){const a=humanAim(p);mate=bestMate(p,a[0],a[1],false);}else mate=bestMate(p,0,0,true)||bestMate(p,Math.sin(p.heading),Math.cos(p.heading),false);}
    if(!mate||!doPass(p,mate)){p.specMax=2.5;p.cd.special=2.5;p.slow=Math.max(p.slow,.3);SFX.whoosh();popAt('MISS',p.x,2.2,p.z);return true;}   // no puck: short cooldown
    const v0=Math.hypot(pk.vx,pk.vz)||1,v=Math.min(X.max,v0*X.spd);pk.vx*=v/v0;pk.vz*=v/v0;
    G.royal={by:p,to:mate,team:tm,until:G.t+Math.hypot(mate.x-pk.x,mate.z-pk.z)/v+.4};
    cast();burst(pk.x,pk.z,14,1.2);SFX.passOk();popAt('ROYAL PASS!',p.x,2.6,p.z);
  }else if(sp==='shadow'){
    cast();p.shadowT=X.t;burst(p.x,p.z,12,1);SFX.whoosh();popAt('SHADOW STEP!',p.x,2.5,p.z);
    for(let i=0;i<22;i++){const a=rnd(TAU);emit(p.x,rnd(.3,1.4),p.z,Math.cos(a)*rnd(1,3),rnd(.5,2),Math.sin(a)*rnd(1,3),.6,.22,.16,.42,.22);}
  }else if(sp==='keeneye'){
    cast();p.eyeT=X.t;SFX.flare();popAt('GOLDEN EYE!',p.x,2.6,p.z);
  }else if(sp==='hop'){
    cast();p.hopT=X.t;const v=Math.max(X.v,Math.hypot(p.vx,p.vz));p.vx=dx*v;p.vz=dz*v;p.slideT=0;p.dashT=0;p.dashSpec=false;
    burst(p.x,p.z,10,1);SFX.hop();popAt('FAIRY HOP!',p.x,2.7,p.z);
  }else if(sp==='bray'){
    cast();
    for(const o of tm.opp.skaters){
      if(o.frozen||o.fall>0)continue;const d=Math.hypot(o.x-p.x,o.z-p.z);if(d>X.r)continue;
      o.slow=Math.max(o.slow,X.t);o.charging=false;o.charge=0;o.stage=0;if(o.ai)o.ai.plan=null;
      if(G.carry===o){carryRelease(.6);const l=d||1;pk.vx=o.vx*.5+(o.x-p.x)/l*3+rnd(-2,2);pk.vz=o.vz*.5+(o.z-p.z)/l*3+rnd(-2,2);}
    }
    ring18(p.x,p.z,X.r,[1,.95,.82]);SFX.bray();G.cam.shake=Math.max(G.cam.shake,.25);popAt('HEE-HAW!',p.x,2.8,p.z);
  }else if(sp==='current'){
    cast();for(const m of tm.skaters)m.rushT=Math.max(m.rushT||0,X.t);
    ring18(p.x,p.z,5,[.45,.8,1]);SFX.whoosh();popAt('COLD CURRENT!',p.x,2.6,p.z);
  }else if(sp==='double'){
    cast();dash18(p,dx,dz);p.dbl=1;p.dblT=X.t;popAt('DOUBLE DASH!',p.x,2.5,p.z);
  }else if(sp==='sunflare'){
    cast();const og=tm.opp.goalie;SFX.flare();
    if(og){og.dazT=X.t;for(let i=0;i<40;i++){const a=rnd(TAU),s=rnd(1,4);emit(og.x,1.7,og.z,Math.cos(a)*s,rnd(1,4),Math.sin(a)*s,.7,.3,1,rnd(.85,1),rnd(.4,.7));}}
    popAt('SUN FLARE!',og?og.x:p.x,2.9,og?og.z:p.z);
  }else return false;
  return true;
}
function ram18(p){   // Macaroni crest charge: the first opponent it runs into goes down
  if(p.fall>0){p.ramT=0;return;}
  for(const o of p.team.opp.skaters){
    if(o.fall>0||o.frozen)continue;if(Math.hypot(o.x-p.x,o.z-p.z)>p.r+o.r+.18)continue;
    p.ramT=0;if(knock(o,SPX.crest.knock))bigHit(p,o);
    SFX.bump(1);burst(o.x,o.z,14,1.3);G.cam.shake=Math.max(G.cam.shake,o.human||p.human?.35:.15);break;
  }
}
function royal18(ps){const R=G.royal;if(!R||ps.from!==R.by)return;G.royal=null;ps.to.otWin=SPX.royalpass.win;}
function keen18(p,ax,az){   // Yellow-eyed golden eye: the next shot on goal flies to the corner away from the goalie
  if(!(p.eyeT>0)||p.goalie)return null;
  const pk=G.puck,tm=p.team,gx=tm.dir*W,dx=gx-pk.x,dz=-pk.z,gd=Math.hypot(dx,dz);
  if(dx*tm.dir<1.5||gd>32)return null;                     // not in front of the net: keep the aim
  if((ax*dx+az*dz)/(gd||1)<.5)return null;                 // aimed more than 60° away from the net (a pass / clear): keep it
  const og=tm.opp.goalie,gz=og?og.z:0,side=Math.abs(gz)>.25?-Math.sign(gz):(pk.z>=0?-1:1),tz=side*(GW-.55),l=Math.hypot(gx-pk.x,tz-pk.z)||1;
  p.eyeT=0;return [(gx-pk.x)/l,(tz-pk.z)/l];
}
function tick18(p,dt){
  if(p.rushT>0)p.rushT-=dt;if(p.shadowT>0)p.shadowT-=dt;if(p.eyeT>0)p.eyeT-=dt;if(p.hopT>0)p.hopT-=dt;if(p.dazT>0)p.dazT-=dt;
  if(p.ramT>0){p.ramT-=dt;if(!p.frozen)ram18(p);}
  if(p.dbl>0){p.dblT-=dt;if(p.dblT<=0)p.dbl=0;else if(!p.human&&!p.frozen&&p.fall<=0&&p.dblT<SPX.double.t-.55)dbl18(p);}
  if(p.otWin&&G.t-(p.recvT==null?-9:p.recvT)>p.otWin)p.otWin=0;
}
function sim18(h){   // the royal pass immunity ends on time, near either goal (no ghost goals) or when play stops
  const R=G.royal;if(R&&(G.state!=='play'||G.t>R.until||Math.abs(G.puck.x)>W-3.5))G.royal=null;
}
// AI use of the new skills: 'any' every think, 'carry' with the puck, 'chase' while chasing it (the old skills keep their rules)
const oppNear18=(p,r)=>p.team.opp.skaters.filter(o=>o.fall<=0&&!o.frozen&&Math.hypot(o.x-p.x,o.z-p.z)<r).length;
function oppAhead18(p,r){const fx=Math.sin(p.heading),fz=Math.cos(p.heading);return p.team.opp.skaters.some(o=>{if(o.fall>0||o.frozen)return false;const dx=o.x-p.x,dz=o.z-p.z,d=Math.hypot(dx,dz);return d<r&&(dx*fx+dz*fz)/(d||1)>.3;});}
function ai18(p,mode){
  const sp=p.ty.special,X=SPX[sp];if(!X||!X.cd||p.cd.special>0||p.fall>0||p.goalie||p.frozen||p.passive)return false;
  if(G.cfg&&(G.cfg.tutorial||G.cfg.noAIShoot))return false;
  const tm=p.team,pk=G.puck,gx=tm.dir*W,gd=Math.hypot(gx-pk.x,pk.z),press=nearestOpp(p);let go=false;
  const matesNear=r=>tm.skaters.filter(m=>m!==p&&m.fall<=0&&Math.hypot(m.x-p.x,m.z-p.z)<r).length;
  if(mode==='shoot'){        // the carrier just decided to shoot
    if(sp==='keeneye')go=Math.random()<.75;
    else if(sp==='sunflare')go=gd<17&&!!tm.opp.goalie&&Math.random()<.75;
  }else if(mode==='pass'){   // the carrier just decided to pass
    go=sp==='royalpass'&&Math.random()<.7;
  }else if(mode==='any'){
    if(sp==='trumpet'){let down=0,busy=0;for(const m of tm.skaters){if(m===p)continue;if(m.fall>.35)down++;if(m.cd.special>4)busy++;}go=down>0||(busy>=2&&Math.random()<.25);}
    else if(sp==='bray'){const c=G.carry;go=!!(c&&c.team!==tm&&Math.hypot(c.x-p.x,c.z-p.z)<X.r*.75)||oppNear18(p,X.r*.8)>=2;}
  }else if(mode==='carry'){
    if(sp==='shadow')go=press<3.2;
    else if(sp==='hop')go=press<2.6&&oppAhead18(p,3.2);
    else if(sp==='current')go=pk.x*tm.dir<0&&gd>18;
    else if(sp==='trumpet')go=pk.x*tm.dir<0&&gd>18&&matesNear(X.r)>0;
    else if(sp==='double')go=press<3||gd>16;
  }else if(mode==='chase'){
    const car=G.carrier,dist=reach(p);
    if(sp==='crest'){if(car&&car.team!==tm&&!car.goalie){const dx=car.x-p.x,dz=car.z-p.z,d=Math.hypot(dx,dz);go=d<5&&(dx*Math.sin(p.heading)+dz*Math.cos(p.heading))/(d||1)>.4;}}
    else if(sp==='bray')go=!!(car&&car.team!==tm&&!car.goalie&&Math.hypot(car.x-p.x,car.z-p.z)<X.r*.75);
    else if(sp==='trumpet')go=dist>14&&matesNear(X.r)>0;
    else if(sp==='hop'||sp==='double'||sp==='current')go=dist>10;
    else if(sp==='shadow')go=dist>12;
  }
  return go?useSpecial(p):false;
}
// status chips for the player (shown next to the item / combo chips)
function chip18(p,a){
  if(p.rushT>0)a.push('💨 '+p.rushT.toFixed(1));
  if(p.shadowT>0)a.push('🌲 '+p.shadowT.toFixed(1));
  if(p.eyeT>0)a.push('🎯 '+p.eyeT.toFixed(1));
  if(p.dbl>0)a.push('⏩ '+p.dblT.toFixed(1));
  if(p.otWin&&G.t-(p.recvT==null?-9:p.recvT)<p.otWin)a.push('👑 '+Math.max(0,p.otWin-(G.t-p.recvT)).toFixed(1));
  const og=p.team&&p.team.opp&&p.team.opp.goalie;if(og&&og.dazT>0)a.push('☀️ '+og.dazT.toFixed(1));
}
function v18Frame(dt){   // skill particles
  if(G.view!=='game')return;
  for(const p of G.pengs){
    if(p.frozen)continue;const s=p.ty.scale||1;
    if(p.shadowT>0&&Math.random()<dt*22)emit(p.x+rnd(-.5,.5),rnd(.4,1.4)*s,p.z+rnd(-.5,.5),rnd(-.6,.6),rnd(.2,1),rnd(-.6,.6),.55,.2,.16,.42,.22);
    if(p.eyeT>0&&Math.random()<dt*16)emit(p.x+rnd(-.25,.25),1.75*s,p.z+rnd(-.25,.25),0,rnd(.6,1.4),0,.4,.16,1,.85,.25);
    if(p.rushT>0&&Math.random()<dt*24)emit(p.x,.25,p.z,-p.vx*.12,rnd(.6,1.4),-p.vz*.12,.4,.18,.55,.85,1);
    if(p.hopT>0&&Math.random()<dt*40)emit(p.x,.2,p.z,rnd(-.5,.5),rnd(.5,1.2),rnd(-.5,.5),.35,.2,.85,.95,1);
    if(p.ramT>0&&Math.random()<dt*40){const fx=Math.sin(p.heading),fz=Math.cos(p.heading);emit(p.x+fx*.6,1.3*s,p.z+fz*.6,fx*2+rnd(-1,1),rnd(.5,2),fz*2+rnd(-1,1),.3,.18,1,.7,.2);}
    if(p.dazT>0&&Math.random()<dt*30){const a=G.t*6+rnd(0,1);emit(p.x+Math.cos(a)*.55,1.95,p.z+Math.sin(a)*.55,0,.4,0,.45,.2,1,.95,.5);}
    if(p.dbl>0&&Math.random()<dt*12)emit(p.x+rnd(-.3,.3),.3,p.z+rnd(-.3,.3),0,rnd(.5,1),0,.35,.15,.6,.8,1);
  }
}

/* ---------- personalities (strength + weakness), positions, team chemistry ---------- */
Object.assign(TT,{
  king:{name:'카리스마',plus:'넘어져도 20% 빨리 일어나요',minus:'슛 충전 속도 -8%',fall:.8,chg:.92},
  macaroni:{name:'싸움꾼',plus:'몸싸움 충돌 위력 +20%',minus:'슛 정확도 -15%',hit:1.2,spread:1.15},
  royal:{name:'지휘자',plus:'패스 속도 +15%',minus:'강슛 최대 위력 -5%',pass:1.15,pow:.95},
  fiordland:{name:'숲의 파수꾼',plus:'상대 패스·슛 가로채기 범위 +0.15m',minus:'대시 재사용 +0.3초',reach:.15,dashCd:.3},
  yelloweye:{name:'스나이퍼',plus:'슛 정확도 +30%',minus:'슛 충전 속도 -10%',spread:.7,chg:.9},
  little:{name:'포켓 로켓',plus:'대시 재사용 -0.6초',minus:'강슛 최대 위력 -10%',dashCd:-.6,pow:.9},
  african:{name:'퍽 사냥꾼',plus:'퍽 빼앗기 확률 +25%',minus:'패스 속도 -8%',steal:1.25,pass:.92},
  humboldt:{name:'해류 서퍼',plus:'원타이머 위력 +10%',minus:'넘어지면 회복이 15% 느려요',ot:1.1,fall:1.15},
  magellanic:{name:'장거리 철새',plus:'최고 속도 +4%',minus:'강슛 최대 위력 -5%',spd:1.04,pow:.95},
  galapagos:{name:'적도의 순발력',plus:'톡 슛 위력 +15%',minus:'넘어지면 회복이 10% 느려요',tap:1.15,fall:1.1}
});
Object.assign(PREF,{king:'mid',macaroni:'attacker',royal:'mid',fiordland:'defender',yelloweye:'attacker',little:'mid',african:'defender',humboldt:'mid',magellanic:'defender',galapagos:'attacker'});
// family chemistry: real penguin groups (2 of a group in the line-up)
const syn18=(ks,n)=>s=>ks.filter(k=>s.has(k)).length>=n;
SYN.push(
  {id:'brush',name:'남극 토박이',desc:'아델리·젠투·턱끈 중 2종 출전',eff:{turn:.1,accel:.1},need:syn18(['basic','fast','defense'],2),link:['basic','fast','defense']},
  {id:'great',name:'거인 형제',desc:'황제 + 임금 함께 출전',eff:{power:.3},need:syn18(['strong','king'],2),link:['strong','king']},
  {id:'crested',name:'노란 볏 패밀리',desc:'바위뛰기·마카로니·로열·피오르드랜드 중 2종 출전',eff:{accel:.2},need:syn18(['balanced','macaroni','royal','fiordland'],2),link:['balanced','macaroni','royal','fiordland']},
  {id:'banded',name:'줄무늬 패밀리',desc:'아프리카·훔볼트·마젤란·갈라파고스 중 2종 출전',eff:{speed:.2},need:syn18(['african','humboldt','magellanic','galapagos'],2),link:['african','humboldt','magellanic','galapagos']},
  {id:'kiwi',name:'뉴질랜드 친구들',desc:'노란눈·쇠푸른·피오르드랜드 중 2종 출전',eff:{turn:.2},need:syn18(['yelloweye','little','fiordland'],2),link:['yelloweye','little','fiordland']}
);
// a real fact per species (card detail)
const PFACT={
  basic:'남극 해안에 살아요. 눈 둘레의 하얀 고리가 특징이고, 돌멩이를 모아 둥지를 지어요.',
  fast:'헤엄이 가장 빠른 펭귄이에요 (시속 약 36km). 눈 위의 하얀 무늬와 주황색 부리가 특징이에요.',
  strong:'가장 큰 펭귄이에요 (키 약 1.1m). 남극의 한겨울에 수컷이 알을 발 위에 올려 품어요.',
  defense:'턱 아래의 가는 검은 줄이 헬멧 끈처럼 보여서 붙은 이름이에요.',
  balanced:'바위 사이를 두 발로 깡충깡충 뛰어다녀요. 노란 눈썹 깃과 빨간 눈이 특징이에요.',
  auk:'원래 펭귄이라는 이름으로 불리던 북대서양의 날지 못하는 바닷새예요. 1844년에 멸종했어요.',
  king:'두 번째로 큰 펭귄이에요. 귀 옆의 선명한 주황색 무늬가 특징이고, 둥지 없이 알을 발 위에 올려 품어요.',
  macaroni:'이마에서 이어지는 주황색 장식 깃이 특징이에요. 이름은 18세기 영국에서 깃털 모자를 쓰던 멋쟁이를 부르던 말에서 왔어요.',
  royal:'마카로니 펭귄과 닮았지만 얼굴이 하얘요. 남극해의 매쿼리섬 주변에서만 번식해요.',
  fiordland:'뉴질랜드 남섬의 우거진 숲속에 둥지를 트는 수줍은 펭귄이에요. 눈 위로 굵은 노란 눈썹 깃이 있어요.',
  yelloweye:'노란 눈과 머리를 두르는 노란 띠가 특징이에요. 뉴질랜드에만 살고, 가장 희귀한 펭귄 중 하나예요.',
  little:'세계에서 가장 작은 펭귄이에요 (키 약 33cm, 몸무게 약 1kg). 푸른빛이 도는 깃털을 가졌어요.',
  african:'아프리카 남부 해안에 살아요. 당나귀처럼 우는 소리 때문에 자카스 펭귄이라고도 불러요.',
  humboldt:'페루와 칠레 해안에 살아요. 이 바다를 흐르는 차가운 훔볼트 해류에서 이름을 따왔어요.',
  magellanic:'남아메리카 남쪽 끝에 살아요. 가슴의 검은 띠 두 줄이 특징이고, 땅굴을 파서 둥지를 지어요.',
  galapagos:'적도의 갈라파고스 제도에 살아요. 야생 펭귄 중 유일하게 북반구에서도 볼 수 있어요.'
};
function spLine18(k){const sp=TYPES[k].special;return '<div class="sp-line">⚡ <b>'+SPECIALS[sp]+'</b> · '+spDesc(sp)+'</div>';}   // card detail: the skill
function fact18(k){return PFACT[k]?'<div class="fact-line"><b>'+'🔎 알고 있나요?'+'</b> '+PFACT[k]+'</div>':'';}            // card detail: a real fact
// unowned species: a faint silhouette instead of a plain "?" card (the exclusive one stays a secret)
function sil18(k,cw){
  if(TYPES[k].exclusive)return cw?'<div style="--cw:'+cw+'px;opacity:.6"><div class="pc-backface">?</div></div>':'<div class="pc-backface">?</div>';
  return '<div class="pc-sil"'+(cw?' style="--cw:'+cw+'px"':'')+'><div class="pc-sil-art">'+pengSVG(k)+'</div><b>?</b></div>';
}
// quick / free matches and the menu background use the whole roster
function oppMix18(){const ks=nonExclTypes();return [0,1,2,3].map(()=>ks[Math.floor(Math.random()*ks.length)]);}
function demo18(){const ks=nonExclTypes();return ks[Math.floor(Math.random()*ks.length)];}

/* ---------- 3D plumage, bills, eyes, crests ---------- */
const PK18DT={king:1,macaroni:1,fiord:1,yeye:1,african:1,humboldt:1,magellan:1,galapagos:1};   // dark chin / throat
const PK18EYE={macaroni:0xa8281f,royal:0x9a3424,fiord:0x8c2418,yeye:0xf2d23a,little:0xa3b0bd};
// Broad areas are vertex colours (royal face, little-blue body, yellow-eyed crown, king bib); fine marks (bands, face
// stripes, ear patches, bare pink skin, spots) are thin decals that follow the surface: on the body / head grids they
// would come out blocky.
function pkW18(pt,a,th,y,wh){   // white areas (before the colour mix)
  if(pt==='royal'){const top=lerp(1.5,1.3,smooth(.55,1.35,a));wh=Math.max(wh,(1-smooth(top-.025,top+.025,y))*smooth(1.0,1.08,y)*(1-smooth(1.25,1.5,a)));}
  else if(pt==='little')wh=Math.max(wh,(1-smooth(1.3,1.36,y))*smooth(1.0,1.06,y)*(1-smooth(.85,1.25,a)));
  return wh;
}
const PK18C={king:1,macaroni:1,yeye:1,little:1};
function pkC18(ty,pt,a,th,y,q){   // colour patches (after the white mix)
  const mix=(c,f)=>{if(f<=0)return;f=Math.min(1,f);q[0]=lerp(q[0],c[0],f);q[1]=lerp(q[1],c[1],f);q[2]=lerp(q[2],c[2],f);};
  if(pt==='king'){
    mix([1,.6,.12],(1-smooth(.75,1.3,a))*smooth(.86,1.04,y)*(1-smooth(1.16,1.24,y)));      // golden-orange upper breast fading into the white belly
    mix([.27,.3,.35],smooth(1.55,2.6,a)*(1-smooth(1.02,1.2,y))*smooth(.15,.5,y)*.75);       // silver-grey back
  }else if(pt==='macaroni')mix([1,.64,.1],(1-smooth(.1,.24,a))*smooth(1.55,1.58,y)*(1-smooth(1.63,1.67,y)));   // golden crest root on the forehead
  else if(pt==='yeye'){
    if(y>1.24){const top=smooth(1.36,1.5,y),sp=pkHash(Math.floor(th*26),Math.floor(y*40))>.6?.55:1;
      mix([.68*sp,.57*sp,.24*sp],top*.92);                                                    // speckled pale-yellow crown
      mix([.46,.38,.27],(1-top)*smooth(1.26,1.3,y)*(1-smooth(.5,1.0,a))*.85);}                // light brown face
  }else if(pt==='little')mix([.4,.52,.68],smooth(1.28,1.34,y)*(1-smooth(1.44,1.5,y))*smooth(.3,.6,a)*(1-smooth(1.3,1.6,a))*.5);   // blue-grey cheeks
}
const PK18_DMAT=rimify(new T.MeshStandardMaterial({vertexColors:true,roughness:.62,metalness:0,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4}),1);
const dPt18=(head,key)=>head?(th,y,o)=>pkHeadPt(th,y,-o):(th,y,o)=>pkBodyPt(key,th,y,o);
const rad18=(head,key,y)=>Math.max(.05,head?pkHeadR(y):pkBodyR(y)*(PK_SHAPE[key]||1));
function stripG18(key,head,pts,w,col,o){   // ribbon through control points [th,y]; w = half width (number or fn of 0..1)
  const cv=new T.SplineCurve(pts.map(q=>new T.Vector2(q[0],q[1]))),N=Math.max(24,pts.length*16),P=dPt18(head,key),pos=[],idx=[];
  for(let i=0;i<=N;i++){const u=i/N,c=cv.getPoint(u),n1=cv.getPoint(Math.min(1,u+.01)),n0=cv.getPoint(Math.max(0,u-.01)),r=rad18(head,key,c.y);
    const tx=(n1.x-n0.x)*r,ty=n1.y-n0.y,l=Math.hypot(tx,ty)||1,nx=-ty/l,ny=tx/l,ww=typeof w==='function'?w(u):w;
    for(const k of[-1,0,1]){const v=P(c.x+k*ww*nx/r,c.y+k*ww*ny,o||.006);pos.push(v.x,v.y,v.z);}}
  for(let i=0;i<N;i++)for(let j=0;j<2;j++){const a=i*3+j,b=a+1,c=a+3,d=c+1;idx.push(a,b,c,b,d,c);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return [g,col];
}
function blobG18(key,head,th0,y0,ra,ry,col,o){   // filled ellipse on the surface (ra, ry in metres)
  const P=dPt18(head,key),r=rad18(head,key,y0),n=22,c=P(th0,y0,o||.006),pos=[c.x,c.y,c.z],idx=[];
  for(let i=0;i<=n;i++){const a=i/n*TAU,v=P(th0+Math.cos(a)*ra/r,y0+Math.sin(a)*ry,o||.006);pos.push(v.x,v.y,v.z);}
  for(let i=1;i<=n;i++)idx.push(0,i,i+1);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return [g,col];
}
const taper18=(w,a,b)=>u=>w*Math.min(1,u/(a||.08),(1-u)/(b||.08));
function decals18(key){   // {b: body decals, h: head decals} (merged, vertex coloured) or null
  const ck='d18'+key;if(pkGeoC[ck]!==undefined)return pkGeoC[ck];
  const pt=TYPES[key].patch,B=[],H=[],blk=[.03,.034,.05],wht=[.95,.955,.97],pink=[.95,.56,.6],S=[-1,1];
  const chest=(y0,drop,w)=>B.push(stripG18(key,false,[-1.8,-1.25,-.75,-.35,0,.35,.75,1.25,1.8].map(t=>[t,y0-drop*smooth(.35,1.5,Math.abs(t))]),taper18(w,.06,.06),blk));
  const side=(pts,w,col,head)=>{for(const s of S)(head?H:B).push(stripG18(key,head,pts.map(q=>[s*q[0],q[1]]),w,col));};
  const blobs=(th,y,ra,ry,col,head)=>{for(const s of S)(head?H:B).push(blobG18(key,head,s*th,y,ra,ry,col));};
  const cPath=[[.16,1.556],[.6,1.553],[.95,1.52],[1.1,1.42],[1.08,1.3],[1.0,1.2]];   // banded penguins: brow arc + stripe down behind the cheek
  if(pt==='african'){chest(.975,.55,.034);side(cPath,taper18(.03,.1,.06),wht,true);blobs(.5,1.515,.034,.017,pink,true);
    for(const q of[[.22,.885],[-.42,.86],[.6,.92],[-.12,.9],[.34,.3],[-.25,.27],[.62,.34]])B.push(blobG18(key,false,q[0],q[1],.017,.017,blk));}
  else if(pt==='humboldt'){chest(.955,.5,.05);side(cPath,taper18(.021,.1,.06),wht,true);blobs(.3,1.41,.075,.05,pink,true);
    for(const q of[[.3,.87],[-.48,.85]])B.push(blobG18(key,false,q[0],q[1],.016,.016,blk));}
  else if(pt==='magellan'){chest(.905,.45,.03);B.push(stripG18(key,false,[-1.7,-1,0,1,1.7].map(t=>[t,1.045]),taper18(.028,.06,.06),blk));
    side(cPath,taper18(.027,.1,.06),wht,true);H.push(stripG18(key,true,[-1.05,-.5,0,.5,1.05].map(t=>[t,1.245]),taper18(.013,.1,.1),wht));blobs(.17,1.405,.03,.016,pink,true);}
  else if(pt==='galapagos'){chest(.965,.45,.02);side([[.74,1.505],[.92,1.45],[.97,1.35],[.9,1.24]],taper18(.016,.15,.08),wht,true);blobs(.2,1.37,.05,.022,[.96,.72,.7],true);}
  else if(pt==='fiord'){side([[.12,1.49],[.4,1.535],[.65,1.55],[.95,1.52],[1.3,1.47],[1.7,1.42],[2.05,1.39]],taper18(.027,.12,.3),[1,.86,.3],true);
    for(let i=0;i<3;i++)side([[.72+.12*i,1.355-.015*i],[.77+.12*i,1.3-.015*i]],taper18(.007,.3,.3),[.84,.86,.9],true);}
  else if(pt==='yeye')side([[.6,1.468],[1.2,1.47],[2,1.47],[2.7,1.47],[Math.PI,1.47]],taper18(.017,.08,.001),[1,.86,.28],true);
  else if(pt==='king')side([[1.43,1.49],[1.37,1.42],[1.26,1.34],[1.14,1.27],[1.06,1.21]],u=>lerp(.075,.024,u)*Math.min(1,u/.2+.25),[1,.52,.06],true);   // spoon-shaped ear patch running down to the neck
  else if(pt==='macaroni'||pt==='royal')blobs(.25,1.365,.03,.018,pink,true);
  return pkGeoC[ck]=(B.length||H.length)?{b:B.length?pkMerge(B):null,h:H.length?pkMerge(H):null}:null;
}
function bk18(hex,tip){const o=pkRGB(hex);return (t,y,x,c)=>{const l=smooth(.62,1,t)*(tip||0);c[0]=lerp(o[0],1,l*.55);c[1]=lerp(o[1],.8,l*.5);c[2]=lerp(o[2],.65,l*.5);};}
function bkBand18(a,b,k){return (t,y,x,c)=>{const f=smooth(a-.02,a+.02,t)*(1-smooth(b-.02,b+.02,t))*(k||.75),v=lerp(.055,.72,f);c[0]=v;c[1]=v*1.02;c[2]=v*1.06;};}
function bkBase18(hex,until){const o=pkRGB(hex);return (t,y,x,c)=>{const p=1-smooth(until-.06,until+.06,t);c[0]=lerp(.055,o[0],p);c[1]=lerp(.055,o[1],p);c[2]=lerp(.063,o[2],p);};}
const PK18BK={
  king:S=>Object.assign(S,{H:.05,droop:.42,hook:.06,lo:(t,y,x,c)=>{const pl=smooth(.06,.14,t)*(1-smooth(.66,.76,t))*smooth(.15,.45,Math.abs(x)),o=pkRGB(0xff7a45);c[0]=lerp(.055,o[0],pl);c[1]=lerp(.05,o[1],pl);c[2]=lerp(.063,o[2],pl);}}),
  macaroni:S=>Object.assign(S,{H:.085,droop:.32,hook:.18,up:bk18(0xc8562c,.2),lo:bk18(0xb54a26,0)}),
  royal:S=>Object.assign(S,{H:.09,droop:.32,hook:.18,up:bk18(0xd9784a,.22),lo:bk18(0xc8653c,0)}),
  fiord:S=>Object.assign(S,{H:.08,droop:.3,hook:.16,up:bk18(0xd2552a,.15),lo:bk18(0xc24a24,0)}),
  yeye:S=>Object.assign(S,{H:.064,droop:.24,hook:.12,up:bk18(0xb5644e,.35),lo:bk18(0xdc9e8c,0)}),
  little:S=>Object.assign(S,{H:.055,droop:.3,hook:.17,up:bk18(0x2c2e34,.1),lo:bk18(0x34363c,0)}),
  african:S=>Object.assign(S,{H:.07,droop:.28,hook:.14,up:bkBand18(.64,.74),lo:bkBand18(.6,.72)}),
  humboldt:S=>Object.assign(S,{H:.072,droop:.28,hook:.14,lo:bkBase18(0xe9a3a3,.36)}),
  magellan:S=>Object.assign(S,{H:.07,droop:.28,hook:.14,up:bkBand18(.66,.73,.55),lo:bkBand18(.62,.7,.55)}),
  galapagos:S=>Object.assign(S,{H:.062,droop:.26,hook:.12,lo:bkBase18(0xe6c08e,.56)})
};
// crests. Bare head: the full crest. Under any hat: only a few plumes behind the eyes, rooted below the brim, so nothing
// pokes out of the hat (the bare-headed rockhopper keeps its own crest from pkCrestGeo).
function pkCrest18(pt,bare){
  const ck='c18'+pt+bare;if(pkGeoC[ck]!==undefined)return pkGeoC[ck];
  const C={rock:[0xffd21a,0xffe24a],macaroni:[0xff9a14,0xffc02a,0xff7c10],royal:[0xffb21a,0xffd04a,0xff9a20],fiord:[0xffe066,0xfff08a]}[pt];
  if(!C||(bare&&pt==='rock'))return pkGeoC[ck]=null;
  const cols=C.map(pkRGB),list=[],up=new T.Vector3(0,1,0),q=new T.Quaternion(),M=new T.Matrix4();
  const cone=(b,dir,len,r,flat,col)=>{const d=dir.clone().normalize(),c=new T.ConeGeometry(r,len,6);c.scale(1,1,flat);c.translate(0,len/2,0);q.setFromUnitVectors(up,d);c.applyMatrix4(M.makeRotationFromQuaternion(q));c.translate(b.x,b.y,b.z);list.push([c,col]);return b.clone().addScaledVector(d,len*.9);};
  const tang=(th,s)=>new T.Vector3(Math.cos(th),0,-Math.sin(th)).multiplyScalar(s),nrm=th=>new T.Vector3(Math.sin(th),0,Math.cos(th));
  for(const s of[-1,1]){
    if(!bare){
      for(let i=0;i<4;i++){const th=s*(.86+.07*i),b=pkHeadPt(th,1.47-.012*i,-.006);
        cone(b,tang(th,s).addScaledVector(nrm(th),.3).add(new T.Vector3(0,-.3-.1*i,0)),.15+.022*i,.018,.55,cols[i%cols.length]);}
    }else if(pt==='fiord'){   // the brow stripe widens behind the eye into plumes that lie back and droop
      for(let i=0;i<6;i++){const th=s*(.78+.16*i),A=Math.abs(th),y=1.49+.06*smooth(.05,.6,A)-.13*smooth(.85,1.9,A),b=pkHeadPt(th,y+.008,-.004);
        cone(b,tang(th,s).addScaledVector(nrm(th),.12).add(new T.Vector3(0,-.3-.05*i,0)),.14+.012*i,.02,.38,cols[i%2]);}
    }else{   // macaroni / royal: plumes spring from one patch on the forehead, spread over the eyes and hang down behind them
      for(let i=0;i<6;i++){const th=s*(.04+.06*i),b=pkHeadPt(th,1.585+.008*i,-.004);
        const mid=cone(b,tang(th,s).addScaledVector(nrm(th),.2).add(new T.Vector3(0,.35-.04*i,0)),.13+.01*i,.02,.5,cols[i%3]);
        const th2=th+s*.42;cone(mid,tang(th2,s).multiplyScalar(.8).addScaledVector(nrm(th2),.3).add(new T.Vector3(0,-.6-.06*i,0)),.16+.025*i,.017,.5,cols[(i+1)%3]);}
    }
  }
  return pkGeoC[ck]=pkMerge(list);
}
function crest18(ty,hat,headAbs){const g=pkCrest18(ty.patch,!hat||hat==='none');if(g)headAbs.add(new T.Mesh(g,PK_MAT.vc));}

/* ---------- card art (own drawings, same frame as the other species) ---------- */
const SVG18={king:1,macaroni:1,royal:1,fiord:1,yeye:1,little:1,african:1,humboldt:1,magellan:1,galapagos:1};
function pengSVG18(k){
  const t=TYPES[k],p=t.patch,hx=c=>'#'+('00000'+(c>>>0).toString(16)).slice(-6);
  const D={little:'#3a5c8e',yeye:'#283446',king:'#1a2131'}[p]||'#1d2540',Wh='#f6faff',ft=hx(t.foot||0xff8c1c);
  const body={king:1.1,little:.9,galapagos:.92}[p]||1,all={little:.86,galapagos:.9}[p]||1;
  const sym=m=>m+'<g transform="matrix(-1 0 0 1 120 0)">'+m+'</g>';
  let s='<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg"><g transform="translate(60 134) scale('+all+') translate(-60 -134)">';
  s+='<ellipse cx="60" cy="134" rx="30" ry="5" fill="rgba(0,0,0,.28)"/>'+sym('<ellipse cx="46" cy="130" rx="12" ry="5" fill="'+ft+'"/>');
  s+='<g transform="translate(60 92) scale('+body+') translate(-60 -92)">'+sym('<ellipse cx="31" cy="92" rx="7" ry="21" fill="'+D+'" transform="rotate(14 31 92)"/>');
  s+='<ellipse cx="60" cy="92" rx="30" ry="38" fill="'+D+'"/><ellipse cx="60" cy="97" rx="20" ry="30" fill="'+Wh+'"/>';
  if(p==='king')s+='<ellipse cx="60" cy="75" rx="17" ry="10" fill="#ffae35"/><ellipse cx="60" cy="83" rx="15" ry="7" fill="#ffd47e" opacity=".7"/>';
  else if(p==='african'||p==='humboldt'){s+='<path d="M41.5 104V88Q60 68 78.5 88V104" stroke="'+D+'" stroke-width="'+(p==='african'?3.6:5.5)+'" fill="none"/>';
    s+=[[52,106],[66,101],[58,115],[69,113],[49,96]].slice(0,p==='african'?5:2).map(q=>'<circle cx="'+q[0]+'" cy="'+q[1]+'" r="1.5" fill="'+D+'"/>').join('');}
  else if(p==='magellan')s+='<path d="M41 76Q60 66 79 76" stroke="'+D+'" stroke-width="3.6" fill="none"/><path d="M41.5 104V90Q60 72 78.5 90V104" stroke="'+D+'" stroke-width="3.4" fill="none"/>';
  else if(p==='galapagos')s+='<path d="M42 84Q60 70 78 84" stroke="'+D+'" stroke-width="2.4" fill="none"/>';
  s+='</g><circle cx="60" cy="46" r="24" fill="'+D+'"/>';
  // head markings
  if(p==='king')s+=sym('<path d="M34 49Q35 37 45 40Q42 50 41 61Q35 58 34 49Z" fill="#ff9418"/><path d="M41 61Q44 66 49 69" stroke="#ff9418" stroke-width="2.6" fill="none" stroke-linecap="round"/>');
  else if(p==='royal')s+='<ellipse cx="60" cy="57" rx="20" ry="13.5" fill="#eef2f8"/>';
  else if(p==='little')s+='<ellipse cx="60" cy="63" rx="14.5" ry="8" fill="'+Wh+'"/>';
  else if(p==='yeye')s+='<path d="M36.6 43A24 24 0 0 1 83.4 43Q60 35 36.6 43Z" fill="#d6b24a"/>'+[[47,31],[55,27],[64,28],[72,32],[52,35],[66,34],[59,32]].map(q=>'<circle cx="'+q[0]+'" cy="'+q[1]+'" r="1.1" fill="#6a5524"/>').join('')+'<path d="M36.5 46Q60 40 83.5 46" stroke="#ffd83a" stroke-width="4.4" fill="none"/><ellipse cx="60" cy="58" rx="16" ry="8.5" fill="#7d6a52" opacity=".85"/>';
  else if(p==='fiord')s+=sym('<path d="M56 42Q47 33 37 37Q31 41 30 51Q34 44 39 42Q47 39 55 45Z" fill="#ffe066"/><path d="M45 56l-3.5 5.5M48 58l-2.5 5.5M51 59l-1.5 5" stroke="#e6edf5" stroke-width="1.5" stroke-linecap="round"/>');
  else if(p==='african'||p==='magellan')s+=sym('<path d="M57 34Q43 30 37 42Q34 55 46 67L49.5 65Q40 55 41 44Q45 36 57 38Z" fill="'+Wh+'"/>')+(p==='african'?sym('<ellipse cx="49" cy="40" rx="4.6" ry="2" fill="#f49aa9"/>'):'<path d="M44 64Q60 72 76 64" stroke="'+Wh+'" stroke-width="3" fill="none"/>');
  else if(p==='humboldt')s+=sym('<path d="M57 34.5Q43 31 37.5 42Q35 55 46 66L48 64.5Q40 55 40.5 44Q45 36.5 57 37Z" fill="'+Wh+'"/><ellipse cx="51" cy="51" rx="6.5" ry="3.8" fill="#f2a2a8"/>');
  else if(p==='galapagos')s+=sym('<path d="M38.5 43Q35.5 57 47.5 67" stroke="'+Wh+'" stroke-width="2.3" fill="none" stroke-linecap="round"/>');
  if(p==='macaroni'||p==='royal'){const c1=p==='royal'?'#ffbf2e':'#ffa21f',c2=p==='royal'?'#ffe07a':'#ffcf4a';
    s+=sym('<path d="M59 31Q47 22 34 28Q28 33 30 44Q33 36 40 32.5Q49 30 58.5 34.5Z" fill="'+c1+'"/><path d="M56 30Q45 25.5 36.5 31Q32.5 35 32.5 41" stroke="'+c2+'" stroke-width="1.6" fill="none" stroke-linecap="round"/>')+'<path d="M55 30Q60 22 65 30Q60 27.5 55 30Z" fill="'+c1+'"/>';}
  // eyes
  const iris={macaroni:'#b3282a',royal:'#a8322a',fiord:'#9a2a20',yeye:'#f2d23a',little:'#a8b6c4'}[p];
  if(iris)s+='<circle cx="50" cy="46" r="6" fill="#fff"/><circle cx="70" cy="46" r="6" fill="#fff"/><circle cx="50.6" cy="46.6" r="4.1" fill="'+iris+'"/><circle cx="70.6" cy="46.6" r="4.1" fill="'+iris+'"/><circle cx="50.9" cy="46.9" r="2.1" fill="#10131f"/><circle cx="70.9" cy="46.9" r="2.1" fill="#10131f"/>';
  else s+='<circle cx="50" cy="46" r="6.4" fill="#fff"/><circle cx="70" cy="46" r="6.4" fill="#fff"/><circle cx="51" cy="47" r="3.5" fill="#10131f"/><circle cx="71" cy="47" r="3.5" fill="#10131f"/>';
  s+='<circle cx="52.2" cy="45.4" r="1.3" fill="#fff"/><circle cx="72.2" cy="45.4" r="1.3" fill="#fff"/>';
  // bills
  if(p==='king')s+='<path d="M55 53Q60 50 65 53L61.6 74Q60 76 58.4 74Z" fill="#16171c"/><path d="M57.4 57L62.6 57L61.1 70.5L58.9 70.5Z" fill="#ff7a45"/>';
  else if(p==='macaroni'||p==='royal')s+='<g transform="translate(60 58) scale('+(p==='royal'?1.06:1)+') translate(-60 -58)">'+sym('<path d="M47.6 55.5L52 53.6L51.6 58.6Z" fill="#f2a0a8"/>')+'<path d="M49 54Q60 46 71 54Q68 67 60 70Q52 67 49 54Z" fill="'+(p==='royal'?'#d9784a':'#c8562c')+'"/><path d="M53 55Q60 51 67 55" stroke="rgba(255,255,255,.35)" stroke-width="1.4" fill="none"/></g>';
  else if(p==='fiord')s+='<path d="M51 54Q60 48 69 54Q66 65 60 67Q54 65 51 54Z" fill="#d2552a"/>';
  else if(p==='yeye')s+='<path d="M54 54Q60 50 66 54Q63.5 64 60 66Q56.5 64 54 54Z" fill="#b5644e"/><path d="M55.6 59.5L64.4 59.5Q63 64.5 60 66Q57 64.5 55.6 59.5Z" fill="#dc9e8c"/>';
  else if(p==='little')s+='<path d="M55.5 54Q60 51 64.5 54Q62.5 62 60 63.5Q57.5 62 55.5 54Z" fill="#2a2c32"/>';
  else{   // banded penguins: stout black bill (pink bare skin at the base for Humboldt / Magellanic / Galápagos)
    if(p!=='african')s+='<path d="M50.5 53Q60 47 69.5 53Q66 59 60 59.5Q54 59 50.5 53Z" fill="#f0a2a8"/>';
    s+='<path d="M53 55Q60 51 67 55Q64 65 60 67Q56 65 53 55Z" fill="#16171b"/>';
    if(p==='african')s+='<path d="M55.4 60.4L64.6 60.4L63.8 62.6L56.2 62.6Z" fill="#aeb6be"/>';
    if(p==='galapagos')s+='<path d="M55.2 59.5L64.8 59.5Q63 65 60 66.5Q57 65 55.2 59.5Z" fill="#e6c08e"/>';
  }
  s+='<ellipse cx="42" cy="57" rx="4" ry="2.6" fill="rgba(255,120,150,.55)"/><ellipse cx="78" cy="57" rx="4" ry="2.6" fill="rgba(255,120,150,.55)"/>';
  return s+'</g></svg>';
}

/* ---------- one-time news for players who already have a save ---------- */
function news18Html(){
  let h='<div class="nw-pop"><h3>'+fmtL('🐧 새 펭귄 {n}종 합류!',{n:NEW18.length})+'</h3><p>'+'모두 실제로 있는 펭귄이에요. 종마다 능력치, 성격, 특수 기술이 달라요.'+'</p>';
  h+='<div class="nw-cards">'+NEW18.map(k=>'<button class="nw-c" data-nw="'+k+'" style="--cw:62px" aria-label="'+escH(TYPES[k].name)+'">'+cardHtml(k,{lv:0,g:0})+'</button>').join('')+'</div>';
  h+='<p class="nw-how">'+'스카우트 뽑기, 이적 시장, 팀 편성의 펭귄 해금에서 얻을 수 있어요.'+'</p><div class="row cf-btns"><button class="btn" data-nw="ok">'+'확인'+'</button><button class="btn primary" data-nw="dex">'+'🔍 도감 보기'+'</button></div></div>';
  return h;
}
function news18Popup(){
  if(save.news18||G.view==='game'||G.ui!=='sMenu'||window.__NOFX)return false;
  const d=$('#cardDlg');if(!d||d.classList.contains('on'))return false;
  for(const id of['#tutAsk','#devFx','#cfmDlg','#enhFx']){const e=$(id);if(e&&e.classList.contains('on'))return false;}
  const h=news18Html();
  save.news18=true;persist();                                     // shown once, even if the page closes now
  d.querySelector('.cd-body').innerHTML=h;
  d.onclick=e=>{const b=e.target.closest('[data-nw]');
    if(b){SFX.ui();const v=b.dataset.nw;d.classList.remove('on');d.onclick=null;if(v==='dex'){scTab='dex';goScreen('sScout');renderScout();}else if(v!=='ok')openCard(v);}
    else if(e.target===d||e.target.classList.contains('cd-x')){d.classList.remove('on');d.onclick=null;}};
  d.classList.add('on');return true;
}
function news18Soon(n){clearTimeout(news18Soon.t);if(save.news18)return;n=n|0;news18Soon.t=setTimeout(()=>{let ok=false;try{ok=news18Popup();}catch(e){}if(!ok&&!save.news18&&n<8)news18Soon(n+1);},n?3000:1700);}

// card name that fits: full-width letters (Hangul/kana/CJK) count 1, Latin ~0.58; past 7.2 the font shrinks in proportion
function nmTag18(n){let w=0;for(const ch of n)w+=ch.codePointAt(0)>0x2e80?1:.58;
  return '<div class="pc-name"'+(w>7.2?' style="font-size:'+(1.04*7.2/w).toFixed(3)+'em"':'')+'>'+n+'</div>';}
