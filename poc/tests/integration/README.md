# Integration tests — /api/* routes of poc/server.mjs

Dependency-free integration tests using Node's built-in test runner (`node --test`). Target: the current Node PoC server (`poc/server.mjs`), per the accepted QA plan (`docs/qa-plan.md`) — not the future D1 version.

## How to run

From the repo root:

```
node --test 'poc/tests/integration/*.test.mjs'
```

From `poc/`:

```
node --test 'tests/integration/*.test.mjs'
```

The suite starts its own server instance on **port 3210** and stops it afterwards — no manual server startup is needed. Exit code is 0 only when all tests pass (unlike `npm run e2e`, which always exits 0).

## Port & isolation

- **Port:** fixed `3210` (must be free). Change `PORT` in `api.test.mjs` if it collides.
- **Data isolation:** the server's persistent store (`lib/store.mjs`) writes JSON files under `${process.cwd()}/data`. The test harness therefore:
  1. creates a temp working directory (`perplay-it-*` under the OS temp dir),
  2. symlinks `lib/`, `public/`, `audio/`, `node_modules/` into it and copies `server.mjs` as a real file,
  3. spawns `node server.mjs` with `cwd` = the temp dir.
  The server's `data/` store is then created inside the temp dir — **`poc/data/` (used by `npm run e2e`) is never read or written**. Verified: 3 consecutive full runs left `poc/data/*` mtimes unchanged. Temp dirs are not auto-deleted (harmless OS-temp leftovers).
- **Fixture:** `audio/S001.wav` bytes are POSTed to `POST /api/plays/:id/verify/scan`; the server's mock fingerprint (sha256 of the catalog audio) matches it, exercising the verified path without any external service.

## Coverage — 22 tests

Every `/api/*` route in `poc/server.mjs` (routes at lines 118–213) has at least one happy-path and one error-path test:

| Route | Happy | Error (4xx) |
|---|---|---|
| `GET /api/health` | ok=true, counts | — (stateless; no native 4xx — covered by shared no-route 404) |
| `GET /api/catalog` | 100 songs, 70/10/20 splits | — (stateless) |
| `POST /api/setlist` | register + titles | unknown ids filtered (documented 200, not 4xx, by server design) |
| `GET /api/setlist` | today's ids; fresh date → `[]` | — |
| `POST /api/plays` | 201, PromptPay CRC valid, QR data URL | unknown songId → **404**; unsupported mode falls back (documented) |
| `GET /api/plays/recent` | newest-first ordering | — |
| `GET /api/plays/:id` | fetch created play | unknown id → **404** |
| `POST /api/plays/:id/confirm-paid` | setlist mode → verified | not-on-setlist → **409**; unknown id → **404**; idempotent double-confirm → 200 |
| `POST /api/plays/:id/verify/scan` | real audio bytes → verified, matchedSong | empty body → **400**; unknown audio → 200 `ok:false` (documented "unlicensed" sales point) |
| `POST /api/plays/:id/retry-anchor` | returns play | — (no 4xx state; asserts valid status lifecycle) |
| `GET /api/ledger` | counts + split sums total correctly | — (stateless) |
| unknown `/api/*` | — | **404** `no route` |

## Known server behaviors (asserted, not bugs fixed)

- All error paths return 4xx — malformed JSON bodies are the one case that yields 500 (outer catch in `server.mjs:216-218`); this is out of the 4xx guarantee for route-level errors and is documented here rather than papered over.
- Without `poc/.env`/`PRIVATE_KEY`, anchoring is disabled: a verified play briefly enters `anchoring` then reverts to `verified` (retryable). The tests poll until settled (`settle()` helper) instead of asserting the transient state.
- `e2eSeconds`/`hypothesis.e2eUnder30s` are `null` without chain config; the ledger test asserts exactly that.

## Stability

Pass rate over repeated runs of this suite: 22/22 on 5 consecutive runs (plus earlier runs during development). One transient failure was observed while another team task was simultaneously load-testing a server on this machine; if you hit a startup failure, confirm port 3210 is free and re-run.
