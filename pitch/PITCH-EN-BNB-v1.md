# PerPlay — 5-minute pitch (English · BNB Bangkok Build, Nov 2026)

> One-liner: **One play = one license receipt.** Venues pay per song, labels get paid instantly, every play is proven on-chain — on Base and BNB Chain.

## Minute 0–1 · The problem

Every night, live bands in 15,000+ licensed entertainment venues across Thailand perform copyrighted music **without per-use payment**. Venues pay a flat annual blanket fee (thousands of dollars) that covers an incomplete catalog and shows nobody what was actually played. Artists never see a baht per play. The largest label in the country told our family directly it wanted per-play licensing — the project died only because pre-COVID tech couldn't do it.

## Minute 1–2 · Why now

| 2019 (then) | 2026 (now) |
|---|---|
| Real-time audio fingerprinting expensive / inaccurate | AI fingerprinting cheap and accurate (~87% top-1, verified against arXiv 2501.08129) |
| No way to settle a 20–50 THB micro-payment per play | Stablecoins + PromptPay + Thai regulatory sandbox |
| Live music dead (COVID) | Venues booming, full houses nightly |

TouchTunes has proven the exact same model in US bars for 25 years: customers pay per song, venues take a revenue share. PerPlay is the Thai version — transparent, on-chain.

## Minute 2–3 · Live demo (phone → QR → receipt)

1. Scan the QR on the table → pick a song from a 100-track catalog.
2. Real PromptPay QR (EMVCo standard payload) for 20–50 THB; payment confirmation.
3. Venue screen flips to **"Now playing: … — licensed ✅"** — proof the venue can show anyone.
4. Tap the receipt link: a real transaction on **Base Sepolia AND opBNB Testnet** — the canonical play event (song, amount, splits, verification) is hash-anchored on both chains, immutable.
5. End-to-end time from song request to on-chain proof: **1–3 seconds** (target ≤30s).

## Minute 3–4 · Where the money goes + how we verify

- **Splits are automatic: 70% label / 10% venue / 20% platform.** Pay 30 THB → label gets 21 instantly, venue earns 3 per play instead of paying blanket fees — the venue turns a cost center into revenue.
- **Verification, two honest modes:** live bands pre-register their setlist (more trustworthy than live-audio fingerprinting at ~87% top-1 — we chose setlist for billing-grade accuracy); DJ/line-in mode uses fingerprinting (production: ACRCloud at ~$0.17/detect).

## Minute 4–5 · Why we win this track

- **Integration:** receipts anchored to **two chains** (Base + BNB Chain opBNB) in one flow; mainnet tx shape identical, <$0.01 per receipt.
- **Open source:** the entire repo is public — and it was built with **two AI brains**: a repo-resident agent committing every product decision (see the agent-authored decisions log in Git history) and a cloud memory brain (LivingBrain) that recalls why each choice was made, with sources.
- **Innovation:** per-play licensing with on-chain proof has no incumbent in Southeast Asia; the black-box royalty problem is exactly what blockchain kills.
- **Business:** 15,000+ licensed venues; starting catalog = the country's biggest label (warm family relationship, confirmed interest in seeing the PoC). 50 venues ≈ 250K THB/month at 96% per-play margin (unit economics in repo).
- **Usability:** a customer scans, pays, and a judge holds provable on-chain evidence on their own phone within 30 seconds.

## Prepared answers (judge Q&A)

- *"Real payments?"* → Phase 2: PromptPay-in / stablecoin-out via the BOT-sandbox-proven WORPT structure; venue never touches crypto.
- *"Scale?"* → 50 venues = ~0.25M THB/month, 96% margin per play. Fingerprint + anchoring costs are negligible per play.
- *"Why two chains?"* → Base for today's demo rails; BNB Chain for Thailand's ecosystem and the hackathon's home — the dual-anchor proves the receipt format is chain-agnostic.
- *"Accuracy risk?"* → We bill on setlist confirmation, not raw fingerprint scores; fingerprinting is corroboration in DJ mode, production uses ACRCloud.
