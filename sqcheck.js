const PH=require('./harness.js');const {save,sqAuto,teamOvr}=PH;
for(const k of['fast','strong','defense','balanced'])if(!save.types.includes(k))save.types.push(k);
save.type='basic';save.squad=[null,null,null];save.set.size=4;sqAuto();console.log('fresh levels ->',JSON.stringify(save.squad),'OVR',teamOvr(4));
save.lv.basic=10;save.lv.defense=10;sqAuto();console.log('basic+defense Lv10 ->',JSON.stringify(save.squad),'OVR',teamOvr(4));
