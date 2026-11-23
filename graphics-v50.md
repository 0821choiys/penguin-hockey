# 그래픽 5단계 — 초고사양 / 초저사양 (v50, v1.7.1, 2026-11-23)

Owner (2026-11-23): "저사양 핸드폰에서 렉이 너무 걸려 설정에서 그래픽 품질 초고사양하고 초저사양 추가해줘".

## What the player sees
설정 → 그래픽: five steps on one line — **초고사양 · 최고 · 높음 · 절약 · 초저사양** — with a small bar under each label (longer = heavier),
and under the row the chosen step spelled out with what it really does (`gqDesc`, numbers from `GQ`):

| step | resolution (× screen density) | shadows | reflections / post | extra |
|---|---|---|---|---|
| 초고사양 | up to 3× | 4096 | on / on | mascot fur 16 layers, ice texture anisotropy 16× |
| 최고 (default) | up to 2× | 4096 | on / on | fur 12 |
| 높음 | up to 2× | 3072 | on / off | fur 8 |
| 절약 | 1× | 1024 | off / off | fur 5 |
| 초저사양 | 0.75× | **off** (soft contact pools under skaters + puck instead) | off / off | far penguin colonies hidden, floodlight point lights off, 30 fps, half the particles, fur 3, no CSS backdrop blur, no MSAA (from the next start — the row says so) |

The automatic step-down while playing (`perfSample`: tier → resolution ×0.6 → no shadows) still runs on top of every step.

## Code
- `v50_qual.js` / `.css` / `.py`, translations `i18n/en/x50.py`.
- Save: the old `save.set.quality` (ultra / high / low) is read in many places and keeps its meaning. The new steps are `save.set.qx`:
  +1 counts only with ultra (= 초고사양), −1 only with low (= 초저사양); anything else is 0 (`gqX`). `gqLevel()` / `gqSet(l)` translate.
  Additive field, sanitised in `loadSave` with literals (`[-1,0,1]`). Old saves load unchanged.
- `applyQuality` → `renderer.setPixelRatio(gqRatio() × perf.scale)` and `gqScene()` (colonies, lamp point lights, shadow map + `sun.castShadow`,
  material refresh when the light / shadow set changes, ice anisotropy, body classes `gq-xlow` / `gq-max`).
- `frame()` skips a display refresh on 초저사양 when the last frame is younger than 1/30 s (`gqSkip`); physics keeps its fixed 1/120 s step;
  `perfSample` is fed the time scaled to 60 fps so the automatic step-down does not mistake the cap for a slow phone.
- Renderer creation: `antialias:false` when 초저사양 is saved (MSAA can only be chosen when the GPU context is made).
- `v19_gfx.js`: contact pools also on at 초저사양 (`cshFrame(t>=1||gqX()<0)`). `v47_mascot.js` `mFurGeo`: 3 / 5 / 8 / 12 / 16 layers.
- `emit` drops half the particles on 초저사양.

## The hint (never switches by itself)
New players start on 최고. If the phone is still slow after the automatic step-down (`perf.scale ≤ .6` and frames slower than 1/34 s for 4 s of play,
not online, not paused, not already 초저사양), a pill shows once: "🐢 화면이 끊기면 그래픽을 초저사양으로 바꿔 보세요" [초저사양으로] [✕].
`save.gqHint = 1` → never again. Closes itself after 14 s. Portrait: below the round skill gauge.

## Measured (software GPU in the cloud box — only relative numbers mean anything)
- `br/v50gfx.js tall` (390×844 @3×, a match frame, shadow + reflection passes counted): triangles per frame
  초고 2.54 M · 최고 2.55 M · 높음 2.15 M · 절약 1.97 M · **초저 0.48 M (−76 % vs 절약)**; draw calls 435 · 436 · 415 · 276 · **162**.
- `br/gqcmp.js tall` (same frame drawn at every step): 절약 2.31 M / 279 calls → 초저 0.63 M / 154 calls (−73 %).
- Pixels drawn: 초저 0.75² = 56 % of 절약; at 30 fps half as many frames a second.
- Not measurable here: real frame rate on a real low-end phone (no device in the cloud box).

## Tests
- `node v50test.js` (23): levels round-trip, `pkLo`/`rkLo` on 초저, stray `qx` ignored, ratios for dpr 3 / 1.5, caption numbers = code, shadow sizes,
  `gqSkip` timing, hint logic, colony parts, save load / sanitise.
- `node br/v50gfx.js <pc|tall|wide|wideS> <lang>` (22–23): the row (five on one line, inside the panel, translated), each step in a match (resolution,
  shadow map, colonies, lamps, contact pools, body class, triangles, anisotropy), fur layers, MSAA off after a reload, the hint + its button.
- `br/v19gfx.js` updated for five buttons (0 초고 · 1 최고 · 2 높음 · 3 절약 · 4 초저).
