/* ================= v42: 📄 privacy policy + account deletion links in the app (2026-11-13) ================= */
// Play requires the privacy policy to be reachable from inside an app that signs players in. The pages live on GitHub
// Pages (docs/ in the repo); Korean players get the Korean page, everyone else the English one. In the Android app every
// link that leaves the game opens in the phone's browser (MainActivity.shouldOverrideUrlLoading).
var LEGAL={base:'https://0821choiys.github.io/penguin-hockey/',mail:'choiys6421@gmail.com'};
function legalUrl(kind){const ko=(save.set&&save.set.lang||'ko')==='ko';return LEGAL.base+(kind==='del'?'delete-account':'privacy')+(ko?'':'-en')+'.html';}
function legalLinks(){
  return '<a class="btn small legal-a" href="'+legalUrl('pp')+'" target="_blank" rel="noopener">'+__L('개인정보처리방침')+'</a>'
    +'<a class="btn small legal-a" href="'+legalUrl('del')+'" target="_blank" rel="noopener">'+__L('계정 삭제 안내')+'</a>';
}
function legalRow(){
  const el=$('#setList');if(!el)return;let r=$('#legalRow');
  if(!r){r=document.createElement('div');r.id='legalRow';r.className='setrow legal-set';}
  el.appendChild(r);   // always the last row, under the account row
  r.innerHTML='<div>📄 '+__L('개인정보 · 계정 삭제')+'</div><div class="legal-btns">'+legalLinks()+'</div>';
  for(const a of r.querySelectorAll('a'))a.addEventListener('click',()=>{try{SFX.init();SFX.ui();}catch(e){}});
}
// the account window ends with the privacy policy link (that is where players sign in and delete their account)
{const _accBody=accBody;accBody=function(){return _accBody()+'<div class="acc-legal"><a href="'+legalUrl('pp')+'" target="_blank" rel="noopener">'+__L('개인정보처리방침')+'</a> · <a href="'+legalUrl('del')+'" target="_blank" rel="noopener">'+__L('계정 삭제 안내')+'</a></div>';};}
