// goalie portrait lab: renders the goalie card portraits with the CURRENT build, trying GKD.mask settings from argv (JSON list) → shots/gk/lab_<i>.png
// usage: node gklab.js '[[-1,.05,-.04],[-.6,.12,-.02]]' [species,...]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const masks=JSON.parse(process.argv[2]||'[[-1,.05,-.04]]'),sps=(process.argv[3]||'defense,royal,strong,little').split(',');
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:600,height:600},protocolTimeout:900000});
  const page=await browser.newPage();await page.setRequestInterception(true);page.on('request',r=>r.url().startsWith('file:')?r.continue():r.abort());
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,tut:{done:true,asked:true},set:{quality:'low',masc:'off'}}));});
  await page.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2500);
  const OUT=path.join(__dirname,'shots','gk');fs.mkdirSync(OUT,{recursive:true});
  for(let i=0;i<masks.length;i++){
    const urls=await page.evaluate((m,sps)=>{const P=window.__PH;P.GKD.mask=m;return sps.map(sp=>{P.P3.gk={};return P.gkUrl(sp);});},masks[i],sps);
    for(let j=0;j<urls.length;j++)if(urls[j])fs.writeFileSync(path.join(OUT,'lab_'+i+'_'+sps[j]+'.webp'),Buffer.from(urls[j].split(',')[1],'base64'));
    console.log('mask',JSON.stringify(masks[i]),urls.map(u=>u?u.length:0).join(' '));
  }
  await browser.close();
})();
