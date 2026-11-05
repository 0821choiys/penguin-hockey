// Model smoothness A/B: the same penguins built fresh on 높음 and on 최고, same camera, same pose, studio view on the ice.
// usage: node modelab.js   → shots/gfx/model_high.png, model_ultra.png
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));const OUT=path.join(__dirname,'shots','gfx');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:900,height:600}});
  const p=await b.newPage();const logs=[];p.on('pageerror',e=>logs.push(e.message));
  await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();if(u.startsWith('file:'))return r.continue();if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'node_modules/three/build/three.min.js'))});r.abort();});
  await p.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await p.evaluateOnNewDocument(()=>{window.requestAnimationFrame=()=>0;localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,news18:true,tut:{done:true,asked:true},set:{quality:'high',tod:'day'}}));});
  await p.goto('file://'+path.resolve(__dirname,'../penguin-hockey-improved.html'),{waitUntil:'load'});await wait(2500);
  for(const q of['high','ultra']){
    await p.evaluate(q=>{const P=window.__PH,T=window.THREE;P.save.set.quality=q;P.applyQuality();
      document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));
      if(window.__ab)for(const o of window.__ab)P.scene.remove(o);window.__ab=[];
      const ks=['king','macaroni','fast'];ks.forEach((k,i)=>{const g=P.buildPenguin(k,i===1?'red':'blue','none',{num:7+i});g.root.position.set(-2.2+i*2.2,0,0);g.root.rotation.y=.5-i*.35;P.scene.add(g.root);window.__ab.push(g.root);});
      const c=P.camera;c.position.set(0,1.9,5.2);c.lookAt(0,.95,0);c.fov=40;c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();
      for(let i=0;i<3;i++)P.shFit&&P.shFit();P.renderer.render(P.scene,c);},q);
    await wait(150);await p.screenshot({path:path.join(OUT,'model_'+q+'.png')});
    const n=await p.evaluate(()=>{let v=0;for(const r of window.__ab)r.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.position)v+=o.geometry.attributes.position.count;});return v;});
    console.log(q,'vertices in the 3 penguins:',n);
  }
  console.log(logs.length?'ERR '+logs.slice(0,3).join(' | '):'ok');await b.close();})();
