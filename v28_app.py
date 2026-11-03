# v28: Android app shell — PHAndroid web-message bridge → PHBilling, back button, pause/resume, vibration, save mirror
R("/* ================= INIT ================= */", rd('v28_app.js') + "\n/* ================= INIT ================= */")
# every save is also mirrored to the app (throttled; only inside the Android app)
R("const persist=()=>{try{localStorage.setItem('penguinHockey.v1',JSON.stringify(save))}",
  "const persist=()=>{try{localStorage.setItem('penguinHockey.v1',JSON.stringify(save));if(window.__phMirror)window.__phMirror();}")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,APP,appInit,appMsg,appCall,phBack,phPause,phResume,appOverlay,")
# a pending payment (cash / carrier billing) is not an error: the pass opens when Play confirms it
RIN('proBuy', "if(!/Abort|cancel/i.test(m))flashMsg('💎 '+'결제를 끝내지 못했어요. 잠시 후 다시 해 주세요');",
  "if(m==='Pending')flashMsg('💎 '+'결제 승인을 기다리고 있어요. 승인되면 프로 패스가 열려요');else if(!/Abort|cancel/i.test(m))flashMsg('💎 '+'결제를 끝내지 못했어요. 잠시 후 다시 해 주세요');")
