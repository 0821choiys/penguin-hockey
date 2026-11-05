// Ranked (티어 게임) in a real browser: start it from the 티어 게임 screen with a real tap / click, wait for the VS intro,
// then move with the keyboard (pc) or the touch joystick (phones) and check that the player actually moves.
// usage: node rankmove.js <pc|tall|wide|padl>
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',lang='ko';
const VP={wideS:{width:740,height:360,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:2},padp:{width:768,height:1024,isMobile:true,hasTouch:true,deviceScaleFactor:1},padl:{width:1024,height:768,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1},pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const ALL=['basic','balanced','fast','defense','strong','king','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos','auk'];
const SAVE0=1;const SAVE=JSON.stringify({v:10,news18:true,points:900,types:ALL,type:'strong',squad:['basic','fast',null],tut:{done:true,asked:true},hat:'none',rl:{intro:1},set:{quality:'ultra',cond:false,events:false,items:false,rules:'full',cine:'full',tod:'day'}});
const OUT=path.join(__dirname,'shots','rank');fs.mkdirSync(OUT,{recursive:true});
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
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(s=>{localStorage.setItem('penguinHockey.v1',s);let seed=4242;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};},SAVE);
  var cerr=[];page.on('console',m=>{if(m.type()==='error')cerr.push(m.text().slice(0,200));});
  await page.goto('file://'+path.resolve(process.env.HTML||path.join(__dirname,'../penguin-hockey-improved.html'))+'?lang='+lang,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  // real frames: keep requestAnimationFrame running
  await E(()=>window.__PH.goScreen('sRanked'));await wait(600);
  const RK=process.env.RK||'ranked';
  const b=await E(RK=>{const x=document.querySelector('[data-rk="'+RK+'"]');if(!x)return null;x.scrollIntoView({block:'center'});const r=x.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,t:x.textContent.trim().slice(0,30),dis:x.disabled};},RK);
  console.log('ranked button',JSON.stringify(b));
  if(!b){console.log('NO BUTTON');await browser.close();process.exit(1);}
  if(VP.hasTouch)await page.touchscreen.tap(b.x,b.y);else await page.mouse.click(b.x,b.y);
  await wait(4200);   // VS intro 2 s + countdown
  const st=async()=>E(()=>{const G=window.__PH.G,p=G.player;return {view:G.view,state:G.state,ui:G.ui,mode:G.cfg&&G.cfg.mode,paused:G.paused,p:p?[+p.rx.toFixed(2),+p.rz.toFixed(2)]:null,ix:window.__PH.input?[window.__PH.input.x,window.__PH.input.z]:null,cine:!!G.cine,tut:!!(window.__PH.TUT&&window.__PH.TUT.active),ov:[...document.querySelectorAll('.on')].filter(e=>getComputedStyle(e).position==='fixed').map(e=>e.id||e.className).slice(0,8)};});
  // the real loop runs far below real time on software WebGL here, so time is advanced by hand from now on
  await E(()=>{window.requestAnimationFrame=()=>0;});
  let s0=await st();console.log('after start',JSON.stringify(s0));
  await E(()=>{const P=window.__PH;for(let i=0;i<60*4;i++)P.step(1/60);});
  s0=await st();console.log('after 4 s',JSON.stringify(s0));
  const stepN=n=>E(n=>{const P=window.__PH;for(let i=0;i<n;i++)P.step(1/60);},n);
  if(VP.hasTouch){
    const z=await E(()=>{const r=document.getElementById('joyZone').getBoundingClientRect();return {x:r.left+r.width*.3,y:r.top+r.height*.6};});
    const c=await page.createCDPSession();const tp=(type,x,y)=>c.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
    await tp('touchStart',z.x,z.y);for(let i=1;i<=6;i++){await tp('touchMove',z.x+i*12,z.y-i*4);}
    for(let i=0;i<6;i++)await stepN(10);
    var s1=await st();console.log('touch joystick held 1 s',JSON.stringify(s1));await tp('touchEnd');
  }else{
    await page.keyboard.down('ArrowRight');for(let i=0;i<6;i++)await stepN(10);var s1=await st();await page.keyboard.up('ArrowRight');console.log('ArrowRight held 1 s',JSON.stringify(s1));
    await page.keyboard.down('KeyW');for(let i=0;i<6;i++)await stepN(10);const s2=await st();await page.keyboard.up('KeyW');console.log('W held 1 s',JSON.stringify(s2));
  }
  // 20 s of play pushing toward the puck, then report stretches where the human did not move
  const long=await E(()=>{const P=window.__PH,G=P.G,I=P.input;let still=0,run=0,worst=0,info=null,frames=0;
    for(let i=0;i<60*20;i++){const p=G.player;if(p&&G.state==='play'){const dx=G.puck.rx-p.rx,dz=G.puck.rz-p.rz,l=Math.hypot(dx,dz)||1;I.x=dx/l;I.z=dz/l;}else{I.x=I.z=0;}
      const x0=p&&p.rx,z0=p&&p.rz;P.step(1/60);
      if(p&&G.player===p&&G.state==='play'&&(I.x||I.z)){frames++;if(Math.hypot(p.rx-x0,p.rz-z0)<.004){still++;run++;if(run>worst){worst=run;info={t:+G.elapsed.toFixed(1),frozen:!!p.frozen,boxed:!!p.boxed,fall:p.fall,pose:p.pose};}}else run=0;}}
    I.x=I.z=0;return {frames,still,worst,info,dbg:(document.getElementById('dbg')||{}).textContent||''};});
  console.log('20 s of play',JSON.stringify(long));
  console.log('console errors: '+cerr.length+(cerr.length?' | '+[...new Set(cerr)].slice(0,4).join(' | '):''));
  const moved=s0.p&&s1.p&&Math.hypot(s1.p[0]-s0.p[0],s1.p[1]-s0.p[1]);
  console.log((moved>0.8?'PASS':'FAIL')+' player moved '+(moved||0).toFixed(2)+' m in a ranked match ('+mode+')');
  await page.screenshot({path:path.join(OUT,mode+'_moved.jpg'),type:'jpeg',quality:80});
  console.log(logs.length?'ERR '+logs.slice(0,4).join(' | '):'no page errors');
  await browser.close();process.exit(moved>0.8?0:1);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
