// Model lab: the penguins with the CURRENT v43_model.js swapped into the built game (no rebuild).
// usage: node mlab.js [tag] [views]   views: close,all,hats,match,goalie (default all of them) → shots/mlab/<tag>_<view>.png
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));const TAG=process.argv[2]||'lab',VIEWS=(process.argv[3]||'close,all,hats,match').split(',');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(__dirname,'shots','mlab');fs.mkdirSync(OUT,{recursive:true});
const FS=path.resolve(__dirname,'node_modules/@fontsource');
function html(){let s=fs.readFileSync(path.join(ROOT,'penguin-hockey-improved.html'),'utf8');
  for(const [a,b,f] of [['/*PKM:js*/','/*PKM:jsend*/','v43_model.js'],['/*P3:js*/','/*P3:jsend*/','v41_card.js']]){const i=s.indexOf(a),j=s.indexOf(b);if(i<0||j<0)throw new Error('marker '+a);s=s.slice(0,i+a.length)+fs.readFileSync(path.join(ROOT,f),'utf8')+s.slice(j);}
  return s;}
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:1200,height:800,deviceScaleFactor:1}});
  const p=await b.newPage();const logs=[];p.on('pageerror',e=>logs.push(e.message));p.on('console',m=>{if(m.type()==='error')logs.push(m.text().slice(0,200));});
  const URL='file://'+path.join(ROOT,'penguin-hockey-improved.html');
  await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();if(u.split('?')[0]===URL)return r.respond({status:200,contentType:'text/html; charset=utf-8',body:html()});if(u.startsWith('file:'))return r.continue();r.abort();});
  await p.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,news18:true,tut:{done:true,asked:true},set:{quality:'ultra',tod:'day',cond:false,events:false,items:false,rules:'off'}}));});
  await p.goto(URL,{waitUntil:'load'});await wait(2500);
  await p.evaluate(()=>{window.requestAnimationFrame=()=>0;document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));});
  const stage=(list,cam,vp)=>p.evaluate((list,cam)=>{const P=window.__PH;if(window.__ab)for(const o of window.__ab)P.scene.remove(o);window.__ab=[];
    for(const it of list){const g=P.buildPenguin(it.k,it.team||'blue',it.hat||'none',{num:it.num||7,goalie:!!it.goalie});g.root.position.set(it.x,0,it.z||0);g.root.rotation.y=it.ry||0;
      g.stick.visible=false;P.scene.add(g.root);window.__ab.push(g.root);}
    const c=P.camera;c.position.set(cam[0],cam[1],cam[2]);c.lookAt(cam[3],cam[4],cam[5]);c.fov=cam[6]||40;c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();
    for(let i=0;i<3;i++)P.shFit&&P.shFit();P.renderer.render(P.scene,c);},list,cam);
  const shot=async n=>{await wait(120);await p.screenshot({path:path.join(OUT,TAG+'_'+n+'.png')});console.log('saved',n);};
  if(VIEWS.includes('close')){await p.setViewport({width:1200,height:800});await stage([{k:'basic',x:-2.3,ry:.45},{k:'king',x:0,ry:.1,team:'red'},{k:'macaroni',x:2.3,ry:-.4}],[0,1.75,5.4,0,1.05,0,40]);await shot('close');}
  if(VIEWS.includes('all')){await p.setViewport({width:1600,height:640});const ks=Object.keys(await p.evaluate(()=>Object.fromEntries(Object.keys(window.__PH.TYPES).map(k=>[k,1]))));
    await stage(ks.map((k,i)=>({k,x:(i-(ks.length-1)/2)*1.35,ry:.25,team:i%2?'red':'blue'})),[0,2.4,12.5,0,.95,0,46]);await shot('all');}
  if(VIEWS.includes('hats')){await p.setViewport({width:1200,height:700});const hats=await p.evaluate(()=>Object.keys(window.__PH.HATS||{}).slice(0,6));
    await stage([{k:'basic',x:-3,hat:'beanie'},{k:'fast',x:-1.5,hat:'helmet'},{k:'king',x:0,goalie:true,team:'red'},...hats.filter(h=>h!=='none'&&h!=='beanie'&&h!=='helmet').slice(0,2).map((h,i)=>({k:i?'royal':'little',x:1.5+i*1.5,hat:h}))],[0,2.1,7.2,0,1.05,0,40]);
    console.log('hats',JSON.stringify(hats));await shot('hats');}
  if(VIEWS.includes('match')){await p.setViewport({width:960,height:540});await p.evaluate(()=>{const P=window.__PH,G=P.G;if(window.__ab)for(const o of window.__ab)P.scene.remove(o);window.__ab=[];
    P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'T',oppTypes:['king','macaroni','strong']});document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
    for(let i=0;i<60*8;i++)P.step(1/60);P.updateCamera(1);P.renderer.render(P.scene,P.camera);});await shot('match');}
  console.log('errors',logs.length,logs.slice(0,3).join(' | '));await b.close();process.exit(0);
})().catch(e=>{console.log('CRASH',e);process.exit(1);});
