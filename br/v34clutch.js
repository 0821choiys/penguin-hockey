// v34 comeback drama in a real browser (3D on): chase edge + heartbeat class, gold EQUALIZER! / COMEBACK! banners, COMEBACK WIN!.
// usage: node v34clutch.js <pc|tall|wide|wideS> [lang]   screenshots: shots/v34/
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',lang=process.argv[3]||'ko';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true},wideS:{width:740,height:360,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const SAVE=JSON.stringify({v:10,news18:true,points:1950,types:['basic','fast','strong','defense'],type:'fast',login:{d:1,last:99999,cyc:0,tot:1},squad:['strong','defense',null],tut:{done:true,asked:true},rl:{intro:1},
  pass:{s:1,xp:640,gold:false,cf:1,cg:0,fw:0},stats:{played:24,wins:14,goals:61,tourClears:1}});
const OUT=path.join(__dirname,'shots','v34');fs.mkdirSync(OUT,{recursive:true});
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
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(s=>{window.requestAnimationFrame=()=>0;localStorage.setItem('penguinHockey.v1',s);},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(3000);
  const E=(f,...a)=>page.evaluate(f,...a);
  const tap=async(sel)=>{const b=await E(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,vis:cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0};},sel);
    if(!b||!b.vis)return null;const top=await E((x,y)=>{const e=document.elementFromPoint(x,y);return e?(e.id||e.className||e.tagName)+'':'none';},b.x,b.y);
    if(mode==='pc')await page.mouse.click(b.x,b.y);else await page.touchscreen.tap(b.x,b.y);await wait(350);return top;};
  const shot=n=>page.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:84});

  const draw=()=>E(()=>{const P=window.__PH;P.gfxRender?P.gfxRender():P.renderer.render(P.scene,P.camera);});
  const run=(sec)=>E(n=>{const P=window.__PH,G=P.G;for(let i=0;i<n;i++){if(G.state==='play'){G.puck.x=0;G.puck.z=0;G.puck.vx=0;G.puck.vz=0;}P.step(1/60);}},Math.round(sec*60));
  const snap=async n=>{await draw();await wait(60);await shot(n);};
  const st=()=>E(()=>{const f=document.getElementById('chaseFx'),b=document.getElementById('banner'),r=b.getBoundingClientRect();
    return {on:f&&f.classList.contains('on'),op:f?+getComputedStyle(f).opacity:0,body:document.body.classList.contains('chase'),hit:document.body.classList.contains('cbhit'),
      bn:b.textContent,bc:b.className,bl:r.left,br:r.right,vw:innerWidth,sub:document.getElementById('bannerSub').textContent,toast:document.getElementById('toast').textContent,chase:window.__PH.G.hype.chase};});
  await E(()=>{const P=window.__PH,G=P.G;P.save.set.motion=false;P.startMatch({mode:'quick',size:3,time:120,diff:'normal',tag:'Q',oppTypes:['basic','fast','strong']});});
  await run(3.5);
  await E(()=>{const G=window.__PH.G;G.mine.opp.score=1;G.mine.score=0;G.timeLeft=26;window.__PH.updateScoreHud&&window.__PH.updateScoreHud();});
  await run(1.8);await wait(300);await snap('1_chase');await wait(600);let S=await st();
  ok(S.chase&&S.on&&S.op>.5&&S.body,'last 30 s, 1 goal down: red edge on ('+S.op.toFixed(2)+'), chase class on '+JSON.stringify([S.chase,S.on,S.body]));
  ok(/1/.test(S.toast),'call-out toast: '+S.toast);
  
  // the equalizer
  await E(()=>{const P=window.__PH,G=P.G;G.hype.wasBehind=true;G.mine.score=1;G.state='goal';G.stateT=3;P.clutchClear();P.hypeGoal(G.mine,null);});
  await run(.3);await wait(700);S=await st();
  ok(S.bn==='EQUALIZER!'&&/cb/.test(S.bc)&&/tier4/.test(S.bc)&&S.hit&&!S.on,'EQUALIZER!: gold tier-4 banner, gold hit, red edge off ('+S.bc+')');
  ok(S.bl>=-2&&S.br<=S.vw+2,'banner inside the screen width ('+Math.round(S.bl)+'..'+Math.round(S.br)+' of '+S.vw+')');
  await snap('2_equalizer');await run(.6);await snap('3_equalizer_confetti');
  await run(2);await wait(2600);
  await E(()=>{const P=window.__PH,G=P.G;const P2=window.__PH;for(let i=0;i<400&&G.state!=='play';i++)P2.step(1/60);document.getElementById('count').textContent='';G.mine.score=2;G.state='goal';G.stateT=3;P.hypeGoal(G.mine,null);});
  await run(.3);await wait(700);S=await st();
  ok(S.bn==='COMEBACK!'&&/GO-AHEAD/.test(S.sub)&&/cb/.test(S.bc),'COMEBACK! with GO-AHEAD! below ('+S.sub+')');
  ok(S.bl>=-2&&S.br<=S.vw+2,'COMEBACK! banner inside the screen width');
  await snap('4_comeback');
  await run(2);await wait(2600);
  await E(()=>{const P=window.__PH;P.endMatch();});await run(.3);await wait(300);S=await st();
  ok(/COMEBACK WIN!/.test(S.bn),'end: COMEBACK WIN! ('+S.bn+')');
  await snap('5_win');
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,4).join(' | '):''));
  console.log('TOTAL '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
