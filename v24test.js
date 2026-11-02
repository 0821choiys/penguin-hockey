// v24: Sardine Pass — season names, earning, tiers, free / gold claims, season roll-over, save
const {execFileSync}=require('child_process');
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {save,G,PASS,GRADES,RAR,TYPES}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const reset=s=>{Object.assign(save.pass,{s:s||PH.seasonNow(),xp:0,gold:false,cf:0,cg:0,fw:0,last:null});};

// ---- names change every season ----
const T=PASS.themes;
ok(PH.seasonNow()===1&&PH.passName(1).includes('오로라 정어리 패스'),'season 1 (now) = '+PH.passName(1));
ok(new Set([1,2,3,4,5,6,7,8].map(PH.passName)).size===8&&PH.passName(2).includes('빙하 탐험')&&PH.passName(9)===PH.passName(1),'8 different pass names, then the cycle repeats ('+[1,2,3].map(PH.passName).join(' / ')+' …)');
ok(T.every(t=>PH.TRAILS[t.t]&&PH.TRAILS[t.t].pass),'each season name has its own exclusive trail');
ok(PASS.free.length===PASS.tiers&&PASS.gold.length===PASS.tiers&&PASS.tiers===30,'30 tiers, a free and a gold reward on each');
ok([...PASS.free,...PASS.gold].every(r=>(r.p>0)+(r.c!=null&&r.c>=0&&r.c<=4)+(r.t===1)===1),'every reward is exactly one of: points / a card of one rarity / the season trail');

// ---- earning ----
reset();
{const a=PH.passMatch(true,false,2);ok(a.base===PASS.earn.win&&a.goals===2*PASS.earn.goal&&a.first===PASS.earn.first&&a.total===24+6+30&&save.pass.xp===60,'win with 2 goals, first win today: 24 + 2×3 + 30 = '+a.total);
 const b=PH.passMatch(true,false,9);ok(b.first===0&&b.goals===PASS.earn.goalMax*PASS.earn.goal&&b.total===24+15,'second win: no first-win bonus, goals capped at '+PASS.earn.goalMax+' ('+b.total+')');
 const c=PH.passMatch(false,true,0),d=PH.passMatch(false,false,1);ok(c.total===16&&d.total===10+3,'draw 16 · loss 10 + 3 per goal');
 ok(PH.passTier()===1&&save.pass.xp===60+39+16+13,'tier = sardines / '+PASS.per+' (xp '+save.pass.xp+' → tier '+PH.passTier()+')');
 const html=PH.passRowHtml({pass:a});ok(html.includes('정어리 +60')&&html.includes('승리 24')&&html.includes('골 2×3')&&html.includes('오늘 첫 승리 30'),'result row shows the same numbers ('+html.replace(/<[^>]+>/g,'')+')');}
// a daily goal claim adds sardines
{reset();PH.goalsEnsure();const g=save.goals.list[0];g.p=99;g.c=false;const p0=save.pass.xp;PH.claimGoal(0);ok(save.pass.xp-p0===PASS.earn.daily,'claiming a daily goal gives +'+PASS.earn.daily+' sardines');
 PH.renderGoals();}
{reset();save.pass.xp=99999;PH.passAdd(10);ok(save.pass.xp===PASS.tiers*PASS.per&&PH.passTier()===30,'sardines stop at the last tier');}

// ---- claims ----
reset();save.pass.xp=350;save.points=0;
ok(PH.passCan('f',0)&&PH.passCan('f',2)&&!PH.passCan('f',3)&&!PH.passCan('g',0),'tiers 1–3 free rewards claimable at tier 3, tier 4 not yet, gold locked');
{const r=PH.passClaim('f',0);ok(r&&save.points===40&&!PH.passCan('f',0),'claim tier 1 free: +40P, only once');
 ok(PH.passClaim('f',5)===null&&PH.passClaim('g',1)===null,'cannot claim an unreached tier or a gold reward without the Gold Pass');
 const t0=save.types.length,cc0=JSON.stringify(save.cc);const c=PH.passClaim('f',2);
 ok(c&&c.card&&c.card.g===0&&RAR[c.card.k]===0&&(save.types.length>t0||JSON.stringify(save.cc)!==cc0),'tier 3 free = a 기본 card that really lands in the collection ('+c.card.k+')');}
{save.points=100;PH.passBuy();ok(!save.pass.gold&&save.points===100,'not enough points: the Gold Pass stays locked, nothing charged');
 save.points=2000;PH.passBuy();ok(save.pass.gold&&save.points===2000-PASS.cost,'Gold Pass bought with in-game points ('+PASS.cost+'P)');
 const k=PH.passTheme(save.pass.s).t;save.trails=save.trails.filter(x=>x!==k);const r=PH.passClaim('g',0);ok(r&&save.trails.includes(k),'gold tier 1 = the season trail ('+PH.TRAILS[k].name+')');
 save.pass.cg&=~1;const p0=save.points;PH.passClaim('g',0);ok(save.points===p0+PASS.dup,'trail already owned → ⭐'+PASS.dup+'P instead');
 const n=PH.passCount();const got=PH.passClaimAll();ok(got===n&&PH.passCount()===0,'claim all: '+n+' rewards (retroactive gold included)');}
// ---- season roll-over: reached rewards are auto-claimed, the new pass has a new name ----
{reset(1);save.pass.xp=1000;save.pass.gold=true;save.pass.cf=0;save.pass.cg=0;const p0=save.points;
 save.pass.s=0;PH.passCheck();ok(save.pass.s===1&&save.pass.xp===0&&!save.pass.last,'first ever start: nothing to settle');
 Object.assign(save.pass,{s:0,xp:0});save.pass.s=-1;
 // simulate an old season: pretend we were in season 0 → not possible; use the next season instead
 Object.assign(save.pass,{s:1,xp:1000,gold:true,cf:0,cg:0});const real=Date.now;const day=86400000;Date.now=()=>real()+28*day;const RD=global.Date;
 class FD extends RD{constructor(...a){if(a.length)super(...a);else super(real()+28*day);}static now(){return real()+28*day;}}global.Date=FD;
 const sn=PH.seasonNow(),pts0=save.points;PH.passCheck();
 ok(sn===2&&save.pass.s===2&&save.pass.xp===0&&!save.pass.gold&&save.pass.last&&save.pass.last.tier===10&&save.pass.last.p>0&&save.points>pts0,'new season: tiers 1–10 (free + gold) auto-claimed (⭐'+(save.pass.last&&save.pass.last.p)+'P, '+(save.pass.last&&save.pass.last.c)+' cards), pass reset');
 ok(PH.passName(save.pass.s).includes('빙하 탐험'),'… and the pass is now called '+PH.passName(save.pass.s));
 global.Date=RD;Date.now=real;}
// ---- screen / menu render with the live numbers ----
{reset();save.pass.xp=737;PH.renderPass();PH.passMenu();ok(true,'pass screen + menu row render without errors');
 const h=PH.howV24();ok(h.includes(PASS.cost+'P')&&h.includes('승리 '+PASS.earn.win)&&h.includes('+'+PASS.earn.daily),'help text uses the same numbers');}
// ---- season trails are never for sale ----
ok(Object.keys(PH.TRAILS).filter(k=>PH.TRAILS[k].pass).every(k=>PH.TRAILS[k].cost===0),'season trails have no price (pass only)');

// ---- save ----
const load=sv=>JSON.parse(execFileSync('node',['-e',"const PH=require('./harness.js');console.log(JSON.stringify(PH.save.pass));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(sv)})}).toString().trim().split('\n').pop());
{const a=load({v:10,pass:{s:1,xp:420,gold:true,cf:5,cg:3,fw:20760}}),b=load({v:10}),c=load({v:10,pass:{s:'x',xp:-5,gold:'yes',cf:1e12}}),d=load({v:10,trails:['ice','ps1'],trail:'ps1'});
 ok(a.s===1&&a.xp===420&&a.gold===true&&a.cf===5&&a.cg===3,'pass progress survives a reload');
 ok(b.s===1&&b.xp===0&&b.gold===false,'old saves start the current season at tier 0');
 ok(c.xp===0&&c.gold===false&&c.cf>=0&&c.cf<=0x3fffffff,'corrupt pass data is sanitised');}
{const out=execFileSync('node',['-e',"const PH=require('./harness.js');console.log(JSON.stringify({t:PH.save.trails,s:PH.save.trail}));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify({v:10,trails:['ice','ps1'],trail:'ps1'})})}).toString().trim().split('\n').pop();
 const r=JSON.parse(out);ok(r.t.includes('ps1')&&r.s==='ps1','an owned season trail stays owned and selected after reload');}

console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
