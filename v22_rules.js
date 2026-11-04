/* ================= v22: hockey rules + referee ================= */
// 반칙(트리핑 · 방해 · 골키퍼 방해) → 퇴장과 파워플레이, 브레이크어웨이에서 뒤에서 넘어뜨리면 페널티 샷,
// 오프사이드(지연 오프사이드 포함), 아이싱, 페이스오프, 그리고 줄무늬 셔츠의 심판 펭귄.
// Every number shown on screen comes from RULE / penSecs(); the same values decide the calls.
const RULE={
  bl:8,              // blue lines at x=±8 (painted .62 wide)
  blEdge:8.31,       // the outer edge of a blue line (zone side)
  blIn:8.31+PUCKR,   // the puck is inside a zone once it has completely crossed the outer edge
  blP:8.31+.3,       // a skater is inside once both skates are past the outer edge
  gl:W-2.4,          // goal lines (the thin red lines near each end)
  dotN:6.2,dotE:13,dotZ:6,   // neutral-zone and end-zone faceoff spots
  delayMax:10,       // a delayed penalty is whistled after this many seconds at the latest
  stopT:2.7,         // whistle → call shown → faceoff
  foT:1.5,           // faceoff countdown
  hasPuck:.8,        // a skater still counts as playing the puck this long after touching it…
  near:.9,           // …or while the puck is this close (beyond touching distance)
  crease:3.6,        // goal crease radius
  psT:7              // a penalty shot must be taken within this many seconds
};
const RULE_K={
  trip:{ico:'🦵',n:'트리핑',why:'퍽보다 선수를 먼저 넘어뜨렸어요 (슬라이드 태클은 퍽을 먼저 건드려야 해요)'},
  inter:{ico:'🙅',n:'방해 반칙',why:'퍽을 갖지 않은 선수에게 돌진해서 넘어뜨렸어요'},
  gi:{ico:'🥅',n:'골키퍼 방해',why:'골 크리스 안의 골키퍼에게 돌진했어요'},
  off:{ico:'🚩',n:'오프사이드',why:'퍽보다 먼저 블루라인을 넘어 공격 지역에 들어갔어요'},
  ice:{ico:'🧊',n:'아이싱',why:'센터 라인 뒤에서 친 퍽이 아무도 건드리지 않고 상대 골라인을 넘었어요'}
};
const RULE_MODES=['quick','ranked','tour','trial'];
function rulesMode(){
  const c=G.cfg;if(!c||c.tutorial||c.demo||!RULE_MODES.includes(c.mode))return 'off';
  const m=save.set.rules;return m==='fouls'||m==='off'?m:'full';
}
function rulesOn(full){const m=rulesMode();return m!=='off'&&(!full||m==='full');}
function rulesActive(){return !!(G.rl&&G.view==='game'&&G.state==='play'&&!G.so&&!G.ps&&rulesOn(false));}
function penFor(t){return clamp(Math.round((t||180)/9/5)*5,15,30);}   // 2 real minutes, scaled to the match length
function penSecs(){return penFor(G.cfg&&G.cfg.time);}
function boxMax(tm){const n=tm.skaters.length;return n>=2?1:0;}          // 1 vs 1: nobody can sit out → penalty shot instead
function onIce(tm){let n=0;for(const p of tm.skaters)if(!p.boxed)n++;return n;}
function shortH(tm){return onIce(tm)<onIce(tm.opp);}
function tmName(tm){return tm.key==='blue'?'블루':'레드';}
function pkName(p){return p&&p.ty?p.ty.name.replace(' 펭귄',''):'';}
function rulesReset(){
  G.rl={log:[],box:[],delayed:null,off:null,ice:null,src:null,lastT:-9,stop:null,inZ:{blue:false,red:false},tag:null,thaw:false,warn:0,calls:[],
    st:{blue:{pen:0,pp:0,ppg:0,shg:0,ps:0,psg:0},red:{pen:0,pp:0,ppg:0,shg:0,ps:0,psg:0}}};
  G.ps=null;rulesHud(true);refSig(null);
  const l=$('#late');if(l&&l.textContent)l.textContent='';   // the previous match's last-seconds digit must not linger (it sat off-screen on landscape phones)
}
function rulesZoneSync(){const R=G.rl;if(!R)return;const pk=G.puck;for(const k of['blue','red'])R.inZ[k]=pk.x*G.teams[k].dir>RULE.blIn;R.off=null;R.ice=null;R.src=null;R.lastT=pk.lastT;}

/* ---------- penalty box (behind the far boards, next to the benches) ---------- */
function boxSpot(tm,i){return{x:(tm.key==='blue'?-1:1)*(11.6+i*1.1),z:-(D+1.45)};}
function boxPlace(p){
  const R=G.rl,mine=R?R.box.filter(e=>e.team===p.team):[],i=Math.max(0,mine.findIndex(e=>e.p===p)),s=boxSpot(p.team,i);
  p.x=p.ox=p.rx=p.px=s.x;p.z=p.oz=p.rz=p.pz=s.z;p.vx=p.vz=0;p.ix=p.iz=0;p.heading=0;p.fall=0;p.getup=0;p.charging=false;p.charge=0;
  p.dashT=p.slideT=p.ramT=p.hopT=0;p.dashSpec=false;p.pose='sad';if(p.ai){p.ai.plan=null;p.ai.slot=null;}
}
function boxSend(p,secs){
  const R=G.rl;if(G.carry===p)carryRelease(.3);
  p.boxed=true;p.frozen=true;R.box.push({p,team:p.team,t:secs,full:secs});boxPlace(p);
  if(p===G.player){const o=p.team.skaters.filter(q=>!q.boxed);setHuman(o[0]||null);}
}
function boxRelease(e,why){
  const R=G.rl,p=e.p;R.box.splice(R.box.indexOf(e),1);p.boxed=false;p.frozen=false;
  const s=boxSpot(p.team,0),x=clamp(s.x,-W+3,W-3),z=-(D-1.4);
  p.x=p.ox=p.rx=p.px=x;p.z=p.oz=p.rz=p.pz=z;p.vx=0;p.vz=2;p.heading=0;p.pose='play';
  for(const q of R.box)if(q.team===p.team)boxPlace(q.p);
  if(G.state==='play'&&G.view==='game'){popAt(why==='ppg'?'파워플레이 골 · 복귀':'퇴장 끝 · 복귀!',x,2.4,z);if(p.team===G.mine)SFX.ui();}
}
function rulesClearBox(){const R=G.rl;if(!R)return;for(const e of R.box.slice())boxRelease(e,'end');R.delayed=null;R.off=null;R.ice=null;}

/* ---------- fouls ---------- */
function playing(v){const pk=G.puck;return G.carry===v||(pk.last===v&&G.t-pk.lastT<RULE.hasPuck)||Math.hypot(pk.x-v.x,pk.z-v.z)<v.r+PUCKR+RULE.near;}
function foulKind(h,v){
  if(!h||!v||h.team===v.team||h.goalie||v.goalie)return null;
  if(h.slideT>0){const pk=G.puck;return h._sl&&pk.last===h&&pk.lastT>=h._sl-.02?null:'trip';}   // a slide tackle is clean only if it reached the puck first
  if(h.dashT>0||h.ramT>0)return playing(v)?null:'inter';                                         // body checks are for the puck carrier
  return null;                                                                                     // ordinary contact is never called
}
function breakaway(v,h){   // fouled from behind with only the goalie to beat → penalty shot
  const d=v.team.dir,vx=v.x*d;if(vx<0||!playing(v)||h.x*d>vx+.4)return false;
  for(const o of v.team.opp.skaters){if(o===h||o.boxed||o.frozen||o.fall>0)continue;if(o.x*d>vx-.5)return false;}
  return true;
}
function rulesFoul(h,v,kind){
  if(!rulesActive())return;const R=G.rl;if(R.delayed||R.stop)return;
  const k=kind||foulKind(h,v);if(!k)return;
  const c={k,off:h.team,by:h,vic:v,ps:k==='trip'&&breakaway(v,h),t:G.t,x:v.x,z:v.z};
  if(R.log.length<40)R.log.push({k,ht:h.type,mv:h.slideT>0?'slide':h.ramT>0?'ram':h.dashSpec?'skill':h.dashT>0?'dash':'-',hum:h.human?1:0,vp:G.carry===v?1:0,dp:+Math.hypot(G.puck.x-v.x,G.puck.z-v.z).toFixed(1)});
  R.st[h.team.key].pen++;
  if(G.carry&&G.carry.team===h.team){stopPlay('pen',c);return;}
  R.delayed=c;refSig('up');popAt('반칙! 🖐',v.x,2.6,v.z);   // delayed penalty: play on until the offending team touches the puck
}
function rulesContact(A,B,imp){   // goaltender interference: charging into a goalie inside the crease
  if(imp<5||!rulesActive())return;let g=null,s=null;
  if(A.goalie&&!B.goalie){g=A;s=B;}else if(B.goalie&&!A.goalie){g=B;s=A;}
  if(!g||s.team===g.team||!(s.dashT>0||s.slideT>0||s.ramT>0)||playing(s))return;
  if(Math.hypot(g.x+g.team.dir*W,g.z)>RULE.crease)return;
  rulesFoul(s,g,'gi');
}

/* ---------- whistle → call → restart ---------- */
function penResult(c){
  const off=c.off;if(c.ps)return 'ps';
  if(boxMax(off)<=0)return 'ps1';
  return G.rl.box.filter(e=>e.team===off).length>=boxMax(off)?'stack':'box';
}
function stopPlay(kind,d){
  const R=G.rl;R.delayed=null;R.off=null;R.ice=null;
  if(kind==='pen')d.res=penResult(d);
  G.state='stop';G.stateT=RULE.stopT;R.stop={kind,d,t:G.t};R.calls.push(kind==='pen'?d.k+(d.res==='ps'||d.res==='ps1'?'+ps':''):kind==='off'&&G.t-d.t<.05?'off!':kind);
  if(G.carry)carryRelease(.3);G.pass=null;
  SFX.whistle();if(kind==='pen')setTimeout(()=>{if(G.state==='stop')SFX.whistle();},220);
  refSig(kind==='pen'?(d.res==='ps'||d.res==='ps1'?'xhead':d.k==='trip'?'trip':'cross'):kind==='ice'?'cross':'up');
  rulesCall(kind,d);
}
function rulesResume(){
  const R=G.rl,st=R&&R.stop;if(R)R.stop=null;rulesCallHide();
  if(!st){G.state='play';return;}
  const d=st.d,sz=v=>(v>=0?1:-1)*RULE.dotZ;
  if(st.kind==='pen'){
    const off=d.off,vt=off.opp;
    if(d.res==='ps'||d.res==='ps1'){R.st[vt.key].ps++;psStart(vt,d.vic&&!d.vic.goalie?d.vic:(vt.skaters.find(p=>!p.boxed)||vt.skaters[0]),d.z);return;}   // goalie interference in 1 vs 1: a skater shoots
    if(d.res==='stack'){const e=R.box.filter(q=>q.team===off).sort((a,b)=>b.t-a.t)[0];if(e){e.t+=penSecs();e.full+=penSecs();}}
    else boxSend(d.by,penSecs());
    R.st[vt.key].pp++;
    foSetup(-off.dir*RULE.dotE,sz(d.z));
  }else if(st.kind==='off')foSetup(d.team.dir*RULE.dotN,sz(d.z));
  else if(st.kind==='ice')foSetup(-d.team.dir*RULE.dotE,sz(d.z));
  else if(st.kind==='psEnd')psEnd(false);
  else G.state='play';
}
function foPlace(p,x,z,h){p.x=p.ox=p.rx=p.px=x;p.z=p.oz=p.rz=p.pz=z;p.vx=p.vz=0;p.ix=p.iz=0;p.heading=h;p.fall=0;p.getup=0;if(p.ai){p.ai.plan=null;p.ai.slot=null;}}
function foSetup(fx,fz){
  resetPositions();
  fx=clamp(fx,-W+3,W-3);fz=clamp(fz,-D+2,D-2);
  const pk=G.puck;pk.x=pk.ox=pk.rx=fx;pk.z=pk.oz=pk.rz=fz;pk.vx=pk.vz=0;
  for(const k of['blue','red']){
    const tm=G.teams[k],d=tm.dir,sk=tm.skaters.filter(p=>!p.boxed&&!p.frozen);if(!sk.length)continue;
    let c=tm===G.mine&&G.player&&sk.includes(G.player)?G.player:null;
    if(!c)c=sk.reduce((a,b)=>Math.hypot(b.hx-fx,b.hz-fz)<Math.hypot(a.hx-fx,a.hz-fz)?b:a);
    const face=d>0?Math.PI/2:-Math.PI/2;foPlace(c,fx-d*1.15,fz,face);
    const slots=[[2.8,3.4],[2.8,-3.4],[7,0]];
    sk.filter(p=>p!==c).forEach((p,i)=>{const o=slots[i%3];foPlace(p,clamp(fx-d*o[0],-W+2.6,W-2.6),clamp(fz+o[1],-D+1.6,D-1.6),face);});
    if(tm===G.mine)setHuman(c);
  }
  rulesZoneSync();
  G.state='ready';G.stateT=RULE.foT;G.countN=3;showBanner('페이스오프',900,'');
  const r=G.ref;if(r){r.fo={x:fx,z:fz};refSig('drop');}
}

/* ---------- penalty shot (uses the shootout rules: one attempt, RULE.psT seconds) ---------- */
function psStart(tm,shooter,z){
  const pk=G.puck;G.ps={tm,s:shooter,t:0,phase:'play',z:z||0};
  for(const p of G.pengs){if(p.goalie||p.boxed)continue;p.frozen=true;p.x=p.ox=p.rx=0;p.z=p.oz=p.rz=-D-6;p.vx=p.vz=0;p.charging=false;p.charge=0;p.dashT=p.slideT=p.ramT=0;p.dashSpec=false;}
  const s=shooter;s.frozen=false;foPlace(s,-tm.dir*3,0,tm.dir>0?Math.PI/2:-Math.PI/2);s.slow=0;s.cd.shoot=s.cd.pass=0;s.pose='play';
  for(const g of[tm.goalie,tm.opp.goalie])if(g){g.x=g.ox=g.hx;g.z=g.oz=0;g.vx=g.vz=0;g.ai.zs=0;g.ai.seenT=0;g.diveT=0;g.dazT=0;}
  pk.x=pk.ox=s.x+tm.dir*1.1;pk.z=pk.oz=0;pk.vx=pk.vz=0;pk.shot=null;pk.last=s;pk.lastTeam=tm;pk.lastT=G.t;G.pass=null;G.pending=null;G.carry=null;
  setHuman(tm===G.mine?s:null);
  G.state='ready';G.stateT=1.8;G.countN=3;
  showBanner(tm===G.mine?fmtL('페널티 샷! {t}초 안에 슛',{t:RULE.psT}):'상대 페널티 샷 · 골키퍼를 믿어요',1500,tm===G.mine?'g':'r');
  refSig('xhead');
}
function psFrame(dt){
  const ps=G.ps;if(!ps||ps.phase!=='play'||G.state!=='play'||G.view!=='game')return;
  ps.t+=dt;const pk=G.puck,sp=Math.hypot(pk.vx,pk.vz),def=ps.tm.opp;
  const shotDone=pk.shot&&G.t-pk.shot.t>.35&&sp<2,saved=pk.last&&pk.last.goalie&&pk.last.team===def,wide=Math.abs(pk.x)>W-.2&&Math.abs(pk.z)>=GW-.05;
  if(ps.t>RULE.psT||shotDone||saved||wide){
    const mine=ps.tm===G.mine;ps.phase='done';SFX.save();hypeBanner(mine?'막혔다!':'SAVE!',[],mine?0:2,mine?def.key:G.mine?G.mine.key:'');
    setHuman(null);G.state='stop';G.stateT=1.6;G.rl.stop={kind:'psEnd',d:ps,t:G.t};
  }
}
function psEnd(goal){
  const ps=G.ps;if(!ps)return;G.ps=null;
  if(goal)G.rl.thaw=true;                         // keep the others off the ice until the goal celebration ends
  else for(const p of G.pengs)if(!p.boxed)p.frozen=false;
  if(G.mine&&(!G.player||G.player.boxed||G.player.frozen&&!goal)){const o=G.mine.skaters.filter(p=>!p.boxed);setHuman(o[0]||null);}
  if(goal&&G.mine&&!G.player){const o=G.mine.skaters.filter(p=>!p.boxed);setHuman(o[0]||null);}
  if(!goal)foSetup(ps.tm.dir*RULE.dotE,(ps.z>=0?1:-1)*RULE.dotZ);
}

/* ---------- goals: penalty-shot goals, power plays, disallowed goals ---------- */
function rulesScored(tm){   // true = the goal does not count
  const R=G.rl;if(!R)return false;R.tag=null;
  if(G.ps){if(G.ps.phase!=='play'||tm!==G.ps.tm){pk_reset();return true;}psEnd(true);R.tag='ps';R.st[tm.key].psg++;}
  const c=R.delayed;
  if(c&&c.off===tm&&c.k==='gi'){c.noGoal=true;stopPlay('pen',c);return true;}   // no goal: the goalie was run over
  if(c&&c.off!==tm){R.delayed=null;refSig(null);R.tag=R.tag||'dly';}             // scored on the delayed penalty: the minor is wiped out
  else if(c)R.delayed=null;
  R.off=null;R.ice=null;
  if(!R.tag||R.tag==='dly'){const a=onIce(tm),b=onIce(tm.opp);
    if(a>b){const e=R.box.filter(q=>q.team===tm.opp).sort((x,y)=>x.t-y.t)[0];if(e)boxRelease(e,'ppg');R.st[tm.key].ppg++;R.tag='pp';}
    else if(a<b){R.st[tm.key].shg++;R.tag='sh';}}
  refSig('point',tm);
  return false;
}
function rulesTags(tm,tags){const t=G.rl&&G.rl.tag;if(t==='pp')tags.push('POWER PLAY GOAL!');else if(t==='sh')tags.push('SHORTHANDED GOAL!');else if(t==='ps')tags.push('PENALTY SHOT GOAL!');}
function rulesEnd(){const R=G.rl;if(!R)return;if(G.ps){G.ps=null;}R.thaw=false;for(const p of G.pengs)if(!p.boxed)p.frozen=false;rulesClearBox();R.stop=null;rulesCallHide();refSig(null);}

/* ---------- per physics step: offside, icing, delayed calls, box clocks ---------- */
function rulesSim(h){
  const R=G.rl;if(!R||!rulesActive())return;
  const pk=G.puck;
  for(const p of G.pengs){if(p.slideT>0){if(!p._sl)p._sl=G.t;}else p._sl=0;}
  if(pk.lastT!==R.lastT){R.lastT=pk.lastT;R.src=pk.last?{team:pk.lastTeam,p:pk.last,x:pk.x,z:pk.z,t:pk.lastT}:null;}
  else if(G.carry&&R.src&&R.src.p===G.carry){R.src.x=pk.x;R.src.z=pk.z;}   // icing counts from where a carried puck was last on the stick
  for(const e of R.box.slice()){e.t-=h;if(e.t<=0)boxRelease(e,'time');}
  if(R.delayed){const c=R.delayed;if((pk.lastT>c.t&&pk.lastTeam===c.off)||(G.carry&&G.carry.team===c.off)||G.t-c.t>RULE.delayMax){stopPlay('pen',c);return;}}
  if(!rulesOn(true))return;
  // --- offside: the puck must enter the attacking zone before (or with) the attackers ---
  for(const k of['blue','red']){
    const T=G.teams[k],d=T.dir,inZ=pk.x*d>RULE.blIn,was=R.inZ[k];R.inZ[k]=inZ;
    if(!inZ||was||R.off||pk.lastTeam!==T)continue;
    const offs=T.skaters.filter(p=>!p.boxed&&!p.frozen&&p!==G.carry&&p.x*d>RULE.blP);
    if(!offs.length)continue;
    const info={team:T,offs,z:pk.z,t:G.t};
    if(G.carry&&G.carry.team===T){stopPlay('off',info);return;}   // carried in with a teammate already inside: whistle now
    R.off=info;refSig('up');                                        // shot / passed in: delayed offside until they tag up
  }
  if(R.off){
    const T=R.off.team,d=T.dir;
    if(pk.x*d<RULE.blEdge-PUCKR){R.off=null;refSig('wash');}
    else if(T.skaters.every(p=>p.boxed||p.frozen||p.x*d<=RULE.blP)){R.off=null;refSig('wash');popAt('태그업 · 오프사이드 해제',RULE.bl*d,2.2,0);}
    else if(pk.lastT>R.off.t&&pk.lastTeam===T){stopPlay('off',R.off);return;}
  }
  // --- icing: shot from behind the centre line, untouched past the far goal line ---
  const S=R.src;
  if(!R.ice&&S&&S.t===pk.lastT&&!S.p.goalie){
    const T=S.team,d=T.dir;
    if(S.x*d<0&&pk.x*d>RULE.gl&&!shortH(T)){R.ice={team:T,z:S.z,t:G.t,srcT:S.t};refSig('up');}
  }
  if(R.ice){
    const I=R.ice,T=I.team,d=T.dir;
    if(pk.lastT!==I.srcT){
      if(pk.last&&(pk.last.team===T||pk.last.goalie)){R.ice=null;refSig('wash');}   // an attacker got there first / the goalie played it
      else{stopPlay('ice',I);return;}
    }else if(pk.vx*d<=0||Math.hypot(pk.vx,pk.vz)<2.5){
      if(Math.abs(pk.z)<GW-.05){if(pk.x*d<W-.3){R.ice=null;refSig(null);}}   // between the posts: it is a shot on the net (a goal, or it never crossed the line)
      else{stopPlay('ice',I);return;}}
  }
}

/* ---------- AI: stay onside, tag up, no icing at even strength, cleaner tackles ---------- */
function rulesAI(p){
  if(!rulesActive()||!rulesOn(true)||p.goalie)return;
  const R=G.rl,tm=p.team,d=tm.dir,pk=G.puck,ai=p.ai;if(G.carry===p)return;
  const flagged=R.off&&R.off.team===tm;
  if(flagged&&p.x*d>RULE.blP-.4){ai.tx=d*(RULE.bl-1.2);ai.full=true;return;}           // tag up
  if(pk.x*d<=RULE.blIn&&!(G.pass&&G.pass.to===p)){   // wait at the blue line for the puck (brake early: momentum must not carry them over)
    const ahead=(p.x+p.vx*.45)*d;if(ai.tx*d>RULE.bl-1.2||ahead>RULE.bl-.6){ai.tx=d*(ahead>RULE.bl-.6?RULE.bl-2.5:RULE.bl-1.2);ai.full=false;}}
}
function rulesMateOk(m){   // passing to a teammate who is already inside the zone ahead of the puck would be offside
  if(!rulesActive()||!rulesOn(true))return true;const d=m.team.dir;return !(G.puck.x*d<=RULE.blIn&&m.x*d>RULE.blP);
}
function rulesIcingRisk(p){return rulesActive()&&rulesOn(true)&&!shortH(p.team)&&G.puck.x*p.team.dir<0;}
function rulesPathClear(p,dx,dz){   // AI only: no dash / charge / slide through a player who is not playing the puck, or into the goalie's crease
  if(!p||p.human||!rulesActive())return true;
  if(dx===undefined){const m=Math.hypot(p.ix,p.iz);if(m>.2){dx=p.ix/m;dz=p.iz/m;}else{dx=Math.sin(p.heading);dz=Math.cos(p.heading);}}
  for(const o of p.team.opp.skaters){if(o.frozen||o.fall>0||o===G.carry||playing(o))continue;const rx=o.x-p.x,rz=o.z-p.z,al=rx*dx+rz*dz;if(al<-.5||al>10)continue;if(Math.abs(rx*dz-rz*dx)<2.4)return false;}
  const g=p.team.opp.goalie;if(g){const rx=g.x-p.x,rz=g.z-p.z,al=rx*dx+rz*dz;if(al>0&&al<9&&Math.abs(rx*dz-rz*dx)<1.9&&Math.hypot(g.x+g.team.dir*W,g.z)<RULE.crease+.5)return false;}
  return true;
}
function rulesSlideOk(p){
  if(!rulesActive())return true;
  const pk=G.puck,dx=pk.x-p.x,dz=pk.z-p.z,dd=Math.hypot(dx,dz)||1,fx=Math.sin(p.heading),fz=Math.cos(p.heading);
  if(dd<5.5&&(dx*fx+dz*fz)/dd>.9){                                                // lined up with the puck, and no body between the slider and the puck
    const ap=dx*fx+dz*fz;let clear=true;
    for(const o of p.team.opp.skaters){if(o.frozen||o.fall>0)continue;const rx=o.x-p.x,rz=o.z-p.z,ao=rx*fx+rz*fz,lo=Math.abs(rx*fz-rz*fx);if(ao>0&&ao<ap+.2&&lo<o.r+p.r+.1){clear=false;break;}}
    if(clear)return true;}
  return Math.random()<({easy:.1,normal:.05,hard:.03}[G.cfg&&G.cfg.diff]||.05);  // sometimes the AI dives in anyway (and may be called)
}

/* ---------- referee penguin ---------- */
function refBuild(){
  const pg=buildPenguin('basic','blue','none',{num:0});
  const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');
  for(let i=0;i<16;i++){x.fillStyle=i%2?'#14161a':'#f4f6f8';x.fillRect(i*16,0,16,64);}
  const tx=new T.CanvasTexture(c);tx.wrapS=tx.wrapT=T.RepeatWrapping;
  const jer=pg.torso.children[1];if(jer)jer.material=new T.MeshStandardMaterial({map:tx,roughness:.75});
  const sc=pg.inner.children[1];if(sc&&sc.isMesh)sc.visible=false;   // the team scarf
  pg.scarfTail.visible=false;pg.stick.visible=false;
  const dark=new T.MeshStandardMaterial({color:0x15171b,roughness:.6}),orange=new T.MeshStandardMaterial({color:0xff7a1a,roughness:.5,emissive:0x331400});
  for(const f of[pg.flipL,pg.flipR]){const m=f.children[0];if(m)m.material=dark;const band=new T.Mesh(new T.CylinderGeometry(.13,.13,.12,14,1,true),orange);band.position.set(0,-.16,0);band.scale.set(1,1,.55);f.add(band);}
  const helm=pkHat('helmet',0x16181c,false);pg.headAbs.remove(pg.hat);pg.headAbs.add(helm);pg.hat=helm;
  const wh=new T.Mesh(new T.CylinderGeometry(.035,.035,.14,10),new T.MeshStandardMaterial({color:0xd8dde3,metalness:.8,roughness:.25}));wh.rotation.x=Math.PI/2;wh.position.copy(pkHeadPt(.12,1.3,.09));pg.headAbs.add(wh);
  pg.root.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  scene.add(pg.root);pg.root.visible=false;
  return{pg,x:0,z:-(D-1.4),h:0,v:0,sig:null,sigT:0,tm:null,fo:null,ph:0,ry:0,fl:[0,-.28,0,.28]};
}
function refSig(k,tm){const r=G.ref;if(!r)return;r.sig=k;r.sigT=0;r.tm=tm||null;}
function refFrame(dt){
  const show=G.view==='game'&&rulesOn(false);
  if(!show){if(G.ref)G.ref.pg.root.visible=false;return;}
  if(!G.ref){try{G.ref=refBuild();}catch(e){dbgErr('ref',e);G.ref={pg:{root:new T.Group()},dead:true};return;}}
  const r=G.ref;if(r.dead)return;r.pg.root.visible=true;r.sigT+=dt;
  const pk=G.puck,R=G.rl||{};let tx,tz,face=null;
  if(G.state==='stop'&&R.stop&&R.stop.d){const d=R.stop.d;tx=clamp((d.x!==undefined?d.x:pk.x)+3,-W+4,W-4);tz=-(D-2.6);face=0;}
  else if(G.state==='ready'&&r.fo){tx=r.fo.x+.4;tz=r.fo.z-1.7;face=0;}
  else{r.fo=null;const off=pk.z<-6?7:5;r.side=pk.rx<-2.5?1:pk.rx>2.5?-1:(r.side||1);tx=clamp(pk.rx+r.side*off,-W+4,W-4);tz=-(D-1.4);}   // switch sides only once the puck is clearly over
  if(r.sig==='drop'&&G.state==='play'&&r.sigT>.4)r.sig=null;
  if((r.sig==='wash'||r.sig==='point')&&r.sigT>1.8)r.sig=null;
  if(r.sig==='up'&&!(R.delayed||R.off||R.ice))r.sig=null;
  if((r.sig==='trip'||r.sig==='cross'||r.sig==='xhead')&&G.state==='play'&&!G.ps)r.sig=null;
  const dx=tx-r.x,dz=tz-r.z,dd=Math.hypot(dx,dz),vmax=G.state==='play'?8:11,v=Math.min(vmax,dd*2.2);
  if(dd>.05){r.x+=dx/dd*v*dt;r.z+=dz/dd*v*dt;}
  r.v+=(v-r.v)*Math.min(1,dt*5);
  // a referee skates sideways / backward watching the play; only a long sprint turns him toward the run (with hysteresis)
  if(dd>4&&v>5)r.run=Math.min(1,(r.run||0)+dt*3);else if(dd<2||v<3)r.run=Math.max(0,(r.run||0)-dt*3);
  const toPk=Math.atan2(pk.rx-r.x,pk.rz-r.z);
  const want=face!==null?face:((r.run||0)>.5?Math.atan2(dx,dz):toPk);
  {const d=angDiff(r.h,want)*Math.min(1,dt*5),mx=dt*6.5;r.h+=clamp(d,-mx,mx);}   // angDiff(from,to); at most ~370°/s, eased
  const P=r.pg,sf=clamp(r.v/6,0,1);r.ph+=dt*(4+r.v*1.4);
  P.root.position.set(r.x,0,r.z);P.root.rotation.y=r.h;
  P.piv.rotation.x=.18*sf;P.piv.rotation.z=Math.sin(r.ph)*.1*sf;
  P.footL.rotation.x=Math.sin(r.ph)*.6*sf;P.footR.rotation.x=-Math.sin(r.ph)*.6*sf;
  if(P.head){const ya=clamp(angDiff(r.h,toPk)*.6,-.7,.7);P.head.rotation.set(-.05,face!==null?0:ya,0,'YXZ');}
  // signals (NHL style): arm up = delayed call, slap the leg = tripping, crossed arms = interference / icing,
  // crossed above the head = penalty shot, sweeping arms = wash-out, point = goal, low arm = faceoff drop
  const t=G.t,s=r.sig;let lx=Math.sin(r.ph+Math.PI)*.35*sf,lz=-.28,rx=Math.sin(r.ph)*.35*sf,rz=.28;
  if(s==='up'){rz=2.95;rx=0;}
  else if(s==='trip'){rx=-.35+Math.sin(t*9)*.45;rz=.05;lz=-.35;}
  else if(s==='cross'){lx=-1.35;lz=.75;rx=-1.35;rz=-.75;}
  else if(s==='xhead'){lx=-.35;lz=-2.55;rx=-.35;rz=2.55;}
  else if(s==='wash'){const w=Math.sin(t*10)*.5;lz=-1.5;rz=1.5;lx=w;rx=w;}
  else if(s==='point'){rx=-1.45;rz=.35;}
  else if(s==='drop'){rx=-1.05;rz=.12;}
  const k=Math.min(1,dt*10),F=r.fl;F[0]+=(lx-F[0])*k;F[1]+=(lz-F[1])*k;F[2]+=(rx-F[2])*k;F[3]+=(rz-F[3])*k;
  P.flipL.rotation.set(F[0],0,F[1]);P.flipR.rotation.set(F[2],0,F[3]);
  if(P.jaw)P.jaw.rotation.x=(G.state==='stop'&&r.sigT<.6)||s==='point'&&r.sigT<.5?.12:0;
}

/* ---------- HUD: call card, power-play / box clocks, delayed calls ---------- */
function rulesCall(kind,d){
  const el=$('#rlCall');if(!el)return;
  let ico,title,line,why,cls='';
  if(kind==='pen'){
    const K=RULE_K[d.k],off=d.off,vt=off.opp;ico=K.ico;title=K.n;why=K.why;cls=off.key;
    const who=tmName(off)+' '+pkName(d.by);
    if(d.noGoal)line=fmtL('{w} · 골은 무효 (노골)',{w:who})+' · ';else line=who+' · ';
    if(d.res==='ps')line+=fmtL('브레이크어웨이에서 반칙 → {t} 페널티 샷',{t:tmName(vt)});
    else if(d.res==='ps1')line+=fmtL('1 대 1이라 퇴장 대신 {t} 페널티 샷',{t:tmName(vt)});
    else if(d.res==='stack')line+=fmtL('이미 퇴장 중이라 퇴장 시간 +{s}초 → {t} 파워플레이',{s:penSecs(),t:tmName(vt)});
    else line+=fmtL('{s}초 퇴장 → {t} 파워플레이',{s:penSecs(),t:tmName(vt)});
  }else if(kind==='off'){const K=RULE_K.off;ico=K.ico;title=K.n;why=K.why;cls=d.team.key;line=fmtL('{t} · 중립 지역에서 페이스오프',{t:tmName(d.team)});}
  else if(kind==='ice'){const K=RULE_K.ice;ico=K.ico;title=K.n;why=K.why;cls=d.team.key;line=fmtL('{t} · 자기 진영에서 페이스오프',{t:tmName(d.team)});}
  else if(kind==='intro'){ico='🧑‍⚖️';title='심판 입장!';cls='';line='반칙 · 오프사이드 · 아이싱을 심판이 직접 불어요';why=d;}
  el.className='on '+cls;
  el.innerHTML='<i class="rc-i">'+ico+'</i><div class="rc-t"><b>'+title+'</b><span>'+line+'</span><small>'+why+'</small></div>';
  clearTimeout(rulesCall.t);rulesCall.t=setTimeout(rulesCallHide,kind==='intro'?5200:9000);   // a call is hidden when play resumes (rulesResume); the timer is only a fallback
}
function rulesCallHide(){const el=$('#rlCall');if(el&&el.className)el.className='';}
function rulesIntro(){
  if(!G.rl||!rulesOn(false)||save.rl.intro)return;save.rl.intro=1;persist();
  const m=rulesMode();
  rulesCall('intro',m==='full'?fmtL('반칙하면 {s}초 퇴장 · 설정 → 하키 규칙에서 바꿀 수 있어요',{s:penSecs()}):fmtL('지금은 반칙만 불어요 · 반칙하면 {s}초 퇴장',{s:penSecs()}));
}
let rulesHudKey='';
function rulesHud(force){
  const el=$('#rlHud');if(!el)return;const R=G.rl;
  if(!R||G.view!=='game'||!rulesOn(false)||G.state==='over'){if(rulesHudKey!==''||force){rulesHudKey='';el.innerHTML='';el.className='';}return;}
  const rows=[],fm=v=>{v=Math.max(0,Math.ceil(v));return '0:'+(v<10?'0':'')+v;};
  if(G.ps)rows.push(['ps '+G.ps.tm.key,fmtL('🎯 {t} 페널티 샷',{t:tmName(G.ps.tm)})]);
  for(const k of['blue','red']){const tm=G.teams[k];if(!tm)continue;
    const es=R.box.filter(e=>e.team===tm);if(!es.length)continue;
    const a=onIce(tm.opp),b=onIce(tm);rows.push([tm.opp.key,a>b?fmtL('⚡ {t} 파워플레이 {a} 대 {b}',{t:tmName(tm.opp),a,b}):fmtL('{a} 대 {b}',{a,b})]);
    for(const e of es)rows.push([k+' bx','⏱ '+tmName(tm)+' '+pkName(e.p)+' '+fm(e.t)]);}
  if(R.delayed)rows.push([R.delayed.off.key+' dl',fmtL('🖐 지연 반칙 · {t}가 퍽을 만지면 휘슬',{t:tmName(R.delayed.off)})]);
  if(R.off)rows.push([R.off.team.key+' dl','🚩 오프사이드 대기 · 블루라인 밖으로!']);
  const pl=G.player,pk=G.puck;
  if(!R.off&&pl&&rulesOn(true)&&G.state==='play'&&!G.ps){const d=pl.team.dir;
    if(pk.x*d<=RULE.blIn&&pk.x*d>0&&pl.x*d>RULE.blP&&G.carry!==pl&&(G.carry?G.carry.team===pl.team:pk.lastTeam===pl.team))rows.push(['warn','⚠ 오프사이드 위치 · 퍽보다 먼저 들어가면 안 돼요']);}
  const key=rows.map(r=>r.join(':')).join('|');if(key===rulesHudKey)return;rulesHudKey=key;
  el.className=rows.length?'on':'';el.innerHTML=rows.map(r=>'<div class="rl-c '+r[0]+'">'+r[1]+'</div>').join('');
}
function v22Frame(dt){psFrame(dt);refFrame(dt);rulesHud();if(G.view!=='game'||G.state==='over')rulesCallHide();}

/* ---------- help text ---------- */
function howV22(){
  return fmtL('🧑‍⚖️ <b>심판과 하키 규칙</b>: 빠른 경기 · 토너먼트 · 티어 게임에서 심판이 직접 불어요. 설정의 <b>하키 규칙</b>에서 전체 / 반칙만 / 끄기를 고를 수 있어요.',{})
    +'<br>'+fmtL('🦵 <b>트리핑</b>: 슬라이드 태클은 퍽을 먼저 건드려야 해요. 선수를 먼저 넘어뜨리면 반칙 · 🙅 <b>방해 반칙</b>: 대시·돌진은 퍽을 가진 선수에게만 · 🥅 <b>골키퍼 방해</b>: 골 크리스 안의 골키퍼에게 돌진하면 반칙 (그때 들어간 골은 노골)',{})
    +'<br>'+fmtL('⏱ <b>퇴장과 파워플레이</b>: 반칙한 펭귄은 퇴장해요. 경기 시간 1분 {a}초 · 2분 {b}초 · 3분 {c}초 · 5분 {d}초 (실제 하키의 2분을 경기 길이에 맞춘 시간) · 그동안 상대 팀은 한 명 많은 파워플레이 · 파워플레이 골이 나면 바로 복귀 · 한 팀은 한 명까지만 퇴장하고, 더 반칙하면 퇴장 시간이 늘어나요 · 1 대 1 경기에서는 퇴장 대신 페널티 샷',{a:penFor(60),b:penFor(120),c:penFor(180),d:penFor(300)})
    +'<br>'+fmtL('🖐 <b>지연 반칙</b>: 반칙당한 팀이 퍽을 갖고 있으면 심판이 손을 들고 기다려요. 반칙한 팀이 퍽을 만지거나 {d}초가 지나면 휘슬 · 그 사이에 골을 넣으면 퇴장은 취소돼요',{d:RULE.delayMax})
    +'<br>'+fmtL('🎯 <b>페널티 샷</b>: 골키퍼만 남은 브레이크어웨이에서 뒤에서 넘어뜨리면, 반칙당한 펭귄이 골키퍼와 1 대 1로 {t}초 안에 슛해요',{t:RULE.psT})
    +'<br>'+fmtL('🚩 <b>오프사이드</b>: 공격 팀 펭귄은 퍽보다 먼저 상대 블루라인을 넘으면 안 돼요. 퍽을 차 넣었을 때는 모두 블루라인 밖으로 나가면(태그업) 계속할 수 있어요 · 🧊 <b>아이싱</b>: 센터 라인 뒤에서 친 퍽이 아무도 안 건드리고 상대 골라인을 넘으면 휘슬, 자기 진영에서 페이스오프 (퇴장으로 인원이 적은 팀은 괜찮아요)',{});
}

{const p=$('#sHow .panel');if(p){const box=document.createElement('div');box.className='how how-v17 how-v22';box.style.cssText='grid-template-columns:1fr;margin-top:12px';box.innerHTML='<div><h3>'+'🧑‍⚖️ 심판 · 하키 규칙'+'</h3>'+howV22()+'</div>';const rows=p.querySelectorAll('.row');p.insertBefore(box,rows.length?rows[rows.length-1]:null);}}
