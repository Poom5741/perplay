# BNB Bangkok — rules, resources, track strategy & preparation plan

Researched and verified **2026-11-27 03:19 Asia/Bangkok** against the live HackQuest event
page (SSR payload), the official Luma page, the Flap developer docs, and the PerPlay repo
itself. Every claim below marked ✅ was read from a primary source or verified by running it.

---

## 0. The clock (read this first)

| Milestone | Bangkok time | Source |
|---|---|---|
| Registration **opened** | Nov 25, 14:00 | ✅ SSR `registrationOpen: 2026-11-25T07:00:00Z` |
| Registration **closes** | **Nov 27, 09:00** | ✅ SSR `registrationClose: 2026-11-27T02:00:00Z` |
| **Submission closes** | **Nov 27, 09:00** | ✅ SSR `submissionClose: 2026-11-27T02:00:00Z` |
| Reward announcement | Nov 27, 19:00 | ✅ SSR `rewardTime: 2026-11-27T12:00:00Z` |
| Luma event window | Nov 25 12:00 → Nov 27 20:00 | ✅ luma.com/n5y1y7cu |
| Venue | Park Hyatt Bangkok | ✅ both sources |

**At time of writing: 03:19. Submission closes in ~5h40m.** The HackQuest page countdown
showed `00D 05H 45M 47S` and the on-site render confirmed `00 D 05 H 43 M 51 S`.

> ⚠️ **The Luma application needs an approval email.** Luma says: *"Wait for your approval
> email before making plans to attend."* If that hasn't arrived, **email the Telegram group
> now** (`https://t.me/+MhiOLT0YUnlmNWFk`) and say you're at the venue. HackQuest approval
> and Luma approval are separate gates — you need both to present at Demo Night.

> 📌 **Separate Startup Track exists.** Luma: *"BNB Hack will also feature a Startup Track,
> where selected projects will pitch directly to a jury of ecosystem experts, with the
> potential to secure incubation through YZi Labs' EASY Residency."* Application is a
> **separate Luma form** (`https://luma.com/5topfryz`) and must be selected as the
> Startup Track ticket. It is **not** the Developer Track. PerPlay is a real revenue-model
> business, not a demo — this is the higher-value lane if the form is still open.
> **Applying to Startup Track does not submit a Developer Track entry, and vice versa.**
> You can do both.

---

## 1. Rules — what HackQuest actually requires

✅ All from the event page's "How to submit" section, verbatim in substance:

1. Sign in to HackQuest and register for BNB Bangkok. Once the organizer approves your
   registration, **confirm your participation** in HackQuest.
2. **Create or join your team's HackQuest project.** Add project description, repository,
   and demo details as required by the tracks you enter.
3. **Select at least one track.** Choose Developer Track for the main hackathon prize, plus
   any sponsor challenges. Include the evidence each selected challenge asks for.
4. **Submit your project in HackQuest before the deadline** and check for the submission
   confirmation.

### Rules that are easy to get wrong

| Rule | Consequence if ignored |
|---|---|
| **Organizer approval is required** before you can confirm participation | You're not actually in the running |
| **Team name must match** across teammates (Luma: *"use the same team name as your teammates"*) | Your teammates' entries don't aggregate |
| **Apply individually even with a team** (Luma) | — |
| Team size limit | ⚠️ **Not published anywhere.** No page states a cap. |
| Slide deck | ⚠️ **Not a stated requirement** anywhere. Implied for the AWS startup pitch session only. |
| Developer Track judging weights | ⚠️ **Not published.** Only theme focus (RWA + on-chain AI agents) is stated. |
| Prizes may be cut | ✅ *"If no or few submissions meet the host's quality standards, the prize may be subject to change."* |
| AWS credits | ✅ Require **valid business registration**; **one award per company** |
| Cournot | ✅ **Fewer than three prizes** possible; mocked/hardcoded probabilities **disqualify** |
| API keys | ✅ Must not be in front-end or public repos; usage must be verifiable via logs or on-chain reads |

### Required deliverables per track (✅ verbatim)

| Track | Video | Repo | Write-up | Live demo |
|---|---|---|---|---|
| **Developer Track** | ✅ **≤ 3 min** | recommended | — | — |
| **CoinMarketCap × Atlas** | ✅ ≤ 3 min | ✅ required | ✅ **one-page write-up** | ✅ live demo at event, or video |
| **Flap** | — | ✅ "share your code" | ✅ "explain how your launch mechanism works and what makes it distinctive" | ✅ testnet launch |
| **Four.meme / OpenFour** | ✅ **2–3 min** | ✅ required | ✅ user problem, audience, differentiation | working prototype |
| **ChatAndBuild** | ✅ **3–5 min** | — | ✅ problem, solution, uniqueness | working agent |
| **Cournot** | recording as backup | ✅ required + **Cournot Integration section in README** | — | ✅ working app + live call |

**Your v2.1 master is 2:52.83** — inside the Developer Track's 3-minute cap with ~7s of
headroom. It also satisfies Four.meme's 2–3 min band. It is **too short** for ChatAndBuild
(3–5 min) — only relevant if you enter that track.

---

## 2. Developer resources — the full official list (✅ verbatim from the event page)

**Sponsor challenge documentation**
- **CoinMarketCap** · Pro API and MCP documentation for market and BNB Chain DEX data — https://coinmarketcap.com/api/documentation/
- **Atlas Oracle** · On-chain price feed integration with Solidity examples — https://docs.atlasoracle.io/
- **Flap.sh** · Build on Pool Launch for Launchers, optional Vaults, custom launch UI — https://docs.flap.sh/en/flap/v2/developers/pool-launch/build-on-pool-launch
- **Four.meme / OpenFour** · Developer Guide for custom launch mechanisms and differentiated launchpads — https://github.com/four-meme-community/openfour-docs/blob/main/docs/developer-guide.md
- **ChatAndBuild / Living Brain** · Persistent agent memory via API, SDK, MCP, or CLI — https://docs.livingbrain.com/docs/build
- **Cournot** · Intelligence Oracle Skill setup and usage — https://skill.cournot.ai/ · https://www.skills.sh/cournot-ai/cournot-skills/cournot · https://clawhub.ai/cournot-ai/skills/cournot · https://docs.cournot.ai/

**Event & builder community**
- **BNB Bangkok on Luma** — https://luma.com/n5y1y7cu
- **BNB Bangkok Telegram** — https://t.me/+MhiOLT0YUnlmNWFk

**Flap extras (from the docs page)**
- Example Launchers/Vaults — https://github.com/flap-sh/FlapPoolLaunchVaultExample
- Deployed contract addresses — https://docs.flap.sh/en/flap/v2/developers/deployed-contract-addresses
- Launcher UI template — https://github.com/flap-sh/flap-vault-component-template

**Flap Portal** — `0x000042108465206185A077Edc3F3fd2b49060000` (same address on BNB Chain
**and** BNB Chain Testnet).

**Cournot endpoint** — `POST https://interface.cournot.ai/intelligence/v1/probability`,
body `{message, market_ids: [...]}`, 30 s timeout.

---

## 3. Prize pool and how to read it (✅)

**Headline ≈ 172,000 USD.** But ~120,000 of that is **AWS credits, not cash**.

| Track | Prize | Cash? |
|---|---|---|
| Developer Track | 10,000 USD | ✅ 5k/3k/2k |
| AWS Credits | ≈120,000 USD | ❌ **AWS credits**, one award per company, needs business registration |
| Flap | 10,000 USD | ✅ 5k/3k/2k + free audit + mainnet launch support |
| ChatAndBuild | ≈10,000 USD | ❌ flights to Singapore / mentorship — **in-kind** |
| Four.meme / OpenFour | 10,000 USD | ✅ 5k/3k/2k |
| Cournot | 2,000 USD | ✅ 1,000 / 600 / 400 **USDT** |
| CoinMarketCap × Atlas | 10,000 USD | ✅ + CMC keyboards |

**Realistic cash at stake for a solo builder: Developer Track (10k) + Four.meme (10k) +
Flap (10k) + CMC×Atlas (10k) + Cournot (2k) = up to 42,000 USD, but each requires a
different integration.**

---

## 4. Track-by-track gap analysis against PerPlay

I read the actual PerPlay repo to check this. Here's what's already true.

### ✅ PerPlay ALREADY HAS

| Track | Evidence found | Status |
|---|---|---|
| **Developer Track** | Built on BSC Testnet 97, live demo at `perplay-demo.poom-a1d.workers.dev` (✅ HTTP 200), repo public (✅ HTTP 200), 2:52 video, RWA (music licensing = a real-world asset), on-chain AI agent (Cournot oracle guard) | 🟢 **Ready** |
| **Four.meme / OpenFour** | `launchpad/launch-play.js` — real **developer-owned OpenFour fork** (`fork-deployment.json`: Registry/Core/Tools + beacon proxies), standard `bondingV1` preset, WBNB bonding curve. Real launch tx `0xb3ba7e4a…` ✅ status `0x1` block 144932432, platform buy `0x7bf8941d…` ✅ status `0x1` block 144932772. Token `0x23c5B20c74f1bC2c731D05451f5f2DA7a2CE6AF8` | 🟢 **Strong** — need to confirm it matches the Hub-vs-Boost route and ship a 2–3 min demo |
| **Cournot** | `poc/lib/cournot.mjs` — real live call, 10-min cache, logs to `poc/cournot-last-call.json` as reproducible proof, probability **drives a decision** (`holdAbove=0.5` → PROCEED/HOLD), displays claim + evidence + basis. Live endpoint on the deployed Worker returns `probability: 0.0049`, `oracle: "Cournot Intelligence Oracle (live)"` ✅ | 🟡 **Code complete, proof of call + README section missing** |

### ⚠️ The one thing that blocks Cournot

Cournot's rubric is **pass/fail on three requirements**. Missing any one = not scored at all:

1. ✅ ≥1 successful live call with reproducible proof → `poc/cournot-last-call.json` exists
2. ✅ probability displayed and driving a real decision → done in code
3. ✅ exact claim + supporting evidence shown, app-added explanation identified → done in code

**But the submission also requires: *"Add a Cournot Integration section to your README."***
→ **Your README has zero mention of Cournot.** ✅ verified: `grep -i cournot README.md` → no match.
That is a ~15 minute fix and it's the difference between a scored entry and a zero.

### 🟢 Cournot quota: RESOLVED — you have calls available

Your stored proof log showed the quota exhausted (`used: 3, remaining: 0` on IP
`203.170.214.212`). **I ran a live call from this machine at 03:16 and it succeeded:**

```
HTTP 200 · probability 0.0049 · free_quota: { ip: "171.96.154.1", total: 3, used: 1, remaining: 2 }
```

The IP rotated. **You have 2 free calls left from this machine.** Don't waste them:
one for a fresh proof log, one spare for Demo Night. The Worker is already serving a live
probability, so the demo path is covered.

### 🔴 The one thing that blocks Flap

Flap's docs state Pool Launch is **beta and permissioned**: *"your Launcher Factory and
Vault Factory must pass Flap's audit and be enabled on the Portal first."* The factory
must inherit `LauncherFactoryBase`, return `"lf-v1"` from `factorySpecVersion()`, and be
**audited and enabled by the Flap team** before the Portal will accept
`newLauncher`. A standalone Vault does not qualify.

→ **PerPlay has zero Flap code** (`grep -rl -i flap` over all `.mjs`/`.js`/`.sol` → no hits).
Building an audited, Portal-enabled Launcher Factory **in 5 hours is not possible** — the
audit is a human review process with review rounds.

**Recommendation: do not enter the Flap track.** If you want it, email Flap on Telegram
*tonight* and ask whether they can enable a factory for a live demo — but don't bet the
submission on it.

### ⚠️ CoinMarketCap × Atlas — the best remaining opportunity

This is the one sponsor track where PerPlay has a natural, non-forced fit — and its rubric
is the **most detailed of all tracks**:

> Depth of data integration (25) · real-world potential (25) · BNB Chain and RWA focus (20)
> · technical quality and safety (15) · originality (10) · demo and presentation (5)

Requirements:
- ≥1 live **Pro API** call to CoinMarketCap (directly or via MCP) **or** read an Atlas
  on-chain feed / call the Atlas API. **Using both is rewarded.**
- Deploy on BNB Chain **or use BNB Chain data** (testnet qualifies, mainnet is a bonus)
- Demonstrate working data calls, open-source repo, judges get code access
- Submit: repo + README with setup, ≤3 min video, **one-page write-up** (problem & audience
  · endpoints/feeds used & why · BNB Chain contract addresses/data used · what you'd build next)
  · team names + contact

**The natural PerPlay integration:** $PLAY is a real token on BSC Testnet
(`0x23c5B20c…`). A CMC Pro call gives live market data on it; Atlas gives an on-chain price
feed for the same token. Use both to drive a **venue risk panel** — "PLAY price vs. what the
venue's royalty obligations are worth" — and show that the number changes something real
(a settlement hold, a bond top-up prompt). That maps to "real-world potential" and
"BNB Chain and RWA focus" without inventing a new product.

PerPlay currently has **no CMC or Atlas code** — `grep` found no live integration (only
mentions in research notes). This is buildable in the time available *if* you have a CMC Pro
API key. **Check your environment for a CMC key right now** — without one, this track is out.

### ❌ ChatAndBuild — skip

Requires Living Brain as a persistent memory layer (API/SDK/MCP/CLI), a **3–5 min** demo,
and prizes are in-kind (flights to Singapore, mentorship). Building a Living Brain
integration from zero in 5 hours is not realistic, and the reward isn't cash.

### Startup Track (separate, Luma) — consider if still open

PerPlay has a real revenue model, real unit economics (15,000+ venues, 96% per-play
margin), and a token. That's exactly what an ecosystem jury wants to hear, and the
incubation upside (YZi Labs EASY Residency) is worth more than a $10k sponsor prize.
**Apply via `https://luma.com/5topfryz` with the Startup Track ticket selected.**

---

## 5. Recommended track strategy

**Enter: Developer Track + Four.meme/OpenFour + Cournot.** Add **CoinMarketCap × Atlas**
only if a Pro key is already in hand.

Reasoning:
- **Developer Track** is the headline prize and the only one your existing 2:52 master
  already satisfies, end to end. Lowest risk, highest certainty.
- **Four.meme/OpenFour** is the strongest *substantive* fit — you have a real fork, a real
  bonding-curve launch, real buys, real tx hashes. The rubric asks for "a working
  prototype, a GitHub repository, a 2–3 minute demo, and a short description of the user
  problem, the intended audience, and what makes the project different." You have ~90% of
  that already.
- **Cournot** is pass/fail, and you're one README section + one fresh proof log away from
  being scored. Highest value-per-minute of anything on the list.
- **Flap** — blocked by a human audit. **ChatAndBuild** — wrong shape, in-kind prize.
- **CMC×Atlas** — worth it only with an API key in hand.

**The general principle:** sponsor tracks are *additive*, not exclusive. You select
Developer Track *plus* any sponsor challenges. One repo, one demo, several entries — but
each entry must carry the evidence that track asks for, or you score zero on it while
burning the same hours.

---

## 6. Plan — tonight's 5h40m (the "7-day plan", compressed)

A literal 7-day plan is impossible: the event ends in 40 hours and submission closes in
5h40m. Here's the honest version — a triage plan for the remaining window, followed by
the reusable 7-day playbook for the next cycle.

### Tonight, before 09:00 (the binding constraint)

| When | Block | Action | Done when |
|---|---|---|---|
| **Now (15 min)** | Blocker | **Sign in to HackQuest** (Google/GitHub/MetaMask/OCID). Register. If organizer approval hasn't come, email the Telegram group now. | You see a "Start Register" → project-creation flow |
| **+15 min (20 min)** | Blocker | **Upload the master** to YouTube (unlisted) or Drive. Paste the link into the upload metadata doc. **Upload the .srt as the caption track too.** | A public URL resolves |
| **+35 min (45 min)** | **Cournot** | Add a **Cournot Integration section to README.md**: where it calls, how the probability is used, where users see claim + evidence, proof of successful call. Then make one live call and commit the fresh `poc/cournot-last-call.json`. | README section exists; proof log shows `remaining ≥ 1` |
| **+80 min (30 min)** | **OpenFour** | Write the Four.meme submission text: user problem, audience, differentiation. Decide **Hub vs Boost** — you have a *differentiated launchpad fork* → **Boost**. Confirm the 2–3 min demo is your existing master. | Text ready to paste |
| **+110 min (30 min)** | **Repo hygiene** | Commit the master + SRT to the repo. Add a `docs/` demo-video reference. Make sure the README carries: repo URL, live demo URL, **Cournot section**, and the one-page-write-up content for CMC×Atlas (problem & audience · endpoints used & why · BNB contract addresses · what next). | `git push` clean |
| **+140 min (45 min)** | **Submission** | Create the HackQuest project. Select **Developer Track + Four.meme + Cournot**. Paste description, repo, demo link, per-track evidence. **Submit and confirm the confirmation screen.** | ✅ Confirmation visible |
| **+185 min (25 min)** | Buffer | Verify the submitted page renders correctly; fix any missing field. | — |
| **+210 min (3:30)** | Pitch prep | Write a 60-second live pitch + the 5 likely judge questions with answers (use the SUBMISSION-PACKAGE judge-QA map). | — |
| **+235 min (4:00)** | Contingency | **Startup Track application** (`luma.com/5topfryz`) if still open. | — |
| **+255 min (4:15)** | Slack | Demo Night 15:00 — pack: laptop, charger, hotspot, HDMI adapter, and the **hotspot for a fresh-IP Cournot call**. | — |

**Two things to do in parallel right now (they're independent of each other):**
1. Ask Poom for a **CoinMarketCap Pro API key** — if one exists, CMC×Atlas becomes
   viable and is worth 10,000 USD.
2. Ask Poom whether the **Luma approval email** arrived, and whether the **Startup Track**
   form is still open.

### If you also want the 9:16 cut and a cleaner final beat

Only if the submission is already confirmed. The 2:52 master is compliant — don't
touch it before you've submitted.

### Demo Night checklist (Nov 27, 15:00)

- [ ] Laptop charged + charger, **phone hotspot with a fresh IP** (Cournot quota is per-IP; your current IP has 2 calls left, a new IP gets 3 more)
- [ ] Demo URL bookmarked: `perplay-demo.poom-a1d.workers.dev`
- [ ] `/api/guard` open in a tab — refresh to show a live probability and a real decision
- [ ] bscscan receipt `0x931eb75c0d255ba6119b507e584062aa9e8f323598fdd32cdb4bf5a341fdfe15` in a tab (block 144974404, status 0x1, 29,560 gas)
- [ ] OpenFour txs ready: create `0xb3ba7e4a…` (block 144932432), platform buy `0x7bf8941d…` (block 144932772)
- [ ] One-page write-up printed (CMC×Atlas requirement, useful for all judges)
- [ ] Telegram group open for last-minute announcements

### The reusable 7-day playbook (next cycle)

This is the version that generalises — for BNB Bangkok the earlier days already happened
in the 36-hour build.

| Day | Focus | Concrete output |
|---|---|---|
| **D1** | **Read the briefs, pick tracks.** Download every sponsor brief. Score each track against what you can actually build in the time. Decide the *one* primary + at most two sponsor tracks. | A 1-page track decision matrix: prize cash vs. build cost vs. requirement fit |
| **D2** | **Get the credentials and keys.** CMC Pro, AWS Activate (business reg!), Atlas, Cournot API key, sponsor Telegram groups. **Do this before writing code** — a missing key on D6 is fatal. | Every key in `.env`, tested with one live call |
| **D3** | **Contract layer.** Deploy to testnet. Confirm the sponsor's *specific* required call works — not "works in theory", a real tx hash. | Real tx hashes for the sponsor's required flow |
| **D4** | **Product layer + UI.** Build the differentiating feature. For a launchpad track, a custom UI; for an oracle track, the probability visibly driving a decision. | Working app on a public URL |
| **D5** | **Evidence pass.** Build the README sections each track demands *before* you forget them — especially the ones like Cournot's "Cournot Integration section" that are pass/fail. Produce the one-page write-up. | README + write-up, per track |
| **D6** | **Video.** Budget 4h for a ≤3 min demo with burned captions. Record against a shotlist; re-record only the VO if the pacing is off. | Master ≤3 min + .srt |
| **D7** | **Submit early.** Real deadlines are brutal — aim to submit **24h before** the close. Then use the last day to fix the submission page and rehearse the pitch. | ✅ Confirmation screenshot |

**Two lessons from tonight worth carrying forward:**
1. **Sponsor briefs are pass/fail more often than they're weighted.** A missing README
   section zeroes the whole track. Read the "What to submit" section of *every* track you
   enter, and tick it off item by item.
2. **Per-IP quotas are the hidden deadline.** Cournot's free tier is 3 calls per IP. The
   code was finished and correct; the *quota* was what nearly disqualified it.

---

## 7. Honest assessment

**Strong.** You have a real repo, a real live demo, real on-chain transactions with real
gas, a genuine developer-owned OpenFour fork, a working live-oracle integration, and a
compliant 2:52 video that is inside the 3-minute cap. Most hackathon entries have none of
that. The Developer Track entry is essentially ready right now.

**The gaps, honestly:**
- README lacks the mandatory **Cournot Integration** section → **15 min, do it first**
- No CMC/Atlas integration → **needs a Pro API key; skip if you don't have one**
- No Flap code, and Flap requires a **human-audited, Portal-enabled factory** → **not
  achievable tonight, and not without Flap's team**
- Team size limit and Developer Track judging weights are **unpublished** → ask the
  Telegram group
- The Startup Track is a separate application you may not have submitted → **check today**

**Time check:** 5h40m is enough for all of the above except Flap and (without a key) CMC×Atlas.
The single most important thing is getting the HackQuest project **submitted and confirmed** —
everything else is upside.

---

*Sources: HackQuest event page (SSR payload + live render) · luma.com/n5y1y7cu · luma.com/5topfryz ·
docs.flap.sh/en/flap/v2/developers/pool-launch/build-on-pool-launch · live API calls to
`interface.cournot.ai` and `perplay-demo.poom-a1d.workers.dev` · BSC Testnet JSON-RPC ·
local inspection of the PerPlay repo.*
