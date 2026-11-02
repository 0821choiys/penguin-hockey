const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:1000,height:620}});
const page=await browser.newPage();await page.setRequestInterception(true);page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});if(u.startsWith('file:'))return r.continue();r.abort();});
await page.evaluateOnNewDocument(()=>localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,points:500,types:['basic','fast'],type:'fast',tut:{done:true,asked:true}})));
await page.goto('file://'+path.resolve(process.argv[2]||'../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2500);
console.log(await page.evaluate(()=>{const P=window.__PH;const st=g=>{let m=0,tri=0,sh=0;g.traverse(o=>{if(o.isMesh){m++;if(o.castShadow)sh++;const ge=o.geometry;tri+=(ge.index?ge.index.count:ge.attributes.position.count)/3;}});return {meshes:m,shadowCasters:sh,tris:Math.round(tri)};};
 const out={};if(P.buildPenguinV9){
 }
 P.launch('quick');for(let i=0;i<120;i++)P.step(1/60);P.renderer.info.reset();P.renderer.render(P.scene,P.camera);const ri=P.renderer.info.render;out.frame={calls:ri.calls,triangles:ri.triangles};
 return JSON.stringify(out);}));
await browser.close();})();
