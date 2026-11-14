const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const lang=process.argv[2]||'ko',ONLY=(process.argv[3]||'').split(',').filter(Boolean);
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const ALL=['basic','fast','little','balanced','african','humboldt','magellanic','defense','macaroni','fiordland','galapagos','royal','yelloweye','strong','king','auk'];
const OWN=ALL.filter(k=>k!=='little'&&k!=='galapagos');const lv={};OWN.forEach((k,i)=>lv[k]=1+(i*3)%10);
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:OWN,type:'strong',team:'blue',lv,tut:{done:true,asked:true},hat:'none',rl:{intro:1},brk:{king:5},
  set:{quality:'ultra',cond:false,events:false,items:false,rules:'off',cine:'off',tod:'day',lang}});
const OUT=path.join(__dirname,'shots','store');fs.mkdirSync(OUT,{recursive:true});
// Play Store screenshots from the real game: node storeshot.js <ko|en> [scene,...]
//   landscape 1920×1080: land_match, land_goal, land_skill, land_cards     portrait 1080×1920: port_home, port_match, port_cards, port_card
//   feature graphic 1024×500: feature
const LAND={width:960,height:540,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:2};
const PORT={width:540,height:960,isMobile:true,hasTouch:true,deviceScaleFactor:2};
const want=n=>!ONLY.length||ONLY.includes(n);
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:LAND});
  const logs=[];
  async function open(vp){
    const page=await browser.newPage();await page.setViewport(vp);
    page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(/^BANNER/.test(m.text()))console.log(m.text());});
    await page.setRequestInterception(true);
    page.on('request',r=>{const u=r.url();
      if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
      if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
      if(u.startsWith('file:'))return r.continue();r.abort();});
    await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});
    await page.evaluateOnNewDocument(s=>{localStorage.setItem('penguinHockey.v1',s);},SAVE);
    await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(3500);
    const E=(f,...a)=>page.evaluate(f,...a);
    // let the portraits finish in the background
    await E(async()=>{const P=window.__PH;for(let i=0;i<40&&!P.P3.done;i++){P.p3Warm(true);await new Promise(r=>setTimeout(r,50));}});
    return {page,E};
  }
  const draw=E=>E(()=>{const P=window.__PH;try{P.gfxRender?P.gfxRender():P.renderer.render(P.scene,P.camera);}catch(e){}});
  const snap=async(page,E,name)=>{await E(()=>{window.requestAnimationFrame=()=>0;});await draw(E);await draw(E);await wait(250);
    await page.screenshot({path:path.join(OUT,lang+'_'+name+'.png')});console.log('saved',name);};
  const freeAnim=E=>E(()=>{window.requestAnimationFrame=window.__rAF||window.requestAnimationFrame;});
  // a match that is really being played: both teams AI for a few seconds, then the camera on the action
  const match=E=>E(()=>{const P=window.__PH,G=P.G;window.__rAF=window.__rAF||window.requestAnimationFrame;window.requestAnimationFrame=()=>0;
    P.save.set.ctl.auto=true;P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'T',oppTypes:['king','macaroni','strong']});
    document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
    for(let i=0;i<60*6&&G.state!=='play';i++)P.step(1/60);
    let best=0;for(let i=0;i<60*14;i++){P.step(1/60);
      if(i>60*4&&G.carry&&!G.carry.goalie){let n=0;for(const q of G.pengs)if(!q.goalie&&Math.hypot(q.x-G.puck.x,q.z-G.puck.z)<6)n++;if(n>=3){best=i;break;}}}
    P.updateCamera(1);const h=document.getElementById('hint');if(h)h.classList.remove('on');for(const id of ['banner','bannerSub']){const b=document.getElementById(id);if(b)b.classList.remove('on');}return {state:G.state,best,score:G.mine.score+':'+G.mine.opp.score};});
  const cards=async(page,E,dex)=>{await E(()=>{window.requestAnimationFrame=window.__rAF||window.requestAnimationFrame;window.__PH.goScreen('sScout');});await wait(800);
    if(dex){await E(()=>{const t=[...document.querySelectorAll('#scTabs button')];if(t[3])t[3].click();});await wait(900);}};

  // ---------------- landscape ----------------
  if(['land_match','land_goal','land_skill','land_cards'].some(want)){
    const {page,E}=await open(LAND);
    if(want('land_cards')){await cards(page,E,true);await snap(page,E,'land_cards');await freeAnim(E);}
    if(want('land_match')){console.log(JSON.stringify(await match(E)));await snap(page,E,'land_match');}
    if(want('land_goal')){
      await match(E);
      await E(()=>{window.__st=window.setTimeout;window.setTimeout=()=>0;});   // hold the banner / replay timers on the goal moment
      await E(()=>{const P=window.__PH,G=P.G,me=G.player,d=G.mine.dir,pk=G.puck;
        for(const q of G.mine.opp.skaters.concat(G.pengs.filter(q=>q.goalie&&q.team!==G.mine))){q.x=q.ox=q.rx=-d*8;q.z=q.oz=q.rz=-8;q.vx=q.vz=0;}
        G.mine.score=0;G.mine.opp.score=0;
        me.x=me.ox=me.rx=d*16;me.z=me.oz=me.rz=3;me.vx=me.vz=0;pk.x=pk.ox=pk.rx=d*21.5;pk.z=pk.oz=pk.rz=.5;pk.vx=d*30;pk.vz=-.6;pk.shot={by:me,t:G.t,pow:.9};G.carry=null;
        let n=0;while(G.mine.score<1&&n++<200)P.step(1/60);for(let i=0;i<20;i++)P.step(1/60);P.updateCamera(1);
        for(const a of document.getAnimations()){const t=a.effect&&a.effect.target;const end=a.effect.getComputedTiming().endTime;
          a.pause();a.currentTime=(t&&t.closest&&t.closest('#lxRays'))?620:Math.min(isFinite(end)?end:900,900);}});
      const g=await E(()=>{const b=document.getElementById('banner'),cs=getComputedStyle(b);const r=b.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,top=document.elementFromPoint(cx,cy),lx=document.getElementById('lxRays');return {rect:[r.left|0,r.top|0,r.width|0,r.height|0],z:cs.zIndex,color:cs.color,fs:cs.fontSize,par:b.parentElement.id||b.parentElement.className,topEl:top&&(top.id||top.className),lxPar:lx&&(lx.parentElement.id||lx.parentElement.className),lxZ:lx&&getComputedStyle(lx).zIndex,score:window.__PH.G.mine.score,cls:b.className,txt:b.textContent,op:cs.opacity,tf:cs.transform,vis:cs.visibility,body:document.body.className};});console.log('goal',JSON.stringify(g));
      await E(()=>{const b=document.getElementById('banner');b.style.transition='none';b.classList.add('on');b.getAnimations().forEach(a=>{try{a.finish();}catch(e){}});console.log('BANNER '+b.className+' op='+getComputedStyle(b).opacity+' txt='+b.textContent+' ff='+getComputedStyle(b).fontSize+' rect='+JSON.stringify(b.getBoundingClientRect()));const s=document.getElementById('bannerSub');if(s&&s.children.length){s.style.transition='none';s.classList.add('on');}});
      await snap(page,E,'land_goal');
      await E(()=>{if(window.__st)window.setTimeout=window.__st;});
      if(process.env.BDBG){const info=await E(()=>{const b=document.getElementById('banner'),cs=getComputedStyle(b);const a=document.getAnimations().filter(x=>x.effect&&x.effect.target===b).map(x=>[x.animationName||x.transitionProperty,x.currentTime,x.playState]);
          let p=b,ch=[];while(p&&p!==document.body){const c=getComputedStyle(p);ch.push((p.id||p.className||p.tagName)+':op'+c.opacity+':disp'+c.display+':vis'+c.visibility);p=p.parentElement;}
          return {a,ch,ts:cs.textShadow.slice(0,80),pos:cs.position,font:cs.fontFamily,fill:cs.webkitTextFillColor,filter:cs.filter,clip:cs.clipPath};});console.log(JSON.stringify(info));
        await (await page.$('#banner')).screenshot({path:path.join(OUT,'banner_only.png')});}
      if(process.env.NOFAN){await E(()=>{document.getElementById('lxRays').style.display='none';});await snap(page,E,'land_goal_nofan');}
    }
    if(want('land_skill')){
      await E(()=>{const P=window.__PH,G=P.G;P.save.type='king';P.save.set.cine='full';P.save.set.motion=false;P.save.set.ctl.auto=false;
        P.startMatch({mode:'quick',size:2,time:180,diff:'easy',tag:'T',oppTypes:['basic','basic']});document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
        G.state='play';G.stateT=0;document.getElementById('count').textContent='';for(let i=0;i<30;i++)P.step(1/60);
        const p=G.player,put=(q,x,z)=>{q.x=q.ox=q.rx=x;q.z=q.oz=q.rz=z;q.vx=q.vz=0;q.fall=0;q.slow=0;};
        for(const q of G.pengs)if(!q.goalie)put(q,-14,-9);put(p,-2,1);p.heading=Math.PI/2;p.cd.special=0;
        const o=p.team.opp.skaters[0];put(o,3.2,1.6);G.puck.x=G.puck.ox=G.puck.rx=-1;G.puck.z=G.puck.oz=G.puck.rz=1;G.puck.vx=G.puck.vz=0;G.carry=p;
        for(let i=0;i<3;i++)P.step(1/60);P.updateCamera(1);P.useSpecial(p);
        const T=+(window.__SKT||1.15);let n=0;while(G.cine&&G.cine.t<T&&n++<400)P.step(Math.min(1/60,T-G.cine.t));
        const C=G.cine;if(C){const P0={p0:0,p1:C.P.band,p2:C.P.impact,p3:C.P.out}[C.ph];
          for(const a of document.getAnimations()){const t=a.effect&&a.effect.target;if(t&&t.closest&&t.closest('#cine')){a.pause();a.currentTime=Math.max(0,(C.t-P0)*1000);}}}});
      await snap(page,E,'land_skill');
    }
    await page.close();
  }
  // ---------------- feature graphic 1024×500 ----------------
  if(want('feature')){
    const {page,E}=await open({width:1024,height:500,deviceScaleFactor:1});
    await match(E);
    await E(lang=>{const P=window.__PH,G=P.G;
      // the rink from above for the backdrop
      const cam=P.camera;cam.position.set(0,26,17);cam.lookAt(0,0,1);P.renderer.render(P.scene,cam);const bg=P.renderer.domElement.toDataURL('image/jpeg',.9);
      const ko=lang==='ko',t1=ko?'펭귄하키':'Penguin Hockey',t2=ko?'남극 링크의 3대3 아케이드 하키':'3-on-3 arcade hockey on the Antarctic ice';
      const d=document.createElement('div');d.id='feat';
      d.innerHTML='<div class="fb"></div><div class="fs"></div><div class="ft"><div class="t1">'+t1+'</div><div class="t2">'+t2+'</div></div>'
        +'<i class="p3 p3-macaroni f1"></i><i class="p3 p3-king f2"></i><i class="p3 p3-strong f3"></i>';
      const st=document.createElement('style');st.textContent=`
#feat{position:fixed;inset:0;z-index:999999;overflow:hidden;background:#0b2a50}
#feat .fb{position:absolute;inset:-20px;background:url(${bg}) center/cover;filter:blur(3px) saturate(1.1)}
#feat .fs{position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,24,52,.92) 0,rgba(8,34,70,.78) 40%,rgba(8,34,70,.15) 70%,rgba(8,34,70,.35) 100%),radial-gradient(60% 90% at 78% 40%,rgba(160,215,255,.45),transparent 70%)}
#feat .ft{position:absolute;left:58px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;max-width:470px}
#feat .t1{font:400 ${ko?108:84}px/1.05 ${ko?"'Jua'":"'Fredoka'"},sans-serif;font-weight:${ko?400:700};color:#fff;letter-spacing:${ko?'2px':'0'};
  text-shadow:0 5px 0 #1f6dad,0 10px 0 #164f86,0 18px 30px rgba(0,20,50,.7)}
#feat .t2{margin-top:26px;font:500 25px/1.35 ${ko?"'Jua'":"'Fredoka'"},sans-serif;color:#d6ecff;padding-left:4px;border-left:4px solid #ffc93c;padding:2px 0 2px 14px}
#feat .p3{position:absolute;bottom:-70px;background-position:center bottom;background-size:contain;background-repeat:no-repeat;filter:drop-shadow(0 12px 20px rgba(0,10,30,.55))}
#feat .f1{left:540px;width:300px;height:375px;bottom:-60px}
#feat .f3{left:784px;width:300px;height:375px;bottom:-62px}
#feat .f2{left:640px;width:400px;height:500px;bottom:-96px;z-index:2}`;
      document.head.appendChild(st);document.body.appendChild(d);},lang);
    console.log('P3',JSON.stringify(await E(()=>{const P=window.__PH;['king','macaroni','strong'].forEach(k=>P.p3Url(k));const c=document.getElementById('p3css');const i=document.querySelector('#feat .f2');return {n:Object.keys(P.P3.url).length,fail:P.P3.fail,err:P.P3.err||'',css:c?c.textContent.length:0,bg:i?getComputedStyle(i).backgroundImage.slice(0,30):'',r:i?JSON.stringify(i.getBoundingClientRect()):''};})));
    await wait(600);await page.screenshot({path:path.join(OUT,lang+'_feature.png')});console.log('saved feature');await page.close();
  }
  // ---------------- portrait ----------------
  if(['port_home','port_match','port_cards','port_card'].some(want)){
    const {page,E}=await open(PORT);
    if(want('port_home')){await wait(500);await E(()=>{for(const a of document.getAnimations())a.finish&&a.effect&&a.effect.getComputedTiming().iterations!==Infinity&&a.finish();});await snap(page,E,'port_home');await freeAnim(E);}
    if(want('port_cards')){await cards(page,E,true);await snap(page,E,'port_cards');await freeAnim(E);}
    if(want('port_card')){await E(()=>window.__PH.openCard('king'));await wait(800);await snap(page,E,'port_card');await freeAnim(E);await E(()=>{const d=document.getElementById('cardDlg');if(d)d.classList.remove('on');});}
    if(want('port_match')){console.log(JSON.stringify(await match(E)));await snap(page,E,'port_match');}
    await page.close();
  }
  console.log('errors',logs.length,logs.slice(0,3).join(' | '));
  await browser.close();process.exit(0);
})().catch(e=>{console.log('CRASH',e);process.exit(1);});
