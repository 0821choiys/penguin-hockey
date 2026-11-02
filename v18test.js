// v18 unit checks: ten more real penguin species (roster, gacha odds = code, skills, AI use, personalities,
// chemistry, achievements, save migration, texts = code numbers)
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {G,save,startMatch}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const near=(a,b,e)=>Math.abs(a-b)<=(e||1e-9);
const H=1/120,realRnd=Math.random;
const {TYPES,SPX,NEW18,TT,PREF,SPECIALS,SPEC,TYPE_W,GACHA,MK_TMUL}=PH;
const ks=Object.keys(TYPES),nonEx=ks.filter(k=>!TYPES[k].exclusive),OLD=['basic','fast','strong','defense','balanced'];
save.set.cond=false;save.set.events=false;save.set.items=false;
for(const k of ks){save.lv[k]=0;save.xp[k]=0;}save.brk={};
const sim=s=>{for(let i=0;i<Math.round(s/H);i++){for(const p of G.pengs){p.ox=p.x;p.oz=p.z;}PH.simulate(H);G.t+=H;if(G.state==='goal'){PH.resetPositions();G.state='play';}}};
// a controlled scene: my captain + 2 mates vs 3 opponents, everyone frozen in place unless released
function scene(me,mates,opp){
  save.types=ks.slice();save.type=me;save.squad=[mates[0]||null,mates[1]||null,null];
  startMatch({mode:'free',size:3,time:0,diff:'normal',oppTypes:opp||['basic','basic','basic']});G.state='play';G.royal=null;
  PH.input.x=PH.input.z=0;
  const A=G.mine.skaters,B=G.mine.opp.skaters;
  for(const p of G.pengs){p.vx=p.vz=0;p.fall=0;p.getup=0;p.slow=0;p.cd.special=0;p.cd.dash=0;p.cd.catch=0;}
  return {me:A[0],m1:A[1],m2:A[2],o:B,og:G.mine.opp.goalie,mg:G.mine.goalie};
}
const put=(p,x,z,h)=>{p.x=p.ox=p.rx=x;p.z=p.oz=p.rz=z;if(h!==undefined)p.heading=h;p.vx=p.vz=0;};

/* ========== 1. roster ========== */
ok(ks.length===16&&nonEx.length===15&&ks[ks.length-1]==='auk','16 species: 15 regular + the exclusive great auk (last)');
ok(NEW18.length===10&&NEW18.every(k=>TYPES[k]&&!TYPES[k].exclusive&&!OLD.includes(k)),'10 new species, none of them an existing one');
ok(new Set(NEW18.map(k=>TYPES[k].name)).size===10&&NEW18.every(k=>/ 펭귄$/.test(TYPES[k].name)),'real species names, all different ('+NEW18.map(k=>TYPES[k].name).join(', ')+')');
{const bad=NEW18.filter(k=>{const s=TYPES[k].stats,v=Object.values(s),sum=v.reduce((a,b)=>a+b,0);return Object.keys(s).join()!=='speed,accel,power,turn,body'||v.some(x=>x<1||x>5)||sum<15||sum>17;});
 ok(!bad.length,'stats: 5 stats each 1..5, totals 15..17 like the old species (no power creep)'+(bad.length?' '+bad:''));}
{const sp=NEW18.map(k=>TYPES[k].special);ok(new Set(sp).size===10&&sp.every(s=>!['dash','slide','flipper','icebreak','surge'].includes(s)),'10 new special skills, one per species');
 ok(sp.every(s=>SPECIALS[s]&&SPEC[s]&&SPX[s]&&SPEC[s].cd===SPX[s].cd&&PH.spDesc(s).length>10&&!/\{\w+\}/.test(PH.spDesc(s))),'every skill has a name, a cooldown and a description');}
ok(ks.every(k=>TT[k]&&TT[k].name&&TT[k].plus&&TT[k].minus),'every species has a personality (strength + weakness)');
ok(NEW18.every(k=>['attacker','mid','defender'].includes(PREF[k])),'every new species has a position');
ok(ks.every(k=>MK_TMUL[k]>0&&PH.PFACT[k]),'market price factor and a real fact for every species');
{const nums=ks.map(k=>PH.buildPenguin(k,'blue','none').num);ok(new Set(nums).size===nums.length,'every species has its own jersey number ('+nums.join(',')+')');}
ok(nonEx.every(k=>{const s=PH.pengSVG(k);return s.startsWith('<svg')&&s.endsWith('</svg>')&&!/undefined|NaN/.test(s);}),'card art for every species');
ok(NEW18.every(k=>{const o=PH.cardOvr(k,0);return o>=70&&o<=82;}),'card OVR 70..82 like the old species');
{let built=0;for(const k of NEW18)for(const h of['none','beanie','helmet','headband','party','crown']){const pg=PH.buildPenguin(k,'red',h);if(pg.root&&pg.head&&pg.stick)built++;}ok(built===60&&errs.length===0,'all new species × hats build ('+built+')');}
ok(['macaroni','royal','fiordland'].every(k=>PH.pkCrest18(TYPES[k].patch,true)&&PH.pkCrest18(TYPES[k].patch,false))&&PH.pkCrest18('rock',true)===null&&PH.pkCrest18('rock',false),'crested species: full crest bare-headed, short plumes under a hat (rockhopper keeps its own bare crest)');
ok(['african','humboldt','magellanic','galapagos','fiordland','yelloweye','king'].every(k=>PH.decals18(k)),'marks drawn as decals (bands, face stripes, ear patches)');

/* ========== 2. scout odds = code ========== */
{const keys=Object.keys(TYPE_W),sum=keys.reduce((a,k)=>a+TYPE_W[k],0);
 ok(sum===100&&keys.length===15&&nonEx.every(k=>TYPE_W[k]>0),'gacha weights: all 15 regular species, sum 100 ('+sum+')');
 // v21: the scout rolls a rarity first, then a penguin of that rarity (the shown per-penguin rate = rarity rate × share)
 const pk=PH.pickupNow().type,box=PH.oddsBox();let shown=0,allIn=true;
 for(const k of keys){const r=PH.typeRate(k);shown+=r;if(!box.includes(TYPES[k].name.replace(' 펭귄','')+' '+r.toFixed(2)+'%'))allIn=false;}
 ok(allIn,'odds box lists every species with the rate the code uses');ok(near(shown,100,1e-6),'shown species rates add up to 100% ('+shown.toFixed(2)+')');
 Math.random=realRnd;const N=40000;let worst=0;
 for(let g=0;g<5;g++){const c={};for(let i=0;i<N;i++){save.scout.pickMiss=false;const t=PH.pickType(g);c[t]=(c[t]||0)+1;}
   for(const k of PH.tierTypes(g))worst=Math.max(worst,Math.abs((c[k]||0)/N*100-PH.typeShare(k)));}
 ok(worst<.8,'within each rarity, 40,000 picks match the shown shares (largest gap '+worst.toFixed(2)+'%p)');}
{const at=d=>PH.pickupNow(new Date(2026,9,d)).type;
 ok(at(29)==='strong','this week (2026-10-26~11-01) keeps its pickup: 황제 (no surprise change on update)');
 const seen=new Set();for(let w=0;w<15;w++)seen.add(PH.pickupNow(new Date(2026,10,2+7*w)).type);
 ok(seen.size===15&&[...seen].every(k=>!TYPES[k].exclusive),'15 weekly pickups in a row cover all 15 species');
 ok(PH.pickupNow(new Date(2026,10,2)).type==='king'&&PH.pickupNow(new Date(2026,10,9)).type==='macaroni','next pickups: 임금 (11-02), 마카로니 (11-09)');}
{const t=PH.seasonRulesTxt(),n=g=>PH.tierTypes(g).length;ok(t.includes('레어 '+n(2)+'종')&&t.includes('신화 '+n(3)+'종')&&t.includes('전설 '+n(4)+'종'),'season reward text: a penguin of the reached rarity (레어 '+n(2)+' · 신화 '+n(3)+' · 전설 '+n(4)+')');}

/* ========== 3. skills ========== */
// King's Trumpet
{const {me,m1,m2}=scene('king',['basic','fast']);put(me,0,0,Math.PI/2);put(m1,3,0);put(m2,-14,0);
 m1.cd.dash=2;m1.cd.special=6;m2.fall=1.2;
 ok(PH.useSpecial(me)&&near(me.cd.special,SPX.trumpet.cd),'King uses 킹 트럼펫 (cooldown '+SPX.trumpet.cd+'s)');
 ok(m1.cd.dash===0&&near(m1.cd.special,6-SPX.trumpet.cut),'… mates: dash refilled, special cooldown −'+SPX.trumpet.cut+'s');
 ok(m2.fall<=.08,'… a fallen mate gets up at once');
 ok(me.rushT===SPX.trumpet.t&&m1.rushT===SPX.trumpet.t&&!(m2.rushT>0),'… the team within '+SPX.trumpet.r+'m skates faster for '+SPX.trumpet.t+'s (not the mate 14m away)');}
// speed boosts measured in the physics: rush ×1.2, shadow ×1.12, magellanic personality ×1.04
function topSpeed(type,setup){const {me}=scene(type,[]);for(const p of G.pengs)if(p!==me)p.frozen=true;put(me,-21,8,Math.PI/2);me.human=false;if(setup)setup(me);
  let v=0;for(let i=0;i<Math.round(1.6/H);i++){me.ix=1;me.iz=0;PH.movePeng(me,H);v=Math.max(v,Math.hypot(me.vx,me.vz));if(setup)setup(me);}return v;}
{const v0=topSpeed('humboldt'),v1=topSpeed('humboldt',p=>{p.rushT=9;});ok(near(v1/v0,SPX.rush,.01),'skill speed boost = ×'+SPX.rush+' ('+(v1/v0).toFixed(3)+')');
 const w0=topSpeed('fiordland'),w1=topSpeed('fiordland',p=>{p.shadowT=9;});ok(near(w1/w0,SPX.shadow.spd,.01),'forest shadow speed = ×'+SPX.shadow.spd+' ('+(w1/w0).toFixed(3)+')');
 const m1=topSpeed('magellanic'),keep=TT.magellanic.spd;TT.magellanic.spd=1;const m0=topSpeed('magellanic');TT.magellanic.spd=keep;ok(near(m1/m0,keep,.01),'마젤란 personality: top speed ×'+keep+' ('+(m1/m0).toFixed(3)+')');}
// Macaroni crest charge: the first opponent it runs into goes down and loses the puck
{const {me,o}=scene('macaroni',[]);for(const p of G.pengs)if(p!==me&&p!==o[0])p.frozen=true;put(me,0,0,Math.PI/2);put(o[0],2.2,0,-Math.PI/2);o[0].ai.think=99;
 G.carry=o[0];G.puck.x=o[0].x-.9;G.puck.z=0;
 ok(PH.useSpecial(me)&&me.ramT>0,'Macaroni uses 크레스트 돌격');let t=0;while(t<.6&&!(o[0].fall>0)){sim(H);t+=H;}
 ok(o[0].fall>0&&G.carry!==o[0],'… the first opponent hit falls and drops the puck ('+t.toFixed(2)+'s)');ok(!(me.ramT>0),'… one hit per charge');}
// Royal pass: nobody else can touch it; the receiver gets a long one-timer window and +12%
{const {me,m1,o,og}=scene('royal',['basic']);for(const p of G.pengs)p.frozen=!(p===me||p===m1||p===o[0]);
 put(me,-6,0,Math.PI/2);put(m1,6,0,-Math.PI/2);put(o[0],0,0,0);o[0].ai.think=99;m1.ai.think=0;
 G.puck.x=me.x+.95;G.puck.z=0;G.puck.vx=G.puck.vz=0;G.carry=me;
 const opp=o[0];let touched=false;const t0=G.t;
 ok(PH.useSpecial(me)&&G.royal&&G.royal.to===m1,'Royal uses 로열 패스 to the open mate');
 const v=Math.hypot(G.puck.vx,G.puck.vz);ok(v>20&&v<=SPX.royalpass.max+1e-6,'… a fast pass ('+v.toFixed(1)+' m/s, cap '+SPX.royalpass.max+')');
 for(let i=0;i<120&&!(G.carry===m1);i++){sim(H);if(G.puck.lastTeam===opp.team)touched=true;}
 ok(!touched&&G.carry===m1,'… flies through the opponent standing in the lane and reaches the mate ('+(G.t-t0).toFixed(2)+'s)');
 ok(m1.otWin===SPX.royalpass.win&&!G.royal,'… receiver gets a '+SPX.royalpass.win+'s one-timer window');
 // one-timer power: same shot 1.0 s after the catch, with and without the royal window (normal window is '+.75+'s)
 const shotSpeed=win=>{put(m1,6,0,Math.PI/2);G.carry=null;G.puck.x=6.9;G.puck.z=0;G.puck.vx=G.puck.vz=0;m1.recvT=G.t-1.0;m1.otWin=win;m1.cd.shoot=0;PH.pcReset();if(G.hype)G.hype.feverT=0;
   Math.random=()=>.5;PH.performShot(m1,1,0,.5);Math.random=realRnd;return Math.hypot(G.puck.vx,G.puck.vz);};
 const s0=shotSpeed(0),s1=shotSpeed(SPX.royalpass.win);ok(near(s1/s0,1.06*SPX.royalpass.mul,1e-6),'… a shot inside that window is a one-timer ×'+(1.06*SPX.royalpass.mul).toFixed(3)+' ('+(s1/s0).toFixed(3)+')');
 ok(!m1.otWin,'… the window is used up by the shot');}
{const {me}=scene('royal',['basic']);put(me,-10,5);G.puck.x=8;G.puck.z=-4;G.carry=null;
 ok(PH.useSpecial(me)&&near(me.cd.special,2.5)&&!G.royal,'royal pass without the puck: whiff, short 2.5s cooldown');}
// Forest shadow: no knock-downs, no strips
{const {me,o}=scene('fiordland',[]);put(me,0,0,Math.PI/2);ok(PH.useSpecial(me)&&me.shadowT===SPX.shadow.t,'Fiordland uses 숲 그림자 ('+SPX.shadow.t+'s)');
 ok(PH.knock(me,1)===false&&!(me.fall>0),'… can\'t be knocked down');
 const strip=()=>{G.carry=me;G.puck.x=me.x+(me.r+.42+.12);G.puck.z=0;put(o[0],G.puck.x+.6,0,-Math.PI/2);o[0].cd.catch=0;for(let i=0;i<240&&G.carry===me;i++){Math.random=()=>0;PH.carryStep(H);Math.random=realRnd;}return G.carry!==me;};
 ok(!strip(),'… keeps the puck with an opponent\'s stick on it');me.shadowT=0;ok(strip(),'… (without the skill the same opponent strips it)');}
// Golden eye: the next shot on goal goes to the corner away from the goalie
{const {me,og}=scene('yelloweye',[]);const gx=G.mine.dir*24;put(me,gx-G.mine.dir*12,2,G.mine.dir>0?Math.PI/2:-Math.PI/2);put(og,og.x,1.0);
 ok(PH.useSpecial(me)&&me.eyeT===SPX.keeneye.t,'Yellow-eyed uses 골든 아이 ('+SPX.keeneye.t+'s)');
 G.puck.x=me.x+G.mine.dir*1.0;G.puck.z=me.z;G.carry=null;PH.pcReset();
 PH.performShot(me,G.mine.dir,0,.6);const ang=Math.atan2(G.puck.vz,G.puck.vx),want=Math.atan2(-(2.8-.55)-G.puck.z,gx-G.puck.x);
 ok(near(ang,want,.02)&&!(me.eyeT>0),'… shot flies to the far corner from the goalie, no wobble (aim '+ang.toFixed(3)+' vs '+want.toFixed(3)+')');
 me.eyeT=5;me.cd.shoot=0;G.puck.x=me.x-G.mine.dir*1.0;G.puck.z=me.z;me.heading+=Math.PI;PH.performShot(me,-G.mine.dir,0,.6);
 ok(me.eyeT>0,'… a clearance away from the net keeps the golden eye for the next real shot');}
// Fairy hop: airborne, can't be hit, keeps going
{const {me,o}=scene('little',[]);put(me,0,0,Math.PI/2);ok(PH.useSpecial(me)&&me.hopT===SPX.hop.t&&Math.hypot(me.vx,me.vz)>=SPX.hop.v,'Little uses 요정 점프 (leap at '+SPX.hop.v+' m/s)');
 sim(SPX.hop.t/2);ok(PH.hopY18(me)>.5,'… mid-hop it is in the air ('+PH.hopY18(me).toFixed(2)+'m)');ok(PH.knock(me,1)===false,'… can\'t be knocked down');
 put(o[0],me.x,me.z+.3);const x0=o[0].x,z0=o[0].z;PH.pengCollisions();ok(o[0].x===x0&&o[0].z===z0,'… no body contact while airborne');sim(SPX.hop.t);ok(!(me.hopT>0)&&PH.hopY18(me)===0,'… lands after '+SPX.hop.t+'s');}
// Donkey bray: startles everyone within range
{const {me,o}=scene('african',[]);for(const p of G.pengs)if(!o.includes(p)&&p!==me)p.frozen=true;put(me,0,0);put(o[0],4,0);put(o[1],-6,3);put(o[2],10,0);
 o[1].charging=true;o[1].charge=.6;o[1].ai.plan={t:.2,c:.6};G.carry=o[0];G.puck.x=4.9;G.puck.z=0;
 ok(PH.useSpecial(me),'African uses 당나귀 울음');
 ok(o[0].slow>=SPX.bray.t&&o[1].slow>=SPX.bray.t&&!(o[2].slow>0),'… opponents within '+SPX.bray.r+'m are slowed for '+SPX.bray.t+'s (not the one at 10m)');
 ok(!o[1].charging&&!o[1].ai.plan,'… a shot wind-up is cut off');ok(G.carry!==o[0],'… the puck carrier drops the puck');}
// Humboldt current: the whole team, wherever they are
{const {me,m1,m2}=scene('humboldt',['basic','fast']);put(m2,-20,-10);ok(PH.useSpecial(me)&&[me,m1,m2].every(p=>p.rushT===SPX.current.t),'Humboldt uses 훔볼트 해류: the whole team is faster for '+SPX.current.t+'s');}
// Double dash: dash now + one free dash
{const {me}=scene('magellanic',[]);put(me,0,0,Math.PI/2);ok(PH.useSpecial(me)&&me.dashT>0&&me.dbl===1,'Magellanic uses 더블 대시 (first dash at once)');
 me.cd.dash=3;me.dashT=0;ok(PH.doDash(me)&&me.dashT>0&&me.dbl===0,'… second dash works even while the dash button is on cooldown');me.dashT=0;ok(!PH.doDash(me),'… only once');}
{const {m1}=scene('basic',['magellanic']);m1.human=false;put(m1,0,0,Math.PI/2);PH.useSpecial(m1);sim(.7);ok(m1.dbl===0,'AI fires its free second dash by itself');}
// Equator sun: the opposing goalie is dazzled, so more shots go in
{const {me,og}=scene('galapagos',[]);ok(PH.useSpecial(me)&&og.dazT===SPX.sunflare.t,'Galápagos uses 적도의 태양: opposing goalie dazzled for '+SPX.sunflare.t+'s');
 const lab=(daz,n)=>{let goals=0;for(let i=0;i<n;i++){scene('galapagos',[]);for(const p of G.pengs)if(!p.goalie)p.frozen=true;const g=G.mine.opp.goalie,gx=G.mine.dir*24;
   const z0=((i*7919)%600)/100-3,tz=((i*104729)%460)/100-2.3;g.dazT=daz?99:0;const pk=G.puck;pk.x=gx-G.mine.dir*13;pk.z=z0;const l=Math.hypot(gx-pk.x,tz-z0);pk.vx=(gx-pk.x)/l*23;pk.vz=(tz-z0)/l*23;pk.last=null;pk.lastTeam=G.mine;
   let t=0,sc=false;while(t<1.6){for(const p of G.pengs){p.ox=p.x;p.oz=p.z;}PH.simulate(H);G.t+=H;t+=H;if(G.state==='goal'){sc=G.scoredBy===G.mine;break;}}if(sc)goals++;}return goals/n;};
 Math.random=(()=>{let s=7;return()=>{s=(s*16807)%2147483647;return s/2147483647;};})();const r0=lab(false,240),r1=lab(true,240);Math.random=realRnd;
 ok(r1>r0+.05,'… shot lab (240 identical shots each): goal rate '+(r0*100).toFixed(0)+'% → '+(r1*100).toFixed(0)+'% when dazzled');}

/* ========== 4. AI uses every new skill ========== */
// (this loop drives simulate() directly, without the referee's whistle / faceoff states — the v22 referee is off here; v22test covers skills with it on)
{const rules0=save.set.rules;save.set.rules='off';const uses={};const lineups=[[['king','macaroni','royal'],['fiordland','yelloweye','little']],[['african','humboldt','magellanic'],['galapagos','king','macaroni']],[['royal','little','galapagos'],['african','fiordland','yelloweye']]];
 let bad=false,maxOut=0;
 for(let r=0;r<2;r++)for(const [a,b] of lineups){save.type=a[0];save.squad=[a[1],a[2],null];startMatch({mode:'quick',size:3,time:0,diff:'normal',oppTypes:b});G.state='play';
   for(const p of G.pengs)p.human=false;G.player=null;G.mine.human=null;
   for(let i=0;i<120*120;i++){for(const p of G.pengs){p.ox=p.x;p.oz=p.z;}PH.simulate(H);G.t+=H;
     for(const p of G.pengs){if(p.goalie)continue;if(p.cd.special>0&&!p.__c){p.__c=1;uses[p.type]=(uses[p.type]||0)+1;}if(p.cd.special<=0)p.__c=0;
       if(!isFinite(p.x)||!isFinite(p.z)||!isFinite(p.vx))bad=true;maxOut=Math.max(maxOut,Math.abs(p.x)-24,Math.abs(p.z)-13);}
     if(!isFinite(G.puck.x)||!isFinite(G.puck.vx))bad=true;if(G.state==='goal'){PH.resetPositions();G.state='play';}}}
 ok(NEW18.every(k=>uses[k]>0),'AI uses every new skill in 2-minute AI matches ('+NEW18.map(k=>k+' '+(uses[k]||0)).join(', ')+')');save.set.rules=rules0;
 ok(!bad&&maxOut<.6,'no NaN, nobody leaves the rink (max '+maxOut.toFixed(2)+'m past the boards)');}

/* ========== 5. personalities ========== */
{const pc=(s,v)=>{const m=s.match(/([+-]?\d+(?:\.\d+)?)/);return m?+m[1]:NaN;};const rows=[
  ['king','plus','fall',x=>1-pc(x)/100],['king','minus','chg',x=>1+pc(x)/100],['macaroni','plus','hit',x=>1+pc(x)/100],['macaroni','minus','spread',x=>1-pc(x)/100],
  ['royal','plus','pass',x=>1+pc(x)/100],['royal','minus','pow',x=>1+pc(x)/100],['fiordland','plus','reach',x=>pc(x)],['fiordland','minus','dashCd',x=>pc(x)],
  ['yelloweye','plus','spread',x=>1-pc(x)/100],['yelloweye','minus','chg',x=>1+pc(x)/100],['little','plus','dashCd',x=>pc(x)],['little','minus','pow',x=>1+pc(x)/100],
  ['african','plus','steal',x=>1+pc(x)/100],['african','minus','pass',x=>1+pc(x)/100],['humboldt','plus','ot',x=>1+pc(x)/100],['humboldt','minus','fall',x=>1+pc(x)/100],
  ['magellanic','plus','spd',x=>1+pc(x)/100],['magellanic','minus','pow',x=>1+pc(x)/100],['galapagos','plus','tap',x=>1+pc(x)/100],['galapagos','minus','fall',x=>1+pc(x)/100]];
 const bad=rows.filter(([k,f,h,fn])=>!near(fn(TT[k][f]),TT[k][h],1e-9)).map(r=>r[0]+'.'+r[2]);ok(!bad.length,'every personality text matches the number the code uses'+(bad.length?' '+bad:''));}
// Macaroni body checks hit 20% harder: a bump that a normal penguin survives knocks the other one down
{const bump=type=>{const {me,o}=scene(type,[]);for(const p of G.pengs)if(p!==me&&p!==o[0])p.frozen=true;put(me,0,0);put(o[0],me.r+o[0].r-.02,0);o[0].vx=-7.6;me.dashT=o[0].dashT=0;Math.random=()=>.5;PH.pengCollisions();Math.random=realRnd;return o[0].fall>0;};
 ok(bump('macaroni')&&!bump('magellanic'),'마카로니 몸싸움 +20%: the same bump knocks the opponent down only from a macaroni (same body stat 4)');}
// African steals 25% more often (same body+turn as magellanic)
{const steal=type=>{const {me,o}=scene('basic',[],[type,'basic','basic']);for(const p of G.pengs)if(p!==me&&p!==o[0])p.frozen=true;put(me,0,0,Math.PI/2);G.carry=me;G.puck.x=me.r+.42+.12;G.puck.z=0;put(o[0],G.puck.x+.6,0,-Math.PI/2);o[0].cd.catch=0;
   Math.random=()=>.03;PH.carryStep(H);Math.random=realRnd;return G.carry===o[0];};
 ok(steal('african')&&!steal('magellanic'),'아프리카 퍽 빼앗기 +25%: at the same roll only the African strips the puck');}
// Galápagos tap shot +15%
{const tap=type=>{const {me}=scene(type,[]);put(me,0,0,Math.PI/2);G.puck.x=1;G.puck.z=0;G.carry=null;PH.pcReset();if(G.hype)G.hype.feverT=0;Math.random=()=>.5;PH.performShot(me,1,0,.05);Math.random=realRnd;return Math.hypot(G.puck.vx,G.puck.vz);};
 const g=tap('galapagos'),pw=G.mine.skaters[0].ty.stats.power;   // power incl. the position-fit bonus
 ok(near(g,(10.5+pw*.9)*TT.galapagos.tap,1e-6),'갈라파고스 톡 슛 +15%: '+g.toFixed(3)+' m/s = (10.5+'+pw.toFixed(1)+'×0.9)×1.15');}

/* ========== 6. chemistry ========== */
{const chem=(a,b)=>{save.types=ks.slice();save.type=a;save.squad=[b,null,null];return PH.computeChem(2).active;};
 ok(chem('strong','king').includes('great'),'황제 + 임금 → 거인 형제');ok(chem('african','galapagos').includes('banded'),'2 banded penguins → 줄무늬 패밀리');
 ok(chem('basic','fast').includes('brush'),'아델리 + 젠투 → 남극 토박이');ok(chem('yelloweye','little').includes('kiwi'),'노란눈 + 쇠푸른 → 뉴질랜드 친구들');
 ok(chem('balanced','fiordland').includes('crested')&&chem('fiordland','little').includes('kiwi')&&!chem('fiordland','little').includes('crested'),'피오르드랜드 belongs to both the crested and the New Zealand group');
 ok(NEW18.every(k=>PH.SYN.some(s=>s.link&&s.link.includes(k))),'every new species is part of a chemistry (shown on its card)');}

/* ========== 7. achievements, UI texts, opponents ========== */
{const A=PH.ACH.find(a=>a.id==='a_allpeng'),B=PH.ACH.find(a=>a.id==='a_allpeng2');save.types=['basic','king','little'];
 ok(A&&A.n===5&&A.prog()===1,'펭귄 수집가 = the original five');ok(B&&B.n===15&&B.desc.includes('15')&&B.prog()===3,'펭귄 박사: unlock all 15 ('+B.desc+')');}
{const ok1=NEW18.every(k=>PH.spLine18(k).includes(SPECIALS[TYPES[k].special])&&PH.fact18(k).length>20);ok(ok1,'card detail: skill line + real fact for every new species');
 const X=SPX;ok(PH.spDesc('trumpet').includes(X.trumpet.cut+'초')&&PH.spDesc('trumpet').includes(X.trumpet.r+'m')&&PH.spDesc('bray').includes(X.bray.r+'m')&&PH.spDesc('royalpass').includes(X.royalpass.win+'초')&&PH.spDesc('keeneye').includes('+'+Math.round((X.keeneye.mul-1)*100)+'%')&&PH.spDesc('current').includes('+'+Math.round((X.rush-1)*100)+'%'),'skill descriptions show the code numbers');
 save.types=['basic'];const dex=PH.scDexHtml();ok((dex.match(/data-card="/g)||[]).length===16&&(dex.match(/class="pc-sil"/g)||[]).length===14&&dex.includes('pc-backface'),'dex: 16 entries, unowned regular species as silhouettes, the secret one as "?"');}
{const seen=new Set();for(let i=0;i<300;i++)PH.oppMix18().forEach(k=>seen.add(k));ok(seen.size===15&&!seen.has('auk'),'quick / free match opponents come from all 15 species');
 const ds=new Set();for(let i=0;i<300;i++)ds.add(PH.demo18());ok(ds.size===15,'menu background match shows every species');
 ok(PH.TOUR[2].types.join()==='king,macaroni,strong','tournament final team "Frost Kings" has king penguins');}
{save.news18=false;window.__NOFX=false;G.ui='sMenu';G.view='menu';const shown=PH.news18Popup();window.__NOFX=true;ok(shown&&save.news18===true,'one-time news for an existing save, then marked as seen');ok(PH.news18Popup()===false,'… never twice');}
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
