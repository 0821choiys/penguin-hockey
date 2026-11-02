# v23: skill cast animations — one per species, built from the species' name (황제 → sceptre + "I'M KING!", 임금 → trumpet, …)
R("/* ================= INIT ================= */", rd('v23_cast.js') + "\n/* ================= INIT ================= */")
_st_end23 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end23] + rd('v23_cast.css') + "\n" + s[_st_end23:]
R('<div id="rlCall" role="status"></div>', '<div id="rlCall" role="status"></div><div id="castBan"></div>')

# start the animation once the skill has really fired
RIN('useSpecial', "  if(p.human)tutEvent('special');\n  return true;", "  if(p.human)tutEvent('special');\n  castStart(p);\n  return true;")
# animation hooks in animatePenguin: flippers / body right after the normal pose, the rest at the end
RIN('animatePenguin', "P.flipL.rotation.set(lx,0,lz);P.flipR.rotation.set(rx,0,rz);", "P.flipL.rotation.set(lx,0,lz);P.flipR.rotation.set(rx,0,rz);castFlip(p,dt);")
RIN('animatePenguin', "      P.stick.position.copy(_pkG).addScaledVector(_pkZ,-.08);\n    }\n  }", "      P.stick.position.copy(_pkG).addScaledVector(_pkZ,-.08);\n    }\n  }\n  castPost(p,dt,t);")
R("safe(v22Frame,dt);", "safe(v22Frame,dt);safe(v23Frame,dt);")

# the floating call-out over the penguin uses the species' shout (the two 'dash' species now differ)
for _f, _a in [('useSpecial', "popAt('큰바다 돌진!',"), ('useSpecial', "popAt('ICE DASH!',"), ('useSpecial', "popAt('SLIDE!',"),
               ('useSpecial', "popAt('FLIPPER SMASH!',"), ('useSpecial', "popAt('ICE BREAK!',"),
               ('spec18', "popAt(\"KING'S CALL!\","), ('spec18', "popAt('CREST CHARGE!',"), ('spec18', "popAt('ROYAL PASS!',"),
               ('spec18', "popAt('SHADOW STEP!',"), ('spec18', "popAt('GOLDEN EYE!',"), ('spec18', "popAt('FAIRY HOP!',"),
               ('spec18', "popAt('HEE-HAW!',"), ('spec18', "popAt('COLD CURRENT!',"), ('spec18', "popAt('DOUBLE DASH!',"), ('spec18', "popAt('SUN FLARE!',")]:
    RIN(_f, _a, "popAt(castShout(p," + _a[6:-1] + "),")

R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,CAST,castShout,castStart,castFlip,castPost,castFrame,castProps,cxS,cxD,")
