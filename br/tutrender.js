// Renders the tutorial in real headless Chromium. usage: node tutrender.js pc|touch
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc';
(async()=>{
  const touch=mode==='touch';
  const vp=touch?{width:780,height:360,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}:{width:860,height:460};
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:vp});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_FAILED'))logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});else if(u.startsWith('file:'))r.continue();else r.abort();});
  await page.goto('file://'+path.resolve('../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2800);
  const shot=async n=>page.screenshot({path:'shots/'+n+'.jpg',type:'jpeg',quality:72});
  const E=f=>page.evaluate(f);
  const modalOn=await E(()=>document.querySelector('#tutAsk').classList.contains('on'));
  console.log(mode+': first-launch prompt visible = '+modalOn+', IS_TOUCH body class = '+await E(()=>document.body.classList.contains('touch')));
  await shot(mode+'_1_prompt');
  await E(()=>document.querySelector('#tutYes').click());
  await E(()=>{const P=window.__PH;for(let i=0;i<30;i++)P.step(1/60);});
  await wait(1500);await shot(mode+'_2_move');
  // jump to a later step to show button highlight / charging feedback
  if(touch){
    await E(()=>{const P=window.__PH;P.TUT.i=P.TUT_STEPS.findIndex(s=>s.id==='tap');P.TUT.wait=0;P.TUT.fresh=true;P.step(1/60);P.step(1/60);});
    await wait(900);await shot(mode+'_3_tap_glow');
  }else{
    await E(()=>{const P=window.__PH;P.TUT.i=P.TUT_STEPS.findIndex(s=>s.id==='power');P.TUT.wait=0;P.TUT.fresh=true;P.step(1/60);P.step(1/60);
      P.input.shoot=true;P.input.shootPress=true;for(let i=0;i<24;i++)P.step(1/60);});
    await wait(900);await shot(mode+'_3_power_charging');
    await E(()=>{const P=window.__PH;P.input.shoot=false;P.input.shootRel=true;for(let i=0;i<4;i++)P.step(1/60);});   // ~40% charge released: should show the "longer!" note
    await wait(500);await shot(mode+'_4_power_note');
  }
  // finish: score in the goal step
  await E(()=>{const P=window.__PH,G=P.G;P.TUT.i=P.TUT_STEPS.length-1;P.TUT.wait=0;P.TUT.fresh=true;P.step(1/60);P.step(1/60);G.mine.score+=1;for(let i=0;i<150;i++)P.step(1/60);});
  await wait(2200);await shot(mode+'_5_done');
  const st=await E(()=>({done:window.__PH.save.tut.done,points:window.__PH.save.points,title:document.querySelector('#rTitle').textContent}));
  console.log(mode+': '+JSON.stringify(st)+' | '+(logs.join(' | ')||'no page errors'));
  await browser.close();
})().catch(e=>{console.error('FAIL',mode,e.message);process.exit(1)});
