# v41: card art = a studio portrait of the species' real 3D game model (v41_card.js), the old drawings stay as the fallback
R("/* ================= INIT ================= */", "/*P3:js*/" + rd('v41_card.js') + "/*P3:jsend*/\n/* ================= INIT ================= */")
_st_end41 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end41] + "/*P3:css*/" + rd('v41_card.css') + "/*P3:cssend*/\n" + s[_st_end41:]
RIN('pengSVG', "  if(k==='auk')return aukSVG();", "  {const h=p3Html(k);if(h)return h;}\n  if(k==='auk')return aukSVG();")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,P3,P3V,p3Can,p3Shot,p3Url,p3Html,p3Warm,p3Frame,p3Stick,")
# warm the portraits up one by one while a menu is open
R("safe(ctlFrame);safe(hkFrame);safe(lxFrame,dt);", "safe(ctlFrame);safe(hkFrame);safe(lxFrame,dt);safe(p3Frame);")
