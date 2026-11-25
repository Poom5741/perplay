// Regression tests for the D4 single-instance data-dir guard (defect D4,
// qa/manual/runs/run-2026-11-25.md): two servers pointed at the same data
// directory used to silently clobber each other's whole-file writes.
// The guard is a PID lock file at ${cwd}/data/.server.lock.
//
// Zero dependencies; each test uses its own temp working directory (same
// isolation pattern as api.test.mjs) so poc/data/ is never touched.
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

// temp working dir with symlinked lib/public/audio/node_modules + real server.mjs copy
const makeWorkspace = () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'perplay-guard-'));
  for (const dir of ['lib', 'public', 'audio', 'node_modules']) {
    symlinkSync(path.join(POC_DIR, dir), path.join(tmp, dir), 'dir');
  }
  rmSync(path.join(tmp, 'server.mjs'), { force: true });
  writeFileSync(path.join(tmp, 'server.mjs'), readFileSync(path.join(POC_DIR, 'server.mjs')));
  return tmp;
};

const spawnServer = (tmp, port) => spawn('node', ['server.mjs'], {
  cwd: tmp,
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
});

const collect = (child) => new Promise((resolve) => {
  let out = '';
  child.stdout.on('data', d => (out += d));
  child.stderr.on('data', d => (out += d));
  child.on('exit', (code, signal) => resolve({ code, signal, out }));
});

test('D4 guard: second server on a data dir held by a LIVE pid exits 1 with a clear error', async () => {
  const tmp = makeWorkspace();
  // simulate a live holder: this test process is alive and owns the lock
  mkdirSync(path.join(tmp, 'data'), { recursive: true });
  writeFileSync(path.join(tmp, 'data', '.server.lock'), String(process.pid));

  const child = spawnServer(tmp, 3291);
  const { code, out } = await collect(child);
  assert.equal(code, 1, `expected exit 1, got ${code}; output: ${out}`);
  assert.match(out, /already using this data directory/);
  assert.match(out, /Refusing to start/);
  // holder's own server was never started, so nothing to clean up
  rmSync(tmp, { recursive: true, force: true });
});

test('D4 guard: STALE lock (dead pid) does not block startup — server takes over and serves health', async () => {
  const tmp = makeWorkspace();
  mkdirSync(path.join(tmp, 'data'), { recursive: true });
  // PID 999999 is effectively never a live process of ours
  writeFileSync(path.join(tmp, 'data', '.server.lock'), '999999');

  const port = 3292;
  const child = spawnServer(tmp, port);
  // wait until the server prints its listen line (guard passed + listening)
  const started = await new Promise((resolve) => {
    let out = '';
    const timer = setTimeout(() => resolve(out), 15000);
    const on = (d) => { out += d; if (out.includes('PlayRight PoC →')) { clearTimeout(timer); child.stdout.off('data', on); child.stderr.off('data', on); resolve(out); } };
    child.stdout.on('data', on);
    child.stderr.on('data', on);
  });
  assert.match(started, /Stale lock found/);
  assert.match(started, /PlayRight PoC →/); // server actually started listening
  // health endpoint answers
  const health = await fetch(`http://localhost:${port}/api/health`);
  assert.equal(health.ok, true);
  // stop the server; SIGTERM → 'exit' fires → lock file removed
  child.kill('SIGTERM');
  await new Promise(r => child.on('exit', r));
  assert.ok(!readFileSync(path.join(tmp, 'data', '.server.lock'), 'utf8').includes('999999'), 'lock file removed on exit');
  rmSync(tmp, { recursive: true, force: true });
});
