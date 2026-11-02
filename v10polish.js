const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {save}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
// persistent fake elements so we can read what the UI wrote
const els={},orig=document.querySelector;const el=()=>({textContent:'',innerHTML:'',title:'',className:'',style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},querySelector:()=>null,querySelectorAll:()=>[]});
document.querySelector=s=>(['#msg','#goalBadge','#ptsN','#achPop'].includes(s)?(els[s]=els[s]||el()):orig(s));
// shortfall message everywhere
save.points=40;PH.lackMsg(150);ok(els['#msg'].textContent.includes('110P 부족')&&els['#msg'].textContent.includes('필요 150P'),'shortfall message: '+els['#msg'].textContent);
save.points=10;PH.doPull(1);save.scout.freeDay=new Date().toISOString().slice(0,10);
save.points=10;const before=save.points;PH.doPull(10);ok(save.points===before&&/부족해요 \(필요/.test(els['#msg'].textContent),'pack pull without enough points: nothing charged, shortfall shown');
// NEW badge for fresh achievements
save.achNew=0;save.ach={};save.stats.wins=1;PH.achCheck();
ok(save.achNew>=1,'earning an achievement marks it as new ('+save.achNew+')');
PH.hypeMenuRefresh();const b=els['#goalBadge'];ok(b.style.display==='inline-block'&&(b.textContent==='NEW'||+b.textContent>0),'menu 목표 button shows a badge ('+b.textContent+')');
// SVG gradient ids are unique in the shipped file
{const h=require('fs').readFileSync('penguin-hockey-improved.html','utf8');const ids=[...h.matchAll(/<linearGradient id="([^"]+)"/g)].map(m=>m[1]);ok(new Set(ids).size===ids.length,'SVG gradient ids are unique ('+ids.join(',')+')');
 ok(!/'포인트가 부족해요!'/.test(h),'no generic "not enough points" message left');}
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
