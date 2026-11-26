#!/usr/bin/env node
// Sacrificial-slash demo (decision #33 Q4/Q5, demo step in DEMO-SCRIPT-EN.md):
// the admin (platform key) slashes the venue's VenueStake bond for a proven fake play.
// Default slash 250 mTHB: 1200 - 250 = 950 < requiredStake 1000 → the venue drops out of
// membership and the gate refuses its next play (402) — the trust story in one command.
//
// Usage: node scripts/slash-demo.mjs [amountWei]   (default 250000000000000000000 = 250 mTHB)
// Env: PRIVATE_KEY (admin), VENUE_STAKE_ADDRESS, VENUE_WALLET_ADDRESS, BSC_RPC_URL (from poc/.env)
import { process } from 'node:process';
import { createPublicClient, createWalletClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

process.loadEnvFile?.();

const RPC = process.env.BSC_RPC_URL || 'https://bsc-testnet.publicnode.com';
const VS = process.env.VENUE_STAKE_ADDRESS;
const VENUE = process.env.VENUE_WALLET_ADDRESS;
if (!VS || !VENUE) { console.error('Set VENUE_STAKE_ADDRESS + VENUE_WALLET_ADDRESS (poc/.env)'); process.exit(1); }

const ABI = [
  { name: 'slash', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'venue', type: 'address' }, { name: 'amount', type: 'uint256' }, { name: 'reason', type: 'string' }], outputs: [] },
  { name: 'stakeOf', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'isMember', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'requiredStake', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'treasury', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
];

const pub = createPublicClient({ chain: bscTestnet, transport: http(RPC) });
const account = privateKeyToAccount(process.env.PRIVATE_KEY?.startsWith('0x') ? process.env.PRIVATE_KEY : `0x${process.env.PRIVATE_KEY}`);
const wallet = createWalletClient({ account, chain: bscTestnet, transport: http(RPC) });

const before = await pub.readContract({ address: VS, abi: ABI, functionName: 'stakeOf', args: [VENUE] });
const required = await pub.readContract({ address: VS, abi: ABI, functionName: 'requiredStake' });
const treasury = await pub.readContract({ address: VS, abi: ABI, functionName: 'treasury' });
console.log(`venue stake before: ${before} wei (${Number(before) / 1e18} mTHB) · required: ${required} wei · treasury: ${treasury}`);

const amount = BigInt(process.argv[2] || '250000000000000000000');
const reason = 'demo: fingerprint evidence class A — admin-gated slash';
console.log(`slashing ${amount} wei from ${VENUE} → ${treasury} …`);
const hash = await wallet.writeContract({ address: VS, abi: ABI, functionName: 'slash', args: [VENUE, amount, reason] });
const rc = await pub.waitForTransactionReceipt({ hash });
if (rc.status !== 'success') { console.error(`slash reverted (${hash})`); process.exit(1); }

const after = await pub.readContract({ address: VS, abi: ABI, functionName: 'stakeOf', args: [VENUE] });
const member = await pub.readContract({ address: VS, abi: ABI, functionName: 'isMember', args: [VENUE] });
console.log(`slash tx: https://testnet.bscscan.com/tx/${hash}`);
console.log(`venue stake after: ${after} wei (${Number(after) / 1e18} mTHB) · isMember: ${member}`);
console.log(member ? 'venue still a member (stake ≥ required)' : '⚠️ venue DROPPED below required stake — next play request gets 402 (gate blocks)');
