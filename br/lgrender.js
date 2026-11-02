// usage: node lgrender.js pc|touch
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc';
(async()=>{
  const touch=mode==='touch';
  const vp=touch?{width:780,height:360,isMobile:true,hasTouch:true,isLandscape:true}:{width:900,height:560};
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:vp});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_FAILED'))logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});else if(u.startsWith('file:'))r.continue();else r.abort();});
  // returning player: skip the first-run tutorial prompt, give some progress
  await page.evaluateOnNewDocument(()=>{localStorage.setItem('penguinHockey.v1',JSON.stringify({v:7,points:1800,types:['basic','fast','strong'],type:'fast',lv:{fast:6,strong:3,basic:2},cards:{basic:[4,1,0,0],fast:[2,0,0,0],strong:[0,1,1,0]},stats:{played:9,wins:6,goals:21},tut:{done:true,asked:true},
    mgr:{r:1185,games:9,w:6,d:1,l:2,best:1210,form:['W','W','L','D','W'],hist:[{d:23,r:1185,l:'빠른 경기',ts:Date.now()-3600e3},{d:-14,r:1162,l:'토너먼트 2R',ts:Date.now()-7200e3}]}}));});
  await page.goto('file://'+path.resolve('../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2800);
  const shot=async n=>page.screenshot({path:'shots/'+n+'.jpg',type:'jpeg',quality:72});
  const E=f=>page.evaluate(f);const click=sel=>E(new Function('document.querySelector('+JSON.stringify(sel)+').click()'));
  await shot(mode+'_home');
  await click('[data-go="sMarket"]');await wait(600);await shot(mode+'_mk_buy');
  await click('#mkTabs [data-t="sell"]');await wait(400);await shot(mode+'_mk_sell');
  await E(()=>{document.querySelector('[data-sell]').click();});await wait(300);
  await click('#mkTabs [data-t="buy"]');await wait(200);
  await E(()=>{const b=[...document.querySelectorAll('[data-buy]')].find(x=>!x.disabled);if(b)b.click();});await wait(300);
  await click('#mkTabs [data-t="log"]');await wait(400);await shot(mode+'_mk_log');
  await click('[data-go="sMenu"]');await wait(200);
  await click('[data-go="sProfile"]');await wait(600);
  // type a name containing w/a/s/d through the real keyboard
  let typed='';
  if(!touch){await page.click('#pfName',{clickCount:3});await page.keyboard.type('wasd coach');await page.keyboard.press('Tab');await wait(300);typed=await E(()=>window.__PH.save.profile.name);}
  await shot(mode+'_pf_me');
  await click('#pfTabs [data-t="club"]');await wait(500);await shot(mode+'_pf_club');
  await click('#pfTabs [data-t="mgr"]');await wait(500);await shot(mode+'_pf_mgr');
  // play-to-result to see the rating line
  await E(()=>{const P=window.__PH;P.launch('quick');for(let i=0;i<300;i++)P.step(1/60);const G=P.G;G.mine.score=2;G.mine.opp.score=1;G.timeLeft=.1;for(let i=0;i<60*8&&!(G.state==='over'&&G.resultShown);i++)P.step(1/60);});
  await wait(5200);await shot(mode+'_result');
  const st=await E(()=>({rating:window.__PH.save.mgr.r,games:window.__PH.save.mgr.games}));
  console.log(mode+': typed name="'+typed+'" '+JSON.stringify(st)+' | '+(logs.join(' | ')||'no page errors'));
  await browser.close();
})().catch(e=>{console.error('FAIL',mode,e.message);process.exit(1)});
