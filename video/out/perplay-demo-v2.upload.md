# Upload metadata — perplay-demo-v2.mp4

Title: **PerPlay — every play pays (BNB Hack: Bangkok demo)**

## Description

A Bangkok bar owner pays **16,000 THB a year** for music licensing — the same bill on a packed Saturday as on an empty Tuesday, and no log of what actually played. PerPlay turns licensing into a per-play transaction: a fan orders a song at the venue table, pays ฿30 through a real PromptPay QR, the play is verified against tonight's setlist, and the 70 / 10 / 20 split settles in MockTHB as real BSC Testnet transactions — with the play receipt anchored on-chain.

Built in 36 hours for BNB Hack: Bangkok (Nov 25–27, 2026).

- Repo: https://github.com/Poom5741/perplay
- Live demo: https://perplay-demo.poom-a1d.workers.dev
- Receipt anchor tx (BSC Testnet 97): https://testnet.bscscan.com/tx/0x931eb75c0d255ba6119b507e584062aa9e8f323598fdd32cdb4bf5a341fdfe15

What is real in this demo: EMVCo PromptPay payload, setlist verification, three on-chain split transfers in MockTHB, receipt anchoring, VenueStake bond (1,200 mTHB collateral), $PLAY launch through our OpenFour fork. What is simulated: bank capture (the "I have paid" button) and the THB stablecoin itself — MockTHB is a clearly labelled demo token. The $PLAY pair-and-stake mechanic shown at 2:07 is **designed, not shipped** — the video labels it as such.

## Tags
perplay, music licensing, bnb chain, bsc testnet, blockchain, web3, music royalties, promptpay, thailand, hackathon, demo

## Timestamps / chapters
0:02 Bangkok — live music all night, almost none of it paid for
0:09 The owner's bill — 16,000 THB/year, same on a packed Saturday as an empty Tuesday
0:21 Before & after — 16,000 THB/year fixed vs 2,640 THB/month to the venue at 40 requests a night
0:40 The black box — blanket fees, no play-level proof, artists get nothing per play
0:53 PerPlay — every play pays
0:57 One tap, one QR, ฿30
1:04 Real PromptPay payload (capture simulated)
1:18 Licensed ✓ — anchoring on-chain
1:25 70 / 10 / 20 in three real BSC transactions · 22.4 s
1:39 The venue till / one ledger
1:48 Venue bond — HTTP 402
2:00 Setlist refusal — HTTP 409
2:07 $PLAY — pair, stake, earn yield paid as royalty credits (designed next step)
2:32 One play. One on-chain license.

## Output files
- `perplay-demo-v2.mp4` — 1920×1080, 30 fps, H.264 + AAC, **2:52**, 62.2 MB
- `perplay-demo-v2.srt` — English captions (14 cues)

## Cut notes (v2.1)

**Restructured to lead with the venue owner's pain.** Beats 2–3 are new and carry the argument:

- Beat 2 (0:09) — plate `12-owner-bill`, a receipt-style view of the venue's actual MCT blanket licence: 16,000 THB/year, no log, no proof, no count.
- Beat 3 (0:21) — plate `13-owner-after`, a Before/After pair. BEFORE: 16,000 THB/year, fixed. AFTER: 2,640 THB/month to the venue at 40 requests a night, *on top of* what it already earns. The model is printed on the card (`40 requests/night × 22 nights × 30 THB × 10% venue share`) so judges can check the arithmetic.
- Beat 13 (2:07) — plate `14-stake-loop`, the $PLAY pair-and-stake mechanic. Steps 2–4 are badged `DESIGNED` and the plate states that staking and pairing are the designed next step, not live in this demo.

**Voice changed** to ElevenLabs `ev2kMR9ZJZZsemuogS5u` ("Jake – Deep, Smooth, Dramatic"), 172.88 s of locked narration across 14 beats.

**B-roll**: beat 1 (0:02–0:09) uses a real AI-generated cinematic clip — a rain-wet neon Bangkok alley (Seedance 2.0), graded to the film's amber-and-navy palette. B-roll is atmosphere only — no product UI, no legible text, no faces — so it never puts a fabricated interface on screen. All beats from 0:09 onward are real UI captures or brand plates.

**Rebuild provenance**: `video/v2/prompts/vo.json` (14 beats) → `node vo.mjs` → `node captions.mjs` → `node build.mjs`. The `clips/final/b1-alley.mp4` AI B-roll clip is cached in `shotcache.json`; delete that file to force a re-render.

