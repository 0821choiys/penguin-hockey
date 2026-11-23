/* ================= v50 QUALITY: 초고사양 / 초저사양 (owner, 2026-11-23) ================= */
// "low-end phones lag too much — add 초고사양 and 초저사양 to the graphics setting". The three old levels stay exactly what they were
// (save.set.quality = ultra / high / low is read all over the code); the new ones sit on top: save.set.qx = +1 → 초고사양 (= 최고 and more),
// −1 → 초저사양 (= 절약 and less). Measured at 절약 on a phone screen (2026-11-23, software GPU): ≈781 k triangles a frame, of which the stands
// ≈580 k — the 230-penguin colonies far outside the rink alone ≈340 k — and they also go through the shadow pass; no crowd ≈ half the frame
// time, no shadows ≈ −30 %; resolution mattered little there (real phones are more fill-bound, so 초저사양 lowers it too).
// 초저사양: no far colonies, no shadow map (the soft contact pools under skaters + puck instead, one draw), floodlights' point lights off,
// 75 % render resolution, 30 frames a second (physics keeps its fixed 1/120 s step), half the particles, 3 fur layers on mascots,
// no CSS backdrop blur, no MSAA (from the next start: antialiasing is fixed when the GPU context is made).
// 초고사양: up to 3× screen resolution (최고: 2×), 16 fur layers (최고: 12), sharpest ice / board texture filtering.
const GQ={xlow:{scale:.75,fps:30},max:{dpr:3,fur:16,aniso:16},order:['max','ultra','high','low','xlow']};
function gqX(){const x=save.set.qx|0;return x>0&&save.set.quality==='ultra'?1:x<0&&save.set.quality==='low'?-1:0;}
function gqLevel(){const x=gqX();return x>0?'max':x<0?'xlow':save.set.quality;}
function gqSet(l){if(l==='max'){save.set.quality='ultra';save.set.qx=1;}else if(l==='xlow'){save.set.quality='low';save.set.qx=-1;}else{save.set.quality=l;save.set.qx=0;}}
function gqName(l){return {max:__L('초고사양'),ultra:__L('최고'),high:__L('높음'),low:__L('절약'),xlow:__L('초저사양')}[l]||'';}
function gqDesc(l){
  if(l==='max')return fmtL('해상도 최대 {d}배 · 그림자 {s} · 반사 · 후처리 · 마스코트 털 {f}겹',{d:GQ.max.dpr,s:4096,f:GQ.max.fur});
  if(l==='ultra')return fmtL('해상도 최대 {d}배 · 그림자 {s} · 반사 · 후처리',{d:2,s:4096});
  if(l==='high')return fmtL('해상도 최대 {d}배 · 그림자 {s} · 반사',{d:2,s:3072});
  if(l==='low')return fmtL('해상도 1배 · 그림자 {s} · 반사 · 후처리 끔',{s:1024});
  return fmtL('먼 관중 · 그림자 · 조명 끔 · 해상도 {r}% · {f}fps',{r:Math.round(GQ.xlow.scale*100),f:GQ.xlow.fps});}
function gqRatio(){const x=gqX();if(x<0)return GQ.xlow.scale;if(save.set.quality==='low')return 1;return Math.min(devicePixelRatio||1,x>0?GQ.max.dpr:2);}
// the scene side (called from applyQuality): what 초저사양 switches off, back on for the other levels
let gqOn=null;
function gqScene(){const x=gqX();if(gqOn===x)return;const was=gqOn;gqOn=x;const lo=x<0;
  try{for(const p of colony.parts)p.m.visible=!lo;}catch(e){}
  try{for(const l of lamps)if(l.pl)l.pl.visible=!lo;}catch(e){}
  const sh=!lo&&!(typeof perf!=='undefined'&&perf.noShadow);
  if(renderer.shadowMap.enabled!==sh||sun.castShadow!==sh){renderer.shadowMap.enabled=sh;sun.castShadow=sh;scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.needsUpdate=true;});});}
  else if(was!==null&&(was<0)!==lo)scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.needsUpdate=true;});});   // point lights in / out of the shaders
  try{const a=x>0?Math.min(GQ.max.aniso,renderer.capabilities.getMaxAnisotropy()):Math.min(maxAniso,renderer.capabilities.getMaxAnisotropy());
    for(const m of[iceMat])if(m&&m.map&&m.map.anisotropy!==a){m.map.anisotropy=a;m.map.needsUpdate=true;}}catch(e){}
  document.body.classList.toggle('gq-xlow',lo);document.body.classList.toggle('gq-max',x>0);
}
// 30 frames a second on 초저사양: skip a display refresh when the last frame is younger than 1/30 s (a little early is fine)
function gqSkip(now){return gqX()<0&&now-lastT<1/GQ.xlow.fps-.004;}
// the 설정 row: five steps, the chosen one spelled out
function gqRow(){const row=$('#setList .setrow[data-k="quality"]');if(!row)return;const cur=gqLevel();row.classList.add('set-gq');
  row.innerHTML='<div>'+__L('그래픽')+'</div><div class="gq-box"><div class="seg gq-seg">'+GQ.order.map(l=>'<button data-gq="'+l+'" class="gq-'+l+(l===cur?' on':'')+'">'+gqName(l)+'</button>').join('')+'</div>'
    +'<div class="gq-cap"><b>'+gqName(cur)+'</b><span>'+gqDesc(cur)+'</span>'+(cur==='xlow'&&!(renderer.getContextAttributes&&renderer.getContextAttributes()&&renderer.getContextAttributes().antialias===false)?'<span class="gq-next">'+__L('안티에일리어싱은 다음 실행부터 꺼져요')+'</span>':'')+'</div></div>';
  row.querySelectorAll('[data-gq]').forEach(b=>b.onclick=()=>{gqSet(b.dataset.gq);persist();SFX.init();SFX.ui();GFX.drop=0;applyQuality();renderSettings();});}
// a one-time hint in a match: the phone keeps struggling even after the automatic step-down → offer 초저사양 (never switches by itself)
const GQH={t:0,shown:false,el:null};
function gqHintFrame(dt){
  if(GQH.shown||save.gqHint||gqX()<0||G.view!=='game'||G.state!=='play'||G.net||G.paused){GQH.t=0;return;}
  const bad=perf.scale<=.6&&perf.ema>1/34;GQH.t=bad?GQH.t+(G.rdt||dt||0):Math.max(0,GQH.t-(G.rdt||dt||0));
  if(GQH.t<4)return;GQH.shown=true;save.gqHint=1;persist();
  const el=document.createElement('div');el.id='gqTip';el.innerHTML='<span>🐢 '+__L('화면이 끊기면 그래픽을 초저사양으로 바꿔 보세요')+'</span><div class="gq-tb"><button class="btn small" id="gqTipGo">'+__L('초저사양으로')+'</button><button class="btn small ghost" id="gqTipX" aria-label="✕">✕</button></div>';
  document.body.appendChild(el);GQH.el=el;const close=()=>{el.remove();GQH.el=null;};
  el.querySelector('#gqTipGo').onclick=()=>{gqSet('xlow');persist();GFX.drop=0;applyQuality();SFX.init();SFX.ui();flashMsg(__L('🐢 초저사양으로 바꿨어요 (설정 → 그래픽)'));close();};
  el.querySelector('#gqTipX').onclick=close;setTimeout(close,14000);}
