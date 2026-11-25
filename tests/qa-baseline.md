# QA Baseline Report — perplay PoC

> **STATUS (2026-11-25, post-not-found-fix FINAL round baseline): current baseline is §7 below.** §6 records the post-D4/D3 hardening baseline; §5 the post-D1/D2 baseline; sections 1–4 record the original pre-fix baseline (13/19 e2e, no unit/integration suites) and are kept for diffing.

**Date:** 2026-11-25 · **Runner:** Qinglan (agent-3) · **Commit:** working tree of `/Users/poom-work/perplay` (only `poc/` contains runnable code)
**Scope:** record the current state of existing tests only. No source or test code was modified.

## 1. Inventory of existing test assets

| Asset | Path | Type | Command |
|---|---|---|---|
| E2E test script | `poc/scripts/e2e.mjs` | e2e (API-level, spawns real server + real Base Sepolia tx) | `npm run e2e` (in `poc/`) |
| Server under test | `poc/server.mjs` | — | `npm start` (port 3000) |
| a2awire birth script | `poc/scripts/a2awire.mjs` | not a test; identity registration + golden-vector self-check, requires `.env` with `PRIVATE_KEY` | `node scripts/a2awire.mjs` |

- **No `package.json` exists outside `poc/`** (verified: `find .. -name package.json -not -path "*/node_modules/*"` → only `../poc/package.json`).
- **No unit test framework**: no vitest / jest / mocha / node:test files anywhere (`find -name "*.test.*" -o -name "*.spec.*"` → zero hits).
- **No integration test suite**.
- **No browser/manual automation scripts** (no Playwright, no bcdp scripts).

Dependencies installed for the run: `cd poc && npm install` → 42 packages, exit 0.

## 2. Baseline results

### 2.1 e2e — `npm run e2e` ✅ RAN

**Result: 13/19 pass** (script exit code 0; JSON summary `"pass": false`).

| # | Check | Result |
|---|---|---|
| 1 | server up — 100 songs, 100 fingerprints | ✅ |
| 2 | chain configured | ❌ `undefined @ Base Sepolia block undefined` |
| 3 | wallet funded | ❌ `undefined ETH` |
| 4 | catalog 100 songs | ✅ |
| 5 | splits 70/10/20 on every song | ✅ |
| 6 | setlist registered | ✅ |
| 7 | A1 QR generated + PromptPay CRC valid | ✅ (payload `00020101021229380016A000…`, QR 3862b) |
| 8 | A2 paid→verified via setlist | ✅ (ในเซ็ตลิสต์คืนนี้ 2026-11-25) |
| 9 | A3 receipt anchored on Base Sepolia | ❌ |
| 10 | A4 hypothesis #1: e2e ≤30s | ❌ avg nulls (anchor never happened) |
| 11 | B1 audio-scan matches fingerprint | ✅ |
| 12 | B2 receipt anchored (DJ path) | ❌ |
| 13 | B3 hypothesis #1: e2e ≤30s — 1s | ✅ |
| 14 | C1 unlicensed audio flagged | ✅ |
| 15 | D1 ledger counts 2 licensed plays — ฿55 total | ✅ |
| 16 | D2 split 70% correct — ฿38.5 | ✅ |
| 17 | D3 venue 10% correct — ฿5.5 | ✅ |
| 18 | D4 platform 20% correct — ฿11 | ✅ |
| 19 | D5 avg e2e tracked | ❌ `nulls avg (max nulls) · hypothesis=null` |

**Root cause of all 6 failures (one cause):** no `poc/.env` → `PRIVATE_KEY` missing → `poc/lib/chain.mjs:16-17` returns `{ configured: false, reason: 'PRIVATE_KEY missing — anchoring disabled (run npm run wallet)' }`. Checks 2, 3, 9, 10, 12, 19 all depend on on-chain anchoring.

**Environment needed to make these pass:**
1. `poc/.env` with `PRIVATE_KEY=<funded Base Sepolia key>` (run `npm run wallet` to generate; faucet via a2awire or any Sepolia faucet).
2. RPC: defaults to `https://sepolia.base.org` (`BASE_RPC_URL` env to override).
3. Internet access to Base Sepolia.

Everything else (server, catalog, PromptPay CRC, verify, ledger) passes **without** chain config.

### 2.2 unit — ⛔ DOES NOT EXIST

No unit test files or framework in the repo. The 19 e2e checks partially cover unit-level logic (PromptPay CRC, split math) but only via the running server.

### 2.3 integration — ⛔ DOES NOT EXIST

No integration suite. The closest is `e2e.mjs`, which integrates server + chain, but it is a single all-or-nothing script.

### 2.4 manual (browser) — ⛔ NOT AUTOMATED

No manual test-case docs or browser scripts exist (`qa/manual/` does not exist yet — being authored under Task #3 by Zhiwei). The UI is served by `poc/server.mjs` from `poc/public/` (index.html, app.js, style.css); it has never been verified by any recorded test.

## 3. Baseline summary table (for future QA tasks to diff against)

| Suite | Command | Runs? | Pass/Total | Blocker |
|---|---|---|---|---|
| e2e | `cd poc && npm run e2e` | yes | **13/19** | 6 fails need funded `PRIVATE_KEY` in `poc/.env` |
| unit | — | no | 0/0 | no framework / no tests written |
| integration | — | no | 0/0 | none exist |
| manual | — | no | 0/0 | cases being authored in Task #3 |

## 4. Notes & caveats

- `e2e.mjs` deletes `poc/data/` on every run (`rmSync`) and spawns its own server on port 3001 — safe to run repeatedly, but it wipes local store state.
- The e2e script's exit code is 0 even when checks fail (it prints JSON with `"pass": false`); CI cannot rely on exit code alone — parse the JSON summary instead.
- Verification method: all numbers above were captured from the actual `npm run e2e` output on 2026-11-25 (full output retained in the submission evidence).

## 5. Post-fix baseline (D1/D2) — 2026-11-25

Refresh after the defect-fix card (D1 receipt render — `poc/public/app.js` `t()` hoisted to module scope; D2 scan song mismatch — `poc/server.mjs` now returns 409 when a fingerprint matches a different song) landed and was accepted. All three suites re-run from repo root on the working tree; numbers measured, not assumed.

**Commands (as run):**
- unit: `node --test poc/tests/unit/*.test.mjs` → **34 pass / 0 fail**, exit 0 (576 ms)
- integration: `node --test 'poc/tests/integration/*.test.mjs'` → **23 pass / 0 fail**, exit 0 (824 ms) — 22 original + 1 new D2 regression test (S003 play + S001 audio → 409, not verified)
- e2e: `cd poc && node scripts/e2e-report.mjs` → **13/19 checks passed · suite duration 3.7s · chain enabled: false**; 6 FAIL lines, exactly the known chain checks (chain configured, wallet funded, A3/B2 anchored, A4/D5 timing). Reporter exit 1 on pass=false is expected (JSON/log output is authoritative). Note: attempt 1 failed with reporter exit 2 (spawn flake — server failed to come up on :3001, unparseable log); attempt 2 met the baseline. This matches the ~2/4 flake rate documented in `.github/CI-NOTES.md`.

**Delta vs pre-fix baseline (§2–§3):**

| Suite | Pre-fix | Post-fix | Change |
|---|---|---|---|
| unit | did not exist | 34/34 | created (task #5); unchanged by fixes |
| integration | did not exist | 23/23 | created (task #6); +1 regression test for D2 mismatch reject |
| e2e | 13/19, 3.7s, chain disabled | **13/19, 3.7s, chain disabled** | unchanged — expected: e2e's scan cases only use matching-song audio (B1) and non-audio junk (C1), neither hits the new D2 mismatch branch; D1 is a frontend render fix not exercised by the API-level e2e |

**Checks whose status changed due to the fixes:** none at the e2e level. The fixes are visible in integration (new 409 mismatch-reject test passes) and in the manual browser run (re-run tracked separately in `qa/manual/runs/run-2026-11-25.md` by task #15 — out of this card's scope). The 6 remaining e2e failures are still all blocked on a funded `PRIVATE_KEY` in `poc/.env` (see §2.1 environment).

Only `tests/qa-baseline.md` was written; no `poc/` source or `qa/` files modified.

## 6. Post-hardening baseline (D4 lock guard + D3 investigation) — 2026-11-25

Refresh after the D3/D4 hardening card (task #16) landed and was accepted: D4 — PID lock file (`data/.server.lock`) in `poc/server.mjs` so a second server against the same data directory exits 1 with a clear error (stale locks taken over); D3 — one-off stop-listening investigated with 3 bounded attempts, **not reproducible** as a server bug; conclusion: external port-kill most likely (documented in task #16's evidence). A regression file `poc/tests/integration/data-guard.test.mjs` (2 tests) covers the guard.

**Commands (as run, from repo root, Node v22.23.3):**
- unit: `node --test poc/tests/unit/*.test.mjs` → **34 pass / 0 fail**, exit 0 (410 ms)
- integration: `node --test 'poc/tests/integration/*.test.mjs'` → **29 pass / 0 fail**, exit 0 (1042 ms) — 25 post-D4/D3 tests (23 api incl. D2 regression + 2 data-guard) **+ 4 new body-error tests** from `poc/tests/integration/body-errors.test.mjs`

  ⚠️ Scope note: the working tree at run time already contained task #19's in-flight fix (oversized request body now 4xx instead of 500; `poc/server.mjs` + `poc/tests/integration/body-errors.test.mjs` modified during this card, timestamped between #16 acceptance and this run). The 4 extra tests measure that in-flight work and are included here for accuracy; a further refresh is expected after #19 is accepted.
- e2e: `cd poc && node scripts/e2e-report.mjs` → **13/19 checks passed · suite duration 3.5s · chain enabled: false**; 6 FAIL lines = exactly the known chain checks (chain configured, wallet funded, A3/B2 anchored, A4/D5 timing). Reporter exit 1 on pass=false is expected (JSON/log output is authoritative). Attempt 1 failed with reporter exit 2 (the documented spawn/not-listening flake, ECONNREFUSED :3001 mid-run); attempt 2 met the baseline — consistent with the flake rate in `.github/CI-NOTES.md`.

**Delta vs §5 post-fix baseline (D1/D2):**

| Suite | §5 post-D1/D2 | §6 post-D4/D3 | Change |
|---|---|---|---|
| unit | 34/34 | **34/34** | unchanged — neither fix touches `poc/lib/` modules |
| integration | 23/23 | **29/29** | +2 data-guard regression tests (D4 lock: live-holder → exit 1 with message; stale-lock → takeover + cleanup) +4 in-flight #19 body-error tests (see scope note above) |
| e2e | 13/19 · 3.7s · chain disabled | **13/19 · 3.5s · chain disabled** | unchanged — expected: the lock guard only fires on a second server against the same data dir (e2e runs one server), and the D3 investigation changed no code. No e2e check changed status |

**Checks whose status changed:** none. The D4 fix is visible in integration (2 new guard tests pass); D3 was an investigation with no code change. The 6 remaining e2e failures are still all blocked on a funded `PRIVATE_KEY` in `poc/.env` (see §2.1 environment).

Only `tests/qa-baseline.md` was written; no `poc/` source or `qa/` files modified.

## 7. Final baseline (post-not-found fix, consolidated) — 2026-11-25

Consolidated final baseline for the whole QA round (task #23), run after the TC-12 not-found fix (task #21) and the TC-12/TC-02 browser re-run (task #22). Frontend changes in this round: `poc/public/app.js` gained `showNotFound()` (unknown hash routes and 404 play fetches render a clear not-found state, task #21) and an explicit catalog route for `#/catalog` / `#/` (task #25, fixing the regression #22 found where catalog had been the `route()` fallback). Neither change touches the server or `poc/lib/`.

**Commands (as run, from repo root / `poc/`, Node v22.23.3):**
- unit: `node --test poc/tests/unit/*.test.mjs` → **34 pass / 0 fail**, exit 0 (428 ms)
- integration: `node --test 'poc/tests/integration/*.test.mjs'` → **29 pass / 0 fail**, exit 0
- e2e: `cd poc && E2E_PORT=3009 node scripts/e2e-report.mjs` → **13/19 checks passed · suite duration 3.6s · chain enabled: false**; 6 FAIL lines = exactly the known chain checks (chain configured, wallet funded, A3/B2 anchored, A4/D5 timing). Reporter exit 1 on pass=false is expected (JSON/log output is authoritative). Port 3009 chosen per the team port-discipline note (3001/3005/3007/3008 in use or reserved).

  ⚠️ Run-environment notes (disclosed for accuracy): (1) attempt 1 failed with reporter exit 2 — a stray orphaned `node server.mjs` (started 09:12:55, PPID 1) was already listening on 3009, so the run's requests hit that server's temp data dir (`ENOENT …/perplay-e2e-qa4/data/setlists.json`) instead of the e2e-spawned server; killed the orphan, attempt 2 met the baseline. This is the external stray-server interference pattern documented in §6/D3, not a product regression. (2) The e2e leftover server was killed after the run and port 3009 verified free. (3) Scope note: the working tree at run time contained task #25's catalog-route fix (`poc/public/app.js:25-26`, submitted, pending acceptance at run time) and task #26's browser re-verification was still pending — both are frontend-only and covered by the suites above; a delta refresh will only be needed if #26 finds a regression.

**Delta vs §6 post-hardening baseline (D4/D3):**

| Suite | §6 post-D4/D3 | §7 final | Change |
|---|---|---|---|
| unit | 34/34 | **34/34** | unchanged — frontend routing fixes don't touch `poc/lib/` |
| integration | 29/29 | **29/29** | unchanged — no server change in this round |
| e2e | 13/19 · 3.5s · chain disabled | **13/19 · 3.6s · chain disabled** | unchanged in counts and status — expected: all fixes are frontend-only and none of the 19 e2e checks exercise the SPA router |

**Checks whose status changed:** none at any suite level. The not-found behavior is verified at the browser level (task #22: TC-12 PASS; task #26 re-verifying TC-02/TC-12 after #25), outside these automated suites — see `qa/manual/runs/run-2026-11-25.md`. The 6 remaining e2e failures are still all blocked on a funded `PRIVATE_KEY` in `poc/.env` (see §2.1 environment); AC-1/5/8 remain NOT-YET-TESTABLE per `qa/business/acceptance-verification.md`.

Only `tests/qa-baseline.md` was written in this card; no `poc/` source or `qa/` files modified.
