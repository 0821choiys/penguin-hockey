// Landscape comfort: match with HUD + touch controls, pause, result, home, pass, scout on a landscape phone / tablet.
// usage: node landcap.js <wide|padl|pc> <tag>   → shots/land/<tag>_<mode>_<screen>.jpg, prints control sizes and overlaps
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'wide',TAG=process.argv[3]||'now',lang='ko';
const VP={wideS:{width:740,height:360,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:2},padp:{width:768,height:1024,isMobile:true,hasTouch:true,deviceScaleFactor:1},padl:{width:1024,height:768,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1},pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const ALL=['basic','balanced','fast','defense','strong','king','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos','auk'];
const SAVE0=1;const SAVE=JSON.stringify({v:10,news18:true,points:900,types:ALL,type:'strong',squad:['basic','fast',null],tut:{done:true,asked:true},hat:'none',rl:{intro:1},set:{quality:'ultra',cond:false,events:false,items:false,rules:'full',cine:'full',tod:'day'}});
const OUT=path.join(__dirname,'shots','land');fs.mkdirSync(OUT,{recursive:true});
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error')logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'node_modules/three/build/three.min.js'))});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(s=>{window.requestAnimationFrame=()=>0;localStorage.setItem('penguinHockey.v1',s);let seed=4242;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  const shot=async n=>{await E(()=>{const P=window.__PH;try{P.gfxRender?P.gfxRender():P.renderer.render(P.scene,P.camera);}catch(e){}});await wait(200);await page.screenshot({path:path.join(OUT,TAG+'_'+mode+'_'+n+'.jpg'),type:'jpeg',quality:82});};
  await E(()=>{window.requestAnimationFrame=()=>0;});
  await shot('home');
  for(const s of['sPass','sScout','sSet','sSelect','sMode']){await E(id=>window.__PH.goScreen(id),s);await wait(400);await shot(s);}
  await E(()=>window.__PH.goScreen('sMenu'));
  await E(()=>{const P=window.__PH,G=P.G;P.save.set.motion=false;P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'T',oppTypes:['basic','fast','strong']});
    document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));G.state='play';G.stateT=0;for(let i=0;i<60*3;i++)P.step(1/60);P.updateCamera(1);});
  await shot('match');
  // control rectangles: size, overlap with each other and with the HUD
  const r=await E(()=>{const vis=e=>{if(!e)return false;const cs=getComputedStyle(e),b=e.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&b.width>0&&b.height>0;};
    const els=[...document.querySelectorAll('#touch button, #touch .btn, #touch [id], #hud > *, #stick, #joy, .tbtn')].filter(vis);
    const o=els.map(e=>{const b=e.getBoundingClientRect();return {id:e.id||e.className.toString().slice(0,20),x:Math.round(b.left),y:Math.round(b.top),w:Math.round(b.width),h:Math.round(b.height)};});
    return {vw:innerWidth,vh:innerHeight,els:o};});
  console.log(JSON.stringify(r));
  await E(()=>{window.__PH.togglePause();});await wait(300);await shot('pause');await E(()=>{window.__PH.togglePause();});
  await E(()=>{const P=window.__PH,G=P.G;G.timeLeft=0.05;for(let i=0;i<60*8&&G.ui!=='sResult';i++)P.step(1/60);});await wait(600);await shot('result');
  console.log(logs.length?'ERR '+logs.slice(0,3).join(' | '):'ok');await browser.close();
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
