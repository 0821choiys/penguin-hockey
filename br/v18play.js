// v18 in a real browser: each new species plays a match and fires its special skill with real input
// (PC: the Q key / phone: a finger on the 특수 button), the AI opponents are new species too.
// usage: node v18play.js <pc|wide|tall> [lang]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',lang=process.argv[3]||'ko';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];
  if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const ALL=['basic','balanced','fast','defense','strong','king','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos'];
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:ALL,type:'king',squad:['basic','fast',null],tut:{done:true,asked:true},set:{cine:'off'}});   // skill mechanics only (the v25 cinematic has its own test)
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',async m=>{if(m.type()!=='error')return;let t=m.text();try{if(/JSHandle/.test(t))t=await m.args()[0].evaluate(e=>String(e&&e.stack||e));}catch(e){}logs.push('CONSOLE '+t.slice(0,400));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'node_modules/three/build/three.min.js'))});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('__seeded')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('__seeded','1');}},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  // the real game loop keeps running; only the slow software 3D drawing is skipped (one real frame is drawn per species below)
  await E(()=>{const R=window.__PH.renderer;R.__r=R.render;R.render=function(){};});
  const touch=mode!=='pc';
  const fire=async()=>{
    if(!touch){await page.keyboard.down('KeyQ');await wait(60);await page.keyboard.up('KeyQ');return 'key Q';}
    const b=await E(()=>{const e=document.getElementById('tbSpec'),r=e.getBoundingClientRect(),cs=getComputedStyle(e);return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,vis:cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0};});
    if(!b.vis)return 'hidden';
    const top=await E((x,y)=>{const e=document.elementFromPoint(x,y);return e?(e.id||e.className||e.tagName):'none';},b.x,b.y);
    await page.touchscreen.tap(b.x,b.y);return top;};
  const NEW=['king','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos'];
  const opps=[['african','galapagos','macaroni'],['little','humboldt','fiordland'],['royal','yelloweye','magellanic']];
  for(let i=0;i<NEW.length;i++){const k=NEW[i];
    const st=await E((k,opp)=>{const P=window.__PH,G=P.G;P.save.type=k;P.save.squad=['basic','fast',null];P.save.set.cond=false;
      P.startMatch({mode:'free',size:3,time:0,diff:'normal',tag:'T',oppTypes:opp});return {type:G.player&&G.player.type,sp:P.TYPES[k].special,opp:G.mine.opp.skaters.map(o=>o.type).join(',')};},k,opps[i%3]);
    let t0=Date.now();while(Date.now()-t0<25000&&!(await E(()=>window.__PH.G.state==='play')))await wait(150);
    const pre=await E(()=>{const G=window.__PH.G;return G.state+(G.paused?' paused':'');});if(pre!=='play')console.log('  note: match state before firing = '+pre);
    // set the scene: the player holds the puck facing the far goal, a mate open ahead, one opponent close by
    await E(k=>{const P=window.__PH,G=P.G,p=G.player,tm=p.team,dir=tm.attackDir||Math.sign((tm.opp.goalie||{x:1}).x-p.x)||1;
      const put=(q,x,z)=>{q.x=q.ox=q.rx=x;q.z=q.oz=q.rz=z;q.vx=q.vz=0;q.fall=0;q.slow=0;};
      put(p,-2*dir,0);p.heading=dir>0?Math.PI/2:-Math.PI/2;p.cd.special=0;p.cd.dash=0;
      const mate=tm.skaters.find(m=>m!==p);if(mate)put(mate,5*dir,1.2);
      const o=tm.opp.skaters[0];put(o,1.2*dir,0);
      G.puck.x=p.x+dir*.95;G.puck.z=0;G.puck.vx=G.puck.vz=0;G.carry=p;window.__me=p;},k);
    await wait(80);
    const how=await fire();await wait(260);
    const r=await E(k=>{const P=window.__PH,G=P.G,p=window.__me,X=P.SPX[P.TYPES[k].special],og=p.team.opp.goalie;
      return {cd:+p.cd.special.toFixed(2),max:p.specMax,want:X&&X.cd,rush:p.rushT>0,ram:p.ramT>0||p.dashSpec,royal:!!G.royal||G.carry!==p,shadow:p.shadowT>0,eye:p.eyeT>0,hop:p.hopT>0,
        slowOpp:p.team.opp.skaters.some(o=>o.slow>0),dbl:p.dbl,daz:og?og.dazT>0:false,state:G.state};},k);
    const flag={trumpet:r.rush,crest:r.ram,royalpass:r.royal,shadow:r.shadow,keeneye:r.eye,hop:r.hop,bray:r.slowOpp,current:r.rush,double:r.dbl===1,sunflare:r.daz}[st.sp];
    ok(st.type===k&&r.state==='play'&&r.max===r.want&&r.cd>0&&flag,k+' ('+st.sp+') fired by '+(touch?'touch, top element '+how:how)+' → cooldown '+r.cd+'/'+r.want+'s, effect on'+' (opponents '+st.opp+')');
    if(st.sp==='double'){await wait(150);const h2=await fire();await wait(200);
      ok(await E(()=>{const p=window.__me;return p.dbl===0&&p.cd.special>5;}),'magellanic: second press = free second dash, skill cooldown untouched ('+h2+')');}
    // keep playing for a while (the AI uses its own new-species skills), then draw one real 3D frame of this match
    await wait(2200);
    const live=await E(()=>{const P=window.__PH,G=P.G;let used=0;for(const o of G.mine.opp.skaters)if(o.cd.special>0)used++;
      const R=P.renderer;R.__r.call(R,P.scene,P.camera);return {state:G.state,used,t:+G.t.toFixed(1)};});
    ok(['play','goal','faceoff','count'].includes(live.state)||live.t>0,k+' match keeps running and draws ('+live.state+', t='+live.t+'s, opponents with a skill on cooldown: '+live.used+')');
  }
  await E(()=>window.__PH.toMenu());await wait(400);
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,4).join(' | '):''));
  console.log('TOTAL '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
