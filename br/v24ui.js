// v22–v24 screens in a real browser: home entry, Sardine Pass screen (claim / gold with real taps), result screen rows,
// settings row "하키 규칙", help sections, cast banner. usage: node v24ui.js <pc|tall|wide> [lang]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',lang=process.argv[3]||'ko';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');
  if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const SAVE=JSON.stringify({v:10,news18:true,points:1950,types:['basic','fast','strong','defense'],type:'fast',squad:['strong','defense',null],tut:{done:true,asked:true},rl:{intro:1},
  pass:{s:1,xp:640,gold:false,cf:1,cg:0,fw:0},stats:{played:24,wins:14,goals:61,tourClears:1}});
const OUT=path.join(__dirname,'shots','v24');fs.mkdirSync(OUT,{recursive:true});
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
  // ---- home entry ----
  await E(()=>window.__PH.goScreen('sMenu'));await wait(300);
  const home=await E(()=>{const m=document.getElementById('menuPass'),c=document.getElementById('passChip');const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return cs.display!=='none'&&r.width>0&&r.bottom<=innerHeight+1&&r.top>=0;};
    const ov=(a,b)=>{if(!a||!b)return false;const r=a.getBoundingClientRect(),q=b.getBoundingClientRect();return r.width&&q.width&&!(r.right<=q.left||q.right<=r.left||r.bottom<=q.top||q.bottom<=r.top);};
    const others=[...document.querySelectorAll('#sMenu .hm-b,#menuGoals,#menuRank,.dock,.pts')].filter(e=>getComputedStyle(e).display!=='none');
    const entry=vis(m)?m:vis(c)?c:null;return {row:vis(m),chip:vis(c),txt:entry?entry.textContent:'',overlap:entry?others.filter(o=>o!==entry&&ov(entry,o)).map(o=>o.id||o.className).join(','):''};});
  ok((home.row||home.chip)&&!home.overlap,'home has a Sardine Pass entry ('+(home.row?'row':'chip')+': "'+home.txt+'"), overlaps: '+(home.overlap||'none'));
  await shot('home');
  const t1=await tap(home.row?'#menuPass':'#passChip');
  const scr=await E(()=>document.getElementById('sPass').classList.contains('on'));ok(scr,'tapping it opens the pass screen (top element '+t1+')');
  await wait(300);await shot('pass');
  const st=await E(()=>{const P=window.__PH;return {tier:P.passTier(),can:P.passCount(),head:document.getElementById('psHead').textContent,cells:document.querySelectorAll('.ps-cell').length,rdy:document.querySelectorAll('.ps-cell.rdy').length,
    wide:document.querySelector('#sPass .panel').scrollWidth<=innerWidth+1};});
  ok(st.cells===60&&st.rdy===st.can&&st.tier===6,'30 tiers × free/gold shown, '+st.rdy+' glowing = claimable ('+st.head+')');
  ok(st.wide,'pass panel fits the screen width (track scrolls inside)');
  const p0=await E(()=>window.__PH.save.points);await tap('.ps-cell.f.rdy');
  const p1=await E(()=>({pts:window.__PH.save.points,can:window.__PH.passCount(),cf:window.__PH.save.pass.cf}));
  ok(p1.can===st.can-1&&(p1.pts>p0||p1.cf!==1),'tap a glowing reward → claimed ('+st.can+' → '+p1.can+', points '+p0+' → '+p1.pts+')');
  await tap('#psBuy');const g1=await E(()=>({gold:window.__PH.save.pass.gold,txt:(document.getElementById('psBuy')||{}).textContent||''}));
  ok(!g1.gold&&/900/.test(g1.txt),'first tap on Gold asks to confirm ("'+g1.txt+'")');
  await tap('#psBuy');const g2=await E(()=>({gold:window.__PH.save.pass.gold,pts:window.__PH.save.points,can:window.__PH.passCount()}));
  ok(g2.gold&&g2.pts===p1.pts-900,'second tap buys the Gold Pass for 900P ('+p1.pts+' → '+g2.pts+'), '+g2.can+' rewards now claimable');
  await shot('pass_gold');
  if(await E(()=>!!document.getElementById('psAll')))await tap('#psAll');
  ok(await E(()=>window.__PH.passCount()===0),'"모두 받기" claims everything');
  // ---- settings row ----
  await E(()=>window.__PH.goScreen('sSet'));await wait(300);
  const set=await E(()=>{const rows=[...document.querySelectorAll('#setList .setrow')];const r=rows.find(x=>/하키 규칙|Hockey rules|冰球规则|ホッケールール/.test(x.textContent));return r?r.textContent:'';});
  ok(!!set,'settings has the hockey-rules row: '+set);
  await E(()=>{const r=[...document.querySelectorAll('#setList .setrow')].find(x=>/하키 규칙|Hockey rules|冰球规则|ホッケールール/.test(x.textContent));if(r)r.scrollIntoView({block:'center'});});await shot('settings');
  // ---- help sections ----
  await E(()=>window.__PH.goScreen('sHow'));await wait(300);
  const how=await E(()=>{const b=document.querySelector('.how-v22');return b?b.textContent.length:0;});ok(how>300,'help screen has the referee + pass sections ('+how+' chars)');
  await E(()=>{const b=document.querySelector('.how-v22');if(b)b.scrollIntoView({block:'start'});});await shot('how');
  // ---- a finished match: pass + rules rows on the result screen ----
  const rs=await E(()=>{const P=window.__PH,G=P.G;P.save.set.rules='full';P.startMatch({mode:'quick',size:3,time:60,diff:'easy',tag:'Q',oppTypes:['basic','fast','strong']});
    G.state='play';G.stateT=0;for(let i=0;i<30;i++)P.step(1/60);G.mine.score=2;G.mine.opp.score=1;G.rl.st[G.mine.opp.key].pen=1;G.rl.st[G.mine.key].ppg=1;
    P.endMatch();for(let i=0;i<200;i++)P.step(1/60);const el=document.getElementById('sResult');return {on:el&&el.classList.contains('on'),pass:(document.querySelector('.rs-pass')||{}).textContent||'',rules:[...document.querySelectorAll('.rs-stats')].map(e=>e.textContent).join(' | ')};});
  ok(rs.on&&/\+60/.test(rs.pass),'result screen shows the sardines: '+rs.pass);
  ok(/1/.test(rs.rules)&&rs.rules.length>0,'result screen shows the referee summary: '+rs.rules);
  await shot('result');
  // ---- the cast banner (your own skill) ----
  const cb=await E(()=>{const P=window.__PH,G=P.G;P.save.type='strong';P.startMatch({mode:'free',size:2,time:0,diff:'easy',tag:'T',oppTypes:['basic','basic']});G.state='play';for(let i=0;i<20;i++)P.step(1/60);
    const p=G.player;p.cd.special=0;G.puck.x=p.x+Math.sin(p.heading)*.9;G.puck.z=p.z+Math.cos(p.heading)*.9;G.carry=p;P.useSpecial(p);const b=document.getElementById('castBan'),r=b.getBoundingClientRect();
    return {on:b.classList.contains('on'),txt:b.textContent,w:r.width,fits:r.left>=-1&&r.right<=innerWidth+1};});
  await wait(250);await shot('castban');
  ok(cb.on&&/KING/.test(cb.txt)&&cb.fits,'emperor skill → banner "'+cb.txt+'" fits the screen ('+Math.round(cb.w)+'px)');
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,4).join(' | '):''));
  console.log('TOTAL '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
