const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:900,height:560}});
  const page=await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});else if(u.startsWith('file:'))r.continue();else r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(()=>{localStorage.setItem('penguinHockey.v1',JSON.stringify({v:8,points:900,tut:{done:true,asked:true},stats:{played:3},mgr:{r:1185,games:14,w:9,d:1,l:4,best:1210,form:[],hist:[]}}));});
  await page.goto('file://'+path.resolve('../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2500);
  const t0=Date.now();
  await page.evaluate(()=>window.__PH.rankedStart());
  const st=await page.evaluate(()=>{const v=document.querySelector('#vsFx'),r=v.getBoundingClientRect();return{on:v.classList.contains('on'),disp:getComputedStyle(v).display,z:getComputedStyle(v).zIndex,w:r.width,h:r.height,me:document.querySelector('#vsMe').textContent,op:document.querySelector('#vsOp').textContent,title:document.querySelector('#vsTitle').textContent,parentHidden:getComputedStyle(v.parentElement).display}});
  console.log('after',Date.now()-t0,'ms',JSON.stringify(st));
  const t1=Date.now();await page.screenshot({path:'shots/vs_direct.jpg',type:'jpeg',quality:72});console.log('screenshot took',Date.now()-t1,'ms; mode now',await page.evaluate(()=>window.__PH.G.view+'/'+(window.__PH.G.cfg&&window.__PH.G.cfg.mode)));
  await browser.close();
})();
