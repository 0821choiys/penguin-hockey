// the new species as game cards in one sheet. usage: node cardrow18.js <out.png> [lang]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=process.argv[2]||'peng/cards_new.png',LANG=process.argv[3]||'ko';
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:1100,height:480}});
  const page=await browser.newPage();const logs=[];page.on('pageerror',e=>logs.push('PAGEERR '+e.message));
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(l=>localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,points:500,types:['basic'],type:'basic',tut:{done:true,asked:true},news18:true,set:{lang:l}})),LANG);
  await page.goto('file://'+path.resolve('../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2500);
  await page.evaluate(()=>{window.requestAnimationFrame=()=>0;window.__PH.renderer.render=()=>{};});
  await page.evaluate(()=>{const P=window.__PH,d=document.createElement('div');
    d.style.cssText='position:fixed;inset:0;z-index:99999;background:linear-gradient(160deg,#16365f,#0b1f3a);display:flex;flex-wrap:wrap;gap:14px 18px;justify-content:center;align-content:center;padding:14px 125px';
    d.innerHTML=P.NEW18.map((k,i)=>'<div style="--cw:150px">'+P.cardHtml(k,{lv:[3,6,9,1,4,2,7,5,8,3][i],g:[1,2,3,0,1,0,2,1,2,1][i]})+'</div>').join('');document.body.appendChild(d);});
  await wait(500);await page.screenshot({path:OUT});console.log('cardrow done',logs.join(' | ')||'no page errors');await browser.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
