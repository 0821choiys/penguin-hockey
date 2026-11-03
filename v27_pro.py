# v27: 💎 Pro Pass — 8,900원 per pass season through Google Play (TWA Digital Goods API or the Android wrapper's bridge)
R("/* ================= INIT ================= */", rd('v27_pro.js') + "\n/* ================= INIT ================= */")
_st_end27 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end27] + rd('v27_pro.css') + "\n" + s[_st_end27:]
# save (additive): pass.pro / pass.cx, granted purchase tokens
R("pass:{s:0,xp:0,gold:false,cf:0,cg:0,fw:0,last:null},", "pass:{s:0,xp:0,gold:false,cf:0,cg:0,fw:0,last:null,pro:0,cx:0},pay:{tok:[],last:null},")
R("  if(s.pass&&typeof s.pass==='object')passLoad(s.pass);",
  "  if(s.pass&&typeof s.pass==='object')passLoad(s.pass);\n  if(s.pay&&typeof s.pay==='object'){if(Array.isArray(s.pay.tok))save.pay.tok=s.pay.tok.filter(x=>typeof x==='string'&&x.length<600).slice(-30);if(s.pay.last&&typeof s.pay.last==='object')save.pay.last={s:Math.max(0,Math.floor(+s.pay.last.s||0)),t:Math.max(0,+s.pay.last.t||0)};}")
# the Pro track's trail (never for sale, shown once owned)
R("ps24:{name:'숭어',cost:0,col:[0.7,0.78,0.86],pass:1}};", "ps24:{name:'숭어',cost:0,col:[0.7,0.78,0.86],pass:1},pro:{name:'프로 오로라',cost:0,col:[0.72,0.55,1],pass:1}};")
# daily goal: the fish shown = the fish added (Pro bonus included)
R("hypeToast('+'+d.pts+'P · +'+d.xp+'XP · 🐟+'+PASS.earn.daily+(r.to>r.from?' · LEVEL UP!':''));", "hypeToast('+'+d.pts+'P · +'+d.xp+'XP · 🐟+'+passGain(PASS.earn.daily)+(r.to>r.from?' · LEVEL UP!':''));")
R("{p:g.p,n:d.n,a:d.pts,x:d.xp,s:PASS.earn.daily}", "{p:g.p,n:d.n,a:d.pts,x:d.xp,s:passGain(PASS.earn.daily)}")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,PRO,BILL,billInit,proBuy,proGrant,proRestore,proBtnHtml,proNoteHtml,proPriceTxt,proFmt,passProOn,passGoldOn,passGain,passReward,input,")
