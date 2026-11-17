// Debug: loads the game with the CURRENT v47_mascot.js and prints what a function (in a file) returns from inside the page.
// usage: node mscdbg.js <tag> <file.js with a function expression>
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));const TAG=process.argv[2]||'cut',KIND=process.argv[3]||'intro',TS=(process.argv[4]||'1,3,5').split(',').map(Number),MY=process.argv[5]||'narwhal',OPN=process.argv[6]||'Rival',MODE=process.argv[7]||'tall';
const VP={tall:{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true},pc:{width:1100,height:640},wide:{width:844,height:390,isMobile:true,hasTouch:true,isLandscape:true}}[MODE];
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(__dirname,'shots','msc');
const MK='/* ================= INIT ================= */';
function html(){let s=fs.readFileSync(path.join(ROOT,'penguin-hockey-improved.html'),'utf8');const j=s.indexOf('/*MSC:js*/'),k=s.indexOf('/*MSC:jsend*/');
  if(j>=0&&k>j)s=s.slice(0,j)+'/*MSC:js*/'+fs.readFileSync(path.join(ROOT,'v47_mascot.js'),'utf8')+s.slice(k);return s;}
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:VP});
  const p=await b.newPage();const logs=[];p.on('pageerror',e=>logs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED/.test(m.text()))logs.push(m.text().slice(0,200));});
  const URL='file://'+path.join(ROOT,'penguin-hockey-improved.html');
  await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();if(u.split('?')[0]===URL)return r.respond({status:200,contentType:'text/html; charset=utf-8',body:html()});if(u.startsWith('file:'))return r.continue();r.abort();});
  await p.evaluateOnNewDocument((my)=>{window.PH_NODAILY=1;window.PH_MASC=1;localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,news18:true,points:500,types:['basic','fast','strong','king'],type:'strong',team:'blue',tut:{done:true,asked:true},rl:{intro:1},
    kit:{on:1,c1:'#0d2f6b',c2:'#ffd24a',pat:'chevron',crest:'shield',mas:my},set:{quality:'ultra',tod:'day',cond:false,events:false,items:false,rules:'off'}}));},MY);
  await p.goto(URL,{waitUntil:'load'});await wait(2500);
  console.log(JSON.stringify(await p.evaluate('('+fs.readFileSync(process.argv[3],'utf8')+')()'),null,1).slice(0,6000));
  if(logs.length)console.log('LOGS',logs.slice(0,6).join('\n'));await b.close();})();
