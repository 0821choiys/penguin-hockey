// v22/v23 in a real browser (SwiftShader WebGL): every species' skill-cast animation, the referee and his calls.
// usage: node v23cast.js <pc|tall> [cast|ref|all]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',what=process.argv[3]||'all',lang=process.argv[4]||'ko';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const ALL=['basic','balanced','fast','defense','strong','king','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos','auk'];
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:ALL,type:'strong',squad:['basic','fast',null],tut:{done:true,asked:true},hat:'none',rl:{intro:1},set:{quality:'high',cond:false,events:false,items:false}});
const OUT=path.join(__dirname,'shots','v23');fs.mkdirSync(OUT,{recursive:true});
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
  await page.evaluateOnNewDocument(s=>{window.requestAnimationFrame=()=>0;localStorage.setItem('penguinHockey.v1',s);let seed=4242;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{window.requestAnimationFrame=()=>0;const st=document.createElement('style');st.textContent='#combo,#fever,#evTag{display:none!important}';document.head.appendChild(st);});await wait(200);
  const draw=()=>E(()=>{const P=window.__PH;P.gfxRender?P.gfxRender():P.renderer.render(P.scene,P.camera);});
  const snap=async(name,clip)=>{await draw();await draw();await wait(120);await page.screenshot({path:path.join(OUT,mode+'_'+name+'.jpg'),type:'jpeg',quality:86,clip});};
  if(what==='cast'||what==='all'){
    for(const k of ALL){
      const info=await E(k=>{const P=window.__PH,G=P.G;P.save.type=k;P.save.squad=['basic',null,null];
        P.startMatch({mode:'free',size:2,time:0,diff:'easy',tag:'T',oppTypes:['basic','basic']});document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
        G.state='play';G.stateT=0;document.getElementById('count').textContent='';for(let i=0;i<30;i++)P.step(1/60);
        const p=G.player,put=(q,x,z)=>{q.x=q.ox=q.rx=x;q.z=q.oz=q.rz=z;q.vx=q.vz=0;q.fall=0;q.slow=0;};
        for(const q of G.pengs)if(!q.goalie)put(q,-14,-9);
        put(p,0,1);p.heading=Math.PI/2;p.cd.special=0;const mate=p.team.skaters.find(m=>m!==p);if(mate)put(mate,6,-2);
        const o=p.team.opp.skaters[0];put(o,3.2,1.6);G.puck.x=G.puck.ox=G.puck.rx=1.0;G.puck.z=G.puck.oz=G.puck.rz=1;G.puck.vx=G.puck.vz=0;G.carry=p;
        const okc=P.useSpecial(p);window.__cp=p;
        return {ok:okc,cast:!!p.cast,dur:p.cast&&p.cast.dur,shout:P.castShout(p,'?'),ban:document.getElementById('castBan').className,txt:document.getElementById('castBan').textContent};},k);
      ok(info.ok&&info.cast&&info.ban.includes('on'),k+': skill fired → cast animation "'+info.shout+'" ('+(info.dur||0).toFixed(2)+' s) + banner "'+info.txt+'"');
      for(const [tag,u] of [['a',.3],['b',.62],['c',.9]]){
        await E((u)=>{const P=window.__PH,G=P.G,p=window.__cp;const tgt=u*(p.cast?p.cast.dur:.6);let n=0;while(p.cast&&p.cast.t<tgt&&n++<200){P.step(1/60);G.cam.shake=0;}
          const c=P.camera;c.clearViewOffset();c.position.set(p.rx+1.2,2.4,p.rz+6.2);c.lookAt(p.rx,1.0,p.rz);},u);
        const vw=VP.width,vh=VP.height;await snap('cast_'+k+'_'+tag,mode==='pc'?{x:250,y:40,width:500,height:520}:{x:0,y:120,width:vw,height:Math.min(vh-120,600)});
      }
    }
  }
  if(what==='ref'||what==='all'){
    // the referee in a quick match, a tripping call, the penalty box + power-play clock, a penalty shot
    const st=await E(()=>{const P=window.__PH,G=P.G;P.save.type='fast';P.save.squad=['basic','defense',null];P.save.set.rules='full';
      P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'Q',oppTypes:['macaroni','king','basic']});document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
      G.state='play';G.stateT=0;document.getElementById('count').textContent='';for(let i=0;i<120;i++)P.step(1/60);
      return {ref:!!G.ref&&G.ref.pg.root.visible,mode:P.rulesMode()};});
    ok(st.ref&&st.mode==='full','referee penguin on the ice in a quick match');
    await snap('ref_play');
    await E(()=>{const P=window.__PH,G=P.G,R=G.ref;const c=P.camera;c.clearViewOffset();c.position.set(R.x+1.5,2.0,R.z+5.5);c.lookAt(R.x,1.0,R.z);});
    await snap('ref_close',mode==='pc'?{x:250,y:40,width:500,height:520}:undefined);
    const call=await E(()=>{const P=window.__PH,G=P.G,b=G.teams.blue,r=G.teams.red;for(const q of G.pengs){q.vx=q.vz=0;q.fall=0;q.getup=0;q.shadowT=0;q.hopT=0;}
      const v=b.skaters[1],h=r.skaters[0];v.x=v.ox=v.rx=-2;v.z=v.oz=v.rz=-4;h.x=h.ox=h.rx=-3;h.z=h.oz=h.rz=-4;h.slideT=.5;h._sl=G.t;G.carry=h;
      P.bumpFx(v,h,10);for(let i=0;i<50;i++)P.step(1/60);
      const el=document.getElementById('rlCall');return {state:G.state,card:el.className,txt:el.textContent};});
    ok(call.state==='stop'&&call.card.includes('on'),'tripping called: whistle + call card "'+call.txt+'"');
    await E(()=>{window.__PH.updateCamera(1);});await snap('ref_call');
    await E(()=>{const P=window.__PH,G=P.G,R=G.ref;const c=P.camera;c.clearViewOffset();c.position.set(R.x+1.2,2.1,R.z+5.2);c.lookAt(R.x,1.0,R.z);});
    await snap('ref_signal',mode==='pc'?{x:250,y:40,width:500,height:520}:undefined);
    const box=await E(()=>{const P=window.__PH,G=P.G;let n=0;while(G.state!=='play'&&n++<600)P.step(1/60);for(let i=0;i<60;i++)P.step(1/60);
      const hud=document.getElementById('rlHud');const e=G.rl.box[0];return {boxed:!!e,hud:hud.textContent,z:e&&e.p.z,vis:e&&e.p.pg.root.visible};});
    ok(box.boxed&&box.vis&&box.z<-13&&box.hud.includes('파워플레이'),'offender visible in the penalty box ('+(box.z||0).toFixed(1)+'), HUD: '+box.hud);
    await snap('ref_pp');
    await E(()=>{const P=window.__PH,G=P.G,e=G.rl.box[0];const c=P.camera;c.clearViewOffset();c.position.set(e.p.x-2,3.2,e.p.z+9);c.lookAt(e.p.x,0.8,e.p.z);});
    await snap('ref_box',mode==='pc'?{x:150,y:40,width:700,height:520}:undefined);
    const ps=await E(()=>{const P=window.__PH,G=P.G;G.rl.box.slice().forEach(e=>P.boxRelease(e,'end'));const b=G.teams.blue;P.psStart(b,b.skaters[0],1);for(let i=0;i<40;i++)P.step(1/60);
      return {ps:!!G.ps,hud:document.getElementById('rlHud').textContent};});
    ok(ps.ps&&ps.hud.includes('페널티 샷'),'penalty shot set up, HUD: '+ps.hud);
    await E(()=>{window.__PH.updateCamera(1);});await snap('ref_ps');
  }
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,4).join(' | '):''));
  console.log('TOTAL '+mode+' '+what+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
