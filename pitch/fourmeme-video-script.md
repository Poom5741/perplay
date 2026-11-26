# Four.meme / OpenFour Prize Video — 2–3 min shot list (English)

> Prize criteria (verbatim): "valid prototype with a meaningful OpenFour integration. Build a new or meaningfully improved launch mechanism, or a differentiated launchpad. Include a GitHub repo, a 2–3 min demo video, and a short explanation of the user pain point and the project's differentiation."
> Record at 1080p, screen recordings + 2 talking-head lines max. Deadline: submit before 09:00 Nov 27 Bangkok.

## Pain point (0:00–0:25) — talking head

> "Thai venues pay a blanket music fee every year — and most of it never reaches the people who made the song. PerPlay flips it: fans pay per play, the split executes on-chain in seconds, and the venue has to post a stake it can lose for faking plays."

## The launch mechanism (0:25–1:00) — screen capture, BscScan

Shot 1 — open `launchpad/play-token.json` + BscScan token page for $PLAY `0x23c5B20c74f1bC2c731D05451f5f2DA7a2CE6AF8` ("PerPlay Protocol", 10B supply):
> "We didn't just launch a meme coin — we launched the coordination layer of a licensing protocol. The coin was created through **our own OpenFour fork**: developer-owned proxy set, bonding curve preset, Pancake-style migration — every step signed by our platform key."

Shot 2 — show the create tx `0xb3ba7e4a…` and the two curve buys (`0x7bf8941d…` platform seed, `0x70b29de0…` fan):
> "Platform seeds the curve, the fan wallet buys ~571M $PLAY through the bonding curve — real trades, not a hand-mint."

## The differentiation (1:00–1:50) — split screen: repo + app

> "Most launchpads launch coins that go nowhere. Ours is **pledged to settlement**: staked $PLAY is what seeds the venue bond pool — venues lock collateral in VenueStake before they can sell a single play."
Show, in order (15–20s each):
1. `POST /api/plays` → **402 venue stake required** (unbonded wallet) — "no bond, no business."
2. VenueStake on BscScan: stake 1,200 mTHB → `isMember` true.
3. One play paid: three on-chain transfers 70/10/20 in Mock THB + the anchored receipt tx.
4. Dashboard guard panel: live Cournot probability 0.55% → PROCEED, evidence list on screen.

## Why OpenFour (1:50–2:20) — talking head + repo

> "OpenFour gave us the launch rails without writing a launchpad: preset schemas, signed create flow, curve + migration out of the box. Our fork is developer-owned on BSC Testnet — Registry and Core addresses ship in the repo. What we built on top is the differentiated part: a launchpad where the token's job is to guarantee honest plays."

## Close (2:20–2:40)

> "One play = one on-chain license. Settlement in THB, coordination in $PLAY, liquidity from the curve, honesty from the bond. Repo and demo links below — every decision is in the commit history."

## Shot checklist

- [ ] BscScan: $PLAY token page (name/symbol/holders)
- [ ] BscScan: create tx 0xb3ba7e4a… (OpenFour Core)
- [ ] BscScan: VenueStake stake tx + isMember read
- [ ] Terminal/app: 402 unbonded → 201 bonded
- [ ] App: pay → 3 settlement txs + receipt anchor on receipt screen
- [ ] App: dashboard guard panel (live oracle call, fresh IP!)
- [ ] GitHub repo home (English README visible)
- [ ] Voice-over script above; captions for every address
