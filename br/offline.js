// The bundled build boots with NO network at all: every http(s) request is refused (fonts included), the 3D library must
// come from inside the file. usage: node offline.js <pc|tall>
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));const mode=process.argv[2]||'pc';
const VP={pc:{width:1000,height:620},tall:{width:390,height:844,isMobile:true,hasTouch:true}}[mode];
let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m);};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const page=await browser.newPage();const logs=[],net=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/ERR_|net::|Failed to load resource/.test(m.text()))logs.push('CONSOLE '+m.text().slice(0,160));});
  await page.setRequestInterception(true);page.on('request',r=>{const u=r.url();if(u.startsWith('file:')||u.startsWith('data:')||u.startsWith('blob:'))return r.continue();net.push(u.slice(0,90));r.abort('internetdisconnected');});
  const t0=Date.now();
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html'),{waitUntil:'load'});
  let up=false;for(let i=0;i<40&&!up;i++){await wait(250);up=await page.evaluate(()=>!!(window.__PH&&window.THREE));}
  const boot=Date.now()-t0;
  const st=await page.evaluate(()=>({rev:THREE.REVISION,load:getComputedStyle(document.getElementById('loading')).display,fb:getComputedStyle(document.getElementById('fallback')).display,home:!!document.querySelector('.screen.on')}));
  ok(up&&st.rev==='128','game booted with three.js r'+st.rev+' from inside the file ('+boot+' ms to ready, headless PC)');
  ok(st.load==='none'&&st.fb==='none'&&st.home,'loading screen gone, no "could not load 3D library" screen, home is showing');
  ok(!net.some(u=>/three/.test(u)),'no request for three.js was made');
  await page.evaluate(()=>{const P=window.__PH;P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'Q'});});await wait(2500);
  const g=await page.evaluate(()=>({st:window.__PH.G.state,t:window.__PH.G.t}));
  ok(['ready','play'].includes(g.st),'a match starts and runs offline ('+g.st+')');
  await page.screenshot({path:path.join(__dirname,'shots','offline_'+mode+'.jpg'),type:'jpeg',quality:75});
  ok(logs.length===0,'no page errors'+(logs.length?': '+logs.join(' | '):''));
  console.log('   refused network requests (all optional): '+(net.length?[...new Set(net.map(u=>u.split('/')[2]))].join(', '):'none'));
  const size=require('fs').statSync(path.resolve(__dirname,'../penguin-hockey-improved.html')).size;ok(size<=2*1024*1024,'file size '+size+' bytes ≤ 2 MB');
  console.log('TOTAL offline '+mode+': '+pass+' passed, '+fail+' failed');await browser.close();process.exit(fail?1:0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});
