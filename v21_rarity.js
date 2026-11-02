/* ================= v21: fixed penguin rarity (기본 · 희귀 · 레어 · 신화 · 전설) ================= */
// save.cc[k] = spare cards of penguin k by rarity slot (only slot RAR[k] fills). Called at the end of loadSave() (hoisted):
// pre-v21 saves keep their old save.cards untouched; the same number of cards moves into save.cc once, and if those cards
// were worth more breakthrough points under the old grade values (1/2/4/8), the difference is kept in brkPts.
function rarLoad(s,num){
  const ks=Object.keys(TYPES);
  if(s.cc&&typeof s.cc==='object'){
    for(const k of ks){const a=s.cc[k];save.cc[k]=[0,1,2,3,4].map(i=>Array.isArray(a)?Math.max(0,Math.min(999,Math.floor(num(a[i],0)))):0);}
    return;
  }
  const OLD=[1,2,4,8];
  for(const k of ks){
    const a=save.cards[k]||[0,0,0,0],n=a.reduce((x,y)=>x+y,0),g=RAR[k]|0;
    save.cc[k]=[0,0,0,0,0];save.cc[k][g]=Math.min(999,n);
    const was=a.reduce((x,y,i)=>x+y*OLD[i],0),now=n*BRK.val[g];
    if(was>now)save.brkPts[k]=Math.min(999,(save.brkPts[k]|0)+was-now);
  }
}
