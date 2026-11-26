# THB Stablecoin Landscape — can PerPlay name a real THB-pegged settlement asset?

**Ticket:** wayfinder map #29 → #31 ("THB stablecoin landscape: real THB-pegged stable vs mock for demo")
**Date of research:** 2026-11-26 (BNB Hack Bangkok; demo locks 2026-11-27 morning, Demo Night 15:00)
**Method:** web research against primary/issuer sources (SCB 10X press release, CoinGecko issuer description) and established financial press (Ledger Insights, Bloomberg, Bangkok Post-reported BOT statements). Search-channel note: `web_search`/`scrape_webpage` tooling was broken in this session; findings were gathered via Bing News RSS + Google News RSS + direct article fetches.

---

## Question

Does a credible THB-pegged stablecoin exist today that PerPlay could name as its real settlement asset for music-licensing royalties? If none is production-ready, confirm the fallback: a mock THB token for the BNB Bangkok demo/testnet, with the real target named in the spec.

## TL;DR verdict

**No — there is no production-ready, publicly accessible THB-pegged stablecoin as of 2026-11-26. Mock confirmed.**

- Every real THB token that exists (SCB 10X **THBX**, TrueMoney **THBT**, KBank **Q-money**) is a closed-loop **BOT/SEC regulatory-sandbox pilot**, restricted to whitelisted participants (Devcon attendees, TrueMoney pilot users, KBank app customers). None offers public mint/redeem, none is on BNB Chain, and none would let a hackathon team receive even one baht of settlement.
- The regulatory track that would legalize general-purpose THB stablecoins is **still in consultation**: BOT's stablecoin principle paper (2nd public hearing closed **17 Nov 2026**; final rules expected **March 2027**; issuance initially limited to institutions, ~2 issuers), and the Thai SEC's stablecoin transaction rules are in public comment **until today, 26 Nov 2026**.
- **Nothing exists on BNB Chain** — searches surface only USD stables (USDT/USDC fee programs). No THB-pegged token on BNB mainnet or testnet.
- **Fallback for the demo:** mint a clearly-labeled **MockTHB** (ERC-20, 1:1 THB display) on **BNB Chain testnet (chain 97)**. **Spec names the post-demo target:** a BOT-licensed THB stablecoin under the framework due **March 2027** — with **THBX (SCB 10X)** and **THBT (TrueMoney)** as the existing sandbox pilots most likely to graduate, and noting both currently live on **Base**, PerPlay's incumbent chain.

## Candidate table

| # | Name | Issuer | What it is | Status (2026-11-26) | Chain | Can a hackathon team receive it? |
|---|------|--------|-----------|---------------------|-------|----------------------------------|
| 1 | **THBX** | SCB 10X (SCBX Group) + SCB, w/ Fireblocks, Elliptic, Circle, Base | Programmable THB stablecoin (Purpose-Bound Money) | Sandbox pilot Nov 5–25, 2024 (Devcon Bangkok); no public issuance since | **Base L2** | No — closed loop, KYC, ~100 Devcon merchants only |
| 2 | **THBT** | TrueMoney Co. (Ascend Money group) | THB-referenced token, 1 THBT = 1 THB, baht reserves | Live but gated under BOT Enhanced Regulatory Sandbox; ~US$37.5k market cap | **Base L2** (`0xdc20…2c5f`) | No — eligible pilot participants via TrueMoney only |
| 3 | **Q-money** | KASIKORNBANK (KBank) | Baht e-money on blockchain (bank liability, not open stablecoin) | Sandbox; Thai-traveller corridor to Singapore (XSGD settlement), formalized Apr 2026 with StraitsX + Grab | Bank ledger (private) | No — KBank Q Wallet customers only |
| 4 | **WORPT** | Wipay + Waan Exchange (under SEC TouristDigiPay sandbox) | Crypto→baht **payment app** — merchants receive baht, not a THB token | Live, rolled out Oct–Nov 2026 for foreign tourists | Ethereum (USDT/USDC in) → PromptPay fiat out | No — tourists only, 500k THB/month cap, no cash-out |
| 5 | **BOT THB stablecoin framework** | Bank of Thailand (licensed private issuers, ~2 at first) | Licensing framework, not a token yet | Consultation: 2nd hearing closed 17 Nov 2026; **rules due March 2027**; institutions-first | TBD | No — no token exists |
| 6 | **Thai SEC stablecoin transaction rules** | Thai SEC | Exchange-side transaction rules (caps, travel rule) | Draft 12 Nov 2026; comments close **26 Nov 2026 (today)** | n/a | n/a |
| 7 | **Digital Baht** (retail CBDC) + MoF bond-backed idea | Bank of Thailand / Ministry of Finance | CBDC pilot (concluded) / floated bond-backed stablecoin concept | Pilot ended, no rollout; MoF idea announced only | BOT rails / TBD | No |

## Evidence per candidate

### 1. THBX — SCB 10X's programmable THB stablecoin

- Issuer-side primary source (SCB 10X press release): Rubie Wallet ran **Nov 5–25, 2024** at Ethereum Devcon Bangkok; foreign visitors KYC'd via rubie.io converted a **regulated USD stablecoin into THBX in real time** and paid via closed-loop QR at **~100 participating merchants**; Purpose-Bound Money; "lower-fee transactions **on the Base chain**"; partners SCB, InnovestX, Fireblocks (wallet-as-a-service), Elliptic (analytics), Circle, Base; operated "under the regulatory sandbox's framework and conditions prescribed by the Bank of Thailand and the Securities and Exchange Commission." — <https://www.thaipr.net/en/finance_en/3542721>
- Ledger Insights, 14 Nov 2024: SCB 10X developed THBX with SCB; PBM smart contracts impose usage conditions; pilot restricted to Devcon attendees. — <https://www.ledgerinsights.com/siam-commercial-bank-involved-in-thai-baht-stablecoin-pilot-as-part-of-regulatory-sandbox/>
- Finextra, 15 Nov 2024: "SCB 10X unveils Thailand's first programmable stablecoin." — <https://www.finextra.com/pressarticle/103198/scb-10x-unveils-thailands-first-programmable-stablecoin>
- **Status today:** searches (Bing News RSS, Google News RSS, site search) return only Nov 2024 pilot coverage — no evidence of general-availability THBX issuance. Verdict: **sandbox pilot, ended; not accessible.**

### 2. THBT — TrueMoney's THB-referenced token

- CoinGecko issuer description: "Thai Baht TrueMoney (THBT) is a Thai baht-referenced digital value unit issued by True Money Co., Ltd. **on the Base blockchain** … issuance and redemption at 1 THBT per Thai baht, with Thai baht reserves … **tests programmable payments under the Bank of Thailand's Enhanced Regulatory Sandbox. Eligible participants can access THBT through TrueMoney** … within the pilot's conditions." Contract: Base `0xdc200537d99d8b4f0c89d59a68e29b67057d2c5f`; market cap ~**US$37,546** (26 Nov 2026). — <https://www.coingecko.com/en/coins/thai-baht-truemoney>
- Verdict: **real token, real reserves — but sandbox-gated, tiny, and not on BNB Chain.** Not accessible to PerPlay.

### 3. KBank Q-money (+ StraitsX corridor)

- Ledger Insights, 23 Apr 2026: KBank's **Q-money is "Thai Baht e-money on a blockchain"**; Thai travellers pay Singapore merchants via GrabPay QR; backend converts Q-money to **XSGD** (StraitsX, Singapore) for instant merchant settlement; trial began late 2024; formalized as KBank + StraitsX + Grab three-way partnership 2026; KBank also runs JPMorgan Kinexys B2B trials. — <https://www.ledgerinsights.com/kbank-straitsx-scale-thai-singapore-stablecoin-payments/>
- Verdict: **bank e-money on a private ledger, customer-gated.** Not an open stablecoin; no public contract; not accessible.

### 4. WORPT — TouristDigiPay crypto-to-baht rail (not a THB token)

- Thaiger, 5 Nov 2026: WORPT by **Wipay + Waan Exchange** under the **TouristDigiPay Regulatory Sandbox** (SEC); supports **USDT/USDC on Ethereum**; converts to baht at exchange rates; merchants scan **PromptPay QR** and **receive baht, not crypto**; 1.5% conversion fee + VAT. — <https://thethaiger.com/news/business/thailand-launches-worpt-crypto-payment-app-to-turn-tourist-holdings-into-local-spending>
- CoinTrust, 21 Nov 2026: TouristDigiPay announced by the Thai SEC **18 Aug 2025** (with Ministry of Finance, AMLO, Ministry of Tourism & Sports); tourists need licensed digital-asset + e-money accounts; **cash withdrawals prohibited**; **18-month pilot; 500,000 THB/month spending ceiling; 100,000 THB per transaction**; Waan Exchange founded by Chaval Jiaravanon (Chearavanont/CP family). — <https://www.cointrust.com/market-news/thailand-launches-worpt-crypto-payment-app-for-foreign-tourists>
- GlobeNewswire via StreetInsider, 25 Oct 2026: "WORPT Now Available Under Thailand's Tourist DigiPay Regulatory Sandbox." — <https://www.streetinsider.com/Globe+Newswire/WORPT+Now+Available+Under+Thailand%E2%80%99s+Tourist+DigiPay+Regulatory+Sandbox/27229597.html>
- Bloomberg, 12 Nov 2026: "Thailand Lets Tourists Turn Crypto Into Baht for Spending" (headline verified via news index; article paywalled).
- Verdict: **live and instructive — but it is a payment app, not a THB stablecoin.** Merchants receive ordinary baht; no token PerPlay could hold. Its design (users pay in crypto, merchants settle in baht) is the closest regulatory precedent to PerPlay's UX.

### 5. BOT THB stablecoin framework — the real post-demo target

- Ledger Insights, 29 Jun 2026: BOT Governor **Vitai Ratanakorn**: central bank developing **THB stablecoin rules**, hearing later in the year; **initial phases limited to institutions using stablecoins for settlement**; other use cases deferred; driven partly by FX/capital-control enforcement (Alipay/WeChat yuan-transfer account suspensions); MoF separately floated a **government-bond-backed** Thai stablecoin; multiple banks in stablecoin sandbox trials. — <https://www.ledgerinsights.com/thailand-readies-stablecoin-laws-initially-limited-to-institutions/>
- Bitcoin.com, 1 Jul 2026: framework requires **full 1:1 Thai baht reserves**; public hearing by end of 2026; announced 30 Jun 2026 at an efinanceThai conference. — <https://news.bitcoin.com/bank-of-thailand-backs-11-baht-stablecoin-while-tightening-cross-border-payment-rules/>
- Thaiger, 8 Nov 2026 (reporting BOT assistant governor Pimpan Charoenkwan, 5 Nov, and Governor Vitai in Prachachat Turakij): **rules to be issued March 2027**; second hearing on the principle paper **closed 17 Nov 2026**; coin **pegged 1:1, fully backed by assets**; issuers possibly limited to **~2 at first** (following Hong Kong/Singapore); issuers must hold **bank deposits covering 100% of coins**, allow **one-to-one redemption within one business day**, pay **no interest**, publish figures, and be able to **freeze or destroy** coins used illegally; wallets KYC-only, transfers only between KYC'd wallets, **may not serve overseas digital-asset businesses**; stated purpose: let crypto investors hold baht-denominated proceeds instead of USDT, later **payments and programmable payments**. — <https://thethaiger.com/news/business/bank-of-thailand-sets-baht-stablecoin-rules-for-2027-pauses-money-changer-licences>
- Legal 500, 11 Nov 2026: "Bank Of Thailand Proposes Licensing Framework For THB Stablecoins" (headline verified via news index).
- Verdict: **the target to name in the spec — but no token exists yet and rules land March 2027.**

### 6. Thai SEC stablecoin transaction rules

- Finance Feeds, 12 Nov 2026: draft published **12 Nov 2026**; **5M THB (~US$148k)/day** deposit and 5M THB/day withdrawal caps per customer at regulated operators; third-party wallet deposits/withdrawals prohibited; wallet-ownership verification, screening, blockchain analytics; follows a September consultation; **comments open until 26 Nov 2026 (today)**. — <https://financefeeds.com/thailand-proposes-148000-daily-stablecoin-transfer-cap/>
- Coinfomania, 12 Nov 2026: "Thai SEC Invites Comments on Draft Stablecoin Regulation." — <https://coinfomania.com/thai-sec-invites-comments-on-draft-stablecoin-regulation/>
- Verdict: regulation of *usage* is still being written — further confirmation that nothing is production-ready.

### 7. Digital Baht (retail CBDC) and the MoF bond-backed idea

- BOT's retail CBDC ("Digital Baht") pilot concluded without a public rollout — it is a CBDC, not a stablecoin, and was never accessible. (SEA-wide CBDC momentum has cooled; e.g. Forbes headline 24 Nov 2025, "Why The CBDC Fever Has Cooled In Southeast Asia" — headline verified via news index; page bot-blocked.) The MoF's floated **bond-backed THB stablecoin** remains an announced concept only — see Ledger Insights Jun 2026 above.
- Verdict: context only; irrelevant to demo settlement.

### 8. BNB Chain — absence check

- BNB Chain stablecoin news in the window covers only **USD stables** (zero-fee USDT/USDC transfer program through end-2025, payment-infrastructure partnerships) — no THB token: <https://www.msn.com/en-us/money/other/bnb-chain-extends-zero-fee-stablecoin-transfers-through-the-end-of-2025/ar-AA1RmeYe>
- CoinGecko search for "THB" returns THBT (on Base) as the only THB-referenced token of note: <https://www.coingecko.com/en/search?query=THB>
- Conclusion: **no THB-pegged token exists on BNB Chain mainnet or testnet.**

## Demo fallback recommendation

1. **Mint `MockTHB` (symbol `mTHB`) on BNB Chain testnet (chain 97)** — plain OpenZeppelin ERC-20 with a minter role owned by the demo deployer. Display 1 mTHB = 1 THB. Label it explicitly in every UI surface: **"Demo token — not real THB"**.
2. Keep the token interface boring and standard (`approve`/`transferFrom`, `decimals`, `transfer`) so the receipt + 70/10/20 split contract needs no changes when a real licensed THB stable replaces it. (Decimals: pick one and note it; most fiat stables use 6, BNB-native defaults are 18 — the spec should pin it.)
3. **Spec wording:** settlement asset for royalty payouts = *"a BOT-licensed THB stablecoin once the BOT stablecoin framework (final rules expected March 2027) admits issuers; nearest existing candidates: SCB 10X THBX and TrueMoney THBT (both currently sandbox pilots on Base). For the BNB Bangkok demo, a mock THB token (mTHB) stands in."*
4. Do **not** name WORPT as a settlement asset anywhere — it is a tourist payment app; cite it only as proof regulators already approve "pay in crypto, settle in baht" flows.

## Pitch note (how the BOT/WORPT angle lands with judges)

**Strengthens the "stable THB = settlement layer" narrative:**
- Thailand's regulators are actively building THB-on-chain rails right now — TouristDigiPay/WORPT went live Oct–Nov 2026, the BOT framework lands March 2027, and two THB sandboxes (THBX, THBT) already ran on public chains (both on Base). PerPlay's royalty story rides a rail the central bank itself is funding attention on — this is regulator-aligned, not speculative.
- PerPlay's design matches the regulator's own shape: **fans/venues never touch volatile coins; IP owners receive stable baht** — exactly the WORPT model (users pay in crypto, merchants receive baht via PromptPay). PerPlay can say "the SEC already approved this UX for tourists in Nov 2026; we apply it to music royalties."
- PerPlay's royalty payout (venue → GMM Grammy-scale IP owners) is a **B2B institutional settlement** flow — precisely the use case BOT says it will enable **first** under the new framework. That ordering is favorable: the hardest part of PerPlay's money path is the phase regulators build first.

**Weakens / must be handled honestly:**
- Nothing is permissionless: every real THB token is closed-loop and KYC-gated; the BOT model even bans THB-stable wallets from serving overseas crypto businesses, and exchange-side caps (5M THB/day) plus FX controls show capital-control conservatism. Integration will be **via licensed issuers/wallets, not open DeFi minting** — so the pitch should promise "integrate the licensed THB stable when it exists," never "we'll mint our own THB."
- Concretely for judges: **"Settlement asset: mock THB for this demo (clearly labeled); real target: BOT-licensed THB stablecoin, framework due March 2027"** is the credible line. Claiming a live THB stable would be checkably false the moment a judge looks.

## Source list

1. SCB 10X Rubie Wallet / THBX press release (issuer primary): <https://www.thaipr.net/en/finance_en/3542721>
2. Ledger Insights — SCB THBX pilot: <https://www.ledgerinsights.com/siam-commercial-bank-involved-in-thai-baht-stablecoin-pilot-as-part-of-regulatory-sandbox/>
3. Finextra — SCB 10X first programmable stablecoin: <https://www.finextra.com/pressarticle/103198/scb-10x-unveils-thailands-first-programmable-stablecoin>
4. CoinGecko — Thai Baht TrueMoney (THBT): <https://www.coingecko.com/en/coins/thai-baht-truemoney>
5. Ledger Insights — KBank/StraitsX Thai-Singapore stablecoin payments: <https://www.ledgerinsights.com/kbank-straitsx-scale-thai-singapore-stablecoin-payments/>
6. Thaiger — WORPT launch details: <https://thethaiger.com/news/business/thailand-launches-worpt-crypto-payment-app-to-turn-tourist-holdings-into-local-spending>
7. CoinTrust — WORPT / TouristDigiPay program facts: <https://www.cointrust.com/market-news/thailand-launches-worpt-crypto-payment-app-for-foreign-tourists>
8. StreetInsider/GlobeNewswire — WORPT availability: <https://www.streetinsider.com/Globe+Newswire/WORPT+Now+Available+Under+Thailand%E2%80%99s+Tourist+DigiPay+Regulatory+Sandbox/27229597.html>
9. Ledger Insights — Thailand readies stablecoin laws (institutions-first): <https://www.ledgerinsights.com/thailand-readies-stablecoin-laws-initially-limited-to-institutions/>
10. Bitcoin.com — BOT backs 1:1 baht stablecoin: <https://news.bitcoin.com/bank-of-thailand-backs-11-baht-stablecoin-while-tightening-cross-border-payment-rules/>
11. Thaiger — BOT rules for 2027, hearing closed 17 Nov 2026: <https://thethaiger.com/news/business/bank-of-thailand-sets-baht-stablecoin-rules-for-2027-pauses-money-changer-licences>
12. Finance Feeds — Thai SEC draft rules, comments until 26 Nov 2026: <https://financefeeds.com/thailand-proposes-148000-daily-stablecoin-transfer-cap/>
13. Coinfomania — Thai SEC invites comments: <https://coinfomania.com/thai-sec-invites-comments-on-draft-stablecoin-regulation/>
14. MSN/Bing — BNB Chain USD-stablecoin fee program (no THB token): <https://www.msn.com/en-us/money/other/bnb-chain-extends-zero-fee-stablecoin-transfers-through-the-end-of-2025/ar-AA1RmeYe>
15. CoinGecko search — THB tokens inventory: <https://www.coingecko.com/en/search?query=THB>
