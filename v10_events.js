
/* ================= v10 surprise rink events + shootout mode ================= */
const EVENTS={
  seal:{ico:'🦭',name:'바다표범 난입!',desc:'빙판을 가로지르는 바다표범을 피하세요'},
  gust:{ico:'🌬️',name:'돌풍 주의!',desc:'6초 동안 바람이 퍽과 펭귄을 밀어요'},
  fish:{ico:'🐟',name:'생선 비!',desc:'관중이 아이템을 던졌어요'},
  golden:{ico:'⭐',name:'골든 퍽!',desc:'15초 안에 넣는 다음 골은 2점'}
};
function eventsOn(){const c=G.cfg;return !!(c&&save.set.events&&G.view==='game'&&['quick','free','tour'].includes(c.mode)&&!G.so);}
// seal mesh
const seal=(()=>{const g=new T.Group(),m=std(0x8a96a3,.55,.05),d=std(0x6b7682,.55,.05);
  const b=new T.Mesh(new T.SphereGeometry(1,20,14),m);b.scale.set(.75,.55,1.35);b.position.y=.55;b.castShadow=true;g.add(b);
  const h=new T.Mesh(new T.SphereGeometry(.48,18,12),m);h.position.set(0,1.05,1.15);h.castShadow=true;g.add(h);
  const sn=new T.Mesh(new T.SphereGeometry(.24,12,8),std(0xb9c3cc,.5));sn.scale.set(1,.8,1.1);sn.position.set(0,.98,1.55);g.add(sn);
  for(const s of[-1,1]){const e=new T.Mesh(new T.SphereGeometry(.07,8,6),MAT.pupil);e.position.set(s*.2,1.18,1.52);g.add(e);
    const f=new T.Mesh(new T.SphereGeometry(1,10,8),d);f.scale.set(.42,.08,.24);f.position.set(s*.72,.25,.35);f.rotation.y=s*.5;g.add(f);}
  const tl=new T.Mesh(new T.SphereGeometry(1,10,8),d);tl.scale.set(.5,.07,.3);tl.position.set(0,.12,-1.35);g.add(tl);
  g.scale.setScalar(1.3);g.visible=false;scene.add(g);return g;})();
const puckMats=(()=>{const c=puckG.children,b=c[0].material,t=(c[2]||c[0]).material;return{b,t,bc:b.color.getHex(),tc:t.color.getHex(),be:b.emissive.getHex()};})();
function puckGold(on){puckMats.b.color.setHex(on?0xffc93c:puckMats.bc);puckMats.b.emissive.setHex(on?0x5a3a00:puckMats.be);puckMats.t.color.setHex(on?0xfff1b0:puckMats.tc);}
G.ev=null;G.evT=40;G.goldenT=0;
function evReset(){G.ev=null;G.evT=rnd(35,50);G.goldenT=0;seal.visible=false;puckGold(false);try{$('#evTag').className='';}catch(e){}}
function evStart(k){
  k=k||['seal','gust','fish','golden'][(Math.random()*4)|0];const E=EVENTS[k];
  hypeBanner(E.ico+' '+E.name,[E.desc],1,'');SFX.whistle();G.cheer=1;
  if(k==='seal'){const x=rnd(-W+8,W-8),dz=Math.random()<.5?1:-1;G.ev={k,t:0,dur:6.5,x,z:-dz*(D+1.5),dz,hitT:{}};seal.position.set(x,0,G.ev.z);seal.rotation.y=dz>0?0:Math.PI;seal.visible=true;SFX.honk();}
  else if(k==='gust'){const a=[0,Math.PI/2,Math.PI,-Math.PI/2][(Math.random()*4)|0];G.ev={k,t:0,dur:6,wx:Math.cos(a),wz:Math.sin(a)};}
  else if(k==='fish'){for(let i=0;i<3;i++)spawnItem(i===0?'fish':null);G.ev=null;}
  else if(k==='golden'){G.goldenT=15;puckGold(true);G.ev=null;}
}
function evFrame(dt){
  if(!eventsOn()){if(G.ev||G.goldenT>0||seal.visible)evReset();return;}
  if(G.state!=='play'){if(G.state==='goal'&&G.ev&&G.ev.k==='seal'){seal.visible=false;G.ev=null;}return;}
  G.evT-=dt;if(G.evT<=0&&!G.ev){G.evT=rnd(40,60);evStart();}
  if(G.goldenT>0){G.goldenT-=dt;if(G.goldenT<=0){G.goldenT=0;puckGold(false);hypeToast('골든 퍽이 사라졌어요');}
    if(Math.random()<dt*25){const pk=G.puck;emit(pk.x,.3,pk.z,rnd(-1,1),rnd(1,2.5),rnd(-1,1),.5,.2,1,.85,.3);}}
  const ev=G.ev;
  if(!ev){const el=$('#evTag'),txt=G.goldenT>0?'⭐ 골든 퍽 '+Math.ceil(G.goldenT):'';if(el.textContent!==txt){el.textContent=txt;el.className=txt?'on':'';}return;}
  ev.t+=dt;
  if(ev.k==='seal'){
    const sp=(2*(D+1.5))/ev.dur;ev.z+=ev.dz*sp*dt;seal.position.set(ev.x,Math.abs(Math.sin(ev.t*5))*.12,ev.z);seal.rotation.z=Math.sin(ev.t*5)*.08;
    if(Math.random()<dt*20)emit(ev.x+rnd(-.6,.6),.15,ev.z-ev.dz*1.2,rnd(-1,1),rnd(.5,1.5),-ev.dz*rnd(.5,1.5),.5,.2,.9,.95,1);
    for(const p of G.pengs){if(p.goalie||p.frozen)continue;const dx=p.x-ev.x,dz=p.z-ev.z,d=Math.hypot(dx,dz);
      if(d<1.6&&!(ev.hitT[p.idx+p.team.key]>0)){ev.hitT[p.idx+p.team.key]=1;const l=d||1;p.vx+=dx/l*9;p.vz+=dz/l*9+ev.dz*4;if(knock(p,.8))popAt('꽈당!',p.x,2.3,p.z);SFX.bump(.8);}}
    const pk=G.puck,dx=pk.x-ev.x,dz=pk.z-ev.z,d=Math.hypot(dx,dz);
    if(d<1.5){const l=d||1;pk.vx=dx/l*12;pk.vz=dz/l*12+ev.dz*5;pk.x=ev.x+dx/l*1.55;pk.z=ev.z+dz/l*1.55;SFX.hit(.8);}
    if(ev.t>=ev.dur){seal.visible=false;G.ev=null;}
  }else if(ev.k==='gust'){
    if(Math.random()<dt*60){const cx=G.cam.x+rnd(-20,20),cz=G.cam.z+rnd(-12,12);emit(cx,rnd(.5,3),cz,ev.wx*rnd(14,22),0,ev.wz*rnd(14,22),.5,.12,.95,.98,1);}
    if(ev.t>=ev.dur)G.ev=null;
  }
  const el=$('#evTag'),txt=G.goldenT>0?'⭐ 골든 퍽 '+Math.ceil(G.goldenT):(ev&&ev.k==='gust'?'🌬️ 돌풍 '+Math.ceil(ev.dur-ev.t):'');
  if(el.textContent!==txt){el.textContent=txt;el.className=txt?'on':'';}
}
function evSim(h){   // gust push (fixed step)
  const ev=G.ev;if(!ev||ev.k!=='gust'||G.state!=='play')return;
  const pk=G.puck;pk.vx+=ev.wx*5*h;pk.vz+=ev.wz*5*h;
  for(const p of G.pengs){if(p.goalie||p.frozen)continue;p.vx+=ev.wx*2.6*h;p.vz+=ev.wz*2.6*h;}
}
function goldenGoal(tm){   // called from scored(): a golden-puck goal is worth 2
  if(!(G.goldenT>0))return false;
  G.goldenT=0;puckGold(false);tm.score++;$('#evTag').className='';
  return true;
}
