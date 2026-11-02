# ===== surprise events + shootout mode =====
R("/* ---- input wiring ---- */",rd('v10_events.js')+"\n/* ---- input wiring ---- */")
R("flash:true,motion:RM0,items:true};","flash:true,motion:RM0,items:true,events:true};")
R("  for(const k of['vib','flash','motion','items'])","  for(const k of['vib','flash','motion','items','events'])")
R("  {k:'items',label:'빙판 아이템',opts:[[true,'켜기'],[false,'끄기']]},","  {k:'items',label:'빙판 아이템',opts:[[true,'켜기'],[false,'끄기']]},\n  {k:'events',label:'깜짝 이벤트',opts:[[true,'켜기'],[false,'끄기']]},")
R("function funFrame(dt){itemFrame(dt);","function funFrame(dt){evFrame(dt);itemFrame(dt);")
R("function funReset(){itemsClear();","function funReset(){itemsClear();evReset();")
R("  puckStep(h);v10Sim(h);","  puckStep(h);v10Sim(h);evSim(h);")
# golden goal: +1 extra and tag
R("  tm.score++;G.scoredBy=tm;G.state='goal';","  tm.score++;G.golden2=goldenGoal(tm);G.scoredBy=tm;G.state='goal';")
R("  if(h.feverT>0){tags.push('FEVER GOAL!');","  if(G.golden2)tags.push('GOLDEN +2!');\n  if(h.feverT>0){tags.push('FEVER GOAL!');")
# shootout mode
R('      <div class="mode" data-mode="free"><i>🧊</i><b>자유 경기</b><span>시간 제한 없이</span></div>',
  '      <div class="mode" data-mode="free"><i>🧊</i><b>자유 경기</b><span>시간 제한 없이</span></div>\n      <div class="mode" data-mode="shootout"><i>🥅</i><b>승부차기</b><span>5번씩 차서 승부</span></div>')
R("  else if(mode==='free')startMatch(","  else if(mode==='shootout')startMatch({mode:'shootout',size:1,time:60,diff:s.diff,soRounds:5,tag:'🥅 SHOOTOUT'});\n  else if(mode==='free')startMatch(")
R("  const a=so.res.mine.length,b=so.res.opp.length,sa=so.s.mine,sb=so.s.opp,R=3;","  const a=so.res.mine.length,b=so.res.opp.length,sa=so.s.mine,sb=so.s.opp,R=(G.cfg&&G.cfg.soRounds)||3;")
R("  aimLine.visible=false;aimTgt.visible=false;funReset();","  aimLine.visible=false;aimTgt.visible=false;funReset();\n  if(cfg.mode==='shootout')soStart();")
R("hypeBanner('SHOOTOUT!',['🥅 승부차기 · 3번씩, 같으면 서든데스'],3,'');","hypeBanner('SHOOTOUT!',['🥅 승부차기 · '+((G.cfg&&G.cfg.soRounds)||3)+'번씩, 같으면 서든데스'],3,'');")
R('<div id="fever"></div>','<div id="fever"></div><div id="evTag"></div>')
R("</style>","""#evTag{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 60px);transform:translateX(-50%);display:none;font:700 17px 'Fredoka','Jua',sans-serif;color:#3a2600;background:linear-gradient(90deg,#ffe27a,#ffb21f);padding:3px 14px;border-radius:999px;box-shadow:0 0 16px rgba(255,190,40,.7);white-space:nowrap}
#evTag.on{display:block}body.fever #evTag.on{top:calc(env(safe-area-inset-top,0px) + 92px)}
#sMode .modes{grid-template-columns:repeat(4,minmax(0,1fr))}
@media (max-height:520px) and (min-width:621px){#sMode .modes{grid-template-columns:repeat(7,minmax(0,1fr))}}
@media (max-width:620px){#sMode .modes{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>""")
R("🥅 <b>승부차기</b>: 연장전까지 비기면 3번씩 차서 승부를 가려요.</div>","🥅 <b>승부차기</b>: 연장전까지 비기면 3번씩 차서 승부를 가려요. 경기 모드에서 승부차기만 따로 할 수도 있어요.<br>🦭🌬️⭐ <b>깜짝 이벤트</b>: 경기 중 바다표범 난입, 돌풍, 생선 비, 골든 퍽(다음 골 2점)이 일어나요.</div>")
