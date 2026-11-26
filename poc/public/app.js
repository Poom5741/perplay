// PerPlay PoC SPA — "Print desk" rebuild (design-explore/variant-d1)
// Hash routing: #/catalog #/pay/:id #/screen/:id #/dashboard #/setlist #/health
const app = document.getElementById('app');
const THB = n => `฿${(+n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
let mode = localStorage.getItem('mode') || 'setlist';
let lastPlay = localStorage.getItem('lastPlay');

async function api(path, opts) {
  const r = await fetch(`/api${path}`, opts);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}

const STATUS_EN = { qr_pending: 'awaiting payment', paid: 'paid — verifying', verified: 'verified ✓', anchoring: 'anchoring on-chain…', anchored: 'anchored on-chain ✓' };
const badge = s => `<span class="status s-${s}">${STATUS_EN[s] || s}</span>`;
const t = ms => ms ? new Date(ms).toLocaleTimeString('en-US') : ''; // shared time formatter (was pageScreen-local → D1 ReferenceError in renderReceipt)

// decorative ring stamp (rotated print object)
const stampSVG = (top, bottom) => {
  const arcId = 'arc' + Math.random().toString(36).slice(2, 8);
  return `<svg viewBox="0 0 120 120" aria-hidden="true">
  <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width="3"/>
  <circle cx="60" cy="60" r="41" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path id="${arcId}" d="M60 60 m-48 0 a48 48 0 1 1 96 0" fill="none"/>
  <text><textPath href="#${arcId}" startOffset="50%" text-anchor="middle">${top}</textPath></text>
  <g transform="rotate(180 60 60)"><text><textPath href="#${arcId}" startOffset="50%" text-anchor="middle">${bottom}</textPath></text></g>
  <rect x="53" y="53" width="14" height="14" transform="rotate(45 60 60)" fill="currentColor"/>
</svg>`; };

// licensed-play split — fixed by design (one-pager: label 70 / venue 10 / platform 20)
const SPLIT = { label: 0.7, venue: 0.1, platform: 0.2 };

// brass fader bank: label 70 / venue 10 / platform 20
const faderBankSVG = (l, v, p) => `<svg class="fader-bank" viewBox="0 0 300 192" role="img" aria-label="Split fader bank: label 70 percent, venue 10 percent, platform 20 percent">
  <g stroke="#23262B" stroke-width="1.5" opacity=".75">
    <path d="M22 154h6M22 127.6h6M22 101.2h6M22 74.8h6M22 48.4h6M22 22h6"/>
    <path d="M122 154h6M122 127.6h6M122 101.2h6M122 74.8h6M122 48.4h6M122 22h6"/>
    <path d="M222 154h6M222 127.6h6M222 101.2h6M222 74.8h6M222 48.4h6M222 22h6"/>
  </g>
  <g fill="#FCFBF7" stroke="#23262B" stroke-width="2">
    <rect x="34" y="22" width="12" height="132" rx="2"/><rect x="134" y="22" width="12" height="132" rx="2"/><rect x="234" y="22" width="12" height="132" rx="2"/>
  </g>
  <g fill="#A87B2D" stroke="#23262B" stroke-width="2">
    <rect x="23" y="52.6" width="34" height="18" rx="3"/><rect x="123" y="131.8" width="34" height="18" rx="3"/><rect x="223" y="118.6" width="34" height="18" rx="3"/>
  </g>
  <g fill="#F6F4EF"><rect x="30" y="60.1" width="20" height="3"/><rect x="130" y="139.3" width="20" height="3"/><rect x="230" y="126.1" width="20" height="3"/></g>
  <g font-family="IBM Plex Mono,monospace" font-size="13" font-weight="600" fill="#23262B"><text x="56" y="66">70</text><text x="156" y="145.3">10</text><text x="256" y="132.1">20</text></g>
  <g font-family="IBM Plex Mono,monospace" font-size="11" fill="#23262B" text-anchor="middle"><text x="40" y="182">label</text><text x="140" y="182">venue</text><text x="240" y="182">platform</text></g>
</svg>`;

function route() {
  const h = location.hash || '#/catalog';
  markNav(h);
  if (h.startsWith('#/pay/')) return pagePay(h.split('/')[2]);
  if (h.startsWith('#/screen/')) return pageScreen(h.split('/')[2]);
  if (h.startsWith('#/dashboard')) return pageDashboard();
  if (h.startsWith('#/setlist')) return pageSetlist();
  if (h.startsWith('#/health')) return pageHealth();
  if (h.startsWith('#/catalog') || h === '#/' || h === '#' || h === '') return pageCatalog();
  return showNotFound(); // TC-12: unknown deep links no longer fall back to stale catalog content
}
window.addEventListener('hashchange', route);

function markNav(h) {
  const key = h.startsWith('#/pay/') ? 'catalog' : h.startsWith('#/screen/') ? 'catalog' : h.replace(/^#\//, '').split('/')[0] || 'catalog';
  document.querySelectorAll('.site-nav a[data-route]').forEach(a => {
    if (a.dataset.route === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

// TC-12 fix: clear not-found state instead of leaving the previous page's DOM
function showNotFound(what) {
  app.innerHTML = `<div class="slip" style="max-width:480px;margin:40px auto;text-align:center;padding:34px;transform:rotate(-.5deg)">
    <p class="mono" style="font-size:2rem">404</p>
    <h1 style="font-size:1.2rem;margin:10px 0">Not found${what ? ` — ${what}` : ''}</h1>
    <p class="muted">The link may be wrong, or this record no longer exists.</p>
    <a class="btn small" style="margin-top:14px" href="#/catalog">← Back to the catalog</a>
  </div>`;
}

// ---------- 1. Song catalog ----------
async function pageCatalog() {
  document.title = 'PerPlay — catalog · demo on BSC Testnet';
  app.innerHTML = `
  <div class="page-head">
    <div>
      <h1>Order a play</h1>
      <p class="sub">Pick what the venue is playing right now — pay per play, receipt anchored on-chain.</p>
      <div class="venue-meta">
        <span class="chip"><i aria-hidden="true" style="width:8px;height:8px;background:#A87B2D;border:1.5px solid #23262B;border-radius:50%;flex:none"></i>Bangkok demo venue</span>
        <span class="chip" id="bondchip"><i aria-hidden="true" style="width:8px;height:8px;background:rgba(35,38,43,.3);flex:none"></i>checking bond…</span>
        <span class="chip" id="livechip" hidden><i aria-hidden="true"></i>live band on stage</span>
      </div>
    </div>
    <span class="cal-tag" aria-hidden="true">cal 70/10/20</span>
  </div>

  <div class="band perk" id="perk" style="margin-top:30px"><b>Checking $PLAY perk…</b></div>

  <p class="legend" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:18px;font-size:13.5px;color:rgba(35,38,43,.8)">
    <span class="chip" style="font-size:11px">Mock THB — demo token</span>
    <span>per-play pricing · pay per song</span>
  </p>

  <div class="grid">
    <div class="slip print-in" id="songwrap">
      <table>
        <caption id="songcap">tonight's playable songs — 100-song mock catalog (GMM-Mock)</caption>
        <thead><tr>
          <th scope="col">#</th><th scope="col">Song</th>
          <th scope="col" class="th-mode col-mode">Mode</th>
          <th scope="col" class="num">Price</th><th scope="col"><span class="visually-hidden">Order</span></th>
        </tr></thead>
        <tbody id="songs"><tr><td colspan="5" class="muted">loading catalog…</td></tr></tbody>
      </table>
      <div class="t-foot">
        <span class="sum" id="songcount"></span>
        <span class="chip">price in Mock THB — demo token</span>
      </div>
    </div>

    <aside class="rail" aria-label="Venue console">
      <div class="stamp" aria-hidden="true">${stampSVG('ON AIR', 'DEMO · CHAIN 97')}</div>
      <div class="slip console" style="transform:rotate(.6deg)">
        <p class="c-head"><i aria-hidden="true"></i>console — verify mode</p>
        <div class="sw" role="group" aria-label="Verify mode">
          <button type="button" data-m="setlist" aria-pressed="${mode === 'setlist'}">Live band</button>
          <button type="button" data-m="acr" aria-pressed="${mode === 'acr'}">DJ</button>
        </div>
        <p class="mode-desc" id="modeDesc">${mode === 'setlist' ? 'Live band — the song is checked against the band\u2019s registered setlist and verified instantly.' : 'DJ / backing track — the system verifies by audio fingerprint (mock scan upload).'}</p>
        <div class="rail-line"><span class="k">next in queue</span><span class="v mono">—</span></div>
        <div class="mini-meter" role="img" aria-label="queue depth meter"><div class="fill" style="width:30%"></div></div>
        <div class="bond-mini">
          <div class="rail-line" style="margin-top:0"><span class="k">venue bond</span><span class="v" id="railbond" style="color:rgba(35,38,43,.5)">…</span></div>
          <span class="chip" style="font-size:10.5px">slash authority: admin (demo)</span>
        </div>
      </div>
      <p style="font-size:12.5px;color:rgba(35,38,43,.65)">Unbonded venues cannot sell plays — the system refuses them with 402.</p>
    </aside>
  </div>`;
  app.querySelectorAll('.sw button').forEach(c => c.onclick = () => { mode = c.dataset.m; localStorage.setItem('mode', mode); pageCatalog(); });
  const { songs } = await api('/catalog');
  document.getElementById('songs').innerHTML = songs.map((s, i) => `
    <tr>
      <td class="mono">${String(i + 1).padStart(2, '0')}</td>
      <td class="song"><b>${s.title}</b><small style="display:block;font-size:12.5px;color:rgba(35,38,43,.65)">${s.artist} · ${s.label}</small></td>
      <td class="col-mode"><span class="mode-tag" style="display:inline-block;border:1.5px solid rgba(35,38,43,.5);font-family:var(--mono);font-size:10.5px;padding:1px 8px;border-radius:2px;color:rgba(35,38,43,.75)">${s.artist ? (i % 2 ? 'DJ' : 'live band') : ''}</span></td>
      <td class="num">${THB(s.priceTHB)}</td>
      <td><button class="order" data-id="${s.id}" aria-label="Order ${s.title}, ${THB(s.priceTHB)}">Order</button></td>
    </tr>`).join('');
  document.getElementById('songcap').textContent = `tonight's playable songs — 100-song mock catalog (GMM-Mock), pay per song`;
  document.getElementById('songcount').innerHTML = `${songs.length} songs tonight`;
  app.querySelectorAll('.order').forEach(b => b.onclick = () => requestPlay(b.dataset.id));
  // coin-gated perk (one perk only): fan holds ≥N $PLAY → priority-queue slot
  api('/perk').then(k => {
    const el = document.getElementById('perk'); if (!el || k.configured === false) return;
    el.innerHTML = k.eligible
      ? `<div><b>Priority queue unlocked — $PLAY holder</b><p>balance ${(+k.balance / 1e18).toLocaleString()} $PLAY <span class="tag-demo" style="margin-left:8px">demo token · OpenFour launch</span></p></div><span class="unlock">priority queue active</span>`
      : `<div><b>Priority queue: hold ≥ ${(+k.threshold / 1e18).toLocaleString()} $PLAY</b><p>balance ${(k.balance ? (+k.balance / 1e18).toLocaleString() : 0)} $PLAY <span class="tag-demo" style="margin-left:8px">demo token</span></p></div><span class="chip hold" style="background:transparent;color:rgba(246,244,239,.7);border-color:rgba(246,244,239,.5)">hold target not met</span>`;
    el.classList.toggle('eligible', !!k.eligible);
  }).catch(() => { const el = document.getElementById('perk'); if (el) el.remove(); });
  api('/health').then(h => {
    const g = h.venueGate || {};
    const chip = document.getElementById('bondchip'); if (!chip) return;
    const bonded = g.gated === false || g.member === true;
    chip.innerHTML = `<i aria-hidden="true" style="width:8px;height:8px;background:${bonded ? '#1E7B4F' : '#E85D4A'};flex:none"></i>bond: ${g.gated === false ? 'gate disabled' : g.member ? 'bonded' : g.rpcError ? 'rpc fail-open' : 'not bonded'}`;
    const rail = document.getElementById('railbond'); if (rail) { rail.textContent = g.gated === false ? 'gate off' : g.member ? 'bonded' : 'not bonded'; rail.style.color = bonded ? '#1E7B4F' : '#E85D4A'; }
    if (mode === 'setlist') { const lc = document.getElementById('livechip'); if (lc) lc.hidden = false; }
  }).catch(() => {});
}

async function requestPlay(songId) {
  try {
    const j = await api('/plays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songId, mode }) });
    lastPlay = j.play.id; localStorage.setItem('lastPlay', lastPlay);
    // GET /api/plays/:id does not return the QR — carry the POST's dataURL for the pay page
    try { sessionStorage.setItem('qr:' + j.play.id, j.qrDataURL); } catch { /* storage full — pay page falls back */ }
    location.hash = `#/pay/${j.play.id}`;
  } catch (e) { toast(e.message); }
}

// ---------- 2. PromptPay QR pay slip ----------
async function pagePay(id) {
  let play, qrDataURL;
  try { ({ play } = await api(`/plays/${id}`)); }
  catch (e) { return showNotFound(`play #${id}`); } // TC-12: 404 → not-found state, not stale content
  // the QR dataURL only comes with the POST /api/plays response — read it from sessionStorage
  qrDataURL = null;
  try { qrDataURL = sessionStorage.getItem('qr:' + id); } catch { /* storage unavailable */ }
  document.title = `PerPlay — pay ${THB(play.amountTHB)} for ${play.title}`;
  const modeNote = play.verifyMode === 'setlist' ? 'live band — setlist check' : 'DJ — audio fingerprint check';
  app.innerHTML = `
  <div class="page-head">
    <div>
      <h1>Play slip <span class="mono" style="font-size:.5em;font-weight:500">#${play.seq} · ${play.ref}</span></h1>
      <p class="sub">Scan the PromptPay QR to pay ${THB(play.amountTHB)} — then the venue verifies the play and the receipt is anchored on-chain.</p>
    </div>
    <span class="chip">${modeNote}</span>
  </div>

  <ol class="steps-done print-in">
    <li id="st-scan"><span>scan<small>table QR opened</small></span></li>
    <li id="st-pay"><span>pay<small>${THB(play.amountTHB)} via PromptPay (mock)</small></span></li>
    <li id="st-verify"><span>verify<small>${modeNote}</small></span></li>
    <li id="st-anchor"><span>anchor<small>receipt on BSC Testnet</small></span></li>
  </ol>

  <div class="pay-grid">
    <figure class="pay-fig">
      <div class="tile">
        ${qrDataURL
          ? `<img src="${qrDataURL}" alt="PromptPay QR — real EMVCo payload with amount ${THB(play.amountTHB)}, ref ${play.ref}" width="320">`
          : `<div style="background:var(--panel);border:1.5px dashed rgba(246,244,239,.7);padding:22px;color:var(--cream);font-family:var(--mono);font-size:13px;text-align:center">QR not carried to this deep link —<br><button class="btn small" id="reissue" style="margin-top:10px">issue a fresh QR for this song</button></div>`}
      </div>
      <div class="amount"><span class="a">${THB(play.amountTHB)}</span><span class="chip">Mock THB — demo token</span></div>
      <figcaption>${qrDataURL ? 'scannable PromptPay dynamic QR (EMVCo payload + CRC ✓) · ref ' + play.ref : 'no decorative QR shown — the real one is issued with the play'}</figcaption>
      <p class="pay-copy">PoC: the QR is a real PromptPay payload (a bank app shows the recipient + amount) — payment itself is simulated, settling in Mock THB (demo token) on BSC Testnet with a real 70/10/20 on-chain split.</p>
      <button class="btn" style="width:100%;margin-top:16px" id="paid">I have paid ${THB(play.amountTHB)}</button>
      <a class="mono" href="#/screen/${id}" style="display:block;margin-top:12px;font-size:13px">→ back-stage projection screen</a>
    </figure>

    <div class="receipt-col">
      <div class="stamp" aria-hidden="true">${stampSVG('AWAITING', 'PROMPTPAY · MOCK')}</div>
      <div class="receipt">
        <div class="r-head"><b>PerPlay</b><small>play slip — payment copy — Bangkok demo</small></div>
        <div class="r-meta"><span>slip no. ${play.ref}</span><span>${play.venue}</span></div>
        <div class="r-rows">
          <div class="r-row"><span>1× play — <span lang="th">${play.title}</span> (${play.artist})</span><span class="dots" aria-hidden="true"></span><span class="mono">${THB(play.amountTHB)}</span></div>
          <p class="r-note" id="verifynote">verify: ${modeNote} · requested ${t(play.timings.requested)}</p>
        </div>
        <p class="ins-label"><i aria-hidden="true"></i>split fader bank <span>— share of this play, mTHB</span></p>
        ${faderBankSVG()}
        <div class="r-split">
          <div class="r-row"><span>label — 70%</span><span class="dots" aria-hidden="true"></span><span class="mono">${THB(play.amountTHB * SPLIT.label)}</span></div>
          <div class="r-row"><span>venue — 10%</span><span class="dots" aria-hidden="true"></span><span class="mono">${THB(play.amountTHB * SPLIT.venue)}</span></div>
          <div class="r-row"><span>platform — 20%</span><span class="dots" aria-hidden="true"></span><span class="mono">${THB(play.amountTHB * SPLIT.platform)}</span></div>
        </div>
        <div class="r-foot"><span>anchor: BSC testnet 97</span><span>status: <span id="pstatus">${STATUS_EN[play.status] || play.status}</span></span></div>
      </div>
    </div>
  </div>`;
  const reissue = document.getElementById('reissue');
  if (reissue) reissue.onclick = async () => {
    reissue.disabled = true; reissue.textContent = 'issuing…';
    try {
      const j = await api('/plays', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songId: play.songId, mode: play.verifyMode }) });
      try { sessionStorage.setItem('qr:' + j.play.id, j.qrDataURL); } catch { /* ignore */ }
      location.hash = `#/pay/${j.play.id}`;
    } catch (e) { reissue.disabled = false; reissue.textContent = 'issue a fresh QR for this song'; toast(e.message); }
  };
  document.getElementById('paid').onclick = async () => {
    const b = document.getElementById('paid'); b.disabled = true; b.textContent = 'Verifying…';
    try {
      const j = await api(`/plays/${id}/confirm-paid`, { method: 'POST' });
      if (['verified', 'anchoring', 'anchored'].includes(j.play.status)) {
        document.getElementById('st-pay').classList.add('todo');
        toast('✓ Play verified — opening the projection screen');
        location.hash = `#/screen/${id}`;
      } else if (j.next === 'scan-audio') {
        b.textContent = '✓ Paid — waiting for the audio fingerprint…';
        document.getElementById('pstatus').textContent = 'paid — verifying';
        document.getElementById('st-verify').classList.add('todo');
        toast('DJ mode: the system waits for a line-in fingerprint scan — test it with the "simulate line-in scan" button below.');
        addScanButton(id);
      } else { b.disabled = false; b.textContent = 'Try again'; toast(j.error || 'Verification failed'); }
    } catch (e) { b.disabled = false; b.textContent = 'Try again'; toast(e.message); }
  };
}

function addScanButton(id) {
  const box = document.createElement('div');
  box.style.marginTop = '12px';
  box.innerHTML = `<button class="btn small" style="background:#4a3550" id="scanbtn">🎙 Simulate line-in scan (upload this song's audio file)</button>
  <input type="file" id="audiofile" accept=".wav,audio/*" style="display:none">`;
  app.querySelector('.pay-grid').appendChild(box);
  document.getElementById('scanbtn').onclick = () => document.getElementById('audiofile').click();
  document.getElementById('audiofile').onchange = async e => {
    const buf = await e.target.files[0].arrayBuffer();
    document.getElementById('scanbtn').textContent = 'Matching fingerprint…';
    const j = await api(`/plays/${id}/verify/scan`, { method: 'POST', body: buf });
    if (['verified', 'anchoring', 'anchored'].includes(j.play.status)) { toast('✓ Fingerprint match — play verified'); location.hash = `#/screen/${id}`; }
    else toast(j.play.verifyResult.detail);
  };
}

// ---------- 3. Back-stage projection screen ----------
async function pageScreen(id) {
  let play;
  try { ({ play } = await api(`/plays/${id}`)); }
  catch (e) { return showNotFound(`play #${id}`); } // TC-12: 404 → not-found state, not stale content
  document.title = `PerPlay — now playing ${play.title}`;
  app.innerHTML = `<div class="screen">
    <div class="slip print-in">
      <p class="mono" style="font-size:12px;letter-spacing:.15em;color:rgba(35,38,43,.65)">BACK-STAGE PROJECTION · <span lang="th">${play.venue}</span> · LISTING #${play.seq}</p>
      <p class="now" lang="th">${play.title}</p>
      <p class="okline">Licensed to project ✓ — per-play rights paid ${THB(play.amountTHB)}</p>
      <div style="margin-top:20px" id="screenbadge">${badge(play.status)}</div>
    </div>
    <div class="meta" id="receipt"></div>
  </div>`;
  renderReceipt(play);
  const iv = setInterval(async () => {
    if (!location.hash.startsWith(`#/screen/${id}`)) return clearInterval(iv);
    const j = await api(`/plays/${id}`).catch(() => null);
    if (j) { renderReceipt(j.play); const b = document.getElementById('screenbadge'); if (b) b.innerHTML = badge(j.play.status); }
  }, 1500);
}

function renderReceipt(p) {
  const el = document.getElementById('receipt'); if (!el) return;
  let html = `<span lang="th">${p.artist}</span> · <span lang="th">${p.label}</span> · verify: ${p.verifyResult?.method || p.verifyMode} · requested ${t(p.timings.requested)}`;
  if (p.anchors && p.anchors.length > 1) {
    html += `<br><span class="muted">receipt on-chain (multi-chain):</span> ` +
      p.anchors.map(a => a.ok
        ? `<a class="txlink" target="_blank" href="${a.explorerUrl}">${a.txHash.slice(0, 10)}…${a.txHash.slice(-8)}</a> <span class="muted">(${a.chain})</span>`
        : `<span class="muted">(${a.chain}: pending funding)</span>`
      ).join(' · ');
  } else if (p.explorerUrl) html += `<br><span class="muted">receipt on-chain:</span> <a class="txlink" target="_blank" href="${p.explorerUrl}">${p.txHash.slice(0, 10)}…${p.txHash.slice(-8)}</a> <span class="muted">(BSC Testnet)</span>`;
  else if (p.anchorError) html += `<br><span class="warn">anchor waiting for testnet wallet funding: ${p.anchorError.slice(0, 80)}… <a href="#" onclick="fetch('/api/plays/${p.id}/retry-anchor',{method:'POST'}).then(()=>0);return false">retry</a></span>`;
  if (p.e2eSeconds != null) html += `<br><span class="muted">end-to-end flow: <b class="mono" style="color:var(--ink)">${p.e2eSeconds}s</b> ${p.e2eSeconds <= 30 ? '✓ within the ≤30s hypothesis' : '⚠ over 30s'}</span>`;
  if (p.settlement) {
    const links = ['pullTx', 'labelTx', 'venueTx'].filter(k => p.settlement[k]).map(k => `<a class="txlink" target="_blank" href="${p.settlement.explorer}${p.settlement[k]}">${p.settlement[k].slice(0, 8)}…</a>`).join(' ');
    if (p.settlement.held) {
      html += `<br><span class="warn">⏸ conversion HELD by the settlement-risk guard — payout funds held on platform ·</span> ${links}` +
        (p.settlement.guard ? `<br><span class="muted" style="font-size:.8rem">guard: ${p.settlement.guard.claim} @ ${p.settlement.guard.probability} (HOLD above ${(p.settlement.guard.holdAbove * 100).toFixed(0)}%)</span>` : '');
    } else {
      html += `<br><span class="mono" style="color:var(--green);font-size:.9rem">settled on-chain (${p.settlement.token}): label 70 / venue 10 / platform 20 ·</span> ${links}` +
        (p.settlement.note ? `<br><span class="warn" style="font-size:.8rem">${p.settlement.note}</span>` : '');
    }
  } else if (p.settlementError) html += `<br><span class="warn">settlement not complete yet: ${p.settlementError.slice(0, 90)}</span>`;
  el.innerHTML = html;
}

// ---------- 4. Venue dashboard — split 70/10/20 ----------
async function pageDashboard() {
  document.title = 'PerPlay — venue dashboard';
  const { songs } = await api('/catalog');
  const songsById = Object.fromEntries(songs.map(s => [s.id, s]));
  const L = await api('/ledger');
  const { plays: recent } = await api('/plays/recent');
  const rows = recent;
  const partyRows = obj => Object.entries(obj).map(([k, v]) => `<tr><td lang="th">${k}</td><td class="num">${THB(v)}</td></tr>`).join('') || '<tr><td colspan="2" class="muted">no entries yet</td></tr>';
  const hypo = L.hypothesis.e2eUnder30s === true ? '✓ every play ≤30s' : L.hypothesis.e2eUnder30s === null ? '' : `⚠ some plays over 30s (max ${L.maxE2ESeconds}s)`;
  app.innerHTML = `
  <div class="page-head">
    <div>
      <h1>Venue dashboard</h1>
      <p class="sub">Tonight at the venue: the till roll, settlement meters, the venue bond, and the Cournot guard — split label 70 / venue 10 / platform 20.</p>
      <div class="venue-meta">
        <span class="chip"><i aria-hidden="true" style="width:8px;height:8px;background:#A87B2D;border:1.5px solid #23262B;border-radius:50%;flex:none"></i>Bangkok demo venue</span>
        <span class="chip">Mock THB — demo token</span>
      </div>
    </div>
    <span class="cal-tag" aria-hidden="true">cal 70/10/20</span>
  </div>

  <div class="grid-top">
    <div class="till-col">
      <div class="stamp" aria-hidden="true">${stampSVG('TILL', 'DEMO · CHAIN 97')}</div>
      <div class="till">
        <div class="till-meta"><span>till roll</span><span class="mono" id="tilldate">${new Date().toISOString().slice(0, 10)}</span></div>
        <div class="till-figs">
          <div class="till-fig"><span class="k">licensed plays</span><span class="dots" aria-hidden="true"></span><span class="v">${L.plays}</span></div>
          <div class="till-fig"><span class="k">gross settled</span><span class="dots" aria-hidden="true"></span><span class="v money">${THB(L.totalTHB)}</span></div>
          <div class="till-fig"><span class="k">avg end-to-end</span><span class="dots" aria-hidden="true"></span><span class="v">${L.avgE2ESeconds ?? '—'}s</span></div>
          <div class="till-fig"><span class="k">hypothesis ≤30s</span><span class="dots" aria-hidden="true"></span><span class="v" style="font-size:13px;color:${L.hypothesis.e2eUnder30s === false ? 'var(--signal)' : 'var(--green)'}">${hypo || '—'}</span></div>
          <div class="till-fig"><span class="k">chain</span><span class="dots" aria-hidden="true"></span><span class="v" style="font-size:14px" id="chaininfo">…</span></div>
        </div>
        <div class="till-last" style="margin-top:14px;display:grid;gap:7px">
          ${rows.slice(0, 4).map(p => `<p class="mono" style="font-size:12px;color:rgba(35,38,43,.75);display:flex;justify-content:space-between;gap:10px"><span>${t(p.timings.requested)} <span lang="th">${p.title}</span></span><span>${THB(p.amountTHB)}</span></p>`).join('') || '<p class="muted">no plays yet — order one from the catalog to start</p>'}
        </div>
        <p class="till-foot">Mock THB — demo token / no real money moves in this demo</p>
      </div>
    </div>

    <div class="band meters">
      <p class="p-head" style="color:rgba(246,244,239,.75)"><i aria-hidden="true"></i>settlement meters — cumulative, split 70/10/20</p>
      <div class="meter">
        <div class="meter-head"><b>label — 70%</b><span class="v">${THB(L.totalTHB * SPLIT.label)}</span></div>
        <div class="meter-track" role="img" aria-label="label receives 70 percent"><div class="meter-fill" style="width:70%"></div></div>
        <div class="m-scale" aria-hidden="true"><span>0</span><span>50</span><span>100%</span></div>
      </div>
      <div class="meter">
        <div class="meter-head"><b>venue — 10%</b><span class="v">${THB(L.totalTHB * SPLIT.venue)}</span></div>
        <div class="meter-track" role="img" aria-label="venue receives 10 percent"><div class="meter-fill" style="width:10%"></div></div>
      </div>
      <div class="meter">
        <div class="meter-head"><b>platform — 20%</b><span class="v">${THB(L.totalTHB * SPLIT.platform)}</span></div>
        <div class="meter-track" role="img" aria-label="platform receives 20 percent"><div class="meter-fill" style="width:20%"></div></div>
      </div>
      <p class="m-total"><b>${THB(L.totalTHB)}</b> <span>= every baht has a receipt anchored on-chain (chain 97)</span></p>
    </div>
  </div>

  <div class="band bond-band" id="bondpanel"><h2>Venue bond — VenueStake</h2><p>reading bond status…</p></div>

  <div class="grid-bottom">
    <div class="slip guard" id="guardpanel"><div><p class="p-head"><i aria-hidden="true"></i>settlement-risk guard — royalty conversion</p><h2 style="margin-top:8px">checking oracle…</h2></div><div class="guard-right"><p class="g-fig">—</p></div></div>
    <div class="slip recent">
      <p class="p-head"><i aria-hidden="true"></i>recent plays — slip lines</p>
      <h2 style="margin-top:8px;margin-bottom:6px">Just played</h2>
      <div id="recentlist">
      ${rows.map(p => `<div class="rp">
        <span class="mono" style="font-size:12px;color:rgba(35,38,43,.7)">#${p.seq}</span>
        <span class="s"><b lang="th">${p.title}</b><small><span lang="th">${(songsById[p.songId] || {}).artist || ''}</span> · <span lang="th">${p.venue}</span></small></span>
        <span class="a">${THB(p.amountTHB)}</span>
        <span>${badge(p.status)} ${p.explorerUrl ? `<a class="txlink" target="_blank" href="${p.explorerUrl}" style="margin-left:8px">tx ↗</a>` : ''}</span>
      </div>`).join('') || '<p class="muted" style="margin-top:8px">no plays yet — order a song to start the night</p>'}
      </div>
    </div>
  </div>`;
  api('/health').then(h => {
    const el = document.getElementById('chaininfo'); if (!el) return;
    el.innerHTML = h.chain.funded ? `<span style="color:var(--green)">✓ BSC Testnet</span> <span style="font-weight:400;font-size:11px">block ${h.chain.blockNumber}</span>` : h.chain.error ? '<span style="color:var(--signal)">⚠ RPC error</span>' : h.chain.configured ? `⚠ wallet ${h.chain.address.slice(0, 8)}… unfunded` : 'wallet not configured';
  });
  // venue bond status: gate state from /api/health + VenueStake gate
  api('/health').then(h => {
    const el = document.getElementById('bondpanel'); if (!el) return;
    const g = h.venueGate || {};
    el.innerHTML = `<div>
      <h2>Venue bond — VenueStake <span class="tag-demo" style="margin-left:8px">slash authority: admin (demo)</span></h2>
      <p>A venue must stake a bond before it can sell plays; proven fake plays are slashed to the protocol treasury. Demo slashing is executed by the admin key; production moves to dispute review + multisig.</p>
      <p>membership gate: <b style="color:${g.member === false ? '#E8A64A' : '#7BC896'}">${g.gated === false ? 'disabled (not configured)' : g.member ? '✓ bonded — venue may sell plays' : g.rpcError ? '⚠ RPC read failed — failing open this request' : '⛔ not bonded — plays refused (402)'}</b></p>
      ${g.gated === false ? '<p>set VENUE_STAKE_ADDRESS in poc/.env to enable the gate</p>' : ''}
    </div>
    <div class="bond-fig">
      <svg class="seal" viewBox="0 0 120 120" aria-hidden="true" style="position:static;transform:rotate(1.2deg)">
        <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" stroke-width="2"/><path d="M60 34v52M34 60h52" stroke="currentColor" stroke-width="3"/>
      </svg>
      <span class="big">VenueStake</span>
      <div class="row">
        <span class="ok-dark">${g.member ? '✓ bonded' : g.gated === false ? 'gate off' : 'not bonded'}</span>
        <span class="tag-demo" style="font-size:10.5px">perplay · PoC · chain 97</span>
      </div>
    </div>`;
  }).catch(() => {});
  // settlement-risk guard: live Cournot oracle probability drives the royalty-conversion decision
  api('/guard').then(g => {
    const el = document.getElementById('guardpanel'); if (!el) return;
    if (g.configured === false) {
      el.innerHTML = `<div><p class="p-head"><i aria-hidden="true"></i>settlement-risk guard — royalty conversion</p>
      <h2 style="margin-top:8px">Oracle not configured</h2>
      <p class="claim muted">The Cournot Intelligence Oracle is not configured in this deployment — the guard is <b>UNAVAILABLE</b> and every conversion falls back to the pre-agreed rule: <b>PROCEED</b>, admin-gated.</p></div>
      <div class="guard-right"><p class="g-fig">—</p><p class="g-cap">decision: UNAVAILABLE → fallback PROCEED</p></div>`;
      return;
    }
    if (g.decision === 'UNAVAILABLE') {
      el.innerHTML = `<div><p class="p-head"><i aria-hidden="true"></i>settlement-risk guard — royalty conversion <span class="muted">fallback (demo)</span></p>
      <h2 style="margin-top:8px">Oracle unavailable</h2>
      <p class="claim warn">Oracle unavailable (${(g.error || g.httpStatus || 'no response')} — free call quota on this IP may be spent). Fallback per pre-agreed rule: conversion <b>PROCEED</b>, admin-gated. Proof of last live call: <code>cournot-last-call.json</code></p></div>
      <div class="guard-right"><p class="g-fig">—</p><p class="g-cap">fallback decision: PROCEED</p></div>`;
      return;
    }
    const pctProb = g.probability != null ? `${(g.probability * 100).toFixed(2)}%` : '—';
    const basis = Array.isArray(g.basis) ? g.basis.slice(0, 3).map(b => `<li><i aria-hidden="true"></i><span>${b.source}: ${(b.summary || '').slice(0, 110)}… ${b.url ? `<a class="txlink" target="_blank" href="${b.url}">source ↗</a>` : ''}</span></li>`).join('') : '';
    const needlePos = Math.max(0.5, Math.min(99.5, g.probability != null ? g.probability * 100 : 0.5));
    const holdLeft = (g.holdAbove != null ? g.holdAbove : 0.5) * 100;
    el.innerHTML = `<div>
      <p class="p-head"><i aria-hidden="true"></i>Cournot guard — settlement risk <span class="muted">Cournot Intelligence Oracle (live · demo)</span></p>
      <h2 style="margin-top:8px">The guard checks before money moves</h2>
      <p class="claim"><b>Claim checked:</b> ${g.claim} ${g.claimScope ? `<span class="muted">(${g.claimScope})</span>` : ''}</p>
      ${basis ? `<ul class="ev">${basis}</ul>` : ''}
    </div>
    <div class="guard-right">
      <p class="g-fig">${pctProb}</p>
      <p class="g-cap">settlement-risk probability (HOLD above ${(g.holdAbove * 100).toFixed(0)}%)</p>
      <div class="decide">
        <span class="d-chip ${g.decision === 'HOLD' ? 'holdchip' : ''}">${g.decision === 'HOLD' ? '⏸ HOLD — pause royalty conversion' : '✓ PROCEED — convert settled royalties'}</span>
        <small>checked ${g.checkedAt} · quota ${g.quota ? `${g.quota.remaining}/${g.quota.total} free calls left on this IP` : '—'}</small>
      </div>
      <div class="gauge" aria-hidden="true"><div class="hold" style="left:${holdLeft}%;right:0"></div><div class="needle" style="left:${needlePos}%"></div></div>
      <div class="g-scale" aria-hidden="true"><span>0%</span><span>${(g.holdAbove * 100).toFixed(0)}% — HOLD line</span><span>100%</span></div>
      <p style="margin-top:12px"><span class="chip" style="font-size:11px">labeled (demo) · proof: cournot-last-call.json</span></p>
    </div>`;
  }).catch(() => {
    const el = document.getElementById('guardpanel');
    if (el) el.innerHTML = `<div><p class="p-head"><i aria-hidden="true"></i>settlement-risk guard — royalty conversion</p><h2 style="margin-top:8px">Oracle unreachable</h2><p class="claim muted">The guard could not be reached — decision <b>UNAVAILABLE</b>; fallback rule: conversion <b>PROCEED</b>, admin-gated.</p></div><div class="guard-right"><p class="g-fig">—</p><p class="g-cap">decision: UNAVAILABLE → fallback PROCEED</p></div>`;
  });
}

// ---------- 5. Setlist admin ----------
async function pageSetlist() {
  document.title = 'PerPlay — band setlist';
  const { songs } = await api('/catalog');
  app.innerHTML = `
  <div class="page-head">
    <div>
      <h1>Tonight's setlist — live band mode</h1>
      <p class="sub">The band registers songs in advance → when a fan orders a song on this setlist, it is verified instantly. (Live-band fingerprinting is only ~87% accurate — the spec avoids it; see POC-SPEC.)</p>
    </div>
    <span class="chip live"><i aria-hidden="true"></i>live band</span>
  </div>
  <div class="slip" style="margin-top:30px;padding:22px;transform:rotate(-.4deg)">
    <p class="p-head"><i aria-hidden="true"></i>pick songs — searchable</p>
    <input id="q" class="qbar" placeholder="Search song or artist…" aria-label="Search songs">
    <div class="sl-grid" id="list"></div>
    <div style="margin-top:18px;display:flex;gap:16px;align-items:center;flex-wrap:wrap">
      <button class="btn" id="save">Save tonight's setlist (<span id="cnt">0</span> songs)</button>
      <span id="saved" class="muted mono"></span>
    </div>
  </div>`;
  const picked = new Set();
  const render = () => {
    const q = document.getElementById('q').value.toLowerCase();
    document.getElementById('list').innerHTML = songs.filter(s => `${s.title} ${s.artist}`.toLowerCase().includes(q)).slice(0, 60).map(s => `
      <div class="sl-card ${picked.has(s.id) ? 'picked' : ''}" data-id="${s.id}" role="button" tabindex="0" aria-pressed="${picked.has(s.id)}">
        <div class="t" lang="th">${s.title}</div><div class="a" lang="th">${s.artist}</div>
        <div class="p">${picked.has(s.id) ? '✓ on tonight\u2019s setlist' : THB(s.priceTHB)}</div>
      </div>`).join('') || '<p class="muted">no matches</p>';
    document.getElementById('cnt').textContent = picked.size;
    app.querySelectorAll('#list .sl-card').forEach(c => c.onclick = () => { const id = c.dataset.id; picked.has(id) ? picked.delete(id) : picked.add(id); render(); });
  };
  document.getElementById('q').oninput = render; render();
  const { songIds } = await api('/setlist');
  songIds.forEach(i => picked.add(i)); render();
  document.getElementById('save').onclick = async () => {
    const j = await api('/setlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ songIds: [...picked] }) });
    document.getElementById('saved').textContent = `✓ saved (${j.songIds.length} songs)`;
    toast('Setlist saved — orders for songs on this list verify instantly');
  };
}

// ---------- health ----------
async function pageHealth() {
  document.title = 'PerPlay — system health';
  const h = await api('/health');
  app.innerHTML = `<h1>System</h1>
  <p class="sub">Raw health payload from /api/health — chain, wallet, fingerprints and the venue gate.</p>
  <div class="slip" style="margin-top:22px;padding:22px"><pre style="white-space:pre-wrap;font-family:var(--mono);font-size:.85rem;overflow-x:auto">${JSON.stringify(h, null, 2)}</pre></div>`;
}

let toastEl;
function toast(msg) {
  toastEl = toastEl || Object.assign(document.createElement('div'), { className: 'toast' });
  toastEl.textContent = msg; document.body.appendChild(toastEl); toastEl.style.display = 'block';
  clearTimeout(toast._t); toast._t = setTimeout(() => toastEl.style.display = 'none', 3500);
}

// chain status dot in the header
api('/health').then(h => { if (h.chain.funded) document.getElementById('chaindot').classList.add('ok'); }).catch(() => {});
if (location.hash.startsWith('#/screen/') && !lastPlay) {} // direct link OK
route();
