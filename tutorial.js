
/* ================= TUTORIAL: 8 hands-on steps, each completed by actually doing it ================= */
const TUT_REWARD=50;
const TUT_STEPS=[
  {id:'move',t:'이동하기',pc:'<kbd>W A S D</kbd> 또는 <kbd>방향키</kbd>로 <b>주황 원</b>까지 가보세요',mo:'화면 <b>왼쪽</b>을 누른 채 끌어서 <b>주황 원</b>까지 가보세요',hl:'#joyZone'},
  {id:'get',t:'퍽 잡기',pc:'검은 원반이 <b>퍽</b>이에요. 퍽에 바짝 다가가 보세요',mo:'검은 원반이 <b>퍽</b>이에요. 퍽에 바짝 다가가 보세요',hl:'#joyZone'},
  {id:'tap',t:'짧은 슛 · 톡!',pc:'<kbd>Space</kbd>를 <b>짧게</b> 눌러 퍽을 톡 쳐보세요 (마우스 클릭도 돼요)',mo:'<b>슛</b> 버튼을 <b>짧게</b> 눌러 퍽을 톡 쳐보세요',hl:'#tbShoot',puck:true},
  {id:'power',t:'강슛 · 쾅!',pc:'<kbd>Space</kbd>를 <b>길게</b> 눌러 게이지를 70% 이상 채운 뒤 떼세요',mo:'<b>슛</b> 버튼을 <b>길게</b> 눌러 게이지를 70% 이상 채운 뒤 떼세요',hl:'#tbShoot',puck:true},
  {id:'pass',t:'패스',pc:'퍽 가까이에서 <kbd>E</kbd>를 눌러 <b>초록 링</b> 동료에게 패스! 받은 동료로 조작이 바뀌어요',mo:'퍽 가까이에서 <b>패스</b> 버튼! 받은 동료로 조작이 바뀌어요',hl:'#tbPass',puck:true},
  {id:'dash',t:'대시',pc:'<kbd>Shift</kbd>로 순간 가속해 보세요',mo:'<b>대시</b> 버튼으로 순간 가속해 보세요',hl:'#tbDash'},
  {id:'special',t:'특수 기술',pc:'<kbd>Q</kbd>로 <b>{SP}</b>을(를) 써보세요. 왼쪽 아래 게이지가 차면 다시 쓸 수 있어요',mo:'<b>특수</b> 버튼으로 <b>{SP}</b>을(를) 써보세요',hl:'#tbSpec'},
  {id:'goal',t:'골 넣기!',pc:'배운 걸 모두 써서 골키퍼를 뚫어 보세요! <b>구석</b>을 노리면 잘 들어가요',mo:'배운 걸 모두 써서 골키퍼를 뚫어 보세요! <b>구석</b>을 노리면 잘 들어가요',hl:'#tbShoot',puck:true}
];
const TUT={active:false,i:0,t:0,wait:0,fresh:false,s0:0,hold:0,tx:0,tz:0,d0:1,finishT:0,touch:null};
let tutRing=null;
{const m=new T.Mesh(new T.RingGeometry(1.15,1.55,44),new T.MeshBasicMaterial({color:0xff8a2a,transparent:true,opacity:.95,depthWrite:false,depthTest:false,side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.09;m.visible=false;scene.add(m);tutRing=m;}
function tutGlowOff(){document.querySelectorAll('.tutglow').forEach(e=>e.classList.remove('tutglow'));}
function tutStart(){
  SFX.init();SFX.ui();save.tut.asked=true;persist();$('#tutAsk').classList.remove('on');
  startMatch({mode:'practice',tutorial:true,size:2,time:0,diff:'easy',noOpp:true,goalieOnly:true,noScoreOpp:true,passiveMates:true,tag:'🎓 TUTORIAL'});
}
function tutInit(){   // runs on every match setup (from hypeReset)
  TUT.active=!!(G.cfg&&G.cfg.tutorial);tutGlowOff();if(tutRing)tutRing.visible=false;
  if(!TUT.active){$('#tut').classList.remove('on');return;}
  TUT.i=0;TUT.wait=0;TUT.finishT=0;TUT.fresh=true;
}
function tutGivePuck(say){
  const p=G.player,pk=G.puck;if(!p||Math.hypot(pk.x-p.x,pk.z-p.z)<3.5)return;
  const d=G.mine.dir;p.heading=d>0?Math.PI/2:-Math.PI/2;
  pk.x=clamp(p.x+d*1.5,-W+1,W-1);pk.z=clamp(p.z,-D+1,D-1);pk.vx=pk.vz=0;pk.ox=pk.x;pk.oz=pk.z;pk.shot=null;
  if(say)popAt('퍽을 가져다 놨어요!',pk.x,1.6,pk.z);
}
function tutRender(){
  const st=TUT_STEPS[TUT.i];$('#tut').classList.add('on');
  let sp='특수 기술';try{sp=SPECIALS[G.player.ty.special]||sp;}catch(e){}
  $('#tutStep').textContent=(TUT.i+1)+' / '+TUT_STEPS.length;
  $('#tutDots').innerHTML=TUT_STEPS.map((x,i)=>'<i class="'+(i<TUT.i?'d':i===TUT.i?'c':'')+'"></i>').join('');
  $('#tutTitle').textContent=st.t;$('#tutText').innerHTML=(IS_TOUCH?st.mo:st.pc).replace('{SP}',sp);
  tutGlowOff();if(IS_TOUCH&&st.hl){const e=$(st.hl);if(e)e.classList.add('tutglow');}
  TUT.touch=IS_TOUCH;
}
function tutEnter(){
  const st=TUT_STEPS[TUT.i],p=G.player;TUT.t=0;TUT.hold=0;TUT.s0=G.mine?G.mine.score:0;
  tutRing.visible=false;$('#tutBar').style.width='0%';
  if(p&&st.id==='move'){const d=G.mine.dir;TUT.tx=clamp(p.x+d*7,-W+3,W-3);TUT.tz=4.5;tutRing.position.set(TUT.tx,.09,TUT.tz);tutRing.visible=true;TUT.d0=Math.hypot(p.x-TUT.tx,p.z-TUT.tz)||1;}
  if(p&&st.id==='get')TUT.d0=Math.max(1,Math.hypot(G.puck.x-p.x,G.puck.z-p.z)-1.6);
  if(st.puck)tutGivePuck(false);
  tutRender();
}
function tutNote(t){const n=$('#tutNote');n.textContent=t;n.classList.remove('on');void n.offsetWidth;n.classList.add('on');}
function tutOk(){
  if(TUT.wait>0||!TUT.active)return;TUT.wait=.9;SFX.passOk();vib(25);
  const el=$('#tut');el.classList.remove('ok');void el.offsetWidth;el.classList.add('ok');
  $('#tutTitle').textContent='✔ 잘했어요!';$('#tutBar').style.width='100%';tutRing.visible=false;
}
function tutEvent(type,a,b){
  if(!TUT.active||TUT.wait>0||TUT.finishT>0)return;
  const id=TUT_STEPS[TUT.i].id;
  if(type==='shot'){
    if(id==='tap'){if(b==='tap')tutOk();else if(b==='power')tutNote('짧게 톡! 눌렀다 바로 떼 보세요');}
    else if(id==='power'){if(b==='power'&&a>=.7)tutOk();else if(b==='power'||b==='tap')tutNote(b==='tap'?'더 길게 눌러야 강슛이에요!':'조금만 더 길게! ('+Math.round(a*100)+'% → 70%)');}
  }else if(type===id)tutOk();
}
function tutFrame(dt){
  if(!TUT.active)return;
  if(G.view!=='game'||!G.cfg||!G.cfg.tutorial){TUT.active=false;$('#tut').classList.remove('on');tutRing.visible=false;tutGlowOff();return;}
  if(TUT.fresh){TUT.fresh=false;hint(false);$('#obj').style.display='none';if(G.state==='ready'){G.state='play';G.stateT=0;$('#count').textContent='';}tutEnter();}
  if(TUT.touch!==IS_TOUCH)tutRender();
  if(TUT.finishT>0){TUT.finishT-=dt;if(TUT.finishT<=0)tutDone();return;}
  if(TUT.wait>0){TUT.wait-=dt;if(TUT.wait<=0){TUT.i++;tutEnter();}return;}
  const st=TUT_STEPS[TUT.i],p=G.player,pk=G.puck;if(!p)return;
  TUT.t+=dt;let prog=0;
  if(tutRing.visible)tutRing.scale.setScalar(1+.1*Math.sin(G.t*6));
  if(st.id==='move'){const d=Math.hypot(p.x-TUT.tx,p.z-TUT.tz);prog=1-Math.min(1,d/TUT.d0);if(d<1.7)tutOk();}
  else if(st.id==='get'){const d=Math.hypot(pk.x-p.x,pk.z-p.z);prog=1-Math.min(1,Math.max(0,d-1.6)/TUT.d0);if(canHit(p)){TUT.hold+=dt;if(TUT.hold>.25)tutOk();}else TUT.hold=0;}
  else if(st.id==='power')prog=p.charging?p.charge/.7:0;
  else if(st.id==='goal'&&G.mine.score>TUT.s0){$('#tutTitle').textContent='🎉 골!! 튜토리얼 완료!';$('#tutBar').style.width='100%';TUT.finishT=1.8;return;}
  if(TUT.wait<=0)$('#tutBar').style.width=Math.min(100,prog*100)+'%';
  // stuck helpers: never leave a beginner hunting for the puck
  if(st.puck&&G.state==='play'&&TUT.t>11&&!canHit(p)){tutGivePuck(true);TUT.t=0;}
  if(st.id==='get'&&TUT.t>20){tutGivePuck(true);TUT.t=0;}
}
function tutDone(){
  TUT.active=false;$('#tut').classList.remove('on');tutRing.visible=false;tutGlowOff();
  const first=!save.tut.done;save.tut.done=true;save.tut.asked=true;if(first)save.points+=TUT_REWARD;persist();
  G.state='over';G.stateT=1e9;G.result=null;SFX.win();vib([30,40,80]);
  const keys=IS_TOUCH
    ?[['이동','왼쪽 화면 끌기'],['슛','슛 버튼 (짧게 톡 · 길게 쾅)'],['패스','패스 버튼'],['대시','대시 버튼'],['특수 기술','특수 버튼'],['선수 교체','교체 버튼']]
    :[['이동','W A S D'],['슛','Space (짧게 톡 · 길게 쾅) / 클릭'],['패스','E / 오른쪽 클릭'],['대시','Shift'],['특수 기술','Q'],['선수 교체','F · 일시정지 P']];
  let html='<div class="rs-score">이제 실전이에요! 🐧🏒</div>';
  html+=first?'<div class="rs-rows"><div class="rs-row total"><span>튜토리얼 완료 보상</span><span>⭐ <b class="cu" data-to="'+TUT_REWARD+'">0</b> P</span></div></div>':'<div class="rs-note">완료 보상은 처음 한 번만 지급돼요.</div>';
  html+='<div class="tut-keys">'+keys.map(k=>'<div><b>'+k[0]+'</b><span>'+k[1]+'</span></div>').join('')+'</div>';
  html+='<div class="rs-next">좋은 플레이를 이어가면 콤보가 쌓이고, 특별한 골은 보너스가 커져요.<br>메인 메뉴의 🎯 목표에서 오늘의 미션도 확인해 보세요!</div>';
  openResult('튜토리얼 완료! 🎓',html,[['⚡ 빠른 경기 시작',()=>launch('quick')],['메인 메뉴',()=>toMenu()]]);
  hypeResultAnim();
}
let tutAskedNow=false;
function tutMaybeAsk(){if(tutAskedNow||save.tut.done||save.tut.asked||save.stats.played>0)return;tutAskedNow=true;$('#tutAsk').classList.add('on');}
$('#tutYes').onclick=()=>tutStart();
$('#tutNo').onclick=()=>{SFX.init();SFX.ui();save.tut.asked=true;persist();$('#tutAsk').classList.remove('on');};
$('#tutSkip').onclick=()=>{SFX.ui();TUT.active=false;toMenu();};
