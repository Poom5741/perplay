# HackQuest — "Deployment Details" paste block

**Network:** BNB Smart Chain · **Testnet** (chain id **97**)
**Explorers:** https://testnet.bscscan.com/address/<address> · https://testnet.bscscan.com/tx/<txhash>

Every address below was verified on-chain against
`https://data-seed-prebsc-1-s1.bnbchain.org:8545` — `eth_getCode` returns non-empty bytecode for
every contract, and every transaction receipt returns `status = 0x1`.

---

## Copy this into the "Contract address & deployed link" textarea

```
PerPlay Protocol — BNB Smart Chain Testnet (chain id 97)

--- PerPlay protocol contracts (BSC Testnet 97) ---
MockTHB (settlement token, 18 dec)
  0x31FE806363Bd0FCD22efa0C774D9706E9668b442
  https://testnet.bscscan.com/address/0x31FE806363Bd0FCD22efa0C774D9706E9668b442

VenueStake (venue membership bond escrow)
  0x9b7c63DF46D8B01997BAE9Bac756d803Abd4EeBc
  https://testnet.bscscan.com/address/0x9b7c63DF46D8B01997BAE9Bac756d803Abd4EeBc

--- Token launch (OpenFour BSC Testnet fork) ---
$PLAY token (PerPlay Protocol)
  0x23c5B20c74f1bC2c731D05451f5f2DA7a2CE6AF8
  https://testnet.bscscan.com/address/0x23c5B20c74f1bC2c731D05451f5f2DA7a2CE6AF8

$PLAY vault
  0xB316d57f92a6Af59405E048a817ddf8380C1edeE
  https://testnet.bscscan.com/address/0xB316d57f92a6Af59405E048a817ddf8380C1edeE

--- OpenFour framework contracts ---
Registry  0x9C7b95dB86e47d5E49b69B587b52F3cfaCd95160
Core      0xEf8D0E4A1B2a122e27179F99BB027c4158Fd1408
Tools     0x7215A350426beF5E0B00A7ff95eca68195ba1644

--- Deploy / admin accounts ---
Protocol admin & treasury  0x91754d955D7E2174200Cd2521fc3C953Cb483A03
Demo venue (staker)         0x270DF8383cf9771b5d65A101C0610f54A7e84ce8
Demo fan (payer)            0x37A35aDD13DE8F0c95E462d5772A865aff78900b

--- Deployment transactions (all status 0x1) ---
MockTHB create        0x7747fe5326dd781ee443806f8d3439cd98d03f7b8f489b5ef50ad3c2b4aee610
VenueStake create     0x838093e6628fca38b83547ae60dddf402f16c0a873ae839d120e5e1c13c49792
mTHB mint -> venue    0xe8375df6326e5792b260faf1986141862c925da581eeb196374bf131999587e9
mTHB mint -> fan      0x5b5f27abf8b2e9c0602c1a6724b16747be43f7f973425a6c8288458b368b0e4a
$PLAY token create    0xb3ba7e4ab1212389c0a1f9d45eacb7d5e07f56e65dbb8fb3e69894cdc0cc0974
$PLAY platform buy    0x7bf8941d37b62ed626b3ef07d8e41125311363bca8861c69d9963fd8b3488b59
$PLAY fan buy         0x70b29de0f05ece591070d11cdacc4a12b06e1d07703b250b7daf4d352f12e59b

--- Deployed app ---
Live demo:  https://perplay-demo.poom-a1d.workers.dev
Source:     https://github.com/Poom5741/perplay
```

---

## The short version (if the field wants only a couple of lines)

```
BNB Smart Chain Testnet (chain id 97)

MockTHB    0x31FE806363Bd0FCD22efa0C774D9706E9668b442
VenueStake 0x9b7c63DF46D8B01997BAE9Bac756d803Abd4EeBc
$PLAY      0x23c5B20c74f1bC2c731D05451f5f2DA7a2CE6AF8

Demo: https://perplay-demo.poom-a1d.workers.dev
Repo: https://github.com/Poom5741/perplay
```

---

## Verification evidence

| Item | Address / hash | On-chain check |
|---|---|---|
| MockTHB | `0x31FE806363Bd0FCD22efa0C774D9706E9668b442` | bytecode 1812 bytes; `name()` = "Mock THB", `symbol()` = "mTHB" |
| VenueStake | `0x9b7c63DF46D8B01997BAE9Bac756d803Abd4EeBc` | bytecode 1850 bytes; `token()` = MockTHB, `admin()` = platform |
| $PLAY | `0x23c5B20c74f1bC2c731D05451f5f2DA7a2CE6AF8` | bytecode 45 bytes; `name()` = "PerPlay Protocol", `symbol()` = "PLAY" |
| $PLAY vault | `0xB316d57f92a6Af59405E048a817ddf8380C1edeE` | bytecode 508 bytes |
| OpenFour Registry | `0x9C7b95dB86e47d5E49b69B587b52F3cfaCd95160` | bytecode 209 bytes |
| OpenFour Core | `0xEf8D0E4A1B2a122e27179F99BB027c4158Fd1408` | bytecode 209 bytes |
| OpenFour Tools | `0x7215A350426beF5E0B00A7ff95eca68195ba1644` | bytecode 209 bytes |

On-chain state read at the same time:
- Venue mTHB balance **8,847.5** (10,000 minted, 1,152.5 staked into VenueStake)
- Fan mTHB balance **525.0** (1,000 minted, 475 spent on plays)
- VenueStake `requiredStake` = **1,000 mTHB** (`1000000000000000000000`, 18 decimals)
- $PLAY `totalSupply` = `0x204fce5e3e25026110000000` (20,000 PLAY, 18 decimals)

Deployment block: **144929439** (all four PerPlay protocol txs, status `0x1`)
$PLAY launch blocks: **144932432** (create), **144932772** (platform buy), **144932788** (fan buy)

Source of truth in repo:
- `contracts/deployments/bscTestnet.json`
- `contracts/broadcast/Deploy.s.sol/97/run-latest.json`
- `launchpad/play-token.json`

---

## Notes / honesty flags for judges

- `MockTHB` is a **test ERC-20 used as a THB settlement token on testnet** — it is deliberately named
  "Mock" and is not a real stablecoin. Real settlement currency is the open question PerPlay is
  documenting (`docs/research/thb-stablecoin-landscape.md`).
- `VenueStake` is the venue membership bond escrow. Per the demo the venue stakes **1,200 mTHB**;
  the contract's configured `requiredStake` is **1,000 mTHB**.
- The `$PLAY` token launch used the **OpenFour BSC Testnet fork** (Registry/Core/Tools above are that
  fork's contracts, not PerPlay-authored). PerPlay's own contracts are the two at the top.
- The `Ecosystem Deployed` dropdown says "BNB Smart Chain" and the Testnet/Mainnet toggle is on
  **Testnet** — all addresses above are **testnet only**. There is no mainnet deployment.
- The deployment info on this form is marked **confidential, visible only to judges**. Everything in
  this file is on a public testnet anyway, so there is no secret to leak.
