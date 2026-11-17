/* ================= v48 ICE: how slippery the ice is (owner, 2026-11-17) ================= */
// "the ice is too slippery, the controls feel awkward — lower it a little (not much, just enough to feel) and let me set it in 설정".
// Five steps for every skater (it is the ice: the AI skates on it too; the goalies and the puck are not changed). Each step multiplies the
// sideways edge grip (how quickly the body follows a turn, incl. the easy-handling carve), how quickly you stop once you let go, and how hard you
// brake when you push against your motion. Top speed and acceleration stay the same. Rink conditions (thin ice …) stack on top of it.
// Step 3 is the standard (25 % more grip / stopping, 15 % more braking than before); step 4 is the ice of v1.6.4 and earlier.
// Online friend matches always skate on step 3 for both players (the host runs the physics).
const ICE={def:3,old:4,lv:[null,
  {grip:1.95,stop:1.95,brk:1.45},
  {grip:1.56,stop:1.56,brk:1.3},
  {grip:1.25,stop:1.25,brk:1.15},
  {grip:1,stop:1,brk:1},
  {grip:.8,stop:.8,brk:.9}]};
function iceSet(){const v=save&&save.set?save.set.ice:ICE.def;return v>=1&&v<=5&&v===Math.round(v)?v:ICE.def;}
function iceLv(){return typeof G!=='undefined'&&G.net?ICE.def:iceSet();}
function iceK(){return ICE.lv[iceLv()];}
function iceName(v){return [null,__L('아주 덜 미끄러움'),__L('덜 미끄러움'),__L('보통'),__L('예전 얼음'),__L('아주 미끄러움')][v];}
function iceRow(){
  const el=$('#setList');if(!el)return;let r=$('#iceRow');
  if(!r){r=document.createElement('div');r.id='iceRow';r.className='setrow ice-set';}
  const v=iceSet();
  r.innerHTML='<div>🧊 '+__L('얼음 미끄러움')+'</div><div class="ice-box"><div class="seg ice-seg">'
    +[1,2,3,4,5].map(i=>'<button data-ice="'+i+'" class="ice-b'+i+(i===v?' on':'')+'" aria-label="'+i+' · '+iceName(i)+'">'+i+'</button>').join('')+'</div>'
    +'<div class="ice-ends"><span>‹ '+__L('덜 미끄럽게')+'</span><span>'+__L('더 미끄럽게')+' ›</span></div>'
    +'<div class="ice-cap"><b>'+v+' · '+iceName(v)+(v===ICE.def?' ('+__L('기본')+')':'')+'</b><span>'+__L('친구 대전은 두 사람 모두 3단계')+'</span></div></div>';
  const c=$('#ctlRow'),f=el.firstElementChild;el.insertBefore(r,c?c.nextSibling:f?f.nextSibling:null);
  r.querySelectorAll('[data-ice]').forEach(b=>b.onclick=()=>{save.set.ice=+b.dataset.ice;persist();SFX.init();SFX.ui();iceRow();});
}
