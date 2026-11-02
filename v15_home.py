# v15: home screen buttons - one button family with a shared icon set; goals and club chips become real buttons; 44 px targets
import re as _re
_ic=dict(_re.findall(r"\n  (\w+):'(<svg.*?</svg>)'",rd('v15_icons.js')))
R("""      <button class="btn primary" data-mode="quick">⚡ 빠른 경기<small>바로 시작 · 레이팅 변동 없음</small></button>
      <button class="btn rkbtn" data-go="sRanked">🏅 티어 게임<small>랭크 · 대표 선발전</small></button>
      <button class="btn mkbtn" data-go="sMarket">💱 이적시장<span id="mkBadge"></span><small>선수 영입 · 방출</small></button>
      <button class="btn hm-modes" data-go="sMode">🏒 모든 경기 모드</button>
    </div>
    <div id="menuGoals"></div><div id="menuStats"></div>
  </div>
  <div id="menuRank" data-go="sProfile"></div>""",
"""      <button class="btn primary hm-b hm-quick" data-mode="quick"><i class="ic">"""+_ic['quick']+"""</i><span class="tx"><b>빠른 경기</b><small>레이팅 변동 없이 바로 한 판</small></span></button>
      <button class="btn rkbtn hm-b hm-tile" data-go="sRanked"><i class="ic">"""+_ic['tier']+"""</i><span class="tx"><b>티어 게임</b><small>랭크전과 선발전</small></span></button>
      <button class="btn mkbtn hm-b hm-tile" data-go="sMarket"><i class="ic">"""+_ic['market']+"""</i><span class="tx"><b>이적시장<span id="mkBadge"></span></b><small>선수 영입과 방출</small></span></button>
      <button class="btn hm-modes hm-b hm-row" data-go="sMode"><i class="ic">"""+_ic['modes']+"""</i><span class="tx"><b>모든 경기 모드</b></span><i class="chev">"""+_ic['chev']+"""</i></button>
    </div>
    <button id="menuGoals" data-go="sGoals" aria-label="오늘의 목표"></button><div id="menuStats"></div>
  </div>
  <button id="menuRank" data-go="sProfile" aria-label="구단과 순위 · 프로필 열기"></button>""")
for _k,_e in [('sScout','🎁'),('sSquad','🧩'),('sGoals','🎯'),('sProfile','👤'),('sHow','📘'),('sSet','⚙️')]:
    _n={'sScout':'scout','sSquad':'squad','sGoals':'goals','sProfile':'profile','sHow':'how','sSet':'settings'}[_k]
    R('<button data-go="'+_k+'"><i>'+_e+'</i>','<button data-go="'+_k+'"><i>'+_ic[_n]+'</i>')
R("/* ================= UI ================= */",rd('v15_icons.js')+"\n/* ================= UI ================= */")
# today's goals: one card (next goal + three progress segments), opens the goals screen
R("""    const m=$('#menuGoals');if(m)m.innerHTML=save.goals.list.map(g=>{const d=GDEFS[g.id];return '<span class="gchip'+(g.c?' done':g.p>=d.n?' rdy':'')+'">'+(g.c?'✔ ':g.p>=d.n?'🎁 ':'')+gName(g)+' '+g.p+'/'+d.n+'</span>';}).join('');""",
"""    const m=$('#menuGoals');if(m){const L=save.goals.list,isR=g=>!g.c&&g.p>=GDEFS[g.id].n,rd=L.filter(isR).length,ach=L.filter(g=>g.c||isR(g)).length,nx=L.find(g=>!g.c&&g.p<GDEFS[g.id].n);
      m.innerHTML=L.length?'<i class="ic">'+HM_IC.goals+'</i><span class="mg-t"><b>오늘의 목표</b><span class="mg-seg">'+L.map(g=>{const d=GDEFS[g.id];return '<i class="'+(g.c?'d':isR(g)?'r':'p')+'" style="--w:'+Math.round(Math.min(1,g.p/d.n)*100)+'%"></i>';}).join('')+'</span></span>'
        +'<span class="mg-s">'+(rd?'보상을 받을 수 있어요':nx?gName(nx)+' '+Math.min(nx.p,GDEFS[nx.id].n)+'/'+GDEFS[nx.id].n:'오늘 목표를 모두 끝냈어요. 내일 새 목표가 나와요')+'</span>'
        +'<span class="mg-c'+(rd?' rdy':'')+'">'+(rd?'보상 받기':ach+'/'+L.length)+'<i class="chev">'+HM_IC.chev+'</i></span>':'';
      m.setAttribute('aria-label','오늘의 목표 '+ach+'/'+L.length+' 달성'+(rd?', 받을 보상 '+rd+'개':'')+(nx?', 다음 목표 '+gName(nx):'')+'. 목표 화면 열기');}""")
# club + rank: one button with the same icon style
R("""    if(el)el.innerHTML='<span>'+escH(save.profile.emb)+' '+escH(save.profile.club)+'</span><span>🏟 구단 <b>'+ct.me.rank+'위</b></span><span>🎖 <b style="color:'+ti.c+'">'+ti.name+'</b> · 감독 '+mt.me.rank+'위</span>'+(titleText()?'<span>'+titleText()+'</span>':'');""",
"""    if(el){el.innerHTML='<span class="mr-club">'+escH(save.profile.emb)+' '+escH(save.profile.club)+'</span><span class="mr-rank">'+HM_IC.rink+'구단 <b>'+ct.me.rank+'위</b></span><span class="mr-tier">'+HM_IC.medal+'<b style="color:'+ti.c+'">'+ti.name+'</b><em class="mr-sub">감독 '+mt.me.rank+'위</em></span>'+(titleText()?'<span class="mr-title">'+titleText()+'</span>':'');
      el.setAttribute('aria-label',save.profile.club+', 구단 '+ct.me.rank+'위, '+ti.name+', 감독 '+mt.me.rank+'위. 프로필 열기');}""")
R("</style>",rd('v15_home.css')+"</style>")
