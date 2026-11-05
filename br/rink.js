// rink photo set. usage: node rink.js <prefix> [html]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const pre=process.argv[2]||'base',HTML=process.argv[3]||'../penguin-hockey-improved.html';
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:1200,height:660}});
  const page=await browser.newPage();const logs=[];page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|vibrate/.test(m.text()))logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(q=>localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,points:500,types:['basic','fast','strong'],type:'fast',tut:{done:true,asked:true},cleared:{tour:true},set:{quality:q,arena:'auto'}})),process.env.Q||'high');
  await page.goto('file://'+path.resolve(HTML),{waitUntil:'load'});await wait(2600);
  await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await wait(300);
  const hideUI=()=>page.evaluate(()=>{document.querySelectorAll('.screen,#hud,nav,#combo,#banner,#bannerSub').forEach(e=>{e.style.visibility='hidden';});});
  const render=async(n,cam)=>{await page.evaluate(cam);await hideUI();
    await page.evaluate(()=>{const P=window.__PH;P.renderer.setSize(1200,660,false);P.camera.aspect=1200/660;P.camera.clearViewOffset();P.camera.updateProjectionMatrix();if(window.__cam)window.__cam(P.camera);P.renderer.render(P.scene,P.camera);});
    await wait(150);await page.evaluate(()=>{const P=window.__PH;if(window.__cam)window.__cam(P.camera);P.renderer.render(P.scene,P.camera);});
    await page.screenshot({path:'rink/'+pre+'_'+n+'.png'});};
  const match=(arena,tod)=>page.evaluate((arena,tod)=>{const P=window.__PH;P.save.set.arena=arena;P.launch('quick');for(let i=0;i<60*4;i++)P.step(1/60);if(tod!==undefined){P.G.todMode='fixed';P.G.todFixed=tod;P.setTOD(tod,99);}for(let i=0;i<30;i++)P.step(1/60);if(tod!==undefined)P.setTOD(tod,99);window.__cam=null;},arena,tod);
  await match('classic',.08);
  await render('game',()=>{});
  await render('overview',()=>{window.__cam=c=>{c.position.set(0,34,30);c.lookAt(0,0,0);};});
  await render('boards',()=>{window.__cam=c=>{c.position.set(4,1.6,8.5);c.lookAt(-10,1.0,-13);};});
  await render('goal',()=>{window.__cam=c=>{c.position.set(15.5,2.4,4.2);c.lookAt(24,.9,0);};});
  await render('menu',()=>{window.__cam=c=>{c.position.set(26,11,30);c.lookAt(0,2,-2);};});
  await render('lowice',()=>{window.__cam=c=>{c.position.set(-3,.55,6);c.lookAt(4,.2,-2);};});
  for(const [a,t] of [['aurora',.95],['sunset',.5],['final',.8],['blizzard',.16]]){await match(a,t);await render('arena_'+a,()=>{});await render('arena_'+a+'_wide',()=>{window.__cam=c=>{c.position.set(0,22,30);c.lookAt(0,0,0);};});}
  await match('classic',.95);await render('night_menu',()=>{window.__cam=c=>{c.position.set(26,11,30);c.lookAt(0,2,-2);};});await render('night_game',()=>{});
  console.log(pre,'done',logs.join(' | ')||'no page errors');
  await browser.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
