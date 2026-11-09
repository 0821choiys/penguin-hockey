// v37: a finished fish pass holds no more fish — result row, daily goals and 7-day attendance say (and give) what really happens
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {save,PASS,DLY}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const reset=xp=>{Object.assign(save.pass,{s:PH.seasonNow(),xp:xp||0,gold:false,cf:0,cg:0,fw:0,last:null,pro:0,cx:0});};
const MAX=PASS.tiers*PASS.per,txt=h=>h.replace(/<[^>]+>/g,'');

// ---- result row ----
reset(0);
{const a=PH.passMatch(true,false,1);ok(!PH.passFull()&&!a.full&&a.got===a.total&&txt(PH.passRowHtml({pass:a})).includes('+'+a.total),'normal match: row shows +'+a.total+' and all of it went in');}
reset(MAX-20);
{const a=PH.passMatch(true,false,2),h=txt(PH.passRowHtml({pass:a}));
 ok(a.full&&a.got===20&&save.pass.xp===MAX&&h.includes('+20')&&!h.includes('+'+a.total),'match that fills the pass: only the 20 fish that fit are shown ('+h+')');
 ok(PH.passFull(),'pass now full (tier '+PASS.tiers+')');}
{const x0=save.pass.xp,a=PH.passMatch(true,false,3),h=txt(PH.passRowHtml({pass:a}));
 ok(a.full&&a.got===0&&save.pass.xp===x0&&!/\+\d/.test(h)&&h.includes(PASS.tiers+'단계 완료'),'match after the pass is full: no "+N" fish, the row says the pass is complete ('+h+')');}

// ---- daily goals ----
reset(0);ok(PH.goalFishTxt()===' · 🐟+'+PH.passGain(PASS.earn.daily),'daily goal toast mentions 🐟+'+PASS.earn.daily+' while the pass can take it');
reset(MAX);ok(PH.goalFishTxt()==='','daily goal toast drops the fish once the pass is full');
{PH.goalsEnsure();const g=save.goals.list[0];g.p=99;g.c=false;const x0=save.pass.xp,p0=save.points;PH.claimGoal(0);
 ok(save.pass.xp===x0&&save.points>p0,'claiming a goal with a full pass: points as usual, pass unchanged');}

// ---- 7-day attendance ----
const fishDay=DLY.findIndex(r=>r.f);
const at=i=>{save.login={d:i,last:PH.dlyDay()-1,cyc:0,tot:i};save.clk=0;};
reset(0);at(fishDay);
{const card=txt(PH.dlyCardHtml());ok(card.includes('🐟+'+PH.passGain(DLY[fishDay].f)),'pass not full: the card promises 🐟+'+DLY[fishDay].f);
 const x0=save.pass.xp,p0=save.points,o=PH.dlyClaim();ok(o.fish===DLY[fishDay].f&&save.pass.xp-x0===o.fish&&save.points===p0,'…and gives exactly that many fish');}
reset(MAX);at(fishDay);
{const card=txt(PH.dlyCardHtml()),body=txt(PH.dlyBody());
 ok(card.includes('⭐'+DLY[fishDay].f+'P')&&!card.includes('🐟+'),'pass full: the card offers ⭐'+DLY[fishDay].f+'P instead ('+card+')');
 ok(body.includes('같은 수의 ⭐P'),'the dialog explains the swap');
 const p0=save.points,o=PH.dlyClaim();ok(o.pts===DLY[fishDay].f&&o.fish===0&&save.points-p0===DLY[fishDay].f&&save.pass.xp===MAX,'…and gives exactly ⭐'+DLY[fishDay].f+'P, pass unchanged');}
// the same calendar after a new season: the pass is empty again → fish again
reset(MAX);save.pass.s=PH.seasonNow()-1;at(fishDay);
ok(!PH.passFull()&&txt(PH.dlyCardHtml()).includes('🐟+'),'new season: the old full pass rolls over, fish days give fish again');

ok(errs.length===0,'no errors'+(errs.length?': '+errs[0]:''));
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
