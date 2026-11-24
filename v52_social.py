# v52: 👫 friends (code, list, requests, gifts, invites, ranking) + 🤝 2:2 co-op online (owner, 2026-11-25) — v52_social.js / .css
R("/* ================= INIT ================= */", rdm('v52_social.js') + "\n/* ================= INIT ================= */")
_st_end52 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end52] + rd('v52_social.css') + "\n" + s[_st_end52:]
# ---- v31 rooms carry the mode (vs / coop) and the AI difficulty; co-op starts its own match ----
RIN('netReset', "pkSp:0,applied:0});", "pkSp:0,applied:0,mode:'vs',diff:'normal',opp:null});")
RIN('netHost', "function netHost(){", "function netHost(m,d){")
RIN('netHost', "netReset();NET.role='host';", "netReset();NET.role='host';NET.mode=m==='coop'?'coop':'vs';NET.diff=['easy','normal','hard'].includes(d)?d:'normal';")
RIN('netHost', "v:NET_V,hi:netInfo()", "v:NET_V,m:NET.mode,d:NET.diff,hi:netInfo()")
RIN('netJoin', "NET.peer=r.hi||null;", "NET.peer=r.hi||null;NET.mode=r.m==='coop'?'coop':'vs';NET.diff=['easy','normal','hard'].includes(r.d)?r.d:'normal';")
RIN('netInfo', ",kit:kitNet()};", ",kit:kitNet(),h:save.hat};")
RIN('netReady', "if(NET.role==='host'){netSendRel({k:'start',ty:netInfo().ty,n:netInfo().n});netBegin(NET.peer.ty);}",
    "if(NET.role==='host'){if(NET.mode==='coop')NET.opp=socOpp();netSendRel({k:'start',ty:netInfo().ty,n:netInfo().n,m:NET.mode,d:NET.diff,o:NET.opp,h:save.hat});netBegin(NET.peer.ty,NET.peer.h);}")
RIN('netOnMsg', "if(m.n&&NET.peer)NET.peer.n=m.n;netBegin(m.ty);",
    "if(m.n&&NET.peer)NET.peer.n=m.n;if(m.m)NET.mode=m.m==='coop'?'coop':'vs';if(m.d)NET.diff=['easy','normal','hard'].includes(m.d)?m.d:'normal';if(Array.isArray(m.o))NET.opp=m.o.slice(0,2);netBegin(m.ty,m.h);")
RIN('netBegin', "function netBegin(peerTy){",
    "function netBegin(peerTy,peerHat){\n  if(NET.mode==='coop'){NET.st='play';NET.snaps=[];NET.off=null;NET.applied=0;NET.rseen=[0,0,0,0,0,0];NET.cnt=[0,0,0,0,0,0];NET.rin={x:0,z:0,ax:0,az:0,sh:0,c:[0,0,0,0,0,0]};NET.vin={};"
    "NET.lastRx=performance.now();NET.lastTx=0;startMatch(socCoopCfg(peerTy,peerHat));const q=G.teams.blue.skaters[1];if(q){if(NET.role==='host')netSetRemote(q);else setHuman(q);}return;}")
RIN('netAutoSwitch', "function netAutoSwitch(dt){", "function netAutoSwitch(dt){if(G.coop)return;")
# both players' penguins on the same side (each phone builds the same blue pair)
RIN('setupMatch', "if(isMine){type=i===0?save.type:", "if(isMine&&cfg.myTypes&&cfg.myTypes[i]){type=cfg.myTypes[i];hat=(cfg.myHats&&cfg.myHats[i])||'none';}else if(isMine){type=i===0?save.type:")
# ---- the account: deleting it removes the friend data too; signing in starts the friend part ----
RIN('accDelete', "await dbReq('DELETE','saves/'+FB.uid);", "await socWipe().catch(()=>{});await dbReq('DELETE','saves/'+FB.uid);")
RIN('accWithIdToken', "function accWithIdToken(idt,src){", "function accWithIdToken(idt,src){setTimeout(()=>{if(socOn()&&!SOC.code)socStart();},1500);")
R("tutMaybeAsk();safe(accInit);", "tutMaybeAsk();safe(accInit);safe(socInit);")
# ---- the screen: 친구 (tabs inside) and its entry in 경기 모드 ----
R('<div class="panel pfix fr-panel"><h2>친구 대전</h2>', '<div class="panel pfix fr-panel"><h2>친구</h2>')
R('<b>친구 대전</b><span>친구 코드로 1대1</span>', '<b>친구</b><span>친구 추가 · 대전 · 협동</span>')
# ---- save (additive) + sanitised load (literals only) ----
R("const save={v:10,", "const save={v:10,social:{fw:0,fl:0,cw:0,cl:0,cn:0,cday:'',claim:{},sent:{}},")
R("if(s.gkTip)save.gkTip=1;",
  "if(s.gkTip)save.gkTip=1;"
  "if(s.social&&typeof s.social==='object'){const q=s.social,o={fw:0,fl:0,cw:0,cl:0,cn:0,cday:'',claim:{},sent:{}};for(const k of['fw','fl','cw','cl','cn'])o[k]=Math.max(0,Math.min(1e7,q[k]|0));"
  "o.cday=typeof q.cday==='string'&&q.cday.length<12?q.cday:'';const ok=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{6,40}$/.test(x);"
  "for(const b of['claim','sent'])if(q[b]&&typeof q[b]==='object'){let n=0;for(const k in q[b])if(ok(k)&&n<200){o[b][k]=Math.max(0,+q[b][k]||0);n++;}}save.social=o;}")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,SOC,SOCD,socS,socOn,socStart,socStop,socAdd,socAccept,socDecline,socRemove,socGift,socGiftReady,socClaim,socClaimLeft,socGiftsWaiting,socInvite,socInvCheck,socResult,socWipe,socOpp,socCoopCfg,socStats,socPush,socListen,socUsers,socRkHtml,socFrHtml,socTabs,socPlayPick,NET,netReset,netBegin,hkSwap,todayKey,kitSync,TEAM,netInfo,netReady,netOnMsg,netAutoSwitch,netSetRemote,")
# the account window says what is stored — now also the friends data
R("__L('저장하는 것: 게임 진행(포인트·펭귄·기록)과 Google 계정의 이메일 주소. 광고나 다른 용도로 쓰지 않아요.')",
  "__L('저장하는 것: 게임 진행(포인트·펭귄·기록), Google 계정의 이메일 주소, 친구 기능을 쓰면 친구 코드·이름·랭킹 기록·친구 목록. 광고나 다른 용도로 쓰지 않아요.')")
