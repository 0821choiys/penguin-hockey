// v50: the SAME match frame drawn at every graphics step (max / ultra / high / low / xlow) side by side → shots/gfx/gqcmp_<mode>.jpg
// usage: node gqcmp.js <pc|tall|wide>
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',Q=process.argv[3]||'ultra',TAG=process.argv[4]||'now',lang='ko';
const VP={padp:{width:768,height:1024,isMobile:true,hasTouch:true,deviceScaleFactor:1},padl:{width:1024,height:768,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1},pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const ALL=['basic','balanced','fast','defense','strong','king','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos','auk'];
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:ALL,type:'strong',squad:['basic','fast',null],tut:{done:true,asked:true},hat:'none',rl:{intro:1},set:{quality:'ultra',cond:false,events:false,items:false,rules:'full',cine:'full',tod:'day'}});
const OUT=path.join(__dirname,'shots','gfx');fs.mkdirSync(OUT,{recursive:true});
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
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(s=>{window.requestAnimationFrame=()=>0;localStorage.setItem('penguinHockey.v1',s);let seed=4242;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{window.requestAnimationFrame=()=>0;const st=document.createElement('style');st.textContent='#combo,#fever,#evTag,#hud,#touch{display:none!important}';document.head.appendChild(st);});

  await E(()=>{const P=window.__PH,G=P.G;P.save.set.motion=false;P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'T',oppTypes:['basic','fast','strong']});
    document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));G.state='play';G.stateT=0;document.getElementById('count').textContent='';
    for(let i=0;i<60*4;i++){if(G.player)P.setHuman&&P.setHuman(null);P.step(1/60);}P.updateCamera(1);});
  const files=[];
  for(const q of['max','ultra','high','low','xlow']){
    const r=await E(q=>{const P=window.__PH,r=P.renderer;P.gqSet(q);P.applyQuality();P.updateCamera(1);P.gfxRender();P.gfxRender();
      r.info.autoReset=false;r.info.reset();const t0=performance.now();P.gfxRender();r.getContext().readPixels(0,0,1,1,r.getContext().RGBA,r.getContext().UNSIGNED_BYTE,new Uint8Array(4));
      const o={q,tri:r.info.render.triangles,calls:r.info.render.calls,ms:Math.round(performance.now()-t0),pr:r.getPixelRatio()};r.info.autoReset=true;return o;},q);
    console.log(JSON.stringify(r));await wait(120);const f=path.join(OUT,'gqcmp_'+mode+'_'+q+'.png');await page.screenshot({path:f});files.push(f);}
  console.log(logs.length?'ERR '+logs.slice(0,3).join(' | '):'ok');await browser.close();
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
