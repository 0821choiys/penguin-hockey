function showResultScreen(){
  const R=G.result,cfg=G.cfg;if(!R)return;
  const win=R.win,draw=R.draw,ms=R.ms,os=R.os,h=G.hype;
  const diffKey=cfg.diff||'normal',mult={easy:.7,normal:1,hard:1.3}[diffKey]||1;
  let base=Math.round(((win?30:draw?15:10)+3*Math.min(ms,5))*mult),extra=0,extraName='',extraNote='',btns=[],title=win?'VICTORY! 🐧🏆':draw?'DRAW':'GAME OVER';
  if(cfg.mode==='tour'&&G.tour){
    const tr=G.tour;
    if(win){
      if(tr.round>=TOUR.length-1){
        let bonus=0;
        if(!tr.champPaid){tr.champPaid=true;bonus=save.cleared.tour?30:100;save.cleared.tour=true;save.stats.tourClears++;}  // paid once per run
        extra=bonus;extraName='토너먼트 우승 보너스';title='CHAMPION! 🏆';extraNote='토너먼트 우승!';btns.push(['다시 도전',()=>startTournament()]);
      }else{extraNote='다음 상대: <b>'+TOUR[tr.round+1].name+'</b>';btns.push(['다음 라운드',()=>{tr.round++;showTourIntro();}]);}
    }else{
      title=draw?'무승부…':'탈락…';extraNote=TOUR[tr.round].name+(draw?'와(과) 비겼어요. 다시 도전해요!':'에게 패배했어요. 다음엔 이길 수 있어요!');
      btns.push(['이 라운드 재도전',()=>showTourIntro()]);btns.push(['처음부터',()=>startTournament()]);
    }
  }else if(cfg.mode==='ranked'){btns.push(['🔁 다시 매칭',()=>rankedStart()]);btns.push(['🏅 티어 게임',()=>goRanked()]);}
  else if(cfg.mode!=='trial')btns.push(['다시 하기',()=>startMatch(Object.assign({},cfg))]);
  btns.push(['메인 메뉴',()=>toMenu()]);
  const cbBonus=Math.min(30,Math.round(Math.min(h.combo.max,8)*3*mult));   // capped: combos can never outweigh the match itself
  if(!R.paid){
    R.paid=true;
    if(cfg.mode==='trial'){R.tr=trialAfterMatch(win);if(R.tr&&R.tr.st==='champ'){extra+=R.tr.pts;extraName=R.tr.first?'첫 선발 보상':'선발 보상';}}
    R.base=base;R.cb=cbBonus;R.extra=extra;R.extraName=extraName;R.total=base+cbBonus+extra;
    save.points+=R.total;save.stats.played++;if(win)save.stats.wins++;save.stats.goals+=ms;
    R.hy=hypeMatchEnd(win,draw,ms,os,cfg);
    R.mg=mgrMatchEnd(win,draw,cfg);
    if(cfg.mode==='tour'&&G.tour&&win&&G.tour.round+1>save.rec.tourBest)save.rec.tourBest=G.tour.round+1;
    persist();
  }
  if(cfg.mode==='trial'){
    const t=R.tr;btns=[];
    if(t&&t.st==='next'){title='✅ '+t.rn+' 승리!';extraNote=t.T.icon+' '+t.T.name+' · 다음은 <b>'+t.next+'</b> vs '+escH(t.opp);btns.push(['▶ '+t.next+' 진행',()=>trialPlay()]);btns.push(['🏅 티어 게임',()=>goRanked()]);}
    else if(t&&t.st==='champ'){title=t.kind==='city'?'🏆 '+escH(t.city)+'시 대표 선발!':'🇰🇷 국가대표 선발!';
      extraNote=t.T.name+' 우승! '+(t.kind==='city'?'이제 전국대회 대표 선발전에 도전할 수 있어요 (플래티넘 이상).':'최고의 감독으로 인정받았어요!')+(t.card?'<div style="margin:6px auto;--cw:78px;display:inline-block">'+cardHtml(t.card.k,{g:t.card.g,lv:t.card.isNew?t.card.g:0,tag:t.card.isNew?'NEW':'보관'})+'</div><br><small>보상 카드: '+TYPES[t.card.k].name+' ('+GRADES[t.card.g].n+')</small>':'');
      btns.push(['🏅 티어 게임',()=>goRanked()]);}
    else{title=draw?'무승부… 선발전 탈락':'선발전 탈락…';extraNote=t?t.T.name+' '+t.rn+'에서 아쉽게 탈락했어요. 남은 도전권으로 다시 도전해요!':'';btns.push(['🏅 티어 게임',()=>goRanked()]);}
    btns.push(['메인 메뉴',()=>toMenu()]);
    if(!R.celebrated&&t&&t.st==='champ'){R.celebrated=true;try{SFX.win();vib([40,40,40,40,160]);}catch(e){}}
  }else if(cfg.mode==='ranked'&&R.mg)extraNote=(extraNote?extraNote+'<br>':'')+'⚔️ 랭크 경기 vs '+escH(cfg.oppName||'')+' ('+tierOf(cfg.oppR||1000).name+')';
  if(R.mg&&R.mg.dev){title='💻 개발자 티어 달성!';extraNote=(extraNote?extraNote+'<br>':'')+'최종 티어 도달! 칭호 <b>💻 개발자</b> + 최고급 캐릭터 <b>큰바다쇠오리</b> 획득';if(!R.devShown){R.devShown=true;setTimeout(devReveal,500);}}
  const hy=R.hy||{xp:[],recs:[],goalsDone:[],tags:[],next:''};
  const me=G.mine.key==='blue'?'BLUE':'RED',op=G.mine.key==='blue'?'RED':'BLUE';
  let html='<div class="rs-score">'+me+' '+ms+' : '+os+' '+op+'</div>';
  if(R.note)html+='<div class="rs-note">'+R.note+'</div>';
  if(extraNote)html+='<div class="rs-note">'+extraNote+'</div>';
  if(!win&&!draw&&os-ms===1)html+='<div class="rs-note">딱 1골 차이였어요! 한 번 더 하면 이길 수 있어요 💪</div>';
  if(hy.tags.length||hy.recs.length)html+='<div class="rs-tags">'+hy.tags.map(t=>'<span class="rtag">'+t+'</span>').join('')+(hy.recs.length?'<span class="rtag newrec">NEW RECORD! '+hy.recs.slice(0,3).join(' · ')+'</span>':'')+'</div>';
  html+='<div class="rs-rows"><div class="rs-row"><span>기본 보상</span><span><b class="cu" data-to="'+R.base+'">0</b> P</span></div>';
  if(R.cb>0)html+='<div class="rs-row"><span>콤보 보너스 (최고 x'+h.combo.max+')</span><span><b class="cu" data-to="'+R.cb+'">0</b> P</span></div>';
  if(R.extra>0)html+='<div class="rs-row"><span>'+R.extraName+'</span><span><b class="cu" data-to="'+R.extra+'">0</b> P</span></div>';
  html+='<div class="rs-row total"><span>획득 포인트</span><span>⭐ <b class="cu" data-to="'+R.total+'">0</b> P</span></div></div>';
  html+='<div class="rs-xp">'+hy.xp.map(r=>{
    const pb=r.b.need?r.b.cur/r.b.need*100:100,pa=r.a.need?r.a.cur/r.a.need*100:100,lvl=r.to>r.from;
    const tr=TRAITS.filter(t=>t.lv>r.from&&t.lv<=r.to);
    return '<div class="xprow" data-lv="'+(lvl?1:0)+'" data-a="'+pa.toFixed(1)+'"><div style="--cw:50px">'+cardHtml(r.type)+'</div><div class="xi"><b>'+TYPES[r.type].name+'</b> <span class="xpl">숙련 Lv.'+r.from+(lvl?' → '+r.to:'')+'</span> <span class="xpg">+'+r.gain+' XP</span><div class="xpb"><i style="width:'+pb.toFixed(1)+'%"></i></div>'
      +(lvl?'<div class="lvfx">LEVEL UP! 전 능력치 +'+((r.to-r.from)*MS_STAT).toFixed(2)+(tr.length?' · 특성 해금: '+tr.map(t=>t.name+' ('+t.desc+')').join(', '):'')+'</div>':'')+'</div></div>';}).join('')+'</div>';
  if(R.mg)html+='<div class="rs-mgr">🎖 감독 레이팅 <b>'+R.mg.to+'</b> <span class="'+(R.mg.d>=0?'up':'dn')+'">('+(R.mg.d>=0?'+':'')+R.mg.d+')</span> · <b style="color:'+R.mg.tier.c+'">'+R.mg.tier.name+'</b>'+(R.mg.up?' <span class="rtag">티어 승급!</span>':R.mg.down?' <small>(티어 강등)</small>':'')+'</div>';
  html+='<div class="rs-stats">슛 '+G.stats.shots+' (유효 '+G.stats.onTarget+') · 패스 성공 '+G.stats.passOK+'/'+G.stats.passTry+' · 최고 콤보 x'+h.combo.max+(h.maxStreak>1?' · 연속 득점 '+h.maxStreak:'')+'</div>';
  if(hy.goalsDone.length)html+='<div class="rs-goal">🎯 목표 달성! '+hy.goalsDone.join(', ')+' — 메인 메뉴의 목표에서 보상을 받으세요</div>';
  if(hy.next)html+='<div class="rs-next">'+hy.next+'</div>';
  openResult(title,html,btns);
  hypeResultAnim();
}
