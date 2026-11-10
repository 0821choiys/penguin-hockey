// v39 detail pass + match show in a real browser: home tiles (emblem, double line, skate marks; the quick-match button unchanged), bolted
// boards, LED scoreboard and ringed glass buttons, the face-off light sweep, the shot streak, the goal show (light streak, rings, fireworks), flash-off and
// 절약 quality.   usage: node v39luxe.js <pc|tall|wide|wideS> [lang] [night|day]   → shots/luxe/<mode>_<lang>_*.jpg
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'tall',lang=process.argv[3]||'ko',TOD=process.argv[4]||'night';
const VP={wideS:{width:740,height:360,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1},pc:{width:1000,height:620},
  tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:['basic','fast','strong'],type:'strong',tut:{done:true,asked:true},hat:'none',rl:{intro:1},
  set:{quality:'ultra',cond:false,events:false,items:false,rules:'off',cine:'off',tod:TOD,arena:TOD==='night'?'aurora':'auto',lang}});
const OUT=path.join(__dirname,'shots','luxe');fs.mkdirSync(OUT,{recursive:true});
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
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});
  await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('seeded','1');}let seed=4242;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};},SAVE);
  const URL='file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang;
  await page.goto(URL,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{window.requestAnimationFrame=()=>0;});
  const shot=async n=>{await E(()=>{const P=window.__PH;try{P.gfxRender?P.gfxRender():P.renderer.render(P.scene,P.camera);}catch(e){}});await wait(150);await page.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:80});};
  const cdp=await page.createCDPSession();
  const tp=(type,x,y,id)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:id||1}]});
  const tap=async(x,y)=>{if(VP.hasTouch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);};
  const rect=sel=>E(s=>{const e=document.querySelector(s);if(!e)return null;if(e.closest&&e.closest('#ctlEdPanel'))e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,vis:getComputedStyle(e).display!=='none'&&r.width>0};},sel);
  const steps=n=>E(k=>{for(let i=0;i<k;i++)window.__PH.step(1/60);},n);
  // ---- 1) home: the quick-match button is the original; the tiles carry the detail (double line, skate marks, emblem) ----
  const home=await E(()=>{const q=s=>document.querySelector(s),cs=(e,p)=>getComputedStyle(e,p);const hq=q('#sMenu .hm-quick'),r=hq.getBoundingClientRect(),t=q('#sMenu .hm-tile.rkbtn'),tr=t.getBoundingClientRect(),wm=cs(t,'::after');
    return {hero:cs(hq).backgroundImage.replace(/\s/g,'')==='linear-gradient(rgb(143,226,255),rgb(44,157,242))'&&cs(hq).animationName==='none',heroH:Math.round(r.height),logoAnim:cs(q('#sMenu .l1')).animationName,menuAfter:cs(q('#sMenu'),'::after').content,
      wm:/svg/.test(wm.maskImage||wm.webkitMaskImage||''),wmOp:+wm.opacity,tileBg:/svg/.test(cs(t).backgroundImage),tileBorder:cs(t).borderTopColor,hair:/inset/.test(cs(t).boxShadow),clip:cs(t).overflow,
      txAbove:cs(t.querySelector('.tx')).zIndex,tileW:Math.round(tr.width),tileH:Math.round(tr.height)};});
  ok(home.hero&&home.heroH>=44,'home: the quick-match button looks as it did before v39 — ice-blue, no gold, no sheen (owner 2026-11-10)');
  ok(home.logoAnim==='none'&&(home.menuAfter==='none'||home.menuAfter==='normal'),'home: original logo, no rays over the rink');
  ok(home.wm&&home.wmOp>0&&home.wmOp<.3&&home.clip==='hidden'&&home.txAbove==='1','tiles: an emblem pressed into the board, under the text '+JSON.stringify({op:home.wmOp,w:home.tileW,h:home.tileH}));
  ok(home.tileBg&&home.hair&&/5, 16, 32/.test(home.tileBorder),'tiles: skate-mark texture + dark outer line + light inner hairline');
  await shot('home');
  for(const sc of['sMode','sScout','sSet']){await E(id=>window.__PH.goScreen(id),sc);await wait(350);await shot(sc);}
  const pan=await E(()=>{const p=document.querySelector('#sSet .panel'),c=getComputedStyle(p);return {b:c.borderTopColor,bolts:(c.backgroundImage.match(/radial-gradient/g)||[]).length,tex:/svg/.test(c.backgroundImage)};});
  ok(/5, 16, 32/.test(pan.b)&&pan.bolts>=4&&pan.tex,'boards: four bolts, skate marks, double line '+JSON.stringify(pan));
  await E(()=>window.__PH.goScreen('sMenu'));
  // ---- 2) match: scoreboard, buttons, then the show ----
  await E(a=>{const P=window.__PH,G=P.G;P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'T',oppTypes:['basic','fast','strong']});
    document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));for(let i=0;i<40;i++)P.step(1/60);P.updateCamera(1);},TOD);
  const intro=await E(()=>{const P=window.__PH,L=P.LX;return {ready:L.ready,introT:+L.introT.toFixed(2),sweep:L.sweep&&L.sweep.visible,beams:L.beams.filter(b=>b.m.visible).length,night:+P.G.tod.toFixed(2)};});
  ok(intro.ready&&intro.introT>0,'face-off: the show is armed '+JSON.stringify(intro));
  await shot('faceoff');
  await E(()=>{const P=window.__PH,G=P.G;for(let i=0;i<60*6&&G.state!=='play';i++)P.step(1/60);for(let i=0;i<60;i++)P.step(1/60);P.updateCamera(1);});
  await E(()=>{const P=window.__PH;for(let i=0;i<60*3;i++)P.step(1/60);});await wait(1700);await E(()=>{const P=window.__PH;for(let i=0;i<30;i++)P.step(1/60);P.updateCamera(1);});   // let the evening settle (the sky map refreshes on the wall clock)
  {const sp=await E(()=>{const P=window.__PH,L=P.LX;L.introT=.9;L.sweepT=.5;for(let i=0;i<8;i++)P.step(1/60);P.updateCamera(1);return {spots:L.beams.filter(b=>b.m.visible).length,sweep:L.sweep.visible,o:+L.beams[0].o.toFixed(2)};});
   ok(sp.spots===4&&sp.sweep,'face-off: four ice-blue follow-spots and the light sweep on the ice '+JSON.stringify(sp));await shot('spots');
   // park everyone first: a real goal during these 3 s would (rightly) light the ice again
   const idle=await E(()=>{const P=window.__PH,G=P.G,L=P.LX;G.state='play';G.stateT=0;L.introT=0;L.goalT=0;for(const o of G.pengs){o.frozen=true;o.vx=o.vz=0;}const pk=G.puck;pk.x=pk.ox=0;pk.z=pk.oz=0;pk.vx=pk.vz=0;G.carry=null;
     for(let i=0;i<60*3;i++)P.step(1/60);for(const o of G.pengs)o.frozen=false;return {spots:L.beams.filter(b=>b.m.visible).length,sweep:L.sweep.visible,st:G.state};});
   ok(idle.spots===0&&!idle.sweep,'…and open play is left clean (no lights on the ice) '+JSON.stringify(idle));}
  const hud=await E(()=>{const c=s=>getComputedStyle(document.querySelector(s));const sh=document.querySelector('#tbShoot'),r=sh.getBoundingClientRect();
    return {board:c('#board').borderTopColor,clock:c('#clock').color,ring:c('#tbShoot').boxShadow,w:Math.round(r.width),touch:document.body.classList.contains('touch')};});
  ok(/5, 16, 32/.test(hud.board)&&/255, 191, 71/.test(hud.clock),'scoreboard: LED clock (amber digits on a dot matrix), dark frame '+JSON.stringify({b:hud.board,c:hud.clock}));
  if(hud.touch)ok(hud.w>=60&&/inset/.test(hud.ring),'touch buttons: ringed glass ('+hud.w+' px wide, size unchanged by the style)');
  await shot('match');
  // a charged shot → gold streak
  const st=await E(()=>{const P=window.__PH,G=P.G,p=G.player,d=G.mine.dir;if(G.state!=='play'){G.state='play';G.stateT=0;}for(const o of G.pengs){if(o!==p){o.x=o.ox=o.rx=-d*20;o.z=o.oz=o.rz=10+G.pengs.indexOf(o)*.1;o.vx=o.vz=0;o.frozen=true;}}
    p.x=p.ox=p.rx=-6*d;p.z=p.oz=p.rz=0;p.vx=p.vz=0;p.heading=Math.PI/2*d;p.fall=0;p.cd.shoot=0;const pk=G.puck;pk.x=pk.ox=pk.rx=p.x+d*(p.r+.54);pk.z=pk.oz=pk.rz=0;pk.vx=pk.vz=0;pk.shot=null;G.carry=null;G.pass=null;
    P.step(1/120);P.performShot(p,d,0,.9);for(let i=0;i<5;i++)P.step(1/60);P.updateCamera(1);const S=P.LX.streak;
    const far=new THREE.Vector3(-1,0,0).applyMatrix4(S.matrixWorld.identity?(S.updateMatrixWorld(),S.matrixWorld):S.matrixWorld),behind=(far.x-pk.rx)*pk.vx+(far.z-pk.rz)*pk.vz<0;
    return {vis:S.visible,behind,len:+S.scale.x.toFixed(1),col:[S.material.color.r,S.material.color.g,S.material.color.b].map(v=>+v.toFixed(2)),sp:+Math.hypot(pk.vx,pk.vz).toFixed(1)};});
  ok(st.vis&&st.behind&&st.col[0]===1&&st.col[1]<=.55,'90 % shot → a burning streak behind the puck (not ahead of it) '+JSON.stringify(st));
  await shot('streak');
  // your goal → rings, rays, spotlights on the goal, fireworks
  const g1=await E(()=>{const P=window.__PH,G=P.G;const n0=P.LX.n.fw,pk=G.puck,me=G.player;pk.x=pk.ox=pk.rx=G.mine.dir*23.2;pk.z=pk.oz=pk.rz=0;pk.vx=pk.vz=0;me.x=me.ox=me.rx=G.mine.dir*17;me.z=me.oz=me.rz=2;me.vx=me.vz=0;P.scored(G.mine);for(let i=0;i<24;i++)P.step(1/60);P.updateCamera(1);const el=document.getElementById('lxRays');
    return {rays:el&&el.className,disp:el&&getComputedStyle(el).display,col:el&&el.style.getPropertyValue('--lx'),spots:P.LX.beams.filter(b=>b.m.visible).length,rings:P.LX.rings.filter(r=>r.m.visible).length,goalT:+P.LX.goalT.toFixed(2),fwQ:P.LX.fw.length+(P.LX.n.fw-n0),banner:document.getElementById('banner').textContent};});
  ok(/on mine/.test(g1.rays)&&g1.disp==='block'&&/^#/.test(g1.col||'')&&g1.rings>=2&&g1.fwQ===3,'your goal → a light streak in your colour, shock rings, 3 fireworks '+JSON.stringify(g1));
  // CSS animations stand still at their first frame in a headless capture: seek the rays to 0.5 s for the picture
  await shot('goal_ice');await E(()=>{window.__PH.lxRays('mine','#58b8ff');document.getAnimations().forEach(a=>{const t=a.effect&&a.effect.target;if(t&&t.closest&&t.closest('#lxRays')){a.pause();a.currentTime=620;}});});await wait(200);await shot('goal');
  const g2=await E(()=>{const P=window.__PH,G=P.G;for(let i=0;i<60*4;i++)P.step(1/60);const el=document.getElementById('lxRays');return {cls:el.className,rings:P.LX.rings.filter(r=>r.m.visible).length,st:G.state};});
  ok(g2.cls===''&&g2.rings===0,'…and the show clears afterwards '+JSON.stringify(g2));
  // their goal → red edge pulse, no rays
  const g3=await E(()=>{const P=window.__PH,G=P.G;G.state='play';P.scored(G.mine.opp);for(let i=0;i<10;i++)P.step(1/60);return document.getElementById('lxRays').className;});
  ok(/on theirs/.test(g3),'their goal → a red edge pulse, no streak ('+g3+')');
  // 번쩍임 off → no rays; 절약 quality → no 3D show
  const off=await E(()=>{const P=window.__PH,G=P.G;for(let i=0;i<60*4;i++)P.step(1/60);G.state='play';P.save.set.flash=false;P.applyFxSettings();const r0=P.LX.n.rays;P.scored(G.mine);const a=P.LX.n.rays-r0;
    for(let i=0;i<60*4;i++)P.step(1/60);P.save.set.flash=true;P.save.set.quality='low';P.applyFxSettings();try{P.gfxApply();}catch(e){}G.state='play';const k0=P.LX.n.ring;P.scored(G.mine);for(let i=0;i<30;i++)P.step(1/60);
    const o={raysNoFlash:a,on:P.lxOn(),rings:P.LX.n.ring-k0,vis:P.LX.rings.filter(r=>r.m.visible).length};P.save.set.quality='ultra';P.applyFxSettings();try{P.gfxApply();}catch(e){}return o;});
  ok(off.raysNoFlash===0,'번쩍임 off → no streak');
  ok(off.on===false&&off.rings===0&&off.vis===0,'절약 quality → no rings / show (the previous look) '+JSON.stringify(off));
  ok(logs.length===0,'no page errors'+(logs.length?' '+logs.slice(0,3).join(' | '):''));
  console.log('TOTAL '+mode+' '+lang+' '+TOD+': '+pass+' passed, '+fail+' failed');
  await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e);process.exit(1);});
