// v38: hockey-style control — your penguin changes only on a pass or the Switch button (auto switching = setting, off),
// Switch target = the white ring, call for the pass, poke check, one-timers / one-touch passes that wait for the pass,
// AI answers the call, camera weight, settings field + editor text, friend match (host side) consistency
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,save,step,startMatch,simulate,input,FIXED,HK}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const PUCKR=.42;
save.set.rules='off';save.set.items=false;save.set.events=false;save.set.ctl=PH.ctlLoad(null);
const tick=()=>{G.t+=FIXED;PH.autoSwitch(FIXED);simulate(FIXED);};          // one physics step like the main loop
const ticks=s=>{for(let i=0;i<Math.round(s/FIXED);i++)tick();};
const clear=()=>{input.x=input.z=0;input.shoot=input.shootPress=input.shootRel=input.pass=input.dash=input.special=input.swap=false;};
function match(){clear();save.set.ctl.auto=false;startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'q',oppTypes:['basic','fast','strong']});
  let n=0;while(G.state!=='play'&&n++<600)step(1/60);G.timeLeft=170;}
const me=()=>G.player,mates=()=>G.mine.skaters.filter(s=>s!==G.player),opps=()=>G.mine.opp.skaters;
function freezeOpps(keep){for(const o of opps()){if(o===keep)continue;o.frozen=true;o.x=o.ox=20;o.z=o.oz=10;o.vx=o.vz=0;}}
function place(p,x,z,h){p.x=p.ox=p.rx=x;p.z=p.oz=p.rz=z;p.vx=p.vz=0;p.heading=h==null?Math.PI/2:h;p.fall=0;p.getup=0;p.cd.catch=0;p.cd.shoot=0;p.cd.pass=0;
  p.charging=false;p.charge=0;p.bufShot=p.bufPass=null;p.slow=0;p.dashT=0;}
function puck(x,z,vx,vz){const pk=G.puck;pk.x=pk.ox=x;pk.z=pk.oz=z;pk.vx=vx||0;pk.vz=vz||0;pk.shot=null;G.carry=null;G.pass=null;G.pending=null;G.callFor=null;}
const front=(p,f)=>[p.x+Math.sin(p.heading)*(f||p.r+PUCKR+.12),p.z+Math.cos(p.heading)*(f||p.r+PUCKR+.12)];

// ---- save field ----
ok(PH.ctlLoad(undefined).auto===false&&PH.ctlLoad({auto:true}).auto===true&&PH.ctlLoad({auto:'yes'}).auto===false,'save.set.ctl.auto: default off (buttons only), only a real true turns auto switching on');
{const r=require('child_process').spawnSync(process.execPath,['-e',"const PH=require('./harness.js');console.log('@@'+JSON.stringify(PH.save.set.ctl));process.exit(0)"],
  {cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify({v:10,points:5,set:{ctl:{sz:1.2,jm:'fixed'}}})}),encoding:'utf8'});
 const L=JSON.parse(((r.stdout||'').split('@@')[1]||'null').trim()||'null');ok(L&&L.auto===false&&L.sz===1.2&&L.jm==='fixed','an old save (v36 controls, no auto field) loads: its layout kept, switching = buttons only');}

// ---- 1) nothing but a pass or Switch changes your penguin ----
match();freezeOpps();
{const p0=me();place(p0,-18,10);place(mates()[0],5,1);puck(8,0);let changes=0,last=G.player;
 for(let i=0;i<60*6;i++){step(1/60);if(G.player!==last){changes++;last=G.player;}}
 const mateHad=G.carry&&G.carry.team===G.mine&&G.carry!==p0;
 ok(changes===0&&G.player===p0,'buttons only: 6 s far from the puck while team-mates play it → your penguin never changes ('+changes+' changes'+(mateHad?', a team-mate even has the puck':'')+')');
 match();freezeOpps();save.set.ctl.auto=true;place(G.player,-18,10);place(mates()[0],5,1);puck(8,0);changes=0;last=G.player;
 for(let i=0;i<60*3;i++){step(1/60);if(G.player!==last){changes++;last=G.player;}}
 ok(changes>0,'auto switching setting on: the same situation switches you, as before v38 ('+changes+' changes in 3 s)');save.set.ctl.auto=false;}
// a whole stretch of real play with a simple "skate to the puck" player who never presses Switch / Pass
{const count=auto=>{match();save.set.ctl.auto=auto;let n=0,last=G.player;
   for(let i=0;i<60*30;i++){const p=G.player;if(p&&G.state==='play'){const dx=G.puck.x-p.x,dz=G.puck.z-p.z,l=Math.hypot(dx,dz)||1;input.x=dx/l;input.z=dz/l;}
     step(1/60);if(G.player!==last){n++;last=G.player;}}clear();save.set.ctl.auto=false;return n;};
 const a=count(true),m=count(false);
 ok(m===0&&a>0,'30 s of real play, no Switch / Pass pressed: '+a+' automatic switches with auto switching, '+m+' with buttons only');}

// ---- 2) Switch = the team-mate nearest the puck = the white ring ----
match();freezeOpps();
{const p=me(),[a,b]=mates();place(p,-15,0);place(a,5,4);place(b,0,-6);puck(6,3);
 PH.hkFrame();ok(PH.HKR.tgt===a,'the white ring sits on the team-mate nearest the puck');
 input.swap=true;tick();ok(G.player===a,'Switch → exactly that team-mate (NHL: closest to the puck)');
 puck(9,3);PH.hkFrame();ok(PH.HKR.tgt===b&&PH.hkSwapTarget(a)===b,'you are the nearest yourself → the ring and Switch move on to the next nearest');
 place(a,6.9,3,Math.PI/2);PH.hkFrame();ok(PH.HKR.tgt===null,'puck in your reach → no switch ring (the green pass ring is the one that matters)');}

// ---- 3) a pass hands control to the receiver ----
match();freezeOpps();
{const p=me(),m=mates()[0];place(p,0,0);place(m,9,0,-Math.PI/2);const f=front(p);puck(f[0],f[1]);tick();
 ok(G.carry===p,'setup: you carry the puck');
 input.x=1;input.pass=true;tick();input.x=0;
 ok(G.pass&&G.pass.from===p&&G.pass.to===m&&G.player===p,'pass → for a moment you still steer the passer');
 ticks(HK.sw+.02);ok(G.player===m,'…then the receiver ('+HK.sw+' s later, as before v38)');}

// ---- 4) a Shoot press right after your pass: control jumps to the receiver, the shot waits for the puck → one-timer ----
match();freezeOpps();
{const p=me(),m=mates()[0];place(p,-6,0);place(m,8,0,-Math.PI/2);const f=front(p);puck(f[0],f[1]);tick();
 input.x=1;input.pass=true;tick();input.x=0;ticks(.04);
 input.shoot=true;input.shootPress=true;tick();
 ok(G.player===m&&m.charging,'Shoot pressed right after your pass → control jumps to the receiver at once and the shot charges there');
 input.shoot=false;input.shootRel=true;tick();
 ok(m.bufShot&&m.bufShot.w&&!G.puck.shot,'released before the pass arrives → the shot waits for the puck (no whiff)');
 let t=0;while(!G.puck.shot&&t<2.5){tick();t+=FIXED;}
 const sh=G.puck.shot,sp=Math.hypot(G.puck.vx,G.puck.vz);
 ok(sh&&sh.by===m&&sh.oneT,'…and goes off as a ONE-TIMER the moment the puck arrives ('+t.toFixed(2)+' s later, '+sp.toFixed(1)+' m/s)');
 ok(sh&&sh.charge>=HK.otTap-1e-9&&sp>16,'a tapped one-timer is struck at '+Math.round(HK.otTap*100)+' % power (a tap shot is ≈ 13 m/s)');
 ok(G.stats.passOK>=1,'the pass still counts as completed');}
// one-timer toward the goal while skating: push the stick at the goal while the pass comes
match();freezeOpps();
{const p=me(),m=mates()[0],dir=G.mine.dir;place(p,-6*dir,-4);place(m,6*dir,0,Math.PI/2*(-dir));const f=front(p,1.2);
 p.heading=Math.atan2(m.x-p.x,m.z-p.z);const f2=front(p);puck(f2[0],f2[1]);tick();
 const ang=Math.atan2(m.x-p.x,m.z-p.z);input.x=Math.sin(ang);input.z=Math.cos(ang);input.pass=true;tick();
 input.x=0;input.z=0;ticks(.05);input.shoot=true;input.shootPress=true;tick();input.shoot=false;input.shootRel=true;input.x=dir;input.z=0;
 let t=0;while(!G.puck.shot&&t<2.5){tick();t+=FIXED;}clear();
 const sh=G.puck.shot;ok(sh&&sh.by===m&&G.puck.vx*dir>8,'one-timer with the stick toward the goal → the shot goes at the goal ('+(sh?(G.puck.vx*dir).toFixed(1):'-')+' m/s goalward)');}

// ---- 5) a double tap on Pass is not a one-touch pass ----
match();freezeOpps();
{const p=me(),m=mates()[0];place(p,0,0);place(m,9,0,-Math.PI/2);const f=front(p);puck(f[0],f[1]);tick();
 input.x=1;input.pass=true;tick();ticks(.08);input.pass=true;tick();input.x=0;
 ok(G.player===p&&!m.bufPass,'second Pass tap 0.1 s later → ignored (no early switch, nothing queued for the receiver)');
 ticks(HK.sw);ok(G.player===m,'control still moves to the receiver as usual');}

// ---- 6) a one-touch pass: Pass pressed while a pass comes to you ----
match();freezeOpps();
{const p=me(),[m,b]=mates();place(p,-11,0);place(m,10,0,-Math.PI/2);place(b,10,-9);const f=front(p);puck(f[0],f[1]);tick();
 input.x=1;input.pass=true;tick();input.x=0;ticks(HK.sw+.02);
 ok(G.player===m&&G.pass&&G.pass.to===m,'setup: you now steer the receiver while the pass is on its way');
 input.z=-1;input.pass=true;tick();
 ok(m.bufPass&&m.bufPass.w,'Pass pressed before it arrives → kept for the arrival');
 let t=0;while(!(G.pass&&G.pass.from===m)&&t<2){tick();t+=FIXED;}clear();
 ok(G.pass&&G.pass.from===m&&G.pass.to===b,'…one-touch pass to the team-mate the stick points at ('+t.toFixed(2)+' s)');}
// the pass that was coming is cut off → the queued shot is dropped quietly
match();freezeOpps();
{const p=me(),m=mates()[0];place(p,-6,0);place(m,8,0,-Math.PI/2);const f=front(p);puck(f[0],f[1]);tick();
 input.x=1;input.pass=true;tick();input.x=0;ticks(.04);input.shoot=true;input.shootPress=true;tick();input.shoot=false;input.shootRel=true;tick();
 const pk=G.puck;G.pass=null;pk.x=pk.ox=-20;pk.z=pk.oz=-10;pk.vx=pk.vz=0;tick();
 ok(!m.bufShot&&!pk.shot&&m.cd.shoot===0,'the pass is cut off → the waiting shot is dropped (no whiff, no cooldown)');}

// ---- 7) call for the pass ----
match();freezeOpps();
{const p=me(),m=mates()[0];place(p,6,3,-Math.PI/2);place(m,-4,0);const f=front(m);puck(f[0],f[1]);tick();
 ok(G.carry===m,'setup: an AI team-mate carries the puck');
 const x=PH.hkCtx(p);ok(x.pa===1&&x.sh===0,'→ the Pass button becomes 패스 요청 (call), Shoot stays Shoot');
 input.pass=true;tick();ok(G.callFor&&G.callFor.p===p&&!p.bufPass&&!G.pass,'Pass → the call goes out (not kept as a pass of your own)');
 let t=0;while(!(G.pass&&G.pass.to===p)&&t<1.5){tick();t+=FIXED;}
 ok(G.pass&&G.pass.from===m&&G.pass.to===p&&t>=HK.callDelay-1e-9&&t<.6,'the team-mate passes it to you ('+t.toFixed(2)+' s, reaction '+HK.callDelay+' s)');
 t=0;while(G.carry!==p&&t<2){tick();t+=FIXED;}
 ok(G.carry===p&&G.player===p&&!G.pass,'you receive it and keep it (the call is not passed straight on)');}
// a call expires
match();freezeOpps();
{const p=me(),m=mates()[0];place(p,6,3);place(m,-4,0);const f=front(m);puck(f[0],f[1]);tick();
 G.callFor={p,t:G.t-HK.callWin-.1};PH.hkCallPass(m);ok(G.callFor===null&&!G.pass,'a call older than '+HK.callWin+' s is forgotten');}

// ---- 8) poke check ----
match();
{const p=me(),o=opps()[0];freezeOpps(o);place(p,0,0,Math.PI/2);place(o,3,0,-Math.PI/2);const f=front(o);puck(f[0],f[1]);G.carry=o;
 const x=PH.hkCtx(p);ok(x.sh===1&&x.pa===0,'an opponent has the puck → Shoot becomes 뺏기 (poke)');
 const st0=save.cum.steals,sh0=G.stats.shots;input.shoot=true;input.shootPress=true;tick();input.shoot=false;input.shootRel=true;tick();
 ok(G.carry!==o&&!G.puck.shot&&G.stats.shots===sh0&&!p.charging,'poke in stick reach → the puck is knocked off their stick (not a shot, no charging)');
 let t=0;while(G.carry!==p&&t<1){tick();t+=FIXED;}
 ok(G.carry===p,'…and comes to your stick ('+t.toFixed(2)+' s)');ok(save.cum.steals===st0+1,'counted as a steal (퍽 도둑 achievement)');
 place(p,0,0,Math.PI/2);place(o,9,0,-Math.PI/2);const f2=front(o);puck(f2[0],f2[1]);G.carry=o;
 input.shoot=true;input.shootPress=true;tick();input.shoot=false;input.shootRel=true;tick();
 ok(G.carry===o&&p.slow>0&&p.cd.shoot>0&&!G.puck.shot,'poke out of reach → a whiff: they keep it and you are slowed a moment ('+HK.whiffSlow+' s)');}
// your own puck / loose puck: Shoot is a shot as before
match();freezeOpps();
{const p=me();place(p,0,0);const f=front(p);puck(f[0],f[1]);tick();const x=PH.hkCtx(p);ok(x.sh===0&&x.pa===0,'you carry the puck → Shoot and Pass are Shoot and Pass');
 input.shoot=true;input.shootPress=true;tick();input.shoot=false;input.shootRel=true;tick();ok(G.puck.shot&&G.puck.shot.by===p,'…and Shoot shoots');}

// ---- 9) the AI carrier looks for you a little more (buttons only) ----
match();freezeOpps();
{const p=me(),[a,b]=mates();place(a,0,0);place(p,8,5);place(b,8,-5);const f=front(a);puck(f[0],f[1]);G.carry=a;
 b.x=8.8;   // the other team-mate is slightly better placed
 const withYou=PH.bestMate(a,0,0,true);p.human=false;const asAI=PH.bestMate(a,0,0,true);p.human=true;
 ok(asAI===b&&withYou===p,'the AI carrier picks you over a slightly better placed team-mate (+'+HK.mate+' in its choice); as an AI you would not be picked');
 save.set.ctl.auto=true;const s1=PH.bestMate(a,0,0,true);save.set.ctl.auto=false;
 ok(s1===b,'auto switching (old behaviour): no preference for you');}

// ---- 10) camera: the puck stays the subject when your penguin is far away ----
match();freezeOpps();
{const p=me();puck(0,0);place(p,5,0);const w1=PH.hkCamW(p);place(p,19,0);const w2=PH.hkCamW(p);place(p,-40,0);const w3=PH.hkCamW(p);
 ok(Math.abs(w1-.4)<1e-9&&Math.abs(w2-.4*(1-11/22))<1e-9&&Math.abs(w3-.1)<1e-9,'camera weight on your penguin: 0.40 within 8 m (as before), 0.20 at 19 m, 0.10 far away');}

// ---- 11) friend match (host side) ----
match();freezeOpps();
{save.set.ctl.auto=true;G.net='host';ok(!PH.hkAuto(),'friend match: auto switching is never used (both players buttons only)');
 const red=G.mine.opp.key==='red'?G.mine.opp:G.mine,r=red.skaters;for(const q of r){q.frozen=false;q.boxed=false;}
 PH.netSetRemote(r[0]);place(r[0],0,6,Math.PI/2);place(r[1],8,6,-Math.PI/2);const f=front(r[0]);puck(f[0],f[1]);G.carry=r[0];
 PH.doPass(r[0],r[1]);ok(PH.NET.pend&&PH.NET.pend.to===r[1],'the friend passes → the receiver is queued for the friend');
 for(let i=0;i<Math.round((HK.sw+.02)/FIXED);i++)PH.hkNetAutoSwitch(FIXED);ok(PH.NET.rp===r[1],'…and the friend steers the receiver '+HK.sw+' s later');
 G.carry=r[2];r[2].x=r[1].x+2;PH.hkNetAutoSwitch(FIXED);ok(PH.NET.rp===r[1],'a team-mate of the friend picks up the puck → the friend keeps the same penguin');
 r[1].boxed=true;r[1].frozen=true;PH.hkNetAutoSwitch(FIXED);ok(PH.NET.rp&&PH.NET.rp!==r[1]&&!PH.NET.rp.boxed,'the friend\'s penguin goes to the box → the friend gets one that can play (the only forced change)');
 r[1].boxed=false;r[1].frozen=false;PH.netSetRemote(null);PH.NET.pend=null;G.net=null;save.set.ctl.auto=false;}

// ---- 12) settings text = code ----
{PH.CE.work=PH.ctlLoad({auto:true,swap:false});PH.CE.sel='shoot';PH.CE.fold=false;PH.CE.on=true;let h=PH.ctlEdHtml();
 ok(/data-ce="auto" data-v="true" class="on"/.test(h)&&h.includes(PH.hkSwapNote(PH.CE.work)),'editor: 펭귄 교체 shows 자동 selected and the auto note');
 ok(PH.hkSwapNote({auto:true,swap:false}).includes('자동 교체돼요')&&PH.hkSwapNote({auto:false,swap:false}).includes('패스할 때만'),'hidden Switch button: the note says what will happen in each mode');
 PH.CE.work=PH.ctlLoad(null);h=PH.ctlEdHtml();PH.CE.on=false;
 ok(/data-ce="auto" data-v="false" class="on"/.test(h)&&h.includes('버튼으로만'),'defaults: 버튼으로만 selected');}

console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
