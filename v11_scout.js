
/* ================= v11 scout: gacha (soft pity, weekly pickup, history), enhancement, breakthrough, card detail ================= */
// ---- gacha maths: every UI number and every roll reads GACHA (config block next to PULL_ODDS) ----
function epicChance(n){            // n = position in the current streak without Epic+ (1-based)
  const base=GACHA.odds[2]+GACHA.odds[3];
  if(n>=GACHA.hard)return 100;
  return Math.min(100,base+Math.max(0,n-GACHA.softFrom)*GACHA.softStep);
}
function gradeProbs(pity){         // % per grade for the next pull, given the current pity counter
  const E=epicChance(pity+1),lo=GACHA.odds[0]+GACHA.odds[1],ls=GACHA.odds[3]/(GACHA.odds[2]+GACHA.odds[3]);
  return [(100-E)*GACHA.odds[0]/lo,(100-E)*GACHA.odds[1]/lo,E*(1-ls),E*ls];
}
function gachaEff(){               // long-run rates including soft/hard pity (renewal chain over pity states)
  let w=1,tot=0;const acc=[0,0,0,0];
  for(let s=0;s<GACHA.hard;s++){const p=gradeProbs(s);for(let i=0;i<4;i++)acc[i]+=w*p[i];tot+=w;w*=1-epicChance(s+1)/100;if(w<=0)break;}
  return {p:acc.map(v=>v/tot),perEpic:tot};
}
function pickupNow(at){
  const now=at||new Date(),d=new Date(now.getFullYear(),now.getMonth(),now.getDate()),dow=(d.getDay()+6)%7;
  const mon=new Date(d.getFullYear(),d.getMonth(),d.getDate()-dow),epoch=new Date(2026,0,5);   // 2026-01-05 is a Monday
  const wk=Math.round((mon-epoch)/(7*864e5)),o=GACHA.rotOrder,type=o[((wk%o.length)+o.length)%o.length];
  return {type,wk,ends:new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()+7)};
}
const pickupRate=()=>GACHA.pickShare+(100-GACHA.pickShare)*(TYPE_W[pickupNow().type]||0)/100;
function endTxt(d){
  const ms=Math.max(0,d-new Date()),dd=Math.floor(ms/864e5),hh=Math.floor(ms%864e5/36e5),mm=Math.floor(ms%36e5/6e4);
  return '⏳ '+(dd?dd+'일 ':'')+hh+'시간 '+(dd?'':mm+'분 ')+'남음';
}
// ---- breakthrough (중복 카드 → ★) ----
function brkAvail(k){let v=save.brkPts[k]|0;for(let g=0;g<4;g++)v+=save.cards[k][g]*BRK.val[g];return v;}
function brkPlan(k){
  const b=save.brk[k]|0;if(b>=BRK.max)return{b,max:true};
  const need=BRK.need[b],use=[0,0,0,0];let have=save.brkPts[k]|0;
  for(let g=0;g<4&&have<need;g++)while(have<need&&save.cards[k][g]-use[g]>0){use[g]++;have+=BRK.val[g];}
  return{b,need,use,have,ok:have>=need,carry:Math.max(0,have-need),cost:BRK.cost[b],avail:brkAvail(k)};
}
function brkEffect(b){return '전 능력치 +'+BRK.stat.toFixed(2)+(BRK.cd[b]?' · 특수기술 쿨다운 -'+Math.round(BRK.cd[b]*100)+'%':'')+(b===BRK.max?' · 각성 오라':'');}
function doBreak(k){
  if(fxBusy||!save.types.includes(k))return false;
  const pl=brkPlan(k);if(pl.max){flashMsg('이미 최대 돌파(★'+BRK.max+')예요');return false;}
  if(!pl.ok){flashMsg('돌파 포인트가 '+(pl.need-pl.have)+'점 부족해요 (같은 펭귄 카드: 일반1·희귀2·영웅4·전설8점)');return false;}
  if(save.points<pl.cost){lackMsg(pl.cost);return false;}
  save.points-=pl.cost;for(let g=0;g<4;g++)save.cards[k][g]-=pl.use[g];
  save.brk[k]=pl.b+1;save.brkPts[k]=pl.carry;save.cum.brk++;
  save.scout.elog.unshift([k,pl.b,2,0]);save.scout.elog.length=Math.min(save.scout.elog.length,8);
  persist();$('#ptsN').textContent=save.points;
  playEnhFx({type:k,brk:true,from:pl.b,to:pl.b+1,cost:pl.cost,use:pl.use}).then(()=>renderScout());
  return true;
}
async function askBreak(k){
  const pl=brkPlan(k);if(pl.max||!pl.ok||save.points<pl.cost){doBreak(k);return;}
  const used=pl.use.map((n,g)=>n?GRADES[g].n+' '+n+'장':'').filter(Boolean).join(' · ');
  const ok=await askConfirm('★'+(pl.b+1)+' 돌파할까요?',
    '<div class="cf-card">'+cardHtml(k,{cw:96})+'</div><div class="cf-rows"><div>소모 카드: <b>'+TYPES[k].name+' '+used+'</b></div><div>돌파 포인트: '+pl.have+' / '+pl.need+(pl.carry?' (남는 '+pl.carry+'점은 다음 돌파로 이월)':'')+'</div><div>비용: <b>⭐ '+pl.cost+'P</b> (보유 '+save.points+'P)</div><div class="up">효과: '+brkEffect(pl.b+1)+'</div><small>돌파는 실패하지 않아요. 이름·특성·강화 레벨은 그대로 유지돼요.</small></div>','돌파하기');
  if(ok)doBreak(k);
}
// ---- generic confirm dialog (centred, title, info, primary + close) ----
function askConfirm(title,html,okLabel){
  return new Promise(res=>{const d=$('#cfmDlg');if(!d||window.__NOFX){res(true);return;}
    d.querySelector('.cd-body').innerHTML='<h3>'+title+'</h3>'+html+'<div class="row cf-btns"><button class="btn" data-cf="0">취소</button><button class="btn primary" data-cf="1">'+okLabel+'</button></div>';
    const done=v=>{d.classList.remove('on');d.onclick=null;document.removeEventListener('keydown',kd,true);res(v);};
    const kd=e=>{if(e.key==='Escape'){e.stopPropagation();done(false);}};document.addEventListener('keydown',kd,true);
    d.onclick=e=>{const b=e.target.closest('[data-cf]');if(b){SFX.ui();done(b.dataset.cf==='1');}else if(e.target===d||e.target.classList.contains('cd-x'))done(false);};
    d.classList.add('on');});
}
// ---- stat helpers ----
function statVal(k,n,lv,bk){return TYPES[k].stats[n]+(lv|0)*LV_STAT+mxInfo(k).lv*MS_STAT+(bk|0)*BRK.stat;}
function statCmp(k,lvA,lvB,bkA,bkB){
  return '<div class="st-cmp">'+Object.keys(TYPES[k].stats).map(n=>{const a=statVal(k,n,lvA,bkA),b=statVal(k,n,lvB,bkB),d=b-a;
    return '<span>'+STATN[n]+'</span><b>'+a.toFixed(2)+'</b><i>→</i><b class="'+(d>0?'up':'')+'">'+b.toFixed(2)+'</b><em>'+(d>0?'▲'+d.toFixed(2):'')+'</em>';}).join('')+'</div>';
}
// ---- enhancement result / breakthrough overlay ----
const efCw=m=>Math.max(64,Math.floor(Math.min(m,innerWidth*.42,(innerHeight-300)/1.42)));
function playEnhFx(o){
  if(window.__NOFX)return Promise.resolve('close');
  return new Promise(resolve=>{
    const ov=$('#enhFx');if(!ov){resolve('close');return;}
    fxBusy=true;fxOn++;fxStart();
    const k=o.type,box=ov.querySelector('.ef-box'),lvNow=save.lv[k]|0,bkNow=save.brk[k]|0;
    const tierA=tierOfLv(o.from),tierB=tierOfLv(o.to),col=o.ok===false?'#9fb0c2':o.brk?'#ffd45e':GRADES[Math.max(1,tierB)].c;
    let h='';
    if(o.brk){
      h+='<div class="ef-title" style="color:'+col+'">돌파 성공! ★'+o.to+'</div><div class="ef-card">'+cardHtml(k,{cls:'live tilt ef-pop',cw:efCw(200)})+'</div>';
      h+='<div class="ef-rows"><div class="ef-stars">'+'★'.repeat(o.to)+'<span>'+'☆'.repeat(BRK.max-o.to)+'</span></div><div>OVR <b class="ef-cnt" data-a="'+cardOvr(k,lvNow,o.from)+'" data-b="'+cardOvr(k,lvNow,o.to)+'">'+cardOvr(k,lvNow,o.from)+'</b></div>'+statCmp(k,lvNow,lvNow,o.from,o.to)+'<div class="up">'+brkEffect(o.to)+'</div><small>소모: ⭐ '+o.cost+'P · '+o.use.map((n,g)=>n?GRADES[g].n+' '+n+'장':'').filter(Boolean).join(' · ')+'</small></div>';
    }else if(o.ok){
      h+='<div class="ef-title" style="color:'+col+'">강화 성공!</div><div class="ef-card">'+cardHtml(k,{cls:'live tilt ef-pop',cw:efCw(200)})+'</div>';
      h+='<div class="ef-rows"><div class="ef-lv">Lv.'+o.from+' <i>→</i> <b>Lv.'+o.to+'</b></div><div>OVR <b class="ef-cnt" data-a="'+cardOvr(k,o.from)+'" data-b="'+cardOvr(k,o.to)+'">'+cardOvr(k,o.from)+'</b></div>'+statCmp(k,o.from,o.to,bkNow,bkNow);
      if(tierB>tierA)h+='<div class="up">🎴 '+GRADES[tierB].n+' 프레임으로 승급!</div>';
      if(o.to===5||o.to===10)h+='<div class="up">⚡ 특수기술 쿨다운 -'+(o.to===10?20:10)+'% 해금</div>';
      h+='<small>소모: ⭐ '+o.cost+'P · '+GRADES[o.g].n+' 카드 1장</small></div>';
    }else{
      const f=save.scout.fail[k]|0,next=enhRate(k,o.g);
      h+='<div class="ef-title" style="color:'+col+'">강화 실패</div><div class="ef-card fail">'+cardHtml(k,{cw:efCw(150)})+'</div>';
      h+='<div class="ef-rows"><div>소모: <b>⭐ '+o.cost+'P</b></div><div>카드: <b>돌려받았어요</b> · 레벨 하락 없음</div><div>다음 확률: <b class="up">'+next+'%</b> (실패 보정 +'+Math.min(ENH_FAIL_MAX,f)*ENH_FAIL_BONUS+'%)</div><div>'+(f>=ENH_PITY?'🎯 다음 강화는 <b class="up">성공 확정!</b>':'연속 실패 '+f+' / '+ENH_PITY+' · '+ENH_PITY+'회 실패하면 다음 강화 100%')+'</div></div>';
    }
    const again=!o.brk&&(save.lv[k]|0)<MAX_LV&&save.cards[k][o.g]>0&&save.points>=enhCost(save.lv[k]|0);
    h+='<div class="ef-foot"><button class="btn" data-ef="close">확인</button>'+(again?'<button class="btn primary" data-ef="again">다시 강화 · ⭐'+enhCost(save.lv[k]|0)+'P</button>':'')+'</div>';
    box.innerHTML=h;ov.style.setProperty('--aura',col);ov.classList.remove('fail');if(o.ok===false)ov.classList.add('fail');
    ov.classList.add('on');void box.offsetWidth;box.classList.add('in');
    let done=false;const finish=a=>{if(done)return;done=true;fxOn=Math.max(0,fxOn-1);ov.classList.remove('on');box.classList.remove('in');fxBusy=false;resolve(a);};
    ov.onclick=e=>{const b=e.target.closest('[data-ef]');if(b){SFX.ui();finish(b.dataset.ef);}else if(e.target===ov)finish('close');};
    setTimeout(()=>{
      const c=ov.querySelector('.ef-card .pc');if(!c)return;const p=ctr(c);
      if(o.ok===false){fxEmit(p.x,p.y,14,'#8b95a1',200,'s',.8);vib([12]);return;}
      const big=o.brk?3:tierOfLv(o.to);
      fxEmit(p.x,p.y,40+big*25,col,380+big*80,'s',1);if(big>=2||o.brk)fxEmit(p.x,p.y,20+big*8,col,420,'c',1.6);
      if(o.to>=6||o.brk){ov.classList.remove('quake');void ov.offsetWidth;ov.classList.add('quake');}
      if(o.brk)SFX.win();vib(o.to>=9||o.brk?[30,40,30,40,120]:[20,30,50]);
      const cnt=ov.querySelector('.ef-cnt');if(cnt){const a=+cnt.dataset.a,b=+cnt.dataset.b;let i=0;const n=14,t=setInterval(()=>{i++;cnt.textContent=Math.round(a+(b-a)*i/n);if(i>=n){clearInterval(t);if(b>a)cnt.insertAdjacentHTML('afterend',' <em class="up">▲'+(b-a)+'</em>');}},40);}
    },RM?60:280);
  });
}
// ---- card detail dialog ----
function openCard(k){
  const d=$('#cardDlg');if(!d)return;const t=TYPES[k],own=save.types.includes(k),lv=save.lv[k]|0,bk=save.brk[k]|0,m=mxInfo(k);
  let h='<div class="cd-grid"><div class="cd-l">'+(own?cardHtml(k,{cls:'live tilt',cw:Math.min(190,Math.floor(innerWidth*.4))}):'<div style="--cw:150px;opacity:.6"><div class="pc-backface">?</div></div>')+'</div><div class="cd-r">';
  h+='<h3>'+t.name+'</h3><div class="cd-sub">'+(PREF[k]?POSN[PREF[k]]:'만능')+' · '+(t.exclusive?'신화':GRADES[tierOfLv(lv)].n+' 프레임')+' · 특수기술 '+SPECIALS[t.special]+'</div>';
  h+='<div class="tt-line">'+TT[k].name+'<br>▲ '+TT[k].plus+'<br>▼ '+TT[k].minus+'</div>';
  if(own){
    h+=statGrid(k);
    h+='<div class="cd-grow"><div><span>강화</span><b>Lv.'+lv+' / '+MAX_LV+'</b>'+(lv<MAX_LV?'<small>다음 OVR '+cardOvr(k,lv+1)+'</small>':'<small>MAX</small>')+'</div><div><span>돌파</span><b class="pc-stars">'+('★'.repeat(bk)||'—')+'</b><small>'+(bk<BRK.max?'다음 ★ '+brkPlan(k).have+'/'+BRK.need[bk]+'점':'최대')+'</small></div><div><span>숙련</span><b>M'+m.lv+'</b><small>'+(m.need?m.cur+'/'+m.need+' XP (경기 출전)':'MAX')+'</small></div></div>';
    h+='<div class="cd-mats">보유 재료 카드: '+save.cards[k].map((n,g)=>'<span class="g'+g+'">'+GRADES[g].n+' '+n+'</span>').join('')+'<br><small>같은 종류 카드는 강화 재료(1장)와 돌파 포인트(일반1·희귀2·영웅4·전설8점)로 쓰여요</small></div>';
    const syn=SYN.filter(s=>s.link&&s.link.includes(k)).map(s=>s.name+' ('+s.desc+')');if(syn.length)h+='<div class="cd-mats">케미: '+syn.join(' · ')+'</div>';
    h+='<div class="row"><button class="btn primary" data-cd="enh">⬆ 강화·돌파</button><button class="btn" data-cd="close">닫기</button></div>';
  }else{
    const eff=GACHA.pickShare*(pickupNow().type===k?1:0)+(100-GACHA.pickShare)*(TYPE_W[k]||0)/100;
    h+='<div class="cd-mats">'+(t.exclusive?'💻 개발자 티어(레이팅 2100) 보상 또는 설정의 코드 입력으로 얻을 수 있어요':'미해금 — 스카우트 뽑기에서 얻을 수 있어요 (1회당 출현 확률 '+eff.toFixed(1)+'%'+(pickupNow().type===k?', 이번 주 픽업!':'')+')')+'</div><div class="row"><button class="btn" data-cd="close">닫기</button></div>';
  }
  d.querySelector('.cd-body').innerHTML=h+'</div></div>';
  d.onclick=e=>{const b=e.target.closest('[data-cd]');if(b){SFX.ui();d.classList.remove('on');if(b.dataset.cd==='enh'){enSel=k;scTab='enh';scMsg='';if(G.ui!=='sScout')goScreen('sScout');renderScout();}}else if(e.target===d||e.target.classList.contains('cd-x'))d.classList.remove('on');};
  d.classList.add('on');
}
addEventListener('keydown',e=>{if(e.key==='Escape'){const d=$('#cardDlg');if(d&&d.classList.contains('on')){d.classList.remove('on');e.stopPropagation();}}},true);
// ---- holographic tilt for showcase cards (detail, enhance, reveal) ----
let tiltEl=null;
const tiltReset=()=>{if(tiltEl){tiltEl.style.removeProperty('--rx');tiltEl.style.removeProperty('--ry');tiltEl.style.removeProperty('--mx');tiltEl.style.removeProperty('--my');tiltEl=null;}};
addEventListener('pointermove',e=>{
  const c=e.target&&e.target.closest?e.target.closest('.pc.tilt'):null;if(c!==tiltEl)tiltReset();if(!c||RM||document.body.classList.contains('rm'))return;
  const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  c.style.setProperty('--ry',((x-.5)*18).toFixed(1)+'deg');c.style.setProperty('--rx',((.5-y)*18).toFixed(1)+'deg');c.style.setProperty('--mx',(x*100).toFixed(0)+'%');c.style.setProperty('--my',(y*100).toFixed(0)+'%');tiltEl=c;
},{passive:true});
addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')tiltReset();},{passive:true});

// ---- scout screen sections ----
let enSel=null,enG=null,dexSort='ovr',dexF='all',dexQ='';
function enAutoG(k){for(let g=0;g<4;g++)if(save.cards[k][g]>0)return g;return 0;}   // cheapest card first, keeps high grades
function scPullHtml(){
  const sc=save.scout,pk=pickupNow(),P=TYPES[pk.type],free=sc.freeDay!==todayKey(),c1=free?0:GACHA.cost1,c10=GACHA.cost10,n=sc.pity+1,E=epicChance(n);
  let h='<div class="gb"><div class="gb-art">'+pengSVG(pk.type)+'</div><div class="gb-info"><div class="gb-kick">⭐ 주간 픽업 배너</div><div class="gb-name">'+P.name+'</div><div class="gb-tt">'+TT[pk.type].name+' · '+SPECIALS[P.special]+'</div>';
  h+='<div class="gb-chips"><span>픽업 확률 '+pickupRate().toFixed(0)+'%</span><span id="gbEnd">'+endTxt(pk.ends)+'</span></div>';
  h+='<div class="gb-note">'+(sc.pickMiss?'🎯 다음 영웅 이상은 <b>픽업 확정!</b>':'영웅 이상에서 픽업을 놓치면 다음 영웅 이상은 픽업 확정')+'</div></div></div>';
  h+='<div class="gpity"><div class="gpity-row"><b>영웅 이상 천장</b><span>'+sc.pity+' / '+GACHA.hard+'</span></div><div class="gpity-bar"><i style="width:'+(sc.pity/GACHA.hard*100)+'%"></i><u style="left:'+(GACHA.softFrom/GACHA.hard*100)+'%"></u></div>';
  h+='<div class="gpity-sub">다음 뽑기 영웅 이상 <b>'+E.toFixed(1)+'%</b> · '+(n>GACHA.softFrom&&n<GACHA.hard?'🔥 확률 상승 중!':n>=GACHA.hard?'🎯 이번 뽑기 확정!':(GACHA.softFrom+1)+'회차부터 회당 +'+GACHA.softStep+'%')+' · '+GACHA.hard+'회차 확정</div></div>';
  const b=(act,cls,title,cost,sub)=>{const lack=save.points<cost;return '<button class="btn gb-b'+cls+(lack?' lack':'')+'" data-act="'+act+'"><b>'+title+'</b><small>'+sub+'</small>'+(lack?'<em>'+(cost-save.points)+'P 부족</em>':'')+'</button>';};
  h+='<div class="gpbtn">'+b('pull1','',(free?'무료 1회 🎁':'1회 뽑기'),c1,free?'오늘의 무료 뽑기':'⭐ '+c1+'P')+b('pull10',' primary','10회 뽑기',c10,'⭐ '+c10+'P · 희귀 이상 1장 보장')+'</div>';
  h+='<div class="gb-bal"><span>보유 ⭐ <b>'+save.points+'P</b></span><span>포인트는 경기·오늘의 목표·업적에서 얻어요</span><label class="gb-tog"><input type="checkbox" data-act="fastfx"'+(save.set.fastFx?' checked':'')+'> 빠른 연출</label></div>';
  if(scLast){const cnt=[0,0,0,0];scLast.forEach(r=>cnt[r.g]++);const nw=scLast.filter(r=>r.isNew).length;
    h+='<div class="lbl" style="text-align:center">지난 결과 · '+GRADES.map((g,i)=>cnt[i]?g.n+' '+cnt[i]:'').filter(Boolean).join(' · ')+(nw?' · NEW '+nw:'')+'</div><div class="cardrow">'+scLast.map(r=>'<div style="--cw:66px" data-card="'+r.type+'">'+cardHtml(r.type,{g:r.g,lv:r.isNew?r.g:0,tag:r.isNew?'NEW':'중복'})+'</div>').join('')+'</div>';}
  if(sc.hist.length){const c=[0,0,0,0];sc.hist.forEach(r=>c[r[1]]++);
    h+='<div class="gh"><div class="gh-t">최근 '+sc.hist.length+'회 기록 <small>(누적 '+sc.pulls+'회 · '+GRADES.map((g,i)=>g.n+' '+c[i]).join(' · ')+')</small></div><div class="gh-dots">'+sc.hist.map(r=>'<span class="g'+r[1]+(r[2]?' nw':'')+'" title="'+GRADES[r[1]].n+' '+TYPES[r[0]].name+'">'+TYPES[r[0]].name.slice(0,2)+'</span>').join('')+'</div></div>';}
  return h+oddsBox();
}
function scEnhHtml(){
  const sc=save.scout,owned=Object.keys(TYPES).filter(k=>save.types.includes(k));
  if(!enSel||!owned.includes(enSel))enSel=owned.includes(save.type)?save.type:owned[0];
  const k=enSel,lv=save.lv[k]|0,bk=save.brk[k]|0,t=TYPES[k];
  if(enG===null||!save.cards[k][enG])enG=enAutoG(k);
  let h='<div class="en-pick">'+owned.map(q=>{const l=save.lv[q]|0,ready=l<MAX_LV&&save.cards[q].some(n=>n>0)&&save.points>=enhCost(l),br=brkPlan(q).ok&&!brkPlan(q).max;
    return '<button class="en-chip'+(q===k?' on':'')+'" data-act="ensel" data-k="'+q+'"><span class="dot g'+(TYPES[q].exclusive?4:tierOfLv(l))+'"></span>'+TYPES[q].name.replace(' 펭귄','')+'<small>Lv.'+l+((save.brk[q]|0)?' ★'+save.brk[q]:'')+'</small>'+(ready||br?'<i title="강화 또는 돌파 가능"></i>':'')+'</button>';}).join('')+'</div>';
  h+='<div class="en-main"><div class="en-card">'+cardHtml(k,{cls:'live tilt'+(scFx&&scFx.type===k?(scFx.ok?' lvup':' shk'):''),cw:Math.min(170,Math.floor(innerWidth*.36))})+'<div class="en-nm">'+t.name+'<small>'+TT[k].name+'</small></div></div><div class="en-side">';
  // --- enhancement ---
  h+='<div class="en-sec"><h4>⬆ 강화 <small>포인트와 같은 펭귄 카드 1장으로 레벨업</small></h4>';
  if(lv>=MAX_LV)h+='<div class="en-max">최대 레벨 Lv.'+MAX_LV+' 달성! 돌파로 더 성장할 수 있어요.</div>';
  else{
    const g=enG,rate=enhRate(k,g),cost=enhCost(lv),f=sc.fail[k]|0,has=save.cards[k][g]>0,fb=Math.min(ENH_FAIL_MAX,f)*ENH_FAIL_BONUS;
    h+='<div class="en-hd"><span>Lv.'+lv+' <i>→</i> <b>Lv.'+(lv+1)+'</b></span><span>OVR '+cardOvr(k,lv)+' <i>→</i> <b class="up">'+cardOvr(k,lv+1)+(cardOvr(k,lv+1)>cardOvr(k,lv)?' ▲'+(cardOvr(k,lv+1)-cardOvr(k,lv)):' (최대)')+'</b></span></div>';
    h+=statCmp(k,lv,lv+1,bk,bk);
    const ms=[];if(tierOfLv(lv+1)>tierOfLv(lv))ms.push('🎴 '+GRADES[tierOfLv(lv+1)].n+' 프레임 승급');if(lv+1===5||lv+1===10)ms.push('⚡ 특수기술 쿨다운 -'+(lv+1===10?20:10)+'%');if(ms.length)h+='<div class="en-ms">다음 레벨 보너스: '+ms.join(' · ')+'</div>';
    h+='<div class="en-mats">'+[0,1,2,3].map(q=>'<button class="en-mat g'+q+(q===g&&has?' on':'')+'" data-act="eng" data-g="'+q+'"'+(save.cards[k][q]?'':' disabled')+'><b>'+GRADES[q].n+'</b><small>'+save.cards[k][q]+'장</small><span>'+enhRate(k,q)+'%</span></button>').join('')+'<button class="btn small" data-act="enauto" title="낮은 등급 카드부터 사용해 고등급 카드를 아껴요">자동 선택</button></div>';
    h+='<div class="en-rate"><div><span>성공 확률</span><b>'+(has?rate:0)+'%</b><small>기본 '+ENH_RATE[lv]+'%'+(has&&ENH_CARD_BONUS[g]?' · '+GRADES[g].n+' 카드 +'+ENH_CARD_BONUS[g]+'%':'')+(fb?' · 실패 보정 +'+fb+'%':'')+(f>=ENH_PITY?' · 🎯 확정':'')+'</small></div><div><span>비용</span><b>⭐'+cost+'P</b><small>보유 '+save.points+'P</small></div></div>';
    h+='<div class="en-rule">성공: '+(has?GRADES[g].n:'선택한')+' 카드 1장 소모 · 실패: 포인트만 소모, 카드 반환, 레벨 하락 없음, 다음 확률 +'+ENH_FAIL_BONUS+'% (최대 +'+ENH_FAIL_BONUS*ENH_FAIL_MAX+'%) · <b>연속 실패 '+f+'/'+ENH_PITY+'</b> — '+ENH_PITY+'회 실패하면 다음 강화 100%<br><small>실패해도 잃는 것이 포인트뿐이라 보호 아이템은 필요 없어요.</small></div>';
    const why=!has?'재료 카드가 없어요 — 뽑기 중복 카드·합성·매일 무료 뽑기로 얻을 수 있어요':save.points<cost?'포인트 '+(cost-save.points)+'P 부족 — 경기·목표·업적으로 모을 수 있어요':'';
    h+='<button class="btn primary en-go" data-act="enh" data-k="'+k+'" data-g="'+g+'"'+(why?' disabled':'')+'>✨ 강화하기 · ⭐'+cost+'P</button>'+(why?'<div class="en-why">'+why+'</div>':'');
  }
  h+='</div>';
  // --- breakthrough ---
  const pl=brkPlan(k);
  h+='<div class="en-sec"><h4>★ 돌파 <small>중복 카드를 돌파 포인트로 바꿔 한계를 넘어요</small></h4><div class="en-brk"><span class="pc-stars big">'+'★'.repeat(bk)+'<u>'+'☆'.repeat(BRK.max-bk)+'</u></span>';
  if(pl.max)h+='<b>최대 돌파 ★'+BRK.max+' · 각성!</b></div>';
  else{
    h+='<div class="gpity-bar"><i style="width:'+Math.min(100,pl.avail/pl.need*100)+'%"></i></div><small>돌파 포인트 '+Math.min(pl.avail,pl.need)+' / '+pl.need+(pl.avail>pl.need?' (보유 '+pl.avail+')':'')+' · 일반1·희귀2·영웅4·전설8점</small></div>';
    h+='<div class="en-ms">★'+(bk+1)+' 효과: '+brkEffect(bk+1)+' · OVR +'+BRK.ovr+'</div>';
    const why=!pl.ok?'같은 펭귄 카드가 '+(pl.need-pl.have)+'점어치 더 필요해요':save.points<pl.cost?'포인트 '+(pl.cost-save.points)+'P 부족':'';
    h+='<button class="btn en-go brk" data-act="brk" data-k="'+k+'"'+(why?' disabled':'')+'>★ 돌파하기 · ⭐'+pl.cost+'P</button>'+(why?'<div class="en-why">'+why+'</div>':'');
  }
  h+='</div>';
  if(sc.elog.length)h+='<div class="en-log"><b>최근 기록</b>'+sc.elog.map(r=>'<span class="'+(r[2]===2?'brk':r[2]?'ok':'no')+'">'+TYPES[r[0]].name.replace(' 펭귄','')+' '+(r[2]===2?'★'+(r[1]+1)+' 돌파':'Lv.'+r[1]+(r[2]?' → '+(r[1]+1)+' 성공':' 실패'))+'</span>').join('')+'</div>';
  h+='</div></div>';
  h+='<div class="odds"><b>강화 확률 (레벨 → 다음 레벨)</b><br>'+ENH_RATE.map((r,i)=>'Lv'+i+'→'+(i+1)+' '+r+'%').join(' · ')+'<br>카드 등급 보너스: '+GRADES.map((g,i)=>g.n+' +'+ENH_CARD_BONUS[i]+'%').join(' · ')+' · 실패 1회마다 +'+ENH_FAIL_BONUS+'% (최대 +'+ENH_FAIL_BONUS*ENH_FAIL_MAX+'%) · '+ENH_PITY+'회 연속 실패 시 100%<br>비용: 현재 레벨 × 15P + 20P · 돌파 비용: '+BRK.cost.map((c,i)=>'★'+(i+1)+' '+c+'P/'+BRK.need[i]+'점').join(' · ')+'</div>';
  return h;
}
function scDexHtml(){
  let ks=Object.keys(TYPES);
  if(dexF==='own')ks=ks.filter(k=>save.types.includes(k));else if(dexF==='not')ks=ks.filter(k=>!save.types.includes(k));
  const ov=k=>save.types.includes(k)?cardOvr(k,save.lv[k]|0):-1;
  ks.sort(dexSort==='lv'?(a,b)=>(save.types.includes(b)?(save.lv[b]|0)+1:0)-(save.types.includes(a)?(save.lv[a]|0)+1:0):dexSort==='name'?(a,b)=>TYPES[a].name.localeCompare(TYPES[b].name,'ko'):(a,b)=>ov(b)-ov(a));
  const own=Object.keys(TYPES).filter(k=>save.types.includes(k)).length;
  let h='<div class="dx-ctl"><div class="chips">'+[['ovr','OVR순'],['lv','레벨순'],['name','이름순']].map(o=>'<button class="btn small'+(dexSort===o[0]?' on':'')+'" data-act="dxs" data-v="'+o[0]+'">'+o[1]+'</button>').join('')+'</div><div class="chips">'+[['all','전체'],['own','보유'],['not','미보유']].map(o=>'<button class="btn small'+(dexF===o[0]?' on':'')+'" data-act="dxf" data-v="'+o[0]+'">'+o[1]+'</button>').join('')+'</div><input id="dxQ" type="search" placeholder="🔍 이름 검색" value="'+escH(dexQ)+'" aria-label="펭귄 이름 검색"></div>';
  h+='<div class="lbl" style="text-align:center">도감 '+own+' / '+Object.keys(TYPES).length+' · 카드를 누르면 상세 정보가 열려요</div><div class="cardrow dx">';
  h+=ks.map(k=>{const o=save.types.includes(k),tot=save.cards[k].reduce((a,n)=>a+n,0);
    return '<div class="dx-c" data-card="'+k+'" data-name="'+TYPES[k].name+'" style="--cw:96px">'+(o?cardHtml(k):'<div class="pc-backface">?</div>')+'<div class="dx-i">'+(o?'<b>'+TYPES[k].name.replace(' 펭귄','')+'</b><small>보관 '+tot+'장'+((save.brk[k]|0)?' · ★'+save.brk[k]:'')+'</small>':'<b>'+(TYPES[k].exclusive?'???':TYPES[k].name.replace(' 펭귄',''))+'</b><small>'+(TYPES[k].exclusive?'💻 특별 보상':'미해금')+'</small>')+'</div></div>';}).join('');
  h+='</div><div class="odds">누적 뽑기 '+save.scout.pulls+'회 · 카드 프레임은 강화 레벨에 따라 바뀌어요 (Lv3 희귀 · Lv6 영웅 · Lv9 전설) · 별(★)은 돌파 단계예요. 카드는 강화·돌파(같은 종류)와 합성(같은 등급)에 쓰여요.</div>';
  return h;
}
function dexFilterQ(){const q=dexQ.trim();document.querySelectorAll('#scBody .dx-c').forEach(e=>{e.style.display=!q||e.dataset.name.indexOf(q)>=0?'':'none';});}
// scout extra actions (wired after renderScout's own handlers)
function scWire(el){
  el.querySelectorAll('[data-card]').forEach(c=>{c.style.cursor='pointer';c.onclick=()=>{SFX.ui();openCard(c.dataset.card);};});
  const q=el.querySelector('#dxQ');if(q){q.oninput=()=>{dexQ=q.value;dexFilterQ();};dexFilterQ();}
}
function scAct(a,b){
  if(a==='ensel'){enSel=b.dataset.k;enG=null;scMsg='';renderScout();return true;}
  if(a==='eng'){enG=+b.dataset.g;renderScout();return true;}
  if(a==='enauto'){enG=enAutoG(enSel);renderScout();flashMsg('가장 낮은 등급 카드를 골랐어요 (고등급 카드는 아껴 둬요)');return true;}
  if(a==='brk'){askBreak(b.dataset.k);return true;}
  if(a==='fastfx'){save.set.fastFx=!!b.checked;persist();return true;}
  if(a==='dxs'){dexSort=b.dataset.v;renderScout();return true;}
  if(a==='dxf'){dexF=b.dataset.v;renderScout();return true;}
  return false;
}
setInterval(()=>{try{if(G.ui==='sScout'&&scTab==='pull'){const e=$('#gbEnd');if(e)e.textContent=endTxt(pickupNow().ends);}}catch(e){}},30000);
