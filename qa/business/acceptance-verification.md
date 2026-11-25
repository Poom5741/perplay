# Business Acceptance Verification — AC-1..AC-8 vs QA evidence

Owner: 观澜 (business analysis) · Task #9 → **final-round update: Task #18** · 2026-11-25
Criteria under test: `qa/business/acceptance-criteria.md` (accepted, Task #4)

> **FINAL-ROUND VERDICT for this QA round.** Supersedes the Task #9 interim report: every
> verdict below reflects post-fix evidence — D1 (receipt render) and D2 (scan song mismatch)
> are fixed, officially re-run, and regression-locked; D3 is investigated and closed as
> external-cause; D4 is fixed with a PID lock guard. Items still blocked are blocked solely
> on Human inputs, each named.

Evidence base (all fresh, dated 2026-11-25):
- **U** = `node --test poc/tests/unit/*.test.mjs` → **34 pass / 0 fail** (re-run by me on the
  final tree)
- **I** = `node --test poc/tests/integration/*.test.mjs` → **29 pass / 0 fail** (re-run by me:
  23 api incl. the D2 regression test, 2 data-guard tests from #16, 4 body-error tests from
  #19)
- **M** = `qa/manual/runs/run-2026-11-25.md` — 知微's 13-case run (pre-fix) **plus the
  post-fix re-run section**: TC-07 / TC-08-UI / TC-10 / TC-15 all **PASS** after the fixes
  (fresh screenshots in `qa/manual/runs/screenshots/rerun-*`)
- **R** = live spot-check by me: server on :3000, API play → confirm → `#/screen` — `#receipt`
  renders (artist/label/request time + anchor-error branch with retry); D1 fix confirmed in a
  real browser; 玄策 independently verified the same in Task #13
- **E** = `tests/qa-baseline.md` §5 (post-D1/D2) and §6 (post-D4/D3): unit 34/34, integration
  29/29, e2e **13/19 chain-disabled** (all 6 failures need a funded `PRIVATE_KEY` in
  `poc/.env`; absent — verified again)
- **F** = `docs/reviews/egm-review-2026-11-25.md` §3 (F-4 cost, F-5 wallet, F-8 mock
  fingerprint)

Fix status recap (from accepted cards #13, #16, #19):
- **D1 fixed**: time formatter `t` hoisted to module scope (`poc/public/app.js:16`);
  receipt renders on `#/screen/:id` — browser-verified by 玄策 (#13), by 知微's re-run TC-07
  (no ReferenceError in any poll tick), and by me (R).
- **D2 fixed**: cross-song scan now rejected — `poc/server.mjs` scan handler returns **409**
  (`fingerprint mismatch: scan matches S001, play is for S003`), play stays unlicensed;
  regression test api.test.mjs:236 passes (I); UI re-run TC-10 confirms the screen never
  claims a license for a mismatched play.
- **D3 closed**: 3 bounded reproduction attempts failed to implicate server code; external
  port-kill reproduces the exact symptom (e2e/CI kills :3001 concurrently) — documented in
  #16.
- **D4 fixed**: PID lock `data/.server.lock` — second server exits 1 with a clear error,
  stale locks taken over; 2 guard tests pass (I).

## Per-criterion verdicts (final round)

### AC-1 · Request-to-confirmed-play ≤30 s — **NOT-YET-TESTABLE (sole blocker: Human wallet)**
- Requires the full flow including on-chain anchoring; without a funded Base Sepolia
  `PRIVATE_KEY` in `poc/.env` (absent, re-verified), `chain.configured=false` and every e2e
  timing/anchoring check is null (E: 6/19 chain checks fail on exactly this; F-5). UI timing
  line (`e2eSeconds`) only renders after anchoring.
- Partial positive signal: re-run TC-15 measured request → pay-confirmed at **63 ms**, and
  setlist verify is instant — the non-chain segments are far inside budget.
- **To pass**: fund the wallet (runbook: `poc/scripts/e2e-runbook.md`), re-run e2e 10×, read
  `e2eSeconds` medians.

### AC-2 · Per-play cost < 1 THB — **NOT-YET-TESTABLE (sole blocker: cost metering does not exist)**
- No cost metering anywhere in the product code (F-4: zero `cost` hits in `poc/lib/` +
  `poc/server.mjs`). Nothing to read a cost sum from.
- **To pass**: Human/PMO decision to add per-play cost logging (ACRCloud calls × ~0.17 THB +
  recorded chain fee), then re-verify.

### AC-3 · PromptPay QR + simulated pay + no-pay-no-play — **PASS**
- AC-3.1 payload validity: U — EMVCo TLV length consistency, CRC check vector 29B1,
  tampered-payload rejection; live API `crcValid: true`, amount ฿30 (R). Prices 20–50 THB
  confirmed by `poc/lib/catalog.mjs:10`.
- AC-3.2 simulated-payment disclosure: M TC-03 (screenshot tc03-pay-qr.png) and re-run TC-15
  (rerun-tc15-pay-qr.png).
- AC-3.3 no-pay-no-play: I — plays start `qr_pending` and only verify via `confirm-paid` or a
  matching `verify/scan`; error paths 400/404/409, never 500 (now also covered by #19's
  body-error tests: oversized body 413, malformed JSON 400); M TC-05/TC-06 idempotency.

### AC-4 · Authorization: fingerprint + setlist — **PASS (AC-4.1 SKIPPED on Human input)**
- AC-4.1 (≥95% fixture accuracy): **SKIPPED** — mock fingerprint makes the threshold circular
  (F-8). Happy path with real catalog audio bytes passes (I api.test.mjs:209); unknown audio
  flagged unlicensed (api.test.mjs:228). Real accuracy awaits the ACRCloud trial key
  (**Human decision**).
- AC-4.2 setlist licenses listed songs only: U + I (not-on-setlist → 409, api.test.mjs:187);
  M TC-05/TC-09.
- AC-4.2-integrity: the pre-fix D2 hole (mismatch still verified) is **fixed and now
  officially re-run**: TC-10 PASS — cross-song upload → 409, play stays `paid`, screen shows
  no licensed badge (M re-run + I regression test).
- AC-4.3 live-cover path relies on setlist, not fingerprint: PASS by inspection
  (`poc/server.mjs` verify routes; M TC-04).

### AC-5 · Receipt on-chain, viewable tx per play — **NOT-YET-TESTABLE (UI side PASS; chain side blocked on Human wallet)**
- UI render: **PASS** — pre-fix D1 (empty `#receipt`) is fixed and verified three ways:
  玄策's browser DOM assertion (#13), 知微's official re-run TC-07/TC-08-UI (receipt renders
  meta + timestamp + anchor warning with retry, zero ReferenceErrors; screenshot
  rerun-tc07-receipt.png), and my live spot-check (R). Tx-link branch correctly absent while
  chain is unconfigured.
- Chain anchoring + 10/10 resolvable basescan links: **NOT-YET-TESTABLE** — funded wallet
  missing (E). Retry-anchor API degrades gracefully (M TC-08 API side).
- **To pass**: fund wallet, re-run e2e, click through 10 anchored tx links.

### AC-6 · Split 70/10/20 exact, venue 10%, dashboards match — **PASS**
- Math: U — splits exactly 70/10/20 summing to 1 incl. tamper/rounding cases; config source
  `poc/lib/catalog.mjs:38` (`label:0.70, venue:0.10, platform:0.20`) — resolves open item 1
  (**canonical split assignment CLOSED: config is the source of truth; Human never
  contradicted it**).
- Live amounts: M TC-11 — ฿145 → ฿101.50 / ฿14.50 / ฿29.00 exactly, per-label and per-venue
  tables correct; I — ledger sums verified in integration tests.

### AC-7 · 5-min demo script executable + mobile URL — **PASS (on-chain moment pending wallet)**
- Re-run TC-15 **PASS** (was FAIL on D1): catalog → QR (CRC ✅) → confirm (63 ms) →
  fingerprint affordance → receipt moment renders instantly on the projection screen
  (screenshots rerun-tc15-pay-qr.png, rerun-tc07-receipt.png). The previously unshowable
  receipt moment now works; the **only remaining gap in the script is the basescan
  click-through**, which needs the funded wallet (sub-item NOT-YET-TESTABLE on the same
  single Human input as AC-1/AC-5).
- Mobile: M TC-13 PASS (390×844, no horizontal overflow; tc13-mobile-pay.png).
- **To fully close**: fund wallet, re-run TC-15 with a non-author executor covering the tx
  click-through.

### AC-8 · Transparency traceability (request → receipt → split) — **NOT-YET-TESTABLE (sole blocker: Human wallet)**
- Catalog → pay → verify → dashboard halves are demonstrable (M TC-02/03/05/11; the receipt
  UI now renders). But the criterion is the *full* trace to an on-chain receipt; with no
  wallet there is no tx link to follow and `e2eSeconds` never renders (R confirms the
  anchor-error branch is what shows).
- **To pass**: funded wallet + one scripted trace walkthrough (fold into the TC-15 re-run).

## Final summary

| AC | Verdict | Sole / main blocker |
|----|---------|---------------------|
| AC-1 | NOT-YET-TESTABLE | funded Base Sepolia PRIVATE_KEY (`poc/.env`) — **Human** |
| AC-2 | NOT-YET-TESTABLE | cost metering not implemented — **Human/PMO decision** |
| AC-3 | PASS | — |
| AC-4 | PASS (AC-4.1 SKIPPED) | ACRCloud trial key — **Human** |
| AC-5 | NOT-YET-TESTABLE (UI PASS) | funded PRIVATE_KEY — **Human** |
| AC-6 | PASS | — (split assignment closed via catalog.mjs:38) |
| AC-7 | PASS (tx click-through pending wallet) | funded PRIVATE_KEY — **Human** |
| AC-8 | NOT-YET-TESTABLE | funded PRIVATE_KEY — **Human** |

Round outcome: all previously FAILing product defects (D1, D2) are fixed, officially re-run
and regression-locked; ops findings (D3, D4) are closed; **no product defect remains open**.
Four criteria PASS on current evidence; the four NOT-YET-TESTABLE ones all reduce to two
Human inputs (fund the testnet wallet; add cost metering) plus one optional resource
(ACRCloud key for real fingerprint accuracy).

## Human / PMO decisions surfaced (per checklist)

1. **Fund the Base testnet wallet** (`poc/.env` PRIVATE_KEY) — the single input unblocking
   AC-1, AC-5, AC-8 and the AC-7 tx click-through. Runbook:
   `poc/scripts/e2e-runbook.md`.
2. **Cost metering** — AC-2 can never be tested without adding a per-play cost log; decide
   whether this round must have it (spec hypothesis 2 says yes).
3. **ACRCloud trial key** — real fingerprint accuracy (AC-4.1) stays SKIPPED until provided.
4. ~~Canonical 70/10/20~~ — **CLOSED**: `poc/lib/catalog.mjs:38` is the confirmed config,
   locked by unit tests.
5. D3/D4 — **CLOSED**: D3 not reproducible as a server bug (external port-kill most likely;
   recommend manual runs log their server pid), D4 fixed via PID lock with guard tests.
6. Browser-tooling caveat for future runs (not a product defect): in-page file upload
   crashes the agent browser — scan steps were driven via the same HTTP endpoint the UI
   posts to; re-verify the UI file-picker path on a stable browser before the Friday demo
   (issue #25).

---

## Closing addendum (2026-11-25, after final baseline) — task #24

> Additive only: no AC verdict above is changed. This addendum aligns the document with the
> final round of evidence after the TC-12 not-found fix cycle (tasks #20–#26).

**Final baseline (tests/qa-baseline.md §7 "Final baseline (post-not-found fix, consolidated) — 2026-11-25", accepted):**
unit `node --test poc/tests/unit/*.test.mjs` → **34/34**; integration `node --test 'poc/tests/integration/*.test.mjs'` → **29/29**; e2e `E2E_PORT=3009 node scripts/e2e-report.mjs` → **13/19, chain disabled** (the 6 fails are exactly the known chain-disabled checks). Delta vs §6: **no check status changed** — the round's fixes are frontend-only. Independently re-confirmed by me at addendum time on the same tree: unit 34/34, integration 29/29.

**TC-12 is now fixed-and-re-verified, no longer "known PoC behavior":**
- Fix #21 (poc/public/app.js `showNotFound()`), regression found and fixed (#25: explicit catalog route at `poc/public/app.js:25-26`), and officially re-verified in-browser (task #26, "Re-verification 3 (OFFICIAL)" in `qa/manual/runs/run-2026-11-25.md`): **TC-02 PASS** — `#/catalog` and `#/` render the full catalog (100 cards) with cache-bypassing reloads; **TC-12 PASS** — unknown deep links (`#/screen/unknown123`, `#/pay/unknown99`) render the not-found state and its back-to-catalog escape link works end-to-end. Screenshots: `qa/manual/runs/screenshots/rerun3-tc02-catalog-restored.png`, `rerun3-tc12-notfound-escape-ok.png`.
- Impact on verdicts: none of AC-1..AC-8 changes — the not-found/deep-link behavior was documented as a UX note, not an AC gate. The earlier "stale-content as known PoC behavior" entry and the catalog regression it briefly introduced are both closed by the evidence above; no open product defect remains.

**Only remaining gaps — unchanged, all Human inputs:**
1. **Funded Base Sepolia PRIVATE_KEY in `poc/.env`** — still absent (re-checked at addendum time); unblocks AC-1, AC-5, AC-8 and the AC-7 tx click-through.
2. **Cost-metering decision** — AC-2 remains untestable without a per-play cost log.
3. **ACRCloud trial key** — AC-4.1 stays SKIPPED until provided.

Everything else in this QA round is PASS on current evidence; the round is closed from the
business-acceptance side pending the three inputs above.
