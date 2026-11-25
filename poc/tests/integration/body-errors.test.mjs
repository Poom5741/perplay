// Regression tests for card #19: oversized / malformed request bodies must
// return 4xx (413 / 400), never 500. Previously an oversized scan upload fell
// through to the outer catch and answered 500 (defect found during #16's D3
// investigation). Uses the same temp-dir isolation as api.test.mjs so
// poc/data/ is never touched. Zero dependencies.
//
// Run: node --test 'poc/tests/integration/*.test.mjs'

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, symlinkSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const POC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = 3294;
const BASE = `http://localhost:${PORT}`;

let child;
let tmp;

// temp working dir with symlinked lib/public/audio/node_modules + real server.mjs copy
const makeWorkspace = () => {
  const t = mkdtempSync(path.join(tmpdir(), 'perplay-body-'));
  for (const dir of ['lib', 'public', 'audio', 'node_modules']) {
    symlinkSync(path.join(POC_DIR, dir), path.join(t, dir), 'dir');
  }
  rmSync(path.join(t, 'server.mjs'), { force: true });
  writeFileSync(path.join(t, 'server.mjs'), readFileSync(path.join(POC_DIR, 'server.mjs')));
  mkdirSync(path.join(t, 'data'), { recursive: true });
  return t;
};

test('setup: spawn isolated server on port 3294', async () => {
  tmp = makeWorkspace();
  child = spawn('node', ['server.mjs'], { cwd: tmp, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'pipe', 'pipe'] });
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(`${BASE}/api/health`); if (r.ok) return; } catch { /* not up yet */ }
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('server did not become healthy on port 3294');
});

test('oversized scan body (>15MB limit) returns 413, never 500', async () => {
  const p = await (await fetch(`${BASE}/api/plays`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songId: 'S001', mode: 'acr' }) })).json();
  await fetch(`${BASE}/api/plays/${p.play.id}/confirm-paid`, { method: 'POST' });
  const big = Buffer.alloc(20 * 1024 * 1024, 7); // 20MB > 15MB readBody limit
  const res = await fetch(`${BASE}/api/plays/${p.play.id}/verify/scan`, { method: 'POST', body: big });
  assert.equal(res.status, 413, `expected 413, got ${res.status}`);
  const body = await res.json();
  assert.equal(body.error, 'body too large');
});

test('malformed JSON body returns 400, never 500', async () => {
  const res = await fetch(`${BASE}/api/plays`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'this is not json{' });
  assert.equal(res.status, 400, `expected 400, got ${res.status}`);
  const body = await res.json();
  assert.match(body.error, /malformed JSON/);
});

test('teardown: server still healthy, then stopped', async () => {
  const r = await fetch(`${BASE}/api/health`);
  assert.equal(r.ok, true);
  child.kill('SIGTERM');
  await new Promise(res => child.on('exit', res));
  rmSync(tmp, { recursive: true, force: true });
});
