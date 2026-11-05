# v32: 💙 penguin growth stories — bond per species, 4 chapters (3/10/25/50 matches) with points, a nickname at the 4th
R("/* ================= INIT ================= */", rd('v32_bond.js') + "\n/* ================= INIT ================= */")
_st_end32 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end32] + rd('v32_bond.css') + "\n" + s[_st_end32:]
# save (additive) + sanitised load (literals only: loadSave runs before the feature modules)
R("const save={v:10,chalTypes:[],", "const save={v:10,bond:{},chalTypes:[],")
R("if(s.pass&&typeof s.pass==='object')passLoad(s.pass);",
  "if(s.pass&&typeof s.pass==='object')passLoad(s.pass);\n  if(s.bond&&typeof s.bond==='object')for(const k of Object.keys(s.bond)){const b=s.bond[k];if(b&&typeof b==='object'&&/^[a-z]{2,12}$/.test(k))save.bond[k]={g:Math.max(0,b.g|0),w:Math.max(0,b.w|0),gl:Math.max(0,b.gl|0),lv:Math.max(0,Math.min(4,b.lv|0))};}")
# every finished match with your own penguin
R("save.points+=R.total;save.stats.played++;if(win)save.stats.wins++;save.stats.goals+=ms;",
  "save.points+=R.total;save.stats.played++;if(win)save.stats.wins++;save.stats.goals+=ms;R.bond=bondAdd(save.type,win,ms);")
R("  html+=passRowHtml(R);", "  html+=passRowHtml(R)+bondRowHtml(R);")
# the card: chapters and the nickname
RIN('openCard', "const syn=SYN.filter(", "h+=bondCardHtml(k);const syn=SYN.filter(")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,bondJ,BOND_LV,BOND_PTS,BOND_TXT,bondAdd,bondOf,bondRowHtml,bondCardHtml,bondNick,openCard,")
