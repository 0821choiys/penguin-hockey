// Language switch end-to-end: Settings row -> reload -> language applied & remembered; stored names follow; back to Korean.
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');if(/M\+PLUS\+Rounded/.test(u))f.push('m-plus-rounded-1c/700.css');if(/Noto\+Sans\+SC/.test(u))f.push('noto-sans-sc/700.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
let pass=0,fail=0;const ok=(c,m)=>{if(c){pass++;console.log('ok   '+m);}else{fail++;console.log('FAIL '+m);}};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--lang=en-US'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:1000,height:620}});
  const mk=async(prefs)=>{const page=await browser.newPage();const logs=[];page.on('pageerror',e=>logs.push(e.message));
    await page.setRequestInterception(true);
    page.on('request',r=>{const u=r.url();
      if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'node_modules/three/build/three.min.js'))});
      if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
      if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
      if(u.startsWith('file:'))return r.continue();r.abort();});
    if(prefs)await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(p=>{if(!sessionStorage.getItem('__seeded')){localStorage.clear();for(const k in p)localStorage.setItem(k,p[k]);sessionStorage.setItem('__seeded','1');}},prefs);
    page.setDefaultNavigationTimeout(90000);   // software WebGL: a reload under load can take longer than 30 s
    page.logs=logs;return page;};
  const html='file://'+path.resolve(__dirname,process.env.HTML||'../penguin-hockey-improved.html');
  const st=p=>p.evaluate(()=>({lang:I18N.lang,html:document.documentElement.lang,set:__PH.save.set.lang,lk:localStorage.getItem('penguinHockey.lang'),
    saved:(JSON.parse(localStorage.getItem('penguinHockey.v1')||'{}').set||{}).lang,quick:document.querySelector('#sMenu [data-mode="quick"] b').textContent.replace(/\u200b/g,''),
    name:__PH.save.profile.name,club:__PH.save.profile.club,city:__PH.save.profile.city,wait:document.documentElement.classList.contains('i18n-wait'),url:location.search}));
  // 1) existing Korean player (save without a language): stays Korean even though the browser is English
  const OLD=JSON.stringify({v:10,news18:true,points:300,types:['basic'],type:'basic',tut:{done:true,asked:true},profile:{name:'펭귄 감독',club:'펭귄 FC',emb:'🐧',city:'부산',since:1,seed:7}});
  let p=await mk({'penguinHockey.v1':OLD});await p.goto(html,{waitUntil:'load',timeout:90000});await wait(2500);
  let s=await st(p);console.log(JSON.stringify(s));
  ok(s.lang==='ko'&&s.html==='ko'&&s.quick==='빠른 경기','existing save without a language opens in Korean');
  ok(s.name==='펭귄 감독'&&s.city==='부산','Korean names untouched in Korean');
  // 2) pick 日本語 in Settings
  await p.evaluate(()=>{const b=document.createElement('button');b.dataset.go='sSet';document.body.appendChild(b);b.click();b.remove();});await wait(500);
  const row=await p.evaluate(()=>{const r=document.querySelector('#setList .setrow.set-lang');return r?{label:r.firstChild.textContent,opts:[...r.querySelectorAll('button')].map(b=>b.textContent+(b.classList.contains('on')?'*':'')),first:r===document.querySelector('#setList .setrow')}:null;});
  console.log(JSON.stringify(row));
  ok(row&&row.first&&row.opts.join('|')==='한국어*|English|简体中文|日本語','language row is the first settings row, current language marked');
  await Promise.all([p.waitForNavigation({waitUntil:'load',timeout:90000}),p.evaluate(()=>{[...document.querySelectorAll('#setList .set-lang button')].find(b=>b.textContent==='日本語').click();})]);
  await wait(2500);s=await st(p);console.log(JSON.stringify(s));
  ok(s.lang==='ja'&&s.html==='ja'&&s.lk==='ja'&&s.saved==='ja'&&s.set==='ja','after the click the page reloads in Japanese and the choice is stored');
  ok(s.quick==='クイックマッチ'&&!s.wait,'home buttons are in Japanese and the page is visible');
  ok(s.name==='ペンギン監督'&&s.club==='ペンギンFC'&&s.city==='釜山','default coach/club names and the home city follow the language');
  // 3) a plain reload keeps Japanese
  await p.reload({waitUntil:'load',timeout:90000});await wait(2500);s=await st(p);ok(s.lang==='ja'&&s.quick==='クイックマッチ','reload keeps Japanese');
  // 4) English, then back to Korean: names round-trip
  for(const [lbl,code,quick,name,city] of [['English','en','Quick Match','Penguin Boss','Busan'],['简体中文','zh','快速比赛','企鹅教练','釜山'],['한국어','ko','빠른 경기','펭귄 감독','부산']]){
    await p.evaluate(()=>{const b=document.createElement('button');b.dataset.go='sSet';document.body.appendChild(b);b.click();b.remove();});await wait(400);
    await Promise.all([p.waitForNavigation({waitUntil:'load',timeout:90000}),p.evaluate(l=>{[...document.querySelectorAll('#setList .set-lang button')].find(b=>b.textContent===l).click();},lbl)]);
    await wait(2500);s=await st(p);console.log(JSON.stringify(s));
    ok(s.lang===code&&s.quick===quick&&s.name===name&&s.city===city&&s.saved===code,'switch to '+lbl+': UI, names and saved choice');
  }
  ok(p.logs.length===0,'no page errors ('+p.logs.join(' | ')+')');await p.close();
  // 5) new players: browser language decides (en-US here); ?lang= overrides; unknown languages fall back to English
  p=await mk({});await p.goto(html,{waitUntil:'load',timeout:90000});await wait(2500);s=await st(p);ok(s.lang==='en'&&s.quick==='Quick Match','new player with an English browser starts in English');await p.close();
  p=await mk({});await p.goto(html+'?lang=zh',{waitUntil:'load',timeout:90000});await wait(2500);s=await st(p);ok(s.lang==='zh'&&s.html==='zh-CN'&&s.quick==='快速比赛','?lang=zh opens in Chinese');await p.close();
  // 6) storage blocked: the choice still applies through the URL
  p=await mk({'penguinHockey.v1':OLD});await p.goto(html,{waitUntil:'load',timeout:90000});await wait(2500);
  await p.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('blocked');};});
  await p.evaluate(()=>{const b=document.createElement('button');b.dataset.go='sSet';document.body.appendChild(b);b.click();b.remove();});await wait(400);
  await Promise.all([p.waitForNavigation({waitUntil:'load',timeout:90000}),p.evaluate(()=>{[...document.querySelectorAll('#setList .set-lang button')].find(b=>b.textContent==='English').click();})]);
  await wait(2500);s=await st(p);console.log(JSON.stringify(s));
  ok(s.lang==='en','when storage refuses the write the language still switches ('+s.url+')');await p.close();
  console.log('TOTAL: '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
