/* ================= v28: Android app shell (Play Store build) ================= */
// The Android app (android/) loads this file from its assets and injects `window.PHAndroid` — a WebView web-message
// listener (androidx.webkit addWebMessageListener, allowed only for the app's own origin). Messages are JSON:
//   game → app  {id,op,arg}            op: price · buy · consume · list (Google Play Billing), vib, save, exit
//   app → game  {id,ok,data|err,name}  replies;  {ev:'purchase'} when Play reports a purchase while the game runs
// From that the game builds `window.PHBilling` (the contract v27 already uses), so the Pro Pass works in the app.
// The app also calls phBack() for the Android back button, phPause()/phResume() when it goes to the background.
// In a plain browser PHAndroid does not exist and nothing here changes how the game runs.
const APP={on:false,seq:0,cb:{},backT:0,mirT:0};
function appPost(o){try{window.PHAndroid.postMessage(JSON.stringify(o));return true;}catch(e){return false;}}
function appCall(op,arg){
  return new Promise((res,rej)=>{const id=++APP.seq;APP.cb[id]={res,rej};
    if(!appPost({id,op,arg})){delete APP.cb[id];rej(new Error('bridge'));}});
}
function appMsg(raw){
  let m;try{m=JSON.parse(typeof raw==='string'?raw:raw&&raw.data);}catch(e){return;}
  if(!m)return;
  if(m.ev==='purchase'){try{proRestore().catch(()=>{});}catch(e){}return;}
  const c=APP.cb[m.id];if(!c)return;delete APP.cb[m.id];
  if(m.ok)c.res(m.data);else{const er=new Error(m.err||'error');er.name=m.name||'Error';c.rej(er);}
}
// the save is mirrored to the app's own storage (Android Auto Backup keeps it across reinstall / new phone)
function appMirror(now){
  if(!APP.on)return;const t=Date.now();
  if(!now&&t-APP.mirT<4000){clearTimeout(appMirror.t);appMirror.t=setTimeout(()=>appMirror(true),4000-(t-APP.mirT));return;}
  APP.mirT=t;clearTimeout(appMirror.t);
  try{appPost({op:'save',arg:{save:localStorage.getItem('penguinHockey.v1')||'',lang:localStorage.getItem('penguinHockey.lang')||''}});}catch(e){}
}
function appInit(){
  const P=window.PHAndroid;if(!P||typeof P.postMessage!=='function')return false;
  APP.on=true;
  if('onmessage' in P||!P.addEventListener)P.onmessage=appMsg;else P.addEventListener('message',appMsg);
  window.PHBilling={price:sku=>appCall('price',sku),buy:sku=>appCall('buy',sku),consume:tok=>appCall('consume',tok),list:()=>appCall('list')};
  try{Object.defineProperty(navigator,'vibrate',{configurable:true,value:p=>{appPost({op:'vib',arg:Array.isArray(p)?p.map(x=>Math.max(0,Math.min(1000,x|0))):[Math.max(0,Math.min(1000,p|0))]});return true;}});}catch(e){}
  try{document.documentElement.classList.add('in-app');}catch(e){}
  window.__phMirror=()=>appMirror(false);
  return true;
}
// ---- Android back button: close the top overlay → leave the screen → pause the match; on the home screen a second press within 2 s exits ----
function appVis(e){if(!e)return false;const cs=getComputedStyle(e);return cs.display!=='none'&&cs.visibility!=='hidden'&&e.getClientRects().length>0;}   // not opacity: dialogs fade in
const APP_OV=['#cfmDlg','#cardDlg','#enhFx','#packFx','#fuseFx','#devFx','#tutAsk','#vsFx'];
const APP_OVBTN=['[data-cf="0"]','[data-ef="close"]','.cd-x','#pkOk','#fzOk','#devOk','#tutNo','#pkSkip','#fzSkip'];
function appOverlay(){
  for(const id of APP_OV){const e=document.querySelector(id);if(e&&e.classList.contains('on')&&appVis(e))return e;}
  return null;
}
function phBack(){
  try{
    const ov=appOverlay();
    if(ov){for(const s of APP_OVBTN){const b=ov.querySelector(s);if(b&&appVis(b)&&!b.disabled){b.click();return 'ok';}}return 'ok';}   // mid-animation: swallow
    if(G.cine){cineSkip();return 'ok';}
    if(G.view==='game'&&G.state!=='over'){
      togglePause();return 'ok';   // playing → pause menu; pause menu → back to the match
    }
    const ui=G.ui;
    if(ui==='sResult'){SFX.ui();toMenu();return 'ok';}
    if(ui==='sTour'){const b=$('#tBack');if(b){b.click();return 'ok';}}
    if(ui&&ui!=='sMenu'){
      const sc=document.getElementById(ui),bs=sc?[...sc.querySelectorAll('button[data-go]')].filter(appVis):[];
      const b=bs[bs.length-1];
      if(b){b.click();return 'ok';}
      SFX.ui();goScreen('sMenu');return 'ok';
    }
    const now=Date.now();
    if(now-APP.backT<2000){APP.backT=0;appMirror(true);return 'exit';}
    APP.backT=now;flashMsg(__L('한 번 더 누르면 게임을 끝내요'));return 'ok';
  }catch(e){return 'ok';}
}
function phPause(){
  try{if(G.view==='game'&&!G.paused&&G.state!=='over')togglePause();}catch(e){}
  try{SFX.suspend();}catch(e){}
  appMirror(true);
}
function phResume(){
  try{SFX.resume();}catch(e){}
  try{if(BILL.kind==='native')proRestore().catch(()=>{});}catch(e){}
}
window.phBack=phBack;window.phPause=phPause;window.phResume=phResume;   // the app calls these by name (evaluateJavascript)
appInit();
