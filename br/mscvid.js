// Cut-scene video: like msccut.js, but records every frame at a fixed rate and encodes an mp4 (ffmpeg) — to judge how smooth the motion is.
// usage: node mscvid.js <tag> <intro|end:win|end:lose|end:draw> <seconds|all> [my mascot] [opp name | @mascot] [mode] [fps]  → shots/msc/<tag>.mp4
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));const TAG=process.argv[2]||'cut',KIND=process.argv[3]||'intro',DUR=process.argv[4]||'all',FPS=+(process.argv[8]||30),MY=process.argv[5]||'narwhal',OPN=process.argv[6]||'Rival',MODE=process.argv[7]||'tall';
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
  const r=await p.evaluate((KIND,OPN)=>{const P=window.__PH,G=P.G;window.requestAnimationFrame=()=>0;
    if(KIND.startsWith('pv:')){const [,mas,res]=KIND.split(':');P.goScreen('sKit');P.mascPreview(mas,res);}
    else{P.startMatch({mode:'quick',size:3,time:60,diff:'normal',oppTypes:['basic','fast','king'],tag:'q',oppName:OPN,label:'vs '+OPN});
      const pr=OPN[0]==='@'?{mine:'blue',oth:'red',my:P.kit().mas,op:OPN.slice(1)}:null;   // '@seal' forces the other mascot
      if(KIND.startsWith('end')){P.mascClear();const res=KIND.split(':')[1];G.result={win:res==='win',draw:res==='draw',ms:2,os:1,note:''};G.state='over';if(pr)P.mascStart('end',G.cfg,{pair:pr,res,cb:()=>{}});else P.mascOutro(()=>{});}
      else if(pr){P.mascClear();P.mascStart('intro',G.cfg,{pair:pr});const M=G.masc;if(M&&M.quick){M.quick=false;M.dur=P.MSC.intro;for(const R of[M.A,M.B])if(R.pool)R.pool.userData.open=0;}}}   // a forced pair always gets the full entrance
    return {masc:!!G.masc,kind:G.masc&&G.masc.kind,quick:G.masc&&G.masc.quick,dur:G.masc&&G.masc.dur,pair:G.masc&&G.masc.pr};},KIND,OPN);
  console.log(JSON.stringify(r));const dir=path.join(OUT,TAG+'_frames');fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  const end=DUR==='all'?(r.dur||7.4):+DUR;let i=0;
  for(let t=0;t<=end+1e-6;t+=1/FPS,i++){if(i)await p.evaluate(dt=>{const P=window.__PH;let left=dt;while(left>1e-6){const d=Math.min(1/30,left);P.step(d);left-=d;}P.gfxRender();},1/FPS);else await p.evaluate(()=>window.__PH.gfxRender());
    if(i%15===0)await p.evaluate(()=>{for(const a of document.getAnimations())try{a.finish();}catch(e){}});
    await p.screenshot({path:path.join(dir,'f'+String(i).padStart(4,'0')+'.jpg'),type:'jpeg',quality:86});}
  require('child_process').execSync('ffmpeg -y -loglevel error -framerate '+FPS+' -i '+path.join(dir,'f%04d.jpg')+' -c:v libx264 -preset veryfast -crf 22 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" '+path.join(OUT,TAG+'.mp4'));
  console.log('frames',i,'→',path.join(OUT,TAG+'.mp4'));
  console.log('masc still on:',await p.evaluate(()=>!!window.__PH.G.masc),'state',await p.evaluate(()=>window.__PH.G.state));
  if(logs.length)console.log('LOGS',logs.slice(0,6).join('\n'));await b.close();})();
