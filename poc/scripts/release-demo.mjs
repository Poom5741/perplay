#!/usr/bin/env node
// Instant-exit demo (decision #33 Q4/Q7, complements slash-demo.mjs):
// the venue calls release() — a good-standing venue exits with its FULL remaining
// stake immediately. This is the "my money isn't hostage" half of the trust story.
// (Production spec: exit carries a notice period; the demo release is instant.)
//
// Usage: node scripts/release-demo.mjs            (venue releases its own stake)
// Env: DEMO_VENUE_KEY (venue), VENUE_STAKE_ADDRESS, BSC_RPC_URL (from poc/.env)
// NOTE: this script spends real testnet gas from the venue key and drains the
// bond — re-stake (npm run slash-demo's companion in DEMO-SCRIPT-EN.md step 10)
// before any further gated play.
import { process } from 'node:process';
import { createPublicClient, createWalletClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

process.loadEnvFile?.();

const RPC = process.env.BSC_RPC_URL || 'https://bsc-testnet.publicnode.com';
const VS = process.env.VENUE_STAKE_ADDRESS;
const KEY = process.env.DEMO_VENUE_KEY;
if (!VS || !KEY) { console.error('Set VENUE_STAKE_ADDRESS + DEMO_VENUE_KEY (poc/.env)'); process.exit(1); }

const ABI = [
  { name: 'release', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'stakeOf', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'isMember', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'requiredStake', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
];

const pub = createPublicClient({ chain: bscTestnet, transport: http(RPC) });
const account = privateKeyToAccount(KEY.startsWith('0x') ? KEY : `0x${KEY}`);
const venue = createWalletClient({ account, chain: bscTestnet, transport: http(RPC) });
console.log(`venue: ${account.address}`);

const before = await pub.readContract({ address: VS, abi: ABI, functionName: 'stakeOf', args: [account.address] });
const required = await pub.readContract({ address: VS, abi: ABI, functionName: 'requiredStake' });
console.log(`stake before: ${before} wei (${Number(before) / 1e18} mTHB) · required: ${required} wei`);
if (before === 0n) { console.error('nothing staked — release() would revert (NothingStaked)'); process.exit(1); }

console.log('venue calls release() — full remaining stake returns instantly …');
const hash = await venue.writeContract({ address: VS, abi: ABI, functionName: 'release' });
const rc = await pub.waitForTransactionReceipt({ hash });
if (rc.status !== 'success') { console.error(`release reverted (${hash})`); process.exit(1); }

const after = await pub.readContract({ address: VS, abi: ABI, functionName: 'stakeOf', args: [account.address] });
const member = await pub.readContract({ address: VS, abi: ABI, functionName: 'isMember', args: [account.address] });
console.log(`release tx: https://testnet.bscscan.com/tx/${hash}`);
console.log(`stake after: ${after} wei · isMember: ${member}`);
console.log(member ? 'venue still a member (unexpected — investigate)' : 'venue exited membership — gate now refuses its play requests (402)');
console.log('to rejoin: stake again (DEMO-SCRIPT-EN.md step 10 re-stake)');
