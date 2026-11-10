# Penguin Hockey — working notes for Claude

Single-file Three.js arcade hockey game, published on the Play Store (project "펭귄하키").
The shipped file is `penguin-hockey-improved.html` (deliver it as `penguin-hockey-ultimate.html`).

## Standing rules from the owner (always apply)
- 실제 브라우저에서 실행할 수 없는 테스트는 통과했다고 주장하지 말고, 실행하지 못한 항목과 이유를 명시한다.
- 일부 함수나 CSS만 제공하고 사용자가 직접 합치게 하지 않는다 — always deliver the complete built HTML file.
- Real money only for the 💎 Pro Pass (owner's decision 2026-11-03): 8,900원, one Google Play purchase per fish-pass season, no auto-renewal
  (product `pro_pass`, consumable; see `sardine-pass.md`). Everything else (scouting, market, hats, trails) stays in-game points only.
  Paid random rewards must show their odds on screen.
- Every probability / number shown on screen must equal the code that decides it (tests check this).
- Controls (v36, `controls-v36.md`): shots / passes aim where the stick points; easy handling applies to human-controlled
  skaters only (never AI), always on for both players online; layout per orientation in `save.set.ctl`.
- Switching (owner, 2026-11-09; v38, `hockey-v38.md`): the human's penguin changes ONLY on a pass (→ receiver) or the Switch button
  (→ team-mate nearest the puck = the white ring). The only forced change is the penalty box. Auto switching is a setting
  (`save.set.ctl.auto`, off by default, never online). Without the puck the buttons follow the play: Shoot = 뺏기 (poke) when an
  opponent carries, Pass = 패스 요청 (call) when an AI team-mate carries.
- Look (owner, 2026-11-10; v39, `premium-look-v39.md`): FC-Mobile-like premium style — gold trim, gloss, light rays. v39 changes colours /
  backgrounds / shadows only (no sizes or positions) and its match show is visual only (own random numbers `lxr`, off at 절약 quality,
  rays follow the flash / reduced-motion settings). On white ice: additive light is invisible and warm tints look like stains — use
  ice-blue / team colours; flat things on the ice need `polygonOffset` stronger than the ice's (-2).
- Landscape must stay comfortable (owner, 2026-11-05): the app is not locked to portrait; check `node v30land.js wide` after UI changes.
- Keep all features, sound, PC + mobile controls and saves. Save key `penguinHockey.v1`; only add fields, never rename/remove (old saves must load).
- Report to the owner in Korean.
- The game file must stay ≤ 2 MB with three.js bundled (fonts stay on Google Fonts). `v20_bundle.py` prints the size.

## Build
```
python3 apply_v10.py          # strict: fails on any anchor mismatch or missing translation
I18N_LAX=1 python3 apply_v10.py   # dev only: untranslated strings fall back to Korean
```
`apply_v10.py` starts from `v9.html`, applies exact-anchor patches `R(old,new,cnt)` (aborts on mismatch), then runs the
feature patch files in order: … `v17_feat.py`, `v18_species.py`, `v19_gfx.py`, `patchlib.py`, `v21_rarity.py`, `v22_rules.py`,
`v23_cast.py`, `v24_pass.py`, `v25_cine.py`, `v26_sig.py`, `v27_pro.py`, `v28_app.py`, `v29_gfx.py`, `v30_land.py`, `v31_net.py`,
`v32_bond.py`, `v33_daily.py`, `v34_clutch.py`, `v35_acct.py`, `v36_ctl.py`, `v37_weekly.py` (weekly fixes 2026-11-09), `v38_hockey.py`, `v39_luxe.py`, then `v16_i18n.py` (must stay after every patch that adds Korean text) and `v20_bundle.py`.
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
- `tools/refsim.js`: how much the referee turns (°/s, direction reversals) in AI-vs-AI matches.
- `tools/hksim.js`: a scripted human against the AI, auto switching vs buttons only — goals, carry %, why the penguin changed (`N=4 node tools/hksim.js`).
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
  `node v39luxe.js <pc|tall|wide|wideS> <lang> <day|night>` (premium look: home rays / gold hero button, scoreboard, goal show, shot streak, 절약 / flash-off),
  `node v29gfx.js pc|tall|padp|wide` (shadow map / fitted shadow camera / smoother models), `node gfxshot.js <mode> <quality> <tag>` and
  `node modelab.js` (before/after screenshots), `node v28app.js tall ko` (the game inside the app with a mock of the Android side: purchase taps, back button on every screen, pause, exit).
  Screenshots go to `br/shots/`. Look at them — passing asserts are not enough for visual work.
  CSS animations stand still at their first frame in these headless captures: seek them with `document.getAnimations()` before a shot.
- Cloud box has 2 cores: the full browser list takes ≈ 2.5 h. Run browser tests one after another (not next to `runsuites.sh` or
  `rulesim`), and run `SHOTS=1 node i18nscan.js` with a long timeout (> 25 min each under load). `i18nscan` ignores the 9 px larger
  touch target of `.tb` buttons (v36) when it looks for text spilling out.

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
`growth-daily-comeback.md`, `controls-v36.md`, `hockey-v38.md`, `premium-look-v39.md` (also kept in the claude.ai project).
