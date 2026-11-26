# Design exploration — 3 candidate frontends

Three independent multi-page static designs for the PerPlay venue demo
(BNB Hack Bangkok). Each variant is 4 self-contained pages — open them
directly in a browser, or serve this directory (`python3 -m http.server`)
and use the links below. Pick ONE; it becomes `poc/public/`.

| | A — Stage light | B — Receipt modernism | C — Control room |
|---|---|---|---|
| Feel | dark venue screen, LED meters | Thai bank-slip paper, print | broadcast console, brass on plum |
| Signature device | VU-meter strip = the 70/10/20 split | oversized thermal receipt itemizing the pitch | mixing-desk fader bank |
| Type | Space Grotesk (+ Thai fallback) | IBM Plex Sans/Mono + Noto Sans Thai | Kanit (Thai-native display) |
| Palette | indigo-charcoal `#181B2C` + amber `#F2B23E` | paper `#F7F8F6` + PromptPay purple + banknote green | plum `#2A1420` + brass `#D9A441` + coral live |
| Best at | projector-legible demo hero, big numbers | trust/banking story, judges from fintech/RWA lens | most distinctive, memorable at Demo Night |

## Previews (1440×900 hero screenshots)

- `shot-a-landing.png` · `shot-b-landing.png` · `shot-c-landing.png`

## Pages (all: landing / catalog / play / dashboard)

- `variant-a/` · `variant-b/` · `variant-c/`

All three carry the honest-demo chrome required by #33: "Demo on BSC
Testnet", demo-token tags on mTHB and $PLAY, "slash authority: admin
(demo)", the Cournot guard labeled live/demo, real contract addresses,
e2e 1.5 s. Bilingual Thai/English. AA text contrast, keyboard
focus-visible, reduced-motion respected. Decorative QR blocks are
labeled non-scannable.

## Round 2 — B×C hybrids (Poom's pick: "mix of b and c, multiple layers, thoughtful color")

Three hybrids shipped after round 1, layering the print world over the
console world (L0 base → L1 faint ruling → L2 slip panels with hard
letterpress shadows → L3 overlapping objects → L4 foil accents) with
split color roles (purple = action only, brass = instruments, green =
settled, warm signal = LIVE <1%):

- `variant-d1/` — **Print desk**: paper world leads; console as printed
  instruments (`shot-d1-landing.png`)
- `variant-d2/` — **Console print**: plum console leads; receipt slip
  pinned on (`shot-d2-landing.png`)
- `variant-d3/` — **Split console**: 50/50 hemispheres, receipt tears
  across the seam (`shot-d3-landing.png`)

**Outcome: D1 selected** → ported to the live app as
`poc/public/{index.html,app.js,style.css}` (English-only UI, `lang="th"`
on data, all API routes intact, e2e 19/19). The static variant pages are
exploration snapshots and are not kept in sync with the live app.
