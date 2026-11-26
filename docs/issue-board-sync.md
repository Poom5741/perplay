# Issue ↔ Board ↔ QA Card Sync Report

Owner: Orion (business analysis) · Task #8 · 2026-11-25

## 1. Board sync verification

- Open issues in Poom5741/perplay: **20** (fresh `gh issue list --state open`).
- Issues present on "perplay board" (GitHub Project v2, owner Poom5741, number 15,
  id `PVT_kwHOAfefzM4BsmFj`, per `docs/agents/issue-tracker.md`): **20 of 20** —
  verified via GraphQL `projectV2(number:15){items}` cross-checked against the open-issue
  list. The full set #9–#28 is on the board. **Nothing to add.**
- No issues were closed or reassigned (per task constraint).

## 2. QA-related issue → team QA card mapping

| Issue | Title (short) | Maps to team card | Card status | Notes |
|-------|---------------|-------------------|-------------|-------|
| #11 | F2: Lint + typecheck + unit test + hooks | #1 QA work plan · #2 QA baseline report | #1 pending_acceptance · #2 in_progress | Unit layer of the QA plan; Task #2 records current unit-test state as the baseline |
| #12 | F3: Integration test — API routes vs real D1 | #1 QA work plan · #2 QA baseline report | #1 pending_acceptance · #2 in_progress | Integration layer; covers AC-2/AC-4/AC-5/AC-6 integration points in `qa/business/acceptance-criteria.md` |
| #13 | F4: E2E headed + video recording | #3 Manual browser test case list · #1 QA plan | #3 pending_acceptance | E2E automation layer; `qa/manual/manual-test-cases.md` marks which cases are bcdp-automatable |
| #14 | F5: CI/CD — test pipeline + auto deploy | #1 QA plan (future batch) | not yet opened as a team card | Depends on #11–#13 landing first; recommend opening after QA plan is confirmed by Human |
| #23 | C7: Deploy production + measure e2e ≤30 s from real mobile | `qa/business/acceptance-criteria.md` AC-1 (≤30 s) and AC-7.2 (mobile URL) · #3 test cases TC covering the timed flow | AC doc accepted (#4 done) | The business kill-criteria (≤30 s median, >90 s = redesign) live in AC-1; #23 is the executor that must satisfy them |
| #25 | C9: Fri 27 Nov — test with father (proxy Grammy) → feedback → LOI | AC-7 (5-min demo) · AC-8 (transparency traceability) · #3 demo dry-run case | AC doc accepted | This is the business moment the whole QA round protects; E2 in `validation/VALIDATION-PLAN.md` |

Source of truth for statuses above: fresh `gh issue list` (open state) and the team
board read at time of writing. **Statuses are a point-in-time snapshot as of
2026-11-25 morning; consult the team board for live state.** QA card statuses: #1 pending_acceptance, #2 in_progress,
#3 pending_acceptance, #4 accepted (AC doc is the referenced artifact).

## 3. Recommendations

1. Open a team card for **#14 (F5 CI/CD)** once the Human confirms the QA plan — it is
   the only QA-track issue without a team-card counterpart.
2. When #23 lands, re-run AC-1's timed measurement on a real phone rather than trusting
   the e2e harness alone (AC-1 already requires a manual spot-check).
