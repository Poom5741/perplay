# PerPlay PoC — Manual Browser Test Cases

> Changelog 2026-11-25 (task #20): TC-02 rewritten — catalog has no search box (search lives on the setlist page, covered by TC-09); TC-12 expected-result updated — unknown deep link keeps stale content, documented as known PoC behavior with a candidate-improvement note. No other cases changed.

Scope: browser (manual) test cases derived from `POC-SPEC.md`, `poc/DEMO-SCRIPT.md`, and the actual SPA routes found in `poc/public/app.js:1` (`#/catalog #/pay/:id #/screen/:id #/dashboard #/setlist #/health`) and `poc/public/index.html:14-17`.

- **Automation column**: `bcdp-ok` = fully executable via bcdp browser automation (navigate, click, upload, read DOM/network). `human-only` = requires a human (physical PromptPay app scan, judging visual quality, live-audio environment).
- **External deps column**: `none` = works against local/dev server alone; values in brackets mark what is required.
- All cases assume server running with `npm start` in `poc/` (see `poc/README.md`) and a clean ledger when noted (reset: `rm -rf data && restart`, per `poc/DEMO-SCRIPT.md`).
- No login/auth exists in the PoC (no accounts — out of scope per `POC-SPEC.md` "ตัดออกจาก PoC": membership/app/mobile app). Cases marked "no login" confirm this stays true.

---

## A. Core user flow (spec hypothesis 1 & 3: request → pay → licensed screen → on-chain receipt ≤ 30s, understandable in 5 min)

### TC-01 · Health & chain status indicator
- Pre: server running, no login (PoC has none).
- Steps: open `http://localhost:PORT/` → click the header status dot (`#/health`, `poc/public/index.html:16`).
- Expected: dot reflects chain status; health page shows `ok: true`, venue name, 100 songs, fingerprint count (`/api/health`, `poc/server.mjs:118`).
- Automation: `bcdp-ok` · External deps: [Base testnet RPC reachable for live chain status]

### TC-02 · Catalog loads with mock songs

> Corrected 2026-11-25 (task #20): the catalog page has NO search box — verified live: `document.querySelector('#q')` is null on `#/catalog` (the search input `#q` exists only on the setlist page, `poc/public/app.js:190` inside `pageSetlist`). Filtering is covered by TC-09.

- Pre: TC-01 passes.
- Steps: open `#/catalog`; verify song cards render (title/artist/label/price).
- Expected: cards render from `/api/catalog`; a "mock data" disclaimer is visible (demo-script minute 0–1 promise).
- Automation: `bcdp-ok` · External deps: none.

### TC-03 · One-tap request (Setlist mode)
- Pre: a song has been registered on tonight's setlist (TC-09) OR mode chip "วงสด — เซ็ตลิสต์" active (`poc/public/app.js:33`).
- Steps: click a song card → requestPlay fires (`app.js:46-49`) → land on `#/pay/:id`.
- Expected: payment page shows QR PromptPay payload, amount in THB, artist/label, and a "ยืนยันชำระแล้ว" (confirm paid) button.
- Automation: `bcdp-ok` · External deps: none.

### TC-04 · One-tap request (DJ / fingerprint mode)
- Pre: mode chip "DJ/ backing track — จับเสียงจริง (fingerprint)" active (`app.js:34`).
- Steps: click a song card → land on `#/pay/:id`.
- Expected: play is created with `verifyMode: 'acr'` (`poc/server.mjs:140-141`); pay page additionally shows the line-in simulation upload button ("🎙 จำลองจับเสียง line-in", `app.js:91`).
- Automation: `bcdp-ok` (upload a prepared audio file from `poc/audio/`) · External deps: [audio file exists]

### TC-05 · Payment confirmation (simulated)
- Pre: on `#/pay/:id` (TC-03/04).
- Steps: click "ยืนยันชำระแล้ว" (`app.js:72`).
- Expected: status advances per server response — setlist mode auto-verifies → redirect to `#/screen/:id`; acr mode responds `next: 'scan-audio'` (`app.js:79`) and reveals the scan/upload UI. UI must not hang; error path shows feedback, not a dead click.
- Automation: `bcdp-ok` · External deps: none.

### TC-06 · Payment feedback & frictions (UX edge states)
- Pre: on `#/pay/:id`; DevTools network panel open (manual aid).
- Steps: (a) double-click "ยืนยันชำระแล้ว" rapidly; (b) click confirm with server paused/stopped; (c) reload the pay page mid-flow.
- Expected: (a) no duplicate play/charge state; (b) visible error/toast, recoverable; (c) page re-renders play state from `/api/plays/:id` without corrupting flow.
- Automation: `bcdp-ok` for (a)(c); (b) partially — server kill/restart is easier manual. · External deps: none.

### TC-07 · Receipt screen with on-chain proof
- Pre: a verified play exists (TC-05 setlist mode).
- Steps: observe `#/screen/:id` — "กำลังเล่น … ได้รับอนุญาต ✅", receipt fields, `end-to-end: X.Xs` line; click the `tx ↗` link.
- Expected: screen polling updates every interval (`app.js:116-121`); e2e seconds present and ≤ 30 (spec hypothesis 1); tx link opens a real Base testnet explorer page whose input data describes the play.
- Automation: `bcdp-ok` for screen + link presence; tx page content verification `bcdp-ok` (page read) — human-only for judging demo persuasiveness. · External deps: [Base testnet explorer reachable; wallet funded, else anchorError path]

### TC-08 · Anchor failure / retry path
- Pre: play created while testnet wallet lacks funds (or RPC unreachable).
- Steps: on `#/screen/:id` observe the warning with retry link; click "retry" (`app.js:127`).
- Expected: warning text explains "anchor รอ wallet เงินใน testnet"; retry POSTs `/api/plays/:id/retry-anchor` (`server.mjs:208`) and UI reflects new state after refresh; no crash.
- Automation: `bcdp-ok` · External deps: [arranged unfunded/failed anchor state]

### TC-09 · Setlist registration (live-band mode)
- Pre: on `#/setlist`.
- Steps: search songs, click cards to add to tonight's setlist (`app.js:181-192`, POST `/api/setlist`, `server.mjs:122`); reload page.
- Expected: picked songs persist (GET `/api/setlist?date=today`, `server.mjs:129-130`); today's date default shown; removing a pick persists too.
- Automation: `bcdp-ok` · External deps: none.

### TC-10 · Audio scan verification (DJ mode end-to-end)
- Pre: acr-mode play awaiting scan (TC-05, `next: 'scan-audio'`).
- Steps: click scan button → file picker → upload the matching song audio (`poc/audio/`); also upload a **non-matching** audio file once.
- Expected: matching file → toast "✅ fingerprint match — เพลงถูกยืนยัน" and redirect to `#/screen/:id` (`app.js:99`); non-matching → visible not-verified feedback, play does not become "licensed".
- Automation: `bcdp-ok` (file upload supported) · External deps: [audio files from `poc/audio/`]

### TC-11 · Split dashboard (70/10/20)
- Pre: at least one anchored play (TC-07).
- Steps: open `#/dashboard`; check party table (label), venue table, recent plays table (seq, title, amount THB, status badge, e2e seconds, tx link), chain status line (`app.js:133-164`).
- Expected: ฿30 payment shows label ≈ ฿21 / venue ≈ ฿3 / platform ≈ ฿6 (demo-script minute 3–4, per-song splits from catalog); totals accumulate across plays; percentages computed vs total (`app.js:141`).
- Automation: `bcdp-ok` · External deps: none.

## B. Robustness & navigation

### TC-12 · Deep links / direct hash entry
- Steps: paste `#/screen/<id>`, `#/pay/<id>`, `#/dashboard` directly into a fresh tab.
- Expected: each route renders; an unknown play id degrades gracefully — **documented PoC behavior**: the page keeps showing the PREVIOUS view's content instead of an error message (verified live: navigating to `#/screen/unknown123` leaves `#app` holding the prior view's 21,814 characters of DOM — the fetch for the unknown play rejects unhandled, `poc/public/app.js:105-106`; no blank white screen, but the stale content is misleading).
  - *Candidate improvement for the full product: show an explicit "play not found" state instead of retaining stale content.*
- Automation: `bcdp-ok` · External deps: none.

### TC-13 · Mobile viewport (demo is phone-first)
- Pre: browser viewport set to ~390×844.
- Steps: walk TC-02 → TC-07 on mobile size.
- Expected: catalog cards tappable, QR visible without horizontal scroll, confirm button reachable by thumb; header nav usable.
- Automation: `bcdp-ok` (viewport emulation); final visual judgment `human-only`.
- Note (UX): only one viewport checkpoint is specified in the repo; recommend recording actual tap-target sizes if this case fails.

### TC-14 · Server-down / API error states
- Steps: stop server; load any route; restart; reload.
- Expected: before restart: visible error or loading state, not a silent blank; after restart: full recovery including health dot.
- Automation: partially `bcdp-ok` (restart step easier manual) · External deps: none.

### TC-15 · 5-minute demo dry-run (end-to-end story, spec hypothesis 3)
- Pre: clean ledger (`rm -rf data` + restart); `poc/DEMO-SCRIPT.md` open.
- Steps: execute the demo script minutes 0–4 exactly: catalog → request → QR explain → confirm → screen → tx link → dashboard → explain both verify modes. Stop the clock.
- Expected: full story completes ≤ 5 min and each on-screen element the script points at actually exists (mock disclaimer, QR, e2e seconds, split numbers). A non-technical viewer follows within 5 min — comprehension judgment is `human-only` (this is the "test with father" proxy step).
- Automation: mixed (steps `bcdp-ok`; comprehension `human-only`) · External deps: [Base testnet + explorer]

## C. Human-only checks (no automation substitute)

| Check | Why human-only |
|---|---|
| Scan a real PromptPay QR with a Thai banking app and confirm payload/amount parses | requires physical bank app |
| Live line-in capture in a noisy venue (spec risk #1 — PoC tests via files instead) | requires physical audio environment |
| Demo persuasiveness to a non-technical viewer (the "father test") | subjective comprehension |
| Visual polish: contrast, Thai typography, QR print/screen legibility | visual judgment |

## Coverage vs spec core flows

| Spec flow (`POC-SPEC.md` architecture) | Cases |
|---|---|
| หน้า 1 Catalog | TC-02, TC-03, TC-04 |
| หน้า 2 PromptPay QR + confirm | TC-03/04, TC-05, TC-06 |
| หน้า 3 projection screen | TC-07 |
| Verify: setlist mode / DJ fingerprint | TC-09, TC-10 |
| Receipt on-chain (Base testnet tx) | TC-07, TC-08 |
| Split ledger dashboard | TC-11 |
| Robustness / demo readiness | TC-01, TC-12–TC-15 |

Totals: 15 cases — 13 `bcdp-ok` (some with mixed steps), 4 human-only items grouped in section C plus TC-15 comprehension part. No login/auth required anywhere (PoC has none); external dependencies are limited to Base testnet RPC/explorer, testnet wallet state, and local audio fixture files.
