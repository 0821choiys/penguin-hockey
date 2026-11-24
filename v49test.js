// v49 🧊 펭귄 원정 (owner, 2026-11-18: "add something that makes me want to keep playing — it's not fun")
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,save}=PH;const cp=require('child_process');
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
save.set.rules='off';save.set.items=false;save.set.events=false;save.set.cond=false;save.set.size=3;
const {RUN,RUN_UP,RUN_MOD,RUN_STOP}=PH,near=(a,b,e)=>Math.abs(a-b)<(e||1e-9),strip=t=>String(t).replace(/<[^>]+>/g,'');
// ---------- tables ----------
ok(RUN.lives===2&&RUN.maxLives===4&&RUN_STOP.length===11&&RUN_STOP.slice(1).every(x=>typeof x==='string'&&x),'2 lives (max 4), 10 named stops');
const UK=Object.keys(RUN_UP);
ok(UK.length===14&&UK.every(k=>{const u=RUN_UP[k];return ['c','r','e'].includes(u.r)&&u.ico&&u.max>=1&&u.max<=3&&u.v>0&&u.name&&u.desc;}),'14 upgrades, each with a rarity, icon, maximum and numbers ('+UK.join(' ')+')');
ok(UK.every(k=>{const d=strip(PH.runUpDesc(k)),u=RUN_UP[k];return d.includes(String(u.v))&&(u.w==null||d.includes(String(u.w)))&&(u.s==null||d.includes(String(u.s)));}),'every card text shows the numbers the code uses (e.g. “'+strip(PH.runUpDesc('ot'))+'”)');
ok(strip(PH.runModDesc('fast')).includes(String(RUN.mod.fast))&&strip(PH.runModDesc('sniper')).includes(String(RUN.mod.sniper))&&strip(PH.runModDesc('sniper')).includes(String(RUN.mod.sniperAim))
  &&strip(PH.runModDesc('wall')).includes(String(RUN.mod.wall))&&strip(PH.runModDesc('golden')).includes(String(RUN.goldEvery))&&strip(PH.runModName('first3')).includes(String(RUN.first)),'twist texts show the code numbers');
ok(['blizzard','thin','night'].every(k=>PH.runModName(k)===PH.COND[RUN_MOD[k].cond].name),'the three rink-condition twists use the rink condition names');
// ---------- rewards ----------
ok(PH.runPay(1,null)===30&&PH.runPay(4,null)===60&&PH.runPay(5,null)===140&&PH.runPay(10,null)===240&&PH.runPay(4,{ups:{fund:1}})===75&&PH.runPay(4,{ups:{fund:2}})===90,
  'stage reward = (20 + 10 × stage) × 2 on a boss × (1 + 25 % per 🪙): 30 / 60 / boss 140 / boss 240 / 🪙 75 / 🪙🪙 90 P');
ok([5,10,15,20].every(PH.runBoss)&&![1,4,6,9,11].some(PH.runBoss),'a boss every 5th stage');
ok(PH.runDiff(1)==='easy'&&PH.runDiff(2)==='easy'&&PH.runDiff(3)==='normal'&&PH.runDiff(6)==='normal'&&PH.runDiff(7)==='hard'&&PH.runDiff(30)==='hard','difficulty: easy 1–2, normal 3–6, hard from 7');
{const e10=PH.runEndless(10),e12=PH.runEndless(12),e99=PH.runEndless(99);ok(e10.spd===0&&e10.pow===0&&near(e12.spd,3)&&near(e12.pow,4)&&e99.spd===RUN.endless.spdMax&&e99.pow===RUN.endless.powMax,'endless ice after stage 10: opponents +1.5 % speed / +2 % shot per stage, capped at +15 % / +25 %');}
// ---------- opponents + twists ----------
{let okBand=true,okBoss=true,noAuk=true;for(let s=1;s<=20;s++)for(let i=0;i<30;i++){const o=PH.runOpp(s,3);if(o.length!==3)okBand=false;if(o.includes('auk'))noAuk=false;
   const g=o.map(k=>PH.RAR[k]);if(PH.runBoss(s)){if(Math.min(...g)<2)okBoss=false;if(g[0]<g[1]||g[1]<g[2])okBoss=false;}else{const lo=s<=4?0:s<=7?1:2,hi=s<=2?1:s<=4?2:s<=7?3:4;if(g.some(x=>x<lo||x>hi))okBand=false;}}
 ok(okBand,'opponents get stronger grades the further you go (stage 1–2 grades 0–1 … 8+ grades 2–4)');ok(okBoss,'boss teams: grade 2+ only, strongest first (the captain)');ok(noAuk,'the secret 999 species never shows up');}
{let mods=new Set(),rep=false,early=true;for(let i=0;i<400;i++){const last=Object.keys(RUN_MOD)[i%9],m=PH.runModPick(3+(i%2),last);mods.add(m);if(m===last)rep=true;if(PH.runModPick(1)!==null||PH.runModPick(5)!==null||PH.runModPick(10)!==null)early=false;}
 ok(mods.size===9&&!rep&&early,'every twist can come up, never the same twice in a row, none on stage 1 or a boss stage');}
// ---------- the upgrade draw ----------
{let okD=true,rc={c:0,r:0,e:0},n=0;for(let i=0;i<4000;i++){const d=PH.runDraw({ups:{},lives:2},3);if(d.length!==3||new Set(d).size!==3)okD=false;for(const k of d){rc[RUN_UP[k].r]++;n++;}}
 const full=PH.runDraw({ups:{pow:3,chg:3,aim:2,pass:2,dash:2,poke:2,spd:3,ot:2,tech:2,gk:2,fund:2,lead:1,ace:1},lives:4},3);
 const capd=(()=>{for(let i=0;i<500;i++){const d=PH.runDraw({ups:{pow:3,life:0},lives:4},3);if(d.includes('pow')||d.includes('life'))return false;}return true;})();
 ok(okD,'3 different cards every time');ok(capd,'never an upgrade already at its maximum, never ❤️ with full hearts');ok(full.length===0,'everything maxed → no cards (the run just goes on)');
 ok(rc.e/n>.02&&rc.e/n<.08&&rc.c/n>rc.r/n,'rarity really is rarer (first-card shares over 12 000 cards: 일반 '+(rc.c/n*100).toFixed(0)+' % · 희귀 '+(rc.r/n*100).toFixed(0)+' % · 영웅 '+(rc.e/n*100).toFixed(1)+' %)');}
// ---------- a run, start to finish ----------
save.run={best:0,runs:0,wins:0,cur:null,last:null};
const c=PH.runNew();ok(c.st===1&&c.lives===2&&c.mod===null&&c.opp.length===3&&!c.pend,'new run: stage 1, ♥♥, no twist on stage 1, 3 opponents');
let cfg=PH.runCfg(c);ok(cfg.mode==='run'&&cfg.time===Math.min(save.set.time||120,120)&&cfg.diff==='easy'&&cfg.oppName===PH.runStop(1)&&/♥♥/.test(cfg.tag)&&cfg.cond===null,'match settings: 2-minute run match vs '+cfg.oppName+', tag “'+cfg.tag+'”');
// upgrades on our skaters, the captain's ace, our goalie
c.ups={pow:2,chg:1,aim:1,dash:2,spd:1,ot:1,tech:1,gk:1,ace:1,lead:1};c.mod='behind';
PH.startMatch(PH.runCfg(c));
{const mine=G.pengs.filter(p=>p.team===G.mine&&!p.goalie),cap=mine[0],o=mine[1],T0=PH.TT[o.type]||{};
 const base=k=>T0[k]===undefined?1:T0[k];
 ok(near(o.tt.pow,base('pow')*1.08*1.08,1e-9)&&near(o.tt.chg,base('chg')*1.15,1e-9)&&near(o.tt.spread,base('spread')*.8,1e-9)&&near(o.tt.spd,base('spd')*1.04,1e-9)&&near(o.tt.cd,base('cd')*.85,1e-9)
   &&near(o.tt.dashCd,(T0.dashCd||0)-1,1e-9)&&near(o.tt.ot,base('ot')*1.1,1e-9)&&near(o.tt.otw,(T0.otw||0)+.15,1e-9),'team upgrades sit on top of each skater’s own traits (💥×2 → ×1.1664, 💨×2 → −1 s, …)');
 const cb=PH.TT[cap.type]||{};ok(cap.tt.spd>o.tt.spd*1.04&&cap.tt.pow>o.tt.pow*1.09,'⭐ ace: only the captain gets +5 % speed / +10 % shot on top');
 const gm=G.pengs.find(p=>p.goalie&&p.team===G.mine),go=G.pengs.find(p=>p.goalie&&p.team===G.mine.opp);
 ok(gm.gkd&&near(gm.gkd.react,G.diff.gk.react*.8,1e-9)&&!go.gkd,'🧤 our goalie reacts 20 % faster, theirs unchanged');
 ok(G.mine.score===1&&G.mine.opp.score===1,'🥅 opening goal + ⏱️ comeback twist → the match starts 1:1');}
ok([PH.movePeng,PH.aiGoalie,PH.gkRead].every(f=>/\b\w+\.gkd\|\|G\.diff\.gk/.test(f.toString())),   // (any parameter name: gkRead's module is minified since 2026-11-24)
  'goalies read their own reflexes (moving, AI, reading the shot)');
// their side: boss / fast / sniper / wall / endless
{const theirs=()=>G.pengs.filter(p=>p.team===G.mine.opp&&!p.goalie);
 c.ups={};c.st=5;c.mod=null;c.opp=null;PH.runPrep(c);PH.startMatch(PH.runCfg(c));const t=theirs()[0],b=PH.TT[t.type]||{},B=k=>b[k]===undefined?1:b[k],go=G.pengs.find(p=>p.goalie&&p.team===G.mine.opp);
 ok(near(t.tt.spd,B('spd')*RUN.boss.spd,1e-9)&&near(t.tt.pow,B('pow')*RUN.boss.pow,1e-9)&&near(t.tt.chg,B('chg')*RUN.boss.chg,1e-9)&&near(go.gkd.react,G.diff.gk.react*(1-RUN.boss.gk/100),1e-9),'boss team: +6 % speed, +12 % shot, +15 % charge, goalie −25 % reaction time (as shown)');
 c.st=7;c.mod='wall';PH.startMatch(PH.runCfg(c));ok(near(G.pengs.find(p=>p.goalie&&p.team===G.mine.opp).gkd.react,G.diff.gk.react*.7,1e-9),'🧱 brick-wall goalie: −30 % reaction time');
 c.mod='fast';PH.startMatch(PH.runCfg(c));{const q=theirs()[0],bb=PH.TT[q.type]||{};ok(near(q.tt.spd,(bb.spd===undefined?1:bb.spd)*1.08,1e-9),'💨 fast opponents: +8 % speed');}
 c.mod='sniper';PH.startMatch(PH.runCfg(c));{const q=theirs()[0],bb=PH.TT[q.type]||{};ok(near(q.tt.pow,(bb.pow===undefined?1:bb.pow)*1.1,1e-9)&&near(q.tt.spread,(bb.spread===undefined?1:bb.spread)*.8,1e-9),'🎯 sniper opponents: +10 % shot, −20 % spread');}
 c.st=13;c.mod=null;PH.startMatch(PH.runCfg(c));{const q=theirs()[0],bb=PH.TT[q.type]||{};ok(near(q.tt.spd,(bb.spd===undefined?1:bb.spd)*1.045,1e-9)&&near(q.tt.pow,(bb.pow===undefined?1:bb.pow)*1.06,1e-9),'endless stage 13: +4.5 % speed, +6 % shot');}}
// twists that change the match
c.st=3;c.mod='blizzard';cfg=PH.runCfg(c);PH.startMatch(cfg);ok(cfg.cond==='blizzard'&&G.cond==='blizzard','🌨️ blizzard twist = the rink condition');
c.mod='golden';PH.startMatch(PH.runCfg(c));G.state='play';G.goldenT=0;PH.runStep(1/60);ok(G.goldenT>0&&PH.eventsOn(),'🥇 golden-puck rush: a golden puck right away (even with events switched off)');
G.goldenT=0;PH.runStep(10);ok(!(G.goldenT>0),'… not again before '+RUN.goldEvery+' s');PH.runStep(RUN.goldEvery);ok(G.goldenT>0,'… and again after '+RUN.goldEvery+' s');
c.mod='first3';cfg=PH.runCfg(c);PH.startMatch(cfg);ok(cfg.time===0&&!PH.runFirstDone(),'⚡ first to 3: no clock');G.mine.score=3;ok(PH.runFirstDone(),'… the match ends once a team has 3 (after the goal show)');
ok(PH.RULE_MODES.includes('run'),'the referee works in run matches like in quick matches');
// results
c.st=4;c.mod=null;c.opp=null;c.ups={fund:1};c.lives=2;c.earned=0;PH.runPrep(c);save.run.best=2;
PH.startMatch(PH.runCfg(c));G.mine.score=2;G.mine.opp.score=1;PH.endMatch();PH.showResultScreen();
{const R=G.result,cc=PH.runCur();ok(R.extra===75&&R.run.pay===75&&cc.earned===75&&R.total>=75,'win on stage 4 with 🪙: +75 P stage reward, paid with the result (shown row = paid)');
 ok(cc.st===5&&cc.pend.length===3&&save.run.best===4&&R.run.best,'… on to stage 5 (the boss), 3 cards to pick, best record 4');
 PH.showResultScreen();ok(PH.runCur().st===5&&PH.runCur().earned===75,'showing the result again changes nothing');
 const k=cc.pend[0];ok(!PH.runPick('nope')&&PH.runPick(k)&&PH.runCur().pend===null&&(PH.runCur().ups[k]>=1),'picking a card keeps it (a card that was not offered is refused)');}
{const cc=PH.runCur();cc.pend=['life','pow','chg'];const l0=cc.lives;PH.runPick('life');ok(PH.runCur().lives===l0+1,'❤️ extra life: +1 heart');}
{PH.startMatch(PH.runCfg(PH.runCur()));const l0=PH.runCur().lives;G.mine.score=0;G.mine.opp.score=3;PH.endMatch();PH.showResultScreen();
 ok(PH.runCur().lives===l0-1&&PH.runCur().st===5&&G.result.extra===0,'loss: one heart gone, same stage, no stage reward');}
{const cc=PH.runCur(),opp=cc.opp.join();PH.startMatch(PH.runCfg(cc));G.mine.score=1;G.mine.opp.score=1;G.ot=true;
 const st=PH.runCur().st;PH.endMatch();const draw=G.result.draw;PH.showResultScreen();ok(!draw||(PH.runCur().lives===cc.lives&&PH.runCur().st===st),'a draw changes nothing (try again)');
 ok(PH.runCur().opp.join()===opp,'a stage you did not win is played again against the same team');}
while(PH.runCur()){PH.startMatch(PH.runCfg(PH.runCur()));G.mine.score=0;G.mine.opp.score=2;PH.endMatch();PH.showResultScreen();}
ok(save.run.cur===null&&save.run.last&&save.run.last.cleared===4&&save.run.runs===1&&save.run.best===4,'last heart gone → run over, summary kept (4 stages cleared, +'+save.run.last.earned+' P)');
// a run match really plays (AI vs AI with upgrades and a twist, no errors, stays on the ice)
{save.run.cur=null;const r=PH.runNew();r.ups={pow:3,spd:3,chg:3,tech:2};r.st=8;r.mod='golden';r.opp=null;PH.runPrep(r);PH.startMatch(PH.runCfg(r));G.state='play';
 for(const p of G.pengs)p.human=false;G.player=null;G.mine.human=null;let bad=false;for(let i=0;i<120*90;i++){for(const p of G.pengs){p.ox=p.x;p.oz=p.z;}PH.simulate(1/120);G.t+=1/120;
   for(const p of G.pengs)if(!isFinite(p.x)||!isFinite(p.z)||Math.abs(p.x)>26||Math.abs(p.z)>15)bad=true;if(G.state==='goal'){PH.resetPositions();G.state='play';}}
 ok(!bad,'90 s of a stage-8 run match with maxed upgrades and golden pucks: everyone stays on the ice, nothing breaks (score '+G.mine.score+':'+G.mine.opp.score+')');}
// save
const load=s=>JSON.parse(cp.execFileSync(process.execPath,['-e',"const P=require('./harness.js');process.stdout.write(JSON.stringify(P.save.run));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(s)}),encoding:'utf8',stdio:['ignore','pipe','ignore']}));
const base={v:10,tut:{done:true,asked:true}};
{const a=load(Object.assign({run:{best:7,runs:3,wins:20,cur:{st:4,lives:1,ups:{pow:2,zzz:9,ace:5},earned:140,mod:'golden',opp:['king','fast','x'.repeat(30)],pend:['pow','bad','chg']},last:{st:6,cleared:5,earned:300,ups:{spd:1}}}},base));
 ok(a.best===7&&a.cur.st===4&&a.cur.lives===1&&a.cur.ups.pow===2&&a.cur.ups.ace===1&&!a.cur.ups.zzz&&a.cur.mod==='golden'&&a.cur.opp.length===3&&a.cur.opp.every(k=>k.length<16)&&a.cur.pend.join()==='pow,chg'&&a.last.cleared===5,'a saved run loads back (unknown upgrades dropped, counts clamped to each maximum, a broken line-up rolled again) '+JSON.stringify(a.cur));
 const b=load(Object.assign({run:{best:'x',cur:{st:0,lives:3}}},base)),d=load(Object.assign({set:{sound:false}},base));
 ok(b.best===0&&b.cur===null&&d.best===0&&d.cur===null&&d.last===null,'a broken run or an old save without the field → no run, best 0');}
ok(errs.length===0,'no errors '+errs.slice(0,3).join(' | '));
console.log('TOTAL v49test: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
