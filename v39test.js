// v39: premium show — visual only. Checks: the show fires on goals / big hits, follows the quality and flash settings,
// uses its own random numbers (a seeded match plays out exactly the same with the show on and off), never throws.
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,save,step,startMatch,LX,LXV}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
save.set.rules='off';save.set.items=false;save.set.events=false;
function match(q){save.set.quality=q||'ultra';startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'q',oppTypes:['basic','fast','strong']});let n=0;while(G.state!=='play'&&n++<600)step(1/60);}

// ---- goal show ----
match('ultra');
ok(PH.lxOn()===true,'최고 quality → the show is on');
{const n0={...LX.n},rays0=LX.n.rays;PH.scored(G.mine);
 ok(LX.n.goal===n0.goal+1&&LX.n.ring===n0.ring+3,'your goal → 3 shock rings at the goal mouth');
 ok(LX.goalT===LXV.goalShow&&LX.goalX===G.mine.dir*24,'the follow-spots converge on the goal you scored in for '+LXV.goalShow+' s');
 ok(LX.fw.length===LXV.fw.length,'…and '+LXV.fw.length+' fireworks are queued');
 ok(LX.n.rays===rays0+1,'golden rays behind the GOAL banner');
 const f0=LX.n.fw;for(let i=0;i<60*2;i++)step(1/60);ok(LX.n.fw===f0+LXV.fw.length&&LX.fw.length===0,'the fireworks go off within 2 s ('+(LX.n.fw-f0)+')');}
match('ultra');
{const f=LX.fw.length,r=LX.n.ring;PH.scored(G.mine.opp);ok(LX.n.ring===r+3&&LX.fw.length===f,'their goal → rings, no fireworks');}
// flash off / reduced motion → no rays
match('ultra');
{save.set.flash=false;const r=LX.n.rays;PH.scored(G.mine);ok(LX.n.rays===r,'번쩍임 off → no rays');save.set.flash=true;}
match('ultra');
{save.set.motion=true;const r=LX.n.rays;PH.scored(G.mine);ok(LX.n.rays===r,'움직임 줄이기 → no rays');save.set.motion=false;}
// 절약 quality → the 3D show stays off
match('low');
{const n0={...LX.n};PH.scored(G.mine);for(let i=0;i<120;i++)step(1/60);
 ok(PH.lxOn()===false&&LX.n.ring===n0.ring&&LX.n.fw===n0.fw&&LX.n.flash===n0.flash,'절약 quality → no rings, fireworks or crowd flashes (the previous look)');}

// ---- big hit ----
match('ultra');
{const a=G.mine.skaters[0],b=G.mine.opp.skaters[0],c=G.mine.skaters[1];const h=LX.n.hit,r=LX.n.ring;
 PH.lxHit(a,b);ok(LX.n.hit===h+1&&LX.n.ring===r+2,'big hit on an opponent → impact rings');
 PH.lxHit(a,c);ok(LX.n.hit===h+1,'a bump between team-mates → nothing');}

// ---- crowd flashes while playing ----
match('ultra');
{const f=LX.n.flash;for(let i=0;i<60*6;i++)step(1/60);const per=(LX.n.flash-f)/6;ok(per>.5&&per<30,'camera flashes in the stands: '+per.toFixed(1)+'/s in open play (idle rate '+LXV.flashIdle+'/s + cheering)');}

// ---- visual only: the same seeded match with the show on (최고) and off (절약) ----
// each run is its own process (a fresh game), with Math.random seeded before the game loads
function run(q){
  const code="let seed=777;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};const PH=require('./harness.js'),{G,save,step,startMatch}=PH;"+
    "save.set.rules='off';save.set.items=false;save.set.events=false;save.set.quality='"+q+"';startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'q',oppTypes:['basic','fast','strong']});"+
    "for(let i=0;i<60*40;i++)step(1/60);console.log('@@'+JSON.stringify([PH.lxOn(),PH.LX.n.flash>0,G.teams.blue.score,G.teams.red.score,+G.puck.x.toFixed(4),+G.puck.z.toFixed(4),...G.pengs.slice(0,6).map(p=>+p.x.toFixed(4))]));process.exit(0)";
  const r=require('child_process').spawnSync(process.execPath,['-e',code],{cwd:__dirname,encoding:'utf8'});return JSON.parse(((r.stdout||'').split('@@')[1]||'null').trim()||'null');}
{const a=run('ultra'),b=run('low'),c=run('ultra');
 ok(a&&c&&JSON.stringify(a)===JSON.stringify(c),'a seeded 40 s match is reproducible ('+JSON.stringify(a&&a.slice(2,6))+')');
 ok(a&&b&&a[0]===true&&a[1]===true&&b[0]===false&&b[1]===false,'the show ran at 최고 and stayed off at 절약');
 ok(a&&b&&JSON.stringify(a.slice(2))===JSON.stringify(b.slice(2)),'…and the match is identical with the show on and off: it does not touch the simulation or its random numbers');}

console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
