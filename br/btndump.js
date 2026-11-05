// Dump every interactive element on the home screen and in the scout centre (per tab): text, size, hit-test result, handler hints.
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',html=process.argv[3]||'../penguin-hockey-improved.html';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const FS=path.resolve('node_modules/@fontsource');
const fontCss=()=>['jua/index.css','fredoka/500.css','fredoka/700.css'].map(f=>{const pkg=f.split('/')[0];return fs.readFileSync(path.join(FS,f),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');
const SAVE=JSON.stringify({v:10,points:1840,types:['basic','fast','strong','defense'],type:'fast',squad:['strong','defense',null],lv:{fast:6,strong:3,basic:2,defense:1},
  cards:{basic:[3,1,0,0],fast:[2,1,0,0],strong:[1,0,1,0],defense:[2,0,0,0],balanced:[0,0,0,0],auk:[0,0,0,0]},stats:{played:24,wins:14,goals:61,tourClears:1},cleared:{c1:true,c3:true,tour:true},
  xp:{fast:420,strong:120},tut:{done:true,asked:true},mgr:{r:1460,games:22,w:13,d:2,l:7,best:1500,form:['W','W','L','W','D'],hist:[]},profile:{name:'펭귄 감독',club:'남극 FC',emb:'🐧',city:'부산',since:1,seed:7}});
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[];page.on('pageerror',e=>logs.push('PAGEERR '+e.message));
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss()});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(s=>localStorage.setItem('penguinHockey.v1',s),SAVE);
  await page.goto('file://'+path.resolve(html),{waitUntil:'load'});await wait(2500);await page.evaluate(()=>document.fonts.ready);
  const dump=async tag=>{await page.evaluate(()=>{try{document.getAnimations().forEach(a=>{try{a.finish()}catch(e){}})}catch(e){}});const r=await page.evaluate(()=>{const out=[];
    const isVis=e=>{let x=e;while(x&&x!==document.documentElement){const cs=getComputedStyle(x);if(cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity)<.05)return false;x=x.parentElement;}return true;};
    const scr=[...document.querySelectorAll('.screen.on')].pop();window.__dbg=[...document.querySelectorAll('.screen.on')].map(x=>x.id).join(',')+' ui='+window.__PH.G.ui;const roots=[scr,document.getElementById('pts'),document.getElementById('menuRank')].filter(Boolean);
    const seen=new Set();
    for(const root of roots)for(const e of [root,...root.querySelectorAll('*')]){if(seen.has(e))continue;seen.add(e);
      const cs=getComputedStyle(e);const inter=e.tagName==='BUTTON'||e.tagName==='INPUT'||e.tagName==='A'||e.hasAttribute('data-go')||e.hasAttribute('data-mode')||e.hasAttribute('data-t')||e.hasAttribute('data-act')||e.onclick||cs.cursor==='pointer';
      if(!inter||!isVis(e))continue;if(!e.matches('button,input,a,[data-go],[data-mode],[data-t],[data-act]')&&e.parentElement&&getComputedStyle(e.parentElement).cursor==='pointer')continue;if(e.closest('svg'))continue;if(e.parentElement&&e.parentElement.closest('button,[data-go],[data-mode]')&&!e.matches('button,[data-go],[data-mode]'))continue;
      const r=e.getBoundingClientRect();if(r.width<1||r.height<1)continue;
      const cx=r.left+r.width/2,cy=r.top+r.height/2,hit=document.elementFromPoint(Math.min(innerWidth-1,Math.max(0,cx)),Math.min(innerHeight-1,Math.max(0,cy)));
      const ok=hit&&(hit===e||e.contains(hit));
      const attrs=['data-go','data-mode','data-t','data-act','id'].map(a=>e.getAttribute(a)?a+'='+e.getAttribute(a):'').filter(Boolean).join(' ');
      out.push((e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).join('.'):'')).padEnd(30)+' '+Math.round(r.width)+'x'+Math.round(r.height)+(r.width<44||r.height<44?' SMALL':'')+(ok?'':' COVERED('+(hit?hit.tagName+(hit.id?'#'+hit.id:''):'none')+')')+' tab='+e.tabIndex+' ['+attrs+'] "'+(e.innerText||e.value||'').trim().replace(/\s+/g,' ').slice(0,40)+'"');}
    out.unshift('screens on: '+window.__dbg+' buttons='+scr.querySelectorAll('button').length+' firstVis='+(()=>{const b=scr.querySelector('button');if(!b)return 'none';let x=b,ch=[];while(x&&x!==document.documentElement){const cs=getComputedStyle(x);ch.push((x.id||x.className||x.tagName)+':'+cs.display+'/'+cs.visibility+'/'+cs.opacity);x=x.parentElement;}return ch.join(' > ');})());return out;});console.log('### '+tag+' ('+r.length+')');r.forEach(x=>console.log('  '+x));};
  const E=(f,...a)=>page.evaluate(f,...a);
  await dump('home');
  await E(()=>{const b=document.createElement('button');b.dataset.go='sScout';document.body.appendChild(b);b.click();b.remove();});await wait(500);
  for(const t of['pull','enh','fuse','dex']){await E(t=>{const b=document.querySelector('#scTabs [data-t="'+t+'"]');b&&b.click();},t);await wait(400);await dump('scout_'+t);}
  console.log(mode+' dump done '+(logs.join(' | ')||'no page errors'));await browser.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
