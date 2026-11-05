// v33 7-day attendance in a real browser: the dialog opens once on the home screen, a real tap claims, ✕ / back close it,
// the 목표 card, the dialog fits on every screen. usage: node v33daily.js <pc|tall|wide|wideS> [lang]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',lang=process.argv[3]||'ko';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true},wideS:{width:740,height:360,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const SAVE=JSON.stringify({v:10,news18:true,points:1950,types:['basic','fast','strong','defense'],type:'fast',login:{d:5,last:1,cyc:0,tot:5},squad:['strong','defense',null],tut:{done:true,asked:true},rl:{intro:1},
  pass:{s:1,xp:640,gold:false,cf:1,cg:0,fw:0},stats:{played:24,wins:14,goals:61,tourClears:1}});
const OUT=path.join(__dirname,'shots','v33');fs.mkdirSync(OUT,{recursive:true});
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
  await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('__s')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('__s','1');}},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(3000);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{const R=window.__PH.renderer;R.__r=R.render;R.render=function(){};});   // the slow software 3D is skipped; the DOM screens are what we test here
  const tap=async(sel)=>{const b=await E(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,vis:cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0};},sel);
    if(!b||!b.vis)return null;const top=await E((x,y)=>{const e=document.elementFromPoint(x,y);return e?(e.id||e.className||e.tagName)+'':'none';},b.x,b.y);
    if(mode==='pc')await page.mouse.click(b.x,b.y);else await page.touchscreen.tap(b.x,b.y);await wait(350);return top;};
  const shot=n=>page.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:84});

  const dlg=()=>E(()=>{const d=document.getElementById('dlyDlg');if(!d||!d.classList.contains('on'))return null;const b=d.querySelector('.cd-box').getBoundingClientRect();
    const tiles=[...d.querySelectorAll('.dl-t')].map(t=>{const r=t.getBoundingClientRect();return {c:t.className,txt:t.querySelector('span').textContent,w:r.width,sw:t.scrollWidth,cw:t.clientWidth};});
    const btn=d.querySelector('[data-dly="claim"],[data-dly="close"]'),br=btn&&btn.getBoundingClientRect();
    return {box:[b.left,b.top,b.right,b.bottom],vw:innerWidth,vh:innerHeight,tiles,btn:br&&[br.top,br.bottom],btnKind:btn&&btn.dataset.dly,sc:d.querySelector('.cd-box').scrollHeight>d.querySelector('.cd-box').clientHeight+2};});
  await E(()=>window.__PH.goScreen('sMenu'));await wait(1400);
  let D=await dlg();
  ok(!!D,'home screen: the attendance dialog opens by itself (a claim is waiting)');
  if(D){
    ok(D.box[0]>=-1&&D.box[2]<=D.vw+1&&D.box[1]>=-1&&D.box[3]<=D.vh+1,'dialog inside the screen ('+D.box.map(Math.round)+' of '+D.vw+'×'+D.vh+')');
    ok(D.tiles.length===7&&D.tiles.filter(t=>/done/.test(t.c)).length===5&&/today/.test(D.tiles[5].c),'7 tiles: days 1–5 ✓, day 6 highlighted');
    ok(D.tiles.every(t=>t.sw<=t.cw+1),'tile texts fit their tiles'+(D.tiles.some(t=>t.sw>t.cw+1)?' — '+D.tiles.filter(t=>t.sw>t.cw+1).map(t=>t.txt).join(' / '):''));
    ok(D.btn&&D.btn[1]<=D.vh+1&&!D.sc,'claim button visible without scrolling the dialog');
    await shot('dialog');
    const before=await E(()=>({p:window.__PH.save.points,x:window.__PH.save.pass.xp,g:window.__PH.passGain(window.__PH.DLY[5].f)}));
    await tap('#dlyDlg [data-dly="claim"]');await wait(500);
    const after=await E(()=>({p:window.__PH.save.points,x:window.__PH.save.pass.xp,l:window.__PH.save.login,toast:(document.getElementById('toast')||{}).textContent||''}));
    ok(after.l.d===6&&after.x-before.x===before.g&&after.p===before.p&&after.toast.includes('+'+before.g),'tapping 받기: day 6 → 🐟+'+before.g+' on the pass ('+after.toast+')');
    D=await dlg();ok(D&&D.btnKind==='close'&&/pop/.test(D.tiles[5].c)&&/done/.test(D.tiles[5].c),'dialog stays open: day 6 ✓, a 닫기 button');
    await shot('claimed');
    await tap('#dlyDlg .cd-x');await wait(300);ok(!(await dlg()),'✕ closes the dialog');
    await E(()=>window.__PH.goScreen('sSet'));await wait(200);await E(()=>window.__PH.goScreen('sMenu'));await wait(1200);
    ok(!(await dlg()),'back on the home screen the same day: no dialog again');
  }
  // 목표 tab card → opens the dialog; the Android back closes it
  await E(()=>window.__PH.goScreen('sGoals'));await wait(400);
  const cardTxt=await E(()=>{const c=document.querySelector('#gBody .dl-card');return c?c.textContent:'';});ok(cardTxt.length>4,'목표: attendance card on top ('+cardTxt+')');
  await shot('goals');
  await tap('#gBody .dl-card [data-dly="open"]');await wait(400);ok(!!(await dlg()),'its button opens the dialog');
  await E(()=>window.__PH.phBack());await wait(300);ok(!(await dlg())&&await E(()=>window.__PH.G.ui==='sGoals'),'back button closes only the dialog');
  // a later day: day 7 → trail
  await E(()=>{const P=window.__PH;P.save.login.last=P.dlyDay()-1;P.dlyOpen();});await wait(400);D=await dlg();
  ok(D&&D.tiles[6].txt.includes('+')&&/today/.test(D.tiles[6].c),'next day: day 7 tile (trail) highlighted: '+(D&&D.tiles[6].txt));
  await tap('#dlyDlg [data-dly="claim"]');await wait(500);
  const t7=await E(()=>({own:window.__PH.save.trails.includes('dly'),l:window.__PH.save.login}));ok(t7.own&&t7.l.d===0&&t7.l.cyc===1,'day 7 claimed: trail owned, cycle 1 done');
  D=await dlg();ok(D&&D.tiles.every(t=>/done/.test(t.c)),'all 7 tiles ✓ after the cycle');await shot('day7');
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,4).join(' | '):''));
  console.log('TOTAL '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
