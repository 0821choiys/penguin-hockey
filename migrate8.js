  {
    const CT=['서울','부산','대구','인천','광주','대전','울산','세종','수원','부천','고양','성남','창원','제주'];
    if(s.profile&&CT.includes(s.profile.city))save.profile.city=s.profile.city;
    const T=s.trial;
    if(T&&typeof T==='object'){
      const t=save.trial;t.day=nz(T.day,9e6);t.ts=nz(T.ts,9e15);
      if(T.used&&typeof T.used==='object')t.used={city:Math.min(3,nz(T.used.city,3)),nat:Math.min(2,nz(T.used.nat,2))};
      if(T.titles&&typeof T.titles==='object')t.titles={city:nz(T.titles.city,9999),nat:nz(T.titles.nat,9999)};
      if(T.first&&typeof T.first==='object')t.first={city:T.first.city===true,nat:T.first.nat===true};
      if(CT.includes(T.cityName))t.cityName=T.cityName;
      const R=T.run;
      if(R&&typeof R==='object'&&(R.kind==='city'||R.kind==='nat')&&Array.isArray(R.opp)){
        const n=R.kind==='city'?3:4,rd=nz(R.round,n-1);
        if(R.opp.length===n&&rd<n)t.run={kind:R.kind,round:rd,opp:R.opp.map(x=>typeof x==='string'?x.replace(/[<>&"']/g,'').slice(0,30):'상대 팀'),city:CT.includes(R.city)?R.city:save.profile.city};
      }
    }
  }
  if(s.v!==8)persist();
