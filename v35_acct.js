/* ================= v35: ☁️ Google account + cloud save ================= */
// Sign in with Google → Firebase Auth (REST accounts:signInWithIdp). The anonymous account the friend match made is
// linked to Google when possible, so the uid stays the same. The save then lives in the Realtime Database at
// saves/{uid} = {data: the save as JSON text, t: upload time, p: points, g: matches} (only that user can read or write it).
//  · Google ID token: in the Android app from Credential Manager (native op 'gsignin'), in a browser from Google
//    Identity Services (the official "Sign in with Google" button, loaded only when the account window opens).
//  · Upload: after changes (at most every 30 s), when the page is hidden, and right after signing in when the cloud is empty.
//  · Another device uploaded since this one last synced → the player chooses which progress to keep (nothing is
//    overwritten silently). Loading a cloud save replaces this device's save and restarts the game.
//  · Sign out keeps this device's save. Delete account removes the cloud save and the Firebase account (Play policy).
const ACC={st:'',msg:'',cloud:null,dirty:false,upT:0,busy:false,gisP:null,choice:null};
const ACC_META='penguinHockey.cloud';
function accOn(){return fbOn()&&!!NETCFG.webClientId;}
function accSigned(){try{fbLoad();}catch(e){}return FB.prov==='google'&&!!FB.ref;}
function accHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36)+':'+s.length;}
function accMeta(){try{return JSON.parse(localStorage.getItem(ACC_META)||'null')||{t:0,h:''};}catch(e){return {t:0,h:''};}}
function accMetaSet(m){try{if(m)localStorage.setItem(ACC_META,JSON.stringify(m));else localStorage.removeItem(ACC_META);}catch(e){}}
function accLocal(){try{return localStorage.getItem('penguinHockey.v1')||JSON.stringify(save);}catch(e){return JSON.stringify(save);}}
function accSum(data){   // what the choice cards show: points, matches, penguins, date
  let s=null;try{s=JSON.parse(data);}catch(e){}
  if(!s||typeof s!=='object')return {p:0,g:0,n:0};
  return {p:Math.max(0,s.points|0),g:Math.max(0,(s.stats&&s.stats.played)|0),n:Array.isArray(s.types)?s.types.length:0};
}
function accErr(e){
  const m=String(e&&e.message||e);
  if(m==='nocfg')return __L('로그인 서버가 아직 연결되지 않았어요');
  if(/cancel/i.test(m)||e&&e.name==='Cancel')return __L('로그인을 취소했어요');
  if(/CREDENTIAL_TOO_OLD|TOKEN_EXPIRED|requires-recent-login/i.test(m))return __L('보안을 위해 한 번 더 로그인해 주세요');
  if(/gis|script/i.test(m))return __L('Google 로그인을 불러오지 못했어요. 인터넷 연결을 확인해 주세요');
  return __L('서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요');
}
function accSet(st,msg){ACC.st=st;ACC.msg=msg||'';accRender();}

// ---------- the Google ID token ----------
function accGis(){   // Google Identity Services, browser only
  if(ACC.gisP)return ACC.gisP;
  ACC.gisP=new Promise((res,rej)=>{
    if(window.google&&google.accounts&&google.accounts.id){res(google.accounts.id);return;}
    const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;
    s.onload=()=>window.google&&google.accounts&&google.accounts.id?res(google.accounts.id):rej(new Error('gis'));
    s.onerror=()=>{ACC.gisP=null;rej(new Error('gis'));};document.head.appendChild(s);
  });
  return ACC.gisP;
}
async function accGisButton(el){
  const id=await accGis();
  id.initialize({client_id:NETCFG.webClientId,callback:r=>{if(r&&r.credential)accWithIdToken(r.credential,'web');},ux_mode:'popup',auto_select:false,cancel_on_tap_outside:true,
    use_fedcm_for_prompt:true,locale:({ko:'ko',en:'en',zh:'zh_CN',ja:'ja'})[I18N.lang]||'ko'});
  el.innerHTML='';id.renderButton(el,{type:'standard',theme:'filled_blue',size:'large',shape:'pill',text:'signin_with',width:Math.min(300,Math.max(200,el.clientWidth||260))});
}
async function accAppSignIn(){   // Android: Credential Manager in the app
  accSet('busy',__L('Google 계정으로 로그인하는 중…'));
  try{const r=await appCall('gsignin',{cid:NETCFG.webClientId});if(!r||!r.idToken)throw new Error('cancel');await accWithIdToken(r.idToken,'app');}
  catch(e){accSet('err',accErr(e));}
}

// ---------- Firebase sign-in with that token ----------
async function accWithIdToken(idt,src){
  accSet('busy',__L('Google 계정으로 로그인하는 중…'));
  try{
    const reqUri=(location.origin&&/^https?:/.test(location.origin))?location.origin:'http://localhost';
    const base={postBody:'id_token='+encodeURIComponent(idt)+'&providerId=google.com',requestUri:reqUri,returnSecureToken:true,returnIdpCredential:true};
    let anon='';try{if(FB.prov!=='google')anon=await fbToken();}catch(e){}
    let j=null;
    if(anon){try{j=await fbJson(fbA('accounts:signInWithIdp'),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({idToken:anon},base))});}
      catch(e){if(!/FEDERATED_USER_ID_ALREADY_LINKED|EMAIL_EXISTS|INVALID_ID_TOKEN|USER_NOT_FOUND|CREDENTIAL_TOO_OLD/.test(e.message))throw e;j=null;}}
    if(!j||j.errorMessage)j=await fbJson(fbA('accounts:signInWithIdp'),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(base)});   // this Google account already has its own uid
    if(j.errorMessage)throw new Error(j.errorMessage);
    if(FB.uid&&j.localId&&FB.uid!==j.localId)accMetaSet(null);   // another account: no shared sync history
    FB.email=j.email||'';FB.name=j.displayName||j.fullName||j.firstName||'';fbSet(j,'google');
    await accSync(true);
  }catch(e){accSet('err',accErr(e));}
}

// ---------- the cloud copy ----------
async function accUpload(force){
  if(!accSigned()||ACC.busy)return false;
  const data=accLocal(),h=accHash(data),m=accMeta();
  if(!force&&m.h===h){ACC.dirty=false;return true;}
  ACC.busy=true;
  try{
    const ct=await dbReq('GET','saves/'+FB.uid+'/t');
    if(ct&&+ct>(m.t||0)&&!force){ACC.busy=false;await accSync(false);return false;}   // another device saved since: let the player choose
    const t=Math.max(Date.now(),(+ct||0)+1),s=accSum(data);
    await dbReq('PUT','saves/'+FB.uid,{data,t,p:s.p,g:s.g});
    accMetaSet({t,h});ACC.dirty=false;ACC.upT=Date.now();
    if(G.ui==='sSet'||$('#accDlg.on'))accRender();
    return true;
  }catch(e){ACC.dirty=true;return false;}
  finally{ACC.busy=false;}
}
// compare the cloud with this device. login=true right after signing in.
async function accSync(login){
  if(!accSigned())return 'off';
  accSet('busy',__L('클라우드 저장을 확인하는 중…'));
  let c=null;try{c=await dbReq('GET','saves/'+FB.uid);}catch(e){accSet('err',accErr(e));return 'err';}
  const data=accLocal(),h=accHash(data),m=accMeta();
  if(!c||typeof c.data!=='string'){await accUpload(true);accSet('ok',__L('이 기기의 진행을 클라우드에 저장했어요'));return 'up';}
  const ch=accHash(c.data);
  if(ch===h){accMetaSet({t:+c.t||Date.now(),h});accSet('ok',__L('클라우드와 같은 진행이에요'));return 'same';}
  if(!login&&+c.t<=(m.t||0)){await accUpload(true);accSet('ok','');return 'up';}            // only this device changed
  if(!login&&m.h===h){accSet('choose','');ACC.choice={c,auto:true};accOpen();return 'choose';}  // only the cloud changed
  ACC.choice={c,auto:false};accSet('choose','');accOpen();return 'choose';
}
function accUseCloud(){
  const c=ACC.choice&&ACC.choice.c;if(!c)return;
  window.__phHold=true;   // the old in-memory save must not be written back before the restart
  try{localStorage.setItem('penguinHockey.v1',c.data);accMetaSet({t:+c.t||Date.now(),h:accHash(c.data)});}catch(e){window.__phHold=false;accSet('err',accErr(e));return;}
  try{if(window.__phMirror)appMirror(true);}catch(e){}
  ACC.choice=null;accSet('busy',__L('클라우드 진행을 불러왔어요. 다시 시작해요…'));
  setTimeout(()=>{try{location.reload();}catch(e){}},window.__NOFX?0:700);
}
async function accUseLocal(){ACC.choice=null;accSet('busy','');const ok=await accUpload(true);accSet(ok?'ok':'err',ok?__L('이 기기의 진행을 클라우드에 저장했어요'):__L('서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요'));}
function accSignOut(){
  FB.tok='';FB.ref='';FB.uid='';FB.prov='';FB.email='';FB.name='';fbKeep();accMetaSet(null);ACC.choice=null;ACC.dirty=false;
  if(APP.on)appPost({op:'gsignout'});
  accSet('ok',__L('로그아웃했어요. 이 기기의 진행은 그대로 있어요'));
}
async function accDelete(){
  const ok=await askConfirm(__L('계정을 삭제할까요?'),'<p>'+__L('클라우드에 저장된 진행과 로그인 정보가 지워지고 되돌릴 수 없어요. 이 기기의 진행은 남아요.')+'</p>',__L('삭제'));
  if(!ok)return;
  accSet('busy',__L('계정을 삭제하는 중…'));
  try{
    await dbReq('DELETE','saves/'+FB.uid);
    const t=await fbToken();await fbJson(fbA('accounts:delete'),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idToken:t})});
    accSignOut();accSet('ok',__L('계정과 클라우드 저장을 삭제했어요'));
  }catch(e){accSet('err',accErr(e));}
}
// persist() → mark dirty; upload a little later (several saves in a row become one upload)
function accDirty(){
  if(!accSigned())return;ACC.dirty=true;clearTimeout(accDirty.t);
  const wait=Math.max(4000,30000-(Date.now()-ACC.upT));accDirty.t=setTimeout(()=>{if(ACC.dirty)accUpload(false);},wait);
}

// ---------- UI: a row in 설정 and the account window ----------
function accRowHtml(){
  const on=accSigned();
  return '<div>☁️ '+__L('계정 · 클라우드 저장')+'</div><div class="acc-row"><span class="acc-who">'+(on?escH(FB.email||FB.name||'Google'):__L('로그인 안 함'))+'</span>'
    +'<button class="btn small'+(on?'':' primary')+'" id="accOpenB">'+(on?__L('관리'):__L('Google 로그인'))+'</button></div>';
}
function accRow(){
  const el=$('#setList');if(!el)return;let r=$('#accRow');
  if(!r){r=document.createElement('div');r.id='accRow';r.className='setrow acc-set';el.appendChild(r);}
  r.innerHTML=accRowHtml();const b=$('#accOpenB');if(b)b.onclick=()=>{SFX.init();SFX.ui();accOpen();};
}
function accDate(t){try{return new Date(+t).toLocaleString(I18N.loc||'ko',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});}catch(e){return '';}}
function accCard(kind,sum,t){
  return '<div class="acc-pick" data-acc="'+kind+'"><b>'+(kind==='local'?'📱 '+__L('이 기기'):'☁️ '+__L('클라우드'))+'</b>'
    +'<span>⭐ '+sum.p+'P</span><span>'+fmtL('{n}경기',{n:sum.g})+' · '+fmtL('펭귄 {n}종',{n:sum.n})+'</span>'+(t?'<small>'+accDate(t)+'</small>':'')+'</div>';
}
function accBody(){
  if(!accOn())return '<h3>☁️ '+__L('계정 · 클라우드 저장')+'</h3><div class="acc-msg">'+__L('로그인 서버가 아직 연결되지 않았어요')+'</div><div class="acc-note">'+__L('지금은 이 기기에만 저장돼요.')+'</div>';
  const on=accSigned();let h='<h3>☁️ '+__L('계정 · 클라우드 저장')+'</h3>';
  if(ACC.st==='choose'&&ACC.choice){
    const c=ACC.choice.c,l=accLocal();
    h+='<div class="acc-q">'+(ACC.choice.auto?__L('다른 기기에서 저장한 새 진행이 있어요. 어느 진행으로 할까요?'):__L('이 기기와 클라우드의 진행이 달라요. 어느 진행으로 할까요?'))+'</div>'
      +'<div class="acc-picks">'+accCard('local',accSum(l),0)+accCard('cloud',accSum(c.data),c.t)+'</div>'
      +'<div class="acc-note">'+__L('고르지 않은 쪽의 진행은 지워져요. 클라우드를 고르면 게임이 다시 시작돼요.')+'</div>';
    return h;
  }
  if(ACC.st==='busy')return h+'<div class="acc-msg"><i class="fr-dot"></i>'+escH(ACC.msg)+'</div>';
  if(ACC.st==='err')h+='<div class="acc-err">'+escH(ACC.msg)+'</div>';
  else if(ACC.msg)h+='<div class="acc-ok">'+escH(ACC.msg)+'</div>';
  if(!on){
    h+='<div class="acc-note">'+__L('Google 계정으로 로그인하면 진행이 클라우드에 저장돼요. 휴대폰을 바꾸거나 다른 기기에서도 이어서 할 수 있어요.')+'</div>';
    h+=APP.on?'<div class="row"><button class="btn primary" data-acc="app">'+__L('Google 계정으로 로그인')+'</button></div>':'<div id="accGis" class="acc-gis"></div>';
    h+='<div class="acc-note small">'+__L('저장하는 것: 게임 진행(포인트·펭귄·기록)과 Google 계정의 이메일 주소. 광고나 다른 용도로 쓰지 않아요.')+'</div>';
  }else{
    const m=accMeta();
    h+='<div class="acc-who2">'+escH(FB.name||'')+(FB.name&&FB.email?' · ':'')+escH(FB.email||'')+'</div>'
      +'<div class="acc-note">'+(m.t?fmtL('마지막 클라우드 저장: {d}',{d:accDate(m.t)}):__L('아직 클라우드에 저장하지 않았어요'))+'</div>'
      +'<div class="row acc-btns"><button class="btn primary" data-acc="up">⬆ '+__L('지금 저장')+'</button><button class="btn" data-acc="sync">🔄 '+__L('클라우드 확인')+'</button></div>'
      +'<div class="row acc-btns"><button class="btn small" data-acc="out">'+__L('로그아웃')+'</button><button class="btn small acc-del" data-acc="del">'+__L('계정 삭제')+'</button></div>';
  }
  return h;
}
function accRender(){
  try{if(G.ui==='sSet')accRow();}catch(e){}
  const d=$('#accDlg');if(!d||!d.classList.contains('on'))return;
  d.querySelector('.cd-body').innerHTML=accBody();
  const g=$('#accGis');if(g&&accOn()&&!APP.on)accGisButton(g).catch(e=>{const gg=$('#accGis');if(gg)gg.innerHTML='<div class="acc-err">'+escH(accErr(e))+'</div>';});
}
function accOpen(){
  let d=$('#accDlg');
  if(!d){d=document.createElement('div');d.id='accDlg';d.className='cdlg';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
    d.innerHTML='<div class="cd-box acc-box"><button class="cd-x" aria-label="'+__L('닫기')+'">✕</button><div class="cd-body"></div></div>';document.body.appendChild(d);
    d.addEventListener('click',e=>{
      if(e.target===d||e.target.closest('.cd-x')){if(ACC.st==='choose')return;SFX.ui();d.classList.remove('on');if(ACC.st!=='busy'){ACC.st='';ACC.msg='';}accRender();return;}
      const b=e.target.closest('[data-acc]');if(!b)return;const k=b.dataset.acc;SFX.ui();
      if(k==='app')accAppSignIn();else if(k==='up'){accSet('busy',__L('저장하는 중…'));accUpload(false).then(ok=>{if(ACC.st!=='choose')accSet(ok?'ok':'err',ok?__L('클라우드에 저장했어요'):__L('서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요'));});}
      else if(k==='sync')accSync(false);else if(k==='out')accSignOut();else if(k==='del')accDelete();
      else if(k==='cloud')accUseCloud();else if(k==='local')accUseLocal();
    });}
  d.classList.add('on');accRender();
}
function accInit(){
  window.__phCloud=accDirty;
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&ACC.dirty)accUpload(false);});
  if(accOn()&&accSigned())setTimeout(()=>{accSync(false).then(r=>{if(r!=='choose'){ACC.st='';ACC.msg='';}});},window.__NOFX?0:2500);   // another device may have saved meanwhile
}
