// Unit tests for poc/lib/store.mjs — JSON-file state store.
// The module resolves DATA_DIR from process.cwd() at import time, so this file
// chdirs into a temp directory BEFORE importing it, keeping test writes out of
// the repo (and out of poc/data used by the e2e suite).
// Run: node --test poc/tests/unit/ (from repo root)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const tmp = mkdtempSync(path.join(tmpdir(), 'perplay-store-test-'));
process.chdir(tmp);
const { Store } = await import('../../lib/store.mjs');

test('fresh store starts empty and creates its data file on disk', () => {
  const s = new Store('unit-a');
  assert.deepEqual(s.data, {});
  const raw = JSON.parse(readFileSync(path.join(tmp, 'data', 'unit-a.json'), 'utf8'));
  assert.deepEqual(raw, {});
});

test('set writes the value and flush() persists it to disk', () => {
  const s = new Store('unit-b');
  s.set('ledger', [{ id: 'p1', amountTHB: 25 }]);
  const raw = JSON.parse(readFileSync(path.join(tmp, 'data', 'unit-b.json'), 'utf8'));
  assert.equal(raw.ledger[0].amountTHB, 25);
});

test('get returns stored value and a default for missing keys', () => {
  const s = new Store('unit-c');
  s.set('count', 3);
  assert.equal(s.get('count'), 3);
  assert.equal(s.get('missing', 'fallback'), 'fallback');
  assert.equal(s.get('missing'), undefined);
});

test('set overwrites an existing key (last write wins)', () => {
  const s = new Store('unit-d');
  s.set('k', 'v1');
  s.set('k', 'v2');
  assert.equal(s.get('k'), 'v2');
});

test('a second Store instance sees data persisted by the first (reload path)', () => {
  const s1 = new Store('unit-e');
  s1.set('receipts', [{ id: 'r1' }]);
  const s2 = new Store('unit-e');
  assert.deepEqual(s2.get('receipts'), [{ id: 'r1' }]);
});

test('corrupted JSON on disk makes the constructor throw (edge case)', () => {
  writeFileSync(path.join(tmp, 'data', 'unit-f.json'), '{not valid json');
  assert.throws(() => new Store('unit-f'), SyntaxError);
});

test('stores with different names are isolated from each other', () => {
  const a = new Store('unit-g1');
  const b = new Store('unit-g2');
  a.set('x', 1);
  assert.equal(b.get('x', 'absent'), 'absent');
});

// cleanup the temp dir when the process exits
process.on('exit', () => { try { rmSync(tmp, { recursive: true, force: true }); } catch {} });
