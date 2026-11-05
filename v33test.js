// v33: 7-day attendance — one claim per calendar day, gaps allowed, day 7 trail then points, clock rollback, save load
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {save}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const {DLY,DLY_DUP,dlyDay,dlyCan,dlyClaim,dlyNext,dlyBody,dlyCardHtml}=PH;
ok(DLY.length===7&&DLY[6].t==='dly'&&PH.TRAILS.dly&&PH.TRAILS.dly.pass===1,'7 rewards, day 7 = the attendance trail (hidden in the shop until owned)');
// local calendar day: 23:59 and 00:01 are different days, 00:01 and 23:59 of the same date are the same
const a=new Date(2026,10,5,0,1),b=new Date(2026,10,5,23,59),c=new Date(2026,10,6,0,1);
ok(dlyDay(a)===dlyDay(b)&&dlyDay(c)===dlyDay(b)+1,'day number follows the local date');
save.login={d:0,last:0,cyc:0,tot:0};save.clk=0;save.trails=['ice'];
const today=dlyDay(),newDay=()=>{save.login.last=dlyDay()-1;};
ok(dlyCan()&&dlyNext()===0,'new player: day 1 can be claimed');
let p0=save.points,o=dlyClaim();
ok(o&&o.i===0&&save.points-p0===DLY[0].p&&o.pts===DLY[0].p,'day 1 → +'+DLY[0].p+'P');
ok(!dlyCan()&&dlyClaim()===null&&save.login.last===today,'second claim the same day → nothing');
// a gap of several days just moves one step
save.login.last=today-5;const xp0=save.pass.xp;p0=save.points;o=dlyClaim();
ok(o.i===1&&o.fish===PH.passGain(DLY[1].f)&&save.pass.xp-xp0===o.fish&&save.points===p0,'after a 5-day gap: day 2 (not day 6) → 🐟+'+o.fish+' on the pass, no points');
for(let i=2;i<6;i++){newDay();dlyClaim();}
ok(save.login.d===6&&dlyNext()===6,'six claims → next is day 7');
newDay();p0=save.points;o=dlyClaim();
ok(o.trail==='dly'&&save.trails.includes('dly')&&save.points-p0===DLY[6].p,'day 7 → the trail + '+DLY[6].p+'P');
ok(save.login.d===0&&save.login.cyc===1&&save.login.tot===7,'cycle complete → back to day 1 (cycles 1, 7 days total)');
const bd=dlyBody();ok((bd.match(/dl-t dl-done/g)||[]).length===7,'on the day the cycle completes all 7 tiles show ✓');
for(let i=0;i<6;i++){newDay();dlyClaim();}newDay();p0=save.points;o=dlyClaim();
ok(!o.trail&&save.points-p0===DLY_DUP,'second day 7, trail already owned → ⭐'+DLY_DUP+'P');
// clock moved backwards (save.clk = the latest time this save has seen)
save.clk=Date.now()+3600e3;newDay();ok(!dlyCan()&&dlyClaim()===null&&/시계/.test(dlyBody()),'device clock turned back → no claim, the dialog says why');
save.clk=0;
// what the dialog says = what the code gives
save.login={d:0,last:0,cyc:0,tot:0};save.trails=['ice'];let h=dlyBody();
ok(h.includes('⭐'+DLY[0].p+'P')&&h.includes('🐟+'+PH.passGain(DLY[1].f))&&h.includes('⭐'+DLY[4].p+'P')&&h.includes(PH.TRAILS.dly.name+' + ⭐'+DLY[6].p+'P')&&h.includes('⭐'+DLY_DUP+'P'),'dialog amounts equal the reward table');
ok(h.includes('data-dly="claim"')&&(h.match(/dl-t/g)||[]).length>=7&&/today/.test(h),'dialog: 7 tiles, today highlighted, a claim button');
ok(/rdy/.test(dlyCardHtml())&&dlyCardHtml().includes('⭐'+DLY[0].p+'P'),'목표 card: ready, shows today’s reward');
const n0=PH.claimable();dlyClaim();ok(PH.claimable()===n0-1,'the goals badge counts the unclaimed attendance');
ok(!/rdy/.test(dlyCardHtml()),'after claiming the card is no longer “ready”');
// save load (sanitised, additive) in a fresh process
const run=sv=>{const r=require('child_process').spawnSync(process.execPath,['-e',"const PH=require('./harness.js');console.log('@@'+JSON.stringify({l:PH.save.login,t:PH.save.trails}));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(sv)}),encoding:'utf8'});const m=/@@(.*)/.exec(r.stdout||'');return m?JSON.parse(m[1]):null;};
let L=run({v:10,points:5,trails:['ice','dly'],login:{d:'3',last:20400,cyc:-2,tot:9.7}});
ok(L&&L.l.d===3&&L.l.last===20400&&L.l.cyc===0&&L.l.tot===9&&L.t.includes('dly'),'load: values sanitised, the owned trail kept '+JSON.stringify(L&&L.l));
L=run({v:10,points:5,login:{d:99}});ok(L&&L.l.d===6,'load: day index clamped to 0–6');
L=run({v:10,points:5});ok(L&&L.l.d===0&&L.l.last===0,'old save without attendance → starts at day 1');
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
