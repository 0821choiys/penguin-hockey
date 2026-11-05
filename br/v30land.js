// v30 in a real browser: landscape phones — every panel fits the screen, the one-line header (title / tabs / buttons / points chip)
// never overlaps, pass track + 완료 visible, mode screen's 뒤로 on screen, settings in 2 columns, pass track clear of its labels;
// portrait and PC keep their layout; the match camera backs off on 4:3 landscape tablets.
// usage: node v30land.js <wide|wideS|padl|tall|pc> [lang]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'wide',lang=process.argv[3]||'ko';
const VP={wideS:{width:740,height:360,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:2},padp:{width:768,height:1024,isMobile:true,hasTouch:true,deviceScaleFactor:1},padl:{width:1024,height:768,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1},pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const ALL=['basic','balanced','fast','defense','strong','king','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos','auk'];
const SAVE0=1;const SAVE=JSON.stringify({v:10,news18:true,points:900,types:ALL,type:'strong',squad:['basic','fast',null],tut:{done:true,asked:true},hat:'none',rl:{intro:1},set:{quality:'ultra',cond:false,events:false,items:false,rules:'full',cine:'full',tod:'day'}});
const OUT=path.join(__dirname,'shots','v30');fs.mkdirSync(OUT,{recursive:true});
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
  await E(()=>{window.requestAnimationFrame=()=>0;});
  const land=VP.width>VP.height&&VP.height<=520;
  const ids=['sMode','sHow','sSelect','sScout','sSquad','sMarket','sProfile','sRanked','sGoals','sPass','sSet'];
  for(const id of ids){
    const r=await E(id=>{const P=window.__PH;P.goScreen(id);document.getAnimations().forEach(a=>{try{a.finish();}catch(e){}});const sc=document.getElementById(id);const vw=innerWidth,vh=innerHeight;
      const vis=e=>{if(!e)return false;const cs=getComputedStyle(e),b=e.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&b.width>0&&b.height>0;};
      const B=e=>{const b=e.getBoundingClientRect();return {l:b.left,t:b.top,r:b.right,b:b.bottom};};
      const panel=sc.querySelector('.panel')||sc.querySelector('.col');const pb=B(panel);
      const inside=pb.l>=-1&&pb.t>=-1&&pb.r<=vw+1&&pb.b<=vh+1;
      // header pieces: h2, tabs, the last button row, the points chip
      const hs=[panel.querySelector(':scope>h2'),panel.querySelector(':scope>.seg'),panel.querySelector(':scope>.row:last-child'),document.getElementById('pts')].filter(vis);
      let ov=[];for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++){const a=B(hs[i]),b=B(hs[j]);if(a.l<b.r-1&&b.l<a.r-1&&a.t<b.b-1&&b.t<a.b-1)ov.push((hs[i].id||hs[i].tagName)+'/'+(hs[j].id||hs[j].className||hs[j].tagName));}
      const btns=[...sc.querySelectorAll('button')].filter(vis).filter(b=>/완료|뒤로|Done|Back|完成|返回|完了|戻る/.test(b.textContent));
      const closeOn=btns.some(b=>{const x=B(b);return x.t>=0&&x.b<=vh+1&&x.l>=0&&x.r<=vw+1;});
      const h2=panel.querySelector(':scope>h2'),rw=panel.querySelector(':scope>.row:last-child');const cy=e=>{const b=e.getBoundingClientRect();return (b.top+b.bottom)/2;};const oneLine=!!(h2&&rw&&vis(h2)&&vis(rw)&&Math.abs(cy(h2)-cy(rw))<10);
      return {id,pfix:panel.classList.contains('pfix'),inside,pb:[Math.round(pb.t),Math.round(pb.b)],ov,closeOn,oneLine};},id);
    if(land||r.pfix)ok(r.inside,id+': panel inside the screen ('+r.pb.join('–')+' of '+VP.height+')');
    ok(r.ov.length===0,id+': header pieces do not overlap'+(r.ov.length?' '+r.ov.join(', '):''));
    if(land)ok(r.closeOn,id+': its 완료 / 뒤로 button is on screen');
    if(id==='sSet'&&land)ok(r.oneLine,'sSet: title and 완료 share one top line in landscape');
    if(id==='sSet'&&!land)ok(!r.oneLine,'sSet: '+mode+' keeps its usual header (title on top, 완료 at the bottom)');
  }
  if(land){
    const s=await E(()=>{window.__PH.goScreen('sSet');const rows=[...document.querySelectorAll('#setList>*')].filter(e=>e.getBoundingClientRect().height>0);const xs=new Set(rows.map(e=>Math.round(e.getBoundingClientRect().left)));return xs.size;});
    ok(s>=2,'settings: two columns in landscape ('+s+' column starts)');
  }
  const ps=await E(()=>{window.__PH.goScreen('sPass');document.getAnimations().forEach(a=>{try{a.finish();}catch(e){}});const tr=document.getElementById('psTrack'),lab=tr.querySelector('.ps-lab'),c0=tr.querySelector('.ps-col'),done=document.querySelector('#sPass .pp-panel>.row .btn');
    const b=e=>e.getBoundingClientRect();return {labR:b(lab).right,c0L:b(c0).left,trB:b(tr).bottom,trT:b(tr).top,doneB:b(done).bottom,vh:innerHeight};});
  ok(ps.c0L>=ps.labR-1,'pass: tier 1 is not hidden under the track labels ('+Math.round(ps.c0L)+' ≥ '+Math.round(ps.labR)+')');
  if(land)ok(ps.trB<=ps.vh&&ps.doneB<=ps.vh,'pass: reward track and 완료 visible without scrolling');
  await page.screenshot({path:path.join(OUT,mode+'_'+lang+'_pass.jpg'),type:'jpeg',quality:82});
  const lz=await E(()=>{const f=window.__PH.landZoom;return [f(.46),f(1),f(1.33),f(1.6),f(2.16)].map(x=>+x.toFixed(3));});
  ok(lz[0]===1&&lz[1]===1&&lz[2]>1.13&&lz[3]===1&&lz[4]===1,'match camera: backs off only between aspect 1 and 1.6 ('+lz.join(', ')+')');
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,3).join(' | '):''));
  console.log('TOTAL v30land '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
