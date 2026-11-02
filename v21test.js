// v21: fixed rarity per penguin (기본 · 희귀 · 레어 · 신화 · 전설) — tiers, frames, save migration, market, rewards
const {execFileSync}=require('child_process');
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {save,TYPES,GRADES,RAR,BRK,GACHA}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const ks=Object.keys(TYPES),reg=ks.filter(k=>!TYPES[k].exclusive);

// ---- the five rarities ----
ok(GRADES.length===5&&GRADES.map(g=>g.n).join()==='기본,희귀,레어,신화,전설','five rarities in order: '+GRADES.map(g=>g.n).join(' < '));
ok(ks.every(k=>Number.isInteger(RAR[k])&&RAR[k]>=0&&RAR[k]<=4),'every penguin has exactly one rarity');
const cnt=[0,1,2,3,4].map(g=>PH.tierTypes(g).length);
ok(cnt.join()==='3,4,4,2,2'&&cnt.reduce((a,b)=>a+b,0)===reg.length,'scout pool per rarity '+cnt.join('/')+' (all '+reg.length+' scout penguins, exclusive kept out)');
ok(PH.tierTypes(4).includes('king')&&PH.tierTypes(0).includes('basic')&&PH.rarCls('auk')===9,'emperor = 전설, Adélie = 기본, the exclusive auk keeps its own frame');
// the frame no longer climbs with level / stars
{const k='fast';const a=PH.cardHtml(k,{lv:0}),b=PH.cardHtml(k,{lv:10});save.types.includes(k)||save.types.push(k);save.lv[k]=10;save.brk[k]=4;const c=PH.cardHtml(k);
 const cls=h=>(h.match(/class="pc (g\d)/)||[])[1];ok(cls(a)==='g'+RAR[k]&&cls(b)===cls(a)&&cls(c)===cls(a),'card frame = rarity at Lv0, Lv10 and ★4 ('+cls(a)+')');save.lv[k]=0;save.brk[k]=0;}
// published rates = code
ok(GACHA.odds.reduce((a,b)=>a+b,0)===100&&GACHA.odds.join()==='50,30,14,5,1','base rarity odds 50/30/14/5/1 sum to 100');
{let s=0;for(const k of reg)s+=PH.typeRate(k);ok(Math.abs(s-100)<1e-9,'per-penguin base rates sum to 100%');}
// enhancement: rarer cards give a bigger bonus, shown and used by the same table
{const lv0={};for(const k of['basic','balanced','defense','royal','king']){lv0[k]=save.lv[k];save.lv[k]=5;save.scout.fail[k]=0;}
 const r=['basic','balanced','defense','royal','king'].map(k=>PH.enhRate(k,RAR[k]));
 ok(r.every((v,i)=>i===0||v-r[0]===PH.ENH_CARD_BONUS[i]),'enhancement bonus by rarity '+PH.ENH_CARD_BONUS.join('/')+' (Lv5: '+r.join('/')+'%)');
 for(const k in lv0)save.lv[k]=lv0[k];}
// season / trial reward cards come from the right rarity
{let good=true;for(let i=0;i<300;i++){const g=i%5,c=PH.grantTier(g);if(RAR[c.k]!==g||TYPES[c.k].exclusive||c.g!==g)good=false;}ok(good,'reward cards (grantTier) always land in the asked rarity');}
{let good=true;const pool=new Set();for(let i=0;i<3000;i++){const t=PH.pickType(3);pool.add(t);if(RAR[t]!==3)good=false;}ok(good&&pool.size===cnt[3],'fusion result (pickType) stays inside the next rarity ('+[...pool].join(',')+')');}
// market: listings match their rarity, buying never beats selling
{let good=true,arb=0;for(let salt=0;salt<200;salt++){save.mk.salt=salt;const m=PH.mkGen();for(const L of m.list){if(RAR[L.type]!==L.g)good=false;const sp=PH.mkSellPrice(L.type,L.g,m);if(sp>=L.price)arb++;}}
 ok(good,'market listings: price tier = the penguin\'s rarity');ok(arb===0,'no listing can be bought and sold back for profit (200 market refreshes)');save.mk.salt=0;}
ok(PH.MK_BUY.every((v,i)=>i===0||v>PH.MK_BUY[i-1])&&PH.MK_SELL.every((v,i)=>v<PH.MK_BUY[i]),'market prices rise with rarity, sell < buy');
// breakthrough points by rarity
ok(BRK.val.join()==='1,2,3,5,8','breakthrough value per card by rarity 1/2/3/5/8');

// ---- save migration (pre-v21 star-grade cards) in a fresh process ----
const run=(save)=>JSON.parse(execFileSync('node',['-e',"const PH=require('./harness.js');const s=PH.save;console.log(JSON.stringify({cc:s.cc,cards:s.cards,brkPts:s.brkPts,types:s.types,points:s.points}));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(save)})}).toString().trim().split('\n').pop());
const old={v:10,points:777,types:['basic','fast','king','defense'],type:'basic',lv:{basic:3,fast:2,king:1,defense:4},brkPts:{defense:1},
  cards:{fast:[2,1,0,0],king:[1,0,0,1],defense:[0,0,3,0],basic:[4,0,0,0]}};
const a=run(old);
ok(a.cc.fast.join()==='3,0,0,0,0'&&a.cc.king.join()==='0,0,0,0,2'&&a.cc.defense.join()==='0,0,3,0,0'&&a.cc.basic.join()==='4,0,0,0,0','old cards keep their count and become cards of the penguin\'s rarity');
ok(a.brkPts.fast===1&&!a.brkPts.king&&a.brkPts.defense===4&&!a.brkPts.basic,'breakthrough value never drops: shortfall becomes stored points (fast +1, defense 1+3, king/basic none) '+JSON.stringify(a.brkPts));
ok(a.cards.fast.join()==='2,1,0,0'&&a.points===777&&a.types.join()==='basic,fast,king,defense','old save.cards kept untouched (additive), points and roster unchanged');
const b=run(Object.assign({},old,{cc:a.cc,brkPts:a.brkPts}));
ok(JSON.stringify(b.cc)===JSON.stringify(a.cc)&&JSON.stringify(b.brkPts)===JSON.stringify(a.brkPts),'reloading a v21 save does not migrate twice');
const c=run({v:10,points:50,types:['basic'],cc:{basic:[1,'x',-3,5000,2.7]}});
ok(c.cc.basic.join()==='1,0,0,999,2'&&c.cc.king.join()==='0,0,0,0,0','corrupt card counts are clamped (0…999, integers)');

console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
