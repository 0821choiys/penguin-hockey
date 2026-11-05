// v28: the game inside the Android app, in a real browser with a mock of the app side (same JSON messages as MainActivity /
// BillingBridge): Pro Pass purchase through the bridge, Android back button on every screen / dialog / match, exit, pause → save mirror.
// usage: node v28app.js <pc|tall|wide> [lang]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',lang=process.argv[3]||'ko';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const SAVE=JSON.stringify({v:10,news18:true,points:1950,types:['basic','fast','strong','defense'],type:'fast',squad:['strong','defense',null],tut:{done:true,asked:true},rl:{intro:1},
  pass:{s:1,xp:640,gold:false,cf:1,cg:0,fw:0},stats:{played:24,wins:14,goals:61,tourClears:1}});
const OUT=path.join(__dirname,'shots','v28');fs.mkdirSync(OUT,{recursive:true});
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error')logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'node_modules/three/build/three.min.js'))});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  // mock app side (MainActivity + BillingBridge): replies like the Java code, logs every message
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(()=>{const L=window.__appLog=[];let owned=[],n=0;window.__appMode='ok';
    const A={onmessage:null,postMessage(s){const m=JSON.parse(s);L.push(m);if(!m.id)return;
      const rep=o=>setTimeout(()=>A.onmessage&&A.onmessage({data:JSON.stringify(Object.assign({id:m.id},o))}),30);
      if(m.op==='price')rep({ok:true,data:{value:8900,currency:'KRW',text:'₩8,900'}});
      else if(m.op==='buy'){if(window.__appMode==='cancel')rep({ok:false,name:'AbortError',err:'cancelled'});else if(window.__appMode==='pending')rep({ok:false,name:'Pending',err:'PENDING'});else{const t='GPA.'+(++n);owned.push({sku:m.arg,token:t});rep({ok:true,data:{token:t}});}}
      else if(m.op==='consume'){owned=owned.filter(o=>o.token!==m.arg);rep({ok:true,data:true});}
      else if(m.op==='list')rep({ok:true,data:owned.slice()});
      else rep({ok:false,name:'Error',err:'unknown op'});}};
    window.PHAndroid=A;});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('__s')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('__s','1');}},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(3000);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{const R=window.__PH.renderer;R.__r=R.render;R.render=function(){};});
  const shot=n=>page.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:84});
  const back=()=>E(()=>window.phBack());
  const ui=()=>E(()=>window.__PH.G.ui);
  // ---- the bridge ----
  const st=await E(()=>({app:document.documentElement.classList.contains('in-app'),bill:typeof window.PHBilling,kind:window.__PH.BILL.kind,price:window.__PH.BILL.price}));
  ok(st.app&&st.bill==='object'&&st.kind==='native'&&/8,900|8\.900|8 900/.test(st.price),'in the app: Google Play billing through the bridge, store price '+st.price);
  // ---- Pro Pass purchase with a real tap ----
  await E(()=>window.__PH.goScreen('sPass'));await wait(500);
  const btn=await E(()=>{const b=document.getElementById('psBuy');if(!b)return null;b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,dis:b.getAttribute('aria-disabled'),t:b.textContent};});
  ok(btn&&!btn.dis&&/8,900|8\.900|8 900/.test(btn.t),'the 💎 button is enabled with the store price: "'+(btn&&btn.t)+'"');
  await E(()=>{window.__appMode='cancel';});
  if(mode==='pc')await page.mouse.click(btn.x,btn.y);else await page.touchscreen.tap(btn.x,btn.y);await wait(700);
  ok(!(await E(()=>window.__PH.passProOn())),'cancelled in Play → nothing granted');
  await E(()=>{window.__appMode='pending';});
  if(mode==='pc')await page.mouse.click(btn.x,btn.y);else await page.touchscreen.tap(btn.x,btn.y);await wait(700);
  const pm=await E(()=>document.getElementById('msg').textContent);
  ok(!(await E(()=>window.__PH.passProOn()))&&pm.length>4,'pending payment → not granted, message: "'+pm+'"');
  await E(()=>{window.__appMode='ok';});await wait(1500);
  if(mode==='pc')await page.mouse.click(btn.x,btn.y);else await page.touchscreen.tap(btn.x,btn.y);await wait(900);
  const bought=await E(()=>({pro:window.__PH.passProOn(),tok:window.__PH.save.pay.tok.slice(),ops:window.__appLog.map(m=>m.op).join(',')}));
  ok(bought.pro&&bought.tok.includes('GPA.1')&&/buy.*consume/.test(bought.ops),'tap → Play purchase → Pro on, token granted then consumed ('+bought.ops+')');
  await shot('pass_pro');
  // ---- back button: every screen goes back to where its own back button goes ----
  const PARENT={sMode:'sMenu',sHow:'sMenu',sSelect:'sMenu',sScout:'sMenu',sSquad:'sMenu',sMarket:'sMenu',sProfile:'sMenu',sRanked:'sMenu',sGoals:'sMenu',sPass:'sMenu',sSet:'sMenu',sChal:'sMode'};
  for(const [s,p] of Object.entries(PARENT)){await E(id=>window.__PH.goScreen(id),s);await wait(250);const r=await back();await wait(250);const u=await ui();ok(r==='ok'&&u===p,'back on '+s+' → '+u);}
  // dialogs close first
  await E(()=>{window.__PH.goScreen('sScout');window.__PH.openCard('basic');});await wait(400);
  const d1=await E(()=>document.getElementById('cardDlg').classList.contains('on'));const r1=await back();await wait(300);
  const d2=await E(()=>({on:document.getElementById('cardDlg').classList.contains('on'),ui:window.__PH.G.ui}));
  ok(d1&&r1==='ok'&&!d2.on&&d2.ui==='sScout','card dialog open → back closes the dialog only (still on '+d2.ui+')');
  // ---- in a match ----
  await E(()=>window.__PH.startMatch({mode:'free',size:3,time:0,diff:'normal'}));await wait(1500);
  await back();await wait(300);let m=await E(()=>({p:window.__PH.G.paused,ui:window.__PH.G.ui}));ok(m.p&&m.ui==='sPause','in a match: back → pause menu');
  await shot('pause');
  await back();await wait(300);m=await E(()=>({p:window.__PH.G.paused,ui:window.__PH.G.ui}));ok(!m.p,'pause menu: back → the match continues');
  // app to background: match pauses, save goes to the app
  await E(()=>{window.__appLog.length=0;window.phPause();});await wait(200);
  m=await E(()=>({p:window.__PH.G.paused,sv:(window.__appLog.find(x=>x.op==='save')||{}).arg}));
  ok(m.p&&m.sv&&m.sv.save===await E(()=>localStorage.getItem('penguinHockey.v1')),'app to background: match paused, the exact save is sent to the app');
  await E(()=>window.__PH.toMenu());await wait(600);
  // ---- home: once = message, twice = exit ----
  const h1=await back();await wait(150);const msg=await E(()=>{const m=document.getElementById('msg');return {t:m.textContent,on:m.classList.contains('on')};});const h2=await back();
  ok(h1==='ok'&&msg.on&&msg.t.length>3&&h2==='exit','home: first back shows "'+msg.t+'", second back exits');
  await shot('home_exit');
  ok(!(await E(()=>/[가-힣]/.test(document.getElementById('msg').textContent)))||lang==='ko','exit message is translated');
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,3).join(' | '):''));
  console.log('TOTAL: '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})();
