// v18 screenshots: the new species screens only. usage: node v18shots.js <pc|tall|wide> <lang> [prefix]   (ONLY=a,b limits the shots)
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
const SAVE=JSON.stringify({v:10,news18:true,points:1840,types:['basic','fast','strong','defense','king','little'],type:'king',squad:['strong','defense',null],lv:{fast:6,strong:3,basic:2,defense:1},
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
  await page.evaluate(()=>document.fonts.ready);
  const E=(f,...a)=>page.evaluate(f,...a);
  const R3=on=>E(on=>{const R=window.__PH.renderer;if(!R.__r)R.__r=R.render;R.render=on?R.__r:function(){};return on?new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))):null;},on);
  await R3(false);
  const ONLY=(process.env.ONLY||'').split(',').filter(Boolean);
  const shot=async n=>{if(ONLY.length&&!ONLY.includes(n))return;await wait(300);await E(()=>{try{document.getAnimations().forEach(a=>{try{if(a.effect&&a.effect.getTiming().iterations!==Infinity)a.finish()}catch(e){}})}catch(e){}});
    await R3(true);const t=Date.now();await page.screenshot({path:path.join(__dirname,'shots/'+pre+'_'+lang+'_'+mode+'_'+n+'.jpg'),type:'jpeg',quality:80,optimizeForSpeed:true});await R3(false);console.log('shot '+n+' '+(Date.now()-t)+'ms');};
  const go=async id=>{await E(id=>{const b=document.createElement('button');b.dataset.go=id;document.body.appendChild(b);b.click();b.remove();},id);await wait(500);};
  await E(()=>{const P=window.__PH;P.save.news18=false;P.G.ui='sMenu';return P.news18Popup();});await wait(700);await shot('21_news');
  await E(()=>{document.getElementById('cardDlg').classList.remove('on');});await wait(200);
  await go('sScout');await E(()=>{const b=document.querySelector('#scTabs [data-t="dex"]');b&&b.click();});await wait(500);await shot('05_dex');
  await E(()=>{const b=document.querySelector('#scBody .dx-c[data-card="royal"]');if(b)b.scrollIntoView({block:'center'});});await wait(300);await shot('05_dex_new');
  await E(()=>{__PH.openCard('king');});await wait(600);await shot('05c_card_new');await E(()=>{const b=document.querySelector('[data-cd="close"]');b&&b.click();});await wait(300);
  await E(()=>{__PH.openCard('royal');});await wait(600);await shot('05d_card_locked');await E(()=>{const b=document.querySelector('[data-cd="close"]');b&&b.click();});await wait(300);
  await E(()=>{const b=document.querySelector('#scTabs [data-t="pull"]');b&&b.click();});await wait(400);await E(()=>{const d=document.querySelector('#scBody details.odds');if(d){d.open=true;d.scrollIntoView({block:'start'});}});await wait(300);await shot('05_odds');
  await go('sSquad');await wait(300);await shot('06_squad');await E(()=>{const p=document.querySelector('#sSquad .pbody')||document.querySelector('.sqp');if(p)p.scrollTop=9999;});await wait(300);await shot('06_squad_b');
  await go('sSelect');await shot('06s_select');
  await go('sGoals');await E(()=>{const b=document.querySelector('#gTabs [data-t="ach"]');b&&b.click();});await wait(400);await E(()=>{const r=[...document.querySelectorAll('#sGoals *')].find(e=>/📖/.test(e.textContent)&&e.children.length<4);if(r)r.scrollIntoView({block:'center'});});await wait(300);await shot('10_ach');
  await E(()=>{const P=window.__PH;P.G.tour={round:2,champPaid:false};P.launch('tour');});await wait(600);await shot('13_tour_final');
  await E(()=>{const P=window.__PH;P.save.type='little';P.save.squad=['king','galapagos',null];P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'QUICK MATCH',cond:null,oppTypes:['african','macaroni','royal']});for(let i=0;i<220;i++)P.step(1/60);
    const G=P.G,me=G.player;P.useSpecial(me);for(let i=0;i<14;i++)P.step(1/60);});await shot('14_skill_hop');
  await E(()=>{const P=window.__PH,G=P.G,k=G.mine.skaters.find(p=>p.type==='king');if(k){k.cd.special=0;P.useSpecial(k);}for(let i=0;i<10;i++)P.step(1/60);});await shot('14b_skill_trumpet');
  console.log(mode+' '+lang+' done '+(logs.filter(x=>!/Failed to load resource|net::ERR/.test(x)).join(' | ')||'no page errors'));
  await browser.close();
})().catch(e=>{console.error('FAIL',mode,lang,e.message);process.exit(1)});
