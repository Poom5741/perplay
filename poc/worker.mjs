// Cloudflare Workers port of the PerPlay venue demo (poc/server.mjs parity).
// Same routes, same lib modules (catalog / promptpay / chain / settlement / cournot) —
// differences: KV replaces the JSON-file store, Cloudflare Assets serve the static
// frontend, and fire-and-forget work (settlement + anchoring) runs under ctx.waitUntil.
// Env (wrangler vars/secrets) = the same names poc/.env uses, so one .env maps to both.
import { randomUUID } from 'node:crypto';
import { DurableObject } from 'cloudflare:workers';
import QRCode from 'qrcode';
import { buildCatalog, sha256Buf } from './lib/catalog.mjs';
import { promptPayPayload, crc16 } from './lib/promptpay.mjs';
import { initChain, chainStatus, anchorReceipt } from './lib/chain.mjs';
import { settlePlay, perk } from './lib/settlement.mjs';
import { guard } from './lib/cournot.mjs';
import { createPublicClient, http as httpTransport } from 'viem';
import { bscTestnet } from 'viem/chains';
import fingerprints from './worker/fingerprints.json';

const VENUE_NAME = process.env.VENUE_NAME || 'ผับ Demo (Bangkok)';
const catalog = buildCatalog(100);
const byId = Object.fromEntries(catalog.map(s => [s.id, s]));

// ---------- Durable Object store (strongly consistent — KV's edge cache can serve
// stale "not found" for up to 60s after a write, which breaks receipt polling) ----------
export class PlayDO extends DurableObject {
  async kvGet(name) { return (await this.ctx.storage.get(name)) ?? null; }
  async kvPut(name, value) { await this.ctx.storage.put(name, value); return true; }
}

class KVStore {
  constructor(env, name) { this.stub = env.PLAY_DO.get(env.PLAY_DO.idFromName('demo')); this.name = name; this.data = null; }
  async load() {
    if (this.data !== null) return this;
    const raw = await this.stub.kvGet(this.name);
    if (raw) { this.data = JSON.parse(raw); return this; }
    this.data = this.name === 'setlists'
      ? { [new Date().toISOString().slice(0, 10)]: ['S001', 'S005', 'S042'] } // demo setlist pre-registered
      : {};
    await this.flush();
    return this;
  }
  async flush() { await this.stub.kvPut(this.name, JSON.stringify(this.data)); }
  get(k, dflt) { return this.data[k] ?? dflt; }
  async set(k, v) { this.data[k] = v; await this.flush(); return v; }
}

// ---------- venue membership gate (parity with server.mjs, 15s in-isolate cache) ----------
const VENUE_STAKE = process.env.VENUE_STAKE_ADDRESS;
const VENUE_WALLET = process.env.VENUE_WALLET_ADDRESS;
const GATE_ABI = [{ name: 'isMember', type: 'function', stateMutability: 'view', inputs: [{ name: 'venue', type: 'address' }], outputs: [{ type: 'bool' }] }];
const gateClient = createPublicClient({ chain: bscTestnet, transport: httpTransport(process.env.BSC_RPC_URL || 'https://bsc-testnet.publicnode.com') });
const gateCache = { ok: null, at: 0 };
async function venueIsMember() {
  if (!VENUE_STAKE || !VENUE_WALLET) return { gated: false, member: null };
  const now = Date.now();
  if (gateCache.at && now - gateCache.at < 15_000) return { gated: true, member: gateCache.ok };
  let member;
  try {
    member = await gateClient.readContract({ address: VENUE_STAKE, abi: GATE_ABI, functionName: 'isMember', args: [VENUE_WALLET] });
  } catch {
    return { gated: true, member: null, rpcError: true }; // fail open (demo resilience, same as node server)
  }
  gateCache.ok = member; gateCache.at = now;
  return { gated: true, member };
}

const chain = initChain();

// ---------- helpers ----------
const json = (code, obj) => new Response(JSON.stringify(obj), { status: code, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' } });

async function settleVerified(ctx, plays, play) {
  const p = ctx === null ? play : null; // no-op guard for readability
  try {
    const s = await settlePlay(play.amountTHB);
    if (s) { const cur = await plays.get(play.id); if (cur) { cur.settlement = s; await plays.set(play.id, cur); } }
  } catch (e) {
    const cur = await plays.get(play.id);
    if (cur) { cur.settlementError = String(e.message || e).slice(0, 140); await plays.set(play.id, cur); }
  }
}

async function anchorIfReady(ctx, plays, play) {
  if (play.status !== 'verified') return play;
  play.status = 'anchoring';
  await plays.set(play.id, play);
  try {
    const { txHash, explorerUrl, anchors } = await anchorReceipt(play);
    play.txHash = txHash; play.explorerUrl = explorerUrl; play.anchors = anchors;
    delete play.anchorError;
    play.status = 'anchored';
    play.timings.anchored = Date.now();
    play.e2eSeconds = +((play.timings.anchored - play.timings.requested) / 1000).toFixed(1);
  } catch (e) {
    play.status = 'verified'; // retry-able
    play.anchorError = String(e.message || e).slice(0, 300);
  }
  await plays.set(play.id, play);
  return play;
}

function ledger(plays) {
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

// ---------- worker entry ----------
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req); // static SPA via Assets binding

    const plays = await new KVStore(env, 'plays').load();
    const setlists = await new KVStore(env, 'setlists').load();

    try {
      if (url.pathname === '/api/perk') return json(200, await perk());
      if (url.pathname === '/api/guard') return json(200, await guard({ force: url.searchParams.get('refresh') === '1' }));
      if (url.pathname === '/api/health') return json(200, { ok: true, chain: await chainStatus(), venue: VENUE_NAME, songs: catalog.length, fingerprints: Object.keys(fingerprints).length, venueGate: await venueIsMember(), runtime: 'cloudflare-worker' });
      if (url.pathname === '/api/catalog') return json(200, { songs: catalog });

      // ---------- setlist ----------
      if (url.pathname === '/api/setlist' && req.method === 'POST') {
        const body = await req.json();
        const date = body.date || new Date().toISOString().slice(0, 10);
        const ids = (body.songIds || []).filter(i => byId[i]);
        await setlists.set(date, ids);
        return json(200, { date, songIds: ids, titles: ids.map(i => byId[i].title) });
      }
      if (url.pathname === '/api/setlist') {
        const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
        const ids = setlists.get(date, []);
        return json(200, { date, songIds: ids, titles: ids.map(i => byId[i]?.title).filter(Boolean) });
      }

      // ---------- play flow ----------
      if (url.pathname === '/api/plays' && req.method === 'POST') {
        const body = await req.json();
        const song = byId[body.songId];
        if (!song) return json(404, { error: 'song not found' });
        const gate = await venueIsMember();
        if (gate.gated && !gate.member) {
          return json(402, { error: 'venue stake required — this venue has no bond in VenueStake (stake first; slash authority: admin, demo)', gate: 'VenueStake' });
        }
        const mode = body.mode === 'acr' ? 'acr' : 'setlist';
        const id = randomUUID().slice(0, 8);
        const ref = `PR${Date.now().toString(36).toUpperCase()}${id.slice(0, 3).toUpperCase()}`;
        const play = {
          id, seq: Object.keys(plays.data).length, ref,
          songId: song.id, title: song.title, artist: song.artist, label: song.label,
          venue: VENUE_NAME,
          amountTHB: song.priceTHB, splits: song.splits, verifyMode: mode,
          status: 'qr_pending',
          timings: { requested: Date.now() },
          createdAt: new Date().toISOString(),
        };
        await plays.set(id, play);
        const payload = promptPayPayload(process.env.PROMPTPAY_TARGET || '0800000000', song.priceTHB, play.ref);
        const crcOk = payload.slice(-4) === crc16(payload.slice(0, -4));
        // qrcode's svg renderer avoids pngjs — an SVG data URL renders in the same <img>
        const svg = await QRCode.toString(payload, { type: 'svg', width: 320, margin: 1 });
        const qrDataURL = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
        return json(201, { play, promptPay: { payload, crcValid: crcOk, amount: song.priceTHB }, qrDataURL });
      }

      if (url.pathname === '/api/plays/recent') {
        const recent = Object.values(plays.data).sort((a, b) => b.seq - a.seq).slice(0, 12);
        return json(200, { plays: recent });
      }

      const m = url.pathname.match(/^\/api\/plays\/([a-z0-9-]+)(\/.*)?$/);
      if (m) {
        let play = plays.get(m[1]);
        if (!play) return json(404, { error: 'play not found' });

        if (url.pathname.endsWith('/confirm-paid')) {
          if (['paid', 'verified', 'anchoring', 'anchored'].includes(play.status)) {
            const stillSetlist = play.verifyMode === 'acr' && play.status === 'paid';
            return json(200, { play, ...(stillSetlist ? { next: 'scan-audio' } : {}) });
          }
          if (play.status !== 'qr_pending') return json(409, { error: `bad state ${play.status}` });
          play.status = 'paid';
          play.timings.paidConfirmed = Date.now();
          const today = new Date().toISOString().slice(0, 10);
          const onSetlist = setlists.get(today, []).includes(play.songId);
          if (play.verifyMode === 'setlist') {
            if (onSetlist) {
              play.status = 'verified';
              play.verifyResult = { method: 'setlist', ok: true, detail: `อยู่ในเซ็ตลิสต์คืนนี้ (${today})` };
              play.timings.verified = Date.now();
              await plays.set(play.id, play);
              ctx.waitUntil(settleVerified(null, plays, play));
              ctx.waitUntil(anchorIfReady(ctx, plays, { ...play }));
              return json(200, { play: plays.get(play.id) });
            }
            return json(409, { error: 'เพลงไม่อยู่ในเซ็ตลิสต์คืนนี้ — วงต้องลงทะเบียนเซ็ตลิสต์ล่วงหน้า', play });
          }
          await plays.set(play.id, play);
          return json(200, { play, next: 'scan-audio' });
        }

        if (url.pathname.endsWith('/verify/scan')) {
          if (!['paid', 'qr_pending'].includes(play.status)) return json(409, { error: `bad state ${play.status}` });
          const buf = new Uint8Array(await req.arrayBuffer());
          if (!buf.length) return json(400, { error: 'no audio body' });
          if (buf.length > 15 * 1024 * 1024) return json(413, { error: 'body too large' });
          const hash = sha256Buf(Buffer.from(buf));
          const match = Object.entries(fingerprints).find(([, fp]) => fp === hash);
          play.status = 'paid';
          play.timings.paidConfirmed = play.timings.paidConfirmed || Date.now();
          if (match) {
            if (match[0] !== play.songId) {
              play.verifyResult = { method: 'audio-scan', ok: false, matchedSong: match[0], detail: `fingerprint matches ${match[0]}, not requested song ${play.songId} — play NOT licensed` };
              await plays.set(play.id, play);
              return json(409, { error: `fingerprint mismatch: scan matches ${match[0]}, play is for ${play.songId}`, play });
            }
            play.status = 'verified';
            play.verifyResult = { method: 'audio-scan (mock fingerprint)', ok: true, matchedSong: match[0], detail: 'fingerprint matched catalog (PoC: mock fingerprint — production uses ACRCloud ~0.17฿/detection)' };
            play.timings.verified = Date.now();
            await plays.set(play.id, play);
            ctx.waitUntil(settleVerified(null, plays, play));
            ctx.waitUntil(anchorIfReady(ctx, plays, { ...play }));
            return json(200, { play: plays.get(play.id) });
          }
          play.verifyResult = { method: 'audio-scan', ok: false, detail: 'no fingerprint match — treated as unlicensed (the sales point: the system knows which song was never paid for)' };
          await plays.set(play.id, play);
          return json(200, { play });
        }

        if (url.pathname.endsWith('/retry-anchor')) {
          play = await anchorIfReady(ctx, plays, play);
          return json(200, { play });
        }
        return json(200, { play });
      }

      // ---------- ledger / stats ----------
      if (url.pathname === '/api/ledger') return json(200, ledger(plays));

      return json(404, { error: 'no route' });
    } catch (e) {
      if (e instanceof SyntaxError) return json(400, { error: 'malformed JSON body' });
      return json(500, { error: String(e.message || e) });
    }
  },
};
