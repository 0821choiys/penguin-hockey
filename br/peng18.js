// species photo booth: one close-up per species (+ optional lineup). usage:
//   KEYS=basic,king HATS=none,beanie VIEW=front|three4|side|back node peng18.js <prefix> [html]
// writes peng/<prefix>_<key>_<hat>_<view>.png (400x400 crops) and peng/<prefix>_lineup.png
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const pre=process.argv[2]||'s18',HTML=process.argv[3]||'../penguin-hockey-improved.html';
const KEYS=(process.env.KEYS||'basic,fast,strong,defense,balanced').split(','),HATS=(process.env.HATS||'none').split(','),VIEWS=(process.env.VIEW||'three4').split(',');
const LINEUP=process.env.LINEUP==='1';
(async()=>{
  const W=520,H=560;
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:W,height:H}});
  const page=await browser.newPage();const logs=[];page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|vibrate/.test(m.text()))logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(q=>localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,points:500,types:['basic'],type:'basic',tut:{done:true,asked:true},news18:true,set:{quality:q,lang:'ko'}})),process.env.Q||'high');
  await page.goto('file://'+path.resolve(HTML),{waitUntil:'load'});await wait(2600);
  await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await wait(300);
  await page.evaluate((W,H)=>{
    const P=window.__PH,T=window.THREE,scene=P.scene;
    document.querySelectorAll('.screen,#hud,#dock,nav,.cdlg').forEach(e=>e.style.display='none');document.body.classList.remove('menuish');
    for(const p of P.G.pengs)p.pg.root.visible=false;
    scene.traverse(o=>{if(o.isMesh&&o.material===P.PK_MAT.body){let r=o;while(r.parent&&r.parent!==scene)r=r.parent;r.visible=false;}});
    scene.traverse(o=>{if(o.isInstancedMesh)o.visible=false;});
    const cam=new T.PerspectiveCamera(24,W/H,.1,500);window.__cam=cam;
    P.sun.position.set(6,14,10);P.sun.target.position.set(0,0,0);P.sun.target.updateMatrixWorld();
    P.renderer.setSize(W,H,false);
    {const r0=P.renderer.render.bind(P.renderer);P.renderer.render=(sc,c)=>r0(sc,window.__cam||c);}   // stray game frames use the booth camera too
    window.__booth=new Set();
    window.__hideOthers=()=>{scene.traverse(o=>{if(o.isMesh&&o.material===P.PK_MAT.body){let r=o;while(r.parent&&r.parent!==scene)r=r.parent;if(!window.__booth.has(r))r.visible=false;}});};
    window.__mk=(k,hat,team)=>{const pg=P.buildPenguin(k,team,hat);scene.add(pg.root);window.__booth.add(pg.root);
      const p={pg,x:0,z:0,rx:0,rz:0,vx:0,vz:0,ix:0,iz:0,heading:0,yawRate:0,pose:'idle',seed:1.3,fall:0,slideT:0,goalie:false,diveT:0,diveDir:0,charging:false,charge:0,cheerKind:0,r:.72*P.TYPES[k].scale,
        anim:{tilt:0,roll:0,phase:0,swing:0,blink:99,blinkT:0,eyeSq:1,sad:0,flap:0,acc:0,y:0}};
      for(let f=0;f<30;f++){p.rx=0;p.rz=0;P.animatePenguin(p,1/60,f/60);}
      if(pg.head)pg.head.rotation.set(0,0,0);   // look straight ahead for the portrait
      return pg;};
  },W,H);
  const views={front:[0,0],three4:[-.38,0],side:[-1.45,0],back:[Math.PI-.4,0]};
  await page.evaluate(()=>{const P=window.__PH;P.renderer.render(P.scene,window.__cam);});await wait(200);
  for(const k of KEYS)for(const hat of HATS)for(const v of VIEWS){
    await page.evaluate((k,hat,rot,team)=>{const P=window.__PH;if(window.__cur){P.scene.remove(window.__cur.root);window.__booth.delete(window.__cur.root);}const pg=window.__mk(k,hat,team);pg.root.rotation.y=rot;window.__cur=pg;
      const s=P.TYPES[k].scale,c=window.__cam;c.position.set(0,1.32*s+.15,4.6*Math.max(.8,s));c.lookAt(0,1.05*s,0);c.updateProjectionMatrix();
      window.__hideOthers();P.renderer.render(P.scene,c);},k,hat,views[v][0],k.length%2?'red':'blue');
    await wait(120);await page.evaluate(()=>{const P=window.__PH;P.renderer.render(P.scene,window.__cam);});
    await page.screenshot({path:'peng/'+pre+'_'+k+'_'+hat+'_'+v+'.png'});
  }
  if(LINEUP){
    await page.setViewport({width:1400,height:560});
    await page.evaluate((KEYS)=>{const P=window.__PH,T=window.THREE;if(window.__cur){P.scene.remove(window.__cur.root);window.__booth.delete(window.__cur.root);}P.renderer.setSize(1400,560,false);
      const n=KEYS.length,per=n>8?Math.ceil(n/2):n;KEYS.forEach((k,i)=>{const row=Math.floor(i/per),j=i%per,m=Math.min(per,n-row*per);const pg=window.__mk(k,'none',i%2?'red':'blue');pg.root.position.set((j-(m-1)/2)*1.5+(row?.75:0),0,row?1.3:-1.1);pg.root.rotation.y=-.15;});
      const c=window.__cam;c.aspect=1400/560;c.fov=26;if(n>8){c.position.set(0,3.1,11.5);c.lookAt(0,.85,0);}else{c.position.set(0,2.0,Math.min(12,4+n*1.25));c.lookAt(0,.9,0);}c.updateProjectionMatrix();window.__hideOthers();P.renderer.render(P.scene,c);},KEYS);
    await wait(150);await page.evaluate(()=>{const P=window.__PH;P.renderer.render(P.scene,window.__cam);});
    await page.screenshot({path:'peng/'+pre+'_lineup.png'});
  }
  console.log(pre,'done',logs.join(' | ')||'no page errors');
  await browser.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
