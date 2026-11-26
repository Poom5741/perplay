# ADR-0001 · BSC Testnet (chainId 97) for receipt anchoring

- **Status:** Accepted (supersedes repo decision D3 "dual-anchor: Base Sepolia + opBNB Testnet")
- **Date:** 2026-11-26
- **Context:** BNB Hack: Bangkok (Nov 25–27 2026) scores **Integration** against BNB Chain; the build must be on the host chain. The PoC previously dual-anchored receipts on Base Sepolia + opBNB Testnet (decision D3, 2026-11-25).

## Decision

Anchor every play receipt to **BSC Testnet (chainId 97) only**.

- `poc/lib/chain.mjs` `CHAINS` array keeps its multi-chain shape; today it holds one entry:
  - RPC: `https://bsc-testnet.publicnode.com` (env `BSC_RPC_URL` overrides)
  - Explorer: `https://testnet.bscscan.com/tx/`
- Base Sepolia is retired from the demoed flow; opBNB Testnet is skipped.
- Three demo wallets (platform/deploy, venue, fan) are generated into `poc/.env` by `npm run wallet` and funded from the BSC testnet faucet (`https://testnet.bnbchain.org/faucet-story`).

## Consequences

- Receipt tx shape is unchanged (value-0 data tx to self, 40,000 gas cap); measured gas: 0.1 gwei testnet / 0.05 gwei mainnet (2026-11-26) → ~0.000004 BNB per receipt on testnet, <$0.01 on mainnet (inference).
- The multi-chain array means re-adding a chain (e.g. opBNB, or mainnet BSC post-hackathon) is a one-entry change — no rewrite.
- Token/escrow work tonight (VenueStake, mTHB, $PLAY via OpenFour) deploys to the same chain 97, keeping one RPC and one funded key set for the whole demo.
- Historical records referencing Base Sepolia (QA baselines dated 2026-11-25 and earlier, decision-log D3 rationale) are left as-is — they are dated evidence, not current-state docs.
