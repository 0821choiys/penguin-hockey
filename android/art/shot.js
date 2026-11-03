const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({deviceScaleFactor:1});
const fs=require('fs');
async function r(svg,out,sz,round){await pg.setViewportSize({width:sz,height:sz});await pg.setContent(`<html><body style="margin:0;background:transparent">${fs.readFileSync(svg,'utf8').replace(/width="432" height="432"/,`width="${sz}" height="${sz}"`)}</body></html>`);
 await pg.screenshot({path:out,omitBackground:true,clip:{x:0,y:0,width:sz,height:sz}});}
const D={mdpi:1,hdpi:1.5,xhdpi:2,xxhdpi:3,xxxhdpi:4};const R='../app/src/main/res/';
for(const [n,k] of Object.entries(D)){fs.mkdirSync(R+'mipmap-'+n,{recursive:true});
 await r('fg.svg',R+'mipmap-'+n+'/ic_launcher_foreground.png',108*k);await r('bg.svg',R+'mipmap-'+n+'/ic_launcher_background.png',108*k);
 await r('full.svg',R+'mipmap-'+n+'/ic_launcher.png',48*k);}
await r('full.svg','store_icon_512.png',512);await r('full.svg','preview.png',432);
await b.close();})();
