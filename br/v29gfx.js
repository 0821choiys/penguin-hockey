// v29 in a real browser: shadow map size per quality, the shadow camera covers every skater and the view, keeps its size
// while the camera pans (no shimmer), halves when the device struggles; smoother penguins on 최고; phones start on 최고.
// usage: node v29gfx.js <pc|tall|wide|padp|padl>
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',lang='ko';
const VP={padp:{width:768,height:1024,isMobile:true,hasTouch:true,deviceScaleFactor:1},padl:{width:1024,height:768,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1},pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const ALL=['basic','balanced','fast','defense','strong','king','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos','auk'];
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:ALL,type:'strong',squad:['basic','fast',null],tut:{done:true,asked:true},hat:'none',rl:{intro:1},set:{quality:'ultra',cond:false,events:false,items:false,rules:'full',cine:'full',tod:'day'}});
const OUT=path.join(__dirname,'shots','v29');fs.mkdirSync(OUT,{recursive:true});
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
  await page.evaluateOnNewDocument(s=>{window.requestAnimationFrame=()=>0;localStorage.removeItem('penguinHockey.v1');let seed=4242;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{window.requestAnimationFrame=()=>0;});
  const first=await E(()=>window.__PH.save.set.quality);
  ok(first==='ultra','a first start begins on 최고 ('+first+')');
  for(const [q,want] of[['low',1024],['high',3072],['ultra',4096]]){const m=await E(q=>{const P=window.__PH;P.save.set.quality=q;P.applyQuality();return P.sun.shadow.mapSize.x;},q);ok(m===want,'shadow map on '+q+': '+m+'²');}
  const g=await E(()=>{const P=window.__PH,G=P.G,T=window.THREE;P.save.set.quality='ultra';P.save.set.motion=false;P.save.set.rules='full';P.applyQuality();
    P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'T',oppTypes:['basic','fast','strong']});document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
    G.state='play';G.stateT=0;for(let i=0;i<60*3;i++){P.step(1/60);}P.updateCamera(1);for(let i=0;i<40;i++)P.shFit();
    const S=P.shState(),c=P.sun.shadow.camera,v=new T.Vector3();let inside=0,all=0;
    for(const p of G.pengs.concat(G.ref&&G.ref.pg?[{rx:G.ref.x,rz:G.ref.z}]:[])){for(const y of[0,1.7]){v.set(p.rx,y,p.rz).applyMatrix4(S.inv);all++;if(v.x>=c.left&&v.x<=c.right&&v.y>=c.bottom&&v.y<=c.top)inside++;}}
    const snapped=Math.abs(c.left/S.texel-Math.round(c.left/S.texel))<1e-3;
    const size0=S.size;G.cam.x+=1.2;G.cam.z+=.6;P.updateCamera(1);for(let i=0;i<5;i++)P.shFit();const size1=S.size;
    P.perf.scale=.7;P.applyQuality();const half=P.sun.shadow.mapSize.x;P.perf.scale=1;P.applyQuality();
    return {size:size0,texel:S.texel,inside,all,snapped,size1,half,near:c.near,far:c.far};});
  ok(g.texel*100<1.95,'in a match on 최고: shadow texel (less than half the old 3.9 cm) '+(g.texel*100).toFixed(2)+' cm (was 3.9 cm), shadow square '+g.size+' m');
  ok(g.inside===g.all,'every skater, goalie and the referee is inside the shadow camera ('+g.inside+'/'+g.all+' points)');
  ok(g.snapped,'the shadow camera sits on whole texels');
  ok(g.size1===g.size,'panning the camera keeps the shadow square size (no shimmer): '+g.size+' → '+g.size1+' m');
  ok(g.half===2048,'when the device struggles (auto step-down) the 최고 shadow map halves: '+g.half+'²');
  const mv=await E(()=>{const P=window.__PH,n=q=>{P.save.set.quality=q;const r=P.buildPenguin('king','blue','none',{num:7}).root;let v=0;r.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.position)v+=o.geometry.attributes.position.count;});return v;};const h=n('high'),u=n('ultra');P.save.set.quality='ultra';return {h,u};});
  ok(mv.u>mv.h*1.8,'smoother penguin on 최고: '+mv.u+' vertices vs '+mv.h+' on 높음');
  await E(()=>{const P=window.__PH;P.gfxRender?P.gfxRender():P.renderer.render(P.scene,P.camera);});await wait(150);
  await page.screenshot({path:path.join(OUT,mode+'_match.jpg'),type:'jpeg',quality:85});
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,3).join(' | '):''));
  console.log('TOTAL v29gfx '+mode+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
