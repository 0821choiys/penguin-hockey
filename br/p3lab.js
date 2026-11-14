// Card-art lab: the 3D portraits and the cards built from them, with the CURRENT v41_card.js / v41_card.css swapped into the
// built game (no rebuild needed while iterating).  usage: node p3lab.js <sheet|big|cards|all> [tag] [keys] [team]
//   sheet → shots/p3/<tag>_sheet.png   every species' portrait on light / dark backing
//   big   → shots/p3/<tag>_big.png     a few portraits at 1:1
//   cards → shots/p3/<tag>_cards.png   real cards (cardHtml) in three sizes, every rarity
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const what=process.argv[2]||'all',TAG=process.argv[3]||'lab',KEYS=(process.argv[4]||'').split(',').filter(Boolean),TEAM=process.argv[5]||'blue';
const ROOT=path.resolve(__dirname,'..');
const FS=path.resolve(__dirname,'node_modules/@fontsource');
const fontCss=u=>{const f=[];if(/Fredoka|Jua/.test(u))f.push('jua/index.css','fredoka/500.css','fredoka/700.css');
  return f.map(x=>{const pkg=x.split('/')[0];return fs.readFileSync(path.join(FS,x),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');};
const ALL=['basic','fast','little','balanced','african','humboldt','magellanic','defense','macaroni','fiordland','galapagos','royal','yelloweye','strong','king','auk'];
const lv={};ALL.forEach((k,i)=>lv[k]=1+(i*3)%10);
const SAVE=JSON.stringify({v:10,news18:true,points:900,types:ALL,type:'strong',team:TEAM,lv,tut:{done:true,asked:true},hat:'none',rl:{intro:1},brk:{king:5,royal:2,basic:1},
  set:{quality:process.env.Q||'ultra',cond:false,events:false,items:false,rules:'off',cine:'off',tod:'day',lang:'ko'}});
const OUT=path.join(__dirname,'shots','p3');fs.mkdirSync(OUT,{recursive:true});
function html(){   // the built game with the current patch sources swapped in
  let s=fs.readFileSync(path.join(ROOT,'penguin-hockey-improved.html'),'utf8');
  const sw=(a,b,f)=>{const i=s.indexOf(a),j=s.indexOf(b);if(i<0||j<0)throw new Error('marker '+a+' missing: rebuild with v41 registered');s=s.slice(0,i+a.length)+fs.readFileSync(path.join(ROOT,f),'utf8')+s.slice(j);};
  sw('/*P3:js*/','/*P3:jsend*/','v41_card.js');if(s.includes('/*PKM:js*/'))sw('/*PKM:js*/','/*PKM:jsend*/','v43_model.js');sw('/*P3:css*/','/*P3:cssend*/','v41_card.css');return s;
}
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:1500,height:1000,deviceScaleFactor:1}});
  const page=await browser.newPage();const logs=[];
  page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error')logs.push('CONSOLE '+m.text().slice(0,300));});
  await page.setRequestInterception(true);
  const URL='file://'+path.join(ROOT,'penguin-hockey-improved.html');
  page.on('request',r=>{const u=r.url();
    if(u.split('?')[0]===URL)return r.respond({status:200,contentType:'text/html; charset=utf-8',body:html()});
    if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss(decodeURIComponent(u))});
    if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}
    if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});
  await page.evaluateOnNewDocument(s=>{localStorage.setItem('penguinHockey.v1',s);},SAVE);
  await page.goto(URL+'?lang=ko',{waitUntil:'load'});await wait(2600);
  const E=(f,...a)=>page.evaluate(f,...a);
  await E(()=>{window.requestAnimationFrame=()=>0;});
  const t0=Date.now();
  const info=await E(keys=>{const P=window.__PH,r={};const t=performance.now();for(const k of keys){const a=performance.now();const u=P.p3Url(k);r[k]={ok:!!u,kb:+(u.length*.75/1024).toFixed(1),ms:Math.round(performance.now()-a),type:u.slice(5,15)};}
    return {r,total:Math.round(performance.now()-t),fail:P.P3.fail,err:P.P3.err||''};},ALL);
  console.log('portraits:',Object.entries(info.r).map(([k,v])=>k+' '+(v.ok?v.kb+'KB '+v.ms+'ms':'FAIL')).join(', '));
  console.log('total',info.total,'ms; fail',info.fail,info.err,'| avg KB',(Object.values(info.r).reduce((a,v)=>a+v.kb,0)/ALL.length).toFixed(1));
  const stage=async(inner,w,h,bg)=>{await E((inner,bg)=>{let d=document.getElementById('lab');if(!d){d=document.createElement('div');d.id='lab';document.body.appendChild(d);}
    d.style.cssText='position:fixed;inset:0;z-index:99999;overflow:hidden;padding:14px;box-sizing:border-box;display:flex;flex-wrap:wrap;gap:10px;align-content:flex-start;'+bg;d.innerHTML=inner;},inner,bg||'background:#0d2140');
    await page.setViewport({width:w,height:h,deviceScaleFactor:1});await wait(350);};
  if(what==='sheet'||what==='all'){
    const cells=await E(keys=>{const P=window.__PH;return keys.map((k,i)=>'<div style="width:208px;height:260px;border-radius:10px;position:relative;background:'+(i%2?'linear-gradient(180deg,#f2f9ff,#bcd9f0)':'radial-gradient(circle at 50% 40%,#2f6fc0,#0b1f44 78%)')+'"><i class="p3 p3-'+k+'" style="position:absolute;inset:0"></i><b style="position:absolute;left:6px;top:4px;font:12px sans-serif;color:'+(i%2?'#123':'#fff')+'">'+k+' g'+P.rarCls(k)+'</b></div>').join('');},ALL);
    await stage(cells,1780,580);await page.screenshot({path:path.join(OUT,TAG+'_sheet.png')});
  }
  if(what==='big'||what==='all'){
    const ks=KEYS.length?KEYS:['king','macaroni','basic'];
    const cells=ks.map((k,i)=>'<div style="width:416px;height:520px;border-radius:14px;position:relative;background:'+(i%2?'linear-gradient(180deg,#f2f9ff,#bcd9f0)':'radial-gradient(circle at 50% 40%,#2f6fc0,#0b1f44 78%)')+'"><i class="p3 p3-'+k+'" style="position:absolute;inset:0"></i></div>').join('');
    await stage(cells,14+ks.length*426+14,560);await page.screenshot({path:path.join(OUT,TAG+'_big.png')});
  }
  if(what==='cards'||what==='all'){
    const cells=await E(keys=>{const P=window.__PH;let h='';
      h+='<div style="display:flex;flex-wrap:wrap;gap:12px;width:100%">'+keys.map(k=>P.cardHtml(k,{cw:150})).join('')+'</div>';
      h+='<div style="display:flex;flex-wrap:wrap;gap:8px;width:100%">'+keys.map(k=>P.cardHtml(k,{cw:92})).join('')+'</div>';
      h+='<div style="display:flex;flex-wrap:wrap;gap:6px;width:100%">'+keys.map(k=>P.cardHtml(k,{cw:60})).join('')+'<span style="width:20px"></span>'+['little','royal'].map(k=>P.sil18(k,92)).join('')+P.cardHtml('king',{cw:92,tag:'NEW'})+P.cardHtml('basic',{cw:92,count:3,cls:'dim'})+'</div>';
      return h;},ALL);
    await stage(cells,1340,860,'background:linear-gradient(180deg,#123a66,#0a2445)');await page.screenshot({path:path.join(OUT,TAG+'_cards.png')});
  }
  console.log('done in',Date.now()-t0,'ms; errors',logs.length,logs.slice(0,4).join(' | '));
  await browser.close();process.exit(0);
})().catch(e=>{console.log('CRASH',e);process.exit(1);});
