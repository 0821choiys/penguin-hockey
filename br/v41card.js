// v41 card portraits in a real browser: every species gets a rendered portrait of its 3D game model, the cards use it,
// the renderer is left as it was, the card is laid out as designed (portrait behind the dasher board that carries the name),
// silhouettes stay hidden, the scout banner / collection / card window show it, the team colour is followed, and the
// drawing comes back when WebGL fails.   usage: node v41card.js <pc|tall|wide|wideS> [lang]   → shots/v41/<mode>_<lang>_*.jpg
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
const OUT=path.join(__dirname,'shots','v41');fs.mkdirSync(OUT,{recursive:true});
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
  // ---- the warm-up renders portraits by itself while the menu is open ----
  const w0=await E(()=>Object.keys(window.__PH.P3.url).length);await wait(2500);
  const w1=await E(()=>Object.keys(window.__PH.P3.url).length);
  ok(w1>w0||w1>=16,'portraits are rendered in the background while the menu is open ('+w0+' → '+w1+' of 16 after 2.5 s)');
  await E(()=>{window.__rAF=window.requestAnimationFrame;window.requestAnimationFrame=()=>0;});await wait(200);
  // ---- every species: a real image, and the renderer is exactly as before ----
  const r=await E(async keys=>{const P=window.__PH,T=window.THREE,rd=P.renderer,out={};
    const st=()=>({rt:rd.getRenderTarget()===null,ex:rd.toneMappingExposure,ca:rd.getClearAlpha(),cc:rd.getClearColor(new T.Color()).getHex(),stick:P.save.set.stick});
    const s0=st();
    for(const k of keys){const u=P.p3Url(k);const im=new Image();await new Promise(res=>{im.onload=res;im.onerror=res;im.src=u;});
      const c=document.createElement('canvas');c.width=im.width||1;c.height=im.height||1;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;
      let op=0,dark=0,light=0,top=-1;for(let i=3;i<d.length;i+=4)if(d[i]>200){op++;const l=d[i-3]+d[i-2]+d[i-1];if(l<150)dark++;if(l>560)light++;if(top<0)top=Math.floor(i/4/c.width);}
      out[k]={w:im.width,h:im.height,kb:Math.round(u.length*.75/1024),type:u.slice(5,15),cover:+(op/(c.width*c.height)).toFixed(2),dark:+(dark/op).toFixed(2),light:+(light/op).toFixed(2),corner:d[3],top:+(top/c.height).toFixed(2)};}
    return {out,s0,s1:st(),fail:P.P3.fail,rules:document.getElementById('p3css').textContent.split('\n').length,sceneKids:P.P3.scn.children.filter(o=>o.isGroup).length};},ALL);
  const bad=ALL.filter(k=>{const o=r.out[k];return !(o.w===512&&o.h===640&&o.kb>12&&o.kb<160&&o.cover>.22&&o.cover<.6&&o.corner===0&&o.top>.02&&o.top<.2&&o.dark>.03&&o.light>.04);});
  ok(bad.length===0,'16 portraits: 512×640, transparent corners, the penguin fills 22–60 % of the frame with both dark and white plumage '+(bad.length?'BAD '+JSON.stringify(bad.map(k=>[k,r.out[k]])):JSON.stringify(r.out.king)));
  ok(JSON.stringify(r.s0)===JSON.stringify(r.s1)&&r.s1.rt,'the renderer is exactly as before (target, exposure, clear colour, stick setting) '+JSON.stringify(r.s1));
  ok(r.fail===0&&r.rules===16&&r.sceneKids===0,'one CSS rule per species, the portrait models are removed again, no failure');
  const kb=ALL.reduce((a,k)=>a+r.out[k].kb,0);ok(kb<1500,'all portraits together '+kb+' KB in memory (not in the game file)');
  // the main scene still draws
  const px=await E(()=>{const P=window.__PH,rd=P.renderer,gl=rd.getContext();rd.render(P.scene,P.camera);const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,b=new Uint8Array(4);let mn=255,mx=0;
    for(let i=1;i<8;i++)for(let j=1;j<8;j++){gl.readPixels(Math.floor(w*i/8),Math.floor(h*j/8),1,1,gl.RGBA,gl.UNSIGNED_BYTE,b);const l=(b[0]+b[1]+b[2])/3;mn=Math.min(mn,l);mx=Math.max(mx,l);}return {range:Math.round(mx-mn)};});
  ok(px.range>40,'the rink behind the menu still renders normally afterwards '+JSON.stringify(px));
  // ---- the card ----
  const c=await E(()=>{const P=window.__PH;const d=document.createElement('div');d.id='t41';d.style.cssText='position:fixed;left:8px;top:8px;z-index:99999;display:flex;gap:8px;background:#0d2140;padding:8px';
    d.innerHTML=P.cardHtml('king',{cw:150})+P.cardHtml('basic',{cw:92})+P.cardHtml('auk',{cw:92})+P.sil18('little',92);document.body.appendChild(d);
    const pc=d.querySelector('.pc'),art=pc.querySelector('.pc-art'),i=art.querySelector('.p3'),nm=pc.querySelector('.pc-name'),ft=pc.querySelector('.pc-foot'),top=pc.querySelector('.pc-top'),R=e=>e.getBoundingClientRect();
    const b=getComputedStyle(pc,'::before'),cs=getComputedStyle(pc),bd=parseFloat(b.height),pr=R(pc),ar=R(art),ir=R(i),nr=R(nm),fr=R(ft),tr=R(top);
    const sil=d.querySelector('.pc-sil-art .p3');
    return {svg:pc.querySelectorAll('.pc-art svg').length,img:getComputedStyle(i).backgroundImage.slice(0,22),w:pr.width,h:pr.height,bd,board:b.content!=='none'&&b.display!=='none',boardBg:/242, 180, 0|rgb\(242/.test(b.backgroundImage),
      artBottom:+(pr.bottom-ar.bottom).toFixed(1),nameInBoard:nr.top>=pr.bottom-bd-1&&fr.bottom<=pr.bottom+.5,headRoom:+(ir.top-pr.top).toFixed(1),wide:+(ir.width/pr.width).toFixed(2),topOver:tr.bottom<pr.top+pr.height*.3,
      nameCol:getComputedStyle(nm).color,border:cs.borderTopWidth,sil:sil?getComputedStyle(sil).filter:'none',silOp:sil?getComputedStyle(sil).opacity:'',over:[...d.querySelectorAll('.pc')].filter(q=>q.scrollWidth>q.clientWidth+1).length};});
  ok(c.svg===0&&/^url\("data:image/.test(c.img),'a card shows the rendered portrait, not the drawing '+c.img);
  ok(Math.abs(c.w-150)<.6&&Math.abs(c.h-150*1.42)<2,'the card keeps its size ('+c.w+' × '+c.h+')');
  ok(c.board&&c.boardBg&&c.bd>40&&c.bd<60&&c.nameInBoard&&/13, 39, 72/.test(c.nameCol),'the dasher board sits at the bottom with its yellow kick plate and carries the name and level (board '+c.bd.toFixed(0)+' px, name '+c.nameCol+')');
  ok(c.wide>.95&&c.wide<1.2&&c.topOver&&c.over===0,'the portrait spans the card behind the OVR and position, nothing spills out '+JSON.stringify({wide:c.wide,headRoom:c.headRoom}));
  ok(/brightness\(0\)/.test(c.sil)&&+c.silOp<.4,'an undiscovered species stays a pale silhouette ('+c.sil+', opacity '+c.silOp+')');
  await shot('cards');await E(()=>document.getElementById('t41').remove());
  // ---- real screens ----
  await E(()=>{window.requestAnimationFrame=window.__rAF;window.__PH.goScreen('sScout');});await wait(600);
  const s1=await E(()=>{const a=document.querySelector('.gb-art');const i=a&&a.querySelector('.p3');return {banner:!!i,bg:i?getComputedStyle(i).backgroundImage.slice(0,16):'',w:i?i.getBoundingClientRect().width:0};});
  ok(s1.banner&&/url/.test(s1.bg)&&s1.w>40,'the scout banner shows the portrait '+JSON.stringify(s1));await shot('scout');
  const tabs=await E(()=>{const t=[...document.querySelectorAll('#scTabs button')];if(t[3])t[3].click();return t.length;});await wait(700);
  const s2=await E(()=>{const pcs=[...document.querySelectorAll('#sScout .pc')].filter(e=>e.offsetParent);const vw=innerWidth;
    return {n:pcs.length,p3:pcs.filter(e=>e.querySelector('.pc-art .p3')).length,sil:document.querySelectorAll('#sScout .pc-sil-art .p3').length,out:pcs.filter(e=>{const r=e.getBoundingClientRect();return r.left<-1||r.right>vw+1;}).length};});
  ok(tabs>=4&&s2.n>=6&&s2.p3>=6&&s2.out===0,'the collection shows portrait cards inside the screen '+JSON.stringify(s2));await shot('dex');
  await E(()=>window.__PH.openCard('king'));await wait(600);
  const s3=await E(()=>{const d=document.getElementById('cardDlg');const pc=d&&d.querySelector('.pc');const i=pc&&pc.querySelector('.pc-art .p3');return {open:!!(d&&d.offsetParent!==null),p3:!!i,b5:pc?pc.classList.contains('b5'):false};});
  ok(s3.p3,'the card window shows the portrait '+JSON.stringify(s3));await shot('card_king');
  // ---- the team colour is followed ----
  const t=await E(()=>{const P=window.__PH;const a=P.p3Url('basic');P.save.team='red';const b=P.p3Url('basic');const n=Object.keys(P.P3.url).length;P.save.team='blue';const c=P.p3Url('basic');return {changed:a!==b,back:c.length===a.length||c===a,n,rule:/p3-basic/.test(document.getElementById('p3css').textContent)};});
  ok(t.changed&&t.n===1&&t.rule,'changing your team re-renders the sweater in the new colour '+JSON.stringify(t));
  // ---- WebGL trouble → the drawing ----
  const f=await E(()=>{const P=window.__PH;const f0=P.P3.fail;P.P3.fail=2;const h=P.cardHtml('fast',{cw:92});P.P3.fail=f0;return {svg:/<div class="pc-art"><svg/.test(h),can:P.p3Can()};});
  ok(f.svg&&f.can,'if portraits cannot be rendered the card falls back to the drawing');
  const errs=logs.filter(l=>!/favicon|net::ERR/.test(l));ok(errs.length===0,'no page errors '+errs.slice(0,3).join(' | '));
  console.log('TOTAL: '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e);process.exit(1);});
