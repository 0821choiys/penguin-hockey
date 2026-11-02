const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const FS=path.resolve('node_modules/@fontsource');
const fontCss=()=>['jua/index.css','fredoka/500.css','fredoka/700.css'].map(f=>{const pkg=f.split('/')[0];return fs.readFileSync(path.join(FS,f),'utf8').replace(/url\(\.\/files\//g,'url(https://fonts.gstatic.com/__fs/'+pkg+'/files/');}).join('\n');
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:390,height:844,isMobile:true,hasTouch:true}});
const p=await b.newPage();await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});
 if(u.startsWith('https://fonts.googleapis.com/'))return r.respond({status:200,contentType:'text/css',body:fontCss()});if(u.startsWith('https://fonts.gstatic.com/__fs/')){const rel=u.split('/__fs/')[1];return r.respond({status:200,contentType:'font/woff2',body:fs.readFileSync(path.join(FS,rel))});}if(u.startsWith('file:'))return r.continue();r.abort();});
await p.evaluateOnNewDocument(()=>localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,points:500,types:['basic'],type:'basic',tut:{done:true,asked:true}})));
await p.goto('file://'+path.resolve('../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2500);await p.evaluate(()=>document.fonts.ready);
console.log(await p.evaluate(()=>{const b=document.createElement('button');b.dataset.go='sSet';document.body.appendChild(b);b.click();b.remove();
 const body=document.querySelector('#sSet .pbody');const br=body.getBoundingClientRect(),cs=getComputedStyle(body),inner=br.right-parseFloat(cs.paddingRight);
 const out=['pbody '+Math.round(br.left)+'..'+Math.round(br.right)+' inner right '+Math.round(inner)+' scrollW '+body.scrollWidth+' clientW '+body.clientWidth];
 for(const e of body.querySelectorAll('*')){const r=e.getBoundingClientRect();if(r.width&&r.right>br.right-1)out.push((e.tagName+'.'+e.className+'#'+e.id).slice(0,40)+' right '+Math.round(r.right)+' w '+Math.round(r.width)+' "'+(e.innerText||'').slice(0,20).replace(/\n/g,' ')+'"');}
 const g=document.getElementById('codeGo'),gr=g.getBoundingClientRect(),i=document.getElementById('codeIn').getBoundingClientRect();out.push('codeGo '+Math.round(gr.width)+'x'+Math.round(gr.height)+' right '+Math.round(gr.right)+' lines '+(gr.height>40?2:1)+' | codeIn '+Math.round(i.width));return out.slice(0,20).join('\n');}));await b.close();})();
