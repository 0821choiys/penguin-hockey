// v45 stick workshop + v46 kit designer: the numbers, the odds on screen = the code, the save, a real match
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,save,step,startMatch,STK,STK_M}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
save.set.rules='off';save.set.items=false;save.set.events=false;
const fresh=()=>{save.stk={m:{},seen:{},list:[],eq:0,nu:1,pity:{s:0,b:0},pulls:0,free:'',hist:[]};};
const R0=Math.random;
// ---------- the materials ----------
for(const p of['s','b']){const ids=Object.keys(STK_M).filter(k=>k[0]===p),g=[0,0,0,0,0],st={P:0,S:0,C:0};ids.forEach(k=>{g[STK_M[k].g]++;st[STK_M[k].st]++;});
  ok(ids.length===10&&g.join()==='3,3,2,1,1'&&st.P>=3&&st.S>=3&&st.C>=3,(p==='s'?'shafts':'blades')+': 10 materials, grades 3·3·2·1·1 like the penguin pyramid, every style at least 3 times '+g.join()+' '+JSON.stringify(st));}
// ---------- the odds: what the screen says = what the code rolls ----------
fresh();
for(const p of['s','b']){const pr=PH.stkProbs(p,0),sum=pr.reduce((a,v)=>a+v,0),ids=Object.keys(STK_M).filter(k=>k[0]===p),ms=ids.reduce((a,k)=>a+PH.stkMatRate(k,0),0);
  ok(Math.abs(sum-100)<1e-9&&Math.abs(ms-100)<1e-9&&pr.map(v=>v.toFixed(2)).join()===STK.odds.map(v=>v.toFixed(2)).join(),p+': grade odds '+pr.map(v=>v.toFixed(2)).join('/')+' and the per-material odds add up to 100 %');
  const html=PH.stkOddsBox(p),txt=html.replace(/<[^>]+>/g,' ');
  const miss=ids.filter(k=>!txt.includes(PH.STK_M[k].n+' '+(Math.round(PH.stkMatRate(k,0)*100)/100).toFixed(2)+'%'));
  ok(miss.length===0,p+': the odds box lists every material with the rate the code uses '+miss.join());
  const e=PH.stkEff();ok(GRADES_ok(txt,e),p+': the odds box shows the long-run rates with the pity ('+e.map(v=>v.toFixed(2)).join('/')+')');}
function GRADES_ok(txt,e){return e.every(v=>txt.includes((Math.round(v*100)/100).toFixed(2)+'%'));}
// monte carlo: grades without the pity, then the long run with the pity
{fresh();const N=60000,c=[0,0,0,0,0];for(let i=0;i<N;i++){save.stk.pity.s=0;c[STK_M[PH.stkRoll('s',0)].g]++;}
 const okc=c.every((n,g)=>{const p=STK.odds[g]/100,sd=Math.sqrt(N*p*(1-p));return Math.abs(n-N*p)<4.5*sd;});
 ok(okc,'60 000 rolls without the pity follow 50/30/14/5/1 % ('+c.map(n=>(n/N*100).toFixed(2)).join('/')+')');
 fresh();const M=120000,d=[0,0,0,0,0],per={};for(let i=0;i<M;i++){const r=PH.stkDrawOnce('b',0);d[r.g]++;per[r.id]=(per[r.id]||0)+1;}
 const e=PH.stkEff(),okd=d.every((n,g)=>Math.abs(n/M*100-e[g])<Math.max(.25,e[g]*.06));
 ok(okd,'120 000 single draws with the pity match the shown long-run rates '+d.map(n=>(n/M*100).toFixed(2)).join('/')+' vs '+e.map(v=>v.toFixed(2)).join('/'));
 const g0=['b0','b1','b2'].map(k=>per[k]/M*100);ok(Math.max(...g0)-Math.min(...g0)<1,'materials of one grade come equally often ('+g0.map(v=>v.toFixed(2)).join('/')+')');}
// pity
fresh();save.stk.pity.s=STK.hard-1;{const pr=PH.stkProbs('s',0);ok(pr[0]===0&&pr[1]===0&&pr[2]===0&&Math.abs(pr[3]-83.333)<.01&&Math.abs(pr[4]-16.667)<.01,'the '+STK.hard+'th draw: 신화 83.33 % / 전설 16.67 %, nothing lower');
  const html=PH.stkPullHtml();ok(/이번 뽑기 신화 이상 확정/.test(html),'…and the draw tab says so');
  const r=PH.stkDrawOnce('s',0);ok(r.g>=3&&save.stk.pity.s===0,'the pity draw gives '+r.g+' and resets the counter');
  ok(save.stk.pity.b===0,'the blade counter is separate');}
// 10 draws: guarantee, cost, free draw
fresh();save.points=1000;Math.random=()=>.01;{const res=PH.stkDraw('s',10);Math.random=R0;
  ok(res.length===10&&res.slice(0,9).every(r=>r.g===0)&&res[9].g>=STK.tenMin&&save.points===1000-STK.cost10,'10 draws with nine 기본: the tenth is '+res[9].g+' (레어 or better), '+STK.cost10+' P paid');}
fresh();save.points=100;{const a=PH.stkDraw('b',1),p1=save.points,b=PH.stkDraw('b',1);ok(a&&b&&p1===100&&save.points===100-STK.cost1,'the first single draw of the day is free, the next costs '+STK.cost1+' P');}
fresh();save.points=5;save.stk.free=PH.todayKeyX?PH.todayKeyX():save.stk.free;{save.stk.free='x';const s=JSON.stringify(save.stk);const r=PH.stkDraw('s',10);ok(r===null&&save.points===5&&JSON.stringify(save.stk)===s,'not enough points: nothing happens');}
// stack cap → refund
fresh();save.stk.m.s9=STK.cap;save.points=0;Math.random=()=>.995;{const r=PH.stkDrawOnce('s',0);Math.random=R0;ok(r.id==='s9'&&save.stk.m.s9===STK.cap&&save.points===STK.refund[4]&&r.ovf===STK.refund[4],'a full stack ('+STK.cap+') turns the copy into '+STK.refund[4]+' P');}
// ---------- the sticks: every combination has stats and an ability ----------
{const S=Object.keys(STK_M).filter(k=>k[0]==='s'),B=Object.keys(STK_M).filter(k=>k[0]==='b');let n=0,bad=[];const abs=new Set();
 for(const s of S)for(const b of B){const c=PH.stkCalc({s,b,lv:0}),c10=PH.stkCalc({s,b,lv:10});n++;abs.add(c.ab.k);
   if(c.ab.key!==STK_M[s].st+STK_M[b].st)bad.push(s+b+' key');
   if(!(c10.ab.v>c.ab.v&&c10.pt.P>c.pt.P&&c10.fx.chg>c.fx.chg))bad.push(s+b+' level');
   if(c.g!==Math.round((STK_M[s].g+STK_M[b].g)/2))bad.push(s+b+' grade');
   const d=PH.stkAbDesc(c.ab);if(!d.includes(String(c.ab.v)))bad.push(s+b+' desc '+d);}
 ok(n===100&&abs.size===9&&bad.length===0,'100 combinations, 9 abilities, the ability follows the two styles, grows with the level, its text shows its number '+bad.slice(0,3).join(' | '));
 const lo=PH.stkCalc({s:'s0',b:'b0',lv:0}),hi=PH.stkCalc({s:'s9',b:'b8',lv:0});ok(hi.pt.P>lo.pt.P&&hi.ab.v>lo.ab.v,'better materials make a stronger stick (P '+lo.pt.P+' → '+hi.pt.P+', ability '+lo.ab.v+' → '+hi.ab.v+')');}
// the stick on top of the personality
{const c=PH.stkCalc({s:'s9',b:'b0',lv:5}),t=PH.stkTT('fast',c);   // P×P = cannon
 ok(c.ab.k==='cannon'&&Math.abs(t.chg-1.15*(1+c.fx.chg/100))<1e-9&&Math.abs(t.pow-.94*(1+c.fx.pow/100))<1e-9&&Math.abs(t.pow80-(1+c.ab.v/100))<1e-9,'젠투 + a cannon stick: charge ×1.15×'+(1+c.fx.chg/100).toFixed(3)+', power ×0.94×'+(1+c.fx.pow/100).toFixed(3)+', ≥80 % shots ×'+(1+c.ab.v/100).toFixed(3));
 const r=PH.stkTT('defense',PH.stkCalc({s:'s1',b:'b5',lv:0}));ok(Math.abs(r.reach-(.25+PH.stkCalc({s:'s1',b:'b5',lv:0}).ab.v))<1e-9,'ranges add: 턱끈 0.25 m + 긴 팔 '+PH.stkCalc({s:'s1',b:'b5',lv:0}).ab.v+' m');}
// craft / equip / upgrade / take apart
fresh();save.points=1000;save.stk.m={s3:1,b4:1};{const c0=PH.stkCraftCost('s3','b4'),x=PH.stkCraft('s3','b4');
  ok(x&&save.stk.list.length===1&&save.stk.eq===x.u&&save.stk.m.s3===0&&save.stk.m.b4===0&&save.points===1000-c0,'craft: uses one of each, costs '+c0+' P, the first stick is equipped');
  ok(PH.stkCraft('s3','b4')===null,'no materials left: no second stick');
  ok(PH.stkEnhRate(x)===Math.min(100,STK.enh[0]+STK.enhG[1]),'upgrade rate +0→+1: '+PH.stkEnhRate(x)+' % ('+STK.enh[0]+' + grade bonus '+STK.enhG[1]+', capped at 100)');
  x.lv=5;Math.random=()=>.9999;let r=PH.stkEnhance(x.u);ok(r&&!r.ok&&x.lv===5&&x.f===1&&PH.stkEnhRate(x)===STK.enh[5]+STK.enhG[1]+STK.failB,'a failure keeps +5 and adds +'+STK.failB+' %p ('+PH.stkEnhRate(x)+' %)');
  x.f=STK.pity;ok(PH.stkEnhRate(x)===100,STK.pity+' failures in a row: the next try is 100 %');
  Math.random=()=>0;r=PH.stkEnhance(x.u);Math.random=R0;ok(r.ok&&x.lv===6&&x.f===0,'success: +6, the fail count resets');
  x.lv=10;ok(PH.stkEnhRate(x)===0&&PH.stkEnhance(x.u)===null,'+10 is the top');
  const m0=JSON.stringify(save.stk.m);const b=PH.stkBreak(x.u);ok(b&&save.stk.list.length===0&&save.stk.eq===0&&save.stk.m.s3===1&&save.stk.m.b4===1,'taking it apart gives both materials back and unequips it');
  const p0=save.points,got=PH.stkSell('s3',1);ok(got===STK.refund[1]&&save.points===p0+got&&save.stk.m.s3===0,'a spare 희귀 material sells for '+STK.refund[1]+' P');}
fresh();save.points=99999;save.stk.m={s0:20,b0:20};for(let i=0;i<20;i++)PH.stkCraft('s0','b0');ok(save.stk.list.length===STK.max,'at most '+STK.max+' sticks');
// the screen texts use the same numbers
fresh();save.points=500;save.stk.m={s7:1,b6:1};{const x=PH.stkCraft('s7','b6');const c=PH.stkCalc(x),h=PH.stkMineHtml().replace(/<[^>]+>/g,' ');
  ok(h.includes(c.name)&&h.includes(c.pt.P.toFixed(1))&&h.includes(PH.stkAbDesc(c.ab))&&h.includes('성공 '+PH.stkEnhRate(x)+'%')&&h.includes(PH.stkEnhCost(0)+'P'),'my-stick tab: name, stats, ability text, the upgrade rate and cost are the code’s numbers');}
// ---------- in a match ----------
fresh();save.points=500;save.stk.m={s9:1,b9:1};const X=PH.stkCraft('s9','b9');
startMatch({mode:'quick',size:3,time:60,diff:'normal',oppTypes:['basic','fast','strong'],tag:'T'});for(let i=0;i<60*4&&G.state!=='play';i++)step(1/60);
{const cap=G.mine.skaters[0],mate=G.mine.skaters[1],opp=G.mine.opp.skaters[0],c=PH.stkCalc(X);
 ok(cap.tt&&PH.ttOf(cap)===cap.tt&&Math.abs(cap.tt.ot-(1+c.ab.v/100))<1e-9&&cap.tt.otw===c.ab.w,'the captain carries the equipped stick (one-timer ×'+(1+c.ab.v/100)+', window +'+c.ab.w+' s)');
 ok(!mate.tt&&!opp.tt,'team-mates and opponents keep their own numbers');
 for(let i=0;i<60*20;i++)step(1/60);ok(errs.length===0,'20 s of play with the stick: no errors '+errs.slice(0,2).join(' | '));}
startMatch({mode:'friend',size:3,time:60,diff:'normal',oppTypes:['basic','fast','strong'],tag:'T',flat:true});
ok(!G.mine.skaters[0].tt,'online friend matches are flat: no stick numbers');
startMatch({mode:'quick',size:3,time:60,diff:'normal',oppTypes:['basic','fast','strong'],tag:'T'});
// the one-timer window really is wider: a shot 0.75 + w/2 s after receiving counts as a one-timer
{const cap=G.mine.skaters[0];for(let i=0;i<60*4&&G.state!=='play';i++)step(1/60);const pk=G.puck;
 const shoot=(dt)=>{cap.recvT=G.t-dt;pk.x=cap.x+Math.sin(cap.heading)*1;pk.z=cap.z+Math.cos(cap.heading)*1;pk.vx=pk.vz=0;cap.cd.shoot=0;G.carry=null;PH.performShot(cap,1,0,.5);return !!(pk.shot&&pk.shot.oneT);};
 const w=PH.stkCalc(X).ab.w;ok(shoot(.75+w/2)===true&&shoot(.75+w+.05)===false,'one-timer window = 0.75 + '+w+' s with the stick');}
// ---------- the save ----------
{const cp=require('child_process');const bad={v:10,points:10,stk:{m:{s0:5,zz:3,b9:500},seen:{s0:1,'<x>':1},list:[{u:3,s:'s0',b:'b9',lv:99,f:-4},{u:3,s:'s1',b:'b1'},{u:'x',s:'b1',b:'s1'},{u:7,s:'s2',b:'s2'}],eq:3,nu:-5,pity:{s:999,b:'q'},pulls:1e12,free:'2026-11-14',hist:[['s0',9],['qq',1],5]},
   kit:{on:1,c1:'#FF3B4E',c2:'javascript:',pat:'<b>',crest:'shield',mas:'orca'}};
 const out=cp.execFileSync('node',['-e',"const P=require('./harness.js');console.log(JSON.stringify({stk:P.save.stk,kit:P.save.kit,k:P.kit()}));process.exit(0)"],{env:Object.assign({},process.env,{SAVE:JSON.stringify(bad)}),cwd:__dirname}).toString().trim().split('\n').pop();
 const o=JSON.parse(out),s=o.stk;
 ok(s.m.s0===5&&!('zz' in s.m)&&s.m.b9===99&&s.list.length===1&&s.list[0].lv===10&&s.list[0].f===0&&s.eq===3&&s.nu===4&&s.pity.s===29&&s.pity.b===0&&s.hist.length===1&&s.hist[0][1]===4&&!('<x>' in s.seen),'a broken stick save is cleaned: '+JSON.stringify(s).slice(0,160));
 ok(o.kit.on===1&&o.kit.c1==='#ff3b4e'&&o.kit.c2==='#ffffff'&&o.k.pat==='classic'&&o.k.crest==='shield'&&o.k.mas==='orca','a broken kit save is cleaned: '+JSON.stringify(o.k));
 const out2=cp.execFileSync('node',['-e',"const P=require('./harness.js');console.log(JSON.stringify({stk:P.save.stk,kit:P.save.kit}));process.exit(0)"],{env:Object.assign({},process.env,{SAVE:JSON.stringify({v:10,points:50,types:['basic']})}),cwd:__dirname}).toString().trim().split('\n').pop();
 const o2=JSON.parse(out2);ok(o2.stk.m.s0===1&&o2.stk.m.b2===1&&o2.stk.list.length===0&&o2.kit.on===0,'an old save gets the starter pair (자작나무 + 포플러) and the standard kit');}
// ---------- the kit ----------
{const K=PH.KIT;save.team='blue';save.kit={on:0,c1:'#2f7bff',c2:'#ffffff',pat:'classic',crest:'circle',mas:'peng'};PH.kitSync();
 ok(PH.TEAM.blue.color===0x2f7bff&&PH.TEAM.red.color===0xff3b4e&&!PH.kitFor('blue'),'kit off: the standard blue / red');
 save.kit={on:1,c1:'#18a058',c2:'#ffd24a',pat:'hoops',crest:'hex',mas:'orca'};PH.kitSync();
 ok(PH.TEAM.blue.color===0x18a058&&PH.TEAM.red.color===0xff3b4e&&PH.kitFor('blue').mas==='orca'&&!PH.kitFor('red'),'kit on: our side is green, the other side stays red');
 const keys=Object.keys(PH.pkGeoC||{}).filter(k=>/blue/.test(k));ok(true,'(cache keys with the old colour: '+keys.length+')');
 save.kit=Object.assign({},save.kit,{c1:'#c8102e'});PH.kitSync();
 ok(PH.kitDist(PH.TEAM.blue.color,PH.TEAM.red.color)>=K.clash&&PH.TEAM.blue.color===0xc8102e,'our red kit vs the red team: the other side changes colour (now #'+PH.TEAM.red.color.toString(16)+')');
 save.team='red';save.kit=Object.assign({},save.kit,{c1:'#2f7bff'});PH.kitSync();
 ok(PH.TEAM.red.color===0x2f7bff&&PH.kitDist(PH.TEAM.blue.color,PH.TEAM.red.color)>=K.clash,'playing as red in a blue kit: the blue side changes (#'+PH.TEAM.blue.color.toString(16)+')');
 save.team='blue';
 // online: both devices compute the same colours from the same two kits
 const A={on:1,c1:'#2f7bff',c2:'#ffd24a',pat:'sash',crest:'circle',mas:'bear'},B={on:1,c1:'#00a3e0',c2:'#ffffff',pat:'split',crest:'shield',mas:'fox'};
 const net=PH.NET||null;const peer=(k)=>{if(net){net.peer={kit:k};}};
 if(net){save.kit=A;peer(B);const h=PH.kitSync({net:'host',netTeam:'blue'}),hb=PH.kitFor('blue'),hr=PH.kitFor('red');
   save.kit=B;peer(A);const g=PH.kitSync({net:'guest',netTeam:'red'}),gb=PH.kitFor('blue'),gr=PH.kitFor('red');
   ok(h.blue===g.blue&&h.red===g.red&&PH.kitSig(hb)===PH.kitSig(gb)&&PH.kitSig(hr)===PH.kitSig(gr)&&PH.kitDist(h.blue,h.red)>=K.clash,'online: host and guest pick the same colours for both kits (blue #'+h.blue.toString(16)+' / red #'+h.red.toString(16)+')');
   save.kit=A;peer(null);PH.kitSync({net:'host',netTeam:'blue'});ok(PH.kitFor('blue').mas==='bear'&&!PH.kitFor('red'),'online, a friend without a custom kit: they wear the standard colour');}
 else ok(false,'NET not exported');
 save.kit=A;ok(JSON.stringify(PH.netInfo().kit)===JSON.stringify(PH.kitNet())&&PH.netInfo().kit.mas==='bear','the kit travels with the player info');
 ok(PH.kitAcc({c1:'#18a058',c2:'#ffffff'})==='#18a058'&&PH.kitAcc({c1:'#18a058',c2:'#ff7a1a'})==='#ff7a1a'&&PH.kitAcc({c1:'#18a058',c2:'#ffd24a'})==='#18a058','crest accent on the white field: the accent colour, or the main colour when the accent is white / pale yellow');
 const cl=PH.kitClean({on:1,c1:'#123456',c2:'#ffd24a',pat:'x',crest:'hex',mas:'owl'});ok(cl.c1===K.c1[0]&&cl.c2==='#ffd24a'&&cl.pat==='classic'&&cl.crest==='hex','only colours from the palette are accepted (a friend’s message too)');
 save.kit={on:1,c1:'#8a4dff',c2:'#ffffff',pat:'chevron',crest:'shield',mas:'flake'};PH.kitSync();
 startMatch({mode:'quick',size:3,time:60,diff:'normal',oppTypes:['basic','fast','strong'],tag:'T'});for(let i=0;i<60*3;i++)step(1/60);
 ok(PH.TEAM.blue.color===0x8a4dff&&errs.length===0,'a match in a purple kit runs without errors');
 const svg=PH.kitJerseySvg(PH.kit(),false,7)+PH.kitJerseySvg(PH.kit(),true,7,'펭귄 FC')+PH.kitCrestSvg(PH.kit());ok(/<svg/.test(svg)&&!/undefined|NaN/.test(svg),'jersey and crest drawings build');
 save.kit={on:0,c1:'#2f7bff',c2:'#ffffff',pat:'classic',crest:'circle',mas:'peng'};PH.kitSync();}
console.log('runtime errors: '+errs.length);errs.slice(0,3).forEach(e=>console.log('  '+e));
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
