/* ================= v39: ✨ match show (2026-11-10, second pass) ================= */
// The owner asked for a flashier design, called the first (gold) pass cheap, and asked for detail instead. The UI part is
// v39_luxe.css; this file is the show on the ice, in the game's own colours (ice-blue, the two team colours, white):
//  · goal: three shock rings at the goal mouth, paper in the scorer's colours, follow-spots at the goal mouth, fireworks for
//    your goals, and a broadcast light streak through the GOAL banner (a red edge pulse when you concede)
//  · strong shots (≥ 45 %) and one-timers leave an ice-blue streak with sparks; ≥ 80 % burns orange
//  · big hits: an impact ring and ice chips
//  · arena: camera flashes in the crowd; an ice-blue band of light sweeps the ice at every face-off with four follow-spots
// Visual only: nothing here touches the simulation, and it uses its own random numbers (lxr) so seeded tests stay the same.
// Off at 절약 quality (gfxTier 0); the streak and the edge pulse follow the flash / reduced-motion settings.
var LXV={ringN:8,goalShow:2.6,intro:1.5,sweep:1.3,streakMin:.45,streakHot:.8,streakSp:12,flashIdle:1.5,flashCheer:12,flashGoal:40,rays:1900,
  poolShow:.85,poolR:3.6,sweepO:.8,fw:[.35,.9,1.5]};
var LX={ready:false,fail:false,rings:[],beams:[],streak:null,sweep:null,ps:'',introT:0,goalT:0,goalX:0,goalC:[1,.85,.4],sweepT:9,fw:[],clock:0,seed:20261110,raysT:0,n:{goal:0,hit:0,ring:0,fw:0,flash:0,rays:0}};
function lxr(a,b){LX.seed=(LX.seed*16807)%2147483647;const u=LX.seed/2147483647;return a===undefined?u:b===undefined?u*a:a+(b-a)*u;}
function lxOn(){try{return gfxTier()>0;}catch(_){return save.set.quality!=='low';}}
function lxNight(){return smooth(.45,.85,G.tod);}
function lxBuild(){
  if(LX.ready||LX.fail)return;
  try{
    if(typeof T==='undefined'||!T.RingGeometry||!T.CylinderGeometry||!T.PlaneGeometry||!scene){LX.fail=true;return;}
    // everything flat on the ice needs a stronger polygon offset than the ice itself (-2), or the ice hides it
    // rings: normal blending with saturated colours — additive light disappears on white ice in daylight
    const rg=new T.RingGeometry(.84,1,56);
    for(let i=0;i<LXV.ringN;i++){const m=new T.Mesh(rg,new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));
      m.rotation.x=-Math.PI/2;m.position.y=.058;m.visible=false;m.renderOrder=4;scene.add(m);LX.rings.push({m,t:0,life:0,d:0,r0:1,r1:1,o:1});}
    // follow-spots: soft pools of light gliding over the ice. (Light shafts were tried first: from the top-down camera a shaft
    // is always a wide band of haze across the play, so the light is drawn where it lands instead.)
    const pc=document.createElement('canvas');pc.width=pc.height=128;const px=pc.getContext('2d'),pg=px.createRadialGradient(64,64,0,64,64,64);
    pg.addColorStop(0,'rgba(255,255,255,1)');pg.addColorStop(.55,'rgba(255,255,255,.55)');pg.addColorStop(1,'rgba(255,255,255,0)');px.fillStyle=pg;px.fillRect(0,0,128,128);
    const pt=new T.CanvasTexture(pc),pgm=new T.PlaneGeometry(2,2);
    for(const[x,z]of[[-15,-(D+6)],[15,-(D+6)],[-15,D+6],[15,D+6]]){
      const m=new T.Mesh(pgm,new T.MeshBasicMaterial({map:pt,color:0x7ad8ff,transparent:true,opacity:0,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));
      m.rotation.x=-Math.PI/2;m.position.y=.054;m.scale.setScalar(LXV.poolR);m.visible=false;m.renderOrder=2;scene.add(m);LX.beams.push({m,hx:x,hz:z,tx:x*.5,tz:z*.3,o:0});}
    // gold shot streak (same shape as the puck trail, longer and wider)
    const sg=new T.PlaneGeometry(1,.5);sg.translate(-.5,0,0);
    LX.streak=new T.Mesh(sg,new T.MeshBasicMaterial({map:trailTex,color:0x4cc8ff,transparent:true,opacity:0,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));
    LX.streak.rotation.x=-Math.PI/2;LX.streak.visible=false;LX.streak.renderOrder=4;scene.add(LX.streak);
    // a soft band of light that sweeps across the ice at a face-off
    const c=document.createElement('canvas');c.width=64;c.height=4;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,64,0);
    g.addColorStop(0,'rgba(120,214,255,0)');g.addColorStop(.5,'rgba(130,220,255,1)');g.addColorStop(1,'rgba(120,214,255,0)');x.fillStyle=g;x.fillRect(0,0,64,4);
    LX.sweep=new T.Mesh(new T.PlaneGeometry(8,2*D-.6),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,opacity:0,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));
    LX.sweep.rotation.x=-Math.PI/2;LX.sweep.position.y=.052;LX.sweep.visible=false;LX.sweep.renderOrder=2;scene.add(LX.sweep);
    try{LX.streak.layers.enable(GLOW_L);}catch(_){}
    LX.ready=true;
  }catch(e){LX.fail=true;}
}
function lxRing(x,z,r0,r1,life,col,delay,o){
  let r=null;for(const q of LX.rings)if(q.life<=0){r=q;break;}
  if(!r){r=LX.rings[0];for(const q of LX.rings)if(q.t/q.life>r.t/r.life)r=q;}
  r.t=0;r.life=life;r.d=delay||0;r.r0=r0;r.r1=r1;r.o=o||.85;r.m.position.set(x,.058,z);r.m.material.color.setRGB(col[0],col[1],col[2]);r.m.visible=false;LX.n.ring++;
}
function lxFirework(){
  const x=lxr(-24,24),y=lxr(9,14),z=-lxr(D+5,D+11),pal=[[.5,.85,1],[1,1,1],[1,.5,.6],[1,.84,.3]],c=pal[(lxr()*pal.length)|0];
  for(let i=0;i<54;i++){const a=lxr(TAU),b=lxr(-1,1),s=lxr(6,10),r=Math.sqrt(1-b*b);emit(x,y,z,Math.cos(a)*r*s,b*s+4,Math.sin(a)*r*s,lxr(1,1.7),lxr(.45,.8),c[0],c[1],c[2]);}
  LX.n.fw++;try{SFX.firework();}catch(_){}
}
// a broadcast light streak through the GOAL banner in your team's colour, or a red edge pulse when you concede (pure CSS)
function lxRays(kind,col){
  try{
    if(save.set.motion||save.set.flash===false)return false;
    let el=document.getElementById('lxRays');
    if(!el){const hud=document.getElementById('hud');if(!hud||!document.createElement)return false;el=document.createElement('div');el.id='lxRays';el.setAttribute('aria-hidden','true');hud.insertBefore(el,hud.firstChild);}
    if(col&&el.style&&el.style.setProperty)el.style.setProperty('--lx',col);
    el.className='';void el.offsetWidth;el.className='on '+kind;LX.raysT=LXV.rays/1000;LX.n.rays++;return true;
  }catch(_){return false;}
}
function lxGoal(tm){
  try{
    if(!tm)return;const mine=!!(G.mine&&tm===G.mine),demo=!G.cfg||G.cfg.mode==='demo',gx=tm.dir*W;LX.n.goal++;
    if(lxOn()){
      lxBuild();
      if(LX.ready){
        const c=tm.key==='blue'?[.3,.68,1]:[1,.34,.42];
        lxRing(gx,0,1.2,9,.9,c,0,.85);lxRing(gx,0,1,7,.9,[.62,.88,1],.12,.8);lxRing(gx,0,.8,5,.8,[1,1,1],.24,.8);
        for(let i=0;i<50;i++){const w=i%3===0;emit(gx-tm.dir*lxr(0,6),lxr(5,9),lxr(-5,5),lxr(-3,3),lxr(-1,3),lxr(-3,3),lxr(1.4,2.4),lxr(.22,.42),w?1:c[0],w?1:c[1],w?1:c[2]);}
        LX.goalT=LXV.goalShow;LX.goalX=gx;LX.goalC=c;
        if(mine&&!demo&&!(ARENAS[G.arena]||{}).fireworks)for(const t of LXV.fw)LX.fw.push(LX.clock+t);
      }
    }
    if(!demo&&G.view==='game')lxRays(mine?'mine':'theirs',tm.key==='blue'?'#58b8ff':'#ff6a7c');
  }catch(_){}
}
function lxHit(h,v){
  try{
    if(!h||!v||h.team===v.team||!lxOn())return;lxBuild();if(!LX.ready)return;LX.n.hit++;
    lxRing(v.x,v.z,.5,3.4,.38,[1,1,1],0,.9);lxRing(v.x,v.z,.4,2.4,.34,[.62,.88,1],.05,.85);
    for(let i=0;i<12;i++){const a=lxr(TAU),s=lxr(4,9);emit(v.x,.7,v.z,Math.cos(a)*s,lxr(1.5,4),Math.sin(a)*s,lxr(.25,.45),lxr(.14,.26),i%2?.7:1,i%2?.9:1,1);}
  }catch(_){}
}
function lxFrame(dt){
  dt=Math.min(Math.max(dt||0,0),.05);LX.clock+=dt;
  if(LX.raysT>0){LX.raysT-=dt;if(LX.raysT<=0){const el=document.getElementById('lxRays');if(el)el.className='';}}
  const on=lxOn();
  if(!LX.ready){if(on)lxBuild();if(!LX.ready)return;}
  const st=G.state;if(st!==LX.ps){if(st==='ready'&&on&&G.view==='game'){LX.introT=LXV.intro;LX.sweepT=0;}LX.ps=st;}
  // rings
  for(const r of LX.rings){if(r.life<=0)continue;if(r.d>0){r.d-=dt;continue;}
    r.t+=dt;const k=r.t/r.life;if(k>=1||!on){r.life=0;r.m.visible=false;continue;}
    const e=1-(1-k)*(1-k);r.m.visible=true;r.m.scale.setScalar(lerp(r.r0,r.r1,e));r.m.material.opacity=r.o*(1-k);}
  // fireworks queued by a goal
  if(LX.fw.length&&LX.clock>=LX.fw[0]){LX.fw.shift();if(on)lxFirework();}
  // coloured follow-spots on the ice: ice-blue for the face-off, the scoring team's colour at a goal. Drawn as tinted light
  // (normal blending): added white light is invisible on white ice, and a warm tint there looks like a stain.
  const show=LX.goalT>0?1:LX.introT>0?.8:0,want=on?show*LXV.poolShow:0;
  for(let i=0;i<LX.beams.length;i++){const b=LX.beams[i];b.o+=(want-b.o)*Math.min(1,dt*(want>b.o?10:4));
    if(b.o<.004){b.m.visible=false;continue;}
    let tx,tz;const ph=LX.clock*.5+i*1.7;
    if(LX.goalT>0){tx=LX.goalX*.8+Math.sin(LX.clock*5+i*2.1)*3.2;tz=Math.cos(LX.clock*4+i*1.3)*3.6;}
    else if(LX.introT>0){const k=1-LX.introT/LXV.intro;tx=lerp(b.hx*1.2,0,k)+Math.sin(ph*4)*2;tz=lerp(b.hz*.6,0,k);}
    else{tx=Math.sin(ph)*W*.7;tz=Math.cos(ph*1.3+i)*D*.6;}
    b.tx+=(tx-b.tx)*Math.min(1,dt*6);b.tz+=(tz-b.tz)*Math.min(1,dt*6);
    b.m.visible=true;b.m.position.set(clamp(b.tx,-W+1,W-1),.054,clamp(b.tz,-D+1,D-1));b.m.material.opacity=b.o;
    const c=LX.goalT>0?LX.goalC:[.48,.85,1];b.m.material.color.setRGB(c[0],c[1],c[2]);}
  LX.goalT=Math.max(0,LX.goalT-dt);LX.introT=Math.max(0,LX.introT-dt);
  // gold streak behind a charged shot / one-timer
  const pk=G.puck,sh=pk.shot,sp=Math.hypot(pk.vx,pk.vz),S=LX.streak;
  if(on&&sh&&sp>LXV.streakSp&&st==='play'&&(sh.charge>=LXV.streakMin||sh.oneT)){
    const hot=sh.charge>=LXV.streakHot;S.visible=true;S.position.set(pk.rx,.07,pk.rz);S.rotation.set(0,0,0);S.rotation.x=-Math.PI/2;S.rotation.z=-Math.atan2(pk.vz,pk.vx);   // the tail lies behind the puck
    S.scale.set(clamp(sp*.22,2.4,7.5),hot?3.2:2.4,1);S.material.opacity=clamp(sp/26,.4,.92);S.material.color.setRGB(hot?1:.3,hot?.5:.78,hot?.16:1);
    if(lxr()<dt*70)emit(pk.x,.2,pk.z,lxr(-1.5,1.5)-pk.vx*.05,lxr(.5,2.2),lxr(-1.5,1.5)-pk.vz*.05,lxr(.25,.5),lxr(.12,.24),hot?1:.6,hot?.6:.9,hot?.25:1);
  }else S.visible=false;
  // the light sweep
  if(on&&LX.sweepT<LXV.sweep){LX.sweepT+=dt;const k=LX.sweepT/LXV.sweep;LX.sweep.visible=true;LX.sweep.position.x=lerp(-W-5,W+5,k);LX.sweep.material.opacity=LXV.sweepO*Math.sin(Math.PI*Math.min(1,k));}
  else{LX.sweep.visible=false;if(LX.sweepT<LXV.sweep)LX.sweepT+=dt;}
  // camera flashes in the stands
  if(on&&G.view==='game'){const rate=LXV.flashIdle+(G.cheer||0)*LXV.flashCheer+(LX.goalT>0?LXV.flashGoal:0);let n=Math.floor(dt*rate+lxr());
    while(n-->0){let x,z;if(lxr()<.72){x=lxr(-W-2,W+2);z=(lxr()<.5?-1:1)*lxr(D+5,D+7.6);}else{x=(lxr()<.5?-1:1)*lxr(W+5.2,W+7.8);z=lxr(-D+3,D-3);}
      emit(x,lxr(1.3,1.9),z,0,.4,0,.13,lxr(.5,.95),1,1,1);LX.n.flash++;}}
}
