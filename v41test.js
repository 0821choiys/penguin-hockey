// v41: card portraits — in the Node harness (no WebGL) the old drawing must still be used, and nothing may break.
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {TYPES,P3,P3V}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const keys=Object.keys(TYPES);
ok(PH.p3Can()===false,'no WebGL here → portraits are off');
ok(keys.every(k=>PH.p3Url(k)===''&&PH.p3Html(k)===''),'no portrait is produced without WebGL');
ok(keys.every(k=>{const s=PH.pengSVG(k);return s.startsWith('<svg')&&s.endsWith('</svg>');}),'every species falls back to its drawing ('+keys.length+')');
ok(keys.every(k=>/<div class="pc-art"><svg/.test(PH.cardHtml(k,{cw:92}))),'cards are still built with the drawing');
ok(PH.p3Warm(true)===0&&P3.fail===0,'background warm-up does nothing and counts no failure');
ok(keys.every(k=>P3V.rim[PH.rarCls(k)]!==undefined)&&['attacker','defender','mid'].every(r=>P3V.pose[r]&&P3V.pose[r].stk.length===3),'every rarity has a rim light colour, every role a pose');
PH.p3Frame();ok(true,'the per-frame warm-up hook runs without WebGL');
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
