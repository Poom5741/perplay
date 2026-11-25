# CI pipeline — QA suites (unit / integration / e2e chain-disabled)

Closes QA-track gap #14 (F5 CI pipeline) per the accepted QA plan (`docs/qa-plan.md`).

## What runs, in order

1. **Unit tests** — `node --test poc/tests/unit/*.test.mjs` (glob form; the directory form fails on Node v22, see `poc/tests/unit/README.md`). Expected 34/34.
2. **Integration tests** — `node --test poc/tests/integration/*.test.mjs` (documented in `poc/tests/integration/README.md`). The harness starts its own server on port 3210; expected 22/22.
3. **e2e, chain-disabled** — `cd poc && npm run e2e` via `node scripts/e2e-report.mjs`. The e2e script's exit code is unreliable, so the workflow captures the reporter's log and judges it against the recorded chain-disabled baseline: **exactly 13/19 checks passed and exactly 6 FAIL lines** (the 6 known chain checks — chain configured, wallet funded, A3/B2 anchored, A4/D5 timing). Any other count fails the build.

## Node version

Pinned to Node 22 (`actions/setup-node` `node-version: '22'`) to match the version all suites were verified on locally (v22.23.3).

## CI-specific caveats

- **No `poc/.env` in CI**: there is no funded `PRIVATE_KEY`, so the e2e suite runs in chain-disabled mode by design. The 6 chain-related failures are the *expected* result until someone provisions a funded Base Sepolia key (flagged to Human in `poc/scripts/e2e-runbook.md`). The e2e step therefore asserts the baseline (13/19) instead of demanding 19/19.
- **Port collisions**: integration tests use port 3210, e2e uses 3001 — GitHub runners are single-job VMs, so no conflict.
- **Data wipe**: `e2e.mjs` deletes `poc/data/` on every run; that is its documented behavior and harmless in CI.
- **Judge from JSON, not exit code**: `e2e-report.mjs` exits 1 on the expected 13/19 (because `j.pass` is false), so the workflow treats the reporter log — not its exit code — as authoritative, per `poc/scripts/e2e-runbook.md`.
- **e2e server-spawn flake**: the spawned e2e server occasionally fails to come up (`ECONNREFUSED` on :3001) — observed in ~2 of 4 local runs and once in an independent acceptance re-run. The workflow retries the e2e step up to 3 times and fails only if every attempt misses the baseline. A root-cause fix belongs to the e2e suite (out of this task's scope).

## Scope note

The workflow references `poc/tests/` and `poc/scripts/e2e-report.mjs`, which are uncommitted work products of QA cards #5/#6/#10. Until they are committed to the default branch, CI cannot show a real green run on GitHub; local verification of the exact workflow steps is recorded in the QA task submission. Once those land, the workflow runs as-is on every push/PR to `main`.
