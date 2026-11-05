// v10 real-browser checks (SwiftShader WebGL). usage: node v10.js <scenario>
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const scen=process.argv[2]||'home';
const PORTRAIT=scen==='touchP',LAND=scen==='touchL';
(async()=>{
  const vp=PORTRAIT?{width:360,height:740,isMobile:true,hasTouch:true}:LAND?{width:780,height:360,isMobile:true,hasTouch:true,isLandscape:true}:{width:+(process.env.VW||900),height:+(process.env.VH||560)};
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:vp});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_FAILED')&&!m.text().includes('net::'))logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  const threeMode=scen==='loadFail'?'fail':scen==='loadSlow'?'slow':scen==='loadHang'?'hang':'ok';
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js')){
      if(threeMode==='fail')return r.abort();if(threeMode==='hang')return;
      const send=()=>r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});
      if(threeMode==='slow')setTimeout(send,9000);else send();return;}
    if(u.startsWith('file:'))r.continue();else r.abort();});
  if(process.env.SAVE)await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(s=>{localStorage.setItem('penguinHockey.v1',s);},process.env.SAVE);
  if(scen.startsWith('load')){page.goto('file://'+path.resolve(process.env.HTML||'../penguin-hockey-improved.html'),{timeout:0}).catch(()=>{});await wait(300);}else await page.goto('file://'+path.resolve(process.env.HTML||'../penguin-hockey-improved.html'),{waitUntil:scen.startsWith('load')?'domcontentloaded':'load'});
  const shot=async n=>page.screenshot({path:'shots/v10_'+n+'.jpg',type:'jpeg',quality:72});
  const E=(f,...a)=>page.evaluate(f,...a);
  if(scen==='loadSlow'){await wait(1500);await shot('load_1');await wait(5600);await shot('load_slow');await wait(4000);await shot('load_done');}
  else if(scen==='loadHang'){await wait(1500);await shot('hang_1');console.log(await E(()=>document.querySelector('#loading').style.display+'|'+document.querySelector('#loadSub').textContent));await wait(6000);await shot('hang_7s');console.log(await E(()=>document.querySelector('#loadSub').textContent));await browser.close();return;}
  else if(scen==='loadFail'){await wait(1500);await shot('load_fail');}
  else await wait(2600);
  const S=(f,n)=>E((f,n)=>{const P=window.__PH;for(let i=0;i<n;i++)P.step(1/60);},f,n);
  const steps=n=>E(n=>{const P=window.__PH;for(let i=0;i<n;i++)P.step(1/60);},n);
  if(scen==='home'){
    await shot('home');
    await E(()=>document.querySelector('[data-go="sSet"]').click());await wait(500);await shot('settings_top');
    await E(()=>{const s=document.querySelector('#sSet');s.scrollTop=9999;});await wait(300);await shot('settings_bottom');
    await E(()=>{document.querySelector('#sSet [data-go="sMenu"]').click();document.querySelector('[data-go="sMode"]').click();document.querySelector('#sMode [data-mode="challenge"]').click();});await wait(500);
    await E(()=>{const s=document.querySelector('#sChal');s.scrollTop=9999;});await wait(300);await shot('challenges');
    await E(()=>{document.querySelector('#sChal [data-go="sMode"]').click();document.querySelector('#sMode [data-go="sMenu"]').click();document.querySelector('[data-go="sHow"]').click();});await wait(400);
    await E(()=>{const s=document.querySelector('#sHow');s.scrollTop=9999;});await shot('howto');
    await E(()=>{document.querySelector('#sHow [data-go="sMenu"]').click();document.querySelector('[data-go="sScout"]').click();document.querySelector('#scTabs [data-t="dex"]')?document.querySelector('#scTabs [data-t="dex"]').click():[...document.querySelectorAll('#scTabs button')].pop().click();});await wait(500);await shot('dex');
  }else if(scen==='aim'){
    await E(()=>{const P=window.__PH;P.launch('quick');for(let i=0;i<260;i++)P.step(1/60);});
    await E(()=>{const P=window.__PH,G=P.G,A=G.player,dir=G.mine.dir,pk=G.puck;A.x=15*dir;A.z=-2;A.vx=A.vz=0;const ax=24*dir-A.x,az=1.8-A.z,l=Math.hypot(ax,az);A.heading=Math.atan2(ax,az);pk.x=A.x+ax/l*1.1;pk.z=A.z+az/l*1.1;pk.vx=pk.vz=0;
      for(const o of G.mine.opp.skaters){o.x=-14*dir;o.z=8;o.vx=o.vz=0;}
      P.input.shoot=true;P.input.shootPress=true;for(let i=0;i<30;i++){P.step(1/60);A.x=15*dir;A.z=-2;A.vx=A.vz=0;pk.x=A.x+ax/l*1.1;pk.z=A.z+az/l*1.1;pk.vx=pk.vz=0;A.heading=Math.atan2(ax,az);}});
    await wait(300);await shot('aim_on_target');
    await E(()=>{const P=window.__PH,G=P.G,A=G.player,dir=G.mine.dir,pk=G.puck;const ax=0,az=1;A.heading=0;for(let i=0;i<6;i++){P.step(1/60);A.vx=A.vz=0;pk.x=A.x;pk.z=A.z+1.1;pk.vx=pk.vz=0;A.heading=0;}});
    await wait(300);await shot('aim_off_target');
    await E(()=>{const P=window.__PH,G=P.G,A=G.player;P.input.shoot=false;P.input.shootRel=true;P.step(1/60);
      const m=G.mine.skaters.find(s=>s!==A);m.x=A.x-6*G.mine.dir;m.z=5;G.puck.x=A.x+.9*G.mine.dir;G.puck.z=A.z;G.puck.vx=G.puck.vz=0;A.cd.pass=0;A.shotGrace=0;A.heading=Math.atan2(m.x-A.x,m.z-A.z);P.doPass(A,m);P.step(1/60);P.step(1/60);});
    await wait(250);await shot('pass_inflight');
  }else if(scen.startsWith('arena')){
    const a=scen.split('_')[1];
    await E(a=>{const P=window.__PH;P.save.set.arena=a;P.save.cleared.tour=true;P.launch('quick');for(let i=0;i<240;i++)P.step(1/60);},a);
    await wait(1200);await shot('arena_'+a);
    const info=await E(()=>{const G=window.__PH.G;return {arena:G.arena,tod:G.tod.toFixed(2),wx:G.wx.mode,wint:G.wx.int.toFixed(2)};});
    console.log(JSON.stringify(info));
  }else if(scen==='champ'){
    await E(()=>{const P=window.__PH,G=P.G;G.tour={round:P.TOUR.length-1,champPaid:false};const r=P.TOUR[G.tour.round];
      P.startMatch({mode:'tour',size:3,time:120,diff:r.diff,oppTypes:r.types,todFixed:r.tod,tag:'TOURNAMENT 3/3 vs '+r.name});for(let i=0;i<240;i++)P.step(1/60);
      G.mine.score=2;G.mine.opp.score=1;G.timeLeft=.05;for(let i=0;i<12;i++)P.step(1/60);});
    await wait(500);await shot('champ_1');await steps(40);await wait(400);await shot('champ_2');
    const st=await E(()=>({arena:window.__PH.G.arena,state:window.__PH.G.state,final:window.__PH.G.cfg.final}));console.log(JSON.stringify(st));
  }else if(scen==='goaltags'){
    // equalizer in the last seconds: banner must fit the screen
    await E(()=>{const P=window.__PH,G=P.G;P.launch('quick');for(let i=0;i<260;i++)P.step(1/60);G.mine.opp.score=1;G.timeLeft=6;G.hype.wasBehind=true;
      const A=G.player,dir=G.mine.dir,pk=G.puck,gk=G.mine.opp.goalie;gk.z=-2.4;gk.ai.zs=-2.4;A.x=12*dir;A.z=0;A.vx=A.vz=0;pk.x=A.x+1.1*dir;pk.z=0;pk.vx=pk.vz=0;for(const o of G.mine.opp.skaters){o.x=-14*dir;o.z=8;}
      const ax=24*dir-pk.x,az=2.2-pk.z,l=Math.hypot(ax,az);P.performShot(A,ax/l,az/l,.6);});
    await page.waitForFunction(()=>window.__PH.G.state==='goal',{timeout:20000,polling:30});await wait(350);await shot('equalizer');
    const b=await E(()=>{const b=document.querySelector('#banner');return {txt:b.textContent,sub:document.querySelector('#bannerSub').textContent,w:b.scrollWidth,vw:innerWidth};});console.log(JSON.stringify(b));
  }else if(scen==='touchP'||scen==='touchL'){
    await shot(scen+'_home');
    await E(()=>{const P=window.__PH;P.launch('quick');for(let i=0;i<260;i++)P.step(1/60);});await wait(900);
    const r=await E(()=>{const q=s=>{const b=document.querySelector(s).getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.right),Math.round(b.bottom)];};
      const ids=['#tbShoot','#tbPass','#tbDash','#tbSpec','#tbSwap','#joyZone','#charge','#gauge'],o={};ids.forEach(i=>o[i]=q(i));
      const ov=[];const btn=ids.slice(0,5);for(let i=0;i<btn.length;i++)for(let j=i+1;j<btn.length;j++){const a=o[btn[i]],b=o[btn[j]];if(a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3])ov.push(btn[i]+'x'+btn[j]);}
      const jz=o['#joyZone'];for(const b of btn){const a=o[b];if(a[0]<jz[2]&&jz[0]<a[2]&&a[1]<jz[3]&&jz[1]<a[3])ov.push(b+'xJoy');}
      return {rects:o,overlaps:ov,vw:innerWidth,vh:innerHeight};});
    console.log(JSON.stringify(r));await shot(scen+'_game');
    await E(()=>{document.querySelector('#bPause').click();});await wait(400);await shot(scen+'_pause');
  }else if(scen==='species'){
    await E(()=>{const P=window.__PH,G=P.G;document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));document.querySelector('#pts').style.display='none';
      P.launch('free');for(let i=0;i<5;i++)P.step(1/60);for(const p of G.pengs)p.pg.root.visible=false;
      const ks=['basic','fast','strong','defense','balanced','auk'];window.__line=ks.map((k,i)=>{const pg=P.buildPenguin(k,'blue','none');pg.root.position.set((i-2.5)*2.1,0,0);pg.root.rotation.y=.35;P.scene.add(pg.root);return pg;});
      G.paused=true;document.querySelector('#sPause').classList.remove('on');document.body.classList.remove('ingame');
      P.camera.position.set(0,2.6,9.5);P.camera.lookAt(0,1.0,0);P.camera.clearViewOffset();});
    await wait(2500);await shot('species_front');
    await E(()=>{for(const pg of window.__line)pg.root.rotation.y=-1.2;});await wait(2000);await shot('species_side');
    await E(()=>{const P=window.__PH;const ks=['basic','fast','strong','defense','balanced','auk'];const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:300;background:#123;display:flex;gap:6px;padding:20px;align-items:center;justify-content:center';d.style.flexWrap='wrap';d.innerHTML=ks.map(k=>'<div style="--cw:130px">'+P.cardHtml(k)+'</div>').join('')+'<div style="flex-basis:100%"></div>'+[['basic',3],['balanced',1],['defense',2],['strong',0]].map(a=>'<div style="--cw:130px">'+P.cardHtml(a[0],{g:a[1],lv:a[1]*3,tag:a[1]===3?'NEW':''})+'</div>').join('')+'<div style="--cw:130px"><div class="pc-backface">?</div></div><div style="--cw:62px">'+P.cardHtml('fast')+'</div><div style="--cw:62px">'+P.cardHtml('auk')+'</div>';document.body.appendChild(d);});
    await wait(800);await shot('species_cards');
  }else if(scen==='goalie'){
    await E(()=>{const P=window.__PH,G=P.G;P.launch('quick');for(let i=0;i<260;i++)P.step(1/60);G.puck.x=G.mine.dir*14;G.puck.z=1;G.puck.vx=G.puck.vz=0;G.player.x=G.mine.dir*12;for(let i=0;i<40;i++)P.step(1/60);});
    await wait(800);await shot('goalie_play');
    const r=await E(()=>{const G=window.__PH.G;return G.pengs.filter(p=>p.goalie).map(g=>({team:g.team.key,x:+g.x.toFixed(1),facesX:+Math.sin(g.heading).toFixed(2),towardCenter:Math.sign(Math.sin(g.heading))===-Math.sign(g.x)}));});
    console.log(JSON.stringify(r));
    await E(()=>{const P=window.__PH,G=P.G,g=G.mine.opp.goalie;g.diveT=.5;g.diveDir=1;for(let i=0;i<12;i++){g.diveT=.5;P.step(1/60);}});await wait(600);await shot('goalie_dive');
  }else if(scen==='code'){
    await E(()=>document.querySelector('[data-go="sSet"]').click());await wait(400);
    await E(()=>{document.querySelector('#sSet').scrollTop=9999;});
    await page.click('#codeIn');await page.keyboard.type('YSGAMES777');await wait(200);await shot('code_typed');
    await page.keyboard.press('Enter');await wait(500);await shot('code_done');
    const r=await E(()=>({has:window.__PH.save.types.includes('auk'),lv:window.__PH.save.lv.auk,msg:document.querySelector('#msg').textContent}));console.log(JSON.stringify(r));
    await E(()=>{document.querySelector('#sSet [data-go="sMenu"]').click();document.querySelector('[data-go="sSquad"]').click();});await wait(900);await shot('code_squad');
  }else if(scen==='fun'){
    await E(()=>{const P=window.__PH,G=P.G;P.launch('quick');for(let i=0;i<260;i++)P.step(1/60);const p=G.player,d=G.mine.dir;
      P.spawnItem('fish',p.x+3*d,p.z+2);P.spawnItem('fire',p.x+6*d,p.z-3);for(let i=0;i<20;i++)P.step(1/60);});
    await wait(500);await shot('fun_items');
    await E(()=>{const P=window.__PH,G=P.G;for(let i=0;i<5;i++){G.t+=3;P.cbAdd(['pass','power','steal','save','passShot'][i],'x');}G.player.fireT=8;G.player.boostT=4;for(let i=0;i<10;i++)P.step(1/60);
      const st=document.createElement('style');st.textContent='*{transition:none!important}';document.head.appendChild(st);});
    await wait(500);await shot('fun_fever');
    await E(()=>{const P=window.__PH,G=P.G;G.hype.feverT=0;G.mine.score=2;G.mine.opp.score=2;G.ot=true;G.otLeft=.01;for(let i=0;i<130;i++)P.step(1/60);P.soResult(true);for(let i=0;i<110;i++)P.step(1/60);P.soResult(false);for(let i=0;i<110;i++)P.step(1/60);});
    await wait(500);await shot('fun_shootout');
    console.log(JSON.stringify(await E(()=>{const G=window.__PH.G;return {so:G.so&&G.so.s,phase:G.so&&G.so.phase,hud:document.querySelector('#soHud').textContent};})));
  }else if(scen==='events'){
    await E(()=>{const P=window.__PH,G=P.G;P.launch('quick');for(let i=0;i<260;i++)P.step(1/60);P.evStart('seal');const ev=G.ev;ev.t=2.6;ev.z=-ev.dz*(13+1.5)+ev.dz*(2*(13+1.5)/ev.dur)*2.6;for(let i=0;i<4;i++)P.step(1/60);G.cam.x=ev.x;
      const st=document.createElement('style');st.textContent='*{transition:none!important}';document.head.appendChild(st);for(let i=0;i<30;i++)P.step(1/60);});
    await wait(500);await shot('ev_seal');
    await E(()=>{const P=window.__PH,G=P.G;G.ev=null;P.evStart('golden');for(let i=0;i<30;i++)P.step(1/60);});await wait(500);await shot('ev_golden');
    await E(()=>{document.querySelector('#bPause').click();document.querySelector('#pQuit').click();document.querySelector('[data-go="sMode"]').click();});await wait(600);await shot('ev_modes');
  }else if(scen==='carry'){
    await E(()=>{const P=window.__PH,G=P.G;P.launch('quick');for(let i=0;i<260;i++)P.step(1/60);const p=G.player,pk=G.puck,d=G.mine.dir;
      for(const o of G.mine.opp.skaters){o.x=-16*d;o.z=9;}p.x=2*d;p.z=1;p.vx=p.vz=0;p.heading=d>0?Math.PI/2:-Math.PI/2;pk.x=p.x+1.4*d;pk.z=p.z;pk.vx=pk.vz=0;
      P.input.x=d;P.input.z=.3;for(let i=0;i<70;i++)P.step(1/60);P.input.x=0;P.input.z=0;});
    await wait(600);await shot('carry');
    console.log(JSON.stringify(await E(()=>{const G=window.__PH.G;const el=document.elementFromPoint(450,520);return{el:el&&(el.id||el.className||el.tagName),dist:+Math.hypot(G.puck.x-G.player.x,G.puck.z-G.player.z).toFixed(2)};})));
  }else if(scen==='dbg'){
    await E(()=>{const P=window.__PH;P.launch('quick');for(let i=0;i<260;i++)P.step(1/60);const G=P.G;G.mine.opp.score=1;G.timeLeft=6;const A=G.player,dir=G.mine.dir,pk=G.puck,gk=G.mine.opp.goalie;gk.z=-2.4;gk.ai.zs=-2.4;A.x=12*dir;A.z=0;A.vx=A.vz=0;pk.x=A.x+1.1*dir;pk.z=0;pk.vx=pk.vz=0;for(const o of G.mine.opp.skaters){o.x=-14*dir;o.z=8;}const ax=24*dir-pk.x,az=2.2-pk.z,l=Math.hypot(ax,az);P.performShot(A,ax/l,az/l,.6);
      for(let i=0;i<120&&G.state!=='goal';i++)P.step(1/60);for(let i=0;i<20;i++)P.step(1/60);});
    await E(()=>{const st=document.createElement('style');st.textContent='*{transition:none!important}';document.head.appendChild(st);});await wait(300);
    const b=await E(()=>{const b=document.querySelector('#banner'),cs=getComputedStyle(b);document.querySelector('#count').textContent='';const r=b.getBoundingClientRect();const el=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {state:window.__PH.G.state,cls:b.className,op:cs.opacity,fs:cs.fontSize,txt:b.textContent,rect:[r.left,r.top,r.width,r.height].map(Math.round),vis:cs.visibility,disp:cs.display,color:cs.color,top:el&&(el.id||el.className),hud:getComputedStyle(document.querySelector('#hud')).visibility,body:document.body.className};});console.log(JSON.stringify(b));
    await shot('dbg_goal');
  }else if(scen==='pause'){
    await E(()=>{const P=window.__PH;P.launch('quick');for(let i=0;i<260;i++)P.step(1/60);});
    await page.keyboard.press('KeyP');
    const r1=await E(()=>{const P=window.__PH,G=P.G,t0=G.t,tl=G.timeLeft;for(let i=0;i<180;i++)P.step(1/60);return {paused:G.paused,dT:G.t-t0,dClock:tl-G.timeLeft,screen:document.querySelector('#sPause').classList.contains('on')};});
    await shot('paused');await page.keyboard.press('KeyP');
    const r2=await E(()=>{const P=window.__PH,G=P.G,t0=G.t,tl=G.timeLeft;for(let i=0;i<60;i++)P.step(1/60);return {paused:G.paused,dT:+(G.t-t0).toFixed(3),dClock:+(tl-G.timeLeft).toFixed(3)};});
    console.log(JSON.stringify({whilePaused:r1,afterResume:r2}));
  }else if(scen==='mission'){
    await E(()=>{document.querySelector('[data-go="sMode"]').click();document.querySelector('#sMode [data-mode="challenge"]').click();});await wait(300);
    await E(()=>{const it=[...document.querySelectorAll('#chalList .mode')].find(d=>d.textContent.includes('역전 드라마'));it.click();});
    await wait(500);await steps(200);await wait(500);await shot('mission_comeback');
    const st=await E(()=>{const G=window.__PH.G;return {score:G.mine.score+':'+G.mine.opp.score,obj:document.querySelector('#obj').textContent,state:G.state};});console.log(JSON.stringify(st));
  }else if(scen==='pack'){
    await E(()=>{const P=window.__PH;P.save.points=1000;window.__NOFX=false;document.querySelector('[data-go="sScout"]').click();});await wait(400);
    await E(()=>{const P=window.__PH;P.save.types=['basic'];document.querySelector('[data-act="pull1"]').click();});
    await page.waitForFunction(()=>document.querySelector('#pkFoot.on'),{timeout:40000,polling:200});await wait(400);await shot('pack_newpenguin');
    const b=await E(()=>[...document.querySelectorAll('#pkFoot button')].map(x=>x.textContent));console.log(JSON.stringify(b));
  }
  const dbg=await E(()=>{const d=[...document.querySelectorAll('div')].find(x=>x.style&&x.style.zIndex==='200');return d&&d.style.display!=='none'?d.textContent:'(none)';});
  console.log(scen+': '+(logs.join(' | ')||'no page errors')+' | game error overlay: '+dbg);
  await browser.close();
})().catch(e=>{console.error('FAIL',scen,e.message);process.exit(1)});
