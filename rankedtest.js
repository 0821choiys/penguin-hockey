const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');
const {G,step,save,startMatch,rankedStart,rankedDiff,trialStart,trialPlay,trialLock,trialLeft,trialDayRefresh,TRIALS,titleText,tierOf,mgrRivals,launch,TYPES}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60)};
function finish(win){ // play out to the result screen with a fixed score
  let w=0;while(G.state!=='play'&&w<600){step(1/60);w++;}
  G.mine.score=win?2:0;G.mine.opp.score=win?1:2;G.timeLeft=.05;w=0;
  while(!(G.state==='over'&&G.resultShown)&&w<60*20){step(1/60);w++;}
  return G.result;
}
function resetMgr(r){save.mgr={r,games:20,w:0,d:0,l:0,best:r,form:[],hist:[],pending:null};}
function resetTrial(){save.trial={day:0,ts:0,used:{city:0,nat:0},run:null,titles:{city:0,nat:0},first:{city:false,nat:false},cityName:''};}

/* normal games never touch the rating */
resetMgr(1000);
for(const cfg of [{mode:'quick',size:3,time:60,diff:'hard'},{mode:'tour',size:3,time:60,diff:'easy',oppTypes:['basic']}]){
  if(cfg.mode==='tour')G.tour={round:0,champPaid:false};
  startMatch(cfg);const r=finish(true);ok(r&&r.paid&&!r.mg&&save.mgr.r===1000&&save.mgr.games===20,cfg.mode+' (일반 게임): rating unchanged');
}
/* ranked matchmaking */
resetMgr(1230);rankedStart();run(.1);
ok(G.cfg.mode==='ranked'&&G.cfg.size===3&&G.cfg.time===120,'ranked match uses fixed rules (3:3, 2분)');
const near=mgrRivals().map(x=>Math.abs(x.r-1230)).sort((a,b)=>a-b)[5];
ok(Math.abs(G.cfg.oppR-1230)<=near,'matched opponent is among the 6 closest ratings (opp '+G.cfg.oppR+')');
ok(rankedDiff(980)==='easy'&&rankedDiff(1200)==='normal'&&rankedDiff(1500)==='hard','AI difficulty follows opponent rating');
const r0=save.mgr.r;let res=finish(true);ok(res.mg&&save.mgr.r>r0&&save.mgr.games===21,'ranked win raises rating ('+r0+' → '+save.mgr.r+')');
const r1=save.mgr.r;rankedStart();run(.1);res=finish(false);ok(res.mg&&save.mgr.r<r1,'ranked loss lowers rating ('+r1+' → '+save.mgr.r+')');

/* city trial: lock, entries, bracket */
resetTrial();resetMgr(1050);ok(trialLock('city')!==''&&!trialStart('city'),'city trial locked below 골드 ('+trialLock('city')+')');
resetMgr(1150);ok(trialLock('city')===''&&trialLeft('city')===3,'unlocked at 골드 with 3 entries today');
ok(trialLock('nat')!=='','national trial locked without a city title');
save.profile.city='부산';
ok(trialStart('city')&&save.trial.run&&save.trial.run.round===0&&trialLeft('city')===2,'starting uses 1 entry and opens the bracket at 8강');
run(.1);ok(G.cfg.mode==='trial'&&G.cfg.oppR===TRIALS.city.r[0]&&G.cfg.label.includes('8강'),'8강 match configured (opp rating '+G.cfg.oppR+')');
res=finish(true);ok(res.tr&&res.tr.st==='next'&&save.trial.run.round===1,'8강 win → 4강');
trialPlay();run(.1);ok(G.cfg.label.includes('4강'),'continue plays 4강');
res=finish(true);ok(res.tr.st==='next'&&save.trial.run.round===2,'4강 win → 결승');
const pts0=save.points,cards0=JSON.stringify(save.cards);trialPlay();run(.1);res=finish(true);
ok(res.tr&&res.tr.st==='champ'&&save.trial.titles.city===1&&!save.trial.run,'결승 win → 부산시 대표 title');
ok(res.extra===300&&save.points-pts0===res.total,'first selection pays 300P on the result screen (total '+res.total+')');
ok(res.tr.card&&res.tr.card.g===2,'first selection grants an 영웅 card');
ok(titleText(true).includes('부산시 대표'),'title shown as "'+titleText(true)+'"');
// repeat: smaller reward, no card
trialStart('city');for(let k=0;k<3;k++){if(k)trialPlay();run(.1);res=finish(true);}
ok(res.tr.st==='champ'&&res.extra===80&&!res.tr.card&&save.trial.titles.city===2,'second selection pays 80P, no card');
// loss eliminates
trialStart('city');run(.1);res=finish(false);ok(res.tr&&res.tr.st==='out'&&!save.trial.run&&trialLeft('city')===0,'a loss eliminates the run; entries 0/3');
ok(!trialStart('city'),'no entries left today');
// next day refresh (simulate time passing)
save.trial.day-=1;save.trial.ts-=13*3600*1000;trialDayRefresh();ok(trialLeft('city')===3,'entries refill on a new day (after 12h real time)');
save.trial.day-=1;save.trial.ts=Date.now()-3600*1000;save.trial.used.city=3;trialDayRefresh();ok(trialLeft('city')===0,'no refill if less than 12h passed');
/* national trial */
resetMgr(1200);ok(trialLock('nat').includes('플래티넘'),'national needs 플래티넘 even with a city title');
resetMgr(1320);save.trial.run=null;ok(trialLock('nat')===''&&trialStart('nat')&&save.trial.run.opp.length===4&&!save.trial.run.opp.some(o=>o.startsWith('부산 ')),'national trial: 16강~결승 vs other cities\' reps');
for(let k=0;k<4;k++){if(k)trialPlay();run(.1);res=finish(true);}
ok(res.tr.st==='champ'&&save.trial.titles.nat===1&&res.extra===1000&&res.tr.card.g===3,'4 wins → 국가대표 + 1000P + 전설 card');
ok(titleText().startsWith('🇰🇷 국가대표'),'national title takes priority in the short badge');
/* forfeit inside a trial */
resetMgr(1320);save.trial.used.nat=0;trialStart('nat');run(.1);let w=0;while(G.elapsed<21&&w<60*80){step(1/60);w++;}
ok(!!save.mgr.pending&&save.mgr.pending.trial,'trial match armed after 20s');
const g0=save.mgr.games;launch('quick');run(.1);ok(save.mgr.games===g0+1&&save.mgr.l>=1&&!save.trial.run,'leaving a trial mid-match = forfeit loss and the run is eliminated');
/* draw in a trial = out */
resetMgr(1320);save.trial.used.nat=0;save.trial.run=null;trialStart('nat');run(.1);let ww=0;while(G.state!=='play'&&ww<600){step(1/60);ww++;}
G.mine.score=1;G.mine.opp.score=1;G.ot=true;G.otLeft=.05;G.tstat[G.mine.key].on=1;G.tstat[G.mine.opp.key].on=1;ww=0;while(!(G.state==='over'&&G.resultShown)&&ww<60*60){if(G.so&&G.so.phase==='play')require('./harness.js').soResult(G.so.shooterTeam!==G.mine);step(1/60);ww++;}
ok(G.result&&!G.result.win&&/승부차기/.test(G.result.note||'')&&G.result.tr&&G.result.tr.st==='out','a tied knockout trial goes to a shootout; losing it eliminates you');

console.log('\nlogged runtime errors: '+errs.length);errs.slice(0,3).forEach(e=>console.log('  '+e));if(errs.length)fails++;
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
