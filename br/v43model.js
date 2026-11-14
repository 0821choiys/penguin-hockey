// v43: the re-proportioned penguins on the real three.js — head rig scale, scarf, eyes, blush, round head copy, cost; plus a close-up shot.  usage: node v42legal.js <pc|tall|wide|wideS> <lang>
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'tall',lang=process.argv[3]||'ko';
const VP={wideS:{width:740,height:360,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1},pc:{width:1000,height:620},
  tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const ALL=['basic','fast','little','balanced','african','humboldt','magellanic','defense','macaroni','fiordland','galapagos','royal','yelloweye','strong','king','auk'];
const OWN=ALL.filter(k=>k!=='little'&&k!=='galapagos');const lv={};OWN.forEach((k,i)=>lv[k]=1+(i*3)%10);
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:OWN,type:'strong',team:'blue',lv,tut:{done:true,asked:true},hat:'none',rl:{intro:1},brk:{king:5},
  set:{quality:'ultra',cond:false,events:false,items:false,rules:'off',cine:'off',tod:'day',lang}});
const OUT=path.join(__dirname,'shots','v43');fs.mkdirSync(OUT,{recursive:true});
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error')logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});
  await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('seeded','1');}},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2500);
  const E=(f,...a)=>page.evaluate(f,...a);const shot=n=>page.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:88});
  const r=await E(()=>{const P=window.__PH,T=window.THREE,V=P.PKV,out={bad:[],n:0};
    const verts=g=>{let v=0,d=0;g.root.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.position){v+=o.geometry.attributes.position.count;d++;}});return [v,d];};
    for(const k of Object.keys(P.TYPES))for(const hat of['none','helmet']){const g=P.buildPenguin(k,'blue',hat,{num:7});out.n++;
      if(Math.abs(g.head.scale.x-V.head)>1e-9)out.bad.push(k+' scale');
      const sc=g.inner.children.find(m=>m.isMesh&&m.geometry===P.pk43ScarfGeo('blue'));if(!sc)out.bad.push(k+' scarf');
      if(Math.abs(g.eyeR.rotation.y)>(P.TYPES[k].patch==='auk'?.6:V.eth+1e-6))out.bad.push(k+' eyes');
      const bl=g.headAbs.children.filter(m=>m.isMesh&&m.geometry&&m.geometry.type==='CircleGeometry').length;if(hat==='none'&&bl!==(P.pk43Light(P.TYPES[k])&&P.TYPES[k].patch!=='auk'?2:0))out.bad.push(k+' blush '+bl);
      const hm=g.headAbs.children.find(m=>m.isMesh&&m.geometry===P.pkHeadGeo(k));if(hm)out.bad.push(k+' head not rounded');
      if(k==='basic'&&hat==='none'){const [v,d]=verts(g);out.basic={v,d};}}
    // the scarf really wraps the new neck: wider than the scaled head at that height
    const Y=V.scarfY,g=P.pk43ScarfGeo('blue');g.computeBoundingBox();out.scarfR=+(g.boundingBox.max.x).toFixed(3);out.headR=+P.pk43HeadR(Y).toFixed(3);
    // the shared head geometry is untouched
    const h=P.pkHeadGeo('basic');h.computeBoundingBox();out.cacheTop=+h.boundingBox.max.y.toFixed(3);
    return out;});
  ok(r.bad.length===0&&r.n===32,'16 species × (no hat, helmet): head rig ×'+1.28+', new scarf, eyes forward, blush only on light faces, rounded head copy '+r.bad.slice(0,4).join(' | '));
  ok(r.scarfR>r.headR,'the scarf ('+r.scarfR+') wraps the head at the neck ('+r.headR+')');
  ok(Math.abs(r.cacheTop-1.708)<.002,'the cached head geometry still tops out at 1.708 (the rounding works on a copy)');
  ok(r.basic&&r.basic.v<30000&&r.basic.d<45,'cost of one penguin on 최고: '+JSON.stringify(r.basic));
  // a close-up of three penguins for the eye
  await page.setViewport({width:1200,height:800,deviceScaleFactor:1});
  await E(()=>{const P=window.__PH;window.requestAnimationFrame=()=>0;document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
    const ks=['basic','king','macaroni'];window.__ab=[];ks.forEach((k,i)=>{const g=P.buildPenguin(k,i===1?'red':'blue','none',{num:7+i});g.root.position.set(-2.2+i*2.2,0,0);g.root.rotation.y=.45-i*.4;g.stick.visible=false;P.scene.add(g.root);window.__ab.push(g.root);});
    const c=P.camera;c.position.set(0,1.75,5.4);c.lookAt(0,1.05,0);c.fov=40;c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();for(let i=0;i<3;i++)P.shFit&&P.shFit();P.renderer.render(P.scene,c);});
  await wait(200);await shot('close');
  const errs=logs.filter(l=>!/favicon|net::ERR/.test(l));ok(errs.length===0,'no page errors '+errs.slice(0,3).join(' | '));
  console.log('TOTAL: '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e);process.exit(1);});
