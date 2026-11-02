# ===== final audit fixes (ultimate pass 2) =====
# 1) duplicate SVG gradient id: the JS egg used the same id as the static pack egg
_m=re.search(r"const EGG_SVG='[^\n]*?';",s)
s=s[:_m.start()]+_m.group(0).replace('cgA','cgEgg')+s[_m.end():]
# 2) every "not enough points" message states the shortfall
R("function flashMsg(t){","function lackMsg(c){flashMsg('포인트가 '+(c-save.points)+'P 부족해요 (필요 '+c+'P · 보유 '+save.points+'P)');}\nfunction flashMsg(t){")
R("  if(save.points<cost){flashMsg('포인트가 부족해요!');return;}\n  save.points-=cost;if(free)","  if(save.points<cost){lackMsg(cost);return;}\n  save.points-=cost;if(free)")
R("  if(save.points<def.cost){flashMsg('포인트가 부족해요!');return;}","  if(save.points<def.cost){lackMsg(def.cost);return;}")
R("  if(save.points<L.price){flashMsg('포인트가 부족해요!');return false;}","  if(save.points<L.price){lackMsg(L.price);return false;}")
R("function mkRefresh(){if(save.points<MK_REFRESH){flashMsg('포인트가 부족해요!');return false;}","function mkRefresh(){if(save.points<MK_REFRESH){lackMsg(MK_REFRESH);return false;}")
R("if(!save[list].includes(k)){if(save.points<cost){flashMsg('포인트가 부족해요!');return;}","if(!save[list].includes(k)){if(save.points<cost){lackMsg(cost);return;}")
R("  if(save.points<cost){flashMsg('포인트가 부족해요!');return;}","  if(save.points<cost){lackMsg(cost);return;}")
# 3) mobile autoplay: any first tap/click unlocks (or resumes) audio, not only specific buttons
R("addEventListener('blur',()=>{","['pointerup','click','touchend'].forEach(ev=>addEventListener(ev,()=>{try{SFX.init();}catch(e){}},{capture:true,passive:true}));\naddEventListener('blur',()=>{")
# 4) enhance tab: before → after stat preview for the next level
R("<small>능력치 +'+(lv*LV_STAT).toFixed(2)+(lv>=10?","<small>능력치 +'+(lv*LV_STAT).toFixed(2)+(lv<MAX_LV?' → 다음 <b>+'+((lv+1)*LV_STAT).toFixed(2)+'</b>':'')+(lv>=10?")
# 5) menu shows when new achievements were earned (cleared when the 업적 tab is opened)
R("const save={v:10,chalTypes:[],codes:[],ach:{},","const save={v:10,chalTypes:[],codes:[],ach:{},achNew:0,")
R("  if(s.v!==10)persist();","  if(Number.isFinite(s.achNew))save.achNew=Math.max(0,Math.min(99,s.achNew|0));\n  if(s.v!==10)persist();")
R("  persist();try{$('#ptsN').textContent=save.points;}catch(e){}\n  if(got.length>2)","  save.achNew=Math.min(99,(save.achNew|0)+got.length);persist();try{$('#ptsN').textContent=save.points;hypeMenuRefresh();}catch(e){}\n  if(got.length>2)")
R("b.textContent=n?n:'';b.style.display=n?'inline-block':'none';}","const an=save.achNew|0;b.textContent=n?n:an?'NEW':'';b.style.display=n||an?'inline-block':'none';b.title=n?'받을 보상 '+n+'개':an?'새 업적 '+an+'개':'';}")
R("  }else if(gTab==='ach'){h+=achHtml();","  }else if(gTab==='ach'){h+=achHtml();if(save.achNew){save.achNew=0;persist();hypeMenuRefresh();}")
_i=s.index('<linearGradient id="cgA"');_j=s.index('<linearGradient id="cgA"',_i+10);_k=s.index('url(#cgA)',_j)
s=s[:_j]+'<linearGradient id="cgA2"'+s[_j+len('<linearGradient id="cgA"'):_k]+'url(#cgA2)'+s[_k+len('url(#cgA)'):]
