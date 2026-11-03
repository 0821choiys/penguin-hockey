// v27: 💎 Pro Pass — Google Play purchase (mock bridge), grant once per token, restore, season expiry, rewards, fish bonus, price text, saves
const {execFileSync}=require('child_process');
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {save,G,PASS,PRO,BILL}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const reset=()=>{Object.assign(save.pass,{s:PH.seasonNow(),xp:0,gold:false,cf:0,cg:0,fw:0,last:null,pro:0,cx:0});save.pay.tok=[];save.pay.last=null;};
(async()=>{
  // ---- the product ----
  ok(PRO.price===8900&&PRO.cur==='KRW'&&PRO.sku==='pro_pass','the product: pro_pass, 8,900 KRW');
  ok(PRO.track.length===PASS.tiers&&PRO.track.filter(Boolean).length===7&&PRO.track[0].tp==='pro'&&PRO.track[9].h==='crown','Pro track: 7 rewards (tier 1 Pro trail, tier 10 crown hat, points)');
  // ---- a plain browser: no store → nothing can be bought, nothing is granted ----
  reset();await PH.billInit();ok(BILL.kind==='none','plain browser: no Google Play billing found');
  {const r=await PH.proBuy();ok(r===false&&!PH.passProOn(),'buying in a plain browser does nothing');
   const h=PH.proBtnHtml(),n=PH.proNoteHtml();ok(h.includes('aria-disabled')&&h.includes('8,900')&&n.includes('Play 스토어 앱에서만'),'the button is shown disabled with the price 8,900 and says it is sold in the Play Store app');}
  ok(PH.proPriceTxt().replace(/\s/g,'').includes('8,900'),'price text with no store price = PRO.price ('+PH.proPriceTxt()+')');
  // ---- the Android app bridge (mock of Play Billing) ----
  const bought=[],consumed=[];let owned=[];
  global.PHBilling={price:async()=>({value:'8900',currency:'KRW'}),buy:async sku=>{const t='tok'+(bought.length+1);bought.push(sku);owned.push({sku,token:t});return{token:t};},consume:async t=>{consumed.push(t);owned=owned.filter(o=>o.token!==t);},list:async()=>owned.slice()};
  reset();await PH.billInit();ok(BILL.kind==='native'&&BILL.price.replace(/\s/g,'').includes('8,900'),'app bridge found, price from the store: '+BILL.price);
  save.pass.xp=1250;const p0=save.points;
  {const r=await PH.proBuy();ok(r===true&&PH.passProOn()&&save.pass.pro===save.pass.s&&bought.length===1&&consumed.includes('tok1'),'buy → Pro for this season, purchase consumed (can be bought again next season)');
   ok(save.points===p0,'no in-game points are spent');ok(PH.passGoldOn(),'the gold track is open');
   const r2=await PH.proBuy();ok(r2===false&&bought.length===1,'a second purchase in the same season is blocked before reaching the store');}
  ok(PH.proGrant('tok1')===false,'the same purchase token is never granted twice');
  // rewards: gold cells up to the reached tier, Pro cells, retroactive
  {const n=PH.passCount();ok(PH.passCan('g',11)&&PH.passCan('x',0)&&PH.passCan('x',9)&&!PH.passCan('x',14)&&!PH.passCan('x',1),'tier 12 reached: gold 1–12 and Pro tiers 1 and 10 claimable, Pro tier 15 not yet, empty Pro cells never');
   const tr=save.trails.includes('pro');const r=PH.passClaim('x',0);ok(r&&save.trails.includes('pro')&&!tr,'Pro tier 1 = the Pro trail «'+PH.TRAILS.pro.name+'»');
   save.hats=save.hats.filter(h=>h!=='crown');const r2=PH.passClaim('x',9);ok(r2&&save.hats.includes('crown'),'Pro tier 10 = the crown hat');
   const all=PH.passClaimAll();ok(all===n-2&&PH.passCount()===0,'claim all takes the rest ('+all+')');}
  // fish bonus: shown numbers = added numbers
  {const x0=save.pass.xp;const m=PH.passMatch(true,false,1);ok(m.pro===Math.round((m.base+m.goals+m.first)*PRO.bonus)&&save.pass.xp-x0===m.total,'a win with Pro: +'+Math.round(PRO.bonus*100)+'% fish (bonus '+m.pro+', total '+m.total+' added)');
   const row=PH.passRowHtml({pass:m});ok(row.includes('+'+m.total)&&row.includes('프로 +'+m.pro),'result row shows the same total and the Pro bonus');
   ok(PH.passGain(PASS.earn.daily)===Math.round(PASS.earn.daily*(1+PRO.bonus)),'daily goal fish with Pro = '+PH.passGain(PASS.earn.daily));}
  // ---- restore: a purchase Play still holds (app closed before consume) is granted at start ----
  {reset();owned=[{sku:'pro_pass',token:'tokR'}];const n=await PH.proRestore();ok(n===1&&PH.passProOn()&&consumed.includes('tokR'),'unconsumed purchase restored and consumed at start');
   const n2=await PH.proRestore();ok(n2===0,'restore twice grants nothing more');}
  // ---- cancel / error ----
  {reset();const keep=global.PHBilling.buy;global.PHBilling.buy=async()=>{const e=new Error('cancelled');e.name='AbortError';throw e;};const r=await PH.proBuy();ok(r===false&&!PH.passProOn()&&!BILL.busy,'cancelled purchase: nothing granted, button usable again');global.PHBilling.buy=keep;}
  // ---- season end: Pro rewards reached are auto-claimed, the new season starts without Pro ----
  {reset();await PH.proBuy();save.pass.xp=1000;const s0=save.pass.s,real=Date.now,RD=global.Date,day=86400000;
   class FD extends RD{constructor(...a){if(a.length)super(...a);else super(real()+28*day);}static now(){return real()+28*day;}}global.Date=FD;
   PH.passCheck();ok(save.pass.s===s0+1&&!PH.passProOn()&&!PH.passGoldOn()&&save.pass.last&&save.pass.last.tier===10,'next season: Pro expired, gold locked again, tiers 1–10 of all tracks auto-claimed');
   ok(PH.passCan('f',0)===false&&save.pass.cx===0,'new pass starts at tier 0 with the Pro track reset');
   global.Date=RD;}
  // ---- a gold track bought with points before v27 stays open for that season ----
  {reset();save.pass.gold=true;save.pass.xp=300;ok(PH.passGoldOn()&&!PH.passProOn()&&PH.passCan('g',0)&&!PH.passCan('x',0),'old save with points-bought gold: gold stays open this season, Pro track still locked');}
  // ---- screen renders ----
  {reset();save.pass.xp=520;PH.renderPass();PH.passMenu();const h=PH.howV24();ok(h.includes(PH.proPriceTxt())&&h.includes(Math.round(PRO.bonus*100)+'%'),'pass screen + help render, help shows the price and the bonus');}
  // ---- save ----
  const load=sv=>JSON.parse(execFileSync('node',['-e',"const PH=require('./harness.js');console.log(JSON.stringify({p:PH.save.pass,y:PH.save.pay}));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(sv)})}).toString().trim().split('\n').pop());
  {const a=load({v:10,pass:{s:1,xp:10,pro:1,cx:5},pay:{tok:['a','b'],last:{s:1,t:5}}}),b=load({v:10}),c=load({v:10,pass:{pro:'x',cx:-4},pay:{tok:'bad'}});
   ok(a.p.pro===1&&a.p.cx===5&&a.y.tok.join()==='a,b','Pro season, Pro claims and purchase tokens survive a reload');
   ok(b.p.pro===0&&b.p.cx===0&&Array.isArray(b.y.tok)&&b.y.tok.length===0,'old saves load without Pro');
   ok(c.p.pro===0&&c.p.cx===0&&c.y.tok.length===0,'corrupt Pro data is sanitised');}
  console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
  console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
})();
