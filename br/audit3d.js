// Visual audit of the arena: menu at several orbit angles (UI visible), game camera at both ends, and close-ups (UI hidden).
// usage: node audit3d.js <pc|tall> <prefix> [html]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',pre=process.argv[3]||'a0',html=process.argv[4]||'../penguin-hockey-improved.html';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true}}[mode];
const FS=path.resolve('node_modules/@fontsource');
const fontCss=()=>['jua/index.css','fredoka/500.css','fredoka/700.css'].map(f=>{const pkg=f.split('/')[0];return fs.readFileSync(path.join(FS,f),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');
fs.mkdirSync('audit',{recursive:true});
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[];page.on('pageerror',e=>logs.push('PAGEERR '+e.message));
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss()});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(()=>localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,points:900,types:['basic','fast','strong','defense'],type:'fast',tut:{done:true,asked:true},stats:{played:5,wins:3,goals:9}})));
  await page.goto('file://'+path.resolve(html),{waitUntil:'load'});await wait(2500);
  await page.evaluate(()=>document.fonts.ready);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{window.requestAnimationFrame=()=>0;const P=window.__PH;P.G.todMode='fixed';P.G.todFixed=.3;P.setTOD(.3,99);});
  await page.screenshot();   // flush the frame queued before rAF was stubbed
  const snap=async n=>{await wait(220);await page.screenshot({path:'audit/'+pre+'_'+mode+'_'+n+'.jpg',type:'jpeg',quality:80});};
  // 1) menu with the home UI at several orbit angles
  for(const a of[-1.9,-1.2,-.6,0,.6,1.2,1.9]){
    await E(a=>{const P=window.__PH,G=P.G;G.t=Math.asin(Math.max(-1,Math.min(1,a/2)))/.05;P.step(1/60);P.renderer.render(P.scene,P.camera);},a);
    await snap('menu_'+(a<0?'m':'p')+Math.abs(a).toFixed(1));}
  // 2) game camera at both ends and centre (HUD visible)
  await E(()=>{const P=window.__PH;P.launch('quick');for(let i=0;i<90;i++)P.step(1/60);});
  for(const [n,x] of[['left',-21],['centre',0],['right',21]]){
    await E(x=>{const P=window.__PH,G=P.G;for(let k=0;k<100;k++){G.puck.x=x;G.puck.z=0;G.puck.vx=G.puck.vz=0;if(G.player){G.player.x=x*.85;G.player.z=2;}P.step(1/60);}P.renderer.render(P.scene,P.camera);},x);
    await snap('game_'+n);}
  // 3) close-ups with the UI hidden
  await E(()=>document.querySelectorAll('.screen,#hud,nav,#touch,.pts').forEach(e=>e.style.visibility='hidden'));
  const W=24,D=13;
  const views={
    goal_low:[[W-6,1.6,6.5],[W+1,1,0]],goal_high:[[W-9,8,10],[W+1,.5,0]],goal_side:[[W+1,3,9],[W+1.5,.8,0]],goal_back:[[W+9,4,3],[W,1,0]],
    board_straight:[[2,1.6,-6],[6,.8,-D]],board_corner:[[W-9,2.2,-5],[W-1,.7,-D+1]],board_end:[[W-6,2,-3],[W,.8,-6]],
    tower:[[-14,6,-6],[-W+1,6,-D-3]],bench:[[0,2.4,-7],[0,.8,-D-2]],scoreboard:[[0,9,-12],[0,8,-D-15]],
    flags:[[-10,8,-12],[-13,6,-D-12]],crest:[[0,9,7],[0,0,0]],crowd_end:[[W-3,4,10],[W+4,1,4]],overview:[[0,46,30],[0,0,0]]};
  for(const n in views){const [p,l]=views[n];
    await E((p,l)=>{const P=window.__PH;P.step(1/60);const c=P.camera;c.position.set(p[0],p[1],p[2]);c.lookAt(l[0],l[1],l[2]);P.renderer.render(P.scene,c);},p,l);
    await snap('cu_'+n);}
  // 4) penguin close-ups on the select screen (rockhopper: crest + stick)
  for(const [ty,tag] of[['balanced','rock'],['fast','gentoo']]){
    await E(ty=>{const P=window.__PH;if(!P.save.types.includes(ty))P.save.types.push(ty);P.save.type=ty;const b=document.createElement('button');b.dataset.go='sSelect';document.body.appendChild(b);b.click();b.remove();
      document.querySelectorAll('.screen,#hud,nav,#touch,.pts').forEach(e=>e.style.visibility='hidden');for(let i=0;i<40;i++)P.step(1/60);},ty);
    for(const [n,p,l] of[['front',[0,1.7,3.4],[0,1.15,0]],['side',[3.2,1.5,.6],[0,1.05,0]]]){
      await E((p,l)=>{const P=window.__PH;P.step(1/60);const c=P.camera;c.clearViewOffset&&c.clearViewOffset();c.position.set(p[0],p[1],p[2]);c.lookAt(l[0],l[1],l[2]);c.updateProjectionMatrix();P.renderer.render(P.scene,c);},p,l);
      await snap('peng_'+tag+'_'+n);}}
  console.log(mode+' audit done '+(logs.join(' | ')||'no page errors'));
  await browser.close();
})().catch(e=>{console.error('FAIL',mode,e.message);process.exit(1)});
