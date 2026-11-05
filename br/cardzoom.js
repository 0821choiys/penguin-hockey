// Close-up of small cards (squad bench tags, pull results) per language. usage: node cardzoom.js <lang> [prefix]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const lang=process.argv[2]||'en',pre=process.argv[3]||'cz';
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const SAVE=JSON.stringify({v:10,points:1840,types:['basic','fast','strong','defense','balanced'],type:'fast',squad:['strong','defense','balanced'],lv:{fast:6,strong:3,basic:2,defense:1,balanced:1},
  cards:{basic:[3,1,0,0],fast:[2,1,0,0],strong:[1,0,1,0],defense:[2,0,0,0],balanced:[0,0,0,0],auk:[0,0,0,0]},tut:{done:true,asked:true},profile:{name:'펭귄 감독',club:'펭귄 FC',emb:'🐧',city:'부산',since:1,seed:7}});
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:1000,height:620,deviceScaleFactor:2}});
  const page=await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'node_modules/three/build/three.min.js'))});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(s=>localStorage.setItem('penguinHockey.v1',s),SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2600);
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>{const b=document.createElement('button');b.dataset.go='sSquad';document.body.appendChild(b);b.click();b.remove();});await wait(1800);await page.evaluate(()=>{try{document.getAnimations().forEach(a=>{try{if(a.effect&&a.effect.getTiming().iterations!==Infinity)a.finish()}catch(e){}})}catch(e){}});await wait(300);
  const r=await page.evaluate(()=>{const bench=document.querySelector('#sqBench')||document.querySelector('.sq-bench')||[...document.querySelectorAll('#sSquad .cardrow')][0];if(!bench)return null;bench.scrollIntoView({block:'center'});const q=bench.getBoundingClientRect();return {x:q.left,y:q.top,w:q.width,h:q.height,id:bench.id||bench.className};});
  await wait(400);
  if(r)await page.screenshot({path:path.join(__dirname,'shots/'+pre+'_'+lang+'_bench.png'),clip:{x:Math.max(0,r.x),y:Math.max(0,r.y),width:Math.min(1000,r.w),height:Math.min(620,r.h)}});
  console.log(lang,JSON.stringify(r));
  await browser.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
