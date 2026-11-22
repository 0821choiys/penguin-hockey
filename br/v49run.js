// v49 🧊 펭귄 원정 in a real browser: home card (portrait) → run screen intro → start → stage card → match (run tag, twist) → win → result row = paid
// → pick 1 of 3 upgrade cards → next stage; a loss costs a life, the last one ends the run (summary + best); 모든 경기 모드 entry; layout + translation.
// usage: node v49run.js <pc|tall|wide|wideS> [lang]   → shots/run/<mode>_<lang>_*.jpg
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'tall',lang=process.argv[3]||'ko';
const VP={wideS:{width:740,height:360,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1},pc:{width:1000,height:620},
  tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:['basic','fast','strong','king'],type:'strong',tut:{done:true,asked:true},hat:'none',rl:{intro:1},
  set:{quality:'low',cond:false,events:false,items:false,rules:'off',cine:'off',masc:'off',tod:'day',lang}});
const OUT=path.join(__dirname,'shots','run');fs.mkdirSync(OUT,{recursive:true});
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error')logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});
  await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('seeded','1');}},SAVE);
  const URL='file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang;
  await page.goto(URL,{waitUntil:'load'});await wait(2800);
  const E=(f,...a)=>page.evaluate(f,...a);
  const shot=async n=>{await E(()=>{for(const a of document.getAnimations())try{a.finish();}catch(e){}});await wait(80);await page.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:82});};
  const tapSel=async sel=>{const b=await page.$(sel);if(!b)return false;const q=await b.boundingBox();if(!q)return false;if(VP.hasTouch)await page.touchscreen.tap(q.x+q.width/2,q.y+q.height/2);else await page.mouse.click(q.x+q.width/2,q.y+q.height/2);return true;};
  const land=VP.height<=520;
  // the headless renderer is slow (≈1 fps with WebGL): drive the game clock by hand until the result screen is up
  const waitResult=async()=>{const r=await E(()=>{const P=window.__PH,G=P.G;for(let i=0;i<400&&!(G.result&&G.result.paid);i++)P.step(1/30);return !!(G.result&&G.result.paid);});await wait(250);return r;};
  // layout of the run screen: everything inside the viewport / panel, no text cut, foot buttons reachable
  const layout=()=>E(()=>{const pn=document.querySelector('#sRun .panel'),P=pn.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,bad=[];
    for(const e of pn.querySelectorAll('*')){if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')continue;const r=e.getBoundingClientRect();if(!r.width)continue;
      if(r.left<P.left-1.5||r.right>P.right+1.5)bad.push('out:'+(e.id||e.className||e.tagName)+' '+Math.round(r.left)+'..'+Math.round(r.right));
      if(e.children.length===0&&e.textContent.trim()&&e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!=='visible'&&!/mr-s/.test(e.className))bad.push('cut:'+e.textContent.slice(0,24));}
    const ft=[...document.querySelectorAll('#runFoot .btn,#sRun [data-go="sMenu"]')].map(b=>b.getBoundingClientRect()),body=document.getElementById('runBody');
    const B=body.getBoundingClientRect();   // landscape panels (all of them, v30) end a few px past the bottom edge — what must fit is the content
    return {bad:bad.slice(0,6),panel:[Math.round(P.left),Math.round(P.top),Math.round(P.right),Math.round(P.bottom)],inView:P.left>=-1&&P.right<=vw+1&&P.top>=-1&&P.bottom<=vh+6&&B.bottom<=vh+1,
      footIn:ft.every(r=>r.bottom<=vh+1&&r.top>=0),scroll:body.scrollHeight>body.clientHeight+2};});
  const hangul=sel=>E(s=>{const t=(document.querySelector(s)||{}).innerText||'';return (t.match(/[가-힣]+/g)||[]).join(' ');},sel);
  // 1) home card (portrait) / hidden in landscape like 오늘의 목표
  await E(()=>window.__PH.goScreen('sMenu'));await wait(500);
  const home=await E(()=>{const m=document.getElementById('menuRun'),g=document.getElementById('menuGoals'),r=m.getBoundingClientRect(),q=g.getBoundingClientRect(),d=document.querySelector('.dock'),sm=document.getElementById('sMenu');const dr=d?d.getBoundingClientRect():null;
    const scroll=Math.max(0,sm.scrollHeight-sm.clientHeight);   // the home scrolls on short windows: what counts is that the card can be scrolled clear of the dock
    return {vis:getComputedStyle(m).display!=='none'&&r.height>0,txt:m.innerText,h:Math.round(r.height),above:r.bottom<=q.top+1||Math.abs(r.top-q.top)<2,row:Math.abs(r.top-q.top)<2,dockGap:dr?Math.round(dr.top-(Math.max(r.bottom,q.bottom)-scroll)):null,scroll};});
  if(land)ok(!home.vis,'landscape: the home card is hidden like 오늘의 목표 (reached through 모든 경기 모드)');
  else{ok(home.vis&&home.above&&home.h>=44,'home: 🧊 card under the tiles, '+(home.row?'beside':'above')+' 오늘의 목표, tall enough to tap ('+home.h+' px) “'+home.txt.replace(/\s+/g,' ')+'”');
    ok(home.dockGap===null||home.dockGap>=0,'home: the card and 오늘의 목표 can be seen clear of the dock (gap '+home.dockGap+' px'+(home.scroll?' after scrolling '+home.scroll+' px':'')+')');}
  await shot('home');
  // 2) 모든 경기 모드 → 펭귄 원정
  await E(()=>window.__PH.goScreen('sMode'));await wait(300);
  ok(await E(()=>!!document.getElementById('modeRun')),'모든 경기 모드 has the 🧊 entry');
  await E(()=>document.getElementById('modeRun').scrollIntoView({block:'center'}));await wait(150);
  await tapSel('#modeRun');await wait(500);
  let I=await E(()=>({ui:window.__PH.G.ui||document.querySelector('.screen.on')&&document.querySelector('.screen.on').id,intro:!!document.querySelector('.run-intro'),start:!!document.getElementById('runStart'),li:[...document.querySelectorAll('.run-intro li')].map(l=>l.innerText)}));
  ok(I.intro&&I.start&&I.li.length===4,'intro: 4 rules + ▶ 원정 시작');
  const payTxt=await E(()=>{const P=window.__PH;return [P.runPay(1,null),P.runPay(10,null)];});
  ok(I.li[3].includes(String(payTxt[0]))&&I.li[3].includes(String(payTxt[1])),'intro reward line = code (stage 1 +'+payTxt[0]+' P, stage 10 +'+payTxt[1]+' P)');
  let L=await layout();ok(L.bad.length===0&&L.inView&&L.footIn,'intro layout: inside the screen, nothing cut, start button reachable '+JSON.stringify(L));
  if(lang!=='ko'){const h=await hangul('#sRun');ok(!h,'['+lang+'] intro translated'+(h?' — Korean left: '+h:''));}
  await shot('intro');
  // 3) start → stage card
  await tapSel('#runStart');await wait(400);
  I=await E(()=>{const P=window.__PH,c=P.runCur();return {c,route:document.querySelectorAll('.rr-n').length,cur:!!document.querySelector('.rr-n.cur'),stage:!!document.querySelector('.run-stage'),opp:document.querySelectorAll('.rs-opp .ro').length,
    pay:(document.querySelector('.rs-pay')||{}).innerText||'',payCode:P.runPay(c.st,c),go:!!document.getElementById('runGo'),hearts:(document.querySelector('.run-h')||{}).innerText||''};});
  ok(I.c&&I.c.st===1&&I.c.lives===2&&I.stage&&I.go,'start: stage 1, ♥♥, stage card + ▶ 출발');
  ok(I.route===7&&I.cur,'route: 7 stops with the current one marked');
  ok(I.opp===I.c.opp.length&&I.pay.includes(String(I.payCode)),'stage card: '+I.opp+' opponents, reward shown = code ('+I.pay+')');
  L=await layout();ok(L.bad.length===0&&L.inView&&L.footIn,'stage layout '+JSON.stringify(L));
  if(lang!=='ko'){const h=await hangul('#sRun');ok(!h,'['+lang+'] stage card translated'+(h?' — Korean left: '+h:''));}
  await shot('stage1');
  // a later stage with a twist + a boss stage, drawn the same way (what the player sees there)
  await E(()=>{const P=window.__PH,c=P.runCur();c.st=4;c.mod='golden';c.opp=null;c.ups={pow:2,spd:1,gk:1};P.runPrep(c);P.renderRun();});await wait(200);
  I=await E(()=>({mods:[...document.querySelectorAll('.rs-mod')].map(m=>m.innerText.replace(/\s+/g,' ')),ups:document.querySelectorAll('.run-ups .ru').length}));
  ok(I.mods.length===1&&I.mods[0].includes('25')&&I.ups===3,'twist row (골든 퍽 러시, every 25 s) + 3 upgrade chips '+JSON.stringify(I.mods));
  await shot('stage4');
  await E(()=>{const P=window.__PH,c=P.runCur();c.st=5;c.mod=null;c.opp=null;P.runPrep(c);P.renderRun();});await wait(200);
  I=await E(()=>({boss:!!document.querySelector('.run-stage.boss'),bossNode:!!document.querySelector('.rr-n.cur.boss'),mods:[...document.querySelectorAll('.rs-mod')].map(m=>m.innerText.replace(/\s+/g,' '))}));
  ok(I.boss&&I.bossNode&&I.mods.length===1,'stage 5 = boss (card + route) '+JSON.stringify(I.mods));
  L=await layout();ok(L.bad.length===0&&L.inView&&L.footIn,'boss layout '+JSON.stringify(L));
  await shot('stage5boss');
  // back to stage 1 for the real match
  await E(()=>{const P=window.__PH,c=P.runCur();c.st=1;c.mod=null;c.opp=null;c.ups={};P.runPrep(c);P.renderRun();});await wait(150);
  // 4) ▶ 출발 → a run match
  await tapSel('#runGo');await wait(1500);
  I=await E(()=>{const G=window.__PH.G;return {mode:G.cfg&&G.cfg.mode,tag:(document.getElementById('modeTag')||{}).textContent||'',opp:G.cfg.oppName,state:G.state};});
  ok(I.mode==='run'&&/♥♥/.test(I.tag),'▶ 출발 starts the stage-1 match; HUD tag “'+I.tag+'”');
  // win it → result screen
  await E(()=>{const P=window.__PH,G=P.G;G.mine.score=3;G.mine.opp.score=1;P.endMatch();});await waitResult();await wait(300);
  if(process.env.DBG)console.log('DBG',JSON.stringify(await E(()=>{const G=window.__PH.G;return {state:G.state,stateT:G.stateT,res:!!G.result,paid:G.result&&G.result.paid,on:(document.querySelector('.screen.on')||{}).id,view:G.view,masc:!!G.masc,paused:G.paused};})),logs.slice(0,5));
  I=await E(()=>{const P=window.__PH,G=P.G,R=G.result,rows=[...document.querySelectorAll('#sResult .rs-row,#sResult tr,#sResult li,#sResult .row-pt')].map(r=>r.innerText.replace(/\s+/g,' '));
    const t=document.getElementById('sResult').innerText;return {on:document.getElementById('sResult').classList.contains('on'),extra:R.extra,pay:R.run&&R.run.pay,total:R.total,hasRow:!!R.extraName&&t.includes(R.extraName.replace(/<[^>]+>/g,'')),btn:[...document.querySelectorAll('#sResult button')].map(b=>b.innerText),cur:P.runCur()};});
  ok(I.on&&I.extra===I.pay&&I.extra===30&&I.hasRow,'win → result: stage reward row +'+I.extra+' P (paid = shown), total '+I.total);
  ok(I.cur&&I.cur.st===2&&Array.isArray(I.cur.pend)&&I.cur.pend.length===3,'the run moved on to stage 2 with 3 upgrades to pick');
  await shot('result_win');
  // 5) 🎁 → the pick
  await E(()=>{const b=[...document.querySelectorAll('#sResult button')].find(x=>/🎁/.test(x.innerText));b&&b.click();});await wait(500);
  I=await E(()=>({cards:[...document.querySelectorAll('.run-card')].map(c=>({k:c.dataset.up,t:c.innerText.replace(/\s+/g,' ')})),go:!!document.getElementById('runGo')}));
  ok(I.cards.length===3&&!I.go&&new Set(I.cards.map(c=>c.k)).size===3,'pick screen: 3 different cards, no ▶ 출발 before picking');
  const shown=await E(()=>{const P=window.__PH;return [...document.querySelectorAll('.run-card')].every(c=>c.innerText.includes(P.runUpDesc(c.dataset.up).replace(/<[^>]+>/g,'')));});
  ok(shown,'every card shows its numbers from RUN_UP');
  L=await layout();ok(L.bad.length===0&&L.inView,'pick layout '+JSON.stringify(L));
  if(lang!=='ko'){const h=await hangul('#sRun');ok(!h,'['+lang+'] cards translated'+(h?' — Korean left: '+h:''));}
  await shot('pick');
  const k0=I.cards[0].k;await tapSel('.run-card[data-up="'+k0+'"]');await wait(900);
  I=await E(()=>({c:window.__PH.runCur(),stage:!!document.querySelector('.run-stage'),chip:document.querySelectorAll('.run-ups .ru').length}));
  ok(I.c.pend===null&&(I.c.ups[k0]===1||k0==='life')&&I.stage&&I.chip>=1,'tap a card → upgrade kept ('+k0+'), stage 2 card shown');
  await shot('stage2');
  // 6) a loss costs a life
  await E(()=>{const P=window.__PH;P.startMatch(P.runCfg(P.runCur()));});await wait(800);
  const lives0=await E(()=>window.__PH.runCur().lives);
  await E(()=>{const P=window.__PH,G=P.G;G.mine.score=0;G.mine.opp.score=2;P.endMatch();});await waitResult();await wait(300);
  I=await E(()=>({c:window.__PH.runCur(),t:document.getElementById('sResult').innerText}));
  ok(I.c&&I.c.lives===lives0-1&&I.c.st===2,'loss → one life gone ('+lives0+' → '+I.c.lives+'), same stage again');
  await shot('result_loss');
  // 7) lose until the run ends → summary + best
  for(let i=0;i<4&&await E(()=>!!window.__PH.runCur());i++){await E(()=>{const P=window.__PH;P.startMatch(P.runCfg(P.runCur()));});await wait(600);await E(()=>{const P=window.__PH,G=P.G;G.mine.score=0;G.mine.opp.score=2;P.endMatch();});await waitResult();await wait(200);}
  I=await E(()=>({c:window.__PH.runCur(),run:window.__PH.save.run,t:document.getElementById('sResult').innerText}));
  ok(!I.c&&I.run.best===1&&I.run.last&&I.run.last.cleared===1&&I.run.runs===1,'last life gone → run over, best 1, summary saved '+JSON.stringify(I.run.last));
  await shot('result_over');
  await E(()=>{const b=[...document.querySelectorAll('#sResult button')].find(x=>/📜/.test(x.innerText));b&&b.click();});await wait(500);
  I=await E(()=>({last:!!document.querySelector('.run-last'),best:(document.getElementById('runBest')||{}).innerText||''}));
  ok(I.last&&/1/.test(I.best),'run screen: last expedition box + best record chip “'+I.best+'”');
  await shot('over');
  // 8) home card shows the best now (portrait) + Android back from the run screen goes home
  await E(()=>window.__PH.goScreen('sMenu'));await wait(300);
  if(!land){const t=await E(()=>document.getElementById('menuRun').innerText);ok(/1/.test(t),'home card shows the best record “'+t.replace(/\s+/g,' ')+'”');}
  const back=await E(()=>{const P=window.__PH;P.goScreen('sRun');const bs=[...document.querySelectorAll('#sRun [data-go]')].filter(b=>b.offsetParent);return bs.length?bs[bs.length-1].dataset.go:null;});
  ok(back==='sMenu','back (last visible data-go on the run screen) → home');
  // 9) reload keeps a run in progress
  await E(()=>{const P=window.__PH;P.runNew();P.save.run.cur.ups={pow:1};P.persist();});
  await page.reload({waitUntil:'load'});await wait(2800);
  I=await E(()=>window.__PH.runCur());ok(I&&I.st===1&&I.ups.pow===1&&(I.mod===null||typeof I.mod==='string'),'reload: the run in progress survives '+JSON.stringify(I));
  ok(logs.filter(l=>!/ERR_FAILED|favicon/.test(l)).length===0,'no page errors '+logs.slice(0,3).join(' | '));
  console.log('TOTAL v49run '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})();
