/* ================= v32: 💙 penguin growth stories ================= */
// Every finished match with a penguin as your own player (save.type) builds your bond with that species.
// At 3 / 10 / 25 / 50 matches a new chapter of its story opens (+50 / 100 / 200 / 400 points); the 4th gives it a
// nickname shown on its card. The result screen shows the progress and any chapter that just opened; the card shows
// every chapter (locked ones say how many matches are left).
const BOND_LV=[3,10,25,50],BOND_PTS=[50,100,200,400];
const BOND_TXT={
  basic:['처음 링크에 선 날, 아델리는 퍽보다 자기 발이 더 빨라서 넘어졌어요.','이제 아이스 대시로 수비 사이를 빠져나가는 법을 알아요.','동네 꼬마 펭귄들이 아델리처럼 달리겠다며 얼음판에 줄을 섰어요.','평범해서 더 강한 펭귄. 누구와 함께여도 해내요.','얼음판의 기본기'],
  fast:['젠투는 연습 첫날부터 배로 미끄러지는 게 제일 신났어요.','펭귄 슬라이드로 퍽을 낚아채자 관중이 처음으로 이름을 불렀어요.','너무 빨라서 그림자가 늦게 따라온다는 소문이 돌아요.','이제 링크에서 가장 빠른 줄무늬 꼬리예요.','번개 썰매'],
  strong:['황제는 처음엔 퍽을 너무 세게 쳐서 펜스만 흔들었어요.','힘을 모으는 법을 배우자 플리퍼 슛이 골망을 갈랐어요.','상대 골키퍼가 황제 앞에서는 장갑을 두 번 낀대요.','남극에서 가장 묵직한 한 방의 주인이에요.','남극의 대포'],
  defense:['턱끈은 말수가 적지만 골문 앞은 절대 비우지 않아요.','아이스 브레이크로 얼음을 깨자 상대 공격이 멈춰 섰어요.','팀원들은 턱끈 뒤에 서면 마음이 놓인대요.','턱끈이 지키는 골문 앞은 바람도 못 지나가요.','얼음 성벽'],
  balanced:['바위뛰기는 링크에서도 자꾸 깡충깡충 뛰어서 혼났어요.','그 점프 덕분에 넘어지는 일이 거의 없어졌어요.','노란 눈썹을 휘날리며 달리는 모습이 하이라이트에 자주 나와요.','어느 자리에서도 균형을 잃지 않는 만능 선수예요.','깡충 만능꾼'],
  king:['임금 펭귄은 경기 전에 트럼펫을 불어야 마음이 차분해져요.','트럼펫 소리에 팀 전체가 한꺼번에 힘을 냈어요.','관중석이 임금의 곡조를 따라 부르기 시작했어요.','링크의 왕이 연주를 시작하면 경기가 뒤집혀요.','링크의 지휘자'],
  macaroni:['마카로니는 머리깃이 흐트러지면 경기에 집중을 못 했어요.','볏을 세우는 순간 상대가 움찔하는 걸 알게 됐어요.','경기 전 머리깃 손질은 이제 팀의 행운 의식이에요.','노란 볏이 빛나면 골이 들어간다는 전설이 생겼어요.','황금 볏'],
  royal:['로열은 혼자 골을 넣는 것보다 패스하는 게 더 좋았어요.','로열 패스가 동료 발끝에 딱 닿자 모두가 활짝 웃었어요.','로열이 고개만 들어도 팀원들이 빈 곳으로 달려가요.','보지 않고도 동료를 찾아내는 링크의 설계자예요.','왕실 플레이메이커'],
  fiordland:['피오르드랜드는 숲속 안개처럼 조용히 다가가는 걸 좋아해요.','그림자처럼 사라졌다 나타나 퍽을 빼앗았어요.','상대 선수들은 경기 내내 자꾸 뒤를 돌아보게 됐어요.','안개가 걷히면 이미 골이 들어가 있어요.','안개 속 그림자'],
  yelloweye:['노란눈은 멀리 있는 퍽도 제일 먼저 찾아냈어요.','날카로운 눈으로 골키퍼의 빈틈을 꿰뚫었어요.','노란눈이 노려보면 상대 수비가 한 걸음 물러서요.','단 한 번의 틈도 놓치지 않는 빙판의 매예요.','빙판의 매'],
  little:['쇠푸른은 너무 작아서 처음엔 퍽보다 조금 큰 정도였어요.','폴짝 뛰어 태클을 피하자 모두가 깜짝 놀랐어요.','작은 몸으로 큰 펭귄들 사이를 누비는 게 특기가 됐어요.','키는 작아도 심장은 링크에서 가장 커요.','작은 거인'],
  african:['아프리카 펭귄은 당나귀 같은 울음소리 때문에 놀림을 받았어요.','그 울음소리에 상대가 흔들리자 다들 따라 하고 싶어 했어요.','이제 관중이 아프리카의 울음소리를 응원가로 불러요.','따뜻한 바다에서 온 링크의 함성이에요.','남쪽 바다의 함성'],
  humboldt:['훔볼트는 차가운 해류를 타던 때를 떠올리며 스케이트를 배웠어요.','해류처럼 동료들을 앞으로 밀어 주는 법을 익혔어요.','훔볼트가 흐름을 만들면 팀 전체가 빨라져요.','경기의 흐름을 바꾸는 조용한 물결이에요.','흐름의 주인'],
  magellanic:['마젤란은 한 번 달리고 나면 꼭 한 번 더 달리고 싶었어요.','두 번 연속 대시로 수비를 두 겹이나 뚫었어요.','상대가 막았다고 생각하는 순간 마젤란은 한 번 더 가요.','멈추지 않는 탐험가의 발걸음이에요.','두 번의 돌풍'],
  galapagos:['갈라파고스는 추운 링크가 처음이라 덜덜 떨었어요.','적도의 햇살을 터뜨리자 얼음판이 반짝반짝 빛났어요.','갈라파고스가 웃으면 경기장이 따뜻해진대요.','가장 먼 곳에서 온 가장 밝은 선수예요.','적도의 햇살'],
  auk:['큰바다쇠오리는 오래전 바다의 이야기를 품고 링크에 왔어요.','큰바다 돌진으로 파도처럼 상대를 밀어냈어요.','어린 펭귄들이 옛 바다 이야기를 들으러 모여들어요.','사라졌던 바다의 전설이 링크에서 다시 살아났어요.','돌아온 바다의 전설']
};
// Korean particles after a name: 와/과 and 을/를 depend on whether the last syllable ends in a consonant
function bondJ(s){const F=String.fromCharCode,fin=c=>{const n=c.charCodeAt(0)-0xAC00;return n>=0&&n<11172&&n%28!==0;};
  const WA=F(0xC640),GWA=F(0xACFC),UI=F(0xC758),EUL=F(0xC744),REUL=F(0xB97C);   // 와 과 의 을 를 (built from codes: not UI text)
  return String(s).replace(new RegExp('([\\uAC00-\\uD7A3])'+WA+UI,'g'),(m,c)=>c+(fin(c)?GWA:WA)+UI)
    .replace(new RegExp('([\\uAC00-\\uD7A3])\u300D'+EUL,'g'),(m,c)=>c+'\u300D'+(fin(c)?EUL:REUL));}
function bondOf(k){const b=save.bond[k];return b||{g:0,w:0,gl:0,lv:0};}
function bondLvFor(g){let l=0;for(const n of BOND_LV)if(g>=n)l++;return l;}
function bondNick(k){const b=bondOf(k),t=BOND_TXT[k];return b.lv>=4&&t?t[4]:'';}
// one finished match with species k: returns what changed (for the result row)
function bondAdd(k,win,goals){
  if(!TYPES[k]||!BOND_TXT[k])return null;
  const b=save.bond[k]||(save.bond[k]={g:0,w:0,gl:0,lv:0});
  b.g++;if(win)b.w++;b.gl+=Math.max(0,goals|0);
  const to=bondLvFor(b.g),out={k,g:b.g,from:b.lv,to,pts:0};
  while(b.lv<to){out.pts+=BOND_PTS[b.lv];b.lv++;}
  if(out.pts)save.points+=out.pts;
  return out;
}
function bondRowHtml(R){
  const B=R&&R.bond;if(!B)return '';
  const t=TYPES[B.k],nm=t.name,next=BOND_LV[B.to];
  let h='<div class="bd-row"><span class="bd-ic">💙</span><span>'+bondJ(fmtL('{n}와의 이야기 {l}/4',{n:nm,l:B.to}))
    +(next?' · '+fmtL('다음 이야기까지 {m}경기',{m:next-B.g}):' · '+__L('모든 이야기를 열었어요'))+'</span></div>';
  if(B.to>B.from){
    for(let l=B.from;l<B.to;l++)h+='<div class="bd-new"><b>📖 '+fmtL('{n} 이야기 {l}',{n:nm,l:l+1})+'</b><p>'+BOND_TXT[B.k][l]+'</p><small>+'+BOND_PTS[l]+'P</small>'
      +(l===3?'<div class="bd-nick">'+bondJ(fmtL('별명 「{s}」을 얻었어요!',{s:BOND_TXT[B.k][4]}))+'</div>':'')+'</div>';
  }
  return h;
}
function bondCardHtml(k){
  const t=BOND_TXT[k];if(!t)return '';const b=bondOf(k);
  let h='<div class="bd-card"><div class="bd-h">💙 '+bondJ(fmtL('{n}와의 이야기',{n:TYPES[k].name}))+' <small>'+fmtL('{g}경기 · {l}/4',{g:b.g,l:b.lv})+'</small></div>';
  if(b.lv>=4)h+='<div class="bd-nick">「'+t[4]+'」</div>';
  for(let l=0;l<4;l++)h+=l<b.lv?'<p class="bd-ch">📖 '+t[l]+'</p>':'<p class="bd-ch lock">🔒 '+fmtL('{m}경기 더 하면 열려요 (+{p}P)',{m:BOND_LV[l]-b.g,p:BOND_PTS[l]})+'</p>';
  return h+'</div>';
}
