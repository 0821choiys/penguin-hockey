const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');
const {G,step,save,startMatch,trialStart,trialPlay,trialLock,trialLeft,TRIALS,titleText,tierOf,TIERS,TYPES,mkGen,rankedStart,pullOnce,devCheck,cardHtml,useSpecial,launch,clubValue,MK_SLOT,mgrApply}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60)};
function finish(win){let w=0;while(G.state!=='play'&&w<600){step(1/60);w++;}G.mine.score=win?2:0;G.mine.opp.score=win?1:2;G.timeLeft=.05;w=0;while(!(G.state==='over'&&G.resultShown)&&w<60*20){step(1/60);w++;}return G.result;}
function setR(r){save.mgr={r,games:30,w:0,d:0,l:0,best:r,form:[],hist:[],pending:null};}

/* tiers */
ok(TIERS[TIERS.length-1].n==='개발자'&&TIERS[TIERS.length-1].min===2100,'개발자 is the final tier (2100+)');
ok(tierOf(2099).name.startsWith('레전드')&&tierOf(2100).name==='개발자','2099 = 레전드, 2100 = 개발자');
/* exclusive character never obtainable elsewhere */
let pulled=false;for(let i=0;i<50000;i++){const r=pullOnce(0);if(r.type==='auk')pulled=true;}ok(!pulled,'큰바다쇠오리 never comes from scout pulls (50,000 pulls)');
const realNow=Date.now;let onMarket=false;for(let k=0;k<300;k++){Date.now=()=>realNow()+k*MK_SLOT;if(mkGen().list.some(L=>L.type==='auk'))onMarket=true;}Date.now=realNow;ok(!onMarket,'never listed on the transfer market (300 rotations)');
let asOpp=false;setR(1200);for(let i=0;i<40;i++){rankedStart();if(G.cfg.oppTypes.includes('auk'))asOpp=true;}ok(!asOpp,'never used by ranked opponents');
save.points=99999;ok(!save.types.includes('auk'),'not owned at start');
/* reaching 개발자 grants title + auk once */
save.types=['basic'];save.type='basic';save.dev={got:false,ts:0};setR(2095);
rankedStart();let res=finish(true);
ok(save.mgr.r>=2100&&res.mg&&res.mg.dev===true,'ranked win crossing 2100 reports the 개발자 reward ('+save.mgr.r+')');
ok(save.dev.got&&save.types.includes('auk')&&save.lv.auk===10,'큰바다쇠오리 unlocked at Lv.10');
ok(titleText().includes('💻 개발자'),'title "💻 개발자" shown first ('+titleText(true)+')');
const before=save.types.length;mgrApply(1,2200,'x');ok(!devCheck()&&save.types.length===before,'reward is granted only once');
setR(1500);ok(save.types.includes('auk')&&titleText().includes('개발자'),'dropping below 개발자 keeps the character and title');
/* card + character in game */
ok(cardHtml('auk',{}).includes('pc g9')&&cardHtml('auk',{g:1}).includes('pc g9'),'auk card always uses its own exclusive frame');
save.type='auk';startMatch({mode:'quick',size:3,time:60,diff:'easy'});run(4);
const P=G.player;ok(P.type==='auk'&&P.ty.special==='surge','auk is playable with its own special (큰바다 돌진)');
const o=G.mine.opp.skaters[0];o.x=P.x+2;o.z=P.z;P.cd.special=0;const ok1=useSpecial(P);
ok(ok1&&P.dashSpec&&P.dashT>1&&o.slow>1&&P.cd.special>0,'큰바다 돌진: long dash + slows nearby opponents + cooldown');
ok(isFinite(clubValue().total),'club value stays a valid number with the auk owned ('+clubValue().total+')');
/* world championship */
save.trial={day:0,ts:0,used:{city:0,nat:0,world:0},run:null,titles:{city:1,nat:0,world:0},first:{city:true,nat:false,world:false},cityName:'부천'};
setR(1600);ok(trialLock('world').includes('국가대표'),'world locked without a national title');
save.trial.titles.nat=1;setR(1450);ok(trialLock('world').includes('다이아'),'world needs 다이아');
setR(1600);ok(trialLock('world')===''&&trialLeft('world')===1,'unlocked: 1 entry per day');
ok(trialStart('world')&&save.trial.run.opp.length===5&&save.trial.run.opp[4].includes('남극 펭귄 연합'),'5-round bracket: 32강 → 결승 vs 남극 펭귄 연합');
for(let k=0;k<5;k++){if(k)trialPlay();run(.1);res=finish(true);}
ok(res.tr&&res.tr.st==='champ'&&save.trial.titles.world===1&&res.extra===3000&&res.tr.card&&res.tr.card.k!=='auk','5 wins → 세계 챔피언 + 3000P + 전설 card (not the exclusive)');
ok(titleText(true).includes('🌍 세계 챔피언'),'world title listed ('+titleText(true)+')');
ok(!trialStart('world'),'only 1 world entry per day');
console.log('\nlogged runtime errors: '+errs.length);errs.slice(0,3).forEach(e=>console.log('  '+e));if(errs.length)fails++;
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
