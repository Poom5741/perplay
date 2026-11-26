// Checkpoint 3 — on-chain settlement + coin-gated perk.
//
// Settlement (decision #33 Q2): the demoed payment flow settles in Mock THB (mTHB,
// demo token) ON CHAIN. On confirm-paid the platform wallet pulls the play amount
// from the fan wallet (transferFrom — fan approved once), then forwards 70% to the
// label (royalty pool) and 10% to the venue; platform keeps 20%. Opt-in via
// SETTLEMENT_ENABLED=true; the e2e suite sets E2E=1 so runs stay hermetic.
//
// NOTE: every env read is LAZY (inside functions). server.mjs calls
// process.loadEnvFile() after its imports — module-level constants would capture
// an empty env (ESM imports evaluate first). This bit once; do not re-lift.
import { createPublicClient, createWalletClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { guard } from './cournot.mjs';

const RPC = () => process.env.BSC_RPC_URL || 'https://bsc-testnet.publicnode.com';
const PERK_THRESHOLD = () => BigInt(process.env.PERK_THRESHOLD || '500000000') * 10n ** 18n; // 500M $PLAY

export function settlementEnabled() {
  return process.env.SETTLEMENT_ENABLED === 'true'
    && !process.env.E2E
    && Boolean(process.env.MTHB_ADDRESS && process.env.FAN_WALLET_ADDRESS && process.env.PRIVATE_KEY);
}

const publicClient = () => createPublicClient({ chain: bscTestnet, transport: http(RPC()) });
const ERC20 = [
  { name: 'transferFrom', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
];

let walletClient = null;
function getWalletClient() {
  if (!walletClient) {
    const pk = process.env.PRIVATE_KEY || '';
    const account = privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`);
    walletClient = createWalletClient({ account, chain: bscTestnet, transport: http(RPC()) });
  }
  return walletClient;
}

// THB is 2-decimal money; mTHB is 18 decimals — scale without floats.
const toWei = (amountTHB) => BigInt(Math.round(amountTHB * 1e6)) * 10n ** 12n;

// publicnode occasionally rejects a raw tx once ("Missing or invalid parameters",
// nonce/rate flake seen live 2026-11-26) — one retry after a short pause fixes it
const sendTx = async (fn) => {
  try { return await fn(); }
  catch (e) {
    if (!/Missing or invalid parameters/i.test(String(e.message))) throw e;
    await new Promise(r => setTimeout(r, 3000));
    return fn();
  }
};

// Pull full amount from fan → platform, then push 70% label / 10% venue (platform keeps 20%).
// The settlement-risk guard DRIVES conversion (decision #33 amendment): the fan pull is
// always safe (settlement asset stays on the platform); the payout-side conversion happens
// only when the guard says PROCEED. HOLD → funds stay held on the platform. Oracle
// UNAVAILABLE → pre-agreed fallback: conversion proceeds, admin-gated.
export async function settlePlay(amountTHB) {
  if (!settlementEnabled()) return null;
  const amt = toWei(amountTHB);
  const self = getWalletClient().account.address;
  const pullTx = await sendTx(() => getWalletClient().writeContract({ address: process.env.MTHB_ADDRESS, abi: ERC20, functionName: 'transferFrom', args: [process.env.FAN_WALLET_ADDRESS, self, amt] }));
  const pullRc = await publicClient().waitForTransactionReceipt({ hash: pullTx });
  if (pullRc.status !== 'success') throw new Error(`mTHB pull reverted (${pullTx})`);
  const base = {
    token: 'Mock THB (demo token)',
    amountTHB,
    splits: { label: '70%', venue: '10%', platform: '20%' },
    pullTx,
    explorer: 'https://testnet.bscscan.com/tx/',
  };
  // guard() caches 10 min — repeated plays do not spend free-call quota
  const g = await guard();
  const guardState = g?.configured ? { claim: g.claim, claimScope: g.claimScope, probability: g.probability, decision: g.decision, holdAbove: g.holdAbove } : null;
  if (guardState && guardState.decision === 'HOLD') {
    return { ...base, labelTx: null, venueTx: null, held: true, guard: guardState, note: 'conversion HELD by settlement-risk guard — payout funds held on platform (admin can release)' };
  }
  const labelTx = await sendTx(() => getWalletClient().writeContract({ address: process.env.MTHB_ADDRESS, abi: ERC20, functionName: 'transfer', args: [process.env.LABEL_WALLET_ADDRESS || self, amt * 70n / 100n] }));
  const venueTx = await sendTx(() => getWalletClient().writeContract({ address: process.env.MTHB_ADDRESS, abi: ERC20, functionName: 'transfer', args: [process.env.VENUE_WALLET_ADDRESS, amt * 10n / 100n] }));
  return {
    ...base,
    labelTx, venueTx,
    guard: guardState,
    ...(guardState && guardState.decision !== 'PROCEED' ? { note: 'oracle unavailable — conversion proceeded on the pre-agreed admin-gated fallback' } : {}),
  };
}

// ---- coin-gated perk: $PLAY balance ≥ threshold → priority-queue slot ----
const perkCache = { at: 0, val: null };
export async function perk() {
  const PLAY = process.env.PLAY_TOKEN_ADDRESS;
  const FAN = process.env.FAN_WALLET_ADDRESS;
  if (!PLAY || !FAN) return { configured: false };
  const now = Date.now();
  if (perkCache.at && now - perkCache.at < 60_000) return perkCache.val;
  let balance;
  try {
    balance = await publicClient().readContract({ address: PLAY, abi: ERC20, functionName: 'balanceOf', args: [FAN] });
  } catch {
    return { configured: true, eligible: null, rpcError: true };
  }
  perkCache.val = {
    configured: true,
    perk: 'priority-queue',
    eligible: balance >= PERK_THRESHOLD(),
    balance: balance.toString(),
    threshold: PERK_THRESHOLD().toString(),
    token: '$PLAY (demo token)',
  };
  perkCache.at = now;
  return perkCache.val;
}
