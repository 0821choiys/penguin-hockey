// v48 ice slipperiness in a real browser: the 설정 row (under 조작 설정, five steps on one line, ends named, chosen step spelled out, nothing spills
// out, translated), a tap changes the step + the save, survives a reload, and a match skates with the matching factors (online forced to 3).
// usage: node v48ice.js <pc|tall|wide|wideS> [lang]   → shots/ice/<mode>_<lang>_*.jpg
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
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:['basic','fast','strong'],type:'strong',tut:{done:true,asked:true},hat:'none',rl:{intro:1},
  set:{quality:'low',cond:false,events:false,items:false,rules:'off',cine:'off',masc:'off',tod:'day',lang}});
const OUT=path.join(__dirname,'shots','ice');fs.mkdirSync(OUT,{recursive:true});
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
  const URL='file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang;
  await page.goto(URL,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  const tap=async(x,y)=>{if(VP.hasTouch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);};
  const openSet=async()=>{await E(()=>window.__PH.goScreen('sSet'));await wait(400);await E(()=>{const r=document.getElementById('iceRow');if(r)r.scrollIntoView({block:'center'});});await wait(250);};
  const info=()=>E(()=>{const r=document.getElementById('iceRow'),l=document.getElementById('setList');if(!r)return null;const R=r.getBoundingClientRect(),P=l.getBoundingClientRect();
    const bs=[...r.querySelectorAll('[data-ice]')].map(b=>{const q=b.getBoundingClientRect();return {t:b.textContent,on:b.classList.contains('on'),x:q.left,y:q.top,w:q.width,h:q.height,cx:q.left+q.width/2,cy:q.top+q.height/2};});
    const spill=[...r.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&(e.scrollWidth>e.clientWidth+1)).map(e=>e.textContent.slice(0,20));
    const kids=[...l.children];return {idx:kids.indexOf(r),after:r.previousElementSibling&&r.previousElementSibling.id,bs,cap:r.querySelector('.ice-cap b').textContent,ends:r.querySelector('.ice-ends').innerText,txt:r.innerText,
      inPanel:R.left>=P.left-1&&R.right<=P.right+1,spill,save:JSON.parse(localStorage.getItem('penguinHockey.v1')).set.ice,lv:window.__PH.iceLv()};});
  // 1) the row
  await openSet();let I=await info();
  ok(I&&I.after==='ctlRow','🧊 row right under 🎮 조작 설정 '+JSON.stringify(I&&{idx:I.idx,after:I.after}));
  ok(I&&I.bs.length===5&&I.bs.map(b=>b.t).join('')==='12345'&&I.bs.filter(b=>b.on).length===1&&I.bs[2].on,'five steps 1–5, step 3 chosen on a new save');
  ok(I&&Math.max(...I.bs.map(b=>b.y))-Math.min(...I.bs.map(b=>b.y))<2,'all five on one line');
  ok(I&&I.bs.every(b=>b.w>=(VP.hasTouch?36:30)&&b.h>=30),'buttons big enough to tap ('+(I&&I.bs.map(b=>Math.round(b.w)+'×'+Math.round(b.h)).join(' '))+')');
  ok(I&&I.inPanel&&I.spill.length===0,'nothing spills out of the row / panel'+(I&&I.spill.length?' '+I.spill.join(' | '):''));
  const names=await E(()=>[1,2,3,4,5].map(i=>window.__PH.iceName(i)));
  ok(I&&I.cap.indexOf('3 · '+names[2])===0,'the chosen step spelled out: “'+(I&&I.cap)+'”');
  if(lang!=='ko'){const ko=(I.txt.match(/[가-힣]+/g)||[]);ok(ko.length===0,'['+lang+'] row fully translated'+(ko.length?' — Korean left: '+ko.join(' '):''));}
  await page.screenshot({path:path.join(OUT,mode+'_'+lang+'_row3.jpg'),type:'jpeg',quality:82});
  // 2) tap step 1, then step 5
  await tap(I.bs[0].cx,I.bs[0].cy);await wait(300);I=await info();
  ok(I.bs[0].on&&I.save===1&&I.lv===1&&I.cap.indexOf('1 · '+names[0])===0,'tap 1 → step 1 chosen, saved, shown ('+I.cap+')');
  await tap(I.bs[4].cx,I.bs[4].cy);await wait(300);I=await info();
  ok(I.bs[4].on&&I.save===5&&I.cap.indexOf('5 · '+names[4])===0,'tap 5 → step 5 ('+I.cap+')');
  await page.screenshot({path:path.join(OUT,mode+'_'+lang+'_row5.jpg'),type:'jpeg',quality:82});
  // 3) reload keeps it
  await page.reload({waitUntil:'load'});await wait(2600);await openSet();I=await info();
  ok(I.save===5&&I.bs[4].on,'after a reload step 5 is still chosen');
  // 4) a match skates with the matching factors; online it is step 3
  const m=await E(()=>{const P=window.__PH,G=P.G;window.requestAnimationFrame=()=>0;P.startMatch({mode:'quick',size:3,time:60,diff:'normal',oppTypes:['basic','fast','king'],tag:'q',oppName:'R',label:'R'});
    const p=G.pengs.find(q=>q.human&&!q.goalie),h=1/120,run=()=>{p.fall=0;p.slow=0;p.dashT=0;p.boostT=0;p.slideT=0;p.heading=0;p.vx=0;p.vz=0;if(G.carry===p)G.carry=null;
      for(let t=0;t<3;t+=h){p.ix=0;p.iz=1;p.x=0;p.z=0;P.movePeng(p,h);}let z=0;for(let t=0;t<20&&Math.hypot(p.vx,p.vz)>.5;t+=h){p.ix=0;p.iz=0;p.x=0;p.z=0;P.movePeng(p,h);z+=p.z;}return z;};
    const out={};for(const i of[1,3,5]){P.save.set.ice=i;out[i]=run();}P.save.set.ice=5;G.net='host';out.net=P.iceLv();out.netStop=run();G.net='';P.toMenu();return out;});
  ok(m[1]<m[3]&&m[3]<m[5],'in a match: stopping distance '+m[1].toFixed(2)+' m (1) < '+m[3].toFixed(2)+' m (3) < '+m[5].toFixed(2)+' m (5)');
  ok(m.net===3&&Math.abs(m.netStop-m[3])<.01,'online: step 3 whatever the setting ('+m.netStop.toFixed(2)+' m)');
  await E(()=>{const P=window.__PH;P.save.set.ice=3;P.persist();});
  ok(logs.filter(l=>!/ERR_FAILED|favicon/.test(l)).length===0,'no page errors '+logs.slice(0,3).join(' | '));
  console.log('TOTAL v48ice '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})();
