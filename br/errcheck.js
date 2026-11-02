const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:900,height:600}});
const page=await browser.newPage();const logs=[];page.on('pageerror',e=>logs.push('PAGEERR '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join(' / ')));page.on('console',m=>{if(m.type()==='error')logs.push('CONSOLE '+m.text().slice(0,300));});
await page.setRequestInterception(true);page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});if(u.startsWith('file:'))return r.continue();r.abort();});
await page.goto('file://'+path.resolve('../penguin-hockey-improved.html'),{waitUntil:'load'});await new Promise(r=>setTimeout(r,3000));
console.log(await page.evaluate(()=>typeof window.__PH),logs.join('\n'));await browser.close();})();
