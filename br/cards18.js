// card art sheet: every species as a card (owned look), the unowned silhouette and the raw art. usage: node cards18.js <out.png> [html]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=process.argv[2]||'peng/cards18.png',HTML=process.argv[3]||'../penguin-hockey-improved.html';
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:1280,height:+(process.env.VH||900)}});
  const page=await browser.newPage();const logs=[];page.on('pageerror',e=>logs.push('PAGEERR '+e.message));
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(l=>localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,points:500,types:['basic','fast','king','little','african'],type:'basic',tut:{done:true,asked:true},news18:true,set:{lang:l}})),process.env.PH_LANG||'ko');
  await page.goto('file://'+path.resolve(HTML),{waitUntil:'load'});await wait(2500);
  await page.evaluate(()=>{window.requestAnimationFrame=()=>0;const P=window.__PH;P.renderer.render=()=>{};});
  await page.evaluate(()=>{
    const P=window.__PH,ks=Object.keys(P.TYPES),d=document.createElement('div');
    d.style.cssText='position:fixed;inset:0;z-index:99999;background:#0d2747;overflow:auto;padding:10px;display:flex;flex-wrap:wrap;gap:10px;align-content:flex-start';
    d.innerHTML=ks.map(k=>'<div style="display:flex;flex-direction:column;align-items:center;gap:4px;color:#fff;font:12px sans-serif"><div style="display:flex;gap:4px">'+P.cardHtml(k,{lv:k==='auk'?10:3,g:k==='auk'?4:1})+P.sil18(k,96)+'</div><div style="width:150px;height:150px;background:#cfe3f5;border-radius:8px">'+P.pengSVG(k)+'</div>'+P.TYPES[k].name+'</div>').join('');
    d.querySelectorAll('.pc').forEach(e=>e.style.setProperty('--cw','96px'));
    document.body.appendChild(d);});
  await wait(400);await page.screenshot({path:OUT,fullPage:false});
  console.log('cards done',logs.join(' | ')||'no page errors');await browser.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
