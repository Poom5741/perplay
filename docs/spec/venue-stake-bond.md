# Venue Stake Bond — mechanics & slashing trust model

Resolved 2026-11-26 via wayfinder ticket [#32](https://github.com/Poom5741/perplay/issues/32) (map [#29](https://github.com/Poom5741/perplay/issues/29)). Context from the demo scope lock ([#33](https://github.com/Poom5741/perplay/issues/33)): BSC testnet (chain 97), mTHB settlement, $PLAY protocol coin, first-ever Solidity tonight, minimal escrow, one sacrificial slash demoed.

## Purpose

A venue posts a $PLAY stake to join the protocol. The stake is **collateral — insurance against fake plays** — and slashing is the penalty that gives the bond its teeth. The escrow contract is the demo's skin-in-the-game proof: funds are visibly locked on BscScan and move only through the contract's three exits.

## Contract shape

- **Token:** $PLAY (ERC-20, "PerPlay Protocol").
- **Contract:** `VenueStake` — one contract; `admin` is the platform EOA tonight, a multisig in production.
- **Interface sketch (the Foundry build implements this shape; events carry additive fields — `StakeAdded` adds `total`, `StakeSlashed` adds `to` and `remaining`):**

```solidity
interface IVenueStake {
    function stake(uint256 amount) external;                 // venue transfers $PLAY in; sets/raises their bond
    function slash(address venue, uint256 amount, string calldata reason) external; // admin-only
    function release() external;                             // venue-only; full remaining stake back
    function stakeOf(address venue) external view returns (uint256);
    event StakeAdded(address indexed venue, uint256 amount);
    event StakeSlashed(address indexed venue, uint256 amount, string reason);
    event StakeReleased(address indexed venue, uint256 amount);
}
```

- **Slash destination:** a **protocol treasury address** (platform-controlled). Treasury funds future exit liquidity — this closes the pitch loop that speculation → liquidity → royalties needs.
- **No LP routing:** the stake is pure collateral. The charting-era "stake seeds song-coin↔THB exit liquidity" idea is demoted to a post-hackathon design line; the contract holds, slashes, and releases — nothing else.

## Membership gate (what the stake actually gates)

The server reads `stakeOf(venue) >= required` **before issuing a play QR** — one integration point, the QR endpoint in `poc/server.mjs`. No stake → no play request. A slash that drops the balance below threshold blocks the venue at the same check.

## Slashing trust model

**Evidence taxonomy** — what can justify a slash, all funneling into a review step that issues it:

1. **Fingerprint-verify miss** logged by the app (a paid play that fails recognition).
2. **Setlist attestation mismatch** (song played was not on the venue's registered setlist).
3. **Customer report** (a fan reports a play that did not happen).

Tonight the reviewer is the **admin key** (pre-agreed fallback per the demo scope lock). Production path: review by oracle/dispute process. Note: the Cournot Intelligence Oracle is **not** the slash oracle — it guards settlement conversion risk (depeg); resolving custom non-crypto claims needs Cournot's Resolution Oracle partner access (post-hackathon).

**Demo:** one sacrificial venue is slashed, admin-gated; the `StakeSlashed` event and the treasury balance move are visible on BscScan.

**UI honesty:** the venue dashboard shows a visible **"slash authority: admin (demo)"** tag — same pattern as the mTHB "demo token" tag.

## Exit

- **Demo:** instant `release()` — a good-standing venue exits with its full remaining stake immediately.
- **Production:** a notice period (e.g. 30 days) so in-flight plays stay covered. Named here; not built tonight.

## Demo vs production

| Concern | Tonight (demo) | Production path |
|---|---|---|
| Slash authority | admin EOA | oracle/dispute review |
| Evidence | app logs (3 classes above) | same + formal review process |
| Exit | instant `release()` | notice period |
| Stake collateralizes | pure collateral | collateral; treasury seeds future exit liquidity |
| Membership check | server reads `stakeOf` before QR | same |

## Explicitly not fixed here

Stake amounts, slash cut percentages, and notice-period length are **build/demo-time tuning**, deferred by ticket [#32](https://github.com/Poom5741/perplay/issues/32)'s own rule — not decisions of this spec.
