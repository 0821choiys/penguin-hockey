// v45 / v46: the stick workshop and the kit designer in a real browser — home tiles, odds on screen = code, draw reveal + back button,
// crafting / upgrading, the captain's 3D stick, the kit editor with its 3D portrait, the kit in a match.  usage: node v45gear.js <pc|tall|wide|wideS> <lang>
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
const OWN=ALL.filter(k=>k!=='little'&&k!=='galapagos'&&k!=='auk');
const SAVE=JSON.stringify({v:10,news18:true,points:3000,types:OWN,type:'strong',team:'blue',tut:{done:true,asked:true},hat:'none',rl:{intro:1},
  stk:{m:{s0:2,s3:1,s7:1,s8:1,b2:1,b4:2,b6:1,b9:1},seen:{s0:1,s3:1,s7:1,s8:1,b2:1,b4:1,b6:1,b9:1},list:[],eq:0,nu:1,pity:{s:12,b:3},pulls:20,free:'',hist:[]},
  set:{quality:'ultra',cond:false,events:false,items:false,rules:'off',cine:'off',tod:'day',lang}});
const OUT=path.join(__dirname,'shots','v45');fs.mkdirSync(OUT,{recursive:true});
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
  const E=(f,...a)=>page.evaluate(f,...a);const shot=n=>page.screenshot({path:path.join(OUT,mode+'_'+lang+'_'+n+'.jpg'),type:'jpeg',quality:86});
  const hangul=t=>lang!=='ko'&&/[가-힣]/.test(t);
  // in-panel layout: nothing wider than the scroller, no text cut at the sides
  const layout=()=>E(()=>{const sc=document.querySelector('.screen.on .pbody');if(!sc)return {err:'no pbody'};const R=sc.getBoundingClientRect(),bad=[];
    for(const e of sc.querySelectorAll('b,small,button,.stk-tile,.kit-opt,.kit-c,svg')){const r=e.getBoundingClientRect();if(r.width<1)continue;if(r.left<R.left-2||r.right>R.right+2)bad.push((e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className)+':'+(e.textContent||'').trim().slice(0,14)+'@'+Math.round(r.left)+'-'+Math.round(r.right));}
    return {sw:sc.scrollWidth-sc.clientWidth,bad:bad.slice(0,4),txt:sc.innerText};});
  // ---------- home ----------
  await E(()=>{window.__PH.goScreen('sMenu');window.__PH.leagueMenuRefresh();});await wait(900);
  const h=await E(()=>{const r=s=>{const e=document.querySelector(s);return e?e.getBoundingClientRect():null;},a=r('#sMenu .hm-stk'),b=r('#sMenu .hm-kit'),vw=innerWidth,vh=innerHeight;
    const ov=(p,q)=>p.left<q.right-1&&p.right>q.left+1&&p.top<q.bottom-1&&p.bottom>q.top+1;
    const others=[...document.querySelectorAll('#sMenu .hm-cta .btn:not(.hm-stk):not(.hm-kit),#sMenu .logo,#menuGoals,#sMenu .dock,#pts,#menuRank,#coachBar')].map(e=>e.getBoundingClientRect()).filter(q=>q.width>0);
    const inside=q=>q&&q.left>=0&&q.top>=0&&q.right<=vw+1&&q.bottom<=vh+1&&q.width>40;
    return {a:!!a,inside:inside(a)&&inside(b),hit:[a,b].filter(Boolean).reduce((n,q)=>n+others.filter(o=>ov(q,o)).length,0)+(a&&b&&ov(a,b)?1:0),
      badge:(document.getElementById('stkBadge')||{}).textContent,t:(document.querySelector('#sMenu .hm-stk')||{}).innerText+' | '+(document.querySelector('#sMenu .hm-kit')||{}).innerText};});
  ok(h.a&&h.inside&&h.hit===0,'home: the 스틱 공방 and 유니폼 tiles are on screen and cover nothing '+JSON.stringify(h));
  const gd=await E(()=>{const g=document.getElementById('menuGoals'),d=document.querySelector('#sMenu .dock');const a=g&&g.getBoundingClientRect(),b=d&&d.getBoundingClientRect();
    return {shown:!!a&&a.height>0,gb:a?Math.round(a.bottom):0,dt:b?Math.round(b.top):0,qw:Math.round(document.querySelector('#sMenu .hm-quick').getBoundingClientRect().width)};});
  ok(!gd.shown||gd.gb<=gd.dt,'home: 오늘의 목표 is not hidden behind the dock (it was at 1000×620 after the two new tiles, 2026-11-15) '+JSON.stringify(gd));
  ok(!!h.badge&&!hangul(h.t),'home: the stick tile shows the free-draw badge ('+h.badge+') · '+h.t.replace(/\n/g,' '));
  await shot('home');
  // ---------- stick workshop: draw tab ----------
  await E(()=>{document.querySelector('#sMenu .hm-stk').click();});await wait(500);
  const p1=await E(()=>{const P=window.__PH,txt=document.getElementById('stkBody').innerText,o=P.stk(),pr=P.stkProbs('s',0),miss=[];
    document.querySelector('.stk-odds').open=true;const ot=document.querySelector('.stk-odds').innerText;
    for(const k of Object.keys(P.STK_M).filter(k=>k[0]==='s')){const v=(Math.round(P.stkMatRate(k,0)*100)/100).toFixed(2)+'%';if(!ot.includes(P.STK_M[k].n+' '+v))miss.push(k);}
    const hi=(Math.round((pr[3]+pr[4])*100)/100).toFixed(2)+'%';return {ui:G_ui(),miss,hi:txt.includes(hi),pity:txt.includes(o.pity.s+' / '+P.STK.hard),txt:txt.slice(0,400)};
    function G_ui(){return P.G.ui;}});
  ok(p1.ui==='sStick'&&p1.miss.length===0&&p1.hi&&p1.pity,'draw tab: every shaft material’s odds, the next-draw 신화+ chance and the pity counter on screen are the code’s numbers '+JSON.stringify({ui:p1.ui,miss:p1.miss,hi:p1.hi,pity:p1.pity}));
  ok(!hangul(p1.txt),'draw tab: no Korean left in '+lang);
  let L=await layout();ok(L.sw<=1&&L.bad.length===0,'draw tab: nothing spills out of the panel '+JSON.stringify({sw:L.sw,bad:L.bad}));
  await E(()=>{document.querySelector('.stk-odds').open=false;document.getElementById('stkBody').scrollTop=0;});await shot('stick_pull');
  // RNG sanity in the browser: 20 000 rolls without the pity
  const mc=await E(()=>{const P=window.__PH,o=P.stk(),p0=o.pity.b,c=[0,0,0,0,0];for(let i=0;i<20000;i++){o.pity.b=0;c[P.STK_M[P.stkRoll('b',0)].g]++;}o.pity.b=p0;return c.map(n=>n/200);});
  ok(mc.every((v,g)=>Math.abs(v-[50,30,14,5,1][g])<Math.max(1.2,[50,30,14,5,1][g]*.18)),'20 000 rolls in the browser follow 50/30/14/5/1 % ('+mc.map(v=>v.toFixed(1)).join('/')+')');
  // free draw → reveal → back button closes it
  const pts0=await E(()=>window.__PH.save.points);
  await E(()=>{document.querySelector('[data-sk=d1]').click();});await wait(1400);
  const f1=await E(()=>{const e=document.getElementById('stkFx');return {on:!!e&&e.classList.contains('on'),n:e?e.querySelectorAll('.stk-fxc').length:0,pts:window.__PH.save.points,free:window.__PH.stkFreeReady()};});
  ok(f1.on&&f1.n===1&&f1.pts===pts0&&!f1.free,'the free draw: one material revealed, no points spent, the free draw is used '+JSON.stringify(f1));
  const ag=await E(()=>{const t=document.getElementById('stkAgain').textContent,P=window.__PH;return {t,c:P.stkCostOf(1)};});
  ok(ag.c===30&&/30/.test(ag.t),'after the free draw, 한 번 더 shows the 30 P it will cost '+JSON.stringify(ag));
  const bk=await E(()=>{const r=window.phBack();const e=document.getElementById('stkFx');return {r,on:e.classList.contains('on'),ui:window.__PH.G.ui};});
  ok(bk.r==='ok'&&!bk.on&&bk.ui==='sStick','the back button closes the reveal and stays in the workshop '+JSON.stringify(bk));
  await E(()=>{document.querySelector('[data-sk=d10]').click();});await wait(2600);
  const f10=await E(()=>{const e=document.getElementById('stkFx'),P=window.__PH;const cs=[...e.querySelectorAll('.stk-fxc')];return {n:cs.length,pts:P.save.points,txt:e.innerText.slice(0,200)};});
  ok(f10.n===10&&f10.pts===pts0-30*9&&!hangul(f10.txt),'10 draws: ten materials revealed, 270 P spent '+JSON.stringify({n:f10.n,pts:f10.pts}));
  await E(()=>{document.querySelectorAll('#stkFx .stk-fxc').forEach(c=>c.style.animation='none');});await shot('stick_reveal');
  await E(()=>{document.getElementById('stkOk').click();});await wait(300);
  // ---------- craft ----------
  await E(()=>{document.querySelector('#stkTabs [data-t=craft]').click();});await wait(300);
  await E(()=>{document.querySelector('[data-sk=pick][data-id=s7]').click();});await wait(150);
  await E(()=>{document.querySelector('[data-sk=pick][data-id=b4]').click();});await wait(300);
  const c1=await E(()=>{const P=window.__PH,c=P.stkCalc({s:'s7',b:'b4',lv:0}),t=document.getElementById('stkBody').innerText;return {name:t.includes(c.name),ab:t.includes(P.stkAbDesc(c.ab)),cost:t.includes(P.stkCraftCost('s7','b4')+'P'),t:t.slice(0,300)};});
  ok(c1.name&&c1.ab&&c1.cost,'craft preview: the stick name, its ability text and the cost are the code’s '+JSON.stringify(c1).slice(0,200));
  L=await layout();ok(L.sw<=1&&L.bad.length===0&&!hangul(L.txt),'craft tab: nothing spills out, translated '+JSON.stringify({sw:L.sw,bad:L.bad}));
  await E(()=>{document.getElementById('stkBody').scrollTop=0;});await shot('stick_craft');
  // 남는 재료 팔기 (2026-11-15): the list opens, fits the panel, and a sale pays the shown price
  await E(()=>{const d=document.querySelector('.stk-sell');d.open=true;d.scrollIntoView({block:'start'});});await wait(250);
  L=await layout();ok(L.sw<=1&&L.bad.length===0&&!hangul(L.txt),'sell list: nothing spills out, translated '+JSON.stringify({sw:L.sw,bad:L.bad}));
  await shot('stick_sell');
  const sl=await E(()=>{const P=window.__PH,b=document.querySelector('[data-sk=sell1]'),id=b.dataset.id,n0=P.stk().m[id],p0=P.save.points,price=P.STK.refund[P.STK_M[id].g],shown=b.textContent.includes('+'+price+'P');
    window.__NOFX_=window.__NOFX;window.__NOFX=1;b.click();return {id,n0,p0,price,shown};});
  await wait(400);
  const sl2=await E(s=>{const P=window.__PH;window.__NOFX=window.__NOFX_;return {n:P.stk().m[s.id],p:P.save.points};},sl);
  ok(sl.shown&&sl2.n===sl.n0-1&&sl2.p===sl.p0+sl.price,'selling one '+sl.id+' pays the '+sl.price+' P on its button '+JSON.stringify({sl,sl2}));
  await E(()=>{document.getElementById('stkBody').scrollTop=0;});
  await E(()=>{document.querySelector('[data-sk=craft]').click();});await wait(500);
  const m1=await E(()=>{const P=window.__PH,o=P.stk(),x=o.list[o.list.length-1],t=document.getElementById('stkBody').innerText;return {n:o.list.length,eq:o.eq===x.u,tab:document.querySelector('#stkTabs .on').dataset.t,rate:t.includes(P.stkEnhRate(x)+'%'),u:x.u};});
  ok(m1.n===1&&m1.eq&&m1.tab==='mine'&&m1.rate,'crafted: one stick, equipped, the my-stick tab shows its upgrade rate '+JSON.stringify(m1));
  const up=await E(()=>{const R=Math.random;Math.random=()=>0;document.querySelector('[data-sk=up]').click();Math.random=R;const x=window.__PH.stkGet(window.__PH.stk().eq);return {lv:x.lv,msg:(document.querySelector('.stk-msg')||{}).innerText||''};});
  ok(up.lv===1&&/\+1/.test(up.msg),'upgrade: +1 and a message '+JSON.stringify(up));
  await wait(800);L=await layout();ok(L.sw<=1&&L.bad.length===0&&!hangul(L.txt),'my-stick tab: nothing spills out, translated '+JSON.stringify({sw:L.sw,bad:L.bad}));
  await shot('stick_mine');
  // the captain's 3D stick in a match
  const mt=await E(()=>{const P=window.__PH,G=P.G;P.startMatch({mode:'quick',size:3,time:120,diff:'normal',oppTypes:['basic','fast','king'],tag:'q'});for(let i=0;i<60*4&&G.state!=='play';i++)P.step(1/60);
    const cap=G.mine.skaters[0],x=P.stkEq(),geo=cap.pg.stick.children[0].geometry;return {tt:!!cap.tt,geo:geo===P.stkGeo(cap.team.key,x),mate:G.mine.skaters[1].pg.stick.children[0].geometry===geo};});
  ok(mt.tt&&mt.geo&&!mt.mate,'in a match the captain holds the crafted stick (its materials’ colours), the mates do not '+JSON.stringify(mt));
  await E(()=>{const P=window.__PH;P.G.view='menu';P.goScreen('sMenu');});await wait(400);
  // ---------- kit designer ----------
  await E(()=>{document.querySelector('#sMenu .hm-kit').click();});await wait(500);
  await E(()=>{document.querySelector('.kit-c[data-kt=c1][data-v="#18a058"]').click();});await wait(300);
  await E(()=>{document.querySelector('.kit-c[data-kt=c2][data-v="#ffd24a"]').click();});await wait(300);
  const k1=await E(()=>{const P=window.__PH;return {k:P.save.kit,col:P.TEAM.blue.color.toString(16),svg:document.querySelectorAll('#kitBody .kit-prev .kit-jer').length,txt:document.getElementById('kitBody').innerText};});
  ok(k1.k.on===1&&k1.k.c1==='#18a058'&&k1.k.c2==='#ffd24a'&&k1.col==='18a058'&&k1.svg===2,'kit: picking green + yellow turns the kit on and recolours our team '+JSON.stringify({k:k1.k,col:k1.col}));
  let img=0;for(let i=0;i<20&&!img;i++){await wait(500);img=await E(()=>{const i=document.querySelector('#kit3d img');return i&&i.complete&&i.naturalWidth>100?i.naturalWidth:0;});}
  ok(img>100,'kit: the 3D portrait of the captain in the new kit appears ('+img+' px)');
  L=await layout();ok(L.sw<=1&&L.bad.length===0&&!hangul(L.txt),'kit colour tab: nothing spills out, translated '+JSON.stringify({sw:L.sw,bad:L.bad}));
  await shot('kit_colours');
  await E(()=>{document.querySelector('[data-kt=tab][data-v=mas]').click();});await wait(300);
  await E(()=>{document.querySelector('.kit-opt[data-kt=mas][data-v=orca]').click();});await wait(300);
  await E(()=>{document.querySelector('[data-kt=tab][data-v=mas]').click();});await wait(1500);
  const k2=await E(()=>({mas:window.__PH.save.kit.mas,n:document.querySelectorAll('.kit-opt[data-kt=mas]').length}));
  ok(k2.mas==='orca'&&k2.n===12,'kit: 12 mascots, the orca picked '+JSON.stringify(k2));
  L=await layout();ok(L.sw<=1&&L.bad.length===0,'kit mascot tab: nothing spills out '+JSON.stringify({sw:L.sw,bad:L.bad}));
  await E(()=>{document.getElementById('kitBody').scrollTop=9999;});await shot('kit_mascots');
  await E(()=>{document.querySelector('[data-kt=tab][data-v=pat]').click();});await wait(400);
  L=await layout();ok(L.sw<=1&&L.bad.length===0&&!hangul(L.txt),'kit pattern tab: nothing spills out, translated '+JSON.stringify({sw:L.sw,bad:L.bad}));
  // the kit in a match: jersey material, score board, opponent stays red
  const km=await E(()=>{const P=window.__PH,G=P.G;P.startMatch({mode:'quick',size:3,time:120,diff:'normal',oppTypes:['basic','fast','king'],tag:'q'});for(let i=0;i<60*2;i++)P.step(1/60);
    let jk=false,jr=false;G.mine.skaters[0].pg.root.traverse(m=>{if(m.material&&m.material.map&&Object.entries(P.pkMatC).some(([k,v])=>v===m.material&&k.startsWith('jkblue')))jk=true;});
    G.mine.opp.skaters[0].pg.root.traverse(m=>{if(m.material&&Object.entries(P.pkMatC).some(([k,v])=>v===m.material&&/^jred/.test(k)))jr=true;});
    const bb=document.querySelector('#board .tm.b').style.background;return {jk,jr,bb:/24, 160, 88|18a058|rgb\(3[0-9], 1[67]/.test(bb)||bb.length>20,red:P.TEAM.red.color.toString(16)};});
  ok(km.jk&&km.jr&&km.bb&&km.red==='ff3b4e','in a match: our skaters wear the kit jersey, the opponents keep the red classic one, the score board takes our colour '+JSON.stringify(km));
  await E(()=>{const h=document.getElementById('hint');if(h)h.style.display='none';});await wait(2500);await shot('kit_match');
  await E(()=>{const P=window.__PH;P.G.view='menu';P.save.kit.on=0;P.goScreen('sMenu');});await wait(300);
  const off=await E(()=>({c:window.__PH.TEAM.blue.color.toString(16)}));ok(off.c==='2f7bff','kit off again: back to the standard blue');
  ok(logs.length===0,'no page errors '+logs.slice(0,3).join(' | '));
  console.log('TOTAL: '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('FAIL crash '+e.stack);process.exit(1);});
