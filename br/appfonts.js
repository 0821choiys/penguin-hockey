// The Android app's copy of the game: no request leaves the app for fonts; every face loads from the bundle.
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
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(l=>{localStorage.setItem('penguinHockey.lang',l);window.requestAnimationFrame=()=>0;},lang);
  await page.goto('http://127.0.0.1:'+port+'/index.html?lang='+lang,{waitUntil:'load'});await wait(2500);
  const cjk=lang==='ja'?'M PLUS Rounded 1c':lang==='zh'?'Noto Sans SC':null;const f=await page.evaluate(async cjk=>{await document.fonts.ready;const out={};for(const n of ['Fredoka','Jua'].concat(cjk?[cjk]:[])){const faces=[...document.fonts].filter(x=>x.family.replace(/"/g,'')===n);out[n]={faces:faces.length,loaded:faces.filter(x=>x.status==='loaded').length};}return out;},cjk);
  ok(external.length===0,'no request to any other host (googleapis / gstatic / CDN): '+(external.length?external.slice(0,3).join(' '):'none'));
  ok(f.Fredoka.loaded>=2,'Fredoka loaded from the app bundle ('+f.Fredoka.loaded+'/'+f.Fredoka.faces+' faces)');
  ok(f.Jua.loaded>=1,'Jua loaded from the app bundle ('+f.Jua.loaded+'/'+f.Jua.faces+' faces)');
  if(cjk)ok(f[cjk].loaded>=1,cjk+' loaded from the app bundle ('+f[cjk].loaded+'/'+f[cjk].faces+' faces)');
  if(cjk){const used=await page.evaluate(async n=>{await document.fonts.load('700 20px "'+n+'"','あ漢字');await document.fonts.ready;const fs=[...document.fonts].filter(x=>x.family.replace(/"/g,'')===n);return {faces:fs.length,loaded:fs.filter(x=>x.status==='loaded').length,ok:document.fonts.check('700 20px "'+n+'"','漢字')};},cjk);
    ok(used.faces>0&&used.loaded>0&&used.ok,cjk+' ('+lang+') loaded from the app bundle ('+used.loaded+'/'+used.faces+' faces)');}
  else{const none=await page.evaluate(()=>[...document.fonts].filter(x=>/M PLUS|Noto Sans SC/.test(x.family)).length);ok(none===0,'Japanese / Chinese fonts are not loaded for '+lang);}
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  const shot=path.join(__dirname,'shots','app-fonts-'+lang+'.jpg');fs.mkdirSync(path.dirname(shot),{recursive:true});
  await page.screenshot({path:shot,type:'jpeg',quality:84});
  console.log('TOTAL app fonts '+lang+': '+pass+' passed, '+fail+' failed');await browser.close();srv.close();process.exit(fail?1:0);
});
