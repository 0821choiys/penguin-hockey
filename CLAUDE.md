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
`v23_cast.py`, `v24_pass.py`, `v25_cine.py`, `v26_sig.py`, `v27_pro.py`, `v28_app.py`, `v29_gfx.py`, then `v16_i18n.py` (must stay after every patch that adds Korean text) and `v20_bundle.py`.
- Feature code lives in `vNN_*.js` / `.css`, inserted before `/* ================= INIT ================= */`.
- `patchlib.py`: `RF(name,new)` replaces a whole function, `FN(name)` returns it, `RIN(fn,old,new)` edits inside one function.
- `loadSave()` runs early (before the feature modules): helpers it calls must use literals only.
- i18n: every new Korean literal needs `X={ko:(en,zh,ja)}` in `i18n/en/x*.py`; static markup text goes in `i18n/st/static.py`;
  use `fmtL('… {slot} …',{slot})` instead of string concatenation; no ASCII quotes inside translations.
  `python3 tools/missing.py` lists missing keys.
- The build also writes `main.js`, `loader.js`, `i18n.js` used by the Node test harness.

## Android app (Play Store build) — see `android-app.md`
- `android/` (Gradle, Java): full-screen WebView loading the built HTML from assets (copied at build time from `penguin-hockey-improved.html`),
  Play Billing for `pro_pass`, back button, pause, save mirror + Auto Backup. Game side: `v28_app.js` (`PHAndroid` web-message bridge → `PHBilling`).
- `cd android && ./gradlew assembleDebug bundleRelease testDebugUnitTest lintDebug` (needs `local.properties` with `sdk.dir`; release is signed
  only when `android/keystore.properties` exists — never commit keys). `applicationId` is permanent after the first upload.
- Maven Central sometimes answers 429 through the proxy: use `--max-workers=1` and retry after a pause.

## Tests
- Unit suites (Node, mocked THREE): `bash runsuites.sh` (≈ 15 min). Single suite: `node v22test.js`.
- `tools/refsim.js`: how much the referee turns (°/s, direction reversals) in AI-vs-AI matches.
- `tools/rulesim.js`: AI-vs-AI matches with the referee — calls per match, goals, stoppage time (`N=6 RULES=full|fouls|off node tools/rulesim.js`).
- Real browser (SwiftShader WebGL): `cd br && npm ci` once, then e.g.
  `node homeverify.js pc`, `node langswitch.js`, `node v17ui.js tall en`, `node v18play.js pc`, `node v19gfx.js pc`, `node offline.js pc`,
  `node i18nscan.js tall ja`, `node v23cast.js pc all` (skill animations + referee), `node v24ui.js tall ko` (pass / rules UI),
  `node v25cine.js pc|tall|wide all` (skill cinematic frame by frame; CSS animations are seeked to the scene time),
  `node v29gfx.js pc|tall|padp|wide` (shadow map / fitted shadow camera / smoother models), `node gfxshot.js <mode> <quality> <tag>` and
  `node modelab.js` (before/after screenshots), `node v28app.js tall ko` (the game inside the app with a mock of the Android side: purchase taps, back button on every screen, pause, exit).
  Screenshots go to `br/shots/`. Look at them — passing asserts are not enough for visual work.

## Weekly self-critique (every Monday)
1. Build and run the unit suites + the browser checks above; note anything failing or slow.
2. Play-test by simulation and screenshots: AI-vs-AI sims (goals, calls, stuck states), each species' skill, home / scout / pass / result screens on pc, tall (390×844) and wide (844×390) in ko/en/zh/ja.
3. Write a short critique: the 3–5 most important problems (bugs, unfair numbers, confusing UI, balance, performance, text that does not match the code).
4. Fix the most important ones in the patch files (never hand-edit the built HTML), add or update tests, rebuild, rerun everything.
5. Commit to a branch `weekly/YYYY-MM-DD`, push, open a PR with the critique, what changed, test results and anything not verified (with the reason).
6. Report to the owner in Korean.

## Docs
`build-size.md`, `graphics-v19.md`, `new-species-10.md`, `season-conditions-combo.md`, `language-support.md`, `rules-referee.md`,
`rarity-v21.md`, `sardine-pass.md`, `skill-cast.md`, `android-app.md`, `graphics-v29.md` (also kept in the claude.ai project).
