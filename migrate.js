  const nz=(v,m)=>Math.max(0,Math.min(m||1e9,Math.floor(num(v,0))));
  if(s.xp&&typeof s.xp==='object')for(const k of Object.keys(TYPES))save.xp[k]=nz(s.xp[k],99999);
  if(s.rec&&typeof s.rec==='object'){
    for(const k of['maxGoals','maxStreak','maxCombo','maxMargin','maxPass','tourBest'])save.rec[k]=nz(s.rec[k],9999);
    for(const d of['easy','normal','hard']){const a=s.rec.diff&&s.rec.diff[d];if(Array.isArray(a))save.rec.diff[d]=[nz(a[0],99999),nz(a[1],99999)];}
    if(s.rec.type&&typeof s.rec.type==='object')for(const k of Object.keys(TYPES)){const a=s.rec.type[k];if(Array.isArray(a))save.rec.type[k]=[nz(a[0],99999),nz(a[1],99999)];}
  }
  if(s.cum&&typeof s.cum==='object')for(const k of Object.keys(save.cum))save.cum[k]=nz(s.cum[k],999999);
  if(s.long&&typeof s.long==='object')for(const k of Object.keys(s.long))if(s.long[k]===true&&/^L\d{1,2}$/.test(k))save.long[k]=true;
  if(s.goals&&typeof s.goals==='object'&&Array.isArray(s.goals.list))save.goals={day:nz(s.goals.day,9e6),ts:nz(s.goals.ts,9e15),list:s.goals.list.slice(0,3).filter(g=>g&&typeof g.id==='string').map(g=>({id:g.id.slice(0,24),t:(typeof g.t==='string'&&TYPES[g.t])?g.t:'',p:nz(g.p,9999),c:g.c===true}))};
  save.clk=nz(s.clk,9e15);
  if(s.growth&&typeof s.growth==='object'&&TYPES[s.growth.type])save.growth={type:s.growth.type,from:nz(s.growth.from,10),to:nz(s.growth.to,10),ov0:nz(s.growth.ov0,99),ov1:nz(s.growth.ov1,99)};
  if(s.v!==5)persist();
