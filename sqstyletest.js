const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {G,save,step,startMatch,sqBuy,renderSqStyle,TYPES}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
save.points=500;save.types=['basic'];save.hats=['none','beanie'];save.trails=['ice'];
sqBuy('hats','crown',120,()=>{save.hat='crown';});ok(save.hats.includes('crown')&&save.hat==='crown'&&save.points===380,'buy + equip hat (crown 120P)');
sqBuy('hats','crown',120,()=>{save.hat='crown';});ok(save.points===380,'owned hat: no second charge');
sqBuy('trails','gold',90,()=>{save.trail='gold';});ok(save.trail==='gold'&&save.points===290,'buy + use trail (gold 90P)');
sqBuy('types','fast',40,null);ok(save.types.includes('fast')&&save.points===250,'unlock a penguin with points (fast 40P)');
save.points=10;sqBuy('types','strong',80,null);ok(!save.types.includes('strong')&&save.points===10,'not enough points -> no unlock');
save.team='red';startMatch({mode:'quick',size:3,time:60,diff:'easy'});ok(G.mine.key==='red','team colour from 팀 편성 is used in matches');
save.type='fast';startMatch({mode:'quick',size:3,time:60,diff:'easy'});ok(G.player.type==='fast','captain (slot 1) is the controlled penguin');
renderSqStyle();ok(true,'style panel renders');
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,3).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
