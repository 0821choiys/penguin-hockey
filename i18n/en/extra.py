# Korean strings introduced or corrected by the i18n build step -> (en, zh, ja)
X={
"언어 · Language":("Language","语言 · Language","言語 · Language"),
"한국어":("한국어","한국어","한국어"),
"<div class=\"odds\">티어 게임(랭크전·선발전) 결과로만 레이팅이 바뀌어요(강한 상대일수록 이기면 더 많이 올라요). 첫 10경기는 배치 경기라 변동이 커요. 티어 게임을 시작하고 20초가 지난 뒤 중간에 나가면 기권 패예요. 다른 감독들은 컴퓨터가 운영하는 가상 감독이에요.</div>":(
 "<div class=\"odds\">Only Ranked games (ranked matches and trials) change your rating (beating stronger opponents raises it more). The first 10 games are placement games, so the swings are bigger. Leaving a Ranked game more than 20 seconds after it starts counts as a forfeit loss. The other coaches are virtual coaches run by the computer.</div>",
 "<div class=\"odds\">只有排位赛（排位对战·选拔赛）的结果会改变评分（战胜越强的对手，涨得越多）。前10场是定级赛，变动较大。排位赛开始20秒后中途退出将判为弃权负。其他教练都是由电脑运营的虚拟教练。</div>",
 "<div class=\"odds\">レーティングが変わるのはランクマッチ（ランク戦・選考会）の結果だけです（強い相手に勝つほど大きく上がります）。最初の10試合は判定試合なので変動が大きくなります。ランクマッチ開始から20秒を過ぎて途中で抜けると棄権負けになります。他の監督はコンピューターが運営する仮想の監督です。</div>"),
}
# context overrides: (Korean literal, source text right before it, ctx id) -> (en, zh, ja)
CTX=[("점","r.maxMargin+","m",(" goals","球","点")),("기본","const GRADES=[{n:","rar0",("Common","普通","ノーマル"))]   # v21: the rarity 기본 (elsewhere 기본 = Default)
# identity entries allowed to keep Hangul
KEEP={"한국어"}
