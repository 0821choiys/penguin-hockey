// v52 👫 friends + 🤝 online 2:2 co-op (owner, 2026-11-25: "친구와 같이 하는 경험 … 친구 추가 기능", picked 2:2 co-op, friend ranking, code + gifts)
// Node checks without a server: the co-op match each phone builds, no switching, kits, gifts (timing, daily cap, points), ranking, save.
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,save}=PH;const cp=require('child_process');
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
save.set.rules='off';save.set.items=false;save.set.events=false;save.set.cond=false;save.set.masc='off';
const {SOC,SOCD,NET}=PH;
// ---- rooms carry mode + difficulty ----
PH.netReset();ok(NET.mode==='vs'&&NET.diff==='normal'&&NET.opp===null,'a fresh room is a 1:1 match (mode vs, normal) unless the host picks co-op');
const opp=PH.socOpp();ok(opp.length===2&&new Set(opp).size===2&&opp.every(t=>PH.TYPES[t]),'the AI team of a co-op room: two different real species ('+opp.join(', ')+')');
// ---- the host's phone ----
save.type='basic';save.hat='none';save.set.pos='attacker';
function begin(role){PH.netReset();NET.role=role;NET.mode='coop';NET.diff='hard';NET.opp=['strong','defense'];NET.peer={ty:['fast','basic','defense'],n:'Bo',h:'crown',kit:null};NET.st='wait';
 PH.netBegin(NET.peer.ty,NET.peer.h);}
begin('host');
{const b=G.teams.blue,r=G.teams.red;
 ok(G.coop&&G.cfg.coop&&G.cfg.mode==='friend'&&G.cfg.diff==='hard'&&NET.st==='play','host: the co-op match starts (friend mode, the room’s difficulty)');
 ok(b.skaters.length===2&&r.skaters.length===2,'2 skaters a side ('+b.skaters.length+' : '+r.skaters.length+')');
 ok(G.mine===b&&b.skaters[0].type==='basic'&&b.skaters[1].type==='fast','host: blue = my penguin + my friend’s penguin');
 ok(r.skaters.map(s=>s.type).join()==='strong,defense','red = the AI team the room picked');
 ok(b.skaters[1].remote&&G.player===b.skaters[0]&&!r.skaters.some(s=>s.remote),'host: I control blue #1, my friend controls blue #2, nobody on red');
 PH.setHuman(b.skaters[1]);ok(G.player===b.skaters[0],'I can never take my friend’s penguin (setHuman refuses it)');
 PH.hkSwap();ok(G.player===b.skaters[0]&&b.skaters[1].remote,'the Switch button does nothing in co-op');
 PH.netSetRemote(r.skaters[0]);ok(NET.rp===b.skaters[1]&&!r.skaters[0].remote,'the friend’s penguin never moves to another skater');
 PH.netAutoSwitch(0.5);ok(NET.rp===b.skaters[1],'no automatic switching for the friend either');
 // a pass to my friend does not hand me their penguin
 G.state='play';const me=b.skaters[0],fr=b.skaters[1];G.puck.owner=null;PH.setHuman(fr);ok(G.player===me,'a pass to my friend: I keep my own penguin');}
// ---- the guest's phone builds the same two ----
begin('guest');
{const b=G.teams.blue;
 ok(G.coop&&G.mine===b&&b.skaters[0].type==='fast'&&b.skaters[1].type==='basic','guest: the same blue pair (host’s penguin first, mine second)');
 ok(G.player===b.skaters[1],'guest: I control blue #2');
 ok(G.teams.red.skaters.map(s=>s.type).join()==='strong,defense','guest: the same AI team');}
// ---- kits: the host’s kit is the team’s, red stays standard ----
{save.kit=Object.assign({},save.kit||{},{on:true,c1:'#18a058',c2:'#ffffff'});
 begin('host');const kb=PH.kitSync(G.cfg);ok(kb.blue===parseInt('18a058',16)&&kb.red===PH.TEAM.red.color,'host: blue wears my kit');
 save.kit.c1='#8a4dff';begin('guest');NET.peer.kit={on:true,c1:'#18a058',c2:'#ffffff'};const kg=PH.kitSync(G.cfg);
 ok(kg.blue===parseInt('18a058',16),'guest: blue wears the host’s kit, not mine (#'+kg.blue.toString(16)+')');save.kit.on=false;}
// ---- the result counts friend-match and co-op wins separately ----
{const s=PH.socS();s.fw=s.fl=s.cw=s.cl=0;begin('host');G.mine.score=3;G.mine.opp.score=1;PH.socResult();
 PH.netReset();NET.role='host';G.cfg.coop=false;G.mine.score=0;G.mine.opp.score=2;PH.socResult();
 ok(s.cw===1&&s.fl===1&&s.fw===0&&s.cl===0,'a co-op win → 협동 승; a 1:1 loss → 친구 대전 패');
 G.cfg={mode:'quick'};PH.socResult();ok(s.cw===1&&s.fl===1,'other matches do not count');
 const st=PH.socStats();ok(st.cw===1&&st.fw===0&&'run' in st&&st.lv>=1,'the ranking numbers come from the save (run best, coach level, wins)');}
// ---- gifts ----
{const s=PH.socS();s.sent={};ok(PH.socGiftReady('U1'),'a friend I never sent to can get a gift');
 s.sent.U1=Date.now()-SOCD.gap+60000;ok(!PH.socGiftReady('U1'),'one gift per friend: '+SOCD.gap/3600000+' h before the next');
 s.sent.U1=Date.now()-SOCD.gap-1;ok(PH.socGiftReady('U1'),'… then it opens again');
 // 12 waiting, 10 a day
 s.claim={};s.cday='';s.cn=0;SOC.inbox.gift={};for(let i=0;i<12;i++)SOC.inbox.gift['F'+i]={t:1000+i};
 ok(PH.socGiftsWaiting().length===12&&PH.socClaimLeft()===SOCD.maxDay,'12 gifts waiting, '+SOCD.maxDay+' can be claimed today');
 const p0=save.points;const n=PH.socClaim();
 ok(n===SOCD.maxDay&&save.points===p0+SOCD.maxDay*SOCD.gift&&s.cn===SOCD.maxDay&&PH.socGiftsWaiting().length===2,'claim: '+n+' × '+SOCD.gift+'P = +'+(save.points-p0)+'P, 2 left for tomorrow');
 const p1=save.points;ok(PH.socClaim()===0&&save.points===p1,'the daily cap holds');
 s.cday='2000-01-01';ok(PH.socClaimLeft()===SOCD.maxDay&&PH.socClaim()===2&&save.points===p1+2*SOCD.gift,'a new day: the last 2 come in');
 SOC.inbox.gift.F0={t:5000};ok(PH.socGiftsWaiting().join()==='F0','the same friend’s next gift (newer time) waits again');
}
{SOC.mode='coop';const c=PH.socPlayPick();ok(/data-socdf="hard"/.test(c)&&/data-socm="coop" class="on"/.test(c),'co-op picks a difficulty for the AI team');
 SOC.mode='vs';ok(!/data-socdf/.test(PH.socPlayPick()),'1:1 has no difficulty row (the opponent is your friend)');SOC.mode='coop';}
// ---- save ----
const load=s=>JSON.parse(cp.execFileSync(process.execPath,['-e',"const P=require('./harness.js');process.stdout.write(JSON.stringify(P.save.social));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(s)}),encoding:'utf8',stdio:['ignore','pipe','ignore']}));
const base={v:10,tut:{done:true,asked:true}};
{const a=load(Object.assign({social:{fw:3,fl:-2,cw:1e9,cl:'x',cn:4,cday:'2026-11-25',claim:{abcdef12:5,'bad key!':3},sent:{abcdef12:'7',x:1}}},base));
 ok(a.fw===3&&a.fl===0&&a.cw===1e7&&a.cl===0&&a.cn===4&&a.cday==='2026-11-25'&&a.claim.abcdef12===5&&!('bad key!' in a.claim)&&a.sent.abcdef12===7&&!('x' in a.sent),'a saved friend record loads back (numbers clamped, bad keys dropped)');
 const b=load(base);ok(b&&b.fw===0&&b.cw===0&&Object.keys(b.claim).length===0,'an old save → empty friend record');}
ok(errs.length===0,'no errors '+errs.slice(0,3).join(' | '));
console.log('TOTAL v52test: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
