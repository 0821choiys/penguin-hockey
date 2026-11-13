# v42: privacy policy / account deletion links in 설정 and in the account window
R("/* ================= INIT ================= */", rd('v42_store.js') + "\n/* ================= INIT ================= */")
_st_end42 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end42] + rd('v42_store.css') + "\n" + s[_st_end42:]
RIN('renderSettings', "safe(ctlRow);safe(accRow);", "safe(ctlRow);safe(accRow);safe(legalRow);")
RIN('accRow', "  r.innerHTML=accRowHtml();", "  r.innerHTML=accRowHtml();const lr=$('#legalRow');if(lr)el.appendChild(lr);")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,gaugeFit,LEGAL,legalUrl,legalLinks,legalRow,")
# the skill gauge label shrinks to fit its circle
R("$('#gaugeT').textContent=vv>=1?SPECIALS[pl.ty.special]:'충전중';", "$('#gaugeT').textContent=vv>=1?SPECIALS[pl.ty.special]:'충전중';gaugeFit();")
