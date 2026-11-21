// E2E test — proves POC-SPEC hypothesis #1: request→paid→verified→anchored ≤30s per play
// Runs the REAL server + REAL Base Sepolia tx. Usage: npm run e2e
import { spawn } from 'node:child_process';
import { readFileSync, rmSync, readdirSync } from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:3001';
const results = [];
const ok = (name, pass, detail) => { results.push({ name, pass, detail }); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`); };

// spawn server on 3001 with fresh data (free the port first — stray servers kill runs)
import { execSync } from 'node:child_process';
try { execSync('fuser -k 3001/tcp 2>/dev/null || true'); } catch {}
await new Promise(r => setTimeout(r, 1000));
rmSync(path.join(process.cwd(), 'data'), { recursive: true, force: true });
const server = spawn('node', ['server.mjs'], { env: { ...process.env, PORT: '3001' }, stdio: ['ignore', 'pipe', 'pipe'] });
let serverOut = '';
server.stdout.on('data', d => serverOut += d);
server.stderr.on('data', d => serverOut += d);
server.on('error', e => console.error('[spawn error]', e));
await new Promise(r => { server.stdout.on('data', d => { if (String(d).includes('PoC →')) r(); }); setTimeout(r, 8000); });

try {
  const api = async (p, opts) => {
    const r = await fetch(`${BASE}/api${p}`, opts);
    const j = await r.json();
    if (!r.ok) throw new Error(`${p}: ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
    return j;
  };

  // health: chain configured + funded (retry until server accepts)
  let h;
  for (let i = 0; i < 30; i++) {
    try { h = await api('/health'); break; } catch { await new Promise(r => setTimeout(r, 500)); }
  }
  if (!h) { console.error(serverOut.slice(-2000)); throw new Error('server never came up'); }
  ok('server up', true, `${h.songs} songs, ${h.fingerprints} fingerprints`);
  ok('chain configured', h.chain.configured, `${h.chain.address} @ Base Sepolia block ${h.chain.blockNumber}`);
  ok('wallet funded', h.chain.funded, `${h.chain.balanceETH} ETH`);

  // catalog: 100 songs with splits 70/10/20
  const { songs } = await api('/catalog');
  ok('catalog 100 songs', songs.length === 100);
  ok('splits 70/10/20 on every song', songs.every(s => s.splits.label === 0.7 && s.splits.venue === 0.1 && s.splits.platform === 0.2));

  // PromptPay payload validity: EMVCo TLV + CRC self-check happens server-side; assert
  const setlist = await api('/setlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songIds: ['S001', 'S005', 'S042'] }) });
  ok('setlist registered', setlist.songIds.length === 3);

  // ---- MODE A: setlist (วงสด) ----
  const t0 = Date.now();
  const a = await api('/plays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songId: 'S001', mode: 'setlist' }) });
  ok('A1 QR generated + PromptPay CRC valid', a.promptPay.crcValid === true, `payload ${a.promptPay.payload.slice(0, 24)}… · QR ${a.qrDataURL.length}b`);
  const a2 = await api(`/plays/${a.play.id}/confirm-paid`, { method: 'POST' });
  ok('A2 paid→verified via setlist', ['verified', 'anchoring', 'anchored'].includes(a2.play.status), a2.play.verifyResult?.detail);

  // wait for anchor
  let aFinal = a2.play;
  for (let i = 0; i < 40 && aFinal.status !== 'anchored'; i++) {
    await new Promise(r => setTimeout(r, 1000));
    aFinal = (await api(`/plays/${a.play.id}`)).play;
    if (aFinal.anchorError && aFinal.status === 'verified') break;
  }
  const aSecs = +((Date.now() - t0) / 1000).toFixed(1);
  ok('A3 receipt anchored on Base Sepolia', aFinal.status === 'anchored', aFinal.explorerUrl);
  ok('A4 hypothesis #1: end-to-end ≤30s', aSecs <= 30 && aFinal.e2eSeconds <= 30, `measured ${aFinal.e2eSeconds ?? aSecs}s (wall ${aSecs}s incl. poll)`);

  // ---- MODE B: audio-scan (DJ/ACR placeholder) ----
  const t1 = Date.now();
  const b = await api('/plays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songId: 'S005', mode: 'acr' }) });
  await api(`/plays/${b.play.id}/confirm-paid`, { method: 'POST' });
  const wav = readFileSync(path.join(process.cwd(), 'audio', 'S005.wav'));
  const b2 = await fetch(`${BASE}/api/plays/${b.play.id}/verify/scan`, { method: 'POST', body: wav });
  const b2j = await b2.json();
  ok('B1 audio-scan matches fingerprint', ['verified', 'anchoring', 'anchored'].includes(b2j.play.status), b2j.play.verifyResult?.detail);
  let bFinal = b2j.play;
  for (let i = 0; i < 40 && bFinal.status !== 'anchored'; i++) {
    await new Promise(r => setTimeout(r, 1000));
    bFinal = (await api(`/plays/${b.play.id}`)).play;
    if (bFinal.anchorError && bFinal.status === 'verified') break;
  }
  const bSecs = +((Date.now() - t1) / 1000).toFixed(1);
  ok('B2 receipt anchored (DJ path)', bFinal.status === 'anchored', bFinal.explorerUrl);
  ok('B3 hypothesis #1: end-to-end ≤30s', (bFinal.e2eSeconds ?? bSecs) <= 30, `measured ${bFinal.e2eSeconds ?? bSecs}s`);

  // ---- negative: unlicensed audio must NOT verify ----
  const c = await api('/plays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songId: 'S042', mode: 'acr' }) });
  await api(`/plays/${c.play.id}/confirm-paid`, { method: 'POST' });
  const bad = await fetch(`${BASE}/api/plays/${c.play.id}/verify/scan`, { method: 'POST', body: Buffer.from('not-a-real-audio-file') });
  const badj = await bad.json();
  ok('C1 unlicensed audio flagged (no verify)', badj.play.status === 'paid' && badj.play.verifyResult?.ok === false, badj.play.verifyResult?.detail?.slice(0, 60));

  // ---- ledger: splits add up ----
  const L = await api('/ledger');
  const expected = (30 * 0.7 + 35 * 0.7).toFixed(2); // S001=฿30?, S005 price — recompute from catalog
  const p1 = songs.find(s => s.id === 'S001').priceTHB, p2 = songs.find(s => s.id === 'S005').priceTHB;
  const expLabel = +(p1 * 0.7 + p2 * 0.7).toFixed(2);
  const expVenue = +(p1 * 0.1 + p2 * 0.1).toFixed(2);
  const expPlat = +(p1 * 0.2 + p2 * 0.2).toFixed(2);
  ok('D1 ledger counts 2 licensed plays', L.plays === 2, `total ฿${L.totalTHB}`);
  ok('D2 split 70% sums correct', Object.values(L.labelByParty).reduce((a, b) => a + b, 0) === expLabel, `฿${Object.values(L.labelByParty).reduce((a, b) => a + b, 0)} = ฿${expLabel}`);
  ok('D3 venue 10% correct', Object.values(L.venueByParty).reduce((a, b) => a + b, 0) === expVenue, `฿${expVenue}`);
  ok('D4 platform 20% correct', L.platformTHB === expPlat, `฿${expPlat}`);
  ok('D5 avg e2e tracked', L.avgE2ESeconds != null && L.avgE2ESeconds <= 30, `${L.avgE2ESeconds}s avg (max ${L.maxE2ESeconds}s) · hypothesis=${L.hypothesis.e2eUnder30s}`);

  const fails = results.filter(r => !r.pass);
  console.log(`\n==== ${results.length - fails.length}/${results.length} PASS ====`);
  console.log(JSON.stringify({ pass: fails.length === 0, txs: [aFinal.explorerUrl, bFinal.explorerUrl], e2e: { setlist: aFinal.e2eSeconds, acr: bFinal.e2eSeconds } }, null, 2));
  process.exit(fails.length ? 1 : 0);
} finally {
  server.kill('SIGTERM');
}
