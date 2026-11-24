// v52 in a real browser: 👫 friends + 🤝 online 2:2 co-op through the Firebase emulators (auth :9099, database :9000, rules from firebase/).
// Three separate browser profiles = three phones signed in with three Google accounts (emulator ID tokens).
// Checks: friend code, a request typed in and accepted with real taps, the list on both sides, a gift sent and claimed (+points),
// the rules refusing a second gift / a stranger's gift / a stranger's invite, the ranking tab, an invite toast → 참가 → a co-op match
// with both players on blue (the friend's keys move their penguin on the host), the co-op win counted on both, account deletion wiping it.
// usage: node v52social.js [pc|tall|wide] [lang]   needs: bash tools/emu.sh (restart it after a rules change)
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',lang=process.argv[3]||'ko';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const NS='demo-ph-default-rtdb',T=Date.now();
const CFG={apiKey:'fake-key',dbUrl:'http://127.0.0.1:9000',ns:NS,authBase:'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1',
  tokenBase:'http://127.0.0.1:9099/securetoken.googleapis.com/v1',ice:[],webClientId:'test-client.apps.googleusercontent.com'};
const ALL=['basic','balanced','fast','defense','strong','king','macaroni','royal'];
const mkSave=(name,type)=>JSON.stringify({v:10,news18:true,points:500,types:ALL,type,squad:[null,null,null],tut:{done:true,asked:true},rl:{intro:1},hat:'none',
  login:{d:1,last:99999,cyc:0,tot:1},stats:{played:3,wins:0,goals:0,tourClears:0},profile:{name},run:{best:name==='Ann'?6:2},
  set:{quality:'low',lang,cond:false,events:false,items:false,rules:'off',masc:'off',motion:false}});
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
const owner=async(method,p,body)=>{const r=await fetch(CFG.dbUrl+'/'+p+'.json?ns='+NS,{method,headers:{Authorization:'Bearer owner','content-type':'application/json'},body:body&&JSON.stringify(body)});return r.json();};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args.filter(a=>!/single-process|no-zygote/.test(a)),'--disable-features=WebRtcHideLocalIpsWithMdns','--allow-loopback-in-peer-connection'],
    executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const logs=[];const OUT=path.join(__dirname,'shots','v52');fs.mkdirSync(OUT,{recursive:true});
  const open=async(tag,save,sub)=>{
    const ctx=await browser.createBrowserContext();const page=await ctx.newPage();
    page.on('pageerror',e=>logs.push(tag+' PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/net::ERR|Failed to load resource|40[13]/.test(m.text()))logs.push(tag+' CONSOLE '+m.text().slice(0,200));});
    await page.setRequestInterception(true);
    page.on('request',r=>{const u=r.url();
      if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'node_modules/three/build/three.min.js'))});
      if(u.startsWith('file:')||u.startsWith('http://127.0.0.1:'))return r.continue();r.abort();});
    const idt=JSON.stringify({sub,email:sub+'@example.com',email_verified:true,name:tag});
    await page.evaluateOnNewDocument((s,cfg,idt)=>{window.PH_NODAILY=1;window.requestAnimationFrame=()=>0;window.PH_NETCFG=cfg;window.__IDT=idt;
      if(!sessionStorage.getItem('__s')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('__s','1');}},save,CFG,idt);
    await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2500);
    await page.evaluate(()=>{const R=window.__PH.renderer;R.render=function(){};});
    return page;
  };
  const tap=async(pg,sel)=>{const b=await pg.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();
      const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {x:r.left+r.width/2,y:r.top+r.height/2,top:!!(t&&(t===e||e.contains(t)))};},sel);
    if(!b)return false;if(VP.hasTouch)await pg.touchscreen.tap(b.x,b.y);else await pg.mouse.click(b.x,b.y);await wait(250);return b.top?true:'covered';};
  const until=async(pg,f,ms,arg)=>{const t0=Date.now();while(Date.now()-t0<ms){try{if(await pg.evaluate(f,arg))return true;}catch(e){}await wait(150);}return false;};
  const shot=(pg,n)=>pg.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:84});
  const signIn=pg=>pg.evaluate(()=>{const f=window.accWithIdToken||window.__PH.accWithIdToken;return f(window.__IDT,'web');});
  const txt=(pg,sel)=>pg.evaluate(s=>{const e=document.querySelector(s);return e?e.textContent:'';},sel);
  const A=await open('Ann',mkSave('Ann','king'),'ann-'+T),B=await open('Bo',mkSave('Bo','macaroni'),'bo-'+T),C=await open('Cy',mkSave('Cy','fast'),'cy-'+T);
  const EA=(f,...a)=>A.evaluate(f,...a),EB=(f,...a)=>B.evaluate(f,...a),EC=(f,...a)=>C.evaluate(f,...a);
  // ---- not signed in: the friends tab asks for Google ----
  await EA(()=>window.__PH.goScreen('sMode'));await wait(300);
  ok(await tap(A,'#modeFriend')===true,'경기 모드 → 친구 card');await wait(400);
  ok(await EA(()=>window.__PH.G.ui==='sFriend'&&!!document.getElementById('frHost')&&document.querySelectorAll('.soc-tabs button').length===3),'친구 screen: 3 tabs; signed out it opens on the room code (방 만들기) as before');
  ok(await tap(A,'[data-soct="fr"]')===true&&await EA(()=>!!document.getElementById('socLogin')),'친구 tab: a 로그인 button before signing in');
  await shot(A,'0_login');
  await tap(A,'[data-soct="play"]');
  ok(await EA(()=>!!document.getElementById('frHost')&&!!document.querySelector('[data-socm="coop"]')),'대전 · 협동 tab works without an account (room code, 1:1 / 2:2)');
  await tap(A,'[data-soct="fr"]');
  // ---- sign in (three phones) ----
  await Promise.all([signIn(A),signIn(B),signIn(C)]);
  const codes=[];for(const [pg,n] of [[A,'A'],[B,'B'],[C,'C']]){const g=await until(pg,()=>/^[A-Z2-9]{8}$/.test(window.__PH.SOC.code),15000);codes.push(await pg.evaluate(()=>window.__PH.SOC.code));ok(g,n+': signed in, friend code '+codes[codes.length-1]);}
  const uid=await Promise.all([EA(()=>window.__PH.FB.uid),EB(()=>window.__PH.FB.uid),EC(()=>window.__PH.FB.uid)]);
  ok((await owner('GET','codes/'+codes[0]))===uid[0]&&(await owner('GET','users/'+uid[0])).n==='Ann','the server keeps code → account and the public name');
  await until(A,()=>!!document.getElementById('socMyCode'),5000);
  ok((await txt(A,'#socMyCode'))===codes[0],'친구 tab shows my code');
  await shot(A,'1_code');
  // ---- A adds B: typed + tapped ----
  await tap(A,'#socCode');await A.keyboard.type(codes[1].toLowerCase());
  ok(await EA(()=>document.getElementById('socCode').value)===codes[1],'the code field upper-cases what is typed');
  await tap(A,'#socAddB');
  ok(await until(A,()=>/수락|accept|接受|承認/i.test(document.querySelector('.soc-ok')?document.querySelector('.soc-ok').textContent:''),8000),'A: request sent ('+await txt(A,'.soc-ok')+')');
  await EB(()=>window.__PH.goScreen('sFriend'));
  ok(await until(B,(u)=>!!window.__PH.SOC.inbox.req[u]&&!!document.querySelector('[data-soca="'+u+'"]'),10000,uid[0]),'B: the request arrives live with 수락 / 거절');
  ok(await until(B,()=>/\d/.test((document.querySelector('.soc-dotn')||{}).textContent||''),3000),'B: a badge on the 친구 tab');
  await shot(B,'2_request');
  ok(await tap(B,'[data-soca="'+uid[0]+'"]')===true,'B taps 수락');
  ok(await until(A,u=>!!window.__PH.SOC.inbox.fr[u]&&!!document.querySelector('[data-socg="'+u+'"]'),10000,uid[1])&&await until(B,u=>!!window.__PH.SOC.inbox.fr[u],5000,uid[0]),'friends on both sides');
  ok(await until(A,()=>/Bo/.test(document.querySelector('.soc-row .soc-n')?document.querySelector('.soc-row .soc-n').textContent:'')&&!!document.querySelector('.soc-row.on'),8000),'A: Bo in the list, shown online');
  await shot(A,'3_list');
  // a second request the other way is “already friends”
  ok(await EB(c=>window.__PH.socAdd(c).then(r=>!r&&/친구|friend|好友|フレンド/i.test(window.__PH.SOC.msg)),codes[0]),'adding a friend again → already friends');
  // ---- gift ----
  const pB0=await EB(()=>window.__PH.save.points);
  ok(await tap(A,'[data-socg="'+uid[1]+'"]')===true,'A taps 🎁 for Bo');
  ok(await until(A,u=>document.querySelector('[data-socg="'+u+'"]').disabled,5000,uid[1]),'A: the gift button is used up for today');
  ok(await until(B,()=>!!document.getElementById('socClaim'),10000),'B: “선물 받기” appears');
  await shot(B,'4_gift');
  await tap(B,'#socClaim');
  const pB1=await EB(()=>window.__PH.save.points),gift=await EB(()=>window.__PH.SOCD.gift);
  ok(pB1===pB0+gift,'B: +'+gift+'P ('+pB0+' → '+pB1+')');
  ok(await EB(()=>!document.getElementById('socClaim')&&window.__PH.socGiftsWaiting().length===0),'claimed once, nothing left');
  // the rules: a second gift too soon, a stranger's gift, a stranger's invite
  const again=await EA(u=>{window.__PH.socS().sent={};return window.__PH.socGift(u);},uid[1]);
  ok(again===false&&await EA(u=>!window.__PH.socGiftReady(u),uid[1]),'a second gift within 20 h is refused by the server (and remembered)');
  const strangerGift=await EC(u=>window.__PH.dbReq?window.__PH.dbReq('PUT','inbox/'+u+'/gift/'+window.__PH.FB.uid,{t:{'.sv':'timestamp'}}).then(()=>'ok',e=>e.status||'err'):'nodb',uid[1]);
  const strangerInv=await EC(u=>window.__PH.dbReq?window.__PH.dbReq('PUT','inbox/'+u+'/inv/'+window.__PH.FB.uid,{c:'ABCDEF',m:'coop',n:'x',t:1}).then(()=>'ok',e=>e.status||'err'):'nodb',uid[1]);
  const peek=await EC(u=>window.__PH.dbReq?window.__PH.dbReq('GET','inbox/'+u).then(()=>'ok',e=>e.status||'err'):'nodb',uid[1]);
  ok(strangerGift!=='ok'&&strangerInv!=='ok'&&peek!=='ok','a stranger cannot send gifts / invites or read someone’s inbox ('+[strangerGift,strangerInv,peek].join(', ')+')');
  // ---- ranking ----
  await EA(()=>window.__PH.socPush(false));await EB(()=>window.__PH.socPush(false));
  await EA(()=>{window.__PH.SOC.uT=0;window.__PH.SOC.tab='rk';window.__PH.SOC.rk='run';window.__PH.frRender();});
  ok(await until(A,()=>{const r=[...document.querySelectorAll('.soc-rkr')].map(e=>e.textContent);return r.length===2&&/Ann/.test(r[0])&&/Bo/.test(r[1]);},8000),'ranking (원정 최고): Ann 6 above Bo 2, me marked');
  await shot(A,'5_rank');
  await tap(A,'[data-socr="lv"]');ok(await EA(()=>document.querySelectorAll('.soc-rkr').length===2&&document.querySelector('[data-socr="lv"]').classList.contains('on')),'ranking switches to 감독 레벨');
  // ---- invite to co-op → toast → 참가 → the match ----
  await EB(()=>window.__PH.goScreen('sHome'));
  await EA(()=>{window.__PH.SOC.tab='fr';window.__PH.SOC.diff='easy';window.__PH.frRender();});
  ok(await tap(A,'[data-socc="'+uid[1]+'"]')===true,'A taps 🤝 next to Bo');
  ok(await until(A,()=>window.__PH.NET.st==='wait'&&window.__PH.NET.mode==='coop',15000),'A: a co-op room waits');
  ok(await until(B,()=>!!document.getElementById('socInv'),12000),'B (on the home screen): an invite toast');
  await shot(B,'6_invite');
  ok(await tap(B,'#socInvGo')===true,'B taps 참가');
  const t0=Date.now();
  const both=await (async()=>{while(Date.now()-t0<40000){const a=await EA(()=>window.__PH.NET.st+'/'+window.__PH.G.net),b=await EB(()=>window.__PH.NET.st+'/'+window.__PH.G.net);if(a==='play/host'&&b==='play/guest')return true;await wait(200);}return false;})();
  ok(both,'connected; the co-op match started on both in '+((Date.now()-t0)/1000).toFixed(1)+' s');
  if(both){
    const team=f=>()=>{const G=window.__PH.G;return [G.coop,G.cfg.diff,G.mine===G.teams.blue,G.teams.blue.skaters.map(s=>s.type).join('+'),G.teams.red.skaters.map(s=>s.type).join('+'),G.teams.blue.skaters.indexOf(G.player)].join(' ');};
    const ta=await EA(team()),tb=await EB(team());
    ok(/^true easy true king\+macaroni /.test(ta)&&ta.endsWith(' 0'),'host: co-op, easy, blue = Ann’s king + Bo’s macaroni, steering #1 ('+ta+')');
    ok(/^true easy true king\+macaroni /.test(tb)&&tb.endsWith(' 1')&&ta.split(' ')[4]===tb.split(' ')[4],'friend: the same teams, steering #2 ('+tb+')');
    const pump=async(sec)=>{const n=Math.round(sec*20);for(let i=0;i<n;i++){await EA(()=>{const P=window.__PH;for(let k=0;k<3;k++)P.step(1/60);});await EB(()=>{const P=window.__PH;for(let k=0;k<3;k++)P.step(1/60);});await wait(15);}};
    await pump(3.6);
    await B.keyboard.down('KeyD');let vx=0,nv=0;
    for(let i=0;i<30;i++){await pump(.05);const r=await EA(()=>window.__PH.G.teams.blue.skaters[1].vx);if(i>=10){vx+=r;nv++;}}
    await B.keyboard.up('KeyD');
    ok(vx/nv>2,'Bo holds right → blue #2 skates right on the host ('+(vx/nv).toFixed(2)+' m/s)');
    ok(await EA(()=>{const G=window.__PH.G;return G.player===G.teams.blue.skaters[0]&&window.__PH.NET.rp===G.teams.blue.skaters[1];}),'host still steers #1, the friend #2 (no switching)');
    await shot(A,'7_coop_host');await shot(B,'7_coop_friend');
    // end it with a win
    await EA(()=>{const G=window.__PH.G;G.mine.score=3;G.mine.opp.score=1;G.timeLeft=.3;});
    await pump(2.5);
    ok(await until(A,()=>window.__PH.socS().cw===1,8000)&&await until(B,()=>window.__PH.socS().cw===1,8000),'the co-op win is counted on both phones (협동 승 1)');
    ok(await until(A,u=>{return window.__PH.dbReq('GET','users/'+u).then(x=>x&&x.st&&x.st.cw===1);},8000,uid[0]),'… and shows in the ranking data');
  }
  // ---- account deletion wipes the friend data ----
  await EB(()=>{window.__PH.goScreen('sSet');(window.accDelete||window.__PH.accDelete)();});
  ok(await until(B,()=>{const d=document.getElementById('cfmDlg');return d&&d.classList.contains('on');},5000),'계정 삭제 asks first');
  await tap(B,'#cfmDlg [data-cf="1"]');
  await until(B,()=>window.__PH.ACC.st==='ok'&&!window.__PH.accSigned(),15000);const del=await EB(()=>window.__PH.ACC.st+' '+window.__PH.ACC.msg);
  const left=[await owner('GET','users/'+uid[1]),await owner('GET','codes/'+codes[1]),await owner('GET','inbox/'+uid[1]),await owner('GET','inbox/'+uid[0]+'/fr/'+uid[1])];
  ok(left.every(x=>x===null),'B deletes the account → profile, code, inbox and the place in A’s list are gone ('+del+')');
  ok(logs.length===0,'no page errors '+logs.slice(0,6).join(' | '));
  console.log('TOTAL v52social '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');
  await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
