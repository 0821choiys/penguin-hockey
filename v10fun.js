const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {G,save,step,startMatch,performShot}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60);};
const W=24;
// ---------- items ----------
save.set.items=true;startMatch({mode:'quick',size:3,time:120,diff:'normal'});run(3.4);
ok(PH.itemsOn(),'items are on in quick match');
startMatch({mode:'free',size:1,time:0,diff:'normal',noOpp:true,goalieOnly:true});run(3.4);
{const p=G.player;const it=PH.spawnItem('fish',p.x,p.z);step(1/60);ok(!!it&&p.boostT>3.5&&G.items.length===0,'driving over 🐟 gives a speed boost');
 const st=p.ty.stats;G.switchCd=99;p.vx=p.vz=0;p.heading=Math.PI/2;PH.input.x=1;PH.input.z=0;run(1);const sp=Math.hypot(p.vx,p.vz);PH.input.x=0;
 ok(sp>(7+1.4*st.speed)*1.05,'boosted penguin skates faster than its normal cap ('+sp.toFixed(1)+')');}
startMatch({mode:'quick',size:3,time:120,diff:'normal'});run(3.4);
{const p=G.player,o=G.mine.opp.skaters[0];o.x=p.x+5*G.mine.dir;o.z=p.z;o.fall=0;o.getup=0;for(const q of G.mine.opp.skaters)if(q!==o){q.x=-20*G.mine.dir;q.z=10;}
 PH.applyItem(p,'snow');run(.6);ok(o.fall>0,'⛄ snowball knocks the nearest opponent down');}
startMatch({mode:'free',size:1,time:0,diff:'normal',noOpp:true,goalieOnly:true});run(3.4);
{const p=G.player,dir=G.mine.dir,pk=G.puck;const shoot=()=>{p.x=8*dir;p.z=0;p.heading=dir>0?Math.PI/2:-Math.PI/2;p.vx=p.vz=0;pk.x=p.x+1.1*dir;pk.z=0;pk.vx=pk.vz=0;p.cd.shoot=0;p.shotGrace=0;p.recvT=-9;performShot(p,dir,0,.8);return Math.hypot(pk.vx,pk.vz);};
 const a=shoot();p.fireT=8;const b=shoot();ok(G.puck.shot&&G.puck.shot.fire&&b>a*1.15&&p.fireT===0,'🔥 fire puck: next shot +25% and flagged ('+a.toFixed(1)+' -> '+b.toFixed(1)+')');}
startMatch({mode:'free',size:1,time:0,diff:'normal',noOpp:true,goalieOnly:true});run(3.4);
{const p=G.player,pk=G.puck;pk.x=p.x+4;pk.z=p.z;pk.vx=pk.vz=0;p.magT=3;const d0=Math.hypot(pk.x-p.x,pk.z-p.z);run(.3);const d1=Math.hypot(pk.x-p.x,pk.z-p.z);ok(d1<d0-.8,'🧲 magnet pulls the puck (more than 0.8 m in 0.3 s; it pulls about 1.0 m) ('+d0.toFixed(1)+' -> '+d1.toFixed(1)+' m)');}
startMatch({mode:'quick',size:3,time:120,diff:'normal'});run(3.4);
{G.itemT=0;run(.1);ok(G.itemT>8,'items spawn on their own (spawn timer fired)');}
startMatch({mode:'ranked',size:3,time:120,diff:'normal',oppR:1200,oppName:'x'});run(3.4);ok(!PH.itemsOn()&&G.items.length===0,'no items in ranked (fair play)');
save.set.items=false;startMatch({mode:'quick',size:3,time:120,diff:'normal'});run(3.4);ok(!PH.itemsOn(),'items can be switched off in settings');save.set.items=true;
// ---------- fever ----------
startMatch({mode:'quick',size:3,time:120,diff:'normal'});run(3.4);
{const h=G.hype;const kinds=['pass','power','steal','save','passShot'];for(let i=0;i<5;i++){G.t+=3;PH.cbAdd(kinds[i],'x');}
 ok(h.feverT>7,'combo x5 starts FEVER TIME');const r=PH.classifyGoal(G.mine,null);ok(r.tags.includes('FEVER GOAL!'),'goal during fever is tagged FEVER GOAL');
 {let g=0;while(h.feverT>0&&g++<60*30)step(1/60);}ok(!(h.feverT>0),'fever ends (8 s of play)');
 h.feverGoals=9;G.mine.score=2;G.timeLeft=.02;run(4.5);ok(G.result&&G.result.fv===20,'fever goal bonus is capped at 20P');}
// ---------- shootout ----------
startMatch({mode:'quick',size:3,time:60,diff:'normal'});run(3.4);
{G.mine.score=1;G.mine.opp.score=1;G.ot=true;G.otLeft=.01;step(1/60);
 ok(!!G.so&&G.state==='ready','tie after overtime starts a SHOOTOUT');
 const act=G.pengs.filter(p=>!p.goalie&&!p.frozen);ok(act.length===1&&act[0]===G.player&&act[0].team===G.mine,'my captain shoots first, everyone else steps aside');
 run(1.8);ok(G.state==='play','attempt starts after a short countdown');
 const p=G.player,dir=G.mine.dir,pk=G.puck;pk.x=dir*(W+.6);pk.z=0;step(1/60);ok(G.so.s.mine===1&&G.so.res.mine.length===1,'scoring counts a shootout goal (not a match goal: '+G.mine.score+')');
 run(1.8);ok(G.so.shooterTeam===G.mine.opp&&!G.player,'then the opponent shoots against my goalie');
 run(9.5);ok(G.so.res.opp.length===1,'opponent AI attempt resolves (goal or save) within the time limit');
 // finish: I score the rest, they miss
 let guard=0;while(G.so&&!G.so.done&&guard++<40){if(G.so.phase==='play'){if(G.so.shooterTeam===G.mine)PH.soResult(true);else PH.soResult(false);}run(1.8);}
 run(3.5);ok(G.state==='over'&&G.result&&G.result.win===true&&/승부차기/.test(G.result.note),'winning the shootout wins the match ('+(G.result&&G.result.note)+')');
 ok(G.pengs.every(p=>!p.frozen),'all penguins are back after the shootout');}
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
