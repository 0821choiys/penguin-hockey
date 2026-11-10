/* ================= v40: 🤝 team-mates play for you (2026-11-10) ================= */
// The owner: "the AI scoring by itself is too much — when I ask for the pass it has to give it, not go and score alone".
// With buttons-only switching (v38) an AI team-mate that won the puck simply played on: it shot whenever it had a chance,
// a call was ignored once its shot was 45 % wound up, and the call was forgotten after 1.2 s.
// Now, on a team that has a human-controlled skater on the ice (you, or the friend in an online match):
//  · a call is always answered — the carrier drops the shot it was winding up and passes HK.callDelay s later; the call
//    waits up to MT.callWin s for a pass cooldown or for the mate to actually get the puck on its stick
//  · Pass pressed while nobody has the puck is a call too: the first AI mate that wins it inside the window passes to you
//  · the mates are playmakers: they look for you first (at once under pressure, after MT.look s otherwise, when the lane
//    is open), hand the puck on to another mate only when pressed, and keep the puck moving on a calm loop in the
//    attacking end (MT.loop, at MT.pace of its top speed) instead of driving the net
//  · they shoot only as a last resort: MT.hold s on the puck with a real chance and no lane to you, or in the last
//    MT.late s of the match. AI one-timers, give-and-go plays and shooting skills are left to teams without a human.
// Opponents, the demo match and teams with auto switching (the human becomes the carrier anyway) play as before.
var MT={callWin:2.4,look:.45,lane:1.5,far:28,back:10,hold:3.6,late:6,press:3.4,zone:20,pace:.62,loop:[[9,8],[16,8.5],[15,3.5]]};
function mtHuman(tm){
  if(!tm||!tm.skaters||G.so||G.ps||!G.cfg||G.cfg.mode==='demo'||hkAuto())return null;
  for(const s of tm.skaters)if((s.human||s.remote)&&!s.boxed)return s;
  return null;
}
function mtMate(p){return !!(p&&!p.human&&!p.remote&&!p.goalie&&mtHuman(p.team));}
// can a pass reach you right now? (an uncalled pass never goes to you while you stand offside)
function mtOpen(p,H){
  const pk=G.puck,d=Math.hypot(H.x-pk.x,H.z-pk.z);
  return H.fall<=0&&!H.frozen&&d>2.2&&d<MT.far&&rulesMateOk(H)&&laneBlock(pk.x,pk.z,H.x,H.z,p.team)>=MT.lane;
}
// is a call waiting for this carrier? (the caller is on its team, on its feet, and the window is still open)
function mtCalled(p){const c=G.callFor;return !!(c&&c.p!==p&&c.p.team===p.team&&G.t-c.t<=MT.callWin&&!(c.p.fall>0)&&!c.p.frozen);}
// the decision of an AI mate that has (or can touch) the puck — replaces aiCarrier for it
function mtCarrier(p){
  const tm=p.team,pk=G.puck,df=G.diff,d=tm.dir,ai=p.ai,H=mtHuman(tm);if(!H)return;
  if(mtCalled(p)){ai.cool=.04;return;}                                   // you called: nothing else happens to the puck until it is passed to you
  const press=nearestOpp(p),own=pk.x*d<-W*.35,open=mtOpen(p,H),held=p.mtCar||0,near=(p.x-H.x)*d<MT.back;
  // 1) you first: at once under pressure, otherwise after a short look (and not a long pass back to you far behind)
  if(open&&p.cd.pass<=0&&canHit(p)&&(press<MT.press||(held>=MT.look&&near))){if(doPass(p,H)){ai.cool=rnd(.9,1.4);return;}}
  // 2) pressed with no lane to you: move it to another mate (who will look for you too), or clear the zone
  if(press<3.2){const m=bestMate(p,0,0,true);
    if(m&&m!==H&&!m.goalie&&laneBlock(pk.x,pk.z,m.x,m.z,tm)>=MT.lane&&Math.random()<df.passP+.25&&doPass(p,m)){ai.cool=rnd(.9,1.6);return;}}
  if(own&&press<MT.press&&!rulesIcingRisk(p)){const sg=pk.z>=0?1:-1,l=Math.hypot(d,sg*.45);performShot(p,d/l,sg*.45/l,.55);ai.cool=rnd(.8,1.4);return;}
  // 3) last resort only: a long time on the puck with a real chance and no way to give it to you, or the final seconds
  const late=G.cfg.time>0&&!G.ot&&G.timeLeft<=MT.late;
  if(!(open&&near)&&shotQ(pk.x,pk.z,tm)>=df.shootQ&&(held>=MT.hold||late)){
    const gd=Math.hypot(d*W-pk.x,pk.z);ai.plan={t:rnd(.08,.22),c:gd>13?rnd(.75,1):gd>7?rnd(.45,.75):rnd(.2,.5),tz:aiPlanTz(p)};return;}
  ai.cool=rnd(.05,.18);
}
// where the mate skates with the puck: up the ice as before, but in the attacking end it keeps the puck moving on a calm
// loop on its side (low half-wall → high wall → high slot) instead of taking it to the net itself, so it is still there
// when you get open or call; on the loop its top speed is MT.pace of normal (movePeng), a sprint along the boards loses
// the puck. After MT.hold s / in the last seconds it goes to the net after all.
function mtCarry(p){
  const ai=p.ai;ai.mtSlow=false;if(!mtMate(p))return;
  const d=p.team.dir,gx=d*W,deep=(gx-p.x)*d;if(deep>MT.zone){ai.mtSide=0;return;}
  if((p.mtCar||0)>=MT.hold||(G.cfg.time>0&&!G.ot&&G.timeLeft<=MT.late))return;   // last resort: take it to the net after all
  if(mtCalled(p)){ai.tx=p.x;ai.tz=p.z;ai.full=false;ai.mtSlow=true;return;}       // you called: it stops and turns to pass
  const H=mtHuman(p.team);
  if(!ai.mtSide){ai.mtSide=Math.abs(p.z)>1.5?Math.sign(p.z):(H&&H.z>0?-1:1);ai.mtLeg=deep<12?0:1;}
  const sg=ai.mtSide,L=MT.loop;let k=ai.mtLeg%L.length;
  for(let n=0;n<L.length;n++){const tx=gx-d*L[k][0],tz=sg*L[k][1];
    if(Math.hypot(tx-p.x,tz-p.z)<2.4||oppNear(tx,tz,p.team)<3){k=(k+1)%L.length;continue;}   // reached it, or somebody is waiting there
    break;}
  ai.mtLeg=k;ai.tx=gx-d*L[k][0];ai.tz=sg*L[k][1];ai.full=false;ai.mtSlow=true;
}
// the waiting loop is skated at MT.pace: a lower top speed (movePeng) and a softer push (the speed limit there is soft:
// top speed ≈ cap + acceleration / 4, so both have to come down)
function mtPace(p){const ai=p.ai;if(ai.mtSlow&&G.carry===p&&!ai.plan){p.ix*=MT.pace;p.iz*=MT.pace;}}
// ---- the call (replaces v38's hkCallPress / hkCallPass) ----
function mtCallPress(p,inp){
  if(!inp.pass)return false;const c=G.carry;
  if(c&&c!==p&&c.team===p.team&&!c.human&&!c.remote&&!c.goalie){   // a mate has the puck: ask for it
    inp.pass=false;G.callFor={p,t:G.t};
    if(c.ai&&c.ai.plan){c.ai.plan=null;c.charging=false;c.charge=0;}       // your call beats its own shot, however far it is wound up
    if(p.cd.pass<=0){p.cd.pass=.3;if(p.human)popAt(__L('🙋 여기!'),p.x,2.5,p.z);SFX.ui();}
    return true;
  }
  // nobody has it and it is not on your stick: the next mate to win it will look for you (the press is still buffered for
  // your own stick as before, so a puck that reaches you first is passed on)
  if(!c&&!canHit(p)&&!hkIncoming(p)&&mtHuman(p.team))G.callFor={p,t:G.t};
  return false;
}
function mtCallPass(p){
  const c=G.callFor;if(!c)return;
  if(G.t-c.t>MT.callWin||G.carry===c.p){G.callFor=null;return;}
  if(G.carry!==p)return;const q=c.p;
  if(q.team!==p.team)return;                                            // an opponent has it for now: the call stays open until the window closes
  if(q===p||!(q.human||q.remote)||q.frozen){G.callFor=null;return;}
  if(q.fall>0)return;                                                   // you are down: it waits until you are up (inside the window)
  if(G.t-c.t<HK.callDelay||p.cd.pass>0||!canHit(p))return;
  if(p.ai&&p.ai.plan){p.ai.plan=null;p.charging=false;p.charge=0;}      // your call beats its own shot, however far it is wound up
  G.callFor=null;if(doPass(p,q))p.ai.cool=rnd(.9,1.4);
}
