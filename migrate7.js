  if(s.profile&&typeof s.profile==='object'){
    const P=s.profile,cl=v=>typeof v==='string'?v.replace(/[\u0000-\u001f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,12):'';
    save.profile.name=cl(P.name)||save.profile.name;save.profile.club=cl(P.club)||save.profile.club;
    if(typeof P.emb==='string'&&P.emb.length>0&&P.emb.length<=8&&!/[<>&"']/.test(P.emb))save.profile.emb=P.emb;
    save.profile.since=nz(P.since,9e15);save.profile.seed=nz(P.seed,2147483647);
  }
  if(s.mgr&&typeof s.mgr==='object'){
    const M=s.mgr,m=save.mgr;
    m.r=Math.max(100,Math.min(4000,Math.round(num(M.r,1000))));
    for(const k of['games','w','d','l'])m[k]=nz(M[k],1e6);
    m.best=Math.max(m.r,Math.min(4000,nz(M.best,4000)));
    if(Array.isArray(M.form))m.form=M.form.filter(f=>f==='W'||f==='D'||f==='L').slice(0,5);
    if(Array.isArray(M.hist))m.hist=M.hist.filter(x=>x&&typeof x==='object').slice(0,10).map(x=>({d:Math.max(-200,Math.min(200,Math.round(num(x.d,0)))),r:Math.min(4000,nz(x.r,4000)),l:typeof x.l==='string'?x.l.replace(/[<>&"']/g,'').slice(0,20):'',ts:nz(x.ts,9e15)}));
    if(M.pending&&typeof M.pending==='object')m.pending={o:Math.min(4000,nz(M.pending.o,4000))||1120,l:typeof M.pending.l==='string'?M.pending.l.replace(/[<>&"']/g,'').slice(0,12):'경기',ts:nz(M.pending.ts,9e15)};
  }
  if(s.mk&&typeof s.mk==='object'){
    save.mk.salt=nz(s.mk.salt,1e9);
    if(Array.isArray(s.mk.bought))save.mk.bought=s.mk.bought.filter(x=>typeof x==='string'&&x.length<40).slice(-40);
    if(Array.isArray(s.mk.log))save.mk.log=s.mk.log.filter(x=>x&&typeof x==='object'&&TYPES[x.type]&&(x.k==='buy'||x.k==='sell')).slice(0,15).map(x=>({k:x.k,type:x.type,g:Math.min(3,nz(x.g,3)),p:nz(x.p,1e6),ts:nz(x.ts,9e15),n:x.n===true}));
  }
  if(s.v!==7)persist();
