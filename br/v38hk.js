// v38 hockey-style control in a real browser: your penguin does not change by itself (joystick held toward the puck for 4 s),
// the white ring on the Switch target, a real tap on Switch, the off-screen arrow, the Shoot button turning into 뺏기 (poke)
// and the Pass button into 패스 요청 (call) with real taps, labels on one line in every language, and the new
// 펭귄 교체 setting in the layout editor (saved).   usage: node v38hk.js <pc|tall|wide|wideS> [lang]   → shots/hk/<mode>_<lang>_*.jpg
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
const OUT=path.join(__dirname,'shots','hk');fs.mkdirSync(OUT,{recursive:true});
const LAB={ko:{poke:'뺏기',call:'패스 요청',shoot:'슛',pass:'패스'},en:{poke:'Poke',call:'Call',shoot:'Shoot',pass:'Pass'},zh:{poke:'抢断',call:'要球',shoot:'射门',pass:'传球'},ja:{poke:'スティール',call:'パス要求',shoot:'シュート',pass:'パス'}}[lang];
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
  const cdp=await page.createCDPSession();
  const tp=(type,x,y,id)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:id||1}]});
  const tap=async(x,y)=>{if(VP.hasTouch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);};
  const rect=sel=>E(s=>{const e=document.querySelector(s);if(!e)return null;if(e.closest&&e.closest('#ctlEdPanel'))e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,vis:getComputedStyle(e).display!=='none'&&r.width>0};},sel);
  const steps=n=>E(k=>{for(let i=0;i<k;i++)window.__PH.step(1/60);},n);
  // a match with the opponents parked (one of them is used for the poke)
  await E(()=>{const P=window.__PH,G=P.G;P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'T',oppTypes:['basic','fast','strong']});
    document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));G.state='play';G.stateT=0;for(let i=0;i<60*2;i++)P.step(1/60);P.updateCamera(1);
    for(const o of G.mine.opp.skaters){o.frozen=true;o.x=o.ox=o.rx=G.mine.opp.dir*-20;o.z=o.oz=o.rz=10;o.vx=o.vz=0;}});
  const setup=(fn,arg)=>E((f,a)=>{const P=window.__PH,G=P.G;
    if(G.state!=='play'){G.state='play';G.stateT=0;G.scoredBy=null;document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));}   // a goal in the 4 s of real play must not stop the next scenario
    G.timeLeft=Math.max(G.timeLeft,60);const place=(p,x,z,h)=>{p.x=p.ox=p.rx=x;p.z=p.oz=p.rz=z;p.vx=p.vz=0;p.heading=h==null?Math.PI/2:h;p.fall=0;p.cd.catch=0;p.cd.shoot=0;p.cd.pass=0;p.charging=false;p.charge=0;p.bufShot=p.bufPass=null;};
    const puck=(x,z)=>{const pk=G.puck;pk.x=pk.ox=pk.rx=x;pk.z=pk.oz=pk.rz=z;pk.vx=pk.vz=0;pk.shot=null;G.carry=null;G.pass=null;G.pending=null;G.callFor=null;};
    const front=p=>[p.x+Math.sin(p.heading)*(p.r+.54),p.z+Math.cos(p.heading)*(p.r+.54)];
    return (new Function('P','G','place','puck','front','a',f))(P,G,place,puck,front,a);},fn.toString().replace(/^[^{]*{|}$/g,''),arg);
  // ---- 1) far from the puck, team-mates on it: your penguin stays yours ----
  const s1=await setup(()=>{const me=G.player,m=G.mine.skaters.filter(s=>s!==me);const d=G.mine.dir;place(me,-18*d,9);place(m[0],6*d,1);place(m[1],2*d,-6);puck(9*d,0);
    P.step(1/60);P.updateCamera(1);P.step(1/60);return {me:G.mine.skaters.indexOf(me),tgt:G.mine.skaters.indexOf(P.HKR.tgt),ring:!!(P.HKR.ring&&P.HKR.ring.visible)};});
  ok(s1.tgt===1&&s1.ring,'white ring shown on the team-mate nearest the puck '+JSON.stringify(s1));
  await shot('ring');
  if(VP.hasTouch){const j=await rect('#joyBase');const x0=j.x,y0=j.y;await tp('touchStart',x0,y0);for(let i=1;i<=6;i++)await tp('touchMove',x0+i*12*(s1.me>=0?1:1),y0-i*4);}
  else await page.keyboard.down('KeyD');
  const kept=await E(()=>{const P=window.__PH,G=P.G,me=G.player;let ch=0;for(let i=0;i<60*4;i++){P.step(1/60);if(G.player!==me)ch++;}return {ch,same:G.player===me,carry:G.carry?G.mine.skaters.indexOf(G.carry):-2};});
  if(VP.hasTouch)await tp('touchEnd');else await page.keyboard.up('KeyD');
  ok(kept.same&&kept.ch===0,'4 s of real play with the stick held: your penguin never changes by itself '+JSON.stringify(kept));
  // off-screen arrow: your penguin far out of view → arrow at the edge pointing at it
  const off=await setup(()=>{const me=G.player,d=G.mine.dir;place(me,-22*d,-11);puck(14*d,8);for(let i=0;i<40;i++){P.step(1/60);}P.updateCamera(1);P.step(1/60);
    const el=document.getElementById('hkOff'),r=el&&el.getBoundingClientRect();const v=new THREE.Vector3(me.rx,1,me.rz).project(P.camera);
    return {disp:el&&getComputedStyle(el).display,x:r&&Math.round(r.left+r.width/2),y:r&&Math.round(r.top+r.height/2),px:Math.round((v.x*.5+.5)*innerWidth),py:Math.round((-v.y*.5+.5)*innerHeight),W:innerWidth,H:innerHeight};});
  const onEdge=off.x<=40||off.x>=off.W-40||off.y<=80||off.y>=off.H-40;
  const offScr=off.px<0||off.px>off.W||off.py<0||off.py>off.H;
  ok(!offScr||(off.disp==='block'&&onEdge&&Math.sign(off.px-off.W/2)===Math.sign(off.x-off.W/2)),'penguin out of view → an arrow at the screen edge on its side '+JSON.stringify(off));
  await shot('ring_arrow');
  const onv=await setup(()=>{const me=G.player;place(me,0,0);puck(3,0);P.step(1/60);P.updateCamera(1);P.step(1/60);P.step(1/60);return getComputedStyle(document.getElementById('hkOff')).display;});
  ok(onv==='none','penguin in view → no arrow ('+onv+')');
  // ---- 2) Switch with a real tap → the ringed team-mate ----
  const t2=await setup(()=>{const me=G.player,m=G.mine.skaters.filter(s=>s!==me),d=G.mine.dir;place(me,-15*d,0);place(m[0],5*d,4);place(m[1],0,-6);puck(6*d,3);P.step(1/60);
    return {want:G.mine.skaters.indexOf(P.HKR.tgt),me:G.mine.skaters.indexOf(me)};});
  if(VP.hasTouch){const sw=await rect('#tbSwap');await tap(sw.x,sw.y);}else await page.keyboard.press('KeyF');
  await steps(2);const got=await E(()=>window.__PH.G.mine.skaters.indexOf(window.__PH.G.player));
  ok(got===t2.want&&got!==t2.me,'Switch → the team-mate under the white ring ('+t2.want+' → '+got+')');
  // ---- 3) an opponent has the puck → Shoot = 뺏기 (poke) ----
  const lab3=await setup(()=>{const me=G.player,o=G.mine.opp.skaters[0],d=G.mine.dir;o.frozen=false;place(me,0,0,Math.PI/2*d);place(o,3*d,0,-Math.PI/2*d);const f=front(o);puck(f[0],f[1]);G.carry=o;
    P.step(1/120);const b=document.getElementById('tbShoot');return {t:b.firstChild&&b.firstChild.nodeValue,c:b.className};});
  if(VP.hasTouch){
    ok(lab3.t===LAB.poke&&/hk-poke/.test(lab3.c),'opponent carries the puck → the Shoot button reads 「'+LAB.poke+'」 '+JSON.stringify(lab3));
    await shot('poke_label');const sb=await rect('#tbShoot');await tap(sb.x,sb.y);
  }else await page.keyboard.press('Space');
  const r3=await E(()=>{const P=window.__PH,G=P.G,me=G.player;let t=0;while(G.carry!==me&&t<60){P.step(1/60);t++;}return {mine:G.carry===me,frames:t,shots:G.stats.shots};});
  ok(r3.mine,'a real '+(VP.hasTouch?'tap':'Space')+' on it pokes the puck to your stick '+JSON.stringify(r3));
  if(VP.hasTouch){const back=await E(()=>{window.__PH.step(1/60);const b=document.getElementById('tbShoot');return b.firstChild.nodeValue+'|'+b.className;});
    ok(back.split('|')[0]===LAB.shoot&&!/hk-poke/.test(back),'your puck → the button reads 「'+LAB.shoot+'」 again ('+back+')');}
  // ---- 4) an AI team-mate has the puck → Pass = 패스 요청 (call) ----
  const lab4=await setup(()=>{const me=G.player,m=G.mine.skaters.filter(s=>s!==me)[0],d=G.mine.dir;for(const o of G.mine.opp.skaters){o.frozen=true;o.x=o.ox=-20*d;o.z=o.oz=10;}
    place(me,6*d,3,-Math.PI/2*d);place(m,-4*d,0,Math.PI/2*d);const f=front(m);puck(f[0],f[1]);P.step(1/120);const b=document.getElementById('tbPass');return {t:b.firstChild&&b.firstChild.nodeValue,c:b.className,carry:G.carry===m};});
  if(VP.hasTouch){
    ok(lab4.carry&&lab4.t===LAB.call&&/hk-call/.test(lab4.c),'team-mate carries the puck → the Pass button reads 「'+LAB.call+'」 '+JSON.stringify(lab4));
    const fit=await E(()=>{const out={};for(const id of['tbShoot','tbPass']){const b=document.getElementById(id),r=document.createRange();r.selectNodeContents(b);const tw=r.getBoundingClientRect(),bw=b.getBoundingClientRect();out[id]={tw:Math.round(tw.width),th:Math.round(tw.height),bw:Math.round(bw.width),fs:getComputedStyle(b).fontSize};}return out;});
    ok(fit.tbPass.tw<=fit.tbPass.bw*.9&&fit.tbPass.th<parseFloat(fit.tbPass.fs)*1.9,'「'+LAB.call+'」 fits the Pass button on one line '+JSON.stringify(fit.tbPass));
    await shot('call_label');const pb=await rect('#tbPass');await tap(pb.x,pb.y);
  }else await page.keyboard.press('KeyE');
  const r4=await E(()=>{const P=window.__PH,G=P.G,me=G.player;let t=0;while(!(G.pass&&G.pass.to===me)&&t<90){P.step(1/60);t++;}const got=!!(G.pass&&G.pass.to===me);let u=0;while(G.carry!==me&&u<120){P.step(1/60);u++;}return {passed:got,afterMs:Math.round(t/60*1000),caught:G.carry===me,still:G.player===me};});
  ok(r4.passed&&r4.caught&&r4.still,'a real '+(VP.hasTouch?'tap':'E')+' → the team-mate passes it to you and you keep your penguin '+JSON.stringify(r4));
  // ---- 5) settings: 펭귄 교체 (버튼으로만 / 자동) in the layout editor, saved ----
  await E(()=>{window.__PH.goScreen('sSet');});await wait(300);
  await E(()=>document.getElementById('ctlOpenB').scrollIntoView({block:'center'}));const ob=await rect('#ctlOpenB');await tap(ob.x,ob.y);await wait(300);
  const row=await E(()=>{const b=document.querySelector('#ctlEdPanel button[data-ce="auto"][data-v="true"]');if(!b)return null;const o=b.closest('.ce-opt');return {lab:o.querySelector('span').textContent,on:document.querySelector('#ctlEdPanel button[data-ce="auto"].on').dataset.v};});
  ok(row&&row.on==='false','editor: a 펭귄 교체 row with 버튼으로만 selected '+JSON.stringify(row));
  const ab=await rect('#ctlEdPanel button[data-ce="auto"][data-v="true"]');await tap(ab.x,ab.y);await wait(200);
  const note=await E(()=>document.querySelector('#ctlEdPanel .ce-note').innerText);
  await E(()=>{const b=document.querySelector('#ctlEdPanel button[data-ce="auto"]');if(b)b.scrollIntoView({block:'center'});});await shot('editor_auto');
  const sv=await rect('#ctlEdPanel button[data-ce="save"]');await tap(sv.x,sv.y);await wait(300);
  const saved=await E(()=>JSON.parse(localStorage.getItem('penguinHockey.v1')).set.ctl.auto);
  ok(saved===true&&note.length>10,'tap 자동 + Save → saved (save.set.ctl.auto = '+saved+'); the note changes with it');
  if(lang!=='ko'){const ko=(note+' '+(row&&row.lab||'')).match(/[가-힣]+/g)||[];ok(ko.length===0,'['+lang+'] setting row and note translated'+(ko.length?' — Korean left: '+ko.join(' '):''));}
  await E(()=>{const P=window.__PH;P.save.set.ctl.auto=false;P.persist&&P.persist();});
  ok(logs.length===0,'no page errors'+(logs.length?' '+logs.slice(0,3).join(' | '):''));
  console.log('TOTAL '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');
  await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e);process.exit(1);});
