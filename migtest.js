const PH=require('./harness.js');const {save}=PH;
console.log(JSON.stringify({v:save.v,points:save.points,types:save.types,hat:save.hat,team:save.team,cleared:save.cleared,lv:save.lv,xp:save.xp,goals:save.goals.list.length,long:save.long,maxCombo:save.rec.maxCombo,cumGoals:save.cum.goals,growth:save.growth,squad:save.squad}));
