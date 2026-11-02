// v22: hockey rules + referee — fouls, penalty box, power play, penalty shot, offside, icing, faceoffs
const {execFileSync}=require('child_process');
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {save,G,step,startMatch,RULE}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60);};
save.rl.intro=1;save.set.rules='full';
const W=24,D=13;
function match(o){startMatch(Object.assign({mode:'quick',size:3,time:180,diff:'normal',tag:'q',oppTypes:['basic','fast','strong']},o||{}));let n=0;while(G.state!=='play'&&n++<600)step(1/60);
  for(const p of G.pengs){p.vx=p.vz=0;p.fall=0;}}
const blue=()=>G.teams.blue,red=()=>G.teams.red;
function still(){for(const p of G.pengs){p.vx=p.vz=0;p.ix=p.iz=0;p.dashT=0;p.slideT=0;p.ramT=0;p.fall=0;p._sl=0;}G.carry=null;}
function park(){   // everybody far from the action, puck loose at centre
  still();const pk=G.puck;pk.x=0;pk.z=0;pk.vx=pk.vz=0;pk.last=null;pk.lastTeam=null;pk.lastT=G.t;pk.shot=null;
  blue().skaters.forEach((p,i)=>{p.x=-4-i*2;p.z=-8+i*3;});red().skaters.forEach((p,i)=>{p.x=4+i*2;p.z=8-i*3;});G.rl.src=null;G.rl.lastT=pk.lastT;
}
const toStopEnd=()=>{let n=0;while(G.state==='stop'&&n++<600)step(1/60);};
const toPlay=()=>{let n=0;while(G.state!=='play'&&n++<900)step(1/60);};

// ---- 1. where the rules apply, the numbers ----
match();
ok(PH.rulesMode()==='full'&&PH.rulesActive(),'quick match: full rules, referee active');
save.set.rules='fouls';ok(PH.rulesMode()==='fouls'&&PH.rulesOn(false)&&!PH.rulesOn(true),'setting "반칙만": fouls only (no offside / icing)');
save.set.rules='off';ok(PH.rulesMode()==='off'&&!PH.rulesActive(),'setting "끄기": no referee');save.set.rules='full';
ok([60,120,180,300].map(PH.penFor).join()==='15,15,20,30'&&PH.penSecs()===20,'penalty time 15/15/20/30 s for 1/2/3/5 min matches (3 min → '+PH.penSecs()+' s)');
{const h=PH.howV22();ok(h.includes('1분 15초')&&h.includes('3분 20초')&&h.includes('5분 30초')&&h.includes(RULE.delayMax+'초')&&h.includes(RULE.psT+'초'),'help text prints the same numbers the rules use');}

// ---- 2. tripping → delayed penalty → box → power play → back on time ----
park();
{const v=blue().skaters[1],h=red().skaters[0];v.x=0;v.z=4;h.x=-1;h.z=4;h.slideT=.5;h._sl=G.t;
 ok(PH.foulKind(h,v)==='trip','slide tackle that takes the player before the puck = tripping');
 PH.bumpFx(v,h,10);
 ok(v.fall>0&&G.rl.delayed&&G.rl.delayed.k==='trip'&&G.state==='play','victim down, referee arm up: delayed penalty, play goes on');
 PH.rulesHud();
 const pk=G.puck;pk.last=red().skaters[2];pk.lastTeam=red();pk.lastT=G.t+.01;PH.rulesSim(1/60);
 ok(G.state==='stop'&&G.rl.stop&&G.rl.stop.d.res==='box','offending team touches the puck → whistle, call = '+(G.rl.stop&&G.rl.stop.d.res));
 toStopEnd();
 ok(h.boxed&&h.frozen&&h.z<-D&&G.state==='ready','offender sits in the penalty box behind the boards ('+h.x.toFixed(1)+','+h.z.toFixed(1)+')');
 ok(Math.abs(pk.x-(-red().dir*RULE.dotE))<.01&&Math.abs(Math.abs(pk.z)-RULE.dotZ)<.01,'faceoff in the offending team\'s end zone ('+pk.x+','+pk.z+')');
 ok(PH.onIce(blue())===3&&PH.onIce(red())===2&&PH.shortH(red()),'power play: 3 on 2');
 toPlay();const t0=G.rl.box[0].t;let pf=0,of=0;for(let i=0;i<180;i++){const st=G.state;step(1/60);if(st==='play'&&G.state==='play')pf++;else of++;}
 ok(Math.abs(G.rl.box[0].t-(t0-pf/60))<.12,'box clock runs only while play runs ('+t0.toFixed(1)+' → '+G.rl.box[0].t.toFixed(2)+' after '+(pf/60).toFixed(2)+' s of play, '+(of/60).toFixed(2)+' s stopped)');
 for(const p of G.pengs)if(!p.goalie&&!p.boxed){p.x=0;p.z=0;}
 // run the rest of the penalty (calls are switched off so nothing else interrupts)
 const e=G.rl.box[0];e.t=.5;save.set.rules='full';G.rl.delayed=null;
 let n=0;while(h.boxed&&n++<1800){step(1/60);}
 ok(!h.boxed&&!h.frozen&&Math.abs(h.z)<D,'penalty over → back on the ice');}

// ---- 3. interference vs a clean check, clean slide ----
match();park();
{const v=blue().skaters[0],h=red().skaters[0];h.dashT=.3;
 ok(PH.foulKind(h,v)==='inter','dash that floors a player without the puck = interference');
 G.carry=v;ok(PH.foulKind(h,v)===null,'the same hit on the puck carrier is a legal check');G.carry=null;
 const pk=G.puck;h.dashT=0;h.slideT=.5;h._sl=G.t-.2;pk.last=h;pk.lastT=G.t-.1;ok(PH.foulKind(h,v)===null,'slide that played the puck first is clean');
 h.slideT=0;ok(PH.foulKind(h,v)===null,'ordinary contact is never called');}

// ---- 4. breakaway foul → penalty shot (clock stopped) → goal ----
match();park();
{const v=blue().skaters[0],h=red().skaters[0],d=blue().dir;
 for(const o of red().skaters)if(o!==h){o.x=-d*10;o.z=0;}
 v.x=d*12;v.z=1;h.x=d*10.5;h.z=1;G.carry=v;const pk=G.puck;pk.x=v.x+d*1;pk.z=1;h.slideT=.5;h._sl=G.t;
 ok(PH.breakaway(v,h),'carrier alone in on the goalie, hit from behind = breakaway');
 G.carry=null;pk.last=v;pk.lastTeam=blue();pk.lastT=G.t;   // possession, but nobody carrying: delayed
 PH.rulesFoul(h,v);ok(G.rl.delayed&&G.rl.delayed.ps,'foul flagged as a penalty-shot foul');
 G.rl.delayed.t-=RULE.delayMax+1;PH.rulesSim(1/60);ok(G.state==='stop'&&G.rl.stop.d.res==='ps','whistle at the latest after '+RULE.delayMax+' s → penalty shot');
 toStopEnd();
 ok(G.ps&&G.ps.s===v&&!v.frozen&&G.pengs.filter(p=>!p.goalie&&p!==v).every(p=>p.frozen),'penalty shot: shooter alone with the goalie');
 ok(G.player===v,'the player shoots their own penalty shot');
 toPlay();const tl=G.timeLeft;run(1);ok(G.timeLeft===tl,'game clock stopped during the penalty shot');
 const g=red().goalie;g.x=g.hx;g.z=-2.4;pk.x=d*(W+.6);pk.z=.5;pk.vx=d*8;pk.vz=0;PH.checkGoal();
 ok(G.state==='goal'&&blue().score===1&&!G.ps&&G.rl.st.blue.psg===1,'penalty-shot goal counts');
 let n=0;while(G.state!=='play'&&n++<900)step(1/60);
 ok(G.pengs.every(p=>!p.frozen),'after the goal everyone is back for the restart');}
// penalty shot miss → faceoff
match();park();
{const v=blue().skaters[0],h=red().skaters[0];PH.psStart(blue(),v,2);toPlay();G.ps.t=RULE.psT+.1;PH.psFrame(1/60);
 ok(G.state==='stop'&&G.rl.stop.kind==='psEnd','missed / timed-out penalty shot ends the attempt');toStopEnd();
 ok(!G.ps&&G.state==='ready'&&G.pengs.every(p=>!p.frozen||p.boxed)&&Math.abs(G.puck.x-blue().dir*RULE.dotE)<.01,'… then a faceoff in that end, everyone back');}

// ---- 5. power-play goal frees the penalised player; goal on the delayed call wipes it out ----
match();park();
{const h=red().skaters[1];PH.boxSend(h,20);ok(h.boxed&&PH.onIce(red())===2,'red player in the box');
 const pk=G.puck,d=blue().dir;pk.x=d*(W+.6);pk.z=0;pk.vx=d*5;PH.checkGoal();
 ok(blue().score===1&&!h.boxed&&G.rl.st.blue.ppg===1,'power-play goal: the penalised player returns at once');}
match();park();
{const v=blue().skaters[0],h=red().skaters[0];h.dashT=.3;PH.rulesFoul(h,v);ok(G.rl.delayed&&G.rl.delayed.k==='inter','delayed interference call');
 const pk=G.puck,d=blue().dir;pk.x=d*(W+.6);pk.z=0;pk.vx=d*5;PH.checkGoal();
 ok(blue().score===1&&!G.rl.delayed&&G.rl.box.length===0,'goal during the delayed penalty: the penalty is cancelled');}

// ---- 6. goaltender interference → no goal ----
match();park();
{const s=blue().skaters[0],g=red().goalie,d=blue().dir;g.x=d*(W-1.5);g.z=0;s.x=g.x-d*1.3;s.z=0;s.dashT=.3;
 PH.rulesContact(s,g,8);ok(G.rl.delayed&&G.rl.delayed.k==='gi','charging into the goalie in the crease = goaltender interference');
 const pk=G.puck;pk.x=d*(W+.6);pk.z=0;pk.vx=d*5;PH.checkGoal();
 ok(blue().score===0&&G.state==='stop'&&G.rl.stop.d.noGoal,'the goal on that play is disallowed and the penalty called');}

// ---- 7. offside (immediate when carried in, delayed + tag-up when shot in) ----
match();park();
{const d=blue().dir,c=blue().skaters[0],m=blue().skaters[1],pk=G.puck;
 m.x=d*12;m.z=-5;c.x=d*7.2;c.z=0;pk.x=d*8.6;pk.z=0;G.carry=c;pk.last=c;pk.lastTeam=blue();PH.rulesSim(1/60);
 pk.x=d*9.0;PH.rulesSim(1/60);
 ok(G.state==='stop'&&G.rl.stop.kind==='off','carried in with a teammate already inside → offside');
 toStopEnd();ok(Math.abs(pk.x-d*RULE.dotN)<.01,'faceoff outside the blue line (neutral spot '+pk.x+')');}
match();park();
{const d=blue().dir,s=blue().skaters[0],m=blue().skaters[1],pk=G.puck;
 m.x=d*12;m.z=-5;s.x=d*5;pk.x=d*8.5;pk.z=0;pk.last=s;pk.lastTeam=blue();pk.lastT=G.t;PH.rulesSim(1/60);pk.x=d*9.2;pk.vx=d*6;PH.rulesSim(1/60);
 ok(G.rl.off&&G.state==='play','puck shot in with a teammate inside → delayed offside (play on)');
 m.x=d*7;PH.rulesSim(1/60);ok(!G.rl.off&&G.state==='play','everyone back over the line → tag-up, offside cancelled');
 m.x=d*12;pk.x=d*5;PH.rulesSim(1/60);pk.x=d*9.2;pk.last=s;pk.lastTeam=blue();PH.rulesSim(1/60);
 ok(G.rl.off,'flag again');pk.last=m;pk.lastTeam=blue();pk.lastT=G.t+.01;PH.rulesSim(1/60);ok(G.state==='stop'&&G.rl.stop.kind==='off','an attacker touches it before tagging up → whistle');}

// ---- 8. icing ----
function iceShot(){const d=blue().dir,s=blue().skaters[0],pk=G.puck;s.x=-d*5;s.z=0;pk.x=-d*4;pk.z=1;pk.last=s;pk.lastTeam=blue();pk.lastT=G.t+.001;PH.rulesSim(1/60);
  for(const p of red().skaters){p.x=0;p.z=-11;}for(const p of blue().skaters)if(p!==s){p.x=0;p.z=11;}
  pk.x=d*(RULE.gl+.5);pk.z=6;pk.vx=d*14;pk.vz=0;PH.rulesSim(1/60);pk.vx=-d*3;PH.rulesSim(1/60);}
match();park();iceShot();
ok(G.state==='stop'&&G.rl.stop.kind==='ice','shot from behind the red line, untouched past the goal line → icing');
toStopEnd();ok(Math.abs(G.puck.x-(-blue().dir*RULE.dotE))<.01,'faceoff in the icing team\'s own end');
match();park();PH.boxSend(blue().skaters[2],20);iceShot();ok(G.state==='play'&&!G.rl.ice,'a shorthanded team may ice the puck');
match();park();
{const d=blue().dir,s=blue().skaters[0],pk=G.puck;s.x=-d*5;pk.x=-d*4;pk.z=1;pk.last=s;pk.lastTeam=blue();pk.lastT=G.t+.001;PH.rulesSim(1/60);pk.x=d*(RULE.gl+.5);pk.vx=d*14;PH.rulesSim(1/60);
 ok(G.rl.ice,'icing pending');const g=red().goalie;pk.last=g;pk.lastTeam=red();pk.lastT=G.t+.01;PH.rulesSim(1/60);ok(!G.rl.ice&&G.state==='play','the goalie plays it → icing waved off');}
save.set.rules='fouls';match();park();iceShot();ok(G.state==='play','"반칙만": no icing');save.set.rules='full';
match();park();
{const d=blue().dir,s=blue().skaters[0],pk=G.puck,g=red().goalie;s.x=-d*5;pk.x=-d*4;pk.z=.5;pk.last=s;pk.lastTeam=blue();pk.lastT=G.t+.001;PH.rulesSim(1/60);
 g.x=g.hx;g.z=-2.6;pk.x=d*(W-.6);pk.z=.5;pk.vx=d*2;pk.vz=0;const s0=blue().score;for(let i=0;i<90&&G.state==='play';i++)step(1/60);
 ok(blue().score===s0+1&&G.rl.calls.indexOf('ice')<0,'a slow puck from the own half that rolls into the net is a goal, not icing');}

// ---- 9. stacking, 1 vs 1, shootout and match end ----
match();park();
{PH.boxSend(red().skaters[0],20);const h=red().skaters[1],v=blue().skaters[0];h.dashT=.3;G.carry=h;PH.rulesFoul(h,v);
 ok(G.state==='stop'&&G.rl.stop.d.res==='stack','second penalty while one is in the box → time added (stack)');
 const t0=G.rl.box[0].t;toStopEnd();ok(Math.abs(G.rl.box[0].t-(t0+PH.penSecs()))<.01&&!h.boxed&&PH.onIce(red())===2,'box time +'+PH.penSecs()+' s, still 3 on 2');}
match({size:1});
{const v=blue().skaters[0],h=red().skaters[0];h.dashT=.3;G.carry=h;PH.rulesFoul(h,v);ok(G.state==='stop'&&G.rl.stop.d.res==='ps1','1 vs 1: a minor becomes a penalty shot');}
match({size:1});
{const s=blue().skaters[0],g=red().goalie,d=blue().dir;g.x=d*(W-1.5);g.z=0;s.x=g.x-d*1.3;s.z=0;s.dashT=.3;G.carry=null;G.puck.x=0;G.puck.z=8;G.puck.last=null;
 PH.rulesContact(s,g,8);G.rl.delayed.t-=99;PH.rulesSim(1/60);toStopEnd();ok(G.ps&&G.ps.s===red().skaters[0]&&!G.ps.s.goalie,'1 vs 1 goalie interference: the penalty shot is taken by a skater, not the goalie');}
match();park();PH.boxSend(red().skaters[0],20);PH.endMatch();ok(G.pengs.every(p=>!p.boxed&&!p.frozen),'match end empties the box');

// ---- 10. AI: waits at the blue line, does not pass to an offside mate ----
match();park();
{const d=blue().dir,a=blue().skaters[2],pk=G.puck;pk.x=d*2;pk.z=0;a.x=d*6;a.ai.tx=d*16;a.ai.tz=0;PH.rulesAI(a);
 ok(a.ai.tx*d<=RULE.bl,'AI attacker waits at the blue line while the puck is outside ('+(a.ai.tx*d).toFixed(1)+')');
 a.x=d*12;ok(!PH.rulesMateOk(a),'a mate standing inside the zone ahead of the puck is not a pass target');
 pk.x=d*10;ok(PH.rulesMateOk(a),'… fine once the puck is in');}

// ---- 11. off everywhere it should be ----
save.set.rules='full';startMatch({mode:'practice',size:1,time:0,diff:'easy'});run(4);ok(PH.rulesMode()==='off','practice: no referee');
startMatch({mode:'challenge',challenge:{kind:'goal',goal:3,size:3,time:60},size:3,time:60,diff:'easy',tag:'c',oppTypes:['basic']});run(4);ok(PH.rulesMode()==='off','challenges: no referee');

// ---- 12. AI-vs-AI soak with rules on: everything finishes, no NaN, no stuck states ----
{let bad=0,stuck=0,calls=0;const uses={};for(let m=0;m<2;m++){save.type='magellanic';save.squad=['humboldt','african',null];startMatch({mode:'quick',size:3,time:60,diff:'hard',tag:'q',oppTypes:['basic','fast','macaroni']});
  let i=0;for(;i<60*360;i++){if(G.player&&!G.ps)PH.setHuman(null);step(1/60);for(const p of G.pengs){if(p.goalie)continue;if(p.cd.special>0&&!p.__c){p.__c=1;uses[p.type]=(uses[p.type]||0)+1;}if(p.cd.special<=0)p.__c=0;}if(G.state==='over'&&G.resultShown)break;}
  if(G.state!=='over')stuck++;if(G.pengs.some(p=>!isFinite(p.x)||!isFinite(p.z)))bad++;calls+=G.rl?G.rl.calls.length:0;}
 ok(!bad&&!stuck,'2 AI-vs-AI matches with the referee finish cleanly ('+calls+' calls)');
 {const n=Object.values(uses).reduce((a,b)=>a+b,0);ok(['magellanic','humboldt','african','basic','fast','macaroni'].filter(k=>uses[k]>0).length>=3&&n>=6,'AI still uses its skills with the referee on ('+n+' casts: '+JSON.stringify(uses)+')');}save.type='basic';save.squad=[null,null,null];}

// ---- 13. save: setting validated, intro flag additive ----
const load=sv=>JSON.parse(execFileSync('node',['-e',"const PH=require('./harness.js');console.log(JSON.stringify({r:PH.save.set.rules,i:PH.save.rl.intro}));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(sv)})}).toString().trim().split('\n').pop());
{const a=load({v:10,set:{rules:'fouls'},rl:{intro:1}}),b=load({v:10,set:{rules:'zzz'}}),c=load({v:10});
 ok(a.r==='fouls'&&a.i===1&&b.r==='full'&&c.r==='full'&&c.i===0,'rules setting saved / validated, old saves get the defaults');}

console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
