// v36: controls — save field, joystick curve, aim where the stick points, shot / pass buffer, easy handling (human only,
// both players online), editor numbers = code values
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,save,step,startMatch,simulate,movePeng,input,FIXED,TYPES,CTLV}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const near=(a,b,e)=>Math.abs(a-b)<=(e||1e-6);
// ---- save field ----
let c=PH.ctlLoad(undefined);
ok(c.sz===1&&c.op===1&&c.js===1&&c.jm==='follow'&&c.sens==='mid'&&c.easy===true&&c.swap===true&&!Object.keys(c.P).length,'no saved controls → defaults (follow ring, mid sensitivity, easy handling on)');
c=PH.ctlLoad({sz:9,op:-1,js:'1.2',jm:'x',sens:'high',easy:false,swap:false,P:{shoot:[.8,.9,3],pass:['a',1],bogus:[.1,.1],joy:[2,-1]},L:'no'});
ok(c.sz===1.5&&c.op===.3&&c.js===1.2&&c.jm==='follow'&&c.sens==='high'&&c.easy===false&&c.swap===false,'out-of-range values clamped, unknown values → defaults');
ok(c.P.shoot[0]===.8&&c.P.shoot[2]===1.6&&!c.P.pass&&!c.P.bogus&&c.P.joy[0]===1&&c.P.joy[1]===0&&!Object.keys(c.L).length,'layout entries: kept and clamped to the screen, broken / unknown ones dropped');
const run=sv=>{const r=require('child_process').spawnSync(process.execPath,['-e',"const PH=require('./harness.js');console.log('@@'+JSON.stringify(PH.save.set.ctl));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(sv)}),encoding:'utf8'});const m=/@@(.*)/.exec(r.stdout||'');return m?JSON.parse(m[1]):null;};
let L=run({v:10,points:5,set:{sound:false}});ok(L&&L.sz===1&&L.jm==='follow'&&L.easy===true,'old save without controls loads with the defaults');
L=run({v:10,points:5,set:{ctl:{sz:1.25,jm:'fixed',sens:'low',P:{shoot:[.7,.8,1.2]},L:{joy:[.2,.7,1]}}}});
ok(L&&L.sz===1.25&&L.jm==='fixed'&&L.sens==='low'&&L.P.shoot[2]===1.2&&L.L.joy[0]===.2,'saved controls come back after a restart '+JSON.stringify(L&&L.P));
// ---- joystick response curve ----
const cv=(f,s)=>PH.ctlCurve(f*100,0,100,s)[0];
ok(cv(.08,'mid')===0&&cv(.1,'mid')===0,'dead zone: up to 10 % of the radius does nothing');
ok(near(cv(.4,'mid'),.5,1e-9)&&near(cv(.7,'mid'),1,1e-9)&&cv(1,'mid')===1,'mid: 40 % push → 0.50, full speed from 70 %');
ok(near(cv(.7,'low'),(.7-.1)/.9,1e-9)&&cv(1,'low')===1&&cv(.5,'high')===1,'low: full only at the edge · high: full from 50 %');
{const o=PH.ctlCurve(30,40,100,'mid'),m=Math.hypot(o[0],o[1]);ok(near(o[0]/m,.6,1e-9)&&near(o[1]/m,.8,1e-9),'the direction is kept exactly');}
ok(near(CTLV.sens.mid,.7)&&near(CTLV.dz,.1),'numbers in the code match the comments (dead zone 10 %, mid 70 %)');
// ---- aim where the stick points ----
startMatch({mode:'practice',size:1,time:0,diff:'normal',noOpp:true,goalieOnly:true,noScoreOpp:true});for(let i=0;i<60*3.4;i++)step(1/60);
const p=G.player;save.set.assist=false;G.mouse.active=false;
p.heading=Math.PI/2;p.ix=0;p.iz=-1;let a=PH.humanAim(p);ok(near(a[0],0,1e-9)&&near(a[1],-1,1e-9),'stick held up while facing right → aim up (was: right)');
p.ix=p.iz=0;a=PH.humanAim(p);ok(near(a[0],1,1e-9),'stick released → aim = facing');
p.ix=.2;p.iz=0;a=PH.humanAim(p);ok(near(a[0],1,1e-9),'tiny stick (≤ 0.3) → still the facing');
G.mouse.active=true;G.mouse.t=performance.now();G.mouse.wx=p.x;G.mouse.wz=p.z+5;p.ix=0;p.iz=-1;a=PH.humanAim(p);ok(near(a[1],1,1e-9),'PC mouse aim still wins over the keys');G.mouse.active=false;
// ---- shot pressed a moment early ----
const sim=()=>{G.t+=FIXED;simulate(FIXED);};   // like the main loop: game time advances with each physics step
const pk=G.puck,setup=(dist,vx)=>{pk.x=4;pk.z=0;pk.vx=pk.vz=0;pk.shot=null;pk.last=null;G.carry=null;p.x=4-dist;p.z=0;p.vx=vx;p.vz=0;p.heading=Math.PI/2;p.cd.shoot=0;p.cd.pass=0;p.fall=0;p.charging=false;p.charge=0;p.bufShot=null;p.bufPass=null;p.shotGrace=0;
  for(const q of G.pengs)if(q!==p&&!q.goalie){q.x=-20;q.z=8;}};
const press=k=>{if(k==='shoot'){input.shoot=true;input.shootPress=true;sim();input.shoot=false;input.shootRel=true;}else input.pass=true;input.x=1;input.z=0;};
setup(3.1,9);press('shoot');sim();
ok(!pk.shot&&p.bufShot&&p.anim.swing<1,'shoot released 0.6 m out of reach → no whiff yet, the shot is kept');
let t=0;while(!pk.shot&&t<.3){sim();t+=FIXED;}
ok(pk.shot&&pk.shot.by===p&&Math.hypot(pk.vx,pk.vz)>8&&t<=CTLV.buf+1e-9,'…and fires when the puck comes in reach ('+Math.round(t*1000)+' ms later)');
setup(8,0);input.x=0;press('shoot');input.x=0;for(let i=0;i<Math.round((CTLV.buf+.05)/FIXED);i++)sim();
ok(!pk.shot&&!p.bufShot&&p.cd.shoot>0,'never in reach → the normal whiff after '+Math.round(CTLV.buf*1000)+' ms');
// ---- pass pressed a moment early ----
startMatch({mode:'quick',size:2,time:120,diff:'normal',oppTypes:['basic','basic']});for(let i=0;i<60*3.4;i++)step(1/60);
{const p=G.player,m=G.mine.skaters.find(s=>s!==p),pk=G.puck;
 for(const o of G.mine.opp.skaters){o.x=-25;o.z=-10;o.vx=o.vz=0;o.frozen=true;}
 pk.x=4;pk.z=0;pk.vx=pk.vz=0;G.carry=null;p.x=0.9;p.z=0;p.vx=9;p.vz=0;p.heading=Math.PI/2;p.cd.pass=0;p.bufPass=null;m.x=12;m.z=6;m.vx=m.vz=0;G.pass=null;
 input.x=1;input.z=0;input.pass=true;sim();
 ok(!G.pass&&p.bufPass,'pass pressed out of reach → kept, not wasted');
 let t=0;while(!G.pass&&t<.4){sim();t+=FIXED;}
 ok(G.pass&&G.pass.from===p&&G.pass.to===m,'…and goes to the teammate when the puck arrives ('+Math.round(t*1000)+' ms)');
 for(const o of G.mine.opp.skaters)o.frozen=false;input.x=0;}
// ---- easy handling ----
startMatch({mode:'practice',size:1,time:0,diff:'normal',noOpp:true,goalieOnly:true,noScoreOpp:true});for(let i=0;i<60*3.4;i++)step(1/60);
const P2=G.player,gk=G.pengs.find(q=>q.goalie);
PH.ctl().easy=true;ok(PH.ctlEasy(P2)===CTLV.easy&&PH.ctlEasy(gk)===null,'easy handling: the human skater yes, goalies no');
PH.ctl().easy=false;ok(PH.ctlEasy(P2)===null,'switched off → classic handling');
G.net='host';ok(PH.ctlEasy(P2)===CTLV.easy,'online: on even if this player switched it off (same for both)');
const rm=G.pengs.find(q=>q!==P2&&!q.goalie)||P2;const was=[rm.human,rm.remote];rm.human=false;rm.remote=true;ok(PH.ctlEasy(rm)===CTLV.easy,'online: the friend’s penguin gets it too');rm.human=was[0];rm.remote=was[1];G.net=null;
const feel=easy=>{PH.ctl().easy=easy;const q=P2;let DX=0;const runF=(ix,iz,sec,f)=>{q.ix=ix;q.iz=iz;DX=0;let t=0;for(;t<sec;t+=FIXED){q.x=0;q.z=0;movePeng(q,FIXED);DX+=q.x;if(f&&f())break;}return t;};
  const rs=(vx,hd)=>{q.vx=vx;q.vz=0;q.heading=hd;q.fall=0;q.slow=0;q.dashT=0;q.slideT=0;q.boostT=0;};
  rs(0,Math.PI/2);runF(1,0,4);const cap=Math.hypot(q.vx,q.vz);
  rs(cap,Math.PI/2);const t90=runF(0,1,4,()=>Math.abs(Math.atan2(q.vx,q.vz))<.26&&q.vz>.5*cap);const over=DX;
  rs(cap,Math.PI/2);const rev=runF(-1,0,4,()=>q.vx<-.5*cap);
  rs(cap,Math.PI/2);runF(0,0,8,()=>Math.hypot(q.vx,q.vz)<1);const stop=DX;
  return {cap,t90,over,rev,stop};};
console.log('  rink condition in this match: '+G.cond+' grip '+PH.CF.grip);Object.assign(PH.CF,PH.CF0);   // measure on normal ice
const C0=feel(false),C1=feel(true);
console.log('  classic',JSON.stringify(C0,(k,v)=>typeof v==='number'?+v.toFixed(2):v));console.log('  easy   ',JSON.stringify(C1,(k,v)=>typeof v==='number'?+v.toFixed(2):v));
Object.assign(PH.CF,PH.CF0,PH.COND.thin.f);const T1=feel(true);Object.assign(PH.CF,PH.CF0);
console.log('  easy, thin ice',JSON.stringify(T1,(k,v)=>typeof v==='number'?+v.toFixed(2):v));
ok(T1.over>C1.over*1.3&&T1.stop>C1.stop*1.3,'easy handling on thin ice still slides more (turn slide '+C1.over.toFixed(1)+' → '+T1.over.toFixed(1)+' m, stop '+C1.stop.toFixed(1)+' → '+T1.stop.toFixed(1)+' m)');
ok(Math.abs(C1.cap/C0.cap-1)<.01,'top speed unchanged (the speed stat means the same)');
ok(C1.t90<C0.t90*.5&&C1.over<C0.over*.55,'90° turn: '+C0.t90.toFixed(2)+' s / '+C0.over.toFixed(1)+' m slide → '+C1.t90.toFixed(2)+' s / '+C1.over.toFixed(1)+' m');
ok(C1.rev<C0.rev*.7&&C1.stop<C0.stop*.7,'reverse '+C0.rev.toFixed(2)+' → '+C1.rev.toFixed(2)+' s · stop '+C0.stop.toFixed(1)+' → '+C1.stop.toFixed(1)+' m');
// AI skaters move exactly the same with the setting on or off
{startMatch({mode:'quick',size:3,time:120,diff:'normal',oppTypes:['basic','fast','strong']});for(let i=0;i<60*3.4;i++)step(1/60);
 const ai=G.mine.opp.skaters[0],snap=()=>({x:ai.x,z:ai.z,vx:ai.vx,vz:ai.vz,h:ai.heading});
 const tr=easy=>{PH.ctl().easy=easy;ai.x=0;ai.z=0;ai.vx=8;ai.vz=0;ai.heading=Math.PI/2;ai.ix=0;ai.iz=1;for(let i=0;i<60;i++)movePeng(ai,FIXED);return snap();};
 const A=tr(true),B=tr(false);ok(A.x===B.x&&A.z===B.z&&A.vx===B.vx&&A.h===B.h,'AI skaters: identical movement with the setting on or off');}
PH.ctl().easy=true;
// online: the friend's stick direction is the aim on the host
{const q=G.mine.opp.skaters[1],N=PH.NET;N.rin={x:0,z:-1,ax:0,az:0,sh:0,c:[0,0,0,0,0,0]};N.vin={};N.rseen=[0,0,0,0,0,0];q.remote=true;q.heading=Math.PI/2;save.set.assist=false;
 PH.remoteControl(q,FIXED);const a=PH.humanAim(q);ok(near(a[1],-1,1e-9),'online: the friend’s stick direction is used for the aim on the host');q.remote=false;}
// ---- editor shows the values the code uses ----
PH.CE.work=PH.ctlLoad({sz:1.3,op:.6,js:.85,sens:'high',jm:'fixed'});PH.CE.sel='shoot';PH.CE.fold=false;PH.CE.on=true;
const h=PH.ctlEdHtml();PH.CE.on=false;
ok(h.includes('130%')&&h.includes('60%')&&h.includes('85%')&&/data-ce="sens" data-v="high" class="on"/.test(h)&&/data-ce="jm" data-v="fixed" class="on"/.test(h),'editor: sliders and choices show the stored values');
save.set.ctl=PH.ctlLoad({sz:1.2,sens:'low'});PH.ctlRow();ok(true,'settings row renders without errors');
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
