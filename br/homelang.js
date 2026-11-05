// Quick captures of the home screen (and the scout pull/enhance tabs) in one layout. usage: node homequick.js <pc|tall|wide> <prefix> [html]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',pre=process.argv[3]||'h0',html=process.argv[4]||'../penguin-hockey-improved.html',lang=process.argv[5]||'ko';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const FS=path.resolve('node_modules/@fontsource');
const fontCss=u=>[].concat(/Fredoka|Jua/.test(u)?['jua/index.css','fredoka/500.css','fredoka/700.css']:[],/M\+PLUS\+Rounded/.test(u)?['m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css']:[],/Noto\+Sans\+SC/.test(u)?['noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css']:[]).map(f=>{const pkg=f.split('/')[0];return fs.readFileSync(path.join(FS,f),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');
const SAVE=JSON.stringify({v:10,points:1840,types:['basic','fast','strong','defense'],type:'fast',squad:['strong','defense',null],lv:{fast:6,strong:3,basic:2,defense:1},
  cards:{basic:[3,1,0,0],fast:[2,1,0,0],strong:[1,0,1,0],defense:[2,0,0,0],balanced:[0,0,0,0],auk:[0,0,0,0]},stats:{played:24,wins:14,goals:61,tourClears:1},cleared:{c1:true,c3:true,tour:true},
  xp:{fast:420,strong:120},tut:{done:true,asked:true},mgr:{r:1460,games:22,w:13,d:2,l:7,best:1500,form:['W','W','L','W','D'],hist:[]},profile:{name:'펭귄 감독',club:'남극 FC',emb:'🐧',city:'부산',since:1,seed:7}});
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[];page.on('pageerror',e=>logs.push('PAGEERR '+e.message));
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(s=>localStorage.setItem('penguinHockey.v1',s),SAVE);
  await page.goto('file://'+path.resolve(html)+'?lang='+lang,{waitUntil:'load'});await wait(2600);await page.evaluate(()=>document.fonts.ready);
  const E=(f,...a)=>page.evaluate(f,...a);
  const shot=async n=>{await wait(300);await E(()=>{try{document.getAnimations().forEach(a=>{try{if(a.effect&&a.effect.getTiming().iterations!==Infinity)a.finish()}catch(e){}})}catch(e){}});await wait(120);await page.screenshot({path:'shots/'+pre+'_'+lang+'_'+mode+'_'+n+'.jpg',type:'jpeg',quality:82});};
  const go=async id=>{await E(id=>{const b=document.createElement('button');b.dataset.go=id;document.body.appendChild(b);b.click();b.remove();},id);await wait(450);};
  await E(()=>{const p=document.getElementById('achPop');if(p)p.style.display='none';});
  await shot('home');
  console.log(mode+' homequick done '+(logs.join(' | ')||'no page errors'));await browser.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
