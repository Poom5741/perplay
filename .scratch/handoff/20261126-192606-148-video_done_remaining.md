# Handoff — video_done_remaining (PerPlay × BNB Hack Bangkok)

Written 2026-11-26 19:26 Bangkok time. This session's work is DONE; everything below hands off to Poom's PM. Deadline: **submissions close 09:00 Nov 27**, Demo Night 15:00 Nov 27 (Park Hyatt Bangkok).

## What this session completed

1. **Demo video is DONE and pushed**: `video/out/perplay-demo.mp4` — 2:01, 1080p H.264, ~31 MB. 12 beats from live navigation of https://perplay-demo.poom-a1d.workers.dev: title card → catalog hero/songs → order → pay page/QR → setlist verify → on-chain receipt ("anchored on-chain ✓", real tx `0x931eb75c…`, 22.4s e2e) → dashboard till roll/settlement meters → VenueStake bond + Cournot guard → setlist-refusal 409 toast ("เพลงไม่อยู่ในเซ็ตลิสต์คืนนี้ — วงต้องลงทะเบียนเซ็ตลิสต์ล่วงหน้า") → end card.
   - Committed `3447b08` on branch `feat/bnb-bangkok-build`, pushed to origin: MP4 + `video/assemble.sh` (ffmpeg zoompan+xfade assembly) + `video/README.md`. Raw frames in `video/frames/` are untracked by design.
   - **The PM still must upload the MP4 somewhere public (YouTube/Drive/Loom) — the HackQuest form needs a link.** That is a human step.
2. **Full e2e walkthrough re-verified on the live demo** (play for S002 "Hourglass Heart Where the Road Runs Out" settled + anchored, e2e 22.4s). Play #9/#10 now in till roll.
3. `poc/cournot-last-call.json` untouched (no e2e run this session).

## What was NOT done (open items, priority order)

1. **BscScan shots for the video (optional, NOT blocking)** — `testnet.bscscan.com` Cloudflare-blocks the agent browser, and cookie import from user's Chrome failed (tool bug: its headless instance keeps colliding with the real-profile SingletonLock; user already consented to closing Chrome). Screen recording permission is also missing for `screencapture` (macOS TCC), so capturing the user's own Chrome window failed too. **The shipped video already shows on-chain proof via the receipt page (tx hash + "anchored on-chain ✓") — Poom decided it's acceptable to submit as-is.** If the PM wants the BscScan beats anyway: open the two tx pages in the user's own Chrome (anchor `https://testnet.bscscan.com/tx/0x931eb75c0d255ba6119b507e584062aa9e8f323598fdd32cdb4bf5a341fdfe15`, mTHB pull `https://testnet.bscscan.com/tx/0xd61d8caba3446e6281e5700fbb1e74337ec47cf012a190abe8d4b8a800e4f7d0` — pull-tx hash from `GET /api/plays/recent`), screenshot them (after granting screen-recording permission or via manual screenshots), re-run `bash video/assemble.sh` (frame list is at the top of the script; add the two new beats + commit/push). Granting **Screen Recording permission to the terminal/DSH host** in System Settings would unblock agent-side window capture generally.
2. **HackQuest submission (HARD DEADLINE 09:00 Nov 27)** — form at hackquest.io/hackathons/BNB-Bangkok: repo link (PR #34 → https://github.com/Poom5741/perplay/pull/34) + video link (needs the upload) + Cournot "Integration" README section per prize criteria. Do this WITH Poom, not alone.
3. **Fresh-IP Cournot rehearsal** — free quota on the current IP was 0/3; Demo Night needs a real probability call from the phone hotspot. One live guard call (endpoint POST https://interface.cournot.ai/intelligence/v1/probability, body `{message, market_ids:[1..10]}`, 30s timeout, retry once on 402 after 8s).
4. **Pitch ask placeholder** — `pitch/token-economy-one-pager.md` VC annex still has TBD ("pre-seed — first 50 venues" placeholder); needs Poom's real numbers.
5. **"Real" MacBook video** — user films; 60s shot script available on request (open lid → catalog → order → pay → receipt → BscScan).
6. Retro after Demo Night (`dream-protocol` style).

## Context the next agent needs

- Project: per-play music licensing PoC. Do NOT re-derive planning artifacts — they exist: `pitch/token-economy-one-pager.md`, `docs/spec/venue-stake-bond.md`, `docs/research/thb-stablecoin-landscape.md`, `poc/DEMO-SCRIPT-EN.md`, `pitch/fourmeme-video-script.md`, `docs/adr/0001-bsc-testnet-for-receipts.md`.
- Previous handoff with full environment detail: `.scratch/handoff/20261126-183130-551-video-and-submission.md` (browser-control lessons, wallet addresses, contract addresses on BSC Testnet 97, e2e command `cd poc && E2E=1 node scripts/e2e.mjs` = 19/19, local server pattern, quota facts). Keys live in gitignored `.env` files — never print them.
- **All chat reports must be in English** (user correction). Artifacts too (pinned team rule).
- Agent-browser video pipeline that works: `bcdp_*` tools + per-beat PNG into `video/frames/` + `bash video/assemble.sh`. Capture recipe for clean shots (no recorder badge): drive the page, wait ~1.2s, hide overlay hosts twice via `page.evaluate(() => { [...document.querySelectorAll('*')].forEach(e => { if (e.shadowRoot) e.style.display = 'none'; }); })`, then CDP `Page.captureScreenshot` → store base64 in `window.__shotB64` → `bcdp_download` with a triggerScript that blob-decodes and clicks an `<a download>`. Known pitfalls: `bcdp_script` with `page.on(...)` or big base64 stdout fails the tool envelope; "anchored" regex must exclude the footer text "receipts anchored on BSC Testnet" (false positive); setlist currently = S001, S002, S005, S006, S042 (anything else correctly 409-refuses — that's the demo's refusal beat; re-POST `/api/setlist` if it errors).
- User's Chrome may reopen with a BscScan tx tab and a resized window — harmless; close/restore freely.
- HackQuest wording check with user before submitting; demo quota facts must be re-checked on the fresh IP.

## Suggested skills

- `skill("bcdp-browser")` — only if resuming browser capture work (BscScan beats or re-shoots).
- `skill("pr")` — if updating PR #34 body with the final video link.
- `skill("dream-protocol")` — at the post-Demo-Night retro.

**Bottom line for the PM:** the deliverable video exists in the repo and is pushed; the critical path now is (a) upload MP4 publicly, (b) submit HackQuest before 09:00 with Poom, (c) fresh-IP Cournot call before Demo Night. Everything else is polish.
