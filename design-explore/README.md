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
