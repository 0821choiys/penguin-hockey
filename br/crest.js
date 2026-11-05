// Close-ups of a hat-less rockhopper (crest + stick) on the select screen. usage: node crest.js <prefix> [html]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));const pre=process.argv[2]||'c0',html=process.argv[3]||'../penguin-hockey-improved.html';
fs.mkdirSync('audit',{recursive:true});
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:900,height:600}});
const page=await browser.newPage();const logs=[];page.on('pageerror',e=>logs.push(e.message));await page.setRequestInterception(true);page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});if(u.startsWith('file:'))return r.continue();r.abort();});
await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(()=>localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,points:500,types:['basic','balanced'],type:'balanced',hat:'none',tut:{done:true,asked:true}})));
await page.goto('file://'+path.resolve(html),{waitUntil:'load'});await wait(2600);
await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.screenshot();
await page.evaluate(()=>{const P=window.__PH;P.save.hat='none';P.save.type='balanced';const b=document.createElement('button');b.dataset.go='sSelect';document.body.appendChild(b);b.click();b.remove();
  document.querySelectorAll('.screen,#hud,nav,#touch,.pts,#achPop').forEach(e=>e.style.visibility='hidden');P.G.todMode='fixed';P.G.todFixed=.3;P.setTOD(.3,99);for(let i=0;i<40;i++)P.step(1/60);});
for(const [n,p,l] of[['front',[0,2.5,3.3],[0,1.55,0]],['three4',[2.3,2.6,2.3],[0,1.45,0]],['side',[3.3,2.1,.3],[0,1.3,0]]]){
  await page.evaluate((p,l)=>{const P=window.__PH;P.step(1/60);const c=P.camera;c.clearViewOffset&&c.clearViewOffset();c.aspect=900/600;c.updateProjectionMatrix();c.position.set(p[0],p[1],p[2]);c.lookAt(l[0],l[1],l[2]);P.renderer.setSize(900,600,false);P.renderer.render(P.scene,c);},p,l);
  await wait(150);await page.screenshot({path:'audit/'+pre+'_'+n+'.jpg',type:'jpeg',quality:85});}
console.log(pre,logs.join(' | ')||'no page errors');await browser.close();})();
