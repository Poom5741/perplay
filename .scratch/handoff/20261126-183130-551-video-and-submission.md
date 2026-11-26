# Handoff — video-and-submission (PerPlay × BNB Hack Bangkok)

Written 2026-11-26 18:31 Bangkok time. You are taking over a hackathon crunch with **~14.5h left**: Four.meme video + submissions close **09:00 Nov 27**, Demo Night 15:00 Nov 27 (Park Hyatt Bangkok).

## Project one-paragraph context

PerPlay = per-play music licensing demo (repo `/Users/poom-work/perplay`, branch `feat/bnb-bangkok-build`, PR #34 → main at https://github.com/Poom5741/perplay/pull/34). Flow: venue orders a play → fan scans PromptPay QR (≤1 THB) → fingerprint/setlist verify → 70/10/20 royalty split **settled on-chain in MockTHB** → receipt anchored on BSC Testnet. Token economy: $PLAY (launched via OpenFour testnet fork, fans holding ≥500M get priority-queue perk), mTHB mock-THB settlement token, VenueStake escrow (venue stakes 1200 mTHB to be a member; admin slash). Cournot oracle = settlement-risk guard (depeg probability gates royalty conversion; catalog only resolves crypto markets, so claim is a USDT-peg proxy — display honest fallback when quota out). **Public deploy: https://perplay-demo.poom-a1d.workers.dev** (Cloudflare Workers, `poc/worker.mjs` + `poc/wrangler.jsonc`, state in a Durable Object). Full planning artifacts already exist — do NOT re-derive: `pitch/token-economy-one-pager.md`, `docs/spec/venue-stake-bond.md`, `docs/research/thb-stablecoin-landscape.md`, `poc/DEMO-SCRIPT-EN.md`, `pitch/fourmeme-video-script.md`, `docs/adr/0001-bsc-testnet-for-receipts.md`. Rule: **all artifacts/reports in English**.

## In-flight task when handoff fired: the product video

User wants a screen-recording video showing real navigation through the whole workflow (for Four.meme prize: GitHub repo + **2–3 min demo video** + pain point + differentiation). Plus a separate "real" MacBook-style video (user films; you provide shot script). User explicitly said: screen recording must be done by the agent controlling the browser itself.

**Pipeline established (works, no plugins needed):** drive the live URL in the agent browser with `bcdp_*` tools; save one viewport PNG per beat to `video/frames/NN-name.png`; assemble with ffmpeg 9.0.1 (`/opt/homebrew/bin/ffmpeg`, installed) — crossfades + gentle zoompan. CDP `Page.captureScreenshot` works inside `bcdp_script`; `Page.startScreencast` does NOT deliver events (don't retry); no `require()` in `bcdp_script` (no fs).

**6 of ~12 beats already captured** in `video/frames/`: 01-catalog-hero, 02-catalog-songs, 03-pay-page, 04-pay-qr, 05-verified, 06-receipt-settlement (play for S002 "Hourglass Heart Where the Road Runs Out", the English song).

**Remaining beats to capture** (all on https://perplay-demo.poom-a1d.workers.dev):
- 07/08: dashboard `#/dashboard` — top (till roll with real plays) + scroll to settlement meters band
- 09: dashboard bond panel ("🏦 Venue bond — VenueStake", "slash authority: admin (demo)") + Cournot guard panel
- 10/11: BscScan pages — anchor tx (find txHash via `GET /api/plays/recent` or receipt page link) and the mTHB settlement pull tx
- Optional 12: catalog scrolled to the 402 setlist-refusal story (order any song NOT in setlist → refusal error shot) — great "what stops a bar from playing whatever" beat.
**Live setlist registered today:** S001, S002, S005, S006, S042 (any other song in setlist mode correctly returns 409 — that refusal is a feature, use it in the video).

**Browser-control lessons (from this session):**
- `bcdp_js` takes a single expression; wrap multi-statement work as an IIFE arrow returning a value. `window.scrollTo({top:N, behavior:'instant'})` for scrolling (wheel-scroll tool returned scrollY 0 — unreliable).
- Order button: no `S002` text in DOM; find the row by song title text (`Hourglass Heart`) then `querySelector('button').click()`.
- Pay page has one button: "I have paid ฿30.00" → setlist verify is instant; poll `location.hash.startsWith('#/screen/')` and body text "anchored" (~5s).
- Setlist currently active; if the flow errors with the Thai 409 "ไม่อยู่ในเซ็ตลิสต์คืนนี้", re-POST `/api/setlist` with the 5 IDs above.
- Frames are 1440×900 PNGs via `bcdp_screenshot` with `path`.

**Assembly sketch:** `ffmpeg` per-frame with `zoompan` (slow 1.0→1.05 zoom, ~2.5s each) + `xfade` chain, 1080p, H.264, output `video/out/perplay-demo.mp4`. Keep total ≤ 2:40 (prize says 2–3 min). Add title/end cards if easy (ffmpeg drawtext or a PNG frame).

## Sensitive / quota facts

- **Cournot free quota on current IP is 0/3** (endpoint POST https://interface.cournot.ai/intelligence/v1/probability, body `{message, market_ids:[1..10]}`, 30s timeout, retry once on 402 after 8s). Demo Night MUST use a fresh IP (user plans phone hotspot). Proof file `poc/cournot-last-call.json` is committed prize evidence — after any e2e run, `git checkout -- poc/cournot-last-call.json` if e2e touched it.
- Wallet keys live in `poc/.env` + `contracts/.env` + `launchpad/.env` (all gitignored) — never print them. Foundry keystore accounts: `platform` / `venue` / `fan` (password in `contracts/.env` as `KEYSTORE_PASSWORD`).
- Contract addresses (BSC Testnet 97): VenueStake `0x9b7c63DF46D8B01997BAE9Bac756d803Abd4EeBc`, MockTHB `0x31FE806363Bd0FCD22efa0C774D9706E9668b442`, $PLAY `0x23c5B20c74f1bC2c731D05451f5f2DA7a2CE6AF8`. Wallets: platform `0x9175…3A03` (~0.027 BNB left — enough for receipts but watch it), venue `0x270D…4ce8`, fan `0x37A3…900b`.

## Work-left checklist (priority order)

1. **Finish video beats 07–12 + ffmpeg assembly** → `video/out/perplay-demo.mp4` (see above). This is the immediate task.
2. **Pitch ask placeholder**: `pitch/token-economy-one-pager.md` VC annex still has the TBD ask ("pre-seed — first 50 venues" was the agreed placeholder phrasing) — needs user's real numbers.
3. **HackQuest submission** (deadline 09:00 Nov 27): repo link + video link + Cournot "Integration" README section per prize criteria. Check hackquest.io/hackathons/BNB-Bangkok form fields with the user.
4. **Fresh-IP Cournot rehearsal** — needs the user's phone hotspot; one live guard call so Demo Night shows a real probability.
5. **"Real" MacBook video** — user films; give them a 60s shot script if they ask (open lid → catalog → order → pay → receipt → BscScan).
6. Retro after Demo Night (dream-protocol style).

## Environment / gotchas

- Working dir `/Users/poom-work/perplay`, danger-full-access, approval prompts auto-rejected (never request escalation).
- `git status` should be clean except `video/` (untracked) — commit video output to the PR branch when final. Don't commit raw frames; only the final MP4 (+ maybe a README line).
- e2e: `cd poc && E2E=1 node scripts/e2e.mjs` (19/19 must stay green; it wipes `poc/data`).
- Local server pattern: boot from `poc/` with `node server.mjs`; kill via `lsof -tiTCP:3000 | xargs kill`; D4 lock refuses a second server on the same data dir.
- English-only chat reports (user correction). Thai is fine inside data/UI.
- User may mention newly-installed "computer use / screen recorder" MCP plugins (`gbrain` port 3131, `verde` port 47371 from their Claude config, codex `node_repl`): **both HTTP endpoints were dead at handoff time and nothing is synced into DSH**. If the user starts the host apps, verify with curl, then `agent_sync_do` + session reload. Don't block the video on them.

## Suggested skills

- `skill("bcdp-browser")` before resuming browser work (beat capture).
- `skill("pr")` only if updating PR #34 body with the video link.
- `skill("dream-protocol")` at the final retro.
