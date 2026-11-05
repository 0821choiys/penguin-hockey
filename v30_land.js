/* ================= v30: landscape tablets — the match camera pulls back on squarer landscape screens ================= */
// The match camera's distance did not depend on the screen shape in landscape, so on a 4:3 tablet held sideways
// (aspect 1.33) it showed much less of the rink side to side than on a PC (1.6) or a phone (2.2): big penguins, little ice.
// Between aspect 1.0 and 1.6 it now backs off by up to 15 % (most at 1.3, a tent so 1.0 and 1.6 stay as they were).
function landZoom(asp){
  if(asp<1||asp>=1.6)return 1;
  return 1+.15*Math.max(0,1-Math.abs(asp-1.3)/.3);
}
