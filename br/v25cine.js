// v25 in a real browser (SwiftShader WebGL): the skill cinematic, frame by frame (CSS animations seeked to the scene time).
// usage: node v25cine.js <pc|tall|wide> [species,...|all] [lang]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',what=process.argv[3]||'all',lang=process.argv[4]||'ko';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const ALL=['basic','balanced','fast','defense','strong','king','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos','auk'];
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:ALL,type:'strong',squad:['basic','fast',null],tut:{done:true,asked:true},hat:'none',rl:{intro:1},set:{quality:'high',cond:false,events:false,items:false,rules:'off',cine:'full'}});
const OUT=path.join(__dirname,'shots','v25');fs.mkdirSync(OUT,{recursive:true});
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
  await E(()=>{window.requestAnimationFrame=()=>0;const st=document.createElement('style');st.textContent='#combo,#fever,#evTag{display:none!important}';document.head.appendChild(st);});await wait(200);
  const draw=()=>E(()=>{const P=window.__PH;P.gfxRender?P.gfxRender():P.renderer.render(P.scene,P.camera);});
  const snap=async(name,clip)=>{await draw();await draw();await wait(120);await page.screenshot({path:path.join(OUT,mode+'_'+name+'.jpg'),type:'jpeg',quality:86,clip});};

  const LIST=what==='all'?['strong','king','defense','little','galapagos','auk','fast','macaroni','yelloweye','african','humboldt','magellanic','royal','fiordland','balanced','basic']:what.split(',');
  const TIMES=(process.env.TIMES||'0.16,0.62,1.15,1.47,1.75,2.2').split(',').map(Number);
  for(const k of LIST){
    const info=await E(k=>{const P=window.__PH,G=P.G;P.save.type=k;P.save.squad=['basic',null,null];P.save.set.cine='full';P.save.set.motion=false;
      P.startMatch({mode:'quick',size:2,time:180,diff:'easy',tag:'T',oppTypes:['basic','basic']});document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
      G.state='play';G.stateT=0;document.getElementById('count').textContent='';for(let i=0;i<30;i++)P.step(1/60);
      const p=G.player,put=(q,x,z)=>{q.x=q.ox=q.rx=x;q.z=q.oz=q.rz=z;q.vx=q.vz=0;q.fall=0;q.slow=0;};
      for(const q of G.pengs)if(!q.goalie)put(q,-14,-9);
      put(p,-2,1);p.heading=Math.PI/2;p.cd.special=0;const mate=p.team.skaters.find(m=>m!==p);if(mate)put(mate,6,-2);
      const o=p.team.opp.skaters[0];put(o,3.2,1.6);G.puck.x=G.puck.ox=G.puck.rx=-1.0;G.puck.z=G.puck.oz=G.puck.rz=1;G.puck.vx=G.puck.vz=0;G.carry=p;
      for(let i=0;i<3;i++)P.step(1/60);P.updateCamera(1);
      const okc=P.useSpecial(p);window.__cp=p;
      return {ok:okc,cine:!!G.cine,dur:G.cine&&G.cine.dur,cls:document.getElementById('cine').className,hud:getComputedStyle(document.getElementById('board')).opacity};},k);
    ok(info.ok&&info.cine&&info.cls.includes('on'),k+': skill → cinematic ('+info.dur+' s), overlay "'+info.cls+'"');
    for(const T of TIMES){
      const st=await E(T=>{const P=window.__PH,G=P.G,c=G.cine;if(!c)return {gone:true};let n=0;while(G.cine&&G.cine.t<T-1e-6&&n++<400)P.step(Math.min(1/60,T-G.cine.t));
        const C=G.cine;if(!C)return {gone:true};const ph=C.ph,P0={p0:0,p1:C.P.band,p2:C.P.impact,p3:C.P.out}[ph];
        document.getElementById('c').style.filter='';
        for(const a of document.getAnimations()){const t=a.effect&&a.effect.target;if(t&&t.closest&&t.closest('#cine')){a.pause();a.currentTime=Math.max(0,(C.t-P0)*1000);}}
        const cam=P.camera,pp=window.__cp;return {dbg:{fov:cam.fov,asp:cam.aspect,iw:innerWidth,ih:innerHeight,d:Math.hypot(cam.position.x-pp.rx,cam.position.z-pp.rz).toFixed(2),y:cam.position.y.toFixed(2),s:pp.pg.root.scale.x,view:cam.view&&cam.view.enabled},ph,t:C.t,cls:document.getElementById('cine').className,cast:window.__cp.cast?+(window.__cp.cast.t/window.__cp.cast.dur).toFixed(2):null,clock:G.timeLeft,body:document.body.className};},T);
      if(st.gone){ok(false,k+' t='+T+': scene already over');continue;}
      await snap(k+'_'+String(T).replace('.','_'));
      console.log('   '+JSON.stringify(st.dbg)+' '+k+' t='+st.t.toFixed(2)+' '+st.ph+' cast u='+st.cast+' clock '+st.clock.toFixed(2));
    }
    const end=await E(()=>{const P=window.__PH,G=P.G;let n=0;while(G.cine&&n++<400)P.step(1/60);for(let i=0;i<40;i++)P.step(1/60);
      return {gone:!G.cine,blend:!!G.cineBlend,body:document.body.className.includes('cine'),ov:document.getElementById('cine').className,clock:G.timeLeft};});
    ok(end.gone&&!end.blend&&!end.body&&end.ov==='',k+': scene over, camera back, HUD back, clock running ('+end.clock.toFixed(2)+')');
  }
  await snap('after');
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,4).join(' | '):''));
  console.log('TOTAL '+mode+' '+what+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
