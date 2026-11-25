// Unit tests for poc/lib/chain.mjs — chain init gating + receipt canonical hashing shape.
// Network calls are NOT made: we only test the unconfigured path and the hash
// tamper-detection logic used for receipts (same JSON.stringify canonical form
// that anchorReceipt hashes before sending).
// Run: node --test poc/tests/unit/ (from repo root)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initChain, chainStatus, anchorReceipt } from '../../lib/chain.mjs';
import { createHash } from 'node:crypto';

const savedPk = process.env.PRIVATE_KEY;
test.after?.(() => {}); // noop guard for runners without test.after
process.env.PRIVATE_KEY = '';

test('initChain without PRIVATE_KEY returns configured:false and a reason', () => {
  const st = initChain();
  assert.equal(st.configured, false);
  assert.match(st.reason, /PRIVATE_KEY missing/);
});

test('chainStatus without configuration reports configured:false (no network call)', async () => {
  const st = await chainStatus();
  assert.equal(st.configured, false);
});

test('anchorReceipt throws "chain not configured" when unconfigured (negative path)', async () => {
  await assert.rejects(
    () => anchorReceipt({ id: 'p1', songId: 'S001' }),
    /chain not configured/,
  );
});

// --- canonical receipt hash tamper detection (mirrors anchorReceipt's canon shape) ---
function receiptHash(ev) {
  const canon = JSON.stringify({
    v: 1, playId: ev.id, song: ev.songId, title: ev.title,
    amountTHB: ev.amountTHB, splits: ev.splits, venue: ev.venue,
    verifyMode: ev.verifyMode, verifiedAt: ev.verifiedAt,
  });
  return createHash('sha256').update(Buffer.from(canon, 'utf8')).digest('hex');
}

const baseEvent = {
  id: 'play-001', songId: 'S001', title: 'Demo Song', amountTHB: 25,
  splits: { label: 0.7, venue: 0.1, platform: 0.2 }, venue: 'V01',
  verifyMode: 'setlist', verifiedAt: '2026-11-25T00:00:00Z',
};

test('receipt hash is deterministic for an identical play event', () => {
  assert.equal(receiptHash(baseEvent), receiptHash({ ...baseEvent }));
});

test('receipt hash changes when ANY canonical field is tampered', () => {
  const ref = receiptHash(baseEvent);
  const mutations = [
    { ...baseEvent, id: 'play-002' },
    { ...baseEvent, songId: 'S002' },
    { ...baseEvent, title: 'Demo SongX' },
    { ...baseEvent, amountTHB: 26 },
    { ...baseEvent, splits: { label: 0.71, venue: 0.1, platform: 0.19 } },
    { ...baseEvent, venue: 'V02' },
    { ...baseEvent, verifyMode: 'dj' },
    { ...baseEvent, verifiedAt: '2026-11-25T00:00:01Z' },
  ];
  for (const m of mutations) assert.notEqual(receiptHash(m), ref);
});

test('receipt hash is a 64-char lowercase hex digest', () => {
  assert.match(receiptHash(baseEvent), /^[0-9a-f]{64}$/);
});

test.initChain = undefined;
if (savedPk !== undefined) process.env.PRIVATE_KEY = savedPk;
else delete process.env.PRIVATE_KEY;
