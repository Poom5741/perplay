# Sponsor fact reports — four.meme / OpenFour & Cournot

Compiled 2026-11-26, BNB Hack: Bangkok (build ends Nov 27 morning; submissions close 09:00 Bangkok / 2026-11-27T02:00:00Z). Fact-gathering by background research agents against primary sources; verified live same-day. Two verdicts up top, full reports below.

**Verdict — four.meme / OpenFour:** four.meme classic is **mainnet-only** (unusable for the BSC testnet demo). **OpenFour has an official developer-owned BSC testnet fork-deploy workflow** (`npm run fork` → own proxy set → create/trade/migrate) — this is the $PLAY launch path, no hand-mint fallback needed. Prize requires a **2–3 min demo video** (added deliverable).

**Verdict — Cournot:** The Intelligence Oracle (the prize's target) is usable **anonymously, 3 free calls**. A live probe (2026-11-26) shows it resolves **only its own crypto-market catalog** — a PerPlay play-fraud claim matched an unrelated XRP market at `matching_confidence: 0`. ⇒ "Oracle attests play fraud for slashing" is **not viable**; a **settlement-risk guard** (depeg probability drives royalty-conversion pause) is the honest integration shape.

---

# Part 1 — Cournot Oracle fact report

## 1. What Cournot is
- **Cournot (cournot.ai)** — "AI-native oracle that interprets reality and proves it"; backed by YZi Labs; on-chain proofs on **Base and BNB Chain**. https://cournot.ai/llms.txt
- Four products: **Resolution Oracle** (evidence-backed settlement for prediction markets & on-chain contracts), **Intelligence Oracle** (agent skill returning one probability + claim + sources), **Price Feeds & VRF**, **Agentic Oracle** (in development). https://cournot.ai/llms.txt
- Mechanism: Proof of Reasoning (PoR) — 3 staked stages (Collector w/ zkTLS source authenticity, Auditor w/ Merkle-ized reasoning trace, Judge w/ schema verdict); opML deterministic replay; Sentinel enforcement. Claims: $1.41B notional influenced, 29,283 resolutions, 99.82% accuracy, <8 min median resolution. https://cournot.ai/llms.txt
- Official links: docs https://docs.cournot.ai/ · resolution explorer https://pro.cournot.ai/ · Intelligence Skill https://skill.cournot.ai/ · GitHub https://github.com/Cournot-AI (repos: `contracts`, `cournot-skills`, `cournot-bnb-voter`) · Medium https://medium.com/@CournotProtocol · contact form https://tally.so/r/RGDjqK
- Docs have a GitBook MCP server at https://docs.cournot.ai/~gitbook/mcp and per-page markdown (append `.md`).

## 2. Hackathon prize requirements (official HackQuest page)
- Track: **"Cournot — Build with the Cournot Intelligence Oracle"**, $2,000 pool = 1st 1,000 USDT / 2nd 600 USDT / 3rd 400 USDT. Source: https://www.hackquest.io/hackathons/BNB-Bangkok (verified live in-page 2026-11-26)
- **Pass/fail gate — all three must pass to be scored**:
  1. ≥1 **successful live call to the official Cournot Intelligence Oracle Skill**, used in the app, with reproducible proof (sanitized execution log or request ID where available).
  2. Display the returned probability **driving a meaningful decision/action/recommendation** — "Mocked, hardcoded, or static probabilities do not qualify."
  3. Show the **exact claim + supporting evidence** Cournot returns; clearly label any app-added explanation.
- Submission: main hackathon flow; repo + README **"Cournot Integration" section** (where/how it calls Cournot, how the probability is used, where claim/evidence appear, proof of call). Demo must show a live call working; recording as backup. "A working integration is required."
- Scoring (after pass): integration depth 35, product potential 25, innovation 20, execution & UX 20. Perk: selected eligible projects get up to **3 months free Resolution + Intelligence Oracle access**. Cournot may award fewer than 3 prizes.
- Timeline: submissions close **09:00 Nov 27 Bangkok / 2026-11-27T02:00:00Z**. Event: Park Hyatt Bangkok, Nov 25–27, focus RWA + on-chain AI agents.

## 3. Integration surface (what you would actually build)
- **The prize targets the Intelligence Oracle Skill, not a Solidity oracle contract.** It is an agent skill + REST API:
  - Install: `npx cournot-skills add Cournot-AI/cournot-skills/skills/cournot`; invoke `/cournot <question>`. https://skill.cournot.ai/
  - REST base `https://interface.cournot.ai`: `POST /probability` (claim → probability + restated claim + sources w/ roles), `GET /divergence`, `POST /packs`, `POST /resolve`.
  - **Anonymous use allowed** (API key optional via `COURNOT_API_KEY`); **free tier = 3 calls per account**; beyond that paid per call via **x402** payment header with a wallet (Binance Agentic Wallet `baw` or viem local account). https://skill.cournot.ai/
  - First release "covers crypto events" (not music/play-fraud events) — a PerPlay claim like "venue X streamed track Y at time Z" is not a native crypto-event query; the skill stops and asks if it can't resolve a claim.
- **Resolution Oracle** is API-polling + on-chain proof, not request/response callbacks:
  - `GET https://interface.cournot.ai/cournot/markets/public` — no auth, but requires `slug` + a partner `source` ID **issued by Cournot**. Returns verdict, confidence (VERY_HIGH…VERY_LOW), reasoning text, and `proofs: [{chain: "base"|"bsc", tx_hash}]`. `POST .../dispute/submit` needs `x-api-key`. https://docs.cournot.ai/api-reference/partner-public-api.md
  - On-chain sink is their **`OracleProof.sol`** (UUPS): `submitProof(bytes32 eventHash, string[] names, bytes32[] hashes)` — gated by submitter whitelist or global `openSubmit` flag; `disputeProof(...)`. https://github.com/Cournot-AI/contracts/blob/main/contracts/OracleProof.sol
  - **No public Solidity consumer interface (e.g., Chainlink-style `fulfillOracleRequest`) is published for third parties.** The public `contracts` repo is the COURT token (LayerZero OFT; hardhat networks include `bsc_testnet`).
- Practical minimal integration: backend/off-chain service calls `POST /probability` (or the skill) with an evidence claim → app displays probability + claim + sources → downstream decision gated by the returned assessment/log. Direct contract-to-oracle integration does not exist publicly.

## 4. Testnet usability right now
- **Intelligence Oracle: yes, usable tonight** — anonymous, no signup for the first 3 calls/account; paid calls need an x402 wallet. https://skill.cournot.ai/
- **Resolution Oracle partner API: not self-serve** — `source` ID / API key issued by Cournot (contact form https://tally.so/r/RGDjqK).
- **BSC testnet contracts already deployed** (their own repo): AgenticCommerce `0xa206c0517b6371c6638cd9e4a42cc9f02a33b0de`, EvaluatorRouter `0xd7d36d66d2f1b608a0f943f722d27e3744f66f25`, OptimisticPolicy `0x4f4678d4439fec812ac7674bb3efb4c8f5fb78a6` (voter role requires whitelist). https://github.com/Cournot-AI/cournot-bnb-voter — these implement **ERC-8183** agentic-commerce dispute settlement (bnb-chain EIPs PR #34: https://github.com/bnb-chain/EIPs/pull/34).

## 5. Example integrations
- **Cournot-AI/cournot-bnb-voter** — their own working BSC-testnet agent: fetches job spec + deliverable from IPFS → LLM eval → Cournot PoR pipeline (Merkle bundle) → on-chain `vote_reject()`. Closest reference pattern for "evidence-backed slashing."
- **Cournot-AI/cournot-skills** — official agent skill (the prize's target integration).
- Production usage: resolution layer for prediction-market "42", live with Myriad; public case catalog 6,144 cases (Polymarket, Limitless, Myriad, PredictFun). https://cournot.ai/llms.txt · https://pro.cournot.ai/
- No third-party hackathon integration repos found yet (event ongoing; submissions close tomorrow morning).

## 6. Live probe addendum (2026-11-26, verified by PM agent)
- Root `POST https://interface.cournot.ai/probability` → **404**. Correct endpoint from skill source (`cournot-client.mjs` / `account-flow.mjs`): **`POST https://interface.cournot.ai/intelligence/v1/probability`**, body **`{message: string, market_ids: [1–10]}`** — both required; prod base `https://interface.cournot.ai`, dev `https://dev-interface.cournot.ai`; 120s client timeout.
- Live anonymous probe: HTTP 200, `code: 0`, `charged: false`, `free_quota {total: 3, used: 1, remaining: 2}` (IP 27.130.70.123). The play-fraud message was **auto-matched to market 11 "XRP price above $0.4999 at 2027-01-01 05:00 UTC"** with `matching_confidence: 0`, `probability: 0`, basis = Binance/Coinglass XRP price data. ⇒ The oracle resolves **its own crypto-market catalog only**; arbitrary real-world claims are not natively resolvable. **2 free calls remain on this IP** — budget demo/rehearsal/video calls accordingly (fresh IP/account = fresh 3; packs p5/p20/p50 = $5/600, $20/2800, $50/8000 calls).

---

# Part 2 — four.meme / OpenFour fact report

## 1. What four.meme is (on BNB Chain)
- **"The first meme fair-launch platform on BSC"** — official homepage title (https://four.meme/en). Per GitBook: now "an open launch ecosystem on BNB Chain" — started with meme fair launches, expanded to 4stock (stock-themed tokens) and whitelabel infrastructure via OpenFour (https://four-meme.gitbook.io/four.meme/).
- **Standard launch flow** (https://four-meme.gitbook.io/four.meme/guide/how-it-works.md): configure token (name, symbol, description, quote asset, logo, socials) → creator anti-sniper pre-buy in the same tx → bonding-curve trading → **graduation at 100% of curve (~$10,000 equivalent raised)**, then **20% of token supply + all raised funds paired on PancakeSwap** to seed the liquidity pool.
- Fixed preset total supply **1,000,000,000**; quote asset can be $BNB / $USDT / $USD1 / $UUSD / bStocks / meme tokens.
- Fees: launch free ("only pay ~**0.005 BNB** tx fee"); 1% platform trade fee (min 0.001 BNB) (how-it-works.md).

## 2. Programmatic integration — three official routes
**a) REST API + on-chain contract ("classic", TokenManager2)** — https://github.com/four-meme-community/fourmeme-docs/blob/main/docs/create-guide.md
- Flow: `POST /meme-api/v1/private/user/nonce/generate` → sign `You are sign in Meme {nonce}` with wallet key → `POST /v1/private/user/login/dex` (returns access_token) → `POST /v1/private/token/upload` (images must be platform-uploaded; external URLs not allowed) → `POST /v1/private/token/create` (returns `createArg` + `signature`) → on-chain `TokenManager2.createToken(createArg, signature)`.
- Base: `https://four.meme/meme-api`. Tokens created via V2 only.
- **TokenManager2 (BSC mainnet): `0x5c952063c7fc8610FFDB798152D69F0B9550762b`**; fixed: 1B supply, 24 BNB raise (curve capacity), 80% sell rate; customizable: name/symbol/description/image/links/labels (Meme/AI/Defi…)/pre-amount/anti-sniper `feePlan`/`tokenTaxInfo`.
- Note: creation requires the platform's signed backend API — the contract cannot be called permissionlessly.
**b) Agent skill/CLI** — https://four.meme/en/agentic: npm **`@four-meme/four-meme-ai`** (`pnpm add -g @four-meme/four-meme-ai@latest`); skill install `npx skills add four-meme-community/four-meme-ai`; configured via `PRIVATE_KEY` in `.env` + optional `BSC_RPC_URL`; **15 capabilities**: create token (incl. tax types), buy/sell quote & exec, token list/rank, on-chain events, tax info, EIP-8004 registry; supports Claude Code / OpenCode / OpenClaw / Kimi Claw / OpenAI. Mainnet-oriented.
**c) OpenFour contract-level integration** — see §3. Mainnet addresses (https://github.com/four-meme-community/openfour-docs/blob/main/docs/integration-guide.md): **OpenFourRegistry `0x912CEf0C3aE9Ab6eB3Ec87cab69371cFb317Ab94`**, **OpenFourCore `0xebe7b6C1089D9F72aD07f34E36d898e44E5e27f3`**, **OpenFourFeeRouter `0x7383B244B416Db16Aa9dd0AB7C296Aa60255B9A2`** (same on BSC mainnet + Robinhood Chain mainnet); Core/Tools addresses read on-chain from the Registry.

## 3. OpenFour — what it is + the prize requirements
- **About** (https://four-meme.gitbook.io/four.meme/openfour/about-openfour-en.md): Four.Meme's "modular launch engine"; opens the protocol layer to external developers to build custom launch modes on Four.Meme infrastructure (custom bonding curves, trade logic, incentives, rev-share). Developers earning trade incentives via this mode "must pass required security review and integrate successfully." **4 partner modes live**: GoPlus Creator Incentives, GoPlus Skill Royalty (token-tax supported), Likwid Dex (leveraged trading), CubePeg (PancakeSwap Infinity hook art).
- **Architecture** (developer-guide.md): `OpenFourCore` (closed-source) + **5 mandatory module slots (Token/Vault/Curve/Trade/Migrate, per-token clones)** + optional CustomData + Registry presets. Modules/presets register to the **official Registry executed by Four.Meme/governance** — third parties submit code + audit material for review via the official site; README notes sample contracts are "unaudited, demo/reference only".
- **BNB Bangkok prize track** (https://www.hackquest.io/hackathons/BNB-Bangkok): **"Four.meme / OpenFour — 10,000 USD"** — 1st $5,000 / 2nd $3,000 / 3rd $2,000. Criteria verbatim: "Submit a valid prototype with a **meaningful OpenFour integration**. Build a **new or meaningfully improved launch mechanism**, or a **differentiated launchpad**. Include a GitHub repo, a **2–3 min demo video**, and a short explanation of the user pain point and the project's differentiation."
- Track resources on page: four.meme + OpenFour developer guides (GitHub). Event: 3-day in-person hackathon at Park Hyatt Bangkok, Nov 25–27; ~$172K total prizes; themes RWA + on-chain AI agents.

## 4. Testnet situation
- **four.meme main site/docs/contracts are MAINNET-ONLY** (classic docs cite the BSC-mainnet TokenManager2 only; no four.meme testnet environment anywhere in the GitBook).
- **OpenFour HAS an official BSC testnet developer workflow** — https://github.com/four-meme-community/openfour-docs/blob/main/developer/fork-deploy/README.md: `npm run fork` **deploys a developer-OWNED OpenFour proxy set on BSC testnet** (source addresses `source/bsctestnet.json`, reuse on-chain implementations; default RPC `https://bsc-testnet.publicnode.com`). Three presets ready to create out of the box (**`bondingV1`, `bondingTaxV1`, `stock4TaxV1`**); built-in smoke script `create-test-preset.js` runs create → buy (till sold out, ~3× raiseAmount budget) → sell → **auto-migrate to the real PancakeSwap V2 testnet router**. Requirements: Node 18+, testnet BNB; scripts **refuse chain ID 56/4663**. FairLaunch custom-preset path: `developer/startup` — `register.js` → `create-and-trade.js --network bsctestnet`. Quote assets: WBNB works; Stock4 mode needs testnet BNC4 `0xB179cBFdE44a9960Dd6C88bC3D163d36C65ae7C9`.
- Per-fork `raiseAmount ≥ 0.1` test BNB is the smallest built-in preset creation parameter.

## 5. Cost/time facts
- **No KYC in any documentation** — classic create login is wallet-sign only (nonce → sign → access_token); no identity step documented anywhere (absence of evidence = none documented in GitBook/create guide).
- **Creation cost**: GitBook "launch free, ~0.005 BNB tx fee"; classic create guide documents creation fee reference **0.00 BNB** (+ any presale amount in msg.value).
- Minimal documented path: "no technical skill needed… seconds" (UI); agent CLI one-step create; API flow = 4 REST calls + 1 on-chain tx. **OpenFour testnet fork = `npm run fork` + 2 script commands** for a full create/buy/sell/migrate cycle.
- Caveat: listing a custom OpenFour module on the official Registry requires Four.Meme review/approval (submit → review → official registration) — **testnet fork registration is instant; production registration is not**.

## 6. Docs/repo index
GitBook docs (with `llms.txt`, per-page `.md`, and a docs MCP server): https://four-meme.gitbook.io/four.meme/ · Classic (TokenManager2): https://github.com/four-meme-community/fourmeme-docs (integration-guide.md, create-guide.md, trade-guide.md, tax-guide.md, `abi/TokenManager2.lite.json`) · OpenFour: https://github.com/four-meme-community/openfour-docs (developer-guide.md, integration-guide.md, `developer/startup/` FairLaunch Hardhat starter, `developer/fork-deploy/`, workbench) · Agent skill: https://github.com/four-meme-community/four-meme-ai + npm `@four-meme/four-meme-ai` · Hackathon page: https://www.hackquest.io/hackathons/BNB-Bangkok · Community (site footer): Medium https://medium.com/@four.meme · Discord https://discord.com/invite/fourmeme · Telegram https://t.me/four_meme · X https://x.com/fourdotmemezh

*Methodology note: both fact agents' web_search/web_fetch tools were broken in their environment; all facts were gathered via proxy browser directly from the URLs listed above (four.meme live site, GitBook markdown, GitHub raw files, HackQuest page, Cournot llms.txt/skill source). Bing search returned stale results; no dedicated bnbchain.org "BNB Hack Bangkok" hackathon page was found — the HackQuest page is the authoritative prize source.*
