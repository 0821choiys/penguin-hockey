// screenshots of the card screens (squad, scout tabs, card detail).  usage: node cardshot.js <pc|tall|wide> [lang] [tag]  → shots/cards/<tag>_<mode>_*.jpg
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'tall',lang=process.argv[3]||'ko',TAG=process.argv[4]||'now';
const VP={wideS:{width:740,height:360,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1},pc:{width:1000,height:620},
  tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:['basic','fast','strong','defense','balanced','king','macaroni','royal','fiordland','yelloweye','little','african'],type:'strong',lv:{basic:3,king:7,macaroni:5,royal:9},tut:{done:true,asked:true},hat:'none',rl:{intro:1},
  set:{quality:'ultra',cond:false,events:false,items:false,rules:'off',cine:'off',tod:'day',lang}});
const OUT=path.join(__dirname,'shots','cards');fs.mkdirSync(OUT,{recursive:true});
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
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});
  await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('seeded','1');}let seed=4242;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};},SAVE);
  const URL='file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang;
  await page.goto(URL,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{window.requestAnimationFrame=()=>0;});
  const shot=async n=>{await E(()=>{const P=window.__PH;try{P.gfxRender?P.gfxRender():P.renderer.render(P.scene,P.camera);}catch(e){}});await wait(150);await page.screenshot({path:path.join(OUT,TAG+'_'+mode+'_'+n+'.jpg'),type:'jpeg',quality:80});};
  const cdp=await page.createCDPSession();
  const tp=(type,x,y,id)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:id||1}]});
  const tap=async(x,y)=>{if(VP.hasTouch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);};
  const rect=sel=>E(s=>{const e=document.querySelector(s);if(!e)return null;if(e.closest&&e.closest('#ctlEdPanel'))e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,vis:getComputedStyle(e).display!=='none'&&r.width>0};},sel);
  const steps=n=>E(k=>{for(let i=0;i<k;i++)window.__PH.step(1/60);},n);
  // card screens: squad, scout (pull / collection tabs), card detail for a few species
  await E(()=>window.__PH.goScreen('sSquad'));await wait(500);await shot('squad');
  await E(()=>window.__PH.goScreen('sScout'));await wait(500);await shot('scout');
  const tabs=await E(()=>[...document.querySelectorAll('#scTabs button')].map(b=>b.textContent.trim()));
  for(let i=1;i<tabs.length;i++){await E(n=>{document.querySelectorAll('#scTabs button')[n].click();},i);await wait(450);await shot('scout_tab'+i);}
  for(const k of(process.env.KEYS||'basic,king,macaroni,royal').split(',')){await E(key=>{window.__PH.openCard(key);},k);await wait(500);await shot('card_'+k);await E(()=>{const d=document.getElementById('cardDlg');if(d){const b=d.querySelector('button[data-close],.btn');if(d.close)try{d.close();}catch(e){}d.classList.remove('on');}});}
  console.log('tabs',JSON.stringify(tabs),'errors',logs.length,logs.slice(0,3).join(' | '));
  await browser.close();process.exit(0);
})().catch(e=>{console.log('CRASH',e);process.exit(1);});
