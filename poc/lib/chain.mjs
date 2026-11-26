// Chain anchoring — hash(play_event) → data-only tx on BNB Smart Chain Testnet
// Primary: BSC Testnet (chainId 97) · hackathon Integration target (decision D3 superseded 2026-11-26)
// VERIFIED: tx shape identical for mainnet (~<$0.01/receipt) — switch via env
import { createPublicClient, createWalletClient, http, formatEther } from 'viem';
import { bscTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const CHAINS = [
  {
    id: 'bsc-testnet',
    label: 'BSC Testnet',
    viemChain: bscTestnet,
    rpc: process.env.BSC_RPC_URL || 'https://bsc-testnet.publicnode.com',
    explorer: 'https://testnet.bscscan.com/tx/',
    primary: true,
  },
];

const clients = new Map(); // chainId -> { account, walletClient, publicClient }

export function initChain() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) return { configured: false, reason: 'PRIVATE_KEY missing — anchoring disabled (run npm run wallet)' };
  const account = privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`);
  for (const c of CHAINS) {
    clients.set(c.id, {
      account,
      walletClient: createWalletClient({ account, chain: c.viemChain, transport: http(c.rpc) }),
      publicClient: createPublicClient({ chain: c.viemChain, transport: http(c.rpc) }),
    });
  }
  return { configured: true, address: account.address, chains: CHAINS.map(c => c.label) };
}

export async function chainStatus() {
  if (!clients.size) return { configured: false };
  const results = await Promise.allSettled(
    CHAINS.map(async (c) => {
      const cl = clients.get(c.id);
      const block = await cl.publicClient.getBlockNumber();
      const bal = await cl.publicClient.getBalance({ address: cl.account.address });
      return {
        id: c.id, chain: c.label, primary: c.primary, explorer: c.explorer,
        blockNumber: Number(block), balanceETH: formatEther(bal), funded: bal > 0n, // balanceETH = native token (BNB on BSC) — legacy field name kept for app.js
      };
    })
  );
  const chains = results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { id: CHAINS[i].id, chain: CHAINS[i].label, primary: CHAINS[i].primary, explorer: CHAINS[i].explorer, error: String(r.reason?.message || r.reason) }
  );
  const primary = chains.find(c => c.primary) || chains[0];
  return {
    configured: true,
    address: clients.get(CHAINS[0].id).account.address,
    chains,
    // legacy flat fields (app.js compatibility) = primary chain
    blockNumber: primary.blockNumber,
    balanceETH: primary.balanceETH,
    funded: primary.funded,
    explorer: primary.explorer,
  };
}

/**
 * Anchor a play receipt on EVERY configured chain (parallel, best-effort each).
 * Canonical hash of the play event as tx input data, data-only tx to self.
 * Returns { txHash, explorerUrl } of the PRIMARY chain for legacy display,
 * plus `anchors`: per-chain results (ok or error — an unfunded chain degrades gracefully).
 */
export async function anchorReceipt(playEvent) {
  if (!clients.size) throw new Error('chain not configured');
  const canon = JSON.stringify({
    v: 1, playId: playEvent.id, song: playEvent.songId, title: playEvent.title,
    amountTHB: playEvent.amountTHB, splits: playEvent.splits, venue: playEvent.venue,
    verifyMode: playEvent.verifyMode, verifiedAt: playEvent.verifiedAt,
  });
  const data = `0x${Buffer.from(canon, 'utf8').toString('hex')}`;

  const anchors = await Promise.all(
    CHAINS.map(async (c) => {
      const cl = clients.get(c.id);
      // legacy tx + one retry — publicnode intermittently rejects raw sends with
      // "Missing or invalid parameters" (same treatment as settlement.mjs sends)
      const send = () => cl.walletClient.sendTransaction({
        to: cl.account.address, data, value: 0n,
        gas: 40000n, type: 'legacy', // data-only tx to self
      });
      try {
        let hash;
        try { hash = await send(); }
        catch { await new Promise(r => setTimeout(r, 3000)); hash = await send(); }
        await cl.publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
        return { chain: c.label, chainId: c.id, ok: true, txHash: hash, explorerUrl: `${c.explorer}${hash}` };
      } catch (e) {
        return { chain: c.label, chainId: c.id, ok: false, error: String(e.message || e).slice(0, 200) };
      }
    })
  );

  const primary = anchors.find(a => a.ok && a.chainId === 'bsc-testnet')
    || anchors.find(a => a.ok)
    || anchors[0];
  if (!primary.ok) throw new Error(primary.error || 'all chains failed');
  return { txHash: primary.txHash, explorerUrl: primary.explorerUrl, anchors };
}
