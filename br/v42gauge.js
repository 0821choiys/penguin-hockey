// v42: the skill gauge label fits its circle; (from v42legal) the privacy policy / account deletion links in 설정 and in the account window.  usage: node v42legal.js <pc|tall|wide|wideS> <lang>
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
const OUT=path.join(__dirname,'shots','v42');fs.mkdirSync(OUT,{recursive:true});
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
  await page.evaluateOnNewDocument(k=>{window.PH_NODAILY=1;window.__GK=k;},process.env.GK||'basic');
  await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('seeded','1');}},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2500);
  const E=(f,...a)=>page.evaluate(f,...a);const shot=n=>page.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:88});
  const res=await E(()=>{const P=window.__PH,G=P.G,out={};P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'T',oppTypes:['basic','fast','strong']});
    for(let i=0;i<60*6&&G.state!=='play';i++)P.step(1/60);
    for(const k of Object.keys(P.TYPES)){G.player.ty=P.TYPES[k];G.player.cd.special=0;document.getElementById('gaugeT').textContent=P.SPECIALS[P.TYPES[k].special];P.gaugeFit();
      const g=document.getElementById('gauge'),t=document.getElementById('gaugeT'),R=g.getBoundingClientRect(),rg=document.createRange();rg.selectNodeContents(t);const Q=rg.getBoundingClientRect();
      out[k]={txt:t.textContent,fs:getComputedStyle(t).fontSize,w:Math.round(Q.width),h:Math.round(Q.height),cw:Math.round(R.width),fit:Q.left>=R.left-1&&Q.right<=R.right+1&&Q.top>=R.top-1&&Q.bottom<=R.bottom+1};}
    return out;});
  const bad=Object.entries(res).filter(([k,v])=>!v.fit);
  ok(bad.length===0,lang+': the skill name fits the gauge circle for every species '+(bad.length?JSON.stringify(bad):JSON.stringify(Object.values(res).map(v=>v.txt+' '+v.fs).filter((v,i,a)=>a.indexOf(v)===i))));
  await E(()=>{const P=window.__PH,G=P.G;const k=window.__GK||'basic';const t=document.getElementById('gaugeT');t.textContent=P.SPECIALS[P.TYPES[k].special];P.gaugeFit();P.renderer.render(P.scene,P.camera);});
  await page.screenshot({path:path.join(OUT,mode+'_'+lang+'_gauge.jpg'),type:'jpeg',quality:85,clip:{x:0,y:40,width:160,height:120}});
  console.log('TOTAL: '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e);process.exit(1);});
