
/* ================= LEAGUE: transfer market, club value, club league, manager ranking, my profile ================= */
// Offline game: rival clubs / managers are simulated (seeded per save), not real players.
function rng32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const escH=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtN=n=>Math.round(n).toLocaleString('en-US');
const cleanName=v=>typeof v==='string'?v.replace(/[\u0000-\u001f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,12):'';
const EMB=['🐧','🦭','🐻‍❄️','🐋','🦅','🐺','🦊','❄️','⭐','🔥','🌊','👑'];
if(!save.profile.since)save.profile.since=Date.now();
if(!save.profile.seed)save.profile.seed=1+Math.floor(Math.random()*2e9);
persist();
const daysSince=()=>Math.max(0,Math.floor((Date.now()-save.profile.since)/86400000));
function agoTxt(ts){const s=Math.max(0,(Date.now()-ts)/1000);return s<60?'방금':s<3600?Math.floor(s/60)+'분 전':s<86400?Math.floor(s/3600)+'시간 전':Math.floor(s/86400)+'일 전';}

/* ---------- transfer market ---------- */
const MK_SLOT=3*3600*1000,MK_N=6,MK_REFRESH=10;
const MK_BUY=[24,70,230,800],MK_SELL=[6,18,60,220],MK_GW=[50,32,14,4];
const MK_TMUL={basic:.8,balanced:1,fast:1.1,defense:1.15,strong:1.15,auk:1.5};
const mkTypes=()=>Object.keys(TYPES).filter(k=>!TYPES[k].exclusive);   // the exclusive 큰바다쇠오리 never appears on the market
// Spread guarantee: the highest possible sell price is always below the lowest possible buy price (no buy-sell money loop).
const mkSlot=()=>Math.floor(Date.now()/MK_SLOT);
const mkKey=()=>mkSlot()+':'+(save.mk.salt|0);
function mkGen(){
  const slot=mkSlot(),r=rng32((slot*7919)^((save.mk.salt|0)*104729)^(save.profile.seed|0)),types=mkTypes(),demand={};
  for(const k of types)demand[k]=+(0.8+r()*0.45).toFixed(2);
  const sale=Math.floor(r()*MK_N),list=[];
  for(let i=0;i<MK_N;i++){
    const x=r()*100;let g=3,acc=0;for(let j=0;j<4;j++){acc+=MK_GW[j];if(x<acc){g=j;break;}}
    const type=types[Math.floor(r()*types.length)],ref=MK_BUY[g]*MK_TMUL[type];
    let price=ref*(0.85+r()*0.4);if(i===sale)price*=0.7;
    price=Math.max(5,Math.round(price/5)*5);
    list.push({i,type,g,price,sale:i===sale,trend:Math.round((price/ref-1)*100)});
  }
  return{slot,list,demand};
}
function mkSellPrice(type,g,m){m=m||mkGen();return Math.max(1,Math.round(MK_SELL[g]*(MK_TMUL[type]||1)*(m.demand[type]||1)));}
function mkLog(e){save.mk.log.unshift(e);if(save.mk.log.length>15)save.mk.log.length=15;}
function mkBuy(i){
  const m=mkGen(),L=m.list[i],key=mkKey()+':'+i;if(!L)return false;
  if(save.mk.bought.includes(key)){flashMsg('이미 영입한 매물이에요');return false;}
  if(save.points<L.price){flashMsg('포인트가 부족해요!');return false;}
  save.points-=L.price;const isNew=grantCard(L.type,L.g);
  save.mk.bought.push(key);if(save.mk.bought.length>40)save.mk.bought.splice(0,save.mk.bought.length-40);
  mkLog({k:'buy',type:L.type,g:L.g,p:L.price,ts:Date.now(),n:isNew});persist();
  SFX.win();vib([20,30,40]);flashMsg((isNew?'🎉 새 펭귄 영입! ':'영입 완료! ')+TYPES[L.type].name+' · -'+L.price+'P');
  return true;
}
function mkSell(type,g){
  if(!save.cards[type]||save.cards[type][g]<1){flashMsg('방출할 카드가 없어요');return false;}
  const p=mkSellPrice(type,g);save.cards[type][g]--;save.points+=p;
  mkLog({k:'sell',type,g,p,ts:Date.now()});persist();SFX.passOk();flashMsg('방출 완료! +'+p+'P');return true;
}
function mkRefresh(){if(save.points<MK_REFRESH){flashMsg('포인트가 부족해요!');return false;}save.points-=MK_REFRESH;save.mk.salt=(save.mk.salt|0)+1;persist();SFX.ui();return true;}

/* ---------- club value / club league ---------- */
function penguinValue(k){const lv=save.lv[k]|0,mx=mxInfo(k).lv,o=cardOvr(k,lv);return Math.round(o*o/10*(1+lv*.25)*(1+mx*.08));}
function clubValue(){
  let players=0,cards=0;
  for(const k of save.types)players+=penguinValue(k);
  for(const k of Object.keys(TYPES))for(let g=0;g<4;g++)cards+=(save.cards[k][g]|0)*MK_SELL[g]*MK_TMUL[k];
  cards=Math.round(cards);const cash=Math.max(0,save.points|0);
  return{players,cards,cash,total:players+cards+cash};
}
const CLUB_A=['빙산','오로라','블리자드','남극','북극성','눈보라','빙하','아이스','크릴','유빙','설원','극지','하얀','푸른','얼음꽃'];
const CLUB_B=['유나이티드','FC','시티','레이서스','킹스','스타즈','이글스','타이거즈','웨이브','스톰','레인저스','로열즈','기사단','원정대','해적단'];
function leagueClubs(){
  const r=rng32((save.profile.seed|0)^0x51ab),d=daysSince(),used=new Set(),out=[];
  const fixed=TOUR.map(t=>t.name);
  for(let i=0;i<49;i++){
    let name=i<fixed.length?fixed[i]:'';
    while(!name||used.has(name))name=CLUB_A[Math.floor(r()*CLUB_A.length)]+' '+CLUB_B[Math.floor(r()*CLUB_B.length)];
    used.add(name);
    const q=Math.pow(r(),1.6),base=Math.exp(Math.log(420)+(Math.log(42000)-Math.log(420))*q),grow=1+Math.min(.5,d*.008*(.4+r()));
    out.push({name,emb:EMB[Math.floor(r()*EMB.length)],v:Math.round(base*grow)});
  }
  return out;
}
function clubTable(){
  const val=clubValue(),rows=leagueClubs().map(c=>Object.assign({me:false},c));
  rows.push({name:save.profile.club,emb:save.profile.emb,v:val.total,me:true});
  rows.sort((a,b)=>b.v-a.v||(a.me?-1:b.me?1:0));rows.forEach((x,i)=>x.rank=i+1);
  return{rows,me:rows.find(x=>x.me),val};
}

/* ---------- manager rating (Elo) / ranking ---------- */
const TIERS=[{n:'브론즈',min:600,c:'#d0965f'},{n:'실버',min:900,c:'#cfd9e4'},{n:'골드',min:1100,c:'#ffcf4a'},{n:'플래티넘',min:1300,c:'#5fe0d2'},{n:'다이아',min:1500,c:'#7cc4ff'},{n:'마스터',min:1700,c:'#c48bff'},{n:'레전드',min:1900,c:'#ff6b8a'},{n:'개발자',min:2100,c:'#7df9ff'}];
function tierOf(r){
  let t=0;for(let i=0;i<TIERS.length;i++)if(r>=TIERS[i].min)t=i;
  const T_=TIERS[t],nx=TIERS[t+1];let sub='';
  if(nx){const span=(nx.min-T_.min)/3,k=Math.max(0,Math.min(2,Math.floor((r-T_.min)/span)));sub=' '+['III','II','I'][k];}
  return{i:t,name:T_.n+sub,c:T_.c,next:nx?nx.min:null,min:T_.min};
}
const MGR_A=['얼음','폭풍','북극','눈보라','오로라','빙하','남극','푸른','하얀','전설의','냉철한','불꽃','번개','침착한','고요한'];
const MGR_B=['감독','전술가','여우','사령관','마에스트로','곰','독수리','늑대','선장','코치','명장','지휘관'];
function mgrRivals(){
  const r=rng32((save.profile.seed|0)^0x9e37),day=Math.floor(Date.now()/86400000),rd=rng32((day*2654435761)^(save.profile.seed|0)),used=new Set(),out=[];
  for(let i=0;i<99;i++){
    let n='';while(!n||used.has(n))n=MGR_A[Math.floor(r()*MGR_A.length)]+' '+MGR_B[Math.floor(r()*MGR_B.length)]+(r()<.5?'':' '+(10+Math.floor(r()*90)));
    used.add(n);
    out.push({name:n,r:Math.round(760+1380*Math.pow(r(),1.35)+(rd()-.5)*40),emb:EMB[Math.floor(r()*EMB.length)]});
  }
  return out;
}
function mgrTable(){
  const rows=mgrRivals().map(x=>Object.assign({me:false},x));
  rows.push({name:save.profile.name+titleBadge(),r:save.mgr.r,emb:save.profile.emb,me:true});
  rows.sort((a,b)=>b.r-a.r||(a.me?-1:b.me?1:0));rows.forEach((x,i)=>x.rank=i+1);
  return{rows,me:rows.find(x=>x.me)};
}
const isRated=cfg=>!!cfg&&(cfg.mode==='ranked'||cfg.mode==='trial')&&!cfg.tutorial;   // only tier games move the rating
function oppRating(cfg){return cfg.oppR||({easy:880,normal:1120,hard:1380}[cfg.diff||'normal']||1120);}
function mgrApply(S,opp,label){
  const m=save.mgr,before=m.r,E=1/(1+Math.pow(10,(opp-m.r)/400)),K=m.games<10?48:32;
  let d=Math.round(K*(S-E));if(S===1&&d<5)d=5;if(S===0&&d>-5)d=-5;
  m.r=Math.max(100,Math.min(4000,m.r+d));d=m.r-before;
  m.games++;if(S===1)m.w++;else if(S===0)m.l++;else m.d++;
  m.best=Math.max(m.best,m.r);m.form.unshift(S===1?'W':S===0?'L':'D');if(m.form.length>5)m.form.length=5;
  m.hist.unshift({d,r:m.r,l:label,ts:Date.now()});if(m.hist.length>10)m.hist.length=10;
  const t0=tierOf(before),t1=tierOf(m.r);
  return{from:before,to:m.r,d,up:t1.i>t0.i,down:t1.i<t0.i,tier:t1};
}
function mgrMatchEnd(win,draw,cfg){if(!isRated(cfg))return null;save.mgr.pending=null;const res=mgrApply(win?1:draw?.5:0,oppRating(cfg),cfg.label||'티어 게임');res.dev=devCheck();return res;}
function mgrFrame(){   // after 20s of real play, leaving the match unfinished counts as a forfeit (stops quit-to-avoid-loss)
  if(G.mgrArmed||!G.cfg||!isRated(G.cfg)||G.view!=='game'||G.state!=='play'||save.mgr.pending)return;
  if(G.elapsed>=20){G.mgrArmed=true;save.mgr.pending={o:oppRating(G.cfg),l:G.cfg.label||'티어 게임',trial:G.cfg.mode==='trial',ts:Date.now()};persist();}
}
function mgrReset(){   // every match setup (also on page load): settle an abandoned armed match
  G.mgrArmed=false;const p=save.mgr.pending;if(!p)return;save.mgr.pending=null;
  const res=mgrApply(0,p.o||1120,'기권 · '+(p.l||'경기'));let out=false;
  if(p.trial&&save.trial&&save.trial.run){save.trial.run=null;out=true;}
  persist();
  setTimeout(()=>{try{flashMsg('끝내지 않은 티어 게임은 기권 패예요 (레이팅 '+res.d+')'+(out?' · 선발전 탈락':''));}catch(e){}},600);
}

/* ---------- home summary ---------- */
function leagueMenuRefresh(){
  try{
    const ct=clubTable(),mt=mgrTable(),ti=tierOf(save.mgr.r),el=$('#menuRank');
    if(el)el.innerHTML='<span>'+escH(save.profile.emb)+' '+escH(save.profile.club)+'</span><span>🏟 구단 <b>'+ct.me.rank+'위</b></span><span>🎖 <b style="color:'+ti.c+'">'+ti.name+'</b> · 감독 '+mt.me.rank+'위</span>'+(titleText()?'<span>'+titleText()+'</span>':'');
    const m=mkGen(),b=$('#mkBadge');if(b){const hot=m.list.some(L=>L.sale&&!save.mk.bought.includes(mkKey()+':'+L.i));b.textContent=hot?'급매':'';b.style.display=hot?'inline-block':'none';}
  }catch(e){}
}

/* ---------- market screen ---------- */
let mkTab='buy',mkShownSlot=-1;
function mkCountdown(){const left=MK_SLOT-(Date.now()%MK_SLOT),h=Math.floor(left/3600000),mi=Math.floor(left%3600000/60000),s=Math.floor(left%60000/1000);return h+':'+String(mi).padStart(2,'0')+':'+String(s).padStart(2,'0');}
function renderMarket(){
  const el=$('#mkBody');if(!el)return;$('#ptsN').textContent=save.points;
  document.querySelectorAll('#mkTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===mkTab));
  const m=mkGen(),key=mkKey();mkShownSlot=m.slot;let h='';
  h+='<div class="mk-top"><span>⏱ 새 매물까지 <b id="mkCd">'+mkCountdown()+'</b></span><span class="mk-trend">시세 '+mkTypes().map(k=>{const p=Math.round((m.demand[k]-1)*100);return '<i class="'+(p>=0?'up':'dn')+'">'+TYPES[k].name.replace(' 펭귄','')+' '+(p>=0?'▲':'▼')+Math.abs(p)+'%</i>';}).join('')+'</span></div>';
  if(mkTab==='buy'){
    h+='<div class="mk-grid">'+m.list.map(L=>{
      const sold=save.mk.bought.includes(key+':'+L.i),own=save.types.includes(L.type),can=!sold&&save.points>=L.price;
      return '<div class="mk-item'+(sold?' sold':'')+(L.sale?' hot':'')+'">'+(L.sale?'<div class="mk-sale">🔥 급매 -30%</div>':'')+'<div style="--cw:94px">'+cardHtml(L.type,{g:L.g,lv:own?0:L.g,tag:own?'':'미보유'})+'</div>'
        +'<div class="mk-meta">'+GRADES[L.g].n+' 카드 · <span class="'+(L.trend>0?'pu':'pd')+'">'+(L.trend>0?'▲':'▼')+Math.abs(L.trend)+'%</span></div>'
        +'<button class="btn small'+(can?' primary':'')+'" data-buy="'+L.i+'"'+(can?'':' disabled')+'>'+(sold?'영입 완료 ✔':'⭐ '+fmtN(L.price)+'P')+'</button></div>';}).join('')+'</div>';
    h+='<div class="row" style="margin-top:8px"><button class="btn small" data-act="mkref">🔄 매물 새로고침 · '+MK_REFRESH+'P</button></div>';
    h+='<div class="odds">없던 펭귄을 영입하면 바로 해금돼요(희귀 Lv1 · 영웅 Lv2 · 전설 Lv3로 시작). 이미 가진 펭귄은 카드로 보관돼 강화·합성 재료가 돼요.<br>매물은 3시간마다 바뀌고, 매번 1장은 30% 할인된 급매로 나와요.</div>';
  }else if(mkTab==='sell'){
    let rows='';
    for(const k of mkTypes())for(let g=0;g<4;g++){const n=save.cards[k][g]|0;if(!n)continue;const p=mkSellPrice(k,g,m);
      rows+='<div class="mk-sell"><div style="--cw:62px">'+cardHtml(k,{g,lv:0,count:n})+'</div><div class="info"><b>'+TYPES[k].name+'</b> · '+GRADES[g].n+' 카드 ×'+n+'<br><small>현재 시세 '+p+'P (기준 '+Math.round(MK_SELL[g]*MK_TMUL[k])+'P)</small></div><button class="btn small" data-sell="'+k+':'+g+'">방출 +'+p+'P</button></div>';}
    h+=rows||'<div class="lbl" style="text-align:center;margin:18px 0">방출할 카드가 없어요. 스카우트로 카드를 모아 보세요.</div>';
    h+='<div class="odds">보관 중인 카드만 방출할 수 있어요(해금된 펭귄 자체는 팔리지 않아요). 방출가는 영입가보다 항상 낮아요.</div>';
  }else{
    h+=save.mk.log.length?save.mk.log.map(x=>'<div class="mk-log"><span class="'+(x.k==='buy'?'b':'s')+'">'+(x.k==='buy'?'영입':'방출')+'</span><span>'+TYPES[x.type].name+' · '+GRADES[x.g].n+(x.n?' · 신규':'')+'</span><span class="'+(x.k==='buy'?'dn':'up')+'">'+(x.k==='buy'?'-':'+')+fmtN(x.p)+'P</span><small>'+agoTxt(x.ts)+'</small></div>').join(''):'<div class="lbl" style="text-align:center;margin:18px 0">아직 이적 기록이 없어요.</div>';
  }
  el.innerHTML=h;
  el.querySelectorAll('[data-buy]').forEach(b=>{b.onclick=()=>{if(mkBuy(+b.dataset.buy))renderMarket();};});
  el.querySelectorAll('[data-sell]').forEach(b=>{b.onclick=()=>{const a=b.dataset.sell.split(':');if(mkSell(a[0],+a[1]))renderMarket();};});
  el.querySelectorAll('[data-act="mkref"]').forEach(b=>{b.onclick=()=>{if(mkRefresh())renderMarket();};});
}
document.querySelectorAll('#mkTabs button').forEach(b=>{b.onclick=()=>{SFX.ui();mkTab=b.dataset.t;renderMarket();};});
setInterval(()=>{try{if(G.ui!=='sMarket')return;if(mkSlot()!==mkShownSlot){renderMarket();return;}const c=$('#mkCd');if(c)c.textContent=mkCountdown();}catch(e){}},1000);

/* ---------- my profile ---------- */
let pfTab='me';
function lgRows(rows,val,unit){
  return rows.map(x=>'<div class="lg-row'+(x.me?' me':'')+(x.rank<=3?' top':'')+'"><span class="rk">'+(x.rank<=3?['🥇','🥈','🥉'][x.rank-1]:x.rank)+'</span><span class="em">'+escH(x.emb)+'</span><span class="nm">'+escH(x.name)+(x.me?' <small>(나)</small>':'')+'</span><span class="vl">'+val(x)+'</span></div>').join('');
}
function renderProfile(){
  const el=$('#pfBody');if(!el)return;$('#ptsN').textContent=save.points;
  document.querySelectorAll('#pfTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===pfTab));
  const p=save.profile,m=save.mgr,ti=tierOf(m.r);let h='';
  if(pfTab==='me'){
    const ct=clubTable(),mt=mgrTable(),nxt=ct.me.rank>1?ct.rows[ct.me.rank-2].v-ct.val.total+1:0;
    h+='<div class="pf-head"><div class="pf-emb">'+escH(p.emb)+'</div><div class="pf-names"><label>구단 이름<input id="pfClub" maxlength="12" value="'+escH(p.club)+'"></label><label>감독 이름<input id="pfName" maxlength="12" value="'+escH(p.name)+'"></label><label>연고지<select id="pfCity">'+CITIES.map(c=>'<option'+(c===p.city?' selected':'')+'>'+c+'</option>').join('')+'</select></label></div></div>'+(titleText(true)?'<div class="pf-titles">'+titleText(true)+'</div>':'');
    h+='<div class="pf-embs">'+EMB.map(e=>'<button data-emb="'+e+'" class="'+(e===p.emb?'on':'')+'">'+e+'</button>').join('')+'</div>';
    h+='<div class="pf-grid">'
      +'<div class="pf-card"><small>💰 구단 총가치</small><b>'+fmtN(ct.val.total)+' P</b><small>선수단 '+fmtN(ct.val.players)+' · 보관 카드 '+fmtN(ct.val.cards)+' · 포인트 '+fmtN(ct.val.cash)+'</small></div>'
      +'<div class="pf-card"><small>🏟 구단 순위</small><b>'+ct.me.rank+'위 <span>/ '+ct.rows.length+'</span></b><small>'+(nxt?'다음 순위까지 +'+fmtN(nxt)+' P':'리그 1위! 👑')+'</small></div>'
      +'<div class="pf-card"><small>🎖 감독 랭킹</small><b>'+mt.me.rank+'위 <span>/ '+mt.rows.length+'</span></b><small>레이팅 '+m.r+' · 최고 '+m.best+'</small></div>'
      +'<div class="pf-card"><small>🏅 감독 티어</small><b style="color:'+ti.c+'">'+ti.name+'</b><small>'+(ti.next?'다음 티어까지 '+(ti.next-m.r)+'점':'최고 티어')+'</small></div>'
      +'</div>';
    h+='<div class="pf-stats">전적 '+m.w+'승 '+m.d+'무 '+m.l+'패'+(m.games?' · 승률 '+Math.round(m.w/m.games*100)+'%':'')+(m.games<10?' · 배치 경기 '+m.games+'/10 (레이팅 변동 큼)':'')
      +'<div class="pf-form">최근 5경기 '+(m.form.length?m.form.map(f=>'<i class="f'+f+'">'+({W:'승',D:'무',L:'패'})[f]+'</i>').join(''):'<small>기록 없음</small>')+'</div></div>';
  }else if(pfTab==='club'){
    const ct=clubTable();
    h+='<div class="lg-sum">'+escH(p.emb)+' <b>'+escH(p.club)+'</b> · <b>'+ct.me.rank+'위</b> / '+ct.rows.length+' · 총가치 '+fmtN(ct.val.total)+' P</div>';
    h+='<div class="lg-list" id="lgList">'+lgRows(ct.rows,x=>fmtN(x.v)+' P')+'</div>';
    h+='<div class="odds">구단 총가치 = 보유 펭귄 가치(OVR · 강화 · 숙련도) + 보관 카드 시세 + 보유 포인트. 경쟁 구단은 컴퓨터가 운영하는 가상 구단이고, 날이 지나면 조금씩 성장해요.</div>';
  }else{
    const mt=mgrTable();
    h+='<div class="lg-sum">🎖 <b style="color:'+ti.c+'">'+ti.name+'</b> · 레이팅 <b>'+m.r+'</b> · <b>'+mt.me.rank+'위</b> / '+mt.rows.length+'</div>';
    if(ti.next){const pr=Math.max(0,Math.min(100,(m.r-ti.min)/(ti.next-ti.min)*100));h+='<div class="pbar" style="max-width:420px;margin:4px auto 8px"><i style="width:'+pr+'%"></i></div>';}
    h+='<div class="lg-list" id="lgList">'+lgRows(mt.rows,x=>{const t=tierOf(x.r);return '<b style="color:'+t.c+'">'+t.name.split(' ')[0]+'</b> '+x.r;})+'</div>';
    if(m.hist.length)h+='<div class="lbl" style="margin-top:8px">최근 레이팅 변동</div>'+m.hist.slice(0,5).map(x=>'<div class="mk-log"><span>'+escH(x.l)+'</span><span class="'+(x.d>=0?'up':'dn')+'">'+(x.d>=0?'+':'')+x.d+'</span><span>→ '+x.r+'</span><small>'+agoTxt(x.ts)+'</small></div>').join('');
    h+='<div class="odds">빠른 경기와 토너먼트 결과로 레이팅이 바뀌어요(강한 상대일수록 이기면 더 많이 올라요). 첫 10경기는 배치 경기라 변동이 커요. 시작 후 20초가 지난 경기를 중간에 나가면 기권 패예요. 다른 감독들은 컴퓨터가 운영하는 가상 감독이에요.</div>';
  }
  el.innerHTML=h;
  const L=$('#lgList');if(L){const me=L.querySelector('.me');if(me)L.scrollTop=Math.max(0,me.offsetTop-L.clientHeight/2);}
  const save_=(id,k,def)=>{const i=$(id);if(!i)return;i.onchange=()=>{const v=cleanName(i.value)||def;save.profile[k]=v;i.value=v;persist();SFX.ui();leagueMenuRefresh();};};
  save_('#pfClub','club','펭귄 FC');save_('#pfName','name','펭귄 감독');
  const cs=$('#pfCity');if(cs)cs.onchange=()=>{if(CITIES.includes(cs.value)){save.profile.city=cs.value;persist();SFX.ui();leagueMenuRefresh();}};
  el.querySelectorAll('[data-emb]').forEach(b=>{b.onclick=()=>{save.profile.emb=b.dataset.emb;persist();SFX.ui();renderProfile();leagueMenuRefresh();};});
}
document.querySelectorAll('#pfTabs button').forEach(b=>{b.onclick=()=>{SFX.ui();pfTab=b.dataset.t;renderProfile();};});
