# v18: ten more real penguin species (임금 · 마카로니 · 로열 · 피오르드랜드 · 노란눈 · 쇠푸른 · 아프리카 · 훔볼트 · 마젤란 · 갈라파고스)
#  - game code: v18_species.js (inserted before INIT, after v17), styles: v18_species.css
#  - every anchor must match exactly once (R() aborts the build otherwise); runs before v16 (raw Korean, no __L yet)

# ---- module + styles ----
R("/* ================= INIT ================= */", rd('v18_species.js') + "\n/* ================= INIT ================= */")
_st_end18 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end18] + rd('v18_species.css') + "\n" + s[_st_end18:]

# ---- species table (key order = order in every list; the exclusive great auk stays last) ----
R("""  balanced:{name:'바위뛰기 펭귄',cost:60,stats:{speed:4,accel:3,power:3,turn:3,body:3},scale:1.0,patch:'rock',pc:[1,.86,.1],beak:[0xd8432a,0xc0391f],bl:.78,bw:1.28,foot:0xf0a0a8,special:'dash'},
""", """  balanced:{name:'바위뛰기 펭귄',cost:60,stats:{speed:4,accel:3,power:3,turn:3,body:3},scale:1.0,patch:'rock',pc:[1,.86,.1],beak:[0xd8432a,0xc0391f],bl:.78,bw:1.28,foot:0xf0a0a8,special:'dash'},
  king:{name:'임금 펭귄',cost:100,stats:{speed:4,accel:2,power:4,turn:2,body:4},scale:1.1,patch:'king',pc:[1,.52,.06],beak:[0x16171c,0xff7a45],bl:1.3,bw:.74,foot:0x2b3038,special:'trumpet'},
  macaroni:{name:'마카로니 펭귄',cost:70,stats:{speed:3,accel:4,power:4,turn:2,body:4},scale:1.0,patch:'macaroni',pc:[1,.62,.08],beak:[0xc8562c,0xb54a26],bl:.92,bw:1.38,foot:0xf0a0a8,special:'crest'},
  royal:{name:'로열 펭귄',cost:90,stats:{speed:3,accel:3,power:3,turn:4,body:3},scale:1.04,patch:'royal',pc:[1,.7,.12],beak:[0xd9784a,0xc8653c],bl:.98,bw:1.44,foot:0xf2a7ae,special:'royalpass'},
  fiordland:{name:'피오르드랜드 펭귄',cost:70,stats:{speed:3,accel:3,power:2,turn:4,body:4},scale:.98,patch:'fiord',pc:[1,.88,.25],beak:[0xd2552a,0xc24a24],bl:.86,bw:1.28,foot:0xeea2a6,special:'shadow'},
  yelloweye:{name:'노란눈 펭귄',cost:90,stats:{speed:3,accel:3,power:4,turn:3,body:3},scale:1.02,patch:'yeye',pc:[1,.86,.28],dk:[.08,.1,.14],beak:[0xb5644e,0xdc9e8c],bl:.95,bw:1,foot:0xf3a5a0,special:'keeneye'},
  little:{name:'쇠푸른 펭귄',cost:50,stats:{speed:5,accel:4,power:2,turn:5,body:1},scale:.8,patch:'little',pc:[.4,.52,.68],dk:[.12,.22,.4],beak:[0x2a2c32,0x34363c],bl:.82,bw:.86,foot:0xf2c9cc,special:'hop'},
  african:{name:'아프리카 펭귄',cost:60,stats:{speed:3,accel:3,power:3,turn:3,body:4},scale:.97,patch:'african',pc:[1,1,1],beak:[0x16171b,0x16171b],bl:.95,bw:1.12,foot:0x3a3036,special:'bray'},
  humboldt:{name:'훔볼트 펭귄',cost:70,stats:{speed:4,accel:4,power:3,turn:2,body:3},scale:.96,patch:'humboldt',pc:[1,1,1],beak:[0x16171b,0x16171b],bl:1,bw:1.16,foot:0x3c3234,special:'current'},
  magellanic:{name:'마젤란 펭귄',cost:70,stats:{speed:4,accel:3,power:2,turn:3,body:4},scale:.97,patch:'magellan',pc:[1,1,1],beak:[0x16171b,0x16171b],bl:.96,bw:1.1,foot:0x40363a,special:'double'},
  galapagos:{name:'갈라파고스 펭귄',cost:80,stats:{speed:4,accel:4,power:3,turn:4,body:2},scale:.84,patch:'galapagos',pc:[1,1,1],beak:[0x16171b,0x16171b],bl:.86,bw:1,foot:0x3a3438,special:'sunflare'},
""")
# gacha weights per roll outside the pickup share (sum 100; the odds box is built from this table)
R("const TYPE_W={basic:30,balanced:20,fast:20,defense:15,strong:15};",
  "const TYPE_W={basic:12,balanced:8,fast:8,defense:7,strong:6,king:4,macaroni:7,royal:3,fiordland:6,yelloweye:3,little:8,african:8,humboldt:7,magellanic:7,galapagos:6};")
# weekly pickup rotation: index 42 % 15 = 12 keeps this week's banner (황제, week 42 since 2026-01-05) unchanged
R("rotOrder:['balanced','fast','strong','defense','basic']",
  "rotOrder:['royal','little','yelloweye','african','fiordland','humboldt','galapagos','magellanic','balanced','fast','defense','basic','strong','king','macaroni']")
R("xp:{basic:0,fast:0,strong:0,defense:0,balanced:0,auk:0}", "xp:Object.fromEntries(Object.keys(TYPES).map(k=>[k,0]))")
R("const MK_TMUL={basic:.8,balanced:1,fast:1.1,defense:1.15,strong:1.15,auk:1.5};",
  "const MK_TMUL={basic:.8,balanced:1,fast:1.1,defense:1.15,strong:1.15,auk:1.5,king:1.15,macaroni:1,royal:1.1,fiordland:1.05,yelloweye:1.2,little:.9,african:1,humboldt:1,magellanic:1,galapagos:1.05};")
R("const PK_SHAPE={basic:1.03,fast:.96,strong:.97,defense:1,balanced:1.02,auk:1};",
  "const PK_SHAPE={basic:1.03,fast:.96,strong:.97,defense:1,balanced:1.02,auk:1,king:.95,macaroni:1.03,royal:1.02,fiordland:1,yelloweye:1,little:1.05,african:1.02,humboldt:1.03,magellanic:1,galapagos:1};")
R("{basic:7,fast:11,strong:88,defense:4,balanced:19,auk:99}",
  "{basic:7,fast:11,strong:88,defense:4,balanced:19,auk:99,king:8,macaroni:22,royal:10,fiordland:17,yelloweye:21,little:3,african:27,humboldt:14,magellanic:16,galapagos:5}", 2)
# achievements: the old collector = the original five; a new one for the whole roster
R("  {id:'a_allpeng',ico:'🐧',name:'펭귄 수집가',desc:'모든 펭귄 5종 해금 (큰바다쇠오리 제외)',n:5,pts:100,prog:()=>save.types.filter(k=>!TYPES[k].exclusive).length},",
  "  {id:'a_allpeng',ico:'🐧',name:'펭귄 수집가',desc:'오리지널 펭귄 5종 해금 (아델리·젠투·황제·턱끈·바위뛰기)',n:5,pts:100,prog:()=>['basic','fast','strong','defense','balanced'].filter(k=>save.types.includes(k)).length},\n"
  "  {id:'a_allpeng2',ico:'📖',name:'펭귄 박사',desc:fmtL('펭귄 {n}종 모두 해금 (큰바다쇠오리 제외)',{n:Object.keys(TYPES).filter(k=>!TYPES[k].exclusive).length}),n:Object.keys(TYPES).filter(k=>!TYPES[k].exclusive).length,pts:300,prog:()=>save.types.filter(k=>!TYPES[k].exclusive).length},")
# long-term goal: "collect all 5" no longer means all; it is now "collect 5 species" (the exclusive auk doesn't count)
R("  {id:'L1',name:'펭귄 5종 모두 수집',n:5,pts:100,prog:()=>save.types.length},", "  {id:'L1',name:'펭귄 5종 수집',n:5,pts:100,prog:()=>save.types.filter(k=>!TYPES[k].exclusive).length},")
# the hard tournament team "Frost Kings" now really has king penguins (same total stats as before: 16+17+16 vs 16+17+17)
R("  {name:'Frost Kings',diff:'hard',types:['strong','fast','defense'],tod:0.28}", "  {name:'Frost Kings',diff:'hard',types:['king','macaroni','strong'],tod:0.28}")
# save: one-time news for players who already had a save (fresh saves start with it seen)
R("hist:[]}};", "hist:[]},news18:true};")
R("if(s.season&&typeof s.season==='object')seasonLoad(s.season);", "if(s.season&&typeof s.season==='object')seasonLoad(s.season);\n  save.news18=s.news18===true;")
R("  seasonPopSoon();\n", "  seasonPopSoon();news18Soon();\n")

# ---- special skills: entry points ----
R("function useSpecial(p){\n  if(p.cd.special>0||p.fall>0||p.goalie)return false;",
  "function useSpecial(p){\n  if(p.dbl>0&&p.dblT>0&&p.fall<=0&&!p.goalie)return dbl18(p);   // Magellanic: second dash\n  if(p.cd.special>0||p.fall>0||p.goalie)return false;")
R("(dd||1)*6;pk.vz+=(pk.z-p.z)/(dd||1)*6;}\n  }\n  {const c=ttOf(p).cd;",
  "(dd||1)*6;pk.vz+=(pk.z-p.z)/(dd||1)*6;}\n  }else if(!spec18(p,sp,dx,dz))return false;\n  {const c=ttOf(p).cd;")
R("function doDash(p){\n  if(p.cd.dash>0||", "function doDash(p){\n  if(p.dbl>0&&p.dblT>0&&p.fall<=0&&!p.goalie&&!(p.slideT>0))return dbl18(p);\n  if(p.cd.dash>0||")
SFX18 = """    bray(){tone(640,.2,'sawtooth',.1,900);tone(560,.34,'sawtooth',.11,300,.22);noise(.25,900,.8,.08,'bandpass',.22);},
    fanfare(){[392,523,659].forEach((f,i)=>tone(f,.2,'square',.07,f*1.01,i*.1));tone(784,.42,'sawtooth',.07,790,.3);},
    flare(){tone(1700,.5,'sine',.07,2500);tone(2300,.4,'triangle',.05,3300,.08);noise(.45,6000,2,.05);},
    hop(){tone(300,.18,'sine',.13,760);},
"""
R("    ui(){tone(720,.07,'sine',.15,900);},", SFX18 + "    ui(){tone(720,.07,'sine',.15,900);},")
# timers (fixed step) + royal-pass bookkeeping
R("if(p.boostT>0)p.boostT-=dt;if(p.fireT>0)p.fireT-=dt;if(p.magT>0)p.magT-=dt;",
  "if(p.boostT>0)p.boostT-=dt;if(p.fireT>0)p.fireT-=dt;if(p.magT>0)p.magT-=dt;tick18(p,dt);")
R("puckStep(h);v10Sim(h);evSim(h);", "puckStep(h);v10Sim(h);evSim(h);sim18(h);")
R("function resetPositions(){", "function resetPositions(){G.royal=null;")
R("p.diveT=0;p.getup=0;p.anim.tilt=0;", "p.diveT=0;p.getup=0;p.hopT=0;p.ramT=0;p.dbl=0;p.otWin=0;p.anim.tilt=0;")
# shootout turns and match resets start without leftover skill effects
R("p.charging=false;p.charge=0;p.boostT=p.fireT=p.magT=0;}", "p.charging=false;p.charge=0;p.boostT=p.fireT=p.magT=0;p.rushT=p.shadowT=p.eyeT=p.hopT=p.ramT=p.dbl=p.otWin=0;}")
R("g.ai.zs=0;g.ai.seenT=0;g.diveT=0;", "g.ai.zs=0;g.ai.seenT=0;g.diveT=0;g.dazT=0;")
R("for(const p of G.pengs){p.frozen=false;p.boostT=p.fireT=p.magT=0;}", "for(const p of G.pengs){p.frozen=false;p.boostT=p.fireT=p.magT=0;p.rushT=p.shadowT=p.eyeT=p.hopT=p.ramT=p.dbl=p.dazT=p.otWin=0;}G.royal=null;")
# shadow step / fairy hop: no knock-downs, no strips, no body contact while airborne
R("function knock(p,dur){\n  if(p.goalie||p.fall>0||p.getup>0)return false;", "function knock(p,dur){\n  if(p.goalie||p.fall>0||p.getup>0||p.shadowT>0||p.hopT>0)return false;")
R("p.slideT=0;p.dashT=0;p.dashSpec=false;p.ai.plan=null;", "p.slideT=0;p.dashT=0;p.dashSpec=false;p.ai.plan=null;p.ramT=0;p.dbl=0;")
R("const A=a[i],B=a[j];if(A.goalie&&B.goalie||A.frozen||B.frozen)continue;", "const A=a[i],B=a[j];if(A.goalie&&B.goalie||A.frozen||B.frozen||A.hopT>0||B.hopT>0)continue;")
R("if(G.carry&&G.state==='play')for(const o of c.team.opp.skaters){", "if(G.carry&&G.state==='play'&&!(c.shadowT>0||c.hopT>0))for(const o of c.team.opp.skaters){")
# personality hooks: hit (body contact), steal, spd (top speed), tap (tap shot); skill speed boosts
R("let ia=imp*B.mass/tm*1.6,ib=imp*A.mass/tm*1.6;", "let ia=imp*B.mass/tm*1.6*(ttOf(B).hit||1),ib=imp*A.mass/tm*1.6*(ttOf(A).hit||1);")
R("*(c.dashT>0?.35:1);", "*(c.dashT>0?.35:1)*(ttOf(o).steal||1);")
R("if(p.boostT>0){cap*=1.3;acc*=1.25;}", "if(p.boostT>0){cap*=1.3;acc*=1.25;}{const k=(p.rushT>0?SPX.rush:1)*(p.shadowT>0?SPX.shadow.spd:1)*(ttOf(p).spd||1);cap*=k;acc*=k;}")   # top speed and acceleration scale together, so the steady top speed changes by exactly k
# shots: royal-pass one-timer window, tap personality, golden eye
R("const T_=ttOf(p),ot=!p.goalie&&G.t-(p.recvT==null?-9:p.recvT)<OT_WIN;p.recvT=-9;",
  "const T_=ttOf(p),ow=p.otWin||0,ot=!p.goalie&&G.t-(p.recvT==null?-9:p.recvT)<(ow||OT_WIN);p.recvT=-9;p.otWin=0;")
R("if(!tap)sp*=(T_.pow||1);if(ot)sp*=1.06*(T_.ot||1);", "if(!tap)sp*=(T_.pow||1);else sp*=(T_.tap||1);if(ot)sp*=1.06*(T_.ot||1)*(ow?SPX.royalpass.mul:1);")
R("const l=Math.hypot(ax,az)||1;ax/=l;az/=l;\n  // accuracy", "const l=Math.hypot(ax,az)||1;ax/=l;az/=l;\n  const ke=keen18(p,ax,az);if(ke){ax=ke[0];az=ke[1];sp*=SPX.keeneye.mul;}\n  // accuracy")
R("spread*=(T_.spread||1);if(ot)spread*=.55;", "spread*=(T_.spread||1);if(ot)spread*=.55;if(ke)spread=0;")
# royal pass: nobody else can touch / catch / read it while it flies
R("if(p.shotGrace>0||p.frozen||p===G.carry)continue;let rad=p.r;", "if(p.shotGrace>0||p.frozen||p===G.carry||(G.royal&&p.team!==G.royal.team))continue;let rad=p.r;")
R("for(const p of G.pengs){\n      if(!canCarry(p))continue;", "for(const p of G.pengs){\n      if(!canCarry(p)||(G.royal&&p.team!==G.royal.team))continue;")
R("if(p.goalie||p.shotGrace>0||p.frozen||p===G.carry)continue;", "if(p.goalie||p.shotGrace>0||p.frozen||p===G.carry||(G.royal&&p.team!==G.royal.team))continue;")   # the royal pass ghosts through, it doesn't bulldoze the opponent
R("function aiIntercept(p){", "function aiIntercept(p){\n  if(G.royal)return false;")
R("function passDone(ps){\n  ps.to.recvT=G.t;pcPass(ps);", "function passDone(ps){\n  ps.to.recvT=G.t;pcPass(ps);royal18(ps);")
R("function passLost(ps,why){\n  pcBreak(ps.from.team);", "function passLost(ps,why){\n  pcBreak(ps.from.team);if(G.royal&&G.royal.by===ps.from)G.royal=null;")
R("G.t-(p.recvT==null?-9:p.recvT)<.5&&", "G.t-(p.recvT==null?-9:p.recvT)<(p.otWin||.5)&&")   # AI one-timer after a royal pass
# sun flare: a dazzled goalie reacts late, misjudges more and can't read the wind-up
R("if(ai.seenT>=gk.react*CF.react){", "if(ai.seenT>=gk.react*CF.react*(p.dazT>0?SPX.sunflare.react:1)){")
R("gk.err*CF.gkErr*", "gk.err*CF.gkErr*(p.dazT>0?SPX.sunflare.err:1)*")
R("const rd=gkRead(p,tm);", "const rd=p.dazT>0?null:gkRead(p,tm);")
R("Math.min(1,dt/(gk.react+.12))", "Math.min(1,dt/(gk.react*(p.dazT>0?SPX.sunflare.react:1)+.12))")
# AI: when to use the new skills (the old skills keep their own rules)
R("if(p.cd.special<=0&&Math.random()<.3*ai.iv&&p.ty.special==='flipper'&&shotQ(pk.x,pk.z,tm)>df.shootQ*.8)useSpecial(p);",
  "if(p.cd.special<=0&&Math.random()<.3*ai.iv&&p.ty.special==='flipper'&&shotQ(pk.x,pk.z,tm)>df.shootQ*.8)useSpecial(p);\n    if(p.cd.special<=0&&SPX[p.ty.special]&&G.carry===p&&Math.random()<.35*ai.iv)ai18(p,'carry');")
R("      else if(dist>10)useSpecial(p);", "      else if(SPX[sp2])ai18(p,'chase');\n      else if(dist>10)useSpecial(p);")
R("ai.plan={t:rnd(.08,.22),c:gd>13?rnd(.75,1):gd>7?rnd(.45,.75):rnd(.2,.5),tz:aiPlanTz(p)};", "ai.plan={t:rnd(.08,.22),c:gd>13?rnd(.75,1):gd>7?rnd(.45,.75):rnd(.2,.5),tz:aiPlanTz(p)};ai18(p,'shoot');")
R("if(doPass(p,mate)){ai.cool=rnd(.9,1.6);return;}", "if(ai18(p,'pass')||doPass(p,mate)){ai.cool=rnd(.9,1.6);return;}")
R("  if(p!==tm.chaser&&aiIntercept(p))return;", "  if(p.cd.special<=0&&SPX[p.ty.special]&&Math.random()<.5*ai.iv)ai18(p,'any');\n  if(p!==tm.chaser&&aiIntercept(p))return;")

# ---- 3D: hop height, plumage, eyes, bills, crests, coloured flippers / tail ----
R("P.root.position.set(p.rx,hop,p.rz);", "P.root.position.set(p.rx,hop+hopY18(p),p.rz);", 2)
R("const darkThroat=pt==='adelie'||pt==='rock'||pt==='gentoo'||pt==='auk';", "const darkThroat=pt==='adelie'||pt==='rock'||pt==='gentoo'||pt==='auk'||!!PK18DT[pt];")
R("let r=.035,g=.04,b=.062;const back=", "let r=.035,g=.04,b=.062;if(ty.dk){r=ty.dk[0];g=ty.dk[1];b=ty.dk[2];}const back=")
R("  const wr=.95,wg=.955,wb=.97-.03*(1-smooth(.1,.6,y));\n  r=lerp(r,wr,wh);g=lerp(g,wg,wh);b=lerp(b,wb,wh);",
  "  wh=pkW18(pt,a,th,y,wh);\n  const wr=.95,wg=.955,wb=.97-.03*(1-smooth(.1,.6,y));\n  r=lerp(r,wr,wh);g=lerp(g,wg,wh);b=lerp(b,wb,wh);\n  if(PK18C[pt]){const q=[r,g,b];pkC18(ty,pt,a,th,y,q);r=q[0];g=q[1];b=q[2];}")
R("iris=pkRGB(pt==='rock'?0xd0182a:pt==='auk'?0x1a1410:0x2a1a12)", "iris=pkRGB(PK18EYE[pt]||(pt==='rock'?0xd0182a:pt==='auk'?0x1a1410:0x2a1a12))")
R("  else if(pt==='adelie'){Object.assign(S,{droop:.22,hook:.12,H:.062});}", "  else if(pt==='adelie'){Object.assign(S,{droop:.22,hook:.12,H:.062});}\n  else if(PK18BK[pt])PK18BK[pt](S);")
R("if(ty.patch==='rock'&&(!hatKey||hatKey==='none'))headAbs.add(new T.Mesh(pkCrestGeo(),PK_MAT.vc));",
  "if(ty.patch==='rock'&&(!hatKey||hatKey==='none'))headAbs.add(new T.Mesh(pkCrestGeo(),PK_MAT.vc));\n  crest18(ty,goalie?'helmet':hatKey,headAbs);")
R("function pkFlipperGeo(side,teamKey){const lo=pkLo(),ck='f'+side+teamKey+lo;", "function pkFlipperGeo(side,teamKey,dk){const lo=pkLo(),ck='f'+side+teamKey+lo+(dk?dk.join():'');")
R("let r=lerp(.035,.93,inner),gg=lerp(.04,.94,inner),b=lerp(.062,.96,inner);", "let r=lerp(dk?dk[0]:.035,.93,inner),gg=lerp(dk?dk[1]:.04,.94,inner),b=lerp(dk?dk[2]:.062,.96,inner);")
R("pkFlipperGeo(s,teamKey)", "pkFlipperGeo(s,teamKey,ty.dk)")
R("function pkTailGeo(tl){const ck='tl'+tl;", "function pkTailGeo(tl,dk){const ck='tl'+tl+(dk?dk.join():'');")
R("list.push([c,[.035,.04,.058]]);}", "list.push([c,dk||[.035,.04,.058]]);}")
R("pkTailGeo(ty.tail||1)", "pkTailGeo(ty.tail||1,ty.dk)")
R("const hm=new T.Mesh(pkHeadGeo(typeKey),PK_MAT.body);hm.castShadow=true;hm.receiveShadow=true;headAbs.add(hm);",
  "const hm=new T.Mesh(pkHeadGeo(typeKey),PK_MAT.body);hm.castShadow=true;hm.receiveShadow=true;headAbs.add(hm);\n  {const D=decals18(typeKey);if(D){if(D.b)torso.add(new T.Mesh(D.b,PK18_DMAT));if(D.h)headAbs.add(new T.Mesh(D.h,PK18_DMAT));}}   // v18: crisp bands / patches")

# ---- cards and UI ----
R("function pengSVG(k){   // card art per real species (own drawings)\n  if(k==='auk')return aukSVG();",
  "function pengSVG(k){   // card art per real species (own drawings)\n  if(k==='auk')return aukSVG();\n  if(SVG18[TYPES[k].patch])return pengSVG18(k);")
R("  h+='<div class=\"tt-line\">'+TT[k].name+'<br>▲ '+TT[k].plus+'<br>▼ '+TT[k].minus+'</div>';",
  "  h+=spLine18(k);\n  h+='<div class=\"tt-line\">'+TT[k].name+'<br>▲ '+TT[k].plus+'<br>▼ '+TT[k].minus+'</div>';\n  h+=fact18(k);")
R("(own?cardHtml(k,{cls:'live tilt',cw:Math.min(190,Math.floor(innerWidth*.4))}):'<div style=\"--cw:150px;opacity:.6\"><div class=\"pc-backface\">?</div></div>')",
  "(own?cardHtml(k,{cls:'live tilt',cw:Math.min(190,Math.floor(innerWidth*.4))}):sil18(k,150))")
R("(o?cardHtml(k):'<div class=\"pc-backface\">?</div>')", "(o?cardHtml(k):sil18(k))")
R("$('#specInfo').textContent='특수 기술: '+SPECIALS[TYPES[save.type].special];",
  "$('#specInfo').textContent='특수 기술: '+SPECIALS[TYPES[save.type].special]+' — '+spDesc(TYPES[save.type].special);")
R("' · 특수 기술 <b>'+SPECIALS[cap.special]+'</b>", "' · 특수 기술 <b>'+SPECIALS[cap.special]+'</b><span class=\"sp-d\">'+spDesc(cap.special)+'</span>")
R("pcChip(a);t=a.join('  ');", "chip18(p,a);pcChip(a);t=a.join('  ');")
# quick / free matches and the menu background use the whole roster
R("if(mode==='quick')startMatch({mode:'quick',size:s.size,time:s.time||180,diff:s.diff,tag:'QUICK MATCH'});",
  "if(mode==='quick')startMatch({mode:'quick',size:s.size,time:s.time||180,diff:s.diff,tag:'QUICK MATCH',oppTypes:oppMix18()});")
R("startMatch({mode:'free',size:s.size,time:0,diff:s.diff,tag:'FREE PLAY'});", "startMatch({mode:'free',size:s.size,time:0,diff:s.diff,tag:'FREE PLAY',oppTypes:oppMix18()});")
R("if(cfg.demo&&i===0)type=['fast','basic','balanced'][(Math.random()*3)|0];", "if(cfg.demo)type=demo18();")
R("if(cfg.demo&&!isMine&&key==='blue')type=['basic','balanced','defense','fast'][i%4];", "if(cfg.demo&&!isMine&&key==='blue')type=demo18();")
R("safe(v17Frame,dt);", "safe(v17Frame,dt);safe(v18Frame,dt);")

# ---- test exports (keeps v16's "window.__PH={doPull," anchor intact) ----
# card name: a long name (Japanese フィヨルドランド = 8 full-width letters) shrinks to fit the card instead of spilling past its edge
R("""<div class="pc-name">'+t.name.replace(' 펭귄','')+'</div>""", """'+nmTag18(t.name.replace(' 펭귄',''))+'""")
R("window.__PH={doPull,pullOnce,SEASON,", "window.__PH={doPull,pullOnce,SPX,NEW18,spec18,spDesc,PFACT,ai18,keen18,royal18,tick18,sim18,dbl18,ram18,hopY18,pengSVG18,pkCrest18,pkW18,pkC18,decals18,sil18,news18Popup,news18Html,news18Soon,oppMix18,demo18,chip18,spLine18,fact18,PREF,SPECIALS,SPEC,STATK,TYPE_W,SEASON,")
