# E2E Runbook — headless run, timing vs ≤30s target

English runbook for `poc/scripts/e2e.mjs` (harness) and `poc/scripts/e2e-report.mjs` (reporter). No browser and no new dependencies are required — the e2e suite is pure HTTP against the real Node server.

## Commands

| Purpose | Command (from `poc/`) |
|---|---|
| Plain headless run | `npm run e2e` |
| Headless run + parsed per-check report (recommended) | `node scripts/e2e-report.mjs` |
| Run on a different port (e.g. 3001 is taken by a dev/manual server) | `E2E_PORT=3002 node scripts/e2e-report.mjs` |

**IMPORTANT — side effects.** The suite (a) kills whatever listens on the target port and (b) **wipes `poc/data/`** before spawning a fresh server. Do not run it while another person or process is using port 3001 or relying on `poc/data/`. Use `E2E_PORT` to avoid the port clash; the data wipe cannot be avoided (by design — fresh state per run).

**Exit-code caveat.** The e2e script's process exit code is NOT reliable in all environments. `e2e-report.mjs` therefore treats the **final JSON blob** as the authoritative result: it extracts the last `{"pass": ...}` block, prints a per-check table, and exits `0` only if `pass` is `true` (exit `2` if the JSON cannot be parsed at all).

## What you see (chain-DISABLED default — no `poc/.env`)

Real output from 2026-11-25 (Node v22.23.3):

```
13/19 checks passed · suite duration 3.7s · per-play target ≤30s
chain enabled: false · mode e2e: setlist=n/as, acr=n/as
HYPOTHESIS #1 (≤30s/play): NOT PROVEN (chain required / timing over target)
```

In this mode exactly 6 checks FAIL, and that is the **expected** result — they all require a configured on-chain wallet:

| Failing check | Why it fails without chain |
|---|---|
| chain configured | `poc/lib/chain.mjs:16-17` returns `configured:false` without `PRIVATE_KEY` |
| wallet funded | no wallet client exists |
| A3 receipt anchored (setlist) | anchoring disabled → play stays `verified` |
| A4 hypothesis #1 timing (setlist) | `e2eSeconds` is null without an anchor timestamp |
| B2 receipt anchored (DJ path) | same as A3 |
| A4/D5 avg e2e tracked | ledger has no anchored timings without txs |

Everything else (server, catalog 100 songs, 70/10/20 splits, PromptPay CRC, setlist verify, audio-scan verify, unlicensed-audio negative, ledger sums) passes chain-disabled.

## Environment to clear the 6 chain failures

1. Create `poc/.env` (loaded by `poc/server.mjs:15` via `process.loadEnvFile()`):
   ```
   PRIVATE_KEY=0x<64-hex private key>
   ```
2. The key's account must hold **Base Sepolia ETH** (faucet: `https://faucet.base.org` or the Coinbase faucet). A zero-balance wallet makes `wallet funded` fail and anchoring stall until `anchorError`.
3. Optional: `BASE_RPC_URL` (defaults to `https://sepolia.base.org`).
4. **⛔ Needs Human decision:** a funded testnet private key must be provisioned by Poom — the team will not generate/handle key material. Until provided, chain-enabled expectations cannot be exercised and hypothesis #1 stays NOT PROVEN.

## Chain-ENABLED expectations (once `poc/.env` is in place)

- 19/19 checks pass, `chain enabled: true`, `txs` holds two real Base Sepolia explorer URLs.
- `mode e2e` reports real per-play seconds (`setlist`, `acr`); hypothesis #1 passes only if both ≤ 30s.
- `suiteDurationSec` in the JSON reports total wall time (chain-disabled baseline: **3.7s**; chain-enabled adds two real tx waits, historically the dominant cost).

## JSON schema (final blob, authoritative)

```json
{
  "pass": true,
  "chainEnabled": false,
  "suiteDurationSec": 3.7,
  "targetSecPerPlay": 30,
  "e2e": { "setlist": null, "acr": null },
  "checks": [{ "name": "...", "pass": true, "detail": "..." }],
  "txs": ["<explorerUrl or null>", "<explorerUrl or null>"]
}
```

## Changed in this hardening (Task #10)

- `poc/scripts/e2e.mjs`: port is overridable via `E2E_PORT` (default `3001` unchanged); final JSON now includes `suiteDurationSec`, `targetSecPerPlay`, `chainEnabled`, and the full `checks` array (previously only `pass`/`txs`/`e2e`). No `poc/lib` or server code touched.
- `poc/scripts/e2e-report.mjs`: new dependency-free reporter — runs the suite, parses the final JSON (not the exit code), prints the per-check table + duration vs target, and annotates chain-disabled expectations.
- Baseline reference: `tests/qa-baseline.md` (13/19 chain-disabled result reproduced by this hardening).
