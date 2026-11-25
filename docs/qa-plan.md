# QA Work Plan Draft (unit / e2e / integration / manual)

> Task #1 · Xuance (engineering) · 2026-11-25 · **DRAFT — pending Human (Poom) confirmation before any work starts. This document only breaks down the plan; no test code is written.**
>
> **Execution status (2026-11-25, EGM review pass):** plan items have since landed — unit tests `poc/tests/unit/` (34 pass, glob command above), integration `poc/tests/integration/` (22 pass, port 3210), e2e hardened with headless reporter + runbook `poc/scripts/e2e-runbook.md` (13/19 chain-disabled; 6 chain fails need a funded `PRIVATE_KEY` in `poc/.env` — Human), manual cases `qa/manual/manual-test-cases.md` + run report `qa/manual/runs/`. §2 commands superseded where noted.

## 1. Current state (measured)

- `poc/` is the only implementation (Node ESM: `server.mjs` + `lib/{catalog,chain,promptpay,store}.mjs` + `public/{index.html,app.js}`). No test framework dependency (`poc/package.json` has only `qrcode` + `viem`).
- Existing in-house e2e script: `poc/scripts/e2e.mjs` (spawns the real server on :3001, runs catalog/setlist/verify/chain assertions, validates POC-SPEC hypothesis #1 "≤30s per play"), run via `npm run e2e`.
- Open GitHub issues (`gh issue list --state open`, 20 total): #9–#28.
  - Directly QA-related: #11 (lint + typecheck + unit + hooks), #12 (integration — API routes against real D1), #13 (E2E headed + video recording), #14 (CI/CD test pipeline + auto deploy), #23 (production deploy + real-device e2e ≤30s).
  - QA-adjacent but feature cards: #15–#20 (C1–C6 features), #24 (demo script/video), #25 (Friday father test = manual acceptance).
- The term "egm" has zero hits in any text file of the working tree (only a binary match inside the `.git` packfile) → ambiguous, see §4.

## 2. Coverage targets and acceptance-criteria drafts per test type

### 2.1 Unit (pure functions, no network / no chain)
Coverage: `poc/lib/promptpay.mjs` (PromptPay EMVCo TLV payload + CRC), `poc/lib/catalog.mjs` (100 songs + 70/10/20 splits), `poc/lib/store.mjs` (in-memory ledger), pure hash/receipt-assembly logic in `poc/lib/chain.mjs`.
Acceptance criteria (draft): at least 1 happy path + 1 edge case per module (empty catalog, invalid songId, splits summing ≠ 1); PromptPay payload passes an EMVCo TLV + CRC self-check assertion; run via Node's built-in runner `node --test` (zero new dependencies). Accepted command (Node v22.23.3): `node --test poc/tests/unit/*.test.mjs` from repo root (the directory form `node --test poc/tests/unit/` fails with MODULE_NOT_FOUND on this Node version; `poc/package.json` has no `test` script — add one only if Human wants `npm test`).

### 2.2 Integration (API layer)
Coverage: all `/api/*` routes of `server.mjs` (health / catalog / setlist / verify / receipt) with real data files (currently in-memory/file store; the D1 variant from issue #12 follows once C1 lands).
Acceptance criteria (draft): spawn the real server (reuse the spawn pattern from `e2e.mjs`) and hit every route, asserting status code + JSON schema; cover error paths (404 songId, verify against an unregistered setlist) → 4xx, never 500. Maps to issue #12.

### 2.3 E2E (full flow)
Coverage: the existing `poc/scripts/e2e.mjs` flow (request→paid→verified→anchored, real Base Sepolia tx) plus the browser layer: `public/app.js` three-page flow (catalog → QR → status board). Includes headed mode + video recording (issue #13), CI hookup (issue #14), real-device ≤30s measurement (issue #23).
Acceptance criteria (draft): headless `npm run e2e` fully green with per-play timing ≤30s printed; browser e2e (Playwright — new dependency needs Human approval) completes one full click-through and produces a video file; CI runs the headless version on every push.

### 2.4 Manual (browser, human)
Coverage: the 5-minute demo journey (`poc/DEMO-SCRIPT.md`) walked through on a real phone browser; QR scannable by a real phone; tx link opens in a block explorer; the Friday "test with dad" session (issue #25) is the live manual acceptance event.
Acceptance criteria (draft): a manual checklist — implemented as `qa/manual/manual-test-cases.md` (15 cases, 13 marked bcdp-automatable), each item pass/fail + screenshot; full pass the night before the demo (11/26).

## 3. How the super-speckit skill is used

- **Scope boundary**: super-speckit is a spec-driven implementation flow (spec → plan → tasks → implement). In this QA round it is **not** used to write tests directly; it is used to guarantee spec-first ticket creation when breaking §2 items down into executable tickets.
- **Per type**:
  - unit/integration: `/specify` a test spec per module (input/output/edge table) → `/plan` to pick the runner and directory layout → `/tasks` to cut issues (add to the perplay board, Status=Ready).
  - e2e: POC-SPEC hypothesis #1 is the spec; `/plan` defines the timing methodology (from which request to which tx confirmation).
  - manual: the speckit-produced checklist lands directly in `validation/MANUAL-CHECKLIST.md`.
- **Suggested execution order**: #11 (unit + lint + hooks) → #12 (integration) → #13 (e2e headed + recording) → #14 (CI) → #23 (real device). #25 does not depend on all of the above, but the headless e2e should be green before booking it.

### 3.1 EGM fresh-eyes review pass (confirmed by Human)

Human confirmed open question ①: "egm" = the **Elephant-Goldfish Model** plugin (https://github.com/google/elephant-goldfish-model). Its skills (`egm-review`, `egm-review-loop`, `egm-drift-report`) are installed in the shared skill directory (`~/.dsh/skills/`, verified by listing on 2026-11-25) and are folded into this plan as follows:

- **`egm-review`** — a fresh-eyes, zero-context review pass over the QA plan and each test artifact (unit specs, integration specs, e2e specs, manual checklist) before submission. Use it exactly because it carries no prior-conversation bias: it catches unstated assumptions and missing edge cases that participants normalize.
- **`egm-review-loop`** — for contested findings: run the loop until reviewer and author converge, then record the resolution in the artifact.
- **`egm-drift-report`** — after each QA ticket closes, run a drift report to check the implemented tests still match the acceptance criteria drafted in §2 (guards against criteria-implementation drift across the #11→#23 sequence).

**Where it fits the flow**: after speckit produces a ticket's spec (`/specify`) and before the ticket is marked Ready on the board, run one `egm-review` pass on the spec; after implementation and before requesting acceptance, run one more on the tests + a `egm-drift-report` against §2 criteria.

## 4. Questions for Human confirmation

1. ~~What does "egm" mean?~~ **RESOLVED (Human, 2026-11-25):** "egm" = the Elephant-Goldfish Model plugin (https://github.com/google/elephant-goldfish-model); folded into the plan as §3.1.
2. Test framework choice: Node built-in `node --test` for unit (zero deps, fits the PoC style) vs vitest? Is Playwright approved as a new dependency for browser e2e (issue #13 implies headed + recording)?
3. Issue #12 says "API routes against real D1", but the current PoC is Node + file store; the D1/Cloudflare version (issue #10 scaffold) has not started. Should integration tests target the current Node version first, or wait for #10/#15?
4. QA priority: before Friday's (11/27) demo, keep only headless e2e + manual checklist, deferring unit/integration/CI until after the demo?

## 5. Precondition to start

Once §4 is confirmed, open the issues per §3 (add to the perplay board), then implement card by card. This Task stops here — no test code written.
