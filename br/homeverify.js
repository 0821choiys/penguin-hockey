// Functional check of every home-screen button and the scout centre, using real pointer input (mouse on PC, touch on phones).
// Each control is scrolled into view, hit-tested (nothing may cover its centre), clicked/tapped, and its effect is checked.
// usage: node homeverify.js <pc|tall|wide> [html]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',html=process.argv[3]||'../penguin-hockey-improved.html';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const touch=mode!=='pc';
const FS=path.resolve('node_modules/@fontsource');
const fontCss=()=>['jua/index.css','fredoka/500.css','fredoka/700.css'].map(f=>{const pkg=f.split('/')[0];return fs.readFileSync(path.join(FS,f),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');
const SAVE=JSON.stringify({v:10,news18:true,points:2400,types:['basic','fast','strong','defense'],type:'fast',squad:['strong','defense',null],lv:{fast:6,strong:3,basic:2,defense:1},
  cards:{basic:[6,1,0,0],fast:[2,1,0,0],strong:[1,0,1,0],defense:[2,0,0,0],balanced:[0,0,0,0],auk:[0,0,0,0]},stats:{played:24,wins:14,goals:61,tourClears:1},cleared:{c1:true,c3:true,tour:true},
  xp:{fast:420,strong:120},tut:{done:true,asked:true},mgr:{r:1460,games:22,w:13,d:2,l:7,best:1500,form:['W','W','L','W','D'],hist:[]},profile:{name:'펭귄 감독',club:'남극 FC',emb:'🐧',city:'부산',since:1,seed:7}});
let pass=0,fail=0;const res=[];const ok=(c,m)=>{if(c)pass++;else fail++;res.push((c?'PASS ':'FAIL ')+m);console.log((c?'PASS ':'FAIL ')+m);};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss()});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(s=>localStorage.setItem('penguinHockey.v1',s),SAVE);
  await page.goto('file://'+path.resolve(html),{waitUntil:'load',timeout:90000});await wait(2600);await page.evaluate(()=>document.fonts.ready);
  const E=(f,...a)=>page.evaluate(f,...a);
  const settle=async(ms=450)=>{await wait(ms);await E(()=>{try{document.getAnimations().forEach(a=>{try{if(a.effect&&a.effect.getTiming().iterations!==Infinity)a.finish()}catch(e){}})}catch(e){}});};
  const ui=()=>E(()=>window.__PH.G.ui);
  // real pointer press on an element: scroll into view, check nothing covers its centre, then click/tap it
  const press=async(sel,label)=>{
    const h=await page.$(sel);if(!h){ok(false,label+': control not found ('+sel+')');return false;}
    const info=await h.evaluate(e=>{e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,t=document.elementFromPoint(x,y);
      return {w:Math.round(r.width),h:Math.round(r.height),cover:t&&(t===e||e.contains(t))?'':(t?(t.id?'#'+t.id:t.className||t.tagName):'nothing')};});
    await wait(120);
    if(info.cover){ok(false,label+': covered by '+info.cover);return false;}
    try{if(touch)await h.tap();else await h.click();}catch(e){ok(false,label+': '+e.message);return false;}
    await settle();return info;};
  const size=(info,label)=>{if(info)ok(info.w>=44&&info.h>=44,label+' touch target '+info.w+'x'+info.h+(info.w>=44&&info.h>=44?'':' (< 44 px)'));};
  // ---------- home ----------
  const nav=[['sScout','스카우트'],['sSquad','팀 편성'],['sGoals','목표'],['sProfile','프로필'],['sHow','게임 방법'],['sSet','설정']];
  const tiles=[['[data-go="sRanked"]','sRanked','티어 게임'],['[data-go="sMarket"]','sMarket','이적시장'],['.hm-cta [data-go="sMode"],#sMenu [data-go="sMode"]','sMode','모든 경기 모드'],
    ['#menuRank','sProfile','구단·순위 칩'],['#menuGoals','sGoals','오늘의 목표']];
  const back=async(scr,label)=>{const sel='#'+scr+' [data-go="sMenu"]';const i=await press(sel,label+' → 돌아가기');size(i,label+' 돌아가기 버튼');ok(await ui()==='sMenu',label+': back button returns to the home screen');};
  for(const [sel,scr,label] of tiles){if(!await E(s=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden';},sel)){console.log('SKIP '+label+' (hidden in this layout)');continue;}const i=await press(sel,label);if(!i)continue;size(i,label);ok(await ui()===scr,label+' opens '+scr+' (now '+await ui()+')');if(await ui()===scr)await back(scr,label);else await E(()=>{const b=document.createElement('button');b.dataset.go='sMenu';document.body.appendChild(b);b.click();b.remove();});}
  for(const [scr,label] of nav){const i=await press('.dock [data-go="'+scr+'"]','하단 메뉴 '+label);if(!i)continue;size(i,'하단 메뉴 '+label);ok(await ui()===scr,'하단 메뉴 '+label+' opens '+scr+' (now '+await ui()+')');if(await ui()===scr)await back(scr,'하단 메뉴 '+label);}
  // keyboard: every home control is reachable with Tab and shows a focus ring; Enter activates
  {const stops=await E(()=>{const out=[];document.activeElement&&document.activeElement.blur();return out;});
    const seen=[];for(let i=0;i<24;i++){await page.keyboard.press('Tab');const f=await E(()=>{const a=document.activeElement;if(!a||a===document.body)return null;const cs=getComputedStyle(a);return {t:(a.innerText||a.id||a.tagName).trim().replace(/\s+/g,' ').slice(0,18),ring:cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>0||cs.boxShadow!=='none',home:!!a.closest('#sMenu,#menuRank,#menuGoals')};});if(!f)continue;if(f.home)seen.push(f);}
    const names=[...new Set(seen.map(f=>f.t))];ok(names.length>=11,'keyboard reaches '+names.length+' home controls with Tab');ok(seen.every(f=>f.ring),'every focused home control shows a visible focus ring');
    await E(()=>document.querySelector('#sMenu [data-go="sMode"]').focus());await page.keyboard.press('Enter');await settle();ok(await ui()==='sMode','Enter on 모든 경기 모드 opens the mode list');
    await E(()=>{const b=document.createElement('button');b.dataset.go='sMenu';document.body.appendChild(b);b.click();b.remove();});await settle();}
  // quick match: starts a match, pause → main menu comes back
  {const i=await press('[data-mode="quick"]','빠른 경기');size(i,'빠른 경기');await wait(600);
    const g=await E(()=>({v:window.__PH.G.view,m:window.__PH.G.cfg&&window.__PH.G.cfg.mode}));ok(g.v==='game'&&g.m==='quick','빠른 경기 starts a quick match ('+g.v+'/'+g.m+')');
    await E(()=>{const P=window.__PH;for(let k=0;k<120;k++)P.step(1/60);});
    await press('#bPause','일시정지');ok(await ui()==='sPause','pause opens the pause board');
    await press('#pQuit','메인 메뉴');await wait(400);ok(await ui()==='sMenu'&&await E(()=>window.__PH.G.view)==='menu','메인 메뉴 from pause returns home');}
  // ---------- scout centre ----------
  await press('.dock [data-go="sScout"]','스카우트');
  for(const t of['pull','enh','fuse','dex']){const i=await press('#scTabs [data-t="'+t+'"]','스카우트 탭 '+t);size(i,'스카우트 탭 '+t);ok(await E(()=>document.querySelector('#scTabs .on')&&document.querySelector('#scTabs .on').dataset.t)===t,'tab '+t+' becomes active');}
  await press('#scTabs [data-t="pull"]','뽑기 탭');
  const closeFx=async()=>{for(let k=0;k<40;k++){const st=await E(()=>({pk:document.getElementById('packFx').classList.contains('on'),fz:document.getElementById('fuseFx').classList.contains('on'),ef:document.getElementById('enhFx').classList.contains('on')}));
      if(!st.pk&&!st.fz&&!st.ef)return true;
      await E(()=>{const vis=e=>e&&e.offsetParent!==null&&getComputedStyle(e).display!=='none';for(const id of['pkSkip','fzSkip']){const b=document.getElementById(id);if(vis(b))b.click();}
        for(const id of['pkOk','fzOk']){const b=document.getElementById(id);if(vis(b))b.click();}const eb=document.querySelector('#enhFx.on .ef-box button');if(eb)eb.click();});await wait(350);}return false;};
  {const before=await E(()=>({p:window.__PH.save.points,n:window.__PH.save.scout.pulls}));const i=await press('[data-act="pull1"]','무료 1회');size(i,'무료 1회 뽑기');
    await wait(400);ok(await E(()=>document.getElementById('packFx').classList.contains('on')),'무료 1회 plays the capsule opening');ok(await closeFx(),'opening can be skipped and closed');
    const after=await E(()=>({p:window.__PH.save.points,n:window.__PH.save.scout.pulls}));ok(after.n===before.n+1&&after.p===before.p,'free pull adds 1 card without spending points ('+before.p+'P→'+after.p+'P)');}
  {const snapA=()=>E(()=>({p:window.__PH.save.points,n:window.__PH.save.scout.pulls,a:Object.keys(window.__PH.save.ach||{})}));
    const before=await snapA();const i=await press('[data-act="pull10"]','10회 뽑기');size(i,'10회 뽑기');await wait(400);ok(await closeFx(),'10-pull opening can be skipped and closed');
    const after=await snapA();const gained=await E(ks=>{const A=window.__PH.ACH||[];return ks.reduce((s,k)=>{const d=A.find(x=>x.id===k);return s+(d&&d.pts||0);},0);},after.a.filter(k=>!before.a.includes(k)));
    ok(after.n===before.n+10&&before.p-after.p===360-gained,'10회 뽑기 adds 10 cards for 360P ('+before.p+'P→'+after.p+'P'+(gained?', +'+gained+'P from achievements unlocked by the new cards':'')+')');}
  {const f0=await E(()=>!!window.__PH.save.set.fastFx);const i=await press('label.gb-tog','빠른 연출');size(i,'빠른 연출 스위치(라벨 전체)');ok(await E(()=>!!window.__PH.save.set.fastFx)!==f0,'빠른 연출 toggles the setting');await press('label.gb-tog','빠른 연출 (되돌리기)');}
  {const i=await press('#scBody details.odds>summary','확률 정보');size(i,'확률 정보');ok(await E(()=>document.querySelector('#scBody details.odds').open),'확률 정보 expands the full odds table');}
  // enhance
  await press('#scTabs [data-t="enh"]','강화 탭');
  {const chips=await page.$$('#scBody [data-act="ensel"]');ok(chips.length>=2,'enhance lists '+chips.length+' penguins');
    const i=await press('#scBody [data-act="ensel"]:not(.on)','강화 대상 선택');size(i,'강화 대상 칩');
    // v21: every penguin has one rarity, so there is a single material button (no grade picker / auto pick any more)
    const i2=await press('#scBody [data-act="eng"]','재료 카드');size(i2,'재료 카드 버튼');
    const b=await E(()=>({p:window.__PH.save.points,lv:JSON.stringify(window.__PH.save.lv)}));const i4=await press('#scBody [data-act="enh"]','강화하기');size(i4,'강화하기');await wait(500);
    const fx=await E(()=>document.getElementById('enhFx').classList.contains('on'));ok(await closeFx(),'enhance result can be closed');
    const a=await E(()=>({p:window.__PH.save.points,lv:JSON.stringify(window.__PH.save.lv)}));ok(fx&&a.p<b.p,'강화하기 spends points and shows the result ('+b.p+'P→'+a.p+'P)');}
  // fuse
  await press('#scTabs [data-t="fuse"]','합성 탭');
  {const i=await press('#scBody [data-act="fzg"]','합성 등급');size(i,'합성 등급 버튼');
    const i2=await press('#scBody [data-act="fzadd"]','재료 카드 넣기');size(i2,'재료 카드');ok(await E(()=>window.__PH.fz?window.__PH.fz.sel.length:document.querySelectorAll('#scBody .fz-slot.on,#scBody .fz-slot .pc').length)>=1,'tapping a card puts it into a slot');
    const i3=await press('#scBody [data-act="fzauto"]','합성 자동 선택');size(i3,'합성 자동 선택');
    const b=await E(()=>window.__PH.save.points);const i4=await press('#scBody [data-act="fzgo"]','합성하기');size(i4,'합성하기');await wait(500);
    ok(await E(()=>document.getElementById('fuseFx').classList.contains('on')),'합성하기 plays the fusion');ok(await closeFx(),'fusion can be skipped and closed');ok(await E(()=>window.__PH.save.points)<b,'fusion spent points');}
  // dex
  await press('#scTabs [data-t="dex"]','도감 탭');
  {for(const s of['lv','name','ovr']){const i=await press('#scBody [data-act="dxs"][data-s="'+s+'"],#scBody [data-act="dxs"]:not(.on)','도감 정렬');size(i,'도감 정렬 버튼');}
    const i=await press('#scBody [data-act="dxf"]:not(.on)','도감 필터');size(i,'도감 필터 버튼');
    await press('#scBody [data-act="dxf"]','도감 필터 전체');
    const c=await press('#scBody .dx-c','도감 카드');size(c,'도감 카드');ok(await E(()=>document.getElementById('cardDlg').classList.contains('on')),'tapping a dex card opens its details');
    const x=await press('#cardDlg .cd-x','카드 닫기');size(x,'카드 상세 닫기 버튼');ok(await E(()=>!document.getElementById('cardDlg').classList.contains('on')),'card details close');}
  {const i=await press('#sScout [data-go="sMenu"]','스카우트 완료');ok(await ui()==='sMenu','스카우트 완료 returns home');}
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  console.log('TOTAL '+mode+': '+pass+' passed, '+fail+' failed');
  await browser.close();process.exit(0);
})().catch(e=>{console.error('CRASH',e.message);process.exit(1)});
