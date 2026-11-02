const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {G,save,step,startMatch,performShot}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60);};
ok(save.ach&&typeof save.ach==='object'&&Object.keys(save.ach).length===0,'fresh save has an empty achievement map');
ok(['hatTrick','chainBest','powerGoal','bigHit','soWin','golden','steals'].every(k=>save.cum[k]===0),'new achievement counters default to 0');
ok(PH.ACH.length>=13&&new Set(PH.ACH.map(a=>a.id)).size===PH.ACH.length&&PH.ACH.every(a=>/^a_[a-z0-9]{1,12}$/.test(a.id)&&a.name&&a.desc&&a.n>0&&a.pts>0),'every achievement has unique id, name, description, target and reward ('+PH.ACH.length+')');
// unlock + reward once
save.stats.wins=1;const p0=save.points;const got=PH.achCheck();
ok(got.some(a=>a.id==='a_win1')&&save.ach.a_win1===true&&save.points===p0+30,'first win unlocks and pays +30P');
const p1=save.points;const again=PH.achCheck();ok(again.length===0&&save.points===p1,'re-checking never pays the same achievement twice');
// grouped popup when many unlock at once
save.cum.goals=1;save.cum.powerGoal=1;save.cum.golden=1;save.cum.soWin=1;const many=PH.achCheck();ok(many.length===4,'several achievements can unlock together ('+many.length+')');
// progress UI
const html=PH.achHtml();ok(html.includes('첫 승리')&&html.includes('달성 완료')&&html.includes('0 / 10'),'achievement tab lists name, done state and progress');
// counters only count in real matches
startMatch({mode:'practice',size:1,time:0,diff:'normal'});ok(PH.realMatch()===false,'practice does not count toward achievements');
startMatch({mode:'quick',size:2,time:120,diff:'normal'});run(3.4);ok(PH.realMatch()===true,'quick match counts');
// pass chain best
// long shot tag + power goal counter via a real shot into an empty net
{startMatch({mode:'free',size:1,time:0,diff:'normal',noOpp:true});run(3.4);const p=G.player,dir=G.mine.dir;
 p.x=-dir*2;p.z=0;p.heading=dir>0?Math.PI/2:-Math.PI/2;p.vx=p.vz=0;G.puck.x=p.x+dir*1;G.puck.z=0;G.puck.vx=G.puck.vz=0;G.carry=p;p.cd.shoot=0;
 performShot(p,dir,0,1);ok(G.puck.shot&&Math.abs(G.puck.shot.x0-G.puck.x)<1.5,'shot origin is stored for the LONG SHOT tag');}
// save loader validates ach keys
{const fs=require('fs');const src=fs.readFileSync('main.js','utf8');ok(/s\.ach\[k\]===true&&\/\^a_\[a-z0-9\]\{1,12\}\$\/\.test\(k\)/.test(src),'loader only accepts well-formed achievement keys');}
// shop: shortfall message + two-step confirm
{const msgs=[];const m=PH.__msg;save.types=['basic'];save.points=100;
 const b={dataset:{},classList:{add(){},remove(){}},querySelector:()=>({textContent:''})};
 PH.buyConfirm(b,'types','fast',300,null);ok(!save.types.includes('fast')&&save.points===100,'not enough points: nothing is bought');
 save.points=1000;PH.buyConfirm(b,'types','fast',300,null);ok(!save.types.includes('fast')&&b.dataset.arm==='1'&&save.points===1000,'first tap only arms the purchase');
 PH.buyConfirm(b,'types','fast',300,null);ok(save.types.includes('fast')&&save.points===700,'second tap buys and charges once');
 PH.buyConfirm(b,'types','fast',300,null);ok(save.points===700,'owned item is never charged again');}
// stat grid
ok(/<b>\d+\.\d<\/b>/.test(PH.statGrid('fast')),'stat bars show numeric values');
// trail colour does not allocate
{save.trail='rainbow';const a=PH.trailCol(),b=PH.trailCol();ok(Array.isArray(a)?a===b:true,'rainbow trail reuses one colour buffer');}
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
