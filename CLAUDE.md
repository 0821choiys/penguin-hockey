# Penguin Hockey — working notes for Claude

Single-file Three.js arcade hockey game, published on the Play Store (project "펭귄하키").
The shipped file is `penguin-hockey-improved.html` (deliver it as `penguin-hockey-ultimate.html`).

## Standing rules from the owner (always apply)
- 실제 브라우저에서 실행할 수 없는 테스트는 통과했다고 주장하지 말고, 실행하지 못한 항목과 이유를 명시한다.
- 일부 함수나 CSS만 제공하고 사용자가 직접 합치게 하지 않는다 — always deliver the complete built HTML file.
- Real money only for the 💎 Pro Pass (owner's decision 2026-11-03): 8,900원, one Google Play purchase per fish-pass season, no auto-renewal
  (product `pro_pass`, consumable; see `sardine-pass.md`). Everything else (scouting, market, hats, trails, stick materials, kits) stays in-game points only.
  Paid random rewards must show their odds on screen.
- Every probability / number shown on screen must equal the code that decides it (tests check this).
- Controls (v36, `controls-v36.md`): shots / passes aim where the stick points; easy handling applies to human-controlled
  skaters only (never AI), always on for both players online; layout per orientation in `save.set.ctl`.
- Ice (owner, 2026-11-17 night; v48, `controls-v36.md`): "too slippery — lower it a little, just enough to feel, and make it a setting" → `save.set.ice` 1–5
  (default 3) in 설정 right under 조작 설정. `ICE.lv` multiplies sideways grip (+ the easy-handling carve), stopping after letting go and braking against the motion for
  EVERY skater (it is the rink — the AI too; goalies, the puck, top speed and acceleration untouched); 3 = standard (×1.25 / 1.25 / 1.15 vs before: stopping ≈17 % shorter),
  4 = the old ice exactly; rink conditions stack on top; online friend matches always skate on 3 (`iceLv`). Tests: `v48test.js`, `br/v48ice.js`.
- Switching (owner, 2026-11-09; v38, `hockey-v38.md`): the human's penguin changes ONLY on a pass (→ receiver) or the Switch button
  (→ team-mate nearest the puck = the white ring). The only forced change is the penalty box. Auto switching is a setting
  (`save.set.ctl.auto`, off by default, never online). Without the puck the buttons follow the play: Shoot = 뺏기 (poke) when an
  opponent carries, Pass = 패스 요청 (call) when an AI team-mate carries.
- Look (owner, 2026-11-10; v39, `premium-look-v39.md`): asked for a flashier design, then rejected the gold "premium" pass as cheap —
  "not just colours, the detail must be good; the quick-match button was better before". So: NO gold paint (gold borders / gold buttons /
  gold titles / sunburst rays / glints / looping sheen). Keep the original palette (navy boards, ice-blue, team colours, the yellow
  kick-plate line) and put the work into craft: double hairlines, textures, emblems, hockey things (bolts, skate marks, LED clock).
  The home quick-match button, logo, titles and chips stay as they were before v39 — do not restyle them.
  v39's match show is visual only (own random numbers `lxr`, off at 절약 quality, the goal streak follows flash / reduced motion).
  On white ice: additive light is invisible and warm tints look like stains — use ice-blue / team colours; flat things on the ice
  need `polygonOffset` stronger than the ice's (-2).
- Flashy things (owner, 2026-11-10 evening): "when I say it looks cheap, don't just take it out — improve it". Rejected ≠ delete:
  bring the element back with better craft (v39 third pass: the goal light fan is back, soft and in the scorer's colour; gold lives on
  the 전설 cards as real metal). Still not on the home screen: gold paint, looping button sheen. See `mates-cards-v41.md`.
- Team-mates (owner, 2026-11-10; v40, `mates-cards-v41.md`): AI mates of a human player ALWAYS answer a call for the pass (even over a
  wound-up shot, after a cooldown; nothing else happens to the puck while a call is open), look for the human first, and shoot only as a
  last resort (`MT.hold` s on the puck with no way to reach the human, or the last `MT.late` s). Opponents / demo / auto switching: unchanged.
- Card art (owner, 2026-11-10; v41): "a few shapes glued together is not a penguin" — cards show a rendered portrait of the species' real
  3D game model (`p3Shot`, per species + team colour, made at run time); the flat drawings (`pengSVG`) are only the no-WebGL fallback.
  The card is "the penguin at the rink boards": portrait behind the white dasher board (name, yellow kick plate), rarity = the scene behind the glass + the metal bezel.
- Store (2026-11-13; v42, `store-ready-v42.md`): privacy policy + account deletion pages live on GitHub Pages from `docs/`
  (https://0821choiys.github.io/penguin-hockey/privacy.html, delete-account.html, English `-en` versions; YS Games, choiys6421@gmail.com).
  The app links to them from the bottom of 설정 and of the account window. If what the app collects changes, update the pages too.
- Penguin model (owner, 2026-11-14; v43, `final-v44.md`): "the 3D penguin is really bad" → cute character style (picked by the owner):
  head rig ×1.28 around the neck, rounded crown, character eyes (owner 2026-11-14: "the eyes are creepy" → no bulging white eyeballs:
  a flat white oval with a pupil covering ≈80 %, catch-lights; an all-dark eye vanishes on the black head, `PKE`), short chunky beak, bigger flippers / feet, scarf rebuilt,
  blush only on light faces. All numbers in `PKV`; `pk43` runs at the end of `buildPenguin`; iterate with `br/mlab.js` (no rebuild).
- Engagement (owner, 2026-11-14; v44, `final-v44.md`): "make it addictive and fun" → 감독 레벨 (XP every match, points per level,
  ×3 every 5th), win-streak bonus, first win of the day, level-up moment. Points only, nothing random, nothing paid, no pressure to spend
  (all ages + Play policy). Numbers in `CO`; shown values = paid values.
- Stick workshop (owner, 2026-11-14; v45, `stick-kit-v46.md`): materials = 2 parts (샤프트 / 블레이드) × 10, in the 5 penguin grades (3·3·2·1·1),
  drawn with points only (odds on screen = `STK` / `stkProbs`, per-part pity, 10-draw guarantee, free daily draw); every shaft × blade combination has
  stats + one of 9 style-pair abilities (`STK_AB`); 강화 +10 with the shown rate (a failure never lowers the level). The captain carries the equipped
  stick offline (`p.tt` read by `ttOf`); online friend matches stay flat.
- Team kit (owner, 2026-11-14; v46): `save.kit` colours / pattern / mascot / crest, free. Applied through `kitSync` (TEAM colours + cache purge)
  everywhere the team colour shows; the other side gives way when colours look alike; online each player brings their kit (`netInfo().kit`).
  Mascot art = `KIT_ART` SVG paths (also drawn on the 3D jersey with `Path2D`; the crest is drawn ~3.2× taller on the texture to look round).
- Mascot cut-scenes (owner, 2026-11-16; v47, `mascot-v47.md`): owner rejected costumed people — "animals, not people; the lightning strikes down,
  the fish does it in the water". So the 12 kit mascots are the real thing (`MS_SP`: `med` ice / water / air): 9 animal bodies + snowflake (floats down
  in a snowfall), iceberg (rises from the water), lightning bolt (strikes down from its cloud); sea animals + iceberg live in a hole that cracks open in the ice.
  Realism (owner, 2026-11-17: "more real, they look too much like toys"; v1.6.2): real proportions, fur as shells (`mFur`, short near eyes / nose via `mKeep`),
  real eyes stuck on by a ray (`mEyeG`, no white, no winks), painted skin textures, a sardine school (`InstancedMesh`, greets at the water line `ty`, whales then roll
  instead of spy-hopping `o.low`), faceless snowflake / iceberg / storm cloud. Team colour = a ring of light on the ice (`mascRing`), no scarves, flags or jerseys.
  Soft bodies (owner, 2026-11-17 afternoon: "stiff and split into blocks — make it flexible and smooth"; v1.6.3): `mSkin` merges the flesh per material into
  SkinnedMeshes whose bones are the rig joints (bands around each pivot; only `MS_THICK` joints pull the parent's flesh; never the root; fur shells borrow their twin's weights);
  skinned meshes need their own material copy (`mSkMat`, `skinning:true` — this three.js keeps one shader per material); limbs are one tube (`mLimb`); tails are chains
  (`from`/`share`/`own`); `mSmooth` springs every joint + `R.off` toward the pose (ω per joint in `S.om`). Videos: `node mscvid.js`.
  Eyes (owner, 2026-11-17 evening: "the eyes look unnatural"; v1.6.4): smooth eyeball with a painted iris texture (`mEyeMat`: fibres, limbal ring, round / slit pupil, catch-lights)
  + real upper / lower lid shells (`mEyeObj`, almond opening per species `o`, slant `t`); blinking / narrowing moves the lids (`mLid`, never scale the eye), looking turns the eyeball.
  Sockets (owner, 2026-11-17 night: "still unnatural" — at match distance the eyes read as beads stuck on the head / specks lost in the fur): `mSocket` (lid param `p`) puts a ring of skin
  around each eye that hugs the eyeball and slopes into the head; every point stays outside the lids' sphere (1.12 × radius) so blinking never cuts it; lids + socket are matte, no rim light,
  double-sided (`mSockMat`) — a shiny or culled edge reads as a ring. Arctic fox / polar bear / snowy owl = dark rims (+ dark fox lids), walrus = a heavy upper skin fold in the head's own
  material (`m`). Judge eyes at the real cut-scene distance (`node msccut.js <tag> intro 3.4 fox @walrus tall`), not only in close-ups.
  Close-ups: `node msclab.js <tag> "eye:<mascot>:<cam°>[:anim:t:dist:open]"`. Entrance = each one's own entrance → both reach out and really touch (paw / flipper / fin /
  wing / crystal arm, `mTouchTo` IK; spots from `mascSpots`, bodies kept apart by `mascGap`) → own bow → signature; end = victory / defeat act per mascot
  (narwhal shows off when it wins, thrashes its horn when it loses). Visual only: the match waits (`G.masc` freezes `step`), skip by tap / back (not online
  entrances), setting `save.set.masc`. Automated browsers (`navigator.webdriver`) and the Node harness skip the scenes unless `window.PH_MASC=1`.
  `v47_mascot.js` is minified by terser at build time (`tools/minjs.js`; install once: `cd tools && npm ci`). Check `node msclab.js t col` (no overlaps, tips meet) after pose changes; every mesh needs a real material; bodies of revolution (`mRev`) must face outwards.
- Run mode (owner, 2026-11-18; v49, `run-v49.md`): "make it something I want to keep playing — it's not fun"; asked what is not fun, the owner picked
  "the match itself is flat" + "after one match there is no reason to play another". The game already had goal banners / replays / fever / combos / daily goals,
  so the answer is 🧊 펭귄 원정 (`v49_run.js`): a run of short matches; after every win pick 1 of 3 upgrade cards (`RUN_UP`, applied through `p.tt` on our skaters,
  `p.gkd` on our goalie), a twist per stage (`RUN_MOD`: blizzard / thin ice / night = rink conditions, golden-puck rush, comeback 0:1, first to 3, fast / sniper /
  brick-wall opponents), a boss every 5th stage, endless scaling after 10, 2 lives (max 4), best record, reward (20 + 10 × stage, boss × 2, 🪙 +25 %) paid as the
  result's extra row. Points only, free, offline. Home card `#menuRun` under the tiles (portrait; hidden at max-height 520 like 오늘의 목표), entry in 모든 경기 모드.
  `save.run` (additive, sanitised in loadSave with literals). Tests: `v49test.js`, `br/v49run.js`.
- Graphics steps (owner, 2026-11-23; v50, `graphics-v50.md`): "low-end phones lag too much — add 초고사양 and 초저사양" → 그래픽 has five steps
  (초고사양 · 최고 · 높음 · 절약 · 초저사양). The old three stay exactly as they were (`save.set.quality` ultra / high / low is read everywhere); the new ones are
  `save.set.qx` +1 on top of ultra / −1 under low (`gqX`, `gqLevel`, `gqSet`; additive, sanitised in loadSave). 초저사양: no far colonies, no shadow map (contact pools instead),
  floodlight point lights off, 75 % resolution, 30 fps (physics keeps 1/120 s), half the particles, 3 fur layers, no backdrop blur, no MSAA from the next start.
  초고사양: up to 3× resolution, 16 fur layers, 16× ice anisotropy. The caption under the row = `gqDesc` (numbers from `GQ`). Never switches by itself: a one-time hint
  (`#gqTip`, `save.gqHint`) after 4 s of play still slow after the automatic step-down. Tests: `v50test.js`, `br/v50gfx.js`; same frame at every step: `node gqcmp.js tall`.
- Goalies + positions (owner, 2026-11-24; v51, `goalie-v51.md`): "add a goalie draw to the penguin draw and let me pick my position (2 or more a side); I can play goalie
  too, but only with characters from the goalie draw". 뽑기 tab has 🐧 펭귄 / 🥅 골키퍼 (`gkKind`): 10 goalies (`GKC`: species model, 5 stats, skill `GKS`; grades 3·3·2·1·1), points only
  (`GKD`: 40 / 360P, odds 50·30·14·5·1, pity 30, 10-draw 레어+, free daily); duplicate = level +1 (max 5) then refund; card portrait = `p3Shot(sp,{g})` in goalie gear with the mask
  pushed up (`p3GkGear`, `GKD.mask`). The equipped goalie (`save.gk.eq`) is our goalie in offline matches (`gkCardOK`): stats tune the goalie AI from the difficulty baseline
  (`gkParams`, stat 3 = unchanged), no card = the old default exactly; online / missions untouched. 팀 편성 → 내 포지션 (`save.set.pos`, 2+ a side, `gkPosOK`): 공격 / 중앙 / 수비 swap
  the captain's role + spot (`gkPerm`); 골키퍼 (needs an equipped goalie) = you control the goalie all match (`G.gkMode`, `setHuman` wrapper keeps you in net; shootout / penalty
  shot: shoot on your turn, guard on theirs), skaters all AI. In net (`gkHuman`): hands off = holds the angle, Shoot = dive (toward the shot's crossing, max `GKD.reach`; wide /
  nothing = butterfly) or clear, Pass = pass out, Special = skill; a shot at your net slows the game (`G.slow`) and rings the goal line (`GKM`); Dash / Switch hidden (`body.gk-mode`).
  Save sanitised in loadSave. Tests: `v51test.js`, `br/v51gk.js`; portraits `br/gklab.js`.
- Friends + co-op (owner, 2026-11-25; v52, `friends-v52.md`): "친구와 같이 하는 경험 … 친구 추가 기능" → 경기 모드 → 친구 (tabs 친구 / 대전 · 협동 / 랭킹).
  Friends need Google sign-in: 8-letter friend code (`codes/`), request → accept, list with online dot, gifts (`SOCD`: 30P, 10 a day, one per friend per 20 h, rules enforce it),
  invites (toast → 참가), ranking (원정 최고 / 감독 레벨 / 친구 대전 승 / 협동 승). Online 2:2 co-op: both friends on blue vs an AI team (room `m`/`d`, start `o`/`h`),
  host steers blue #1, the friend blue #2, no switching at all (`G.coop`), blue = host's kit. Rooms default to 1:1 (old behaviour); signed out the screen opens on the room code.
  `save.social` additive + sanitised. Server: `users/`, `codes/`, `inbox/{uid}/{fr,req,inv,gift}` (rules in `firebase/database.rules.json` — deploy them);
  account deletion wipes it (`socWipe`). Tests: `v52test.js`, `br/v52social.js` (emulators).
- Landscape must stay comfortable (owner, 2026-11-05): the app is not locked to portrait; check `node v30land.js wide` after UI changes.
- Keep all features, sound, PC + mobile controls and saves. Save key `penguinHockey.v1`; only add fields, never rename/remove (old saves must load).
- Report to the owner in Korean.
- The game file must stay ≤ 5 MB with three.js bundled (owner, 2026-11-24: "up to 5 MB is fine"; it was 2 MB before — the build stops above 5 MB).
  Fonts stay on Google Fonts in the web file (the Android build bundles them). `v20_bundle.py` prints the size (2026-11-24: ≈ 2.05 MB).
  The minification below stays (a smaller file loads faster on phones), but a feature no longer has to squeeze into 2 MB. Room is made with `rdm('vNN_x.js')` (terser via `tools/minjs.js`, `evaluate:false`) for modules whose insides no later patch edits:
  v19, v22, v24, v26, v38, v44, v45, v46, v47, v49, v50, v51, v52 + v29, v32, v33, v34, v40, v41, v42, v43, v48 (2026-11-24). A module a later anchor reaches must not be `rdm`:
  insert it with `rdk('vNN_x.js')` instead (readable between `/*RK:*/` markers; `minify_marked()` minifies it in place after every feature patch, before v16 — v10_core,
  v10_fun, v10_carry, v12, v17, v18, v23, v25, v31, v35, v36, v39; NOT v11 / v13, which v16 anchors into). The strict build stops on a missed anchor. The `<style>` blocks are
  minified in `v20_bundle.py` (`tools/cssmin.py`, comments / whitespace only). `i18n/wrap.js` puts a space before `__L(` after an identifier (minified `return'…'`).
  Since minified modules no longer read as source, tests must call functions, not regex their `toString()`.

## Build
```
python3 apply_v10.py          # strict: fails on any anchor mismatch or missing translation
I18N_LAX=1 python3 apply_v10.py   # dev only: untranslated strings fall back to Korean
```
`apply_v10.py` starts from `v9.html`, applies exact-anchor patches `R(old,new,cnt)` (aborts on mismatch), then runs the
feature patch files in order: … `v17_feat.py`, `v18_species.py`, `v19_gfx.py`, `patchlib.py`, `v21_rarity.py`, `v22_rules.py`,
`v23_cast.py`, `v24_pass.py`, `v25_cine.py`, `v26_sig.py`, `v27_pro.py`, `v28_app.py`, `v29_gfx.py`, `v30_land.py`, `v31_net.py`,
`v32_bond.py`, `v33_daily.py`, `v34_clutch.py`, `v35_acct.py`, `v36_ctl.py`, `v37_weekly.py` (weekly fixes 2026-11-09), `v38_hockey.py`, `v39_luxe.py`, `v40_mate.py`, `v41_card.py`, `v42_store.py`, `v43_model.py`, `v44_fun.py`, `v45_stick.py`, `v46_kit.py`, `v47_mascot.py`, `v48_ice.py`, `v49_run.py`, `v50_qual.py`, `v51_gk.py`, `v52_social.py`, then `v16_i18n.py` (must stay after every patch that adds Korean text) and `v20_bundle.py`.
- Feature code lives in `vNN_*.js` / `.css`, inserted before `/* ================= INIT ================= */`.
- `patchlib.py`: `RF(name,new)` replaces a whole function, `FN(name)` returns it, `RIN(fn,old,new)` edits inside one function.
- `loadSave()` runs early (before the feature modules): helpers it calls must use literals only.
- i18n: every new Korean literal needs `X={ko:(en,zh,ja)}` in `i18n/en/x*.py`; static markup text goes in `i18n/st/static.py`;
  use `fmtL('… {slot} …',{slot})` instead of string concatenation; no ASCII quotes inside translations.
  `python3 tools/missing.py` lists missing keys.
- The build also writes `main.js`, `loader.js`, `i18n.js` used by the Node test harness.

## Online (Firebase) — see `online-account.md`
- v31 friend match (6-letter code, WebRTC + database relay fallback, host-authoritative) and v35 Google sign-in + cloud save
  (`saves/{uid}`, never overwrites silently: the player picks this device / cloud; account deletion in the app).
- Firebase project moved (owner, 2026-11-26: the old project's Google account could not be signed in to) → new project `penguin-hockey-cace5`
  (Realtime Database in asia-southeast1, Google + anonymous sign-in, Android app `com.ysgames.penguingame` with upload / debug / Play signing SHA-1, a web app for the API key).
  Authorized domains must include `appassets.androidplatform.net` (the WebView origin; without it Google sign-in in the app fails — verified by the owner on a phone 2026-11-27, 1.9.2). From 1.9.1 (19) the app uses it; cloud saves in the old project are not reachable from the new app (local saves stay). Rules were pasted in the console.
- Config comes from `firebase-config.json` in the build folder at build time (`apiKey`, `dbUrl`, `webClientId`, optional `ice`;
  example in `firebase-config.example.json`). Without it both features say the server is not connected. Rules: `firebase/database.rules.json`.
- Emulators for tests: `cd firebase && firebase emulators:start --project demo-ph --only auth,database` (auth :9099, db :9000).
  One command: `bash tools/emu.sh` (installs firebase-tools if missing, starts both, waits; needs java — present in the cloud workspace, jar download works through the proxy).
  **Weekly run: start it before the tests** so `v31test.js`, `v35test.js`, `br/v31net.js` and `br/v35acct.js` really run (verified 2026-11-09: 14 / 20 / 24 / 27 pass).
  With a real `firebase-config.json` present two offline "server not connected" checks fail by design — build without it for tests.
  `br/v31net.js tall` failed 3 checks on three runs back-to-back right after the emulators started, then passed 24/24 four times: when it fails, rerun once before calling it a bug.
  `RELAY=1 node v31net.js pc` (database relay) is flaky on the 2-core cloud box: 3 of 8 runs on 2026-11-09 failed one check
  (position 2 m apart after the key release, or one skill press not seen within 0.8 s); rerun before calling it a bug.
- v32 growth stories (`bond`), v33 7-day attendance (`login`, trail `dly`), v34 comeback drama — see `growth-daily-comeback.md`.
  Browser tests of other screens set `window.PH_NODAILY=1` so the attendance window does not cover them.

## Android app (Play Store build) — see `android-app.md`
- `android/` (Gradle, Java): full-screen WebView loading the built HTML from assets (copied at build time from `penguin-hockey-improved.html`),
  Play Billing for `pro_pass`, Google sign-in (Credential Manager, `GoogleAuth.java`, ops `gsignin`/`gsignout`), back button, pause, save mirror + Auto Backup. Game side: `v28_app.js` (`PHAndroid` web-message bridge → `PHBilling`).
- `cd android && ./gradlew assembleDebug bundleRelease testDebugUnitTest lintDebug` (needs `local.properties` with `sdk.dir`; release is signed
  only when `android/keystore.properties` exists — never commit keys). `applicationId` is permanent after the first upload.
- Maven Central sometimes answers 429 through the proxy: use `--max-workers=1` and retry after a pause.

## Tests
- Unit suites (Node, mocked THREE): `bash runsuites.sh` (≈ 15 min). Single suite: `node v22test.js`. `v35test.js` reports its online
  checks as SKIPPED unless the Firebase emulators run.
- Fish-pass seasons follow the real calendar (28 days from 2026-10-26; season 2 began 2026-11-23). Node pass suites pin the clock with `PH_NOW` (harness.js;
  v24test / v27test use a day in season 1, child processes inherit it); browser tests seed progress for today's season with `require('./season.js')()`.
- `tools/refsim.js`: how much the referee turns (°/s, direction reversals) in AI-vs-AI matches.
- `tools/hksim.js`: a scripted human against the AI, auto switching vs buttons only — goals, carry %, why the penguin changed, who shoots / scores on your team (you or an AI mate) and how calls for the pass go (`N=4 node tools/hksim.js`; `PHDIR=<folder with another build's harness.js, main.js, loader.js, i18n.js>` compares builds; ≈ 35 s per match). `v40test.js` has chance-based checks written as n-of-N.
- AI-vs-AI numbers from before 2026-11-09 (`rulesim`, `refsim`, the referee part of `v29test`) are not comparable: the old auto switching ran
  before its no-human check, so the blue puck carrier became a zero-input "human" in ≈43 % of play frames and stood still. v38 fixed it;
  `v29test` now asserts the match is really AI vs AI (referee limits re-set to real play: reversals < 70/min, turning < 90°/s; measured 35–50 and 52–69). New baseline (2026-11-09, `N=4 RULES=full`, 3 min): 6.25 goals, 4.5 calls,
  12.2 s stoppage, 42 s in the box per match, 0 stuck, 0 errors (the 2026-11-09 weekly's 2.58 goals were the frozen-carrier version).
- `tools/rulesim.js`: AI-vs-AI matches with the referee — calls per match, goals, stoppage time (`N=6 RULES=full|fouls|off node tools/rulesim.js`).
- Real browser (SwiftShader WebGL): `cd br && npm ci` once, then e.g.
  `node homeverify.js pc`, `node langswitch.js`, `node v17ui.js tall en`, `node v18play.js pc`, `node v19gfx.js pc`, `node offline.js pc`,
  `node i18nscan.js tall ja`, `node v23cast.js pc all` (skill animations + referee), `node v24ui.js tall ko` (pass / rules UI),
  `node v25cine.js pc|tall|wide all` (skill cinematic frame by frame; CSS animations are seeked to the scene time),
  `node v30land.js wide|wideS|padl|tall|pc <lang>` (landscape phones: full-height panels, one-line header, nothing overlaps) and `node landcap.js <mode> <tag>` (landscape screenshots),
  `node v31net.js pc|tall` (+`RELAY=1`) and `node v35acct.js pc|tall|wide <lang>` (need the Firebase emulators),
  `node v32bond.js`, `node v33daily.js`, `node v34clutch.js` `<pc|tall|wide|wideS> <lang>`,
  `node v36ctl.js <pc|tall|wide|wideS> <lang>` (controls: layout editor, saved layout in a match, follow / fixed joystick, cooldown rings),
  `node v37fix.js <pc|tall|wide|wideS> <lang>` (touch labels on one line, landscape home titles, finished fish pass on the objectives screen),
  `node v38hk.js <pc|tall|wide|wideS> <lang>` (no automatic switching with the stick held, white Switch ring, off-screen arrow, 뺏기 / 패스 요청 labels and taps, 펭귄 교체 setting),
  `node v39luxe.js <pc|tall|wide|wideS> <lang> <day|night>` (detail pass: quick-match button unchanged, tile emblems, bolted boards, LED scoreboard, goal show, shot streak, 절약 / flash-off),
  `node v41card.js <pc|tall|wide|wideS> <lang>` (card portraits: 16 rendered images, renderer left untouched, board layout, silhouettes, scout banner / collection / card window, team colour, drawing fallback),
  `node p3lab.js <sheet|big|cards> <tag>` (portrait / card sheets with the CURRENT `v41_card.js/.css` swapped into the built game — no rebuild while iterating) and `node cardshot.js <mode> <lang> <tag>`,
  `node v42legal.js <pc|tall|wide|wideS> <lang>` (privacy / deletion links in 설정 and the account window), `node v42gauge.js tall <lang>` (the skill name fits the round gauge for every species; it shrinks to fit since 2026-11-13), `node storeshot.js <ko|en> [scene,…]` (Play Store screenshots + feature graphic → shots/store; convert to RGB before upload),
  `node v43model.js <mode> <lang>` (model on real three.js + close-up), `node mlab.js <tag> close,all,hats,match` (model shots with the CURRENT `v43_model.js`), `node v44fun.js <pc|tall|wide|wideS> <lang>` (coach bar, result rows, level-up moment), `node v45gear.js <pc|tall|wide|wideS> <lang>` (stick workshop + kit designer: odds on screen = code, reveal + back button, craft / upgrade, 3D stick, kit portrait, kit in a match),
  `node v52social.js <pc|tall|wide> <lang>` (friends + co-op on three browser profiles through the emulators: code, request / accept, gift + rules, ranking, invite toast → co-op match, account deletion wipe),
  `node v51gk.js <pc|tall|wide|wideS> <lang>` (🥅 draw on the 뽑기 tab: odds on screen = code, reveal, equip; 팀 편성 goalie card + 내 포지션 + picker; a match in net: buttons, camera, tip, slow-down + goal-line ring),
  `node v50gfx.js <pc|tall|wide|wideS> <lang>` (graphics steps: five on one line, caption = code, what each step does to the renderer, triangles, MSAA after a reload, fur layers, the hint),
  `node v49run.js <pc|tall|wide|wideS> <lang>` (🧊 run: home card, intro, stage / boss cards, a run match, win → reward row = paid → pick 1 of 3 → next stage, loss / run over, reload, layout, translation; drives the game clock by hand),
  `node v48ice.js <pc|tall|wide|wideS> <lang>` (ice row in 설정: five steps on one line, tap / save / reload, the match skates with the chosen step, online = 3),
  `node v47masc.js <pc|tall|wide|wideS> <lang>` (mascot cut-scenes: entrance freezes the match, the greeting tips really touch, hole in the ice / strike, skip, short / off, end scene before the result, every mascot × animation, online lock, kit preview),
  `node msclab.js <tag> <all|row1|row2|sp:…|anim:…|hs:A:B:u|col>` and `node msccut.js <tag> <intro|end:win|end:lose|end:draw|pv:mas:res> <t,…> [mascot] [opp name | @mascot] [tall|pc|wide]` (CURRENT `v47_mascot.js`, no rebuild),
  `node v29gfx.js pc|tall|padp|wide` (shadow map / fitted shadow camera / smoother models), `node gfxshot.js <mode> <quality> <tag>` and
  `node modelab.js` (before/after screenshots), `node v28app.js tall ko` (the game inside the app with a mock of the Android side: purchase taps, back button on every screen, pause, exit).
  Screenshots go to `br/shots/`. Look at them — passing asserts are not enough for visual work.
  CSS animations stand still at their first frame in these headless captures: seek them with `document.getAnimations()` before a shot.
- Cloud box has 2 cores: the full browser list takes ≈ 2.5 h. Run browser tests one after another (not next to `runsuites.sh` or
  `rulesim`), and run `SHOTS=1 node i18nscan.js` with a long timeout (> 25 min each under load). `i18nscan` ignores the 9 px larger
  touch target of `.tb` buttons (v36) when it looks for text spilling out, and (since 2026-11-13) counts a clipped box only when its own text
  is cut (the v39 tile emblems overflow on purpose). It prints `SUMMARY <lang> <mode> layout=… visibleHangul=…` — grep that line. Baseline 2026-11-13 tall: en 2, ja 5, zh/ko similar; the rest are the skill cut-in (wider than the screen on purpose) and one Japanese line break in “50P”.

## Weekly self-critique (every Monday)
1. Build and run the unit suites + the browser checks above; note anything failing or slow.
2. Play-test by simulation and screenshots: AI-vs-AI sims (goals, calls, stuck states), each species' skill, home / scout / pass / result screens on pc, tall (390×844) and wide (844×390) in ko/en/zh/ja.
3. Write a short critique: the 3–5 most important problems (bugs, unfair numbers, confusing UI, balance, performance, text that does not match the code).
4. Fix the most important ones in the patch files (never hand-edit the built HTML), add or update tests, rebuild, rerun everything.
5. Commit to a branch `weekly/YYYY-MM-DD`, push, open a PR with the critique, what changed, test results and anything not verified (with the reason).
6. Report to the owner in Korean.

## Docs
`build-size.md`, `graphics-v19.md`, `new-species-10.md`, `season-conditions-combo.md`, `language-support.md`, `rules-referee.md`,
`rarity-v21.md`, `sardine-pass.md`, `skill-cast.md`, `android-app.md`, `graphics-v29.md`, `landscape-v30.md`, `online-account.md`,
`growth-daily-comeback.md`, `controls-v36.md`, `hockey-v38.md`, `premium-look-v39.md`, `mates-cards-v41.md`, `store-ready-v42.md`, `final-v44.md`, `stick-kit-v46.md`, `mascot-v47.md`, `run-v49.md`, `graphics-v50.md`, `goalie-v51.md`, `friends-v52.md` (also kept in the claude.ai project).
