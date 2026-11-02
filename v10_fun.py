# ===== fun pack: items, fever, shootout =====
R("/* ---- input wiring ---- */",rd('v10_fun.js')+"\n/* ---- input wiring ---- */")
R("arena:'auto',vol:'mid',vib:true,shake:RM0?'low':'on',flash:true,motion:RM0};","arena:'auto',vol:'mid',vib:true,shake:RM0?'low':'on',flash:true,motion:RM0,items:true};")
R("  for(const k of['vib','flash','motion'])if(typeof ss[k]==='boolean')save.set[k]=ss[k];","  for(const k of['vib','flash','motion','items'])if(typeof ss[k]==='boolean')save.set[k]=ss[k];")
R("  {k:'arena',label:'경기장',","  {k:'items',label:'빙판 아이템',opts:[[true,'켜기'],[false,'끄기']]},\n  {k:'arena',label:'경기장',")
# frozen skaters (shootout) are out of play
R("    if(p.fall>0){p.fall-=dt;p.ix=p.iz=0;p.gvx=p.gvz=0;if(p.fall<=0)p.getup=.6;continue;}",
  "    if(p.boostT>0)p.boostT-=dt;if(p.fireT>0)p.fireT-=dt;if(p.magT>0)p.magT-=dt;\n    if(p.frozen){p.ix=p.iz=0;continue;}\n    if(p.fall>0){p.fall-=dt;p.ix=p.iz=0;p.gvx=p.gvz=0;if(p.fall<=0)p.getup=.6;continue;}")
R("  for(const p of G.pengs)movePeng(p,h);\n  pengCollisions();\n  puckStep(h);","  for(const p of G.pengs)if(!p.frozen)movePeng(p,h);\n  pengCollisions();\n  puckStep(h);v10Sim(h);")
R("const A=a[i],B=a[j];if(A.goalie&&B.goalie)continue;","const A=a[i],B=a[j];if(A.goalie&&B.goalie||A.frozen||B.frozen)continue;")
R("    if(p.shotGrace>0)continue;let rad=p.r;","    if(p.shotGrace>0||p.frozen)continue;let rad=p.r;")
R("    if(p.goalie||p.shotGrace>0)continue;","    if(p.goalie||p.shotGrace>0||p.frozen)continue;")
R("if(o.fall>0)continue;","if(o.fall>0||o.frozen)continue;",5)
R("    if(s.human||s.fall>0||s.passive)continue;","    if(s.human||s.fall>0||s.passive||s.frozen)continue;")
R("function swapNearest(){\n","function swapNearest(){\n  if(G.so)return;\n")
R("function autoSwitch(dt){\n","function autoSwitch(dt){\n  if(G.so)return;\n")
R("for(const p of G.pengs)p.pg.root.visible=show;","for(const p of G.pengs)p.pg.root.visible=show&&!p.frozen;")
# boost / fever speed
R("    let cap=(7+1.4*st.speed)*dif*slow,acc=(13+5*st.accel)*slow;","    let cap=(7+1.4*st.speed)*dif*slow,acc=(13+5*st.accel)*slow;\n    if(p.boostT>0){cap*=1.3;acc*=1.25;}if(G.hype&&G.hype.feverT>0&&p.team===G.mine)cap*=1.08;")
# shots: fire puck, fever
R("  if(!tap)sp*=(T_.pow||1);if(ot)sp*=1.06*(T_.ot||1);","  if(!tap)sp*=(T_.pow||1);if(ot)sp*=1.06*(T_.ot||1);\n  sp*=v10ShotMul(p,tap);")
R("if(ot&&pk.shot)pk.shot.oneT=true;","if(ot&&pk.shot)pk.shot.oneT=true;if(p._fire&&pk.shot){pk.shot.fire=true;popAt('🔥 FIRE SHOT!',pk.x,2,pk.z);}")
# fever trigger + goal tag + result bonus
R("  const n=c.n,e=$('#combo');","  const n=c.n,e=$('#combo');if(n>=5&&!(h.feverT>0))feverStart();")
R("  if(fresh&&sh.oneT)tags.push('ONE-TIMER!');","  if(fresh&&sh.oneT)tags.push('ONE-TIMER!');\n  if(fresh&&sh.fire)tags.push('FIRE SHOT!');\n  if(h.feverT>0){tags.push('FEVER GOAL!');h.feverGoals=(h.feverGoals||0)+1;}")
R("    R.base=base;R.cb=cbBonus;R.extra=extra;R.extraName=extraName;R.total=base+cbBonus+extra;",
  "    const fv=Math.min(20,((h.feverGoals)|0)*5);R.fv=fv;\n    R.base=base;R.cb=cbBonus;R.extra=extra;R.extraName=extraName;R.total=base+cbBonus+extra+fv;")
R("  if(R.cb>0)html+='<div class=\"rs-row\"><span>콤보 보너스 (최고 x'+h.combo.max+')</span><span><b class=\"cu\" data-to=\"'+R.cb+'\">0</b> P</span></div>';",
  "  if(R.cb>0)html+='<div class=\"rs-row\"><span>콤보 보너스 (최고 x'+h.combo.max+')</span><span><b class=\"cu\" data-to=\"'+R.cb+'\">0</b> P</span></div>';\n  if(R.fv>0)html+='<div class=\"rs-row\"><span>🔥 피버 골 보너스 ('+h.feverGoals+'골)</span><span><b class=\"cu\" data-to=\"'+R.fv+'\">0</b> P</span></div>';")
# shootout hooks
R("function scored(tm){\n  if(tm.noScore){pk_reset();return;}","function scored(tm){\n  if(G.so){soGoal(tm);return;}\n  if(tm.noScore){pk_reset();return;}")
R("        }else if(G.ot){G.otLeft-=dt;if(G.otLeft<=0){SFX.whistle();endMatch();}}","        }else if(G.ot){G.otLeft-=dt;if(G.otLeft<=0){SFX.whistle();if(soAllowed()&&G.mine.score===G.mine.opp.score)soStart();else endMatch();}}")
R("        if(G.cfg.time&&!G.ot){\n          G.timeLeft-=dt;","        if(G.so){}else if(G.cfg.time&&!G.ot){\n          G.timeLeft-=dt;")
R("  if(cfg.time&&!G.ot){const s=fmtTime(G.timeLeft);","  if(G.so){}else if(cfg.time&&!G.ot){const s=fmtTime(G.timeLeft);")
R("  if(ms===os){   // only possible when overtime ran out: decide by shots on target",
  "  if(ms===os&&G.so&&G.so.done){win=G.so.s.mine>G.so.s.opp;draw=G.so.s.mine===G.so.s.opp;note='승부차기 '+G.so.s.mine+' : '+G.so.s.opp+(draw?' · 무승부':win?' 승리!':' 패배');}\n  else if(ms===os){   // only possible when overtime ran out: decide by shots on target")
R("safe(hypeFrame,dt);safe(tutFrame,dt);","safe(hypeFrame,dt);safe(funFrame,dt);safe(tutFrame,dt);")
R("  aimLine.visible=false;aimTgt.visible=false;\n  try{clearTimeout(hypeBanner.t);","  aimLine.visible=false;aimTgt.visible=false;funReset();\n  try{clearTimeout(hypeBanner.t);")
R("  hypeMenuRefresh();leagueMenuRefresh();G.arena='classic';","  hypeMenuRefresh();leagueMenuRefresh();G.arena='classic';funReset();")
# HUD elements
R('<div id="count"></div>','<div id="count"></div><div id="soHud"></div><div id="fever"></div><div id="fxChip"></div>')
R("</style>","""#soHud{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 92px);transform:translateX(-50%);background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:8px 14px;display:none;text-align:center;box-shadow:0 10px 26px rgba(2,10,24,.45)}
#soHud.on{display:block}.so-t{font-size:17px;margin-bottom:4px;color:var(--puck)}
.so-r{display:flex;align-items:center;gap:6px;justify-content:center;font-size:13px;margin:2px 0}.so-r b{width:42px;text-align:right;font-family:'Fredoka',sans-serif}
.so-r i{width:14px;height:14px;border-radius:50%;display:inline-block;border:2px solid rgba(234,246,255,.45)}.so-r i.g{background:#35e08a;border-color:#35e08a}.so-r i.x{background:var(--redline);border-color:var(--redline)}
#fever{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 60px);transform:translateX(-50%);display:none;font:700 18px 'Fredoka','Jua',sans-serif;color:#fff;background:linear-gradient(90deg,#ff7a1a,#ff3b5c);padding:3px 14px;border-radius:999px;box-shadow:0 0 18px rgba(255,110,30,.8);white-space:nowrap}
#fever.on{display:block}
body.fever.ingame::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:9;box-shadow:inset 0 0 70px 14px rgba(255,110,30,.5);animation:fvP .7s ease-in-out infinite alternate}
@keyframes fvP{to{box-shadow:inset 0 0 90px 22px rgba(255,70,40,.6)}}
body.rm.fever::after,body.noflash.fever::after{animation:none}
#fxChip{position:absolute;left:calc(env(safe-area-inset-left,0px) + 112px);bottom:calc(env(safe-area-inset-bottom,0px) + 40px);display:none;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:4px 10px;font-size:15px;white-space:nowrap}
#fxChip.on{display:block}
body.touch #fxChip{left:calc(env(safe-area-inset-left,0px) + 86px);top:calc(env(safe-area-inset-top,0px) + 74px);bottom:auto}
@media (max-width:480px){#soHud{top:calc(env(safe-area-inset-top,0px) + 100px)}#fever{top:calc(env(safe-area-inset-top,0px) + 74px);font-size:15px}}
</style>""")
R("🐧 펭귄마다 <b>강점과 약점</b>이 있어요 (스카우트 › 도감).</div>",
  "🐧 펭귄마다 <b>강점과 약점</b>이 있어요 (스카우트 › 도감).<br>🐟⛄🔥🧲 <b>빙판 아이템</b>: 빠른 경기·자유 경기·토너먼트에서 빙판에 나타나요. 지나가면 얻어요 (설정에서 끌 수 있어요).<br>🔥 <b>피버 타임</b>: 콤보 x5를 달성하면 8초 동안 슛·스피드가 강해지고, 피버 중 골은 보너스 포인트!<br>🥅 <b>승부차기</b>: 연장전까지 비기면 3번씩 차서 승부를 가려요.</div>")
