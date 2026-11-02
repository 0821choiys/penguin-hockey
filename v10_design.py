# ===== v10 design pass: home layout + design system stylesheet =====
R('''<div class="screen on" id="sMenu">
  <div class="col">
    <div class="logo"><div class="l1"><span class="em">🐧</span> PENGUIN HOCKEY <span class="em">🏒</span></div><div class="l2">ANTARCTIC ICE RINK</div></div>
    <button class="btn primary" data-mode="quick">⚡ 빠른 경기 <small>일반</small></button>
    <button class="btn rkbtn" data-go="sRanked">🏅 티어 게임 <small>레이팅 · 대표 선발전</small></button>
    <button class="btn" data-go="sMode">게임 시작 (모드 선택)</button>
    <button class="btn mkbtn" data-go="sMarket">💱 이적시장<span id="mkBadge"></span></button>
    <div class="row">
      <button class="btn" data-go="sHow">게임 방법</button>
      <button class="btn" data-go="sScout">🎁 스카우트</button>
      <button class="btn" data-go="sSquad">🧩 팀 편성</button>
      <button class="btn" data-go="sGoals">🎯 목표<span id="goalBadge"></span></button>
      <button class="btn" data-go="sProfile">👤 마이 프로필</button>
      <button class="btn" data-go="sSet">설정</button>
    </div>
    <div id="menuRank" data-go="sProfile"></div><div id="menuGoals"></div><div id="menuStats" style="margin-top:12px;font-size:15px;color:#fff;text-shadow:0 1px 5px rgba(0,0,0,.7)"></div>
  </div>
</div>''','''<div class="screen on" id="sMenu">
  <div class="home">
    <div class="logo"><div class="l1"><span class="em">🐧</span> PENGUIN HOCKEY <span class="em">🏒</span></div><div class="l2">ANTARCTIC ICE RINK</div></div>
    <div class="hm-cta">
      <button class="btn primary" data-mode="quick">⚡ 빠른 경기<small>바로 시작 · 레이팅 변동 없음</small></button>
      <button class="btn rkbtn" data-go="sRanked">🏅 티어 게임<small>랭크 · 대표 선발전</small></button>
      <button class="btn mkbtn" data-go="sMarket">💱 이적시장<span id="mkBadge"></span><small>선수 영입 · 방출</small></button>
      <button class="btn hm-modes" data-go="sMode">🏒 모든 경기 모드</button>
    </div>
    <div id="menuGoals"></div><div id="menuStats"></div>
  </div>
  <div id="menuRank" data-go="sProfile"></div>
  <nav class="dock" aria-label="메뉴">
    <button data-go="sScout"><i>🎁</i><span>스카우트</span></button>
    <button data-go="sSquad"><i>🧩</i><span>팀 편성</span></button>
    <button data-go="sGoals"><i>🎯</i><span>목표</span><b id="goalBadge"></b></button>
    <button data-go="sProfile"><i>👤</i><span>프로필</span></button>
    <button data-go="sHow"><i>📘</i><span>게임 방법</span></button>
    <button data-go="sSet"><i>⚙️</i><span>설정</span></button>
  </nav>
</div>''')
R("</style>",rd('design10.css')+"\n</style>")
