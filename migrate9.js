  {
    const T=s.trial,t=save.trial;
    if(T&&typeof T==='object'){
      t.used.world=Math.min(1,nz(T.used&&T.used.world,1));t.titles.world=nz(T.titles&&T.titles.world,9999);t.first.world=!!(T.first&&T.first.world===true);
      const R=T.run;
      if(R&&typeof R==='object'&&R.kind==='world'&&Array.isArray(R.opp)&&R.opp.length===5&&nz(R.round,4)<5)t.run={kind:'world',round:nz(R.round,4),opp:R.opp.map(x=>typeof x==='string'?x.replace(/[<>&"']/g,'').slice(0,30):'상대 팀'),city:t.run&&t.run.city||save.profile.city};
    }
    if(s.dev&&typeof s.dev==='object'&&s.dev.got===true){save.dev.got=true;save.dev.ts=nz(s.dev.ts,9e15);}
    if(save.types.includes('auk')&&!save.dev.got)save.types=save.types.filter(k=>k!=='auk');   // exclusive: only through the 개발자 tier
    if(save.dev.got&&!save.types.includes('auk'))save.types.push('auk');
    if(!save.types.includes(save.type))save.type='basic';
    for(const q of save.squad.keys())if(save.squad[q]&&!save.types.includes(save.squad[q]))save.squad[q]=null;
  }
  if(s.v!==9)persist();
