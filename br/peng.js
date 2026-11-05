// close-up "photo booth" for the penguin models. usage: node peng.js <prefix> [html]
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const pre=process.argv[2]||'base',HTML=process.argv[3]||'../penguin-hockey-improved.html';
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell',defaultViewport:{width:1200,height:620}});
  const page=await browser.newPage();const logs=[];page.on('pageerror',e=>logs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|vibrate/.test(m.text()))logs.push('CONSOLE '+m.text().slice(0,200));});
  await page.setRequestInterception(true);
  page.on('request',r=>{const u=r.url();if(u.includes('three.min.js'))return r.respond({status:200,contentType:'application/javascript',body:fs.readFileSync('node_modules/three/build/three.min.js')});if(u.startsWith('file:'))return r.continue();r.abort();});
  await page.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;});await page.evaluateOnNewDocument(q=>localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,points:500,types:['basic','fast'],type:'fast',tut:{done:true,asked:true},set:{quality:q}})),process.env.Q||'high');
  await page.goto('file://'+path.resolve(HTML),{waitUntil:'load'});await wait(2600);
  await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await wait(300);
  const setup=await page.evaluate(()=>{
    const P=window.__PH,T=window.THREE,scene=P.scene;
    document.querySelectorAll('.screen,#hud,#dock,nav').forEach(e=>e.style.display='none');document.body.classList.remove('menuish');
    for(const p of P.G.pengs)p.pg.root.visible=false;
    scene.traverse(o=>{if(o.isMesh&&o.material===P.PK_MAT.body){let r=o;while(r.parent&&r.parent!==scene)r=r.parent;r.visible=false;}});
    scene.traverse(o=>{if(o.isInstancedMesh)o.visible=false;});
    const keys=['basic','fast','strong','defense','balanced','auk'],hats=['beanie','none','headband','party','crown','none'];
    window.__booth=keys.map((k,i)=>{const pg=P.buildPenguin(k,i%2?'red':'blue',hats[i]);pg.root.position.set((i-2.5)*1.75,0,0);scene.add(pg.root);
      const p={pg,x:(i-2.5)*1.75,z:0,rx:(i-2.5)*1.75,rz:0,vx:0,vz:0,ix:0,iz:0,heading:0,yawRate:0,pose:'idle',seed:i*1.7,fall:0,slideT:0,goalie:false,diveT:0,diveDir:0,charging:false,charge:0,cheerKind:0,r:.72*P.TYPES[k].scale,
        anim:{tilt:0,roll:0,phase:i,swing:0,blink:9,blinkT:0,eyeSq:1,sad:0,flap:0,acc:0,y:0}};return {k,pg,p};});
    window.__pose=(fn,secs)=>{for(const b of window.__booth){fn(b.p,b);}for(let f=0;f<(secs||1)*60;f++)for(const b of window.__booth){b.p.rx=b.p.x;b.p.rz=b.p.z;P.animatePenguin(b.p,1/60,f/60+3);}};
    const cam=new T.PerspectiveCamera(26,1200/620,.1,500);window.__cam=cam;
    P.sun.position.set(6,14,10);P.sun.target.position.set(0,0,0);P.sun.target.updateMatrixWorld();
    return keys.length;});
  const shot=async(n,fn)=>{await page.evaluate(fn);await page.evaluate(()=>{const P=window.__PH;P.renderer.setSize(1200,620,false);P.renderer.render(P.scene,window.__cam);});await wait(150);await page.evaluate(()=>{const P=window.__PH;P.renderer.render(P.scene,window.__cam);});await page.screenshot({path:'peng/'+pre+'_'+n+'.png'});};
  await page.evaluate(()=>{const P=window.__PH;P.renderer.render(P.scene,window.__cam);});await wait(300);await shot('front',()=>{const c=window.__cam;c.position.set(0,1.6,13.5);c.lookAt(0,.85,0);c.aspect=1200/620;c.updateProjectionMatrix();});
  await shot('three4',()=>{const c=window.__cam;window.__booth.forEach(b=>b.pg.root.rotation.y=-.75);c.position.set(0,2.1,13.5);c.lookAt(0,.85,0);});
  await shot('back',()=>{const c=window.__cam;window.__booth.forEach(b=>b.pg.root.rotation.y=Math.PI-.35);c.position.set(0,2.4,13.5);c.lookAt(0,.85,0);});
  await shot('close',()=>{const c=window.__cam;window.__booth.forEach(b=>b.pg.root.rotation.y=-.35);c.position.set(-3.3,1.55,4.2);c.lookAt(-3.5,1.15,0);});
  await shot('poses',()=>{const c=window.__cam;const P=window.__PH;window.__booth.forEach((b,i)=>{b.pg.root.rotation.y=0;});
    window.__pose((p,b)=>{const i=window.__booth.indexOf(b);p.heading=-.9;p.pose='play';p.vx=0;p.vz=0;p.fall=0;p.charging=false;p.anim.swing=0;
      if(i===0){p.vx=Math.sin(p.heading)*3;p.vz=Math.cos(p.heading)*3;p.ix=1;}            // skating
      if(i===1){p.vx=Math.sin(p.heading)*9;p.vz=Math.cos(p.heading)*9;p.slideT=1;}        // belly slide
      if(i===2){p.charging=true;p.charge=.9;}                                             // wind-up
      if(i===3){p.anim.swing=1;}                                                          // follow-through
      if(i===4){p.pose='cheer';}                                                          // celebrate
      if(i===5){p.fall=1;}                                                                // knocked over
    },.6);window.__booth.forEach(b=>{if(b.p.pose!=='cheer')b.pg.root.rotation.y=b.p.heading;});
    c.position.set(0,2.6,12.5);c.lookAt(0,.8,0);});
  await shot('game',()=>{window.__pose(p=>{p.pose='play';p.vx=p.vz=0;p.fall=0;p.slideT=0;p.charging=false;p.anim.swing=0;},1);const c=window.__cam;window.__booth.forEach((b,i)=>{b.pg.root.rotation.y=i*1.1;b.pg.root.position.set((i%3-1)*3,0,(i<3?-1.5:1.5));});c.fov=48;c.updateProjectionMatrix();c.position.set(0,17,15);c.lookAt(0,0,0);});
  console.log(pre,'done',logs.join(' | ')||'no page errors');
  await browser.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
