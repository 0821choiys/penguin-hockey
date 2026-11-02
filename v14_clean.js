
/* ================= v14 tidy: panels with a fixed header/footer and a scrolling body, points-chip docking ================= */
// Wraps everything between a panel's title (+ tab strip) and its last button row in .pbody, so long content scrolls inside the panel
// instead of being sliced by the panel edge, and the 완료 / 뒤로 / result buttons are always on screen.
const UI_PANELS=['sHow','sSelect','sScout','sSquad','sMarket','sProfile','sRanked','sGoals','sSet','sResult'];
function uiPanels(){
  try{for(const id of UI_PANELS){const scr=document.getElementById(id);if(!scr||!scr.children)continue;
    const pan=[...scr.children].find(e=>e.classList&&e.classList.contains('panel'));if(!pan||pan.classList.contains('pfix'))continue;
    const kids=[...pan.children];let a=0,b=kids.length;
    if(kids[a]&&(kids[a].tagName==='H2'||kids[a].id==='rTitle'))a++;
    if(kids[a]&&kids[a].classList.contains('seg')&&/Tabs$/.test(kids[a].id||''))a++;
    if(b>a&&(kids[b-1].classList.contains('row')||kids[b-1].id==='rBtns'))b--;
    if(b-a<1)continue;
    const body=document.createElement('div');body.className='pbody';pan.insertBefore(body,kids[a]);for(let i=a;i<b;i++)body.appendChild(kids[i]);
    pan.classList.add('pfix');body.addEventListener('scroll',()=>uiFade(body),{passive:true});
    if(window.MutationObserver)new MutationObserver(uiTidySoon).observe(body,{childList:true,subtree:true,characterData:true});}
  }catch(e){}
}
function uiFade(el){const st=el.scrollTop,max=el.scrollHeight-el.clientHeight;el.classList.toggle('fu',st>2);el.classList.toggle('fd',max-st>2);}
let uiTidyT=0;function uiTidySoon(){clearTimeout(uiTidyT);uiTidyT=setTimeout(uiTidy,30);}
function uiTidy(){
  try{const p=document.getElementById('pts');document.querySelectorAll('.screen.ptsgap').forEach(s=>s.classList.remove('ptsgap'));
    if(p&&document.body.classList.contains('menuish')){const scr=document.querySelector('.screen.on:not(#sMenu)');
      const pan=scr&&[...scr.children].find(e=>e.classList&&(e.classList.contains('panel')||e.classList.contains('col')));
      if(pan){const a=p.getBoundingClientRect(),b=pan.getBoundingClientRect();if(a.width>0&&a.right>b.left+4&&a.left<b.right-4&&a.bottom>b.top&&a.top<b.bottom)scr.classList.add('ptsgap');}}
    document.querySelectorAll('.pbody').forEach(uiFade);
  }catch(e){}
}
