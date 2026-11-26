# PerPlay QA Business Acceptance Criteria

Owner: Orion (business analysis) · Task #4 · 2026-11-25

This document translates the business commitments recorded in `validation/PR-FAQ.md`,
`validation/HYPOTHESIS-SCORECARD.md`, `validation/VALIDATION-PLAN.md` (E1 kill-criteria)
and `POC-SPEC.md` into pass/fail acceptance criteria for this QA round, and assigns each
criterion to one of the four test types: **unit / e2e / integration / manual**.

Scope note: the PoC is a technical proof only (POC-SPEC.md explicitly excludes market
validation, real stablecoin customer transactions, membership, and a mobile app).
Criteria that depend on real field data (Wizard-of-Oz, E4) are out of scope and marked N/A.

## Business commitment points → acceptance criteria

### AC-1 · "Request a song and pay in 30 seconds" (PR-FAQ Q1; scorecard Usability risk; POC-SPEC hypothesis 1)

- **AC-1.1** A customer can go from selecting a song in the catalog to a confirmed
  "paid + authorized play" state in ≤30 seconds on the PoC, measured on 10 consecutive
  runs with the standard demo dataset (100-song mock catalog). Pass: median ≤30 s and
  ≥9/10 runs ≤30 s. Fail: >30 s median.
- **AC-1.2** Kill-criteria check (VALIDATION-PLAN E1): if any single run exceeds 90 s,
  the result is FAIL regardless of the median and must be flagged for redesign.

  Coverage: **e2e** (timed full flow: catalog → payment confirm → projection screen →
  receipt), **manual** (spot-check on a real phone to confirm the e2e numbers are
  representative).

### AC-2 · Per-play cost < 1 THB (VALIDATION-PLAN E1; POC-SPEC hypothesis 2)

- **AC-2.1** The recorded per-play cost breakdown (fingerprint lookup + chain fee) sums
  to < 1 THB, computed from the actual metered values in the run log, not estimates.
  Base testnet fee counts as 0 (POC-SPEC feasibility: testnet = free). Fail if the sum
  ≥ 1 THB or if no cost metering exists to compute it.

  Coverage: **integration** (meter real ACRCloud calls / stubbed calls with recorded
  cost), **unit** (cost-aggregation function fed with fixture inputs produces the same
  sum as the spec formula).

### AC-3 · Payment flow: real PromptPay QR, simulated confirmation (PR-FAQ Q1 "จบใน 30 วินาที"; POC-SPEC page 2)

- **AC-3.1** For every song request, the system generates a valid PromptPay QR payload
  (correct format and amount 20–50 THB per PR-FAQ pricing). Pass: payload decodes with a
  standard PromptPay parser for 100% of sampled requests (≥20 samples).
- **AC-3.2** "ยืนยันชำระแล้ว" (confirm paid) advances the flow and is clearly marked in
  the UI as PoC-simulated (no real money captured). Fail if the UI implies real payment
  settlement.
- **AC-3.3** A customer who does NOT confirm payment never reaches the projection screen
  or receipt. Fail if any play event is recorded without a paid confirmation.

  Coverage: **unit** (QR payload builder), **e2e** (AC-3.2, AC-3.3 as browser flows),
  **manual** (a human scans the QR with a real phone banking app and confirms it renders
  a payable PromptPay prompt — this cannot be judged from a screenshot alone).

### AC-4 · Play authorization: fingerprint + setlist verify (PR-FAQ Q3/Q4; scorecard riskiest assumption 3)

- **AC-4.1** DJ/backing-track mode: playing a catalog audio file through the verify
  pipeline (ACRCloud free-trial API or recorded fixture) returns the correct song ID
  with ≥95% top-1 accuracy over the demo fixture set. Fail below 95%.
- **AC-4.2** Live-band setlist mode: a pre-registered setlist matches the performing
  band's registered setlist and licenses each listed song; songs NOT on the setlist are
  not auto-licensed. Pass/fail by fixture test.
- **AC-4.3** The known 87% live-fingerprint accuracy limitation (POC-SPEC, arXiv
  2501.08129) is respected: live covers rely on setlist mode as primary. Fail if any
  live-cover path depends on fingerprint as the sole authorization source.

  Coverage: **unit** (setlist matching logic), **integration** (ACRCloud API round-trip
  with fixtures; skipped-with-reason if no trial API key — record why, per Task #2
  baseline convention), **e2e** (setlist registration → performance → authorization).

### AC-5 · Receipt on-chain: every play yields a viewable BSC Testnet transaction (PR-FAQ Q3 "receipt บน blockchain — เห็นทุกครั้ง ทุกบาท"; POC-SPEC artifact list)

- **AC-5.1** Every confirmed play produces exactly one receipt whose
  `hash(play_event)` is anchored on BSC Testnet (chainId 97) and returns a
  clickable, publicly viewable tx link. Pass: 10/10 sampled plays yield tx links
  that resolve on testnet.bscscan.com. Fail on any missing or unresolvable link.
- **AC-5.2** The receipt tx content must correspond to the play (same song ID and play
  event ID as shown in the UI). Fail on mismatch.

  Coverage: **integration** (anchor submission + explorer lookup), **e2e** (play → tx
  link rendered in UI), **manual** (click the link on a phone during demo rehearsal).

### AC-6 · Automatic split ledger 70/10/20 with three-sided dashboards (PR-FAQ "จ่ายเงินเข้ากระเป๋า…split อัตโนมัติ"; POC-SPEC split step; PR-FAQ Q2 venue 10%)

- **AC-6.1** Each play writes ledger entries that sum to exactly 100% with the
  configured split (default 70 artist-label pool / 10 venue / 20 platform-composer as
  configured in the PoC split config). Pass: for 100 sampled plays, sum of percentages
  = 100 ± 0 and each bucket matches the config.
- **AC-6.2** The venue share equals 10% per play (PR-FAQ Q2) — fail if the ledger uses
  any other venue rate than the configured one.
- **AC-6.3** Each of the three dashboards (venue / artist / label) shows cumulative
  totals that equal the sum of its ledger entries after N plays (test with N=1 and
  N=25). Fail on any off-by-one or rounding discrepancy.
- **AC-6.4** Split math is exact for awkward amounts (e.g. 33 THB, 47 THB): rounding
  must be deterministic and the buckets must still sum to the paid amount. Fail if any
  satang (or test-unit) is lost.

  Coverage: **unit** (split calculation incl. rounding cases), **integration**
  (ledger persistence across plays), **e2e** (dashboard totals render and match).

### AC-7 · Demo understandable by a non-technical person in 5 minutes (POC-SPEC hypothesis 3; VALIDATION-PLAN E1 kill-criteria)

- **AC-7.1** A 5-minute demo script exists (poc/DEMO-SCRIPT.md or equivalent) and its
  steps are executable in order against the deployed PoC without developer
  intervention. Pass: a non-author walks the script end-to-end with ≤1 blocking
  issue. Fail if any scripted step is broken.
- **AC-7.2** The demo URL opens from a mobile browser (POC-SPEC artifact: "เปิดจากมือถือได้").
  Pass: loads and completes the catalog→pay→receipt flow on a phone. Fail otherwise.

  Coverage: **manual** (the 5-minute comprehension test is inherently human; the mobile
  flow spot-check via bcdp-browser where a device profile is available, otherwise
  manual).

### AC-8 · Transparency claim supportable in demo (PR-FAQ Q3 "โปร่งใส…ศิลปินเห็นทุกครั้ง ทุกบาท แบบเรียลไทม์")

- **AC-8.1** From the artist dashboard, a viewer can trace a single play from request
  time to receipt tx link to its split entries without leaving the demo. Pass/fail by
  scripted walkthrough. (This is the claim Grammy will probe first — E2 test with
  Poom's father.)

  Coverage: **e2e** (trace exists and links resolve), **manual** (does it *read* as
  transparent to a non-technical viewer).

## Coverage summary table

| AC | Point | unit | e2e | integration | manual |
|----|-------|------|-----|-------------|--------|
| AC-1 | ≤30 s per play | | ✓ | | ✓ spot-check |
| AC-2 | cost < 1 THB | ✓ | | ✓ | |
| AC-3 | PromptPay QR / simulated pay / no-pay-no-play | ✓ | ✓ | | ✓ real phone scan |
| AC-4 | fingerprint + setlist authorization | ✓ | ✓ | ✓ | |
| AC-5 | receipt on Base testnet, viewable tx | | ✓ | ✓ | ✓ |
| AC-6 | split 70/10/20, venue 10%, exact sums | ✓ | ✓ | ✓ | |
| AC-7 | 5-min demo + mobile URL | | | | ✓ |
| AC-8 | transparency traceability | | ✓ | | ✓ |

## Out of scope for this QA round (recorded to prevent scope creep)

- Real money capture and real stablecoin conversion (PoC simulates; WORPT-style
  sandbox conversion is phase 2 per POC-SPEC).
- Market validation signals: customer willingness to pay (scorecard Value risk —
  Wizard-of-Oz E4, deferred by Poom's explicit instruction), LOI outcome (E3),
  Grammy's response (E2). QA verifies the *system can demonstrate* these claims, not
  that the claims are market-validated.
- Regulatory sandbox application status (BOT/SEC) — viability track, not QA.

## Open items for the PMO/Human

1. **Split percentages**: PR-FAQ implies artist/label majority + venue 10%, but does not
   pin the remaining two buckets. AC-6 currently reads "as configured in the PoC split
   config". Human should confirm the canonical 70/10/20 assignment before AC-6 is used
   as a pass/fail gate (or confirm the config file is the source of truth).
2. **ACRCloud availability**: if the free-trial API key is unavailable during QA,
   AC-4.1 falls back to recorded fixtures and is marked INTEGRATION-SKIPPED rather than
   FAIL (consistent with the Task #2 baseline convention).
