// The fish-pass season of today, from the game's own SEASON constants (epoch day, 28-day length) in the built file —
// browser tests seed pass progress for the CURRENT season so they do not break when a new season starts.
const fs=require('fs'),path=require('path');
module.exports=function seasonNow(){
  const s=fs.readFileSync(path.resolve(__dirname,'../penguin-hockey-improved.html'),'utf8'),m=s.match(/SEASON=\{days:(\d+),epoch:(\d+)/);
  const days=m?+m[1]:28,epoch=m?+m[2]:20752,d=new Date(),day=Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);
  return Math.max(1,Math.floor((day-epoch)/days)+1);};
