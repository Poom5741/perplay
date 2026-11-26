# BNB Bangkok Build — Agent Decisions Log (Nov 25, 2026)

> Authored by the repo brain (lead agent). Every product decision from tonight's
> build session, in one place — this file IS the "GitHub brain" for the demo:
> judges can browse it in the public repo, and each entry maps to commits made
> during the 36-hour Developer Track build.

## Research basis (primary-source, cited)

- `research/2026-11-25-bnb-bangkok-build-and-livingbrain.md` — hackathon structure,
  judging criteria, LivingBrain API surface (verified against docs.livingbrain.com).
- `research/2026-11-25-prize-targeting.md` — prize targeting analysis.

## D1 · Target prize: Developer Track, top-3

Sponsor track prizes are unpublished as of tonight (sponsors named: Flap.sh, Four.meme,
AWS, Atlas Oracle). Startup Track rejected: pre-traction, criteria demand a live product.
Win condition = top-3 + residency fast-track, which frees budget for demo polish over
moonshot features. Backup: submit to any sponsor challenge announced before Sun 10:00
that is music / RWA-payments shaped.

## D2 · Judged criteria drive the build order

Judging: Design & Usability · Scalability · Innovation · Open Source · Integration,
plus roadmap. Cheapest wins first: public repo = Open Source; phone demo = Usability.
Biggest gap = Integration (receipts were Base-only).

## D3 · Dual-anchor receipts: Base Sepolia + opBNB Testnet

> **SUPERSEDED (2026-11-26, hackathon demo-scope lock, issue #33 Q1):** BNB Hack
> Bangkok requires the build on BNB Chain; receipts now anchor to **BSC Testnet
> (chainId 97) only**. Base is retired from the demoed flow and opBNB is skipped.
> `poc/lib/chain.mjs` keeps the multi-chain array shape, so re-adding a chain is a
> one-entry change. Rationale below preserved for the record.

Decision: anchor the canonical play event to BOTH chains in one flow
(`poc/lib/chain.mjs`), not switch or roadmap-only. Rationale: proves the receipt
format is chain-agnostic, converts the Integration weakness into the strongest
demo moment ("one play, two chains"). Each anchor is best-effort: an unfunded
chain degrades to "pending funding" in the UI instead of failing the flow.

## D4 · English-first pitch

Thai pitch (v2) stays for TED/Grammy; hackathon deliverables are English:
`pitch/PITCH-EN-BNB-v1.md`, `poc/DEMO-SCRIPT-EN.md`.

## D5 · Two AI brains

- **GitHub brain** (this repo): agent-authored decisions log + visible commit history.
- **Cloud brain** (LivingBrain): connection verified live (MCP + REST; auth OK,
  search OK); captures blocked by $0 prepaid balance → sync deferred until top-up,
  demo upgraded from slide to live recall only if funded before Demo Night.

## D6 · LivingBrain = deferred dependency, not a blocker

Balance top-up is the single remaining unlock for the live second brain.
Cut from the critical path tonight (user decision).

## Open items

1. Fund the three demo wallets on **BSC Testnet** (faucet: testnet.bnbchain.org/faucet-story): platform/deploy `0x91754d955D7E2174200Cd2521fc3C953Cb483A03`, demo venue `0x270DF8383cf9771b5d65A101C0610f54A7e84ce8`, fan `0x37A35aDD13DE8F0c95E462d5772A865aff78900b`.
2. Run `npm run e2e` after funding to verify the anchor on BscScan testnet.
3. Top up LivingBrain (livingbrain.com/workspace?section=billing) for live recall.
4. Rehearse English pitch twice before Demo Night (Nov 27, 15:00–18:00, Park Hyatt).
