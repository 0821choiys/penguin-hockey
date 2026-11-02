function pengSVG(k){   // card art per real species (own drawings)
  if(k==='auk')return aukSVG();
  const t=TYPES[k],p=t.patch,D='#1d2540',Wh='#f6faff';
  const hx=c=>{let h=c.toString(16);while(h.length<6)h='0'+h;return '#'+h;};
  const bk=hx(t.beak[0]),bk2=hx(t.beak[1]),ft=hx(t.foot||0xff8c1c);
  const big=k==='strong'?1.12:k==='fast'?.92:1;
  let s='<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">';
  s+='<ellipse cx="60" cy="134" rx="30" ry="5" fill="rgba(0,0,0,.28)"/>';
  s+='<ellipse cx="46" cy="130" rx="12" ry="5" fill="'+ft+'"/><ellipse cx="74" cy="130" rx="12" ry="5" fill="'+ft+'"/>';
  if(k==='fast')s+='<path d="M6 72h20M2 84h22M8 96h18" stroke="rgba(255,255,255,.75)" stroke-width="3.2" stroke-linecap="round"/><path d="M60 118l-4 14h8z" fill="'+D+'"/>';
  s+='<g transform="translate(60 92) scale('+big+') translate(-60 -92)">';
  s+='<ellipse cx="31" cy="92" rx="7" ry="21" fill="'+D+'" transform="rotate(14 31 92)"/><ellipse cx="89" cy="92" rx="7" ry="21" fill="'+D+'" transform="rotate(-14 89 92)"/>';
  s+='<ellipse cx="60" cy="92" rx="30" ry="38" fill="'+(p==='ear'?'#2c3a55':D)+'"/><ellipse cx="60" cy="97" rx="20" ry="30" fill="'+Wh+'"/>';
  if(p==='ear')s+='<ellipse cx="60" cy="74" rx="17" ry="9" fill="#ffd45a" opacity=".75"/>';
  s+='</g>';
  // head
  s+='<circle cx="60" cy="46" r="24" fill="'+D+'"/>';
  if(p==='chinstrap')s+='<ellipse cx="60" cy="52" rx="19" ry="16" fill="#fff"/><path d="M42 54Q60 74 78 54" stroke="'+D+'" stroke-width="2.6" fill="none"/>';
  else if(p==='gentoo')s+='<path d="M38 36Q60 24 82 36Q60 31 38 36Z" fill="#fff"/><path d="M40 37Q60 27 80 37L78 41Q60 33 42 41Z" fill="#fff"/>';
  else if(p==='ear')s+='<path d="M34 46Q38 34 46 40Q42 52 38 60Q33 54 34 46Z" fill="#ffb21f"/><path d="M86 46Q82 34 74 40Q78 52 82 60Q87 54 86 46Z" fill="#ffb21f"/>';
  // eyes
  if(p==='adelie')s+='<circle cx="50" cy="45" r="8.4" fill="#fff"/><circle cx="70" cy="45" r="8.4" fill="#fff"/><circle cx="50" cy="45" r="5.8" fill="'+D+'"/><circle cx="70" cy="45" r="5.8" fill="'+D+'"/><circle cx="50.6" cy="45.6" r="3.6" fill="#10131f"/><circle cx="70.6" cy="45.6" r="3.6" fill="#10131f"/>';
  else if(p==='rock')s+='<circle cx="50" cy="46" r="5.6" fill="#e0213a"/><circle cx="70" cy="46" r="5.6" fill="#e0213a"/><circle cx="50.5" cy="46.5" r="2.6" fill="#10131f"/><circle cx="70.5" cy="46.5" r="2.6" fill="#10131f"/>';
  else s+='<circle cx="50" cy="46" r="6.4" fill="#fff"/><circle cx="70" cy="46" r="6.4" fill="#fff"/><circle cx="51" cy="47" r="3.5" fill="#10131f"/><circle cx="71" cy="47" r="3.5" fill="#10131f"/>';
  s+='<circle cx="52.2" cy="45.4" r="1.3" fill="#fff"/><circle cx="72.2" cy="45.4" r="1.3" fill="#fff"/>';
  if(p==='rock'){   // yellow eyebrow plumes + spiky black crest
    s+='<path d="M40 38Q52 36 58 40Q48 38 34 30Q42 34 40 38Z" fill="#ffd21a"/><path d="M80 38Q68 36 62 40Q72 38 86 30Q78 34 80 38Z" fill="#ffd21a"/>';
    s+='<path d="M42 37L30 24L44 33ZM78 37L90 24L76 33Z" fill="#ffd21a"/><path d="M48 26L52 14L56 24L60 10L64 24L68 14L72 26Z" fill="'+D+'"/>';
  }
  // beak
  if(p==='ear')s+='<path d="M55 54Q60 52 65 54L61 72Q60 74 59 72Z" fill="'+bk+'"/><path d="M57 60L63 60L61 70Z" fill="'+bk2+'"/>';
  else if(p==='rock')s+='<path d="M51 54Q60 49 69 54Q66 64 60 66Q54 64 51 54Z" fill="'+bk+'"/>';
  else if(p==='adelie')s+='<path d="M55 54Q60 51 65 54Q63 61 60 62Q57 61 55 54Z" fill="'+bk+'"/>';
  else s+='<path d="M53 55Q60 51 67 55Q64 65 60 67Q56 65 53 55Z" fill="'+bk+'"/>';
  s+='<ellipse cx="42" cy="57" rx="4" ry="2.6" fill="rgba(255,120,150,.55)"/><ellipse cx="78" cy="57" rx="4" ry="2.6" fill="rgba(255,120,150,.55)"/>';
  return s+'</svg>';
}
