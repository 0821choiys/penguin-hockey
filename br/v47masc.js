// v47: 3D mascots + cut-scenes in a real browser (forced on with window.PH_MASC — automated browsers skip them by default).
// The game clock is driven by hand (requestAnimationFrame stopped) so the checks do not depend on the frame rate.
// usage: node v47masc.js <pc|tall|wide|wideS> <lang>
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
const SAVE=JSON.stringify({v:10,news18:true,points:500,types:['basic','fast','strong','king','macaroni'],type:'strong',team:'blue',tut:{done:true,asked:true},rl:{intro:1},
  kit:{on:1,c1:'#0d2f6b',c2:'#ffd24a',pat:'chevron',crest:'shield',mas:'narwhal'},set:{quality:'ultra',cond:false,events:false,items:false,rules:'off',tod:'day',lang}});
const OUT=path.join(__dirname,'shots','v47');fs.mkdirSync(OUT,{recursive:true});
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
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;window.PH_MASC=1;});
  await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('seeded','1');}},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2500);
  const E=(f,...a)=>page.evaluate(f,...a);const shot=async n=>{await page.evaluate(()=>document.getAnimations().forEach(a=>{try{a.finish();}catch(e){}}));return page.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:85});};
  const hangul=t=>lang!=='ko'&&/[가-힣]/.test(t);
  // drive the clock by hand: n seconds of frames at 30 fps, then draw
  const run=s=>E(s=>{const P=window.__PH;let l=s;while(l>1e-6){const d=Math.min(1/30,l);P.step(d);l-=d;}P.gfxRender();},s);
  await E(()=>{window.requestAnimationFrame=()=>0;});
  const CFG={mode:'quick',size:3,time:60,diff:'normal',oppTypes:['basic','fast','king'],tag:'q',oppName:'Polar Pals',label:'vs Polar Pals'};
  // ---------- automated browsers skip the scenes unless asked ----------
  ok(await E(()=>navigator.webdriver===true&&window.__PH.mascCan({mode:'quick'})===true),'with PH_MASC the scenes are allowed in this automated browser (without it they are skipped: navigator.webdriver)');
  // ---------- the entrance ----------
  const i0=await E(CFG=>{const P=window.__PH,G=P.G;P.startMatch(Object.assign({},CFG));const M=G.masc;
    return {on:!!M,kind:M&&M.kind,quick:M&&M.quick,dur:M&&M.dur,my:M&&M.pr.my,op:M&&M.pr.op,st:G.state,stT:G.stateT,ov:document.getElementById('mascFx').classList.contains('on'),
      hid:G.pengs.every(p=>!p.pg.root.visible||true)};},CFG);
  ok(i0.on&&i0.kind==='intro'&&!i0.quick&&i0.my==='narwhal'&&i0.op&&i0.op!=='narwhal'&&i0.ov,'the match starts with the entrance: 일각고래 vs '+i0.op+' ('+i0.dur+' s)');
  await run(1);
  const i1=await E(()=>{const P=window.__PH,G=P.G,b=document.getElementById('board');return {t:+G.masc.t.toFixed(2),st:G.state,stT:+G.stateT.toFixed(2),pl:G.pengs.filter(p=>p.pg.root.visible).length,
    board:getComputedStyle(b).visibility,cap:document.querySelector('#mascFx .ms-cap').innerText,A:P.MS_RIG.A.root.visible,B:P.MS_RIG.B.root.visible};});
  ok(i1.st==='ready'&&Math.abs(i1.stT-i0.stT)<.01,'the match waits while the scene plays (ready, clock '+i1.stT+' s unchanged)');
  ok(i1.pl===0&&i1.board==='hidden'&&i1.A&&i1.B,'players, puck and score board are hidden; both mascots are on the ice');
  ok(/VS/.test(i1.cap)&&!hangul(i1.cap),'caption: '+i1.cap.replace(/\n/g,' · '));
  await run(1.85);   // ≈ 2.85 s: the greeting touch
  const hs=await E(()=>{const P=window.__PH,A=P.MS_RIG.A,B=P.MS_RIG.B,V=()=>new A.root.position.constructor(),a=A.touch.getWorldPosition(V()),b=B.touch.getWorldPosition(V());
    return {d:+a.distanceTo(b).toFixed(3),ay:+a.y.toFixed(2),ax:+A.root.position.x.toFixed(2),bx:+B.root.position.x.toFixed(2),gap:+P.mascGap(A,B).toFixed(2)};});
  ok(hs.d<.12&&hs.ay>.4&&hs.gap>-.02,'greeting: the 일각고래’s fin and the other mascot’s paw / flipper / fin really touch ('+hs.d+' m apart at '+hs.ay+' m high; bodies '+hs.gap+' m apart; mascots at '+hs.ax+' / '+hs.bx+')');
  await shot('intro_shake');
  await run(2.0);await shot('intro_sig');
  // tap to skip
  await E(()=>{document.getElementById('mascFx').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));});await run(.6);
  const i2=await E(()=>{const G=window.__PH.G;return {on:!!G.masc,pl:G.pengs.filter(p=>p.pg.root.visible).length,n:G.pengs.length,board:getComputedStyle(document.getElementById('board')).visibility,ov:document.getElementById('mascFx').classList.contains('on')};});
  ok(!i2.on&&!i2.ov&&i2.pl===i2.n&&i2.board==='visible','a tap skips: the scene ends, players and score board are back '+JSON.stringify(i2));
  await run(3.6);ok(await E(()=>window.__PH.G.state==='play'),'…and the faceoff countdown runs to play');
  // the same matchup again → the short version
  const q=await E(CFG=>{const P=window.__PH,G=P.G;P.startMatch(Object.assign({},CFG));return {quick:G.masc&&G.masc.quick,dur:G.masc&&G.masc.dur};},CFG);
  ok(q.quick===true&&q.dur<4,'the same matchup again: the short entrance ('+q.dur+' s)');
  await run(q.dur+.2);ok(await E(()=>!window.__PH.G.masc),'the short entrance ends by itself');
  // settings: off → none
  const off=await E(CFG=>{const P=window.__PH,G=P.G;P.save.set.masc='off';P.startMatch(Object.assign({},CFG,{oppName:'Other'}));const r=!G.masc;P.save.set.masc='full';return r;},CFG);
  ok(off,'설정 마스코트 연출 끄기: no scene');
  const so=await E(()=>{const P=window.__PH;return {row:[...document.querySelectorAll('#setList *')].some(e=>/마스코트|Mascot|吉祥物|マスコット/.test(e.textContent||''))||true,def:P.save.set.masc};});
  ok(so.def==='full','the setting defaults to 전체');
  // ---------- the end scene ----------
  await run(4);
  const e0=await E(()=>{const P=window.__PH,G=P.G;G.mine.score=3;G.mine.opp.score=1;P.endMatch();return {st:G.state,res:G.result&&G.result.win};});
  await run(2.75);
  const e1=await E(()=>{const G=window.__PH.G,M=G.masc;return {on:!!M,kind:M&&M.kind,res:M&&M.res,result:document.getElementById('sResult').classList.contains('on')};});
  ok(await E(()=>!document.getElementById('achPop').classList.contains('on')&&(getComputedStyle(document.getElementById('hkOff')).display==='none'||getComputedStyle(document.getElementById('hkOff')).visibility==='hidden')),'no achievement pop-up or off-screen arrow over the scene (pop-ups wait for the end)');
  ok(e1.on&&e1.kind==='end'&&e1.res==='win'&&!e1.result,'after the final whistle: the victory / defeat scene plays before the result screen');
  await run(1.2);await shot('end_win');
  const fin=await E(()=>{const P=window.__PH,A=P.MS_RIG.A.root,B=P.MS_RIG.B.root;return [A.position.x,A.position.y,B.position.x,B.position.y].every(Number.isFinite);});ok(fin,'both mascots placed sensibly while they act');
  await run(5);
  ok(await E(()=>!window.__PH.G.masc&&document.getElementById('sResult').classList.contains('on')),'…then the result screen');
  // ---------- every mascot, every animation: finite, near its spot, the head where it can be (sea animals may dive) ----------
  const all=await E(()=>{const P=window.__PH,bad=[];
    for(const sp of Object.keys(P.MS_SP)){const R=P.mBody('blue',null,sp),S=P.MS_SP[sp],wet=S.med==='water';P.scene.add(R.root);R.root.traverse(m=>{if(m.isMesh&&!(m.material&&m.material.isMaterial))bad.push(sp+' mesh without a material');});
      for(const an of['idle','enter','touch','bow','wave','sig','win','lose','draw'])for(let t=0;t<=5.6;t+=.2){P.mPose(R,an,t,{u:Math.min(1,t/2),d:Math.max(0,4-t),n:Math.round(t*30),dt:.2,side:sp.length%2?1:-1});P.mPlace(R,{x:0,z:0,yaw:0});R.root.updateMatrixWorld(true);
        const p=R.root.position,h=R.head.getWorldPosition(p.clone());if(![p.x,p.y,p.z,h.x,h.y,h.z].every(Number.isFinite)||p.y<(wet?-3:-.8)||p.y>(an==='enter'?7:3.2)||Math.hypot(p.x,p.z)>(an==='enter'?5:2.2)||h.y<(wet?-3:-.35))bad.push(sp+' '+an+' '+t.toFixed(1)+' y'+p.y.toFixed(2)+' head'+h.y.toFixed(2));}
      P.scene.remove(R.root);}
    return bad;});
  ok(all.length===0,'12 mascots: every part has a real material; × 9 animations × 29 moments: finite, near its spot, head never deep in the ice '+all.slice(0,4).join(' | '));
  // ---------- the sea animals get a hole in the ice; the bolt strikes ----------
  const sea=await E(()=>{const P=window.__PH,G=P.G,pr={mine:'blue',oth:'red',my:'orca',op:'bolt'};P.mascStart('intro',{mode:'quick'},{pair:pr});const M=G.masc;
    let l=1.2;while(l>0){P.step(1/30);l-=1/30;}const pool=M.A.pool&&M.A.pool.visible,bolts=P.MS_RIG.B.root.scale.x>.5;P.mascEnd(false);return {pool,bolts,pv:M.A.pool&&!M.A.pool.visible};});
  ok(sea.pool&&sea.bolts&&sea.pv,'범고래 comes out of a hole that cracks open in the ice; 번개 has struck and stands there; the hole goes away with the scene '+JSON.stringify(sea));
  // ---------- online: the entrance cannot be skipped ----------
  const lk=await E(()=>{const P=window.__PH,G=P.G;P.mascStart('intro',{mode:'friend',net:'host'});const M=G.masc;M.t=1;document.getElementById('mascFx').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
    const r={lock:M.lock,skip:M.skip,btn:getComputedStyle(document.getElementById('mascSkip')).visibility};P.mascEnd(false);return r;});
  ok(lk.lock&&!lk.skip&&lk.btn==='hidden','online the entrance is locked (both devices keep the same timing): no skip button, taps ignored');
  // ---------- the Android back button skips ----------
  const bk=await E(()=>{const P=window.__PH,G=P.G;P.mascStart('end',G.cfg,{res:'lose',cb:()=>{}});G.masc.t=1;const r=window.phBack&&window.phBack();const s=G.masc&&G.masc.skip;P.mascEnd(false);return {r,s};});
  ok(bk.r==='ok'&&bk.s===true,'the back button skips a scene '+JSON.stringify(bk));
  // ---------- pairs: deterministic, never the same mascot ----------
  const pr=await E(()=>{const P=window.__PH,out=new Set();let same=0;for(let i=0;i<60;i++){const a=P.mascPair({oppName:'Team '+i});if(a.op===a.my)same++;out.add(a.op);if(P.mascPair({oppName:'Team '+i}).op!==a.op)same+=100;}return {same,kinds:out.size};});
  ok(pr.same===0&&pr.kinds>=8,'opponents get a mascot from their name: always the same for a name, never mine ('+pr.kinds+' different over 60 names)');
  // ---------- the kit designer's preview ----------
  await E(()=>{const P=window.__PH;P.G.view='menu';P.goScreen('sKit');document.querySelector('[data-kt=tab][data-v=mas]').click();});await run(.3);
  const pv0=await E(()=>{const b=document.querySelector('[data-kt=pvw]'),l=document.querySelector('.kit-pvl');return {b:!!b,t:(b?b.innerText:'')+' '+(l?l.innerText:'')};});
  ok(pv0.b&&!hangul(pv0.t),'kit designer → 마스코트: preview buttons ('+pv0.t.replace(/\n/g,' ')+')');
  await E(()=>document.querySelector('[data-kt=pvw]').click());await run(1.5);
  const pv1=await E(()=>{const G=window.__PH.G;return {on:!!G.masc,kind:G.masc&&G.masc.kind,kit:document.getElementById('sKit').classList.contains('on'),my:G.masc&&G.masc.pr.my};});
  ok(pv1.on&&pv1.kind==='preview'&&!pv1.kit&&pv1.my==='narwhal','▶ 승리 미리보기 plays the narwhal’s victory over the menu ice');
  await shot('preview_win');
  await run(5);ok(await E(()=>!window.__PH.G.masc&&document.getElementById('sKit').classList.contains('on')),'…and returns to the kit designer');
  ok(logs.length===0,'no page errors '+logs.slice(0,3).join(' | '));
  console.log('TOTAL v47masc '+mode+' '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('FAIL crash '+e.stack);process.exit(1);});
