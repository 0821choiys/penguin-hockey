// v35 in a real browser: Google sign-in + cloud save through the Firebase emulators (auth :9099, database :9000).
// The Google button is a stand-in for Google Identity Services (the script URL is answered with a stub that renders a
// button and hands back an emulator ID token). Two separate browser profiles = two devices with the same Google account.
// Checks: 설정 row, real taps on the Google button / choice cards / buttons, link of the anonymous account, upload, the
// other device choosing the cloud (reload with that save), conflict guard, sign out, account deletion.
// usage: node v35acct.js [pc|tall|wide] [lang]   needs: cd firebase && firebase emulators:start --project demo-ph --only auth,database
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',lang=process.argv[3]||'ko';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const NS='demo-ph-default-rtdb',SUB='g-'+Date.now();
const CFG={apiKey:'fake-key',dbUrl:'http://127.0.0.1:9000',ns:NS,authBase:'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1',
  tokenBase:'http://127.0.0.1:9099/securetoken.googleapis.com/v1',ice:[],webClientId:'test-client.apps.googleusercontent.com'};
const EMAIL='t'+Date.now()+'@example.com';const IDT=JSON.stringify({sub:SUB,email:EMAIL,email_verified:true,name:'Tester'});
const GIS=`window.google={accounts:{id:{initialize:function(o){window.__gis=o;},renderButton:function(el){el.innerHTML='<button id="fakeGsi" style="height:40px;padding:0 18px;border-radius:20px">G · Sign in with Google</button>';
  el.firstChild.onclick=function(){setTimeout(function(){window.__gis.callback({credential:window.__IDT});},50);};},prompt:function(){}}}};`;
const ALL=['basic','balanced','fast','defense','strong','king','macaroni','royal'];
const mkSave=(pts,played,types)=>JSON.stringify({v:10,news18:true,points:pts,types,type:types[0],squad:[null,null,null],tut:{done:true,asked:true},rl:{intro:1},
  login:{d:1,last:99999,cyc:0,tot:1},stats:{played,wins:0,goals:0,tourClears:0},set:{quality:'low',lang}});
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
const owner=async(method,p,body)=>{const r=await fetch(CFG.dbUrl+'/'+p+'.json?ns='+NS,{method,headers:{Authorization:'Bearer owner','content-type':'application/json'},body:body&&JSON.stringify(body)});return r.json();};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args.filter(a=>!/single-process|no-zygote/.test(a))],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const logs=[];const OUT=path.join(__dirname,'shots','v35');fs.mkdirSync(OUT,{recursive:true});
  const open=async(tag,save)=>{
    const ctx=await browser.createBrowserContext();const page=await ctx.newPage();
    page.on('pageerror',e=>logs.push(tag+' PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/net::ERR|Failed to load resource/.test(m.text()))logs.push(tag+' CONSOLE '+m.text().slice(0,200));});
    await page.setRequestInterception(true);
    page.on('request',r=>{const u=r.url();
      if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'node_modules/three/build/three.min.js'))});
      if(u.startsWith('https://accounts.google.com/gsi/client'))return r.respond({status:200,contentType:'application/javascript',body:GIS});
      if(u.startsWith('file:')||u.startsWith('http://127.0.0.1:'))return r.continue();r.abort();});
    await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument((s,cfg,idt)=>{window.requestAnimationFrame=()=>0;window.PH_NETCFG=cfg;window.__IDT=idt;
      if(!sessionStorage.getItem('__s')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('__s','1');}},save,CFG,IDT);
    await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2500);
    await page.evaluate(()=>{const R=window.__PH.renderer;R.render=function(){};});
    return page;
  };
  const tap=async(pg,sel)=>{const b=await pg.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();
      const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {x:r.left+r.width/2,y:r.top+r.height/2,top:!!(t&&(t===e||e.contains(t)))};},sel);
    if(!b)return false;if(VP.hasTouch)await pg.touchscreen.tap(b.x,b.y);else await pg.mouse.click(b.x,b.y);await wait(250);return b.top?true:'covered';};
  const until=async(pg,f,ms,arg)=>{const t0=Date.now();while(Date.now()-t0<ms){try{if(await pg.evaluate(f,arg))return true;}catch(e){}await wait(150);}return false;};
  const shot=(pg,n)=>pg.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:84});
  const body=pg=>pg.evaluate(()=>{const d=document.getElementById('accDlg');return d&&d.classList.contains('on')?d.querySelector('.cd-body').textContent:'';});
  // ---- device A: a player with progress ----
  const A=await open('A',mkSave(1500,20,ALL));
  await A.evaluate(()=>window.__PH.goScreen('sSet'));await wait(400);
  const row=await A.evaluate(()=>{const r=document.getElementById('accRow');if(!r)return null;const b=r.getBoundingClientRect();return {txt:r.textContent,in:b.bottom<=innerHeight+1||true,h:b.height};});
  ok(row&&/Google/.test(row.txt),'설정: account row with a Google sign-in button ('+(row&&row.txt)+')');
  ok(await tap(A,'#accOpenB')===true,'the button is tappable');await wait(400);
  ok(await until(A,()=>!!document.getElementById('fakeGsi'),5000),'account window: the Google button is rendered (Google Identity Services)');
  await shot(A,'1_signin');
  // friend-match style anonymous account first: linking must keep the uid
  const anonUid=await A.evaluate(async()=>{await window.__PH.fbToken();return window.__PH.FB.uid;});
  ok(await tap(A,'#fakeGsi')===true,'tap “Sign in with Google”');
  ok(await until(A,()=>window.__PH.accSigned()&&window.__PH.ACC.st==='ok',10000),'signed in with Google ('+await body(A)+')');
  const uidA=await A.evaluate(()=>window.__PH.FB.uid);
  ok(uidA===anonUid,'the anonymous account was linked (same uid)');
  let cloud=await owner('GET','saves/'+uidA);const pA=await A.evaluate(()=>window.__PH.save.points);
  ok(cloud&&cloud.p===pA&&cloud.g===20&&JSON.parse(cloud.data).points===pA,'empty cloud → this device’s save uploaded ('+(cloud&&cloud.p)+'P = device '+pA+'P, 20 matches)');
  await shot(A,'2_signed');
  const rowA=await A.evaluate(()=>{window.__PH.goScreen('sSet');return document.getElementById('accRow').textContent;});ok(rowA.includes(EMAIL),'설정 row shows the account: '+rowA);
  // ---- device B: a new phone, same Google account ----
  const B=await open('B',mkSave(100,0,['basic']));
  await B.evaluate(()=>window.__PH.fbToken());   // B already has its own anonymous account
  await B.evaluate(()=>window.__PH.accOpen());await until(B,()=>!!document.getElementById('fakeGsi'),5000);
  await tap(B,'#fakeGsi');
  ok(await until(B,()=>window.__PH.ACC.st==='choose',10000),'device B: the cloud differs → the player chooses');
  const picks=await B.evaluate(()=>[...document.querySelectorAll('#accDlg .acc-pick')].map(e=>e.textContent));
  const pB=await B.evaluate(()=>window.__PH.save.points);console.log('cards:',picks.join(' | '));
  ok(picks.length===2&&picks[0].includes(pB+'P')&&picks[1].includes(pA+'P')&&/20/.test(picks[1]),'choice cards: this device '+pB+'P · 0 matches, cloud '+pA+'P · 20 matches');
  ok(await B.evaluate(()=>window.__PH.FB.uid)===uidA,'device B now uses the same account uid');
  await shot(B,'3_choose');
  ok(await tap(B,'#accDlg [data-acc="cloud"]')===true,'tap the cloud card');
  await wait(1500);await B.waitForFunction(()=>window.__PH&&window.__PH.save,{timeout:15000}).catch(()=>{});await wait(2500);
  const bs=await B.evaluate(()=>({p:window.__PH.save.points,n:window.__PH.save.types.length,g:window.__PH.save.stats.played}));
  ok(bs.p>=pA&&bs.n===ALL.length&&bs.g===20,'after the restart device B has the cloud progress ('+JSON.stringify(bs)+')');
  ok(await B.evaluate(()=>window.__PH.accSigned()),'still signed in after the restart');
  // ---- B plays (points change) and saves; A sees it ----
  const pB2=await B.evaluate(()=>{const P=window.__PH;P.save.points+=77;P.persist?P.persist():localStorage.setItem('penguinHockey.v1',JSON.stringify(P.save));return P.save.points;});
  await B.evaluate(()=>window.__PH.accOpen());await wait(300);
  await tap(B,'#accDlg [data-acc="up"]');
  ok(await until(B,()=>window.__PH.ACC.st==='ok',8000),'device B: 지금 저장 → uploaded');
  cloud=await owner('GET','saves/'+uidA);ok(cloud&&cloud.p===pB2,'cloud has '+pB2+'P');
  await A.evaluate(()=>window.__PH.accOpen());await wait(300);await tap(A,'#accDlg [data-acc="sync"]');
  ok(await until(A,()=>window.__PH.ACC.st==='choose'&&window.__PH.ACC.choice&&window.__PH.ACC.choice.auto,8000),'device A (unchanged since its last sync): 클라우드 확인 → “newer progress from another device”');
  await tap(A,'#accDlg [data-acc="cloud"]');await wait(1500);await A.waitForFunction(()=>window.__PH&&window.__PH.save,{timeout:15000}).catch(()=>{});await wait(2500);
  const pA2=await A.evaluate(()=>window.__PH.save.points);ok(pA2>=pB2,'device A loaded the cloud progress ('+pA2+'P ≥ '+pB2+'P)');
  // ---- both change: no silent overwrite ----
  await until(A,()=>!window.__PH.ACC.busy&&window.__PH.ACC.st!=='busy',8000);await until(B,()=>!window.__PH.ACC.busy,8000);await wait(500);
  await B.evaluate(()=>{const P=window.__PH;P.save.points=2000;localStorage.setItem('penguinHockey.v1',JSON.stringify(P.save));P.ACC.st='';return P.accUpload(true);});
  await A.evaluate(()=>{const P=window.__PH;P.save.points=1600;localStorage.setItem('penguinHockey.v1',JSON.stringify(P.save));});
  const upA=await A.evaluate(()=>window.__PH.accUpload(false));
  cloud=await owner('GET','saves/'+uidA);
  ok(upA===false&&cloud.p===2000&&await A.evaluate(()=>window.__PH.ACC.st==='choose'),'device A’s upload stops when B saved in between: cloud keeps 2000P, A is asked');
  await tap(A,'#accDlg [data-acc="local"]');await until(A,()=>window.__PH.ACC.st==='ok',8000);
  cloud=await owner('GET','saves/'+uidA);ok(cloud.p===1600,'A chose this device → cloud 1600P');
  // ---- sign out (A) / delete account (B) ----
  await tap(A,'#accDlg [data-acc="out"]');
  ok(await A.evaluate(()=>!window.__PH.accSigned()&&window.__PH.save.points===1600&&!localStorage.getItem('penguinHockey.auth')),'sign out: signed out, this device keeps 1600P');
  await B.evaluate(()=>window.__PH.accOpen());await wait(300);
  await tap(B,'#accDlg [data-acc="del"]');await wait(300);
  const cf=await B.evaluate(()=>{const d=document.getElementById('cfmDlg');return d&&d.classList.contains('on')?d.textContent:'';});
  ok(/삭제|Delete|删除|削除/.test(cf),'delete asks first: '+cf.slice(0,60));
  await shot(B,'4_delete_confirm');
  ok(await tap(B,'#cfmDlg [data-cf="1"]')===true,'confirm button is on top and tappable');
  ok(await until(B,()=>window.__PH.ACC.st==='ok'&&!window.__PH.accSigned(),8000),'account deleted ('+await body(B)+')');
  cloud=await owner('GET','saves/'+uidA);ok(cloud===null,'cloud save removed');
  const gone=await fetch(CFG.authBase+'/accounts:lookup?key=fake',{method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({localId:[uidA]})}).then(r=>r.json());
  ok(!gone.users||!gone.users.length,'Firebase account removed');
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,4).join(' | '):''));
  console.log('TOTAL '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
