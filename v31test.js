// v31: friend match logic without a network — remote control by counters, fair teams, snapshot → screen, events
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,step,startMatch,save,NET}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
ok(PH.fbOn()===false,'no Firebase config in this build → the 친구 대전 screen says the server is not connected yet');
// ---- host side: fixed sides, flat teams, one remote human on red ----
save.team='red';save.type='king';save.squad=['fast','basic'];
NET.role='host';NET.peer={ty:['macaroni','auk','little']};PH.netBegin(['macaroni','auk','little']);
ok(G.net==='host'&&G.mine===G.teams.blue,'host plays blue even when its own team colour is red');
ok(G.teams.red.skaters.map(p=>p.type).join()==='macaroni,auk,little'&&G.teams.blue.skaters[0].type==='king','teams: host = own squad, red = the friend’s squad');
ok(G.teams.blue.goalie.type===G.teams.red.goalie.type,'same goalie type on both sides');
const r=G.teams.red.skaters[0];ok(r.remote&&!r.human&&NET.rp===r,'red skater 1 is steered by the friend (remote, not AI, not the local human)');
for(let i=0;i<60*3.4;i++)step(1/60);ok(G.state==='play','countdown done');
// stick right: the remote penguin skates right
const x0=r.x;NET.rin={x:1,z:0,ax:0,az:0,sh:0,c:[0,0,0,0,0,0]};for(let i=0;i<60;i++)step(1/60);
ok(NET.rp.x-x0>1||NET.rp!==r,'remote stick → the red penguin moves ('+(r.x-x0).toFixed(2)+' m)');
// a skill press arrives as a counter: used once even if the same counter keeps arriving
const p=NET.rp;p.cd.special=0;p.fall=0;NET.rin={x:0,z:0,ax:0,az:0,sh:0,c:[0,0,0,0,1,0]};step(1/60);const cd1=p.cd.special;
p.cd.special=0;for(let i=0;i<30;i++)step(1/60);
ok(cd1>0&&p.cd.special===0&&NET.rseen[4]===1,'skill counter 1 → used once; the same counter again does nothing');
NET.rin={x:0,z:0,ax:0,az:0,sh:0,c:[0,0,0,0,2,0]};for(const q of G.teams.red.skaters){q.cd.special=0;q.fall=0;}step(1/60);
ok(G.teams.red.skaters.some(q=>q.cd.special>0),'counter 2 → used again (by whichever red penguin the friend steers now)');
// ---- snapshot round trip: applying the host's own snapshot on a "guest" changes nothing visible ----
const snap=PH.netSnap();ok(snap.P.length===G.pengs.length&&snap.sc.length===2&&snap.pk.length===4,'snapshot has every penguin, the score and the puck ('+JSON.stringify(snap).length+' bytes)');
const before=G.pengs.map(q=>[q.x,q.z]);
NET.snaps=[snap,Object.assign({},snap,{ht:snap.ht+50})];NET.off=-1e9;NET.applied=0;G.net='guest';
PH.netGuestApply();const dmax=Math.max(...G.pengs.map((q,i)=>Math.max(Math.abs(q.x-before[i][0]),Math.abs(q.z-before[i][1]))));
ok(dmax<.006,'(largest difference '+dmax.toFixed(4)+' m, snapshots carry centimetres) '+'guest applying a snapshot puts every penguin where the host has it');
ok(G.state===snap.st&&Math.abs(G.timeLeft-snap.tl)<.01,'state and clock come from the snapshot');
// guest: the snapshot says the match is over → the friend gets a result
NET.snaps=[Object.assign({},snap,{ht:snap.ht+100,st:'over',sc:[0,2]})];NET.applied=0;G.result=null;PH.netGuestApply();
ok(G.result&&G.teams.red.score===2,'guest: over in the snapshot → result screen data (red 2 : 0)');
G.net='';NET.st='idle';NET.role='';
// ---- other modes are untouched ----
startMatch({mode:'quick',size:3,time:120,diff:'normal',oppTypes:['basic','fast','strong'],tag:'q'});
ok(!G.net&&!G.pengs.some(q=>q.remote)&&G.mine===G.teams[save.team],'a normal quick match: no network, no remote penguin, own team colour');
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
