# v21: every penguin has a fixed rarity (기본 · 희귀 · 레어 · 신화 · 전설) instead of a card frame that rose with the level.
#  - a card's grade IS its species' rarity: pulls roll a rarity, then a penguin of that rarity (weekly pickup = 70% of its rarity)
#  - pity counts pulls without 신화 or better; a 10-pull holds at least one 레어 or better
#  - fusion: 3 cards of one rarity -> chance at a card of the next rarity; breakthrough points per card grow with rarity
#  - save: new field save.cc = {species:[5 slots]} (spare cards by rarity slot); the old save.cards stays untouched and is
#    converted once (same number of cards; their old breakthrough-point value is kept in brkPts when it was higher)
#  - card frames: 기본 gray · 희귀 blue · 레어 purple · 신화 red · 전설 gold (CSS .g0-.g4), the exclusive 큰바다쇠오리 keeps its own (.g9)

# ---- constants ----
R("const GRADES=[{n:'일반',c:'#9fb4c8'},{n:'희귀',c:'#4aa8ff'},{n:'영웅',c:'#b46bff'},{n:'전설',c:'#ffc233'}];",
  "const GRADES=[{n:'기본',c:'#9fb4c8'},{n:'희귀',c:'#4aa8ff'},{n:'레어',c:'#b46bff'},{n:'신화',c:'#ff5a6e'},{n:'전설',c:'#ffc233'}];\n"
  "const RAR={basic:0,fast:0,little:0,balanced:1,african:1,humboldt:1,magellanic:1,defense:2,macaroni:2,fiordland:2,galapagos:2,royal:3,yelloweye:3,strong:4,king:4,auk:4};\n"
  "const rarCls=k=>TYPES[k]&&TYPES[k].exclusive?9:RAR[k]|0;   // card frame class index\n"
  "const tierTypes=g=>Object.keys(TYPES).filter(k=>!TYPES[k].exclusive&&RAR[k]===g);")
R("const PULL_ODDS=[62,28,8.5,1.5],", "const PULL_ODDS=[50,30,14,5,1],")
R("ENH_CARD_BONUS=[0,5,10,20]", "ENH_CARD_BONUS=[0,4,8,12,16]")
R("const FUSE_DEF=[{rate:80,cost:20},{rate:55,cost:40},{rate:30,cost:80}];", "const FUSE_DEF=[{rate:80,cost:20},{rate:60,cost:40},{rate:35,cost:80},{rate:20,cost:160}];")
R("softFrom:20,softStep:6,hard:PITY_AT,tenMin:1,pickShare:30,", "softFrom:20,softStep:6,hard:PITY_AT,tenMin:2,pickShare:70,")
R("dupCap:999,dupOverflow:[5,10,25,60],", "dupCap:999,dupOverflow:[5,10,25,60,150],")
R("const BRK={max:5,need:[3,6,10,15,24],val:[1,2,4,8],", "const BRK={max:5,need:[3,6,10,15,24],val:[1,2,3,5,8],")
R("const MK_BUY=[24,70,230,800],MK_SELL=[6,18,60,220],MK_GW=[50,32,14,4];", "const MK_BUY=[30,60,180,600,1500],MK_SELL=[6,15,45,150,380],MK_GW=[44,32,17,6,1];")
R("cards:Object.fromEntries(Object.keys(TYPES).map(k=>[k,[0,0,0,0]])),", "cards:Object.fromEntries(Object.keys(TYPES).map(k=>[k,[0,0,0,0]])),cc:Object.fromEntries(Object.keys(TYPES).map(k=>[k,[0,0,0,0,0]])),")
# trial rewards: national -> 신화, world -> 전설 (city stays 레어)
R("entries:2,needTier:3,first:1000,again:250,card:3}", "entries:2,needTier:3,first:1000,again:250,card:3}")
R("entries:1,needTier:4,first:3000,again:600,card:3}", "entries:1,needTier:4,first:3000,again:600,card:4}")
# season reward cards by best tier: 골드 레어 · 플래티넘/다이아 신화 · 마스터 이상 전설
R("rew:[{p:60},{p:120},{p:200,g:1},{p:320,g:2},{p:480,g:2},{p:700,g:3},{p:1000,g:3},{p:1500,g:3}]",
  "rew:[{p:60},{p:120},{p:200,g:2},{p:320,g:3},{p:480,g:3},{p:700,g:4},{p:1000,g:4},{p:1500,g:4}]")

# ---- save: load the new field, convert the old one once ----
R("  if(s.cards&&typeof s.cards==='object')for(const k of Object.keys(TYPES)){const a=s.cards[k];save.cards[k]=[0,1,2,3].map(i=>Array.isArray(a)?Math.max(0,Math.min(999,Math.floor(num(a[i],0)))):0);}",
  "  if(s.cards&&typeof s.cards==='object')for(const k of Object.keys(TYPES)){const a=s.cards[k];save.cards[k]=[0,1,2,3].map(i=>Array.isArray(a)?Math.max(0,Math.min(999,Math.floor(num(a[i],0)))):0);}\n"
  "")
R("if(s.brkPts&&typeof s.brkPts==='object')for(const k of Object.keys(TYPES))save.brkPts[k]=Math.max(0,Math.min(99,Math.floor(num(s.brkPts[k],0))));",
  "if(s.brkPts&&typeof s.brkPts==='object')for(const k of Object.keys(TYPES))save.brkPts[k]=Math.max(0,Math.min(999,Math.floor(num(s.brkPts[k],0))));\n  rarLoad(s,num);")
# the old field must keep its name in loadSave (everything else moves to save.cc below)
s = s.replace("save.cards[k]=[0,1,2,3].map(", "save.__LEGACY__[k]=[0,1,2,3].map(")
s = s.replace("save.cards", "save.cc")
s = s.replace("save.__LEGACY__[k]=[0,1,2,3].map(", "save.cards[k]=[0,1,2,3].map(")
# (inserted after the rename: rarLoad reads the old field by its real name)
R("/* ================= INIT ================= */", rd('v21_rarity.js') + "\n/* ================= INIT ================= */")

# ---- gacha maths ----
RF('epicChance', """function epicChance(n){            // n = position in the current streak without 신화 or better (1-based)
  const base=GACHA.odds[3]+GACHA.odds[4];
  if(n>=GACHA.hard)return 100;
  return Math.min(100,base+Math.max(0,n-GACHA.softFrom)*GACHA.softStep);
}""")
RF('gradeProbs', """function gradeProbs(pity){         // % per rarity for the next pull, given the current pity counter
  const o=GACHA.odds,E=epicChance(pity+1),lo=o[0]+o[1]+o[2],hi=o[3]+o[4];
  return [(100-E)*o[0]/lo,(100-E)*o[1]/lo,(100-E)*o[2]/lo,E*o[3]/hi,E*o[4]/hi];
}""")
RF('gachaEff', """function gachaEff(){               // long-run rates including soft/hard pity (renewal chain over pity states)
  let w=1,tot=0;const acc=[0,0,0,0,0];
  for(let s=0;s<GACHA.hard;s++){const p=gradeProbs(s);for(let i=0;i<5;i++)acc[i]+=w*p[i];tot+=w;w*=1-epicChance(s+1)/100;if(w<=0)break;}
  return {p:acc.map(v=>v/tot),perEpic:tot};
}""")
R("const pickupRate=()=>GACHA.pickShare+(100-GACHA.pickShare)*(TYPE_W[pickupNow().type]||0)/100;",
  "const pickupRate=()=>typeRate(pickupNow().type);\n"
  "// base % that one pull gives penguin k (rarity rate without pity x its share of that rarity); the pickup takes pickShare% of its rarity\n"
  "function typeShare(k){const g=RAR[k],ks=tierTypes(g),pk=pickupNow().type;if(TYPES[k].exclusive||!ks.includes(k))return 0;if(RAR[pk]!==g)return 100/ks.length;return k===pk?GACHA.pickShare:(100-GACHA.pickShare)/(ks.length-1);}\n"
  "function typeRate(k){return GACHA.odds[RAR[k]]*typeShare(k)/100;}")
RF('pickType', """function pickType(g){   // a penguin of rarity g; the weekly pickup takes pickShare% of its rarity, and a miss guarantees it next time
  const pk=pickupNow().type,sc=save.scout,ks=tierTypes(g);let t;
  if(RAR[pk]===g&&ks.includes(pk)){
    if(sc.pickMiss||Math.random()*100<GACHA.pickShare)t=pk;
    else{const o=ks.filter(k=>k!==pk);t=o[Math.floor(Math.random()*o.length)]||pk;}
    sc.pickMiss=t!==pk;
  }else t=ks[Math.floor(Math.random()*ks.length)];
  return t;
}""")
RF('rollGrade', """function rollGrade(){   // soft pity from GACHA.softFrom, hard pity at GACHA.hard (see gradeProbs)
  const p=gradeProbs(save.scout.pity),r=Math.random()*100;let acc=0,last=0;
  for(let i=0;i<5;i++){if(p[i]>0)last=i;acc+=p[i];if(r<acc)return i;}
  return last;
}""")
RF('grantCard', """function grantCard(type){   // first copy unlocks the penguin, later copies are kept as cards of its rarity
  const g=RAR[type]|0;
  if(!save.types.includes(type)){save.types.push(type);save.lv[type]=save.lv[type]|0;return true;}
  if(save.cc[type][g]>=GACHA.dupCap){save.points+=GACHA.dupOverflow[g];return false;}   // storage full: refund instead of losing the card silently
  save.cc[type][g]++;return false;
}
function grantTier(g){const ks=tierTypes(g),k=ks[Math.floor(Math.random()*ks.length)];return {k,g,isNew:grantCard(k)};}   // reward card: any penguin of that rarity""")
RF('pullOnce', """function pullOnce(minG){
  let g=rollGrade();if(g<minG)g=minG;const sc=save.scout,type=pickType(g);
  sc.pulls++;if(g>=3)sc.pity=0;else sc.pity++;
  const p0=save.points,isNew=grantCard(type),ovf=save.points-p0;
  sc.hist.unshift([type,g,isNew?1:0]);if(sc.hist.length>GACHA.histMax)sc.hist.length=GACHA.histMax;
  return {type,g,isNew,ovf,pick:type===pickupNow().type};
}""")
RIN('doPull', "res.push(pullOnce(i===9&&!res.some(r=>r.g>=1)?1:0))", "res.push(pullOnce(i===9&&!res.some(r=>r.g>=GACHA.tenMin)?GACHA.tenMin:0))")
RIN('enhRate', "ENH_CARD_BONUS[g]", "ENH_CARD_BONUS[RAR[type]|0]")
RIN('doEnhance', "  if(fxBusy)return;const lv=save.lv[type];", "  if(fxBusy)return;g=RAR[type]|0;const lv=save.lv[type];")
RIN('doFuse', "if(ok){const t=pickType();out={type:t,g:g+1,isNew:grantCard(t,g+1)};", "if(ok){const t=pickType(g+1);out={type:t,g:g+1,isNew:grantCard(t)};")
RIN('doFuse', "flashMsg('같은 등급 카드가 3장 필요해요!')", "flashMsg('같은 등급 펭귄 카드가 3장 필요해요!')")
RF('brkAvail', "function brkAvail(k){let v=save.brkPts[k]|0;for(let g=0;g<5;g++)v+=save.cc[k][g]*BRK.val[g];return v;}")
RIN('brkPlan', "use=[0,0,0,0]", "use=[0,0,0,0,0]")
RIN('brkPlan', "for(let g=0;g<4&&have<need;g++)", "for(let g=0;g<5&&have<need;g++)")
RIN('doBreak', "for(let g=0;g<4;g++)save.cc[k][g]-=pl.use[g];", "for(let g=0;g<5;g++)save.cc[k][g]-=pl.use[g];")
RIN('doBreak', "flashMsg('돌파 포인트가 '+(pl.need-pl.have)+'점 부족해요 (같은 펭귄 카드: 일반1·희귀2·영웅4·전설8점)')",
  "flashMsg(fmtL('돌파 포인트가 {n}점 부족해요 (이 펭귄 카드 1장 = {v}점)',{n:pl.need-pl.have,v:BRK.val[RAR[k]|0]}))")
RF('enAutoG', "function enAutoG(k){return RAR[k]|0;}   // a penguin's cards all have its rarity")

# ---- cards ----
RIN('cardHtml', "g=TYPES[k].exclusive?4:(o.g!==undefined?o.g:tierOfLv(lv))", "g=rarCls(k)")
RIN('slotHtml', "lv:r.isNew?r.g:0", "lv:0")

# ---- scout screen texts (pull tab) ----
RIN('scPullHtml', "'🎯 다음 영웅 이상은 <b>픽업 확정!</b>':'영웅 이상에서 픽업을 놓치면 다음 영웅 이상은 픽업 확정'",
  "fmtL('🎯 다음 {r} 펭귄은 <b>픽업 확정!</b>',{r:GRADES[RAR[pk.type]].n}):fmtL('{r} 펭귄이 나왔는데 픽업이 아니면 다음 {r} 펭귄은 픽업 확정',{r:GRADES[RAR[pk.type]].n})")
RIN('scPullHtml', "<div class=\"gb-tt\">'+TT[pk.type].name+' · '+SPECIALS[P.special]+'</div>'",
  "<div class=\"gb-tt\"><b class=\"rar-t g'+rarCls(pk.type)+'\">'+GRADES[RAR[pk.type]].n+'</b> · '+TT[pk.type].name+' · '+SPECIALS[P.special]+'</div>'")
RIN('scPullHtml', "<b>영웅 이상 천장</b>", "<b>신화 이상 천장</b>")
RIN('scPullHtml', "다음 뽑기 영웅 이상 <b>", "다음 뽑기 신화 이상 <b>")
RIN('scPullHtml', "'⭐ '+c10+'P · 희귀 이상 1장 보장'", "'⭐ '+c10+'P · 레어 이상 1장 보장'")
RIN('scPullHtml', "const cnt=[0,0,0,0];scLast.forEach", "const cnt=[0,0,0,0,0];scLast.forEach")
RIN('scPullHtml', "cardHtml(r.type,{g:r.g,lv:r.isNew?r.g:0,tag:", "cardHtml(r.type,{lv:0,tag:")
RIN('scPullHtml', "const c=[0,0,0,0];sc.hist.forEach", "const c=[0,0,0,0,0];sc.hist.forEach")
RIN('scPullHtml', "'<span class=\"g'+r[1]+(r[2]?' nw':'')+'\"", "'<span class=\"g'+rarCls(r[0])+(r[2]?' nw':'')+'\"")
RF('oddsBox', """function oddsBox(){
  const e=gachaEff(),pk=pickupNow().type,o=GACHA.odds,hi=o[3]+o[4],ls=Math.round(o[4]/hi*100);
  const tiers=GRADES.map((G_,g)=>{const ks=tierTypes(g);return '<br><b class="rar-t g'+g+'">'+G_.n+'</b> '+o[g]+'%: '+ks.map(k=>TYPES[k].name.replace(' 펭귄','')+' '+typeRate(k).toFixed(2)+'%'+(k===pk?' (픽업)':'')).join(' · ');}).join('');
  return '<details class="odds"><summary>📊 확률 정보 <small>'+fmtL('신화 이상 실제 {a}% · 전설 {b}% · 픽업 {c}% (눌러서 전체 보기)',{a:(e.p[3]+e.p[4]).toFixed(2),b:e.p[4].toFixed(2),c:pickupRate().toFixed(2)})+'</small></summary><small>화면의 숫자와 실제 추첨이 같은 설정값을 사용해요</small>'
    +'<br>'+fmtL('뽑기 1회는 먼저 등급을 정하고, 그 등급의 펭귄 중 하나가 나와요. 펭귄마다 등급이 정해져 있어요.',{})
    +'<br>등급 확률(천장 전): '+GRADES.map((g,i)=>g.n+' '+o[i]+'%').join(' · ')
    +'<br>천장 포함 실제 확률: '+GRADES.map((g,i)=>g.n+' '+e.p[i].toFixed(2)+'%').join(' · ')+fmtL(' · 신화 이상 평균 {n}회에 1장',{n:e.perEpic.toFixed(1)})
    +'<br>'+fmtL('천장: {a}회차부터 신화 이상 확률이 회당 +{s}%p씩 오르고, {h}회차는 신화 이상 확정 (신화 {m}% / 전설 {l}%) · 신화 이상이 나오면 0회로 초기화 · 1회/10회 뽑기 공통',{a:GACHA.softFrom+1,s:GACHA.softStep,h:GACHA.hard,m:100-ls,l:ls})
    +'<br>펭귄별 확률(1회당, 천장 전):'+tiers
    +'<br>'+fmtL('픽업: 픽업 펭귄은 자기 등급이 나올 때 {p}%로 나오고, 나머지는 같은 등급 펭귄이 똑같이 나눠요 · 픽업 등급이 나왔는데 픽업이 아니면 다음 그 등급은 픽업 확정 (주간 배너가 바뀌어도 유지) · 픽업은 매주 월요일 0시에 교체',{p:GACHA.pickShare})
    +'<br>'+fmtL('10회 뽑기: 앞 9장에 {r} 이상이 없으면 10번째는 {r} 이상 보장',{r:GRADES[GACHA.tenMin].n})
    +'<br>중복 카드: 같은 종류 카드로 보관 → 강화·돌파·합성 재료 · 종류별 '+GACHA.dupCap+'장까지 보관 (넘치면 '+GACHA.dupOverflow.map((p,i)=>GRADES[i].n+' '+p+'P').join('·')+' 자동 환급)'
    +'<br>처음 얻은 펭귄은 Lv0으로 해금돼요 · 현금 결제 없음, 경기로 번 포인트만 사용</details>';
}""")
# ---- fusion tab ----
RIN('renderScout', "h+='<div class=\"chips\">'+[0,1,2].map(i=>", "h+='<div class=\"chips\">'+[0,1,2,3].map(i=>")
RIN('renderScout', "같은 등급 카드 3장을 골라 합성해요 · 성공 '+d.rate+'% · '+d.cost+'P · 실패하면 1장만 돌려받아요",
  "'+fmtL('같은 등급 펭귄 카드 3장을 골라 합성해요 → {r} 펭귄 1장 · 성공 {p}% · {c}P · 실패하면 1장만 돌려받아요',{r:GRADES[g+1].n,p:d.rate,c:d.cost})+'")
RIN('renderScout', "<br>새로 나오는 종류는 뽑기와 같은 확률이에요.</div>", "<br>새로 나오는 펭귄은 그 등급 안에서 뽑기와 같은 확률이에요 (픽업 포함).</div>")
# ---- dex ----
RIN('scDexHtml', "카드 프레임은 강화 레벨에 따라 바뀌어요 (Lv3 희귀 · Lv6 영웅 · Lv9 전설) · 별(★)은 돌파 단계예요. 카드는 강화·돌파(같은 종류)와 합성(같은 등급)에 쓰여요.",
  "카드 테두리 색은 펭귄의 등급이에요 (기본 · 희귀 · 레어 · 신화 · 전설) · 별(★)은 돌파 단계예요. 카드는 강화·돌파(같은 종류)와 합성(같은 등급)에 쓰여요.")
RIN('scDexHtml', "'<b>'+TYPES[k].name.replace(' 펭귄','')+'</b><small>보관 '+tot+'장'", "'<b>'+TYPES[k].name.replace(' 펭귄','')+'</b><small><i class=\"rar-t g'+rarCls(k)+'\">'+GRADES[RAR[k]].n+'</i> · 보관 '+tot+'장'")
RIN('scDexHtml', "'</b><small>'+(TYPES[k].exclusive?'💻 특별 보상':'미해금')+'</small>'", "'</b><small>'+(TYPES[k].exclusive?'💻 특별 보상':'<i class=\"rar-t g'+rarCls(k)+'\">'+GRADES[RAR[k]].n+'</i> · 미해금')+'</small>'")
# ---- card detail ----
RIN('openCard', "(t.exclusive?'신화':GRADES[tierOfLv(lv)].n+' 프레임')", "'<b class=\"rar-t g'+rarCls(k)+'\">'+GRADES[RAR[k]].n+(t.exclusive?' · 독점':'')+'</b>'")
RIN('openCard', "'<div class=\"cd-mats\">보유 재료 카드: '+save.cc[k].map((n,g)=>'<span class=\"g'+g+'\">'+GRADES[g].n+' '+n+'</span>').join('')+'<br><small>같은 종류 카드는 강화 재료(1장)와 돌파 포인트(일반1·희귀2·영웅4·전설8점)로 쓰여요</small></div>'",
  "'<div class=\"cd-mats\">'+fmtL('보유 카드: {n}장',{n:'<span class=\"g'+rarCls(k)+'\">'+save.cc[k].reduce((a,n)=>a+n,0)+'</span>'})+'<br><small>'+fmtL('같은 펭귄 카드는 강화 재료(1장)와 돌파 포인트(1장 = {v}점)로 쓰여요',{v:BRK.val[RAR[k]|0]})+'</small></div>'")
RIN('openCard', "const eff=GACHA.pickShare*(pickupNow().type===k?1:0)+(100-GACHA.pickShare)*(TYPE_W[k]||0)/100;", "const eff=typeRate(k);")
RIN('openCard', "'+eff.toFixed(1)+'%'", "'+eff.toFixed(2)+'%'")
# ---- enhancement screen: one material (the penguin's own cards), rarity bonus ----
RIN('scEnhHtml', "save.cc[q].some(n=>n>0)", "save.cc[q][RAR[q]|0]>0")
RIN('scEnhHtml', "<span class=\"dot g'+(TYPES[q].exclusive?4:tierOfLv(l))+'\"></span>", "<span class=\"dot g'+rarCls(q)+'\"></span>")
RIN('scEnhHtml', "const ms=[];if(tierOfLv(lv+1)>tierOfLv(lv))ms.push('🎴 '+GRADES[tierOfLv(lv+1)].n+' 프레임 승급');", "const ms=[];")
RIN('scEnhHtml', "h+='<div class=\"en-mats\">'+[0,1,2,3].map(q=>'<button class=\"en-mat g'+q+(q===g&&has?' on':'')+'\" data-act=\"eng\" data-g=\"'+q+'\"'+(save.cc[k][q]?'':' disabled')+'><b>'+GRADES[q].n+'</b><small>'+save.cc[k][q]+'장</small><span>'+enhRate(k,q)+'%</span></button>').join('')+'<button class=\"btn small\" data-act=\"enauto\" title=\"낮은 등급 카드부터 사용해 고등급 카드를 아껴요\">자동 선택</button></div>';",
  "h+='<div class=\"en-mats\"><button class=\"en-mat g'+rarCls(k)+(has?' on':'')+'\" data-act=\"eng\" data-g=\"'+g+'\"'+(has?'':' disabled')+'><b>'+GRADES[g].n+'</b><small>'+save.cc[k][g]+'장</small><span>'+enhRate(k,g)+'%</span></button><small class=\"en-mnote\">'+fmtL('이 펭귄 카드 1장 사용 · {r} 등급 보너스 +{b}%',{r:GRADES[g].n,b:ENH_CARD_BONUS[g]})+'</small></div>';")
RIN('scEnhHtml', "(has&&ENH_CARD_BONUS[g]?' · '+GRADES[g].n+' 카드 +'+ENH_CARD_BONUS[g]+'%':'')", "(has&&ENH_CARD_BONUS[g]?' · '+fmtL('{r} 등급 +{b}%',{r:GRADES[g].n,b:ENH_CARD_BONUS[g]}):'')")
RIN('scEnhHtml', "' · 일반1·희귀2·영웅4·전설8점</small></div>'", "' · '+fmtL('이 펭귄 카드 1장 = {v}점',{v:BRK.val[RAR[k]|0]})+'</small></div>'")
RIN('scEnhHtml', "'<br>카드 등급 보너스: '+GRADES.map((g,i)=>g.n+' +'+ENH_CARD_BONUS[i]+'%').join(' · ')", "'<br>펭귄 등급 보너스: '+GRADES.map((g,i)=>g.n+' +'+ENH_CARD_BONUS[i]+'%').join(' · ')+'<br>돌파 포인트(카드 1장): '+GRADES.map((g,i)=>g.n+' '+BRK.val[i]+'점').join(' · ')")
# ---- enhancement result: no more frame promotion ----
RIN('playEnhFx', "const tierA=tierOfLv(o.from),tierB=tierOfLv(o.to),col=o.ok===false?'#9fb0c2':o.brk?'#ffd45e':GRADES[Math.max(1,tierB)].c;",
  "const col=o.ok===false?'#9fb0c2':o.brk?'#ffd45e':GRADES[Math.max(1,RAR[k]|0)].c;")
RIN('playEnhFx', "      if(tierB>tierA)h+='<div class=\"up\">🎴 '+GRADES[tierB].n+' 프레임으로 승급!</div>';\n", "")
# ---- pack opening: effect strength by rarity (기본 · 희귀/레어 · 신화 · 전설 ~ the old 4 steps) ----
_f = FN('playPackOpen')
_g = _f.replace('GRADES[r.g]', '@@GR@@').replace('GRADES[best]', '@@GB@@').replace('GRADES[bg]', '@@GG@@')
_g = _g.replace('r.g', 'FQ[r.g]').replace('best>=', 'FQ[best]>=').replace('best*25', 'FQ[best]*25')
_g = _g.replace('@@GR@@', 'GRADES[r.g]').replace('@@GB@@', 'GRADES[best]').replace('@@GG@@', 'GRADES[bg]')
_g = _g.replace('const cnt=[0,0,0,0],', 'const cnt=[0,0,0,0,0],').replace('res.forEach(r=>cnt[FQ[r.g]]++)', 'res.forEach(r=>cnt[r.g]++)')
_g = _g.replace("map(r=>FQ[r.g])", "map(r=>r.g)")
assert 'cnt[r.g]++' in _g and _g.count('FQ[') > 8
s = s.replace(_f, _g, 1)
_f = FN('spotlightCard')
_g = _f.replace('GRADES[r.g]', '@@GR@@').replace('r.g', 'FQ[r.g]').replace('@@GR@@', 'GRADES[r.g]')
s = s.replace(_f, _g, 1)
R("const tierOfLv=lv=>lv>=9?3:lv>=6?2:lv>=3?1:0;", "const tierOfLv=lv=>lv>=9?3:lv>=6?2:lv>=3?1:0;\nconst FQ=[0,1,1,2,3];   // pack-opening effect step per rarity")

# ---- transfer market: listings and prices follow the rarity ----
_f = FN('mkGen')
assert "const x=r()*100;let g=3,acc=0;for(let j=0;j<4;j++){acc+=MK_GW[j];if(x<acc){g=j;break;}}" in _f
_g = _f.replace("const x=r()*100;let g=3,acc=0;for(let j=0;j<4;j++){acc+=MK_GW[j];if(x<acc){g=j;break;}}",
                "const x=r()*100;let g=4,acc=0;for(let j=0;j<5;j++){acc+=MK_GW[j];if(x<acc){g=j;break;}}")
_g = _g.replace("const type=types[Math.floor(r()*types.length)],", "const tt=tierTypes(g),type=tt[Math.floor(r()*tt.length)],")
assert 'tierTypes(g)' in _g
s = s.replace(_f, _g, 1)
R("for(const k of mkTypes())for(let g=0;g<4;g++){const n=save.cc[k][g]|0;if(!n)continue;const p=mkSellPrice(k,g,m);",
  "for(const k of mkTypes())for(let g=0;g<5;g++){const n=save.cc[k][g]|0;if(!n)continue;const p=mkSellPrice(k,g,m);")
R("'+TYPES[x.type].name+' · '+GRADES[x.g].n+(x.n?' · 신규':'')+'", "'+TYPES[x.type].name+' · '+GRADES[RAR[x.type]|0].n+(x.n?' · 신규':'')+'")
R("for(const k of Object.keys(TYPES))for(let g=0;g<4;g++)cards+=(save.cc[k][g]|0)*MK_SELL[g]*MK_TMUL[k];",
  "for(const k of Object.keys(TYPES))for(let g=0;g<5;g++)cards+=(save.cc[k][g]|0)*MK_SELL[g]*MK_TMUL[k];")
RIN('mkBuy', "const isNew=grantCard(L.type,L.g);", "const isNew=grantCard(L.type);")

# ---- reward cards: a penguin of the rewarded rarity ----
R("if(first){const ks=Object.keys(TYPES).filter(k=>!TYPES[k].exclusive),k=ks[Math.floor(Math.random()*ks.length)];card={k,g:T.card,isNew:grantCard(k,T.card)};}",
  "if(first){card=grantTier(T.card);}")
R("if(R.g!=null){const ks=nonExclTypes(),k=ks[Math.floor(Math.random()*ks.length)];L.card={k,g:R.g,isNew:grantCard(k,R.g)};}",
  "if(R.g!=null)L.card=grantTier(R.g);")
R("&&n(L.card.g)<=3?{k:L.card.k,g:n(L.card.g),", "&&n(L.card.g)<=4?{k:L.card.k,g:n(L.card.g),")
R("<br>보상 카드는 일반 펭귄 {k}종 중 하나가 무작위로 나와요 (각 {p}%).<br>",
  "<br>보상 카드는 그 등급의 펭귄 중 하나가 같은 확률로 나와요 (레어 {r2}종 · 신화 {r3}종 · 전설 {r4}종).<br>")
RIN('seasonRulesTxt', "{w:SEASON.days/7,", "{r2:tierTypes(2).length,r3:tierTypes(3).length,r4:tierTypes(4).length,w:SEASON.days/7,")

# ---- frames: 신화 red joins; old gold (.g3) -> 전설 .g4, the exclusive frame (.g4) -> .g9 ----
_m = _re.search(r'<style>(.*?)</style>', s, _re.S)
_css = _m.group(1)
_css = _re.sub(r'\.g4(?![0-9])', '.g9', _css)
_css = _re.sub(r'\.g3(?![0-9])', '.g4', _css)
_COL = {'#d3a6ff':'#ffb3bc','#9d57f2':'#f0465c','#35166f':'#5c0d1b','rgba(180,107,255':'rgba(255,90,110','#dcb8ff':'#ffc2c8','#7e46d9':'#d6283f',
        '#260e52':'#470914','rgba(180,110,255':'rgba(255,96,116','rgba(170,110,255':'rgba(255,100,120','rgba(230,200,255':'rgba(255,206,212','#b46bff':'#ff5a6e'}
_add = []
for _r in _re.finditer(r'(?<=[}\n])([^{}@]*\.g2(?![0-9])[^{}]*)\{([^{}]*)\}', _css):
    sel, body = _r.group(1).strip(), _r.group(2)
    if '.g4' in sel: sel = ','.join(x for x in sel.split(',') if '.g2' in x)
    sel = _re.sub(r'\.g2(?![0-9])', '.g3', sel)
    for a, b in _COL.items(): body = body.replace(a, b)
    _add.append(sel + '{' + body + '}')
assert len(_add) >= 10, len(_add)
_css += '\n/* ===== v21: 신화 (mythic) frame, cloned from the purple one in red ===== */\n' + '\n'.join(_add) + '\n.rar-t{font-style:normal;font-weight:700}.rar-t.g0{color:#b9c8d8}.rar-t.g1{color:#7cc4ff}.rar-t.g2{color:#d1a4ff}.rar-t.g3{color:#ff8f9c}.rar-t.g4{color:#ffd45e}.rar-t.g9{color:#ff9de2}\n.en-mnote{display:block;margin:4px 0 0;opacity:.85}\n'
s = s[:_m.start(1)] + _css + s[_m.end(1):]

# ---- test exports ----
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,RAR,rarCls,tierTypes,typeRate,typeShare,grantTier,grantCard,rarLoad,MK_BUY,MK_SELL,MK_GW,ENH_CARD_BONUS,BRK,epicChance,gradeProbs,gachaEff,pickType,")
