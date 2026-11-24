// v51 🥅 goalie draw + 내 포지션 (owner, 2026-11-24: "add a goalie draw to the penguin draw and let me pick my position (2 or more a side);
// I can play goalie too, but only with characters from the goalie draw")
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,save}=PH;const cp=require('child_process');
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
save.set.rules='off';save.set.items=false;save.set.events=false;save.set.cond=false;save.set.masc='off';
const {GKD,GKS,GKC,GKST}=PH,ids=Object.keys(GKC),near=(a,b,e)=>Math.abs(a-b)<(e||1e-9);
// ---- the roster ----
{const per=[0,1,2,3,4].map(g=>ids.filter(k=>GKC[k].g===g).length);
 ok(ids.length===10&&per.join()==='3,3,2,1,1','10 goalies in the five penguin grades 3 · 3 · 2 · 1 · 1 ('+per.join(' · ')+')');
 ok(ids.every(k=>PH.TYPES[GKC[k].sp]&&!PH.TYPES[GKC[k].sp].exclusive&&GKS[GKC[k].sk]&&GKC[k].st.length===5),'each is a real species model with 5 stats and a skill');
 const sum=k=>GKC[k].st.reduce((a,v)=>a+v,0),byG=[0,1,2,3,4].map(g=>ids.filter(k=>GKC[k].g===g).map(sum));
 ok(byG.every((a,g)=>g===0||Math.min(...a)>Math.max(...byG[g-1])),'a higher grade always has a higher stat total ('+byG.map(a=>a.join('/')).join(' < ')+')');}
// ---- odds on screen = the code ----
{const o=PH.gkS();o.pity=0;const p=PH.gkProbs(0);
 ok(p.every((v,i)=>near(v,GKD.odds[i]))&&near(p.reduce((a,v)=>a+v,0),100),'grade odds = GKD.odds ('+p.map(v=>v.toFixed(0)).join(' · ')+' %)');
 const per=ids.map(k=>PH.gkRate(k,0));ok(near(per.reduce((a,v)=>a+v,0),100,1e-9),'per-goalie chances add up to 100 % ('+per.map(v=>v.toFixed(2)).join(' ')+')');
 o.pity=GKD.hard-1;const q=PH.gkProbs(0);ok(q[0]===0&&q[1]===0&&q[2]===0&&near(q[3]+q[4],100)&&near(q[4]/q[3],GKD.odds[4]/GKD.odds[3]),'the '+GKD.hard+'th draw since the last 신화+ is 신화 or 전설 ('+q.map(v=>v.toFixed(1)).join(' · ')+')');o.pity=0;
 const t=PH.gkProbs(GKD.tenMin);ok(t[0]===0&&t[1]===0&&near(t.reduce((a,v)=>a+v,0),100),'10-draw guarantee: the tenth renormalised to 레어+ ('+t.map(v=>v.toFixed(1)).join(' · ')+')');
 const e=PH.gkEff();ok(near(e.reduce((a,v)=>a+v,0),100,1e-9)&&e[3]+e[4]>GKD.odds[3]+GKD.odds[4],'long-run rates with the pity: '+e.map(v=>v.toFixed(2)).join(' · ')+' %');
 // the box on screen quotes these numbers
 const box=PH.gkOddsBox().replace(/<[^>]+>/g,' ');const pc=v=>(Math.round(v*100)/100).toFixed(2)+'%';
 ok(ids.every(k=>box.includes(GKC[k].n+' '+pc(GKD.odds[GKC[k].g]/ids.filter(x=>GKC[x].g===GKC[k].g).length)))&&e.every(v=>box.includes(pc(v)))&&box.includes(String(GKD.hard))&&GKD.refund.every(r=>box.includes(r+'P')),'the odds box shows each goalie’s chance, the pity, the long-run rates and the refunds the code uses');}
// ---- the draw ----
{const o=PH.gkS();o.own={};o.eq='';o.free='';o.pity=0;o.hist=[];save.points=1000;
 const r1=PH.gkDraw(1);ok(r1&&r1.length===1&&save.points===1000&&!PH.gkFreeReady(),'the first draw of the day is free');
 ok(PH.gkEq()===r1[0].id&&r1[0].isNew,'… and the first goalie is equipped at once ('+GKC[r1[0].id].n+')');
 const r2=PH.gkDraw(1);ok(r2&&save.points===1000-GKD.cost1,'the next single draw costs '+GKD.cost1+'P');
 save.points=GKD.cost10-1;ok(PH.gkDraw(10)===null&&save.points===GKD.cost10-1,'not enough points → nothing drawn, nothing taken');
 // forced bad luck: every roll is the lowest grade
 const R0=Math.random;Math.random=()=>0;save.points=5000;o.pity=0;const ten=PH.gkDraw(10);
 ok(ten.slice(0,9).every(r=>r.g===0)&&ten[9].g>=GKD.tenMin,'10 draws with the worst luck: nine 기본, the tenth 레어 or better ('+GRADES(ten[9].g)+')');
 o.pity=0;let pit=[];for(let i=0;i<GKD.hard;i++)pit.push(PH.gkDrawOnce(0).g);Math.random=R0;
 ok(pit.slice(0,GKD.hard-1).every(g=>g===0)&&pit[GKD.hard-1]>=3&&o.pity===0,'the '+GKD.hard+'th draw without 신화+ is 신화+, then the pity starts again');
 // duplicates → levels → refunds
 o.own={g0:0};o.eq='g0';const lv=[];for(let i=0;i<GKD.lvMax;i++)lv.push(PH.gkGrant('g0').up);const p0=save.points,ref=PH.gkGrant('g0');
 ok(lv.join()==='1,2,3,4,5'&&PH.gkLv('g0')===GKD.lvMax&&ref.ovf===GKD.refund[0]&&save.points===p0+GKD.refund[0],'a duplicate is +1 level up to Lv.'+GKD.lvMax+', then '+GKD.refund[0]+'P back');
 ok(PH.gkOvr('g0',5)>PH.gkOvr('g0',0)&&PH.gkStats('g0',5).ref===GKC.g0.st[0]+5*GKD.lvAdd,'levels raise every stat by '+GKD.lvAdd+' (OVR '+PH.gkOvr('g0',0)+' → '+PH.gkOvr('g0',5)+')');
 ok(o.hist.length<=GKD.histMax&&o.pulls>=GKD.hard+12,'history kept (last '+GKD.histMax+'), pulls counted ('+o.pulls+')');}
function GRADES(g){return ['기본','희귀','레어','신화','전설'][g];}
// ---- stats → the goalie AI ----
{const b={cap:7.5,acc:34,react:.42,err:.9,dive:.2,miss:.16,read:.22,out:.45},n=PH.gkParams(b,{ref:3,pos:3,agi:3,dive:3,hand:3}),hi=PH.gkParams(b,{ref:6,pos:6,agi:6,dive:6,hand:6});
 ok(['cap','acc','react','err','dive','miss','read','out'].every(k=>near(n[k],b[k])),'all stats 3 = exactly the difficulty’s goalie');
 ok(hi.react<b.react&&hi.miss<b.miss&&hi.err<b.err&&hi.cap>b.cap&&hi.acc>b.acc&&hi.dive>b.dive,'better stats: quicker, fewer misreads, more accurate, faster, dives more (react '+hi.react.toFixed(2)+', miss '+hi.miss.toFixed(2)+', err '+hi.err.toFixed(2)+')');
 ok(PH.gkBounce({hand:3})===.55&&PH.gkBounce({hand:6})<.55,'퍽 처리 3 keeps the old rebound (.55), more = softer rebounds ('+PH.gkBounce({hand:6}).toFixed(2)+')');}
// ---- 내 포지션 ----
{const P=(pos,n)=>{save.set.pos=pos;return [PH.gkPos(n),PH.gkPerm(n).join(''),PH.gkRolesSq(n).join(',')];};
 PH.gkS().own={g4:0};PH.gkS().eq='g4';
 ok(P('defender',1)[0]==='attacker'&&P('gk',1)[0]==='attacker','1 a side: always the attacker');
 const d2=P('defender',2),m3=P('mid',3),d4=P('defender',4),m2=P('mid',2),g3=P('gk',3);
 ok(d2[0]==='defender'&&d2[2]==='defender,attacker'&&m3[2]==='mid,attacker,defender'&&d4[2]==='defender,mid,mid,attacker','the captain swaps into the chosen slot (2: '+d2[2]+' · 3 mid: '+m3[2]+' · 4 def: '+d4[2]+')');
 ok(m2[0]==='attacker'&&g3[0]==='gk'&&g3[1]==='012','중앙 needs 3 a side; 골키퍼 leaves the skaters as they are');
 PH.gkS().eq='';ok(P('gk',3)[0]==='attacker','골키퍼 without an equipped goalie → back to attacker');PH.gkS().eq='g4';}
const quick=o=>Object.assign({mode:'quick',size:3,time:180,diff:'normal',oppTypes:['basic','fast','king'],tag:'q',oppName:'R',label:'R'},o||{});
// ---- the match: our goalie is the card ----
{save.set.pos='attacker';PH.gkS().own={g9:2};PH.gkS().eq='g9';PH.startMatch(quick());const g=G.mine.goalie,o=G.mine.opp.goalie;
 ok(g.type===GKC.g9.sp&&g.gkId==='g9'&&g.gkSk==='wall'&&o.type==='strong'&&!o.gkId,'our goalie = the equipped card ('+GKC.g9.n+', '+g.type+'); theirs is the old default');
 const want=PH.gkParams(G.diff.gk,PH.gkStats('g9',2));ok(near(g.gkd.react,want.react)&&near(g.gkd.cap,want.cap)&&g.gkEv===PH.gkBounce(PH.gkStats('g9',2)),'its AI numbers come from its stats + level (react '+g.gkd.react.toFixed(3)+' vs '+G.diff.gk.react+')');
 ok(G.player===G.mine.skaters[0]&&!G.player.goalie,'attacker: you start on the captain as before');
 PH.startMatch(quick({net:'host',flat:true,mode:'friend'}));ok(G.mine.goalie.type==='defense'&&!G.mine.goalie.gkId,'online friend match: the old default goalie, no card');
 PH.gkS().eq='';PH.startMatch(quick());ok(G.mine.goalie.type==='defense'&&!G.mine.goalie.gkd,'no goalie equipped: the old default goalie exactly');PH.gkS().eq='g9';
 PH.startMatch(quick({mode:'challenge',challenge:{kind:'x'}}));ok(!G.mine.goalie.gkId,'missions keep their own goalie (no card)');}
// ---- 수비 position in a match ----
{save.set.pos='defender';PH.startMatch(quick());const c=G.mine.skaters[0],d=G.mine.dir,f=PH.FORM[3][2];
 ok(c.role==='defender'&&G.player===c&&near(c.hx,d>0?f[0]:-f[0])&&near(c.hz,d>0?f[1]:-f[1])&&G.mine.skaters[2].role==='attacker','수비: the captain (you) lines up as the defender, the third slot plays up front');save.set.pos='attacker';}
// ---- playing goalie ----
{save.set.pos='gk';PH.startMatch(quick());const g=G.mine.goalie;
 ok(G.gkMode&&G.player===g&&g.human&&G.mine.human===null,'골키퍼: you are the goalie, every skater on your team is AI');
 PH.hkSwap&&PH.hkSwap();ok(G.player===g,'the Switch button does nothing in net');
 PH.setHuman(G.mine.skaters[1]);ok(G.player===g,'face-offs / resets that hand the puck to a skater keep you in net');
 // hands off: holds the angle
 G.state='play';const pk=G.puck;pk.x=-G.mine.dir*12;pk.z=6;pk.vx=pk.vz=0;for(let i=0;i<120;i++){PH.gkHuman(g,1/120,{x:0,z:0});PH.movePeng(g,1/120);}
 ok(g.z>.6&&g.z<PH.GW,'stick let go: the goalie slides toward the puck’s side of the net (z '+g.z.toFixed(2)+')');
 // dive to where the shot goes
 pk.x=-G.mine.dir*10;pk.z=0;g.z=0;g.vz=0;const gx=-G.mine.dir*(PH.W-1.7);pk.vx=-G.mine.dir*25;pk.vz=(1.9-0)/((Math.abs(gx-pk.x))/25);
 const inc=PH.gkInc(g);ok(inc&&near(inc.zp,1.9,.05),'a shot at the net: crossing point known ('+(inc?inc.zp.toFixed(2):'-')+')');
 g.diveCd=0;g.diveT=0;PH.gkDive(g,{z:0},inc);for(let i=0;i<40;i++){PH.gkHuman(g,1/120,{x:0,z:0});PH.movePeng(g,1/120);}
 ok(g.gkAim!=null&&Math.abs(g.z-1.9)<.45,'Shoot with the stick centred dives to that spot (z '+g.z.toFixed(2)+' → 1.9)');
 ok(g.diveCd>0,'… and the dive needs a moment before the next ('+g.diveCd.toFixed(2)+' s)');
 // the puck at your stick: Shoot clears it, Pass passes it
 g.diveT=0;g.x=g.hx;g.z=0;g.cd.shoot=0;pk.x=g.x+G.mine.dir*1;pk.z=0;pk.vx=pk.vz=0;G.carry=null;
 PH.gkHuman(g,1/120,{x:0,z:0,shootPress:true});ok(Math.sign(pk.vx)===G.mine.dir&&Math.hypot(pk.vx,pk.vz)>12&&pk.last===g,'puck at your stick + Shoot = cleared up the ice ('+Math.hypot(pk.vx,pk.vz).toFixed(1)+' m/s)');
 g.cd.pass=0;pk.x=g.x+G.mine.dir*1;pk.z=0;pk.vx=pk.vz=0;G.pass=null;for(const s of G.mine.skaters){s.fall=0;s.frozen=false;}G.mine.skaters[1].x=-G.mine.dir*4;G.mine.skaters[1].z=3;
 PH.gkHuman(g,1/120,{x:0,z:0,pass:true});ok(G.pass&&G.pass.from===g&&G.mine.skaters.includes(G.pass.to)&&G.pending===null&&G.player===g,'Pass = a pass out to a team-mate (you stay in net)');
 // a loose puck at the stick does not stall the game
 G.pass=null;pk.x=g.x+G.mine.dir*1;pk.z=0;pk.vx=pk.vz=0;g.cd.pass=0;g.cd.shoot=0;for(let i=0;i<120*2;i++)PH.gkHuman(g,1/120,{x:0,z:0});ok(Math.hypot(pk.vx,pk.vz)>5,'a puck left at your stick goes out by itself after '+GKD.idle+' s');
 // the save moment
 G.slow=null;G.gkShot=-1;pk.x=-G.mine.dir*12;pk.z=0;pk.vx=-G.mine.dir*24;pk.vz=0;pk.lastTeam=G.mine.opp;pk.lastT=123;PH.gkStep(1/60);const s1=G.slow&&G.slow.t>0?G.slow.s:0;G.slow.t=0;PH.gkStep(1/60);
 ok(s1>0&&s1<.6&&!(G.slow.t>0),'a shot at your net slows the game for a moment (×'+s1.toFixed(2)+'), once per shot');
 // skill: 철벽 makes the save area bigger
 g.cd.special=0;g.x=g.hx;g.z=0;g.vx=g.vz=0;g.diveT=0;const sh=(on)=>{g.gkW=on?3:0;pk.x=g.x+G.mine.dir*6;pk.z=g.r*1.18+PH.PUCKR;pk.vx=-G.mine.dir*20;pk.vz=0;pk.last=null;pk.lastTeam=G.mine.opp;g.shotGrace=0;
   let hit=false;for(let i=0;i<60;i++){PH.puckStep(1/120);if(pk.last===g)hit=true;}return hit;};
 const miss=sh(false),hit=sh(true);ok(!miss&&hit,'🧱 철벽: a shot just past the pads misses the goalie without it and is stopped with it');g.gkW=0;
 // 쏙 캐치 kills the rebound
 g.gkC=3;pk.x=g.x+G.mine.dir*4;pk.z=0;pk.vx=-G.mine.dir*20;pk.vz=0;pk.lastTeam=G.mine.opp;g.shotGrace=0;for(let i=0;i<40;i++)PH.puckStep(1/120);
 ok(Math.hypot(pk.vx,pk.vz)<.5&&g.gkC===0,'🧤 쏙 캐치: the save stops dead in front of the stick');
 // your skill button
 G.state='play';g.gkSk='reflex';g.gkG=2;g.cd.special=0;PH.gkHuman(g,1/120,{x:0,z:0,special:true});ok(g.gkR>0&&near(g.gkR,PH.gkSkT('reflex',2),.02)&&g.cd.special===GKS.reflex.cd&&g.gkd.react<g.gkd0.react,'Special = the goalie’s skill (⚡ for '+PH.gkSkT('reflex',2)+' s, cooldown '+GKS.reflex.cd+' s)');
 PH.gkTick(g,9);ok(g.gkR===0&&g.gkd0===null,'… and it wears off');g.gkSk='wall';
 // a whole match in net: AI team-mates, random inputs, nothing breaks
 save.set.rules='full';PH.startMatch(quick());G.state='play';let bad=false,lost=false,goals=0;const gg=G.mine.goalie;
 for(let i=0;i<120*60;i++){const inp={x:Math.sin(i/90),z:Math.cos(i/70),shootPress:i%160===0,pass:i%230===0,special:i%900===0};if(G.player===gg)Object.assign(PH.input,inp);
   PH.simulate(1/120);G.t+=1/120;if(i%2===0)PH.gkStep(1/60);if(G.player!==gg)lost=true;
   for(const p of G.pengs)if(!isFinite(p.x)||!isFinite(p.z)||Math.abs(p.x)>26||Math.abs(p.z)>15)bad=true;
   if(gg.x*G.mine.dir>-(PH.W-3.7)||Math.abs(gg.z)>PH.GW+.2)bad=true;
   if(G.state==='goal'){goals++;PH.resetPositions();G.state='play';}else if(G.state!=='play'){G.state='play';}}
 ok(!bad&&!lost,'60 s in net with the referee on: you stay the goalie the whole time, the goalie stays in its crease, nothing breaks ('+goals+' goals)');
 save.set.rules='off';
 // a penalty shot / shootout turn against you: you guard the net
 G.so={turn:1};PH.setHuman(null);ok(G.player===G.mine.goalie,'shootout / penalty shot against you: you are in net');G.so=null;
 save.set.pos='attacker';}
// the goalie AI uses its skill when a shot comes
{PH.startMatch(quick());const g=G.mine.goalie,pk=G.puck;G.state='play';g.cd.special=0;pk.x=-G.mine.dir*12;pk.z=.5;pk.vx=-G.mine.dir*26;pk.vz=0;pk.lastTeam=G.mine.opp;
 PH.gkStep(1/60);ok(g.gkW>0&&g.cd.special>0,'the goalie AI throws up its 🧱 when a shot is on its way');}
// run mode: the 🧤 upgrade stacks on the card
{const p={gkd:{react:.3,cap:9}};PH.runGk(p,.8);ok(near(p.gkd.react,.24)&&p.gkd.cap===9,'펭귄 원정 🧤 upgrade multiplies the card’s reaction, keeps its other numbers');}
// skill text = the numbers the code uses
{const d=PH.gkSkDesc('wall',4).replace(/<[^>]+>/g,'');ok(d.includes(String(PH.gkSkT('wall',4)))&&d.includes(String(Math.round((GKS.wall.k-1)*100))),'skill text = code: “'+d+'”');
 const r=PH.gkSkDesc('reflex',0);ok(r.includes(String(Math.round((1-GKS.reflex.r)*100)))&&r.includes(String(Math.round((GKS.reflex.dv-1)*100))),'“'+r.replace(/<[^>]+>/g,'')+'”');
 const det=PH.gkDetail('g8').replace(/<[^>]+>/g,' ');ok(GKST.every((k,i)=>det.includes(String(Math.round(PH.gkStats('g8')[k]*10)/10)))&&det.includes(String(GKS.catch.cd)),'the detail panel shows the stats and cooldown the code uses');}
// ---- save ----
const load=s=>JSON.parse(cp.execFileSync(process.execPath,['-e',"const P=require('./harness.js');process.stdout.write(JSON.stringify([P.save.gk,P.save.set.pos,!!P.save.gkTip]));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(s)}),encoding:'utf8',stdio:['ignore','pipe','ignore']}));
const base={v:10,tut:{done:true,asked:true}};
{const a=load(Object.assign({gk:{own:{g1:3,g9:9,zz:1,g10:2},eq:'g9',pity:44,pulls:12,free:'2026-11-24',hist:[['g1',0],['x',1],['g9',7]]},gkTip:1,set:{pos:'gk'}},base));
 ok(a[0].own.g1===3&&a[0].own.g9===5&&!('zz' in a[0].own)&&!('g10' in a[0].own)&&a[0].eq==='g9'&&a[0].pity===29&&a[0].hist.length===2&&a[0].hist[1][1]===4&&a[1]==='gk'&&a[2],'a saved collection loads back (unknown ids dropped, levels / pity clamped)');
 const b=load(Object.assign({gk:{own:{g2:1},eq:'g5'},set:{pos:'keeper'}},base)),c=load(base);
 ok(b[0].eq===''&&b[1]==='attacker'&&c[0]&&Object.keys(c[0].own).length===0&&c[1]==='attacker'&&!c[2],'equipped goalie not owned → none; a bad position → attacker; an old save → empty collection, attacker');}
ok(errs.length===0,'no errors '+errs.slice(0,3).join(' | '));
console.log('TOTAL v51test: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
