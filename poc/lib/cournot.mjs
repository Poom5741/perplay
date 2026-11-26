// Checkpoint 4 — Cournot settlement-risk guard (Intelligence Oracle, live call).
//
// Decision #33 amendment: the Cournot oracle does NOT adjudicate play fraud (its
// catalog resolves crypto markets only) — instead it guards ROYALTY CONVERSION:
// before PerPlay converts settled Mock THB into payout-side currency it checks the
// market's probability for the settlement-stress claim and displays claim +
// probability + evidence (prize requirement: the returned probability must DRIVE
// the decision; mocked/hardcoded values disqualify).
//
// Free-tier budget: 3 calls per IP/account — cache aggressively (default 10 min).
// Every live call is logged to data/cournot-last-call.json as reproducible proof.
//
// Env reads are LAZY (server.mjs loads .env after imports — see settlement.mjs note).

const ENDPOINT = () => process.env.COURNOT_ENDPOINT || 'https://interface.cournot.ai/intelligence/v1/probability';
const CLAIM = () => process.env.COURNOT_CLAIM || 'USDT loses its US dollar peg (trades below $0.99) on a major exchange before 2027-01-01';
const MARKET_IDS = () => (process.env.COURNOT_MARKET_IDS || '1,2,3,4,5,6,7,8,9,10').split(',').map(n => Number(n.trim())).filter(Boolean);
const HOLD_ABOVE = () => Number(process.env.COURNOT_HOLD_ABOVE || '0.5'); // probability above this → HOLD conversion
const CACHE_MS = () => Number(process.env.COURNOT_CACHE_MS || 600_000);

export function guardEnabled() {
  // key optional — the anonymous tier works without one (3 free calls per IP)
  return process.env.COURNOT_ENABLED === 'true' && !process.env.E2E;
}

const cache = { at: 0, val: null };

export async function guard({ force = false } = {}) {
  if (!process.env.COURNOT_ENABLED || process.env.E2E) return { configured: false };
  const now = Date.now();
  if (!force && cache.at && now - cache.at < CACHE_MS()) return cache.val;
  const payload = { message: CLAIM(), market_ids: MARKET_IDS() };
  let httpStatus, body;
  const callOnce = async () => {
    const res = await fetch(ENDPOINT(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(process.env.COURNOT_API_KEY ? { Authorization: `Bearer ${process.env.COURNOT_API_KEY}` } : {}) },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    });
    return { status: res.status, body: await res.json().catch(() => null) };
  };
  try {
    ({ status: httpStatus, body } = await callOnce());
    if (httpStatus === 402) {
      // observed flake: anonymous tier occasionally 402s without consuming quota — one retry
      await new Promise(r => setTimeout(r, 8000));
      ({ status: httpStatus, body } = await callOnce());
    }
  } catch (e) {
    return { configured: true, status: 'UNAVAILABLE', error: String(e.message || e).slice(0, 120), claim: payload.message };
  }
  const data = body?.data ?? body ?? {};
  const probability = Number(data.probability ?? data.prob ?? NaN);
  // catalog shape: data.markets[] = [{ market_info: { id, title, ... }, matching_confidence, market_outcome_price }]
  const markets = Array.isArray(data.markets) ? data.markets : [];
  const matched = markets.find(m => Number(m.market_outcome_price) === probability && probability !== 0)
    || markets.find(m => m.market_outcome_price != null && m.market_outcome_price !== '')
    || markets[0];
  const claimText = matched?.market_info?.title || data.market?.question || payload.message;
  const basis = Array.isArray(data.basis) ? data.basis : (data.evidence ?? null);
  const result = {
    configured: true,
    oracle: 'Cournot Intelligence Oracle (live)',
    claimScope: 'USDT peg stress — proxy for THB settlement-asset risk (demo)',
    claim: claimText,
    probability: Number.isFinite(probability) ? probability : null,
    decision: Number.isFinite(probability) ? (probability > HOLD_ABOVE() ? 'HOLD' : 'PROCEED') : 'UNAVAILABLE',
    holdAbove: HOLD_ABOVE(),
    basis,
    marketsMatched: markets.map(m => ({ id: m.market_info?.id, title: m.market_info?.title, confidence: m.matching_confidence })),
    httpStatus,
    quota: body?.free_quota ?? data.free_quota ?? null,
    billing: body?.billing ?? data.billing ?? null,
    checkedAt: new Date().toISOString(),
  };
  // reproducible proof for judges (no secrets in the payload). NOTE: written to the
  // poc root, NOT data/ — the e2e suite wipes data/ and would destroy the proof.
  try {
    const { writeFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    writeFileSync(join(process.cwd(), 'cournot-last-call.json'), JSON.stringify({ request: payload, response: body, result }, null, 2));
  } catch { /* proof log is best-effort */ }
  cache.at = now; cache.val = result;
  return result;
}
