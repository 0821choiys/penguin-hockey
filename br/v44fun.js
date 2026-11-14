// v44: the coach bar on the home screen, the coach rows / bar on the result screen and the level-up moment.  usage: node v42legal.js <pc|tall|wide|wideS> <lang>
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
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:OWN,type:'strong',team:'blue',lv,coach:{lv:4,xp:150,streak:2,best:2,fw:''},tut:{done:true,asked:true},hat:'none',rl:{intro:1},brk:{king:5},
  set:{quality:'ultra',cond:false,events:false,items:false,rules:'off',cine:'off',tod:'day',lang}});
const OUT=path.join(__dirname,'shots','v44');fs.mkdirSync(OUT,{recursive:true});
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
  await E(()=>{window.__PH.goScreen('sMenu');window.__PH.leagueMenuRefresh();});await wait(900);
  const h=await E(()=>{const b=document.getElementById('coachBar'),m=document.getElementById('menuRank');if(!b)return {bar:false};
    const B=b.getBoundingClientRect(),M=m.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,ov=(a,c)=>a.left<c.right&&a.right>c.left&&a.top<c.bottom&&a.bottom>c.top;
    const others=[...document.querySelectorAll('#sMenu .logo,#sMenu .hm-cta .btn,#pts,#sMenu .dock,.dock')].map(e=>e.getBoundingClientRect()).filter(r=>r.width>0);
    return {bar:true,txt:b.textContent,cmp:b.classList.contains('cmp'),below:B.top>=M.bottom-1||(b.classList.contains('cmp')&&B.left>=M.right-1&&Math.abs((B.top+B.bottom)/2-(M.top+M.bottom)/2)<4)||(b.classList.contains('cmp')&&(()=>{const P=document.getElementById('pts').getBoundingClientRect();return B.top>=P.bottom-1&&Math.abs(B.right-P.right)<2;})()),inside:B.left>=0&&B.right<=vw+1&&B.bottom<=vh,hit:others.filter(r=>ov(B,r)).length,lines:Math.round(B.height/18),w:Math.round(B.width),h:Math.round(B.height)};});
  ok(h.bar&&h.below&&h.inside&&h.hit===0,'home: the coach bar sits under the club chip (or compact beside it), inside the screen, over nothing else '+JSON.stringify(h));
  const want=lang==='ko'?/감독 Lv\.4.*다음 보상 210 P.*2연승.*오늘 첫 승 \+50P/:/Lv\.4/;
  ok(h.bar&&want.test(h.txt)&&(lang==='ko'||!/[가-힣]/.test(h.txt)),'home: level 4, next reward 210 P (5th level ×3), 2-win streak, first win today +50P '+h.txt);
  await shot('home');
  // a win: rows, bar, level up
  await E(()=>{const P=window.__PH,G=P.G;window.requestAnimationFrame=()=>0;
    P.startMatch({mode:'quick',size:3,time:120,diff:'normal',oppTypes:['basic','fast','strong'],tag:'q'});for(let i=0;i<60*5&&G.state!=='play';i++)P.step(1/60);
    G.mine.score=3;G.mine.opp.score=1;P.endMatch?P.endMatch():(G.timeLeft=0);for(let i=0;i<60*6&&!G.result;i++)P.step(1/60);P.showResultScreen();});
  await wait(2200);
  const r=await E(()=>{const P=window.__PH,R=P.G.result,o=R.co,up=document.getElementById('coUp');
    const rows=[...document.querySelectorAll('.rs-row')].map(e=>{const b=e.querySelector('.cu');return e.firstElementChild.textContent.replace(/\s+/g,' ')+' '+(b?b.dataset.to:'')+' P';});
    return {o:{xp:o.xp,ups:o.ups,fw:o.fw,sb:o.sb,lv:o.to.lv},total:R.total,rows,bar:!!document.querySelector('.co-res'),barW:(document.querySelector('.co-res .co-bar i')||{}).style.width,
      up:!!(up&&up.classList.contains('on')),upTxt:up?up.textContent:'',pts:P.save.points};});
  ok(r.o.fw===50&&r.o.sb===10&&r.o.ups.length===1&&r.o.lv===5,'a win from Lv.4 (150/180 XP) with a 2-win streak: first win +50, 3rd win in a row +10, Lv.5 '+JSON.stringify(r.o));
  const has=(re)=>r.rows.some(x=>re.test(x));
  ok(lang!=='ko'||(has(/3연승 보너스.*10 P/)&&has(/오늘 첫 승리.*50 P/)&&has(/감독 레벨 업 보상 \(Lv\.5\).*210 P/)),'the result table lists the streak +10, first win +50 and level-up 210 P '+JSON.stringify(r.rows.slice(-5)));
  await E(()=>{const u=document.getElementById('coUp');if(u)clearTimeout(u._t);});
  ok(r.bar&&r.up&&/LEVEL UP/.test(r.upTxt)&&/\+210 P/.test(r.upTxt),'the coach bar is on the result screen and the level-up moment shows +210 P '+r.upTxt.slice(0,60));
  await page.evaluate(()=>{for(const a of document.getAnimations()){try{a.finish();}catch(e){}}});await wait(200);await shot('levelup');
  await E(()=>document.getElementById('coUp').click());await wait(300);
  const closed=await E(()=>!document.getElementById('coUp').classList.contains('on'));ok(closed,'a tap closes the level-up moment');
  await shot('result');
  const errs=logs.filter(l=>!/favicon|net::ERR/.test(l));ok(errs.length===0,'no page errors '+errs.slice(0,3).join(' | '));
  console.log('TOTAL: '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e);process.exit(1);});
