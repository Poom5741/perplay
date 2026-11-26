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
- **Cost:** **29,560 gas used** per receipt (40,000 gas limit) ≈ **0.000003 BNB per receipt on testnet** (29,560 × 0.1 gwei; verified on receipt `0x931eb75c…`, block 144974404); same tx shape on mainnet (0.05 gwei) ≈ **<$0.01 per receipt**.
- **Split ledger:** exact 70/10/20 accounting per play, verified by unit/integration tests and manual runs (`qa/`, `tests/qa-baseline.md`).

## Cournot Integration

PerPlay integrates the **Cournot Intelligence Oracle** as a live risk guard on the
settlement path. This section is the required evidence for the *Cournot — Build with the
Cournot Intelligence Oracle* challenge at BNB Hack: Bangkok.

**Where it lives:** `poc/lib/cournot.mjs` (the whole integration is one module),
exposed to the app over `GET /api/guard` in `poc/worker.mjs` (also available on the
deployed demo at `https://perplay-demo.poom-a1d.workers.dev/api/guard`).

**How it calls Cournot.** `POST https://interface.cournot.ai/intelligence/v1/probability`
with body `{ message, market_ids: [1..10] }` and a 30 s timeout. The API key is optional —
the anonymous tier works without one at **3 free calls per IP**. Responses are cached for
10 minutes (`COURNOT_CACHE_MS`) so a busy demo never burns the quota; `?refresh=1` forces
a live call.

**What the claim is.** The oracle evaluates a settlement-stress claim before PerPlay
converts settled MockTHB into payout-side currency:

> `USDT loses its US dollar peg (trades below $0.99) on a major exchange before 2027-01-01`

This is a **proxy for THB settlement-asset risk** — the stablecoin that a venue's royalty
payout ultimately rides on. The oracle's catalog resolves crypto markets, so a stablecoin
peg-stress claim is the honest, in-scope formulation.

**How the probability is used.** The returned probability is **not** displayed for
decoration — it drives a settlement decision:

```js
decision = probability > COURNOT_HOLD_ABOVE /* 0.5 */ ? 'HOLD' : 'PROCEED'
```

`HOLD` means the conversion is held pending review; `PROCEED` means the settlement flow
continues. The threshold is configurable via `COURNOT_HOLD_ABOVE`. There are **no mocked,
hardcoded, or static probabilities anywhere in this path** — if the call fails the guard
returns `status: 'UNAVAILABLE'` and the decision is not fabricated.

**Where users see the claim and the evidence.** The guard panel in the venue/dashboard UI
renders, live from `/api/guard`:

- the **exact claim** evaluated (as returned by the oracle, not our paraphrase),
- the **probability** and the **decision** it produced,
- the **supporting evidence** — the oracle's `basis` array (11 rows on the latest call:
  Kalshi latest yes price, Binance futures and spot series, Coinglass venue aggregates,
  Deribit options DVOL / ATM IV / max pain / put-call ratio, and a forecast ensemble),
  each with its source, timestamp and URL,
- the **markets matched** with their confidence scores.

Any explanation added by PerPlay rather than returned by Cournot is labelled as such —
the `claimScope` field marks our proxy framing separately from the oracle's own output.

**Proof of a successful call.** The full request and response, plus the parsed result, are
written to [`poc/cournot-last-call.json`](poc/cournot-last-call.json) on every live call.
The latest run:

| Field | Value |
|---|---|
| HTTP status | `200` |
| `oracle` | `Cournot Intelligence Oracle (live)` |
| `probability` | `0.0049` |
| `decision` | `PROCEED` (threshold `0.5`) |
| `httpStatus` | `200` |
| `billing` | `free_quota` |
| quota | `{ ip: 171.96.154.1, total: 3, used: 2, remaining: 1 }` |
| `basis` rows | 11 |
| `checkedAt` | `2026-11-26T20:21:00Z` |

Reproduce it with:

```bash
cd poc
COURNOT_ENABLED=true node -e "import('./lib/cournot.mjs').then(m=>m.guard({force:true}).then(r=>console.log(r.probability,r.decision,r.httpStatus)))"
```

**Environment flags** (all optional; the integration is off unless explicitly enabled):

| Variable | Default | Meaning |
|---|---|---|
| `COURNOT_ENABLED` | unset | Set to `true` to enable the guard |
| `COURNOT_ENDPOINT` | the public endpoint above | Override the oracle URL |
| `COURNOT_CLAIM` | the peg-stress claim | Override the evaluated claim |
| `COURNOT_MARKET_IDS` | `1,2,3,4,5,6,7,8,9,10` | Markets queried |
| `COURNOT_HOLD_ABOVE` | `0.5` | Probability above which settlement is held |
| `COURNOT_CACHE_MS` | `600000` | Cache window |
| `COURNOT_API_KEY` | unset | Optional bearer token for the keyed tier |

---

## Hackathon

Built for **BNB Hack: Bangkok** (Nov 25–27 2026). Receipts are anchored on **BSC Testnet (chainId 97)** — primary RPC `https://bsc-testnet.publicnode.com`, explorer `https://testnet.bscscan.com` (see `poc/lib/chain.mjs`). The token economy is documented in [`pitch/token-economy-one-pager.md`](pitch/token-economy-one-pager.md).

## Live public demo

Deployed on Cloudflare Workers (same code paths as `poc/server.mjs`): **https://perplay-demo.poom-a1d.workers.dev**

- Same routes, same libs; state in a Durable Object (strongly consistent — KV's edge cache can serve stale receipt polls); static SPA via Assets binding; secrets via `wrangler secret put`.
- Deploy: `npx wrangler deploy --config poc/wrangler.jsonc` (see `poc/wrangler.jsonc` header for secrets).
