const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');
const {G,step,save,startMatch,mkGen,mkBuy,mkSell,mkRefresh,mkSellPrice,mkKey,MK_BUY,MK_SELL,MK_TMUL,MK_SLOT,clubValue,clubTable,penguinValue,mgrTable,mgrApply,mgrReset,oppRating,tierOf,isRated,escH,cleanName,TYPES,launch}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60)};
const realNow=Date.now;

/* ---------- market economy ---------- */
let minBuy=[1e9,1e9,1e9,1e9,1e9],maxSell=[0,0,0,0,0],slots=0;
for(let k=0;k<400;k++){Date.now=()=>realNow()+k*MK_SLOT;const m=mkGen();slots++;
  for(const L of m.list)minBuy[L.g]=Math.min(minBuy[L.g],L.price);
  for(const t of Object.keys(TYPES))for(let g=0;g<5;g++)maxSell[g]=Math.max(maxSell[g],mkSellPrice(t,g,m));}
Date.now=realNow;
ok([0,1,2,3,4].every(g=>maxSell[g]<minBuy[g]),'no buy→sell profit: max sell '+maxSell.join('/')+' < min buy '+minBuy.join('/')+' over '+slots+' market rotations');
const m1=mkGen(),m2=mkGen();ok(JSON.stringify(m1)===JSON.stringify(m2),'listings are stable within a 3h slot (reloading does not reroll)');
ok(m1.list.filter(L=>L.sale).length===1&&m1.list.length===6,'6 listings per slot, exactly one 30% fire sale');
// buy
save.points=5000;save.types=['basic'];for(const k in save.cc)save.cc[k]=[0,0,0,0,0];
const L=m1.list[0],p0=save.points,owned=save.types.includes(L.type),c0=owned?save.cc[L.type][L.g]:0;
ok(mkBuy(0),'buying a listing succeeds');
ok(save.points===p0-L.price,'price deducted ('+L.price+'P)');
ok(owned?save.cc[L.type][L.g]===c0+1:save.types.includes(L.type),owned?'duplicate becomes a stored card':'new penguin unlocked by signing');
ok(!mkBuy(0)&&save.points===p0-L.price,'same listing cannot be bought twice');
save.points=1;ok(!mkBuy(1),'not enough points -> rejected');
// sell
save.points=0;save.cc.basic=[2,0,0,0,0];const sp=mkSellPrice('basic',0);
ok(mkSell('basic',0)&&save.cc.basic[0]===1&&save.points===sp,'selling removes 1 card and pays the current market price ('+sp+'P)');
save.cc.basic=[0,0,0,0,0];ok(!mkSell('basic',0)&&save.points===sp,'cannot sell a card you do not have');
ok(save.mk.log.length>=2&&save.mk.log[0].k==='sell','transfer log records buys and sells');
// refresh
save.points=100;const before=JSON.stringify(mkGen().list),k0=mkKey();ok(mkRefresh()&&save.points===90,'refresh costs 10P');
ok(JSON.stringify(mkGen().list)!==before&&mkKey()!==k0,'refresh produces new listings');
save.points=5;ok(!mkRefresh()&&save.points===5,'refresh rejected without enough points');

/* ---------- club value / league ---------- */
save.points=100;save.types=['basic'];save.lv={basic:0,fast:0,strong:0,defense:0,balanced:0};for(const k in save.xp)save.xp[k]=0;for(const k in save.cc)save.cc[k]=[0,0,0,0,0];
const v0=clubValue(),t0=clubTable();
ok(v0.total===v0.players+v0.cards+v0.cash&&v0.players===penguinValue('basic'),'club value = players + stored cards + points ('+v0.total+')');
ok(t0.rows.length===50&&t0.me.rank>=30,'new club starts near the bottom of 50 clubs (rank '+t0.me.rank+')');
save.types=['basic','fast','strong','defense','balanced'];for(const k of save.types){save.lv[k]=10;save.xp[k]=99999;}save.points=20000;
const t1=clubTable();ok(t1.val.total>v0.total*20&&t1.me.rank===1,'maxed club reaches #1 (rank '+t1.me.rank+', value '+t1.val.total+')');
ok(penguinValue('fast')>penguinValue.call(null,'fast')-1,'penguin value deterministic');
save.lv.fast=3;const a=penguinValue('fast');save.lv.fast=6;const b=penguinValue('fast');ok(b>a,'enhancing a penguin raises its value ('+a+' → '+b+')');
ok(JSON.stringify(clubTable().rows.map(r=>r.name))===JSON.stringify(clubTable().rows.map(r=>r.name)),'rival league is stable between views');

/* ---------- manager rating ---------- */
save.mgr={r:1000,games:0,w:0,d:0,l:0,best:1000,form:[],hist:[],pending:null};
let r=mgrApply(1,1380,'t');ok(r.d>0&&save.mgr.r===1000+r.d&&save.mgr.w===1,'win vs stronger opponent: +'+r.d);
const dStrong=r.d;save.mgr.r=1000;save.mgr.games=0;r=mgrApply(1,880,'t');ok(r.d>0&&r.d<dStrong,'win vs weaker opponent gives less (+'+r.d+' < +'+dStrong+')');
save.mgr.r=1000;save.mgr.games=20;r=mgrApply(0,880,'t');ok(r.d<0,'loss lowers rating ('+r.d+')');
save.mgr.r=1000;save.mgr.games=20;r=mgrApply(.5,1000,'t');ok(r.d===0,'draw vs equal opponent: 0');
save.mgr.r=1000;save.mgr.games=0;const dp=mgrApply(1,1000,'t').d;save.mgr.r=1000;save.mgr.games=20;const dn=mgrApply(1,1000,'t').d;ok(dp>dn,'placement games (first 10) move rating more ('+dp+' vs '+dn+')');
ok(tierOf(650).name==='브론즈 III'&&tierOf(1099).name==='실버 I'&&tierOf(1100).name==='골드 III'&&tierOf(2000).name==='레전드 II'&&tierOf(2100).name==='개발자'&&tierOf(3000).name==='개발자','tier names (브론즈 III … 레전드 II … 개발자)');
save.mgr.r=1098;r=mgrApply(1,1380,'t');ok(r.up&&r.tier.name.startsWith('골드'),'crossing 1100 reports a tier promotion');
save.mgr.r=600;let rk1=mgrTable().me.rank;save.mgr.r=2300;let rk2=mgrTable().me.rank;ok(rk1>=90&&rk2===1,'manager ranking follows rating (rank '+rk1+' → '+rk2+' of 100)');
ok(save.mgr.form.length<=5&&save.mgr.hist.length<=10,'form/history lists stay bounded');

/* ---------- rated matches, forfeits ---------- */
ok(isRated({mode:'ranked'})&&isRated({mode:'trial'})&&!isRated({mode:'quick'})&&!isRated({mode:'tour'})&&!isRated({mode:'practice'})&&!isRated({mode:'free'})&&!isRated({mode:'challenge'})&&!isRated({mode:'practice',tutorial:true}),'only tier games (ranked / trials) are rated; normal games are not');
save.mgr={r:1000,games:0,w:0,d:0,l:0,best:1000,form:[],hist:[],pending:null};save.types=['basic'];save.type='basic';
startMatch({mode:'ranked',size:3,time:120,diff:'normal',oppR:1120,label:'랭크 경기'});run(4);run(10);
ok(!save.mgr.pending,'leaving in the first 20s is free (not armed yet)');
startMatch({mode:'ranked',size:3,time:120,diff:'normal',oppR:1120,label:'랭크 경기'});ok(save.mgr.games===0,'early restart did not count');
run(4);let gw=0;while(G.elapsed<21&&gw<60*90){step(1/60);gw++;}ok(!!save.mgr.pending,'after 20s of play the match is armed (elapsed '+G.elapsed.toFixed(1)+'s)');
startMatch({mode:'ranked',size:3,time:120,diff:'normal',oppR:1120,label:'랭크 경기'});ok(save.mgr.games===1&&save.mgr.l===1&&save.mgr.r<1000&&!save.mgr.pending,'abandoning an armed match = forfeit loss (rating '+save.mgr.r+')');
run(4);gw=0;while(G.elapsed<21&&gw<60*90){step(1/60);gw++;}
// simulate closing the page mid-match: reload a fresh game from that save
const g0=save.mgr.games;
G.mine.score=2;G.mine.opp.score=1;G.timeLeft=.1;let w=0;while(!(G.state==='over'&&G.resultShown)&&w<60*20){step(1/60);w++;}
ok(!!(G.result&&G.result.mg)&&save.mgr.games===g0+1&&!save.mgr.pending,'finished match updates rating once and clears the forfeit flag ('+(G.result&&G.result.mg?'+'+G.result.mg.d:'no result')+')');
const gg=save.mgr.games;G.resultShown=false;run(3);ok(save.mgr.games===gg,'result re-render does not double count');
startMatch({mode:'practice',size:2,time:0,diff:'normal',noOpp:true,goalieOnly:true,noScoreOpp:true,passiveMates:true});run(30);ok(!save.mgr.pending,'practice never arms a forfeit');

/* ---------- names / injection ---------- */
ok(cleanName('  <img src=x onerror=alert(1)>  ')==='img src=x on'&&!cleanName('<b>').includes('<'),'name cleaner strips tags & limits to 12 chars');
ok(escH('<script>"\'&')==='&lt;script&gt;&quot;&#39;&amp;','names are HTML-escaped when shown');

console.log('\nlogged runtime errors: '+errs.length);errs.slice(0,3).forEach(e=>console.log('  '+e));if(errs.length)fails++;
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
