# v30: comfortable landscape on phones — full-height panels with a one-line header, two-column settings and pass
_st_end30 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end30] + rd('v30_land.css') + "\n" + s[_st_end30:]
R("/* ================= INIT ================= */", rd('v30_land.js') + "\n/* ================= INIT ================= */")
RIN('updateCamera', "const port=asp<1?lerp(1.95,1,clamp((asp-.45)/.55,0,1)):1,z=G.cam.zoom*port;",
    "const port=asp<1?lerp(1.95,1,clamp((asp-.45)/.55,0,1)):landZoom(asp),z=G.cam.zoom*port;")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,landZoom,")
