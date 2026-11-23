// v50 그래픽 초고사양 / 초저사양 in a real browser: the 설정 row (five steps on one line, chosen step spelled out, translated, nothing spills out),
// what each step really does to the renderer (resolution, shadow map, far colonies, floodlight point lights, contact pools, ice filtering, triangles per frame),
// 초저사양 starts without MSAA after a reload, mascot fur layers 3 / 16, the one-time hint in a match.   usage: node v50gfx.js <pc|tall|wide|wideS> [lang]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'tall',lang=process.argv[3]||'ko';
const VP={wideS:{width:740,height:360,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1},pc:{width:1000,height:620},
  tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:3},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:2}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const SAVE=JSON.stringify({v:10,gfx19:true,news18:true,points:900,types:['basic','fast','strong'],type:'strong',tut:{done:true,asked:true},rl:{intro:1},
  set:{quality:'ultra',cond:false,events:false,items:false,rules:'off',cine:'off',masc:'off',tod:'day',lang}});
const OUT=path.join(__dirname,'shots','gq');fs.mkdirSync(OUT,{recursive:true});
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP,protocolTimeout:900000});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error')logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});
  await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('seeded','1');}},SAVE);
  const URL='file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang;
  await page.goto(URL,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  const tap=async(sel)=>{const b=await page.$(sel);const q=await b.boundingBox();if(VP.hasTouch)await page.touchscreen.tap(q.x+q.width/2,q.y+q.height/2);else await page.mouse.click(q.x+q.width/2,q.y+q.height/2);};
  ok(await E(()=>window.__PH.renderer.getContextAttributes().antialias===true),'최고 (default): antialiasing on');
  // 1) the row
  await E(()=>{window.__PH.goScreen('sSet');});await wait(400);await E(()=>{const r=document.querySelector('.setrow.set-gq');r&&r.scrollIntoView({block:'center'});});await wait(250);
  const row=()=>E(()=>{const r=document.querySelector('#setList .setrow.set-gq');if(!r)return null;const P=document.querySelector('#setList').getBoundingClientRect();
    const bs=[...r.querySelectorAll('[data-gq]')].map(b=>{const q=b.getBoundingClientRect();return {k:b.dataset.gq,t:b.textContent,on:b.classList.contains('on'),y:Math.round(q.top),l:q.left,r:q.right,cut:b.scrollWidth>b.clientWidth+1};});
    return {bs,cap:r.querySelector('.gq-cap').innerText.replace(/\s+/g,' '),capB:r.querySelector('.gq-cap b').textContent,inside:bs.every(b=>b.l>=P.left-1&&b.r<=P.right+1),txt:r.innerText};});
  let R=await row();
  ok(R&&R.bs.map(b=>b.k).join()==='max,ultra,high,low,xlow','그래픽 row: 초고사양 · 최고 · 높음 · 절약 · 초저사양 ('+(R&&R.bs.map(b=>b.t).join(' · '))+')');
  ok(R&&new Set(R.bs.map(b=>b.y)).size===1&&R.inside&&R.bs.every(b=>!b.cut),'all five on one line, inside the panel, no label cut');
  ok(R&&R.bs.find(b=>b.on).k==='ultra','the saved 최고 is the one lit');
  if(lang!=='ko'){const ko=(R.txt.match(/[가-힣]+/g)||[]);ok(ko.length===0,'['+lang+'] row translated'+(ko.length?' — Korean left: '+ko.join(' '):''));}
  await page.screenshot({path:path.join(OUT,mode+'_'+lang+'_row.jpg'),type:'jpeg',quality:82});
  // 2) each step in a match: what the renderer really does
  const levels=['max','ultra','high','low','xlow'],M={};
  for(const l of levels){
    await tap('[data-gq="'+l+'"]');await wait(250);R=await row();
    const desc=await E(l=>window.__PH.gqDesc(l).replace(/<[^>]+>/g,''),l);
    if(l==='max'||l==='xlow')ok(R.bs.find(b=>b.on).k===l&&R.cap.includes(desc),'tap '+l+' → lit, the line under it says “'+R.capB+' · '+desc+'”');
    M[l]=await E(l=>{const P=window.__PH,G=P.G,r=P.renderer;window.requestAnimationFrame=()=>0;
      P.startMatch({mode:'quick',size:3,time:180,diff:'normal',oppTypes:['basic','fast','king'],tag:'q',oppName:'R',label:'R'});for(let i=0;i<200;i++)P.step(1/60);G.state='play';for(let i=0;i<30;i++)P.step(1/60);
      r.info.autoReset=false;r.info.reset();P.gfxRender();const inf={triangles:r.info.render.triangles,calls:r.info.render.calls};r.info.autoReset=true;let shadowCast=0;P.scene.traverse(o=>{if(o.isMesh&&o.castShadow&&o.visible)shadowCast++;});
      const cs=P.scene.children.find(o=>o.isInstancedMesh&&o.renderOrder===1&&o.material&&o.material.uniforms&&o.material.uniforms.uO);
      const out={save:[P.save.set.quality,P.save.set.qx],pr:+r.getPixelRatio().toFixed(3),want:+(P.gqRatio()*P.perf.scale).toFixed(3),sh:r.shadowMap.enabled,sunCast:P.sun.castShadow,shSize:P.sun.shadow.mapSize.x,
        colony:P.colony.parts.every(p=>p.m.visible),lamps:P.lamps.every(x=>!x.pl||x.pl.visible),csh:!!(cs&&cs.visible&&cs.count>0),cls:document.body.className.includes('gq-xlow'),
        tri:inf.triangles,calls:inf.calls,aniso:P.iceMat&&P.iceMat.map?P.iceMat.map.anisotropy:null,maxA:r.capabilities.getMaxAnisotropy()};
      P.toMenu();P.goScreen('sSet');return out;},l);
    await wait(300);await E(()=>{const r=document.querySelector('.setrow.set-gq');r&&r.scrollIntoView({block:'center'});});await wait(150);
  }
  console.log('  per step:',JSON.stringify(Object.fromEntries(levels.map(l=>[l,{pr:M[l].pr,sh:M[l].sh,tri:M[l].tri,calls:M[l].calls,colony:M[l].colony,csh:M[l].csh,aniso:M[l].aniso}]))));
  ok(levels.every(l=>Math.abs(M[l].pr-M[l].want)<.001),'resolution = the step (× the automatic step-down): '+levels.map(l=>l+' '+M[l].pr).join(' · '));
  ok(M.max.pr>M.ultra.pr||VP.deviceScaleFactor<=2||!VP.deviceScaleFactor,'초고사양 renders sharper than 최고 on this '+(VP.deviceScaleFactor||1)+'× screen ('+M.max.pr+' vs '+M.ultra.pr+')');
  ok(M.xlow.pr<M.low.pr,'초저사양 renders fewer pixels than 절약 ('+M.xlow.pr+' vs '+M.low.pr+')');
  ok(!M.xlow.sh&&!M.xlow.sunCast&&['max','ultra','high','low'].every(l=>M[l].sh&&M[l].sunCast),'초저사양: no shadow map; every other step keeps it');
  ok(M.max.shSize===M.ultra.shSize&&M.ultra.shSize>=M.high.shSize&&M.high.shSize>M.low.shSize,'shadow map sizes: 초고 '+M.max.shSize+' · 최고 '+M.ultra.shSize+' · 높음 '+M.high.shSize+' · 절약 '+M.low.shSize);
  ok(!M.xlow.colony&&!M.xlow.lamps&&M.low.colony&&M.low.lamps,'초저사양: the far penguin colonies and the floodlights’ point lights are off (back on for 절약)');
  ok(M.xlow.csh,'초저사양: the soft contact pools under skaters + puck are drawn instead of shadows');
  ok(M.xlow.cls&&!M.low.cls,'초저사양: page class that switches off backdrop blur');
  ok(M.max.tri>=M.ultra.tri*.9&&M.xlow.tri<M.low.tri*.65,'초저사양 draws far fewer triangles than 절약: '+M.xlow.tri+' vs '+M.low.tri+' ('+Math.round((1-M.xlow.tri/M.low.tri)*100)+' % fewer)');
  ok(M.max.aniso===Math.min(16,M.max.maxA)&&M.max.aniso>=M.ultra.aniso,'초고사양: sharpest ice filtering (anisotropy '+M.max.aniso+', 최고 '+M.ultra.aniso+')');
  // 3) fur layers on a mascot
  const fur=await E(()=>{const P=window.__PH,n=l=>{P.gqSet(l);const R=P.mBody('blue',null,'bear');let lay=0;R.root.traverse(o=>{const a=o.geometry&&o.geometry.attributes&&o.geometry.attributes.fsh;if(a&&!lay){const s=new Set();for(let i=0;i<a.count;i++)s.add(a.getX(i).toFixed(3));lay=s.size;}});return lay;};
    const o={xlow:n('xlow'),low:n('low'),high:n('high'),ultra:n('ultra'),max:n('max')};P.gqSet('xlow');P.applyQuality();return o;});
  ok(fur.xlow===3&&fur.low===5&&fur.high===8&&fur.ultra===12&&fur.max===16,'mascot fur layers: 초저 3 · 절약 5 · 높음 8 · 최고 12 · 초고 16 '+JSON.stringify(fur));
  // 4) 초저사양 after a reload: the GPU context starts without MSAA, the row says so before
  R=await row();ok(/안티에일리어싱|Antialiasing|抗锯齿|アンチエイリアス/.test(R.cap),'before the reload the row says antialiasing goes off from the next start');
  await page.screenshot({path:path.join(OUT,mode+'_'+lang+'_row_xlow.jpg'),type:'jpeg',quality:82});
  await page.reload({waitUntil:'load'});await wait(2600);
  const re=await E(()=>{const P=window.__PH;return {lvl:P.gqLevel(),aa:P.renderer.getContextAttributes().antialias,sh:P.renderer.shadowMap.enabled};});
  ok(re.lvl==='xlow'&&re.aa===false&&re.sh===false,'reload on 초저사양: kept, no MSAA, no shadow map '+JSON.stringify(re));
  // 5) the one-time hint
  await E(()=>{const P=window.__PH;P.gqSet('ultra');P.save.gqHint=0;P.persist();P.applyQuality();});
  const h=await E(()=>{const P=window.__PH,G=P.G;window.requestAnimationFrame=()=>0;P.startMatch({mode:'quick',size:3,time:180,diff:'normal',oppTypes:['basic','fast','king'],tag:'q',oppName:'R',label:'R'});
    for(let i=0;i<200;i++)P.step(1/60);G.state='play';P.perf.scale=.6;P.perf.ema=1/20;G.rdt=1/60;for(let i=0;i<300;i++)P.gqHintFrame(1/60);const el=document.getElementById('gqTip');
    const r=el&&el.getBoundingClientRect();return {on:!!el,txt:el?el.innerText.replace(/\s+/g,' '):'',inView:!!r&&r.left>=0&&r.right<=innerWidth&&r.top>=0};});
  ok(h.on&&h.inView,'struggling phone in a match → one hint on screen “'+h.txt+'”');
  if(h.on){await page.screenshot({path:path.join(OUT,mode+'_'+lang+'_hint.jpg'),type:'jpeg',quality:82});await tap('#gqTipGo');await wait(300);}
  const after=await E(()=>({lvl:window.__PH.gqLevel(),tip:!!document.getElementById('gqTip'),saved:JSON.parse(localStorage.getItem('penguinHockey.v1')).set.qx,hint:window.__PH.save.gqHint}));
  ok(after.lvl==='xlow'&&!after.tip&&after.saved===-1&&after.hint===1,'tap 초저사양으로 → switched and saved, hint gone for good '+JSON.stringify(after));
  await E(()=>{const P=window.__PH;P.perf.scale=1;P.perf.ema=1/60;P.gqSet('ultra');P.persist();P.toMenu();});
  ok(logs.filter(l=>!/ERR_FAILED|favicon/.test(l)).length===0,'no page errors '+logs.slice(0,3).join(' | '));
  console.log('TOTAL v50gfx '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})();
