// v17 unit checks: season league, rink conditions (빙판 변수), pass-combo shot (콤보 슛)
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {G,save,step,startMatch,performShot}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60);};
const near=(a,b,e)=>Math.abs(a-b)<=(e||1e-9);
// ---- controllable clock (dayNum() uses new Date(), the save uses Date.now()) ----
const RealDate=Date;let FAKE=null;
global.Date=class extends RealDate{constructor(...a){if(a.length===0&&FAKE!==null)super(FAKE);else super(...a);}static now(){return FAKE!==null?FAKE:RealDate.now();}};
const setNow=(y,mo,d,h)=>{FAKE=new RealDate(y,mo-1,d,h==null?12:h,0,0).getTime();};
const realMath=Math.random;const fixRandom=v=>{Math.random=()=>v;};const unfix=()=>{Math.random=realMath;};
const {SEASON,COND,COND_W,CF,CF0,PC}=PH;

/* =================== 1. season league =================== */
setNow(2026,10,28);
ok(PH.seasonNow()===1,'2026-10-28 is in season 1');
setNow(2026,11,22,23);ok(PH.seasonNow()===1&&PH.seasonLeft(1)===1,'2026-11-22 (last day) is still season 1, 1 day left');
setNow(2026,11,23,1);ok(PH.seasonNow()===2,'2026-11-23 starts season 2 (28 days after 10-26)');
setNow(2026,10,20);ok(PH.seasonNow()===1,'a clock before the first season counts as season 1');
setNow(2026,10,28);ok(PH.seasonLeft(1)===26,'season 1 has 26 days left on 10-28');
ok(/11/.test(PH.seasonDate(1))&&/22/.test(PH.seasonDate(1)),'season 1 ends on 11-22 ('+PH.seasonDate(1)+')');
ok(SEASON.rew.length===PH.TIERS.length,'one reward per tier ('+SEASON.rew.length+')');
ok(SEASON.rew.every((r,i)=>i===0||r.p>SEASON.rew[i-1].p),'higher tiers always pay more points');
ok(PH.seasonSoft(1600)===1500&&PH.seasonSoft(1200)===1200&&PH.seasonSoft(900)===900&&PH.seasonSoft(2100)===1875,'soft reset keeps 75% of the rating above 1200 (1600→1500, 2100→1875, ≤1200 unchanged)');
const S=save.season,fresh=(n,o)=>Object.assign(S,{n,g:0,w:0,d:0,l:0,best:0,start:save.mgr.r,paid:0,last:null,hist:[]},o||{});
save.clk=0;
// counting: every rated result goes through mgrApply
setNow(2026,11,10);fresh(1);save.mgr.r=1400;save.mgr.games=30;
PH.mgrApply(1,1500,'t1');const r1=save.mgr.r;PH.mgrApply(0,1300,'t2');PH.mgrApply(.5,1400,'t3');
ok(S.g===3&&S.w===1&&S.l===1&&S.d===1,'season counts tier games W/D/L ('+S.g+': '+S.w+'/'+S.d+'/'+S.l+')');
ok(S.best===Math.max(r1,save.mgr.r)&&S.best>=r1,'season best = best rating after a tier game ('+S.best+')');
// rollover with a reward
{
  S.best=1460;save.mgr.r=1440;const p0=save.points,c0=JSON.stringify(save.cc),t0=save.types.slice();
  setNow(2026,11,24);const rolled=PH.seasonCheck();const L=S.last;
  ok(rolled&&S.n===2&&S.g===0&&S.best===0,'season 1 → 2 rolls over and starts empty');
  ok(L&&L.ok&&L.t===3&&L.pts===320&&save.points-p0===320,'platinum (1460) pays 320P ('+(save.points-p0)+')');
  ok(L.card&&L.card.g===3&&PH.RAR[L.card.k]===3&&(L.card.isNew?save.types.includes(L.card.k)&&!t0.includes(L.card.k):save.cc[L.card.k][3]===JSON.parse(c0)[L.card.k][3]+1),'… plus one 신화 penguin card that really lands in the collection ('+(L.card&&L.card.k)+')');
  ok(save.mgr.r===1380&&L.r0===1440&&L.r1===1380,'rating soft-reset 1440 → 1380');
  ok(save.mgr.hist[0]&&save.mgr.hist[0].d===-60&&save.mgr.hist[0].l==='시즌 리셋','the reset shows in the rating history (-60)');
  ok(S.paid===1&&L.seen===false&&S.hist[0].n===1&&S.hist[0].ok,'paid once, summary waiting to be shown, kept in past seasons');
  const p1=save.points;ok(!PH.seasonCheck()&&save.points===p1,'checking again the same day pays nothing');
}
// not enough games: no reward, still a reset
{
  S.g=2;S.best=1700;save.mgr.r=1700;const p0=save.points;setNow(2026,12,22);PH.seasonCheck();const L=S.last;
  ok(S.n===3&&!L.ok&&L.pts===0&&save.points===p0&&save.mgr.r===1575,'2 games is not enough: no reward, rating 1700 → 1575');
  ok(S.hist[0].n===2&&!S.hist[0].ok,'… recorded as a past season without reward');
}
// nobody played: quiet start, nothing to show
{
  save.mgr.r=1100;const h0=S.hist.length;setNow(2027,1,20);PH.seasonCheck();
  ok(S.n===4&&S.last.quiet&&S.last.seen&&S.hist.length===h0&&save.mgr.r===1100,'a season without games and no reset starts quietly');
}
// clock moved backwards: nothing settles
{
  save.clk=RealDate.now()+400*86400000;setNow(2027,3,1);const n0=S.n,p0=save.points;
  ok(!PH.seasonCheck()&&S.n===n0&&save.points===p0,'clock turned back (save.clk ahead): no rollover');save.clk=0;
}
// a result that arrives after the boundary: old season settles first, the game counts in the new one
{
  setNow(2027,2,10);fresh(PH.seasonNow(),{g:5,best:1650});save.mgr.r=1600;const n0=S.n,p0=save.points;
  setNow(2027,3,1);PH.mgrApply(1,1500,'late');   // 2027-02-10 = season 4, 2027-03-01 = season 5
  ok(S.last.n===n0&&S.last.ok&&S.last.t===4&&save.points-p0===480,'old season settled first (diamond 1650 → 480P)');
  ok(S.n===n0+1&&S.g===1&&S.w===1&&save.mgr.r>1500&&save.mgr.r<1530,'… and the win counts in the new season, on the reset rating ('+save.mgr.r+')');
}
// texts carry the live numbers
{
  const t=PH.seasonRulesTxt(),n=g=>PH.tierTypes(g).length;   // v21: reward cards come from the reached tier's rarity
  ok(t.includes('4주마다(28일)')&&t.includes('3판 이상')&&t.includes('레어 '+n(2)+'종')&&t.includes('신화 '+n(3)+'종')&&t.includes('전설 '+n(4)+'종')&&t.includes('1200점')&&t.includes('25%')&&t.includes('1600 → 1500'),'rules text = code numbers (28 days, 3 games, rarity pools '+[n(2),n(3),n(4)]+', 1200, 25%, 1600→1500)');
  S.best=1460;S.g=3;const h=PH.seasonBoxHtml();
  ok((h.match(/<div( class="cur")?><span style/g)||[]).length===8&&SEASON.rew.every((r,i)=>h.includes(PH.seasonRewTxt(i))),'reward table: 8 tiers, each with its reward');
  ok(h.includes('class="cur"')&&h.includes('✔ 보상 조건 달성')&&h.includes('⭐ 320P'),'current tier highlighted, eligibility and expected reward shown');
  S.g=1;ok(PH.seasonBoxHtml().includes('2판 더 하면'),'shows how many games are still needed');
  S.g=1;ok(PH.seasonNote().includes('2판'),'result-screen note: games left');S.g=3;ok(PH.seasonNote().includes('조건 달성'),'result-screen note: condition reached');
}
// saved data is validated
{
  const s0=JSON.parse(JSON.stringify(S));
  PH.seasonLoad({n:'7',g:-3,w:'x',d:2.9,l:1e9,best:99999,start:1200,paid:6,last:{n:6,t:42,ok:true,pts:-5,card:{k:'nope',g:9},seen:'no',r0:1300,r1:1250},hist:[{n:5,t:3,ok:true,best:1400},null,'x']});
  ok(S.n===7&&S.g===0&&S.w===0&&S.d===2&&S.l===99999&&S.best===4000,'season numbers are clamped');
  ok(S.last&&S.last.t===-1&&S.last.pts===0&&S.last.card===null&&S.last.seen===true&&S.hist.length===1&&S.hist[0].t===3,'bad summary fields are dropped (unknown card, bad tier); a corrupt flag never re-shows the popup');
  Object.assign(S,s0);
}
FAKE=null;save.clk=0;fresh(PH.seasonNow());

/* =================== 2. rink conditions =================== */
ok(Object.values(COND_W).reduce((a,b)=>a+b,0)===100,'condition chances add up to 100%');
{
  const N=200000,c={none:0,blizzard:0,thin:0,night:0};for(let i=0;i<N;i++){const k=PH.condRoll();c[k||'none']++;}
  const bad=Object.keys(c).filter(k=>Math.abs(c[k]/N*100-COND_W[k])>.6);
  ok(!bad.length,'200k rolls match the stated chances ('+Object.keys(c).map(k=>k+' '+(c[k]/N*100).toFixed(1)+'%').join(', ')+')');
}
{
  const A=PH.condAllowed;
  ok(['quick','free','tour'].every(m=>A({mode:m})),'conditions in quick / free / tournament');
  ok(['ranked','trial','challenge','practice','shootout','demo'].every(m=>!A({mode:m}))&&!A({mode:'quick',tutorial:true})&&!A({mode:'tour',final:true}),'never in tier games, challenges, practice, shootout, tutorial or the tournament final');
  save.set.cond=false;ok(!A({mode:'quick'}),'switched off in settings → none');save.set.cond=true;
  ok(PH.SETDEF.some(d=>d.k==='cond'),'settings row exists');
}
for(const k of['blizzard','thin','night']){
  startMatch({mode:'quick',size:3,time:120,diff:'normal',cond:k});run(.2);
  ok(G.cond===k&&Object.keys(COND[k].f).every(f=>CF[f]===COND[k].f[f]),k+': match runs under the condition with its factors');
}
fixRandom(.5);startMatch({mode:'ranked',size:3,time:120,diff:'normal',oppR:1200,oppName:'x',label:'x'});unfix();run(.2);
ok(G.cond===null&&Object.keys(CF0).every(f=>CF[f]===1),'ranked match: no condition, all factors back to 1 (random fixed to a value that would roll one)');
fixRandom(.5);startMatch({mode:'quick',size:3,time:120,diff:'normal'});unfix();
ok(G.cond==='blizzard','quick match rolls its own condition (random .5 → 눈보라)');
// physics
startMatch({mode:'free',size:1,time:0,diff:'normal',noOpp:true,goalieOnly:true,cond:null});run(3.4);
{
  const p=G.player;
  const coast=()=>{p.x=-10;p.z=0;p.vx=10;p.vz=0;p.heading=Math.PI/2;p.ix=p.iz=0;p.slideT=p.dashT=p.fall=p.slow=0;let d=0;for(let i=0;i<120;i++){const x0=p.x;PH.movePeng(p,1/120);d+=p.x-x0;}return d;};
  const side=()=>{p.x=-10;p.z=0;p.vx=0;p.vz=8;p.heading=Math.PI/2;p.ix=1;p.iz=0;p.slideT=p.dashT=p.fall=p.slow=0;for(let i=0;i<60;i++)PH.movePeng(p,1/120);return Math.abs(p.vz);};
  PH.ctl().easy=false;   // the condition factors on the classic handling (v36test checks they still matter with easy handling on)
  Object.assign(CF,CF0);const d0=coast(),s0=side();
  Object.assign(CF,CF0,COND.thin.f);const d1=coast(),s1=side();
  Object.assign(CF,CF0);PH.ctl().easy=true;
  ok(d1>d0*1.05,'thin ice: a coasting penguin glides farther ('+d0.toFixed(2)+' → '+d1.toFixed(2)+' m in 1 s)');
  ok(s1>s0*1.3,'thin ice: sideways slide is held less by the edges ('+s0.toFixed(2)+' → '+s1.toFixed(2)+' m/s after 0.5 s)');
  const pk=G.puck,keep=G.pengs;
  const slide=()=>{G.pengs=[];G.carry=null;pk.x=-10;pk.z=0;pk.vx=12;pk.vz=0;for(let i=0;i<120;i++)PH.puckStep(1/120);G.pengs=keep;return Math.hypot(pk.vx,pk.vz);};
  Object.assign(CF,CF0);const v0=slide();Object.assign(CF,CF0,COND.thin.f);const v1=slide();Object.assign(CF,CF0,COND.blizzard.f);const v2=slide();Object.assign(CF,CF0);
  ok(v1>v0&&v0>v2,'puck after 1 s: thin ice '+v1.toFixed(2)+' > normal '+v0.toFixed(2)+' > blizzard '+v2.toFixed(2)+' m/s');
}
// AI aim under blizzard: the extra AI spread is 1.6×
{
  startMatch({mode:'free',size:1,time:0,diff:'normal',cond:null});run(3.4);
  const o=G.mine.opp.skaters[0],dir=G.mine.opp.dir,pk=G.puck;
  const shot=()=>{o.x=6*dir;o.z=0;o.heading=dir>0?Math.PI/2:-Math.PI/2;o.vx=o.vz=0;o.cd.shoot=0;o.recvT=-9;o.fireT=0;pk.x=o.x+1.1*dir;pk.z=0;pk.vx=pk.vz=0;fixRandom(1);performShot(o,dir,0,.5);unfix();return Math.abs(Math.atan2(pk.vz,pk.vx*dir));};
  Object.assign(CF,CF0);const a0=shot();Object.assign(CF,CF0,COND.blizzard.f);const a1=shot();Object.assign(CF,CF0);
  const ai=G.diff.aim*.05,want=(.012+ai*1.6)/(.012+ai);
  ok(a1>a0&&near(a1/a0,want,.005),'blizzard: the AI part of the shot wobble is 1.6× ('+a0.toFixed(4)+' → '+a1.toFixed(4)+' rad at max roll, expected ×'+want.toFixed(3)+')');
}
// night: goalies react later
{
  const gkRun=(night)=>{
    startMatch({mode:'free',size:1,time:0,diff:'normal',noOpp:true,goalieOnly:true,cond:night?'night':null});run(3.4);
    const g=G.mine.opp.goalie,p=G.player,dir=G.mine.dir,pk=G.puck;for(const q of G.mine.skaters){q.x=-15*dir;q.z=10;}
    g.x=g.hx;g.z=0;g.vx=g.vz=0;g.ai.seenT=0;g.ai.upd=0;g.ai.zt=0;
    pk.x=10*dir;pk.z=0;const tx=24*dir,tz=2.1,L=Math.hypot(tx-pk.x,tz-pk.z),v=22;pk.vx=(tx-pk.x)/L*v;pk.vz=(tz-pk.z)/L*v;pk.shot={by:p,t:G.t,charge:.6,onTarget:true};pk.last=p;pk.lastTeam=G.mine;
    fixRandom(.5);const z0=g.z;let zAt=null;for(let i=0;i<34;i++){step(1/60);if(i===33)zAt=g.z;}unfix();   // 0.567 s: normal goalie reacted at 0.42 s, night only at 0.59 s
    return {react:g.ai.seenT,z:zAt-z0};
  };
  const a=gkRun(false),b=gkRun(true);
  ok(b.z<a.z,'night: the goalie has moved less toward the corner 0.57 s after the shot ('+a.z.toFixed(2)+' → '+b.z.toFixed(2)+' m)');
  ok(PH.todTarget()>.9,'night game is played at night ('+PH.todTarget()+')');
}
// visuals ease in and never linger in menus
{
  startMatch({mode:'quick',size:3,time:120,diff:'normal',cond:'blizzard'});run(4);
  ok(PH.CV.fog>.02&&G.wx.target===1,'blizzard: fog closes in, heavy snow ('+PH.CV.fog.toFixed(3)+')');
  startMatch({mode:'quick',size:3,time:120,diff:'normal',cond:'night'});run(4);ok(PH.CV.dark>.95,'night: rink lights dimmed ('+PH.CV.dark.toFixed(2)+')');
  startMatch({mode:'quick',size:3,time:120,diff:'normal',cond:'thin'});run(4);ok(PH.CV.thin>.95,'thin ice: ice turns glossy with cracks ('+PH.CV.thin.toFixed(2)+')');
  PH.toMenu?PH.toMenu():null;G.view='menu';PH.v17Frame(1/60);ok(PH.CV.fog===0&&PH.CV.dark===0&&PH.CV.thin===0,'menu: no condition visuals left');
}
// reward bonus
{
  startMatch({mode:'quick',size:3,time:60,diff:'normal',cond:'thin'});run(3.4);
  const p0=save.points;G.mine.score=2;G.mine.opp.score=0;G.timeLeft=.02;run(4.5);const R=G.result;
  ok(R&&R.paid&&R.cond===Math.max(2,Math.round(R.base*.1))&&R.condK==='thin','thin-ice win: bonus = 10% of the base reward ('+R.cond+'P of '+R.base+'P)');
  ok(R.total===R.base+R.cb+R.extra+R.fv+R.cond+(R.achP||0)+(R.co?R.co.pts:0),'… and it is part of the total paid (v44: plus the coach bonuses, each shown as its own row)');
  ok(PH.condBonusRow(R).includes('빙판 변수 보너스')&&PH.condBonusRow(R).includes('얇은 얼음'),'result screen shows the bonus row');
  startMatch({mode:'quick',size:3,time:60,diff:'normal',cond:null});run(3.4);G.mine.score=1;G.timeLeft=.02;run(4.5);
  ok(G.result.cond===0&&PH.condBonusRow(G.result)==='','no condition → no bonus row');
}
// tournament: the intro rolls and shows the round's condition, never in the final
{
  G.tour={round:0,champPaid:false};fixRandom(.75);PH.showTourIntro();unfix();ok(G.tour.cond==='thin','tournament intro rolls the round condition (random .75 → 얇은 얼음)');
  G.tour.round=PH.TOUR.length-1;fixRandom(.5);PH.showTourIntro();unfix();ok(G.tour.cond===null,'tournament final: no condition');
}
// help text = code numbers
{
  const h=PH.howV17();
  ok(h.includes((100-COND_W.none)+'% 확률')&&Object.keys(COND).every(k=>h.includes(COND[k].name+' '+COND_W[k]+'%'))&&h.includes('보상 +10%'),'how-to: '+(100-COND_W.none)+'% overall and each condition’s own chance, +10% reward');
  ok(h.includes(PC.win+'초 안에 이어서 '+PC.need+'번')&&h.includes('+20%')&&h.includes('+25%')&&h.includes('+30%'),'how-to: combo rule numbers (6 s, 3 passes, +20/25/30%)');
  ok(h.includes(SEASON.days+'일마다')&&h.includes(SEASON.min+'판 이상'),'how-to: season numbers');
}

/* =================== 3. pass-combo shot =================== */
startMatch({mode:'quick',size:3,time:120,diff:'normal',cond:null});run(3.4);
{
  const tm=G.mine,[a,b,c]=tm.skaters,op=tm.opp.skaters[0];
  const pass=(f,t)=>PH.passDone({from:f,to:t,t:G.t,d:6});
  PH.pcReset();pass(a,b);pass(b,c);ok(tm.pc.n===2&&!PH.pcReady(tm)&&PH.pcShotMul(a)===1,'2 passes: no bonus yet');
  pass(c,a);ok(PH.pcReady(tm)&&PH.pcPopText({from:a,to:b}).includes('x3')&&PH.pcPopText({from:a,to:b}).includes('+20%'),'3rd pass: combo ready, popup says x3 · +20%');
  ok(near(PH.pcShotMul(a),1.2)&&a._combo===3&&tm.pc.n===0,'next shot ×1.20, then the combo is used up');
  PH.pcReset();pass(a,b);pass(b,c);pass(c,a);pass(a,b);ok(near(PH.pcShotMul(b),1.25),'4 passes: ×1.25');
  PH.pcReset();for(let i=0;i<7;i++)pass(i%2?a:b,i%2?b:a);ok(near(PH.pcShotMul(a),1.3),'7 passes: capped at ×1.30');
  PH.pcReset();pass(a,b);G.t+=PC.win+.1;pass(b,c);ok(tm.pc.n===1,'a pass more than '+PC.win+' s after the last one starts a new chain');
  PH.pcReset();pass(a,b);pass(b,c);pass(c,a);G.t+=PC.win+.1;ok(!PH.pcReady(tm)&&PH.pcShotMul(a)===1,'combo shot must come within '+PC.win+' s');
  PH.pcReset();pass(a,b);pass(b,c);PH.touchPuck(c,2);ok(tm.pc.n===2,'own touch keeps the chain');
  PH.touchPuck(op,2);ok(tm.pc.n===0,'any opponent touch breaks it');
  PH.pcReset();pass(a,b);pass(b,c);PH.passLost({from:c,to:a,t:G.t},'cut');ok(tm.pc.n===0,'an intercepted / missed pass breaks it');
  PH.pcReset();pass(a,b);pass(b,c);pass(c,a);PH.resetPositions();ok(tm.pc.n===0&&tm.opp.pc.n===0,'face-off resets both chains');
  const o1=tm.opp.skaters[0],o2=tm.opp.skaters[1];PH.pcReset();pass(o1,o2);pass(o2,o1);pass(o1,o2);ok(PH.pcReady(tm.opp)&&near(PH.pcShotMul(o2),1.2),'the opponent team gets the same combo');
  // a real shot: exactly ×1.2 faster, flagged
  const dir=tm.dir,pk=G.puck;
  const shot=()=>{a.x=8*dir;a.z=0;a.heading=dir>0?Math.PI/2:-Math.PI/2;a.vx=a.vz=0;a.cd.shoot=0;a.shotGrace=0;a.recvT=-9;a.fireT=0;pk.x=a.x+1.1*dir;pk.z=0;pk.vx=pk.vz=0;G.carry=null;fixRandom(.5);performShot(a,dir,0,.6);unfix();return Math.hypot(pk.vx,pk.vz);};
  G.hype.feverT=0;PH.pcReset();const v0=shot();pass(b,c);pass(c,b);pass(b,c);G.hype.feverT=0;const v1=shot();   // (FEVER from the hype combo would add its own ×1.08)
  ok(near(v1/v0,1.2,1e-6)&&pk.shot&&pk.shot.combo===3,'performShot: combo shot is exactly ×1.20 ('+v0.toFixed(2)+' → '+v1.toFixed(2)+' m/s) and flagged');
  const r=PH.classifyGoal(tm,{by:a,t:G.t,charge:.6,combo:3,deflected:false});ok(r.tags.includes('COMBO SHOT!'),'combo-shot goal gets the COMBO SHOT! tag');
  const g0=save.cum.comboGoal;pk.shot={by:a,t:G.t,charge:.6,combo:3,onTarget:true};PH.scored(tm);ok(save.cum.comboGoal===g0+1&&tm.pc.n===0,'scoring with it counts toward the 콤보 슈터 achievement and resets the chains');
  const A=PH.ACH.find(x=>x.id==='a_combo');ok(A&&A.n===5&&A.desc.includes('5'),'achievement 콤보 슈터: 5 combo-shot goals');
}
// where it is off
{
  startMatch({mode:'challenge',challenge:PH.CHALLENGES.find(c=>c.kind==='pass'),size:3,time:90,diff:'normal',noOpp:true,noScoreOpp:true,noGoalies:true,noScoreAll:true,noAIShoot:true});run(3.4);
  const [a,b]=G.mine.skaters;PH.passDone({from:a,to:b,t:G.t,d:6});PH.passDone({from:b,to:a,t:G.t,d:6});PH.passDone({from:a,to:b,t:G.t,d:6});
  ok(!PH.pcOn()&&!PH.pcReady(G.mine)&&PH.pcPopText({from:a,to:b}).indexOf('x')>0&&!PH.pcPopText({from:a,to:b}).includes('콤보'),'pass challenge keeps its own counter (no combo shot)');
  G.view='menu';PH.setupMatch({demo:true,mode:'demo',size:3,diff:'normal',time:0,teamKey:'blue'});ok(!PH.pcOn(),'menu demo: off');
}

/* =================== 4. soak: every condition, real matches, no errors / NaN / escapes =================== */
for(const k of[null,'blizzard','thin','night']){
  startMatch({mode:'quick',size:3,time:45,diff:'normal',cond:k});
  let goals=0,last=0,combos=0,maxOut=0,falls=0;const seen=new Set();
  // budget covers a full sudden-death shootout (up to 10 rounds each x ~10 s) after a tied 45 s match
  for(let i=0;i<60*480;i++){
    const p=G.player;if(p&&G.state==='play'){const dx=G.puck.x-p.x,dz=G.puck.z-p.z,l=Math.hypot(dx,dz)||1;PH.input.x=dx/l;PH.input.z=dz/l;
      if(i%90===0){PH.input.shoot=true;PH.input.shootPress=true;}if(i%90===40){PH.input.shoot=false;PH.input.shootRel=true;}if(i%150===0)PH.input.pass=true;}
    step(1/60);
    const sc=G.teams.blue.score+G.teams.red.score;if(sc>last){goals+=sc-last;last=sc;}
    const sh=G.puck.shot;if(sh&&sh.combo&&!seen.has(sh)){seen.add(sh);combos++;}
    for(const q of G.pengs){if(!q.goalie&&!q.frozen)maxOut=Math.max(maxOut,Math.abs(q.x)-24,Math.abs(q.z)-13);   // (penalty box / penalty-shot spectators sit off the ice on purpose)
      if(q.fall>0&&!q.wasDown)falls++;q.wasDown=q.fall>0;}
    if(G.state==='over'&&G.resultShown)break;
  }
  const bad=G.pengs.some(p=>!isFinite(p.x)||!isFinite(p.z))||!isFinite(G.puck.x);
  ok(!bad&&maxOut<.05&&G.state==='over','soak '+(k||'normal')+': finished, no NaN, nobody outside the rink (goals '+goals+', combo shots '+combos+', knockdowns '+falls+')');
}
ok(errs.length===0,'no errors logged'+(errs.length?' :: '+errs.slice(0,3).join(' | '):''));
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
