// v40: AI team-mates of a human player — a call for the pass is always answered (even over a wound-up shot, after a pass
// cooldown, or made before the mate has the puck), mates look for the player instead of shooting, shoot only as a last resort;
// opponents / auto switching / the demo are unchanged; the friend's team online gets the same treatment.
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,save,step,startMatch,simulate,input,FIXED,HK,MT}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const PUCKR=.42,W=24;
save.set.rules='off';save.set.items=false;save.set.events=false;save.set.ctl=PH.ctlLoad(null);
const tick=()=>{G.t+=FIXED;PH.autoSwitch(FIXED);simulate(FIXED);};
const clear=()=>{input.x=input.z=0;input.shoot=input.shootPress=input.shootRel=input.pass=input.dash=input.special=input.swap=false;};
function match(){clear();save.set.ctl.auto=false;startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'q',oppTypes:['basic','fast','strong']});
  let n=0;while(G.state!=='play'&&n++<600)step(1/60);G.timeLeft=170;}
const me=()=>G.player,mates=()=>G.mine.skaters.filter(s=>s!==G.player),opps=()=>G.mine.opp.skaters;
function freeze(list){for(const o of list){o.frozen=true;o.x=o.ox=-G.mine.dir*20;o.z=o.oz=10+list.indexOf(o)*.2;o.vx=o.vz=0;}}
function place(p,x,z,h){p.x=p.ox=p.rx=x;p.z=p.oz=p.rz=z;p.vx=p.vz=0;p.heading=h==null?Math.PI/2*G.mine.dir:h;p.fall=0;p.getup=0;p.cd.catch=0;p.cd.shoot=0;p.cd.pass=0;
  p.charging=false;p.charge=0;p.bufShot=p.bufPass=null;p.slow=0;p.dashT=0;p.mtCar=0;if(p.ai){p.ai.plan=null;p.ai.cool=0;p.ai.think=0;p.ai.mtLeg=0;}}
function puck(x,z,vx,vz){const pk=G.puck;pk.x=pk.ox=x;pk.z=pk.oz=z;pk.vx=vx||0;pk.vz=vz||0;pk.shot=null;G.carry=null;G.pass=null;G.pending=null;G.callFor=null;}
function give(p){const f=p.r+PUCKR+.12;puck(p.x+Math.sin(p.heading)*f,p.z+Math.cos(p.heading)*f);tick();}
// run up to s seconds; returns what happened first: 'pass' (to `to`), 'shot' (by `by`), or null
function watch(s,by,to,stopOnShot){let t=0,shot=null,pass=null;
  while(t<s){tick();t+=FIXED;const pk=G.puck;
    if(!shot&&pk.shot&&pk.shot.by===by)shot=t;
    if(!pass&&G.pass&&G.pass.from===by&&G.pass.to===to)pass=t;
    if(pass||(shot&&stopOnShot!==false))break;}
  return {shot,pass};}
// the usual set-up: an AI mate carries the puck in the slot (a real scoring chance), you stand `hx,hz` (in attacking-direction metres)
function slot(hx,hz,mx,mz){match();freeze(opps());const d=G.mine.dir,p=me(),[m,b]=mates();
  place(p,hx*d,hz);place(m,(mx==null?W-9:mx)*d,mz||0);if(b){b.frozen=true;place(b,-10*d,-9);}give(m);return {p,m,b,d};}

// ---- who gets the treatment ----
{const S=slot(8,6);ok(PH.mtHuman(G.mine)===S.p&&PH.mtMate(S.m)&&!PH.mtMate(S.p)&&!PH.mtMate(opps()[0]),'a mate of the human player is a playmaker; you and the opponents are not');
 ok(G.carry===S.m&&PH.shotQ(G.puck.x,G.puck.z,G.mine)>=G.diff.shootQ,'set-up: the mate carries the puck in the slot with a real chance (shot quality '+PH.shotQ(G.puck.x,G.puck.z,G.mine).toFixed(2)+' ≥ '+G.diff.shootQ+')');
 save.set.ctl.auto=true;ok(PH.mtHuman(G.mine)===null,'auto switching on (you become the carrier anyway) → mates play as before');save.set.ctl.auto=false;
 const m0=G.cfg.mode;G.cfg.mode='demo';ok(PH.mtHuman(G.mine)===null,'demo match → as before');G.cfg.mode=m0;}

// ---- the call ----
{const S=slot(8,6);S.m.ai.plan={t:.6,c:.9,tz:0};S.m.charging=true;S.m.charge=.8;
 input.pass=true;const r=watch(1,S.m,S.p);
 ok(r.pass!=null&&r.shot==null&&r.pass>=HK.callDelay-1e-9&&r.pass<.4,'call while the mate has a shot 80 % wound up → it drops the shot and passes ('+(r.pass||0).toFixed(2)+' s; before v40 it shot)');}
{const S=slot(8,6);S.m.cd.pass=.9;input.pass=true;const r=watch(MT.callWin,S.m,S.p,false);
 ok(r.pass!=null&&r.pass>=.85&&r.pass<1.4,'call during the mate\'s pass cooldown (0.9 s) → the call waits and the pass comes ('+(r.pass||0).toFixed(2)+' s; the old 1.2 s window was only just enough)');}
{match();freeze(opps());const d=G.mine.dir,p=me(),[m,b]=mates();place(p,2*d,7);place(m,10*d,0);b.frozen=true;place(b,-10*d,-9);puck(13.5*d,0);
 input.pass=true;tick();ok(G.callFor&&G.callFor.p===p&&G.carry===null,'Pass pressed while nobody has the puck → remembered as a call');
 const r=watch(MT.callWin,m,p,false);ok(r.pass!=null,'…the mate wins the puck and passes to you at once ('+(r.pass||0).toFixed(2)+' s)');}
// a call that has to wait (pass cooldown) while an opponent presses the carrier in its own end: without the hold the carrier
// clears the zone in the meantime — with it nothing else happens to the puck until it is passed to you
{let other=0,shot=0,toYou=0;const N=10;
 for(let i=0;i<N;i++){const S=slot(-6,6,-13,0);const o=opps()[0];
   // a checker that shadows the carrier 3.3 m away (inside the pressure radius, outside stick reach) for the whole wait
   const pin=()=>{o.x=o.ox=o.rx=S.m.x-S.d*1;o.z=o.oz=o.rz=S.m.z-3.1;o.vx=o.vz=0;o.frozen=false;o.cd.shoot=1;o.cd.dash=1;o.cd.special=5;};
   S.m.cd.pass=.6;input.pass=true;tick();pin();                           // the call is in, then the pressure arrives
   let t=0,done=false;while(t<2&&!done){tick();pin();t+=FIXED;const ps=G.pass,sh=G.puck.shot;
     if(sh&&sh.by===S.m){shot++;done=true;}else if(ps&&ps.from===S.m){if(ps.to===S.p)toYou++;else other++;done=true;}}}
 ok(toYou>=N-1&&other===0&&shot===0,'called while the carrier is pressed in its own end and its pass is on cooldown: it waits and passes to you '+toYou+'/'+N+' (to the other mate '+other+', cleared '+shot+')');}
{const S=slot(8,6);ok(!PH.mtCalled(S.m),'no call → the carrier decides freely');G.callFor={p:S.p,t:G.t};ok(PH.mtCalled(S.m)&&!PH.mtCalled(S.p),'a fresh call holds the carrier');
 S.p.fall=1;ok(!PH.mtCalled(S.m),'…but not while you are down (it may move the puck on)');S.p.fall=0;G.callFor=null;}
{const S=slot(8,6);const o=opps()[0];G.callFor={p:S.p,t:G.t};const c0=G.carry;G.carry=o;PH.mtCallPass(o);G.carry=c0;
 ok(G.callFor&&G.callFor.p===S.p,'an opponent touching the puck does not cancel your call (a mate that wins it back inside the window still passes)');G.callFor=null;}
{const S=slot(8,6);G.callFor={p:S.p,t:G.t-MT.callWin-.1};PH.mtCallPass(S.m);ok(G.callFor===null,'a call older than '+MT.callWin+' s is forgotten');}
{const S=slot(8,6);input.pass=true;const r=watch(1,S.m,S.p);let t=0;while(G.carry!==S.p&&t<2){tick();t+=FIXED;}
 ok(r.pass!=null&&G.carry===S.p&&G.player===S.p&&!G.callFor,'you receive the pass you called for and keep your penguin');}

// ---- no solo goals: with you open, the mate passes instead of shooting ----
{let passN=0,shotN=0,tSum=0;const N=14;
 for(let i=0;i<N;i++){const S=slot(i%2?10:14,i%3?6:-6);const r=watch(2.5,S.m,S.p);if(r.pass!=null){passN++;tSum+=r.pass;}if(r.shot!=null)shotN++;}
 ok(shotN===0&&passN===N,'you are open, no call: in '+N+' tries the mate shot '+shotN+' times and passed to you '+passN+' times (after '+(tSum/Math.max(1,passN)).toFixed(2)+' s on average; it used to shoot)');}
// ---- no lane to you: it keeps the puck moving (never a shot before MT.hold s), then shoots as a last resort ----
{let early=0,after=0,sum=0,lost=0;const N=6;
 for(let i=0;i<N;i++){const S=slot(-W+5,0);let t=0,shotAt=null;   // you are at the other end: too far for a pass
   while(t<MT.hold+7&&shotAt==null){tick();t+=FIXED;if(G.puck.shot&&G.puck.shot.by===S.m)shotAt=t;if(t<MT.hold&&G.carry!==S.m)lost+=FIXED;}
   if(shotAt!=null&&shotAt<MT.hold-.05)early++;else if(shotAt!=null){after++;sum+=shotAt;}}
 ok(early===0,'no way to reach you: in '+N+' tries the mate never shot before '+MT.hold+' s on the puck');
 ok(lost/N<.5,'…it keeps the puck on its waiting loop (without it for '+(lost/N).toFixed(2)+' s of the first '+MT.hold+' s on average)');
 ok(after>=N-2,'…then takes the shot itself as a last resort ('+after+' of '+N+', after '+(sum/Math.max(1,after)).toFixed(1)+' s on average)');}
{const S=slot(W-9-MT.back-6,0);let t=0,early=0,shotAt=null,passAt=null;   // you are open but 16 m behind the play
 while(t<MT.hold+7&&shotAt==null&&passAt==null){tick();t+=FIXED;if(G.puck.shot&&G.puck.shot.by===S.m)shotAt=t;if(G.pass&&G.pass.from===S.m&&G.pass.to===S.p)passAt=t;}
 ok(passAt!=null||(shotAt!=null&&shotAt>=MT.hold-.05),'you are open but far behind the play: no early shot — '+(passAt!=null?'it waits and passes to you ('+passAt.toFixed(1)+' s)':'it shoots as a last resort ('+(shotAt||0).toFixed(1)+' s)'));}
{let n=0;const N=6;for(let i=0;i<N;i++){const S=slot(-W+5,0);G.timeLeft=MT.late-1;if(watch(2.5,S.m,S.p).shot!=null)n++;}
 ok(n>=N-2,'last '+MT.late+' s of the match and no way to reach you → it shoots ('+n+' of '+N+' within 2.5 s)');}

// ---- the waiting loop ----
{const S=slot(-W+5,0);let t=0,vmax=0,far=0;while(t<3){tick();t+=FIXED;if(G.carry===S.m&&t>.6){vmax=Math.max(vmax,Math.hypot(S.m.vx,S.m.vz));far=Math.max(far,Math.abs(S.m.z));}}
 const top=(()=>{const T=slot(-W+5,0);PH.MT.pace=1;let t=0,v=0;while(t<3){tick();t+=FIXED;if(G.carry===T.m&&t>.6)v=Math.max(v,Math.hypot(T.m.vx,T.m.vz));}PH.MT.pace=.62;return v;})();
 ok(vmax<top*.75&&far<=13-2,'the waiting loop is skated calmly: top speed '+vmax.toFixed(1)+' m/s (at full effort '+top.toFixed(1)+'), never closer than 2 m to the side boards');}
{const S=slot(8,6);for(let i=0;i<40;i++)tick();const c=G.carry===S.m;G.callFor={p:S.p,t:G.t};S.m.cd.pass=.8;S.m.ai.think=0;tick();
 ok(c&&S.m.ai.mtSlow&&Math.hypot(S.m.ai.tx-S.m.x,S.m.ai.tz-S.m.z)<.2,'called while its pass is on cooldown: it stops where it is and waits to pass');G.callFor=null;}
// ---- opponents are unchanged ----
{let shots=0;const N=12;
 for(let i=0;i<N;i++){match();const d=G.mine.dir,o=opps()[0];freeze(G.mine.skaters);for(const q of opps())if(q!==o){q.frozen=true;place(q,10*d,9);}
   place(o,-(W-9)*d,0,-Math.PI/2*d);const f=o.r+PUCKR+.12;puck(o.x+Math.sin(o.heading)*f,o.z);tick();
   let t=0;while(t<2.5){tick();t+=FIXED;if(G.puck.shot&&G.puck.shot.by===o){shots++;break;}}}
 ok(shots>=N/2,'an opponent with the same chance still shoots by itself ('+shots+' of '+N+' within 2.5 s; your mates: 0)');}

// ---- friend match: the friend's mates look for the friend ----
{match();const d=G.mine.dir;G.net='host';const red=G.teams.red,r=red.skaters;PH.netSetRemote(r[0]);
 ok(PH.mtHuman(red)===r[0]&&PH.mtMate(r[1])&&PH.mtHuman(G.mine)===G.player,'online (host side): both teams\' mates are playmakers for their human');
 PH.netSetRemote(null);G.net=null;}

console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
