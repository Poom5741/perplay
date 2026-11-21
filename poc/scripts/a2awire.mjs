// a2awire birth — register agent identity (testnet) so the faucet drips Base Sepolia gas
// to the PlayRight PoC wallet. Key stays local; service never holds chain keys.
import { privateKeyToAccount } from 'viem/accounts';
import { readFileSync, writeFileSync } from 'node:fs';

const env = readFileSync('.env', 'utf8');
const pk = env.match(/PRIVATE_KEY=(\S+)/)?.[1];
const account = privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`);

const domain = { name: 'A2AWire', version: '1', chainId: 84532 };
const types = { Birth: [
  { name: 'agentName', type: 'string' },
  { name: 'signer', type: 'address' },
  { name: 'network', type: 'string' },
  { name: 'nonce', type: 'string' },
  { name: 'index', type: 'uint256' },
] };

// ---- 1. self-check against golden vector (anvil key #0) ----
const goldenPriv = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const goldenAcc = privateKeyToAccount(goldenPriv);
const goldenSig = await goldenAcc.signTypedData({
  domain,
  types,
  primaryType: 'Birth',
  message: { agentName: 'golden-vector-agent', signer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', network: 'testnet', nonce: 'golden-nonce-0001', index: 0n },
});
const EXPECTED = '0x25bc2635d4e17d262646619c93ef7b180ab0ec1c07e97f3008459c020af44fa804312b8750d43c74f501fb702f977e4f7e12af1c3ee12cfe2e9eb9cdeb5c6b1d1c';
if (goldenSig !== EXPECTED) {
  console.error('GOLDEN VECTOR MISMATCH — signing format wrong. got:', goldenSig);
  process.exit(1);
}
console.log('✅ golden vector match — signing format verified');

// ---- 2. real birth ----
const nonce = `playright-${Date.now().toString(36)}`;
const sig = await account.signTypedData({
  domain, types, primaryType: 'Birth',
  message: { agentName: 'playright-poc', signer: account.address, network: 'testnet', nonce, index: 0n },
});
const idem = 'pr' + Math.random().toString(36).slice(2) + 'k' + Math.random().toString(36).slice(2);
const body = {
  agent_name: 'playright-poc',
  signer: account.address,
  network: 'testnet',
  nonce,
  index: 0,
  signature: sig,
};
const r = await fetch('https://a2awire.com/api/v1/birth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idem },
  body: JSON.stringify(body),
});
const j = await r.json();
console.log('birth status:', r.status);
if (r.status === 201) {
  writeFileSync('.a2awire-identity.json', JSON.stringify({ api_key: j.api_key, owner_key: j.owner_key, agent_id: j.agent_id, agent_name: j.agent_name }, null, 2), { mode: 0o600 });
  console.log('agent:', j.agent_id, j.agent_name);
  console.log('identity saved → .a2awire-identity.json (0600, gitignored)');
  console.log('wallets:', JSON.stringify(j.wallets));
} else {
  console.log(JSON.stringify(j).slice(0, 800));
}
