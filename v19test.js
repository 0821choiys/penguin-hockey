// v19 graphics: settings row, save defaults / migration, tier + automatic step-down rules (Node harness; rendering itself is
// checked in a real browser by br/v19gfx.js)
const {execFileSync}=require('child_process');
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const probe=(save,expr,env)=>JSON.parse(execFileSync('node',['-e',`const PH=require('./harness.js');const s=PH.save;console.log(JSON.stringify(${expr}));process.exit(0);`],
  {env:Object.assign({},process.env,env||{},save===null?{SAVE:''}:{SAVE:JSON.stringify(save)}),cwd:__dirname}).toString().trim().split('\n').pop());
const base={v:10,points:300,types:['basic'],type:'basic',tut:{done:true,asked:true}};
// 1. settings row
{const PH=require('./harness.js');const row=PH.SETDEF.find(d=>d.k==='quality');
 ok(row&&row.opts.map(o=>o[0]).join()==='ultra,high,low','graphics row offers 최고 / 높음 / 절약 ('+(row&&row.opts.map(o=>o[0]+'='+o[1]).join(' '))+')');
 ok(row&&row.opts[0][1]==='최고'&&row.opts[1][1]==='높음'&&row.opts[2][1]==='절약','labels in Korean: 최고 · 높음 · 절약');
 const S=PH.save;
 const tiers={};for(const q of['ultra','high','low']){S.set.quality=q;PH.GFX.drop=0;tiers[q]=PH.gfxTier();}
 ok(tiers.ultra===2&&tiers.high===1&&tiers.low===0,'tiers: 최고 2 (mirror + bloom/grade), 높음 1 (mirror only), 절약 0 ('+JSON.stringify(tiers)+')');
 // automatic step-down: 최고 -> 높음 -> 0, then it is the older resolution / shadow fallback's turn
 S.set.quality='ultra';PH.GFX.drop=0;const seq=[PH.gfxTier()];let st;
 while((st=PH.gfxStepDown()))seq.push(PH.gfxTier());
 ok(seq.join()==='2,1,0'&&st===false,'slow device steps down 2 → 1 → 0, then stops ('+seq.join(' → ')+')');
 ok(S.set.quality==='ultra','… without touching the saved setting');
 S.set.quality='high';PH.GFX.drop=0;ok(PH.gfxTier()===1&&PH.gfxStepDown()===true&&PH.gfxTier()===0&&PH.gfxStepDown()===false,'높음 steps down once (mirror off)');
 S.set.quality='low';PH.GFX.drop=0;ok(PH.gfxTier()===0&&PH.gfxStepDown()===false,'절약 has nothing to step down');
 // the perf monitor drops a graphics tier before it lowers the resolution
 S.set.quality='ultra';PH.GFX.drop=0;PH.perf.scale=1;PH.perf.low=0;PH.perf.ema=1/20;
 for(let i=0;i<125;i++)PH.perfSample(1/20);
 ok(PH.GFX.drop===1&&PH.perf.scale===1,'perf monitor: ~2 s under 38 fps on 최고 → one tier down first, resolution kept (drop '+PH.GFX.drop+', scale '+PH.perf.scale+')');
 for(let i=0;i<125;i++)PH.perfSample(1/20);
 ok(PH.GFX.drop===2&&PH.perf.scale===1,'… still slow → mirror off (drop '+PH.GFX.drop+')');
 for(let i=0;i<125;i++)PH.perfSample(1/20);
 ok(PH.GFX.drop===2&&PH.perf.scale<1,'… still slow → the older resolution fallback takes over (scale '+PH.perf.scale.toFixed(1)+')');
 PH.perf.scale=1;PH.GFX.drop=0;
}
// 2. defaults for a first start
{const pc=probe(null,'[s.set.quality,s.gfx19]'),ph=probe(null,'[s.set.quality,s.gfx19]',{COARSE:'1'});
 ok(pc[0]==='ultra'&&pc[1]===true,'first start on PC: 최고 ('+pc.join(',')+')');
 ok(ph[0]==='ultra'&&ph[1]===true,'first start on a phone / tablet: 최고 (v29; was 높음) ('+ph.join(',')+')');}
// 3. existing saves
{const q=(set,extra)=>probe(Object.assign({},base,{set},extra||{}),'[s.set.quality,s.gfx19]');
 const a=q({quality:'high'});ok(a[0]==='ultra'&&a[1]===true,'old save on 높음 (the previous top tier) moves up to 최고 once ('+a.join(',')+')');
 const b=q({quality:'high'},{gfx19:true});ok(b[0]==='high','a save that chose 높음 after v19 stays on 높음');
 const c=q({quality:'low'});ok(c[0]==='low','절약 is kept as chosen');
 const d=q({quality:'ultra'},{gfx19:true});ok(d[0]==='ultra','최고 is kept');
 const e=q({quality:'mega'});ok(e[0]==='ultra','an unknown value falls back to the default (최고 on PC)');
 const f=probe(Object.assign({},base,{set:{quality:'low',size:2,diff:'hard'}}),'[s.set.size,s.set.diff,s.points,s.types.join()]');
 ok(f[0]===2&&f[1]==='hard'&&f[2]>=300&&f[3]==='basic','other settings and progress untouched ('+f.join(',')+')');}
console.log('\nTOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
