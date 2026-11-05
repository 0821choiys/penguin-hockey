// v32: penguin growth stories — bond per species, chapters at 3/10/25/50 matches, points, nickname, save load
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,step,startMatch,save}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const {BOND_LV,BOND_PTS,BOND_TXT,bondAdd,bondOf,bondRowHtml,bondCardHtml,bondNick}=PH;
ok(BOND_LV.join()==='3,10,25,50'&&BOND_PTS.join()==='50,100,200,400','levels 3/10/25/50 matches, rewards 50/100/200/400 points');
const TYPES=PH.TYPES||{};const keys=Object.keys(BOND_TXT);
ok(keys.length===16&&keys.every(k=>BOND_TXT[k].length===5&&BOND_TXT[k].every(s=>typeof s==='string'&&s.length>3)),'16 species, each 4 chapters + a nickname');
if(PH.TYPES)ok(Object.keys(PH.TYPES).filter(k=>!PH.TYPES[k].goalieOnly).every(k=>BOND_TXT[k]||k==='goalie'),'every playable species has a story');
// ---- levels and points ----
save.bond={};const k='king';let pts=save.points,got=[];
for(let i=1;i<=52;i++){const p0=save.points,o=bondAdd(k,i%2===0,2);got.push(o);if(save.points-p0!==o.pts){ok(false,'points added = reported points (match '+i+')');break;}}
ok(got[1].to===0&&got[2].from===0&&got[2].to===1&&got[2].pts===50,'3rd match → chapter 1, +50P');
ok(got[9].to===2&&got[9].pts===100&&got[24].to===3&&got[24].pts===200&&got[49].to===4&&got[49].pts===400,'10th → ch.2 +100P, 25th → ch.3 +200P, 50th → ch.4 +400P');
ok(save.points-pts===750&&got.filter(o=>o.pts).length===4,'total over 52 matches: exactly 750 points in 4 rewards');
const b=bondOf(k);ok(b.g===52&&b.w===26&&b.gl===104&&b.lv===4,'bond counts matches, wins and goals ('+JSON.stringify(b)+')');
ok(bondNick(k)===BOND_TXT[k][4]&&bondNick('fast')==='','nickname only after the 4th chapter');
ok(bondAdd('nope',true,1)===null,'unknown species → nothing');
ok(PH.bondJ('젠투 펭귄와의 이야기')==='젠투 펭귄과의 이야기'&&PH.bondJ('아델리와의 이야기')==='아델리와의 이야기'&&PH.bondJ('별명 「번개 썰매」을 얻었어요!').includes('」를'),'Korean particles follow the name (펭귄과 · 아델리와 · 썰매」를)');
// ---- result row: numbers equal code ----
save.bond={};bondAdd('fast',true,0);const o2=bondAdd('fast',true,0);
let h=bondRowHtml({bond:o2});ok(h.includes('0/4')&&h.includes(String(BOND_LV[0]-2))&&!h.includes('bd-new'),'result row: 0/4, '+(BOND_LV[0]-2)+' matches to go, no new chapter');
const o3=bondAdd('fast',false,1);h=bondRowHtml({bond:o3});
ok(h.includes('1/4')&&h.includes(String(BOND_LV[1]-3))&&h.includes('bd-new')&&h.includes(BOND_TXT.fast[0])&&h.includes('+'+BOND_PTS[0]+'P'),'3rd match: row says 1/4, '+(BOND_LV[1]-3)+' to go, shows chapter 1 text and +'+BOND_PTS[0]+'P');
ok(bondRowHtml({})==='','no bond data → no row');
// a jump of several chapters at once (old save with many matches) shows every chapter that opened
save.bond={basic:{g:49,w:0,gl:0,lv:0}};const oj=bondAdd('basic',false,0);h=bondRowHtml({bond:oj});
ok(oj.pts===750&&(h.match(/bd-new/g)||[]).length===4&&h.includes('bd-nick'),'jump 0→4: all 4 chapters and the nickname shown, 750P');
// ---- card ----
save.bond={};h=bondCardHtml('strong');
ok((h.match(/lock/g)||[]).length===4&&h.includes('+'+BOND_PTS[0]+'P')&&h.includes(String(BOND_LV[3])),'card, new species: 4 locked chapters with matches left and points');
for(let i=0;i<10;i++)bondAdd('strong',true,1);h=bondCardHtml('strong');
ok((h.match(/lock/g)||[]).length===2&&h.includes(BOND_TXT.strong[0])&&h.includes(BOND_TXT.strong[1])&&h.includes(String(BOND_LV[2]-10)),'card after 10 matches: 2 open chapters, '+(BOND_LV[2]-10)+' matches to chapter 3');
// ---- save load (sanitised, additive) ----
const raw={v:10,points:5,types:['basic','king'],type:'king',bond:{king:{g:'7',w:2,gl:-3,lv:9},'<bad>':{g:5},fast:'x'}};
{const r=require('child_process').spawnSync(process.execPath,['-e',"const PH=require('./harness.js');console.log('@@'+JSON.stringify(PH.save.bond));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(raw)}),encoding:'utf8'});
  const m=/@@(.*)/.exec(r.stdout||'');const lb=m?JSON.parse(m[1]):null;
  ok(lb&&lb.king&&lb.king.g===7&&lb.king.w===2&&lb.king.gl===0&&lb.king.lv===4,'load: numbers clamped (g 7, goals ≥ 0, level ≤ 4) '+JSON.stringify(lb));
  ok(lb&&!lb['<bad>']&&!lb.fast,'load: bad keys / values dropped');
  const r2=require('child_process').spawnSync(process.execPath,['-e',"const PH=require('./harness.js');console.log('@@'+JSON.stringify(PH.save.bond));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify({v:10,points:5})}),encoding:'utf8'});
  ok(/@@\{\}/.test(r2.stdout||''),'an old save without bond loads with an empty bond');}
// ---- a real match: the result screen adds one match with your penguin ----
save.bond={};save.type='royal';
startMatch({mode:'quick',size:3,time:120,diff:'normal',oppTypes:['basic','fast','strong'],tag:'q'});
PH.endMatch?PH.endMatch():(G.timeLeft=0);for(let i=0;i<60*6&&!G.result;i++)step(1/60);
if(PH.showResultScreen&&G.result){PH.showResultScreen();ok(bondOf('royal').g===1&&G.result.bond&&G.result.bond.k==='royal','finished match → +1 match with my own penguin (royal)');
  PH.showResultScreen();ok(bondOf('royal').g===1,'showing the result screen again does not count twice');}
else console.log('SKIP result check: showResultScreen not exported');
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
