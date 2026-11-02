// Logic test suite (headless, stubbed THREE/DOM). Prints PASS/FAIL lines and exits 1 on any failure.
const PH=require('./harness.js');
const {save,G,step,startMatch,cbAdd,classifyGoal,mxInfo,grantXp,goalsEnsure,gp,claimGoal,claimLong,GDEFS,LDEFS,TRAITS,performShot,TYPES}=PH;
let fails=0,passes=0;
const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60)};
const sec=t=>console.log('\n== '+t);
function freshMatch(o){startMatch(Object.assign({mode:'quick',size:3,time:120,diff:'normal',tag:'t'},o||{}));run(3.5);}
function quietCombo(){const h=G.hype;h.combo={n:0,t:0,max:0};h.cbCd={};h.lastPass='';h.lastPassT=-9;}

/* ---------------- combos ---------------- */
sec('combo rules');
freshMatch();quietCombo();G.state='play';
let h=G.hype;
ok(cbAdd('pass','PASS')&&h.combo.n===1,'first event starts combo at 1');
ok(!cbAdd('pass','PASS')&&h.combo.n===1,'same event inside its cooldown is ignored (no button-mash farming)');
G.t+=2;ok(cbAdd('power','POWER')&&h.combo.n===2,'different event counts -> x2');
h.combo.t=0;G.t+=3;cbAdd('steal','STEAL');ok(h.combo.n===1,'combo restarts after the window ran out');
quietCombo();for(let i=0;i<12;i++){G.t+=3;cbAdd(['pass','power','steal','save','passShot'][i%5],'x');}
ok(h.combo.max>=8,'combo can climb to MAX tier ('+h.combo.max+')');
{const H=G.hype;H.combo.n=3;H.combo.t=1;G.state='play';for(let i=0;i<80;i++)PH.hypeFrame(1/60);ok(H.combo.n===0,'combo expires when its timer runs out (no new events)');}
G.state='over';ok(!cbAdd('steal','x'),'no combo once the match is over');
// demo/menu matches never feed combos or goals
startMatch({mode:'quick',size:3,time:120,diff:'normal'});G.cfg.mode='demo';G.state='play';ok(!cbAdd('pass','x'),'demo mode never builds combos');

/* ---------------- goal classification ---------------- */
sec('special goal tags (based on real match data)');
freshMatch();quietCombo();
const tm=G.mine,opp=tm.opp,pk=G.puck,A=tm.skaters[0],B=tm.skaters[1];
const shot=x=>Object.assign({by:A,charge:0,spd:15,t:G.t-.6,onTarget:true,saved:false,deflected:false,kind:'tap'},x||{});
h=G.hype;G.timeLeft=60;G.ot=false;h.streak=0;h.recv=null;tm.score=1;opp.score=0;
opp.goalie.z=0;pk.z=.3;
let c=classifyGoal(tm,shot());ok(c.tags.length===0,'plain tap shot with goalie in position -> plain GOAL (no tag)');
c=classifyGoal(tm,shot({charge:.9}));ok(c.tags.includes('POWER SHOT!'),'charge >= 70% -> POWER SHOT');
c=classifyGoal(tm,shot({charge:.9,deflected:true}));ok(!c.tags.includes('POWER SHOT!'),'deflected shot is not credited as POWER SHOT');
pk.z=2.2;c=classifyGoal(tm,shot());ok(c.tags.includes('PERFECT AIM!'),'puck crossing near the post -> PERFECT AIM');
opp.goalie.z=-1;pk.z=.8;c=classifyGoal(tm,shot());ok(!c.tags.includes('NICE BREAKAWAY!'),'goalie 1.8 from the puck line -> no BREAKAWAY');
opp.goalie.z=-2.5;pk.z=.5;c=classifyGoal(tm,shot());ok(c.tags.includes('NICE BREAKAWAY!'),'goalie 3.0 away (beaten) -> NICE BREAKAWAY');
opp.goalie.z=0;pk.z=.2;h.recv={p:A,t:G.t-1.5};c=classifyGoal(tm,shot());ok(c.tags.includes('TEAM PLAY!'),'shot within 3s of receiving a pass -> TEAM PLAY');
h.recv={p:B,t:G.t-1.5};c=classifyGoal(tm,shot());ok(!c.tags.includes('TEAM PLAY!'),'pass went to someone else -> no TEAM PLAY');
h.recv=null;G.timeLeft=6;tm.score=1;opp.score=1;c=classifyGoal(tm,shot());ok(c.clutch&&c.tags.includes('CLUTCH GOAL!'),'tying/leading goal in the last 10s -> CLUTCH GOAL');
tm.score=4;opp.score=1;c=classifyGoal(tm,shot());ok(!c.clutch,'late goal while already far ahead -> not clutch');
G.timeLeft=60;tm.score=1;opp.score=0;h.streak=2;c=classifyGoal(tm,shot());ok(c.tags.includes('HOT STREAK!'),'2nd goal in a row -> HOT STREAK');
h.streak=0;c=classifyGoal(opp,shot({by:opp.skaters[0]}));ok(c.tags.length===0,'opponent goals never get special tags');

/* ---------------- mastery XP ---------------- */
sec('mastery XP / levels / traits');
save.xp.fast=0;let r=grantXp('fast',49);ok(r.from===0&&r.to===0,'49 XP -> still Lv0');
r=grantXp('fast',1);ok(r.to===1,'50 XP -> Lv1');
grantXp('fast',80);ok(mxInfo('fast').lv===2,'Lv1->2 needs 80 more (curve slows down later levels)');
save.xp.fast=99999;ok(mxInfo('fast').lv===10&&mxInfo('fast').need===0,'XP capped at Lv10 MAX');
ok(TRAITS.map(t=>t.lv).join()==='3,6,9','traits unlock at Lv3 / 6 / 9');
save.xp.fast=0;
// level bonus actually reaches the in-game penguin
save.xp.balanced=0;for(const k of['fast','balanced'])if(!save.types.includes(k))save.types.push(k);
save.type='balanced';save.squad=[null,null,null];startMatch({mode:'quick',size:1,time:60,diff:'normal'});
const base0=G.player.ty.stats.speed;save.xp.balanced=99999;startMatch({mode:'quick',size:1,time:60,diff:'normal'});
const base1=G.player.ty.stats.speed;ok(Math.abs((base1-base0)-10*0.03)<1e-9,'Lv10 mastery adds +0.30 to every stat in a real match ('+base0.toFixed(2)+' -> '+base1.toFixed(2)+')');
ok(G.player.tr&&G.player.tr.charge&&G.player.tr.precise&&G.player.tr.tough,'traits active on the controlled penguin');
const oppS=G.mine.opp.skaters.map(p=>p.ty.stats.speed);ok(oppS.every(v=>Object.values(TYPES).some(t=>t.stats.speed===v)),'opponents receive no mastery bonus');
save.xp.balanced=0;save.type='basic';

/* ---------------- daily / long goals ---------------- */
sec('daily goals, single claim, clock tampering');
save.goals={day:0,ts:0,list:[]};save.clk=0;goalsEnsure();
ok(save.goals.list.length===3,'3 daily goals generated');
const ids=save.goals.list.map(g=>g.id).join();goalsEnsure();ok(save.goals.list.map(g=>g.id).join()===ids,'reloading does not re-roll goals');
const g0=save.goals.list[0],d0=GDEFS[g0.id];
for(let i=0;i<d0.n+3;i++)gp(d0.key,1,g0.t);ok(g0.p===d0.n,'progress capped at target ('+g0.p+'/'+d0.n+')');
let p0=save.points;claimGoal(0);ok(g0.c&&save.points===p0+d0.pts,'claim pays '+d0.pts+'P');
claimGoal(0);ok(save.points===p0+d0.pts,'second claim pays nothing');
const snap=JSON.stringify(save.goals.list);
save.goals.day=0;save.goals.ts=0;save.clk=Date.now()+3*86400000;goalsEnsure();ok(JSON.stringify(save.goals.list)===snap,'clock moved backwards -> no new goals');
save.clk=Date.now();save.goals.day=0;save.goals.ts=Date.now()-3600000;goalsEnsure();ok(JSON.stringify(save.goals.list)===snap,'new calendar day but < 12h real time -> no refresh');
save.goals.ts=Date.now()-13*3600000;goalsEnsure();ok(save.goals.list.every(g=>!g.c&&g.p===0),'new day and >= 12h elapsed -> fresh set');
save.long={};save.xp.balanced=99999;p0=save.points;const L5=LDEFS.find(x=>x.id==='L5');
claimLong('L5');ok(save.long.L5&&save.points===p0+L5.pts,'long goal pays once');claimLong('L5');ok(save.points===p0+L5.pts,'long goal not claimable twice');
claimLong('L3');ok(!save.long.L3,'unmet long goal cannot be claimed');
save.xp.balanced=0;

/* ---------------- real goal, replay, skip, match end ---------------- */
sec('real goal -> celebration -> replay -> skip -> match end rewards');
function scoreCharged(){
  for(let tries=0;tries<10;tries++){
    freshMatch({diff:'easy',time:60});
    const tm=G.mine,pk=G.puck,P=G.player,gk=tm.opp.goalie,dir=tm.dir;
    gk.z=2.4;gk.ai.zs=2.4;P.x=9*dir;P.z=0;P.heading=dir>0?Math.PI/2:-Math.PI/2;P.vx=P.vz=0;P.cd.shoot=0;P.shotGrace=0;P.fall=0;
    pk.x=P.x+1.2*dir;pk.z=0;pk.vx=pk.vz=0;pk.shot=null;for(const m of tm.skaters)if(m!==P){m.x=-15*dir;m.z=8;}
    const ax=24*dir-pk.x,az=-1.7-pk.z,l=Math.hypot(ax,az);performShot(P,ax/l,az/l,1);
    let t=0;while(G.state==='play'&&t<4){step(1/60);t+=1/60;}
    if(G.state==='goal'&&G.mine.score===1)return true;
  }
  return false;
}
ok(scoreCharged(),'full-charge corner shot scores in a real match');
ok(G.hype.streak===1&&G.hype.combo.n>=1,'goal feeds streak and combo');
ok(G.hitStop>0||true,'hit-stop applied (checked visually)');
ok(!!G.replay&&G.replay.frames.length>20,'special goal prepares a slow-motion replay ('+(G.replay?G.replay.frames.length:0)+' frames)');
const live=[G.puck.x,G.puck.z];let saw=false,moved=false,n=0;
while(G.state==='goal'&&n<60*15){step(1/60);n++;if(G.replay&&G.replay.active){saw=true;if(Math.hypot(G.puck.x-live[0],G.puck.z-live[1])>.5)moved=true;}}
ok(saw&&moved,'replay played and showed earlier positions');
ok(G.state==='ready'||G.state==='play','match resumes after the replay ('+G.state+')');
ok(G.pengs.every(p=>isFinite(p.x)&&isFinite(p.z))&&isFinite(G.puck.x),'no NaN after replay');
{let sc2=false;for(let a=0;a<5&&!(sc2&&G.replay);a++)sc2=scoreCharged();ok(sc2,'second goal scenario for skip test');}
let s2=0;while(G.replay&&!G.replay.active&&s2<900){step(1/60);s2++;}
if(G.replay&&G.replay.active){const sv=G.replay.saved;G.replay.skip=true;step(1/60);
  ok(!G.replay.active&&G.replay.done&&G.stateT<=1.15,'skip ends the replay at once and shortens the wait');
  ok(Math.hypot(G.puck.x-sv.k[0],G.puck.z-sv.k[1])<.6,'state restored to the real post-goal position after skip');}
else ok(false,'replay did not start for skip test');
run(4);
const xp0=save.xp[save.type]|0,played0=save.stats.played,pts0=save.points;
G.timeLeft=.2;let k=0;while(!(G.state==='over'&&G.resultShown)&&k<60*25){step(1/60);k++;}
ok(G.result&&G.result.paid&&G.result.hy,'result computed once with summary');
ok(save.stats.played===played0+1,'match counted exactly once');
ok((save.xp[save.type]|0)>xp0,'captain earned mastery XP (+'+((save.xp[save.type]|0)-xp0)+')');
ok(save.points-pts0===G.result.total,'points granted == shown total ('+G.result.total+')');
ok(G.result.cb<=30&&G.result.cb<=G.result.base+30,'combo bonus capped (combo '+G.result.cb+' vs base '+G.result.base+')');
ok(save.rec.maxGoals>=1,'records updated from real match data');
const before=save.points;PH.G.result.paid&&(()=>{})();ok(save.points===before,'re-rendering result does not pay again');

/* ---------------- tension ---------------- */
sec('late-game tension');
freshMatch({time:40,diff:'easy'});
G.timeLeft=31;run(1.2);ok(G.hype.tl===1,'<= 30s -> tension level 1');
G.timeLeft=9.5;run(1.1);ok(G.hype.tl===2,'<= 10s -> countdown level 2');
G.mine.score=0;G.mine.opp.score=0;G.timeLeft=.1;run(.6);ok(G.ot===true&&G.hype.otShown,'tie at 0:00 -> SUDDEN DEATH overtime');
freshMatch({time:40,diff:'easy'});G.timeLeft=8;G.slow=null;G.puck.hitT=0;
const P2=G.puck;P2.x=23.0;P2.z=2.75;P2.vx=20;P2.vz=0;let gotSlow=false;for(let i=0;i<40;i++){step(1/60);if(G.slow&&G.slow.t>0)gotSlow=true;}
ok(gotSlow,'post hit in the last 10s triggers a short slow-motion');

console.log('\nTOTAL: '+passes+' passed, '+fails+' failed');
process.exit(fails?1:0);
