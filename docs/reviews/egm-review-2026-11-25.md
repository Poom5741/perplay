# EGM Fresh-Eyes Review — QA Plan & Acceptance Criteria (2026-11-25)

Task #12 · Xuance (engineering) · Reviewer skill: `egm-review` (Elephant-Goldfish Model, https://github.com/google/elephant-goldfish-model)

## 0. Execution mode (disclosed limitation)

The installed EGM bundle does not ship the full protocol assets for this harness: only `agents/openai.yaml` exists under `~/.dsh/skills/egm-review/` (no `resources/` persona files), and this session is a delegated subagent at delegation depth 0 with no subagent-spawn tool — the EGM protocol itself states that a same-context review "is not a Goldfish review". The review below is therefore a **degraded-mode fresh-eyes pass** that follows the EGM phase structure (zoom-out → comprehension → critique → implementation readiness) in a single context, with every claim cross-checked against actual code/commands rather than memory. **Needs-Human note:** if strict goldfish isolation is required, re-run `egm-review` from a session that has subagent delegation; the phase outputs below are reproducible inputs for that run.

## 1. Phase: Zoom-out review

- **docs/qa-plan.md** — a DRAFT planning doc, correctly scoped (no test code). Structure: measured current state → 4-type coverage/acceptance drafts → speckit + EGM usage → Human questions → start precondition. Fit with actual code verified (see §3). Clear as a plan document.
- **qa/business/acceptance-criteria.md** — 8 decidable criteria (AC-1..AC-8) traced to validation/ PR-FAQ, scorecard, VALIDATION-PLAN E1, POC-SPEC. Well-scoped with explicit out-of-scope section and 2 open Human items. Judgment rules are concrete (numbers, sample counts).

## 2. Phase: Comprehension review (can a fresh reader execute from these docs?)

- qa-plan §2.1 acceptance says `node --test` but originally implied `npm test exits 0` — **contradicted by the repo**: `poc/package.json` has no `test` script (verified: only `start/dev/e2e/wallet/make-audio`), and the directory-form `node --test poc/tests/unit/` fails on Node v22.23.3 (MODULE_NOT_FOUND). A fresh reader following the doc literally would fail. → **F-1 (fix applied, qa-plan).**
- qa-plan §2.4 said the manual checklist "lands in `validation/`" — it actually landed at `qa/manual/manual-test-cases.md` (Task #3). → **F-2 (fix applied, qa-plan).**
- qa-plan is a DRAFT snapshot; as tasks landed, its commands went stale relative to reality (unit glob command, e2e reporter/runbook). → **F-3 (fix applied): execution-status note added under the header so a reader knows what superseded §2.**
- acceptance-criteria coverage table is consistent and decidable; a fresh reader can map each AC to a test type and command. No comprehension blockers.

## 3. Phase: Design critique (fit with actual code — every claim re-measured)

| Finding | Evidence | Disposition |
|---|---|---|
| **F-1**: qa-plan §2.1 acceptance referenced a nonexistent `npm test` and an unusable directory-form test command | `poc/package.json` scripts have no `test`; `node --test poc/tests/unit/` → MODULE_NOT_FOUND on Node v22.23.3; glob form is the accepted command (34/34 pass, Task #5) | **Accepted-fix** — §2.1 rewritten to the verified glob command + npm-test caveat |
| **F-2**: qa-plan §2.4 placed the manual checklist in `validation/` | Actual artifact: `qa/manual/manual-test-cases.md` (15 cases, 13 bcdp-ok) | **Accepted-fix** — §2.4 updated |
| **F-3**: qa-plan stale vs landed work (e2e hardening, runbook, run reports) | Tasks #5/#6/#7-partial/#10 accepted; `poc/scripts/e2e-runbook.md` exists | **Accepted-fix** — execution-status block added under the doc header |
| **F-4**: AC-2.1/AC-2 coverage assumes a cost metering + cost-aggregation unit function; **no cost metering exists** (`grep -rn cost poc/lib poc/server.mjs` → zero product-code hits) | Chain fee is real-but-free testnet; ACR calls are mocked in PoC | **Rejected-as-fix** (out of my write scope — qa/business/); forwarded to Orion: AC-2 should be re-verdicted `NOT-YET-TESTABLE` in acceptance-verification.md (Task #9) unless metering is added |
| **F-5**: AC-1.1 requires 10 consecutive timed runs (median ≤30s, ≥9/10); current e2e measures 2 plays/run and per-play timing is null without chain | `13/19 … chain enabled: false`, `mode e2e: setlist=n/as, acr=n/as` (e2e-report.mjs, 2026-11-25) | **Rejected-as-fix** (out of write scope); forwarded to Orion: AC-1 verdict will be `NOT-YET-TESTABLE` until a funded `PRIVATE_KEY` lands — consistent with runbook §chain-enabled |
| **F-6**: AC-3.1 "amount 20–50 THB" — verified TRUE against code: `PRICES = [25, 30, 35, 40, 50]` (poc/lib/catalog.mjs:10), all within 20–50 | code check | No change needed (finding recorded as verification) |
| **F-7**: AC-5.1 "tx links resolve on basescan.org (testnet)" — code uses `https://sepolia.basescan.org/tx/` (poc/lib/chain.mjs:9); matches intent | code check | No change needed |
| **F-8**: AC-4.1 "≥95% top-1 accuracy" over demo fixtures — the PoC fingerprint is a **mock** (e2e B1 detail: "ใช้ mock fingerprint"), so a 95% fixture-accuracy pass is circular (fixtures are derived from the same hashes) | e2e-report output B1 | **Needs-Human/owner** — Orion should either scope AC-4.1 to the mock's determinism (trivially 100%) or mark it INTEGRATION-SKIPPED pending a real ACRCloud key (open item #2 of the doc already covers the key) |

## 4. Phase: Implementation readiness

- qa-plan: ready as a historical plan + status doc after F-1/F-2/F-3; remaining §4 open questions 2–4 still need Human (framework/Playwright, D1-vs-Node, pre-demo scope) — unchanged, correctly still flagged.
- acceptance-criteria: ready to be used as the Task #9 verification baseline, with F-4/F-5/F-8 pre-flagged so Orion's verdicts match reality instead of discovering them during verification.

## 5. Files changed (all in scope)

- `docs/qa-plan.md` — F-1 §2.1 command fix, F-2 §2.4 checklist location, F-3 execution-status note. Nothing else touched; `qa/business/`, `poc/`, `tests/`, `qa/manual/` untouched.
- `docs/reviews/egm-review-2026-11-25.md` — this report.

No secrets or credentials appear in any output (repo contains none; `.env` handling referenced by path only).
