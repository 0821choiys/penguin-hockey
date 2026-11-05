# v35: ☁️ Google sign-in + cloud save (Firebase Auth signInWithIdp, RTDB saves/{uid}), account deletion
R("/* ================= INIT ================= */", rd('v35_acct.js') + "\n/* ================= INIT ================= */")
_st_end35 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end35] + rd('v35_acct.css') + "\n" + s[_st_end35:]
# every save marks the cloud copy dirty (persist runs early: only a window hook)
# while a cloud save is being loaded (page about to restart), nothing may write the old in-memory save back
R("const persist=()=>{try{", "const persist=()=>{if(window.__phHold)return;try{")
R("if(window.__phMirror)window.__phMirror();}catch(e)", "if(window.__phMirror)window.__phMirror();if(window.__phCloud)window.__phCloud();}catch(e)")
# 설정: the account row
RIN('renderSettings', "    row.appendChild(seg);el.appendChild(row);\n  });", "    row.appendChild(seg);el.appendChild(row);\n  });\n  safe(accRow);")
R("enterDemo();setTOD(.1,10);updateEnv(true);tutMaybeAsk();", "enterDemo();setTOD(.1,10);updateEnv(true);tutMaybeAsk();safe(accInit);")
R("const APP_OV=['#dlyDlg',", "const APP_OV=['#accDlg','#dlyDlg',")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,ACC,accOn,accSigned,accWithIdToken,accUpload,accSync,accUseCloud,accUseLocal,accSignOut,accDelete,accOpen,accBody,accHash,accMeta,accSum,accDirty,")
