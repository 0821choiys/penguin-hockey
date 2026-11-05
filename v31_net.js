/* ================= v31: 👥 friend code 1v1 (online) ================= */
// Two players on two devices. The host makes a 6-letter code, the friend types it in.
//  · Firebase only signals: Auth REST (anonymous, or the Google account from v35) + Realtime Database REST / SSE.
//  · The match goes peer to peer over a WebRTC data channel (STUN only). When the two networks cannot see each other
//    (no TURN server), it falls back to relaying through the database: slower (≈10 updates/s) but still playable.
//  · The host's device runs the match. The friend's device sends its stick and buttons (button presses as counters, so
//    a lost packet never loses a press) and shows the host's snapshots, interpolated ~110 ms behind (~260 ms relayed).
//  · 3 vs 3, 2 minutes, each player steers one penguin (auto switching as usual) with AI team-mates. No items, events,
//    conditions, rules calls, skill cinematics or enhancement levels; both goalies the same type; not rated.
const NET_V=1,NET_TIME=120,NET_AB='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const NET_BTN=['shootPress','shootRel','pass','dash','special','swap'];
const NETCFG=(typeof window!=='undefined'&&window.PH_NETCFG)||/*NETCFG*/null;

// ---------- Firebase: auth (shared with the v35 account) and the realtime database ----------
const FB={tok:'',uid:'',exp:0,ref:'',prov:'',email:'',name:'',busy:null};
const FB_KEY='penguinHockey.auth';
function fbOn(){return !!(NETCFG&&NETCFG.apiKey&&NETCFG.dbUrl);}
function fbLoad(){
  if(FB.ref)return;
  try{const j=JSON.parse(localStorage.getItem(FB_KEY)||'null');if(j&&j.ref){FB.ref=j.ref;FB.uid=j.uid||'';FB.prov=j.prov||'anon';FB.email=j.email||'';FB.name=j.name||'';}}catch(e){}
}
function fbKeep(){try{if(FB.ref)localStorage.setItem(FB_KEY,JSON.stringify({uid:FB.uid,ref:FB.ref,prov:FB.prov,email:FB.email,name:FB.name}));else localStorage.removeItem(FB_KEY);}catch(e){}}
async function fbJson(url,opt){
  const r=await fetch(url,opt);let j=null;try{j=await r.json();}catch(e){}
  if(!r.ok){const m=(j&&j.error&&(j.error.message||j.error))||('HTTP '+r.status);const er=new Error(String(m));er.status=r.status;throw er;}
  return j;
}
function fbA(path){return (NETCFG.authBase||'https://identitytoolkit.googleapis.com/v1')+'/'+path+'?key='+encodeURIComponent(NETCFG.apiKey);}
function fbSet(j,prov){
  FB.tok=j.idToken||j.id_token||'';FB.uid=j.localId||j.user_id||FB.uid;FB.ref=j.refreshToken||j.refresh_token||FB.ref;
  FB.exp=Date.now()+(Math.max(120,+(j.expiresIn||j.expires_in||3600))-60)*1000;if(prov)FB.prov=prov;fbKeep();
}
async function fbToken(){
  if(!fbOn())throw new Error('nocfg');
  if(FB.tok&&Date.now()<FB.exp)return FB.tok;
  if(FB.busy)return FB.busy;
  FB.busy=(async()=>{
    fbLoad();
    if(FB.ref){
      try{const j=await fbJson((NETCFG.tokenBase||'https://securetoken.googleapis.com/v1')+'/token?key='+encodeURIComponent(NETCFG.apiKey),
        {method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(FB.ref)});fbSet(j);return FB.tok;}
      catch(e){if(e.status!==400)throw e;FB.ref='';FB.uid='';FB.prov='';FB.email='';FB.name='';}   // the account is gone: start over anonymously
    }
    const j=await fbJson(fbA('accounts:signUp'),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({returnSecureToken:true})});
    FB.email='';FB.name='';fbSet(j,'anon');return FB.tok;
  })();
  try{return await FB.busy;}finally{FB.busy=null;}
}
function dbU(path,tok){return NETCFG.dbUrl.replace(/\/+$/,'')+'/'+path+'.json?auth='+encodeURIComponent(tok)+(NETCFG.ns?'&ns='+encodeURIComponent(NETCFG.ns):'');}
async function dbReq(method,path,body){
  const t=await fbToken();
  return fbJson(dbU(path,t),{method,headers:body===undefined?undefined:{'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
}
async function dbListen(path,cb){
  const t=await fbToken(),es=new EventSource(dbU(path,t));
  const h=e=>{try{const d=JSON.parse(e.data);if(d)cb(e.type,d.path,d.data);}catch(x){}};
  es.addEventListener('put',h);es.addEventListener('patch',h);
  es.addEventListener('cancel',()=>cb('cancel'));es.addEventListener('auth_revoked',()=>cb('cancel'));
  return es;
}

// ---------- connection ----------
const NET={st:'idle',role:'',code:'',msg:'',pc:null,rel:null,un:null,es:null,relay:false,peer:null,lastRx:0,lastTx:0,
  rin:{x:0,z:0,ax:0,az:0,sh:0,c:[0,0,0,0,0,0]},vin:{},rseen:[0,0,0,0,0,0],cnt:[0,0,0,0,0,0],snaps:[],off:null,timer:null,
  rp:null,swCd:0,seen:{},rt:{},rbusy:{},pkSp:0,gen:0,applied:0};
function netInfo(){
  const mt=['balanced','defense','fast','basic'];
  return {v:NET_V,ty:[0,1,2].map(i=>i===0?save.type:(save.squad[i-1]||mt[(i-1)%mt.length])),n:String((save.profile&&save.profile.name)||'').slice(0,16)};
}
function netCodeGen(){let s='';const a=new Uint32Array(6);crypto.getRandomValues(a);for(const x of a)s+=NET_AB[x%NET_AB.length];return s;}
function netSet(st,msg){NET.st=st;NET.msg=msg||'';if(G.ui==='sFriend')frRender();}
function netReset(){
  netShut(false);
  Object.assign(NET,{st:'idle',role:'',code:'',msg:'',relay:false,peer:null,lastRx:0,lastTx:0,rin:{x:0,z:0,ax:0,az:0,sh:0,c:[0,0,0,0,0,0]},vin:{},
    rseen:[0,0,0,0,0,0],cnt:[0,0,0,0,0,0],snaps:[],off:null,rp:null,swCd:0,seen:{},rt:{},rbusy:{},pkSp:0,applied:0});
  NET.gen++;
}
function netShut(del){
  clearTimeout(NET.timer);
  try{if(NET.es)NET.es.close();}catch(e){}
  try{if(NET.rel)NET.rel.close();}catch(e){}try{if(NET.un)NET.un.close();}catch(e){}try{if(NET.pc)NET.pc.close();}catch(e){}
  if(del&&NET.role==='host'&&NET.code)dbReq('DELETE','rooms/'+NET.code).catch(()=>{});
  NET.es=NET.rel=NET.un=NET.pc=null;
}
function netClose(){if(NET.st==='idle'&&!NET.code)return;const was=NET.st;if(was==='play'||was==='wait'||was==='conn'||was==='making')netSendRel({k:'bye'});netShut(true);NET.st='idle';NET.code='';NET.msg='';if(G.ui==='sFriend')frRender();}
function netErrMsg(e){
  const m=String(e&&e.message||e);
  if(m==='nocfg')return __L('친구 대전 서버가 아직 연결되지 않았어요');
  if(m==='nf')return __L('그 코드의 방을 찾을 수 없어요. 코드를 다시 확인해 주세요');
  if(m==='full')return __L('이미 다른 친구가 들어간 방이에요');
  if(m==='ver')return __L('게임 버전이 서로 달라요. 둘 다 최신 버전으로 업데이트해 주세요');
  if(m==='self')return __L('내가 만든 방에는 같은 기기로 들어갈 수 없어요');
  if(m==='code')return __L('방 코드를 만들지 못했어요. 잠시 후 다시 해 주세요');
  if(m==='gone')return __L('방이 닫혔어요');
  if(m==='timeout')return __L('친구와 연결하지 못했어요. 잠시 후 다시 해 주세요');
  return __L('서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요');
}
function netFail(e){netShut(NET.role==='host');netSet('err',netErrMsg(e));}

async function netHost(){
  netReset();NET.role='host';const gen=NET.gen;netSet('making',__L('방을 만드는 중…'));
  try{
    await fbToken();let code='';
    for(let i=0;i<6&&!code;i++){const c=netCodeGen(),r=await dbReq('GET','rooms/'+c);if(!r||!r.t||r.t<Date.now()-3600000)code=c;}
    if(!code)throw new Error('code');
    await dbReq('PUT','rooms/'+code,{host:FB.uid,t:{'.sv':'timestamp'},v:NET_V,hi:netInfo()});
    if(gen!==NET.gen)return;
    NET.code=code;netSet('wait');
    NET.es=await dbListen('rooms/'+code,(ev,path,data)=>{if(gen===NET.gen)netDb(ev,path,data);});
  }catch(e){if(gen===NET.gen)netFail(e);}
}
async function netJoin(code){
  code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(!/^[A-Z2-9]{6}$/.test(code)){netSet('err',__L('코드는 6자리 영문·숫자예요'));return;}
  netReset();NET.role='guest';NET.code=code;const gen=NET.gen;netSet('conn',__L('방을 찾는 중…'));
  try{
    await fbToken();const r=await dbReq('GET','rooms/'+code);
    if(!r||!r.host||!r.t||r.t<Date.now()-3600000)throw new Error('nf');
    if(r.host===FB.uid)throw new Error('self');
    if(r.guest&&r.guest!==FB.uid)throw new Error('full');
    if(r.v!==NET_V)throw new Error('ver');
    NET.peer=r.hi||null;
    await dbReq('PUT','rooms/'+code+'/guest',FB.uid);await dbReq('PUT','rooms/'+code+'/guestInfo',netInfo());
    if(gen!==NET.gen)return;
    netSet('conn',__L('친구와 연결하는 중…'));
    NET.es=await dbListen('rooms/'+code,(ev,path,data)=>{if(gen===NET.gen)netDb(ev,path,data);});
    NET.timer=setTimeout(()=>{if(gen===NET.gen&&NET.st==='conn')netFail(new Error('timeout'));},30000);
  }catch(e){if(gen===NET.gen)netFail(e);}
}
// database stream: a put / patch at the room root or below one top-level key
function netDb(ev,path,data){
  if(ev==='cancel')return;
  const parts=String(path||'/').split('/').filter(Boolean);
  if(!parts.length){
    if(data===null&&ev==='put'){if(NET.st!=='play')netFail(new Error('gone'));return;}
    for(const k of Object.keys(data||{}))netDbKey(k,data[k],null);
    return;
  }
  netDbKey(parts[0],data,parts.length>1?parts.slice(1):null);
}
function netDbKey(k,v,sub){
  const host=NET.role==='host';
  if(host&&k==='guestInfo'&&v&&!NET.pc&&NET.st==='wait'){
    if(v.v!==NET_V)return;
    NET.peer=v;netSet('conn',__L('친구가 들어왔어요! 연결하는 중…'));
    if(NETCFG.forceRelay){netRelayOn();return;}   // tests: behave as if no peer-to-peer path exists
    netOffer().catch(e=>netFail(e));return;
  }
  if(host&&k==='answer'&&v&&v.sdp&&NET.pc&&!NET.pc.remoteDescription){NET.pc.setRemoteDescription({type:'answer',sdp:v.sdp}).catch(()=>{});return;}
  if(!host&&k==='offer'&&v&&v.sdp&&!NET.pc){netAnswer(v.sdp).catch(e=>netFail(e));return;}
  // relayed messages (used when the data channel cannot open); receiving one means the other side relays: relay back
  if(!host&&k==='hs'&&v&&!sub){NET.relay=true;netOnMsg(Object.assign({},v,{k:'s'}));return;}
  if(host&&k==='gi'&&v&&!sub){NET.relay=true;netOnMsg(Object.assign({},v,{k:'i'}));return;}
  if((!host&&k==='he')||(host&&k==='ge')){NET.relay=true;
    if(sub){const id=sub[0];if(sub.length===1&&v&&!NET.seen[id]){NET.seen[id]=1;netOnMsg(v);}}
    else if(v)for(const id of Object.keys(v).sort())if(!NET.seen[id]){NET.seen[id]=1;netOnMsg(v[id]);}
  }
}
function netPC(){
  const ice=NETCFG.ice!==undefined?NETCFG.ice:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}];
  const pc=new RTCPeerConnection({iceServers:ice});NET.pc=pc;
  pc.onconnectionstatechange=()=>{if((pc.connectionState==='failed'||pc.connectionState==='disconnected')&&NET.pc===pc)netRelayOn();};
  return pc;
}
function netIce(pc,ms){return new Promise(res=>{if(pc.iceGatheringState==='complete')return res();const t=setTimeout(res,ms);
  pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);res();}});});}
function netChan(ch){
  ch.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(x){return;}netOnMsg(m);};
  ch.onopen=()=>{if(netOpen()&&NET.st==='conn'){clearTimeout(NET.timer);netReady();}};
}
function netOpen(){return !!(NET.rel&&NET.rel.readyState==='open');}
function netUnOpen(){return !!(NET.un&&NET.un.readyState==='open');}
async function netOffer(){
  const gen=NET.gen,pc=netPC();
  NET.rel=pc.createDataChannel('r',{ordered:true});NET.un=pc.createDataChannel('u',{ordered:false,maxRetransmits:0});netChan(NET.rel);netChan(NET.un);
  await pc.setLocalDescription(await pc.createOffer());await netIce(pc,2500);
  if(gen!==NET.gen)return;
  await dbReq('PUT','rooms/'+NET.code+'/offer',{sdp:pc.localDescription.sdp});
  NET.timer=setTimeout(()=>{if(gen===NET.gen&&!netOpen())netRelayOn();},12000);
}
async function netAnswer(sdp){
  const gen=NET.gen,pc=netPC();
  pc.ondatachannel=e=>{const ch=e.channel;if(ch.label==='r')NET.rel=ch;else NET.un=ch;netChan(ch);};
  await pc.setRemoteDescription({type:'offer',sdp});await pc.setLocalDescription(await pc.createAnswer());await netIce(pc,2500);
  if(gen!==NET.gen)return;
  await dbReq('PUT','rooms/'+NET.code+'/answer',{sdp:pc.localDescription.sdp});
  clearTimeout(NET.timer);NET.timer=setTimeout(()=>{if(gen===NET.gen&&!netOpen())netRelayOn();},12000);
}
// no peer-to-peer path: relay through the database
function netRelayOn(){
  if(NET.relay)return;NET.relay=true;clearTimeout(NET.timer);
  if(NET.st==='conn')netReady();
}
function netReady(){
  NET.lastRx=performance.now();
  if(NET.role==='host'){netSendRel({k:'start',ty:netInfo().ty,n:netInfo().n});netBegin(NET.peer.ty);}
  else{netSet('conn',__L('경기를 준비하는 중…'));clearTimeout(NET.timer);NET.timer=setTimeout(()=>{if(NET.st==='conn')netFail(new Error('timeout'));},15000);}
}
function netSendU(m){
  const s=JSON.stringify(m);
  if(netUnOpen()){try{NET.un.send(s);return;}catch(e){}}
  if(netOpen()){try{NET.rel.send(s);return;}catch(e){}}
  if(!NET.relay)return;
  const key=m.k==='s'?'hs':'gi',now=performance.now();if(now-(NET.rt[key]||0)<100||NET.rbusy[key])return;
  NET.rt[key]=now;NET.rbusy[key]=true;const o=Object.assign({},m);delete o.k;o.q=Math.round(now);   // the database only notifies on a change: always change
  dbReq('PUT','rooms/'+NET.code+'/'+key,o).catch(()=>{}).finally(()=>{NET.rbusy[key]=false;});
}
function netSendRel(m){
  if(netOpen()){try{NET.rel.send(JSON.stringify(m));return;}catch(e){}}
  if(!NET.code)return;
  if(NET.relay||m.k==='bye')dbReq('POST','rooms/'+NET.code+'/'+(NET.role==='host'?'he':'ge'),m).catch(()=>{});
}
function netOnMsg(m){
  if(!m||!m.k)return;NET.lastRx=performance.now();
  const host=NET.role==='host';
  if(m.k==='start'&&!host){if(NET.st!=='play'){clearTimeout(NET.timer);if(m.n&&NET.peer)NET.peer.n=m.n;netBegin(m.ty);}return;}
  if(m.k==='i'&&host){NET.rin=m;return;}
  if(m.k==='s'&&!host){
    if(m.ht<=NET.applied)return;   // older than what is on screen
    const o=NET.lastRx-m.ht;NET.off=NET.off===null?o:Math.min(o,NET.off+.5);
    const S=NET.snaps;let i=S.length;while(i>0&&S[i-1].ht>m.ht)i--;if(!(i>0&&S[i-1].ht===m.ht))S.splice(i,0,m);if(S.length>48)S.shift();
    return;
  }
  if(m.k==='e'&&!host){netGuestEv(m);return;}
  if(m.k==='bye'){netPeerLeft();return;}
}

// ---------- the match ----------
function netBegin(peerTy){
  const host=NET.role==='host',mt=['balanced','defense','fast','basic'];
  const ty=Array.isArray(peerTy)?peerTy.slice(0,3).map((k,i)=>TYPES[k]?k:mt[i]):['basic','fast','strong'];
  NET.st='play';NET.snaps=[];NET.off=null;NET.applied=0;NET.rseen=[0,0,0,0,0,0];NET.cnt=[0,0,0,0,0,0];NET.rin={x:0,z:0,ax:0,az:0,sh:0,c:[0,0,0,0,0,0]};NET.vin={};
  NET.lastRx=performance.now();NET.lastTx=0;
  const nm=NET.peer&&NET.peer.n?' vs '+NET.peer.n:'';
  startMatch({mode:'friend',size:3,time:NET_TIME,diff:'normal',tag:'👥 '+__L('친구 대전')+nm,net:NET.role,netTeam:host?'blue':'red',flat:true,oppTypes:ty});
  if(host){const r=G.teams.red.skaters[0];if(r)netSetRemote(r);}
}
function netSetRemote(q){if(NET.rp)NET.rp.remote=false;NET.rp=q||null;if(q){q.remote=true;q.charging=false;q.charge=0;}}
function remoteControl(p,dt){
  const R=NET.rin,v=NET.vin;v.x=clamp(+R.x||0,-1,1);v.z=clamp(+R.z||0,-1,1);v.shoot=!!R.sh;
  const c=Array.isArray(R.c)?R.c:[];
  for(let i=0;i<6;i++){const n=c[i]|0;if(n>NET.rseen[i]){NET.rseen[i]=n;v[NET_BTN[i]]=true;}}
  p.raim=(R.ax||R.az)?[+R.ax,+R.az]:null;
  humanControl(p,dt,v);
}
function netAutoSwitch(dt){
  const tm=G.teams.red,cur=NET.rp;if(!tm||!cur||G.so||G.ps)return;
  if(G.carry&&G.carry.team===tm&&G.carry!==cur&&!G.carry.goalie){netSetRemote(G.carry);NET.swCd=.6;return;}
  NET.swCd-=dt;if(NET.swCd>0)return;
  const pk=G.puck,dc=Math.hypot(pk.x-cur.x,pk.z-cur.z);if(dc<5&&cur.fall<=0)return;
  let best=null,bd=1e9;for(const s of tm.skaters){if(s===cur||s.fall>0||s.frozen)continue;const d=Math.hypot(pk.x-s.x,pk.z-s.z);if(d<bd){bd=d;best=s;}}
  if(best&&dc-bd>3.5){netSetRemote(best);NET.swCd=1;}
}
function netSwapNearest(p){
  const tm=p.team,pk=G.puck;let best=null,bd=1e9;
  for(const s of tm.skaters){if(s===p||s.fall>0||s.frozen)continue;const d=Math.hypot(pk.x-s.x,pk.z-s.z);if(d<bd){bd=d;best=s;}}
  if(best){netSetRemote(best);NET.swCd=.8;}
}
const netR2=x=>Math.round((+x||0)*100)/100;
function netSnap(){
  const P=G.pengs.map(p=>[netR2(p.x),netR2(p.z),netR2(p.vx),netR2(p.vz),netR2(p.heading),p.pose||'play',netR2(p.fall),p.charging?netR2(p.charge):-1,
    (p.boxed?1:0)|(p.frozen?2:0)|(p.dashT>0?4:0)|(p.slideT>0?8:0)|(p.diveT>0?16:0),netR2(p.cd.special),netR2(p.specMax)]);
  const pk=G.puck;
  return {k:'s',ht:Math.round(performance.now()),st:G.state,sT:netR2(G.stateT),tl:netR2(G.timeLeft),ot:G.ot?1:0,ol:netR2(G.otLeft),
    sc:[G.teams.blue.score,G.teams.red.score],rp:NET.rp?G.pengs.indexOf(NET.rp):-1,cr:G.carry?G.pengs.indexOf(G.carry):-1,
    pk:[netR2(pk.x),netR2(pk.z),netR2(pk.vx),netR2(pk.vz)],P};
}
function netEv(e,o){if(G.net!=='host'||NET.st!=='play')return;netSendRel(Object.assign({k:'e',e},o||{}));}
// the friend's device: show the host's world
function netGuestApply(){
  const S=NET.snaps;if(!S.length)return;
  const tgt=performance.now()-(NET.off||0)-(NET.relay&&!netUnOpen()?260:110);
  let a=S[0],b=S[0];
  for(let i=S.length-1;i>=0;i--)if(S[i].ht<=tgt){a=S[i];b=S[i+1]||S[i];break;}
  const f=b===a?0:clamp((tgt-a.ht)/((b.ht-a.ht)||1),0,1);NET.applied=Math.max(NET.applied,a.ht-1);
  while(S.length>3&&S[1].ht<tgt-400)S.shift();
  for(let i=0;i<G.pengs.length;i++){
    const p=G.pengs[i],A=a.P[i],B=b.P[i];if(!A||!B)continue;
    const x=A[0]+(B[0]-A[0])*f,z=A[1]+(B[1]-A[1])*f;p.x=p.ox=p.rx=x;p.z=p.oz=p.rz=z;p.vx=B[2];p.vz=B[3];
    p.heading=A[4]+angDiff(A[4],B[4])*f;p.pose=B[5];p.fall=B[6];p.charging=B[7]>=0;p.charge=Math.max(0,B[7]);
    const fl=B[8];p.boxed=!!(fl&1);p.frozen=!!(fl&2);p.dashT=fl&4?.2:0;p.slideT=fl&8?.2:0;p.diveT=fl&16?.2:0;p.cd.special=B[9];p.specMax=B[10];
  }
  const pk=G.puck;pk.x=pk.ox=pk.rx=a.pk[0]+(b.pk[0]-a.pk[0])*f;pk.z=pk.oz=pk.rz=a.pk[1]+(b.pk[1]-a.pk[1])*f;pk.vx=b.pk[2];pk.vz=b.pk[3];
  const sp=Math.hypot(pk.vx,pk.vz);if(sp>NET.pkSp+11&&sp>14)SFX.shot(Math.min(1,sp/40));NET.pkSp=sp;
  G.carry=b.cr>=0?G.pengs[b.cr]||null:null;G.alpha=1;
  const L=S[S.length-1];   // clock, score and state from the newest snapshot
  G.timeLeft=L.tl;G.ot=!!L.ot;G.otLeft=L.ol;
  if(G.teams.blue.score!==L.sc[0]||G.teams.red.score!==L.sc[1]){G.teams.blue.score=L.sc[0];G.teams.red.score=L.sc[1];updateScoreHud();}
  if(L.rp>=0&&G.pengs[L.rp]&&G.player!==G.pengs[L.rp])setHuman(G.pengs[L.rp]);
  if(L.st==='over'){if(!G.result)endMatch();}
  else if(G.state!=='over'){
    if(L.st==='ready'&&G.state!=='ready'){G.state='ready';G.countN=4;}
    if(L.st==='play'&&G.state==='ready'){G.state='play';$('#count').textContent='GO!';SFX.beep(true);SFX.whistle();setTimeout(()=>{const c=$('#count');if(c.textContent==='GO!')c.textContent='';},700);}
    else G.state=L.st;
    G.stateT=L.sT;
  }
}
function netGuestEv(m){
  if(G.net!=='guest')return;
  if(m.e==='g'){   // goal
    const tm=G.teams[m.t];if(!tm)return;
    if(Array.isArray(m.s)){G.teams.blue.score=m.s[0];G.teams.red.score=m.s[1];updateScoreHud();}
    for(const p of G.pengs){p.pose=p.team===tm?'cheer':'sad';p.cheerKind=(Math.random()*3)|0;}
    try{hypeGoal(tm,null);}catch(e){}
    const gx=tm.dir*W;for(let i=0;i<60;i++){const c=[[1,.9,.3],[.4,.8,1],[1,.5,.7],[.6,1,.7]][i%4];emit(gx,rnd(1,3),rnd(-GW,GW),rnd(-6,6),rnd(3,9),rnd(-6,6),rnd(1,1.8),rnd(.25,.5),c[0],c[1],c[2]);}
  }else if(m.e==='c'){   // a skill
    const p=G.pengs[m.i];if(!p)return;p.specMax=m.w?2:9;try{castStart(p);}catch(e){}SFX.whoosh();
  }
}
function netGuestInput(now){
  for(let i=0;i<6;i++){const k=NET_BTN[i];if(input[k]){input[k]=false;NET.cnt[i]++;NET.lastTx=0;}}
  const iv=NET.relay&&!netUnOpen()?100:45;if(now-NET.lastTx<iv)return;NET.lastTx=now;
  let ax=0,az=0;const p=G.player;
  if(p&&!IS_TOUCH&&G.mouse.active&&now-G.mouse.t<3000){const dx=G.mouse.wx-p.x,dz=G.mouse.wz-p.z,l=Math.hypot(dx,dz);if(l>1.1){ax=netR2(dx/l);az=netR2(dz/l);}}
  netSendU({k:'i',x:netR2(input.x),z:netR2(input.z),ax,az,sh:input.shoot?1:0,c:NET.cnt.slice()});
}
function netFrame(){
  if(!G.net||G.view!=='game'||NET.st!=='play')return;
  const now=performance.now();
  if(now-NET.lastRx>8000){netLost();return;}
  if(G.net==='host'){const iv=NET.relay&&!netUnOpen()?100:50;if(now-NET.lastTx>=iv){NET.lastTx=now;netSendU(netSnap());}}
  else netGuestInput(now);
}
function netPeerLeft(){
  if(NET.st!=='play'){if(NET.st==='wait'||NET.st==='conn')netFail(new Error('gone'));return;}
  NET.st='done';
  if(G.view==='game'&&G.state!=='over'&&!G.result)endMatch();
  showBanner(__L('친구가 대전을 떠났어요'),2600,'g');
  netShut(true);
}
function netLost(){
  NET.st='done';
  if(G.view==='game'&&G.state!=='over'&&!G.result)endMatch();
  showBanner(__L('연결이 끊겼어요'),2600,'g');
  netShut(true);
}
async function netLeaveAsk(){
  const ok=await askConfirm(__L('친구 대전을 나갈까요?'),'<p>'+__L('나가면 이 경기는 지금 점수로 끝나요.')+'</p>',__L('나가기'));
  if(!ok)return;
  netSendRel({k:'bye'});NET.st='done';netShut(NET.role==='host');G.net='';toMenu();
}

// ---------- the 친구 대전 screen ----------
function frRender(){
  const el=document.getElementById('frBody');if(!el)return;let h='';
  if(!fbOn())h='<div class="fr-msg">'+__L('친구 대전 서버가 아직 연결되지 않았어요')+'</div><div class="fr-note">'+__L('곧 열릴 예정이에요!')+'</div>';
  else if(NET.st==='idle'||NET.st==='err'||NET.st==='done'){
    h=(NET.st==='err'?'<div class="fr-err">'+escH(NET.msg)+'</div>':'')
      +'<button class="btn primary fr-big" id="frHost">🏠 '+__L('방 만들기')+'</button>'
      +'<div class="fr-or">'+__L('또는 친구의 코드 입력')+'</div>'
      +'<div class="fr-join"><input id="frCode" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABC234" aria-label="'+__L('친구 코드')+'">'
      +'<button class="btn primary" id="frJoin">'+__L('참가')+'</button></div>'
      +'<div class="fr-note">'+fmtL('3대3 · {m}분 · 각자 펭귄 1마리를 조종하고 나머지는 AI 팀원 · 아이템·강화 없이 같은 조건 · 티어 점수에는 반영되지 않아요',{m:NET_TIME/60})+'</div>';
  }else if(NET.st==='wait'){
    h='<div class="fr-lbl">'+__L('친구에게 이 코드를 알려 주세요')+'</div><div class="fr-code" id="frCodeShow">'+NET.code+'</div>'
      +'<button class="btn small" id="frCopy">📋 '+__L('코드 복사')+'</button><div class="fr-wait"><i class="fr-dot"></i>'+__L('친구를 기다리는 중…')+'</div>'
      +'<button class="btn small" id="frCancel">'+__L('취소')+'</button>';
  }else h='<div class="fr-wait"><i class="fr-dot"></i>'+escH(NET.msg||__L('연결하는 중…'))+'</div><button class="btn small" id="frCancel">'+__L('취소')+'</button>';
  el.innerHTML=h;
  const on=(id,f)=>{const b=document.getElementById(id);if(b)b.onclick=()=>{SFX.ui();f();};};
  on('frHost',()=>netHost());
  on('frJoin',()=>netJoin(document.getElementById('frCode').value));
  on('frCancel',()=>{netClose();netSet('idle');});
  on('frCopy',()=>{const c=NET.code;try{(navigator.clipboard?navigator.clipboard.writeText(c):Promise.reject()).then(()=>flashMsg(__L('코드를 복사했어요')),()=>flashMsg(c));}catch(e){flashMsg(c);}});
  const inp=document.getElementById('frCode');
  if(inp){inp.addEventListener('input',()=>{const v=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);if(v!==inp.value)inp.value=v;});
    inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')netJoin(inp.value);});}
}
