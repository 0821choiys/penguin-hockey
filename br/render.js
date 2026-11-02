// Real headless Chromium (SwiftShader WebGL) render checks. usage: node render.js <scenario>
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const scen=process.argv[2]||'menu';
(async()=>{
  const W=+(process.env.VW||860),H=+(process.env.VH||440);
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:W,height:H}});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_FAILED'))logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});else if(u.startsWith('file:'))r.continue();else r.abort();});
  await page.goto('file://'+path.resolve('../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2500);
  const shot=async n=>page.screenshot({path:'shots/'+n+'.jpg',type:'jpeg',quality:72});
  const E=f=>page.evaluate(f);
  if(scen==='menu'){
    await E(()=>{const P=window.__PH;const g=P.save.goals.list;if(g[0])g[0].p=P.GDEFS[g[0].id].n;P.save.stats.played=2;document.querySelector('[data-go="sGoals"]').click();document.querySelector('[data-go="sMenu"]').click();});
    await wait(600);await shot('a_menu');
  }else if(scen==='goal'){
    await E(()=>{const P=window.__PH;P.save.type='fast';P.launch('quick');for(let i=0;i<300;i++)P.step(1/60);});
    await wait(700);
    await E(()=>{const P=window.__PH,G=P.G,tm=G.mine,pk=G.puck,A=G.player,gk=tm.opp.goalie,dir=tm.dir;
      P.cbAdd('pass','PASS');G.t+=2;P.cbAdd('power','POWER SHOT');G.t+=2;P.cbAdd('steal','STEAL');
      gk.z=2.4;gk.ai.zs=2.4;A.x=9*dir;A.z=0;A.heading=dir>0?Math.PI/2:-Math.PI/2;A.vx=A.vz=0;A.cd.shoot=0;A.shotGrace=0;pk.x=A.x+1.2*dir;pk.z=0;pk.vx=pk.vz=0;pk.shot=null;
      for(const m of tm.skaters)if(m!==A){m.x=-15*dir;m.z=8;}G.timeLeft=70;
      const ax=24*dir-pk.x,az=-1.7-pk.z,l=Math.hypot(ax,az);P.performShot(A,ax/l,az/l,1);});
    await wait(350);await shot('b1_combo');
    await page.waitForFunction(()=>window.__PH.G.state==='goal',{timeout:20000,polling:40});
    await wait(380);await shot('b2_goal');
    await page.waitForFunction(()=>window.__PH.G.replay&&window.__PH.G.replay.active,{timeout:25000,polling:80});
    await wait(600);await shot('b3_replay');
  }else if(scen==='late'){
    await E(()=>{const P=window.__PH;P.renderer&&0;P.launch('quick');for(let i=0;i<300;i++)P.step(1/60);const G=P.G;G.mine.opp.score=1;G.timeLeft=8.6;});
    await wait(1400);await shot('c1_late');
    await E(()=>{const P=window.__PH,G=P.G;for(let i=0;i<6;i++){G.t+=3;P.cbAdd(['pass','power','steal','save','passShot','pass'][i],['PASS','POWER SHOT','STEAL','SAVE','PASS → SHOT','PASS'][i]);}});
    await wait(700);await shot('c2_supercombo');
  }else if(scen==='result'){
    await E(()=>{const P=window.__PH;P.save.type='fast';P.save.xp.fast=40;P.launch('quick');for(let i=0;i<300;i++)P.step(1/60);
      const G=P.G;for(let i=0;i<7;i++){G.t+=3;P.cbAdd(['pass','power','steal','save','passShot','pass','power'][i],'x');}
      G.mine.score=3;G.mine.opp.score=1;G.hype.maxStreak=2;G.hype.passes=6;G.hype.trailLate=true;G.timeLeft=.1;
      for(let i=0;i<60*8&&!(G.state==='over'&&G.resultShown);i++)P.step(1/60);});
    await page.waitForFunction(()=>window.__PH.G.state==='over'&&window.__PH.G.resultShown,{timeout:25000,polling:80});
    await wait(700);await shot('d1_result_counting');
    await wait(4500);await shot('d2_result_done');
    await E(()=>{const P=window.__PH;document.querySelector('#rBtns .btn:last-child').click();});await wait(500);
    await E(()=>{const P=window.__PH;const g=P.save.goals.list[0];g.p=P.GDEFS[g.id].n;g.c=false;document.querySelector('[data-go="sGoals"]').click();});await wait(500);await shot('d3_goals');
    await E(()=>{document.querySelector('#gTabs [data-t="rec"]').click();});await wait(400);await shot('d4_records');
    await E(()=>{document.querySelector('[data-go="sMenu"]').click();document.querySelector('[data-go="sSquad"]').click();});await wait(800);
    await E(()=>{const c=document.querySelector('#sqChem');if(c)c.scrollTop=0;});await shot('d5_squad');
  }
  const dbg=await E(()=>{const d=[...document.querySelectorAll('div')].find(x=>x.style&&x.style.zIndex==='200');return d&&d.style.display!=='none'?d.textContent:'(none)';});
  console.log(scen+': '+(logs.join(' | ')||'no page errors')+' | game error overlay: '+dbg);
  await browser.close();
})().catch(e=>{console.error('FAIL',scen,e.message);process.exit(1)});
