const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {G,save,step,startMatch,input}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60);};
save.set.items=true;save.set.events=true;
startMatch({mode:'quick',size:3,time:120,diff:'normal'});run(3.4);
// dirty everything a match can leave behind
G.carry=G.player;G.slow={s:.3,t:5};G.hitStop=1;G.hype.combo.n=6;G.hype.combo.t=3;G.hype.feverT=5;G.goldenT=9;
G.mine.score=4;G.mine.opp.score=2;G.chain=7;G.pass={from:G.player};input.keys.up=true;input.shoot=true;G.paused=true;
for(const p of G.pengs){p.frozen=true;p.fireT=3;p.boostT=2;}
G.so={dummy:1};
startMatch({mode:'quick',size:3,time:120,diff:'normal'});
ok(G.carry===null||G.carry===undefined,'no one holds the puck at kick-off ('+(G.carry&&G.carry.type)+')');
ok(!G.slow||G.slow.t<=0,'slow-motion cleared');ok(!(G.hitStop>0),'hit-stop cleared');
ok(G.mine.score===0&&G.mine.opp.score===0,'score reset');ok(G.paused===false,'not paused');
ok(G.hype.combo.n===0&&!(G.hype.feverT>0),'combo and fever reset ('+G.hype.combo.n+','+G.hype.feverT+')');
ok(!(G.goldenT>0),'golden puck event cleared');ok(G.so===null,'shootout state cleared for a normal match');
ok(!input.keys.up&&!input.shoot,'held inputs released');ok(G.pengs.every(p=>!p.frozen&&!(p.fireT>0)&&!(p.boostT>0)),'item effects cleared on all penguins');
ok(!(G.chain>0)&&!G.pass,'pass chain cleared');
run(3.4);ok(G.state==='play','new match reaches play state');
// pause blocks input-driven actions
{G.paused=true;const x0=G.player.x;input.x=1;run(1);input.x=0;ok(G.player.x===x0,'paused: player does not move');G.paused=false;}
// over state ignores shots
{G.mine.score=1;G.timeLeft=.02;run(.5);ok(G.state==='over','time-up ends the match (state '+G.state+')');const s0=G.mine.score+G.mine.opp.score;input.shootPress=true;run(2);ok(G.mine.score+G.mine.opp.score===s0,'no scoring after the final whistle');}
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
