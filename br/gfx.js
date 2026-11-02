// Graphics capture: the same scenes rendered for real (SwiftShader WebGL) from a given build, plus a rough GPU-cost probe.
// usage: HTML=../base18.html node gfx.js <prefix> [pc|tall] [scene,scene...]   (QUALITY=ultra|high|low to force the setting)
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const pre=process.argv[2]||'g',mode=process.argv[3]||'pc',only=(process.argv[4]||'').split(',').filter(Boolean);
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const ALL=['basic','balanced','fast','defense','strong','king','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos'];
const Q=process.env.QUALITY||'';
const SAVE=JSON.stringify(Object.assign({v:10,news18:true,points:900,types:ALL,type:'king',squad:['macaroni','fast',null],tut:{done:true,asked:true},hat:'none'},Q?{set:{quality:Q}}:{}));
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error')logs.push('CONSOLE '+m.text().slice(0,200));else if(/^(tod|dbg)/.test(m.text()))console.log('  page:',m.text());});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'node_modules/three/build/three.min.js'))});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(s=>{window.requestAnimationFrame=()=>0;localStorage.setItem('penguinHockey.v1',s);let seed=4242;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};},SAVE);
  const html=path.resolve(__dirname,process.env.HTML||'../penguin-hockey-improved.html');
  await page.goto('file://'+html+'?lang=ko',{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{window.requestAnimationFrame=()=>0;const st=document.createElement('style');st.textContent='#combo,#fever,#evTag,#hypeTag,#bigNum{display:none!important}body.fever.ingame::after{display:none!important}';document.head.appendChild(st);});await wait(300);
  // one frame through the game's own path (post-processing included when the build has it)
  const draw=()=>E(()=>{const P=window.__PH;if(P.gfxRender)P.gfxRender();else P.renderer.render(P.scene,P.camera);});
  const cost=async()=>E(()=>{const P=window.__PH,gl=P.renderer.getContext();const go=()=>{if(P.gfxRender)P.gfxRender();else P.renderer.render(P.scene,P.camera);};P.renderer.info.autoReset=false;go();gl.finish();
    P.renderer.info.reset();const a=performance.now();for(let i=0;i<4;i++)go();gl.finish();const info=P.renderer.info.render;info.calls=Math.round(info.calls/4);info.triangles=Math.round(info.triangles/4);P.renderer.info.autoReset=true;return {ms:Math.round((performance.now()-a)/4),calls:info.calls,tris:info.triangles};});
  // PAIR=1: the same frame twice from one session — tier 0 (the v18 image) as '<pre>0', the chosen setting as '<pre>'
  const snap=async(n,tag)=>{await draw();await draw();await wait(150);await page.screenshot({path:path.join(__dirname,'shots','gfx_'+tag+'_'+mode+'_'+n+'.jpg'),type:'jpeg',quality:88});};
  const shot=async(n,setup)=>{if(only.length&&!only.includes(n))return;await E(setup);
    if(process.env.PAIR){await E(()=>{window.__PH.GFX.drop=9;});await snap(n,pre+'0');await E(()=>{window.__PH.GFX.drop=0;});}
    await snap(n,pre);
    const c=await cost();console.log(n.padEnd(10),JSON.stringify(c));};
  const steps=(n)=>{const P=window.__PH;for(let i=0;i<n;i++)P.step(1/60);};
  const match=(tod,arena)=>{const P=window.__PH;P.save.set.cond=false;P.save.set.events=false;P.save.set.items=false;if(arena)P.save.set.arena=arena;
    P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'Q',todFixed:tod,oppTypes:['african','galapagos','royal']});document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
    const G=P.G;G.state='play';G.stateT=0;document.getElementById('count').textContent='';for(let i=0;i<240;i++)P.step(1/60);};
  const reseed=()=>E(()=>{let seed=777;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};});
  await reseed();
  await shot('menu',()=>{const P=window.__PH;for(let i=0;i<90;i++)P.step(1/60);});
  await reseed();
  await shot('game',()=>{(window.__m=window.__m||((tod)=>{const P=window.__PH;P.save.set.cond=false;P.save.set.events=false;P.save.set.items=false;P.save.set.arena='auto';
    P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'Q',todFixed:tod,oppTypes:['african','galapagos','royal']});document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
    const G=P.G;G.state='play';G.stateT=0;document.getElementById('count').textContent='';for(let i=0;i<240;i++)P.step(1/60);}))(0.02);});
  await shot('close',()=>{const P=window.__PH,G=P.G;if(!G.pengs.length)window.__m(0.02);const p=G.player,c=P.camera;
    // stand three skaters together near centre ice and look at them from low and close
    const sk=G.pengs.filter(q=>!q.goalie).slice(0,4);sk.forEach((q,i)=>{q.x=q.ox=q.rx=-2+i*1.6;q.z=q.oz=q.rz=(i%2)*1.2;q.vx=q.vz=0;q.heading=Math.PI*.15;});
    G.puck.x=G.puck.ox=G.puck.rx=0.4;G.puck.z=G.puck.oz=G.puck.rz=2;for(let i=0;i<20;i++)P.step(1/60);
    P.updateCamera=P.updateCamera;c.clearViewOffset();c.position.set(1.2,2.0,8.4);c.lookAt(0.2,.9,.4);});
  await shot('goal',()=>{const P=window.__PH,G=P.G,g=G.mine.opp.goalie,c=P.camera;c.position.set(g.x-7*Math.sign(g.x),2.6,g.z+4.5);c.lookAt(g.x,.8,g.z);});
  await shot('night',()=>{const P=window.__PH,G=P.G;G.todMode='fixed';G.todFixed=.95;G.tod=.95;for(let i=0;i<120;i++)P.step(1/60);console.log('tod',G.tod,G.todMode,G.arena,P.renderer.toneMappingExposure);});
  await shot('nightlow',()=>{const P=window.__PH,G=P.G,c=P.camera;c.clearViewOffset();c.position.set(-6,1.6,9);c.lookAt(2,1.2,-2);});
  await shot('dusk',()=>{const P=window.__PH,G=P.G;G.todMode='fixed';G.todFixed=.5;G.tod=.5;for(let i=0;i<120;i++)P.step(1/60);});
  console.log(pre,mode,logs.length?logs.slice(0,5).join(' | '):'no page errors');await browser.close();process.exit(0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
