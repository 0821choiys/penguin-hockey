// v51 🥅 goalie draw + 내 포지션 in a real browser: the 🐧/🥅 switch on the 뽑기 tab, odds on screen = code, a free draw and a 10-draw (reveal,
// back to the collection, equip), the goalie card on the 팀 편성 board + the picker, 내 포지션 (1 a side locked, 수비 moves the captain's card,
// 골키퍼 lit), then a match in net: you are the goalie, Dash / Switch hidden, Shoot reads 다이브 / 걷어내기, the gauge shows the goalie skill,
// the camera keeps the goalie on screen, a shot at the net slows the game and puts a ring on the goal line; layout + translation.
// usage: node v51gk.js <pc|tall|wide|wideS> [lang]   → shots/gk/<mode>_<lang>_*.jpg
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
const SAVE=JSON.stringify({v:10,news18:true,gfx19:true,points:2000,types:['basic','fast','strong','king','defense'],type:'strong',squad:['fast','defense'],tut:{done:true,asked:true},hat:'none',rl:{intro:1},
  set:{quality:'low',size:3,cond:false,events:false,items:false,rules:'off',cine:'off',masc:'off',tod:'day',lang}});
const OUT=path.join(__dirname,'shots','gk');fs.mkdirSync(OUT,{recursive:true});
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
const HANGUL=/[가-힣]/;
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP,protocolTimeout:900000});
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
  const tap=async(sel)=>{const b=await page.$(sel);if(!b)throw new Error('no '+sel);await b.evaluate(e=>e.scrollIntoView({block:'center'}));await wait(120);const q=await b.boundingBox();
    if(VP.hasTouch)await page.touchscreen.tap(q.x+q.width/2,q.y+q.height/2);else await page.mouse.click(q.x+q.width/2,q.y+q.height/2);await wait(250);};
  const shot=async n=>{await page.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:82});};
  const spill=sel=>E(sel=>{const P=document.querySelector(sel);if(!P)return ['no panel'];const R=P.getBoundingClientRect(),out=[];
    P.querySelectorAll('button,small,b,span,.pc,.gk-t').forEach(e=>{if(!e.offsetParent)return;const q=e.getBoundingClientRect();if(q.width<1)return;
      if(q.left<R.left-2||q.right>R.right+2)out.push((e.className||e.tagName)+':'+(e.textContent||'').trim().slice(0,20));
      if((e.tagName==='BUTTON')&&e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).whiteSpace==='nowrap')out.push('cut:'+(e.textContent||'').trim().slice(0,20));});return out.slice(0,6);},sel);
  // ---- 1) the 뽑기 tab: 🐧 / 🥅 ----
  await E(()=>{window.__PH.goScreen('sScout');});await wait(500);
  ok(await E(()=>!!document.querySelector('#scBody .gk-kind [data-k="g"]')),'뽑기 tab has the 🐧 펭귄 / 🥅 골키퍼 switch');
  await tap('#scBody .gk-kind [data-k="g"]');await wait(600);
  const v=await E(()=>{const P=window.__PH,b=document.querySelector('#scBody');const box=b.querySelector('.gk-odds');if(box)box.open=true;
    const t=b.innerText.replace(/\s+/g,' '),pc=x=>(Math.round(x*100)/100).toFixed(2)+'%',ids=Object.keys(P.GKC),e=P.gkEff();
    return {tiles:b.querySelectorAll('.gk-t').length,btn:[...b.querySelectorAll('[data-act="gk1"],[data-act="gk10"]')].map(x=>x.innerText.replace(/\s+/g,' ')),
      odds:ids.every(k=>t.includes(pc(P.GKD.odds[P.GKC[k].g]/ids.filter(x=>P.GKC[x].g===P.GKC[k].g).length)))&&e.every(x=>t.includes(pc(x))),
      grade:P.GKD.odds.every(x=>t.includes(x+'%')),free:P.gkFreeReady(),t};});
  ok(v.tiles===10&&v.btn.length===2,'🥅 side: 10 goalies in the collection, 1회 / 10회 buttons ('+v.btn.join(' | ')+')');
  ok(v.odds&&v.grade,'the odds box on screen = the code (every goalie’s chance, the grade odds, the long-run rates)');
  ok(v.free&&/🎁/.test(v.btn[0]),'today’s free draw is offered');
  if(lang!=='ko'){const h=(v.t.match(/[가-힣]+/g)||[]);ok(h.length===0,'['+lang+'] 🥅 side translated'+(h.length?' — Korean left: '+h.slice(0,6).join(' '):''));}
  let sp=await spill('#sScout .panel');ok(sp.length===0,'nothing spills out of the scout panel '+sp.join(' | '));
  await E(()=>{const b=document.querySelector('#scBody .gk-odds');if(b)b.open=false;document.querySelector('#scBody').scrollTop=0;});await wait(800);await shot('draw');
  // a free draw → reveal
  await tap('#scBody [data-act="gk1"]');await wait(900);
  let r=await E(()=>{const f=document.querySelector('#gkFx');return {on:!!f&&f.classList.contains('on'),n:f?f.querySelectorAll('.gk-fxc').length:0,pts:window.__PH.save.points,eq:window.__PH.gkEq()};});
  ok(r.on&&r.n===1&&r.pts===2000&&r.eq,'free draw: the reveal shows one goalie, no points taken, it is equipped ('+r.eq+')');
  await E(()=>document.getAnimations().forEach(a=>{try{a.finish();}catch(e){}}));await wait(700);await shot('reveal1');
  await tap('#gkOk');await wait(400);
  await tap('#scBody [data-act="gk10"]');await wait(1200);
  r=await E(()=>{const f=document.querySelector('#gkFx'),P=window.__PH;return {on:f.classList.contains('on'),n:f.querySelectorAll('.gk-fxc').length,pts:P.save.points,own:P.gkIds().filter(P.gkHas).length,
    inView:[...f.querySelectorAll('.gk-fxc')].every(e=>{const q=e.getBoundingClientRect();return q.left>=0&&q.right<=innerWidth+1;})};});
  ok(r.on&&r.n===10&&r.pts===2000-360&&r.inView,'10 draws: ten cards, 360P taken, every card inside the screen (owned now '+r.own+')');
  await E(()=>document.getAnimations().forEach(a=>{try{a.finish();}catch(e){}}));await wait(1500);await shot('reveal10');
  await tap('#gkOk');await wait(500);
  // equip the best one from the detail panel
  r=await E(()=>{const P=window.__PH,best=P.gkIds().filter(P.gkHas).sort((a,b)=>P.GKC[b].g-P.GKC[a].g)[0];return best;});
  await tap('#scBody .gk-t[data-k="'+r+'"]');await wait(400);
  const eqb=await page.$('#scBody [data-act="gkeq"]');if(eqb){await tap('#scBody [data-act="gkeq"]');await wait(400);}
  ok(await E(k=>window.__PH.gkEq()===k,r),'pick a goalie in the collection → 장착 ('+r+')');
  await wait(1500);await shot('collection');
  // ---- 2) 팀 편성: the goalie on the board, 내 포지션 ----
  await E(()=>{window.__PH.goScreen('sSquad');});await wait(900);
  const sq=()=>E(()=>{const b=document.querySelector('#sqBoard'),B=b.getBoundingClientRect(),g=b.querySelector('.sq-gkc'),G_=g&&g.getBoundingClientRect(),P=window.__PH;
    const slots=[...b.querySelectorAll('.sq-slot')].map(e=>{const q=e.getBoundingClientRect();return {l:q.left,r:q.right,t:q.top,b:q.bottom,x:parseFloat(e.style.left),role:(e.querySelector('.sq-role')||{}).textContent||''};});
    const ov=G_&&slots.some(s=>!(s.r<=G_.left||s.l>=G_.right||s.b<=G_.top||s.t>=G_.bottom));
    return {pos:[...document.querySelectorAll('#sqPos [data-pos]')].map(x=>x.dataset.pos+(x.classList.contains('on')?'*':'')+(x.disabled?'-':'')),gk:!!g,me:g&&g.classList.contains('me'),
      inside:G_&&G_.left>=B.left-1&&G_.top>=B.top-1&&G_.bottom<=B.bottom+1,ov,slots,note:(document.querySelector('#sqPos small')||{}).textContent||'',row:document.querySelector('#sqPos').innerText};});
  let s=await sq();
  ok(s.gk&&s.inside&&!s.ov&&s.pos.join()==='attacker*,mid,defender,gk','3 a side: our goalie card on the board (inside, not over a skater), 내 포지션 공격 · 중앙 · 수비 · 골키퍼 ('+s.pos.join(' ')+')');
  if(lang!=='ko')ok(!HANGUL.test(s.row),'['+lang+'] 내 포지션 row translated');
  sp=await spill('#sSquad .panel');ok(sp.length===0,'nothing spills out of the 팀 편성 panel '+sp.join(' | '));
  await shot('squad_att');
  await tap('#sqPos [data-pos="defender"]');s=await sq();
  const x0=s.slots[0].x;ok(s.pos.includes('defender*')&&x0<60&&/✓|·|/.test(s.slots[0].role),'수비: the captain’s card moves to the defender spot (x '+x0.toFixed(0)+' %) · “'+s.note+'”');
  await tap('#sqPos [data-pos="gk"]');s=await sq();ok(s.pos.includes('gk*')&&s.me,'골키퍼: chosen, our goalie card marked as you · “'+s.note+'”');
  await shot('squad_gk');
  await tap('#sqBoard .sq-gkc');await wait(500);
  r=await E(()=>{const d=document.querySelector('#gkDlg');return {on:d&&d.classList.contains('on'),n:d?d.querySelectorAll('[data-gkp]').length:0};});
  ok(r.on&&r.n>=1,'tap our goalie → the goalie picker ('+r.n+' owned)');await wait(1200);await shot('picker');
  await tap('#gkDlgOk');await wait(300);
  await tap('#sqSize [data-n="1"]');s=await sq();ok(s.pos.join()==='attacker*,mid-,defender-,gk-','1 a side: only 공격 ('+s.pos.join(' ')+')');
  await tap('#sqSize [data-n="3"]');
  // ---- 3) a match in net ----
  const m=await E(()=>{const P=window.__PH,G=P.G;window.requestAnimationFrame=()=>0;
    P.startMatch({mode:'quick',size:3,time:180,diff:'normal',oppTypes:['basic','fast','king'],tag:'QUICK MATCH',oppName:'R',label:'R'});for(let i=0;i<220;i++)P.step(1/60);G.state='play';for(let i=0;i<30;i++)P.step(1/60);
    const vis=id=>{const e=document.querySelector(id);return !!e&&getComputedStyle(e).display!=='none'&&e.offsetParent!==null;};
    const g=G.mine.goalie,pk=G.puck;pk.x=-G.mine.dir*9;pk.z=2;pk.vx=pk.vz=0;for(let i=0;i<90;i++){P.step(1/60);pk.x=-G.mine.dir*9;pk.z=2;pk.vx=pk.vz=0;}P.gfxRender();
    const v=new THREE.Vector3(g.rx,1,g.rz);v.project(P.camera);
    return {gk:G.player===g,cls:document.body.classList.contains('gk-mode'),dash:vis('#tbDash'),swap:vis('#tbSwap'),shoot:(document.querySelector('#tbShoot')||{}).textContent||'',
      gauge:(document.querySelector('#gaugeT')||{}).textContent||'',want:P.gkSpName(g),onScr:v.x>-1&&v.x<1&&v.y>-1&&v.y<1,tip:!!document.querySelector('#gkTip'),touch:document.body.classList.contains('touch')};});
  ok(m.gk&&m.cls,'quick match with 골키퍼: you control our goalie');
  if(m.touch)ok(!m.dash&&!m.swap&&m.shoot.trim().length>0,'touch buttons: Dash and Switch hidden, Shoot reads “'+m.shoot.trim()+'”');
  ok(m.onScr,'puck in our half: the camera keeps the goalie on screen');
  ok(m.tip,'first match in net: the how-to tip shows');
  await shot('match');
  // a shot at our net: slow-down + the ring on the goal line
  const sh=await E(()=>{const P=window.__PH,G=P.G,pk=G.puck,d=G.mine.dir;const t=document.querySelector('#gkTip');if(t)t.remove();
    G.slow=null;pk.x=-d*11;pk.z=-.5;pk.vx=-d*22;pk.vz=1.2;pk.lastTeam=G.mine.opp;pk.last=G.mine.opp.skaters[0];pk.lastT=G.t+1;P.step(1/60);
    return {slow:!!(G.slow&&G.slow.t>0),s:G.slow?G.slow.s:0,ring:!!(P.GKM.m&&P.GKM.m.visible)};});
  ok(sh.slow&&sh.ring,'a shot at your net: the game slows (×'+sh.s.toFixed(2)+') and a ring marks where it is going');
  await shot('shot');
  const lb=await E(()=>{const P=window.__PH,G=P.G,g=G.mine.goalie,pk=G.puck;pk.vx=pk.vz=0;pk.x=g.x+G.mine.dir*1;pk.z=g.z;G.carry=null;P.step(1/60);P.step(1/60);return (document.querySelector('#tbShoot')||{}).textContent||'';});
  if(m.touch)ok(lb.trim()!==m.shoot.trim(),'puck at the goalie’s stick: Shoot now reads “'+lb.trim()+'”');
  await E(()=>{const P=window.__PH;P.save.set.pos='attacker';P.persist();P.toMenu();});await wait(400);
  ok(await E(()=>!document.body.classList.contains('gk-mode')),'back on the menu: the goalie mode is off');
  ok(logs.filter(l=>!/ERR_FAILED|favicon/.test(l)).length===0,'no page errors '+logs.slice(0,3).join(' | '));
  console.log('TOTAL v51gk '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
