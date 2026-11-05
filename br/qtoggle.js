// Browser check: the 그래픽 높음/절약 toggle applies to the rink live (ice paint size, flags), shader compiles, flag text reads from both sides.
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:1000,height:620}});
const page=await browser.newPage();const logs=[],cerr=[];page.on('pageerror',e=>logs.push(e.message));page.on('console',m=>{const t=m.text();if(m.type()==='error'||/WebGLProgram|shader/i.test(t))cerr.push(t.slice(0,300));});
await page.setRequestInterception(true);page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});if(u.startsWith('file:'))return r.continue();r.abort();});
await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(()=>localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,points:500,types:['basic'],type:'basic',tut:{done:true,asked:true}})));
await page.goto('file://'+path.resolve('../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2600);
const res=await page.evaluate(()=>{window.requestAnimationFrame=()=>0;const P=window.__PH,out=[];
  const snap=tag=>{for(let i=0;i<30;i++)P.step(1/60);P.renderer.info.reset();P.renderer.render(P.scene,P.camera);const ri=P.renderer.info.render;
    const fl=P.RK.flags.filter(f=>f.g.visible).length;out.push(tag+': ice '+P.iceMat.map.image.width+'x'+P.iceMat.map.image.height+', flags visible '+fl+'/'+P.RK.flags.length+', calls '+ri.calls+', tris '+ri.triangles);};
  P.launch('quick');snap('high (start)');
  P.save.set.quality='low';P.applyQuality();snap('low (toggled live)');
  P.save.set.quality='high';P.applyQuality();snap('high (toggled back)');
  return out;});
res.forEach(l=>console.log(l));
await page.evaluate(()=>document.querySelectorAll('.screen,#hud,nav,#banner,#bannerSub,#combo,#clock,#touch').forEach(e=>e.style.visibility='hidden'));
const shot=async(n,side)=>{await page.evaluate(side=>{const P=window.__PH;for(let i=0;i<6;i++)P.step(1/60);const f=P.RK.flags[1].g.position;   // a far-ridge flag
    P.renderer.setSize(1000,620,false);P.camera.aspect=1000/620;P.camera.clearViewOffset();P.camera.updateProjectionMatrix();
    P.camera.position.set(f.x+.75,f.y+5.2,f.z+side*6);P.camera.lookAt(f.x+.75,f.y+4.9,f.z);P.renderer.render(P.scene,P.camera);},side);
  await wait(150);await page.screenshot({path:'rink/'+n+'.png'});};
await shot('flag_front',1);await shot('flag_back',-1);
console.log('console errors: '+(cerr.length?cerr.join(' | '):'none'));console.log(logs.join(' | ')||'no page errors');await browser.close();})();
