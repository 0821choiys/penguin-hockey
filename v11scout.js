const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {save,G,step,startMatch,GACHA,BRK,ENH_PITY,TYPES}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const resetCards=()=>{for(const k in save.cc)save.cc[k]=[0,0,0,0,0];};
const RAR=PH.RAR;
// ---- odds config ----
ok(PH.epicChance(1)===6&&PH.epicChance(20)===6&&PH.epicChance(21)===12&&PH.epicChance(29)===60&&PH.epicChance(30)===100,'soft pity: 신화+ 6% until 20, +6%p per pull from 21, 30th guaranteed');
let sumOk=true;for(let s=0;s<GACHA.hard;s++){const p=PH.gradeProbs(s);if(Math.abs(p.reduce((a,b)=>a+b,0)-100)>1e-9||p.some(v=>v<0))sumOk=false;}ok(sumOk,'grade probabilities sum to 100% at every pity state');
const eff=PH.gachaEff();ok(eff.p[3]+eff.p[4]>6&&eff.perEpic<100/6&&Math.abs(eff.p[3]+eff.p[4]-100/eff.perEpic)<1e-9,'effective 신화+ rate includes pity ('+(eff.p[3]+eff.p[4]).toFixed(2)+'%, every '+eff.perEpic.toFixed(1)+' pulls)');
{const html=PH.oddsBox();ok(html.includes(eff.p[4].toFixed(2)+'%')&&html.includes((eff.p[3]+eff.p[4]).toFixed(2)+'%')&&html.includes((GACHA.softFrom+1)+'회차')&&html.includes(GACHA.hard+'회차'),'odds box prints the same numbers the roll uses');
 const ks=Object.keys(TYPES).filter(k=>!TYPES[k].exclusive);let sum=0;for(const k of ks)sum+=PH.typeRate(k);
 ok(Math.abs(sum-100)<1e-9&&ks.every(k=>html.includes(PH.typeRate(k).toFixed(2)+'%')),'per-penguin rates in the odds box add up to 100% ('+sum.toFixed(4)+')');}
// ---- measured distribution / pity / pickup ----
{save.scout.pity=0;save.scout.pickMiss=false;const N=200000,c=[0,0,0,0,0];let gap=0,maxGap=0,pk=0,guarOk=true,miss=false,tierSeen=0,rarOk=true;const P=PH.pickupNow().type,PG=RAR[P];
 for(let i=0;i<N;i++){const r=PH.pullOnce(0);c[r.g]++;if(r.type===P)pk++;if(RAR[r.type]!==r.g)rarOk=false;
   if(r.g===PG){tierSeen++;if(miss&&r.type!==P)guarOk=false;miss=r.type!==P;}
   if(r.g>=3){maxGap=Math.max(maxGap,gap);gap=0;}else gap++;}
 ok(rarOk,'every pulled penguin has exactly the rolled rarity');
 const pct=c.map(v=>v/N*100);ok(pct.every((v,i)=>Math.abs(v-eff.p[i])<.5),'measured grades '+pct.map(v=>v.toFixed(2)).join('/')+' = shown '+eff.p.map(v=>v.toFixed(2)).join('/'));
 ok(maxGap<=GACHA.hard-1,'never more than '+(GACHA.hard-1)+' pulls without 신화+ (longest '+maxGap+')');
 ok(guarOk,'after a '+PH.GRADES[PG].n+' pull that missed the pickup, the next '+PH.GRADES[PG].n+' is always the pickup ('+tierSeen+' pulls of that rarity)');
 // within its rarity the pickup comes pickShare% of the time, and always right after a miss: long-run share 1/(2-s)
 const s=GACHA.pickShare/100,exp=eff.p[PG]/(2-s),meas=pk/N*100;
 ok(Math.abs(meas-exp)<Math.max(.25,exp*.06),'pickup share '+meas.toFixed(2)+'% = rarity rate x 1/(2-'+s+') = '+exp.toFixed(2)+'% (shown base '+PH.pickupRate().toFixed(2)+'%)');
 ok(save.scout.hist.length===GACHA.histMax&&save.scout.hist.every(r=>TYPES[r[0]]&&r[1]>=0&&r[1]<=4),'pull history keeps the latest '+GACHA.histMax+' results');}
{let viol=0,n=0;for(let t=0;t<400;t++){save.points=1e6;save.scout.pity=0;save.scout.freeDay=(()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();})();const h0=save.scout.pulls;PH.doPull(10);const got=save.scout.hist.slice(0,save.scout.pulls-h0);n+=got.length;if(got.length!==10||!got.some(r=>r[1]>=GACHA.tenMin))viol++;}
 ok(viol===0&&n===4000,'real 10-pull (doPull) always has '+PH.GRADES[GACHA.tenMin].n+'+ ('+n+' cards)');}
// ---- weekly pickup rotation ----
{const a=PH.pickupNow(new Date(2026,9,19,12)),b=PH.pickupNow(new Date(2026,9,25,23,59)),c=PH.pickupNow(new Date(2026,9,26,0,1));
 ok(a.type===b.type&&a.type!==c.type,'pickup changes exactly at Monday 00:00 ('+a.type+' → '+c.type+')');
 ok(a.ends.getDay()===1&&a.ends.getHours()===0&&+a.ends===+new Date(2026,9,26),'banner end time is the next Monday 00:00');
 const seen=new Set(),nReg=Object.keys(TYPES).filter(k=>!TYPES[k].exclusive).length;for(let w=0;w<nReg;w++)seen.add(PH.pickupNow(new Date(2026,0,5+7*w)).type);ok(seen.size===nReg&&![...seen].some(k=>TYPES[k].exclusive),'all '+nReg+' scout penguins rotate, never the exclusive one');}
// ---- duplicate storage cap ----
{if(!save.types.includes('defense'))save.types.push('defense');const g=RAR.defense;save.cc.defense[g]=GACHA.dupCap;const p0=save.points;PH.grantCard('defense');ok(save.cc.defense[g]===GACHA.dupCap&&save.points===p0+GACHA.dupOverflow[g],'full storage refunds the '+PH.GRADES[g].n+' price instead of losing the card');save.cc.defense[g]=0;}
// ---- not enough points: nothing charged ----
{save.points=10;save.scout.freeDay=PH.save.scout.freeDay||'';const pulls=save.scout.pulls;save.scout.freeDay=(()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();})();PH.doPull(1);ok(save.points===10&&save.scout.pulls===pulls,'pull without enough points does nothing');}
// ---- enhancement guarantee ----
{save.lv.basic=8;save.scout.fail.basic=ENH_PITY;save.cc.basic[0]=1;save.points=1000;ok(PH.enhRate('basic',0)===100,'after '+ENH_PITY+' failures the next enhancement is 100%');PH.doEnhance('basic',0);ok(save.lv.basic===9&&save.scout.fail.basic===0,'guaranteed enhancement succeeds and resets the counter');
 save.lv.basic=9;save.scout.fail.basic=0;let n=0;for(let i=0;i<300&&save.lv.basic===9;i++){save.cc.basic[0]=1;save.points=1000;PH.doEnhance('basic',0);n++;}ok(save.lv.basic===10&&n<=ENH_PITY+1,'worst case reaches the next level within '+(ENH_PITY+1)+' tries ('+n+')');
 ok(save.scout.elog.length>0&&save.scout.elog.length<=8,'enhancement log kept (max 8)');}
// ---- breakthrough ----
{resetCards();save.brk={};save.brkPts={};save.types=['basic','fast','strong'];save.lv.fast=4;save.points=5000;
 save.cc.fast=[3,0,0,0,0];let pl=PH.brkPlan('fast');ok(RAR.fast===0&&pl.ok&&pl.use.join()==='3,0,0,0,0'&&pl.carry===0&&pl.need===3,'★1 needs 3 points: 3 기본 cards (1 point each)');
 const ovr0=PH.cardOvr('fast',4);PH.doBreak('fast');ok(save.brk.fast===1&&save.cc.fast.join()==='0,0,0,0,0'&&save.points===5000-BRK.cost[0],'breakthrough consumes the planned cards and its cost');
 ok(Math.abs(PH.cardOvr('fast',4)-ovr0-BRK.ovr)<=1,'OVR rises with breakthrough ('+ovr0+' → '+PH.cardOvr('fast',4)+')');
 save.brk.strong=1;save.cc.strong=[0,0,0,0,1];pl=PH.brkPlan('strong');ok(RAR.strong===4&&pl.ok&&pl.use[4]===1&&pl.carry===2,'a 전설 card (8 pts) for ★2 (6) carries 2 points over');PH.doBreak('strong');ok(save.brk.strong===2&&save.brkPts.strong===2,'leftover points carried to the next breakthrough');
 save.cc.fast=[5,0,0,0,0];pl=PH.brkPlan('fast');ok(pl.ok===false&&pl.have===5&&pl.need===6,'★2 of a 기본 penguin needs 6 of its cards (5 are not enough)');
 const pts=save.points;save.cc.fast=[1,0,0,0,0];ok(PH.doBreak('fast')===false&&save.brk.fast===1&&save.points===pts&&save.cc.fast[0]===1,'not enough breakthrough points: nothing consumed');
 save.brk.fast=BRK.max;ok(PH.brkPlan('fast').max&&PH.doBreak('fast')===false,'cannot go past ★'+BRK.max);
 const h=PH.cardHtml('fast');ok(h.includes('★★★★★')&&h.includes(' b5'),'owned card shows breakthrough stars and awakened frame');
 ok(!PH.cardHtml('fast',{g:1,lv:0,tag:'중복'}).includes('★'),'material cards do not show the owner\'s stars');
 save.brk.fast=5;save.type='fast';startMatch({mode:'quick',size:1,time:60,diff:'easy'});const p=G.player;const base=TYPES.fast.stats.speed+save.lv.fast*PH.LV_STAT_+0;
 ok(p.ty.stats.speed>TYPES.fast.stats.speed+save.lv.fast*.09+.24&&p.cdBonus>=.1-1e-9,'breakthrough stats and cooldown apply in matches (speed '+p.ty.stats.speed.toFixed(2)+', cd '+p.cdBonus.toFixed(2)+')');}
// ---- screens render ----
{let e=null;try{const a=PH.scPullHtml(),b=PH.scEnhHtml(),c=PH.scDexHtml();ok(a.includes('주간 픽업')&&a.includes('천장')&&b.includes('강화하기')&&b.includes('돌파')&&c.includes('dxQ'),'pull / enhancement / dex sections render');}catch(x){e=x;ok(false,'render error '+x.message);}}
// ---- growth achievements ----
ok(['a_enh10','a_lv10','a_brk1','a_brk5'].every(id=>PH.ACH.some(a=>a.id===id)),'growth achievements added');
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
