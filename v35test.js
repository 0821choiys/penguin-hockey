// v35: account + cloud save logic against the Firebase emulators (auth :9099, database :9000).
// Without the emulators running only the offline checks run and the rest is reported as SKIPPED (not passed).
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const NS='demo-ph-default-rtdb';
global.PH_NETCFG={apiKey:'fake-key',dbUrl:'http://127.0.0.1:9000',ns:NS,authBase:'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1',
  tokenBase:'http://127.0.0.1:9099/securetoken.googleapis.com/v1',webClientId:'test.apps.googleusercontent.com'};
const PH=require('./harness.js');const {save}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const owner=async(method,p,body)=>{const r=await fetch(PH_NETCFG.dbUrl+'/'+p+'.json?ns='+NS,{method,headers:{Authorization:'Bearer owner','content-type':'application/json'},body:body&&JSON.stringify(body)});return r.json();};
(async()=>{
  // ---- offline ----
  ok(PH.accOn()&&!PH.accSigned(),'configured, not signed in');
  const s0=PH.accSum(JSON.stringify({points:321,stats:{played:7},types:['a','b']}));ok(s0.p===321&&s0.g===7&&s0.n===2,'choice card numbers come from the save (321P · 7 matches · 2 penguins)');
  ok(PH.accSum('garbage').p===0,'unreadable save → zeros, no crash');
  ok(PH.accHash('abc')===PH.accHash('abc')&&PH.accHash('abc')!==PH.accHash('abd'),'save fingerprint');
  {const r=require('child_process').spawnSync(process.execPath,['-e',"const PH=require('./harness.js');console.log('@@'+PH.accOn()+'|'+PH.accBody());process.exit(0)"],{cwd:__dirname,encoding:'utf8'});
   ok(/@@false\|.*(로그인 서버가 아직 연결되지 않았어요)/.test(r.stdout||''),'build without Firebase config: the account window says the server is not connected');}
  let up=false;try{const r=await fetch('http://127.0.0.1:9099/');up=r.ok;}catch(e){}
  if(!up){console.log('SKIPPED (not passed): online checks — Firebase emulators are not running');finish();return;}
  // ---- sign in (the emulator accepts an unsigned JSON ID token) ----
  const em='u'+Date.now()+'@example.com',idt=JSON.stringify({sub:'s'+Date.now(),email:em,email_verified:true,name:'Unit'});
  save.points=4321;save.stats.played=12;PH.persist();
  await PH.fbToken();const anon=PH.FB.uid;
  await PH.accWithIdToken(idt,'test');
  ok(PH.accSigned()&&PH.FB.uid===anon&&PH.FB.email===em,'Google sign-in links the anonymous account (same uid), email kept');
  let c=await owner('GET','saves/'+anon);
  ok(c&&c.p===4321&&c.g===12&&JSON.parse(c.data).points===4321,'empty cloud → uploaded right after signing in');
  // ---- changes upload ----
  save.points=5000;PH.persist();ok(PH.ACC.dirty,'a save marks the cloud copy dirty');
  ok(await PH.accUpload(false)===true,'upload');c=await owner('GET','saves/'+anon);ok(c.p===5000&&PH.accMeta().t===c.t,'cloud 5000P, sync mark = cloud time');
  ok(await PH.accSync(false)==='same','check: same as the cloud');
  // ---- another device saved in between ----
  const other=JSON.parse(c.data);other.points=7777;await owner('PUT','saves/'+anon,{data:JSON.stringify(other),t:c.t+5000,p:7777,g:12});
  save.points=5100;PH.persist();
  ok(await PH.accUpload(false)===false&&PH.ACC.st==='choose'&&!PH.ACC.choice.auto,'both changed: the upload stops and asks');
  c=await owner('GET','saves/'+anon);ok(c.p===7777,'the other device’s save was not overwritten');
  await PH.accUseLocal();c=await owner('GET','saves/'+anon);ok(c.p===5100&&PH.ACC.st==='ok','“this device” → cloud 5100P');
  // only the cloud changed → offered, marked as “from another device”
  other.points=9000;await owner('PUT','saves/'+anon,{data:JSON.stringify(other),t:c.t+5000,p:9000,g:12});
  ok(await PH.accSync(false)==='choose'&&PH.ACC.choice.auto,'only the cloud changed → “newer progress from another device”');
  PH.accUseCloud();PH.persist();ok(JSON.parse(localStorage.getItem('penguinHockey.v1')).points===9000,'“cloud” → this device’s stored save replaced; a save before the restart cannot write the old one back');global.__phHold=false;
  // ---- sign out keeps the local save; delete removes cloud + account ----
  PH.accSignOut();ok(!PH.accSigned()&&JSON.parse(localStorage.getItem('penguinHockey.v1')).points===9000,'sign out: local save kept');
  await PH.accWithIdToken(idt,'test');ok(PH.accSigned()&&PH.FB.uid===anon,'signing in again → the same account');
  if(PH.ACC.st==='choose')await PH.accUseLocal();
  // accDelete asks first; in the Node harness askConfirm answers yes
  await PH.accDelete();
  const cg=await owner('GET','saves/'+anon);ok(!PH.accSigned()&&cg===null,'delete: cloud save removed, signed out'+(cg?' (cloud: '+JSON.stringify(cg).slice(0,80)+')':'')+' '+JSON.stringify({prov:PH.FB.prov,ref:!!PH.FB.ref,ls:localStorage.getItem('penguinHockey.auth')}));
  const look=await fetch(PH_NETCFG.authBase+'/accounts:lookup?key=fake',{method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({localId:[anon]})}).then(r=>r.json());
  ok(!look.users||!look.users.length,'delete: Firebase account removed');
  finish();
})().catch(e=>{console.log('CRASH',e.stack);process.exit(2);});
function finish(){console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
  console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);}
