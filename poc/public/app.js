// PlayRight PoC SPA — hash routing: #/catalog #/pay/:id #/screen/:id #/dashboard #/setlist #/health
const app = document.getElementById('app');
const THB = n => `฿${(+n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
let mode = localStorage.getItem('mode') || 'setlist';
let lastPlay = localStorage.getItem('lastPlay');

async function api(path, opts) {
  const r = await fetch(`/api${path}`, opts);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}

const STATUS_TH = { qr_pending: 'รอชำระ', paid: 'ชำระแล้ว (รอ verify)', verified: 'ยืนยันเพลงแล้ว ✅', anchoring: '…กำลัง anchor บน chain', anchored: 'receipt บน chain ✅' };
const badge = s => `<span class="status s-${s}">${STATUS_TH[s] || s}</span>`;
const t = ms => ms ? new Date(ms).toLocaleTimeString('th-TH') : ''; // shared time formatter (was pageScreen-local → D1 ReferenceError in renderReceipt)

function route() {
  const h = location.hash || '#/catalog';
  if (h.startsWith('#/pay/')) return pagePay(h.split('/')[2]);
  if (h.startsWith('#/screen/')) return pageScreen(h.split('/')[2]);
  if (h.startsWith('#/dashboard')) return pageDashboard();
  if (h.startsWith('#/setlist')) return pageSetlist();
  if (h.startsWith('#/health')) return pageHealth();
  if (h.startsWith('#/catalog') || h === '#/' || h === '#' || h === '') return pageCatalog();
  return showNotFound(); // TC-12: unknown deep links no longer fall back to stale catalog content
}
window.addEventListener('hashchange', route);

// TC-12 fix: clear not-found state instead of leaving the previous page's DOM
function showNotFound(what) {
  app.innerHTML = `<div class="panel" style="max-width:480px;margin:40px auto;text-align:center">
    <div style="font-size:2rem">🔎</div>
    <h1 style="font-size:1.1rem;margin:10px 0">ไม่พบหน้าที่ต้องการ${what ? ` (${what})` : ''}</h1>
    <p class="muted">Not found — ลิงก์อาจผิด หรือรายการนี้ถูกลบ/ไม่มีอยู่แล้ว</p>
    <a href="#/catalog" style="display:inline-block;margin-top:10px">← กลับไปหน้าเพลง (catalog)</a>
  </div>`;
}

// ---------- 1. Song catalog ----------
async function pageCatalog() {
  app.innerHTML = `<h1>🎤 เลือกเพลงที่จะขอ</h1>
  <div id="perk"><p class="muted">กำลังเช็ค $PLAY…</p></div>
  <div class="modebar">
    <span class="muted">โหมด verify:</span>
    <button class="chip ${mode === 'setlist' ? 'on' : ''}" data-m="setlist">วงสด — เซ็ตลิสต์</button>
    <button class="chip ${mode === 'acr' ? 'on' : ''}" data-m="acr">DJ/ backing track — จับเสียงจริง (fingerprint)</button>
    <span class="muted">mock 100 เพลง GMM-Mock · ชำระต่อเพลง</span>
  </div>
  <div class="grid" id="songs"><p class="muted">กำลังโหลด catalog…</p></div>`;
  app.querySelectorAll('.chip').forEach(c => c.onclick = () => { mode = c.dataset.m; localStorage.setItem('mode', mode); pageCatalog(); });
  const { songs } = await api('/catalog');
  document.getElementById('songs').innerHTML = songs.map(s => `
    <div class="card" data-id="${s.id}">
      <div class="t">${s.title}</div>
      <div class="a">${s.artist} · ${s.label}</div>
      <div class="p">${THB(s.priceTHB)} <span class="muted" style="font-size:.75rem">/ เพลง · Mock THB (demo token)</span></div>
    </div>`).join('');
  app.querySelectorAll('.card').forEach(c => c.onclick = () => requestPlay(c.dataset.id));
  // coin-gated perk (one perk only): fan holds ≥N $PLAY → priority-queue slot
  api('/perk').then(k => {
    const el = document.getElementById('perk'); if (!el || k.configured === false) return;
    el.innerHTML = k.eligible
      ? `<div class="panel" style="border-color:var(--ok);padding:10px 14px;margin-bottom:12px">🎟 <b>Priority queue unlocked</b> — $PLAY holder · balance ${(+k.balance / 1e18).toLocaleString()} $PLAY <span class="muted">(demo token · OpenFour launch)</span></div>`
      : `<div class="panel" style="padding:10px 14px;margin-bottom:12px"><span class="muted">🎟 Priority queue: hold ≥ ${(+k.threshold / 1e18).toLocaleString()} $PLAY (demo token) — balance ${(k.balance ? (+k.balance / 1e18).toLocaleString() : 0)}</span></div>`;
  }).catch(() => {});
}

async function requestPlay(songId) {
  try {
    const j = await api('/plays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songId, mode }) });
    lastPlay = j.play.id; localStorage.setItem('lastPlay', lastPlay);
    location.hash = `#/pay/${j.play.id}`;
  } catch (e) { alert(e.message); }
}

// ---------- 2. PromptPay QR ----------
async function pagePay(id) {
  let play, promptPay, qrDataURL;
  try { ({ play, promptPay, qrDataURL } = await api(`/plays/${id}`)); }
  catch (e) { return showNotFound(`play #${id}`); } // TC-12: 404 → not-found state, not stale content
  document.title = `PlayRight — QR ชำระ ${play.title}`;
  app.innerHTML = `<h1>ชำระค่าลิขสิทธิ์เพลง <span class="muted">#${play.seq} · ${play.ref}</span></h1>
  <div class="panel qrbox" style="max-width:420px;margin:0 auto">
    <div class="t" style="font-weight:800;font-size:1.2rem">${play.title}</div>
    <div class="muted" style="margin:4px 0 14px">${play.artist} · ${play.label} · ${mode === play.verifyMode ? '' : play.verifyMode === 'setlist' ? 'วงสด' : 'DJ'}</div>
    <div style="font-size:2rem;font-weight:800;color:var(--ok)">${THB(play.amountTHB)}</div>
    <img src="${qrDataURL}" alt="PromptPay QR" width="270">
    <div class="muted" style="font-size:.75rem;margin-top:6px">PromptPay dynamic QR (EMVCo payload + CRC ✅) · ref ${play.ref}</div>
    <button class="paybtn" id="paid">ยืนยันชำระแล้ว ${THB(play.amountTHB)}</button>
    <div class="warn">PoC: QR เป็น payload PromptPay จริง (สแกนในแอปธนาคารเห็นร้าน+ยอด) — ชำระผ่าน Mock THB (demo token) บน BSC Testnet · แยกจริง 70/10/20 on-chain</div>
    <a class="muted" href="#/screen/${id}" style="display:block;margin-top:10px">→ ดูหน้าจอฉายหลังวง</a>
  </div>`;
  document.getElementById('paid').onclick = async () => {
    const b = document.getElementById('paid'); b.disabled = true; b.textContent = 'กำลังตรวจ…';
    try {
      const j = await api(`/plays/${id}/confirm-paid`, { method: 'POST' });
      if (['verified', 'anchoring', 'anchored'].includes(j.play.status)) {
        toast('✅ ยืนยันเพลงสำเร็จ — ไปหน้าจอฉาย');
        location.hash = `#/screen/${id}`;
      } else if (j.next === 'scan-audio') {
        b.textContent = '✅ ชำระแล้ว — รอ fingerprint จับเสียงจริง…';
        toast('DJ mode: ระบบรอสแกนเสียงจาก line-in (ทดสอบด้วยปุ่ม "จำลองจับเสียง" ด้านล่าง)');
        addScanButton(id);
      } else { b.disabled = false; b.textContent = 'ลองอีกครั้ง'; toast(j.error || 'ไม่ผ่าน'); }
    } catch (e) { b.disabled = false; b.textContent = 'ลองอีกครั้ง'; toast(e.message); }
  };
}

function addScanButton(id) {
  const box = document.createElement('div');
  box.style.marginTop = '10px';
  box.innerHTML = `<button class="paybtn" style="background:#334155" id="scanbtn">🎙 จำลองจับเสียง line-in (upload ไฟล์เสียงเพลงนี้)</button>
  <input type="file" id="audiofile" accept=".wav,audio/*" style="display:none">`;
  app.querySelector('.qrbox').appendChild(box);
  document.getElementById('scanbtn').onclick = () => document.getElementById('audiofile').click();
  document.getElementById('audiofile').onchange = async e => {
    const buf = await e.target.files[0].arrayBuffer();
    document.getElementById('scanbtn').textContent = 'กำลัง match fingerprint…';
    const j = await api(`/plays/${id}/verify/scan`, { method: 'POST', body: buf });
      if (['verified', 'anchoring', 'anchored'].includes(j.play.status)) { toast('✅ fingerprint match — เพลงถูกยืนยัน'); location.hash = `#/screen/${id}`; }
    else toast(j.play.verifyResult.detail);
  };
}

// ---------- 3. จอฉายหลังวง ----------
async function pageScreen(id) {
  let play;
  try { ({ play } = await api(`/plays/${id}`)); }
  catch (e) { return showNotFound(`play #${id}`); } // TC-12: 404 → not-found state, not stale content
  app.innerHTML = `<div class="screen">
    <div class="muted">จอฉายหลังวง · ${play.venue} · รายการ #${play.seq}</div>
    <div class="now">🎵 กำลังเล่น: ${play.title}</div>
    <div class="okline">ได้รับอนุญาตในการฉาย ✅ · ลิขสิทธิ์จ่ายแล้ว ${THB(play.amountTHB)}</div>
    <div style="margin-top:20px">${badge(play.status)}</div>
    <div class="meta" id="receipt"></div>
  </div>`;
  renderReceipt(play);
  const iv = setInterval(async () => {
    if (!location.hash.startsWith(`#/screen/${id}`)) return clearInterval(iv);
    const j = await api(`/plays/${id}`).catch(() => null);
    if (j) renderReceipt(j.play);
  }, 1500);
}

function renderReceipt(p) {
  const el = document.getElementById('receipt'); if (!el) return;
  let html = `${p.artist} · ${p.label} · verify: ${p.verifyResult?.method || p.verifyMode} · ขอเวลา ${t(p.timings.requested)}`;
  if (p.anchors && p.anchors.length > 1) {
    html += `<br><span class="muted">receipt on-chain (multi-chain):</span> ` +
      p.anchors.map(a => a.ok
        ? `<a class="txlink" target="_blank" href="${a.explorerUrl}">${a.txHash.slice(0, 10)}…${a.txHash.slice(-8)}</a> <span class="muted">(${a.chain})</span>`
        : `<span class="muted">(${a.chain}: pending funding)</span>`
      ).join(' · ');
  } else if (p.explorerUrl) html += `<br><span class="muted">receipt on-chain:</span> <a class="txlink" target="_blank" href="${p.explorerUrl}">${p.txHash.slice(0, 10)}…${p.txHash.slice(-8)}</a> <span class="muted">(BSC Testnet)</span>`;
  else if (p.anchorError) html += `<br><span class="warn">anchor รอ wallet เงินใน testnet: ${p.anchorError.slice(0, 80)}… <a href="#" onclick="fetch('/api/plays/${p.id}/retry-anchor',{method:'POST'}).then(()=>0);return false">retry</a></span>`;
  if (p.e2eSeconds != null) html += `<br><span class="muted">end-to-end ทั้ง flow: <b style="color:var(--txt)">${p.e2eSeconds}s</b> ${p.e2eSeconds <= 30 ? '✅ ตามสมมติฐาน ≤30s' : '⚠️ เกิน 30s'}</span>`;
  if (p.settlement) {
    const links = ['pullTx', 'labelTx', 'venueTx'].filter(k => p.settlement[k]).map(k => `<a class="txlink" target="_blank" href="${p.settlement.explorer}${p.settlement[k]}">${p.settlement[k].slice(0, 8)}…</a>`).join(' ');
    if (p.settlement.held) {
      html += `<br><span class="warn">⏸ conversion HELD by settlement-risk guard — payout funds held on platform ·</span> ${links}` +
        (p.settlement.guard ? `<br><span class="muted" style="font-size:.8rem">guard: ${p.settlement.guard.claim} @ ${p.settlement.guard.probability} (HOLD above ${(p.settlement.guard.holdAbove * 100).toFixed(0)}%)</span>` : '');
    } else {
      html += `<br><span class="muted">settled on-chain (${p.settlement.token}): ค่าย 70 / ร้าน 10 / แพลตฟอร์ม 20 ·</span> ${links}` +
        (p.settlement.note ? `<br><span class="warn" style="font-size:.8rem">${p.settlement.note}</span>` : '');
    }
  } else if (p.settlementError) html += `<br><span class="warn">settlement ยังไม่สำเร็จ: ${p.settlementError.slice(0, 90)}</span>`;
  el.innerHTML = html;
}

// ---------- 4. Dashboard split 3 ฝั่ง ----------
async function pageDashboard() {
  const { songs } = await api('/catalog');
  const songsById = Object.fromEntries(songs.map(s => [s.id, s]));
  const L = await api('/ledger');
  const { plays: recent } = await api('/plays/recent');
  const rows = recent;
  const partyRows = Object.entries(L.labelByParty).map(([k, v]) => `<tr><td>${k}</td><td>${THB(v)}</td></tr>`).join('') || '<tr><td colspan="2" class="muted">ยังไม่มีรายการ</td></tr>';
  const venueRows = Object.entries(L.venueByParty).map(([k, v]) => `<tr><td>${k}</td><td>${THB(v)}</td></tr>`).join('') || '<tr><td colspan="2" class="muted">ยังไม่มีรายการ</td></tr>';
  const pct = (v, t) => `${((v / t) * 100).toFixed(0)}%`;
  app.innerHTML = `<h1>📊 Split Dashboard — ค่าย 70 / ร้าน 10 / แพลตฟอร์ม 20</h1>
  <div class="kpi">
    <div class="k"><div class="muted">plays ยืนยันแล้ว</div><div class="n">${L.plays}</div></div>
    <div class="k"><div class="muted">รายได้รวม</div><div class="n">${THB(L.totalTHB)}</div></div>
    <div class="k"><div class="muted">avg end-to-end</div><div class="n">${L.avgE2ESeconds ?? '—'}s</div><div class="muted">${L.hypothesis.e2eUnder30s === true ? '✅ ทุก play ≤30s' : L.hypothesis.e2eUnder30s === null ? '' : '⚠️ มี play เกิน 30s (max ' + L.maxE2ESeconds + 's)'}</div></div>
    <div class="k"><div class="muted">chain</div><div class="n" style="font-size:1rem" id="chaininfo">…</div></div>
  </div>
  <div class="panel"><h2>สัดส่วนจากทั้งหมด</h2>
    <div class="bar"><i style="width:70%;background:var(--acc)"></i><i style="width:10%;background:var(--ok)"></i><i style="width:20%;background:var(--warn)"></i></div>
    <table><tr><th>ฝั่ง</th><th>%</th><th>ยอดสะสม</th></tr>
      <tr><td>ค่าย (licensor)</td><td>70%</td><td>${THB(L.totalTHB * 0.7)}</td></tr>
      <tr><td>ร้าน/ผับ (venue share)</td><td>10%</td><td>${THB(L.totalTHB * 0.1)}</td></tr>
      <tr><td>แพลตฟอร์ม PlayRight</td><td>20%</td><td>${THB(L.totalTHB * 0.2)}</td></tr></table>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div class="panel"><h2>ค่าย — รับตาม catalog</h2><table>${partyRows}</table></div>
    <div class="panel"><h2>ร้าน — venue share</h2><table>${venueRows}</table></div>
  </div>
  <div class="panel" id="bondpanel"><h2>🏦 Venue bond — VenueStake <span class="tag" style="font-size:.7rem">slash authority: admin (demo)</span></h2><p class="muted">กำลังอ่านสถานะ bond…</p></div>
  <div class="panel" id="guardpanel"><h2>🛡 Settlement-risk guard — royalty conversion <span class="muted" style="font-size:.75rem">Cournot Intelligence Oracle (live · demo)</span></h2><p class="muted">กำลังเรียก oracle…</p></div>
  <div class="panel"><h2>รายการล่าสุด</h2>
    <table><tr><th>#</th><th>เพลง</th><th>ยอด</th><th>สถานะ</th><th>e2e</th><th>receipt</th></tr>
    ${rows.map(p => `<tr><td>${p.seq}</td><td>${p.title} <span class="muted" style="font-size:.8rem">(${(songsById[p.songId] || {}).artist || ''})</span></td><td>${THB(p.amountTHB)}</td><td>${badge(p.status)}</td><td>${p.e2eSeconds != null ? p.e2eSeconds + 's' : '—'}</td><td>${p.explorerUrl ? `<a class="txlink" target="_blank" href="${p.explorerUrl}">tx ↗</a>` : '—'}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">ยังไม่มีรายการ — ไปหน้า 🎤 ขอเพลงเพื่อเริ่ม</td></tr>'}
    </table></div>`;
  api('/health').then(h => {
    const el = document.getElementById('chaininfo'); if (!el) return;
    el.innerHTML = h.chain.funded ? `✅ BSC Testnet <span class="muted">block ${h.chain.blockNumber}</span>` : h.chain.error ? '⚠️ RPC error' : h.chain.configured ? `⚠️ wallet ${h.chain.address} ยังไม่มีเงิน testnet` : 'ยังไม่ configure wallet';
  });
  // venue bond status: gate state from /api/health + VenueStake address from /api/health.chain
  api('/health').then(h => {
    const el = document.getElementById('bondpanel'); if (!el) return;
    const g = h.venueGate || {};
    el.innerHTML = `<h2>🏦 Venue bond — VenueStake <span class="tag" style="font-size:.7rem">slash authority: admin (demo)</span></h2>
    <p>membership gate: <b style="${g.member === false ? 'color:var(--warn)' : 'color:var(--ok)'}">${g.gated === false ? 'disabled (not configured)' : g.member ? '✅ bonded — venue may sell plays' : g.rpcError ? '⚠️ RPC read failed — failing open this request' : '⛔ not bonded — plays refused (402)'}</b></p>
    <p class="muted" style="font-size:.8rem">A venue must stake a bond before it can sell plays; proven fake plays are slashed to the protocol treasury. Demo slashing is executed by the admin key; production moves to dispute review + multisig.</p>
    ${g.gated === false ? '<p class="muted">set VENUE_STAKE_ADDRESS in poc/.env to enable the gate</p>' : ''}`;
  }).catch(() => {});
  // settlement-risk guard: live Cournot oracle probability drives the royalty-conversion decision
  api('/guard').then(g => {
    const el = document.getElementById('guardpanel'); if (!el || g.configured === false) return;
    if (g.decision === 'UNAVAILABLE') {
      el.innerHTML = `<h2>🛡 Settlement-risk guard <span class="muted" style="font-size:.75rem">fallback (demo)</span></h2>
      <p class="warn">Oracle unavailable (${(g.error || g.httpStatus || 'no response')} — free call quota on this IP may be spent). Fallback per pre-agreed rule: conversion <b>PROCEED</b>, admin-gated. Proof of last live call: <code>cournot-last-call.json</code></p>`;
      return;
    }
    const pctProb = g.probability != null ? `${(g.probability * 100).toFixed(2)}%` : '—';
    const basis = Array.isArray(g.basis) ? g.basis.slice(0, 3).map(b => `<li>${b.source}: ${(b.summary || '').slice(0, 110)}… ${b.url ? `<a class="txlink" target="_blank" href="${b.url}">source ↗</a>` : ''}</li>`).join('') : '';
    el.innerHTML = `<h2>🛡 Settlement-risk guard — royalty conversion <span class="muted" style="font-size:.75rem">Cournot Intelligence Oracle (live · demo)</span></h2>
    <p><b>Claim checked:</b> ${g.claim} ${g.claimScope ? `<span class="muted" style="font-size:.8rem">(${g.claimScope})</span>` : ''}</p>
    <p>Probability: <b>${pctProb}</b> (HOLD above ${(g.holdAbove * 100).toFixed(0)}%) → decision:
      <b style="${g.decision === 'HOLD' ? 'color:var(--warn)' : 'color:var(--ok)'}">${g.decision === 'HOLD' ? '⏸ HOLD — pause royalty conversion' : '✅ PROCEED — convert settled royalties'}</b></p>
    ${basis ? `<p class="muted" style="margin-bottom:4px">Evidence (oracle basis):</p><ul style="margin:0 0 6px 18px;font-size:.85rem">${basis}</ul>` : ''}
    <p class="muted" style="font-size:.8rem">checked ${g.checkedAt} · quota ${g.quota ? `${g.quota.remaining}/${g.quota.total} free calls left on this IP` : '—'} · proof: cournot-last-call.json</p>`;
  }).catch(() => {});
}

// ---------- 5. Setlist admin ----------
async function pageSetlist() {
  const { songs } = await api('/catalog');
  app.innerHTML = `<h1>📋 เซ็ตลิสต์คืนนี้ (โหมดวงสด)</h1>
  <p class="muted">วงลงทะเบียนเพลงล่วงหน้า → ลูกค้าขอเพลงที่อยู่ในเซ็ตลิสต์ = verified ทันที (fingerprint วงสดแม่นแค่ ~87% — เลี่ยงตาม POC-SPEC)</p>
  <div class="panel"><h2>เลือกเพลง (ค้นได้)</h2>
  <input id="q" placeholder="ค้นชื่อเพลง/ศิลปิน…" style="width:100%;margin-bottom:10px">
  <div class="grid" id="list"></div></div>
  <button class="paybtn" id="save" style="max-width:420px">บันทึกเซ็ตลิสต์คืนนี้ (<span id="cnt">0</span> เพลง)</button>
  <div id="saved" class="muted" style="margin-top:10px"></div>`;
  const picked = new Set();
  const render = () => {
    const q = document.getElementById('q').value.toLowerCase();
    document.getElementById('list').innerHTML = songs.filter(s => `${s.title} ${s.artist}`.toLowerCase().includes(q)).map(s => `
      <div class="card ${picked.has(s.id) ? '' : ''}" data-id="${s.id}" style="${picked.has(s.id) ? 'border-color:var(--ok)' : ''}">
        <div class="t">${s.title}</div><div class="a">${s.artist}</div><div class="p" style="font-size:.85rem">${picked.has(s.id) ? '✅ อยู่ในเซ็ตลิสต์' : THB(s.priceTHB)}</div>
      </div>`).join('');
    document.getElementById('cnt').textContent = picked.size;
    app.querySelectorAll('#list .card').forEach(c => c.onclick = () => { const id = c.dataset.id; picked.has(id) ? picked.delete(id) : picked.add(id); render(); });
  };
  document.getElementById('q').oninput = render; render();
  const { songIds } = await api('/setlist');
  songIds.forEach(i => picked.add(i)); render();
  document.getElementById('save').onclick = async () => {
    const j = await api('/setlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songIds: [...picked] }) });
    document.getElementById('saved').textContent = `✅ บันทึกแล้ว (${j.songIds.length} เพลง)`;
    toast('เซ็ตลิสต์บันทึกแล้ว — ลูกค้าขอเพลงจากลิสต์นี้จะ verified ทันที');
  };
}

// ---------- health ----------
async function pageHealth() {
  const h = await api('/health');
  app.innerHTML = `<h1>🔧 System</h1><div class="panel"><pre style="white-space:pre-wrap;font-size:.85rem">${JSON.stringify(h, null, 2)}</pre></div>`;
}

let toastEl;
function toast(msg) {
  toastEl = toastEl || Object.assign(document.createElement('div'), { className: 'toast' });
  toastEl.textContent = msg; document.body.appendChild(toastEl); toastEl.style.display = 'block';
  clearTimeout(toast._t); toast._t = setTimeout(() => toastEl.style.display = 'none', 3500);
}

// chain status dot
api('/health').then(h => { if (h.chain.funded) document.getElementById('chaindot').classList.add('ok'); }).catch(() => {});
if (location.hash.startsWith('#/screen/') && !lastPlay) {} // direct link OK
route();
