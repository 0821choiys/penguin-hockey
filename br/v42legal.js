// v42: the privacy policy / account deletion links in 설정 and in the account window.  usage: node v42legal.js <pc|tall|wide|wideS> <lang>
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
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});
  await page.evaluateOnNewDocument(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('penguinHockey.v1',s);sessionStorage.setItem('seeded','1');}},SAVE);
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang='+lang,{waitUntil:'load'});await wait(2500);
  const E=(f,...a)=>page.evaluate(f,...a);const shot=n=>page.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:88});
  const r=await E(()=>{const P=window.__PH;P.goScreen('sSet');return true;});await wait(700);
  const s=await E(()=>{const row=document.getElementById('legalRow'),list=document.getElementById('setList');if(!row)return {row:false};
    const a=[...row.querySelectorAll('a')],R=row.getBoundingClientRect(),vw=innerWidth;
    const acc=document.getElementById('accRow');
    return {row:true,last:list.lastElementChild===row,afterAcc:!acc||(acc.compareDocumentPosition(row)&4)>0,n:a.length,href:a.map(x=>x.getAttribute('href')),target:a.map(x=>x.target),
      txt:a.map(x=>x.textContent),inside:a.every(x=>{const q=x.getBoundingClientRect();return q.left>=-1&&q.right<=vw+1&&q.width>30&&q.height>=24;}),over:a.filter(x=>x.scrollWidth>x.clientWidth+2).length,label:row.firstElementChild.textContent};});
  const want=lang==='ko'?'':'-en';
  ok(s.row&&s.last&&s.afterAcc,'설정: the privacy row is the last row, under the account row '+JSON.stringify({last:s.last,afterAcc:s.afterAcc}));
  ok(s.n===2&&s.href[0]==='https://0821choiys.github.io/penguin-hockey/privacy'+want+'.html'&&s.href[1]==='https://0821choiys.github.io/penguin-hockey/delete-account'+want+'.html'&&s.target.every(t=>t==='_blank'),'two links to the '+(want?'English':'Korean')+' pages, opened outside the game '+JSON.stringify(s.href));
  ok(s.inside&&s.over===0&&!/[가-힣]/.test(lang==='ko'?'':s.label+s.txt.join('')),'the buttons fit the screen, no Korean left in '+lang+' '+JSON.stringify({label:s.label,txt:s.txt}));
  await page.evaluate(()=>{const r=document.getElementById('legalRow');if(r)r.scrollIntoView({block:'center'});});await wait(300);
  await page.screenshot({path:path.join(OUT,mode+'_'+lang+'_settings.jpg'),type:'jpeg',quality:85});
  // re-render (language switch / toggles) keeps exactly one row at the bottom
  const again=await E(()=>{const P=window.__PH;P.renderSettings();P.renderSettings();return {n:document.querySelectorAll('#legalRow').length,last:document.getElementById('setList').lastElementChild.id};});
  ok(again.n===1&&again.last==='legalRow','re-rendering 설정 keeps one privacy row at the bottom '+JSON.stringify(again));
  // the account window
  const w=await E(()=>{const P=window.__PH;const b=[...document.querySelectorAll('#accRow button,#accRow .btn')][0];if(b)b.click();return !!b;});await wait(600);
  const acc=await E(()=>{const d=document.querySelector('.acc-legal');if(!d)return {found:false};const a=[...d.querySelectorAll('a')];return {found:true,vis:d.getBoundingClientRect().height>0,href:a.map(x=>x.getAttribute('href'))};});
  ok(w&&acc.found&&acc.vis&&acc.href.length===2,'the account window ends with the privacy and deletion links '+JSON.stringify(acc));
  await page.screenshot({path:path.join(OUT,mode+'_'+lang+'_account.jpg'),type:'jpeg',quality:85});
  // the pages themselves are online
  const errs=logs.filter(l=>!/favicon|net::ERR/.test(l));ok(errs.length===0,'no page errors '+errs.slice(0,3).join(' | '));
  console.log('TOTAL: '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e);process.exit(1);});
