// v28: Android app shell — PHAndroid web-message bridge → PHBilling (Pro Pass through the app), back button, pause, vibration, save mirror
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {save,G,PRO,BILL,APP}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const tick=()=>new Promise(r=>setTimeout(r,5));
(async()=>{
  ok(APP.on===false&&!global.PHBilling,'plain browser / no app: the bridge stays off, no PHBilling');
  ok(PH.phBack()==='ok','back works without the app too (no crash)');
  // ---- a mock of the Android side (MainActivity + BillingBridge) ----
  const sent=[];let owned=[],nTok=0,mode='ok';const A={onmessage:null,
    postMessage(s){const m=JSON.parse(s);sent.push(m);if(!m.id)return;
      const reply=o=>setTimeout(()=>A.onmessage({data:JSON.stringify(Object.assign({id:m.id},o))}),1);
      if(m.op==='price')reply({ok:true,data:{value:8900,currency:'KRW'}});
      else if(m.op==='buy'){if(mode==='cancel')reply({ok:false,err:'cancelled',name:'AbortError'});else if(mode==='fail')reply({ok:false,err:'BILLING_UNAVAILABLE',name:'Error'});
        else{const t='T'+(++nTok);owned.push({sku:m.arg,token:t});reply({ok:true,data:{token:t}});}}
      else if(m.op==='consume'){owned=owned.filter(o=>o.token!==m.arg);reply({ok:true,data:true});}
      else if(m.op==='list')reply({ok:true,data:owned.slice()});
    }};
  global.PHAndroid=A;
  ok(PH.appInit()===true&&APP.on&&typeof global.PHBilling.buy==='function'&&typeof A.onmessage==='function','in the app: PHBilling is built on the PHAndroid bridge');
  // the Pro Pass through the app bridge
  Object.assign(save.pass,{s:PH.seasonNow(),xp:300,gold:false,pro:0,cx:0});save.pay.tok=[];
  await PH.billInit();ok(BILL.kind==='native'&&BILL.price.replace(/\s/g,'').includes('8,900'),'billing found through the app, store price '+BILL.price);
  const r=await PH.proBuy();ok(r===true&&PH.passProOn()&&save.pay.tok.includes('T1')&&owned.length===0,'buy in the app → Pro for this season, the purchase is consumed');
  ok(sent.some(m=>m.op==='buy'&&m.arg===PRO.sku),'the app is asked for product '+PRO.sku);
  // cancel and errors
  Object.assign(save.pass,{pro:0});mode='cancel';const r2=await PH.proBuy();ok(r2===false&&!PH.passProOn()&&!BILL.busy,'cancelled in Play: nothing granted, button usable again');
  mode='fail';const r3=await PH.proBuy();ok(r3===false&&!PH.passProOn()&&!BILL.busy,'Play error: nothing granted');
  // a purchase finished while the game runs (pending payment approved later) → the app sends {ev:'purchase'} → restored
  mode='ok';owned=[{sku:PRO.sku,token:'LATE'}];A.onmessage({data:JSON.stringify({ev:'purchase'})});
  for(let i=0;i<20&&!PH.passProOn();i++)await tick();
  ok(PH.passProOn()&&save.pay.tok.includes('LATE')&&owned.length===0,'a purchase Play reports later is granted and consumed');
  ok(PH.appMsg('not json')===undefined&&PH.appMsg(JSON.stringify({id:999,ok:true}))===undefined,'bad or unknown replies are ignored');
  // vibration goes to the app, clamped
  sent.length=0;navigator.vibrate([20,5000,-3]);const v=sent.find(m=>m.op==='vib');ok(v&&v.arg.join()==='20,1000,0','vibration is sent to the app, clamped to 0–1000 ms');
  // save mirror: persist → (throttled) save sent to the app with the real saved JSON
  sent.length=0;PH.phPause();const sv=sent.find(m=>m.op==='save');
  ok(sv&&sv.arg.save===localStorage.getItem('penguinHockey.v1')&&JSON.parse(sv.arg.save).pay.tok.includes('LATE'),'going to the background sends the current save to the app');
  // back button on the home screen: first press warns, second within 2 s exits
  G.view='menu';G.ui='sMenu';G.cine=null;APP.backT=0;
  const b1=PH.phBack(),b2=PH.phBack();ok(b1==='ok'&&b2==='exit','home screen: back once = message, twice = exit');
  APP.backT=Date.now()-2500;ok(PH.phBack()==='ok','a second press after 2 s only warns again');
  // in a match: back pauses
  G.view='game';G.state='play';G.paused=false;G.ui=null;PH.phBack();ok(G.paused===true,'in a match: back pauses');
  PH.phBack();ok(G.paused===false,'on the pause menu: back resumes');
  G.view='menu';G.ui='sMenu';
  console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
  console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
})();
