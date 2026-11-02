const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--expose-gc'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:900,height:560}});
const page=await browser.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160));});
await page.setRequestInterception(true);page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});if(u.startsWith('file:'))return r.continue();r.abort();});
await page.evaluateOnNewDocument(()=>{localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,points:500,types:['basic','fast','strong'],type:'fast',tut:{done:true,asked:true}}));
  window.__to=0;const st=window.setTimeout,ct=window.clearTimeout,live=new Set();window.__live=live;
  window.setTimeout=(f,ms,...a)=>{const id=st(()=>{live.delete(id);typeof f==='function'?f(...a):0;},ms);live.add(id);return id;};window.clearTimeout=id=>{live.delete(id);ct(id);};});
await page.goto('file://'+path.resolve('../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2500);
const snap=()=>page.evaluate(()=>{const P=window.__PH;const geo=new Set(),mat=new Set(),tex=new Set();let obj=0;P.scene.traverse(o=>{obj++;if(o.geometry)geo.add(o.geometry.uuid);const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>{mat.add(m.uuid);for(const k in m){const v=m[k];if(v&&v.isTexture)tex.add(v.uuid);}});});
  return {obj,geo:geo.size,mat:mat.size,tex:tex.size,dom:document.getElementsByTagName('*').length,timers:window.__live.size,pengs:P.G.pengs.length,heap:performance.memory?Math.round(performance.memory.usedJSHeapSize/1e6):-1};});
const modes=['quick','quick','free','shootout','quick','tour','quick','free','shootout','quick'];
const rows=[];rows.push(['start',await snap()]);
for(let r=0;r<3;r++)for(const m of modes){
  await page.evaluate(m=>{const P=window.__PH;if(m==='tour')P.G.tour={round:0,champPaid:false};
    try{P.launch(m);}catch(e){console.error('launch '+m+' '+e.message);}
    for(let i=0;i<60*20;i++)P.step(1/60);  // 20 s of play incl. goals
    const G=P.G;if(G.mine){G.timeLeft=.05;}for(let i=0;i<60*8;i++)P.step(1/60);
    document.querySelectorAll('#sResult button').length;P.toMenu&&P.toMenu();},m);
  await page.evaluate(()=>{const b=document.createElement('button');b.dataset.go='sMenu';document.body.appendChild(b);b.click();b.remove();for(let i=0;i<60;i++)window.__PH.step(1/60);});
  rows.push(['after '+(r+1)*10+' matches',await snap()]);}
console.log(await page.evaluate(()=>{const c={};document.querySelectorAll('body > *').forEach(e=>{c[(e.id||e.tagName)+(e.className?'.'+String(e.className).split(' ')[0]:'')]=e.getElementsByTagName('*').length;});return JSON.stringify(Object.entries(c).filter(x=>x[1]>15));}));
await page.evaluate(()=>{for(let i=0;i<60*5;i++)window.__PH.step(1/60);});rows.push(['menu +5s',await snap()]);
rows.forEach(r=>console.log(r[0].padEnd(18),JSON.stringify(r[1])));
console.log('errors:',errs.length);errs.slice(0,8).forEach(e=>console.log(' ',e));
await browser.close();})().catch(e=>{console.log('FAIL',e.message);process.exit(1)});
