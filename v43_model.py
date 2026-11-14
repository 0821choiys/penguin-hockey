# v43: the penguins re-proportioned as characters (v43_model.js runs at the end of buildPenguin)
R("/* ================= INIT ================= */", "/*PKM:js*/" + rd('v43_model.js') + "/*PKM:jsend*/\n/* ================= INIT ================= */")
RIN('buildPenguin', "  return {root,piv,inner,torso,body,head,headAbs,jaw,tail,stick,flipL:fl[0],flipR:fl[1],footL:ft[0],footR:ft[1],eyeL:eyes[0],eyeR:eyes[1],pupL:pupils[0],pupR:pupils[1],scarfTail,hat,num};",
  "  const RET={root,piv,inner,torso,body,head,headAbs,jaw,tail,stick,flipL:fl[0],flipR:fl[1],footL:ft[0],footR:ft[1],eyeL:eyes[0],eyeR:eyes[1],pupL:pupils[0],pupR:pupils[1],scarfTail,hat,num};\n  pk43(RET,typeKey,teamKey,hatKey,o);return RET;")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,pkHeadGeo,PKV,pk43,pk43D,pk43Geo,pk43HeadR,pk43ScarfGeo,pk43Light,")
