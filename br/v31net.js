// v31 in a real browser: two players on two separate browser profiles play a friend match through the Firebase
// emulators (auth :9099, database :9000). Real taps on 방 만들기 / 참가, the code typed in, WebRTC data channel (or the
// database relay with RELAY=1), the friend's keyboard moves the red penguin on the host, goals / clock / skills /
// result reach the friend, leaving ends the match for both.  usage: [RELAY=1] node v31net.js [pc|tall]
// needs: cd firebase && firebase emulators:start --project demo-ph --only auth,database
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const mode=process.argv[2]||'pc',RELAY=!!process.env.RELAY;
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1}}[mode];
const CFG={apiKey:'fake-key',dbUrl:'http://127.0.0.1:9000',ns:'demo-ph-default-rtdb',authBase:'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1',
  tokenBase:'http://127.0.0.1:9099/securetoken.googleapis.com/v1',ice:[],forceRelay:RELAY};
const ALL=['basic','balanced','fast','defense','strong','king','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos','auk'];
const mkSave=(type,squad,name)=>JSON.stringify({v:10,news18:true,points:900,types:ALL,type,squad,tut:{done:true,asked:true},hat:'none',rl:{intro:1},
  profile:{name},set:{quality:'low',cond:false,events:false,items:false,rules:'full',cine:'full',tod:'day',motion:false}});
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args.filter(a=>!/single-process|no-zygote/.test(a)),'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist',
    '--disable-features=WebRtcHideLocalIpsWithMdns','--allow-loopback-in-peer-connection'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const logs=[];
  const open=async(tag,save)=>{
    const ctx=await browser.createBrowserContext();const page=await ctx.newPage();
    page.on('pageerror',e=>logs.push(tag+' PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/net::ERR|Failed to load resource/.test(m.text()))logs.push(tag+' CONSOLE '+m.text().slice(0,200));});
    await page.setRequestInterception(true);
    page.on('request',r=>{const u=r.url();
      if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'node_modules/three/build/three.min.js'))});
      if(u.startsWith('file:')||u.startsWith('http://127.0.0.1:'))return r.continue();r.abort();});
    await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument((s,cfg)=>{window.requestAnimationFrame=()=>0;window.PH_NETCFG=cfg;localStorage.setItem('penguinHockey.v1',s);},save,CFG);
    await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html')+'?lang=ko',{waitUntil:'load'});await wait(2500);
    return page;
  };
  const A=await open('host',mkSave('king',['basic','fast'],'호스트')),B=await open('guest',mkSave('macaroni',['auk','little'],'게스트'));
  const EA=(f,...a)=>A.evaluate(f,...a),EB=(f,...a)=>B.evaluate(f,...a);
  const tap=async(pg,sel)=>{const b=await pg.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};},sel);
    if(!b)return false;if(VP.hasTouch)await pg.touchscreen.tap(b.x,b.y);else await pg.mouse.click(b.x,b.y);return true;};
  const until=async(pg,f,ms,arg)=>{const t0=Date.now();while(Date.now()-t0<ms){if(await pg.evaluate(f,arg))return true;await wait(150);}return false;};
  // ---- lobby: 경기 모드 → 친구 대전 → 방 만들기 ----
  await EA(()=>window.__PH.goScreen('sMode'));await wait(300);
  ok(await tap(A,'#modeFriend'),'경기 모드 has a 친구 대전 card');await wait(400);
  ok(await EA(()=>window.__PH.G.ui==='sFriend'&&!!document.getElementById('frHost')),'친구 대전 screen with 방 만들기 (server configured)');
  await tap(A,'#frHost');
  ok(await until(A,()=>window.__PH.NET.st==='wait'&&/^[A-Z2-9]{6}$/.test((document.getElementById('frCodeShow')||{}).textContent||''),15000),'host: a 6-letter code is shown');
  const code=await EA(()=>document.getElementById('frCodeShow').textContent);console.log('code',code);
  // ---- the friend types the code ----
  await EB(()=>window.__PH.goScreen('sFriend'));await wait(300);
  await tap(B,'#frCode');await B.keyboard.type(code.toLowerCase());
  ok(await EB(()=>document.getElementById('frCode').value)===code,'code field upper-cases what is typed');
  await tap(B,'#frJoin');
  const t0=Date.now();
  const both=await (async()=>{while(Date.now()-t0<40000){const a=await EA(()=>window.__PH.NET.st+'/'+window.__PH.G.net),b=await EB(()=>window.__PH.NET.st+'/'+window.__PH.G.net);if(a==='play/host'&&b==='play/guest')return true;await wait(200);}return false;})();
  ok(both,'connected and the match started on both devices in '+((Date.now()-t0)/1000).toFixed(1)+' s ('+(RELAY?'database relay':'peer to peer')+')');
  if(!both){console.log(JSON.stringify(await EA(()=>({st:window.__PH.NET.st,msg:window.__PH.NET.msg}))),JSON.stringify(await EB(()=>({st:window.__PH.NET.st,msg:window.__PH.NET.msg}))));console.log(logs.slice(0,8).join('\n'));await browser.close();process.exit(1);}
  const tr=await EA(()=>({relay:window.__PH.NET.relay,p2p:!!(window.__PH.NET.rel&&window.__PH.NET.rel.readyState==='open')}));
  ok(RELAY?tr.relay:tr.p2p,'transport: '+JSON.stringify(tr));
  const types=await Promise.all([EA(()=>window.__PH.G.pengs.map(p=>p.team.key+':'+p.type).join(',')),EB(()=>window.__PH.G.pengs.map(p=>p.team.key+':'+p.type).join(','))]);
  ok(types[0]===types[1]&&/blue:king/.test(types[0])&&/red:macaroni/.test(types[0]),'both devices build the same teams: '+types[0]);
  ok(await EA(()=>{const G=window.__PH.G;return G.mine===G.teams.blue&&G.teams.red.skaters[0].remote&&!G.teams.red.skaters[0].human;}),'host: blue is mine, red skater 1 is the remote human');
  ok(await EB(()=>{const G=window.__PH.G;return G.mine===G.teams.red&&G.player===G.teams.red.skaters[0];}),'friend: red is mine, steering red skater 1');
  ok(await EA(()=>{const G=window.__PH.G;return G.teams.blue.goalie.type===G.teams.red.goalie.type;}),'both goalies the same type (fair)');
  // ---- pump both games (time steps by hand; the network runs in real time) ----
  const pump=async(sec)=>{const n=Math.round(sec*20);for(let i=0;i<n;i++){await EA(()=>{const P=window.__PH;for(let k=0;k<3;k++)P.step(1/60);});await EB(()=>{const P=window.__PH;for(let k=0;k<3;k++)P.step(1/60);});await wait(RELAY?40:15);}};
  await pump(3.6);
  const st=await Promise.all([EA(()=>window.__PH.G.state),EB(()=>window.__PH.G.state)]);ok(st[0]==='play'&&st[1]==='play','countdown over on both: '+st.join('/'));
  // ---- the friend holds right: the red penguin moves on the host, and the friend sees it ----
  // whichever red penguin the friend steers (auto switching may change it), it skates right while the key is held
  await B.keyboard.down('KeyD');let vx=0,nv=0,rinX=0;
  for(let i=0;i<30;i++){await pump(.05);const r=await EA(()=>({vx:window.__PH.NET.rp.vx,x:window.__PH.NET.rin.x}));if(i>=10){vx+=r.vx;nv++;}rinX=Math.max(rinX,r.x);}
  await B.keyboard.up('KeyD');
  ok(rinX===1&&vx/nv>2,'friend pressed right → the host gets it (x='+rinX+') and the red penguin skates right ('+(vx/nv).toFixed(2)+' m/s on average)');
  await pump(.6);const gi=await EB(()=>{const G=window.__PH.G;return [G.pengs.indexOf(G.player),G.player.x];}),gx2=gi[1],hx=await EA(i=>window.__PH.G.pengs[i].x,gi[0]);   // the same penguin on both (auto switching can move the friend to another one)
  ok(Math.abs(hx-gx2)<1.6,'the friend sees it where the host has it (host '+hx.toFixed(2)+', friend '+gx2.toFixed(2)+')');
  const clk=await Promise.all([EA(()=>window.__PH.G.timeLeft),EB(()=>window.__PH.G.timeLeft)]);ok(Math.abs(clk[0]-clk[1])<.6,'clock in sync: '+clk.map(x=>x.toFixed(1)).join(' / '));
  // ---- a skill from the friend: counters, so the one press arrives once ----
  const cd0=await EA(()=>{const N=window.__PH.NET;for(const q of window.__PH.G.teams.red.skaters)q.cd.special=0;window.__rp0=N.rp;return 0;});await B.keyboard.press('KeyQ');await pump(.8);
  const sk=await EA(()=>({cd:Math.max(window.__rp0.cd.special,window.__PH.NET.rp.cd.special),seen:window.__PH.NET.rseen[4]}));   // the penguin the friend steered at the press, or the one it steers now
  if(!(sk.seen===1&&sk.cd>cd0))console.log('DBG skill',JSON.stringify(await EA(()=>({rin:window.__PH.NET.rin,rseen:window.__PH.NET.rseen,relay:window.__PH.NET.relay}))),JSON.stringify(await EB(()=>({cnt:window.__PH.NET.cnt,relay:window.__PH.NET.relay,rt:window.__PH.NET.rt,rbusy:window.__PH.NET.rbusy}))));
  ok(sk.seen===1&&sk.cd>.5,'friend pressed Q once → the host used the red skill once (cooldown '+sk.cd.toFixed(1)+' s)');
  // ---- host scores: the friend sees the goal and the score ----
  await EA(()=>{const G=window.__PH.G;G.puck.x=G.puck.ox=26;G.puck.z=G.puck.oz=0;G.puck.vx=4;G.puck.vz=0;});await pump(.5);
  const sc=await Promise.all([EA(()=>window.__PH.G.teams.blue.score+':'+window.__PH.G.teams.red.score),EB(()=>window.__PH.G.teams.blue.score+':'+window.__PH.G.teams.red.score+' '+window.__PH.G.state+' '+document.getElementById('sB').textContent)]);
  ok(sc[0]==='1:0'&&sc[1].startsWith('1:0 goal 1'),'goal on the host → friend sees 1:0, the goal state and the scoreboard ('+sc.join(' | ')+')');
  await pump(4.5);
  ok(await EB(()=>window.__PH.G.state==='play'||window.__PH.G.state==='ready'),'friend back to the faceoff after the goal');
  // ---- the end: host clock runs out → both get their result ----
  await EA(()=>{window.__PH.G.timeLeft=.05;});await pump(4);
  const res=await Promise.all([EA(()=>window.__PH.G.result&&[window.__PH.G.result.win,window.__PH.G.result.ms,window.__PH.G.result.os]),EB(()=>window.__PH.G.result&&[window.__PH.G.result.win,window.__PH.G.result.ms,window.__PH.G.result.os])]);
  if(!res[1])console.log('DBG over',JSON.stringify(await EB(()=>{const N=window.__PH.NET,S=N.snaps;return {n:S.length,last:S.length?S[S.length-1].st:null,lastHt:S.length?S[S.length-1].ht:0,applied:N.applied,st:N.st,gstate:window.__PH.G.state};})),JSON.stringify(await EA(()=>({st:window.__PH.NET.st,g:window.__PH.G.state,rt:window.__PH.NET.rt,rbusy:window.__PH.NET.rbusy,now:Math.round(performance.now())}))));
  ok(res[0]&&res[1]&&res[0][0]===true&&res[1][0]===false&&res[1][1]===0&&res[1][2]===1,'match over on both: host '+JSON.stringify(res[0])+' friend '+JSON.stringify(res[1]));
  await EA(()=>{const P=window.__PH;for(let k=0;k<200;k++)P.step(1/60);});await EB(()=>{const P=window.__PH;for(let k=0;k<200;k++)P.step(1/60);});await wait(300);
  const rb=await EB(()=>[...document.querySelectorAll('#rBtns button')].map(b=>b.textContent).join('|'));
  ok(/친구 대전/.test(rb)&&!/다시 하기/.test(rb),'result screen offers 👥 친구 대전 (not a solo replay): '+rb);
  await B.screenshot({path:path.join(__dirname,'shots','v31_'+mode+(RELAY?'_relay':'')+'_result.jpg'),type:'jpeg',quality:80});
  // ---- a second match, then the friend leaves in the middle ----
  await EA(()=>{const P=window.__PH;P.netClose();P.goScreen('sFriend');});await EB(()=>{const P=window.__PH;P.netClose();P.goScreen('sFriend');});await wait(500);
  await tap(A,'#frHost');await until(A,()=>window.__PH.NET.st==='wait',15000);const code2=await EA(()=>window.__PH.NET.code);
  ok(code2&&code2!==code,'a new room gets a new code ('+code2+')');
  await EB(c=>{document.getElementById('frCode').value=c;},code2);await tap(B,'#frJoin');
  ok(await until(A,()=>window.__PH.NET.st==='play',40000)&&await until(B,()=>window.__PH.NET.st==='play',20000),'second match connects');
  await pump(1);await EB(()=>{const P=window.__PH;P.NET.st='play';window.__PH.netClose();});await pump(1.5);
  const left=await EA(()=>({res:!!window.__PH.G.result,st:window.__PH.NET.st,ban:document.getElementById('banner').textContent}));
  ok(left.res&&left.st==='done'&&/떠났어요/.test(left.ban),'friend left → the host gets the result at once and is told why ('+JSON.stringify(left)+')');
  // ---- errors: a code that does not exist ----
  await EB(()=>{window.__PH.netClose();window.__PH.goScreen('sFriend');});await wait(300);
  await EB(()=>{document.getElementById('frCode').value='ZZZZ22';});await tap(B,'#frJoin');
  ok(await until(B,()=>window.__PH.NET.st==='err'&&/찾을 수 없어요/.test(document.getElementById('frBody').textContent),15000),'unknown code → a clear message');
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.slice(0,5).join(' | '):''));
  console.log('TOTAL v31net '+mode+(RELAY?' relay':'')+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.stack);process.exit(2);});
