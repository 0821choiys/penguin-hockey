// Renders the great auk 3D model, card, tier hub (world + 개발자) and the reveal overlay.
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:900,height:560}});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_FAILED'))logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});else if(u.startsWith('file:'))r.continue();else r.abort();});
  await page.evaluateOnNewDocument(()=>{localStorage.setItem('penguinHockey.v1',JSON.stringify({v:9,points:5000,types:['basic','fast','strong','auk'],type:'auk',lv:{fast:6,strong:3,basic:2,auk:10},stats:{played:80,wins:60,goals:200},tut:{done:true,asked:true},
    profile:{name:'최감독',club:'부천 펭귄스',emb:'🦭',city:'부천',since:Date.now()-40*864e5,seed:4242},dev:{got:true,ts:Date.now()},
    mgr:{r:2134,games:80,w:60,d:5,l:15,best:2150,form:['W','W','W','D','W'],hist:[]},
    trial:{day:0,ts:0,used:{city:0,nat:0,world:0},run:null,titles:{city:2,nat:1,world:1},first:{city:true,nat:true,world:true},cityName:'부천'}}));});
  await page.goto('file://'+path.resolve('../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2800);
  const shot=async n=>page.screenshot({path:'shots/'+n+'.jpg',type:'jpeg',quality:78});
  const E=f=>page.evaluate(f);const click=sel=>E(new Function('document.querySelector('+JSON.stringify(sel)+').click()'));
  await click('[data-go="sSelect"]');await wait(3500);await shot('d_select_auk');
  await click('[data-go="sMenu"]');await wait(300);
  await click('[data-go="sRanked"]');await wait(700);await shot('d_hub');
  await E(()=>{const el=document.querySelector('#sRanked .panel');el.scrollTop=9999;});await wait(300);await shot('d_hub_bottom');
  // in-game close-up of the auk
  await E(()=>{const P=window.__PH;P.launch('quick');for(let i=0;i<260;i++)P.step(1/60);});await wait(3000);await shot('d_ingame');
  // reveal overlay (3D loop paused so the screenshot is quick)
  await E(()=>{window.requestAnimationFrame=()=>{};window.__PH.devReveal();});await wait(1600);await shot('d_reveal');
  console.log(logs.join(' | ')||'no page errors');
  await browser.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
