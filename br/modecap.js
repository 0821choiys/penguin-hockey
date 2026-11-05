// Mode screen close-up per language/layout, with title fit info. usage: node modecap.js <lang> <pc|tall|wide>
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const lang=process.argv[2]||'en',mode=process.argv[3]||'wide';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/500.css','m-plus-rounded-1c/700.css','m-plus-rounded-1c/800.css');if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/500.css','noto-sans-sc/700.css','noto-sans-sc/900.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'node_modules/three/build/three.min.js'))});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(()=>localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,points:300,types:['basic'],type:'basic',tut:{done:true,asked:true}})));
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2500);await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>{const b=document.createElement('button');b.dataset.go='sMode';document.body.appendChild(b);b.click();b.remove();});await wait(900);
  await page.evaluate(()=>{try{document.getAnimations().forEach(a=>{try{a.finish()}catch(e){}})}catch(e){}});await wait(200);
  const info=await page.evaluate(()=>[...document.querySelectorAll('#sMode .mode b')].map(b=>{const r=b.getBoundingClientRect();return b.textContent.replace(/​/g,'|')+' fs='+getComputedStyle(b).fontSize+' lines='+Math.round(r.height/parseFloat(getComputedStyle(b).lineHeight||'20'))+' over='+(b.scrollWidth>b.clientWidth+1);}));
  console.log(lang,mode,JSON.stringify(info));
  await page.screenshot({path:path.join(__dirname,'shots/mode_'+lang+'_'+mode+'.jpg'),type:'jpeg',quality:80});
  await browser.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
