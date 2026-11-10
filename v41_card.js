/* ================= v41: 🃏 the real penguins on the cards (2026-11-10) ================= */
// The owner: "the penguin card design is awful — a few shapes glued together, is that a penguin?"
// The card art was a flat drawing (ellipses and circles). The game already has a sculpted, feathered, sweater-wearing 3D
// penguin for every species, so the cards now show THAT penguin: a studio portrait of the game model (three-quarter view,
// stick across the chest, key light + a rim light in the card's rarity colour), rendered once per species into an image
// and shown on every card, the scout banner, the collection silhouettes and the skill cut-in.
// The old drawing stays as the fallback (no WebGL, lost context, the Node test harness).
var P3V={w:512,h:640,ss:2,fov:21,q:.9,camUp:1.6,camZ:6.15,camY:.86,exp:.68,iris:1.2,domeY:1.5,domeK:1.42,stick:1.6,
  rim:{0:0xcfe2f5,1:0x6cc4ff,2:0xc79bff,3:0xff7d8a,4:0xffd98a,9:0x8dffe6},
  pose:{attacker:{yaw:-.5,head:[-.1,.38,.07],fl:[-.45,-.12,-.9,.45],stk:[-1.12,1.44,1.05],eye:.84,brow:-.1,jaw:.14},
        defender:{yaw:-.32,head:[-.04,.22,.06],fl:[-.6,-.08,-.95,.4],stk:[-1.18,1.22,1.1],eye:.8,brow:-.16,jaw:.02},
        mid:{yaw:-.42,head:[-.12,.3,.1],fl:[-.3,-.2,-.85,.5],stk:[-1.05,1.56,1.0],eye:.9,brow:0,jaw:.1}}};
var P3={url:{},team:'',scn:null,cam:null,rt:null,cv:null,cv2:null,buf:null,key:null,kick:null,fail:0,css:null,busy:false,warm:[],n:0};
function p3Can(){
  if(window.__NOFX||P3.fail>=2)return false;
  try{return !!(renderer&&renderer.getContext&&!renderer.getContext().isContextLost());}catch(e){return false;}
}
function p3Init(){
  if(P3.scn)return;
  const s=P3.scn=new T.Scene();
  s.add(new T.HemisphereLight(0xdcecff,0x41587a,.5));
  const key=P3.key=new T.DirectionalLight(0xfff1dc,1.0);key.position.set(-2.8,3.6,4.0);s.add(key);s.add(key.target);key.target.position.set(0,.9,0);
  key.castShadow=true;key.shadow.mapSize.set(1024,1024);const sc=key.shadow.camera;sc.left=-1.7;sc.right=1.7;sc.top=1.7;sc.bottom=-1.7;sc.near=1;sc.far=12;sc.updateProjectionMatrix();
  key.shadow.bias=-.0012;key.shadow.normalBias=.03;key.shadow.radius=2.5;
  const fill=new T.DirectionalLight(0xbfe0ff,.14);fill.position.set(3.4,.8,3.2);s.add(fill);
  const kick=P3.kick=new T.DirectionalLight(0xffffff,1.5);kick.position.set(3.0,2.2,-3.4);s.add(kick);
  const top=new T.DirectionalLight(0xffffff,.22);top.position.set(-.6,5,-1.8);s.add(top);
  P3.cam=new T.PerspectiveCamera(P3V.fov,P3V.w/P3V.h,.5,40);
  P3.rt=new T.WebGLRenderTarget(P3V.w*P3V.ss,P3V.h*P3V.ss,{depthBuffer:true,stencilBuffer:false});
  P3.buf=new Uint8Array(P3V.w*P3V.ss*P3V.h*P3V.ss*4);
  P3.cv=document.createElement('canvas');P3.cv.width=P3V.w*P3V.ss;P3.cv.height=P3V.h*P3V.ss;
  P3.cv2=document.createElement('canvas');P3.cv2.width=P3V.w;P3.cv2.height=P3V.h;
}
// the stick: grip at the right flipper tip, blade towards a point given in the penguin's own space (same maths as the match)
const _p3M=new T.Matrix4(),_p3B=new T.Matrix4(),_p3V=new T.Vector3(),_p3G=new T.Vector3(),_p3U=new T.Vector3(),_p3X=new T.Vector3(),_p3Y=new T.Vector3(),_p3Z=new T.Vector3();
function p3Stick(P,x,y,z){
  if(!P.stick)return;P.stick.visible=true;P.stick.scale.set(P3V.stick,P3V.stick,1);
  P.piv.updateMatrix();P.inner.updateMatrix();P.flipR.updateMatrix();
  _p3M.multiplyMatrices(P.piv.matrix,P.inner.matrix).invert();
  _p3V.set(x,y,z).applyMatrix4(_p3M);_p3U.set(0,1,0).transformDirection(_p3M);
  _p3G.set(0,-.34,.03).applyMatrix4(P.flipR.matrix);
  _p3Z.subVectors(_p3V,_p3G).normalize();
  _p3Y.copy(_p3U).addScaledVector(_p3Z,-_p3U.dot(_p3Z));if(_p3Y.lengthSq()<1e-6)_p3Y.set(0,0,-1);_p3Y.normalize();
  _p3X.crossVectors(_p3Y,_p3Z);_p3B.makeBasis(_p3X,_p3Y,_p3Z);P.stick.quaternion.setFromRotationMatrix(_p3B);
  P.stick.position.copy(_p3G).addScaledVector(_p3Z,-.08);
}
// the portrait gets a rounder crown: up close the match model's low cap reads as a bucket, so everything on the head
// above P3V.domeY is stretched upwards by P3V.domeK (head skin, bands, crests alike; normals follow) — this copy only
function p3Dome(P){
  const y0=P3V.domeY,k=P3V.domeK,made=[];
  for(const m of P.headAbs.children){
    if(!m.isMesh||!m.geometry||!m.geometry.attributes||!m.geometry.attributes.position)continue;
    if(m.position.lengthSq()>1e-8||m.rotation.x||m.rotation.y||m.rotation.z)continue;
    const g=m.geometry.clone(),a=g.attributes.position,n=g.attributes.normal;let ch=false;
    for(let i=0;i<a.count;i++){const y=a.getY(i);if(y<=y0)continue;a.setY(i,y0+(y-y0)*k);ch=true;
      if(n){const nx=n.getX(i),ny=n.getY(i)/k,nz=n.getZ(i),l=Math.hypot(nx,ny,nz)||1;n.setXYZ(i,nx/l,ny/l,nz/l);}}
    if(!ch){g.dispose();continue;}
    a.needsUpdate=true;if(n)n.needsUpdate=true;m.geometry=g;made.push(g);
  }
  return made;
}
function p3Pose(k){const r=PREF[k]||'mid';return P3V.pose[r]||P3V.pose.mid;}
// build the species' game model, pose it, light it, render it → a data URL (transparent background)
function p3Shot(k){
  p3Init();
  const ty=TYPES[k],team=save.team||'blue',po=p3Pose(k),g=rarCls(k);
  const p=makePeng({key:team,dir:1},'attacker',k,0,false,'none');scene.remove(p.pg.root);
  const P=p.pg,S=P3.scn;S.add(P.root);
  let out='',made=[];
  const ct=renderer.getRenderTarget(),cc=renderer.getClearColor(new T.Color()),ca=renderer.getClearAlpha(),ex=renderer.toneMappingExposure,
    rc=PRIM.c.value.clone(),rs=PRIM.s.value,st=save.set.stick;
  try{
    p.x=p.z=p.rx=p.rz=0;p.vx=p.vz=0;p.heading=po.yaw;p.pose='idle';p.seed=0;p.anim.phase=0;
    save.set.stick=true;animatePenguin(p,1,0);save.set.stick=st;
    const sc=lerp(1,ty.scale,.4);P.root.scale.setScalar(sc);P.root.position.set(0,0,0);P.root.rotation.y=po.yaw;
    P.piv.rotation.set(0,0,0);P.piv.position.y=PIV;
    P.head.rotation.set(po.head[0],po.head[1],po.head[2],'YXZ');
    P.flipL.rotation.set(po.fl[0],0,po.fl[1]);P.flipR.rotation.set(po.fl[2],0,po.fl[3]);
    P.eyeL.scale.y=P.eyeR.scale.y=po.eye||.88;P.eyeL.rotation.z=po.brow||0;P.eyeR.rotation.z=-(po.brow||0);
    P.pupL.scale.setScalar(P3V.iris);P.pupR.scale.setScalar(P3V.iris);
    const look=clamp(-(po.yaw+po.head[1])*.03,-.03,.03);P.pupL.position.x=P.pupR.position.x=look;P.pupL.position.y=P.pupR.position.y=.004;
    if(P.jaw)P.jaw.rotation.x=po.jaw||0;
    if(P.scarfTail){P.scarfTail.rotation.x=.35;P.scarfTail.rotation.z=.12;}
    p3Stick(P,po.stk[0],po.stk[1],po.stk[2]);
    if(P3V.domeK>1)made=p3Dome(P);
    // camera: a bust from the top of the head to the belly, a touch below eye level
    const c=P3.cam,cy=P3V.camY*sc;c.position.set(0,cy+P3V.camUp,P3V.camZ);c.lookAt(0,cy,0);c.updateProjectionMatrix();
    P3.kick.color.setHex(P3V.rim[g]||P3V.rim[0]);
    PRIM.c.value.setHex(P3V.rim[g]||P3V.rim[0]);PRIM.s.value=.85;
    renderer.toneMappingExposure=P3V.exp;
    renderer.setRenderTarget(P3.rt);renderer.setClearColor(0x000000,0);renderer.clear(true,true,true);
    renderer.render(S,P3.cam);
    const W=P3V.w*P3V.ss,H=P3V.h*P3V.ss;
    renderer.readRenderTargetPixels(P3.rt,0,0,W,H,P3.buf);
    const x=P3.cv.getContext('2d'),im=x.createImageData(W,H),d=im.data,b=P3.buf,row=W*4;
    for(let y=0;y<H;y++)d.set(b.subarray((H-1-y)*row,(H-y)*row),y*row);
    x.putImageData(im,0,0);
    const x2=P3.cv2.getContext('2d');x2.clearRect(0,0,P3V.w,P3V.h);x2.imageSmoothingEnabled=true;x2.imageSmoothingQuality='high';x2.drawImage(P3.cv,0,0,P3V.w,P3V.h);
    out=P3.cv2.toDataURL('image/webp',P3V.q);
    if(typeof out!=='string'||out.length<2000)out='';
  }catch(e){out='';P3.err=String(e&&e.message||e);}
  renderer.setRenderTarget(ct);renderer.setClearColor(cc,ca);renderer.toneMappingExposure=ex;PRIM.c.value.copy(rc);PRIM.s.value=rs;PRIM.t=-1;save.set.stick=st;
  S.remove(P.root);for(const g of made)g.dispose();
  if(!out)P3.fail++;else P3.n++;
  return out;
}
function p3Rule(k,u){
  if(!P3.css){P3.css=document.createElement('style');P3.css.id='p3css';document.head.appendChild(P3.css);}
  P3.rules=P3.rules||{};P3.rules[k]='.p3-'+k+'{background-image:url('+u+')}';
  P3.css.textContent=Object.keys(P3.rules).map(q=>P3.rules[q]).join('\n');
}
// the portrait of a species (rendered on first use; the team colour of the sweater follows your team)
function p3Url(k){
  if(!TYPES[k]||!p3Can())return '';
  const tm=save.team||'blue';if(P3.team!==tm){P3.team=tm;P3.url={};}
  if(P3.url[k])return P3.url[k];
  const u=p3Shot(k);if(!u)return '';
  P3.url[k]=u;p3Rule(k,u);return u;
}
function p3Html(k){return p3Url(k)?'<i class="p3 p3-'+k+'"></i>':'';}
// render the rest in the background while a menu is open, so no screen has to wait for a portrait
function p3Warm(all){
  if(!p3Can())return 0;let n=0;
  for(const k of Object.keys(TYPES)){if(P3.url[k]&&P3.team===(save.team||'blue'))continue;if(p3Url(k))n++;if(!all)break;}
  return n;
}
function p3Frame(){
  if(P3.done||G.view==='game'||!p3Can())return;
  P3.wt=(P3.wt||0)+1;if(P3.wt%4)return;            // one portrait every fourth frame
  if(!p3Warm(false)){if(Object.keys(TYPES).every(k=>P3.url[k]))P3.done=true;}
}
