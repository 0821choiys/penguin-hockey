/* ===== v16 i18n bootstrap: language pick, translator, stored-name normaliser, static markup ===== */
(function(){
'use strict';
var D=/*I18N_DATA*/null;
var SUP=['ko','en','zh','ja'],SAVE_KEY='penguinHockey.v1',LANG_KEY='penguinHockey.lang';
var HTML_LANG={ko:'ko',en:'en',zh:'zh-CN',ja:'ja'};
function ok(l){return SUP.indexOf(l)>=0;}
// URL ?lang= > chosen language > language stored in the save > (existing save: Korean | new player: browser language, else English)
function pick(){
  var l=null,had=false;
  try{var m=/[?&]lang=([a-z]{2})(?=&|#|$)/.exec(location.search||'');if(m&&ok(m[1]))l=m[1];}catch(e){}
  if(!l)try{var a=localStorage.getItem(LANG_KEY);if(ok(a))l=a;}catch(e){}
  if(!l)try{var b=sessionStorage.getItem(LANG_KEY);if(ok(b))l=b;}catch(e){}
  if(!l)try{var raw=localStorage.getItem(SAVE_KEY);if(raw){had=true;var sv=JSON.parse(raw);if(sv&&sv.set&&ok(sv.set.lang))l=sv.set.lang;}}catch(e){}
  if(!l&&!had)try{
    var ns=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language];
    for(var i=0;i<ns.length&&!l;i++){var c=String(ns[i]||'').toLowerCase().slice(0,2);if(ok(c))l=c;}
    if(!l&&ns[0])l='en';
  }catch(e){}
  return l||'ko';
}
var LANG=pick(),LI=SUP.indexOf(LANG);
var M=null;
if(LANG!=='ko'&&D){M=new Map();var arr=D.T[LANG];for(var i=0;i<D.K.length;i++)if(arr[i]!=null)M.set(D.K[i],arr[i]);}
function L(k,c){
  if(M===null)return k;
  var v;if(c!==undefined){v=M.get(c+'\u0001'+k);if(v!==undefined)return v;}
  v=M.get(k);return v===undefined?k:v;
}
// stored names: exact matches (cities, default club/coach) and generated names (opponents, match labels) in any language
var FM=new Map(),PM=new Map(),PS=[];
if(D){
  D.F.forEach(function(r){for(var j=0;j<r.length;j++)if(r[j])FM.set(r[j],r[LI]);});
  D.P.forEach(function(r){for(var j=0;j<r.length;j++)if(r[j]&&!PM.has(r[j]))PM.set(r[j],r[LI]);});
  PS=Array.from(PM.keys()).sort(function(a,b){return b.length-a.length;});
}
function full(s){if(typeof s!=='string')return s;var v=FM.get(s);return v===undefined?s:v;}
function norm(s){
  if(typeof s!=='string'||!s||!PS.length)return s;
  var o='',i=0,n=s.length;
  outer:while(i<n){for(var j=0;j<PS.length;j++){var p=PS[j];if(s.startsWith(p,i)){o+=PM.get(p);i+=p.length;continue outer;}}o+=s[i];i++;}
  return o;
}
function set(l){
  if(!ok(l))return;
  var kept=false;
  try{localStorage.setItem(LANG_KEY,l);kept=localStorage.getItem(LANG_KEY)===l;}catch(e){}
  if(!kept)try{sessionStorage.setItem(LANG_KEY,l);kept=sessionStorage.getItem(LANG_KEY)===l;}catch(e){}
  try{
    var u=new URL(location.href);u.searchParams.delete('lang');if(!kept)u.searchParams.set('lang',l);
    if(u.href!==location.href){location.replace(u.href);return;}
  }catch(e){}
  try{location.reload();}catch(e){}
}
// fonts: English leads with Fredoka; Chinese/Japanese get a CJK face after Jua (Jua has no Han/Kana glyphs)
var CJK=LANG==='ja'?"'M PLUS Rounded 1c','Hiragino Maru Gothic ProN','Hiragino Sans','Yu Gothic','Meiryo'":LANG==='zh'?"'Noto Sans SC','PingFang SC','Hiragino Sans GB','Microsoft YaHei'":'';
function fixFonts(){
  if(LANG==='ko')return;
  var walk=function(rules){
    for(var i=0;i<rules.length;i++){
      var r=rules[i];
      if(r.cssRules&&!r.style){walk(r.cssRules);continue;}
      var st=r.style;if(!st||!st.fontFamily||!/Jua|Fredoka/.test(st.fontFamily)||st.fontFamily.indexOf('M PLUS')>=0||st.fontFamily.indexOf('Noto Sans SC')>=0||r.__i18n)continue;
      var f=st.fontFamily;
      if(LANG==='en')f=f.replace(/"?'?Jua'?"?\s*,\s*"?'?Fredoka'?"?/,'Fredoka, Jua');
      else if(/Jua/.test(f))f=f.replace(/("?'?Jua'?"?)/,'$1, '+CJK);
      else f=f.replace(/\s*,?\s*(system-ui|sans-serif)\s*$/,'')+', '+CJK+', sans-serif';
      st.fontFamily=f;try{r.__i18n=1;}catch(e){}
    }
  };
  try{for(var s=0;s<document.styleSheets.length;s++){var rs=null;try{rs=document.styleSheets[s].cssRules;}catch(e){}if(rs)walk(rs);}}catch(e){}
}
function done(){try{document.documentElement.classList.remove('i18n-wait');}catch(e){}}
// static markup (end of <body>): rich blocks as a whole, then text nodes and labels
function dom(){
  if(LANG==='ko'||!D){done();return;}
  try{
    var SM=new Map(),st=D.ST[LANG];D.SK.forEach(function(k,i){if(st[i]!=null)SM.set(k,st[i]);});
    D.B.forEach(function(b){var els=document.querySelectorAll(b[0]),el=els[b[1]],h=b[LI+1];if(el&&h!=null)el.innerHTML=h;});
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null),n,list=[];
    while((n=w.nextNode())){var p=n.parentNode&&n.parentNode.nodeName;if(p!=='SCRIPT'&&p!=='STYLE')list.push(n);}
    list.forEach(function(n){var m=/^(\s*)([\s\S]*?)(\s*)$/.exec(n.nodeValue);if(!m||!m[2])return;var v=SM.get(m[2]);if(v!==undefined)n.nodeValue=m[1]+v+m[3];});
    ['aria-label','placeholder','title','alt'].forEach(function(a){var els=document.querySelectorAll('['+a+']');for(var i=0;i<els.length;i++){var v=SM.get(els[i].getAttribute(a));if(v!==undefined)els[i].setAttribute(a,v);}});
    fixFonts();
  }catch(e){try{console.warn('i18n',e);}catch(_){}}
  done();
}
window.__L=L;
window.I18N={lang:LANG,loc:{ko:'ko',en:'en',zh:'zh-CN',ja:'ja'}[LANG],langs:SUP.slice(),set:set,full:full,norm:norm,dom:dom,L:L};
try{
  var de=document.documentElement;de.lang=HTML_LANG[LANG];
  if(LANG!=='ko'){
    de.classList.add('i18n-wait');setTimeout(done,2500);
    if(LANG==='ja'||LANG==='zh'){
      var lk=document.createElement('link');lk.rel='stylesheet';lk.media='print';lk.onload=function(){this.media='all';};
      lk.href=LANG==='ja'?'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800&display=swap':'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@500;700;900&display=swap';
      document.head.appendChild(lk);
    }
    fixFonts();
  }
}catch(e){}
})();
