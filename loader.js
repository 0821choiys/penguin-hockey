
window.__loadThree=function(cb){
  var srcs=['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js','https://unpkg.com/three@0.128.0/build/three.min.js'],i=0,done=false;
  var sub=document.getElementById('loadSub'),slow=setTimeout(function(){if(sub)sub.textContent=__L('인터넷 연결이 느려요. 조금만 기다려 주세요…');},6000);
  function fin(ok){if(done)return;done=true;clearTimeout(slow);var l=document.getElementById('loading');if(l)l.style.display='none';cb(ok);}
  (function next(){
    if(done)return;if(window.THREE)return fin(true);
    if(i>=srcs.length)return fin(false);
    var el=document.createElement('script'),t=setTimeout(function(){el.onload=el.onerror=null;if(sub)sub.textContent=__L('다른 서버에서 다시 불러오는 중…');next();},15000);
    el.src=srcs[i++];el.onload=el.onerror=function(){clearTimeout(t);next();};document.head.appendChild(el);
  })();
};
