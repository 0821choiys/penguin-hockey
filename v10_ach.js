
/* ================= v10 achievements (auto-unlock, one-time reward, saved) ================= */
const realMatch=()=>!!(G.cfg&&G.mine&&G.cfg.mode!=='demo'&&G.cfg.mode!=='practice'&&!G.cfg.tutorial);
const ACH=[
  {id:'a_win1',ico:'🏆',name:'첫 승리',desc:'경기에서 처음 이기기',n:1,pts:30,prog:()=>save.stats.wins},
  {id:'a_goal1',ico:'🥅',name:'첫 골',desc:'처음으로 골 넣기',n:1,pts:20,prog:()=>save.cum.goals},
  {id:'a_hat',ico:'🎩',name:'해트트릭',desc:'한 경기에서 같은 펭귄으로 3골',n:1,pts:60,prog:()=>save.cum.hatTrick},
  {id:'a_chain10',ico:'🔗',name:'패스 마스터',desc:'끊기지 않는 연속 패스 10회',n:10,pts:50,prog:()=>save.cum.chainBest},
  {id:'a_power',ico:'💥',name:'캐논 슈터',desc:'강슛(충전 70%↑)으로 득점',n:1,pts:30,prog:()=>save.cum.powerGoal},
  {id:'a_clean',ico:'🧱',name:'철벽',desc:'무실점으로 승리',n:1,pts:40,prog:()=>save.cum.cleanWin},
  {id:'a_tour',ico:'👑',name:'토너먼트 챔피언',desc:'토너먼트 우승',n:1,pts:80,prog:()=>save.stats.tourClears},
  {id:'a_allpeng',ico:'🐧',name:'펭귄 수집가',desc:'모든 펭귄 5종 해금 (큰바다쇠오리 제외)',n:5,pts:100,prog:()=>save.types.filter(k=>!TYPES[k].exclusive).length},
  {id:'a_allhat',ico:'🧢',name:'패셔니스타',desc:'모든 모자 해금',n:Object.keys(HATS).length,pts:60,prog:()=>save.hats.length},
  {id:'a_allchal',ico:'🎯',name:'챌린지 정복',desc:'모든 챌린지 클리어',n:CHALLENGES.length,pts:120,prog:()=>CHALLENGES.filter(c=>save.cleared[c.id]).length},
  {id:'a_hit',ico:'💢',name:'몸싸움왕',desc:'BIG HIT 10회',n:10,pts:40,prog:()=>save.cum.bigHit},
  {id:'a_so',ico:'🥅',name:'승부차기의 신',desc:'승부차기에서 승리',n:1,pts:40,prog:()=>save.cum.soWin},
  {id:'a_golden',ico:'⭐',name:'황금의 순간',desc:'골든 퍽으로 득점 (2점 골)',n:1,pts:30,prog:()=>save.cum.golden},
  {id:'a_steal',ico:'🦊',name:'퍽 도둑',desc:'상대에게서 퍽 빼앗기 30회',n:30,pts:40,prog:()=>save.cum.steals}
];
let achQ=[],achShowing=false,achT=0;
function achCheck(){
  const got=[];
  for(const a of ACH){if(save.ach[a.id])continue;let p=0;try{p=a.prog()|0;}catch(e){}if(p>=a.n){save.ach[a.id]=true;save.points+=a.pts;got.push(a);}}
  if(!got.length)return got;
  persist();try{$('#ptsN').textContent=save.points;}catch(e){}
  if(got.length>2)achQ.push({ico:'🏆',name:'업적 '+got.length+'개 달성!',pts:got.reduce((s,a)=>s+a.pts,0)});else achQ.push(...got);
  achNext();return got;
}
function achNext(){
  const el=$('#achPop');if(achShowing||!achQ.length||!el)return;achShowing=true;const a=achQ.shift();
  el.innerHTML='<i>'+a.ico+'</i><div><small>업적 달성!</small><b>'+a.name+'</b></div><span>+'+a.pts+'P</span>';
  el.className='';void el.offsetWidth;el.className='on';SFX.win();vib([20,30,40]);
  setTimeout(()=>{el.className='';setTimeout(()=>{achShowing=false;achNext();},350);},2600);
}
function achFrame(dt){achT+=dt;if(achT>=1){achT=0;achCheck();}}
function achHtml(){
  const n=ACH.filter(a=>save.ach[a.id]).length;
  let h='<div class="lbl" style="text-align:center">업적 '+n+' / '+ACH.length+' · 달성하면 보상 포인트가 바로 지급돼요 (한 번만)</div><div class="ach-grid">';
  for(const a of ACH){const done=!!save.ach[a.id];let p=0;try{p=Math.min(a.n,a.prog()|0);}catch(e){}
    h+='<div class="ach'+(done?' done':'')+'"><i>'+a.ico+'</i><div class="gi"><b>'+a.name+'</b><small>'+a.desc+'</small><div class="pbar"><i style="width:'+(p/a.n*100)+'%"></i></div><small>'+(done?'달성 완료 ✔':p+' / '+a.n)+' · ⭐'+a.pts+'P</small></div></div>';}
  return h+'</div>';
}
// stat bars with numbers (base + enhancement + mastery)
function statGrid(k){
  const s=TYPES[k].stats,add=(save.lv[k]|0)*LV_STAT+mxInfo(k).lv*MS_STAT+((save.brk&&save.brk[k])|0)*BRK.stat;
  return '<div class="st-grid">'+Object.keys(s).map(n=>{const v=s[n]+(save.types.includes(k)?add:0);return '<span>'+STATN[n]+'</span><div class="bar"><i style="width:'+Math.min(100,v*20)+'%"></i></div><b>'+v.toFixed(1)+'</b>';}).join('')+'</div>';
}
// rainbow trail colour without allocating every call
const trailTmp=new T.Color(),trailArr=[1,1,1];

// two-step purchase: first tap arms the chip and shows the price, second tap within 3 s buys
function buyConfirm(b,list,k,cost,apply){
  if(save[list].includes(k)||save.points<cost){sqBuy(list,k,cost,apply);return;}
  if(b.dataset.arm==='1'){delete b.dataset.arm;sqBuy(list,k,cost,apply);return;}
  document.querySelectorAll('[data-arm]').forEach(x=>{delete x.dataset.arm;x.classList.remove('arm');});
  b.dataset.arm='1';b.classList.add('arm');const sm=b.querySelector('small');if(sm)sm.textContent='한 번 더 눌러 구매';
  flashMsg(cost+'P를 사용해 구매할까요? 한 번 더 누르면 구매해요 (보유 '+save.points+'P)');SFX.ui();
  clearTimeout(buyConfirm.t);buyConfirm.t=setTimeout(()=>{if(b.dataset.arm){delete b.dataset.arm;b.classList.remove('arm');if(sm)sm.textContent='🔒 '+cost+'P';}},3000);
}
