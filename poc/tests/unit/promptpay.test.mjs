// Unit tests for poc/lib/promptpay.mjs — PromptPay EMVCo TLV payload + CRC16-CCITT
// Run: node --test poc/tests/unit/ (from repo root)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promptPayPayload, crc16 } from '../../lib/promptpay.mjs';

function parseTlv(payload, offset = 0) {
  const out = [];
  while (offset < payload.length) {
    const tag = payload.slice(offset, offset + 2);
    const len = parseInt(payload.slice(offset + 2, offset + 4), 10);
    const value = payload.slice(offset + 4, offset + 4 + len);
    out.push({ tag, len, value });
    offset += 4 + len;
  }
  return out;
}

test('crc16 matches the CRC-16/CCITT-FALSE check vector', () => {
  // Standard check value: CRC-16/CCITT-FALSE("123456789") = 0x29B1
  assert.equal(crc16('123456789'), '29B1');
});

test('crc16 of empty string is the init value FFFF', () => {
  assert.equal(crc16(''), 'FFFF');
});

test('payload starts with TLV 00="01" and 01="12" (dynamic one-time QR)', () => {
  const p = promptPayPayload('0891234567', 25, 'R000001');
  const fields = parseTlv(p);
  assert.equal(fields[0].tag, '00');
  assert.equal(fields[0].value, '01');
  assert.equal(fields[1].tag, '01');
  assert.equal(fields[1].value, '12');
});

test('TLV lengths are correct for every top-level field', () => {
  const p = promptPayPayload('0891234567', 25, 'R000001');
  const fields = parseTlv(p.slice(0, p.length - 8)); // drop CRC tag+value
  for (const f of fields) assert.equal(f.value.length, f.len, `tag ${f.tag} length mismatch`);
});

test('payload ends with CRC tag 6304 + self-consistent CRC', () => {
  const p = promptPayPayload('0891234567', 25, 'R000001');
  const body = p.slice(0, p.length - 4);
  const crc = p.slice(-4);
  assert.equal(body.slice(-4), '6304');
  assert.equal(crc16(body), crc); // recomputed CRC matches embedded CRC
});

test('tampered payload fails CRC self-check', () => {
  const p = promptPayPayload('0891234567', 25, 'R000001');
  const body = p.slice(0, p.length - 4);
  const crc = p.slice(-4);
  const tampered = body.replace('5812', '5813'); // flip one char in MCC value
  assert.notEqual(crc16(tampered), crc);
});

test('amount is formatted as THB with 2 decimals (tag 54)', () => {
  const p = promptPayPayload('0891234567', 30, 'R000001');
  const fields = parseTlv(p.slice(0, p.length - 8));
  const amount = fields.find(f => f.tag === '54');
  assert.equal(amount.value, '30.00');
});

test('currency THB (tag 53="764") and country TH (tag 58="TH")', () => {
  const p = promptPayPayload('0891234567', 30, 'R000001');
  const fields = parseTlv(p.slice(0, p.length - 8));
  assert.equal(fields.find(f => f.tag === '53').value, '764');
  assert.equal(fields.find(f => f.tag === '58').value, 'TH');
});

test('non-digit characters are stripped from the PromptPay target', () => {
  const a = promptPayPayload('089-1234-567', 25, 'R000001');
  const b = promptPayPayload('0891234567', 25, 'R000001');
  assert.equal(a, b);
});

test('reference longer than 25 chars is truncated (tag 62-05)', () => {
  const p = promptPayPayload('0891234567', 25, 'R'.repeat(40));
  const fields = parseTlv(p.slice(0, p.length - 8));
  const addData = fields.find(f => f.tag === '62');
  const inner = parseTlv(addData.value);
  const ref = inner.find(f => f.tag === '05');
  assert.equal(ref.value.length, 25);
});

test('empty/invalid target throws PROMPTPAY_TARGET error', () => {
  assert.throws(() => promptPayPayload('', 25, 'R1'), /PROMPTPAY_TARGET/);
  assert.throws(() => promptPayPayload('abc-def', 25, 'R1'), /PROMPTPAY_TARGET/);
});
