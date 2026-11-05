// v34: comeback drama — chase (last 30 s, 1–2 goals down), EQUALIZER! / COMEBACK! goals, COMEBACK WIN!
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,step,startMatch,save,SFX}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
let beats=0;SFX.heart=()=>{beats++;};
const toast=()=>{const t=global.document.getElementById('toast');return t&&t.textContent;};
const start=(mode)=>{startMatch({mode:mode||'quick',size:3,time:120,diff:'normal',oppTypes:['basic','fast','strong'],tag:'q'});for(let i=0;i<60*3.4;i++)step(1/60);};
const hold=()=>{for(const p of G.pengs){p.x=p.x;}G.puck.x=0;G.puck.z=0;G.puck.vx=0;G.puck.vz=0;};
// keep the match from scoring by itself while we step: freeze the puck in the middle
const run=(sec)=>{for(let i=0;i<Math.round(sec*60);i++){G.puck.x=0;G.puck.z=0;G.puck.vx=0;G.puck.vz=0;step(1/60);}};
save.set.motion=false;
start();ok(G.state==='play','match running');
G.mine.score=0;G.mine.opp.score=1;G.timeLeft=40;run(.5);ok(!G.hype.chase,'1 goal down with 40 s left: no chase yet');
G.timeLeft=28;beats=0;run(2);
ok(G.hype.chase&&beats>=2&&beats<=4,'last 30 s, 1 goal down: chase on, heartbeat every ~0.8 s ('+beats+' in 2 s)');
ok(G.cheer>=.5,'crowd louder during the chase ('+G.cheer.toFixed(2)+')');
G.timeLeft=9;beats=0;run(2);ok(beats>=3&&beats<=5,'last 10 s: faster heartbeat (every 0.5 s) ('+beats+' in 2 s)');
G.mine.opp.score=3;run(.2);ok(!G.hype.chase,'3 goals down: no chase (out of reach)');
G.mine.opp.score=1;G.mine.score=1;run(.2);ok(!G.hype.chase,'level: no chase');
// ---- goals ----
start();G.timeLeft=25;G.mine.opp.score=1;G.hype.wasBehind=true;G.mine.score=1;G.state='goal';PH.hypeGoal(G.mine,null);
ok(G.cbLast&&G.cbLast.kind==='EQUALIZER!'&&G.cbLast.big,'1:1 after trailing, 25 s left → EQUALIZER! (big)');
ok(G.slow&&G.slow.s<.5,'late equalizer → slow motion');
G.slow=null;G.mine.score=2;PH.hypeGoal(G.mine,null);
ok(G.cbLast&&G.cbLast.kind==='COMEBACK!'&&G.slow,'2:1 → COMEBACK! with slow motion');
G.mine.score=3;PH.hypeGoal(G.mine,null);ok(G.cbLast===null,'3:1 → a normal goal (the turn-around is celebrated once)');
G.mine.opp.score=2;PH.hypeGoal(G.mine.opp,null);ok(G.cbLast===null,'opponent goal → nothing special');
start();G.timeLeft=90;G.mine.opp.score=1;G.hype.wasBehind=true;G.mine.score=1;G.slow=null;PH.hypeGoal(G.mine,null);
ok(G.cbLast&&G.cbLast.kind==='EQUALIZER!'&&!G.cbLast.big&&!G.slow,'early equalizer (90 s left): EQUALIZER! without slow motion');
start();G.mine.score=1;PH.hypeGoal(G.mine,null);ok(G.cbLast===null,'1:0 without trailing → normal goal');
start();save.set.motion=true;G.timeLeft=5;G.mine.opp.score=1;G.hype.wasBehind=true;G.mine.score=1;G.slow=null;PH.hypeGoal(G.mine,null);
ok(G.cbLast&&!G.slow,'“reduce motion” setting → no slow motion');save.set.motion=false;
start('practice');G.mine.opp.score=1;G.hype.wasBehind=true;G.mine.score=1;PH.hypeGoal(G.mine,null);ok(!G.cbLast,'practice mode: nothing');
// a real goal through the game: scored() ends the chase at once
start();G.mine.score=0;G.mine.opp.score=1;G.timeLeft=20;run(.3);const was=G.hype.chase;
G.hype.wasBehind=true;const pk=G.puck;const gx=G.mine.dir*29;
for(let i=0;i<240&&G.state==='play';i++){pk.x=gx*0.97;pk.z=0;pk.vx=G.mine.dir*25;pk.vz=0;pk.y=.1;step(1/60);}
ok(was&&G.state==='goal'&&!G.hype.chase&&G.mine.score===1,'chase on, then a real goal into the opponent net → chase off, '+G.mine.score+':'+G.mine.opp.score+(G.cbLast?' '+G.cbLast.kind:''));
// (the banners themselves are checked in the browser: br/v34clutch.js)
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
