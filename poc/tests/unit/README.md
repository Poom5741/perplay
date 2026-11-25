# Unit tests — poc/lib modules

Dependency-free unit tests using Node's built-in test runner (`node --test`), per the accepted QA plan (`docs/qa-plan.md` §2.1).

## Run

From the repository root:

```sh
node --test poc/tests/unit/*.test.mjs
```

Expected: `34 pass / 0 fail`, exit code 0 (verified 2026-11-25, Node v22.23.3).

**Note on the directory form:** `node --test poc/tests/unit/` (passing the directory itself) does NOT work on Node v22.23.3 — it resolves the directory as a module entry and fails with `MODULE_NOT_FOUND`. Use the glob form above, or list the files explicitly.

## Coverage

| File | Module under test | What is covered |
|---|---|---|
| `promptpay.test.mjs` | `poc/lib/promptpay.mjs` | CRC16-CCITT-FALSE check vector (`"123456789"` → `29B1`) and empty-string init `FFFF`; TLV tag/length consistency; dynamic-QR tags (00=`01`, 01=`12`); embedded CRC self-consistency; **tampered payload fails CRC**; THB amount 2-decimal formatting (tag 54); currency/country tags (53/58); non-digit stripping of target; ref truncation to 25 chars; empty/invalid target throws `PROMPTPAY_TARGET` |
| `catalog.test.mjs` | `poc/lib/catalog.mjs` | 100 tracks by default; custom `n` incl. edge `n=0`; unique `S###` ids; **splits exactly 70/10/20 and summing to 1 on every song**; prices from the configured set; required fields present; deterministic output from the fixed seed; SHA-256 known vectors (empty, `"abc"`); determinism + divergence on tampered input |
| `store.test.mjs` | `poc/lib/store.mjs` | Fresh store creates its JSON file; set/get/flush persistence; defaults for missing keys; last-write-wins overwrite; reload via second instance; **corrupted JSON on disk throws**; name isolation between stores. The file chdirs into a temp dir before importing, so tests never write to `poc/data/` |
| `chain.test.mjs` | `poc/lib/chain.mjs` | No-network tests only: `initChain` without `PRIVATE_KEY` → `configured:false` + reason; `chainStatus` unconfigured; `anchorReceipt` rejects with `chain not configured`; **receipt canonical-hash tamper detection** (each of the 8 canonical fields changing alters the hash); digest shape (64-char lowercase hex) |

## Isolation

- No new dependencies added to `poc/package.json` (runner is built into Node).
- Tests never touch `poc/data/` (used by `npm run e2e`): the store tests run inside `os.tmpdir()`; catalog/chain/promptpay tests are pure.
- On-chain anchoring is deliberately not exercised (needs a funded `PRIVATE_KEY` + network) — that path is covered by the e2e suite (see `tests/qa-baseline.md`).
