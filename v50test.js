// v50 그래픽 초고사양 / 초저사양 (owner, 2026-11-23: "low-end phones lag too much — add 초고사양 and 초저사양")
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,save}=PH;const cp=require('child_process');
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const {GQ}=PH;
ok(save.set.qx===0&&PH.gqX()===0&&PH.gqLevel()===save.set.quality,'a new save: no extra step, the level is the old setting ('+PH.gqLevel()+')');
ok(GQ.order.join()==='max,ultra,high,low,xlow','five steps: 초고사양 · 최고 · 높음 · 절약 · 초저사양 ('+GQ.order.map(PH.gqName).join(' · ')+')');
const rt=GQ.order.map(l=>{PH.gqSet(l);return [l,save.set.quality,save.set.qx,PH.gqLevel()];});
ok(rt.every(r=>r[0]===r[3])&&rt[0][1]==='ultra'&&rt[0][2]===1&&rt[4][1]==='low'&&rt[4][2]===-1&&rt.slice(1,4).every(r=>r[2]===0&&r[1]===r[0]),'each step stores the old quality + qx and reads back ('+rt.map(r=>r[0]+'='+r[1]+'/'+r[2]).join(' ')+')');
PH.gqSet('xlow');ok(PH.pkLo()===true&&PH.rkLo()===true,'초저사양 is 절약 everywhere the code checks 절약 (low-poly penguins, small ice texture …) and more');
PH.gqSet('max');ok(save.set.quality==='ultra'&&PH.gqX()===1,'초고사양 is 최고 everywhere the code checks 최고, and more');
save.set.qx=1;save.set.quality='low';ok(PH.gqX()===0&&PH.gqLevel()==='low','a stray +1 on another level means nothing (only 최고 + 1 = 초고사양)');
// resolution per step (devicePixelRatio 3 phone)
global.devicePixelRatio=3;const ratio=l=>{PH.gqSet(l);return PH.gqRatio();};
ok(ratio('xlow')===GQ.xlow.scale&&ratio('low')===1&&ratio('high')===2&&ratio('ultra')===2&&ratio('max')===3,'render resolution: 초저 ×0.75 · 절약 ×1 · 높음 / 최고 up to ×2 · 초고 up to ×3 (on a 3× screen)');
global.devicePixelRatio=1.5;ok(ratio('max')===1.5&&ratio('ultra')===1.5,'never above the screen itself (1.5× screen → 1.5)');global.devicePixelRatio=1;
// what the setting row says = the code
{const d=l=>PH.gqDesc(l).replace(/<[^>]+>/g,'');
 ok(d('xlow').includes(String(Math.round(GQ.xlow.scale*100)))&&d('xlow').includes(String(GQ.xlow.fps)),'초저사양 text: “'+d('xlow')+'”');
 ok(d('max').includes(String(GQ.max.dpr))&&d('max').includes(String(GQ.max.fur))&&d('max').includes('4096'),'초고사양 text: “'+d('max')+'”');
 ok(d('ultra').includes('4096')&&d('high').includes('3072')&&d('low').includes('1024'),'shadow-map sizes in the text = shMapSize (최고 4096 · 높음 3072 · 절약 1024)');
 {const q0=save.set.quality,R=PH.renderer,c0=R.capabilities,s0=PH.perf.scale;R.capabilities={maxTextureSize:8192};PH.perf.scale=1;const sz=['low','high','ultra'].map(q=>{save.set.quality=q;return PH.shMapSize();});save.set.quality=q0;R.capabilities=c0;PH.perf.scale=s0;   // (v29 is minified since 2026-11-24: ask the function, not its text)
  ok(sz.join()==='1024,3072,4096','… and shMapSize really uses those sizes ('+sz.join(' · ')+')');}}
ok(/gqRatio\(\)\*perf\.scale/.test(PH.applyQuality.toString())&&/gqScene\(\)/.test(PH.applyQuality.toString()),'applyQuality sets the resolution from the step (× the automatic step-down) and switches the scene');
// 30 fps: a refresh is skipped when the last frame is younger than 1/30 s
{PH.gqSet('xlow');const t=PH.gqLastT();const a=PH.gqSkip(t+.01),b=PH.gqSkip(t+.031),c=PH.gqSkip(t+.04);PH.gqSet('low');const d=PH.gqSkip(t+.01);
 ok(a&&!b&&!c&&!d,'초저사양 draws at most 30 frames a second (10 ms after a frame: skip; 31 ms / 40 ms: draw); other steps never skip');}
// the one-time hint
{save.gqHint=0;PH.GQH.shown=false;PH.gqSet('ultra');PH.startMatch({mode:'quick',size:3,time:120,diff:'normal',oppTypes:['basic','fast','king'],tag:'q',oppName:'R',label:'R'});G.state='play';G.net='';
 const P=PH.perf;P.scale=.6;P.ema=1/20;for(let i=0;i<3;i++)PH.gqHintFrame(1);const early=PH.GQH.shown;for(let i=0;i<2;i++)PH.gqHintFrame(1);
 ok(!early&&PH.GQH.shown&&save.gqHint===1,'a struggling phone (step-down at its floor, still slow for 4 s of play) gets the 초저사양 hint once');
 PH.GQH.shown=false;PH.gqHintFrame(9);ok(!PH.GQH.shown,'… never again after that (saved)');
 save.gqHint=0;PH.GQH.shown=false;PH.GQH.t=0;P.ema=1/60;for(let i=0;i<9;i++)PH.gqHintFrame(1);ok(!PH.GQH.shown,'a phone that keeps up never sees it');
 P.ema=1/20;PH.gqSet('xlow');for(let i=0;i<9;i++)PH.gqHintFrame(1);ok(!PH.GQH.shown,'not on 초저사양 already');
 PH.gqSet('ultra');G.net='host';for(let i=0;i<9;i++)PH.gqHintFrame(1);ok(!PH.GQH.shown,'not in an online match');G.net='';P.scale=1;P.ema=1/60;save.gqHint=0;}
// the far colonies can be hidden (the crowd keeps its parts)
ok(Array.isArray(PH.colony.parts)&&PH.colony.parts.length>0,'the far penguin colonies expose their meshes ('+PH.colony.parts.length+' parts)');
// save
const load=s=>JSON.parse(cp.execFileSync(process.execPath,['-e',"const P=require('./harness.js');process.stdout.write(JSON.stringify([P.save.set.quality,P.save.set.qx,P.gqLevel()]));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(s)}),encoding:'utf8',stdio:['ignore','pipe','ignore']}));
const base={v:10,gfx19:true,tut:{done:true,asked:true}};
{const a=load(Object.assign({set:{quality:'low',qx:-1}},base)),b=load(Object.assign({set:{quality:'ultra',qx:1}},base)),c=load(Object.assign({set:{quality:'high',qx:5}},base)),d=load(Object.assign({set:{quality:'low'}},base));
 ok(a[2]==='xlow'&&b[2]==='max','초저사양 / 초고사양 load back ('+a+' | '+b+')');ok(c[1]===0&&c[2]==='high'&&d[1]===0&&d[2]==='low','a broken qx or an old save → the old setting alone ('+c+' | '+d+')');}
ok(errs.length===0,'no errors '+errs.slice(0,3).join(' | '));
console.log('TOTAL v50test: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
