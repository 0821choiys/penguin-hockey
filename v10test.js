const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {G,save,step,startMatch,input,doPass,performShot,simulate,FIXED,TT,DIFF}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const W=24,GW=2.8;
const sim=(sec,f)=>{const n=Math.round(sec/FIXED);for(let i=0;i<n;i++){G.t+=FIXED;if(G.state==='play')simulate(FIXED);if(f&&f()===false)return;}};
const reset=()=>{for(const p of G.pengs){p.ox=p.x;p.oz=p.z;}};
// ---- save defaults / version ----
ok(save.v===10&&save.set.arena==='auto'&&save.set.vol==='mid'&&save.set.vib===true&&save.set.flash===true&&Array.isArray(save.chalTypes),'v10 save defaults present');
ok(save.cum.cleanWin===0&&save.cum.comeback===0&&save.cum.oneTimer===0,'new cumulative counters default to 0');
// ---- B1: pause freezes game time; a pass in flight survives the pause ----
startMatch({mode:'quick',size:3,time:120,diff:'normal'});for(let i=0;i<60*3.4;i++)step(1/60);
ok(G.state==='play','match running');
{const p=G.player,m=G.mine.skaters.find(s=>s!==p);G.puck.x=p.x+Math.sin(p.heading);G.puck.z=p.z+Math.cos(p.heading);G.puck.vx=G.puck.vz=0;p.cd.pass=0;p.shotGrace=0;
 const sent=doPass(p,m),t0=G.t,tl=G.timeLeft;G.paused=true;for(let i=0;i<60*5;i++)step(1/60);
 ok(sent&&G.t===t0&&G.timeLeft===tl,'paused: game clock and match time frozen');
 G.paused=false;step(1/60);ok(!!G.pass,'pass in flight is still alive after a 5 s pause');}
// ---- personalities ----
ok(Object.keys(PH.TYPES).every(k=>TT[k]&&TT[k].plus&&TT[k].minus),'every penguin type has a strength and a weakness');
startMatch({mode:'practice',size:1,time:0,diff:'normal',noOpp:true,goalieOnly:true,noScoreOpp:true});for(let i=0;i<60*3.4;i++)step(1/60);
{const p=G.player;const chargeAfter=type=>{p.type=type;p.charging=true;p.charge=0;p.tr=null;input.shoot=true;PH.humanControl(p,.3);input.shoot=false;const c=p.charge;p.charging=false;p.charge=0;return c;};
 const cb=chargeAfter('basic'),cf=chargeAfter('fast');ok(Math.abs(cf/cb-1.15)<.01,'fast: charges 15% faster ('+cb.toFixed(3)+' -> '+cf.toFixed(3)+')');
 p.type='balanced';p.cd.dash=0;p.fall=0;p.slideT=0;PH.doDash(p);ok(Math.abs(p.cd.dash-3.6)<1e-6,'balanced: dash cooldown +0.4 s');p.type='basic';p.cd.dash=0;PH.doDash(p);ok(Math.abs(p.cd.dash-3.2)<1e-6,'basic: normal dash cooldown');}
// ---- one-timer ----
startMatch({mode:'quick',size:2,time:120,diff:'normal'});for(let i=0;i<60*3.4;i++)step(1/60);
{const p=G.player,dir=G.mine.dir;p.x=12*dir;p.z=0;p.heading=dir>0?Math.PI/2:-Math.PI/2;G.puck.x=p.x+1.1*dir;G.puck.z=0;G.puck.vx=G.puck.vz=0;p.cd.shoot=0;
 const before=save.cum.oneTimer;p.recvT=G.t-.3;performShot(p,dir,0,.5);ok(G.puck.shot&&G.puck.shot.oneT===true,'shot within 0.75 s of receiving = one-timer');
 ok(save.cum.oneTimer===before+1,'one-timer counts for the daily goal');
 p.cd.shoot=0;G.puck.x=p.x+1.1*dir;G.puck.z=0;G.puck.vx=G.puck.vz=0;p.shotGrace=0;p.recvT=G.t-2;performShot(p,dir,0,.5);ok(G.puck.shot&&!G.puck.shot.oneT,'late shot is not a one-timer');}
// ---- pass cut by the goalie is reported (chain resets) ----
{const p=G.player,m=G.mine.skaters.find(s=>s!==p),gk=G.mine.opp.goalie;G.chain=2;G.pass={from:p,to:m,t:G.t,d:8};PH.touchPuck(gk,8);ok(!G.pass&&G.chain===0,'pass touched by the opposing goalie = cut (chain reset)');}
// ---- goalie reads a long wind-up ----
startMatch({mode:'practice',size:1,time:0,diff:'hard',noOpp:true,goalieOnly:true,noScoreOpp:true});for(let i=0;i<60*3.4;i++)step(1/60);
{const p=G.player,dir=G.mine.dir,gk=G.mine.opp.goalie;p.x=W*dir-8*dir;p.z=0;const tz=2.2,ax=W*dir-p.x,az=tz-p.z;p.heading=Math.atan2(ax,az);G.puck.x=p.x+Math.sin(p.heading)*1.1;G.puck.z=p.z+Math.cos(p.heading)*1.1;
 p.charging=true;p.charge=.1;const r0=PH.gkRead(gk,gk.team);p.charge=.7;const r1=PH.gkRead(gk,gk.team);
 ok(!r0||r0.w<.05,'quick release is not readable');ok(r1&&r1.w>=DIFF.hard.gk.read*.95&&r1.z>1,'long wind-up is read toward the aimed side (w='+(r1&&r1.w.toFixed(2))+')');p.charging=false;}
// ---- AI interception ----
startMatch({mode:'quick',size:3,time:120,diff:'hard'});for(let i=0;i<60*3.4;i++)step(1/60);
{const p=G.player,m=G.mine.skaters.find(s=>s!==p),o=G.mine.opp.skaters[1];G.puck.x=0;G.puck.z=0;G.puck.vx=12;G.puck.vz=0;G.pass={from:p,to:m,t:G.t+0.001,d:10};
 o.x=4;o.z=2;o.fall=0;o.passive=false;let hit=0;for(let i=0;i<30;i++){o.ai.icptRoll=-1;G.pass.t+=1e-4;if(PH.aiIntercept(o))hit++;}
 ok(hit>8&&hit<26,'hard AI steps into a reachable pass lane about '+Math.round(DIFF.hard.icpt*100)+'% of the time ('+hit+'/30)');G.pass=null;}
// ---- collisions never teleport ----
{const a=G.pengs[0],b=G.pengs[1];a.x=0;a.z=0;b.x=.05;b.z=0;const ax=a.x,bx=b.x;PH.pengCollisions();ok(Math.abs(a.x-ax)<=.121&&Math.abs(b.x-bx)<=.121,'deep overlap is resolved gradually (≤0.12 m per step)');}
// ---- goal tags ----
startMatch({mode:'quick',size:2,time:120,diff:'normal'});for(let i=0;i<60*3.4;i++)step(1/60);
{const tm=G.mine;tm.opp.score=1;G.timeLeft=5;tm.score=1;const r=PH.classifyGoal(tm,null);ok(r.tags.includes('CLUTCH GOAL!')&&r.tags.includes('EQUALIZER!'),'late tying goal = CLUTCH + EQUALIZER');
 tm.score=2;const r2=PH.classifyGoal(tm,null);ok(r2.tags.includes('GO-AHEAD!'),'late go-ahead goal tagged');
 G.ot=true;tm.score=3;const r3=PH.classifyGoal(tm,null);ok(r3.tags.includes('OT WINNER!'),'overtime goal = OT WINNER');G.ot=false;G.timeLeft=90;
 G.hype.wasBehind=true;tm.score=2;tm.opp.score=1;const r4=PH.classifyGoal(tm,null);ok(r4.tags.includes('COMEBACK!'),'taking the lead after trailing = COMEBACK');
 const sh={by:G.player,charge:.3,t:G.t,deflected:false};G.hype.sg={};let r5;for(let i=0;i<3;i++)r5=PH.classifyGoal(tm,sh);ok(r5.tags.includes('HAT TRICK!'),'third goal by the same penguin = HAT TRICK');}
// ---- missions ----
const C=id=>PH.CHALLENGES.find(c=>c.id===id);
ok(['c5','c6','c7'].every(id=>C(id)),'3 new missions exist');
{save.cleared={};const pts0=save.points;startMatch({mode:'challenge',challenge:C('c5'),size:2,time:120,diff:'normal',oppTypes:['basic']});for(let i=0;i<60*3.4;i++)step(1/60);
 ok(G.mine.opp.goalie&&G.mine.opp.skaters.length===2,'clean-sheet mission is a real 2v2 with goalies');
 PH.achCheck();const pts1=save.points;G.puck.x=-G.mine.dir*(W+.6);G.puck.z=0;G.puck.vx=G.puck.vz=0;PH.checkGoal();
 ok(G.state==='over'&&G.result&&G.result.ok===false&&save.points===pts1+(G.result.achP|0)&&!save.cleared.c5,'conceding fails the clean-sheet mission immediately, no points');}
{startMatch({mode:'challenge',challenge:C('c6'),size:2,time:100,diff:'normal',oppTypes:['basic']});
 ok(G.mine.opp.score===1&&G.mine.score===0,'comeback mission starts 0:1');for(let i=0;i<60*3.4;i++)step(1/60);
 const pts0=save.points;G.mine.score=2;G.timeLeft=.02;for(let i=0;i<5;i++)step(1/60);
 ok(G.state==='over'&&G.result.ok&&save.cleared.c6&&save.points===pts0+60+(G.result.achP|0),'winning at time-up clears the comeback mission (+60P first time)');}
{startMatch({mode:'challenge',challenge:C('c6'),size:2,time:100,diff:'normal',oppTypes:['basic']});for(let i=0;i<60*3.4;i++)step(1/60);
 G.mine.score=1;G.timeLeft=.02;for(let i=0;i<5;i++)step(1/60);ok(G.state==='over'&&!G.result.ok,'a draw does not clear the comeback mission (no overtime)');}
{save.chalTypes=[];save.types=['basic','fast','strong'];const c7=C('c7');const pts=[];
 for(const k of['basic','basic','fast','strong']){save.type=k;startMatch({mode:'challenge',challenge:c7,size:1,time:75,diff:'easy',oppTypes:['basic']});for(let i=0;i<60*3.4;i++)step(1/60);const p0=save.points;G.mine.score=1;G.timeLeft=.02;for(let i=0;i<5;i++)step(1/60);pts.push(save.points-p0-(G.result.achP|0));}
 ok(pts.join(',')==='10,5,10,60'&&save.cleared.c7&&save.chalTypes.length===3,'펭귄 마스터: progress 10P per new penguin, repeat 5P, clear +60P on the 3rd ('+pts.join(',')+')');}
// ---- arenas ----
{G.tour={round:PH.TOUR.length-1,champPaid:false};const r=PH.TOUR[G.tour.round];startMatch({mode:'tour',size:3,time:120,diff:r.diff,oppTypes:r.types,todFixed:r.tod});ok(G.cfg.final&&G.arena==='final','tournament final is played in the final arena');
 G.tour={round:0,champPaid:false};startMatch({mode:'tour',size:3,time:120,diff:'easy',oppTypes:['basic']});ok(!G.cfg.final&&G.arena==='classic','earlier rounds use the normal rink');
 save.set.arena='final';save.cleared.tour=false;ok(PH.arenaPick({mode:'quick'})==='classic','locked final arena falls back to the normal rink');
 save.cleared.tour=true;ok(PH.arenaPick({mode:'quick'})==='final','final arena selectable after winning a tournament');
 save.set.arena='blizzard';startMatch({mode:'quick',size:2,time:60,diff:'easy'});for(let i=0;i<60*4;i++)step(1/60);ok(G.wx.mode==='blizzard'&&G.wx.target>.8,'blizzard arena locks the weather');save.set.arena='auto';}
// ---- comfort ----
{save.set.shake='off';ok(PH.shakeK()===0,'shake off');save.set.shake='low';ok(PH.shakeK()===.4,'shake low');save.set.motion=true;ok(PH.shakeK()===0,'reduced motion disables shake');save.set.motion=false;save.set.shake='on';}
// ---- 큰바다쇠오리 code ----
{save.types=save.types.filter(k=>k!=='auk');save.codes=[];save.dev.got=false;
 ok(PH.redeemCode('nope')===false&&!save.types.includes('auk'),'wrong code gives nothing');
 ok(PH.redeemCode('  YSGames777 ')===true&&save.types.includes('auk')&&save.lv.auk===10,'ysgames777 (any case/spaces) grants 큰바다쇠오리 Lv10');
 const n=save.types.length;ok(PH.redeemCode('ysgames777')===false&&save.types.length===n,'code works only once');
 ok(PH.cardOvr('auk',10)===999&&PH.cardOvr('strong',10)<=99,'큰바다쇠오리 OVR 999, others still capped at 99');
 save.type='auk';startMatch({mode:'quick',size:1,time:60,diff:'easy'});for(let i=0;i<60*4;i++)step(1/60);
 ok(G.player.type==='auk'&&isFinite(G.player.x)&&Math.hypot(G.player.vx,G.player.vz)<40,'큰바다쇠오리 plays normally (physics stay stable)');save.type='basic';}
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
