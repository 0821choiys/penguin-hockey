# 친구 + 온라인 2:2 협동 (v52, v1.9.0, 2026-11-25)

Owner (2026-11-25): "두 번째는 친구와 같이 하는 경험이에요 이거 먼저 하고 친구 추가 기능 추가해줘".
Picked in the question: **온라인 2:2 협동, 친구 기록 비교·랭킹** and **코드 + 선물 보내기까지**.

Code: `v52_social.js` / `.css` / `.py`, translations `i18n/en/x52.py` (+ 2 static strings), rules `firebase/database.rules.json`.
Tests: `v52test.js` (Node, 33), `br/v52social.js <pc|tall|wide> <lang>` (3 browser profiles on the emulators, 40).

## What the player sees
- 경기 모드 → **친구** (was 친구 대전). One screen, three tabs:
  - 👫 **친구**: my 8-letter friend code (copy), a code field + 친구 추가, incoming requests (수락 / 거절), the list
    (online dot = seen in the last 3 min, "n분 전" otherwise) with 🎁 gift · ⚔️ 1:1 invite · 🤝 co-op invite · ✕ remove.
    A badge on the tab counts requests + unclaimed gifts.
  - ⚔️ **대전 · 협동**: the old room-code screen + a 1:1 / 2:2 switch; 2:2 picks the AI difficulty.
    Works without an account (anonymous, as before). Signed out, the screen opens on this tab.
  - 🏆 **랭킹**: me + friends, by 원정 최고 / 감독 레벨 / 친구 대전 승 / 협동 승 (ties share a place).
- Friends need a Google sign-in (the list lives in the account, survives a phone change). Signed out the 친구 tab offers 로그인.
- An invite shows a toast anywhere outside a match (참가 → joins the room; 거절 deletes it). Invites older than 10 min are ignored.

## Numbers (`SOCD`)
gift 30P each · max 10 claimed a day · one gift per friend per 20 h (`gap`, enforced by the rules too) · 50 friends · heartbeat 60 s ·
online = seen within 180 s · invite valid 10 min · code 8 letters from `NET_AB`. Points only, nothing random, nothing paid.

## 2:2 co-op
- The host's room carries `m` (vs / coop) and `d` (difficulty); the start message adds `o` (the AI team: 2 random species from
  `SOCD.oppPool`) and `h` (hat). `netBegin` → `startMatch(socCoopCfg(...))`: `size:2`, `netTeam:'blue'` on BOTH phones,
  `myTypes` = [host's captain, guest's captain] (same order on both), `flat:true` (no levels / stick, like 1:1).
- Host steers blue #1, the friend blue #2 (`netSetRemote` on the host, `setHuman` on the guest). Nobody switches: `setHuman` refuses
  the friend's penguin, `netSetRemote` is locked, Switch / auto switching / `netAutoSwitch` are off, `#tbSwap` hidden (`body.coop-mode`).
- Kits: blue wears the host's kit, red is standard (`kitSync` wrapper).
- Results: `save.social.cw/cl` (co-op) and `fw/fl` (1:1 friend match), pushed to `users/{uid}.st` for the ranking.

## Server data (Realtime Database)
- `users/{uid}` = `{n, c, t, st:{run,lv,fw,cw}}` — readable by signed-in users, written by the owner (Google only).
- `codes/{CODE}` = uid — created once / deleted by the owner.
- `inbox/{uid}/fr/{f}` (friend since), `req/{f}` (n, t), `inv/{f}` (c, m, n, t), `gift/{f}` (t) — only the owner reads.
  Requests: anyone signed in with Google. Friend entries: the owner when a request from f exists, f after adding the owner.
  Invites / gifts: friends only; a gift only if the last one is older than 20 h and `t === now`.
- Account deletion (`accDelete` → `socWipe`): removes me from each friend's list, my code, inbox and profile. Privacy / deletion pages updated.

## Save (additive)
`save.social = {fw, fl, cw, cl, cn, cday, claim:{uid:t}, sent:{uid:t}}` — sanitised in loadSave (numbers clamped, keys `^[A-Za-z0-9_-]{6,40}$`, ≤ 200).

## Not verified
- Real two-phone play over mobile networks (only two / three browser profiles on one machine through the emulators).
- The real Firebase project needs the new rules deployed (`firebase deploy --only database`) — without them friend requests fail with 401.
