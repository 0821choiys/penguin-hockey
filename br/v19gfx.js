// v19 graphics in a real browser (SwiftShader WebGL): tiers, the mirror really shows what stands on the ice, the post path,
// settings taps, automatic step-down, black-buffer fallback, WebGL1 (FXAA) path.
// usage: node v19gfx.js <pc|tall|wide> [lang]      GL1=1 forces WebGL1 (no WebGL2 / MSAA buffers)
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',lang=process.argv[3]||'ko',GL1=!!process.env.GL1;
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];
  if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
// PC: an old save on 높음 (must move up to 최고 once); phones: a first start (no save)
const SAVE=mode==='pc'?JSON.stringify({v:10,news18:true,points:500,types:['basic','fast','king'],type:'king',squad:['fast','basic',null],tut:{done:true,asked:true},set:{quality:'high',cond:false,events:false,items:false}}):null;
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
(async()=>{
  const args=[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
  const browser=await puppeteer.launch({args,executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error')logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'node_modules/three/build/three.min.js'))});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  if(GL1)await page.evaluateOnNewDocument(()=>{const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){if(t==='webgl2')return null;return g.call(this,t,o);};});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('__seeded')){if(s)localStorage.setItem('penguinHockey.v1',s);else localStorage.removeItem('penguinHockey.v1');sessionStorage.setItem('__seeded','1');}},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{window.requestAnimationFrame=()=>0;});await wait(200);   // frames are driven by the test from here on
  const touch=mode!=='pc';
  const st=await E(()=>{const P=window.__PH,r=P.renderer;return {q:P.save.set.quality,f:P.save.gfx19,gl2:r.capabilities.isWebGL2,coarse:matchMedia('(pointer: coarse)').matches};});
  if(mode==='pc')ok(st.q==='ultra'&&st.f===true,'old save on 높음 opens on 최고 (migrated once): '+st.q);
  else ok(st.q==='ultra','first start on this device: '+st.q+' (v29: phones and tablets start on 최고 too; the automatic step-down lowers it on a slow device)');
  ok(st.gl2===!GL1,'WebGL'+(st.gl2?'2':'1')+' context'+(GL1?' (forced)':''));
  // a quick match driven frame by frame
  await E(()=>{const P=window.__PH;P.save.set.quality='ultra';P.GFX.drop=0;P.applyQuality();P.save.set.cond=false;P.save.set.events=false;P.save.set.items=false;
    P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'Q',todFixed:.05});document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
    const G=P.G;G.state='play';G.stateT=0;for(let i=0;i<120;i++)P.step(1/60);for(let i=0;i<5;i++)P.gfxRender();});
  const t2=await E(()=>{const P=window.__PH,r=P.renderer,v=new THREE.Vector2();r.getDrawingBufferSize(v);
    return {tier:P.gfxTier(),def:'ICE_RFL' in P.iceMat.defines,rw:P.RFL.rt&&P.RFL.rt.width,dw:v.x,pp:!!P.PP.rt,ms:P.PP.ms,fx:'PP_FXAA' in P.PP.comp.defines,bad:Object.keys(P.GFX.bad),used:P.PP.used,
      csh:P.CSH.m.visible&&P.CSH.m.count,sk:P.G.pengs.filter(p=>p.pg.root.visible&&!p.frozen).length,glow:window.__PH.RFL&&P.scene.children.length};});
  ok(t2.tier===2&&t2.def&&Math.abs(t2.rw/t2.dw-.5)<.02,'최고: mirror buffer at ½ resolution ('+t2.rw+' of '+t2.dw+' px), ice shader has the mirror');
  ok(t2.pp&&t2.used>=5&&t2.ms===!GL1&&t2.fx===!!GL1,'최고: post path in use ('+(t2.ms?'4× MSAA buffer':'FXAA on WebGL1')+')');
  ok(t2.bad.length===0,'safety check passed: neither buffer came back black');
  ok(t2.csh===t2.sk+1,'contact shadows: one per skater on the ice + the puck ('+t2.csh+')');
  // the mirror really shows a skater: the mirrored body is dark/colourful, open ice next to it mirrors near-white
  const mir=await E(()=>{const P=window.__PH,G=P.G,c=P.camera,me=G.player;
    for(const p of G.pengs)if(p!==me&&!p.goalie){p.x=p.ox=p.rx=-20;p.z=p.oz=p.rz=10;}
    me.x=me.ox=me.rx=0;me.z=me.oz=me.rz=0;G.puck.x=G.puck.ox=G.puck.rx=8;G.puck.z=G.puck.oz=G.puck.rz=-6;G.carry=null;
    P.step(1/60);c.clearViewOffset();c.position.set(0,6,9);c.lookAt(0,0,0);c.updateMatrixWorld();P.gfxRender();
    const rt=P.RFL.rt,b=new Uint8Array(4),rd=(x,y,z)=>{const v=new THREE.Vector3(x,y,z).project(c);if(Math.abs(v.x)>.98||Math.abs(v.y)>.98)return [-1,-1,-1];const px=Math.round((v.x*.5+.5)*(rt.width-1)),py=Math.round((v.y*.5+.5)*(rt.height-1));P.renderer.readRenderTargetPixels(rt,px,py,1,1,b);return [b[0],b[1],b[2]];};
    const L=a=>a[0]*.2126+a[1]*.7152+a[2]*.0722;const A=rd(0,-.75,0),B=rd(0,-.75,3.6);return {A,B,la:Math.round(L(A)),lb:Math.round(L(B)),vo:[c.view&&c.view.enabled,c.aspect,P.G.view,P.RFL.u.uRK.value,P.RFL.rt.width,P.RFL.rt.height]};});console.log('   '+JSON.stringify(mir.vo));
  ok(mir.lb-mir.la>40,'mirror image: under the skater '+mir.la+' (rgb '+mir.A+') vs open ice '+mir.lb+' (rgb '+mir.B+')');
  // settings taps: 절약 / 높음 / 최고
  // (a first start on a phone asks about the tutorial first: answer it the way a player would)
  await E(()=>{const P=window.__PH;P.save.tut.done=true;P.save.tut.asked=true;const t=document.getElementById('tutAsk');if(t)t.classList.remove('on');});
  await E(()=>{const b=document.createElement('button');b.dataset.go='sSet';document.body.appendChild(b);b.click();b.remove();});await wait(500);
  const rowIdx=await E(()=>{const lbl=window.__PH.SETDEF.find(d=>d.k==='quality').label;return [...document.querySelectorAll('#setList .setrow')].findIndex(r=>r.firstChild.textContent===lbl);});
  const seg=await E(i=>{const r=document.querySelectorAll('#setList .setrow')[i];if(!r)return null;const bs=[...r.querySelectorAll('.seg button')];const R=r.getBoundingClientRect();
    return {n:bs.length,txt:bs.map(b=>b.textContent),fit:bs.every(b=>{const q=b.getBoundingClientRect();return q.right<=R.right+1&&q.left>=R.left-1&&b.scrollWidth<=b.clientWidth+1;}),h:Math.min(...bs.map(b=>b.getBoundingClientRect().height))};},rowIdx);
  ok(seg&&seg.n===3&&seg.fit&&seg.h>=30,'graphics row: '+(seg&&seg.txt.join(' · '))+' — all inside the row, '+(seg&&Math.round(seg.h))+' px tall');
  const press=async(i)=>{const sel='#setList .setrow:nth-child('+(rowIdx+1)+') .seg button:nth-child('+(i+1)+')';const el=await page.$(sel);await el.evaluate(e=>e.scrollIntoView({block:'center'}));await wait(150);
    const b=await el.boundingBox();const x=b.x+b.width/2,y=b.y+b.height/2;const top=await E((x,y)=>{const e=document.elementFromPoint(x,y);return e?e.textContent:'';},x,y);
    if(touch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);await wait(300);return top;};
  const frame=()=>E(()=>{const P=window.__PH;for(let i=0;i<4;i++)P.gfxRender();return {q:P.save.set.quality,tier:P.gfxTier(),def:'ICE_RFL' in P.iceMat.defines,rt:P.RFL.rt?P.RFL.rt.width:0,pp:!!P.PP.rt,csh:P.CSH.m.visible,
    stored:JSON.parse(localStorage.getItem('penguinHockey.v1')||'{}').set.quality};});
  let top=await press(2);let f=await frame();console.log('   tap → '+JSON.stringify(top)+' '+JSON.stringify(f));ok(f.q==='low'&&f.stored==='low'&&f.tier===0&&!f.def&&!f.rt&&!f.pp&&!f.csh,'tap 절약: saved, no mirror / post / contact shadows (the v18 image)');
  top=await press(1);f=await frame();console.log('   tap → '+JSON.stringify(top)+' '+JSON.stringify(f));ok(f.q==='high'&&f.stored==='high'&&f.tier===1&&f.def&&f.rt>0&&!f.pp&&f.csh,'tap 높음: mirror at ⅓ resolution ('+f.rt+' px wide), no post buffer');
  await E(()=>{window.__PH.GFX.drop=1;});
  top=await press(0);f=await frame();console.log('   tap → '+JSON.stringify(top)+' '+JSON.stringify(f));ok(f.q==='ultra'&&f.stored==='ultra'&&f.tier===2&&f.pp,'tap 최고: everything on again, and an earlier automatic step-down is cleared');
  await E(()=>{document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));});
  // automatic step-down while playing
  const sd=await E(()=>{const P=window.__PH,out=[];P.perf.low=0;P.perf.ema=1/20;for(let k=0;k<2;k++){for(let i=0;i<125;i++)P.perfSample(1/20);for(let i=0;i<3;i++)P.gfxRender();out.push([P.gfxTier(),!!P.PP.rt,P.RFL.rt?P.RFL.rt.width:0,'ICE_RFL' in P.iceMat.defines]);}
    P.perf.scale=1;P.perf.low=0;return {out,q:P.save.set.quality};});
  ok(sd.out[0][0]===1&&!sd.out[0][1]&&sd.out[0][2]>0&&sd.out[1][0]===0&&!sd.out[1][3]&&sd.q==='ultra','slow frames: 최고 → 높음 (post freed) → mirror off; the saved setting stays 최고 ('+JSON.stringify(sd.out)+')');
  // a GPU whose off-screen buffers come back black: both effects switch themselves off, the game keeps drawing
  const bk=await E(()=>{const P=window.__PH,r=P.renderer,orig=r.readRenderTargetPixels;P.GFX.drop=0;P.GFX.chk={};P.GFX.bad={};
    r.readRenderTargetPixels=function(rt,x,y,w,h,buf){buf.fill(0);};for(let i=0;i<8;i++)P.gfxRender();r.readRenderTargetPixels=orig;
    const o={bad:Object.keys(P.GFX.bad).sort().join(),def:'ICE_RFL' in P.iceMat.defines,pp:!!P.PP.rt,rt:!!P.RFL.rt};for(let i=0;i<3;i++)P.gfxRender();
    P.GFX.chk={};P.GFX.bad={};P.gfxApply();for(let i=0;i<5;i++)P.gfxRender();o.after=Object.keys(P.GFX.bad).length;return o;});
  ok(bk.bad==='post,refl'&&!bk.def&&!bk.pp&&!bk.rt&&bk.after===0,'black buffers: mirror and post switch off for the session, plain rendering continues ('+bk.bad+')');
  // one frame through the real loop function, then night (bloom strongest) for a look
  await E(()=>{const P=window.__PH,G=P.G;G.todMode='fixed';G.todFixed=.95;G.tod=.95;for(let i=0;i<60;i++)P.step(1/60);P.gfxRender();});
  await page.screenshot({path:path.join(__dirname,'shots','v19gfx_'+mode+(GL1?'_gl1':'')+'.jpg'),type:'jpeg',quality:80});
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,4).join(' | '):''));
  console.log('TOTAL '+mode+(GL1?' gl1':'')+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
