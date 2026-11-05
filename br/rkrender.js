// usage: node rkrender.js pc|touch
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc';
(async()=>{
  const touch=mode==='touch';
  const vp=touch?{width:780,height:360,isMobile:true,hasTouch:true,isLandscape:true}:{width:900,height:560};
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:vp});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_FAILED'))logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});else if(u.startsWith('file:'))r.continue();else r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(()=>{localStorage.setItem('penguinHockey.v1',JSON.stringify({v:8,points:900,types:['basic','fast','strong'],type:'fast',lv:{fast:6,strong:3,basic:2},stats:{played:14,wins:9,goals:30},tut:{done:true,asked:true},
    profile:{name:'최감독',club:'부천 펭귄스',emb:'🦭',city:'부천',since:Date.now()-5*864e5,seed:4242},
    mgr:{r:1185,games:14,w:9,d:1,l:4,best:1210,form:['W','W','L','D','W'],hist:[]},
    trial:{day:0,ts:0,used:{city:1,nat:0},run:{kind:'city',round:1,opp:['부천 아이스 FC','부천 블리자드','부천 오로라 (우승 후보)'],city:'부천'},titles:{city:0,nat:0},first:{city:false,nat:false}}}));});
  await page.goto('file://'+path.resolve('../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2800);
  const shot=async n=>page.screenshot({path:'shots/'+n+'.jpg',type:'jpeg',quality:72});
  const E=f=>page.evaluate(f);const click=sel=>E(new Function('document.querySelector('+JSON.stringify(sel)+').click()'));
  await shot(mode+'_r_home');
  await click('[data-go="sMode"]');await wait(500);await shot(mode+'_r_modes');
  await click('#sMode [data-go="sRanked"]');await wait(600);await shot(mode+'_r_hub');
  // continue the live city bracket: VS intro
  await E(()=>{document.querySelector('[data-rk="city"]').click();});await wait(900);await shot(mode+'_r_vs');
  await wait(1800);
  // win the 4강 and the final to reach the champion screen
  await E(()=>{const P=window.__PH,G=P.G;
    const fin=()=>{let w=0;while(G.state!=='play'&&w<600){P.step(1/60);w++;}G.mine.score=2;G.mine.opp.score=1;G.timeLeft=.05;w=0;while(!(G.state==='over'&&G.resultShown)&&w<60*20){P.step(1/60);w++;}};
    fin();});
  await wait(1200);await shot(mode+'_r_next');
  await E(()=>{const P=window.__PH;P.save.trial.run&&P.trialPlay();});await wait(2400);
  await E(()=>{const P=window.__PH,G=P.G;let w=0;while(G.state!=='play'&&w<600){P.step(1/60);w++;}G.mine.score=3;G.mine.opp.score=1;G.timeLeft=.05;w=0;while(!(G.state==='over'&&G.resultShown)&&w<60*20){P.step(1/60);w++;}});
  await wait(4500);await shot(mode+'_r_champ');
  await E(()=>{document.querySelector('#rBtns .btn').click();});await wait(900);await shot(mode+'_r_hub2');
  const st=await E(()=>({titles:window.__PH.save.trial.titles,run:window.__PH.save.trial.run,r:window.__PH.save.mgr.r}));
  console.log(mode+': '+JSON.stringify(st)+' | '+(logs.join(' | ')||'no page errors'));
  await browser.close();
})().catch(e=>{console.error('FAIL',mode,e.message);process.exit(1)});
