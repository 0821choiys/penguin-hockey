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
  // the character eyes (owner 2026-11-14: "the eyes are creepy"): flat white oval, a pupil ≈ 80 % of it, the left one mirrored,
  // and the size lives on the meshes so the blink (which writes the eye group's scale.y every frame) keeps the eye round
  const ey=await E(()=>{const P=window.__PH,T=window.THREE,V=P.PKV,K=P.PKE,out={bad:[]};
    for(const k of Object.keys(P.TYPES)){const g=P.buildPenguin(k,'blue','none',{num:7});
      for(const [e,s] of[[g.eyeL,-1],[g.eyeR,1]]){if(e.scale.x!==1||e.scale.z!==1)out.bad.push(k+' group scale '+e.scale.x);
        if(e.children.length!==2)out.bad.push(k+' parts '+e.children.length);
        const base=e.children[0],gz=e.children[1],pm=gz.children[0].children[0];
        if(Math.abs(base.scale.x-s*V.eye)>1e-9||Math.abs(base.scale.y-V.eye)>1e-9)out.bad.push(k+' white scale');
        // the pupil's world size equals the white's scale (the holder squeeze K.gz is undone on the mesh)
        if(Math.abs(pm.scale.x*gz.scale.x-s*V.eye)>1e-9||Math.abs(pm.scale.y*gz.scale.y-V.eye)>1e-9)out.bad.push(k+' pupil scale');}
      if(g.pupR!==g.eyeR.children[1].children[0]||g.pupL!==g.eyeL.children[1].children[0])out.bad.push(k+' pupils');
      const geo=P.pk43EyeGeos(k);geo.base.computeBoundingBox();geo.pupil.computeBoundingBox();const b=geo.base.boundingBox,p=geo.pupil.boundingBox;
      const fw=(p.max.x-p.min.x)/(b.max.x-b.min.x),fh=(p.max.y-p.min.y)/(b.max.y-b.min.y);if(!(fw>.75&&fw<.9&&fh>.75&&fh<.9))out.bad.push(k+' pupil '+fw.toFixed(2));
      if(p.min.x<b.min.x||p.max.x>b.max.x||p.min.y<b.min.y||p.max.y>b.max.y)out.bad.push(k+' pupil outside');
      // the widest gaze animatePenguin writes (.034 sideways, -.025 for the sad look) keeps the pupil on the white (≤ .002 over)
      const gx=.034*K.gz/V.eye,gy=.025*K.gz/V.eye;if(p.min.x-gx<b.min.x-.002||p.max.x+gx>b.max.x+.002||p.min.y-gy<b.min.y-.002)out.bad.push(k+' gaze leaves the white');
      // the white really is white; the pupil has a black centre and its iris is darker than the white (the yellow-eyed keeps a yellow iris)
      const cb=geo.base.attributes.color,cp=geo.pupil.attributes.color;if(cb&&cb.getX(0)<.9)out.bad.push(k+' base not white');
      if(cp){let mn=9;for(let j=0;j<cp.count;j++)mn=Math.min(mn,cp.getX(j)+cp.getY(j)+cp.getZ(j));const lum=cp.getX(0)*.3+cp.getY(0)*.59+cp.getZ(0)*.11;if(mn>.1||lum>.8)out.bad.push(k+' pupil '+mn.toFixed(2)+'/'+lum.toFixed(2));}
      out.fw=fw;}
    return out;});
  ok(ey.bad.length===0,'16 species: flat white eye, pupil '+(ey.fw*100|0)+' % of it, left eye mirrored, size on the meshes (blink-proof), gaze stays on the white '+ey.bad.slice(0,4).join(' | '));
  // in a real match: the blink squashes the eye group (scale.y < 1 at some point) and its x / z stay 1
  const bl=await E(()=>{const P=window.__PH,G=P.G;
    P.startMatch({mode:'free',size:3,time:0,diff:'normal',tag:'T',oppTypes:['basic','fast','strong']});for(let i=0;i<60*4&&G.state!=='play';i++)P.step(1/60);
    const pg=G.player.pg;let minY=9,maxY=0,badX=0;for(let i=0;i<60*12;i++){P.step(1/60);const e=pg.eyeR;minY=Math.min(minY,e.scale.y);maxY=Math.max(maxY,e.scale.y);if(e.scale.x!==1||pg.eyeL.scale.x!==1)badX++;}
    const m=pg.eyeR.children[0];return {minY:+minY.toFixed(2),maxY:+maxY.toFixed(2),badX,mesh:+m.scale.y.toFixed(3),state:G.state};});
  ok(bl.minY<.5&&bl.maxY<=1.0001&&bl.badX===0&&Math.abs(bl.mesh-1.16)<1e-3,'12 s of play: the eyes blink (scale.y '+bl.minY+'…'+bl.maxY+'), never stretched sideways, eye meshes ×'+bl.mesh+' ('+bl.state+')');
  // a close-up of three penguins for the eye
  await page.setViewport({width:1200,height:800,deviceScaleFactor:1});
  await E(()=>{const P=window.__PH;window.requestAnimationFrame=()=>0;document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
    const ks=['basic','king','macaroni'];window.__ab=[];ks.forEach((k,i)=>{const g=P.buildPenguin(k,i===1?'red':'blue','none',{num:7+i});g.root.position.set(-2.2+i*2.2,0,0);g.root.rotation.y=.45-i*.4;g.stick.visible=false;P.scene.add(g.root);window.__ab.push(g.root);});
    const c=P.camera;c.position.set(0,1.75,5.4);c.lookAt(0,1.05,0);c.fov=40;c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();for(let i=0;i<3;i++)P.shFit&&P.shFit();P.renderer.render(P.scene,c);});
  await wait(200);await shot('close');
  const errs=logs.filter(l=>!/favicon|net::ERR/.test(l));ok(errs.length===0,'no page errors '+errs.slice(0,3).join(' | '));
  console.log('TOTAL: '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e);process.exit(1);});
