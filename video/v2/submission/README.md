# HackQuest submission images — PerPlay

Four assets, **all exactly 1920 × 1080 (16:9)**. Ready to upload to the HackQuest project form.

| File | Purpose | Size |
|---|---|---|
| `shot-01-thumbnail.png` | Video thumbnail | 188 KB |
| `shot-02-onepager.png` | Project one-pager | 328 KB |
| `shot-03-pay-qr.png` | Demo screenshot — PromptPay QR payment | 180 KB |
| `shot-04-dashboard.png` | Demo screenshot — venue settlement dashboard | 252 KB |

## What each one is

**01 · Thumbnail** — "Every play pays." with the owner-pain hook (16,000 THB flat licence vs
฿30 per play), the 70/10/20 split card, the live demo URL and a LIVE DEMO stamp. Dark plate
treatment so it stays legible when YouTube shrinks it.

**02 · One-pager** — Problem → Solution (16,000 THB/yr blanket licence with no play-level log
→ ฿30 per play), the 5-step flow, proof numbers (0.6–3.5 s per play, 29,560 gas, <$0.01 per
receipt, exact 70/10/20), track badges, links, and an honest-scope note.

**03 · Payment QR** — Live capture of the play-slip page: a genuine EMVCo dynamic PromptPay QR
(TLV + CRC16-CCITT) plus the slip card showing the three split faders (70 label / 10 venue /
20 platform).

**04 · Settlement dashboard** — Live capture of the venue dashboard: cumulative settlement
meters, the till roll (฿150.00 gross settled), the receipt list with per-row BSC Testnet
transactions, and the VenueStake venue-bond panel.

## Sourcing / honesty

Screenshots 03 and 04 are **live captures** of `https://perplay-demo.poom-a1d.workers.dev`
taken during the session on 2026-11-27, not mockups. The one-pager carries an explicit
honest-scope note: receipt anchoring is real on BSC Testnet, the PromptPay QR payload is
genuine but payment collection is simulated, fingerprinting is a PoC mock, and Mock THB is a
test settlement token rather than a real stablecoin.

## Rebuilding

```bash
cd video/v2/submission
./render.sh thumbnail.html shot-01-thumbnail.png
./render.sh onepager.html  shot-02-onepager.png
```

The two framed screenshots are rendered from `frame.html` with the `__IMG__ / __NUM__ /
__HEAD__ / __BODY__ / __RLABEL__ / __RVAL__` placeholders substituted from a spec list, then
`shots/live-*.png` cropped to the content area with ffmpeg. `render.sh` uses `agent-browser`
(the same path `video/v2/captions.mjs` uses) — headless Chrome with `--headless=new` crashes
on this machine.

Sources: `shots/live-pay-qr.png`, `shots/live-dashboard.png`.
Style: `video/v2/plates/src/plates.css` (print-desk / record-sleeve plate system, paper
`#F6F4EF`, ink `#23262B`, purple `#5C2D91`, brass `#A87B2D`, fonts Kanit + IBM Plex).
