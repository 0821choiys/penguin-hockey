// v43: the re-proportioned penguins (Node part: the mocked THREE cannot scale or deform, so the looks are checked in
// br/v43model.js) — every species / team / hat / goalie builds, the head-rounding maths, which faces get blush
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {TYPES,PKV}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const keys=Object.keys(TYPES);let built=0,bad=[],blush=[],eyesFwd=true,scarf=true;
for(const k of keys)for(const team of['blue','red'])for(const hat of['none','beanie','helmet','party']){
  let P;try{P=PH.buildPenguin(k,team,hat,{num:7});}catch(e){bad.push(k+'/'+hat+': '+e.message);continue;}
  built++;
}
ok(bad.length===0&&built===keys.length*8,'all '+keys.length+' species × 2 teams × 4 hats build with the v43 pass ('+built+') '+bad.slice(0,3).join(' | '));
{let g;try{g=PH.buildPenguin('king','blue','none',{goalie:true,num:1});}catch(e){}ok(!!g,'a goalie (helmet + cage + pads) builds too');}
{const v={x:.3,y:1.7,z:0};PH.pk43D(v);ok(v.y>1.7&&v.y<1.8&&Math.abs(v.x-.3)<.02,'the crown is raised (1.70 → '+v.y.toFixed(3)+'), the top barely widens');
 const w={x:.35,y:PKV.bulgeY,z:0};PH.pk43D(w);ok(Math.abs(w.x/.35-(1+PKV.bulge))<1e-9&&w.y===PKV.bulgeY,'the cheeks are '+(PKV.bulge*100).toFixed(1)+' % fuller at eye height');
 const u={x:.3,y:1.2,z:0};PH.pk43D(u);ok(u.y===1.2,'below the crown nothing moves up');}
{const light=keys.filter(k=>PH.pk43Light(TYPES[k]));ok(light.length>0&&light.length<keys.length&&!light.includes('basic'),'cheek blush only on light faces ('+light.join(',')+'), not on black ones like the Adélie');}
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
