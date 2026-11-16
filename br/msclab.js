// Mascot lab: the CURRENT v47_mascot.js injected into the built game (no rebuild).
// usage: node msclab.js <tag> <views>   views: all | row1 | row2 | sp:<mascot>[:<anim>:<t>] | anim:<mascot>:<anim>:<t1,t2,..>  → shots/msc/<tag>_<view>.png
const chromium=require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs'),path=require('path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));const TAG=process.argv[2]||'lab',VIEWS=(process.argv[3]||'all').split('+');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(__dirname,'shots','msc');fs.mkdirSync(OUT,{recursive:true});
const MK='/* ================= INIT ================= */';
function html(){let s=fs.readFileSync(path.join(ROOT,'penguin-hockey-improved.html'),'utf8');const i=s.indexOf(MK);if(i<0)throw new Error('INIT');
  let js=fs.readFileSync(path.join(ROOT,'v47_mascot.js'),'utf8');
  const j=s.indexOf('/*MSC:js*/'),k=s.indexOf('/*MSC:jsend*/');if(j>=0&&k>j)s=s.slice(0,j)+s.slice(k+13);   // the built copy (if any) is replaced
  const i2=s.indexOf(MK);return s.slice(0,i2)+js+"\nwindow.__M={mBody,MS_SP,MSC,MS_M,mPose,mPlace};\n"+s.slice(i2);}
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:await chromium.executablePath(),headless:'shell'});
  const p=await b.newPage();const logs=[];p.on('pageerror',e=>logs.push(e.message));p.on('console',m=>{if(m.type()==='error')logs.push(m.text().slice(0,200));});
  const URL='file://'+path.join(ROOT,'penguin-hockey-improved.html');
  await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();if(u.split('?')[0]===URL)return r.respond({status:200,contentType:'text/html; charset=utf-8',body:html()});if(u.startsWith('file:'))return r.continue();r.abort();});
  await p.evaluateOnNewDocument(()=>{window.PH_NODAILY=1;localStorage.setItem('penguinHockey.v1',JSON.stringify({v:10,news18:true,tut:{done:true,asked:true},set:{quality:'ultra',tod:'day',cond:false,events:false,items:false,rules:'off'}}));});
  await p.goto(URL,{waitUntil:'load'});await wait(2500);
  if(logs.length)console.log('LOGS',logs.join('\n'));
  await p.evaluate(()=>{window.requestAnimationFrame=()=>0;document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));for(const pg of window.__PH.G.pengs||[])pg.pg&&(pg.pg.root.visible=false);if(window.__PH.G.puck&&window.__PH.G.puck.mesh)window.__PH.G.puck.mesh.visible=false;});
  const stage=(list,cam)=>p.evaluate((list,cam)=>{const P=window.__PH,M=window.__M;if(window.__ab)for(const o of window.__ab)P.scene.remove(o);window.__ab=[];const out=[];
    for(const it of list){const t0=performance.now();const R=M.mBody(it.team||'blue',null,it.sp);R.root.position.set(it.x,0,it.z||0);R.root.rotation.y=it.ry||0;
      if(it.anim){M.mPose(R,it.anim,it.t||0,Object.assign({u:it.t/2},it.o||{}));M.mPlace(R,{x:it.x,z:it.z||0,yaw:it.ry||0});}P.scene.add(R.root);window.__ab.push(R.root);out.push(it.sp+' '+(performance.now()-t0).toFixed(0)+'ms');}
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
    else if(v.startsWith('hs:')){const [,a,bb,us]=v.split(':');const U=(us||'.4').split(',').map(Number);   // handshake: two mascots facing each other, hand gap per moment
      for(const u of U){await p.setViewport({width:900,height:640});
        console.log('u='+u,await p.evaluate((a,bb,u)=>{const P=window.__PH,M=window.__M;if(window.__ab)for(const o of window.__ab)P.scene.remove(o);window.__ab=[];const X=.64,t=u*1.7;
          const A=M.mBody('blue',null,a),B=M.mBody('red',null,bb);M.mPose(A,'shake',t,{u});M.mPose(B,'shake',t,{u});M.mPlace(A,{x:-X,z:0,yaw:Math.PI/2});M.mPlace(B,{x:X,z:0,yaw:-Math.PI/2});
          P.scene.add(A.root,B.root);window.__ab.push(A.root,B.root);A.root.updateMatrixWorld(true);B.root.updateMatrixWorld(true);
          const V=()=>new A.root.position.constructor(),w=o=>o.getWorldPosition(V()),f=v=>[v.x,v.y,v.z].map(x=>x.toFixed(2)).join(',');
          const r={aR:f(w(A.hR)),bR:f(w(B.hR)),aL:f(w(A.hL)),bL:f(w(B.hL)),gap:w(A.hR).distanceTo(w(B.hR)).toFixed(2),cover:w(A.hL).distanceTo(w(B.hR)).toFixed(2)};
          for(const g of P.G.pengs||[])if(g.pg)g.pg.root.visible=false;const c=P.camera;c.fov=40;c.aspect=innerWidth/innerHeight;
          c.position.set(0,1.7,3.6);c.lookAt(0,1,0);c.updateProjectionMatrix();P.renderer.render(P.scene,c);return JSON.stringify(r);},a,bb,u));
        await shot(v+'_'+u+'_front');
        await p.evaluate(()=>{const P=window.__PH,c=P.camera;c.position.set(0,4.2,.01);c.lookAt(0,1,0);c.updateProjectionMatrix();P.renderer.render(P.scene,c);});await shot(v+'_'+u+'_top');}}
    else if(v==='col'){   // the entrance timeline for every pair: closest heads, horn points inside the partner's head
      console.log(await p.evaluate(()=>{const P=window.__PH,M=window.__M,X=.64,ALL=Object.keys(M.MS_SP),V=()=>new P.camera.position.constructor();
        const rig={};for(const sp of ALL){rig['A'+sp]=M.mBody('blue',null,sp);rig['B'+sp]=M.mBody('red',null,sp);}
        const hr=R=>{const b=new (P.camera.position.constructor===undefined?0:window.__PH.scene.constructor)();return 0;};
        const out=[];let worst=9;
        for(const a of ALL)for(const b of ALL){const A=rig['A'+a],B=rig['B'+b];let md=9,mt='',hornIn=0,ht='';
          for(let i=0;i<=48;i++){const ts=i*2.4/48;const ph=ts<1.7?'shake':'bow',u=ts<1.7?ts/1.7:(ts-1.7)/.7;
            M.mPose(A,ph,ts,{u});M.mPose(B,ph,ts,{u});const xx=ph==='bow'?X+(.96-X)*(t=>t*t*(3-2*t))(Math.min(1,u*1.6)):X;M.mPlace(A,{x:-xx,z:0,yaw:Math.PI/2});M.mPlace(B,{x:xx,z:0,yaw:-Math.PI/2});A.root.updateMatrixWorld(true);B.root.updateMatrixWorld(true);
            const ha=A.head.getWorldPosition(V()),hb=B.head.getWorldPosition(V());const d=ha.distanceTo(hb);if(d<md){md=d;mt=ph+' '+u.toFixed(2);}
            for(const [R,Q] of [[A,B],[B,A]])for(const k of["horn","tusks"])for(const hz of [].concat(R.ex[k]||[])){const hq=Q.head.getWorldPosition(V());
              hz.traverse(m=>{if(!m.isMesh)return;const pa=m.geometry.attributes.position;for(let j=0;j<pa.count;j+=7){const w=V().fromBufferAttribute(pa,j);m.localToWorld(w);if(w.distanceTo(hq)<.36*Q.head.scale.x){hornIn++;ht=ph+' '+u.toFixed(2);}}});}}
          if(md<.62||hornIn)out.push(a+'>'+b+' head '+md.toFixed(2)+' @'+mt+(hornIn?' HORN '+hornIn+' @'+ht:''));worst=Math.min(worst,md);}
        return 'worst head gap '+worst.toFixed(2)+' head scale '+rig.Apeng.head.scale.x+'\n'+out.join('\n');}));}
  }
  if(logs.length)console.log('LOGS',logs.slice(0,6).join('\n'));await b.close();})();
