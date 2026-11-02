# ===== 큰바다쇠오리: OVR 999 (playable physics values) + redeem code =====
R("auk:{name:'큰바다쇠오리',cost:0,exclusive:true,stats:{speed:5,accel:5,power:5,turn:4,body:4},",
  "auk:{name:'큰바다쇠오리',cost:0,exclusive:true,stats:{speed:6.5,accel:6.5,power:6.5,turn:6,body:6},")   # far above every other penguin (max 5); higher values break the ice physics
R("function cardOvr(k,lv){const s=TYPES[k].stats;","function cardOvr(k,lv){if(k==='auk')return 999;const s=TYPES[k].stats;")
R("function penguinValue(k){const lv=save.lv[k]|0,mx=mxInfo(k).lv,o=cardOvr(k,lv);","function penguinValue(k){const lv=save.lv[k]|0,mx=mxInfo(k).lv,o=Math.min(99,cardOvr(k,lv));")
R("  auk:{name:'바다의 지배자',plus:'모든 능력이 최상급',minus:'특수 기술 쿨다운 +10%',cd:1.1}","  auk:{name:'바다의 지배자',plus:'능력치 999 · 모든 능력 최강',minus:'없음'}")
R("const save={v:10,chalTypes:[],","const save={v:10,chalTypes:[],codes:[],")
R("    if(save.types.includes('auk')&&!save.dev.got)save.types=",
  "    if(Array.isArray(s.codes))save.codes=s.codes.filter((c,i,a)=>c==='ysgames777'&&a.indexOf(c)===i);\n    if(save.types.includes('auk')&&!save.dev.got&&!save.codes.includes('ysgames777'))save.types=")
R("    if(save.dev.got&&!save.types.includes('auk'))save.types.push('auk');","    if((save.dev.got||save.codes.includes('ysgames777'))&&!save.types.includes('auk'))save.types.push('auk');")
R("개발자 티어(레이팅 2100)를 달성하면 얻을 수 있어요","개발자 티어(레이팅 2100) 달성 또는 설정의 코드 입력으로 얻을 수 있어요",2)
R('''    <div id="setList"></div>
    <div class="row" style="margin-top:10px"><button class="btn small" data-go="sMenu">완료</button></div>''','''    <div id="setList"></div>
    <div class="setrow code-row"><div>🎟 코드 입력</div><div class="code-box"><input id="codeIn" maxlength="24" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="코드를 입력하세요"><button class="btn small" id="codeGo">확인</button></div></div>
    <div class="row" style="margin-top:10px"><button class="btn small" data-go="sMenu">완료</button></div>''')
R("</style>",""".code-box{display:flex;gap:6px;align-items:center}
#codeIn{font:inherit;font-size:16px;width:min(190px,44vw);padding:7px 10px;border-radius:12px;border:1.5px solid rgba(205,238,255,.6);background:rgba(0,20,45,.45);color:#fff}
#codeIn::placeholder{color:rgba(230,245,255,.6)}
.code-box .btn{min-width:0;padding:7px 14px;font-size:16px}
</style>""")
