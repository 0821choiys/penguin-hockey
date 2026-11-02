
/* ---------- team colour / hat / trail / penguin unlocks (moved here from the removed 팀 선택 screen) ---------- */
function sqBuy(list,k,cost,apply){
  if(!save[list].includes(k)){
    if(save.points<cost){flashMsg('포인트가 부족해요!');return;}
    save.points-=cost;save[list].push(k);flashMsg('해금했어요! ✨');
  }
  if(apply)apply();persist();SFX.ui();renderSquad();$('#ptsN').textContent=save.points;
}
function renderSqStyle(){
  const el=$('#sqStyle');if(!el)return;
  const cap=TYPES[save.type]||TYPES.basic;
  const chip=(attr,k,name,own,sel,cost,lockTxt)=>'<button class="sq-chip'+(sel?' on':'')+(own?'':' lock')+'" '+attr+'="'+k+'">'+name+'<small>'+(own?(sel?'사용 중':'사용'):(lockTxt||'🔒 '+cost+'P'))+'</small></button>';
  let h='<div class="sq-st-row"><span class="sq-st-l">주장</span><span>'+cap.name+' · 특수 기술 <b>'+SPECIALS[cap.special]+'</b></span></div>';
  h+='<div class="sq-st-row"><span class="sq-st-l">팀 색</span><div class="sq-chips">'+['blue','red'].map(k=>chip('data-sqteam',k,k==='blue'?'🔵 블루':'🔴 레드',true,save.team===k)).join('')+'</div></div>';
  h+='<div class="sq-st-row"><span class="sq-st-l">모자</span><div class="sq-chips">'+Object.keys(HATS).map(k=>chip('data-sqhat',k,HATS[k].name,save.hats.includes(k),save.hat===k,HATS[k].cost)).join('')+'</div></div>';
  h+='<div class="sq-st-row"><span class="sq-st-l">트레일</span><div class="sq-chips">'+Object.keys(TRAILS).map(k=>chip('data-sqtrail',k,TRAILS[k].name,save.trails.includes(k),save.trail===k,TRAILS[k].cost)).join('')+'</div></div>';
  const locked=Object.keys(TYPES).filter(k=>!save.types.includes(k));
  if(locked.length)h+='<div class="sq-st-row"><span class="sq-st-l">펭귄 해금</span><div class="sq-chips">'+locked.map(k=>TYPES[k].exclusive?chip('data-sqlock',k,TYPES[k].name,false,false,0,'💻 개발자 티어 보상'):chip('data-sqbuy',k,TYPES[k].name,false,false,TYPES[k].cost)).join('')+'</div></div>';
  el.innerHTML=h;
  el.querySelectorAll('[data-sqteam]').forEach(b=>{b.onclick=()=>{save.team=b.dataset.sqteam;persist();SFX.ui();renderSquad();};});
  el.querySelectorAll('[data-sqhat]').forEach(b=>{b.onclick=()=>{const k=b.dataset.sqhat;sqBuy('hats',k,HATS[k].cost,()=>{save.hat=k;});};});
  el.querySelectorAll('[data-sqtrail]').forEach(b=>{b.onclick=()=>{const k=b.dataset.sqtrail;sqBuy('trails',k,TRAILS[k].cost,()=>{save.trail=k;});};});
  el.querySelectorAll('[data-sqbuy]').forEach(b=>{b.onclick=()=>{const k=b.dataset.sqbuy;sqBuy('types',k,TYPES[k].cost,null);};});
  el.querySelectorAll('[data-sqlock]').forEach(b=>{b.onclick=()=>flashMsg('🔒 개발자 티어(레이팅 2100)를 달성하면 얻을 수 있어요');});
}
