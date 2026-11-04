// The Android app's copy of the game: no request leaves the app for fonts; Fredoka and Jua load from the bundle.
// usage: node appfonts.js [ko|ja|zh|en]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path'),http=require('http');
const lang=process.argv[2]||'ko';const ROOT=path.resolve(__dirname,'../android/app/src/main/assets');
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css','.woff2':'font/woff2','.js':'application/javascript'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]).replace(/^\/assets\//,''));
  fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});r.end(d);});});
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
srv.listen(0,'127.0.0.1',async()=>{const port=srv.address().port;
  const browser=await puppeteer.launch({args:[...chromium.args],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:390,height:844,isMobile:true,hasTouch:true}});
  const page=await browser.newPage();const external=[],errs=[];
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=new URL(r.url());if(u.hostname==='127.0.0.1'||u.protocol==='data:')return r.continue();external.push(u.href);r.abort();});
  page.on('pageerror',e=>errs.push(e.message));
  await page.evaluateOnNewDocument(l=>{localStorage.setItem('penguinHockey.lang',l);window.requestAnimationFrame=()=>0;},lang);
  await page.goto('http://127.0.0.1:'+port+'/index.html?lang='+lang,{waitUntil:'load'});await wait(2500);
  const f=await page.evaluate(async()=>{await document.fonts.ready;const out={};for(const n of ['Fredoka','Jua']){const faces=[...document.fonts].filter(x=>x.family.replace(/"/g,'')===n);out[n]={faces:faces.length,loaded:faces.filter(x=>x.status==='loaded').length};}return out;});
  ok(external.length===0,'no request to any other host (googleapis / gstatic / CDN): '+(external.length?external.slice(0,3).join(' '):'none'));
  ok(f.Fredoka.loaded>=2,'Fredoka loaded from the app bundle ('+f.Fredoka.loaded+'/'+f.Fredoka.faces+' faces)');
  ok(f.Jua.loaded>=1,'Jua loaded from the app bundle ('+f.Jua.loaded+'/'+f.Jua.faces+' faces)');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  const shot=path.join(__dirname,'shots','app-fonts-'+lang+'.jpg');fs.mkdirSync(path.dirname(shot),{recursive:true});
  await page.screenshot({path:shot,type:'jpeg',quality:84});
  console.log('TOTAL app fonts '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();srv.close();process.exit(fail?1:0);
});
