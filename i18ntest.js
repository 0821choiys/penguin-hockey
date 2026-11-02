// i18n unit checks for one language (PH_LANG=en|zh|ja node i18ntest.js):
// the odds/price texts print the numbers the code uses, rendered screens keep no Hangul, stored names normalise.
const LANG=process.env.PH_LANG||'en';
const PH=require('./harness.js');
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const HAN=/[가-힣]/;
const {save,GACHA}=PH;
ok(window.I18N&&I18N.lang===LANG,'language is '+LANG);
// ---- odds box: every number shown is the one the roll uses ----
{
  const eff=PH.gachaEff(),html=PH.oddsBox();
  const need=[eff.p[3].toFixed(2)+'%',(eff.p[2]+eff.p[3]).toFixed(2)+'%',eff.perEpic.toFixed(1),String(GACHA.softFrom+1),String(GACHA.softStep),String(GACHA.hard),GACHA.pickShare+'%',String(GACHA.dupCap)]
    .concat(GACHA.dupOverflow.map(p=>p+'P')).concat(eff.p.map(p=>p.toFixed(2)+'%'));
  const miss=need.filter(n=>!html.includes(n));
  ok(miss.length===0,'odds box shows the live numbers'+(miss.length?' (missing '+miss.join(', ')+')':''));
  ok(!HAN.test(html),'odds box has no Korean left'+(HAN.test(html)?' :: '+html.match(/[^<>]{0,30}[가-힣]+[^<>]{0,30}/)[0]:''));
  ok(html.includes('<details')&&html.includes('</details>')&&(html.match(/<br>/g)||[]).length>=8,'odds box markup intact');
}
// ---- pull / enhance / dex / goals / profile / market / squad / ranked renders ----
{
  const outs={};
  try{outs.pull=PH.scPullHtml();outs.enh=PH.scEnhHtml();outs.dex=PH.scDexHtml();}catch(e){ok(false,'scout render threw '+e.message);}
  for(const k in outs){const h=outs[k];ok(!HAN.test(h),'scout '+k+' has no Korean'+(HAN.test(h)?' :: '+h.match(/[^<>]{0,30}[가-힣]+[^<>]{0,30}/)[0]:''));}
  ok(outs.enh&&/\d+%/.test(outs.enh)&&outs.enh.includes(String(PH.enhRate?PH.enhRate(save.type,0):'')),'enhance panel shows the success rate');
  try{const a=PH.achHtml();ok(!HAN.test(a),'achievements have no Korean'+(HAN.test(a)?' :: '+a.match(/[^<>]{0,30}[가-힣]+[^<>]{0,30}/)[0]:''));}catch(e){ok(false,'achHtml threw '+e.message);}
  try{const t=PH.TYPES;const bad=Object.keys(t).filter(k=>HAN.test(t[k].name));ok(bad.length===0,'species names translated');}catch(e){ok(false,'TYPES '+e.message);}
  try{const bad=Object.keys(PH.TT).filter(k=>HAN.test(PH.TT[k].name+PH.TT[k].plus+PH.TT[k].minus));ok(bad.length===0,'traits translated');}catch(e){ok(false,'TT '+e.message);}
  try{const bad=Object.keys(PH.ITEMS).filter(k=>HAN.test(PH.ITEMS[k].name+PH.ITEMS[k].desc));ok(bad.length===0,'items translated');}catch(e){ok(false,'ITEMS '+e.message);}
  try{const bad=Object.keys(PH.EVENTS).filter(k=>HAN.test(PH.EVENTS[k].name+PH.EVENTS[k].desc));ok(bad.length===0,'events translated');}catch(e){ok(false,'EVENTS '+e.message);}
  try{const bad=PH.ACH.filter(a=>HAN.test(a.name+a.desc));ok(bad.length===0,'achievement names translated');}catch(e){ok(false,'ACH '+e.message);}
}
// ---- translator ----
ok(__L('아델리 펭귄')!=='아델리 펭귄'&&!HAN.test(__L('아델리 펭귄')),'__L translates a known key');
ok(__L('없는 키 테스트')==='없는 키 테스트','__L returns an unknown key unchanged');
ok(__L('점','m')!==__L('점'),'context override (win margin) differs from the plain word');
// ---- stored names: Korean / other languages -> current language; user text untouched ----
{
  const city=__L('부산');
  ok(I18N.full('부산')===city&&I18N.full('Busan')===city&&I18N.full('釜山')===city,'city names from any language map to '+city);
  ok(I18N.full('펭귄 감독')===__L('펭귄 감독')&&I18N.full('Penguin Boss')===__L('펭귄 감독'),'default coach name follows the language');
  ok(I18N.full('남극 FC')==='남극 FC'&&I18N.full('My Team')==='My Team','custom club/coach names stay as typed');
  const n1=I18N.norm('부산 대표 · 부산 타이거즈'),n2=I18N.norm('랭크 경기 vs 냉철한 곰 77');
  ok(!HAN.test(n1)&&n1.includes(city)&&n1.includes(__L('타이거즈')),'trial opponent name normalised: '+n1);
  ok(!HAN.test(n2)&&n2.endsWith('77')&&n2.includes(__L('곰')),'ranked label normalised: '+n2);
  ok(I18N.norm(n1)===n1,'normalising twice changes nothing');
}
// ---- trial opponents generated in this language keep the uniqueness check working ----
{
  save.profile.city=__L('부산');
  const names=PH.trialOppNames?PH.trialOppNames('nat'):null;
  if(names){const cities=names.map(n=>n.split(' ')[0]);ok(new Set(cities).size===cities.length&&names.length===4,'national trial opponents are 4 different cities: '+names.join(' | '));ok(!HAN.test(names.join('')),'trial opponent names have no Korean');}
}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
