# DEMO SCRIPT — 5 minutes (English · BNB Hack Bangkok, Demo Night Nov 27)

> Open the venue phone on the **catalog** (`#/catalog`) and the venue screen on the **dashboard** (`#/dashboard`) — two devices, one flow.
> Backend must be booted with `poc/.env` (contracts + token addresses pre-wired). Fresh ledger: `rm -rf data` then restart the server.
> ⚠️ Cournot free tier = 3 calls per IP: run the demo machine on a **fresh IP (phone hotspot)** so the oracle call is live on stage.

## Minute 0–1 · Problem (speak before touching the screen)

> "Venues pay one annual blanket fee for music they may never play. Labels can't see which song was played, or how many times. Artists get nothing per play. We built the opposite: pay **per song**, ≤30 THB, settled **on-chain** in seconds — label 70 / venue 10 / platform 20 — and venues must post a **stake bond** they can be slashed from if they fake plays."

## Minute 1–2 · Membership gate + song request (phone)

1. Open the catalog → **perk banner**: "Priority queue unlocked — $PLAY holder" — "fans holding our protocol coin get their requests served first; that's the one perk, and it's real on-chain balance, not a badge."
2. Tap a song → **PromptPay QR** with the amount — "real bank-standard EMVCo payload; the PoC simulates capture."
3. Tap **confirm payment** → "payment settles on-chain in Mock THB — our demo token for the stable THB that BOT-licensed issuers bring in March 2027."

## Minute 2–3 · Venue screen: on-chain settlement + receipt

4. Receipt shows **settled on-chain (Mock THB — demo token)**: tap the three links → label 21 / venue 3 / platform 6 mTHB as **three real BSC Testnet transactions** — "the 70/10/20 split is not an accounting table; it's three transfers anyone can verify."
5. Point at the **anchor receipt tx** — "and the play event itself is anchored as an immutable receipt, input data = canonical play record, on the hackathon's home chain."
6. Point at **end-to-end: X.Xs** — "request to on-chain proof in 1–3 seconds; target ≤30."

## Minute 3–4 · Trust mechanics: bond, slash authority, oracle guard

7. Dashboard → **Settlement-risk guard** panel — "before we convert settled royalties, a live Cournot oracle call prices settlement stress — if depeg probability were above 50%, conversion pauses; today it says 0.55% → PROCEED. Claim, probability and evidence are shown verbatim."
8. Say the bond story: "the venue in this demo staked **1,200 mTHB in the VenueStake contract** — unbonded venues get HTTP 402 from the play endpoint; fake plays get the stake slashed to the protocol treasury by the review process (slash authority: admin in the demo, multisig + oracle evidence in production)."
9. **Live slash (optional, rehearsed only):** run `node scripts/slash-demo.mjs` — admin slashes **250 mTHB** (evidence string attached, treasury move on BscScan) → stake falls to 950 < required 1,000 → the dashboard bond panel flips to **not bonded** and the next play request returns 402. Re-stake after the beat if continuing the demo.
10. Two verify modes: **live band** = pre-registered setlist · **DJ/line-in** = fingerprint from real audio (production: ACRCloud ~$0.17/detection).

## Minute 4–5 · Close on the build story

- "$PLAY itself launched through the **OpenFour protocol** — our bonding curve is live on BSC Testnet; the same mechanism that funds liquidity funds the venue bond pool."
- "This whole product was built in days by a human + two AI agents: one lives in the public GitHub repo — every decision in the commit history; the other holds our project memory and can answer *why* any choice was made."
- "One play = one on-chain license, settled, split, and guarded. That's the whole system."

**Rules:**
- Asked about real payments → "phase 2 — BOT-licensed THB stable under the March-2027 framework; our escrow already speaks `approve/transferFrom`, so the token swaps without touching the venue flow. WORPT proved regulators accept crypto-in/THB-out in the SEC sandbox."
- Asked about scale → "5,000+ venues ≈ 240M THB/month currently uncollected; 50 venues ≈ 0.25M THB/month at 96% per-play margin — unit economics in the repo."
- Asked why two tokens → "mTHB is settlement, $PLAY is coordination. Rights holders never touch the volatile asset — they get royalty in THB. Speculation funds liquidity; liquidity funds royalties."
- Oracle call fails on stage → "free-call quota per IP — the pre-agreed fallback keeps conversion open, admin-gated; proof of the live call ships in the repo (`poc/cournot-last-call.json`)."
