// v36 controls in a real browser: settings row → layout editor (drag a button, the joystick, size + opacity sliders, save /
// cancel / Escape), the saved layout in a match and after a reload, the joystick resting ring, follow vs fixed ring,
// cooldown ring on Dash, buttons do nothing while editing.
// usage: node v36ctl.js <pc|tall|wide|wideS> [lang]   → shots/ctl/<mode>_<lang>_*.jpg
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
const OUT=path.join(__dirname,'shots','ctl');fs.mkdirSync(OUT,{recursive:true});
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
  const drag=async(x0,y0,x1,y1)=>{const n=8;
    if(VP.hasTouch){await tp('touchStart',x0,y0);for(let i=1;i<=n;i++)await tp('touchMove',x0+(x1-x0)*i/n,y0+(y1-y0)*i/n);await tp('touchEnd');}
    else{await page.mouse.move(x0,y0);await page.mouse.down();for(let i=1;i<=n;i++)await page.mouse.move(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n);await page.mouse.up();}};
  const tap=async(x,y)=>{if(VP.hasTouch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);};
  const rect=sel=>E(s=>{const e=document.querySelector(s);if(e&&e.closest&&e.closest('#ctlEdPanel'))e.scrollIntoView({block:'center'});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,vis:getComputedStyle(e).display!=='none'};},sel);
  const center=async sel=>{const r=await rect(sel);return r&&[Math.round(r.x),Math.round(r.y)];};
  // 1) settings row
  await E(()=>window.__PH.goScreen('sSet'));await wait(400);
  const row=await E(()=>{const r=document.getElementById('ctlRow');if(!r)return null;const l=document.getElementById('setList');return {idx:[...l.children].indexOf(r),txt:r.textContent};});
  ok(row&&row.idx===1,'settings: 🎮 controls row right after the language row '+JSON.stringify(row));
  await shot('settings');
  const ob=await rect('#ctlOpenB');await E(()=>document.getElementById('ctlOpenB').scrollIntoView({block:'center'}));const ob2=await rect('#ctlOpenB');await tap(ob2.x,ob2.y);await wait(300);
  let st=await E(()=>({ed:document.body.classList.contains('ctledit'),panel:document.getElementById('ctlEdPanel').classList.contains('on')}));
  ok(st.ed&&st.panel,'tap → layout editor open');
  const s0=await rect('#tbShoot'),j0=await rect('#joyBase'),pan=await rect('#ctlEdPanel');
  ok(s0&&s0.vis&&s0.w>40&&j0&&j0.vis,'editor shows the buttons and the joystick '+JSON.stringify({s0,j0}));
  // the panel must not cover the default shoot button or the joystick
  const cover=(a,b)=>a&&b&&Math.abs(a.x-b.x)<(a.w+b.w)/2&&Math.abs(a.y-b.y)<(a.h+b.h)/2;
  ok(!cover(pan,s0)&&!cover(pan,j0),'panel does not cover Shoot / joystick '+JSON.stringify(pan));
  if(lang!=='ko'){const ko=await E(()=>{const t=document.getElementById('ctlEdPanel').innerText+' '+document.getElementById('ctlRow').innerText+' '+document.getElementById('joyBase').dataset.lab+' '+(document.getElementById('pCtl')||{}).textContent;return (t.match(/[\uac00-\ud7a3]+/g)||[]).slice(0,8);});
    ok(ko.length===0,'['+lang+'] editor, settings row and pause button fully translated'+(ko.length?' — Korean left: '+ko.join(' '):''));}
  await shot('editor');
  // 2) drag Shoot, then the joystick
  const dx=mode==='tall'?-70:-110,dy=mode==='tall'?-120:-60;
  await drag(s0.x,s0.y,s0.x+dx,s0.y+dy);await wait(100);
  const s1=await rect('#tbShoot');
  ok(Math.abs(s1.x-(s0.x+dx))<4&&Math.abs(s1.y-(s0.y+dy))<4,'Shoot follows the drag ('+[Math.round(s0.x),Math.round(s0.y)]+' → '+[Math.round(s1.x),Math.round(s1.y)]+')');
  const fired=await E(()=>window.__PH.input.shoot||window.__PH.input.shootPress);ok(!fired,'dragging in the editor does not press Shoot');
  await drag(j0.x,j0.y,j0.x+40,j0.y-50);await wait(100);
  const j1=await rect('#joyBase');ok(Math.abs(j1.x-(j0.x+40))<6&&Math.abs(j1.y-(j0.y-50))<6,'joystick resting spot follows the drag');
  // 3) sliders: all buttons 130 %, opacity 60 %
  await E(()=>{const set=(id,v)=>{const i=document.querySelector('#ctlEdPanel input[data-ce="'+id+'"]');i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));};set('sz',130);set('op',60);});
  const s2=await rect('#tbShoot');await wait(350);const op=await E(()=>getComputedStyle(document.getElementById('tbShoot')).opacity);
  ok(Math.abs(s2.w/s0.w-1.3)<.03&&Math.abs(+op-.6)<.02,'size slider 130 % → Shoot '+Math.round(s0.w)+' → '+Math.round(s2.w)+' px, opacity '+op);
  const lab=await E(()=>document.querySelector('#ctlEdPanel input[data-ce="sz"]').closest('label').querySelector('b').textContent);ok(lab==='130%','the label shows the value the code uses ('+lab+')');
  // select Pass (tap) and make only it bigger
  const p0=await rect('#tbPass');await tap(p0.x,p0.y);await wait(80);
  const selTxt=await E(()=>document.querySelector('#ctlEdPanel .ce-sel-n').textContent);
  await E(()=>{const i=document.querySelector('#ctlEdPanel input[data-ce="one"]');i.value=150;i.dispatchEvent(new Event('input',{bubbles:true}));});
  const p1=await rect('#tbPass');ok(Math.abs(p1.w/p0.w-1.5)<.04,'per-button size: Pass ×1.5 ('+selTxt+')');
  await shot('edited');
  // 4) save
  const sv=await rect('#ctlEdPanel [data-ce="save"]');await tap(sv.x,sv.y);await wait(300);
  const saved=await E(()=>{const c=window.__PH.save.set.ctl,o=innerWidth>=innerHeight?'L':'P';return {ed:document.body.classList.contains('ctledit'),sz:c.sz,op:c.op,shoot:c[o].shoot,joy:c[o].joy,pass:c[o].pass,ls:JSON.parse(localStorage.getItem('penguinHockey.v1')).set.ctl};});
  ok(!saved.ed&&saved.sz===1.3&&saved.op===.6&&saved.shoot&&saved.joy&&saved.pass&&saved.pass[2]===1.5,'save → stored in the save ('+JSON.stringify(saved.shoot)+')');
  ok(saved.ls&&saved.ls.sz===1.3,'written to localStorage');
  // 5) in a match
  const startM=()=>E(()=>{const P=window.__PH,G=P.G;P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'T',oppTypes:['basic','fast','strong']});
    document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));G.state='play';G.stateT=0;for(let i=0;i<60*2;i++)P.step(1/60);P.updateCamera(1);});
  await startM();await wait(200);
  if(VP.hasTouch){
    const m1=await rect('#tbShoot'),jm=await rect('#joyBase');
    ok(Math.abs(m1.x-s1.x)<3&&Math.abs(m1.y-s1.y)<3&&Math.abs(m1.w-s2.w)<2,'match: Shoot where it was placed, 130 %');
    const jidle=await E(()=>{const b=document.getElementById('joyBase');return {idle:b.classList.contains('idle'),op:+getComputedStyle(b).opacity};});
    ok(jm.vis&&jidle.idle&&jidle.op>.1&&jidle.op<.5&&Math.abs(jm.x-j1.x)<4,'match: resting joystick ring visible at its spot '+JSON.stringify(jidle));
    await shot('match');
    // follow ring: touch, drag far right → full right, the ring moved; release → back home
    const zx=jm.x-20,zy=jm.y+10;await tp('touchStart',zx,zy);
    let i1=await E(()=>[window.__PH.input.x,window.__PH.input.z]);
    for(let i=1;i<=8;i++)await tp('touchMove',zx+i*25,zy);
    const fol=await E(()=>{const I=window.__PH.input,b=document.getElementById('joyBase').getBoundingClientRect();return {x:I.x,z:I.z,bx:b.left+b.width/2};});
    ok(Math.abs(i1[0])<.01&&fol.x>.99&&Math.abs(fol.z)<.05&&fol.bx>zx+100,'follow ring: 200 px drag → full right, ring followed the thumb '+JSON.stringify(fol));
    const Rj=await E(()=>window.__PH.CTLV.R*window.__PH.ctl().js);
    await tp('touchMove',zx+200-Rj-40,zy);const back=await E(()=>window.__PH.input.x);ok(back<-.5,'after following, moving back '+Math.round(Rj+40)+' px (not 200) already turns left ('+back.toFixed(2)+')');
    await tp('touchEnd');const rel=await E(()=>{const b=document.getElementById('joyBase').getBoundingClientRect();return {x:window.__PH.input.x,bx:b.left+b.width/2,idle:document.getElementById('joyBase').classList.contains('idle')};});
    ok(rel.x===0&&rel.idle&&Math.abs(rel.bx-jm.x)<4,'release → stop, ring back at its resting spot');
    // small push: 30 % of the radius already gives full speed at the default sensitivity (mid: full at 70 %)
    const R=await E(()=>window.__PH.CTLV.R*window.__PH.ctl().js);
    await tp('touchStart',zx,zy);await tp('touchMove',zx+R*.4,zy);const sm=await E(()=>window.__PH.input.x);await tp('touchEnd');
    const want=await E(r=>window.__PH.ctlCurve(r*.4,0,r,'mid')[0],R);
    ok(Math.abs(sm-want)<.02&&sm>.45,'40 % push → '+sm.toFixed(2)+' (curve value '+want.toFixed(2)+', was 0.40)');
    // buttons work in the match; Dash shows a cooldown ring
    const db=await rect('#tbDash');await tap(db.x,db.y);await E(()=>{for(let i=0;i<20;i++)window.__PH.step(1/60);});
    const cdr=await E(()=>{const b=document.getElementById('tbDash');return {cd:b.classList.contains('cd'),v:+b.style.getPropertyValue('--cd'),pcd:window.__PH.G.player.cd.dash};});
    ok(cdr.cd&&cdr.v>.5&&cdr.pcd>0,'Dash tapped → cooldown ring '+JSON.stringify(cdr));
    await shot('cooldown');
    // fixed ring: from the pause menu, switch to fixed, save; touching anywhere on the joystick side steers from the ring
    await E(()=>window.__PH.togglePause());await wait(200);
    const pc=await rect('#pCtl');ok(pc&&pc.vis,'pause menu has the 🎮 controls button');await tap(pc.x,pc.y);await wait(250);
    const fx=await rect('#ctlEdPanel [data-ce="jm"][data-v="fixed"]');await tap(fx.x,fx.y);await wait(120);
    const sv2=await rect('#ctlEdPanel [data-ce="save"]');await tap(sv2.x,sv2.y);await wait(200);
    await E(()=>window.__PH.togglePause());await wait(150);
    const home=await rect('#joyBase'),zr=await rect('#joyZone'),sx=home.x-(zr.x-zr.w/2)>80?-70:70;
    await tp('touchStart',home.x+sx,home.y);const fxi=await E(sx=>{const b=document.getElementById('joyBase').getBoundingClientRect();const e=document.elementFromPoint(b.left+b.width/2+sx,b.top+b.height/2);return {x:window.__PH.input.x,bx:b.left+b.width/2,hit:e&&(e.id||String(e.className).slice(0,30))};},sx);await tp('touchEnd');
    ok(fxi.x*Math.sign(sx)>.99&&Math.abs(fxi.bx-home.x)<3,'fixed ring: a touch 70 px beside the ring → full speed that way at once, ring stays '+JSON.stringify(fxi));
  }else{
    const m1=await rect('#tbShoot');await E(()=>document.body.classList.add('touch'));const m2=await rect('#tbShoot');
    ok(Math.abs(m2.x-s1.x)<3&&Math.abs(m2.w-s2.w)<2,'pc (touch screen laptop): the saved layout applies');
    await E(()=>document.body.classList.remove('touch'));
    // keyboard: hold → aim follows the keys (stick aim), not the facing
    await E(()=>{const P=window.__PH,G=P.G,p=G.player;G.mouse.active=false;p.heading=0;});
    await page.keyboard.down('ArrowUp');const a=await E(()=>{const P=window.__PH,p=P.G.player;P.step(1/120);return P.humanAim(p);});await page.keyboard.up('ArrowUp');
    ok(a[1]<-.9,'keyboard ↑ held: aim points up even while the penguin still faces down ('+a.map(v=>v.toFixed(2))+')');
    // Escape closes the editor without saving
    await E(()=>window.__PH.togglePause());await wait(150);await E(()=>window.__PH.ctlEdOpen('pause'));await wait(100);
    const t0=await rect('#tbShoot');await drag(t0.x,t0.y,t0.x-50,t0.y-50);await page.keyboard.press('Escape');await wait(100);
    const esc=await E(()=>({ed:document.body.classList.contains('ctledit'),paused:window.__PH.G.paused,shoot:window.__PH.save.set.ctl.L.shoot}));
    ok(!esc.ed&&esc.paused&&esc.shoot[0]===saved.shoot[0],'Escape: editor closed, nothing saved, still paused');
  }
  // 6) cancel keeps the old layout
  await E(()=>{window.__PH.toMenu();window.__PH.goScreen('sSet');});await wait(300);
  await E(()=>window.__PH.ctlEdOpen('set'));await wait(150);
  const c0=await rect('#tbShoot');await drag(c0.x,c0.y,c0.x-40,c0.y+30);
  const cc=await rect('#ceCancel');await tap(cc.x,cc.y);await wait(200);
  const after=await E(()=>{const o=innerWidth>=innerHeight?'L':'P';return window.__PH.save.set.ctl[o].shoot;});
  ok(after&&after[0]===saved.shoot[0]&&after[1]===saved.shoot[1],'cancel → layout unchanged');
  // 7) reload: the layout is still there
  await page.reload({waitUntil:'load'});await wait(2600);await E(()=>{window.requestAnimationFrame=()=>0;});
  const rl=await E(()=>{const c=window.__PH.save.set.ctl,o=innerWidth>=innerHeight?'L':'P';return {sz:c.sz,shoot:c[o].shoot};});
  ok(rl.sz===1.3&&rl.shoot&&rl.shoot[0]===saved.shoot[0],'after reload the layout is kept '+JSON.stringify(rl));
  // 8) defaults
  await E(()=>window.__PH.ctlEdOpen('set'));await wait(100);await E(()=>window.__PH.ctlEdAct('def'));const df=await rect('#tbShoot');
  ok(Math.abs(df.x-s0.x)<3&&Math.abs(df.w-s0.w)<2,'모두 기본값 → back to the default spot and size');
  await shot('defaults');await E(()=>window.__PH.ctlEdClose(false));
  const errs=logs.filter(l=>!/favicon|ERR_FAILED|net::/.test(l));
  ok(errs.length===0,'no page errors'+(errs.length?' '+errs.slice(0,3).join(' | '):''));
  console.log('TOTAL: '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.stack);process.exit(2);});
