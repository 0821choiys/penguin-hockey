/* ================= v38: 🏒 hockey-style control (2026-11-09) ================= */
// The owner: "the penguin should not change until I pass or press Switch" and "look at how hockey games do it".
// Taken from hockey games (EA NHL, NHL 94, FC Mobile's switching options) — reference only, our own numbers:
//  1) Switching is yours. Only a pass (control goes to the receiver) or the Switch button changes your penguin.
//     Switch picks the team-mate nearest the puck (NHL: "closest to the puck"); a white ring shows who that is.
//     Auto switching stays as a setting (FC Mobile offers manual / auto), off by default and never online.
//     The only forced change: your penguin goes to the penalty box (it cannot play).
//  2) The buttons follow the play (NHL / FC Mobile change what the buttons do without the puck):
//     an opponent has the puck → Shoot = Poke (뺏기) · an AI team-mate has it → Pass = Call for it (패스 요청).
//  3) One-timers / one-touch passes: Shoot or Pass pressed while a pass is on its way to you fires the moment the puck
//     arrives (NHL 94: "one-timer without the puck"); a press right after your own pass hands control to the receiver at once.
//  4) The camera keeps the puck in view when your penguin is far from it; an arrow at the screen edge shows your penguin.
var HK={sw:.28,dbl:.25,callWin:1.2,callDelay:.12,mate:1.5,wait:2.2,otTap:.5,pokeCd:.45,whiffCd:.3,whiffSlow:.25,pokeSp:5,
  camNear:8,camFar:22,camW:.4,camMin:.25};
// auto switching (old behaviour) only when the player turned it on, never in a friend match
function hkAuto(){return !G.net&&!!ctl().auto;}
// the team-mate the Switch button picks: nearest the puck (the ring shows the same penguin)
function hkSwapTarget(p){
  if(!p||!p.team)return null;const pk=G.puck;let best=null,bd=1e9;
  for(const s of p.team.skaters){if(s===p||s.fall>0||s.frozen||s.boxed)continue;const d=Math.hypot(pk.x-s.x,pk.z-s.z);if(d<bd){bd=d;best=s;}}
  return best;
}
function hkSwap(){
  if(G.so||G.ps)return;const tm=G.mine;if(!tm||!G.player)return;
  const best=hkSwapTarget(G.player);if(best){setHuman(best);G.pending=null;G.switchCd=.8;SFX.ui();}
}
function hkNetSwap(p){const best=hkSwapTarget(p);if(best){netSetRemote(best);NET.pend=null;NET.swCd=.8;}}
function hkAutoSwitch(dt){
  if(G.so||G.ps)return;
  const tm=G.mine;if(!tm||!G.player)return;
  // Switch works while your penguin is down: a knocked-down penguin gets no input, so the press used to wait until it got up
  if(input.swap&&G.player.fall>0){input.swap=false;hkSwap();}
  if(G.pending){G.pending.t-=dt;if(G.pending.t<=0){const to=G.pending.to;G.pending=null;G.switchCd=.8;if(to.fall<=0&&!to.frozen&&tm.skaters.includes(to))setHuman(to);}return;}
  if(!hkAuto())return;   // manual (default): nothing else changes your penguin
  if(G.carry&&G.carry.team===tm&&G.carry!==G.player){setHuman(G.carry);G.switchCd=.6;return;}
  G.switchCd-=dt;if(G.switchCd>0)return;
  const pk=G.puck,dc=Math.hypot(pk.x-G.player.x,pk.z-G.player.z);if(dc<5&&G.player.fall<=0)return;
  const best=hkSwapTarget(G.player),bd=best?Math.hypot(pk.x-best.x,pk.z-best.z):1e9;
  if(best&&dc-bd>3.5){setHuman(best);G.switchCd=1;}
}
// the friend's penguin (host side): a pass hands control to the receiver; the penalty box is the only forced change
function hkNetAutoSwitch(dt){
  const tm=G.teams.red,cur=NET.rp;if(!tm||!cur||G.so||G.ps)return;
  if(cur.fall>0){const c=Array.isArray(NET.rin.c)?NET.rin.c:[],n=c[5]|0;if(n>NET.rseen[5]){NET.rseen[5]=n;hkNetSwap(cur);return;}}   // the friend's Switch while down
  const P=NET.pend;
  if(P){P.t-=dt;if(P.t<=0){NET.pend=null;if(P.to.fall<=0&&!P.to.frozen&&tm.skaters.includes(P.to))netSetRemote(P.to);}return;}
  if(cur.boxed){const o=hkSwapTarget(cur);if(o)netSetRemote(o);}
}
// a Shoot / Pass press right after your own pass belongs to the receiver: control moves now and the press is kept for them
function hkEarly(p,inp){
  if(!(inp.shootPress||inp.pass))return false;
  const pend=p.human&&inp===input?G.pending:(p.remote?NET.pend:null);
  if(!pend||!pend.to||pend.to===p)return false;
  if(inp.pass&&G.pass&&G.pass.from===p&&G.t-G.pass.t<HK.dbl){inp.pass=false;if(!inp.shootPress)return false;}   // a double tap is not a one-touch pass
  const to=pend.to;if(to.fall>0||to.frozen)return false;
  if(p.human){G.pending=null;G.switchCd=.8;setHuman(to);}else{NET.pend=null;netSetRemote(to);}
  return true;
}
// while you wait for a pass with a shot / pass queued (or a shot charging), your penguin glides onto the puck's path and the
// stick only aims — otherwise pushing the stick to aim would skate you away from the pass
function hkRecvAssist(p,inp){
  p.hkAim=null;
  if(!hkIncoming(p)||!((p.bufShot&&p.bufShot.w)||(p.bufPass&&p.bufPass.w)||p.charging))return;
  const m=Math.hypot(inp.x||0,inp.z||0);if(m>.3)p.hkAim=[inp.x/m,inp.z/m];
  const pk=G.puck,sp=Math.hypot(pk.vx,pk.vz);if(sp<1)return;
  const ux=pk.vx/sp,uz=pk.vz/sp,along=(p.x-pk.x)*ux+(p.z-pk.z)*uz;if(along<0)return;   // already past you
  const dx=pk.x+ux*along-p.x,dz=pk.z+uz*along-p.z,d=Math.hypot(dx,dz);
  if(d<.35){p.ix=0;p.iz=0;}else{const k=Math.min(1,d/2.5);p.ix=dx/d*k;p.iz=dz/d*k;}
}
function hkIncoming(p){const ps=G.pass;return !!(ps&&ps.to===p&&ps.from!==p&&ps.from.team===p.team);}
function hkBufShot(p){p.bufShot={at:G.t,c:p.charge,w:hkIncoming(p)};if(p.bufShot.w&&p.human)popAt(__L('원타이머 준비!'),p.x,2.6,p.z);}
// a tapped one-timer is struck firmly (a hockey one-timer is a slap shot, not a nudge)
function hkOtCharge(p,b){const ot=G.t-(p.recvT==null?-9:p.recvT)<OT_WIN;return (b.w&&ot&&b.c<.14)?Math.max(b.c,HK.otTap):b.c;}
// v36 buffer + v38: a press made while a pass is coming to you waits for the puck (up to HK.wait s) instead of 0.22 s
function hkBuf(p){
  const b=p.bufShot,q=p.bufPass,lim=CTLV.buf,inc=hkIncoming(p);
  if(b){const age=G.t-b.at;
    if(b.w&&!inc&&!canHit(p))p.bufShot=null;                                           // the pass did not reach you: dropped quietly
    else if(p.fall>0||age<0||(!b.w&&age>lim+.1)||age>HK.wait)p.bufShot=null;           // stale (switched penguin, stoppage)
    else if(p.cd.shoot<=0&&(canHit(p)||(!b.w&&age>=lim))){p.bufShot=null;if(inc&&canHit(p))touchPuck(p,3);   // struck straight off the pass = received (one-timer)
      const a=humanAim(p);performShot(p,a[0],a[1],hkOtCharge(p,b));}
  }
  if(q){const age=G.t-q.at;
    if(q.w&&!inc&&!canHit(p))p.bufPass=null;
    else if(p.fall>0||age<0||(!q.w&&age>lim+.16)||age>HK.wait)p.bufPass=null;
    else if(p.cd.pass<=0&&canHit(p)){const a=humanAim(p),m=bestMate(p,a[0],a[1],false);p.bufPass=null;if(inc&&m)touchPuck(p,3);if(!doPass(p,m)){p.cd.pass=.15;SFX.whoosh();}}
    else if(!q.w&&age>=lim+.06){p.bufPass=null;p.cd.pass=.15;SFX.whoosh();}
  }
}
/* ---- the buttons follow the play ---- */
// Pass while an AI team-mate carries the puck = "pass it here" (NHL: call for pass). Never buffered, so the pass you get
// is not passed straight on.
function hkCallPress(p,inp){
  if(!inp.pass)return false;const c=G.carry;
  if(!c||c===p||c.team!==p.team||c.human||c.remote||c.goalie)return false;
  inp.pass=false;if(p.cd.pass>0)return true;
  G.callFor={p,t:G.t};p.cd.pass=.3;if(p.human)popAt(__L('🙋 여기!'),p.x,2.5,p.z);SFX.ui();return true;
}
// the AI carrier answers a call (a short reaction delay; a shot already well wound up goes first)
function hkCallPass(p){
  const c=G.callFor;if(!c)return;if(G.t-c.t>HK.callWin){G.callFor=null;return;}
  if(G.carry!==p)return;const q=c.p;
  if(q===p||q.team!==p.team||!(q.human||q.remote)||q.fall>0||q.frozen){G.callFor=null;return;}
  if(G.t-c.t<HK.callDelay||p.cd.pass>0||!canHit(p))return;
  if(p.ai&&p.ai.plan){if(p.charge>.45)return;p.ai.plan=null;p.charging=false;p.charge=0;}
  G.callFor=null;doPass(p,q);
}
// Shoot while an opponent carries the puck = poke check: in stick reach (the same reach as a shot) the puck is knocked
// to your stick; out of reach it is a whiff that costs a moment. (Before v38 the same press shot the puck off their stick.)
function hkPokePress(p,inp){
  if(!inp.shootPress)return false;const c=G.carry;
  if(!c||c.team===p.team||c.goalie||p.cd.shoot>0)return false;
  inp.shootPress=false;inp.shootRel=false;if(inp===input)input.shoot=false;
  p.charging=false;p.charge=0;p.stage=0;p.anim.swing=1;
  if(canHit(p)&&!(c.shadowT>0||c.hopT>0)){
    const pk=G.puck;carryRelease(.5);
    const f=p.r+PUCKR+.12,tx=p.x+Math.sin(p.heading)*f,tz=p.z+Math.cos(p.heading)*f,dx=tx-pk.x,dz=tz-pk.z,l=Math.hypot(dx,dz)||1,sp=Math.min(HK.pokeSp,l*5+1);
    pk.vx=p.vx+dx/l*sp;pk.vz=p.vz+dz/l*sp;pk.shot=null;touchPuck(p,3);p.cd.shoot=HK.pokeCd;
    if(G.cfg&&G.cfg.mode!=='demo'){if(p.team===G.mine){popAt(__L('뺏기!'),c.x,2.4,c.z);if(realMatch())save.cum.steals++;if(p.human)vib(15);}
      else if(c.team===G.mine)popAt(__L('빼앗겼다!'),c.x,2.3,c.z);}
    SFX.hit(.6);return true;
  }
  p.cd.shoot=HK.whiffCd;p.slow=Math.max(p.slow,HK.whiffSlow);SFX.whoosh();whiffFx(p);
  return true;
}
// what Shoot / Pass do right now (also used for the button labels)
function hkCtx(p){
  const c=G.carry,live=G.state==='play'||G.state==='ready';
  if(!p||!live||G.so||G.ps||!c)return{sh:0,pa:0};
  return{sh:c.team!==p.team&&!c.goalie?1:0,pa:c!==p&&c.team===p.team&&!c.human&&!c.remote&&!c.goalie?1:0};
}
/* ---- every frame: button labels, the switch ring, the arrow to your penguin ---- */
function hkRemember(){for(const id of['#tbShoot','#tbPass']){const b=$(id);if(b&&b.style&&b.dataset)b.dataset.fs=b.style.fontSize||'';}}
function hkLab(id,txt,cls){
  const b=$(id);if(!b||!b.classList)return;let t=b.firstChild;
  if(!t||t.nodeType!==3){t=document.createTextNode('');b.insertBefore(t,b.firstChild);}
  if(t.nodeValue===txt)return;
  t.nodeValue=txt;b.classList.toggle('hk-poke',cls==='poke');b.classList.toggle('hk-call',cls==='call');
  if(b.dataset&&b.dataset.fs!=null)b.style.fontSize=b.dataset.fs;try{ctlFitAll();}catch(_){}
}
function hkLabels(){
  const x=hkCtx(G.view==='game'?G.player:null);
  hkLab('#tbShoot',x.sh?__L('뺏기'):__L('슛'),x.sh?'poke':'');
  hkLab('#tbPass',x.pa?__L('패스 요청'):__L('패스'),x.pa?'call':'');
}
var HKR={ring:null,tgt:null,v:null,off:null};
function hkRingFrame(){
  if(!HKR.ring){if(typeof T==='undefined'||!T.RingGeometry||!T.Group||!scene)return;
    // a white ring with a dark edge: plain white disappears on the white ice
    const mk=(a,b,c,o)=>{const m=new T.Mesh(new T.RingGeometry(a,b,40),new T.MeshBasicMaterial({color:c,transparent:true,opacity:o,side:T.DoubleSide,depthWrite:false,depthTest:false}));m.rotation.x=-Math.PI/2;return m;};
    HKR.ring=new T.Group();HKR.ring.add(mk(1.0,1.13,0x14304d,.55));HKR.ring.add(mk(.82,1.0,0xffffff,.95));
    HKR.ring.position.y=.042;HKR.ring.visible=false;scene.add(HKR.ring);}
  const p=G.player,r=HKR.ring;let t=null;
  if(p&&G.view==='game'&&(G.state==='play'||G.state==='ready')&&!G.so&&!G.ps&&!G.cine&&G.carry!==p&&!canHit(p)&&!p.charging)t=hkSwapTarget(p);
  HKR.tgt=t;if(!t){r.visible=false;return;}
  r.visible=true;r.position.set(t.rx,.042,t.rz);const k=.85+.15*Math.sin(G.t*3);
  if(r.children&&r.children.length===2){r.children[0].material.opacity=.55*k;r.children[1].material.opacity=.95*k;}
}
// camera: the puck stays the main subject when your penguin is far from it (it used to sit 40 % of the way to your penguin)
function hkCamW(pl){const pk=G.puck,d=Math.hypot(pk.x-pl.x,pk.z-pl.z);return HK.camW*clamp(1-(d-HK.camNear)/HK.camFar,HK.camMin,1);}
function hkOffFrame(){
  let el=HKR.off;
  if(!el){if(!document.body||!document.createElement)return;el=HKR.off=document.createElement('div');el.id='hkOff';el.setAttribute('aria-hidden','true');document.body.appendChild(el);}
  const p=G.player;
  if(!p||G.view!=='game'||G.cine||G.so||G.ps||typeof T==='undefined'||!T.Vector3||!camera){el.style.display='none';return;}
  const v=HKR.v||(HKR.v=new T.Vector3());v.set(p.rx,1,p.rz);if(typeof v.project!=='function'){el.style.display='none';return;}
  if(camera.updateMatrixWorld)camera.updateMatrixWorld();v.project(camera);
  const W_=innerWidth,H_=innerHeight,m=30;let x=(v.x*.5+.5)*W_,y=(-v.y*.5+.5)*H_;
  if(v.z<1&&x>m&&x<W_-m&&y>m+44&&y<H_-m){el.style.display='none';return;}
  const cx=W_/2,cy=H_/2;let dx=x-cx,dy=y-cy;if(v.z>=1){dx=-dx;dy=-dy;}
  const k=Math.min((W_/2-m)/Math.max(Math.abs(dx),1e-6),(H_/2-m-22)/Math.max(Math.abs(dy),1e-6));
  const ex=cx+dx*k,ey=cy+dy*k;
  el.style.display='block';el.style.transform='translate('+Math.round(ex-18)+'px,'+Math.round(ey-18)+'px) rotate('+Math.atan2(dy,dx).toFixed(3)+'rad)';
}
function hkFrame(){
  try{if(document.body&&document.body.classList.contains('touch'))hkLabels();}catch(_){}
  hkRingFrame();hkOffFrame();
}
/* ---- settings (조작 설정): 펭귄 교체 = 버튼으로만 (default) / 자동 ---- */
function hkSwapNote(c){
  let t=c.auto?__L('자동: 퍽에 더 가까운 펭귄으로 저절로 바뀌어요'):__L('버튼으로만: 패스하거나 교체 버튼을 누를 때만 바뀌어요 · 흰 링이 바뀔 펭귄이에요');
  t+=' ('+__L('친구 대전에서는 두 사람 모두 버튼으로만')+')';
  if(!c.swap)t+='<br>'+(c.auto?__L('교체 버튼을 숨겨도 퍽에 가까운 펭귄으로 자동 교체돼요'):__L('교체 버튼을 숨기면 패스할 때만 펭귄이 바뀌어요'));
  return t;
}
