// Mascot lab: the CURRENT v47_mascot.js injected into the built game (no rebuild).
// usage: node msclab.js <tag> <views>   views: all | row1 | row2 | sp:<mascot>[:<anim>:<t>] | anim:<mascot>:<anim>:<t1,t2,..>  → shots/msc/<tag>_<view>.png
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));const TAG=process.argv[2]||'lab',VIEWS=(process.argv[3]||'all').split('+');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(__dirname,'shots','msc');fs.mkdirSync(OUT,{recursive:true});
const MK='/* ================= INIT ================= */';
function html(){let s=fs.readFileSync(path.join(ROOT,'penguin-hockey-improved.html'),'utf8');const i=s.indexOf(MK);if(i<0)throw new Error('INIT');
  let js=fs.readFileSync(path.join(ROOT,'v47_mascot.js'),'utf8');
  const j=s.indexOf('/*MSC:js*/'),k=s.indexOf('/*MSC:jsend*/');if(j>=0&&k>j)s=s.slice(0,j)+s.slice(k+13);   // the built copy (if any) is replaced
  const i2=s.indexOf(MK);return s.slice(0,i2)+js+"\nwindow.__M={mBody,MS_SP,MSC,MS_M,mPose,mPlace,mTouchTo,mascSpots,mascPool,mascYaw,mascGap,mascHideWorld};\n"+s.slice(i2);}
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell'});
  const p=await b.newPage();const logs=[];p.on('pageerror',e=>logs.push(e.message));p.on('console',m=>{if(m.type()==='error')logs.push(m.text().slice(0,200));});
  const URL='file://'+path.join(ROOT,'penguin-hockey-improved.html');
  await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();if(u.split('?')[0]===URL)return r.respond({status:200,contentType:'text/html; charset=utf-8',body:html()});if(u.startsWith('file:'))return r.continue();r.abort();});
  await p.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,news18:true,tut:{done:true,asked:true},set:{quality:'ultra',tod:'day',cond:false,events:false,items:false,rules:'off'}}));});
  await p.goto(URL,{waitUntil:'load'});await wait(2500);
  if(logs.length)console.log('LOGS',logs.join('\n'));
  await p.evaluate(()=>{window.requestAnimationFrame=()=>0;document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));for(const pg of window.__PH.G.pengs||[])pg.pg&&(pg.pg.root.visible=false);if(window.__PH.G.puck&&window.__PH.G.puck.mesh)window.__PH.G.puck.mesh.visible=false;});
  const stage=(list,cam)=>p.evaluate((list,cam)=>{const P=window.__PH,M=window.__M;M.mascHideWorld(true);if(window.__ab)for(const o of window.__ab)P.scene.remove(o);window.__ab=[];const out=[];
    for(const it of list){const t0=performance.now();const R=M.mBody(it.team||'blue',null,it.sp);R.root.position.set(it.x,0,it.z||0);R.root.rotation.y=it.ry||0;
      if(it.anim){M.mPose(R,it.anim,it.t||0,Object.assign({u:it.t/2},it.o||{}));M.mPlace(R,{x:it.x,z:it.z||0,yaw:it.ry||0});}P.scene.add(R.root);window.__ab.push(R.root);if(R.med==='water'){const Q=M.mascPool(R);Q.visible=true;Q.position.set(it.x,0,it.z||0);Q.scale.set(.62,1,.62);Q.userData.open=1;window.__ab.push(Q);}out.push(it.sp+' '+(performance.now()-t0).toFixed(0)+'ms');}
    for(const g of P.G.pengs||[])if(g.pg)g.pg.root.visible=false;
    const c=P.camera;c.position.set(cam[0],cam[1],cam[2]);c.lookAt(cam[3],cam[4],cam[5]);c.fov=cam[6]||40;c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();
    for(let i=0;i<3;i++)P.shFit&&P.shFit();P.renderer.render(P.scene,c);return out.join(', ');},list,cam);
  const shot=async n=>{await wait(150);await p.screenshot({path:path.join(OUT,TAG+'_'+n.replace(/[:,]/g,'_')+'.png')});console.log('saved',n);};
  const ALL=['peng','orca','bear','seal','walrus','fox','owl','fish','narwhal','flake','berg','bolt'];
  for(const v of VIEWS){
    if(v==='all'){await p.setViewport({width:1800,height:760});console.log(await stage(ALL.map((sp,i)=>({sp,x:(i%6-2.5)*1.55,z:i<6?0:-2.6,ry:.3,team:i%2?'red':'blue'})),[0,3.2,9.6,0,1.3,-1.3,44]));await shot(v);}
    else if(v==='row1'||v==='row2'){await p.setViewport({width:1800,height:700});const L=v==='row1'?ALL.slice(0,6):ALL.slice(6);console.log(await stage(L.map((sp,i)=>({sp,x:(i-2.5)*1.5,ry:.25,team:i%2?'red':'blue'})),[0,1.6,7.4,0,1.2,0,40]));await shot(v);}
    else if(v.startsWith('sp:')){const [,sp,anim,t]=v.split(':');await p.setViewport({width:900,height:900});console.log(await stage([{sp,x:0,ry:.5,anim,t:+t||0}],[0,1.4,4.2,0,1.15,0,40]));await shot(v);}
    else if(v.startsWith('anim:')){const [,sp,anim,ts]=v.split(':');const T=ts.split(',').map(Number);await p.setViewport({width:Math.min(1900,360*T.length),height:520});
      console.log(await stage(T.map((t,i)=>({sp,x:(i-(T.length-1)/2)*1.9,ry:.35,anim,t})),[0,1.6,3.2+T.length*1.15,0,1.1,0,40]));await shot(v);}
    else if(v.startsWith('hs:')||v==='col'){   // the greeting as the scene does it: spots from the touch poses, touch at the centre, then the bow
      const pairs=v==='col'?null:[v.split(':')[1],v.split(':')[2]],U=v==='col'?null:(v.split(':')[3]||'1').split(',').map(Number);
      const res=await p.evaluate((pairs,U)=>{const P=window.__PH,M=window.__M,V=()=>new P.camera.position.constructor(),ALL=Object.keys(M.MS_SP);if(window.__ab)for(const o of window.__ab)P.scene.remove(o);window.__ab=[];
        const rig={};const get=(k,team,sp)=>rig[k+sp]||(rig[k+sp]=M.mBody(team,null,sp));const yaw=(R,side)=>M.mascYaw(R,side);
        const run=(A,B,ts,u,ph)=>{A.side=-1;B.side=1;const sp=M.mascSpots(A,B);for(const R of[A,B]){M.mPose(R,ph,ts,{u,side:R.side,low:sp.low});M.mPlace(R,{x:R.gs.x,z:R.gs.z,yaw:yaw(R,R.side)});}
          if(ph==='touch')for(const R of[A,B])M.mTouchTo(R,V().set(0,sp.y,0),u);for(const R of[A,B])R.root.updateMatrixWorld(true);return sp;};
        const sph=R=>R.sph.map(q=>({c:q[0].localToWorld(V().set(...q[1])),r:q[2]*R.root.scale.x}));
        if(pairs){const A=get('A','blue',pairs[0]),B=get('B','red',pairs[1]);P.scene.add(A.root,B.root);window.__ab.push(A.root,B.root);const out=[];
          for(const u of U){const sp=run(A,B,.8,u,'touch');out.push('u='+u+' gap '+A.touch.getWorldPosition(V()).distanceTo(B.touch.getWorldPosition(V())).toFixed(3)+' at y '+sp.y.toFixed(2)+' A('+A.root.position.x.toFixed(2)+','+A.root.position.z.toFixed(2)+') B('+B.root.position.x.toFixed(2)+','+B.root.position.z.toFixed(2)+')');}
          for(const g of P.G.pengs||[])if(g.pg)g.pg.root.visible=false;const c=P.camera;c.fov=40;c.aspect=innerWidth/innerHeight;c.position.set(.9,1.5,3.6);c.lookAt(0,.8,0);c.updateProjectionMatrix();P.renderer.render(P.scene,c);return out.join('\n');}
        const bad=[];let worst=9,wh='';for(const a of ALL)for(const b of ALL){if(a===b)continue;const A=get('A','blue',a),B=get('B','red',b);let n=0,gap=0;
          for(let i=0;i<=40;i++){const ts=i*2.4/40,ph=ts<1.7?'touch':'bow',u=ph==='touch'?Math.min(1,ts/.32)*(1-Math.max(0,Math.min(1,(ts-1.38)/.32))):(ts-1.7)/.7;run(A,B,ts,u,ph);
            if(ph==='touch'&&u>.99)gap=Math.max(gap,A.touch.getWorldPosition(V()).distanceTo(B.touch.getWorldPosition(V())));const sa=sph(A),sb=sph(B);for(const x of sa)for(const y of sb){if(x.c.y<-.15&&y.c.y<-.15)continue;const d=x.c.distanceTo(y.c)-x.r-y.r;if(d<worst){worst=d;wh=a+'>'+b+' '+ph+' '+ts.toFixed(2);}if(d<-.06)n++;}
            for(const [R,Q] of[[A,B],[B,A]])for(const k of['horn','tusks'])for(const hz of[].concat(R.ex[k]||[])){const sq=sph(Q);hz.traverse(m=>{if(!m.isMesh)return;const pa=m.geometry.attributes.position;for(let j=0;j<pa.count;j+=7){const w=V().fromBufferAttribute(pa,j);m.localToWorld(w);if(w.y<0)continue;for(const y of sq)if(w.distanceTo(y.c)<y.r*.95)n+=100;}});}}
          if(n||gap>.12)bad.push(a+'>'+b+' overlap '+n+' tipgap '+gap.toFixed(2));}
        return 'closest parts '+worst.toFixed(2)+' m ('+wh+')\n'+bad.join('\n');},pairs,U);
      console.log(res);if(pairs)await shot(v.replace(/[:,]/g,'_'));}
  }
  if(logs.length)console.log('LOGS',logs.slice(0,6).join('\n'));await b.close();})();
