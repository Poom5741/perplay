// Integration tests for all /api/* routes of poc/server.mjs
// Framework: node --test (built-in, zero dependencies)
//
// Isolation: the test harness copies the server entry into a temp working
// directory (with symlinked lib/, public/, audio/, node_modules/) and spawns
// the server there with PORT=3210. Because lib/store.mjs writes to
// `${process.cwd()}/data`, the server's persistent store stays inside the
// temp dir and NEVER touches poc/data/ used by `npm run e2e`.
//
// Run: node --test poc/tests/integration/
// (from repo root, or `node --test tests/integration/` from poc/)

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, symlinkSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const POC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = 3210;
const BASE = `http://localhost:${PORT}`;

let server;
let tmp;
let fixtureS001; // bytes of a real catalog audio file (matches its fingerprint)

// anchorIfReady sets status='anchoring' synchronously and reverts to 'verified'
// after the (unconfigured-chain) anchor attempt fails — poll until settled.
const settle = async (playId, timeoutMs = 5000) => {
  const deadline = Date.now() + timeoutMs;
  let body;
  while (Date.now() < deadline) {
    ({ body } = await api(`/plays/${playId}`));
    if (body.play.status !== 'anchoring') return body.play;
    await new Promise(r => setTimeout(r, 100));
  }
  return body.play;
};

const api = async (p, opts = {}) => {
  const res = await fetch(`${BASE}/api${p}`, opts);
  let body = null;
  try { body = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, body };
};
const postJSON = (p, obj) => api(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) });

before(async () => {
  // temp working dir so the server's data/ store is isolated from poc/data
  tmp = mkdtempSync(path.join(tmpdir(), 'perplay-it-'));
  for (const dir of ['lib', 'public', 'audio', 'node_modules']) {
    symlinkSync(path.join(POC_DIR, dir), path.join(tmp, dir), 'dir');
  }
  // server.mjs must be a real file (imports resolve relative to it)
  rmSync(path.join(tmp, 'server.mjs'), { force: true });
  const serverSrc = readFileSync(path.join(POC_DIR, 'server.mjs'));
  const { writeFileSync } = await import('node:fs');
  writeFileSync(path.join(tmp, 'server.mjs'), serverSrc);

  fixtureS001 = readFileSync(path.join(POC_DIR, 'audio', 'S001.wav'));

  server = spawn('node', ['server.mjs'], { cwd: tmp, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '';
  server.stdout.on('data', d => (out += d));
  server.stderr.on('data', d => (out += d));
  // wait for readiness (poll /api/health up to ~10s)
  for (let i = 0; i < 40; i++) {
    try { await api('/health'); return; } catch { await new Promise(r => setTimeout(r, 250)); }
  }
  throw new Error(`server never came up on :${PORT}\n${out.slice(-1500)}`);
});

after(() => {
  if (server) server.kill();
});

// ---------- GET /api/health ----------
test('GET /api/health — happy path: ok, catalog and fingerprint counts', async () => {
  const { status, body } = await api('/health');
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.songs, 100);
  assert.ok(body.fingerprints > 0);
  assert.ok('chain' in body && 'venue' in body);
});
// NOTE: /api/health is a stateless GET with no request-dependent failure mode;
// no native 4xx path exists (malformed requests never reach it — any /api/*
// pathname is matched). Covered by the shared 404 route test below.

// ---------- GET /api/catalog ----------
test('GET /api/catalog — happy path: 100 songs with 70/10/20 splits', async () => {
  const { status, body } = await api('/catalog');
  assert.equal(status, 200);
  assert.equal(body.songs.length, 100);
  assert.ok(body.songs.every(s => s.splits.label === 0.7 && s.splits.venue === 0.1 && s.splits.platform === 0.2));
  assert.ok(body.songs[0].id && body.songs[0].priceTHB > 0);
});
// NOTE: like /api/health, /api/catalog is stateless with no 4xx path of its own.

// ---------- POST /api/setlist ----------
test('POST /api/setlist — happy path: register ids, returns titles', async () => {
  const { status, body } = await postJSON('/setlist', { songIds: ['S001', 'S005'] });
  assert.equal(status, 200);
  assert.deepEqual(body.songIds, ['S001', 'S005']);
  assert.equal(body.titles.length, 2);
  assert.ok(body.date); // defaults to today
});

test('POST /api/setlist — unknown ids are filtered (documented non-4xx behavior)', async () => {
  const { status, body } = await postJSON('/setlist', { songIds: ['S001', 'BOGUS'] });
  assert.equal(status, 200);
  assert.deepEqual(body.songIds, ['S001']); // invalid ids silently dropped, no 4xx by design
});

// ---------- GET /api/setlist ----------
test('GET /api/setlist — happy path: returns registered ids for a date', async () => {
  const { status, body } = await api('/setlist'); // default = today (just registered above)
  assert.equal(status, 200);
  assert.deepEqual(body.songIds, ['S001']);
});

test('GET /api/setlist — empty setlist for a fresh date (not an error)', async () => {
  const { status, body } = await api('/setlist?date=1999-01-01');
  assert.equal(status, 200);
  assert.deepEqual(body.songIds, []);
});

// ---------- POST /api/plays ----------
test('POST /api/plays — happy path: 201, PromptPay CRC valid, QR data URL', async () => {
  const { status, body } = await postJSON('/plays', { songId: 'S001', mode: 'setlist' });
  assert.equal(status, 201);
  assert.equal(body.play.songId, 'S001');
  assert.equal(body.play.status, 'qr_pending');
  assert.equal(body.promptPay.crcValid, true);
  assert.ok(body.promptPay.payload.startsWith('00020101'));
  assert.ok(body.qrDataURL.startsWith('data:image/png;base64,'));
});

test('POST /api/plays — error path: unknown songId → 404 (not 500)', async () => {
  const { status, body } = await postJSON('/plays', { songId: 'NOPE999' });
  assert.equal(status, 404);
  assert.match(body.error, /song not found/);
});

test('POST /api/plays — unsupported mode string falls back to setlist (documented)', async () => {
  const { status, body } = await postJSON('/plays', { songId: 'S002', mode: 'banana' });
  assert.equal(status, 201);
  assert.equal(body.play.verifyMode, 'setlist');
});

// ---------- GET /api/plays/recent ----------
test('GET /api/plays/recent — happy path: lists created plays, newest first', async () => {
  const { status, body } = await api('/plays/recent');
  assert.equal(status, 200);
  assert.ok(body.plays.length >= 2);
  assert.ok(body.plays[0].seq >= body.plays[body.plays.length - 1].seq);
});

// ---------- GET /api/plays/:id ----------
test('GET /api/plays/:id — happy path: fetch a created play', async () => {
  const create = await postJSON('/plays', { songId: 'S003', mode: 'setlist' });
  const { status, body } = await api(`/plays/${create.body.play.id}`);
  assert.equal(status, 200);
  assert.equal(body.play.id, create.body.play.id);
});

test('GET /api/plays/:id — error path: unknown id → 404 (not 500)', async () => {
  const { status, body } = await api('/plays/deadbeef');
  assert.equal(status, 404);
  assert.match(body.error, /play not found/);
});

// ---------- POST /api/plays/:id/confirm-paid ----------
test('POST confirm-paid — happy path: setlist mode + registered song → verified', async () => {
  await postJSON('/setlist', { songIds: ['S004'] });
  const create = await postJSON('/plays', { songId: 'S004', mode: 'setlist' });
  const { status } = await api(`/plays/${create.body.play.id}/confirm-paid`, { method: 'POST' });
  assert.equal(status, 200);
  const play = await settle(create.body.play.id);
  assert.equal(play.status, 'verified'); // anchor attempt failed (chain unconfigured) → retryable verified
  assert.equal(play.verifyResult.ok, true);
  assert.equal(play.verifyResult.method, 'setlist');
});

test('POST confirm-paid — error path: setlist mode, song NOT on tonight setlist → 409', async () => {
  await postJSON('/setlist', { songIds: ['S001'] }); // S006 not registered
  const create = await postJSON('/plays', { songId: 'S006', mode: 'setlist' });
  const { status, body } = await api(`/plays/${create.body.play.id}/confirm-paid`, { method: 'POST' });
  assert.equal(status, 409);
  assert.ok(body.play);
});

test('POST confirm-paid — error path: unknown play id → 404 (not 500)', async () => {
  const { status } = await api('/plays/deadbeef/confirm-paid', { method: 'POST' });
  assert.equal(status, 404);
});

test('POST confirm-paid — idempotent: confirming again returns 200, not an error', async () => {
  await postJSON('/setlist', { songIds: ['S007'] });
  const create = await postJSON('/plays', { songId: 'S007', mode: 'setlist' });
  await api(`/plays/${create.body.play.id}/confirm-paid`, { method: 'POST' });
  const { status } = await api(`/plays/${create.body.play.id}/confirm-paid`, { method: 'POST' });
  assert.equal(status, 200); // demo-safe double click
});

// ---------- POST /api/plays/:id/verify/scan ----------
test('POST verify/scan — happy path: real catalog audio bytes → verified via fingerprint', async () => {
  const create = await postJSON('/plays', { songId: 'S001', mode: 'acr' });
  const res = await fetch(`${BASE}/api/plays/${create.body.play.id}/verify/scan`, { method: 'POST', body: fixtureS001 });
  const body = await res.json();
  assert.equal(res.status, 200);
  const play = await settle(create.body.play.id);
  assert.equal(play.status, 'verified');
  assert.equal(play.verifyResult.ok, true);
  assert.equal(play.verifyResult.matchedSong, 'S001');
});

test('POST verify/scan — error path: empty body → 400 (not 500)', async () => {
  const create = await postJSON('/plays', { songId: 'S002', mode: 'acr' });
  const res = await fetch(`${BASE}/api/plays/${create.body.play.id}/verify/scan`, { method: 'POST', body: '' });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.match(body.error, /no audio body/);
});

test('POST verify/scan — unknown audio: 200 with ok:false flagged as unlicensed (documented)', async () => {
  const create = await postJSON('/plays', { songId: 'S008', mode: 'acr' });
  const res = await fetch(`${BASE}/api/plays/${create.body.play.id}/verify/scan`, { method: 'POST', body: Buffer.from('not-a-real-song-audio') });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.play.verifyResult.ok, false); // sales point: system knows it is unlicensed
});

test('POST verify/scan — regression (defect D2): scan matching a DIFFERENT song must not license the play → 409', async () => {
  // play is created for S003 but the uploaded bytes are S001's catalog audio (matches S001's fingerprint)
  const create = await postJSON('/plays', { songId: 'S003', mode: 'acr' });
  const res = await fetch(`${BASE}/api/plays/${create.body.play.id}/verify/scan`, { method: 'POST', body: fixtureS001 });
  const body = await res.json();
  assert.equal(res.status, 409); // reject, not silently verified
  assert.match(body.error, /fingerprint mismatch/);
  assert.equal(body.error.includes('S001') && body.error.includes('S003'), true);
  const play = body.play;
  assert.notEqual(play.status, 'verified'); // stays unverified (paid)
  assert.equal(play.verifyResult.ok, false); // explicit mismatch reason
  assert.equal(play.verifyResult.matchedSong, 'S001');
});

// ---------- POST /api/plays/:id/retry-anchor ----------
test('POST retry-anchor — happy path: returns the play (chain unconfigured → stays verified)', async () => {
  const create = await postJSON('/plays', { songId: 'S009', mode: 'acr' });
  const res = await fetch(`${BASE}/api/plays/${create.body.play.id}/retry-anchor`, { method: 'POST' });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(body.play);
  // qr_pending (no verify yet → nothing to anchor) or settled verify state after the attempt
  assert.ok(['qr_pending', 'verified', 'anchored'].includes(body.play.status));
});

// ---------- GET /api/ledger ----------
test('GET /api/ledger — happy path: counts verified plays with 70/10/20 split sums', async () => {
  const { status, body } = await api('/ledger');
  assert.equal(status, 200);
  assert.ok(body.plays >= 1);
  assert.ok(body.totalTHB > 0);
  const labelSum = Object.values(body.labelByParty).reduce((a, b) => a + b, 0);
  const venueSum = Object.values(body.venueByParty).reduce((a, b) => a + b, 0);
  const total = body.totalTHB;
  assert.ok(Math.abs(labelSum + venueSum + body.platformTHB - total) < 0.05); // splits sum to total
  assert.equal(body.hypothesis.e2eUnder30s, null); // no anchored plays without chain config
});

// ---------- unknown /api route ----------
test('unknown /api route — error path: 404 no route (not 500)', async () => {
  const { status, body } = await api('/definitely-not-a-route');
  assert.equal(status, 404);
  assert.match(body.error, /no route/);
});
