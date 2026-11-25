# DEMO SCRIPT — 5 minutes (English · BNB Bangkok Build)

> Open **https://playright.169-58-137-159.sslip.io** on your phone (or let the judge scan the table QR themselves — that IS the pitch).
> To reset a clean ledger: `rm -rf data && sudo systemctl restart playright-poc`

## Minute 0–1 · Problem (speak before touching the screen)

> "Venues pay one annual blanket fee for music they may never play. Labels can't see which song was played, or how many times. Artists get nothing per play. We built the opposite: pay **per song**, 20–50 THB, label gets 70% instantly — with permanent proof on blockchain."

## Minute 1–2 · Customer requests a song (phone)

1. Open URL → catalog of 100 tracks (say clearly: mock catalog, test data only).
2. Tap a song → **PromptPay QR appears with the amount** — "this QR is a real bank-standard PromptPay payload; the PoC simulates capture."
3. Tap **confirm payment**.

## Minute 2–3 · Venue screen + on-chain proof

4. Screen switches to **"Now playing: … — licensed ✅"** — "this is the backstage screen a venue can show anyone."
5. Point at the **receipt on-chain** links → tap → real transactions on **Base Sepolia and opBNB Testnet** (input data = the canonical play event) — "every play leaves immutable proof, on two chains."
6. Point at **end-to-end: X.Xs** — "the whole flow, request to on-chain proof, in 1–3 seconds; target ≤30."

## Minute 3–4 · Splits + two verify modes

7. Go to the **split dashboard** — "30 THB paid → label 21 / venue 3 / platform 6 — accumulated for real, per label, per venue."
8. Explain the 2 modes: **live band** = pre-registered setlist (more trustworthy for billing than live fingerprinting, which research puts at ~87% top-1) · **DJ/line-in** = fingerprint from real audio (production: ACRCloud ~$0.17/detection, 14-day free trial).

## Minute 4–5 · Close on the build story

- "This whole product was built in days by a human + two AI agents: one lives in the public GitHub repo — every decision it made is in the commit history — the other holds our project memory in the cloud and can answer *why* any choice was made, with sources."
- "One play = one license receipt. That's the whole system."

**Rules:** asked about real payments → "phase 2 — stablecoin out via the BOT-sandbox-proven WORPT structure; venues never see crypto." Asked about scale → "50 venues ≈ 0.25M THB/month at 96% per-play margin — unit economics are in the repo."
