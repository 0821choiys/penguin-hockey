# v38: 🏒 hockey-style control — your penguin changes only on a pass or the Switch button, buttons follow the play
# (poke / call for the pass), one-timers wait for the pass, camera keeps the puck in view, arrow to an off-screen penguin
# switching: the old functions stay as thin wrappers (tests and other modules call them by name)
RF('autoSwitch', "function autoSwitch(dt){hkAutoSwitch(dt);}")
RF('swapNearest', "function swapNearest(){hkSwap();}")
RF('netAutoSwitch', "function netAutoSwitch(dt){hkNetAutoSwitch(dt);}")
RF('netSwapNearest', "function netSwapNearest(p){hkNetSwap(p);}")
RF('ctlBuf', "function ctlBuf(p){hkBuf(p);}")
# a pass by the friend (online) hands control to the receiver too (it used to happen through auto switching)
RIN('doPass', "if(p.human)G.pending={to:mate,t:.28};", "if(p.human)G.pending={to:mate,t:HK.sw};else if(p.remote&&G.net==='host')NET.pend={to:mate,t:HK.sw};")
R("G.pass=null;G.passCount=0;G.pending=null;G.over=false;", "G.pass=null;G.passCount=0;G.pending=null;G.callFor=null;NET.pend=null;G.over=false;")
# human input: early switch after your own pass, poke, call for the pass, presses that wait for an incoming pass
RIN('humanControl', "  p.ix=inp.x;p.iz=inp.z;\n", "  p.ix=inp.x;p.iz=inp.z;\n  if(hkEarly(p,inp))return;   // v38: a press right after your own pass belongs to the receiver\n")
RIN('humanControl', "  ctlBuf(p);\n", "  ctlBuf(p);hkRecvAssist(p,inp);   // v38: glide onto an incoming pass while a one-timer waits\n")
RIN('humanAim', "else{const m=Math.hypot(p.ix||0,p.iz||0);if(m>.3){ax=p.ix/m;az=p.iz/m;}}", "else if(p.hkAim){ax=p.hkAim[0];az=p.hkAim[1];}else{const m=Math.hypot(p.ix||0,p.iz||0);if(m>.3){ax=p.ix/m;az=p.iz/m;}}")
RIN('humanControl', "  if(inp.shootPress){inp.shootPress=false;if(p.cd.shoot<=0){p.charging=true;p.charge=0;p.stage=0;}}",
  "  if(hkPokePress(p,inp)){}   // v38: an opponent has the puck → poke check\n  else if(inp.shootPress){inp.shootPress=false;if(p.cd.shoot<=0){p.charging=true;p.charge=0;p.stage=0;}}")
RIN('humanControl', "if(!canHit(p))p.bufShot={at:G.t,c:p.charge};", "if(!canHit(p))hkBufShot(p);")
# struck / passed on straight off an incoming pass = the pass is received first (one-timer bonus, pass counted)
RIN('humanControl', "else{const a=humanAim(p);performShot(p,a[0],a[1],p.charge);}", "else{if(hkIncoming(p))touchPuck(p,3);const a=humanAim(p);performShot(p,a[0],a[1],p.charge);}")
RIN('humanControl', "const a=humanAim(p),m=bestMate(p,a[0],a[1],false);if(!doPass(p,m))", "const a=humanAim(p),m=bestMate(p,a[0],a[1],false);if(m&&hkIncoming(p))touchPuck(p,3);if(!doPass(p,m))")
RIN('humanControl', "  if(inp.pass){inp.pass=false;if(p.cd.pass<=0&&!canHit(p))p.bufPass={at:G.t};",
  "  hkCallPress(p,inp);   // v38: an AI team-mate has the puck → ask for it\n  if(inp.pass){inp.pass=false;if(p.cd.pass<=0&&!canHit(p))p.bufPass={at:G.t,w:hkIncoming(p)};")
# AI: answer a call; pass to the human team-mate a little more often (manual switching only)
RIN('aiSkater', "ai.think-=dt;ai.cool-=dt;ai.dash-=dt;ai.slotT-=dt;", "ai.think-=dt;ai.cool-=dt;ai.dash-=dt;ai.slotT-=dt;hkCallPass(p);")
RIN('bestMate', "s=(m.x-pk.x)*tm.dir*.5-d*.12+Math.min(open,6)*.8+shotQ(m.x,m.z,tm)*10;",
  "s=(m.x-pk.x)*tm.dir*.5-d*.12+Math.min(open,6)*.8+shotQ(m.x,m.z,tm)*10+((m.human||m.remote)&&!hkAuto()?HK.mate:0);")
# camera: keep the puck in view when your penguin is far away
RIN('updateCamera', "else if(pl){fx=lerp(pk.x,pl.x,.4);fz=lerp(pk.z,pl.z,.4);}", "else if(pl){const w=hkCamW(pl);fx=lerp(pk.x,pl.x,w);fz=lerp(pk.z,pl.z,w);}")
# every frame: labels, switch ring, off-screen arrow
R("safe(updateHud);safe(ctlFrame);", "safe(updateHud);safe(ctlFrame);safe(hkFrame);")
# label font: remember the laid-out size before v37 shrinks a long label
RIN('ctlApply', "  ctlFitAll();   // v37: one-line labels\n", "  hkRemember();ctlFitAll();   // v37: one-line labels\n")
# settings: 펭귄 교체 = 버튼으로만 (default) / 자동 (additive field save.set.ctl.auto)
RIN('ctlLoad', "const d={sz:1,op:1,js:1,jm:'follow',sens:'mid',easy:true,swap:true,P:{},L:{}};",
  "const d={sz:1,op:1,js:1,jm:'follow',sens:'mid',easy:true,swap:true,auto:false,P:{},L:{}};")
RIN('ctlLoad', "  if(q.swap===false)d.swap=false;\n", "  if(q.swap===false)d.swap=false;\n  if(q.auto===true)d.auto=true;\n")
RIN('ctlEdHtml', "+'<div class=\"ce-opt\"><span>'+__L('교체 버튼')+'</span>'+seg('swap',c.swap,[[true,__L('표시')],[false,__L('숨김')]])+'</div>'",
  "+'<div class=\"ce-opt\"><span>'+__L('펭귄 교체')+'</span>'+seg('auto',c.auto,[[false,__L('버튼으로만')],[true,__L('자동')]])+'</div>'"
  "+'<div class=\"ce-opt\"><span>'+__L('교체 버튼')+'</span>'+seg('swap',c.swap,[[true,__L('표시')],[false,__L('숨김')]])+'</div>'")
RIN('ctlEdHtml', "+(c.swap?'':'<br>'+__L('교체 버튼을 숨겨도 퍽에 가까운 펭귄으로 자동 교체돼요'))+'</div>';",
  "+'<br>'+hkSwapNote(c)+'</div>';")
RIN('ctlEdAct', "  else if(act==='easy')c.easy=v==='true';\n", "  else if(act==='easy')c.easy=v==='true';\n  else if(act==='auto')c.auto=v==='true';\n")
# how-to text (must say what the code does)
R("퍽을 놓쳤다면 <b>교체</b> 버튼으로 가까운 펭귄을 조작하세요.", "<b>교체</b> 버튼은 퍽에 가장 가까운 동료(흰 링)로 바꿔요.")
R("우리 팀이 퍽을 잡으면 그 펭귄을 자동으로 조작해요.", "펭귄은 패스하거나 <b>교체</b> 버튼을 눌러야 바뀌어요.")
R("대시로 상대를 들이받으면 <b>BIG HIT!</b>",
  "대시로 상대를 들이받으면 <b>BIG HIT!</b><br>🛡️ <b>퍽이 없을 때</b>: 상대가 퍽을 가지면 슛 버튼이 <b>뺏기</b>가 되고, 동료가 가지면 패스 버튼이 <b>패스 요청</b>이 돼요. 패스가 오는 동안 슛을 톡 눌러 두면 받자마자 원타이머!")
# the module + its styles
R("/* ================= INIT ================= */", rd('v38_hockey.js') + "\n/* ================= INIT ================= */")
_st_end38 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end38] + rd('v38_hockey.css') + "\n" + s[_st_end38:]
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,HK,HKR,hkAuto,hkSwapTarget,hkSwap,hkAutoSwitch,hkNetAutoSwitch,hkEarly,hkIncoming,hkRecvAssist,hkBuf,hkOtCharge,hkCallPress,hkCallPass,hkPokePress,hkCtx,hkLabels,hkCamW,hkFrame,hkSwapNote,netSetRemote,")
