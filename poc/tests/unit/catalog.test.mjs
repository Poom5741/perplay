// Unit tests for poc/lib/catalog.mjs — 100 mock tracks + 70/10/20 splits + hash helpers
// Run: node --test poc/tests/unit/ (from repo root)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog, sha256Buf } from '../../lib/catalog.mjs';

test('buildCatalog produces exactly 100 songs by default', () => {
  assert.equal(buildCatalog().length, 100);
});

test('buildCatalog honors a custom n (incl. edge case n=0)', () => {
  assert.equal(buildCatalog(7).length, 7);
  assert.deepEqual(buildCatalog(0), []);
});

test('every song id follows the S### scheme S001..S100 with no duplicates', () => {
  const songs = buildCatalog();
  const ids = songs.map(s => s.id);
  assert.equal(new Set(ids).size, 100);
  assert.equal(ids[0], 'S001');
  assert.equal(ids[99], 'S100');
  for (const id of ids) assert.match(id, /^S\d{3}$/);
});

test('splits are exactly label 0.70 / venue 0.10 / platform 0.20 on every song', () => {
  for (const s of buildCatalog()) {
    assert.equal(s.splits.label, 0.70);
    assert.equal(s.splits.venue, 0.10);
    assert.equal(s.splits.platform, 0.20);
    assert.ok(Math.abs(s.splits.label + s.splits.venue + s.splits.platform - 1) < 1e-9, 'splits sum to 1');
  }
});

test('prices come only from the configured price set and are positive numbers', () => {
  const PRICES = [25, 30, 35, 40, 50];
  for (const s of buildCatalog()) {
    assert.ok(PRICES.includes(s.priceTHB), `unexpected price ${s.priceTHB}`);
    assert.ok(s.priceTHB > 0);
  }
});

test('every song has non-empty title, artist, label and mock=true', () => {
  for (const s of buildCatalog()) {
    assert.ok(s.title.length > 0);
    assert.ok(s.artist.length > 0);
    assert.ok(s.label.length > 0);
    assert.equal(s.mock, true);
  }
});

test('catalog is deterministic — same seed produces identical output', () => {
  assert.deepEqual(buildCatalog(), buildCatalog());
});

test('sha256Buf matches the known SHA-256 vector for the empty buffer', () => {
  assert.equal(sha256Buf(Buffer.alloc(0)), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
});

test('sha256Buf matches the known SHA-256 vector for "abc"', () => {
  assert.equal(sha256Buf(Buffer.from('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('sha256Buf is deterministic and diverges on tampered input', () => {
  const a = Buffer.from('play:S001|amount:25');
  const b = Buffer.from('play:S001|amount:26'); // one field changed
  assert.equal(sha256Buf(a), sha256Buf(Buffer.from('play:S001|amount:25')));
  assert.notEqual(sha256Buf(a), sha256Buf(b));
  assert.equal(sha256Buf(b).length, 64); // hex digest length
});
