// v44: coach level, win streaks, first win of the day — the numbers, the save, a real match through the result screen
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,save,step,startMatch,CO}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
save.set.rules='off';save.set.items=false;save.set.events=false;
const fresh=()=>{save.coach={lv:1,xp:0,streak:0,best:0,fw:''};};
const R=()=>({total:0});const Q={mode:'quick',diff:'normal'};
// ---- the curve and the rewards ----
ok(PH.coachNeed(1)===100&&PH.coachNeed(2)===120&&PH.coachNeed(10)===280,'XP needed: Lv1→2 100, Lv2→3 120, Lv10→11 280');
ok(PH.coachReward(2)===40&&PH.coachReward(4)===60&&PH.coachReward(5)===210&&PH.coachReward(10)===360,'level rewards: Lv2 40 P, Lv4 60 P, every 5th ×3 (Lv5 210 P, Lv10 360 P)');
ok([0,1,2,3,4,5,6,9].map(PH.coachStreakBonus).join()==='0,0,5,10,15,20,25,25','streak bonus: 2nd win +5 … capped at +25');
// ---- one match ----
fresh();const pts0=save.points;let r=R(),o=PH.coachMatch(r,Q,true,false,3);
ok(o.xp===40+15+20&&o.fw===50&&o.sb===0&&o.streak===1,'a first win today with 3 goals: 40 + 15 + 20 (first win) = 75 XP, +50 P first-win bonus, streak 1 '+JSON.stringify(o));
ok(save.points-pts0===o.pts&&r.total===o.pts&&o.pts===50,'the points paid = the points added to the match total');
r=R();o=PH.coachMatch(r,Q,true,false,1);
ok(o.fw===0&&o.sb===5&&o.streak===2&&o.ups.length===1&&o.to.lv===2&&o.up===40&&o.pts===45,'second win: no first-win bonus again today, +5 streak, Lv2 reached (+40 P) '+JSON.stringify(o));
r=R();o=PH.coachMatch(r,Q,false,true,2);ok(o.streak===2&&o.sb===0,'a draw keeps the streak but pays nothing for it');
r=R();o=PH.coachMatch(r,Q,false,false,0);ok(o.streak===0&&o.xp===15,'a loss resets the streak and still gives 15 XP');
ok(save.coach.best===2,'best streak remembered (2)');
// difficulty, modes
fresh();save.coach.fw=PH.todayKeyX?PH.todayKeyX():save.coach.fw;
o=PH.coachMatch(R(),{mode:'quick',diff:'hard'},false,false,5);ok(o.xp===Math.round((15+25)*1.3),'hard difficulty ×1.3 XP like points ('+o.xp+')');
o=PH.coachMatch(R(),{mode:'friend',diff:'normal'},true,false,0);ok(o.streak===0&&o.xp>0,'friend matches give XP but do not touch the streak');
ok(PH.coachMatch(R(),{mode:'demo'},true,false,3)===null&&PH.coachMatch(R(),{mode:'practice'},true,false,3)===null,'demo / practice give nothing');
// many levels at once, the cap
fresh();save.coach.xp=0;let tot=0;for(let i=0;i<400;i++){const q=PH.coachMatch(R(),Q,true,false,5);tot+=q.up;}
ok(save.coach.lv<=CO.max&&save.coach.lv>20,'400 wins: Lv.'+save.coach.lv+' (never above '+CO.max+')');
save.coach={lv:98,xp:0,streak:0,best:0,fw:''};for(let i=0;i<60;i++)PH.coachMatch(R(),Q,true,false,5);
ok(save.coach.lv===99&&save.coach.xp<=PH.coachNeed(99),'Lv.99 is the top and XP stops at its bar');
// ---- the save ----
{const run=raw=>{const r=require('child_process').spawnSync(process.execPath,['-e',"const PH=require('./harness.js');console.log('@@'+JSON.stringify(PH.save.coach));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(raw)}),encoding:'utf8'});const m=/@@(.*)/.exec(r.stdout||'');return m?JSON.parse(m[1]):null;};
 const a=run({v:10,points:5});ok(a&&a.lv===1&&a.xp===0&&a.streak===0&&a.fw==='','an old save without the coach field loads at Lv.1 '+JSON.stringify(a));
 const b=run({v:10,points:5,coach:{lv:7,xp:55,streak:3,best:8,fw:'2026-11-14'}});ok(b&&b.lv===7&&b.xp===55&&b.streak===3&&b.best===8&&b.fw==='2026-11-14','a saved coach level loads back '+JSON.stringify(b));
 const c=run({v:10,points:5,coach:{lv:'999',xp:-4,streak:'x',fw:{}}});ok(c&&c.lv===99&&c.xp===0&&c.streak===0&&c.fw==='','bad values are clamped '+JSON.stringify(c));}
// ---- a real match through the result screen ----
fresh();save.type='basic';const p0=save.points;
startMatch({mode:'quick',size:3,time:120,diff:'normal',oppTypes:['basic','fast','strong'],tag:'q'});
PH.endMatch?PH.endMatch():(G.timeLeft=0);for(let i=0;i<60*6&&!G.result;i++)step(1/60);
if(G.result){PH.showResultScreen();const Rr=G.result;
  ok(Rr.co&&Rr.co.xp>0&&save.coach.xp+0>=0,'a finished match gives coach XP ('+(Rr.co&&Rr.co.xp)+')');
  ok(save.points-p0===Rr.total,'everything paid (match + coach bonuses) = the total on the result screen ('+Rr.total+')');
  const x=save.coach.xp,l=save.coach.lv;PH.showResultScreen();ok(save.coach.xp===x&&save.coach.lv===l&&save.points-p0===Rr.total,'showing the result screen again pays nothing twice');
  {const f={co:{xp:10,from:{lv:3,xp:100},to:{lv:3,xp:PH.coachNeed(3)-CO.xp.win},ups:[],up:0,fw:0,sb:0,streak:0}},g={co:{xp:10,from:{lv:3,xp:0},to:{lv:3,xp:PH.coachNeed(3)-CO.xp.win-1},ups:[],up:0,fw:0,sb:0,streak:0}};
   ok(/co-one/.test(PH.coachBarHtml(f))&&!/co-one/.test(PH.coachBarHtml(g)),'"one more win" shows only when a win ('+CO.xp.win+' XP) is really enough');}
  const h=PH.coachRowsHtml(Rr)+PH.coachBarHtml(Rr);ok(/감독 Lv|Coach Lv/.test(h),'the result screen shows the coach bar');}
else ok(false,'the match did not finish');
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
