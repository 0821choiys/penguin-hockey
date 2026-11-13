# v42: privacy policy / account deletion links in 설정 and in the account window
R("/* ================= INIT ================= */", rd('v42_store.js') + "\n/* ================= INIT ================= */")
_st_end42 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end42] + rd('v42_store.css') + "\n" + s[_st_end42:]
RIN('renderSettings', "safe(ctlRow);safe(accRow);", "safe(ctlRow);safe(accRow);safe(legalRow);")
RIN('accRow', "  r.innerHTML=accRowHtml();", "  r.innerHTML=accRowHtml();const lr=$('#legalRow');if(lr)el.appendChild(lr);")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,LEGAL,legalUrl,legalLinks,legalRow,")
