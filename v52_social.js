/* ================= v52: 👫 friends + 🤝 2:2 co-op online (owner, 2026-11-25) ================= */
// The owner picked: "online 2:2 co-op" + "friend records / ranking" + "friend code + list + gifts".
//  · Friends need a Google account (v35): the friend list follows the account to a new phone, and gifts cannot be farmed with
//    throw-away accounts (the database rules check the sign-in provider).
//  · Database (rules in firebase/database.rules.json):
//      users/{uid}   = {n: nickname, c: friend code, t: last seen (server time), st: {run, lv, fw, cw}}   readable by signed-in players
//      codes/{CODE}  = uid                                                                                  8 letters, claimed once
//      inbox/{uid}/fr/{f}   = since       (my friends; a friend may write mine only when accepting my request, or to remove)
//      inbox/{uid}/req/{f}  = {n, t}      (requests to me)
//      inbox/{uid}/inv/{f}  = {c, m, n, t}(a friend invites me to a room: m = vs | coop)
//      inbox/{uid}/gift/{f} = {t}         (a friend's daily gift: the rules allow one per friend per SOCD.gap)
//    The owner reads all of inbox/{uid} through one live stream.
//  · Co-op: the v31 room carries m = 'coop' and a difficulty; the host's device runs the match; both players are on blue (2 skaters,
//    no switching), red is an AI pair; the result counts toward the co-op wins on the ranking.
var SOCD={gift:30,maxDay:10,gap:72000000,maxFr:50,hb:60000,online:180000,invAge:600000,codeLen:8,oppPool:['basic','fast','strong','defense','balanced','humboldt']};
var SOC={st:'',msg:'',me:null,code:'',inbox:{fr:{},req:{},inv:{},gift:{}},users:{},es:null,hb:0,tab:'fr',rk:'run',busy:false,uT:0,mode:'vs',diff:'normal',shownInv:{},invFor:''};
function socS(){let o=save.social;if(!o||typeof o!=='object')o=save.social={};for(const k of['fw','fl','cw','cl','cn'])o[k]=o[k]|0;if(!o.claim||typeof o.claim!=='object')o.claim={};
  if(!o.sent||typeof o.sent!=='object')o.sent={};if(typeof o.cday!=='string')o.cday='';return o;}
function socOn(){return typeof accOn==='function'&&accOn()&&accSigned();}
function socName(){return String((save.profile&&save.profile.name)||__L('펭귄 감독')).slice(0,16);}
function socStats(){const c=typeof coach==='function'?coach():{lv:1},s=socS();return {run:(save.run&&save.run.best)|0,lv:c.lv|0,fw:s.fw,cw:s.cw};}
function socCodeGen(){let s='';const a=new Uint32Array(SOCD.codeLen);crypto.getRandomValues(a);for(const x of a)s+=NET_AB[x%NET_AB.length];return s;}
// ---- start / stop (signed in → my profile, my code, the inbox stream, a heartbeat) ----
async function socStart(){
  if(!socOn()||SOC.busy)return;SOC.busy=true;SOC.st='busy';socPaint();
  try{
    await fbToken();let me=await dbReq('GET','users/'+FB.uid);let code=me&&me.c;
    if(!code||!/^[A-Z2-9]{8}$/.test(code)){
      code='';for(let i=0;i<6&&!code;i++){const c=socCodeGen();try{await dbReq('PUT','codes/'+c,FB.uid);code=c;}catch(e){if(e.status!==401&&e.status!==403)throw e;}}
      if(!code)throw new Error('code');}
    SOC.code=code;await socPush(true);SOC.me={n:socName(),c:code};
    socListen();clearInterval(SOC.hb);SOC.hb=setInterval(()=>{if(document.visibilityState!=='hidden')socPush(false).catch(()=>{});},SOCD.hb);
    SOC.st='ok';SOC.msg='';
  }catch(e){SOC.st='err';SOC.msg=socErr(e);}
  SOC.busy=false;socPaint();
}
function socStop(){clearInterval(SOC.hb);SOC.hb=0;try{if(SOC.es)SOC.es.close();}catch(e){}SOC.es=null;SOC.code='';SOC.me=null;SOC.inbox={fr:{},req:{},inv:{},gift:{}};SOC.users={};SOC.st='';socPaint();}
async function socPush(full){if(!SOC.code)return;const o={t:{'.sv':'timestamp'},st:socStats(),n:socName()};if(full)o.c=SOC.code;await dbReq('PATCH','users/'+FB.uid,o);}
function socErr(e){const m=String(e&&e.message||e);
  if(m==='code')return __L('친구 코드를 만들지 못했어요. 잠시 후 다시 해 주세요');if(m==='nf')return __L('그 코드의 친구를 찾을 수 없어요');
  if(m==='self')return __L('내 코드예요');if(m==='full')return fmtL(__L('친구는 {n}명까지예요'),{n:SOCD.maxFr});if(m==='already')return __L('이미 친구예요');
  return __L('서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요');}
// the inbox as one live stream (reconnects with a fresh token when the stream is cancelled)
async function socListen(){
  try{if(SOC.es)SOC.es.close();}catch(e){}SOC.es=null;if(!socOn())return;
  try{SOC.es=await dbListen('inbox/'+FB.uid,(ev,path,data)=>{
    if(ev==='cancel'){setTimeout(()=>{if(socOn()&&SOC.code)socListen();},3000);return;}
    const P=String(path||'/').split('/').filter(Boolean),I=SOC.inbox,obj=x=>x&&typeof x==='object';
    if(!P.length){const d=data||{};if(ev==='put')SOC.inbox={fr:d.fr||{},req:d.req||{},inv:d.inv||{},gift:d.gift||{}};else for(const b of Object.keys(d))if(b in I)I[b]=d[b]||{};}
    else if(P[0] in I){const B=I[P[0]];
      if(P.length===1){if(ev==='put')I[P[0]]=data||{};else for(const k of Object.keys(data||{})){if(data[k]===null)delete B[k];else B[k]=data[k];}}
      else if(P.length===2){if(data===null)delete B[P[1]];else B[P[1]]=ev==='patch'&&obj(data)&&obj(B[P[1]])?Object.assign({},B[P[1]],data):data;}
      else{const c=B[P[1]]=Object.assign({},obj(B[P[1]])?B[P[1]]:{});if(data===null)delete c[P[2]];else c[P[2]]=data;}}
    socInvCheck();socPaint();});}catch(e){setTimeout(()=>{if(socOn()&&SOC.code)socListen();},5000);}
}
// friends' public cards (name, code, last seen, stats), refreshed at most every 30 s
async function socUsers(force){
  const ids=Object.keys(SOC.inbox.fr||{}).concat(Object.keys(SOC.inbox.req||{}),Object.keys(SOC.inbox.inv||{}));
  if(!force&&Date.now()-SOC.uT<30000&&ids.every(k=>SOC.users[k]))return;SOC.uT=Date.now();
  await Promise.all([...new Set(ids)].map(k=>dbReq('GET','users/'+k).then(u=>{SOC.users[k]=u||{n:'?'};}).catch(()=>{})));socPaint();}
// ---- adding, accepting, removing ----
async function socAdd(code){
  code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(!/^[A-Z2-9]{8}$/.test(code)){socMsg(__L('친구 코드는 8자리 영문·숫자예요'),true);return false;}
  try{
    if(code===SOC.code)throw new Error('self');
    const uid=await dbReq('GET','codes/'+code);if(!uid)throw new Error('nf');
    if(SOC.inbox.fr[uid])throw new Error('already');if(Object.keys(SOC.inbox.fr).length>=SOCD.maxFr)throw new Error('full');
    if(SOC.inbox.req[uid]){await socAccept(uid);return true;}   // they already asked me: that is a yes
    await dbReq('PUT','inbox/'+uid+'/req/'+FB.uid,{n:socName(),t:{'.sv':'timestamp'}});
    socMsg(__L('친구 신청을 보냈어요. 상대가 수락하면 친구가 돼요'));return true;
  }catch(e){socMsg(socErr(e),true);return false;}
}
async function socAccept(uid){
  try{if(Object.keys(SOC.inbox.fr).length>=SOCD.maxFr)throw new Error('full');
    await dbReq('PUT','inbox/'+FB.uid+'/fr/'+uid,{'.sv':'timestamp'});await dbReq('PUT','inbox/'+uid+'/fr/'+FB.uid,{'.sv':'timestamp'});
    await dbReq('DELETE','inbox/'+FB.uid+'/req/'+uid);SOC.inbox.fr[uid]=Date.now();delete SOC.inbox.req[uid];socMsg(__L('친구가 됐어요!'));socUsers(true);
  }catch(e){socMsg(socErr(e),true);}}
async function socDecline(uid){try{await dbReq('DELETE','inbox/'+FB.uid+'/req/'+uid);delete SOC.inbox.req[uid];socPaint();}catch(e){socMsg(socErr(e),true);}}
async function socRemove(uid){
  const n=escH((SOC.users[uid]&&SOC.users[uid].n)||'?');
  if(!await askConfirm(__L('친구를 삭제할까요?'),'<p>'+fmtL(__L('{n}님과 서로 친구 목록에서 지워져요.'),{n})+'</p>',__L('삭제')))return;
  try{await dbReq('DELETE','inbox/'+uid+'/fr/'+FB.uid).catch(()=>{});await dbReq('DELETE','inbox/'+FB.uid+'/fr/'+uid);delete SOC.inbox.fr[uid];socPaint();}catch(e){socMsg(socErr(e),true);}}
// ---- gifts: one per friend per SOCD.gap; claiming adds points (at most SOCD.maxDay a day) ----
function socGiftReady(uid){const t=+socS().sent[uid]||0;return Date.now()-t>=SOCD.gap;}
async function socGift(uid){
  if(!socGiftReady(uid))return false;
  try{await dbReq('PUT','inbox/'+uid+'/gift/'+FB.uid,{t:{'.sv':'timestamp'}});socS().sent[uid]=Date.now();persist();
    socMsg(fmtL(__L('{n}님에게 선물을 보냈어요 🎁'),{n:escH((SOC.users[uid]&&SOC.users[uid].n)||'?')}));socPaint();return true;}
  catch(e){if(e.status===401||e.status===403){socS().sent[uid]=Date.now();persist();socMsg(__L('오늘은 이미 선물을 보냈어요'),true);}else socMsg(socErr(e),true);socPaint();return false;}}
function socGiftsWaiting(){const s=socS(),g=SOC.inbox.gift||{};return Object.keys(g).filter(k=>g[k]&&(+g[k].t||0)>(+s.claim[k]||0));}
function socClaimLeft(){const s=socS();return s.cday===todayKey()?Math.max(0,SOCD.maxDay-s.cn):SOCD.maxDay;}
function socClaim(){const s=socS(),w=socGiftsWaiting();if(!w.length)return 0;if(s.cday!==todayKey()){s.cday=todayKey();s.cn=0;}
  let n=0;for(const k of w){if(s.cn>=SOCD.maxDay)break;s.claim[k]=+SOC.inbox.gift[k].t||Date.now();s.cn++;n++;}
  if(!n){socMsg(fmtL(__L('선물은 하루 {n}개까지 받을 수 있어요. 내일 다시 받아요'),{n:SOCD.maxDay}),true);return 0;}
  save.points+=n*SOCD.gift;persist();try{$('#ptsN').textContent=save.points;}catch(e){}try{SFX.coin&&SFX.coin();}catch(e){}
  socMsg(fmtL(__L('선물 {n}개를 받았어요 +{p}P'),{n,p:n*SOCD.gift}));socPaint();return n;}
// ---- invites: make a room (v31) and drop the code in the friend's inbox ----
async function socInvite(uid,m){
  SOC.tab='play';SOC.invFor=uid;await netHost(m,SOC.diff);
  if(!NET.code||NET.role!=='host')return false;
  try{await dbReq('PUT','inbox/'+uid+'/inv/'+FB.uid,{c:NET.code,m:NET.mode,n:socName(),t:{'.sv':'timestamp'}});frRender();return true;}catch(e){socMsg(socErr(e),true);return false;}}
function socInvCheck(){
  const inv=SOC.inbox.inv||{},now=Date.now();
  for(const k of Object.keys(inv)){const v=inv[k];if(!v||!v.c||SOC.shownInv[k+v.c])continue;if(v.t&&now-v.t>SOCD.invAge)continue;
    if(G.view==='game'||NET.st==='play')continue;SOC.shownInv[k+v.c]=1;socInvToast(k,v);}}
function socInvToast(uid,v){
  let el=$('#socInv');if(el)el.remove();el=document.createElement('div');el.id='socInv';
  const what=v.m==='coop'?__L('협동'):__L('대전');
  el.innerHTML='<span>'+(v.m==='coop'?'🤝 ':'⚔️ ')+fmtL(__L('{n}님이 {m}에 초대했어요'),{n:escH(String(v.n||'?').slice(0,16)),m:what})+'</span><button class="btn small primary" id="socInvGo">'+__L('참가')+'</button><button class="btn small ghost" id="socInvNo">'+__L('거절')+'</button>';
  document.body.appendChild(el);try{SFX.ui();}catch(e){}
  const drop=()=>{el.remove();dbReq('DELETE','inbox/'+FB.uid+'/inv/'+uid).catch(()=>{});delete SOC.inbox.inv[uid];};
  el.querySelector('#socInvGo').onclick=()=>{drop();SOC.tab='play';goScreen('sFriend');netJoin(v.c);};
  el.querySelector('#socInvNo').onclick=drop;setTimeout(()=>{try{el.remove();}catch(e){}},30000);}
// ---- results: friend-match wins for the ranking ----
function socResult(){const c=G.cfg;if(!c||c.mode!=='friend'||!G.mine)return;const a=G.mine.score,b=G.mine.opp.score,s=socS();
  if(c.coop){if(a>b)s.cw++;else if(a<b)s.cl++;}else{if(a>b)s.fw++;else if(a<b)s.fl++;}persist();if(SOC.code)socPush(false).catch(()=>{});}
// account deletion: everything of mine in the friend part goes too
async function socWipe(){
  if(!FB.uid)return;const me=FB.uid;let fr={};try{fr=await dbReq('GET','inbox/'+me+'/fr')||{};}catch(e){}
  for(const f of Object.keys(fr))await dbReq('DELETE','inbox/'+f+'/fr/'+me).catch(()=>{});
  let code=SOC.code;if(!code){try{const u=await dbReq('GET','users/'+me);code=u&&u.c;}catch(e){}}
  if(code)await dbReq('DELETE','codes/'+code).catch(()=>{});
  await dbReq('DELETE','inbox/'+me).catch(()=>{});await dbReq('DELETE','users/'+me).catch(()=>{});socStop();}
// ---- co-op match: the AI pair, both players' penguins, no switching ----
function socOpp(){const a=SOCD.oppPool.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,2);}
function socCoopCfg(peerTy,peerHat){const host=NET.role==='host',pt=(Array.isArray(peerTy)&&TYPES[peerTy[0]])?peerTy[0]:'basic',ph=typeof peerHat==='string'?peerHat:'none';
  const nm=NET.peer&&NET.peer.n?' · '+String(NET.peer.n).slice(0,16):'';
  return {mode:'friend',coop:true,size:2,time:NET_TIME,diff:NET.diff||'normal',tag:'🤝 '+__L('친구 협동')+nm,net:NET.role,netTeam:'blue',flat:true,
    myTypes:host?[save.type,pt]:[pt,save.type],myHats:host?[save.hat,ph]:[ph,save.hat],oppTypes:(NET.opp&&NET.opp.length?NET.opp:['basic','fast']).filter(k=>TYPES[k])};}
{const o=setupMatch;setupMatch=function(cfg){G.coop=!!(cfg&&cfg.coop&&cfg.net);try{document.body.classList.toggle('coop-mode',G.coop);}catch(e){}return o.apply(this,arguments);};}
// nobody changes penguin in co-op: the two skaters are the two players
{const o=setHuman;setHuman=function(p){if(G.coop&&p&&p.remote)return;return o.apply(this,arguments);};}
{const o=netSetRemote;netSetRemote=function(q){if(G.coop&&q&&NET.rp&&q!==NET.rp)return;return o.apply(this,arguments);};}
{const o=netSwapNearest;netSwapNearest=function(p){if(G.coop)return;return o.apply(this,arguments);};}
{const o=hkSwap;hkSwap=function(){if(G.coop)return;return o.apply(this,arguments);};}
{const o=hkAutoSwitch;hkAutoSwitch=function(){if(G.coop){G.pending=null;return;}return o.apply(this,arguments);};}
// co-op kits: blue wears the host's kit on both phones, the AI pair the standard red
{const o=kitSync;kitSync=function(cfg){if(!(cfg&&cfg.coop&&cfg.net))return o.apply(this,arguments);
  if(cfg.net==='host'){const pk=NET.peer&&NET.peer.kit;if(NET.peer)NET.peer.kit=null;try{return o.apply(this,arguments);}finally{if(NET.peer)NET.peer.kit=pk;}}
  const sk=save.kit;save.kit=Object.assign({},sk||{},{on:false});try{return o.apply(this,arguments);}finally{save.kit=sk;}};}
{const o=endMatch;endMatch=function(){const r=o.apply(this,arguments);try{socResult();}catch(e){}return r;};}
// ---- the 👫 screen: 친구 · 대전 · 랭킹 ----
function socMsg(m,err){SOC.msg=m;SOC.msgErr=!!err;socPaint();clearTimeout(SOC.msgT);SOC.msgT=setTimeout(()=>{SOC.msg='';socPaint();},5000);}
function socPaint(){if(G.ui==='sFriend')frRender();}
function socOnline(u){return !!(u&&u.t&&Date.now()-u.t<SOCD.online);}
function socAgo(t){if(!t)return '';const m=Math.max(0,Math.round((Date.now()-t)/60000));if(m<3)return __L('접속 중');if(m<60)return fmtL(__L('{n}분 전'),{n:m});const h=Math.round(m/60);if(h<48)return fmtL(__L('{n}시간 전'),{n:h});return fmtL(__L('{n}일 전'),{n:Math.round(h/24)});}
function socTabs(){const n=Object.keys(SOC.inbox.req||{}).length+socGiftsWaiting().length;
  return '<div class="seg soc-tabs">'+[['fr','👫 '+__L('친구')+(n?'<i class="soc-dotn">'+n+'</i>':'')],['play','⚔️ '+__L('대전 · 협동')],['rk','🏆 '+__L('랭킹')]].map(x=>'<button data-soct="'+x[0]+'" class="'+(SOC.tab===x[0]?'on':'')+'">'+x[1]+'</button>').join('')+'</div>';}
function socNeedLogin(){
  if(!accOn())return '<div class="fr-msg">'+__L('친구 대전 서버가 아직 연결되지 않았어요')+'</div><div class="fr-note">'+__L('곧 열릴 예정이에요!')+'</div>';
  return '<div class="soc-login"><b>'+__L('구글 계정으로 로그인하면 친구를 추가할 수 있어요')+'</b><span>'+__L('친구 목록은 계정에 저장돼서 휴대폰을 바꿔도 그대로예요')+'</span><button class="btn primary" id="socLogin">☁️ '+__L('로그인')+'</button></div>';}
function socFrHtml(){
  if(!socOn())return socNeedLogin();
  if(!SOC.code){if(!SOC.busy&&SOC.st!=='err')setTimeout(socStart,0);return SOC.st==='err'?'<div class="fr-err">'+escH(SOC.msg)+'</div><button class="btn small" id="socRetry">'+__L('다시 시도')+'</button>':'<div class="fr-wait"><i class="fr-dot"></i>'+__L('불러오는 중…')+'</div>';}
  socUsers(false);
  const U=SOC.users,fr=Object.keys(SOC.inbox.fr||{}),req=Object.keys(SOC.inbox.req||{}),gw=socGiftsWaiting();
  let h='<div class="soc-me"><div><small>'+__L('내 친구 코드')+'</small><b id="socMyCode">'+SOC.code+'</b></div><button class="btn small" id="socCopy">📋 '+__L('복사')+'</button></div>'
    +'<div class="fr-join soc-add"><input id="socCode" maxlength="8" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD2345" aria-label="'+__L('친구 코드')+'"><button class="btn primary" id="socAddB">'+__L('친구 추가')+'</button></div>';
  if(SOC.msg)h+='<div class="'+(SOC.msgErr?'fr-err':'soc-ok')+'">'+SOC.msg+'</div>';
  if(gw.length)h+='<button class="btn primary soc-gifts" id="socClaim">🎁 '+fmtL(__L('선물 {n}개 받기 (+{p}P)'),{n:Math.min(gw.length,socClaimLeft()),p:Math.min(gw.length,socClaimLeft())*SOCD.gift})+'</button>';
  if(req.length)h+='<div class="lbl">'+__L('친구 신청')+'</div>'+req.map(k=>{const r=SOC.inbox.req[k]||{};return '<div class="soc-row"><span class="soc-n">'+escH(String(r.n||'?').slice(0,16))+'</span><button class="btn small primary" data-soca="'+k+'">'+__L('수락')+'</button><button class="btn small ghost" data-socd="'+k+'">'+__L('거절')+'</button></div>';}).join('');
  h+='<div class="lbl">'+fmtL(__L('친구 ({a}/{b})'),{a:fr.length,b:SOCD.maxFr})+'</div>';
  if(!fr.length)h+='<div class="fr-note">'+__L('내 코드를 알려 주거나 친구의 코드를 입력해 보세요')+'</div>';
  const ord=fr.slice().sort((a,b)=>(socOnline(U[b])-socOnline(U[a]))||((U[b]&&U[b].t||0)-(U[a]&&U[a].t||0)));
  h+=ord.map(k=>{const u=U[k]||{},on=socOnline(u),g=socGiftReady(k);
    return '<div class="soc-row'+(on?' on':'')+'"><i class="soc-st"></i><span class="soc-n">'+escH(String(u.n||'…').slice(0,16))+'<small>'+(u.t?socAgo(u.t):'')+'</small></span>'
      +'<button class="btn small soc-ic" data-socg="'+k+'"'+(g?'':' disabled')+' aria-label="'+__L('선물')+'">🎁</button>'
      +'<button class="btn small soc-ic" data-socv="'+k+'" aria-label="'+__L('대전')+'">⚔️</button><button class="btn small soc-ic primary" data-socc="'+k+'" aria-label="'+__L('협동')+'">🤝</button>'
      +'<button class="btn small soc-ic ghost" data-socx="'+k+'" aria-label="'+__L('삭제')+'">✕</button></div>';}).join('');
  h+='<div class="fr-note">'+fmtL(__L('선물은 친구마다 하루 1번 · 받으면 {p}P (하루 {n}개까지) · 포인트만 오가요'),{p:SOCD.gift,n:SOCD.maxDay})+'</div>';
  return h;}
function socRkHtml(){
  if(!socOn())return socNeedLogin();if(!SOC.code){if(!SOC.busy)setTimeout(socStart,0);return '<div class="fr-wait"><i class="fr-dot"></i>'+__L('불러오는 중…')+'</div>';}
  socUsers(false);
  const M=[['run',__L('원정 최고'),v=>v?fmtL(__L('{n}단계'),{n:v}):'-'],['lv',__L('감독 레벨'),v=>'Lv.'+(v||1)],['fw',__L('친구 대전 승'),v=>fmtL(__L('{n}승'),{n:v||0})],['cw',__L('협동 승'),v=>fmtL(__L('{n}승'),{n:v||0})]];
  const m=M.find(x=>x[0]===SOC.rk)||M[0];
  const rows=[{k:FB.uid,n:socName(),st:socStats(),me:true}].concat(Object.keys(SOC.inbox.fr||{}).map(k=>({k,n:(SOC.users[k]&&SOC.users[k].n)||'…',st:(SOC.users[k]&&SOC.users[k].st)||{}})));
  rows.sort((a,b)=>((+b.st[m[0]]||0)-(+a.st[m[0]]||0))||(a.me?-1:b.me?1:0));
  let h='<div class="seg soc-rkm">'+M.map(x=>'<button data-socr="'+x[0]+'" class="'+(x[0]===m[0]?'on':'')+'">'+x[1]+'</button>').join('')+'</div><div class="soc-rk">';
  let rank=0,prev=null;rows.forEach((r,i)=>{const v=+r.st[m[0]]||0;if(v!==prev){rank=i+1;prev=v;}
    h+='<div class="soc-rkr'+(r.me?' me':'')+'"><b class="soc-rkn">'+(rank<=3?['🥇','🥈','🥉'][rank-1]:rank)+'</b><span class="soc-n">'+escH(String(r.n).slice(0,16))+(r.me?' <small>('+__L('나')+')</small>':'')+'</span><b>'+m[2](v)+'</b></div>';});
  h+='</div>';if(rows.length<2)h+='<div class="fr-note">'+__L('친구를 추가하면 여기서 기록을 비교할 수 있어요')+'</div>';
  return h;}
// the 대전 · 협동 tab: pick 1:1 or 2:2 (+ the AI difficulty) before making a room
function socPlayPick(){return '<div class="seg soc-mode"><button data-socm="vs" class="'+(SOC.mode==='vs'?'on':'')+'">⚔️ '+__L('1:1 대전')+'</button><button data-socm="coop" class="'+(SOC.mode==='coop'?'on':'')+'">🤝 '+__L('2:2 협동')+'</button></div>'
  +(SOC.mode==='coop'?'<div class="seg soc-diff">'+[['easy',__L('쉬움')],['normal',__L('보통')],['hard',__L('어려움')]].map(x=>'<button data-socdf="'+x[0]+'" class="'+(SOC.diff===x[0]?'on':'')+'">'+x[1]+'</button>').join('')+'</div>'
    +'<div class="fr-note">'+fmtL(__L('친구와 같은 팀 · 각자 펭귄 1마리 · AI 팀과 {m}분 경기 · 협동 승리는 랭킹에 기록돼요'),{m:NET_TIME/60})+'</div>':'');}
{const o=frRender;frRender=function(){
  const el=document.getElementById('frBody');if(!el)return;
  const busy=NET.st!=='idle'&&NET.st!=='err'&&NET.st!=='done';if(busy)SOC.tab='play';
  if(!SOC.picked&&!socOn()&&SOC.tab==='fr')SOC.tab='play';   // signed out: open on the room code as before (the 친구 tab offers the sign-in)
  if(SOC.tab==='play'){o.apply(this,arguments);if(!busy&&fbOn())el.insertAdjacentHTML('afterbegin',socPlayPick());
    if(busy&&NET.st==='wait'&&SOC.invFor&&SOC.users[SOC.invFor])el.insertAdjacentHTML('beforeend','<div class="fr-note">'+fmtL(__L('{n}님에게 초대를 보냈어요'),{n:escH(String(SOC.users[SOC.invFor].n||'?').slice(0,16))})+'</div>');
    // 방 만들기 = the chosen mode
    const hb=document.getElementById('frHost');if(hb){hb.innerHTML=(SOC.mode==='coop'?'🤝 ':'🏠 ')+__L('방 만들기');hb.onclick=()=>{try{SFX.ui();}catch(e){}SOC.invFor='';netHost(SOC.mode,SOC.diff);};}
    if(!busy){const n=el.querySelector('.fr-note:not(.soc-keep)');if(n&&SOC.mode==='coop'&&n.previousElementSibling&&n.previousElementSibling.classList.contains('fr-join'))n.remove();}
  }else el.innerHTML=SOC.tab==='rk'?socRkHtml():socFrHtml();
  el.insertAdjacentHTML('afterbegin',socTabs());socWire(el);};}
function socWire(el){
  const on=(sel,f)=>el.querySelectorAll(sel).forEach(b=>{b.onclick=()=>{try{SFX.ui();}catch(e){}f(b);};});
  on('[data-soct]',b=>{SOC.tab=b.dataset.soct;SOC.picked=1;SOC.msg='';frRender();});
  on('[data-socm]',b=>{SOC.mode=b.dataset.socm;frRender();});on('[data-socdf]',b=>{SOC.diff=b.dataset.socdf;frRender();});
  on('[data-socr]',b=>{SOC.rk=b.dataset.socr;frRender();});
  on('#socLogin',()=>accOpen());on('#socRetry',()=>{SOC.st='';socStart();});
  on('#socCopy',()=>{const c=SOC.code;try{(navigator.clipboard?navigator.clipboard.writeText(c):Promise.reject()).then(()=>flashMsg(__L('코드를 복사했어요')),()=>flashMsg(c));}catch(e){flashMsg(c);}});
  on('#socAddB',()=>{const i=document.getElementById('socCode');socAdd(i&&i.value);});
  on('#socClaim',()=>socClaim());
  on('[data-soca]',b=>socAccept(b.dataset.soca));on('[data-socd]',b=>socDecline(b.dataset.socd));
  on('[data-socg]',b=>socGift(b.dataset.socg));on('[data-socx]',b=>socRemove(b.dataset.socx));
  on('[data-socv]',b=>socInvite(b.dataset.socv,'vs'));on('[data-socc]',b=>socInvite(b.dataset.socc,'coop'));
  const inp=document.getElementById('socCode');
  if(inp){inp.addEventListener('input',()=>{const v=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);if(v!==inp.value)inp.value=v;});
    inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')socAdd(inp.value);});}}
// sign-in / sign-out / deletion follow the account
{const o=accSignOut;accSignOut=function(){socStop();return o.apply(this,arguments);};}
function socInit(){if(socOn())setTimeout(()=>{socStart();},window.__NOFX?0:4000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&SOC.code)socPush(false).catch(()=>{});});}
