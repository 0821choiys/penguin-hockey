// Capture every screen with the real web fonts (served locally). usage: node design.js <pc|tall|wide> [prefix]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',pre=process.argv[3]||'d0';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true}}[mode];
const FS=path.resolve('node_modules/@fontsource');
const fontCss=()=>['jua/index.css','fredoka/500.css','fredoka/700.css'].map(f=>{const pkg=f.split('/')[0];return fs.readFileSync(path.join(FS,f),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');
const SAVE=JSON.stringify({v:10,points:1840,types:['basic','fast','strong','defense'],type:'fast',squad:['strong','defense',null],lv:{fast:6,strong:3,basic:2,defense:1},
  cards:{basic:[3,1,0,0],fast:[2,1,0,0],strong:[1,0,1,0],defense:[2,0,0,0],balanced:[0,0,0,0],auk:[0,0,0,0]},stats:{played:24,wins:14,goals:61,tourClears:1},cleared:{c1:true,c3:true,tour:true},
  xp:{fast:420,strong:120},tut:{done:true,asked:true},mgr:{r:1460,games:22,w:13,d:2,l:7,best:1500,form:['W','W','L','W','D'],hist:[]},profile:{name:'펭귄 감독',club:'남극 FC',emb:'🐧',city:'부산',since:1,seed:7}});
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();
    if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss()});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(s=>{localStorage.setItem('penguinHockey.v1',s);},process.env.SAVE||SAVE);
  await page.goto('file://'+path.resolve(process.env.HTML||'../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2500);
  await page.evaluate(()=>document.fonts.ready);
  const E=(f,...a)=>page.evaluate(f,...a);
  const shot=async n=>{await wait(350);await page.screenshot({path:'shots/'+pre+'_'+mode+'_'+n+'.jpg',type:'jpeg',quality:74});};
  const go=async id=>{await E(id=>{window.__PH&&0;const b=document.createElement('button');b.dataset.go=id;document.body.appendChild(b);b.click();b.remove();},id);await wait(500);};
  const tab=async sel=>{await E(s=>{const b=document.querySelector(s);b&&b.click();},sel);await wait(400);};
  await shot('01_home');
  await go('sMode');await shot('02_mode');
  await E(()=>{document.querySelector('#sMode [data-mode="challenge"]').click();});await wait(400);await shot('03_chal');
  await go('sHow');await shot('04_how');
  await go('sScout');await shot('05_scout_pull');
  for(const t of['enh','fuse','dex']){await tab('#scTabs [data-t="'+t+'"]');await shot('05_scout_'+t);}
  await go('sSquad');await shot('06_squad');await E(()=>{const p=document.querySelector('.sqp .pbody')||document.querySelector('.sqp');if(p)p.scrollTop=9999;});await shot('06_squad_b');await E(()=>{const b=document.querySelector('#sqStyle [data-sqbuy]');if(b){b.scrollIntoView({block:'center'});b.click();}});await wait(200);await shot('06_squad_arm');
  await go('sMarket');await shot('07_market');await E(()=>{const b=[...document.querySelectorAll('#mkTabs button')];if(b[1])b[1].click();});await wait(400);await shot('07_market_sell');
  await go('sProfile');await shot('08_profile');
  await go('sRanked');await shot('09_ranked');
  await go('sGoals');await shot('10_goals');await tab('#gTabs [data-t="long"]');await shot('10_goals_long');await tab('#gTabs [data-t="ach"]');await shot('10_goals_ach');await tab('#gTabs [data-t="rec"]');await shot('10_goals_rec');
  await E(()=>{const st=document.createElement('style');st.textContent='#achPop{transition:none!important}';document.head.appendChild(st);const P=window.__PH;delete P.save.ach.a_win1;P.save.stats.wins=Math.max(1,P.save.stats.wins);P.achCheck();});await wait(400);await shot('10b_achpop');
  await go('sSet');await shot('11_settings');
  await go('sMenu');await E(()=>{const P=window.__PH;P.G.tour={round:0,champPaid:false};document.querySelector('#sMenu [data-mode="quick"]');});
  await E(()=>{const P=window.__PH;P.launch('tour');});await wait(500);await shot('12_tour');
  await E(()=>{const P=window.__PH;P.launch('quick');for(let i=0;i<300;i++)P.step(1/60);});await wait(600);await shot('13_game');
  await E(()=>document.querySelector('#bPause').click());await wait(300);await shot('14_pause');
  await E(()=>{const P=window.__PH,G=P.G;document.querySelector('#pResume').click();G.mine.score=3;G.mine.opp.score=1;G.hype.passes=6;G.timeLeft=.05;for(let i=0;i<60*4&&!(G.state==='over'&&G.resultShown);i++)P.step(1/60);
    const st=document.createElement('style');st.textContent='*{transition:none!important}';document.head.appendChild(st);});
  await wait(4500);await shot('15_result');
  console.log(mode+' done '+(logs.join(' | ')||'no page errors'));
  await browser.close();
})().catch(e=>{console.error('FAIL',mode,e.message);process.exit(1)});
