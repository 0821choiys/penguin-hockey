// v17 interactions with real mouse / touch input: settings row, condition chip, pause note, season line, season-end summary. usage: node v17ui.js <pc|tall|wide> <lang>
// usage: node i18nscan.js <pc|tall|wide> <ko|en|zh|ja> [prefix]   (SHOTS=1 also saves screenshots)
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',lang=process.argv[3]||'en',pre=process.argv[4]||'i18n';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];
  if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const now=Date.now();
// a save written in Korean: default coach/club names, a national-trials run with generated opponents, rating history labels
const SAVE=JSON.stringify({v:10,news18:true,points:1840,types:['basic','fast','strong','defense'],type:'fast',squad:['strong','defense',null],lv:{fast:6,strong:3,basic:2,defense:1},
  cards:{basic:[3,1,0,0],fast:[2,1,0,0],strong:[1,0,1,0],defense:[2,0,0,0],balanced:[0,0,0,0],auk:[0,0,0,0]},stats:{played:24,wins:14,goals:61,tourClears:1},cleared:{c1:true,c3:true,tour:true},
  xp:{fast:420,strong:120},tut:{done:true,asked:true},
  mgr:{r:1460,games:22,w:13,d:2,l:7,best:1500,form:['W','W','L','W','D'],hist:[{d:14,r:1460,l:'랭크 경기 vs 냉철한 곰 77',ts:now-3600e3},{d:-9,r:1446,l:'시대회 선발전 8강',ts:now-7200e3},{d:-12,r:1455,l:'기권 · 티어 게임',ts:now-9e6}]},
  profile:{name:'펭귄 감독',club:'펭귄 FC',emb:'🐧',city:'부산',since:1,seed:7},
  trial:{day:0,used:{city:1,nat:1},titles:{city:1,nat:0},first:{city:true,nat:false},cityName:'부산',run:{kind:'nat',round:1,opp:['대구 대표 · 대구 타이거즈','광주 대표 · 광주 킹스','인천 대표 · 인천 스톰','수원 대표 (우승 후보) · 수원 이글스'],city:'부산'}}});
const scanSrc=(()=>{const t=fs.readFileSync(path.join(__dirname,'tools/mkovf.py'),'utf8');let s=t.slice(t.indexOf("scan=r'''")+9,t.indexOf("'''",t.indexOf("scan=r'''")+9));
  // Chinese/Japanese wrap between characters by design: only a break inside a Latin word or number counts
  if(lang==='zh'||lang==='ja')s=s.replace('!/[\\s·,\\/\\-(→]/.test(prevCh)&&!/[\\s→]/.test(n.data[i])','/[A-Za-z0-9]/.test(prevCh)&&/[A-Za-z0-9]/.test(n.data[i])');
  // a modal (dialog / pull / dev reveal / welcome card) covers the page: only overlaps inside the same layer count
  s=s.replace('if(a.contains(b)||b.contains(a))continue;','if(a.contains(b)||b.contains(a))continue;const LY="[role=dialog],.fx,#tutAsk,#devFx,.cdlg,.efx";if(a.closest(LY)!==b.closest(LY))continue;');
  return s;})();
if((lang==='zh'||lang==='ja')&&scanSrc.indexOf('/[A-Za-z0-9]/.test(prevCh)')<0)throw new Error('midBreak patch failed');
const HAN=`window.__han=()=>{const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  const vis=p=>{const r=p.getBoundingClientRect();if(!(r.width>0&&r.height>0))return false;let x=p;while(x&&x!==document.documentElement){const cs=getComputedStyle(x);if(cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity)<0.05)return false;x=x.parentElement;}return true;};
  while((n=w.nextNode())){const p=n.parentElement;if(!p||/^(SCRIPT|STYLE)$/.test(p.tagName)||!/[가-힣]/.test(n.data))continue;if(n.data.trim()==='한국어'&&p.closest('.set-lang'))continue;out.push((vis(p)?'VISIBLE ':'hidden ')+p.tagName.toLowerCase()+(p.id?'#'+p.id:'')+(p.className&&typeof p.className==='string'?'.'+p.className.split(' ')[0]:'')+' "'+n.data.trim().slice(0,70)+'"');}
  for(const a of ['aria-label','title','placeholder','alt'])document.querySelectorAll('['+a+']').forEach(e=>{const v=e.getAttribute(a);if(/[가-힣]/.test(v))out.push('ATTR '+a+' '+e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+' "'+v.slice(0,70)+'"');});
  return [...new Set(out)];};`;
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--lang=en-US'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error')logs.push('CONSOLE '+m.text());});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'node_modules/three/build/three.min.js'))});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('__seeded')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('__seeded','1');}},SAVE);
  const html=path.resolve(__dirname,process.env.HTML||'../penguin-hockey-improved.html');
  await page.goto('file://'+html+'?lang='+lang,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{const R=window.__PH.renderer;R.render=function(){};});   // DOM interactions only: skip the slow software 3D drawing
  const touch=mode!=='pc';
  const press=async sel=>{const el=await page.$(sel);if(!el)return false;await el.evaluate(e=>e.scrollIntoView({block:'center'}));await wait(150);const b=await el.boundingBox();if(!b)return false;
    const x=b.x+b.width/2,y=b.y+b.height/2;const top=await E((x,y)=>{const e=document.elementFromPoint(x,y);return e?(e.id||e.className||e.tagName):'none';},x,y);
    if(touch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);await wait(450);return top;};
  // 1. settings: the 빙판 변수 row switches the condition off and back on
  await E(()=>{const b=document.createElement('button');b.dataset.go='sSet';document.body.appendChild(b);b.click();b.remove();});await wait(500);
  const rowIdx=await E(()=>{const lbl=window.__PH.SETDEF.find(d=>d.k==='cond').label;return [...document.querySelectorAll('#setList .setrow')].findIndex(r=>r.firstChild.textContent===lbl);});
  ok(rowIdx>0,'settings has the rink-condition row ('+rowIdx+')');
  await press('#setList .setrow:nth-child('+(rowIdx+1)+') .seg button:nth-child(2)');
  ok(await E(()=>window.__PH.save.set.cond===false&&JSON.parse(localStorage.getItem('penguinHockey.v1')).set.cond===false),'tapping 끄기 turns it off and saves it');
  await E(()=>{const r=Math.random;Math.random=()=>.5;window.__PH.launch('quick');Math.random=r;});await wait(300);
  ok(await E(()=>window.__PH.G.cond===null),'with it off, a quick match has no condition (even on a roll that would give one)');
  await E(()=>window.__PH.toMenu());await E(()=>{const b=document.createElement('button');b.dataset.go='sSet';document.body.appendChild(b);b.click();b.remove();});await wait(400);
  await press('#setList .setrow:nth-child('+(rowIdx+1)+') .seg button:nth-child(1)');
  ok(await E(()=>window.__PH.save.set.cond===true),'tapping 켜기 turns it back on');
  // 2. in a match: the chip is visible and tapping it shows the description
  await E(()=>{window.__PH.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'Q',cond:'night'});for(let i=0;i<240;i++)window.__PH.step(1/60);});await wait(300);
  const chip=await E(()=>{const c=document.getElementById('condTag'),r=c.getBoundingClientRect();return {on:c.classList.contains('on'),txt:c.textContent,w:r.width,h:r.height,in:r.left>=0&&r.right<=innerWidth&&r.top>=0};});
  ok(chip.on&&chip.in&&chip.h>=30&&/🌙/.test(chip.txt),'condition chip shown on screen ('+chip.txt+', '+Math.round(chip.w)+'×'+Math.round(chip.h)+')');
  const hit=await press('#condTag');
  ok(hit==='condTag'&&await E(()=>document.getElementById('toast').classList.contains('on')&&/🌙/.test(document.getElementById('toast').textContent)),'tapping the chip shows the description (top element: '+hit+')');
  ok(await E(()=>window.__PH.G.state==='play'&&!window.__PH.G.paused),'… and the match keeps running');
  await E(()=>document.querySelector('#bPause').click());await wait(300);
  ok(await E(()=>{const p=document.getElementById('pauseCond');return p.style.display!=='none'&&p.getBoundingClientRect().height>20&&/🌙/.test(p.textContent);}),'pause screen shows this match’s condition');
  await E(()=>document.querySelector('#pResume').click());await wait(200);
  // 3. tier screen: the season line jumps to the season box
  await E(()=>window.__PH.toMenu());await E(()=>{const b=document.createElement('button');b.dataset.go='sRanked';document.body.appendChild(b);b.click();b.remove();});await wait(600);
  await E(()=>{const b=document.querySelector('#sRanked .pbody');if(b)b.scrollTop=0;});await wait(200);
  const before=await E(()=>document.querySelector('#rkBody .rk-season').getBoundingClientRect().top);
  const hm=await press('.ss-mini');let after=before;for(let i=0;i<20&&after>before-20;i++){await wait(400);after=await E(()=>document.querySelector('#rkBody .rk-season').getBoundingClientRect().top);}   // smooth scroll: slow frames here
  ok(after<before-20,'tapping the season line scrolls to the season box ('+Math.round(before)+' → '+Math.round(after)+', hit '+hm+')');
  await press('#rkBody details.ss-tbl > summary');ok(await E(()=>document.querySelector('#rkBody details.ss-tbl').open),'the reward table opens');
  // 4. home: badge, and the season-end summary with its two buttons
  await E(()=>window.__PH.toMenu());await wait(300);
  {const bb=await E(()=>{const b=document.getElementById('ssBadge'),r=b.getBoundingClientRect(),t=b.closest('.hm-tile').getBoundingClientRect(),cs=getComputedStyle(b);return {txt:b.textContent,disp:cs.display,inside:r.width>10&&r.left>=t.left-.5&&r.right<=t.right+.5&&r.top>=t.top-.5&&r.bottom<=t.bottom+.5,r:[r.left,r.right,t.left,t.right].map(Math.round)};});
   ok(bb.disp!=='none'&&bb.inside,'home: season badge fully inside the tier button ('+bb.txt+' '+bb.r.join(',')+')');}
  await E(()=>{const S=window.__PH.save.season;S.last={n:1,g:12,w:7,d:1,l:4,best:1460,t:3,ok:true,pts:320,card:{k:'strong',g:2,isNew:false},seen:false,r0:1460,r1:1395,quiet:false};window.__PH.seasonPopup();});await wait(500);
  ok(await E(()=>document.getElementById('cardDlg').classList.contains('on')&&!!document.querySelector('#cardDlg .ss-pop')),'season-end summary opens on the home screen');
  ok(await E(()=>window.__PH.save.season.last.seen===true&&JSON.parse(localStorage.getItem('penguinHockey.v1')).season.last.seen===true),'… marked as shown (saved)');
  await press('#cardDlg [data-ss="rk"]');
  ok(await E(()=>!document.getElementById('cardDlg').classList.contains('on')&&window.__PH.G.ui==='sRanked'),'"🏅 티어 게임" closes it and opens the tier screen');
  await E(()=>window.__PH.toMenu());await wait(300);
  await E(()=>{const S=window.__PH.save.season;S.last.seen=false;window.__PH.seasonPopup();});await wait(400);await press('#cardDlg [data-ss="ok"]');
  ok(await E(()=>!document.getElementById('cardDlg').classList.contains('on')&&window.__PH.G.ui==='sMenu'),'"확인" just closes it');
  ok(await E(()=>!window.__PH.seasonPopup()),'it does not show again');
  console.log(mode+' '+lang+' '+(logs.filter(x=>!/Failed to load resource|net::ERR/.test(x)).join(' | ')||'no page errors'));
  console.log('TOTAL: '+pass+' passed, '+fail+' failed');
  await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.error('FAIL',mode,lang,e.message);process.exit(1)});
