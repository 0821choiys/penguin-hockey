// Graphics close-up for before/after comparisons: a match frame (players, referee, shadows) + 2x crops of a penguin's shadow.
// usage: node gfxshot.js <pc|tall|wide|padp|padl> <low|high|ultra> <tag>   also prints the camera's ground footprint
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
  await page.evaluateOnNewDocument(s=>{window.requestAnimationFrame=()=>0;localStorage.setItem('penguinHockey.v1',s);let seed=4242;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{window.requestAnimationFrame=()=>0;const st=document.createElement('style');st.textContent='#combo,#fever,#evTag,#hud,#touch{display:none!important}';document.head.appendChild(st);});
  const info=await E(Q=>{const P=window.__PH,G=P.G;P.save.set.quality=Q;P.save.set.motion=false;P.applyQuality&&P.applyQuality();
    P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'T',oppTypes:['basic','fast','strong']});document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
    G.state='play';G.stateT=0;document.getElementById('count').textContent='';
    for(let i=0;i<60*4;i++){if(G.player)P.setHuman&&P.setHuman(null);P.step(1/60);}
    P.updateCamera(1);
    // ground footprint of the view (corners of the screen projected to y=0) relative to the camera target
    const T=window.THREE,cam=P.camera,pts=[];for(const [x,y] of[[-1,-1],[1,-1],[1,1],[-1,1],[0,1],[0,-1]]){const v=new T.Vector3(x,y,.5).unproject(cam),d=v.sub(cam.position).normalize();if(d.y<-1e-3){const t=-cam.position.y/d.y;pts.push([+(cam.position.x+d.x*t-G.cam.x).toFixed(1),+(cam.position.z+d.z*t-G.cam.z).toFixed(1)]);}else pts.push('sky');}
    return {pts,cam:[+cam.position.x.toFixed(1),+cam.position.y.toFixed(1),+cam.position.z.toFixed(1)],tgt:[+G.cam.x.toFixed(1),+G.cam.z.toFixed(1)],map:P.sun?P.sun.shadow.mapSize.x:null,dpr:P.renderer.getPixelRatio()};},Q);
  console.log('view',JSON.stringify(info));
  const draw=()=>E(()=>{const P=window.__PH;P.gfxRender?P.gfxRender():P.renderer.render(P.scene,P.camera);});
  await draw();await draw();await wait(150);
  console.log('shadow',JSON.stringify(await E(()=>{const P=window.__PH;if(!P.shState)return null;for(let i=0;i<40;i++)P.shFit();const S=P.shState();return {size:+S.size.toFixed(1),texelCm:+(S.texel*100).toFixed(2),map:P.sun.shadow.mapSize.x};})));
  await draw();
  const full=path.join(OUT,TAG+'_'+mode+'_'+Q+'.png');await page.screenshot({path:full});
  // crops around the player and the referee (screen positions)
  const sp=await E(()=>{const P=window.__PH,G=P.G,T=window.THREE,o=[];const add=(n,x,z)=>{const v=new T.Vector3(x,.3,z).project(P.camera);o.push({n,x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight});};
    {const pl=G.player||G.pengs.find(p=>!p.goalie&&p.team===G.teams.blue);add('player',pl.rx,pl.rz);}if(G.ref&&G.ref.pg)add('ref',G.ref.x,G.ref.z);return o;});
  for(const s of sp){const w=Math.min(VP.width,260),h=Math.min(VP.height,200);const x=Math.max(0,Math.min(VP.width-w,s.x-w/2)),y=Math.max(0,Math.min(VP.height-h,s.y-h/2));
    await page.screenshot({path:path.join(OUT,TAG+'_'+mode+'_'+Q+'_'+s.n+'.png'),clip:{x,y,width:w,height:h}});}
  // close-up of a skater (model smoothness): camera 2.4 m away at chest height
  if(process.env.CLOSE){
    await E(()=>{const P=window.__PH,G=P.G,pl=G.pengs.find(p=>!p.goalie&&p.team===G.teams.blue)||G.pengs[0];
      const c=P.camera,a=pl.heading+.7;c.position.set(pl.rx+Math.sin(a)*2.4,1.35,pl.rz+Math.cos(a)*2.4);c.lookAt(pl.rx,.95,pl.rz);c.fov=38;c.updateProjectionMatrix();
      P.updateCamera=()=>{};P.renderer.render(P.scene,c);});
    await wait(120);await page.screenshot({path:path.join(OUT,TAG+'_'+mode+'_'+Q+'_close.png')});
  }
  console.log(logs.length?'ERR '+logs.slice(0,3).join(' | '):'ok '+full);await browser.close();
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
