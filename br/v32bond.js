// v32 growth stories in a real browser: result screen row + new chapter card, card dialog chapters. usage: node v32bond.js <pc|tall|wide|wideS> [lang]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',lang=process.argv[3]||'ko';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true},wideS:{width:740,height:360,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const SAVE=JSON.stringify({v:10,news18:true,points:1950,types:['basic','fast','strong','defense'],type:'fast',bond:{fast:{g:2,w:1,gl:3,lv:0},strong:{g:50,w:30,gl:80,lv:4}},squad:['strong','defense',null],tut:{done:true,asked:true},rl:{intro:1},
  pass:{s:1,xp:640,gold:false,cf:1,cg:0,fw:0},stats:{played:24,wins:14,goals:61,tourClears:1}});
const OUT=path.join(__dirname,'shots','v32');fs.mkdirSync(OUT,{recursive:true});
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
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('__s')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('__s','1');}},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(3000);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{const R=window.__PH.renderer;R.__r=R.render;R.render=function(){};});   // the slow software 3D is skipped; the DOM screens are what we test here
  const tap=async(sel)=>{const b=await E(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,vis:cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0};},sel);
    if(!b||!b.vis)return null;const top=await E((x,y)=>{const e=document.elementFromPoint(x,y);return e?(e.id||e.className||e.tagName)+'':'none';},b.x,b.y);
    if(mode==='pc')await page.mouse.click(b.x,b.y);else await page.touchscreen.tap(b.x,b.y);await wait(350);return top;};
  const shot=n=>page.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:84});

  const inView=(sel)=>E(s=>{const out=[];for(const e of document.querySelectorAll(s)){const r=e.getBoundingClientRect();out.push({w:r.width,h:r.height,l:r.left,r:r.right,t:r.top,b:r.bottom,iw:innerWidth});}return out;},sel);
  // ---- result: the 3rd match with Gentoo opens chapter 1 ----
  const rs=await E(()=>{const P=window.__PH,G=P.G;const p0=P.save.points;P.startMatch({mode:'quick',size:3,time:60,diff:'easy',tag:'Q',oppTypes:['basic','fast','strong']});
    G.state='play';G.stateT=0;for(let i=0;i<30;i++)P.step(1/60);G.mine.score=2;G.mine.opp.score=1;
    P.endMatch();for(let i=0;i<200;i++)P.step(1/60);const el=document.getElementById('sResult');const R=G.result;
    return {on:el&&el.classList.contains('on'),row:(document.querySelector('.bd-row')||{}).textContent||'',nw:(document.querySelector('.bd-new')||{}).textContent||'',
      ch:P.BOND_TXT.fast[0],b:P.bondOf('fast'),pts:P.save.points-p0,total:R.total,bpts:R.bond&&R.bond.pts,
      totalTxt:(document.querySelector('#sResult')||{}).textContent||''};});
  console.log('row:',rs.row,'| new:',rs.nw.slice(0,90));
  ok(rs.on&&rs.b.g===3&&rs.b.lv===1,'3rd Gentoo match → bond 3 matches, chapter 1');
  ok(/1\/4/.test(rs.row)&&/7/.test(rs.row),'result row shows 1/4 and 7 matches to the next chapter: '+rs.row);
  ok(rs.nw.includes('+50P')&&(lang!=='ko'||rs.nw.includes(rs.ch)),'new chapter card with its text and +50P');
  ok(rs.pts===rs.total+rs.bpts,'points gained ('+rs.pts+') = result total '+rs.total+' + chapter reward '+rs.bpts);
  const vis=await inView('#sResult .bd-row,#sResult .bd-new');ok(vis.length===2&&vis.every(v=>v.w>40&&v.l>=-1&&v.r<=v.iw+1),'row and chapter card are inside the screen width');
  await E(()=>{const e=document.querySelector('#sResult .bd-new');let a=e&&e.parentElement;while(a&&!(a.scrollHeight>a.clientHeight+2&&/auto|scroll/.test(getComputedStyle(a).overflowY)))a=a.parentElement;if(a&&e)a.scrollTop+=e.getBoundingClientRect().top-a.getBoundingClientRect().top-30;});await wait(300);await shot('result');
  // ---- card dialog: Emperor with all 4 chapters + nickname, Adélie all locked ----
  await E(()=>{window.__PH.goScreen('sMenu');window.__PH.openCard('strong');});await wait(600);
  const cd=await E(()=>{const c=document.querySelector('#cardDlg .bd-card');return c?{txt:c.textContent,open:c.querySelectorAll('.bd-ch:not(.lock)').length,lock:c.querySelectorAll('.bd-ch.lock').length,nick:(c.querySelector('.bd-nick')||{}).textContent||''}:null;});
  ok(cd&&cd.open===4&&cd.lock===0&&cd.nick.length>2,'Emperor card: 4 chapters open and the nickname '+(cd&&cd.nick));
  await E(()=>{const e=document.querySelector('#cardDlg .bd-card');if(e)e.scrollIntoView({block:'center'});});await wait(300);await shot('card_strong');
  await E(()=>{const b=document.querySelector('[data-cd="close"]');b&&b.click();window.__PH.openCard('basic');});await wait(600);
  const cb=await E(()=>{const c=document.querySelector('#cardDlg .bd-card');return c?{lock:c.querySelectorAll('.bd-ch.lock').length,txt:c.textContent}:null;});
  ok(cb&&cb.lock===4&&/3/.test(cb.txt)&&/\+50P/.test(cb.txt),'Adélie card (0 matches): 4 locked chapters, first says 3 matches, +50P');
  const cv=await inView('#cardDlg .bd-card');ok(cv.length===1&&cv[0].l>=-1&&cv[0].r<=cv[0].iw+1,'story box inside the screen width');
  await E(()=>{const e=document.querySelector('#cardDlg .bd-card');if(e)e.scrollIntoView({block:'center'});});await wait(300);await shot('card_basic');
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,4).join(' | '):''));
  console.log('TOTAL '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
