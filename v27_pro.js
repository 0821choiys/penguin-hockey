/* ================= v27: 💎 Pro Pass — Google Play billing ================= */
// One purchase per pass season (a consumable Play product `pro_pass`, no auto-renewal). Two ways to reach Google Play:
//  · Trusted Web Activity: the Digital Goods API + Payment Request (`https://play.google.com/billing`)
//  · the Android wrapper app: a JS bridge `window.PHBilling` {price(sku)→Promise<{value,currency}|string>, buy(sku)→Promise<{token}>,
//    consume(token)→Promise, list()→Promise<[{sku,token}]>} implemented with Play Billing Library on the native side.
// Anywhere else (a plain browser) the button explains that it can only be bought in the Play Store app — nothing is ever granted without Play.
// A purchase token is granted once (save.pay.tok), then consumed so the pass can be bought again next season; unconsumed purchases are restored at start.
function proFmt(v,cur){try{return new Intl.NumberFormat(I18N.loc||'ko-KR',{style:'currency',currency:cur||PRO.cur,maximumFractionDigits:cur==='KRW'||!cur?0:2}).format(+v);}catch(e){return (+v).toLocaleString()+' '+(cur||PRO.cur);}}
function proPriceTxt(){return (BILL&&BILL.price)||proFmt(PRO.price,PRO.cur);}
async function billInit(){
  BILL.err='';
  try{
    if(window.PHBilling&&typeof window.PHBilling.buy==='function'){BILL.kind='native';
      try{const p=await window.PHBilling.price(PRO.sku);if(p)BILL.price=typeof p==='string'?p:proFmt(p.value,p.currency);}catch(e){}}
    else if('getDigitalGoodsService' in window&&window.PaymentRequest){
      BILL.svc=await window.getDigitalGoodsService('https://play.google.com/billing');BILL.kind=BILL.svc?'play':'none';
      if(BILL.svc){try{const d=await BILL.svc.getDetails([PRO.sku]);if(d&&d[0]&&d[0].price)BILL.price=proFmt(d[0].price.value,d[0].price.currency);}catch(e){}}}
    else BILL.kind='none';
    await proRestore();
  }catch(e){BILL.kind=BILL.kind||'none';BILL.err=String(e&&e.message||e);}
  try{if(G.ui==='sPass')renderPass();passMenu();}catch(e){}
}
async function proList(){
  if(BILL.kind==='native')return ((await window.PHBilling.list())||[]).map(x=>({sku:x.sku,token:x.token}));
  if(BILL.kind==='play')return ((await BILL.svc.listPurchases())||[]).map(x=>({sku:x.itemId,token:x.purchaseToken}));
  return [];
}
async function proConsume(tok){try{if(BILL.kind==='native')await window.PHBilling.consume(tok);else if(BILL.kind==='play')await BILL.svc.consume(tok);}catch(e){}}
// grant the current season's Pro Pass for one purchase token (idempotent)
function proGrant(tok){
  if(!tok||typeof tok!=='string')return false;const PY=save.pay;if(PY.tok.includes(tok))return false;
  passCheck();const P=save.pass;PY.tok.push(tok);if(PY.tok.length>30)PY.tok.splice(0,PY.tok.length-30);
  const was=passProOn();P.pro=P.s;PY.last={s:P.s,t:Date.now()};persist();
  if(!was){SFX.champ();vib([40,40,90]);hypeToast('💎 '+fmtL('{p} 프로 패스를 열었어요!',{p:passTitle(P.s)}));}
  try{if(G.ui==='sPass')renderPass();passMenu();}catch(e){}
  return true;
}
async function proRestore(){
  if(BILL.kind!=='native'&&BILL.kind!=='play')return 0;let n=0;
  for(const p of await proList())if(p.sku===PRO.sku&&p.token){if(proGrant(p.token))n++;await proConsume(p.token);}
  return n;
}
async function proBuy(){
  passCheck();
  if(passProOn()){flashMsg('💎 '+'이번 시즌 프로 패스를 이미 갖고 있어요');return false;}
  if(BILL.busy)return false;
  if(BILL.kind!=='native'&&BILL.kind!=='play'){flashMsg('💎 '+'프로 패스는 Play 스토어 앱에서 살 수 있어요');return false;}
  BILL.busy=true;try{if(G.ui==='sPass')renderPass();}catch(e){}
  let ok=false;
  try{
    if(BILL.kind==='native'){const r=await window.PHBilling.buy(PRO.sku);if(r&&r.token){ok=proGrant(r.token)||passProOn();await proConsume(r.token);}}
    else{
      const req=new PaymentRequest([{supportedMethods:'https://play.google.com/billing',data:{sku:PRO.sku}}],{total:{label:'Total',amount:{currency:PRO.cur,value:'0'}}});
      const res=await req.show();const tok=res&&res.details&&res.details.purchaseToken;
      if(tok){ok=proGrant(tok)||passProOn();await proConsume(tok);}
      try{await res.complete(ok?'success':'fail');}catch(e){}
    }
  }catch(e){const m=String(e&&e.name||e);if(!/Abort|cancel/i.test(m))flashMsg('💎 '+'결제를 끝내지 못했어요. 잠시 후 다시 해 주세요');}
  BILL.busy=false;try{if(G.ui==='sPass')renderPass();passMenu();}catch(e){}
  return ok;
}
function proBtnHtml(){
  if(passProOn())return '<span class="ps-gold on pro">💎 '+'프로 패스 사용 중'+'</span>';
  const can=BILL.kind==='native'||BILL.kind==='play';
  return (save.pass.gold?'<span class="ps-gold on">👑 '+'골드 칸 열림'+'</span>':'')
    +'<button class="btn primary ps-gold ps-pro" id="psBuy"'+(can&&!BILL.busy?'':' aria-disabled="true"')+'>💎 '+fmtL('프로 패스 · {p}',{p:proPriceTxt()})+(BILL.busy?' …':'')+'</button>';
}
function proNoteHtml(){
  if(passProOn())return '<div class="lbl ps-note">'+fmtL('💎 프로: 👑 골드 칸 전체 + 💎 프로 칸 + 생선 {b}% 더 · {f} 패스 시즌이 끝날 때까지',{b:Math.round(PRO.bonus*100),f:passTheme(save.pass.s).n})+'</div>';
  const can=BILL.kind==='native'||BILL.kind==='play',l=seasonLeft(save.pass.s);
  return '<div class="lbl ps-note ps-pronote">'+fmtL('💎 프로 패스 {p}: 👑 골드 칸 전체 + 💎 프로 칸(프로 트레일 · 모자 · 포인트) + 생선 {b}% 더 · 지금까지 올라온 단계 보상도 바로 받아요',{p:proPriceTxt(),b:Math.round(PRO.bonus*100)})
    +'<br>'+fmtL('이번 {f} 패스 시즌에만 유효 (남은 {l}일) · 한 번 결제, 자동 갱신 없음 · 결제는 Google Play로 처리돼요 · 보상을 받은 뒤에는 청약철회가 제한될 수 있고, 환불은 Google Play 환불 정책을 따라요',{f:passTheme(save.pass.s).n,l})
    +(can?'':'<br><b>'+'Play 스토어 앱에서만 살 수 있어요 (이 브라우저에서는 결제할 수 없어요)'+'</b>')+'</div>';
}
setTimeout(()=>{billInit();},0);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&(BILL.kind==='native'||BILL.kind==='play'))proRestore().catch(()=>{});});
