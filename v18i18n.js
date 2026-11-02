// v18 texts in one language (PH_LANG=ko|en|zh|ja node v18i18n.js): every new builder renders without Hangul (other languages)
// and without unfilled {slots}; numbers shown = the code numbers.
const LANG=process.env.PH_LANG||'en';
const PH=require('./harness.js');const {save}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const HAN=/[가-힣]/,SLOT=/\{[a-z]+\}/;
const check=(name,h)=>{const han=LANG!=='ko'&&HAN.test(h),slot=SLOT.test(h);
  ok(!han&&!slot&&h.length>0,name+(han?' :: Hangul '+h.match(/[^<>]{0,25}[가-힣]+[^<>]{0,25}/)[0]:'')+(slot?' :: unfilled '+h.match(SLOT)[0]:''));};
ok(I18N.lang===LANG,'language is '+LANG);
const T=PH.TYPES,ks=Object.keys(T);
for(const k of ks){check('name '+k,T[k].name);check('card '+k,PH.cardHtml(k,{lv:0,g:0}));check('skill line '+k,PH.spLine18(k));check('fact '+k,PH.fact18(k));
  const t=PH.TT[k];check('personality '+k,t.name+' '+t.plus+' '+t.minus);check('silhouette '+k,PH.sil18(k));}
for(const sp of Object.keys(PH.SPECIALS))check('skill '+sp,PH.SPECIALS[sp]+' '+PH.spDesc(sp));
for(const s of PH.SYN)check('chemistry '+s.id,s.name+' '+s.desc);
for(const id of['a_allpeng','a_allpeng2']){const a=PH.ACH.find(x=>x.id===id);check('achievement '+id,a.name+' '+a.desc);}
check('long goal L1',PH.LDEFS.find(x=>x.id==='L1').name);
check('news',PH.news18Html());check('odds',PH.oddsBox());check('dex',PH.scDexHtml());
{const h=PH.news18Html();ok((h.match(/class="nw-c"/g)||[]).length===10,'news shows the 10 new species');}
{const X=PH.SPX,d=PH.spDesc;ok([d('trumpet').includes(String(X.trumpet.cut))&&d('trumpet').includes(String(X.trumpet.r))&&d('trumpet').includes(String(X.trumpet.t)),d('bray').includes(String(X.bray.r))&&d('bray').includes(String(X.bray.t)),d('royalpass').includes(String(X.royalpass.win)),d('keeneye').includes(String(X.keeneye.t)),d('sunflare').includes(String(X.sunflare.t)),d('double').includes(String(X.double.t))].every(Boolean),'skill descriptions show the code numbers');}
{const h=PH.seasonRulesTxt();ok(h.includes('15')&&h.includes('6.7'),'season rules: 15 species, 6.7% each');}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
