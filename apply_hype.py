import re,sys
SRC='base.html';OUT='penguin-hockey-improved.html'
s=open(SRC,encoding='utf-8').read()
def R(old,new,cnt=1):
    global s
    c=s.count(old)
    if c!=cnt:
        print('ANCHOR MISMATCH (%d != %d): %r'%(c,cnt,old[:100]));sys.exit(1)
    s=s.replace(old,new)
def rd(f):return open(f,encoding='utf-8').read()

# ---------- physics / actions ----------
R("G.cam.shake=Math.max(G.cam.shake,.1);SFX.hit(.9);}}",
  "G.cam.shake=Math.max(G.cam.shake,.1);SFX.hit(.9);if(G.hype&&G.cfg&&G.cfg.mode!=='demo'&&((G.cfg.time&&!G.ot&&G.timeLeft<=10)||G.ot))hypeSlow(.35,.45);}}")
R("p.fall=dur;p.spinRate","p.fall=dur*(p.tr&&p.tr.tough?.7:1);p.spinRate")
R("pk.last=p;pk.lastTeam=p.team;","pk.last=p;pk.lastTeam=p.team;pk.lastT=G.t;",5)
R("const pk=G.puck;pk.last=p;pk.lastTeam=p.team;pk.lastT=G.t;","const pk=G.puck,prevL=pk.last,prevT=pk.lastT;pk.last=p;pk.lastTeam=p.team;pk.lastT=G.t;")
R("  const sh=pk.shot;\n  if(sh){\n    if(p!==sh.by)",
  "  if(G.hype&&G.mine&&G.state==='play'&&p.team===G.mine&&!p.goalie&&prevL&&prevL.team!==G.mine&&!prevL.goalie&&prevT&&G.t-prevT<1.2)cbAdd('steal','STEAL');\n  const sh=pk.shot;\n  if(sh){\n    if(p!==sh.by)")
R("sh.saved=true;if(sh.by.team===G.mine&&G.stats){G.stats.saves++;updateObjective();}}",
  "sh.saved=true;if(sh.by.team===G.mine&&G.stats){G.stats.saves++;updateObjective();}else if(p.team===G.mine){if(G.hype)G.hype.saves++;cbAdd('save','SAVE');}}")
R("  if(ps.from.team!==G.mine)return;\n  G.chain++;",
  "  if(ps.from.team!==G.mine)return;\n  if(G.hype){const h=G.hype,key=ps.from.idx+'>'+ps.to.idx;h.passes++;h.recv={p:ps.to,t:G.t};gp('passes',1);\n    if((ps.d||0)>=5&&!(key===h.lastPass&&G.t-h.lastPassT<3.5))cbAdd('pass','PASS');h.lastPass=key;h.lastPassT=G.t;}\n  G.chain++;")
R("G.pass={from:p,to:mate,t:G.t};","G.pass={from:p,to:mate,t:G.t,d:d};")
R("if(p.team===G.mine&&G.stats){G.stats.shots++;if(on)G.stats.onTarget++;updateObjective();}",
  "if(p.team===G.mine&&G.stats){G.stats.shots++;if(on)G.stats.onTarget++;updateObjective();}\n  if(p.team===G.mine&&G.hype&&G.cfg&&G.cfg.mode!=='demo'){const h=G.hype;if(charge>=.6){h.power++;gp('power',1);if(on)cbAdd('power','POWER SHOT');}if(on&&h.recv&&h.recv.p===p&&G.t-h.recv.t<2.5)cbAdd('passShot','PASS → SHOT');}")
R("  if(!p.human)spread+=G.diff.aim*.05;","  if(!p.human)spread+=G.diff.aim*.05;\n  if(p.tr&&p.tr.precise)spread*=.6;")
R("  if(!tap&&charge>.6)G.cam.shake=Math.max(G.cam.shake,.3);",
  "  if(!tap&&charge>.6)G.cam.shake=Math.max(G.cam.shake,.3);\n  if(p.human&&!tap){if(charge>.85)G.hitStop=Math.max(G.hitStop||0,.04);vib(12+Math.round(charge*30));}")

# ---------- control / goal ----------
R("p.charge=Math.min(1,p.charge+dt/.75);\n    const sg=","p.charge=Math.min(1,p.charge+dt/(.75*(p.tr&&p.tr.charge?.88:1)));\n    const sg=")
R("if(sg>p.stage){p.stage=sg;SFX.tick(sg);}","if(sg>p.stage){p.stage=sg;SFX.tick(sg);vib(8+sg*6);}")
m=re.findall(r"SFX\.goal\(\);showBanner\('GOAL! [^']*',2200,tm\.key==='blue'\?'b':'r'\);G\.cam\.shake=\.8;",s)
assert len(m)==1,'scored banner'
s=s.replace(m[0],"hypeGoal(tm,sh);")

# ---------- end of match / menu ----------
R("if(win){SFX.win();showBanner('VICTORY! \\uD83D\\uDC27\\uD83C\\uDFC6',2400,'g');}",
  "if(win){SFX.win();const gk=(G.cfg.diff==='hard');const cm=G.hype&&G.hype.trailLate;hypeBanner(gk?'GIANT KILLER!':cm?'COMEBACK WIN!':'VICTORY! \\uD83D\\uDC27\\uD83C\\uDFC6',gk&&cm?['COMEBACK WIN!']:[],gk||cm?3:1,'');}")
m=re.findall(r"  const st=save\.stats;\$\('#menuStats'\)\.textContent=[^\n]*\n",s)
assert len(m)==1,'menuStats'
s=s.replace(m[0],m[0]+"  hypeMenuRefresh();\n")
i=s.index("function showResultScreen(){");j=s.index("function openResult(title,sub,btns){")
s=s[:i]+rd('result_screen.js')+s[j:]

# ---------- main loop ----------
R("function step(dt){\n  G.t+=dt;G.frame++;","function step(dt){\n  if(G.hitStop>0){G.hitStop-=dt;dt*=.02;}else if(G.slow&&G.slow.t>0){G.slow.t-=dt;dt*=G.slow.s;}\n  G.t+=dt;G.frame++;")
R("      const sd=dt*.4,sub=Math.max(1,Math.ceil(sd/(1/90))),h=sd/sub;\n      for(let i=0;i<sub;i++){for(const p of G.pengs){movePeng(p,h);}puckStep(h);}\n",
  "      if(!hypeGoalStep(dt)){\n        const sd=dt*.4,sub=Math.max(1,Math.ceil(sd/(1/90))),h=sd/sub;\n        for(let i=0;i<sub;i++){for(const p of G.pengs){movePeng(p,h);}puckStep(h);}\n      }\n")
R("  }}catch(e){dbgErr('logic',e);}\n","  }}catch(e){dbgErr('logic',e);}\n  safe(hypeFrame,dt);\n")

# ---------- cards / scout / squad ----------
R("+(lv|0)*2.7));}","+(lv|0)*2.7+mxInfo(k).lv*.9));}")
R("<span>Lv.'+lv+'</span></div>'+(o.tag?'<div class=\"pc-new\">'+o.tag+'</div>':'')",
  "<span>Lv.'+lv+(o.lv===undefined&&mxInfo(k).lv?' · M'+mxInfo(k).lv:'')+'</span></div>'+(o.tag?'<div class=\"pc-new'+(o.tag==='보관'?' dup':'')+(o.tag.indexOf('배치')===0?' use':'')+'\">'+o.tag+'</div>':'')")
R("tag:r.isNew?'NEW':''})","tag:r.isNew?'NEW':'보관'})",2)
i=s.index("function applyLevel(p,asg){");j=s.index("// Team chemistry")
s=s[:i]+'''function applyLevel(p,asg){
  if(p.goalie||asg===false)return;
  const lv=save.lv[p.type]|0,ms=mxInfo(p.type).lv;if(!lv&&!ms)return;
  const add=lv*LV_STAT+ms*MS_STAT,st={};for(const k in p.ty.stats)st[k]=p.ty.stats[k]+add;
  p.ty=Object.assign({},p.ty,{stats:st});p.mass=1+st.body*.25;
  p.cdBonus=(lv>=10?.2:lv>=5?.1:0)+(ms>=10?.1:ms>=5?.05:0);
  p.tr={charge:ms>=3,precise:ms>=6,tough:ms>=9};     // mastery traits
}
'''+s[j:]
R("title.textContent=(r.isNew?'NEW! ':'')+GRADES[r.g].n+' · '+TYPES[r.type].name+(r.isNew?' 해금!':' 카드 획득');",
  "title.textContent=r.isNew?'NEW! '+GRADES[r.g].n+' · '+TYPES[r.type].name+' 해금!':'중복! '+GRADES[r.g].n+' 카드로 보관 (강화·합성 재료)';vib(r.g>=3?[30,40,30,40,120]:r.g===2?[20,30,40]:r.g===1?[15]:[6]);")
R("title.textContent=GRADES.map((g,i)=>cnt[i]?g.n+' '+cnt[i]:'').filter(Boolean).join(' · ')+(nw?'  |  NEW '+nw:'');",
  "title.textContent=GRADES.map((g,i)=>cnt[i]?g.n+' '+cnt[i]:'').filter(Boolean).join(' · ')+(nw?'  |  NEW '+nw:'')+(n-nw?'  |  중복 '+(n-nw)+'장 → 카드 보관':'');")
R("if(lv===3&&best>=3)ray.classList.add('on');","if(lv===3&&best>=3){ray.classList.add('on');ov.classList.add('legb');vib([20,30,20,30,60]);}")
R("ov.style.setProperty('--aura','#bfe6ff');ov.classList.remove('quake');","ov.style.setProperty('--aura','#bfe6ff');ov.classList.remove('quake','legb');")
R("sp.classList.add('on');const sl=sc.firstChild;sl.classList.add('deal');","sp.classList.toggle('leg',r.g===3);sp.classList.toggle('epic',r.g===2);sp.classList.add('on');const sl=sc.firstChild;sl.classList.add('deal');")
R("sl.classList.add('on');(r.g===3?SFX.win():SFX.passOk());\n  const c=ctr(sl);flash.","sl.classList.add('on');(r.g===3?SFX.win():SFX.passOk());vib(r.g===3?[30,40,30,40,140]:[20,30,50]);\n  const c=ctr(sl);flash.")
R("+'<br>보관 '+save.cards[k].map((n,i)=>GRADES[i].n[0]+n).join(' ')+'</div></div>'",
  "+'<br>보관 '+save.cards[k].map((n,i)=>GRADES[i].n[0]+n).join(' ')+(()=>{const m=mxInfo(k);return '<br>숙련 Lv.'+m.lv+(m.need?' ('+m.cur+'/'+m.need+' XP)':' MAX');})()+'</div></div>'")
R("'/'+SYN.length+')</div>'+",
  "'/'+SYN.length+')</div>'+(save.growth&&TYPES[save.growth.type]?'<div class=\"sq-sum\" style=\"border:1.5px solid #7dffb0\">📈 최근 성장: <b>'+TYPES[save.growth.type].name+'</b> 숙련 Lv.'+save.growth.from+' → '+save.growth.to+'<br>전 능력치 +'+((save.growth.to-save.growth.from)*MS_STAT).toFixed(2)+' · 팀 OVR '+save.growth.ov0+' → '+save.growth.ov1+'</div>':'')+")
R("<br><small>보너스는 편성한 내 팀에만 적용돼요. AI 자동 슬롯은 제외.</small></div>';",
  "<br><small>보너스는 편성한 내 팀에만 적용돼요. AI 자동 슬롯은 제외.</small></div>'+'<div class=\"sq-sum\"><small>숙련도는 경기에서 경험치로 올라요 (능력치 +'+MS_STAT+'/Lv, 특성 Lv3·6·9). 카드 강화 레벨과 별개예요.</small></div>';")
# hype module goes right after the scout tab wiring
anchor="document.querySelectorAll('#scTabs button').forEach(b=>{b.onclick=()=>{SFX.ui();scTab=b.dataset.t;scMsg='';renderScout();};});"
R(anchor,anchor+"\n"+rd('hype.js')+"\n"+rd('tutorial.js')+"\n"+rd('league.js')+"\n"+rd('ranked.js'))

R("const sc=teamOvr(n)*1000+pick.reduce((a,k)=>a+cardOvr(k,save.lv[k]),0);","const sc=teamOvr(n)*1000+computeChem(n).active.length*120+pick.reduce((a,k)=>a+cardOvr(k,save.lv[k]),0);")
# ---------- save structure + migration ----------
R("squad:[null,null,null]};","squad:[null,null,null],xp:{basic:0,fast:0,strong:0,defense:0,balanced:0},goals:{day:0,ts:0,list:[]},long:{},clk:0,growth:null,cum:{goals:0,passes:0,power:0,matches:0,wins:0,teamPlay:0,clutch:0,dailyDone:0,winHard:0,winMid:0,typeGame:0,tourWin:0,combo3:0,streak2:0},rec:{maxGoals:0,maxStreak:0,maxCombo:0,maxMargin:0,maxPass:0,tourBest:0,diff:{easy:[0,0],normal:[0,0],hard:[0,0]},type:{}}};")
R("const save={v:4,","const save={v:5,")
R("  if(s.v!==4)persist();",rd('migrate.js').rstrip('\n'))

# ---------- screens / HUD / menu / hooks ----------
R("'sChal','sScout','sSquad'];","'sChal','sScout','sSquad','sGoals'];")
R('<div class="screen" id="sSet">',rd('goals.html')+'\n<div class="screen" id="sSet">')
R("</style>",rd('hype.css')+"</style>")
R('<div id="banner"></div>','<div id="banner"></div><div id="bannerSub"></div><div id="combo"><small id="cbK"></small><b id="cbN"></b><i><u id="cbBar"></u></i></div><div id="late"></div><div id="toast"></div><div id="replayTag">◉ REPLAY <small>탭하여 건너뛰기</small></div><div id="gflash"></div>')
R('data-go="sSquad">🧩 팀 편성</button>','data-go="sSquad">🧩 팀 편성</button>\n      <button class="btn" data-go="sGoals">🎯 목표<span id="goalBadge"></span></button>')
R('<div id="menuStats" style=','<div id="menuGoals"></div><div id="menuStats" style=')
R("if(id==='sSquad'){renderSquad();requestAnimationFrame(renderSquad);}","if(id==='sSquad'){renderSquad();requestAnimationFrame(renderSquad);}\n  if(id==='sGoals')renderGoals();\n  if(id==='sMenu')hypeMenuRefresh();")
R("G.chain=0;G.chainT=0;G.otLeft=0;","G.chain=0;G.chainT=0;G.otLeft=0;hypeReset();")
R("if(G.state==='goal'&&G.scoredBy){let sx=0","if(G.state==='goal'&&G.scoredBy&&!(G.replay&&G.replay.active)){let sx=0")
R("if(G.state==='goal')zoom=.62;","if(G.state==='goal')zoom=(G.replay&&G.replay.active)?.85:.62;")
R("c.dataset.s=pl.charge<.14?0:pl.charge<.45?1:pl.charge<.8?2:3;","c.dataset.s=pl.charge<.14?0:pl.charge<.45?1:pl.charge<.8?2:3;document.body.classList.toggle('chmax',!!(pl.charging&&pl.charge>=.99));")
R("TYPES,rollGrade,playPackOpen","TYPES,hypeNew,cbAdd,hypeGoal,classifyGoal,mxInfo,grantXp,goalsEnsure,gp,claimGoal,claimLong,GDEFS,LDEFS,TRAITS,recUpdate,hypeMatchEnd,renderGoals,hypeFrame,hypeReset,rollGrade,playPackOpen")


# ---------- tutorial ----------
R("const save={v:5,","const save={v:6,")
R("diff:{easy:[0,0],normal:[0,0],hard:[0,0]},type:{}}};","diff:{easy:[0,0],normal:[0,0],hard:[0,0]},type:{}},tut:{done:false,asked:false}};")
R("  if(s.v!==5)persist();","  if(s.tut&&typeof s.tut==='object'){save.tut.done=s.tut.done===true;save.tut.asked=s.tut.asked===true;}\n  if(s.v!==6)persist();")
R("</style>",rd('tut.css')+"</style>")
R('<div id="gflash"></div>','<div id="gflash"></div><div id="tut"><div class="tut-top"><span id="tutStep"></span><div id="tutDots"></div><button id="tutSkip">건너뛰기</button></div><b id="tutTitle"></b><div id="tutText"></div><div class="tut-bar"><i id="tutBar"></i></div><div id="tutNote"></div></div>')
R('<div class="screen" id="sGoals">','<div id="tutAsk"><div class="panel"><div class="big">🐧🏒</div><h2>환영해요!</h2><p>1분이면 끝나는 튜토리얼로<br>이동 · 슛 · 패스 · 특수 기술을 직접 해볼까요?<br><b>완료 보상 ⭐50P</b></p><div class="row"><button class="btn primary" id="tutYes">🎓 튜토리얼 시작</button><button class="btn" id="tutNo">건너뛰기</button></div><small>나중에 \'게임 방법\'이나 \'게임 시작\'에서 언제든 다시 할 수 있어요.</small></div></div>\n<div class="screen" id="sGoals">')
R('<div class="mode" data-mode="practice"><i>🥅</i><b>연습 모드</b><span>골키퍼와 단둘이</span></div>','<div class="mode" data-mode="tutorial"><i>🎓</i><b>튜토리얼</b><span>1분 만에 조작 배우기</span></div>\n      <div class="mode" data-mode="practice"><i>🥅</i><b>연습 모드</b><span>골키퍼와 단둘이</span></div>')
i=s.index('id="sHow"');j=s.index('<button class="btn small" data-go="sMenu">뒤로</button>',i)
s=s[:j]+'<div class="row"><button class="btn primary" data-mode="tutorial">🎓 튜토리얼 시작</button><button class="btn small" data-go="sMenu">뒤로</button></div>'+s[j+len('<button class="btn small" data-go="sMenu">뒤로</button>'):]
R("function launch(mode){\n  SFX.init();SFX.ui();","function launch(mode){\n  if(mode==='tutorial'){tutStart();return;}\n  SFX.init();SFX.ui();")
R("G.chain=0;G.chainT=0;G.otLeft=0;hypeReset();","G.chain=0;G.chainT=0;G.otLeft=0;hypeReset();tutInit();")
R("  safe(hypeFrame,dt);\n","  safe(hypeFrame,dt);safe(tutFrame,dt);\n")
R("if(on&&h.recv&&h.recv.p===p&&G.t-h.recv.t<2.5)cbAdd('passShot','PASS → SHOT');}","if(on&&h.recv&&h.recv.p===p&&G.t-h.recv.t<2.5)cbAdd('passShot','PASS → SHOT');}\n  if(p.human)tutEvent('shot',charge,kind);")
R("  if(ps.from.team!==G.mine)return;\n  if(G.hype){const h=G.hype,key=","  if(ps.from.team!==G.mine)return;\n  tutEvent('pass');\n  if(G.hype){const h=G.hype,key=")
R("burst(p.x,p.z,8,1);SFX.whoosh();return true;\n}\nfunction useSpecial(p){","burst(p.x,p.z,8,1);SFX.whoosh();if(p.human)tutEvent('dash');return true;\n}\nfunction useSpecial(p){")
R("  return true;\n}\nfunction humanAim","  if(p.human)tutEvent('special');\n  return true;\n}\nfunction humanAim")
R("enterDemo();setTOD(.1,10);updateEnv(true);","enterDemo();setTOD(.1,10);updateEnv(true);tutMaybeAsk();")
# practice/tutorial must not feed daily/long goal progress (no reward farming against a lone goalie)
R("function gp(key,amt,t){\n","function gp(key,amt,t){\n  if(G.view==='game'&&G.cfg&&G.cfg.mode==='practice')return;\n")
R("TYPES,hypeNew,","TYPES,TUT,TUT_STEPS,tutStart,tutEvent,tutFrame,tutMaybeAsk,hypeNew,")


# ---------- league: transfer market, club value / rank, manager ranking, profile ----------
R("const save={v:6,","const save={v:7,")
R(",tut:{done:false,asked:false}};",",tut:{done:false,asked:false},profile:{name:'펭귄 감독',club:'펭귄 FC',emb:'🐧',since:0,seed:0},mgr:{r:1000,games:0,w:0,d:0,l:0,best:1000,form:[],hist:[],pending:null},mk:{salt:0,bought:[],log:[]}};")
R("  if(s.v!==6)persist();",rd('migrate7.js').rstrip('\n'))
R("</style>",rd('league.css')+"</style>")
R('<div class="screen" id="sGoals">',rd('league.html')+'<div class="screen" id="sGoals">')
R("'sChal','sScout','sSquad','sGoals'];","'sChal','sScout','sSquad','sGoals','sMarket','sProfile'];")
R('<button class="btn" data-go="sMode">게임 시작 (모드 선택)</button>','<button class="btn" data-go="sMode">게임 시작 (모드 선택)</button>\n    <button class="btn mkbtn" data-go="sMarket">💱 이적시장<span id="mkBadge"></span></button>')
R('data-go="sGoals">🎯 목표<span id="goalBadge"></span></button>','data-go="sGoals">🎯 목표<span id="goalBadge"></span></button>\n      <button class="btn" data-go="sProfile">👤 마이 프로필</button>')
R('<div id="menuGoals"></div>','<div id="menuRank" data-go="sProfile"></div><div id="menuGoals"></div>')
R("  if(id==='sMenu')hypeMenuRefresh();","  if(id==='sMenu'){hypeMenuRefresh();leagueMenuRefresh();}\n  if(id==='sMarket')renderMarket();\n  if(id==='sProfile')renderProfile();")
R("  hypeMenuRefresh();\n","  hypeMenuRefresh();leagueMenuRefresh();\n")
R("hypeReset();tutInit();","hypeReset();tutInit();mgrReset();")
R("safe(tutFrame,dt);","safe(tutFrame,dt);safe(mgrFrame,dt);")
R("function endMatch(){\n  G.state='over';","function endMatch(){\n  save.mgr.pending=null;G.mgrArmed=true;\n  G.state='over';")
# typing in profile name boxes must not be swallowed by the game's movement keys
R("addEventListener('keydown',e=>{\n  if(e.repeat)","addEventListener('keydown',e=>{\n  if(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;\n  if(e.repeat)")
R("addEventListener('keyup',e=>{\n","addEventListener('keyup',e=>{\n  if(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;\n")
R("TYPES,TUT,","TYPES,mkGen,mkBuy,mkSell,mkRefresh,mkSellPrice,mkKey,MK_BUY,MK_SELL,MK_TMUL,MK_SLOT,clubValue,clubTable,penguinValue,mgrTable,mgrApply,mgrMatchEnd,mgrReset,mgrFrame,oppRating,tierOf,TIERS,isRated,renderMarket,renderProfile,leagueMenuRefresh,escH,cleanName,TUT,")


# ---------- tier games: ranked / city trials / national trials ----------
R("const save={v:7,","const save={v:8,")
R("profile:{name:'펭귄 감독',club:'펭귄 FC',emb:'🐧',since:0,seed:0}","profile:{name:'펭귄 감독',club:'펭귄 FC',emb:'🐧',city:'서울',since:0,seed:0}")
R("mk:{salt:0,bought:[],log:[]}};","mk:{salt:0,bought:[],log:[]},trial:{day:0,ts:0,used:{city:0,nat:0},run:null,titles:{city:0,nat:0},first:{city:false,nat:false},cityName:''}};")
R("  if(s.v!==7)persist();",rd('migrate8.js').rstrip('\n'))
R("</style>",rd('ranked.css')+"</style>")
R('<div class="screen" id="sGoals">',rd('ranked.html')+'<div class="screen" id="sGoals">')
R("'sMarket','sProfile'];","'sMarket','sProfile','sRanked'];")
R('<button class="btn primary" data-mode="quick">⚡ 빠른 경기</button>','<button class="btn primary" data-mode="quick">⚡ 빠른 경기 <small>일반</small></button>\n    <button class="btn rkbtn" data-go="sRanked">🏅 티어 게임 <small>레이팅 · 대표 선발전</small></button>')
i=s.index('id="sMode"');j=s.index('<div class="modes">',i)
s=s[:j]+'<div class="mode-h">일반 게임 · 레이팅 변동 없음</div>\n    '+s[j:]
k=s.index('<button class="btn small" data-go="sMenu">뒤로</button>',j)
s=s[:k]+'<div class="mode-h">티어 게임 · 레이팅 반영</div>\n    <div class="modes"><div class="mode rk" data-go="sRanked"><i>🏅</i><b>티어 게임</b><span>랭크 경기 · 시대회 · 전국대회 대표 선발전</span></div></div>\n    '+s[k:]
R("  if(id==='sProfile')renderProfile();","  if(id==='sProfile')renderProfile();\n  if(id==='sRanked')renderRanked();")
R("TYPES,mkGen,","TYPES,rankedStart,rankedDiff,trialStart,trialPlay,trialAfterMatch,trialLock,trialLeft,trialDayRefresh,TRIALS,titleText,renderRanked,goRanked,mgrRivals,mkGen,")


# ---------- world championship + 개발자 tier + exclusive 큰바다쇠오리 ----------
R("special:'dash'}\n};\nconst SPECIALS=","special:'dash'},\n  auk:{name:'큰바다쇠오리',cost:0,exclusive:true,stats:{speed:5,accel:5,power:5,turn:4,body:4},scale:1.1,patch:'auk',pc:[1,1,1],beak:[0x111216,0x111216],special:'surge'}\n};\nconst SPECIALS=")
R("const SPECIALS={dash:'아이스 대시',","const SPECIALS={surge:'큰바다 돌진',dash:'아이스 대시',")
R("const SPEC={dash:{cd:8},","const SPEC={surge:{cd:9},dash:{cd:8},")
R("if(sp==='dash'){\n","if(sp==='surge'){   // 큰바다 돌진: long charging dash + slows nearby opponents\n    p.dashT=1.15;p.dashMul=1.95;p.dashSpec=true;p.vx+=dx*7;p.vz+=dz*7;p.specMax=SPEC.surge.cd;p.cd.special=p.specMax;\n    burst(p.x,p.z,28,1.7);SFX.whoosh();popAt('큰바다 돌진!',p.x,2.4,p.z);G.cam.shake=Math.max(G.cam.shake,.35);\n    for(const o of p.team.opp.skaters){if(Math.hypot(o.x-p.x,o.z-p.z)<4.5)o.slow=Math.max(o.slow,1.2);}\n  }else if(sp==='dash'){\n")
R("  }else if(ty.patch==='gentoo'){","  }else if(ty.patch==='auk'){   // great auk: large white oval between eye and bill\n    for(const sx of[1]){const e=1-Math.hypot((a-.5)/.2,(y-1.43)/.085),f=smooth(0,.35,e);r=lerp(r,.97,f);g=lerp(g,.97,f);b=lerp(b,.99,f);}\n  }else if(ty.patch==='gentoo'){")
R("  // beak\n  {const ug=","  // beak\n  if(ty.patch==='auk')aukBeak(inner);else{const ug=")
R("function pengSVG(k){\n","function pengSVG(k){\n  if(k==='auk')return aukSVG();\n")
R("o=o||{};const lv=o.lv!==undefined?o.lv:(save.lv[k]|0),g=o.g!==undefined?o.g:tierOfLv(lv),t=TYPES[k],pref=PREF[k];","o=o||{};const lv=o.lv!==undefined?o.lv:(save.lv[k]|0),g=TYPES[k].exclusive?4:(o.g!==undefined?o.g:tierOfLv(lv)),t=TYPES[k],pref=PREF[k];")
R("(own?(save.type===k?'선택됨':'선택'):'🔒 '+t.cost+'P')","(own?(save.type===k?'선택됨':'선택'):(t.exclusive?'🔒 개발자 티어 보상':'🔒 '+t.cost+'P'))")
R("closest('[data-type]');if(ty){const k=ty.dataset.type;","closest('[data-type]');if(ty){const k=ty.dataset.type;if(TYPES[k].exclusive&&!save.types.includes(k)){flashMsg('🔒 개발자 티어(레이팅 2100)를 달성하면 얻을 수 있어요');return;}")
R("<div style=\"font-size:12px;margin-top:4px\">미해금</div></div>';","<div style=\"font-size:12px;margin-top:4px\">'+(TYPES[k].exclusive?'💻 개발자 티어 보상':'미해금')+'</div></div>';")
R("const save={v:8,","const save={v:9,")
R("xp:{basic:0,fast:0,strong:0,defense:0,balanced:0}","xp:{basic:0,fast:0,strong:0,defense:0,balanced:0,auk:0}")
R("trial:{day:0,ts:0,used:{city:0,nat:0},run:null,titles:{city:0,nat:0},first:{city:false,nat:false},cityName:''}};","trial:{day:0,ts:0,used:{city:0,nat:0,world:0},run:null,titles:{city:0,nat:0,world:0},first:{city:false,nat:false,world:false},cityName:''},dev:{got:false,ts:0}};")
R("  if(s.v!==8)persist();",rd('migrate9.js').rstrip('\n'))
R("</style>",rd('dev.css')+"</style>")
R('<div id="vsFx">',rd('dev.html')+'<div id="vsFx">')
R("TYPES,rankedStart,","TYPES,devCheck,devReveal,aukSVG,TIER_IC,NATIONS,useSpecial,rankedStart,")

R("  // feet\n  const ft=[];","  // feet\n  const ft=[],fm=ty.patch==='auk'?MAT.dark:MAT.orange;")
R("    g.add(ell(MAT.orange,.15,.045,.26,0,0,.08,12));\n    for(let i=-1;i<=1;i++)g.add(ell(MAT.orange,","    g.add(ell(fm,.15,.045,.26,0,0,.08,12));\n    for(let i=-1;i<=1;i++)g.add(ell(fm,")


# ---------- remove the 팀 선택 screen from home; its options live in 팀 편성 ----------
R('      <button class="btn" data-go="sSelect">팀 선택</button>\n','')
R('    <div class="bench" id="sqBench"></div>\n','    <div class="bench" id="sqBench"></div>\n    <div class="sq-style" id="sqStyle"></div>\n')
R("    else{sqSel={kind:'bench',k};SFX.ui();renderSquad();}\n  };});\n}\n","    else{sqSel={kind:'bench',k};SFX.ui();renderSquad();}\n  };});\n  renderSqStyle();\n}\n")
anc="$('#sqClear').onclick=()=>{if(sqSel&&sqSel.kind==='slot'&&sqSel.i>0){sqSetSlot(sqSel.i,null);sqSel=null;persist();SFX.ui();renderSquad();}else flashMsg('비울 팀원 슬롯을 먼저 선택하세요');};"
R(anc,anc+"\n"+rd('sqstyle.js'))
R("</style>",""".sq-style{margin-top:10px;padding:8px 10px;border-radius:14px;background:rgba(0,0,0,.18);display:flex;flex-direction:column;gap:6px;text-align:left}
.sq-st-row{display:flex;gap:10px;align-items:center;font-size:14px}
.sq-st-l{width:62px;flex:none;font-size:13px;color:#ffe9a0}
.sq-chips{display:flex;flex-wrap:wrap;gap:6px}
.sq-chip{font:inherit;font-size:13px;color:#fff;background:rgba(255,255,255,.1);border:1.5px solid rgba(205,238,255,.4);border-radius:10px;padding:3px 10px;cursor:pointer;display:flex;flex-direction:column;align-items:center;line-height:1.25}
.sq-chip small{font-size:10.5px;opacity:.85}
.sq-chip.on{border-color:var(--gold);background:rgba(255,210,74,.22)}
.sq-chip.lock{opacity:.75}
</style>""")
R("TYPES,devCheck,","TYPES,renderSqStyle,sqBuy,devCheck,")

open(OUT,'w',encoding='utf-8').write(s)
scripts=re.findall(r'<script>(.*?)</script>',s,re.S)
open('main.js','w',encoding='utf-8').write(scripts[-1]);open('loader.js','w',encoding='utf-8').write(scripts[-2])
print('built',len(s),'bytes')
