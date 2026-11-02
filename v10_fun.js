
/* ================= v10 fun pack: ice items, FEVER TIME, shootout ================= */
// ---------- ice items ----------
const ITEMS={
  fish:{ico:'🐟',name:'생선',desc:'4초 스피드 업 + 특수 게이지 충전'},
  snow:{ico:'⛄',name:'눈덩이',desc:'가장 가까운 상대를 넘어뜨려요'},
  fire:{ico:'🔥',name:'불꽃 퍽',desc:'다음 슛 위력 +25%'},
  magnet:{ico:'🧲',name:'자석',desc:'3초 동안 퍽을 끌어당겨요'}
};
const ITEM_KEYS=Object.keys(ITEMS);
const itemTex={};
for(const k of ITEM_KEYS){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  x.fillStyle='rgba(10,31,58,.92)';x.beginPath();x.arc(64,64,58,0,TAU);x.fill();
  x.lineWidth=7;x.strokeStyle='#ffc93c';x.beginPath();x.arc(64,64,55,0,TAU);x.stroke();
  x.font='64px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(ITEMS[k].ico,64,70);
  itemTex[k]=new T.CanvasTexture(c);
}
const itemPool=[0,1,2].map(()=>{
  const g=new T.Group();
  const s=new T.Sprite(new T.SpriteMaterial({map:itemTex.fish,transparent:true,depthWrite:false}));s.scale.set(1.75,1.75,1);s.position.y=1.1;g.add(s);
  const r=new T.Mesh(new T.RingGeometry(.62,.8,28),new T.MeshBasicMaterial({color:0xffc93c,transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.y=.05;g.add(r);
  g.visible=false;scene.add(g);return {g,s,r,used:false};
});
const snowMesh=new T.Mesh(new T.SphereGeometry(.22,12,8),std(0xffffff,.6));snowMesh.visible=false;snowMesh.castShadow=true;scene.add(snowMesh);
G.items=[];G.itemT=6;G.snowballs=[];
function itemsOn(){const c=G.cfg;return !!(c&&save.set.items&&G.view==='game'&&['quick','free','tour'].includes(c.mode)&&!G.so);}
function itemsClear(){for(const it of G.items){it.slot.used=false;it.slot.g.visible=false;}G.items=[];G.snowballs=[];snowMesh.visible=false;G.itemT=rnd(6,9);}
function spawnItem(k,x,z){
  const slot=itemPool.find(s=>!s.used);if(!slot)return null;
  if(x===undefined){for(let i=0;i<12;i++){x=rnd(-W+6,W-6);z=rnd(-D+3,D-3);if(Math.hypot(x-G.puck.x,z-G.puck.z)>5)break;}}
  k=k||ITEM_KEYS[(Math.random()*ITEM_KEYS.length)|0];
  slot.used=true;slot.s.material.map=itemTex[k];slot.s.material.needsUpdate=true;slot.g.position.set(x,0,z);slot.g.visible=true;
  const it={k,x,z,life:14,slot};G.items.push(it);
  for(let i=0;i<14;i++){const a=rnd(TAU);emit(x,.4,z,Math.cos(a)*3,rnd(2,4),Math.sin(a)*3,.6,.2,1,.85,.3);}
  return it;
}
function applyItem(p,k){
  const I=ITEMS[k],mine=p.team===G.mine;
  if(k==='fish'){p.boostT=4;p.cd.special=Math.max(0,p.cd.special-3);}
  else if(k==='fire'){p.fireT=8;}
  else if(k==='magnet'){p.magT=3;}
  else if(k==='snow'){
    let tg=null,bd=16;for(const o of p.team.opp.skaters){if(o.frozen||o.fall>0)continue;const d=Math.hypot(o.x-p.x,o.z-p.z);if(d<bd){bd=d;tg=o;}}
    if(tg)G.snowballs.push({x0:p.x,z0:p.z,to:tg,t:0,by:p});else p.boostT=2;
  }
  popAt(I.ico+' '+I.name+'!',p.x,2.7,p.z);SFX.pickup();burst(p.x,p.z,10,1);
  if(mine){hypeToast(I.ico+' '+I.name+' · '+I.desc);vib(15);}
}
function itemFrame(dt){
  const on=itemsOn();
  if(!on){if(G.items.length||G.snowballs.length)itemsClear();return;}
  if(G.state!=='play')return;
  G.itemT-=dt;if(G.itemT<=0){G.itemT=rnd(9,15);if(G.items.length<2)spawnItem();}
  for(let i=G.items.length-1;i>=0;i--){
    const it=G.items[i];it.life-=dt;const g=it.slot.g;
    it.slot.s.position.y=1.1+Math.sin(G.t*3+i)*.15;it.slot.r.rotation.z+=dt*2;
    g.visible=it.life>3||Math.sin(G.t*20)>0;
    let taker=null;
    for(const p of G.pengs){if(p.goalie||p.frozen||p.fall>0)continue;if(Math.hypot(p.x-it.x,p.z-it.z)<1.2){taker=p;break;}}
    if(taker||it.life<=0){it.slot.used=false;g.visible=false;G.items.splice(i,1);if(taker)applyItem(taker,it.k);}
  }
  // snowball flight
  snowMesh.visible=false;
  for(let i=G.snowballs.length-1;i>=0;i--){
    const b=G.snowballs[i];b.t+=dt/.42;const k=Math.min(1,b.t),x=lerp(b.x0,b.to.x,k),z=lerp(b.z0,b.to.z,k),y=.8+Math.sin(k*Math.PI)*2.2;
    snowMesh.visible=true;snowMesh.position.set(x,y,z);emit(x,y,z,rnd(-.5,.5),rnd(0,.5),rnd(-.5,.5),.3,.12,1,1,1);
    if(b.t>=1){G.snowballs.splice(i,1);if(!b.to.frozen&&b.to.fall<=0){knock(b.to,1.05);popAt('철퍼덕!',b.to.x,2.4,b.to.z);}SFX.bump(.7);for(let j=0;j<18;j++){const a=rnd(TAU);emit(x,.6,z,Math.cos(a)*4,rnd(1,4),Math.sin(a)*4,.6,.22,1,1,1);}}
  }
  // effect visuals
  for(const p of G.pengs){
    if(p.frozen)continue;
    if(p.boostT>0&&Math.random()<dt*30)emit(p.x,.3,p.z,-p.vx*.1,rnd(.5,1.5),-p.vz*.1,.45,.2,.45,.85,1);
    if(p.fireT>0&&Math.random()<dt*25)emit(p.x+rnd(-.3,.3),1.2,p.z+rnd(-.3,.3),0,rnd(1,2.5),0,.4,.22,1,rnd(.35,.6),.1);
    if(p.magT>0&&Math.random()<dt*25){const pk=G.puck;emit(lerp(p.x,pk.x,Math.random()),.3,lerp(p.z,pk.z,Math.random()),0,.6,0,.35,.16,.5,.9,1);}
  }
  const pk=G.puck,ps=Math.hypot(pk.vx,pk.vz);
  if(pk.shot&&pk.shot.fire&&ps>6)for(let j=0;j<3;j++)emit(pk.x,.2,pk.z,-pk.vx*.05+rnd(-1,1),rnd(.5,2),-pk.vz*.05+rnd(-1,1),.35,.28,1,rnd(.3,.6),.05);
}
function v10Sim(h){   // magnet pull (fixed step)
  const pk=G.puck;
  for(const p of G.pengs){
    if(!(p.magT>0)||p.frozen||p.fall>0)continue;
    const dx=p.x-pk.x,dz=p.z-pk.z,d=Math.hypot(dx,dz);
    if(d>1.15&&d<7){const f=24*h;pk.vx+=dx/d*f;pk.vz+=dz/d*f;const sp=Math.hypot(pk.vx,pk.vz);if(sp>14){pk.vx*=14/sp;pk.vz*=14/sp;}}
  }
}
function v10ShotMul(p,tap){
  let m=1;p._fire=false;
  if(p.fireT>0&&!tap){m*=1.25;p.fireT=0;p._fire=true;}
  if(G.hype&&G.hype.feverT>0&&p.team===G.mine)m*=1.08;
  return m;
}
function fxChipFrame(){
  const el=$('#fxChip');if(!el)return;const p=G.player;let t='';
  if(p&&G.view==='game'){const a=[];if(p.boostT>0)a.push('🐟 '+p.boostT.toFixed(1));if(p.fireT>0)a.push('🔥 다음 슛 강화');if(p.magT>0)a.push('🧲 '+p.magT.toFixed(1));t=a.join('  ');}
  if(el.textContent!==t){el.textContent=t;el.classList.toggle('on',!!t);}
}

// ---------- FEVER TIME ----------
function feverStart(){
  const h=G.hype;if(!h||!G.mine||G.so)return;
  h.feverT=8;h.feverN=(h.feverN||0)+1;
  hypeToast('🔥 FEVER TIME! 8초 동안 슛·스피드 UP');SFX.win();G.cheer=1;vib([20,30,20,30,60]);
}
function feverFrame(dt){
  const h=G.hype,on=!!(h&&h.feverT>0&&G.view==='game'&&!G.so);
  document.body.classList.toggle('fever',on);
  const el=$('#fever');
  if(!on){if(el.className)el.className='';return;}
  if(G.state==='play'){h.feverT-=dt;if(h.feverT<=0){h.feverT=0;hypeToast('피버 종료 · 다시 콤보 x5에 도전!');}}
  const txt='🔥 FEVER '+Math.ceil(h.feverT);if(el.textContent!==txt)el.textContent=txt;el.className='on';
}

// ---------- SHOOTOUT ----------
function soAllowed(){return !!(G.mine&&G.cfg&&G.cfg.time&&!G.cfg.challenge&&G.cfg.mode!=='demo');}
function soStart(){
  G.so={turn:0,res:{mine:[],opp:[]},s:{mine:0,opp:0},t:0,phase:'pre',wait:0,done:false,shooterTeam:null};
  G.ot=false;itemsClear();if(G.hype){G.hype.feverT=0;G.hype.combo.n=0;G.hype.combo.t=0;}comboHide();
  $('#clock').textContent='SO';lastClock='SO';
  const mt=$('#modeTag');mt.textContent='🥅 SHOOTOUT';mt.classList.add('sd');
  hypeBanner('SHOOTOUT!',['🥅 승부차기 · 3번씩, 같으면 서든데스'],3,'');SFX.whistle();
  soSetup();
}
function soSetup(){
  const so=G.so,tm=so.turn%2===0?G.mine:G.mine.opp,pk=G.puck;
  for(const p of G.pengs){if(p.goalie)continue;p.frozen=true;p.x=p.ox=p.rx=0;p.z=p.oz=p.rz=-D-6;p.vx=p.vz=0;p.charging=false;p.charge=0;p.boostT=p.fireT=p.magT=0;}
  const s=tm.skaters[0];
  s.frozen=false;s.x=s.ox=s.rx=-tm.dir*3;s.z=s.oz=s.rz=0;s.vx=s.vz=0;s.heading=tm.dir>0?Math.PI/2:-Math.PI/2;s.fall=0;s.getup=0;s.slow=0;s.dashT=0;s.slideT=0;s.cd.shoot=s.cd.pass=0;s.ai.plan=null;s.ai.cool=0;s.pose='play';
  for(const g of[G.mine.goalie,G.mine.opp.goalie])if(g){g.x=g.ox=g.hx;g.z=g.oz=0;g.vx=g.vz=0;g.ai.zs=0;g.ai.seenT=0;g.diveT=0;g.pose='play';}
  pk.x=pk.ox=s.x+tm.dir*1.1;pk.z=pk.oz=0;pk.vx=pk.vz=0;pk.shot=null;pk.last=s;pk.lastTeam=tm;pk.lastT=G.t;G.pass=null;G.pending=null;
  setHuman(tm===G.mine?s:null);
  so.t=0;so.phase='play';so.shooterTeam=tm;
  G.state='ready';G.stateT=1.6;G.countN=3;
  showBanner(tm===G.mine?'내 차례! 7초 안에 슛':'상대 차례 · 골키퍼를 믿어요',1300,tm===G.mine?'g':'r');
  soHud();
}
function soGoal(tm){if(G.so&&G.so.phase==='play'&&tm===G.so.shooterTeam)soResult(true);}
function soResult(ok){
  const so=G.so,mine=so.shooterTeam===G.mine,key=mine?'mine':'opp';
  so.phase='wait';so.wait=1.6;so.res[key].push(ok);if(ok)so.s[key]++;
  if(ok){SFX.goal();G.cam.shake=Math.max(G.cam.shake,.45*shakeK());hypeBanner(mine?'GOAL!':'실점…',[],mine?2:0,so.shooterTeam.key);
    const gx=so.shooterTeam.dir*W;for(let i=0;i<50;i++){const a=rnd(TAU),s=rnd(3,9);emit(gx,rnd(.6,2.5),rnd(-GW,GW),Math.cos(a)*s*.6,rnd(2,8),Math.sin(a)*s,rnd(.8,1.4),rnd(.2,.4),1,rnd(.7,1),rnd(.2,.6));}}
  else{SFX.save();hypeBanner(mine?'막혔다!':'SAVE!',[],mine?0:2,mine?so.shooterTeam.opp.key:G.mine.key);}
  setHuman(null);soHud();
}
function soNext(){
  const so=G.so;so.turn++;
  const a=so.res.mine.length,b=so.res.opp.length,sa=so.s.mine,sb=so.s.opp,R=3;
  if(a<=R&&b<=R&&(sa+(R-a)<sb||sb+(R-b)<sa))return soEnd();
  if(a===b&&a>=R&&sa!==sb)return soEnd();
  if(a>=10&&b>=10)return soEnd();
  soSetup();
}
function soEnd(){
  const so=G.so;so.done=true;so.phase='done';
  for(const p of G.pengs)p.frozen=false;
  resetPositions();setHuman(G.mine.skaters[0]);soHud();
  SFX.whistle();endMatch();
}
function soFrame(dt){
  const so=G.so;if(!so||so.done||G.view!=='game')return;
  if(so.phase==='wait'){so.wait-=dt;if(so.wait<=0)soNext();return;}
  if(so.phase!=='play'||G.state!=='play')return;
  so.t+=dt;const pk=G.puck,sp=Math.hypot(pk.vx,pk.vz),def=so.shooterTeam.opp;
  const shotDone=pk.shot&&G.t-pk.shot.t>.35&&sp<2;
  const saved=pk.last&&pk.last.goalie&&pk.last.team===def;
  const wide=Math.abs(pk.x)>W-.2&&Math.abs(pk.z)>=GW-.05;
  if(so.t>7||shotDone||saved||wide)soResult(false);
}
function soHud(){
  const el=$('#soHud'),so=G.so;
  if(!so||so.done){el.className='';return;}
  const row=(nm,arr,col,me)=>{let m='';const n=Math.max(3,arr.length+(so.phase==='play'&&so.shooterTeam===(me?G.mine:G.mine.opp)?1:0));for(let i=0;i<n;i++)m+='<i class="'+(i<arr.length?(arr[i]?'g':'x'):'e')+'"></i>';return '<div class="so-r"><b style="color:'+col+'">'+nm+'</b>'+m+'</div>';};
  const mk=G.mine.key,ok=G.mine.opp.key;
  el.innerHTML='<div class="so-t">🥅 승부차기 '+so.s.mine+' : '+so.s.opp+'</div>'+row(mk==='blue'?'BLUE':'RED',so.res.mine,mk==='blue'?'#7fb6ff':'#ff8d99',true)+row(ok==='blue'?'BLUE':'RED',so.res.opp,ok==='blue'?'#7fb6ff':'#ff8d99',false);
  el.className='on';
}
function funFrame(dt){itemFrame(dt);feverFrame(dt);soFrame(dt);fxChipFrame();puckRing.material.color.setHex(G.carry&&G.view==='game'?(G.carry.team.key==='blue'?0x3d8bff:0xff4d5e):0x1d5fa8);}
function funReset(){itemsClear();G.so=null;try{$('#soHud').className='';$('#fever').className='';document.body.classList.remove('fever');}catch(e){}for(const p of G.pengs){p.frozen=false;p.boostT=p.fireT=p.magT=0;}}
