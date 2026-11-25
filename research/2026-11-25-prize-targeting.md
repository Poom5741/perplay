# Prize Targeting Recommendation — BNB Bangkok: Build, Demo, and Pitch (Nov 25–27, 2026)

**Date:** 2026-11-25 (written during the event's opening night) · **Language:** English (team rule) · **Author:** research subagent (for lead)
**Inputs:** `research/2026-11-25-bnb-bangkok-build-and-livingbrain.md`, `POC-SPEC.md`, `pitch/PITCH-v2.md`, fresh web checks tonight.

---

## What's new since the earlier research file

1. **Sponsor challenges/prizes are STILL not published.** The official blog (checked live tonight) still says "Sponsor challenges and additional sponsor details will be announced later" ([blog](https://www.bnbchain.org/en/blog/bnb-bangkok-build-demo-and-pitch)). An independent market-intelligence piece published **today (Nov 25, 2026)** also confirms: "Sponsor challenges are still to be announced." ([BYDFi, Nov 25 2026](https://www.bydfi.com/market-intelligence/article/bnb-chain-bangkok-ai-rwa-ecosystem-binance-blockchain-week-november-2026-1/1911))
2. **Sponsors ARE named** on the event listing: **Flap.sh, Four.meme, AWS, Atlas Oracle** (community partners: CoinEasy, AKINDO) ([thailandhackathons.com](https://thailandhackathons.com/en/events/bnb-bangkok), [AllEvents listing](https://allevents.in/bangkok/bnb-bangkok/)). No per-sponsor prize amounts or challenge texts have surfaced anywhere (checked BNB blog index, DuckDuckGo, Google News RSS tonight). ⚠️ Note: the Luma page with a "$230K prize pool + sponsor track challenges" that surfaces in searches ([luma.com/ztlbthu2](https://luma.com/ztlbthu2)) is the **Nov 2024 BNB Hack Bangkok**, a different event — do not cite its prizes for 2026.
3. **Confirmed prize table (unchanged):** Dev Track 1st **$5,000** + up to $50K Kickstart support; 2nd $3,000; 3rd $2,000; winners get fast-track EASY Residency interviews + $1B Builder Fund *consideration* (not guaranteed capital). Judging: **Design and Usability, Scalability, Innovation, Open Source, Integration** + "roadmap and community engagement, clear path to a sustainable business model." ([blog](https://www.bnbchain.org/en/blog/bnb-bangkok-build-demo-and-pitch))
4. **Dev Track teams present "to sponsors" on Nov 27** ([thailandhackathons.com](https://thailandhackathons.com/en/events/bnb-bangkok)) — Integration is an explicit criterion, so a BNB-ecosystem (or sponsor-tech) integration is de facto expected even without a formal challenge.
5. Flap.sh is the most visible sponsor: "Flap is sponsoring… See you in Bangkok, Nov 25–27th" and positions itself as a hackathon-born BSC token launchpad ([x.com/flapdotsh](https://x.com/flapdotsh/status/2124401266294239399), [x.com/flapdotsh](https://x.com/flapdotsh/status/2125490409174712758)). A perplay–Flap integration is not an obvious fit (launchpad ≠ licensing), so treat sponsor-track fit as **unknown until challenges drop**.

## Chain requirement: is Base acceptable? (assumption, marked)

- **Confirmed:** No source (blog, event page, BYDFi) states submissions must deploy on BNB Chain. The blog only frames themes (AI/RWA/Trading) and judging criteria.
- **Assumption (high confidence):** judges score "Integration" within a BNB Chain hackathon, so receipts anchored only on Base will read as off-ecosystem. opBNB testnet is EVM-compatible and free to use; porting perplay's receipt-anchor contract is a config change (new RPC + chainId + faucet), not a rewrite. Budget **2–4 hours**.

---

## Q1. Can perplay win the MAIN Developer prize?

**Verdict: plausible top-3 shot, not a favorite — and the gap is closable in 36 hours.**

**Gap vs. likely competitors:**
- Most 36-hour teams will build *thin demos* of Telegram mini-apps / trading bots / AI agents (the themes). Perplay's edge: a **real product narrative with real demand** (GMM Grammy asked for this — `DECISION.md`), a working QR→payment→on-chain receipt→split flow, and an open-source repo. That maps to Innovation + Design & Usability + Open Source + sustainable-business story.
- Perplay's weaknesses against the criteria: **Integration (0 BNB-ecosystem surface today — receipts are on Base)** and **Scalability (demo only; no traction numbers)**. Teams integrating Flap/Four.meme/AWS sponsor tech will likely win the Integration axis by default.
- Main prize ($5K) competition will be heavy on AI-agent projects (BNB Agent Studio / ERC-8004 hype) — a crowded lane per BYDFi's analysis of 89K+ registered agents ([BYDFi](https://www.bydfi.com/market-intelligence/article/bnb-chain-bangkok-ai-rwa-ecosystem-binance-blockchain-week-november-2026-1/1911)). Few will have a real-world customer story. Differentiation favors perplay if the demo is crisp.

**Highest-leverage fixes in the 36-hour window (ranked):**
1. **Port receipt anchoring to BNB Smart Chain or opBNB testnet** (same EVM contract; new RPC/chainId; faucet BNB). This converts the biggest judging weakness (Integration) into a strength and makes the story "deployable on the host chain." ~2–4h. Keep Base as a "multi-chain already proven" talking point.
2. **Ship the end-to-end ≤30s demo on a phone** (POC-SPEC hypothesis 1–3: catalog → PromptPay QR → screen → tx link). Judges score Design & Usability on what they can *see*; a 5-minute non-tech demo is the whole ask. ~6–10h polish.
3. **"Two brains" AI story, degraded gracefully**: repo brain (GitHub agent automating issues/PR review) can be demoed tonight; **LivingBrain cloud brain is currently unusable — account balance $0, captures fail** (known internal state). Do **not** put LivingBrain on the critical demo path; fix only if topped up. If working, it covers the AI theme with source-cited memory of decisions. Otherwise lead the AI angle with the fingerprint-verification agent instead.

Skip in this window: Startup Track pitch prep (perplay is pre-user; Startup criteria demand "live products with users, demonstrated traction" — does not fit yet), stablecoin settlement, mobile app.

## Q2. Best single sponsor-track fit

**No sponsor challenge is confirmed or published — none can be evaluated yet** ([blog](https://www.bnbchain.org/en/blog/bnb-bangkok-build-demo-and-pitch); [BYDFi Nov 25](https://www.bydfi.com/market-intelligence/article/bnb-chain-bangkok-ai-rwa-ecosystem-binance-blockchain-week-november-2026-1/1911)). Named sponsors (Flap.sh, Four.meme, AWS, Atlas Oracle) skew launchpad/AWS-infra; **none is an obvious perplay fit on face value**. IF a challenge drops overnight, check fit immediately; meanwhile the best default is the **main Developer Track** with the opBNB/BNB integration (which also satisfies any generic "build on BNB Chain" sponsor condition). *(assumption)*

## Q3. Decision

> **Target: Developer Track main prize (top-3), backed by the opBNB/BSCTestnet receipt integration as the Integration story. Backup: if a sponsor challenge announced before Sunday 10:00 is clearly music/RWA-payments shaped, submit the same build to that track too (same artifact, two shots).**

**Exact build items for tonight (priority order):**
1. Deploy receipt-anchor contract to **BNB Smart Chain Testnet or opBNB testnet**; demo shows the BscScan/opBNBScan tx link. (kill criterion if faucet/RPC blocked >1h: stay on Base and argue multi-chain portability + commit the BNB config.)
2. Polish the 3-screen QR flow to the ≤30s loop; record a 60s backup video.
3. Repo hygiene: public repo, LICENSE file, README with architecture diagram + judging-criteria mapping (Open Source is scored).
4. Commit repo-brain agent demo (issue triage / PR review on the perplay board) — the AI-theme differentiator.
5. LivingBrain: attempt top-up; if $0 persists by Sat morning, cut it from the demo script entirely.
6. Morning of Nov 27: re-check blog + sponsor channels for overnight challenge announcements; adapt pitch if any.

---

## Facts vs. assumptions
- **Confirmed (cited):** prizes, judging criteria, dates, "sponsor challenges announced later" as of Nov 25; named sponsors Flap.sh/Four.meme/AWS/Atlas Oracle; 2024 Luma $230K pool is a different event; Builder Fund is consideration-not-capital; Dev teams present to sponsors Nov 27.
- **Assumptions:** Base-only submissions would lose Integration points (no rule says BNB required, but Integration is scored at a BNB event); opBNB port takes 2–4h (EVM compat is documented on BNB Chain's own site); LivingBrain top-up feasibility unknown (pricing unpublished per docs.livingbrain.com).

## Sources
- https://www.bnbchain.org/en/blog/bnb-bangkok-build-demo-and-pitch (official blog, re-fetched Nov 25 2026)
- https://thailandhackathons.com/en/events/bnb-bangkok (sponsors list, schedule, ticket/registration FAQ)
- https://www.bydfi.com/market-intelligence/article/bnb-chain-bangkok-ai-rwa-ecosystem-binance-blockchain-week-november-2026-1/1911 (Nov 25 2026 analysis: sponsor challenges still TBD, Builder Fund nature, agent-infra competition)
- https://luma.com/ztlbthu2 (⚠️ 2024 event — do not cite for 2026 prizes)
- https://x.com/flapdotsh/status/2124401266294239399 , https://x.com/flapdotsh/status/2125490409174712758 (Flap sponsorship)
- https://www.binance.com/en/square/post/389997565794823 (event context; registration kick-off)
- Internal: `POC-SPEC.md`, `pitch/PITCH-v2.md`, `research/2026-11-25-bnb-bangkok-build-and-livingbrain.md`
