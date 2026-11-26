// Wallet helper — create/load BSC Testnet (chain 97) wallets from .env
// Three roles for the demo: PRIVATE_KEY (platform/deploy) · DEMO_VENUE_KEY · FAN_KEY
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { existsSync, readFileSync, appendFileSync } from 'node:fs';

const ROLES = [
  { env: 'PRIVATE_KEY', purpose: 'platform / deploy (anchors receipts, deploys contracts)' },
  { env: 'DEMO_VENUE_KEY', purpose: 'demo venue (stakes bond, receives venue share)' },
  { env: 'FAN_KEY', purpose: 'demo fan (pays for plays)' },
];

let env = existsSync('.env') ? readFileSync('.env', 'utf8') : '';

for (const { env: name, purpose } of ROLES) {
  const match = env.match(new RegExp(`${name}=(\\S+)`));
  if (match) {
    const pk = match[1];
    const acc = privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`);
    console.log(`${name} exists — ${acc.address}  (${purpose})`);
  } else {
    const pk = generatePrivateKey();
    const acc = privateKeyToAccount(pk);
    appendFileSync('.env', `${name}=${pk}\n`);
    console.log(`${name} created — ${acc.address}  (${purpose})`);
  }
}

console.log('\nFund all three addresses with testnet BNB (never real keys on testnet):');
console.log('  official faucet: https://testnet.bnbchain.org/faucet-story');
console.log('  alternative:     https://www.bnbchain.org/en/testnet-faucet');
console.log('  deploy needs ≥0.01 BNB; venue/fan need ~0.005 BNB each (gas only)');
