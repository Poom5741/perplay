# PerPlay — every play pays

**Per-play music licensing for Thailand's venues, settled in THB.** Fan scans a QR, pays for the play, a live-room audio fingerprint proves the track actually played, and the split lands on BNB Chain — receipts any label can audit.

---

## The problem

Thai venues pay blanket licenses (~48,000 THB/month for a typical venue) whether or not anyone plays the music. Labels have no play-level proof; venues overpay; independent venues under-report. **≈ 240M THB/month in licensing value flows with zero play-level verification** (5,000+ licensed venues × ~48,000 THB/month — demand-side estimate).

## What PerPlay does

1. **Scan** — a QR at the table opens the per-play request (≤30 seconds end-to-end).
2. **Pay per play** — ≤1 THB per play, paid in THB (demo: mTHB on BSC testnet).
3. **Verify** — a live-room audio fingerprint match confirms the registered track actually played (setlist mode covers live bands).
4. **Settle** — an on-chain receipt anchors the play and executes the split: **70% rights holders / 10% venue / 20% platform**.

## The token economy

> **Stable THB is the settlement layer. $PLAY is the coordination layer. Speculation funds liquidity; liquidity funds royalties.**

| Layer | Asset | Who holds it | What it does |
|---|---|---|---|
| **Settlement** | **mTHB** — demo: clearly-labeled mock THB on BSC testnet; production: a BOT-licensed THB stablecoin under the Bank of Thailand's framework (final rules due March 2027) | Fans pay in it; **rights holders receive 70% in it** | Rights holders **never hold volatile assets** — royalties arrive in THB, the unit their licenses are denominated in |
| **Coordination** | **$PLAY** (launches via OpenFour) | Venues **stake to join** (skin-in-the-game + seeds $PLAY↔THB exit liquidity); fans optionally hold ≥ threshold for a priority-queue perk; platform stakes and earns the 20% fee | Aligns every participant; speculation supplies the liquidity that royalties settle against |

- **Fraud has a price:** a venue's stake is collateral for honest reporting — false play records put the stake at risk (admin-gated slashing in the demo).
- **Oracle guard:** a live Cournot oracle call returns the depeg probability for the THB settlement asset; when depeg risk crosses a threshold, royalty conversion pauses — the claim, probability, and evidence sources are displayed in-app. Settlement never silently breaks.
- **Launch:** $PLAY launches through **OpenFour — a differentiated launchpad where staked liquidity is pledged to royalty settlement**, not just traded.

## Stakeholders

| Stakeholder | Holds | Gets | Why they join |
|---|---|---|---|
| **Rights holders** (labels, artists) | Nothing volatile — THB only | 70% of every verified play, with play-level proof | Revenue they can audit; zero crypto exposure |
| **Venues** | A $PLAY stake (bond) | 10% of plays at their venue; pay-for-what-plays instead of blanket fees | Fairer costs + fraud-proof licensing relationship |
| **Customers** (fans) | THB to pay; $PLAY optional | A play that provably supports the artist; priority-queue perk if holding $PLAY | 1-tap, ≤1 THB, no wallet friction required |
| **Platform** | A $PLAY stake | 20% protocol fee | Runs verification + settlement rails |

## Why now — regulator-aligned by design

Thailand's regulators already run a live **pay-in-crypto → settle-in-THB** sandbox (the SEC's TouristDigiPay pilot, 2026), and the BOT's 1:1 THB-stablecoin framework finalizes in **March 2027** — institution-first, exactly the B2B settlement lane PerPlay occupies. PerPlay needs no new regulation: it settles in THB today (mock on testnet), and plugs the licensed THB stable in when it exists.

## Live demo — BNB Hack: Bangkok (Nov 25–27, 2026)

Scan → pay mTHB → fingerprint verify → receipt + 70/10/20 split on **BSC testnet**, with the Cournot settlement-risk guard live. ≤30 seconds, ≤1 THB per play.

---

## VC annex (Startup Track)

- **Traction:** TED Fund-supported PoC; founder-level discussions with a top Thai music label; live demo at BNB Hack: Bangkok (Nov 25–27, 2026).
- **Market:** Thailand's venue music licensing first (~240M THB/month demand-side estimate); expansion path through SEA blanket-license markets.
- **Business model:** 20% protocol fee on every settled play; $PLAY stake requirements create structural demand for the coordination asset.
- **Ask:** pre-seed — onboarding the first 50 venues *(placeholder — edit before pitching)*.
