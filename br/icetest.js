const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:900,height:500}});
const page=await browser.newPage();await page.setRequestInterception(true);page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});if(u.startsWith('file:'))return r.continue();r.abort();});
await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(()=>localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,points:500,types:['basic'],type:'basic',tut:{done:true,asked:true}})));
await page.goto('file://'+path.resolve('../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2600);
await page.evaluate(()=>{window.requestAnimationFrame=()=>0;document.querySelectorAll('.screen,#hud,nav').forEach(e=>e.style.visibility='hidden');const P=window.__PH;P.launch('quick');for(let i=0;i<60*4;i++)P.step(1/60);
  P.scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.map&&o.geometry.type==='ShapeGeometry'&&o.material.map.image&&o.material.map.image.width>=1024)window.__ice=o.material;});});
for(const [r,tod] of [[.17,.08],[.3,.08],[.45,.08],[.3,.95]]){
  await page.evaluate((r,tod)=>{const P=window.__PH;window.__ice.roughness=r;P.G.todMode='fixed';P.G.todFixed=tod;P.setTOD(tod,99);for(let i=0;i<20;i++)P.step(1/60);P.setTOD(tod,99);P.renderer.setSize(900,500,false);P.camera.aspect=900/500;P.camera.clearViewOffset();P.camera.updateProjectionMatrix();P.renderer.render(P.scene,P.camera);},r,tod);
  await wait(120);await page.evaluate(()=>{const P=window.__PH;P.renderer.render(P.scene,P.camera);});await page.screenshot({path:'rink/ice_r'+r+'_t'+tod+'.png'});}
await browser.close();})();
