# PerPlay demo video v2 — script + shot table (EN)

Status: **locked master (v2.1)** · 2026-11-27 · master **2:52.83** · 1920×1080 · 30 fps · English VO (Jake) · burned captions
Owner: lead agent · Approver: Poom · Deadline: upload before 09:00 Nov 27 (HackQuest/Four.meme submission)

## Why v2

The shipped v1 (`video/out/perplay-demo.mp4`, 2:01) is a **silent** slideshow of 10 screenshots — 12 s per still, zoompan + crossfade, no audio stream. It proves the product but carries no narration, music, motion, or captions.

v2 keeps the real product proof as the spine and adds:

- an English voiceover locked to real shot durations (ElevenLabs timestamps, not guesswork),
- a music bed + three sound effects,
- AI B-roll for the emotional hook and transitions (Seedance, atmosphere only — never the UI),
- brand title / section / end cards with the repo and demo URLs,
- burned captions so it works muted on a timeline or in a feed.

## v2.1 changes (owner-pain restructure)

v2.1 rewrites the first act so judges **feel the venue owner's bill before hearing the industry argument**:

- **New voice** — ElevenLabs `ev2kMR9ZJZZsemuogS5u` ("Jake – Deep, Smooth, Dramatic", professional, en-US male, narrative/documentary). Replaces the previous narrator.
- **New beats 2–3** — the owner's actual bill (16,000 THB/year MCT blanket licence) and the before/after (blanket fee pays nobody → 2,640 THB/month venue share at 40 requests/night). Both get dedicated plates: `12-owner-bill` (dark, receipt-style) and `13-owner-after` (light, Before/After cards).
- **New beat 13** — the token mechanic, shown **as a designed next step, not a live feature**: pair $PLAY with the stablecoin → stake the pair → yield paid as royalty credits → unstake & unpair. Plate `14-stake-loop` badges steps 2–4 `DESIGNED` and carries the explicit disclaimer.
- **12 beats → 14 beats**, 2:08 → **2:52** (still inside the 2–3 min criterion).

### Venue economics used in the before/after

`16,000 THB/year` is the venue's **actual** MCT blanket-licence bill (per `finetunes.app` price anchor). The per-play figure is a model: 40 requests/night × 22 nights × 30 THB = 26,400 THB gross, × 10% venue share = **2,640 THB/month**, *on top of* what the venue already earns. The blanket fee works out to 1,333 THB/month, so the venue nets **+1,307 THB/month**.

> The ~48,000 THB/month figure in `token-economy-one-pager.md` is a *different* number for a *different* purpose — it is label-side licensing revenue and the basis of the 240M THB TAM. Both are used, each in its own context. Do not merge them.

## Audience and compliance

- Judging criteria: Integration, Design & Usability, Innovation, Open Source, sustainable business.
- Hard requirements: 2–3 min · 1080p · repo link · pain point + differentiation spoken · OpenFour integration shown.
- **Honesty ledger — every claim on screen must match this:**

| Claim on screen | Status |
|---|---|
| PromptPay QR | Real EMVCo payload |
| Bank capture | **Simulated** in this demo — VO says so |
| Verdict (setlist / fingerprint) | Real setlist check; fingerprint is a PoC mock with the production provider named in docs |
| 70/10/20 split | Real MockTHB transfers on BSC Testnet 97 (demo token) |
| Receipt anchoring | Real data-tx on BSC Testnet 97 |
| Venue bond | Real VenueStake contract, 1,200 mTHB collateral (demo; $PLAY bond post-hackathon) |
| Cournot settlement guard | Live call **only if quota allows**; current IP is 0/3, so use committed evidence, never a fabricated number |
| $PLAY launch | Real OpenFour-fork launch on BSC Testnet 97 |
| 16,000 THB/year | Venue's actual MCT blanket-licence price (per `finetunes.app`) |
| 2,640 THB/month | **Model**, stated as such on-screen and in the caption |
| $PLAY pair + stake + yield | **Designed, not shipped** — badged `DESIGNED` on plate and in the VO ("the next step is designed") |

## Story arc — 14 beats

Timings are the locked shotlist (`work/shotlist.json`), not drafts.

| # | Time | Picture | VO | On-screen text |
|---|---|---|---|---|
| 1 | 0:02–0:08 | Seedance: neon Bangkok alley, band silhouettes | In Bangkok, live music plays all night. Thousands of songs. Almost none of them paid for. | — |
| 2 | 0:09–0:21 | Plate `12-owner-bill` — the owner's receipt | For the owner of a small Bangkok bar, the licensing bill is the same on a sold-out Saturday as on an empty Tuesday. Sixteen thousand baht a year, to play music they might not get to. | `16,000 THB / YEAR` · `NO LOG · NO PROOF · NO COUNT` |
| 3 | 0:21–0:39 | Plate `13-owner-after` — Before/After cards | And it buys them nothing. No log of which song played, no proof, no per-play count. Turn it around: at forty requests a night a venue keeps ten percent of every song — about two thousand six hundred baht a month, on top of what it already earns. | `16,000 THB/YEAR — FIXED` vs `2,640 THB/MONTH — AT 40 REQUESTS` |
| 4 | 0:40–0:52 | Plate `11-broll-ledger` — black-box ledger | Across the industry, venues pay one annual blanket fee, whether a song plays once or a thousand times. Labels cannot see what actually played. Artists get nothing per play. | `THE PROBLEM` · `~240M THB / month unverified` |
| 5 | 0:53–0:56 | Title plate `00-title` | PerPlay makes every play pays. | `PerPlay` · `Every play pays.` |
| 6 | 0:57–1:04 | Live capture: catalog + $PLAY perk banner | A fan at the table orders a song. No app. No account. One tap, one QR, thirty baht. | `ONE TAP · ONE QR` |
| 7 | 1:04–1:17 | Live capture: pay page → QR → confirm | That QR is a real PromptPay payload. Bank capture is simulated in this demo — everything after it is real. The play is verified against tonight's setlist, or by live audio fingerprint. | `REAL EMVCo PAYLOAD` · `CAPTURE SIMULATED` |
| 8 | 1:18–1:24 | Live capture: backstage screen, `Licensed ✓` | The backstage screen shows it before the chorus: licensed, paid, anchoring on-chain. | `LICENSED ✓ · ฿30` |
| 9 | 1:25–1:38 | Live capture: receipt, split links, anchor hash | The split isn't a spreadsheet. It's three real transactions on BNB Smart Chain Testnet — label seventy, venue ten, platform twenty. From request to on-chain proof, twenty-two seconds. | `70 / 10 / 20` · `22.4 s` · short hash |
| 10 | 1:39–1:47 | Live capture: dashboard till roll + meters | The venue watches its till fill. The rights holder watches every baht. One ledger, both sides, no black box. | `ONE LEDGER · BOTH SIDES` |
| 11 | 1:48–2:00 | Live capture: bond panel + 402 story | Trust runs both ways. A venue stakes twelve hundred mock baht before it can sell a single play. No bond, no business. Fake a play, and the stake gets slashed. | `HTTP 402` · `NO BOND, NO BUSINESS` |
| 12 | 2:00–2:07 | Live capture: setlist 409 refusal toast | Unregistered songs are refused at the door. Verification isn't a feature — it's the product. | `HTTP 409` · `ONLY TONIGHT'S SETLIST` |
| 13 | 2:07–2:30 | Plate `14-stake-loop` + $PLAY catalog capture | The protocol coin, PLAY, launched through our own OpenFour fork, where staked liquidity is pledged to settlement, not just traded. The next step is designed: pair PLAY with the stablecoin and stake the pair. The yield is paid out as royalty credits, covering the blanket fee for as long as the stake is held. Unstake and unpair when the credit is no longer needed. | `DESIGNED NEXT STEP` · `SHIPPED TODAY` (VenueStake, $PLAY) · token address |
| 14 | 2:32–2:47 | End plate `01-end` | GMM Grammy — Thailand's biggest label — asked for this system years ago. The project died with COVID. We rebuilt the proof in thirty-six hours. One play. One license. Verifiable by anyone. PerPlay. | `github.com/Poom5741/perplay` · demo URL |

Master length **2:52.83** (VO 172.88 s + 0.35 s lead-in + 0.8 s tail).

## VO script (TTS input — one block per beat)

Numbers and brand names are pre-expanded where TTS needs it. Keep the block breaks: they are the timing anchors.

```
[1] In Bangkok, live music plays all night. Thousands of songs. Almost none of them paid for.
[2] For the owner of a small Bangkok bar, the licensing bill is the same on a sold-out Saturday as on an empty Tuesday. Sixteen thousand baht a year, to play music they might not get to.
[3] And it buys them nothing. No log of which song played, no proof, no per-play count. Turn it around: at forty requests a night a venue keeps ten percent of every song — about two thousand six hundred baht a month, on top of what it already earns.
[4] Across the industry, venues pay one annual blanket fee, whether a song plays once or a thousand times. Labels cannot see what actually played. Artists get nothing per play.
[5] PerPlay makes every play pay.
[6] A fan at the table orders a song. No app. No account. One tap, one QR, thirty baht.
[7] That QR is a real PromptPay payload. Bank capture is simulated in this demo — everything after it is real. The play is verified against tonight's setlist, or by live audio fingerprint.
[8] The backstage screen shows it before the chorus: licensed, paid, anchoring on-chain.
[9] The split isn't a spreadsheet. It's three real transactions on BNB Smart Chain Testnet — label seventy, venue ten, platform twenty. From request to on-chain proof, twenty-two seconds.
[10] The venue watches its till fill. The rights holder watches every baht. One ledger, both sides, no black box.
[11] Trust runs both ways. A venue stakes twelve hundred mock baht before it can sell a single play. No bond, no business. Fake a play, and the stake gets slashed.
[12] Unregistered songs are refused at the door. Verification isn't a feature — it's the product.
[13] The protocol coin, PLAY, launched through our own OpenFour fork, where staked liquidity is pledged to settlement, not just traded. The next step is designed: pair PLAY with the stablecoin and stake the pair. The yield is paid out as royalty credits, covering the blanket fee for as long as the stake is held. Unstake and unpair when the credit is no longer needed.
[14] GMM Grammy — Thailand's biggest label — asked for this system years ago. The project died with COVID. We rebuilt the proof in thirty-six hours. One play. One license. Verifiable by anyone. PerPlay.
```

Word count ≈ 425 → 172.88 s of locked speech at the chosen rate. Beats 1, 5 and 14 carry the music-only breathing room.

### Pronunciation notes (ElevenLabs)

- `GMM Grammy` → "G-M-M Grammy" (add a pronunciation dictionary entry if it says "gmm").
- `PLAY` → "play". `PerPlay` → "Per Play". `PromptPay` → "prompt pay". `OpenFour` → "open four". `BNB` → "B-N-B".
- `mTHB` is never spoken — VO says "mock baht". `22.4` is spoken as "twenty-two seconds".
- `16,000` → "sixteen thousand baht"; `2,640` → "two thousand six hundred baht". VO states the model explicitly ("at forty requests a night").
- Voice: `ev2kMR9ZJZZsemuogS5u` — "Jake – Deep, Smooth, Dramatic", `professional` preset, labels `serious / middle_aged / male / en-US / narrative_story / documentary`. Settings: `stability 0.45`, `similarity_boost 0.75`, `style 0.08`, `speaker_boost true`, `speed 0.98`, fixed `seed`, model `eleven_v4`.

## Music and SFX (ElevenLabs)

- Bed: minimal tech underscore, ~90 BPM, no drums in the first 10 s, gentle lift at 1:10 and 2:10, tail to silence at 2:53. Ducked under VO via `sidechaincompress` (threshold 0.012, ratio 12).
- SFX: QR confirm chirp at beat 7 (+3.0 s); low "settle" whoosh at beat 9 (+0.3 s); dry thud at beat 12 (+0.4 s). Each ≤ 800 ms.

## Captions

- Burned lower-third strip, Kanit SemiBold 40 px, paper `#F6F4EF` on ink `#23262B`. Rendered as 1920×110 PNG strips (this ffmpeg build has no libass/drawtext), overlaid at `y=970`.
- One short line per beat, not a transcript; SRT identical, exported separately. Longest is b13 at 76 chars — still inside the 1920 px strip.
- Always captions, never rely on audio alone.

## Do-not-say list

- No "real payments" / "banks are live" — capture is simulated.
- No fabricated oracle probability; if the guard panel shows UNAVAILABLE, frame it as "guard panel, evidence in repo", not a number.
- No "staked PLAY seeds the bond pool" — the demo bond is mTHB; the $PLAY bond is post-hackathon.
- No invented traction or user numbers beyond the repo's published estimates (5,000+ venues, ~240M THB/month, marked as estimate).
- **Never present the $PLAY pair-and-stake mechanic as shipped.** It is designed. The VO says "the next step is designed"; the plate badges it `DESIGNED`.
- Never quote 16,000 THB/year and 2,640 THB/month as directly comparable totals — one is annual, one is monthly, and the second is a model at 40 requests/night.

