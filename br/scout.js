const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'tall',pre=process.argv[3]||'s1';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const FS=path.resolve('node_modules/@fontsource');
const fontCss=()=>['jua/index.css','fredoka/500.css','fredoka/700.css'].map(f=>{const pkg=f.split('/')[0];return fs.readFileSync(path.join(FS,f),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');
const SAVE=JSON.stringify({v:10,points:4200,types:['basic','fast','strong','defense'],type:'fast',squad:['strong','defense',null],lv:{fast:6,strong:3,basic:2,defense:1},
  cards:{basic:[5,2,1,0],fast:[3,2,1,1],strong:[2,1,0,0],defense:[2,0,0,0],balanced:[0,0,0,0],auk:[0,0,0,0]},stats:{played:24,wins:14,goals:61,tourClears:1},cleared:{c1:true,tour:true},
  scout:{pulls:47,pity:23,freeDay:'x',fail:{fast:2},hist:[['fast',1,0],['basic',0,0],['strong',2,1]]},brk:{fast:2},xp:{fast:420},tut:{done:true,asked:true}});
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[];page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss()});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(s=>{localStorage.setItem('penguinHockey.v1',s);},SAVE);
  await page.goto('file://'+path.resolve('../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2500);await page.evaluate(()=>document.fonts.ready);
  const E=(f,...a)=>page.evaluate(f,...a);
  const shot=async n=>{await wait(300);await page.screenshot({path:'shots/'+pre+'_'+mode+'_'+n+'.jpg',type:'jpeg',quality:74});};
  const go=async id=>{await E(id=>{const b=document.createElement('button');b.dataset.go=id;document.body.appendChild(b);b.click();b.remove();},id);await wait(500);};
  const tab=async t=>{await E(t=>document.querySelector('#scTabs [data-t="'+t+'"]').click(),t);await wait(400);};
  const R={};
  await go('sScout');await tab('pull');await shot('01_pull');
  await E(()=>{const b=document.querySelector('#scBody');b.scrollTop=9999;const p=b.closest('.panel')||b.parentElement;if(p)p.scrollTop=9999;});await shot('01b_pull_bottom');
  // double tap on 10-pull: charged once
  R.p0=await E(()=>window.__PH.save.points);
  await E(()=>{const b=document.querySelector('[data-act="pull10"]');b.click();b.click();document.querySelector('[data-act="pull10"]')&&document.querySelector('[data-act="pull10"]').click();});
  await wait(200);R.p1=await E(()=>window.__PH.save.points);
  await E(()=>document.querySelector('#pkSkip').click());await wait(1800);await E(()=>document.querySelector('#pkSkip').click());await wait(2500);
  await shot('02_pull10_result');
  R.foot=await E(()=>[...document.querySelectorAll('#pkFoot button')].map(b=>b.textContent).join(' | '));
  await E(()=>{const b=[...document.querySelectorAll('#pkFoot button')].find(x=>x.textContent.includes('강화'));(b||document.querySelector('#pkOk')).click();});await wait(700);
  await shot('03_enh');
  await E(()=>{const s=document.querySelector('#scBody');const p=s.closest('.panel')||s.parentElement;p.scrollTop=420;});await shot('03b_enh_scroll');
  // enhancement result (force success / failure by temporarily fixing Math.random)
  await E(()=>{const P=window.__PH;P.save.points=4000;P.save.scout.fail.fast=0;const r=Math.random;Math.random=()=>0;P.doEnhance('fast',0);Math.random=r;});await wait(1500);await shot('04_enh_success');
  await E(()=>document.querySelector('#enhFx [data-ef="close"]').click());await wait(400);
  await E(()=>{const P=window.__PH;const r=Math.random;Math.random=()=>.999;P.doEnhance('fast',0);Math.random=r;});await wait(1300);await shot('05_enh_fail');
  await E(()=>document.querySelector('#enhFx [data-ef="close"]').click());await wait(400);
  // breakthrough confirm + result
  await E(()=>{const P=window.__PH;P.save.cards.fast=[4,3,1,1];P.renderScout();document.querySelector('[data-act="brk"]').click();});await wait(500);await shot('06_brk_confirm');
  await E(()=>document.querySelector('#cfmDlg [data-cf="1"]').click());await wait(1500);await shot('07_brk_result');
  R.brk=await E(()=>window.__PH.save.brk.fast);
  await E(()=>document.querySelector('#enhFx [data-ef="close"]').click());await wait(300);
  await tab('dex');await shot('08_dex');
  await E(()=>{const q=document.querySelector('#dxQ');q.value='황제';q.dispatchEvent(new Event('input'));});await wait(200);R.dexVisible=await E(()=>[...document.querySelectorAll('.dx-c')].filter(e=>e.style.display!=='none').length);
  await E(()=>{const q=document.querySelector('#dxQ');q.value='';q.dispatchEvent(new Event('input'));document.querySelector('.dx-c[data-card="fast"]').click();});await wait(500);await shot('09_card_detail');
  await E(()=>document.querySelector('#cardDlg .cd-x').click());await wait(200);
  await E(()=>document.querySelector('.dx-c[data-card="balanced"]').click());await wait(400);await shot('10_card_locked');
  await E(()=>document.querySelector('#cardDlg .cd-x').click());
  console.log(mode,JSON.stringify(R),logs.join(' | ')||'no page errors');
  await browser.close();
})().catch(e=>{console.error('FAIL',mode,e.message);process.exit(1)});
