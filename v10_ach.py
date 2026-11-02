# ===== achievements, extra goal moments, shop UX, audio/save robustness =====
R("/* ---- input wiring ---- */",rd('v10_ach.js')+"\n/* ---- input wiring ---- */")
R("const save={v:10,chalTypes:[],codes:[],","const save={v:10,chalTypes:[],codes:[],ach:{},")
R("cleanWin:0,comeback:0,oneTimer:0}","cleanWin:0,comeback:0,oneTimer:0,hatTrick:0,chainBest:0,powerGoal:0,bigHit:0,soWin:0,golden:0,steals:0}")
R("  if(s.v!==10)persist();","  if(s.ach&&typeof s.ach==='object')for(const k of Object.keys(s.ach).slice(0,60))if(s.ach[k]===true&&/^a_[a-z0-9]{1,12}$/.test(k))save.ach[k]=true;\n  if(s.v!==10)persist();")
R("const persist=()=>{try{localStorage.setItem('penguinHockey.v1',JSON.stringify(save))}catch(e){}};",
  "const persist=()=>{try{localStorage.setItem('penguinHockey.v1',JSON.stringify(save))}catch(e){if(!persist.warned){persist.warned=true;console.warn('save failed',e);setTimeout(()=>{try{flashMsg('저장하지 못했어요 (저장 공간·비공개 모드). 플레이는 계속할 수 있어요');}catch(_){}},50);}}};")
# counters
R("  if(h.wasBehind&&tm.score===tm.opp.score+1)tags.push('COMEBACK!');",
  """  if(h.wasBehind&&tm.score===tm.opp.score+1)tags.push('COMEBACK!');
  if(fresh&&sh.x0!==undefined&&Math.hypot(tm.dir*W-sh.x0,sh.z0)>16)tags.push('LONG SHOT!');
  if(h.concT&&G.t-h.concT<15)tags.push('ANSWER GOAL!');
  if(realMatch()){if(tags.includes('HAT TRICK!'))save.cum.hatTrick++;if(tags.includes('POWER SHOT!'))save.cum.powerGoal++;if(G.golden2)save.cum.golden++;}""")
R("    else{h.streak=0;h.conceded++;","    else{h.streak=0;h.conceded++;h.concT=G.t;")
R("if(ot&&pk.shot)pk.shot.oneT=true;","if(pk.shot){pk.shot.x0=pk.x;pk.shot.z0=pk.z;}if(ot&&pk.shot)pk.shot.oneT=true;")
R("  G.chain++;G.stats.bestChain=Math.max(G.stats.bestChain,G.chain);","  G.chain++;G.stats.bestChain=Math.max(G.stats.bestChain,G.chain);if(realMatch())save.cum.chainBest=Math.max(save.cum.chainBest,G.chain);")
R("  if(hitter.team===G.mine){popAt('BIG HIT!'","  if(hitter.team===G.mine){if(realMatch())save.cum.bigHit++;popAt('BIG HIT!'")
R("        if(o.team===G.mine&&G.cfg&&G.cfg.mode!=='demo')popAt('STEAL!',o.x,2.4,o.z);else if(c.team===G.mine&&G.cfg&&G.cfg.mode!=='demo')popAt('빼앗겼다!',c.x,2.3,c.z);",
  "        if(o.team===G.mine&&G.cfg&&G.cfg.mode!=='demo'){popAt('STEAL!',o.x,2.4,o.z);if(realMatch())save.cum.steals++;}else if(c.team===G.mine&&G.cfg&&G.cfg.mode!=='demo'){popAt('빼앗겼다!',c.x,2.3,c.z);const hh=G.hype;if(hh&&hh.combo.n>=2){hh.combo.n=0;hh.combo.t=0;comboHide();hypeToast('퍽을 빼앗겨 콤보가 끊겼어요');}}")
R("  if(ms===os&&G.so&&G.so.done){win=G.so.s.mine>G.so.s.opp;","  if(ms===os&&G.so&&G.so.done){win=G.so.s.mine>G.so.s.opp;if(win)save.cum.soWin++;")
# achievements are checked every second, at match end and on the home screen
R("function funFrame(dt){evFrame(dt);","function funFrame(dt){achFrame(dt);evFrame(dt);")
R("  hypeMenuRefresh();leagueMenuRefresh();G.arena='classic';funReset();","  hypeMenuRefresh();leagueMenuRefresh();G.arena='classic';funReset();achCheck();")
R("    R.hy=hypeMatchEnd(win,draw,ms,os,cfg);","    R.hy=hypeMatchEnd(win,draw,ms,os,cfg);{const ga=achCheck();R.ach=ga;R.achP=ga.reduce((s,a)=>s+a.pts,0);R.total+=R.achP;}")
R("  if(R.fv>0)html+=","  if(R.achP>0)html+='<div class=\"rs-row\"><span>🏆 업적 달성 ('+R.ach.map(a=>escH(a.name)).join(', ')+')</span><span><b class=\"cu\" data-to=\"'+R.achP+'\">0</b> P</span></div>';\n  if(R.fv>0)html+=")
R("  G.result={chal:true,ok,pts,note,part};","  G.result={chal:true,ok,pts,note,part};{const ga=achCheck();G.result.ach=ga;G.result.achP=ga.reduce((s,a)=>s+a.pts,0);}")
R("  const {ok,pts,note,part}=G.result,cfg=G.cfg,mt=cfg.challenge.match&&G.mine;\n  openResult(","  const {ok,pts,note,part,achP,ach}=G.result,cfg=G.cfg,mt=cfg.challenge.match&&G.mine;\n  openResult(")
R("(ok?'<br>⭐ +'+pts+' 포인트':'<br>다시 도전해 보세요!')","(ok?'<br>⭐ +'+pts+' 포인트':'<br>다시 도전해 보세요!')+(achP?'<br>🏆 업적 '+ach.map(a=>escH(a.name)).join(', ')+' +'+achP+'P':'')")
# goals screen: achievements tab
R('<button data-t="rec">내 기록</button>','<button data-t="ach">업적</button><button data-t="rec">내 기록</button>')
R("  }else{\n    const r=save.rec,dn={easy:'쉬움',normal:'보통',hard:'어려움'};","  }else if(gTab==='ach'){h+=achHtml();\n  }else{\n    const r=save.rec,dn={easy:'쉬움',normal:'보통',hard:'어려움'};")
# near-miss moments
R("if(G.puck.hitT<=0){G.puck.hitT=.12;G.cam.shake=Math.max(G.cam.shake,.1);SFX.hit(.9);","if(G.puck.hitT<=0){G.puck.hitT=.12;G.cam.shake=Math.max(G.cam.shake,.1);SFX.hit(.9);if(G.cfg&&G.cfg.mode!=='demo'&&Math.hypot(o.vx,o.vz)>8)popAt('땡! 골대!',o.x,1.7,o.z);")
R("if(imp>6&&G.saveShown<=0){G.saveShown=.8;popAt('SAVE!',p.x,1.6,p.z);","if(imp>6&&G.saveShown<=0){G.saveShown=.8;const great=p.diveT>0||imp>16;popAt(great?'GREAT SAVE!':'SAVE!',p.x,1.6,p.z);if(great){G.cam.shake=Math.max(G.cam.shake,.3);G.cheer=1;}")
R("  hypeBanner(main,sub,tier,key);\n","  hypeBanner(main,sub,tier,key);\n  if(real&&G.mine&&tm.score===tm.opp.score&&!t.includes('EQUALIZER!'))hypeToast('⚖️ 동점! '+tm.score+' : '+tm.opp.score);\n")
# shop: shortfall amount
R("    if(save.points<cost){flashMsg('포인트가 부족해요!');return;}\n    save.points-=cost;save[list].push(k);flashMsg('해금했어요! ✨');",
  "    if(save.points<cost){flashMsg('포인트가 '+(cost-save.points)+'P 부족해요 (가격 '+cost+'P)');return;}\n    save.points-=cost;save[list].push(k);flashMsg('구매 완료! ✨ -'+cost+'P');")
# pause: quiet the ambient loops
R("  if(G.paused){show('sPause');}else{hideAll();blurUI();}","  if(G.paused){show('sPause');SFX.crowd(0);SFX.slideLvl(0,0);SFX.windLvl(0);}else{hideAll();blurUI();}")
# rainbow trail: no allocation per call
R("const h=(G.t*.5)%1,c=new T.Color().setHSL(h,.9,.65);return[c.r","const h=(G.t*.5)%1,c=trailTmp.setHSL(h,.9,.65);trailArr[0]=c.r;trailArr[1]=c.g;trailArr[2]=c.b;return trailArr;return[c.r")
# HUD element + CSS
R('</body>','<div id="achPop" role="status" aria-live="polite"></div>\n</body>')
R("</style>","""#achPop{position:fixed;z-index:60;right:calc(env(safe-area-inset-right,0px) + 14px);top:calc(env(safe-area-inset-top,0px) + 70px);display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--puck);border-radius:16px;padding:8px 14px;box-shadow:0 12px 30px rgba(2,10,24,.5);transform:translateX(130%);transition:transform .35s cubic-bezier(.2,1.4,.4,1);pointer-events:none;max-width:min(320px,80vw)}
#achPop.on{transform:none}#achPop i{font-style:normal;font-size:28px}#achPop small{display:block;font-size:12px;color:var(--puck)}#achPop b{font-size:16px}#achPop span{font:700 16px 'Fredoka',sans-serif;color:var(--puck);margin-left:auto}
body.rm #achPop{transition:none}
.ach-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}
.ach{display:flex;gap:10px;align-items:center;padding:8px 10px;border-radius:14px;background:rgba(4,16,32,.38);border:1px solid var(--line)}
.ach>i{font-style:normal;font-size:26px;filter:grayscale(.9);opacity:.6}.ach.done>i{filter:none;opacity:1}.ach.done{border-color:rgba(53,224,138,.55)}
.ach .gi{flex:1;min-width:0}.ach b{display:block;font-size:15px}.ach small{display:block;font-size:12.5px;color:var(--frost2)}
.st-grid{display:grid;grid-template-columns:auto 1fr 30px;gap:3px 8px;align-items:center;font-size:12.5px;margin-top:4px;max-width:300px}
#gTabs{flex-wrap:nowrap;max-width:100%}#gTabs button{white-space:nowrap}@media(max-width:480px){#gTabs button{padding:8px 9px;font-size:13.5px}}
.st-grid .bar{height:7px}.st-grid b{font:700 12.5px 'Fredoka',sans-serif;text-align:right}
</style>""")
# stat bars where penguins are chosen / browsed
R("<br><span class=\"tt-line\">'+ttLine(save.type)+'</span></span></div>';","<br><span class=\"tt-line\">'+ttLine(save.type)+'</span>'+statGrid(save.type)+'</span></div>';")
R("<span class=\"tt-line\">'+TT[k].name+'<br>▲ '+TT[k].plus+'<br>▼ '+TT[k].minus+'</span><br>","<span class=\"tt-line\">'+TT[k].name+'<br>▲ '+TT[k].plus+'<br>▼ '+TT[k].minus+'</span>'+statGrid(k)+'")
R("sqBuy('hats',k,HATS[k].cost,()=>{save.hat=k;});","buyConfirm(b,'hats',k,HATS[k].cost,()=>{save.hat=k;});")
R("sqBuy('trails',k,TRAILS[k].cost,()=>{save.trail=k;});","buyConfirm(b,'trails',k,TRAILS[k].cost,()=>{save.trail=k;});")
R("sqBuy('types',k,TYPES[k].cost,null);","buyConfirm(b,'types',k,TYPES[k].cost,null);")
R("#achPop.on{transform:none}",".sq-chip.arm{outline:2px solid var(--puck);outline-offset:2px;animation:armP .6s ease-in-out infinite alternate}@keyframes armP{to{outline-offset:4px}}body.rm .sq-chip.arm{animation:none}\n#achPop.on{transform:none}")
