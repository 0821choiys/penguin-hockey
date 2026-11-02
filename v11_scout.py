# ===== v11: gacha / enhancement / breakthrough / cards =====
def SL(a,b,new):            # replace the slice from anchor a up to (not including) anchor b
    global s
    i=s.find(a)
    if i<0 or s.count(a)!=1: print('SL anchor A mismatch',a[:80]);sys.exit(1)
    j=s.find(b,i)
    if j<0: print('SL anchor B missing',b[:80]);sys.exit(1)
    s=s[:i]+new+s[j:]

# --- single config block for odds, pity, pickup, breakthrough ---
R("const FUSE_DEF=[{rate:80,cost:20},{rate:55,cost:40},{rate:30,cost:80}];",
  "const FUSE_DEF=[{rate:80,cost:20},{rate:55,cost:40},{rate:30,cost:80}];\n"
  "// gacha config: the scout UI and the roll logic both read these values (tune balance here)\n"
  "const GACHA={cost1:PULL_COST,cost10:PULL10_COST,odds:PULL_ODDS,softFrom:20,softStep:6,hard:PITY_AT,tenMin:1,pickShare:30,rotOrder:['balanced','fast','strong','defense','basic'],dupCap:999,dupOverflow:[5,10,25,60],histMax:30};\n"
  "const ENH_PITY=5;   // consecutive enhancement failures that guarantee the next attempt\n"
  "const BRK={max:5,need:[3,6,10,15,24],val:[1,2,4,8],cost:[60,120,200,320,500],stat:.05,ovr:1.5,cd:{3:.05,5:.05}};   // breakthrough with duplicate cards")
# --- save defaults + loader ---
R("const save={v:10,chalTypes:[],codes:[],ach:{},achNew:0,","const save={v:10,chalTypes:[],codes:[],ach:{},achNew:0,brk:{},brkPts:{},")
R("scout:{pulls:0,pity:0,freeDay:'',fail:{}}","scout:{pulls:0,pity:0,freeDay:'',fail:{},hist:[],pickMiss:false,elog:[]}")
R("items:true,events:true};","items:true,events:true,fastFx:false};")
R("for(const k of['vib','flash','motion','items','events'])","for(const k of['vib','flash','motion','items','events','fastFx'])")
R("save.scout.fail[k]=Math.max(0,Math.min(ENH_FAIL_MAX,Math.floor(num(sc.fail[k],0))));}",
  "save.scout.fail[k]=Math.max(0,Math.min(ENH_PITY,Math.floor(num(sc.fail[k],0))));\n"
  "    if(Array.isArray(sc.hist))save.scout.hist=sc.hist.filter(r=>Array.isArray(r)&&TYPES[r[0]]&&!TYPES[r[0]].exclusive&&r[1]>=0&&r[1]<=3).slice(0,GACHA.histMax).map(r=>[r[0],r[1]|0,r[2]?1:0]);\n"
  "    save.scout.pickMiss=sc.pickMiss===true;\n"
  "    if(Array.isArray(sc.elog))save.scout.elog=sc.elog.filter(r=>Array.isArray(r)&&TYPES[r[0]]).slice(0,8).map(r=>[r[0],Math.max(0,Math.min(MAX_LV,r[1]|0)),[0,1,2].includes(r[2])?r[2]:0,Math.max(0,Math.min(3,r[3]|0))]);}")
R("  if(Array.isArray(s.squad))save.squad=",
  "  if(s.brk&&typeof s.brk==='object')for(const k of Object.keys(TYPES))save.brk[k]=Math.max(0,Math.min(BRK.max,Math.floor(num(s.brk[k],0))));\n"
  "  if(s.brkPts&&typeof s.brkPts==='object')for(const k of Object.keys(TYPES))save.brkPts[k]=Math.max(0,Math.min(99,Math.floor(num(s.brkPts[k],0))));\n"
  "  if(Array.isArray(s.squad))save.squad=")
R("steals:0}","steals:0,enhOk:0,brk:0}")
# --- roll logic ---
R("function pickType(){let r=Math.random()*100,acc=0;for(const k of Object.keys(TYPE_W)){acc+=TYPE_W[k];if(r<acc)return k;}return 'basic';}",
  "function pickType(g){   // weekly pickup gets pickShare% of every roll; an Epic+ that missed the pickup guarantees the next Epic+\n"
  "  const pk=pickupNow().type,sc=save.scout;let t;\n"
  "  if(g>=2&&sc.pickMiss)t=pk;\n"
  "  else if(Math.random()*100<GACHA.pickShare)t=pk;\n"
  "  else{const r=Math.random()*100;let acc=0;t='basic';for(const k of Object.keys(TYPE_W)){acc+=TYPE_W[k];if(r<acc){t=k;break;}}}\n"
  "  if(g>=2)sc.pickMiss=t!==pk;\n"
  "  return t;\n}")
R("function rollGrade(){\n  if(save.scout.pity>=PITY_AT-1)return Math.random()<.15?3:2;     // pity: guaranteed Epic or better\n  let r=Math.random()*100,acc=0;for(let i=0;i<4;i++){acc+=PULL_ODDS[i];if(r<acc)return i;}return 0;\n}",
  "function rollGrade(){   // soft pity from GACHA.softFrom, hard pity at GACHA.hard (see gradeProbs)\n"
  "  const p=gradeProbs(save.scout.pity),r=Math.random()*100;let acc=0,last=0;\n"
  "  for(let i=0;i<4;i++){if(p[i]>0)last=i;acc+=p[i];if(r<acc)return i;}\n  return last;\n}")
R("  save.cards[type][g]++;return false;\n}",
  "  if(save.cards[type][g]>=GACHA.dupCap){save.points+=GACHA.dupOverflow[g];return false;}   // storage full: refund instead of losing the card silently\n"
  "  save.cards[type][g]++;return false;\n}")
R("function pullOnce(minG){\n  let g=rollGrade();if(g<minG)g=minG;const sc=save.scout,type=pickType();\n  sc.pulls++;if(g>=2)sc.pity=0;else sc.pity++;\n  return {type,g,isNew:grantCard(type,g)};\n}",
  "function pullOnce(minG){\n  let g=rollGrade();if(g<minG)g=minG;const sc=save.scout,type=pickType(g);\n  sc.pulls++;if(g>=2)sc.pity=0;else sc.pity++;\n"
  "  const p0=save.points,isNew=grantCard(type,g),ovf=save.points-p0;\n"
  "  sc.hist.unshift([type,g,isNew?1:0]);if(sc.hist.length>GACHA.histMax)sc.hist.length=GACHA.histMax;\n"
  "  return {type,g,isNew,ovf,pick:type===pickupNow().type};\n}")
R("  const sc=save.scout,free=(n===1&&sc.freeDay!==todayKey()),cost=free?0:(n===1?PULL_COST:PULL10_COST);",
  "  const sc=save.scout,free=(n===1&&sc.freeDay!==todayKey()),cost=free?0:(n===1?GACHA.cost1:GACHA.cost10);")
R("  playPackOpen(res).then(a=>{renderScout();if(a==='again')doPull(n);else if(a==='squad')goScreen('sSquad');});",
  "  playPackOpen(res).then(a=>{renderScout();if(a==='again')doPull(n);else if(a==='squad')goScreen('sSquad');else if(a==='enh'){scTab='enh';scMsg='';const d=res.find(r=>!r.isNew&&save.types.includes(r.type));if(d){enSel=d.type;enG=null;}renderScout();}});")
# --- enhancement: guarantee after ENH_PITY fails, input lock, log, result overlay ---
R("  const lv=save.lv[type];if(lv>=MAX_LV)return 0;\n  const f=Math.min(ENH_FAIL_MAX,save.scout.fail[type]|0)*ENH_FAIL_BONUS;",
  "  const lv=save.lv[type];if(lv>=MAX_LV)return 0;\n  if((save.scout.fail[type]|0)>=ENH_PITY)return 100;\n  const f=Math.min(ENH_FAIL_MAX,save.scout.fail[type]|0)*ENH_FAIL_BONUS;")
R("function doEnhance(type,g){\n  const lv=save.lv[type];","function doEnhance(type,g){\n  if(fxBusy)return;const lv=save.lv[type];")
R("  scLast=null;scFx={type,ok};persist();renderScout();\n}",
  "  scLast=null;scFx={type,ok};save.scout.elog.unshift([type,lv,ok?1:0,g]);save.scout.elog.length=Math.min(save.scout.elog.length,8);if(ok)save.cum.enhOk++;\n"
  "  persist();$('#ptsN').textContent=save.points;renderScout();\n"
  "  if(!window.__NOFX)playEnhFx({type,from:lv,to:ok?lv+1:lv,ok,g,cost}).then(a=>{scFx=null;renderScout();if(a==='again')doEnhance(type,g);});\n}")
# --- pack opening: speed setting, reveal-all label, duplicate wording, route to enhancement ---
R("fxBusy=true;fxSkip=false;fxSpeed=RM?2.5:1;","fxBusy=true;fxSkip=false;fxSpeed=RM?2.5:(save.set.fastFx?2:1);",2)
R("    $('#pkSkip').onclick=()=>{fxSkip=true;if(tapT){tapT();tapT=null;}};","    $('#pkSkip').onclick=()=>{fxSkip=true;if(tapT){tapT();tapT=null;}};$('#pkSkip').textContent=n>1?'모두 공개 ▶▶':'건너뛰기 ▶▶';")
R("foot.classList.add('on');if(res.some(r=>r.isNew)){",
  "foot.classList.add('on');if(res.some(r=>!r.isNew)){const eb=document.createElement('button');eb.className='btn';eb.textContent='⬆ 강화·돌파';eb.onclick=()=>{SFX.ui();finish('enh');};foot.insertBefore(eb,foot.firstChild);}if(res.some(r=>r.isNew)){")
R("(can?'':' disabled')+'>'+(n===1?'1회':'10회')+' 더 뽑기 · '+cost+'P</button>'",
  "(can?'':' disabled title=\"포인트 부족\"')+'>'+(n===1?'1회':'10회')+' 더 뽑기 · '+cost+'P'+(can?'':' <small>('+(cost-save.points)+'P 부족)</small>')+'</button>'")
R("cardHtml(r.type,{g:r.g,lv:r.isNew?r.g:0,tag:r.isNew?'NEW':'보관'})+'</div></div></div>';",
  "cardHtml(r.type,{g:r.g,lv:r.isNew?r.g:0,tag:r.isNew?'NEW':r.ovf?'보관 가득 +'+r.ovf+'P':'중복'})+'</div></div></div>';")
R("카드로 보관 (강화·합성 재료)","카드로 보관 (강화·돌파·합성 재료)")
R("'장 → 카드 보관'","'장 → 강화·돌파 재료로 보관'")
# --- cards: breakthrough stars, rarity ornaments, holo layer; OVR counts breakthrough ---
R("function cardOvr(k,lv){","function cardOvr(k,lv,bk){")
R("+(lv|0)*2.7+mxInfo(k).lv*.9));}","+(lv|0)*2.7+mxInfo(k).lv*.9+(bk===undefined?((save.brk&&save.brk[k])|0):bk)*BRK.ovr));}")
SL("function cardHtml(k,o){","\nconst backHtml=",
"""function cardHtml(k,o){
  o=o||{};const own=o.lv===undefined,lv=own?(save.lv[k]|0):o.lv,g=TYPES[k].exclusive?4:(o.g!==undefined?o.g:tierOfLv(lv)),t=TYPES[k],pref=PREF[k];
  const pos=o.role?POSN[o.role]:(pref?POSN[pref]:'만능'),bk=own&&save.brk?(save.brk[k]|0):0;
  const tagCls=o.tag?((o.tag==='보관'||o.tag.indexOf('중복')===0||o.tag.indexOf('보관')===0)?' dup':'')+(o.tag.indexOf('배치')===0?' use':''):'';
  return '<div class="pc g'+g+(bk>=BRK.max?' b5':'')+(o.cls?' '+o.cls:'')+'"'+(o.cw?' style="--cw:'+o.cw+'px"':'')+'><i class="pc-deco"></i><div class="pc-top"><span class="pc-ovr">'+cardOvr(k,lv,own?undefined:0)+'</span><span class="pc-pos">'+pos+'</span></div><div class="pc-art">'+pengSVG(k)+'</div><div class="pc-name">'+t.name.replace(' 펭귄','')+'</div><div class="pc-foot"><span class="pc-stars">'+(bk?'★'.repeat(bk):'')+'</span><span>Lv.'+lv+(own&&mxInfo(k).lv?' · M'+mxInfo(k).lv:'')+'</span></div>'+(o.tag?'<div class="pc-new'+tagCls+'">'+o.tag+'</div>':'')+(o.count>1?'<div class="pc-cnt">×'+o.count+'</div>':'')+'<div class="pc-foil"></div><div class="pc-holo"></div></div>';
}""")
# --- gameplay: breakthrough stats + cooldown ---
R("  const lv=save.lv[p.type]|0,ms=mxInfo(p.type).lv;if(!lv&&!ms)return;\n  const add=lv*LV_STAT+ms*MS_STAT,",
  "  const lv=save.lv[p.type]|0,ms=mxInfo(p.type).lv,bk=(save.brk&&save.brk[p.type])|0;if(!lv&&!ms&&!bk)return;\n  const add=lv*LV_STAT+ms*MS_STAT+bk*BRK.stat,")
R("  p.cdBonus=(lv>=10?.2:lv>=5?.1:0)+(ms>=10?.1:ms>=5?.05:0);","  p.cdBonus=(lv>=10?.2:lv>=5?.1:0)+(ms>=10?.1:ms>=5?.05:0)+(bk>=3?BRK.cd[3]:0)+(bk>=5?BRK.cd[5]:0);")
# --- scout screen: new pull / enhancement / dex sections + odds box from the config ---
SL("function oddsBox(){","\nfunction renderScout(){",
"""function oddsBox(){
  const e=gachaEff(),pk=pickupNow().type,base=GACHA.odds,ls=Math.round(base[3]/(base[2]+base[3])*100);
  const names=Object.keys(TYPE_W).map(k=>TYPES[k].name.replace(' 펭귄','')+' '+((k===pk?GACHA.pickShare:0)+(100-GACHA.pickShare)*TYPE_W[k]/100).toFixed(1)+'%'+(k===pk?' (픽업)':'')).join(' · ');
  return '<details class="odds"><summary>📊 확률 정보 <small>영웅 이상 실제 '+(e.p[2]+e.p[3]).toFixed(2)+'% · 전설 '+e.p[3].toFixed(2)+'% · 픽업 '+pickupRate().toFixed(0)+'% (눌러서 전체 보기)</small></summary><small>화면의 숫자와 실제 추첨이 같은 설정값을 사용해요</small><br>기본 등급 확률: '+GRADES.map((g,i)=>g.n+' '+base[i]+'%').join(' · ')
    +'<br>천장 포함 실제 확률: '+GRADES.map((g,i)=>g.n+' '+e.p[i].toFixed(2)+'%').join(' · ')+' · 영웅 이상 평균 '+e.perEpic.toFixed(1)+'회에 1장'
    +'<br>천장: '+(GACHA.softFrom+1)+'회차부터 영웅 이상 확률이 회당 +'+GACHA.softStep+'%p씩 오르고, '+GACHA.hard+'회차는 영웅 이상 확정 (영웅 '+(100-ls)+'% / 전설 '+ls+'%) · 영웅 이상이 나오면 0회로 초기화 · 1회/10회 뽑기 공통'
    +'<br>종류 확률(1회당): '+names
    +'<br>픽업: 매번 '+GACHA.pickShare+'%는 픽업 펭귄, 나머지는 기본 비율 · 영웅 이상에서 픽업이 아니면 다음 영웅 이상은 픽업 확정 (주간 배너가 바뀌어도 유지) · 픽업은 매주 월요일 0시에 교체'
    +'<br>10회 뽑기: 앞 9장에 희귀 이상이 없으면 10번째는 희귀 이상 보장'
    +'<br>중복 카드: 같은 종류 카드로 보관 → 강화·돌파·합성 재료 · 종류·등급별 '+GACHA.dupCap+'장까지 보관 (넘치면 '+GACHA.dupOverflow.map((p,i)=>GRADES[i].n+' '+p+'P').join('·')+' 자동 환급)'
    +'<br>처음 얻은 종류는 해금되고 등급에 따라 시작 레벨이 높아져요 (희귀 Lv1 · 영웅 Lv2 · 전설 Lv3) · 현금 결제 없음, 경기로 번 포인트만 사용</details>';
}""")
SL("  if(scTab==='pull'){\n    const free=sc.freeDay!==todayKey(),left=PITY_AT-1-sc.pity;","  }else if(scTab==='fuse'){",
   "  if(scTab==='pull'){\n    h+=scPullHtml();\n  }else if(scTab==='enh'){\n    h+=scEnhHtml();\n")
SL("  }else{\n    h+='<div class=\"cardrow\">'+Object.keys(TYPES).map(k=>{","  el.innerHTML=h;scFx=null;",
   "  }else{\n    h+=scDexHtml();\n  }\n")
R("  el.innerHTML=h;scFx=null;","  el.innerHTML=h;")
R("    if(a==='pull1')doPull(1);else if(a==='pull10')doPull(10);","    if(scAct(a,b))return;\n    if(a==='pull1')doPull(1);else if(a==='pull10')doPull(10);")
R("    else if(a==='fzgo')doFuse(fz.g,fz.sel.slice());};});\n}","    else if(a==='fzgo')doFuse(fz.g,fz.sel.slice());};});\n  scWire(el);\n}")
# --- growth achievements ---
R("  {id:'a_steal',",
  "  {id:'a_enh10',ico:'⬆️',name:'강화의 달인',desc:'강화 성공 10회',n:10,pts:50,prog:()=>save.cum.enhOk},\n"
  "  {id:'a_lv10',ico:'💎',name:'만렙 펭귄',desc:'펭귄 하나를 강화 Lv10까지',n:1,pts:80,prog:()=>Object.keys(TYPES).some(k=>save.types.includes(k)&&(save.lv[k]|0)>=MAX_LV)?1:0},\n"
  "  {id:'a_brk1',ico:'⭐',name:'첫 돌파',desc:'중복 카드로 펭귄 돌파 1회',n:1,pts:40,prog:()=>save.cum.brk},\n"
  "  {id:'a_brk5',ico:'🌟',name:'각성',desc:'펭귄 하나를 ★5까지 돌파',n:1,pts:120,prog:()=>Object.keys(TYPES).some(k=>(save.brk[k]|0)>=BRK.max)?1:0},\n"
  "  {id:'a_steal',")
# --- code, markup, styles ---
R("/* ---- input wiring ---- */",rd('v11_scout.js')+"\n/* ---- input wiring ---- */")
R('</body>','<div id="enhFx" class="efx" role="dialog" aria-modal="true" aria-label="강화 결과"><div class="ef-box"></div></div>'
  '<div id="cardDlg" class="cdlg" role="dialog" aria-modal="true" aria-label="카드 상세"><div class="cd-box"><button class="cd-x" aria-label="닫기">✕</button><div class="cd-body"></div></div></div>'
  '<div id="cfmDlg" class="cdlg" role="dialog" aria-modal="true" aria-label="확인"><div class="cd-box sm"><button class="cd-x" aria-label="닫기">✕</button><div class="cd-body"></div></div></div>\n</body>')
R("</style>",rd('v11_scout.css')+"</style>")
# reveal polish: hide skip once results are shown, compact summary title, highlight best card
R("    const showFoot=()=>{\n      const free=false,","    const showFoot=()=>{\n      $('#pkSkip').style.display='none';title.classList.toggle('sum',n>1);\n      if(n>1){const sl=[...grid.children],bg=Math.max(...res.map(r=>r.g));if(bg>=1)sl.forEach((e,j)=>{const r=res[order[j]];if(r&&r.g===bg){e.classList.add('best');e.style.setProperty('--bc',GRADES[bg].c);}});}\n      const free=false,")
R("    cap.className='capsule';grid.className='fx-grid';","    $('#pkSkip').style.display='';title.classList.remove('sum');let order=res.map((r,i)=>i);\n    cap.className='capsule';grid.className='fx-grid';")
R("        const order=res.map((r,i)=>i).sort(","        order=res.map((r,i)=>i).sort(")
R("        title.textContent=GRADES.map((g,i)=>cnt[i]?g.n+' '+cnt[i]:'').filter(Boolean).join(' · ')+(nw?'  |  NEW '+nw:'')+(n-nw?'  |  중복 '+(n-nw)+'장 → 강화·돌파 재료로 보관':'');",
  "        title.innerHTML='<b>'+GRADES.map((g,i)=>cnt[i]?g.n+' '+cnt[i]:'').filter(Boolean).join(' · ')+'</b>'+(nw?'NEW '+nw+'종 해금 · ':'')+(n-nw?'중복 '+(n-nw)+'장 → 강화·돌파 재료':'');")
