# PerPlay — per-play music licensing

**The pitch.** PerPlay turns music licensing into a per-play transaction: a customer scans a QR code in the venue, pays ≤1 THB via PromptPay, the play is fingerprint-verified, and the receipt's hash is anchored on-chain as a real transaction on BSC Testnet. A transparent ledger splits every payment 70/10/20 — label 70 / venue 10 / platform 20 — so the venue projector can show proof of license in real time: "Now playing: X — licensed ✅ · receipt #N" with a clickable tx link. No blanket annual contracts, no untrackable royalties: one song, one play, one payment, one verifiable receipt.

## What's in this repo

| Directory | Contents |
|---|---|
| `poc/` | The working demo: Node.js server (`server.mjs`) + vanilla JS single-page app (`public/app.js`), chain anchoring (`poc/lib/chain.mjs`), PromptPay QR generation, catalog/ledger data, mock fingerprint fixtures. Build notes in `poc/README.md`. |
| `pitch/` | Pitch documents, incl. `pitch/token-economy-one-pager.md` (token economy). |
| `docs/` | Specs and domain docs, incl. `docs/spec/venue-stake-bond.md`, plus `docs/research/`, agent conventions (`docs/agents/`), and issue/QA sync reports. |
| `qa/` + `tests/` | QA baselines and reports: business acceptance criteria & verification (`qa/business/`), manual browser test runs (`qa/manual/`), consolidated baseline (`tests/qa-baseline.md`). |
| `validation/` | Product validation artifacts: PR-FAQ, hypothesis scorecards, validation plan. |
| `research/` | Agent research notes and decision logs. |

## Run the demo

```bash
cd poc
npm install
npm run wallet      # generates demo wallets into poc/.env
npm start           # → http://localhost:3000
```

`npm run wallet` creates fresh testnet wallets; fund one with BSC testnet BNB via the faucet at https://testnet.bnbchain.org/faucet-story to enable on-chain receipt anchoring (the app degrades gracefully without it — everything except tx anchoring works). Mock fingerprint fixtures ship in `poc/audio/` (`npm run make-audio` regenerates them).

API-level end-to-end test (real flow + real txs when a funded wallet is present):

```bash
npm run e2e
```

## Real vs PoC-mock

| Part | Status |
|---|---|
| Receipt anchoring | **REAL** — each verified play's `hash(play_event)` is sent as a data-only transaction on BSC Testnet (chainId 97); the tx link is clickable and resolvable on the explorer. |
| PromptPay QR | **Half-real** — the QR is a genuine EMVCo dynamic payload (TLV + CRC16-CCITT) that banking apps can scan, but payment collection is **simulated** via a "confirm paid" button (real acquiring needs a Payment Facilitator / BOT sandbox). |
| Fingerprint verification | **PoC mock** — verification uses a local sha256 fingerprint matched against 100 mock WAVs. The production interface is designed for a real audio-recognition provider (e.g. ACRCloud, ~$5/1,000 scans ≈ 0.17 THB per scan) — swap the verify backend, keep the API. |
| Live-band setlist mode | **Real logic** — venues pre-register the setlist; listed songs are licensed without fingerprinting (per spec, since live-cover fingerprinting is only ~87% reliable). |

## Measured numbers (from the PoC run)

- **Speed:** 0.6–3.5 s per play end-to-end, including the real on-chain tx (setlist ~0.7 s, fingerprint 0.6–1.1 s) — well inside the ≤30 s business target.
- **Cost:** ~40,000 gas per receipt ≈ **0.0000006 BNB-equivalent per receipt on testnet** (measured from wallet balance before/after); same tx shape on mainnet ≈ **<$0.01 per receipt**.
- **Split ledger:** exact 70/10/20 accounting per play, verified by unit/integration tests and manual runs (`qa/`, `tests/qa-baseline.md`).

## Hackathon

Built for **BNB Hack: Bangkok** (Nov 25–27 2026). Receipts are anchored on **BSC Testnet (chainId 97)** — primary RPC `https://bsc-testnet.publicnode.com`, explorer `https://testnet.bscscan.com` (see `poc/lib/chain.mjs`). The token economy is documented in [`pitch/token-economy-one-pager.md`](pitch/token-economy-one-pager.md).
