// v17 texts in one language (PH_LANG=ko|en|zh|ja node v17i18n.js): every new builder renders without Hangul (other languages)
// and without unfilled {slots}, and the numbers shown are the ones the code uses.
const LANG=process.env.PH_LANG||'en';
const PH=require('./harness.js');const {G,save,startMatch}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const HAN=/[가-힣]/,SLOT=/\{[a-z]+\}/;
const check=(name,h)=>{
  const han=LANG!=='ko'&&HAN.test(h),slot=SLOT.test(h);
  ok(!han&&!slot&&h.length>0,name+(han?' :: Hangul '+h.match(/[^<>]{0,25}[가-힣]+[^<>]{0,25}/)[0]:'')+(slot?' :: unfilled '+h.match(SLOT)[0]:''));
};
ok(I18N.lang===LANG,'language is '+LANG);
const S=save.season;
// season: empty, in progress, eligible with history, last day, popup data
Object.assign(S,{n:PH.seasonNow(),g:0,w:0,d:0,l:0,best:0,hist:[]});
check('season box (no games)',PH.seasonBoxHtml());check('season header line (no games)',PH.seasonMiniHtml());
Object.assign(S,{g:2,w:1,l:1,best:1460});check('season box (2 games)',PH.seasonBoxHtml());check('result note (games left)',PH.seasonNote());
Object.assign(S,{g:3,w:2,l:1,best:1460,hist:[{n:1,t:3,ok:true,best:1460,g:12,w:7,pts:320},{n:0,t:2,ok:false,best:1150,g:2,w:1,pts:0}]});
check('season box (eligible, history)',PH.seasonBoxHtml());check('season header line (eligible)',PH.seasonMiniHtml());check('result note (reached)',PH.seasonNote());
S.g=5;check('result note (best tier)',PH.seasonNote());
check('season rules',PH.seasonRulesTxt());
for(let i=0;i<PH.TIERS.length;i++)check('reward text tier '+i,PH.seasonRewTxt(i));
{const h=PH.seasonRulesTxt(),ks=Object.keys(PH.TYPES).filter(k=>!PH.TYPES[k].exclusive);
 ok([PH.SEASON.days,PH.SEASON.days/7,PH.SEASON.min,ks.length,+(100/ks.length).toFixed(1),PH.SEASON.pivot,25,1600,1500].every(n=>h.includes(String(n))),'season rules show the code numbers');}
// conditions
for(const k of Object.keys(PH.COND)){const E=PH.COND[k];check('condition '+k+' name+desc',E.name+' '+E.desc);check('tournament line '+k,PH.condIntroHtml(k));}
startMatch({mode:'quick',size:3,time:60,diff:'normal',cond:'night'});
check('bonus row',PH.condBonusRow({cond:5,condK:'night'}));
check('how-to block',PH.howV17());
{const h=PH.howV17();ok(h.includes(String(100-PH.COND_W.none))&&Object.keys(PH.COND).every(k=>h.includes(PH.COND_W[k]+'%'))&&h.includes('+10%')&&['20','25','30'].every(n=>h.includes('+'+n+'%')),'how-to shows the code numbers');}
check('settings row label',PH.SETDEF.find(d=>d.k==='cond').label);
// combo popups
{const tm=G.mine,[a,b,c]=tm.skaters,pass=(f,t)=>PH.passDone({from:f,to:t,t:G.t,d:6});PH.pcReset();pass(a,b);check('pass popup x1',PH.pcPopText({from:a,to:b}));pass(b,c);check('pass popup x2',PH.pcPopText({from:b,to:c}));pass(c,a);check('combo popup x3',PH.pcPopText({from:c,to:a}));}
check('achievement',PH.ACH.find(x=>x.id==='a_combo').name+' '+PH.ACH.find(x=>x.id==='a_combo').desc);
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
