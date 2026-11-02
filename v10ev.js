const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {G,save,step,startMatch}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60);};
const W=24,D=13;
save.set.events=true;save.set.items=true;
startMatch({mode:'quick',size:3,time:120,diff:'normal'});run(3.4);
ok(PH.eventsOn()&&G.evT>30,'events on in quick match, first one after ~35-50 s');
// seal
{G.teams.blue.noScore=true;G.teams.red.noScore=true;let g0=0;while(G.state!=='play'&&g0++<600)step(1/60);PH.evStart('seal');const ev=G.ev;const p=G.mine.skaters[1];p.x=ev.x;p.z=0;p.vx=p.vz=0;p.fall=0;p.getup=0;
 let hit=false;for(let i=0;i<60*14&&G.ev;i++){   // (a referee whistle pauses the event, so allow extra time)
 if(!hit&&p.fall<=0&&p.getup<=0){p.x=ev.x;p.z=ev.z+ev.dz*2.2;p.vx=p.vz=0;}step(1/60);if(p.fall>0)hit=true;}
 ok(hit,'🦭 the seal knocks over a penguin in its path');ok(!G.ev,'seal leaves the rink after its run');}
// gust
{let g=0;while(G.state!=='play'&&g++<600)step(1/60);PH.evStart('gust');const ev=G.ev,pk=G.puck;pk.x=0;pk.z=0;pk.vx=pk.vz=0;G.carry=null;for(const q of G.pengs)if(!q.goalie){const d=Math.hypot(q.x,q.z)||1;if(d<9){q.x=q.x/d*10;q.z=q.z/d*10;}q.vx=q.vz=0;}run(.5);
 const along=pk.x*ev.wx+pk.z*ev.wz;ok(along>.1,'🌬️ the gust pushes the puck downwind ('+along.toFixed(2)+' m)');run(6);ok(!G.ev,'gust ends after 6 s');}
// fish rain
{PH.funReset&&0;const n0=G.items.length;for(const it of G.items){}PH.evStart('fish');ok(G.items.length>=Math.min(3,n0+2),'🐟 fish rain drops items on the ice ('+G.items.length+')');}
// golden puck
{G.teams.blue.noScore=false;G.teams.red.noScore=false;let g=0;while(G.state!=='play'&&g++<600)step(1/60);PH.evStart('golden');ok(G.goldenT>14,'⭐ golden puck starts (15 s)');
 const s0=G.mine.score;G.carry=null;G.puck.x=G.mine.dir*(W+.6);G.puck.z=0;G.puck.vx=G.puck.vz=0;step(1/60);   // nobody may be carrying the puck at that moment (made the test flaky)
 ok(G.mine.score===s0+2&&!(G.goldenT>0),'golden-puck goal counts 2 points, then the puck is normal again');}
startMatch({mode:'ranked',size:3,time:120,diff:'normal',oppR:1200,oppName:'x'});run(3.4);ok(!PH.eventsOn(),'no surprise events in ranked');
save.set.events=false;startMatch({mode:'quick',size:3,time:120,diff:'normal'});run(1);ok(!PH.eventsOn(),'events can be switched off');save.set.events=true;
// shootout mode
PH.launch('shootout');
ok(G.cfg.mode==='shootout'&&!!G.so&&G.cfg.soRounds===5,'승부차기 mode starts straight into a 5-round shootout');
{let guard=0;run(1.8);while(G.so&&!G.so.done&&guard++<60){if(G.so.phase==='play'){PH.soResult(G.so.shooterTeam===G.mine);}run(1.8);}
 ok(G.so&&G.so.done&&G.so.s.mine===3&&G.so.s.opp===0,'ends early once it is decided (3:0 after 3 rounds of 5)');
 run(3.5);ok(G.state==='over'&&G.result&&G.result.win,'winning the shootout mode counts as a win');}
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
