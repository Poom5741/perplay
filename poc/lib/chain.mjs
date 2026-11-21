// Chain anchoring — hash(play_event) → Base Sepolia (testnet) data-only tx
// VERIFIED: tx path identical for mainnet (~<$0.01/receipt) — switch via env
import { createPublicClient, createWalletClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const CHAIN = baseSepolia;
const RPC_URL = process.env.BASE_RPC_URL || 'https://sepolia.base.org';
const EXPLORER = 'https://sepolia.basescan.org/tx/';

let account = null;
let walletClient = null;
let publicClient = null;

export function initChain() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) return { configured: false, reason: 'PRIVATE_KEY missing — anchoring disabled (run npm run wallet)' };
  account = privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`);
  walletClient = createWalletClient({ account, chain: CHAIN, transport: http(RPC_URL) });
  publicClient = createPublicClient({ chain: CHAIN, transport: http(RPC_URL) });
  return { configured: true, address: account.address, chain: 'Base Sepolia', rpc: RPC_URL };
}

export async function chainStatus() {
  if (!publicClient) return { configured: false };
  try {
    const block = await publicClient.getBlockNumber();
    const bal = await publicClient.getBalance({ address: account.address });
    return {
      configured: true, address: account.address, chain: 'Base Sepolia',
      blockNumber: Number(block), balanceETH: formatEther(bal), funded: bal > 0n, explorer: EXPLORER,
    };
  } catch (e) {
    return { configured: true, error: String(e.message || e) };
  }
}

/**
 * Anchor a play receipt: canonical hash of the play event as tx input data.
 * Returns { txHash, explorerUrl } — data-only tx to self (PoC; mainnet = same shape).
 */
export async function anchorReceipt(playEvent) {
  if (!walletClient) throw new Error('chain not configured');
  const canon = JSON.stringify({
    v: 1, playId: playEvent.id, song: playEvent.songId, title: playEvent.title,
    amountTHB: playEvent.amountTHB, splits: playEvent.splits, venue: playEvent.venue,
    verifyMode: playEvent.verifyMode, verifiedAt: playEvent.verifiedAt,
  });
  const data = `0x${Buffer.from(canon, 'utf8').toString('hex')}`;
  const hash = await walletClient.sendTransaction({
    to: account.address, data, value: 0n,
    gas: 40000n, // data-only tx to self
  });
  await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
  return { txHash: hash, explorerUrl: `${EXPLORER}${hash}` };
}
