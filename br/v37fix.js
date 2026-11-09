// v37 weekly fixes in a real browser: touch button labels on one line (every language, every orientation), a finished
// fish pass on the objectives screen / 7-day card (no fish promised that cannot be taken).
// cancel / Escape), the saved layout in a match and after a reload, the joystick resting ring, follow vs fixed ring,

// usage: node v37fix.js <pc|tall|wide|wideS> [lang]   → shots/v37/<mode>_<lang>_*.jpg
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'tall',lang=process.argv[3]||'ko';
const VP={wideS:{width:740,height:360,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1},pc:{width:1000,height:620},
  tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true,deviceScaleFactor:1}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:['basic','fast','strong'],type:'strong',tut:{done:true,asked:true},hat:'none',rl:{intro:1},
  set:{quality:'low',cond:false,events:false,items:false,rules:'off',cine:'off',tod:'day',lang}});
const OUT=path.join(__dirname,'shots','v37');fs.mkdirSync(OUT,{recursive:true});
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
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});
  await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('seeded','1');}let seed=4242;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};},SAVE);
  const URL='file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang;
  await page.goto(URL,{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{window.requestAnimationFrame=()=>0;});
  const shot=async n=>{await E(()=>{const P=window.__PH;try{P.gfxRender?P.gfxRender():P.renderer.render(P.scene,P.camera);}catch(e){}});await wait(150);await page.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:80});};
  const startM=()=>E(()=>{const P=window.__PH,G=P.G;P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'T',oppTypes:['basic','fast','strong']});
    document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));G.state='play';G.stateT=0;for(let i=0;i<60*2;i++)P.step(1/60);P.updateCamera(1);});
  // ---- touch labels ----
  if(VP.hasTouch){
    await startM();await wait(300);
    const lab=()=>E(()=>[...document.querySelectorAll('#touch .tb')].filter(b=>getComputedStyle(b).display!=='none').map(b=>{const r=document.createRange();r.selectNodeContents(b);
      const rs=[...r.getClientRects()].filter(q=>q.width>0),q=r.getBoundingClientRect(),w=b.getBoundingClientRect().width;
      return {id:b.id,t:b.textContent,lines:new Set(rs.map(x=>Math.round(x.top))).size,tw:Math.round(q.width),w:Math.round(w),fs:parseFloat(getComputedStyle(b).fontSize)};}));
    let L=await lab();
    ok(L.length>=4&&L.every(x=>x.lines===1),'every touch label on one line: '+L.map(x=>x.t+'('+x.lines+')').join(' '));
    ok(L.every(x=>x.tw<=x.w*.88+1),'every label fits inside its circle: '+L.map(x=>x.t+' '+x.tw+'/'+x.w).join(' · '));
    ok(L.every(x=>x.fs>=10),'labels stay readable at the normal size (font ≥ 10 px): '+L.map(x=>x.fs).join(','));
    await shot('match');
    // smallest buttons the editor allows → still one line
    await E(()=>{const P=window.__PH;const c=P.save.set.ctl;c.sz=.7;P.ctlApply(c);});await wait(100);L=await lab();
    ok(L.every(x=>x.lines===1&&x.tw<=x.w),'buttons at 70 % (smallest): still one line, not wider than the circle ('+L.map(x=>x.tw+'/'+x.w).join(' ')+')');
    await E(()=>{const P=window.__PH;const c=P.save.set.ctl;c.sz=1;P.ctlApply(c);});
    await E(()=>window.__PH.toMenu());await wait(300);
  }
  // ---- landscape home: short tile titles stay on one line (no 转会市/场, 移籍市/場) ----
  if(/^wide/.test(mode)&&/^(zh|ja)$/.test(lang)){   // Chinese / Japanese break anywhere; Korean and English break at spaces
    await E(()=>window.__PH.toMenu());await wait(500);
    const T=await E(()=>[...document.querySelectorAll('#sMenu .hm-tile .tx b, #sMenu .hm-cta b')].map(b=>{const n=[...b.childNodes].find(x=>x.nodeType===3&&x.data.trim());if(!n)return null;
      const r=document.createRange();r.selectNodeContents(n);return {t:n.data.trim(),l:new Set([...r.getClientRects()].map(q=>Math.round(q.top))).size};}).filter(Boolean));
    const short=T.filter(x=>x.t.replace(/[\s\u200b]/g,'').length<=6);
    ok(short.length>=2&&short.every(x=>x.l===1),'landscape home: short tile titles on one line: '+T.map(x=>x.t+'('+x.l+')').join(' '));
    await shot('home');
  }
  // ---- finished fish pass: objectives screen and the 7-day card ----
  await E(()=>{const P=window.__PH,S=P.save;S.pass.s=P.seasonNow();S.pass.xp=P.PASS.tiers*P.PASS.per;S.login={d:1,last:P.dlyDay()-1,cyc:0,tot:1};S.clk=0;P.goalsEnsure();P.goScreen('sGoals');});await wait(500);
  const gs=await E(()=>{const g=document.querySelector('#sGoals.on')||document.getElementById('sGoals');return g?g.innerText:'';});
  ok(gs&&!gs.includes('🐟'),'pass complete: the objectives screen promises no fish');
  ok(/⭐\s?40\s?P/.test(gs),'the 7-day card offers ⭐40P for the fish day');
  await shot('goals_full');
  await E(()=>{const P=window.__PH;P.save.pass.xp=0;P.goScreen('sGoals');});await wait(400);
  const gs2=await E(()=>document.getElementById('sGoals').innerText);
  ok(gs2.includes('🐟'),'pass not complete: fish shown again');
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,3).join(' | '):''));
  console.log('TOTAL v37fix '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
