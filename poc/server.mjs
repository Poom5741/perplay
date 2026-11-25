// PlayRight PoC server — per-play music licensing demo
// Flow: catalog → PromptPay QR → จอฉาย → verify (setlist / audio-scan) → receipt on Base Sepolia → split ledger 70/10/20
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import { buildCatalog, ensureFingerprints, sha256Buf } from './lib/catalog.mjs';
import { promptPayPayload, crc16 } from './lib/promptpay.mjs';
import { initChain, chainStatus, anchorReceipt } from './lib/chain.mjs';
import { Store } from './lib/store.mjs';

const PORT = process.env.PORT || 3000;
try { process.loadEnvFile(); } catch { /* no .env — fine */ }
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const AUDIO_DIR = process.env.AUDIO_DIR || path.join(process.cwd(), 'audio');
const VENUE_NAME = process.env.VENUE_NAME || 'ผับ Demo (Bangkok)';

const catalog = buildCatalog(100);
const byId = Object.fromEntries(catalog.map(s => [s.id, s]));
const fingerprints = ensureFingerprints(existsSync(AUDIO_DIR) ? AUDIO_DIR : null);

const plays = new Store('plays');          // { [id]: play }
const setlists = new Store('setlists');    // { [YYYY-MM-DD]: [songId] }

const chain = initChain();
console.log('[chain]', JSON.stringify(chain));

function newPlay(song, mode) {
  const id = randomUUID().slice(0, 8);
  const ref = `PR${Date.now().toString(36).toUpperCase()}${id.slice(0, 3).toUpperCase()}`;
  return plays.set(id, {
    id, seq: Object.keys(plays.data).length, ref,
    songId: song.id, title: song.title, artist: song.artist, label: song.label,
    venue: VENUE_NAME,
    amountTHB: song.priceTHB, splits: song.splits, verifyMode: mode,
    status: 'qr_pending',           // qr_pending → paid → verified → anchored
    timings: { requested: Date.now() },
    createdAt: new Date().toISOString(),
  });
}

async function anchorIfReady(play) {
  if (play.status !== 'verified') return play;
  play.status = 'anchoring';
  plays.set(play.id, play);
  try {
    const { txHash, explorerUrl, anchors } = await anchorReceipt(play);
    play.txHash = txHash; play.explorerUrl = explorerUrl; play.anchors = anchors;
    play.status = 'anchored';
    play.timings.anchored = Date.now();
    play.e2eSeconds = +((play.timings.anchored - play.timings.requested) / 1000).toFixed(1);
    console.log(`[receipt] ${play.id} anchored → ${explorerUrl} (e2e ${play.e2eSeconds}s)`);
  } catch (e) {
    play.status = 'verified'; // retry-able; unfunded wallet / RPC hiccup
    play.anchorError = String(e.message || e).slice(0, 300);
    console.log(`[receipt] ${play.id} anchor FAILED: ${play.anchorError}`);
  }
  plays.set(play.id, play);
  return play;
}

async function readBody(req, limit = 15 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const c of req) { size += c.length; if (size > limit) throw clientError(413, 'body too large'); chunks.push(c); }
  return Buffer.concat(chunks);
}

// #19: mark client-fault errors so the outer catch answers 4xx, never 500
const clientError = (status, message) => Object.assign(new Error(message), { clientError: status });

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(body);
}

// ---- ledger: cumulative splits across all plays ----
function ledger() {
  const acc = { label: {}, venue: {}, platform: 0, count: 0, totalTHB: 0, byLabel: {} };
  for (const p of Object.values(plays.data)) {
    if (!['anchored', 'verified', 'anchoring'].includes(p.status)) continue;
    const s = p.splits; const amt = p.amountTHB;
    acc.count++; acc.totalTHB += amt;
    acc.label[p.label] = (acc.label[p.label] || 0) + amt * s.label;
    acc.byLabel[p.label] = (acc.byLabel[p.label] || 0) + amt * s.label;
    acc.venue[p.venue] = (acc.venue[p.venue] || 0) + amt * s.venue;
    acc.platform += amt * s.platform;
  }
  const e2es = Object.values(plays.data).filter(p => p.e2eSeconds != null).map(p => p.e2eSeconds);
  return {
    plays: acc.count, totalTHB: +acc.totalTHB.toFixed(2),
    labelByParty: Object.fromEntries(Object.entries(acc.label).map(([k, v]) => [k, +v.toFixed(2)])),
    venueByParty: Object.fromEntries(Object.entries(acc.venue).map(([k, v]) => [k, +v.toFixed(2)])),
    platformTHB: +acc.platform.toFixed(2),
    avgE2ESeconds: e2es.length ? +(e2es.reduce((a, b) => a + b, 0) / e2es.length).toFixed(1) : null,
    maxE2ESeconds: e2es.length ? Math.max(...e2es) : null,
    hypothesis: { e2eUnder30s: e2es.length ? e2es.every(t => t <= 30) : null },
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    // ---------- static ----------
    if (!url.pathname.startsWith('/api/')) {
      let file = url.pathname === '/' ? '/index.html' : url.pathname;
      file = path.normalize(file).replace(/^(\.\.[/\\])+/, '');
      const full = path.join(PUBLIC_DIR, file);
      if (!full.startsWith(PUBLIC_DIR)) return json(res, 403, { error: 'forbidden' });
      if (!existsSync(full)) return json(res, 404, { error: 'not found' });
      const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.wav': 'audio/wav', '.png': 'image/png', '.svg': 'image/svg+xml' };
      res.writeHead(200, { 'Content-Type': types[path.extname(full)] || 'application/octet-stream' });
      res.end(await readFile(full));
      return;
    }

    // ---------- health / chain ----------
    if (url.pathname === '/api/health') return json(res, 200, { ok: true, chain: await chainStatus(), venue: VENUE_NAME, songs: catalog.length, fingerprints: Object.keys(fingerprints).length });
    if (url.pathname === '/api/catalog') return json(res, 200, { songs: catalog });

    // ---------- setlist ----------
    if (url.pathname === '/api/setlist' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString());
      const date = body.date || new Date().toISOString().slice(0, 10);
      const ids = (body.songIds || []).filter(i => byId[i]);
      setlists.set(date, ids);
      return json(res, 200, { date, songIds: ids, titles: ids.map(i => byId[i].title) });
    }
    if (url.pathname === '/api/setlist') {
      const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
      const ids = setlists.get(date, []);
      return json(res, 200, { date, songIds: ids, titles: ids.map(i => byId[i]?.title).filter(Boolean) });
    }

    // ---------- play flow ----------
    if (url.pathname === '/api/plays' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString());
      const song = byId[body.songId];
      if (!song) return json(res, 404, { error: 'song not found' });
      const mode = body.mode === 'acr' ? 'acr' : 'setlist';
      const play = newPlay(song, mode);
      const payload = promptPayPayload(process.env.PROMPTPAY_TARGET || '0800000000', song.priceTHB, play.ref);
      // self-check: CRC validates (proves payload integrity — real EMVCo format)
      const payloadNoCrc = payload.slice(0, -4);
      const crcOk = payload.slice(-4) === crc16(payloadNoCrc);
      return json(res, 201, { play, promptPay: { payload, crcValid: crcOk, amount: song.priceTHB }, qrDataURL: await QRCode.toDataURL(payload, { width: 320, margin: 1 }) });
    }

    if (url.pathname === '/api/plays/recent') {
      const recent = Object.values(plays.data).sort((a, b) => b.seq - a.seq).slice(0, 12);
      return json(res, 200, { plays: recent });
    }
    const m = url.pathname.match(/^\/api\/plays\/([a-z0-9-]+)(\/.*)?$/);
    if (m) {
      const play = plays.get(m[1]);
      if (!play) return json(res, 404, { error: 'play not found' });

      if (url.pathname.endsWith('/confirm-paid')) {
        // idempotent: already past payment → return current state (demo-safe double click)
        if (['paid', 'verified', 'anchoring', 'anchored'].includes(play.status)) {
          const stillSetlist = play.verifyMode === 'acr' && play.status === 'paid';
          return json(res, 200, { play, ...(stillSetlist ? { next: 'scan-audio' } : {}) });
        }
        if (play.status !== 'qr_pending') return json(res, 409, { error: `bad state ${play.status}` });
        play.status = 'paid';
        play.timings.paidConfirmed = Date.now();
        // PoC: payment simulated (PromptPay payload real, confirm button = simulate)
        // verify: setlist mode auto-verifies if song is on tonight's setlist
        const today = new Date().toISOString().slice(0, 10);
        const onSetlist = setlists.get(today, []).includes(play.songId);
        if (play.verifyMode === 'setlist') {
          if (onSetlist) {
            play.status = 'verified';
            play.verifyResult = { method: 'setlist', ok: true, detail: `อยู่ในเซ็ตลิสต์คืนนี้ (${today})` };
            play.timings.verified = Date.now();
            plays.set(play.id, play);
            anchorIfReady(play).then(() => {}); // async anchor
            return json(res, 200, { play: plays.get(play.id) });
          }
          return json(res, 409, { error: 'เพลงไม่อยู่ในเซ็ตลิสต์คืนนี้ — วงต้องลงทะเบียนเซ็ตลิสต์ล่วงหน้า', play });
        }
        // acr mode: wait for /verify/scan upload
        plays.set(play.id, play);
        return json(res, 200, { play, next: 'scan-audio' });
      }

      if (url.pathname.endsWith('/verify/scan')) {
        if (!['paid', 'qr_pending'].includes(play.status)) return json(res, 409, { error: `bad state ${play.status}` });
        const buf = await readBody(req);
        if (!buf.length) return json(res, 400, { error: 'no audio body' });
        const hash = sha256Buf(buf);
        const match = Object.entries(fingerprints).find(([, fp]) => fp === hash);
        play.status = 'paid';
        play.timings.paidConfirmed = play.timings.paidConfirmed || Date.now();
        if (match) {
          if (match[0] !== play.songId) {
            // licensing integrity: a fingerprint of a DIFFERENT song must not license this play (defect D2 fix)
            play.verifyResult = { method: 'audio-scan', ok: false, matchedSong: match[0], detail: `fingerprint matches ${match[0]}, not requested song ${play.songId} — play NOT licensed` };
            plays.set(play.id, play);
            return json(res, 409, { error: `fingerprint mismatch: scan matches ${match[0]}, play is for ${play.songId}`, play });
          }
          play.status = 'verified';
          play.verifyResult = { method: 'audio-scan (mock fingerprint)', ok: true, matchedSong: match[0], detail: 'fingerprint ตรงกับ catalog (PoC: ใช้ mock fingerprint — production ใช้ ACRCloud ~0.17฿/จับ)' };
          play.timings.verified = Date.now();
          plays.set(play.id, play);
          anchorIfReady(play).then(() => {});
          return json(res, 200, { play: plays.get(play.id) });
        }
        play.verifyResult = { method: 'audio-scan', ok: false, detail: 'ไม่พบ fingerprint ตรง — ถือว่า unlicensed (นี่คือประเด็นขาย: ระบบรู้ว่าเพลงไหนยังไม่ได้จ่าย)' };
        plays.set(play.id, play);
        return json(res, 200, { play });
      }

      if (url.pathname.endsWith('/retry-anchor')) return json(res, 200, { play: await anchorIfReady(plays.get(play.id)) });
      return json(res, 200, { play });
    }

    // ---------- ledger / stats ----------
    if (url.pathname === '/api/ledger') return json(res, 200, ledger());

    return json(res, 404, { error: 'no route' });
  } catch (e) {
    // #19: client faults answer 4xx, never 500 — oversized body → 413, malformed JSON → 400
    if (e && e.clientError) return json(res, e.clientError, { error: String(e.message || e) });
    if (e instanceof SyntaxError) return json(res, 400, { error: 'malformed JSON body' });
    return json(res, 500, { error: String(e.message || e) });
  }
});

// D4 guard: single instance per data directory — two servers sharing ${cwd}/data
// would clobber each other's whole-file writes (defect D4, qa/manual/runs/run-2026-11-25.md).
const LOCK_FILE = path.join(process.cwd(), 'data', '.server.lock');
mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
try {
  const prior = Number(readFileSync(LOCK_FILE, 'utf8').trim());
  if (prior && prior !== process.pid) {
    let alive = true;
    try { process.kill(prior, 0); } catch { alive = false; } // ESRCH → stale lock from a crashed server
    if (alive) {
      console.error(`ERROR: another PoC server (pid ${prior}) is already using this data directory (${path.join(process.cwd(), 'data')}). Refusing to start — stop it first or use a different working directory.`);
      process.exit(1);
    }
    console.error(`Stale lock found (pid ${prior} not running) — taking over.`);
  }
} catch { /* no lock file yet */ }
process.on('exit', () => { try { if (readFileSync(LOCK_FILE, 'utf8').trim() === String(process.pid)) unlinkSync(LOCK_FILE); } catch { /* already gone */ } });
writeFileSync(LOCK_FILE, String(process.pid));

server.listen(PORT, () => console.log(`PlayRight PoC → http://localhost:${PORT} · ${catalog.length} songs · ${Object.keys(fingerprints).length} fingerprints`));
